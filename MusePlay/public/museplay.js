/**
 * MusePlay - Hybrid .mscz Player
 * Combines MuseScore CLI conversion with Verovio rendering
 */

class MusePlayPlayer {
    constructor() {
        this.verovio = null;
        this.currentMidi = null;
        this.synth = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.currentEvents = [];
        this.highlightedElements = [];
    }

    async init() {
        console.log('🎵 Initializing MusePlay...');
        updateStatus('loading', 'Loading Verovio...');

        try {
            // Wait for Verovio to load
            await this.waitForVerovio();

            // Initialize Verovio toolkit
            this.verovio = new verovio.toolkit();
            console.log('✓ Verovio loaded:', this.verovio.getVersion());

            // Set rendering options
            this.verovio.setOptions({
                scale: 40,
                adjustPageHeight: true,
                pageHeight: 2000,
                pageWidth: 2100,
                noLayout: false,
                font: 'Leipzig'
            });

            updateStatus('ready', 'Ready');
            return true;

        } catch (error) {
            console.error('Failed to initialize:', error);
            updateStatus('error', 'Initialization failed');
            return false;
        }
    }

    async waitForVerovio() {
        // Wait for Verovio to be available
        let attempts = 0;
        while (typeof verovio === 'undefined' && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (typeof verovio === 'undefined') {
            throw new Error('Verovio failed to load');
        }
    }

    async loadFile(file) {
        console.log(`Loading ${file.name}...`);
        updateProgress(`Loading ${file.name}...`);

        const filename = file.name.toLowerCase();

        if (filename.endsWith('.mscz')) {
            return await this.loadMscz(file);
        } else if (filename.endsWith('.musicxml') || filename.endsWith('.xml') || filename.endsWith('.mxl')) {
            return await this.loadMusicXML(file);
        } else {
            throw new Error('Unsupported file format');
        }
    }

    async loadMscz(file) {
        updateProgress('Converting .mscz file...');
        updateStatus('loading', 'Converting...');

        // Upload to server for conversion
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/convert-mscz', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Conversion failed: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Conversion result:', result);

            // Fetch the converted MusicXML
            updateProgress('Loading MusicXML...');
            const musicxmlResponse = await fetch(result.musicxml_url);
            const musicxmlText = await musicxmlResponse.text();

            // Fetch the MIDI
            updateProgress('Loading MIDI...');
            const midiResponse = await fetch(result.midi_url);
            const midiBlob = await midiResponse.blob();
            const midiArrayBuffer = await midiBlob.arrayBuffer();

            // Render and setup
            await this.renderMusicXML(musicxmlText);
            await this.setupMidi(midiArrayBuffer);

            updateInfo(file.name, result.title || 'Unknown', '.mscz → MusicXML');
            updateStatus('ready', 'Ready');

            return true;

        } catch (error) {
            console.error('Failed to load .mscz:', error);
            updateStatus('error', 'Conversion failed');
            throw error;
        }
    }

    async loadMusicXML(file) {
        updateProgress('Reading MusicXML...');
        updateStatus('loading', 'Loading...');

        try {
            const text = await file.text();
            await this.renderMusicXML(text);

            // For MusicXML files, we need to generate MIDI from Verovio
            updateProgress('Generating MIDI...');
            const midiBase64 = this.verovio.renderToMIDI();
            const midiArrayBuffer = this.base64ToArrayBuffer(midiBase64);
            await this.setupMidi(midiArrayBuffer);

            updateInfo(file.name, 'Unknown', 'MusicXML');
            updateStatus('ready', 'Ready');

            return true;

        } catch (error) {
            console.error('Failed to load MusicXML:', error);
            updateStatus('error', 'Load failed');
            throw error;
        }
    }

    async renderMusicXML(musicxmlText) {
        updateProgress('Rendering score...');

        // Load the MusicXML into Verovio
        const success = this.verovio.loadData(musicxmlText);
        if (!success) {
            throw new Error('Failed to load MusicXML into Verovio');
        }

        // Render to SVG
        const svg = this.verovio.renderToSVG(1);

        // Display
        const scoreDisplay = document.getElementById('score-display');
        scoreDisplay.innerHTML = svg;

        console.log('✓ Score rendered');
    }

    async setupMidi(midiArrayBuffer) {
        // Parse MIDI with Tone.js
        this.currentMidi = new Midi(midiArrayBuffer);
        console.log('✓ MIDI parsed:', this.currentMidi);

        // Initialize Tone.js synth if needed
        if (!this.synth) {
            await this.initSynth();
        }

        // Build event list for synchronization
        this.buildEventList();

        // Enable playback controls
        document.getElementById('play-btn').disabled = false;
    }

    async initSynth() {
        // Initialize Tone.js synthesizer
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.3,
                release: 1
            }
        }).toDestination();

        console.log('✓ Synthesizer initialized');
    }

    buildEventList() {
        // Build list of all MIDI events with timing for synchronization
        this.currentEvents = [];

        this.currentMidi.tracks.forEach((track, trackIndex) => {
            track.notes.forEach(note => {
                this.currentEvents.push({
                    time: note.time,
                    duration: note.duration,
                    midi: note.midi,
                    name: note.name,
                    velocity: note.velocity,
                    trackIndex: trackIndex
                });
            });
        });

        // Sort by time
        this.currentEvents.sort((a, b) => a.time - b.time);
        console.log(`✓ Built event list: ${this.currentEvents.length} notes`);
    }

    async play() {
        if (!this.currentMidi || this.isPlaying) return;

        // Start Tone.js audio context
        await Tone.start();

        this.isPlaying = true;
        this.startTime = Tone.now();

        if (this.pauseTime > 0) {
            // Resume from pause
            this.startTime -= this.pauseTime;
        }

        // Schedule all notes
        this.currentMidi.tracks.forEach(track => {
            track.notes.forEach(note => {
                this.synth.triggerAttackRelease(
                    note.name,
                    note.duration,
                    this.startTime + note.time,
                    note.velocity
                );
            });
        });

        // Start synchronization loop
        this.syncLoop();

        // UI updates
        document.getElementById('play-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;
        document.getElementById('stop-btn').disabled = false;

        console.log('▶ Playing...');
    }

    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.pauseTime = Tone.now() - this.startTime;

        // Stop all notes
        this.synth.releaseAll();

        // UI updates
        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;

        console.log('⏸ Paused');
    }

    stop() {
        this.isPlaying = false;
        this.pauseTime = 0;
        this.startTime = 0;

        // Stop all notes
        if (this.synth) {
            this.synth.releaseAll();
        }

        // Clear highlighting
        this.clearHighlights();

        // UI updates
        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('stop-btn').disabled = true;

        console.log('⏹ Stopped');
    }

    syncLoop() {
        if (!this.isPlaying) return;

        const currentTime = Tone.now() - this.startTime;

        // Find notes to highlight at current time
        const activeNotes = this.currentEvents.filter(event =>
            currentTime >= event.time && currentTime < event.time + event.duration
        );

        // Update highlighting
        this.updateHighlights(activeNotes);

        // Continue loop
        requestAnimationFrame(() => this.syncLoop());
    }

    updateHighlights(activeNotes) {
        // Clear previous highlights
        this.clearHighlights();

        // Highlight active notes
        activeNotes.forEach(note => {
            // In a full implementation, we'd map MIDI notes to Verovio element IDs
            // For now, this is a placeholder
            // TODO: Build proper timemap from MusicXML
        });
    }

    clearHighlights() {
        this.highlightedElements.forEach(element => {
            element.classList.remove('highlighted');
        });
        this.highlightedElements = [];
    }

    base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
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
    progress.textContent = text;
}

