/**
 * MusePlay - JavaScript Player Interface
 * Wraps the WebAssembly MuseScore module with a friendly API
 */

class MusePlayPlayer {
    constructor() {
        this.module = null;
        this.score = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
    }

    /**
     * Initialize the WebAssembly module
     */
    async initialize() {
        console.log('🎵 Initializing MusePlay...');

        try {
            // Load the WebAssembly module
            this.module = await MusePlayModule();
            console.log('✓ MuseScore WASM loaded:', this.module.getVersion());
            return true;
        } catch (error) {
            console.error('Failed to load MuseScore WASM:', error);
            return false;
        }
    }

    /**
     * Load a score from a File object
     */
    async loadFile(file) {
        console.log(`Loading ${file.name}...`);

        // Check if format is supported
        if (!this.module.isSupportedFormat(file.name)) {
            throw new Error(`Unsupported file format: ${file.name}`);
        }

        // Read file data
        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        // Convert to string for C++ (Emscripten will handle the conversion)
        const dataStr = String.fromCharCode.apply(null, data);

        // Create MuseScore instance and load
        this.score = new this.module.MuseScore();
        const success = this.score.loadFromData(dataStr, file.name);

        if (!success) {
            throw new Error('Failed to load score');
        }

        console.log('✓ Score loaded');
        return this.getMetadata();
    }

    /**
     * Get score metadata
     */
    getMetadata() {
        if (!this.score) return null;

        const metadata = this.score.getMetadata();
        return {
            title: metadata.title || 'Untitled',
            composer: metadata.composer || 'Unknown',
            copyright: metadata.copyright || '',
            measureCount: this.score.getMeasureCount(),
            partCount: this.score.getPartCount()
        };
    }

    /**
     * Render a page of the score to SVG
     */
    renderPage(pageNumber = 1) {
        if (!this.score) return null;
        return this.score.renderPageSVG(pageNumber);
    }

    /**
     * Export score as MIDI data
     */
    exportMIDI() {
        if (!this.score) return null;
        return this.score.exportMIDI();
    }

    /**
     * Get timing map for synchronization
     */
    getTimeMap() {
        if (!this.score) return null;
        return this.score.getTimeMap();
    }

    /**
     * Play the score
     */
    async play() {
        if (!this.score || this.isPlaying) return;

        const midiData = this.exportMIDI();
        if (!midiData) {
            throw new Error('No MIDI data available');
        }

        // TODO: Integrate with Web Audio API for playback
        console.log('Playing MIDI data...');
        this.isPlaying = true;
    }

    /**
     * Pause playback
     */
    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        console.log('Paused');
    }

    /**
     * Stop playback
     */
    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        console.log('Stopped');
    }

    /**
     * Seek to a specific time
     */
    seek(timeSeconds) {
        this.currentTime = timeSeconds;
    }

    /**
     * Get current playback time
     */
    getCurrentTime() {
        return this.currentTime;
    }

    /**
     * Check if a score is loaded
     */
    isLoaded() {
        return this.score !== null;
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusePlayPlayer;
}
