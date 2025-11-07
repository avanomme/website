/**
 * Complete Verovio Player with Tone.js and SoundFont Support
 * Renders MusicXML files with synchronized note highlighting during playback
 */

export class VerovioPlayer {
    constructor() {
        this.vrvToolkit = null;
        this.currentMusicXML = null;
        this.currentMEI = null; // Cache MEI for faster reloading
        this.timemap = [];
        this.svgPages = [];
        this.totalPages = 0;
        this.currentPage = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.duration = 0;
        this.tempo = 1.0; // 1.0 = 100%, 0.5 = 50%, 2.0 = 200%

        // MIDI and Audio
        this.midiData = null;
        this.midiEvents = [];
        this.scheduler = null;
        this.startTimeOffset = 0;
        this.pauseTimeOffset = 0;

        // Audio
        this.audioContext = null;
        this.parsedMIDI = null;
        this.scheduledNotes = [];

        // Callbacks
        this.onTimeUpdate = null;
        this.onStateChange = null;
        this.onLoaded = null;
        this.onError = null;
        this.onZoomChange = null;

        // Highlighting
        this.highlightedElements = new Set();

        // Volume control
        this.masterVolume = 1.0;
        this.trackVolumes = {}; // Track-specific volume (0.0 to 1.0)
        this.mutedTracks = new Set(); // Set of muted track IDs
    }

    async init() {
        console.log('[VerovioPlayer] Initializing...');

        try {
            // Initialize Verovio
            if (typeof verovio === 'undefined') {
                throw new Error('Verovio not loaded. Make sure verovio-toolkit-wasm.js is included.');
            }

            this.vrvToolkit = new verovio.toolkit();
            console.log('[VerovioPlayer] Verovio toolkit created');

            // Set Verovio rendering options matching working sample
            this.scale = 45; // Default scale for optimal rendering
            this.vrvToolkit.setOptions({
                pageWidth: 2100,
                pageHeight: 2970,
                scale: this.scale,
                adjustPageHeight: true,
                spacingStaff: 20
            });

            console.log('[VerovioPlayer] Verovio options set');

            // Initialize Tone.js audio context (will start on first user interaction)
            try {
                await Tone.start();
                this.audioContext = Tone.context;
                console.log('[VerovioPlayer] Tone.js initialized');
            } catch (e) {
                // AudioContext requires user gesture - will start later on play()
                console.log('[VerovioPlayer] Tone.js will start on user interaction');
                this.audioContext = Tone.context;
            }

            // Initialize instruments map for track-based sounds
            this.instruments = {};
            this.loadingInstruments = new Set();
            this.VOCAL_INSTRUMENT = 'choir_aahs';
            this.PIANO_INSTRUMENT = 'acoustic_grand_piano';

            // Check if soundfont-player is available
            const Soundfont = window.Soundfont || window.soundfont;
            if (typeof Soundfont !== 'undefined') {
                console.log('[VerovioPlayer] ✓ Soundfont library detected and ready');
            } else {
                console.warn('[VerovioPlayer] ⚠️ Soundfont library NOT detected! Audio playback will not work.');
                console.warn('[VerovioPlayer] Make sure <script src="...soundfont-player..."></script> is included in HTML');
            }

            console.log('[VerovioPlayer] Audio system initialized, soundfonts will load on demand');

            console.log('[VerovioPlayer] Initialization complete');
            return true;

        } catch (error) {
            console.error('[VerovioPlayer] Initialization error:', error);
            if (this.onError) {
                this.onError(error);
            }
            throw error;
        }
    }

