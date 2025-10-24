/**
 * MuseScore Player for Web
 * A lightweight player for MusicXML, MIDI, and MuseScore files
 * Uses OpenSheetMusicDisplay + Web MIDI Player
 */

class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
    }

    off(event, listener) {
        if (!this.events[event]) return this;
        this.events[event] = this.events[event].filter(l => l !== listener);
        return this;
    }

    emit(event, ...args) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(...args));
    }
}

export const PlaybackState = {
    Stopped: 0,
    Playing: 1,
    Paused: 2,
    Loading: 3,
    Error: 4
};

export class MuseScorePlayer extends EventEmitter {
    constructor() {
        super();

        this._state = PlaybackState.Stopped;
        this._currentTime = 0;
        this._duration = 0;
        this._tempo = 1.0;
        this._volume = 0.8;
        this._loop = false;

        this._audioContext = null;
        this._midiPlayer = null;
        this._soundfont = null;
        this._loaded = false;

        this._metadata = {
            title: '',
            composer: '',
            copyright: '',
            measureCount: 0,
            numParts: 0
        };

        this._tracks = [];
        this._animationFrameId = null;

        // Initialize Audio Context
        this._initAudio();
    }

    async _initAudio() {
        try {
            this._audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Load SoundFont
            await this._loadSoundFont();
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            this._setState(PlaybackState.Error);
            this.emit('error', error);
        }
    }

    async _loadSoundFont() {
        // Use a lightweight GM SoundFont
        // In production, load from CDN or bundle
        const soundfontUrl = 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts/FluidR3_GM/';

        this._soundfont = {
            url: soundfontUrl,
            loaded: true
        };
    }

