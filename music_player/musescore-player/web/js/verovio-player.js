/**
 * Verovio-based MuseScore Player
 * Renders .mscz files using Verovio and plays with MIDI + SoundFont
 */

export class VerovioPlayer {
    constructor() {
        this.vrvToolkit = null;
        this.currentMusicXML = null;
        this.currentMIDI = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.timemap = null;
        this.svgPages = [];
        this.currentPage = 0;

        // Audio
        this.audioContext = null;
        this.midiPlayer = null;
        this.scheduler = null;

        // Callbacks
        this.onTimeUpdate = null;
        this.onStateChange = null;
        this.onLoaded = null;
    }

    async init() {
        console.log('Initializing Verovio Player...');

        // Initialize Verovio
        if (typeof verovio !== 'undefined') {
            this.vrvToolkit = new verovio.toolkit();
            await this.vrvToolkit.load();

            // Set options for rendering
            this.vrvToolkit.setOptions({
                scale: 40,
                adjustPageHeight: true,
                breaks: 'auto',
                footer: 'none',
                header: 'none'
            });

            console.log('Verovio initialized');
        } else {
            throw new Error('Verovio not loaded');
        }

        // Initialize audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        console.log('Verovio Player initialized');
    }

    /**
     * Load a .mscz file
     */
    async loadMSCZ(url) {
        console.log('Loading .mscz file:', url);

        try {
            // Fetch the .mscz file
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();

            // Unzip the .mscz file
            const zip = await JSZip.loadAsync(arrayBuffer);

            // Find the main .mscx file (uncompressed MusicXML)
            const mscxFiles = Object.keys(zip.files).filter(name =>
                name.endsWith('.mscx') && !name.includes('Excerpts/')
            );

            if (mscxFiles.length === 0) {
                throw new Error('No .mscx file found in .mscz archive');
            }

            // Extract the MusicXML
            this.currentMusicXML = await zip.files[mscxFiles[0]].async('string');

            console.log('Extracted MusicXML from .mscz');

            // Load into Verovio
            await this.loadMusicXML(this.currentMusicXML);

        } catch (error) {
            console.error('Error loading .mscz file:', error);
            throw error;
        }
    }

    /**
     * Load MusicXML into Verovio
     */
    async loadMusicXML(musicxml) {
        this.currentMusicXML = musicxml;

        // Load into Verovio
        const loaded = this.vrvToolkit.loadData(musicxml);

        if (!loaded) {
            throw new Error('Failed to load MusicXML into Verovio');
        }

        // Get MIDI from Verovio
        this.currentMIDI = this.vrvToolkit.renderToMIDI();

        // Get timing information
        this.timemap = this.vrvToolkit.renderToTimemap();

        // Calculate duration from timemap
        if (this.timemap && this.timemap.length > 0) {
            const lastEvent = this.timemap[this.timemap.length - 1];
            this.duration = lastEvent.qstamp / 1000; // Convert to seconds
        }

        console.log('MusicXML loaded, duration:', this.duration);

        // Render SVG
        this.renderSVG();

        // Trigger loaded callback
        if (this.onLoaded) {
            this.onLoaded({
                title: 'Score',
                duration: this.duration,
                measures: this.vrvToolkit.getPageCount()
            });
        }
    }

    /**
     * Render the score as SVG
     */
    renderSVG() {
        const pageCount = this.vrvToolkit.getPageCount();
        this.svgPages = [];

        for (let i = 1; i <= pageCount; i++) {
            const svg = this.vrvToolkit.renderToSVG(i);
            this.svgPages.push(svg);
        }

        console.log(`Rendered ${pageCount} pages`);
    }

    /**
     * Get all SVG pages
     */
    getSVGPages() {
        return this.svgPages;
    }

    /**
     * Get combined SVG for all pages
     */
    getCombinedSVG() {
        return this.svgPages.join('\n');
    }

    /**
     * Play the score
     */
    async play() {
        if (this.isPlaying) return;

        console.log('Starting playback...');

        this.isPlaying = true;

        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        // Initialize MIDI playback using Web MIDI Player
        await this.startMIDIPlayback();

        if (this.onStateChange) {
            this.onStateChange('playing');
        }
    }

    /**
     * Pause playback
     */
    pause() {
        if (!this.isPlaying) return;

        console.log('Pausing playback...');

        this.isPlaying = false;

        if (this.scheduler) {
            clearInterval(this.scheduler);
            this.scheduler = null;
        }

        if (this.onStateChange) {
            this.onStateChange('paused');
        }
    }

    /**
     * Stop playback
     */
    stop() {
        this.pause();
        this.currentTime = 0;

        if (this.onTimeUpdate) {
            this.onTimeUpdate(0);
        }

        if (this.onStateChange) {
            this.onStateChange('stopped');
        }
    }

    /**
     * Start MIDI playback (simplified version)
     */
    async startMIDIPlayback() {
        // For now, use a simple timer-based system
        // In production, you'd integrate with a proper MIDI player using SoundFont

        const startTime = this.audioContext.currentTime;

        this.scheduler = setInterval(() => {
            if (!this.isPlaying) return;

            this.currentTime = (this.audioContext.currentTime - startTime);

            if (this.currentTime >= this.duration) {
                this.stop();
                return;
            }

            // Highlight notes at current time
            this.highlightNotesAtTime(this.currentTime);

            if (this.onTimeUpdate) {
                this.onTimeUpdate(this.currentTime);
            }
        }, 50); // Update every 50ms
    }

    /**
     * Highlight notes at the current playback time
     */
    highlightNotesAtTime(time) {
        if (!this.timemap) return;

        // Convert time to milliseconds
        const timeMs = time * 1000;

        // Find elements to highlight
        const elementsToHighlight = this.timemap.filter(item => {
            const itemTime = item.qstamp;
            return itemTime >= timeMs - 50 && itemTime <= timeMs + 50;
        });

        // Clear previous highlights
        document.querySelectorAll('.currentNote').forEach(el => {
            el.classList.remove('currentNote');
        });

        // Highlight current notes
        elementsToHighlight.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                element.classList.add('currentNote');
            }
        });
    }

    /**
     * Seek to a specific time
     */
    seek(time) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));

        if (this.onTimeUpdate) {
            this.onTimeUpdate(this.currentTime);
        }
    }

    /**
     * Get current playback state
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentTime: this.currentTime,
            duration: this.duration
        };
    }
}
