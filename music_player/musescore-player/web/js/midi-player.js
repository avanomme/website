/**
 * MIDI Player using Web Audio API
 * Handles MIDI file playback with synthesis
 */

export class MIDIPlayer {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.tracks = [];
        this.tempo = 120; // BPM
        this.ticksPerBeat = 480;
        this.events = [];
        this.scheduledNotes = [];
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.currentTime = 0;

        // Create master gain node
        this.masterGain = audioContext.createGain();
        this.masterGain.connect(audioContext.destination);
        this.masterGain.gain.value = 0.8;

        // Simple oscillator-based synthesis for now
        // In production, use SoundFont or sampler
        this.activeNotes = new Map();
    }

    parseMIDI(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        let offset = 0;

        // Read header chunk
        const headerChunk = this.readString(view, offset, 4);
        offset += 4;

        if (headerChunk !== 'MThd') {
            throw new Error('Invalid MIDI file: Missing MThd header');
        }

        const headerLength = view.getUint32(offset);
        offset += 4;

        const format = view.getUint16(offset);
        offset += 2;

        const numTracks = view.getUint16(offset);
        offset += 2;

        const timeDivision = view.getUint16(offset);
        offset += 2;

        if (timeDivision & 0x8000) {
            throw new Error('SMPTE time division not supported');
        }

        this.ticksPerBeat = timeDivision;
        this.tracks = [];

        console.log(`MIDI Format: ${format}, Tracks: ${numTracks}, TPB: ${this.ticksPerBeat}`);

        // Read track chunks
        for (let i = 0; i < numTracks; i++) {
            const track = this.readTrack(view, offset);
            this.tracks.push(track);
            offset = track.nextOffset;
        }

        // Build event timeline
        this.buildEventTimeline();

        return {
            format,
            numTracks,
            ticksPerBeat: this.ticksPerBeat,
            durationTicks: this.calculateDuration()
        };
    }

    readTrack(view, offset) {
        const trackChunk = this.readString(view, offset, 4);
        offset += 4;

        if (trackChunk !== 'MTrk') {
            throw new Error(`Invalid track chunk: ${trackChunk}`);
        }

        const trackLength = view.getUint32(offset);
        offset += 4;

        const trackEnd = offset + trackLength;
        const events = [];
        let tick = 0;
        let runningStatus = 0;

        while (offset < trackEnd) {
            const deltaTime = this.readVariableLength(view, offset);
            offset = deltaTime.nextOffset;
            tick += deltaTime.value;

            let statusByte = view.getUint8(offset);

            // Handle running status
            if (statusByte < 0x80) {
                statusByte = runningStatus;
            } else {
                offset++;
            }

            const eventType = statusByte & 0xF0;
            const channel = statusByte & 0x0F;

            let event = { tick, type: eventType, channel };

            if (eventType === 0x80 || eventType === 0x90) {
                // Note off / Note on
                const note = view.getUint8(offset++);
                const velocity = view.getUint8(offset++);

                event.note = note;
                event.velocity = velocity;
                event.type = (eventType === 0x90 && velocity > 0) ? 'noteOn' : 'noteOff';

                runningStatus = statusByte;
            } else if (eventType === 0xB0) {
                // Control change
                const controller = view.getUint8(offset++);
                const value = view.getUint8(offset++);

                event.type = 'controlChange';
                event.controller = controller;
                event.value = value;

                runningStatus = statusByte;
            } else if (eventType === 0xC0) {
                // Program change
                const program = view.getUint8(offset++);

                event.type = 'programChange';
                event.program = program;

                runningStatus = statusByte;
            } else if (eventType === 0xF0) {
                // Meta event or system exclusive
                if (statusByte === 0xFF) {
                    const metaType = view.getUint8(offset++);
                    const length = this.readVariableLength(view, offset);
                    offset = length.nextOffset;

                    if (metaType === 0x51) {
                        // Set tempo
                        const microsecondsPerBeat =
                            (view.getUint8(offset) << 16) |
                            (view.getUint8(offset + 1) << 8) |
                            view.getUint8(offset + 2);

                        event.type = 'tempo';
                        event.tempo = 60000000 / microsecondsPerBeat;
                    } else if (metaType === 0x2F) {
                        // End of track
                        event.type = 'endOfTrack';
                    }

                    offset += length.value;
                } else {
                    // System exclusive - skip
                    const length = this.readVariableLength(view, offset);
                    offset = length.nextOffset + length.value;
                }

                runningStatus = 0;
            } else {
                // Unknown event - skip
                console.warn(`Unknown MIDI event: 0x${statusByte.toString(16)}`);
                runningStatus = statusByte;
            }

            events.push(event);
        }

        return { events, nextOffset: offset };
    }

    readString(view, offset, length) {
        let str = '';
        for (let i = 0; i < length; i++) {
            str += String.fromCharCode(view.getUint8(offset + i));
        }
        return str;
    }

    readVariableLength(view, offset) {
        let value = 0;
        let byte;

        do {
            byte = view.getUint8(offset++);
            value = (value << 7) | (byte & 0x7F);
        } while (byte & 0x80);

        return { value, nextOffset: offset };
    }

    buildEventTimeline() {
        this.events = [];
        let currentTempo = this.tempo;

        // Merge all tracks into one timeline
        for (const track of this.tracks) {
            for (const event of track.events) {
                if (event.type === 'tempo') {
                    currentTempo = event.tempo;
                }

                const timeSeconds = this.ticksToSeconds(event.tick, currentTempo);

                this.events.push({
                    ...event,
                    time: timeSeconds
                });
            }
        }

        // Sort by time
        this.events.sort((a, b) => a.time - b.time);

        console.log(`Built timeline with ${this.events.length} events`);
    }

    ticksToSeconds(ticks, tempo = this.tempo) {
        const beatsPerSecond = tempo / 60;
        const ticksPerSecond = beatsPerSecond * this.ticksPerBeat;
        return ticks / ticksPerSecond;
    }

    calculateDuration() {
        if (this.events.length === 0) return 0;
        const lastEvent = this.events[this.events.length - 1];
        return lastEvent.time;
    }

    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.startTime = this.audioContext.currentTime - this.currentTime;

        this.scheduleEvents();
    }

    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.pauseTime = this.audioContext.currentTime - this.startTime;
        this.currentTime = this.pauseTime;

        // Stop all scheduled notes
        this.stopAllNotes();
    }

    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.stopAllNotes();
    }

    seek(timeSeconds) {
        const wasPlaying = this.isPlaying;

        if (wasPlaying) {
            this.pause();
        }

        this.currentTime = timeSeconds;
        this.startTime = this.audioContext.currentTime - timeSeconds;

        if (wasPlaying) {
            this.play();
        }
    }

    scheduleEvents() {
        if (!this.isPlaying) return;

        const currentTime = this.audioContext.currentTime - this.startTime;
        const scheduleAhead = 0.5; // Schedule 500ms ahead

        for (const event of this.events) {
            if (event.time < currentTime - 0.1) continue; // Skip old events
            if (event.time > currentTime + scheduleAhead) break;

            const audioTime = this.startTime + event.time;

            if (event.type === 'noteOn' && event.velocity > 0) {
                this.scheduleNote(event.note, event.velocity, audioTime, event);
            } else if (event.type === 'noteOff' || (event.type === 'noteOn' && event.velocity === 0)) {
                this.stopNote(event.note, audioTime);
            }
        }

        // Schedule next batch
        if (this.isPlaying) {
            setTimeout(() => this.scheduleEvents(), 100);
        }
    }

    scheduleNote(midiNote, velocity, time, event) {
        // Stop any existing note at this pitch first
        if (this.activeNotes.has(midiNote)) {
            this.stopNote(midiNote, time);
        }

        const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
        const baseGain = (velocity / 127) * 0.15; // Further reduced for cleaner sound

        // Create a richer sound using additive synthesis (multiple sine waves)
        const fundamentalGain = this.audioContext.createGain();
        fundamentalGain.gain.value = 0;
        fundamentalGain.gain.setValueAtTime(0, time);
        fundamentalGain.gain.exponentialRampToValueAtTime(baseGain, time + 0.01); // 10ms attack

        // Fundamental frequency (loudest component)
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.frequency.value = frequency;
        osc1.type = 'sine';
        gain1.gain.value = 1.0; // Fundamental at full volume
        osc1.connect(gain1);
        gain1.connect(fundamentalGain);

        // Second harmonic (octave) - adds warmth
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.frequency.value = frequency * 2;
        osc2.type = 'sine';
        gain2.gain.value = 0.3; // Softer second harmonic
        osc2.connect(gain2);
        gain2.connect(fundamentalGain);

        // Third harmonic (perfect fifth) - adds richness
        const osc3 = this.audioContext.createOscillator();
        const gain3 = this.audioContext.createGain();
        osc3.frequency.value = frequency * 3;
        osc3.type = 'sine';
        gain3.gain.value = 0.15; // Even softer
        osc3.connect(gain3);
        gain3.connect(fundamentalGain);

        // Connect to master
        fundamentalGain.connect(this.masterGain);

        // Start all oscillators
        osc1.start(time);
        osc2.start(time);
        osc3.start(time);

        // Store the note with all oscillators
        const noteInfo = {
            oscillators: [osc1, osc2, osc3],
            gainNodes: [gain1, gain2, gain3],
            fundamentalGain,
            startTime: time,
            midiNote
        };

        this.activeNotes.set(midiNote, noteInfo);
    }

    stopNote(midiNote, time) {
        const note = this.activeNotes.get(midiNote);
        if (!note) return;

        const { oscillators, fundamentalGain } = note;
        const now = this.audioContext.currentTime;
        const stopTime = Math.max(time, now);
        const releaseTime = 0.08; // 80ms release for smoother fade

        try {
            // Get current gain value
            const currentGain = fundamentalGain.gain.value;

            // Cancel any scheduled changes
            fundamentalGain.gain.cancelScheduledValues(stopTime);

            // Set current value and ramp to zero (Release) using exponential for more natural decay
            fundamentalGain.gain.setValueAtTime(currentGain, stopTime);

            // Exponential ramp needs a minimum target value > 0
            const minGain = 0.0001;
            fundamentalGain.gain.exponentialRampToValueAtTime(minGain, stopTime + releaseTime);

            // Stop all oscillators
            oscillators.forEach(osc => {
                try {
                    osc.stop(stopTime + releaseTime);
                } catch (e) {
                    // Already stopped
                }
            });

            // Clean up
            setTimeout(() => {
                this.activeNotes.delete(midiNote);
            }, (releaseTime * 1000) + 50);

        } catch (error) {
            // Oscillators might already be stopped
            console.warn('Error stopping note:', error);
            this.activeNotes.delete(midiNote);
        }
    }

    stopAllNotes() {
        const now = this.audioContext.currentTime;
        const releaseTime = 0.05; // Quick release for stop-all

        for (const [midiNote, note] of this.activeNotes) {
            try {
                const { oscillators, fundamentalGain } = note;

                fundamentalGain.gain.cancelScheduledValues(now);
                fundamentalGain.gain.setValueAtTime(fundamentalGain.gain.value, now);
                fundamentalGain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

                oscillators.forEach(osc => {
                    try {
                        osc.stop(now + releaseTime);
                    } catch (e) {
                        // Already stopped
                    }
                });
            } catch (error) {
                // Note might already be stopped
                console.warn('Error stopping note:', error);
            }
        }

        // Clear all notes after release time
        setTimeout(() => {
            this.activeNotes.clear();
        }, (releaseTime * 1000) + 50);
    }

    setVolume(volume) {
        this.masterGain.gain.value = volume;
    }

    setTempo(factor) {
        // Tempo adjustment would require re-scheduling
        // For simplicity, not fully implemented here
        this.tempo = this.tempo * factor;
    }
}