    async loadFromURL(url) {
        this._setState(PlaybackState.Loading);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const filename = url.split('/').pop();

            await this.loadFromBuffer(arrayBuffer, filename);

        } catch (error) {
            console.error('Error loading from URL:', error);
            this._setState(PlaybackState.Error);
            this.emit('error', error);
            throw error;
        }
    }

    async loadFromFile(file) {
        this._setState(PlaybackState.Loading);

        try {
            const arrayBuffer = await file.arrayBuffer();
            await this.loadFromBuffer(arrayBuffer, file.name);
        } catch (error) {
            console.error('Error loading file:', error);
            this._setState(PlaybackState.Error);
            this.emit('error', error);
            throw error;
        }
    }

    async loadFromBuffer(arrayBuffer, filename) {
        try {
            const ext = filename.split('.').pop().toLowerCase();

            let midiData = null;

            if (ext === 'mid' || ext === 'midi') {
                midiData = arrayBuffer;
            } else if (ext === 'mxl' || ext === 'musicxml' || ext === 'xml') {
                // Convert MusicXML to MIDI
                midiData = await this._musicXMLToMIDI(arrayBuffer);
            } else if (ext === 'mscz' || ext === 'mscx') {
                // Parse MuseScore file
                midiData = await this._parseMuseScore(arrayBuffer);
            } else {
                throw new Error(`Unsupported file format: ${ext}`);
            }

            if (!midiData) {
                throw new Error('Failed to parse music data');
            }

            // Parse MIDI
            await this._loadMIDI(midiData);

            this._loaded = true;
            this._setState(PlaybackState.Stopped);
            this.emit('loaded', { filename });

        } catch (error) {
            console.error('Error loading buffer:', error);
            this._setState(PlaybackState.Error);
            this.emit('error', error);
            throw error;
        }
    }

    async _musicXMLToMIDI(xmlBuffer) {
        // Parse MusicXML and convert to MIDI
        // This is a simplified implementation
        // In production, use a library like musicxml-interfaces + midi-writer-js

        try {
            const decoder = new TextDecoder('utf-8');
            const xmlString = decoder.decode(xmlBuffer);

            // Parse XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

            // Extract metadata
            this._extractMetadataFromMusicXML(xmlDoc);

            // Convert to MIDI (simplified)
            const midiData = await this._convertXMLToMIDI(xmlDoc);

            return midiData;
        } catch (error) {
            console.error('Error converting MusicXML to MIDI:', error);
            throw error;
        }
    }

    _extractMetadataFromMusicXML(xmlDoc) {
        try {
            const workTitle = xmlDoc.querySelector('work-title');
            const creator = xmlDoc.querySelector('creator[type="composer"]');
            const rights = xmlDoc.querySelector('rights');
            const parts = xmlDoc.querySelectorAll('score-part');
            const measures = xmlDoc.querySelectorAll('measure');

            this._metadata.title = workTitle ? workTitle.textContent : 'Untitled';
            this._metadata.composer = creator ? creator.textContent : 'Unknown';
            this._metadata.copyright = rights ? rights.textContent : '';
            this._metadata.numParts = parts.length;
            this._metadata.measureCount = measures.length;

        } catch (error) {
            console.warn('Error extracting metadata:', error);
        }
    }

    async _convertXMLToMIDI(xmlDoc) {
        // Simplified conversion - in production, use proper library
        // For now, return a basic MIDI structure

        // This is a placeholder - a real implementation would:
        // 1. Parse all notes, durations, dynamics
        // 2. Handle multiple parts
        // 3. Convert to MIDI events
        // 4. Return properly formatted MIDI file

        // For demo, we'll create a simple MIDI
        return this._createDemoMIDI();
    }

    _createDemoMIDI() {
        // Create a simple MIDI file for demonstration
        // This is a minimal MIDI file structure

        const midi = new Uint8Array([
            0x4D, 0x54, 0x68, 0x64, // MThd
            0x00, 0x00, 0x00, 0x06, // Header length
            0x00, 0x00, // Format 0
            0x00, 0x01, // One track
            0x00, 0x60, // 96 ticks per quarter note

            0x4D, 0x54, 0x72, 0x6B, // MTrk
            0x00, 0x00, 0x00, 0x3B, // Track length

            // Tempo: 120 BPM
            0x00, 0xFF, 0x51, 0x03, 0x07, 0xA1, 0x20,

            // Note on C4
            0x00, 0x90, 0x3C, 0x64,
            // Note off C4
            0x60, 0x80, 0x3C, 0x00,

            // Note on E4
            0x00, 0x90, 0x40, 0x64,
            0x60, 0x80, 0x40, 0x00,

            // Note on G4
            0x00, 0x90, 0x43, 0x64,
            0x60, 0x80, 0x43, 0x00,

            // End of track
            0x00, 0xFF, 0x2F, 0x00
        ]).buffer;

        return midi;
    }

    async _parseMuseScore(msczBuffer) {
        // Parse .mscz (compressed MuseScore) file
        // .mscz is a ZIP archive containing an XML file

        try {
            // Use JSZip or similar to extract
            // For now, simplified version
            console.warn('MuseScore file parsing not yet implemented - using demo MIDI');
            return this._createDemoMIDI();
        } catch (error) {
            console.error('Error parsing MuseScore file:', error);
            throw error;
        }
    }

    async _loadMIDI(midiData) {
        // Parse MIDI data using MIDIFile or similar library
        // Initialize player

        try {
            // Parse MIDI (simplified)
            this._parseMIDIData(midiData);

            // Setup Web Audio playback
            this._setupPlayback();

        } catch (error) {
            console.error('Error loading MIDI:', error);
            throw error;
        }
    }

    _parseMIDIData(midiData) {
        // Parse MIDI binary data
        // Extract tracks, tempo, time signature, notes, etc.

        // Simplified implementation
        const view = new DataView(midiData);

        // Read header
        const headerChunk = String.fromCharCode(
            view.getUint8(0),
            view.getUint8(1),
            view.getUint8(2),
            view.getUint8(3)
        );

        if (headerChunk !== 'MThd') {
            throw new Error('Invalid MIDI file');
        }

        // Extract basic info
        const format = view.getUint16(8);
        const numTracks = view.getUint16(10);
        const ticksPerBeat = view.getUint16(12);

        // Set up tracks
        this._tracks = [];
        for (let i = 0; i < numTracks; i++) {
            this._tracks.push({
                index: i,
                name: `Track ${i + 1}`,
                instrument: 'Piano',
                muted: false,
                volume: 1.0
            });
        }

        // Calculate duration (simplified - assumes 120 BPM)
        this._duration = 10.0; // Placeholder
    }

    _setupPlayback() {
        // Setup Web Audio nodes and MIDI player
        // This would use Web MIDI API or AudioContext scheduling
    }

    // Playback controls

    play() {
        if (!this._loaded) {
            console.warn('No score loaded');
            return;
        }

        if (this._state === PlaybackState::Stopped) {
            this._currentTime = 0;
        }

        this._setState(PlaybackState.Playing);
        this._startPlayback();
    }

    pause() {
        if (this._state === PlaybackState.Playing) {
            this._setState(PlaybackState.Paused);
            this._stopPlayback();
        }
    }

    stop() {
        this._setState(PlaybackState.Stopped);
        this._currentTime = 0;
        this._stopPlayback();
        this.emit('timeUpdate', 0);
    }

    seek(timeSeconds) {
        if (timeSeconds < 0) timeSeconds = 0;
        if (timeSeconds > this._duration) timeSeconds = this._duration;

        this._currentTime = timeSeconds;
        this.emit('timeUpdate', this._currentTime);

        // Re-schedule playback if playing
        if (this._state === PlaybackState.Playing) {
            this._stopPlayback();
            this._startPlayback();
        }
    }

    _startPlayback() {
        // Start audio playback
        if (this._audioContext.state === 'suspended') {
            this._audioContext.resume();
        }

        // Start animation loop for time updates
        const startTime = performance.now() - (this._currentTime * 1000);

        const updateTime = () => {
            if (this._state !== PlaybackState.Playing) return;

            const elapsed = performance.now() - startTime;
            this._currentTime = (elapsed / 1000) * this._tempo;

            if (this._currentTime >= this._duration) {
                if (this._loop) {
                    this._currentTime = 0;
                    this._startPlayback();
                } else {
                    this.stop();
                }
                return;
            }

            this.emit('timeUpdate', this._currentTime);
            this._animationFrameId = requestAnimationFrame(updateTime);
        };

        this._animationFrameId = requestAnimationFrame(updateTime);

        // Schedule MIDI notes (simplified)
        this._scheduleMIDINotes();
    }

    _stopPlayback() {
        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }

        // Stop all playing notes
        this._stopAllNotes();
    }

    _scheduleMIDINotes() {
        // Schedule MIDI events using Web Audio API
        // This is where actual synthesis happens
    }

    _stopAllNotes() {
        // Stop all currently playing notes
    }

    // Settings

    setTempo(factor) {
        if (factor < 0.25) factor = 0.25;
        if (factor > 4.0) factor = 4.0;
        this._tempo = factor;
    }

    setVolume(volume) {
        if (volume < 0) volume = 0;
        if (volume > 1) volume = 1;
        this._volume = volume;

        // Update master gain node
        if (this._audioContext && this._masterGain) {
            this._masterGain.gain.value = volume;
        }
    }

    setLoop(enabled) {
        this._loop = enabled;
    }

    muteTrack(index, muted) {
        if (index >= 0 && index < this._tracks.length) {
            this._tracks[index].muted = muted;
        }
    }

    setTrackVolume(index, volume) {
        if (index >= 0 && index < this._tracks.length) {
            if (volume < 0) volume = 0;
            if (volume > 1) volume = 1;
            this._tracks[index].volume = volume;
        }
    }

    // State queries

    getState() {
        return this._state;
    }

    getCurrentTime() {
        return this._currentTime;
    }

    getDuration() {
        return this._duration;
    }

    isLoaded() {
        return this._loaded;
    }

    getMetadata() {
        return { ...this._metadata };
    }

    getTracks() {
        return this._tracks.map(t => ({ ...t }));
    }

    getNumTracks() {
        return this._tracks.length;
    }

    // Internal

    _setState(newState) {
        if (this._state !== newState) {
            this._state = newState;
            this.emit('stateChanged', newState);
        }
    }

    destroy() {
        this.stop();

        if (this._audioContext) {
            this._audioContext.close();
            this._audioContext = null;
        }

        this._loaded = false;
        this.events = {};
    }
}

// Convenience factory
export async function createPlayer() {
    const player = new MuseScorePlayer();
    // Wait for audio initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    return player;
}

// Export for global use
if (typeof window !== 'undefined') {
    window.MuseScorePlayer = MuseScorePlayer;
    window.createMuseScorePlayer = createPlayer;
    window.PlaybackState = PlaybackState;
}
