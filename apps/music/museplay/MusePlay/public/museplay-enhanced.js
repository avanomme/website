/**
 * MusePlay Enhanced - Full-Featured .mscz Player
 * With multi-page nav, part controls, highlighting, and working MIDI
 */

class MusePlayPlayer {
    constructor() {
        this.verovio = null;
        this.currentMidi = null;
        this.player = null;
        this.isPlaying = false;
        this.currentPage = 1;
        this.totalPages = 1;
        this.timemap = [];
        this.tracks = [];
        this.trackMutes = {};
        this.trackVolumes = {};
        this.masterVolume = 1.0;  // Start at 100%
        this.volumeBoost = 1.25;   // 25% louder to compensate for quiet MIDI
        this.playbackRate = 1.0;   // Normal speed
    }

    async init() {
        console.log('🎵 Initializing MusePlay Enhanced...');
        updateStatus('loading', 'Loading Verovio...');

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

            // Initialize Tone.js player with boosted volume
            this.player = new Tone.Players().toDestination();
            this.player.volume.value = Tone.gainToDb(this.masterVolume * this.volumeBoost);

            updateStatus('ready', 'Ready');
            return true;

        } catch (error) {
            console.error('Failed to initialize:', error);
            updateStatus('error', 'Initialization failed');
            return false;
        }
    }

    async waitForVerovio() {
        let attempts = 0;
        while (typeof verovio === 'undefined' && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (typeof verovio === 'undefined') {
            throw new Error('Verovio failed to load');
        }
    }

    async waitForTone() {
        let attempts = 0;
        while (typeof Tone === 'undefined' && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (typeof Tone === 'undefined') {
            throw new Error('Tone.js failed to load');
        }
    }

    async loadPreconvertedScore(musicxmlUrl, midiUrl, name) {
        console.log('Loading score:', name);
        console.log('MusicXML URL:', musicxmlUrl);
        console.log('MIDI URL:', midiUrl);
        updateProgress(`Loading ${name}...`);
        updateStatus('loading', 'Loading...');

        try {
            // Fetch MusicXML
            updateProgress('Fetching MusicXML...');
            const musicxmlResponse = await fetch(musicxmlUrl);
            if (!musicxmlResponse.ok) {
                throw new Error(`Failed to fetch MusicXML: ${musicxmlResponse.status}`);
            }
            const musicxmlText = await musicxmlResponse.text();
            console.log('✓ MusicXML fetched, size:', musicxmlText.length);

            // Render score
            updateProgress('Rendering score...');
            await this.renderMusicXML(musicxmlText);
            console.log('✓ Score rendered');

            // Fetch and setup MIDI
            updateProgress('Fetching MIDI...');
            const midiResponse = await fetch(midiUrl);
            if (!midiResponse.ok) {
                throw new Error(`Failed to fetch MIDI: ${midiResponse.status}`);
            }
            const midiBlob = await midiResponse.blob();
            const midiArrayBuffer = await midiBlob.arrayBuffer();
            console.log('✓ MIDI fetched, size:', midiArrayBuffer.byteLength);

            updateProgress('Setting up MIDI...');
            await this.setupMidi(midiArrayBuffer);
            console.log('✓ MIDI setup complete');

            // Build timemap from Verovio
            updateProgress('Building timemap...');
            this.buildTimemap();
            console.log('✓ Timemap built');

            // Setup UI
            updateProgress('Setting up controls...');
            this.setupPageNavigation();
            this.setupPartControls();
            console.log('✓ UI setup complete');

            updateInfo(name, name, 'MusicXML + MIDI');
            updateStatus('ready', 'Ready');
            updateProgress('');

        } catch (error) {
            console.error('❌ Failed to load score:', error);
            console.error('Error stack:', error.stack);
            updateStatus('error', 'Load failed');
            updateProgress(`Error: ${error.message}`);
            alert(`Failed to load score:\n${error.message}\n\nCheck browser console for details.`);
        }
    }

    async renderMusicXML(musicxmlText) {
        updateProgress('Rendering score...');

        const success = this.verovio.loadData(musicxmlText);
        if (!success) {
            throw new Error('Failed to load MusicXML');
        }

        this.totalPages = this.verovio.getPageCount();
        this.currentPage = 1;

        this.renderCurrentPage();
        console.log(`✓ Score rendered (${this.totalPages} pages)`);
    }

    renderCurrentPage() {
        const svg = this.verovio.renderToSVG(this.currentPage);
        document.getElementById('score-display').innerHTML = svg;

        // Add click handlers for measure seeking
        this.addMeasureClickHandlers();

        // Update page indicator (only if it exists)
        const pageInfo = document.getElementById('page-info');
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} / ${this.totalPages}`;
        }

        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === this.totalPages;
    }

    addMeasureClickHandlers() {
        const measures = document.querySelectorAll('svg .measure');
        measures.forEach(measure => {
            measure.style.cursor = 'pointer';
            measure.addEventListener('click', (e) => {
                const measureId = measure.getAttribute('id');
                this.seekToMeasure(measureId);
            });
        });
    }

    async setupMidi(midiArrayBuffer) {
        this.currentMidi = new Midi(midiArrayBuffer);
        console.log('✓ MIDI parsed:', this.currentMidi);
        console.log('Tracks:', this.currentMidi.tracks.length);

        // Initialize track states
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
        // Get timemap from Verovio (maps note IDs to time)
        try {
            const timemapData = this.verovio.renderToTimemap();
            console.log('Timemap data type:', typeof timemapData);
            console.log('Timemap data:', timemapData);

            // renderToTimemap might return string or object depending on Verovio version
            if (typeof timemapData === 'string') {
                this.timemap = JSON.parse(timemapData);
            } else if (typeof timemapData === 'object') {
                this.timemap = timemapData;
            } else {
                this.timemap = [];
            }
            console.log('✓ Timemap built:', this.timemap.length, 'entries');
        } catch (e) {
            console.error('Failed to parse timemap:', e);
            this.timemap = [];
        }
    }

    setupPageNavigation() {
        const navHtml = `
            <div class="page-nav">
                <button id="prev-page" class="btn">← Prev</button>
                <span id="page-info">Page 1 / ${this.totalPages}</span>
                <button id="next-page" class="btn">Next →</button>
            </div>
        `;

        const container = document.querySelector('.score-container');
        if (!container.querySelector('.page-nav')) {
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
    }

    setupPartControls() {
        if (this.tracks.length === 0) return;

        let html = '<h3>🎼 Parts</h3>';
        this.tracks.forEach(track => {
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
                        <input type="range" min="0" max="100" value="100"
                               onchange="player.setTrackVolume(${track.index}, this.value/100)">
                    </div>
                </div>
            `;
        });

        html += `
            <div class="volume-control">
                <label>🔊 Master Volume</label>
                <input type="range" min="0" max="100" value="100"
                       oninput="player.setMasterVolume(this.value/100); this.nextElementSibling.textContent=this.value+'%'">
                <span class="volume-display">100%</span>
            </div>
            <div class="volume-control">
                <label>⏱️ Playback Speed (for practice)</label>
                <input type="range" min="25" max="150" value="100"
                       oninput="player.setPlaybackRate(this.value/100); this.nextElementSibling.textContent=this.value+'%'">
                <span class="volume-display">100%</span>
            </div>
        `;

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
        if (this.player) {
            // Apply volume boost to compensate for quiet MIDI
            this.player.volume.value = Tone.gainToDb(volume * this.volumeBoost);
        }
    }

    setPlaybackRate(rate) {
        this.playbackRate = rate;
        console.log(`Playback speed: ${(rate * 100).toFixed(0)}%`);
    }

    async play() {
        if (!this.currentMidi || this.isPlaying) return;

        try {
            // CRITICAL: Start audio context with user gesture
            console.log('Starting Tone.js...');
            await Tone.start();
            console.log('✓ Tone.js started, context state:', Tone.context.state);

            // Ensure audio context is running
            if (Tone.context.state !== 'running') {
                await Tone.context.resume();
                console.log('✓ Audio context resumed');
            }

            this.isPlaying = true;

            // Create synths pool for better performance
            const synths = [];
            for (let i = 0; i < 32; i++) {
                const synth = new Tone.PolySynth(Tone.Synth, {
                    maxPolyphony: 8,
                    oscillator: { type: 'triangle' },
                    envelope: {
                        attack: 0.005,
                        decay: 0.1,
                        sustain: 0.3,
                        release: 0.5
                    }
                }).toDestination();
                synth.volume.value = Tone.gainToDb(2.0); // Loud volume boost
                synths.push(synth);
            }
            console.log(`✓ Created ${synths.length} synths`);

            // Schedule all notes with proper timing
            const now = Tone.now();
            let noteCount = 0;

            this.currentMidi.tracks.forEach((track, trackIndex) => {
                const trackState = this.tracks[trackIndex];
                if (trackState.muted) return;

                track.notes.forEach(note => {
                    const synth = synths[trackIndex % synths.length];

                    // Apply playback rate (tempo adjustment)
                    const adjustedTime = note.time / this.playbackRate;
                    const adjustedDuration = note.duration / this.playbackRate;

                    // Schedule note
                    synth.triggerAttackRelease(
                        note.name,
                        adjustedDuration,
                        now + adjustedTime,
                        note.velocity * trackState.volume
                    );
                    noteCount++;
                });
            });

            console.log(`✓ Scheduled ${noteCount} notes`);

            // Start highlighting loop
            this.startHighlighting();

            // UI updates
            document.getElementById('play-btn').disabled = true;
            document.getElementById('pause-btn').disabled = false;
            document.getElementById('stop-btn').disabled = false;

            console.log('▶ Playing with', this.currentMidi.tracks.length, 'tracks');

            // Test tone to verify audio works
            const testSynth = new Tone.Synth().toDestination();
            testSynth.volume.value = Tone.gainToDb(1.0);
            testSynth.triggerAttackRelease('C4', '0.1', now);
            console.log('✓ Test tone triggered');

        } catch (error) {
            console.error('❌ Failed to start playback:', error);
            alert(`Playback failed: ${error.message}\n\nTry clicking anywhere on the page first, then play again.`);
            this.isPlaying = false;
        }
    }

    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        Tone.Transport.pause();

        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;

        console.log('⏸ Paused');
    }

    stop() {
        this.isPlaying = false;
        Tone.Transport.stop();
        Tone.Transport.cancel();

        // Clear all synths
        if (this.player) {
            this.player.stopAll();
        }

        // Clear highlighting
        this.clearHighlights();

        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('stop-btn').disabled = true;

        console.log('⏹ Stopped');
    }

    startHighlighting() {
        const startTime = Tone.now();

        const highlight = () => {
            if (!this.isPlaying) return;

            const currentTime = Tone.now() - startTime;

            // Find active notes in timemap
            this.clearHighlights();

            this.timemap.forEach(entry => {
                const timeInSeconds = entry.tstamp / 1000;
                const duration = (entry.dur || 0.25) / 1000;

                if (currentTime >= timeInSeconds && currentTime < timeInSeconds + duration) {
                    const element = document.querySelector(`[data-id="${entry.id}"]`);
                    if (element) {
                        element.classList.add('highlighted');
                    }
                }
            });

            requestAnimationFrame(highlight);
        };

        highlight();
    }

    clearHighlights() {
        document.querySelectorAll('.highlighted').forEach(el => {
            el.classList.remove('highlighted');
        });
    }

    seekToMeasure(measureId) {
        console.log('Seeking to measure:', measureId);
        // Find the measure in timemap and seek to that time
        const measureEntry = this.timemap.find(entry =>
            entry.id && entry.id.includes(measureId)
        );

        if (measureEntry) {
            const seekTime = measureEntry.tstamp / 1000;
            console.log('Seek to time:', seekTime);
            // TODO: Implement proper seek in Tone.js
        }
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
document.getElementById('play-btn').addEventListener('click', () => {
    player.play();
});

document.getElementById('pause-btn').addEventListener('click', () => {
    player.pause();
});

document.getElementById('stop-btn').addEventListener('click', () => {
    player.stop();
});

// Score library
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
