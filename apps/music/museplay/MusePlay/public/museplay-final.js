/**
 * MusePlay Final - Production-Ready Player
 * With soundfonts, perfect sync, highlighting, and auto-advance
 */

// Load soundfont library
const soundfontHosting = '/music_player/soundfonts/';

class MusePlayPlayer {
    constructor() {
        this.verovio = null;
        this.currentMidi = null;
        this.instruments = {};
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPage = 1;
        this.totalPages = 1;
        this.timemap = [];
        this.tracks = [];
        this.masterVolume = 1.0;
        this.volumeBoost = 2.5;  // 250% boost for loud playback
        this.playbackRate = 1.0;
        this.startTime = 0;
        this.pauseTime = 0;
        this.parts = [];  // Array of Tone.Part objects
        this.animationFrame = null;
        this.zoomLevel = 40;  // Default zoom scale for Verovio
        this.musicxmlData = null;  // Store for re-rendering on zoom
        this.highlightedElements = [];  // Track highlighted notes
        this.beatsToSeconds = 1.0;  // Conversion factor
        this.hasRepeats = false;  // Whether MIDI has repeats
    }

    async init() {
        console.log('🎵 Initializing MusePlay Final...');
        updateStatus('loading', 'Loading...');

        try {
            await this.waitForVerovio();
            await this.waitForTone();

            this.verovio = new verovio.toolkit();
            console.log('✓ Verovio loaded:', this.verovio.getVersion());

            this.verovio.setOptions({
                scale: 40,
                adjustPageHeight: true,
                pageHeight: 2000,
                pageWidth: 2100,
                breaks: 'auto',
                font: 'Leipzig'
            });

            // Load piano soundfont
            await this.loadSoundfont();

            updateStatus('ready', 'Ready');
            return true;

        } catch (error) {
            console.error('Failed to initialize:', error);
            updateStatus('error', 'Init failed');
            return false;
        }
    }