    /**
     * Load a music file from URL (auto-detects MEI or MusicXML)
     */
    async loadMusicXML(url) {
        console.log('[VerovioPlayer] Loading score from:', url);

        try {
            if (this.onStateChange) {
                this.onStateChange('loading');
            }

            // Fetch the file
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch score: ${response.statusText}`);
            }

            const content = await response.text();
            console.log('[VerovioPlayer] Score fetched, size:', content.length);

            // Detect format based on URL or content
            const isMEI = url.endsWith('.mei') || content.trim().startsWith('<?xml') && content.includes('<mei ');

            if (isMEI) {
                console.log('[VerovioPlayer] Detected MEI format (fast loading)');
                await this.loadMEI(content);
            } else {
                console.log('[VerovioPlayer] Detected MusicXML format');
                await this.loadMusicXMLString(content);
            }

        } catch (error) {
            console.error('[VerovioPlayer] Error loading score:', error);
            if (this.onError) {
                this.onError(error);
            }
            throw error;
        }
    }

    /**
     * Load MusicXML from string
     */
    async loadMusicXMLString(musicxml) {
        console.log('[VerovioPlayer] Parsing MusicXML...');

        try {
            this.currentMusicXML = musicxml;

            // Load data into Verovio
            const loaded = this.vrvToolkit.loadData(musicxml);

            if (!loaded) {
                throw new Error('Verovio failed to load MusicXML data');
            }

            console.log('[VerovioPlayer] MusicXML loaded into Verovio');

            // Get MIDI from Verovio
            this.midiData = this.vrvToolkit.renderToMIDI();
            console.log('[VerovioPlayer] MIDI generated');

            // Get timemap for highlighting
            const timemapRaw = this.vrvToolkit.renderToTimemap();
            console.log('[VerovioPlayer] Timemap raw type:', typeof timemapRaw);
            console.log('[VerovioPlayer] Timemap is array?:', Array.isArray(timemapRaw));

            // Verovio returns timemap as an OBJECT, not a JSON string
            if (Array.isArray(timemapRaw)) {
                this.timemap = timemapRaw;
                console.log('[VerovioPlayer] ✅ Timemap is already an array');
            } else if (typeof timemapRaw === 'string') {
                try {
                    this.timemap = JSON.parse(timemapRaw);
                    console.log('[VerovioPlayer] ✅ Timemap parsed from JSON string');
                } catch (parseError) {
                    console.warn('[VerovioPlayer] Timemap JSON parse failed, using empty timemap:', parseError);
                    this.timemap = [];
                }
            } else if (timemapRaw && typeof timemapRaw === 'object') {
                // It's an object but not an array - try to convert or use as-is
                this.timemap = Object.values(timemapRaw);
                console.log('[VerovioPlayer] ⚠️ Timemap converted from object to array');
            } else {
                console.error('[VerovioPlayer] ❌ Unexpected timemap type:', typeof timemapRaw);
                this.timemap = [];
            }
            console.log('[VerovioPlayer] Timemap final length:', this.timemap.length, 'events');

            // Calculate duration from timemap - use tstamp (NOT qstamp!)
            if (this.timemap && this.timemap.length > 0) {
                console.log('[VerovioPlayer] First timemap event:', JSON.stringify(this.timemap[0]));
                const lastEvent = this.timemap[this.timemap.length - 1];
                console.log('[VerovioPlayer] Last timemap event:', JSON.stringify(lastEvent));

                // tstamp is in milliseconds - this is the correct absolute time
                const lastTime = lastEvent.tstamp || 0;
                this.duration = lastTime / 1000; // Convert to seconds

                console.log('[VerovioPlayer] Duration calculated:', this.duration, 'seconds');
                console.log('[VerovioPlayer] Last event tstamp:', lastTime, 'ms');
            } else {
                console.warn('[VerovioPlayer] No timemap events, cannot calculate duration');
                this.duration = 0;
            }

            // Parse MIDI events
            await this.parseMIDI();

            // Load instruments for all tracks
            console.log('[VerovioPlayer] About to load instruments for tracks...');
            await this.loadInstrumentsForTracks();
            console.log('[VerovioPlayer] Instruments loaded, continuing...');

            // Render SVG
            console.log('[VerovioPlayer] About to render SVG...');
            this.renderSVG();
            console.log('[VerovioPlayer] renderSVG() completed, pages:', this.svgPages.length);

            // Trigger loaded callback
            if (this.onLoaded) {
                const metadata = this.getMetadata();
                console.log('[VerovioPlayer] Calling onLoaded callback with metadata:', metadata);
                this.onLoaded(metadata);
            } else {
                console.warn('[VerovioPlayer] No onLoaded callback set!');
            }

            if (this.onStateChange) {
                this.onStateChange('stopped');
            }

            // Cache MEI for faster reloading (optional performance optimization)
            this.currentMEI = this.vrvToolkit.getMEI();
            console.log('[VerovioPlayer] MEI cached for potential reuse:',
                (this.currentMEI.length / 1024).toFixed(1), 'KB');

            console.log('[VerovioPlayer] Load complete');

        } catch (error) {
            console.error('[VerovioPlayer] Error parsing MusicXML:', error);
            if (this.onError) {
                this.onError(error);
            }
            throw error;
        }
    }

    /**
     * Load MEI directly (faster than MusicXML as it skips conversion)
     * Use this if you have pre-converted .mei files
     */
    async loadMEI(meiString) {
        console.log('[VerovioPlayer] Loading MEI directly...');

        try {
            this.currentMEI = meiString;

            // Load MEI data into Verovio
            const loaded = this.vrvToolkit.loadData(meiString);

            if (!loaded) {
                throw new Error('Verovio failed to load MEI data');
            }

            console.log('[VerovioPlayer] MEI loaded successfully');

            // Get MIDI from Verovio
            this.midiData = this.vrvToolkit.renderToMIDI();

            // Get timemap
            const timemapRaw = this.vrvToolkit.renderToTimemap();
            if (Array.isArray(timemapRaw)) {
                this.timemap = timemapRaw;
            }

            // Calculate duration
            if (this.timemap && this.timemap.length > 0) {
                const lastEvent = this.timemap[this.timemap.length - 1];
                const lastTime = lastEvent.tstamp || 0;
                this.duration = lastTime / 1000;
            }

            // Parse MIDI events
            await this.parseMIDI();

            // Load instruments
            await this.loadInstrumentsForTracks();

            // Render SVG (lazy)
            this.renderSVG();

            if (this.onLoaded) {
                this.onLoaded(this.getMetadata());
            }

            if (this.onStateChange) {
                this.onStateChange('stopped');
            }

            console.log('[VerovioPlayer] MEI load complete');

        } catch (error) {
            console.error('[VerovioPlayer] Error loading MEI:', error);
            if (this.onError) {
                this.onError(error);
            }
            throw error;
        }
    }

    /**
     * Determine which instrument to use for a track based on its name
     */
    getInstrumentForTrack(trackName) {
        const normalized = (trackName || '').toLowerCase();

        // Check for piano/keyboard instruments
        if (normalized.includes('piano') ||
            normalized.includes('keyboard') ||
            normalized.includes('keys')) {
            return this.PIANO_INSTRUMENT;
        }

        // Default to vocal for everything else (SATB parts)
        return this.VOCAL_INSTRUMENT;
    }

    /**
     * Load a soundfont instrument
     */
    async loadInstrument(instrumentName, trackId) {
        if (this.instruments[trackId]) {
            console.log(`[VerovioPlayer] Instrument for ${trackId} already loaded`);
            return true;
        }

        if (this.loadingInstruments.has(trackId)) {
            console.log(`[VerovioPlayer] Instrument for ${trackId} already loading, waiting...`);
            // Wait a bit and check again
            while (this.loadingInstruments.has(trackId)) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return !!this.instruments[trackId];
        }

        this.loadingInstruments.add(trackId);

        try {
            // Access Soundfont from window object since we're in a module
            const Soundfont = window.Soundfont || window.soundfont;

            if (typeof Soundfont === 'undefined') {
                console.error('[VerovioPlayer] Soundfont library not available!');
                console.error('[VerovioPlayer] Available sound-related globals:',
                    Object.keys(window).filter(k => k.toLowerCase().includes('sound')));
                throw new Error('Soundfont library not loaded! Make sure soundfont-player script is included.');
            }

            console.log(`[VerovioPlayer] Loading ${instrumentName} for track "${trackId}"...`);

            console.log(`[VerovioPlayer] Loading ${instrumentName} soundfont from local files...`);
            const startTime = performance.now();

            const instrument = await Soundfont.instrument(this.audioContext, instrumentName, {
                gain: 1.0,
                // Use local soundfonts instead of CDN
                nameToUrl: (name, soundfont, format) => {
                    // Default to mp3 format if not specified
                    const fileFormat = format || 'mp3';
                    return `./soundfonts/MusyngKite/${name}-${fileFormat}.js`;
                }
            });

            const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);

            this.instruments[trackId] = instrument;
            console.log(`[VerovioPlayer] ✓ Loaded ${instrumentName} for track "${trackId}" (${elapsed}s)`);
            return true;
        } catch (error) {
            console.error(`[VerovioPlayer] ❌ Error loading instrument for ${trackId}:`, error);
            this.instruments[trackId] = null;
            return false;
        } finally {
            this.loadingInstruments.delete(trackId);
        }
    }

    /**
     * Load instruments for all MIDI tracks
     */
    async loadInstrumentsForTracks() {
        if (!this.parsedMIDI || !this.parsedMIDI.tracks) {
            console.warn('[VerovioPlayer] No MIDI tracks to load instruments for');
            return;
        }

        console.log('[VerovioPlayer] Loading instruments for all tracks...');
        console.log('[VerovioPlayer] window.Soundfont available?', typeof window.Soundfont !== 'undefined');

        const loadPromises = [];

        this.parsedMIDI.tracks.forEach((track, trackIndex) => {
            const trackName = track.name || `Track ${trackIndex}`;
            const trackId = `${trackName}-${trackIndex}`;
            const instrumentName = this.getInstrumentForTrack(trackName);
            console.log(`[VerovioPlayer] Track "${trackName}" (${trackId}) -> ${instrumentName}`);
            loadPromises.push(this.loadInstrument(instrumentName, trackId));
        });

        try {
            const results = await Promise.all(loadPromises);
            const successCount = results.filter(r => r).length;
            console.log(`[VerovioPlayer] Loaded ${successCount}/${results.length} instruments successfully`);
            console.log('[VerovioPlayer] Loaded instruments:', Object.keys(this.instruments).filter(k => this.instruments[k]));

            if (successCount === 0) {
                throw new Error('Failed to load any instruments! Check console for errors.');
            }
        } catch (error) {
            console.error('[VerovioPlayer] Error loading instruments:', error);
            throw error;
        }
    }

    /**
     * Parse MIDI data into events
     */
    async parseMIDI() {
        if (!this.midiData) {
            console.warn('[VerovioPlayer] No MIDI data to parse');
            return;
        }

        try {
            // Verovio returns MIDI as base64 string
            console.log('[VerovioPlayer] Parsing MIDI data...');

            // Convert base64 to binary
            const binaryString = atob(this.midiData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Parse MIDI using Tone.js Midi library
            if (typeof Midi !== 'undefined') {
                const midi = new Midi(bytes.buffer);
                console.log('[VerovioPlayer] MIDI parsed:', midi.tracks.length, 'tracks');
                console.log('[VerovioPlayer] MIDI duration:', midi.duration, 'seconds');

                // Store parsed MIDI for playback
                this.parsedMIDI = midi;

                // Extract note events for scheduling
                this.midiEvents = [];
                midi.tracks.forEach((track, trackIndex) => {
                    const trackName = track.name || `Track ${trackIndex}`;
                    // Use unique identifier for each track (combine name + index for duplicates)
                    const trackId = `${trackName}-${trackIndex}`;
                    console.log(`[VerovioPlayer] Track ${trackIndex}: ${trackName}, ${track.notes.length} notes`);
                    track.notes.forEach(note => {
                        this.midiEvents.push({
                            time: note.time,
                            duration: note.duration,
                            midi: note.midi,
                            velocity: note.velocity,
                            track: trackIndex,
                            trackName: trackName,
                            trackId: trackId
                        });
                    });
                });

                console.log('[VerovioPlayer] Total MIDI events:', this.midiEvents.length);
            } else {
                console.warn('[VerovioPlayer] Midi library not loaded, skipping MIDI parsing');
            }
        } catch (error) {
            console.error('[VerovioPlayer] Error parsing MIDI:', error);
        }

        console.log('[VerovioPlayer] MIDI parsing complete');
    }

    /**
     * Render score as SVG (lazy rendering - only renders pages on demand)
     */
    renderSVG() {
        const pageCount = this.vrvToolkit.getPageCount();
        this.totalPages = pageCount;
        this.svgPages = []; // Clear cache

        console.log('[VerovioPlayer] Score has', pageCount, 'pages (will render on demand)');
    }

    /**
     * Get all SVG pages combined (renders all pages if needed)
     */
    getSVG() {
        // Render all pages if not cached
        if (this.svgPages.length === 0) {
            console.log('[VerovioPlayer] Rendering all', this.totalPages, 'pages...');
            const startTime = performance.now();

            for (let i = 1; i <= this.totalPages; i++) {
                const svg = this.vrvToolkit.renderToSVG(i);
                this.svgPages.push(svg);
            }

            const elapsed = performance.now() - startTime;
            console.log('[VerovioPlayer] Rendered all pages in', elapsed.toFixed(0), 'ms');
        }
        return this.svgPages.join('\n');
    }

    /**
     * Render and cache a specific page
     */
    renderPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages) {
            return null;
        }

        // Return cached page if available
        const cacheIndex = pageNum - 1;
        if (this.svgPages[cacheIndex]) {
            return this.svgPages[cacheIndex];
        }

        // Render and cache the page
        console.log('[VerovioPlayer] Rendering page', pageNum);
        const svg = this.vrvToolkit.renderToSVG(pageNum);
        this.svgPages[cacheIndex] = svg;
        return svg;
    }

    /**
     * Get single page SVG
     */
    getPageSVG(page) {
        if (page < 0 || page >= this.svgPages.length) {
            return null;
        }
        return this.svgPages[page];
    }

    /**
     * Get metadata
     */
    getMetadata() {
        return {
            title: 'Score', // Extract from MusicXML if possible
            composer: 'Unknown',
            measureCount: this.vrvToolkit.getPageCount() * 4, // Estimate
            duration: this.duration
        };
    }

    /**
     * Get current duration
     */
    getDuration() {
        return this.duration;
    }

    /**
     * Play the score
     */
    async play() {
        if (this.isPlaying && !this.isPaused) {
            console.log('[VerovioPlayer] Already playing');
            return;
        }

        console.log('[VerovioPlayer] Starting playback...');
        console.log('[VerovioPlayer] Current time:', this.currentTime);

        try {
            // Resume audio context if needed
            await Tone.start();

            this.isPlaying = true;
            this.isPaused = false;

            // Reset Transport and clear old events
            this.resetTransport();

            // Set tempo based on MIDI or default
            if (this.parsedMIDI && this.parsedMIDI.header && this.parsedMIDI.header.tempos && this.parsedMIDI.header.tempos.length > 0) {
                Tone.Transport.bpm.value = this.parsedMIDI.header.tempos[0].bpm * this.tempo;

                // Schedule tempo changes if any
                this.parsedMIDI.header.tempos.slice(1).forEach(tempoEvent => {
                    Tone.Transport.schedule((time) => {
                        Tone.Transport.bpm.rampTo(tempoEvent.bpm * this.tempo, 0.01, time);
                    }, tempoEvent.time);
                });
            } else {
                Tone.Transport.bpm.value = 120 * this.tempo;
            }

            console.log('[VerovioPlayer] Tempo set to:', Tone.Transport.bpm.value);

            // Schedule MIDI notes with Tone.Transport
            this.schedulePlayback();

            // Start highlight loop
            this.startScheduler();

            // Set Transport position and start
            Tone.Transport.seconds = this.currentTime;
            Tone.Transport.start("+0.05");

            if (this.onStateChange) {
                this.onStateChange('playing');
            }

        } catch (error) {
            console.error('[VerovioPlayer] Error starting playback:', error);
            if (this.onError) {
                this.onError(error);
            }
        }
    }

    /**
     * Reset Tone.Transport (like the working sample)
     */
    resetTransport() {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        Tone.Transport.position = 0;
        this.stopScheduler();
        this.scheduledNotes = []; // Clear the scheduled notes array
    }

    /**
     * Schedule MIDI notes for playback using soundfont instruments and Tone.Transport
     */
    schedulePlayback() {
        if (!this.midiEvents || this.midiEvents.length === 0) {
            console.warn('[VerovioPlayer] No MIDI events to schedule');
            return;
        }

        // Clear any previously scheduled notes
        this.clearScheduledNotes();

        console.log('[VerovioPlayer] Scheduling', this.midiEvents.length, 'MIDI events with soundfonts');
        console.log('[VerovioPlayer] Starting from time:', this.currentTime);

        // Group events by track to track unique tracks
        const trackIds = new Set(this.midiEvents.map(e => e.trackId));
        console.log('[VerovioPlayer] Unique tracks:', Array.from(trackIds));
        console.log('[VerovioPlayer] Loaded instruments:', Object.keys(this.instruments));

        // Schedule each MIDI event using Tone.Transport
        let scheduledCount = 0;
        let skippedCount = 0;

        this.midiEvents.forEach(event => {
            const instrument = this.instruments[event.trackId];
            if (!instrument) {
                skippedCount++;
                if (skippedCount === 1) {
                    console.warn(`[VerovioPlayer] No instrument loaded for track "${event.trackId}"`);
                }
                return;
            }

            // Skip muted tracks
            if (this.mutedTracks.has(event.trackId)) {
                return;
            }

            // Schedule the note with Tone.Transport at its absolute time
            const eventId = Tone.Transport.schedule((time) => {
                const pitch = Tone.Frequency(event.midi, 'midi').toNote();

                // Calculate final gain with master volume, track volume, and velocity
                const trackVolume = this.getTrackVolume(event.trackId);
                const finalGain = event.velocity * trackVolume * this.masterVolume * 0.8;

                try {
                    instrument.play(pitch, time, {
                        duration: event.duration,
                        gain: finalGain
                    });
                } catch (e) {
                    console.error('[VerovioPlayer] Error playing note:', e);
                }
            }, event.time);

            this.scheduledNotes.push({ eventId });
            scheduledCount++;
        });

        console.log('[VerovioPlayer] Scheduled', scheduledCount, 'notes, skipped', skippedCount);
    }

    /**
     * Clear scheduled notes from Tone.Transport
     * Note: Tone.Transport.cancel() in resetTransport() already clears all events
     */
    clearScheduledNotes() {
        this.scheduledNotes = [];
    }

    /**
     * Pause playback
     */
    pause() {
        if (!this.isPlaying || this.isPaused) {
            return;
        }

        console.log('[VerovioPlayer] Pausing playback...');

        this.isPaused = true;
        this.isPlaying = false;
        this.currentTime = Tone.Transport.seconds;
        this.pauseTimeOffset = this.currentTime;

        Tone.Transport.pause();
        this.stopScheduler();

        if (this.onStateChange) {
            this.onStateChange('paused');
        }
    }

    /**
     * Stop playback
     */
    stop() {
        console.log('[VerovioPlayer] Stopping playback...');

        this.isPlaying = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.pauseTimeOffset = 0;

        this.resetTransport();
        this.clearHighlights();

        if (this.onStateChange) {
            this.onStateChange('stopped');
        }

        if (this.onTimeUpdate) {
            this.onTimeUpdate(0);
        }
    }

    /**
     * Seek to specific time
     */
    seek(time) {
        const wasPlaying = this.isPlaying;

        if (wasPlaying) {
            this.pause();
        }

        this.currentTime = Math.max(0, Math.min(time, this.duration));
        this.pauseTimeOffset = this.currentTime;
        Tone.Transport.seconds = this.currentTime;

        if (this.onTimeUpdate) {
            this.onTimeUpdate(this.currentTime);
        }

        if (wasPlaying) {
            this.play();
        }
    }

    /**
     * Set tempo (playback speed)
     */
    setTempo(factor) {
        this.tempo = Math.max(0.25, Math.min(factor, 2.0)); // Clamp between 25% and 200%
        console.log('[VerovioPlayer] Tempo set to:', this.tempo);

        // Update Tone.Transport tempo if playing
        if (this.isPlaying) {
            if (this.parsedMIDI && this.parsedMIDI.header && this.parsedMIDI.header.tempos && this.parsedMIDI.header.tempos.length > 0) {
                Tone.Transport.bpm.value = this.parsedMIDI.header.tempos[0].bpm * this.tempo;
            } else {
                Tone.Transport.bpm.value = 120 * this.tempo;
            }
        }
    }

    /**
     * Set zoom level (scale)
     */
    setZoom(scale) {
        this.scale = Math.max(20, Math.min(scale, 100)); // Clamp between 20% and 100%
        console.log('[VerovioPlayer] Zoom set to:', this.scale);

        // Update Verovio options
        this.vrvToolkit.setOptions({
            scale: this.scale
        });

        // Re-render the score if we have loaded data
        if (this.currentMusicXML) {
            this.renderSVG();
            // Trigger a re-render callback if needed
            if (this.onZoomChange) {
                this.onZoomChange(this.scale);
            }
        }

        return this.scale;
    }

    /**
     * Get current zoom level
     */
    getZoom() {
        return this.scale;
    }

    /**
     * Zoom in
     */
    zoomIn() {
        return this.setZoom(this.scale + 5);
    }

    /**
     * Zoom out
     */
    zoomOut() {
        return this.setZoom(this.scale - 5);
    }

    /**
     * Start the playback scheduler for highlights
     */
    startScheduler() {
        if (this.scheduler) {
            this.stopScheduler();
        }

        console.log('[VerovioPlayer] Starting scheduler');
        console.log('[VerovioPlayer] Duration:', this.duration, 'seconds');
        console.log('[VerovioPlayer] Timemap events:', this.timemap.length);

        // Use Tone.Transport.scheduleRepeat for synchronized highlighting (like the working sample)
        this.scheduler = Tone.Transport.scheduleRepeat(() => {
            if (!this.isPlaying || this.isPaused) {
                return;
            }

            // Get current time from Tone.Transport
            this.currentTime = Tone.Transport.seconds;

            // Check if we've reached the end
            if (this.currentTime >= this.duration) {
                console.log('[VerovioPlayer] Reached end of score');
                this.stop();
                return;
            }

            // Update highlights
            this.updateHighlights(this.currentTime);

            // Trigger time update callback
            if (this.onTimeUpdate) {
                this.onTimeUpdate(this.currentTime);
            }
        }, 0.05); // Update every 50ms, same as working sample
    }

    /**
     * Stop the scheduler
     */
    stopScheduler() {
        if (this.scheduler !== null) {
            Tone.Transport.clear(this.scheduler);
            this.scheduler = null;
        }
    }

    /**
     * Update note highlighting based on current time
     * Uses Verovio's official getElementsAtTime() method
     * Enhanced with upcoming notes preview and auto-scrolling
     */
    updateHighlights(time) {
        const timeMs = time * 1000;

        // Clear previous highlights
        this.clearHighlights();

        // Use Verovio's official getElementsAtTime method for current notes
        const currentElements = this.vrvToolkit.getElementsAtTime(timeMs);

        if (!currentElements || currentElements.page === 0) {
            return;
        }

        // Change page if needed
        if (currentElements.page !== this.currentPage + 1) { // Verovio pages are 1-indexed
            console.log(`[VerovioPlayer] Changing to page ${currentElements.page}`);
            this.currentPage = currentElements.page - 1; // Store 0-indexed
            // Note: Page change should be handled by the UI layer
        }

        // Highlight all currently playing notes and scroll to first one
        let firstNoteElement = null;
        if (currentElements.notes) {
            for (const noteId of currentElements.notes) {
                this.highlightElement(noteId, 'playing');

                // Get the first note element for scrolling
                if (!firstNoteElement) {
                    firstNoteElement = document.getElementById(noteId);
                }
            }
        }

        // Auto-scroll to keep current notes visible
        if (firstNoteElement) {
            this.scrollToElement(firstNoteElement);
        }

        // Show upcoming notes (0.5 seconds ahead) with preview highlight
        const upcomingTimeMs = timeMs + 500;
        const upcomingElements = this.vrvToolkit.getElementsAtTime(upcomingTimeMs);

        if (upcomingElements && upcomingElements.notes) {
            for (const noteId of upcomingElements.notes) {
                // Only highlight if not already playing
                if (!currentElements.notes || !currentElements.notes.includes(noteId)) {
                    this.highlightElement(noteId, 'upcoming');
                }
            }
        }
    }

    /**
     * Scroll to keep an element visible in the score display
     */
    scrollToElement(element) {
        if (!element) return;

        // Find the score container
        const container = element.closest('#scoreCanvas') || element.closest('.score-display');
        if (!container) return;

        // Get element and container positions
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate if element is outside visible area
        const isAbove = elementRect.top < containerRect.top + 100; // 100px margin from top
        const isBelow = elementRect.bottom > containerRect.bottom - 100; // 100px margin from bottom

        if (isAbove || isBelow) {
            // Scroll to center the element vertically
            const elementCenter = element.offsetTop - (container.clientHeight / 2) + (elementRect.height / 2);
            container.scrollTo({
                top: elementCenter,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Highlight a specific element with a class
     */
    highlightElement(id, highlightClass = 'playing') {
        if (!id) return;

        const element = document.getElementById(id);
        if (element) {
            element.classList.add(highlightClass);
            this.highlightedElements.add(id);
        }
    }

    /**
     * Clear all highlights
     */
    clearHighlights() {
        for (const id of this.highlightedElements) {
            const element = document.getElementById(id);
            if (element) {
                element.classList.remove('playing', 'upcoming');
            }
        }
        this.highlightedElements.clear();
    }

    /**
     * Get current state
     */
    getState() {
        if (this.isPlaying && !this.isPaused) {
            return 'playing';
        } else if (this.isPaused) {
            return 'paused';
        } else {
            return 'stopped';
        }
    }

    /**
     * Set master volume (0.0 to 1.0)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(volume, 1.0));
        console.log('[VerovioPlayer] Master volume set to:', this.masterVolume);
    }

    /**
     * Get master volume
     */
    getMasterVolume() {
        return this.masterVolume;
    }

    /**
     * Set volume for a specific track (0.0 to 1.0)
     */
    setTrackVolume(trackId, volume) {
        this.trackVolumes[trackId] = Math.max(0, Math.min(volume, 1.0));
        console.log(`[VerovioPlayer] Track "${trackId}" volume set to:`, this.trackVolumes[trackId]);
    }

    /**
     * Get volume for a specific track
     */
    getTrackVolume(trackId) {
        return this.trackVolumes[trackId] !== undefined ? this.trackVolumes[trackId] : 1.0;
    }

    /**
     * Mute a specific track
     */
    muteTrack(trackId) {
        this.mutedTracks.add(trackId);
        console.log(`[VerovioPlayer] Track "${trackId}" muted`);
    }

    /**
     * Unmute a specific track
     */
    unmuteTrack(trackId) {
        this.mutedTracks.delete(trackId);
        console.log(`[VerovioPlayer] Track "${trackId}" unmuted`);
    }

    /**
     * Toggle mute for a specific track
     */
    toggleMuteTrack(trackId) {
        if (this.mutedTracks.has(trackId)) {
            this.unmuteTrack(trackId);
        } else {
            this.muteTrack(trackId);
        }
    }

    /**
     * Check if a track is muted
     */
    isTrackMuted(trackId) {
        return this.mutedTracks.has(trackId);
    }

    /**
     * Get list of available tracks
     */
    getTracks() {
        if (!this.parsedMIDI || !this.parsedMIDI.tracks) {
            return [];
        }

        return this.parsedMIDI.tracks.map((track, index) => ({
            id: `${track.name || `Track ${index}`}-${index}`,
            name: track.name || `Track ${index}`,
            index: index
        }));
    }

    /**
     * Clean up resources
     */
    destroy() {
        console.log('[VerovioPlayer] Destroying player...');

        this.stop();

        // Dispose of all soundfont instruments
        Object.values(this.instruments).forEach(instrument => {
            if (instrument && instrument.stop) {
                try {
                    instrument.stop();
                } catch (e) {
                    // Already stopped
                }
            }
        });
        this.instruments = {};

        this.clearHighlights();
        this.vrvToolkit = null;
        this.timemap = [];
        this.svgPages = [];
        this.midiEvents = [];
    }
}