function updateInfo(filename, title, format) {
    document.getElementById('info-filename').textContent = filename;
    document.getElementById('info-title').textContent = title;
    document.getElementById('info-format').textContent = format;
    document.getElementById('info-panel').classList.add('visible');
}

// Initialize player
const player = new MusePlayPlayer();

// Wait for page load
window.addEventListener('load', async () => {
    await player.init();
});

// File input handler
document.getElementById('file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        await player.loadFile(file);
    } catch (error) {
        console.error('Error loading file:', error);
        alert(`Error loading file: ${error.message}`);
        updateStatus('error', 'Load failed');
    }
});

// Playback controls
document.getElementById('play-btn').addEventListener('click', () => {
    player.play();
});

document.getElementById('pause-btn').addEventListener('click', () => {
    player.pause();
});

document.getElementById('stop-btn').addEventListener('click', () => {
    player.stop();
});

// Score library functionality
const libraryModal = document.getElementById('library-modal');
const libraryBtn = document.getElementById('library-btn');
const closeLibrary = document.getElementById('close-library');
const scoreList = document.getElementById('score-list');

libraryBtn.addEventListener('click', async () => {
    libraryModal.classList.add('visible');
    await loadScoreLibrary();
});

closeLibrary.addEventListener('click', () => {
    libraryModal.classList.remove('visible');
});

// Close modal on background click
libraryModal.addEventListener('click', (e) => {
    if (e.target === libraryModal) {
        libraryModal.classList.remove('visible');
    }
});

async function loadScoreLibrary() {
    const loadingDiv = document.getElementById('library-loading');
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
                loadPreconvertedScore(score);
                libraryModal.classList.remove('visible');
            });
            scoreList.appendChild(li);
        });

    } catch (error) {
        console.error('Failed to load library:', error);
        loadingDiv.innerHTML = '<div style="color: red;">Failed to load scores</div>';
    }
}

async function loadPreconvertedScore(score) {
    console.log('Loading pre-converted score:', score);
    updateProgress(`Loading ${score.name}...`);
    updateStatus('loading', 'Loading...');

    try {
        // Fetch MusicXML
        const musicxmlResponse = await fetch(score.musicxml);
        const musicxmlText = await musicxmlResponse.text();

        // Render score
        await player.renderMusicXML(musicxmlText);

        // Fetch MIDI
        const midiResponse = await fetch(score.midi);
        const midiBlob = await midiResponse.blob();
        const midiArrayBuffer = await midiBlob.arrayBuffer();

        // Setup playback
        await player.setupMidi(midiArrayBuffer);

        updateInfo(score.name, score.name, 'Pre-converted MusicXML');
        updateStatus('ready', 'Ready');

    } catch (error) {
        console.error('Failed to load score:', error);
        updateStatus('error', 'Load failed');
        alert(`Error loading score: ${error.message}`);
    }
}