    async waitForVerovio() {
        let attempts = 0;
        while (typeof verovio === 'undefined' && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (typeof verovio === 'undefined') throw new Error('Verovio failed to load');
    }

    async waitForTone() {
        let attempts = 0;
        while (typeof Tone === 'undefined' && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (typeof Tone === 'undefined') throw new Error('Tone.js failed to load');
    }

    async loadSoundfont() {
        updateProgress('Loading Steinway grand piano...');

        // Load Steinway Grand Piano samples
        this.instruments.piano = new Tone.Sampler({
            urls: {
                'A0': 'A0.wav',
                'C1': 'C1.wav', 'F#1': 'F#1.wav',
                'C2': 'C2.wav', 'F#2': 'F#2.wav',
                'C3': 'C3.wav', 'F#3': 'F#3.wav',
                'C4': 'C4.wav', 'F#4': 'F#4.wav',
                'C5': 'C5.wav', 'F#5': 'F#5.wav',
                'C6': 'C6.wav', 'F#6': 'F#6.wav',
                'C7': 'C7.wav', 'F#7': 'F#7.wav',
                'C8': 'C8.wav'
            },
            release: 1,
            baseUrl: soundfontHosting + "steinway/"
        }).toDestination();

        this.instruments.piano.volume.value = Tone.gainToDb(this.volumeBoost);
        console.log('✓ Steinway Grand Piano loaded');

        updateProgress('Loading choir sounds...');

        // Load Choir Aahs samples (uses flats: Eb, Gb instead of sharps)
        this.instruments.choir = new Tone.Sampler({
            urls: {
                'A0': 'A0.mp3', 'C1': 'C1.mp3', 'Eb1': 'Eb1.mp3', 'Gb1': 'Gb1.mp3',
                'A1': 'A1.mp3', 'C2': 'C2.mp3', 'Eb2': 'Eb2.mp3', 'Gb2': 'Gb2.mp3',
                'A2': 'A2.mp3', 'C3': 'C3.mp3', 'Eb3': 'Eb3.mp3', 'Gb3': 'Gb3.mp3',
                'A3': 'A3.mp3', 'C4': 'C4.mp3', 'Eb4': 'Eb4.mp3', 'Gb4': 'Gb4.mp3',
                'A4': 'A4.mp3', 'C5': 'C5.mp3', 'Eb5': 'Eb5.mp3', 'Gb5': 'Gb5.mp3',
                'A5': 'A5.mp3', 'C6': 'C6.mp3', 'Eb6': 'Eb6.mp3', 'Gb6': 'Gb6.mp3',
                'A6': 'A6.mp3', 'C7': 'C7.mp3', 'Eb7': 'Eb7.mp3', 'Gb7': 'Gb7.mp3',
                'A7': 'A7.mp3', 'C8': 'C8.mp3'
            },
            release: 1.5,
            baseUrl: soundfontHosting + "choir_aahs/"
        }).toDestination();

        this.instruments.choir.volume.value = Tone.gainToDb(this.volumeBoost);
        console.log('✓ Choir Aahs loaded');
    }

    async loadPreconvertedScore(musicxmlUrl, midiUrl, name) {
        console.log('Loading score:', name);
        updateProgress(`Loading ${name}...`);
        updateStatus('loading', 'Loading...');

        try {
            // Fetch and render MusicXML
            const musicxmlResponse = await fetch(musicxmlUrl);
            const musicxmlText = await musicxmlResponse.text();
            await this.renderMusicXML(musicxmlText);

            // Fetch and parse MIDI
            const midiResponse = await fetch(midiUrl);
            const midiBlob = await midiResponse.blob();
            const midiArrayBuffer = await midiBlob.arrayBuffer();
            await this.setupMidi(midiArrayBuffer);

            // Build timemap and setup controls
            this.buildTimemap();
            this.setupPageNavigation();
            this.setupPartControls();

            updateInfo(name, name, 'MusicXML + MIDI');
            updateStatus('ready', 'Ready');
            updateProgress('');

        } catch (error) {
            console.error('❌ Load failed:', error);
            updateStatus('error', 'Load failed');
            alert(`Failed: ${error.message}`);
        }
    }

    async renderMusicXML(musicxmlText) {
        this.musicxmlData = musicxmlText;  // Store for zoom changes

        const success = this.verovio.loadData(musicxmlText);
        if (!success) throw new Error('Failed to load MusicXML');

        this.totalPages = this.verovio.getPageCount();
        this.currentPage = 1;
        this.renderCurrentPage();
        console.log(`✓ Score rendered (${this.totalPages} pages)`);
    }

    zoomIn() {
        this.zoomLevel = Math.min(100, this.zoomLevel + 10);
        this.applyZoom();
    }

    zoomOut() {
        this.zoomLevel = Math.max(20, this.zoomLevel - 10);
        this.applyZoom();
    }

    applyZoom() {
        if (!this.musicxmlData) return;

        this.verovio.setOptions({
            scale: this.zoomLevel,
            adjustPageHeight: true,
            pageHeight: 2000,
            pageWidth: 2100,
            breaks: 'auto',
            font: 'Leipzig'
        });

        this.verovio.loadData(this.musicxmlData);
        this.totalPages = this.verovio.getPageCount();
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.renderCurrentPage();
        this.buildTimemap();

        document.getElementById('zoom-display').textContent = `${Math.round(this.zoomLevel * 2.5)}%`;
        console.log(`Zoom: ${this.zoomLevel} (${Math.round(this.zoomLevel * 2.5)}%)`);
    }

    renderCurrentPage() {
        const svg = this.verovio.renderToSVG(this.currentPage);
        const scoreDisplay = document.getElementById('score-display');

        // Update the SVG
        scoreDisplay.innerHTML = svg;

        // Add click handlers to measures
        this.addMeasureClickHandlers();

        // Update page navigation
        const pageInfo = document.getElementById('page-info');
        if (pageInfo) pageInfo.textContent = `Page ${this.currentPage} / ${this.totalPages}`;

        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === this.totalPages;
    }

    addMeasureClickHandlers() {
        const measures = document.querySelectorAll('svg .measure');
        measures.forEach(measure => {
            measure.style.cursor = 'pointer';
            measure.addEventListener('click', () => {
                const measureId = measure.getAttribute('id');
                this.seekToMeasure(measureId);
            });
        });
    }

    async setupMidi(midiArrayBuffer) {
        this.currentMidi = new Midi(midiArrayBuffer);
        console.log('✓ MIDI parsed:', this.currentMidi.tracks.length, 'tracks');

        this.tracks = this.currentMidi.tracks.map((track, i) => ({
            index: i,
            name: track.name || `Track ${i + 1}`,
            instrument: track.instrument?.name || 'Piano',
            noteCount: track.notes.length,
            muted: false,
            volume: 1.0
        }));

        document.getElementById('play-btn').disabled = false;
    }

    buildTimemap() {
        try {
            const timemapData = this.verovio.renderToTimemap();
            if (typeof timemapData === 'string') {
                this.timemap = JSON.parse(timemapData);
            } else {
                this.timemap = Array.isArray(timemapData) ? timemapData : [];
            }

            console.log('✓ Timemap built:', {
                entries: this.timemap.length,
                firstEntry: this.timemap[0],
                sample: this.timemap.slice(0, 3)
            });

            // Debug: check timemap range and structure
            if (this.timemap.length > 0) {
                console.log('✓ Timemap:', this.timemap.length, 'entries');

                // Check first entry structure
                const firstEntry = this.timemap.find(e => e.qstamp && e.on);
                if (firstEntry) {
                    console.log('  First entry sample:', {
                        qstamp: firstEntry.qstamp,
                        tstamp: firstEntry.tstamp,
                        on: firstEntry.on.substring(0, 30),
                        tempo_bpm: firstEntry.tempo
                    });
                }

                const qstamps = this.timemap
                    .filter(e => e.qstamp)
                    .map(e => parseFloat(e.qstamp))
                    .sort((a, b) => a - b);

                console.log(`  qstamp range: ${qstamps[0]?.toFixed(2)} - ${qstamps[qstamps.length-1]?.toFixed(2)}`);

                if (this.currentMidi) {
                    console.log(`  MIDI duration: ${this.currentMidi.duration.toFixed(2)}s`);
                    console.log(`  First MIDI note: ${this.currentMidi.tracks[0]?.notes[0]?.time.toFixed(2)}s`);

                    // Calculate average tempo from MIDI
                    const totalBeats = qstamps[qstamps.length-1] || 100;
                    const avgBPM = (totalBeats / this.currentMidi.duration) * 60;
                    console.log(`  Estimated BPM: ${avgBPM.toFixed(1)} (${totalBeats.toFixed(1)} beats / ${this.currentMidi.duration.toFixed(1)}s)`);

                    // Store conversion factor
                    this.beatsToSeconds = this.currentMidi.duration / (qstamps[qstamps.length-1] || 1);
                    console.log(`  Conversion: 1 beat = ${this.beatsToSeconds.toFixed(3)}s`);

                    // Detect repeats: if MIDI is significantly longer than score, it has repeats
                    const expectedDuration = totalBeats * this.beatsToSeconds;
                    this.hasRepeats = this.currentMidi.duration > expectedDuration * 1.3;

                    if (this.hasRepeats) {
                        const repeatFactor = this.currentMidi.duration / expectedDuration;
                        console.warn(`⚠ MIDI has REPEATS! Duration ${this.currentMidi.duration.toFixed(1)}s vs expected ${expectedDuration.toFixed(1)}s (${repeatFactor.toFixed(2)}x)`);
                        console.warn(`  Score will cycle through pages during repeats`);
                        this.repeatFactor = repeatFactor;
                    }
                }
            }
        } catch (e) {
            console.warn('Timemap build failed:', e);
            this.timemap = [];
        }
    }

    setupPageNavigation() {
        if (document.getElementById('page-nav-container')) return;

        const navHtml = `
            <div id="page-nav-container" class="page-nav">
                <button id="prev-page" class="btn">← Prev</button>
                <span id="page-info">Page 1 / ${this.totalPages}</span>
                <button id="next-page" class="btn">Next →</button>
            </div>
        `;

        const container = document.querySelector('.score-container');
        container.insertAdjacentHTML('beforeend', navHtml);

        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderCurrentPage();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.renderCurrentPage();
            }
        });
    }

    setupPartControls() {
        let html = '<h3>🎼 Parts</h3>';
        this.tracks.forEach(track => {
            const currentVolume = Math.round(track.volume * 100);
            html += `
                <div class="track-control">
                    <div class="track-info">
                        <strong>${track.name}</strong>
                        <span class="track-instrument">${track.instrument}</span>
                    </div>
                    <div class="track-buttons">
                        <button class="btn-small" onclick="player.toggleMute(${track.index})">
                            ${track.muted ? '🔇' : '🔊'}
                        </button>
                        <input type="range" min="0" max="100" value="${currentVolume}" id="track-vol-${track.index}"
                               oninput="player.setTrackVolume(${track.index}, this.value/100); document.getElementById('track-vol-display-${track.index}').textContent=this.value+'%'">
                        <span class="volume-display" id="track-vol-display-${track.index}">${currentVolume}%</span>
                    </div>
                </div>
            `;
        });

        document.getElementById('part-controls').innerHTML = html;
        document.getElementById('part-controls').style.display = 'block';
    }

    toggleMute(trackIndex) {
        this.tracks[trackIndex].muted = !this.tracks[trackIndex].muted;
        this.setupPartControls();
    }

    setTrackVolume(trackIndex, volume) {
        this.tracks[trackIndex].volume = volume;
    }

    setMasterVolume(volume) {
        this.masterVolume = volume;
        const dbValue = Tone.gainToDb(volume * this.volumeBoost);
        if (this.instruments.piano) {
            this.instruments.piano.volume.value = dbValue;
        }
        if (this.instruments.choir) {
            this.instruments.choir.volume.value = dbValue;
        }
    }

    getInstrumentForTrack(track) {
        // Determine which sampler to use based on track instrument/name
        // track.instrument is a string (from setupMidi line 245)
        const instrumentName = (track.instrument || '').toLowerCase();
        const trackName = (track.name || '').toLowerCase();

        console.log(`Track "${track.name}": instrument="${track.instrument}"`);

        // Check both instrument name and track name for voice/choir indicators
        if (instrumentName.includes('choir') ||
            instrumentName.includes('vocal') ||
            instrumentName.includes('voice') ||
            instrumentName.includes('ahh') ||
            instrumentName.includes('ooh') ||
            instrumentName.includes('aah') ||
            trackName.includes('choir') ||
            trackName.includes('vocal') ||
            trackName.includes('voice') ||
            trackName.includes('soprano') ||
            trackName.includes('alto') ||
            trackName.includes('tenor') ||
            trackName.includes('bass')) {
            console.log(`✓ Using CHOIR for track: "${track.name}" (instrument: "${track.instrument}")`);
            return this.instruments.choir || this.instruments.piano;
        }

        console.log(`Using piano for track: "${track.name}"`);
        return this.instruments.piano;
    }

    setPlaybackRate(rate) {
        this.playbackRate = rate;

        // Update Transport BPM in real-time
        Tone.Transport.bpm.value = 120 * rate;

        console.log(`Playback speed: ${(rate * 100).toFixed(0)}%`);
    }

    async play() {
        if (!this.currentMidi || this.isPlaying) return;

        try {
            await Tone.start();
            if (Tone.context.state !== 'running') {
                await Tone.context.resume();
            }

            this.isPlaying = true;
            this.isPaused = false;

            // Set transport playback rate (for speed control)
            Tone.Transport.bpm.value = 120 * this.playbackRate;

            // If resuming from pause, start at pauseTime
            if (this.pauseTime > 0) {
                Tone.Transport.seconds = this.pauseTime;
            } else {
                Tone.Transport.seconds = 0;
                this.startTime = Tone.now();

                // Clear any existing parts
                this.parts.forEach(part => part.dispose());
                this.parts = [];

                // Create a Tone.Part for each track
                this.currentMidi.tracks.forEach((track, trackIndex) => {
                    const trackState = this.tracks[trackIndex];

                    // Get the appropriate instrument for this track
                    const instrument = this.getInstrumentForTrack(trackState);

                    // Convert track notes to events
                    const events = track.notes.map(note => ({
                        time: note.time,
                        note: note.name,
                        duration: note.duration,
                        velocity: note.velocity
                    }));

                    // Create Part with callback that checks mute/volume in real-time
                    const part = new Tone.Part((time, event) => {
                        // Check mute status at playback time
                        if (this.tracks[trackIndex].muted) return;

                        // Apply volume at playback time
                        const velocity = event.velocity * this.tracks[trackIndex].volume;

                        instrument.triggerAttackRelease(
                            event.note,
                            event.duration,
                            time,
                            velocity
                        );
                    }, events);

                    part.start(0);
                    this.parts.push(part);
                });

                console.log(`✓ Created ${this.parts.length} parts with notes`);
            }

            // Start Transport
            Tone.Transport.start();

            // Start highlighting loop
            this.startHighlightingLoop();

            // UI updates
            document.getElementById('play-btn').disabled = true;
            document.getElementById('pause-btn').disabled = false;
            document.getElementById('stop-btn').disabled = false;

            console.log('▶ Playing...');

        } catch (error) {
            console.error('❌ Play failed:', error);
            alert(`Playback failed: ${error.message}`);
            this.isPlaying = false;
        }
    }

    startHighlightingLoop() {
        let lastLogTime = 0;

        const loop = () => {
            if (!this.isPlaying) return;

            // Use Transport time for accurate sync with MIDI playback
            const currentTime = Tone.Transport.seconds;
            const currentBeats = this.beatsToSeconds ? currentTime / this.beatsToSeconds : currentTime;

            // Debug logging every second
            if (currentTime - lastLogTime >= 1.0) {
                console.log(`▶ Time: ${currentTime.toFixed(2)}s (${currentBeats.toFixed(1)} beats) / ${this.currentMidi.duration.toFixed(2)}s`);
                lastLogTime = currentTime;
            }

            // Update note highlighting - this highlights notes as they play
            this.updateCursorPosition(currentTime);

            // Auto-advance pages based on what's actually being played
            if (this.totalPages > 1) {
                // Find which page the current note should be on
                const neededPage = this.getPageForTime(currentTime);

                if (neededPage && neededPage !== this.currentPage && neededPage <= this.totalPages) {
                    console.log(`Auto-advance: page ${this.currentPage} → ${neededPage} at ${currentTime.toFixed(2)}s`);
                    this.currentPage = neededPage;
                    this.renderCurrentPage();
                }
            }

            this.animationFrame = requestAnimationFrame(loop);
        };

        loop();
    }

    getPageForTime(currentTime) {
        if (!this.currentMidi || this.totalPages <= 1) return 1;

        // Convert time to beats
        let currentBeats = this.beatsToSeconds ? currentTime / this.beatsToSeconds : currentTime;

        // Handle repeats: cycle through score
        if (this.hasRepeats && this.timemap.length > 0) {
            const qstamps = this.timemap
                .filter(e => e.qstamp)
                .map(e => parseFloat(e.qstamp));
            const maxBeat = Math.max(...qstamps);
            currentBeats = currentBeats % maxBeat;
        }

        // Calculate which page based on beat position
        const qstamps = this.timemap
            .filter(e => e.qstamp)
            .map(e => parseFloat(e.qstamp));
        const maxBeat = Math.max(...qstamps);

        const progress = currentBeats / maxBeat;
        const estimatedPage = Math.floor(progress * this.totalPages) + 1;

        return Math.min(this.totalPages, Math.max(1, estimatedPage));
    }

    updateCursorPosition(currentTime) {
        const scoreDisplay = document.getElementById('score-display');
        const svg = scoreDisplay?.querySelector('svg');

        if (!svg) {
            console.warn('No SVG found');
            return;
        }

        if (!this.timemap.length) {
            console.warn('Timemap is empty');
            return;
        }

        // Clear previous highlights
        this.clearHighlights();

        // Convert current playback time (seconds) to beats
        let currentBeats = this.beatsToSeconds ? currentTime / this.beatsToSeconds : currentTime;

        // Handle repeats: map MIDI time back to score position using modulo
        if (this.hasRepeats && this.timemap.length > 0) {
            const qstamps = this.timemap
                .filter(e => e.qstamp)
                .map(e => parseFloat(e.qstamp));
            const maxBeat = Math.max(...qstamps);

            // Cycle through the score for repeats
            currentBeats = currentBeats % maxBeat;
        }

        // Find ALL notes that should be highlighted right now (within a small window)
        const highlightWindow = 0.5; // 0.5 beats window
        let highlightedCount = 0;
        let candidatesChecked = 0;
        let elementsNotFound = [];

        this.timemap.forEach(entry => {
            if (!entry.qstamp || !entry.on) return;

            const entryBeat = parseFloat(entry.qstamp);
            const entryDuration = parseFloat(entry.dur || 0.5);

            // Check if this note is currently playing
            if (entryBeat <= currentBeats && currentBeats < entryBeat + entryDuration + highlightWindow) {
                candidatesChecked++;

                // entry.on can be a string or an array of element IDs
                const elementIds = Array.isArray(entry.on) ? entry.on : [entry.on];

                elementIds.forEach(elementId => {
                    // Try different selector formats
                    let element = svg.querySelector(`[*|id="${elementId}"]`);
                    if (!element) {
                        element = svg.querySelector(`[id="${elementId}"]`);
                    }
                    if (!element) {
                        element = svg.querySelector(`#${elementId}`);
                    }

                    if (element) {
                        element.classList.add('highlighted');
                        this.highlightedElements.push(element);
                        highlightedCount++;
                    } else {
                        elementsNotFound.push(elementId);
                    }
                });
            }
        });

        // Debug logging
        if (candidatesChecked > 0 || currentTime - (this._lastHighlightLog || 0) >= 3.0) {
            if (highlightedCount > 0) {
                console.log(`✓ Highlighting ${highlightedCount}/${candidatesChecked} elements at beat ${currentBeats.toFixed(2)} (time ${currentTime.toFixed(2)}s)`);
            } else if (candidatesChecked > 0) {
                console.warn(`⚠ Found ${candidatesChecked} candidates but highlighted 0. Not found:`, elementsNotFound.slice(0, 3));
                // Try to find any element with class 'note' to see what's in the SVG
                const anyNote = svg.querySelector('.note, g.note, [class*="note"]');
                if (anyNote) {
                    console.log('Sample note element found:', anyNote.outerHTML.substring(0, 200));
                }
            } else {
                console.log(`No candidates at beat ${currentBeats.toFixed(2)} (time ${currentTime.toFixed(2)}s)`);
            }
            this._lastHighlightLog = currentTime;
        }
    }

    clearHighlights() {
        if (this.highlightedElements) {
            this.highlightedElements.forEach(element => {
                if (element && element.classList) {
                    element.classList.remove('highlighted');
                }
            });
        }
        this.highlightedElements = [];
    }

    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.isPaused = true;
        this.pauseTime = Tone.Transport.seconds;

        // Pause Transport
        Tone.Transport.pause();

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        // Stop all currently playing sounds
        this.instruments.piano.releaseAll();
        if (this.instruments.choir) {
            this.instruments.choir.releaseAll();
        }

        // Clear highlights when paused
        this.clearHighlights();

        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;

        console.log('⏸ Paused at:', this.pauseTime);
    }

    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        this.startTime = 0;
        this.pauseTime = 0;

        // Stop and reset Transport
        Tone.Transport.stop();
        Tone.Transport.seconds = 0;

        // Dispose all parts
        this.parts.forEach(part => {
            part.stop();
            part.dispose();
        });
        this.parts = [];

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        // Stop all sounds
        this.instruments.piano.releaseAll();
        if (this.instruments.choir) {
            this.instruments.choir.releaseAll();
        }

        // Clear all highlights
        this.clearHighlights();

        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('stop-btn').disabled = true;

        console.log('⏹ Stopped');
    }

    seekToMeasure(measureId) {
        console.log('Seeking to measure:', measureId);

        // Find the earliest time in timemap for this measure
        let earliestTime = null;
        this.timemap.forEach(entry => {
            if (entry.on && entry.on.includes(measureId)) {
                const time = parseFloat(entry.qstamp || 0);
                if (earliestTime === null || time < earliestTime) {
                    earliestTime = time;
                }
            }
        });

        if (earliestTime !== null) {
            // Stop current playback
            const wasPlaying = this.isPlaying;
            if (wasPlaying) {
                this.stop();
            }

            // Set the start time
            this.pauseTime = earliestTime;

            console.log(`Seek to ${earliestTime.toFixed(2)}s (measure: ${measureId})`);

            // If was playing, restart from new position
            if (wasPlaying) {
                setTimeout(() => this.play(), 100);
            }
        }
    }
}

// UI Helper Functions
function updateStatus(type, text) {
    const status = document.getElementById('status');
    status.className = `status-badge ${type}`;
    status.textContent = text;
}

function updateProgress(text) {
    const progress = document.getElementById('progress');
    if (progress) progress.textContent = text;
}

function updateInfo(filename, title, format) {
    document.getElementById('info-filename').textContent = filename;
    document.getElementById('info-title').textContent = title;
    document.getElementById('info-format').textContent = format;
    document.getElementById('info-panel').classList.add('visible');
}

// Initialize player
const player = new MusePlayPlayer();

window.addEventListener('load', async () => {
    await player.init();
});

// Playback controls
document.getElementById('play-btn').addEventListener('click', () => player.play());
document.getElementById('pause-btn').addEventListener('click', () => player.pause());
document.getElementById('stop-btn').addEventListener('click', () => player.stop());

// Score library
const libraryModal = document.getElementById('library-modal');
const libraryBtn = document.getElementById('library-btn');
const closeLibrary = document.getElementById('close-library');

libraryBtn.addEventListener('click', async () => {
    libraryModal.classList.add('visible');
    await loadScoreLibrary();
});

closeLibrary.addEventListener('click', () => {
    libraryModal.classList.remove('visible');
});

libraryModal.addEventListener('click', (e) => {
    if (e.target === libraryModal) libraryModal.classList.remove('visible');
});

async function loadScoreLibrary() {
    const loadingDiv = document.getElementById('library-loading');
    const scoreList = document.getElementById('score-list');

    loadingDiv.style.display = 'block';
    scoreList.innerHTML = '';

    try {
        const response = await fetch('/api/scores');
        const data = await response.json();

        loadingDiv.style.display = 'none';

        if (data.scores.length === 0) {
            scoreList.innerHTML = '<li style="padding: 20px; text-align: center; color: #999;">No scores found</li>';
            return;
        }

        data.scores.forEach(score => {
            const li = document.createElement('li');
            li.className = 'score-item';
            li.innerHTML = `
                <span>${score.name.replace(/_/g, ' ')}</span>
                <span style="color: #667eea; font-size: 12px;">Click to load</span>
            `;
            li.addEventListener('click', () => {
                player.loadPreconvertedScore(score.musicxml, score.midi, score.name);
                libraryModal.classList.remove('visible');
            });
            scoreList.appendChild(li);
        });

    } catch (error) {
        console.error('Failed to load library:', error);
        loadingDiv.innerHTML = '<div style="color: red;">Failed to load scores</div>';
    }
}
