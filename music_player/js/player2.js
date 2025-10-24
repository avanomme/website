// Verovio-based MusicXML Player for Stratford Choir
// Uses Verovio for precise cursor synchronization with MIDI playback

// Song-specific tempo overrides (BPM)
const SONG_TEMPOS = {
  'our-gift-for-you': 92,
  'candlelight-carol': 92,
  'winter-song': 91,
  'most-wonderful': 180,
};

const VOCAL_INSTRUMENT = 'choir_aahs';
const PIANO_INSTRUMENT = 'acoustic_grand_piano';

// Global state
let verovioToolkit = null;
let currentSongId = null;
let currentMusicXML = null;
let isPlaying = false;
let isPaused = false;
let currentZoom = 45; // Verovio zoom scale (45 is reasonable default)
let fittedZoom = 45;
let autoFitEnabled = true;
let autoFitResizeTimeout = null;
let currentTempo = 120;
let baseTempo = 120;
let masterVolume = 0.5;
let selectedParts = {};
let partVolumes = {};

// MIDI playback state
let midiData = {};
let audioContext = null;
let soundfonts = {};
let scheduledNotes = [];
let playbackStartTime = 0;
let pausedTime = 0;
let pausedBaseTime = 0;
let currentTime = 0;
let animationFrame = null;

const DEFAULT_ZOOM = 45;
const MIN_ZOOM = 20;
const MAX_ZOOM = 150;
const DEFAULT_MICROSECONDS_PER_QUARTER = 500000;

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function getScoreDisplayElement() {
  return document.getElementById('scoreDisplay');
}

function getTempoMultiplier() {
  if (!baseTempo || baseTempo <= 0) return 1;
  if (!currentTempo || currentTempo <= 0) return 1;
  return baseTempo / currentTempo;
}

function updateTempoDisplay() {
  const tempoValue = document.getElementById('tempoValue');
  const tempoSlider = document.getElementById('tempoSlider');

  if (tempoValue) {
    tempoValue.textContent = Math.round(currentTempo);
  }
  if (tempoSlider) {
    const sliderMin = Number.isFinite(parseInt(tempoSlider.min, 10)) ? parseInt(tempoSlider.min, 10) : 40;
    const sliderMax = Number.isFinite(parseInt(tempoSlider.max, 10)) ? parseInt(tempoSlider.max, 10) : 240;
    tempoSlider.value = clamp(Math.round(currentTempo), sliderMin, sliderMax);
  }
}

function updateZoomDisplay() {
  const zoomValue = document.getElementById('zoomValue');
  if (!zoomValue) return;

  const baseline = fittedZoom || DEFAULT_ZOOM;
  const zoomPercent = Math.round((currentZoom / baseline) * 100);
  zoomValue.textContent = clamp(zoomPercent, 10, 400);
}

function buildTempoSegments(tempoMap, ticksPerBeat) {
  const sanitized = (tempoMap && tempoMap.length > 0 ? tempoMap : [{
    tick: 0,
    microsecondsPerQuarter: DEFAULT_MICROSECONDS_PER_QUARTER
  }]).slice().sort((a, b) => a.tick - b.tick);

  const segments = [];
  let cumulativeSeconds = 0;

  for (let i = 0; i < sanitized.length; i++) {
    const entry = sanitized[i];
    const micro = entry.microsecondsPerQuarter || DEFAULT_MICROSECONDS_PER_QUARTER;
    const secondsPerTick = (micro / 1_000_000) / (ticksPerBeat || 480);

    segments.push({
      tickStart: entry.tick,
      secondsStart: cumulativeSeconds,
      secondsPerTick: secondsPerTick
    });

    const next = sanitized[i + 1];
    if (next) {
      const deltaTicks = Math.max(0, next.tick - entry.tick);
      cumulativeSeconds += deltaTicks * secondsPerTick;
    }
  }

  if (segments.length === 0) {
    const secondsPerTick = (DEFAULT_MICROSECONDS_PER_QUARTER / 1_000_000) / (ticksPerBeat || 480);
    segments.push({
      tickStart: 0,
      secondsStart: 0,
      secondsPerTick
    });
  }

  return segments;
}

function ticksToSeconds(tick, segments) {
  if (!segments || segments.length === 0) return 0;

  let segment = segments[0];
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].tickStart <= tick) {
      segment = segments[i];
    } else {
      break;
    }
  }

  const deltaTicks = tick - segment.tickStart;
  return segment.secondsStart + deltaTicks * segment.secondsPerTick;
}

function secondsToTicks(seconds, segments) {
  if (!segments || segments.length === 0) return 0;

  let segment = segments[0];
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].secondsStart <= seconds) {
      segment = segments[i];
    } else {
      break;
    }
  }

  const deltaSeconds = seconds - segment.secondsStart;
  if (segment.secondsPerTick <= 0) return segment.tickStart;
  return segment.tickStart + deltaSeconds / segment.secondsPerTick;
}

function getVerovioOptions(scale) {
  return {
    scale: clamp(scale || DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM),
    adjustPageHeight: true,
    breaks: 'auto',
    footer: 'none',
    header: 'none',
    pageHeight: 2970,
    pageWidth: 2100
  };
}

function renderScore(scale = currentZoom, { skipAutoFit = false } = {}) {
  if (!verovioToolkit || !currentMusicXML) {
    console.warn('Cannot render score: Verovio toolkit or MusicXML missing');
    return;
  }

  currentZoom = clamp(scale || DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM);

  const options = getVerovioOptions(currentZoom);
  verovioToolkit.setOptions(JSON.stringify(options));
  verovioToolkit.loadData(currentMusicXML);

  const svgOutput = verovioToolkit.renderToSVG(1);
  const scoreDisplay = getScoreDisplayElement();

  if (scoreDisplay) {
    scoreDisplay.innerHTML = svgOutput;
    scoreDisplay.scrollTop = 0;
  }

  clearAllHighlights();
  if (isPlaying) {
    updateCursorPosition(currentTime);
  }

  updateZoomDisplay();

  if (!skipAutoFit) {
    requestAnimationFrame(() => autoFitScore());
  }
}

function autoFitScore(force = false) {
  if (!verovioToolkit || !currentMusicXML) return;
  if (!force && !autoFitEnabled) return;

  const container = getScoreDisplayElement();
  if (!container) return;

  const measureFit = () => {
    const svg = container.querySelector('svg');
    if (!svg) return;

    const systemSelector = '[data-system], g[data-system], g.system, g[id*="system"]';
    const system = svg.querySelector(systemSelector) || svg.querySelector('g') || svg;

    if (!system || typeof system.getBBox !== 'function') return;

    let bbox;
    try {
      bbox = system.getBBox();
    } catch (err) {
      console.warn('Unable to measure score for auto-fit:', err);
      return;
    }

    if (!bbox || bbox.width === 0 || bbox.height === 0) return;

    const padding = 40;
    const availableWidth = Math.max(container.clientWidth - padding, 100);
    const availableHeight = Math.max(container.clientHeight - padding, 100);

    const widthFactor = availableWidth / bbox.width;
    const heightFactor = availableHeight / bbox.height;
    const scaleFactor = Math.min(widthFactor, heightFactor);

    if (!isFinite(scaleFactor) || scaleFactor <= 0) return;

    const targetZoom = clamp(currentZoom * scaleFactor, MIN_ZOOM, MAX_ZOOM);

    if (Math.abs(targetZoom - currentZoom) < 0.5) {
      fittedZoom = targetZoom;
      currentZoom = targetZoom;
      updateZoomDisplay();
      container.scrollTo({ top: 0, behavior: 'auto' });
      autoFitEnabled = true;
      return;
    }

    setZoomLevel(targetZoom, { skipAutoFit: true });
    fittedZoom = currentZoom;
    updateZoomDisplay();
    container.scrollTo({ top: 0, behavior: 'auto' });

    requestAnimationFrame(() => autoFitScore(true));
  };

  requestAnimationFrame(measureFit);
}

function scheduleAutoFit() {
  if (!autoFitEnabled) return;
  if (autoFitResizeTimeout) {
    clearTimeout(autoFitResizeTimeout);
  }

  autoFitResizeTimeout = setTimeout(() => {
    autoFitResizeTimeout = null;
    autoFitScore();
  }, 150);
}

function setZoomLevel(targetZoom, { markManual = false, skipAutoFit = false } = {}) {
  if (!verovioToolkit || !currentMusicXML) return;

  if (markManual) {
    autoFitEnabled = false;
  }

  const clampedZoom = clamp(targetZoom, MIN_ZOOM, MAX_ZOOM);
  if (Math.abs(clampedZoom - currentZoom) < 0.5 && skipAutoFit) {
    updateZoomDisplay();
    return;
  }

  renderScore(clampedZoom, { skipAutoFit });
}

function applyInitialTempo(songId) {
  let tempo = null;

  if (SONG_TEMPOS[songId]) {
    tempo = SONG_TEMPOS[songId];
  } else {
    for (const data of Object.values(midiData)) {
      if (data && data.bpm && data.bpm > 0) {
        tempo = data.bpm;
        break;
      }
    }
  }

  if (!tempo || !Number.isFinite(tempo)) {
    tempo = 120;
  }

  baseTempo = tempo;
  currentTempo = tempo;
  updateTempoDisplay();
  console.log(`Initial tempo set to ${tempo} BPM`);
}

// Part configuration
const PART_VARIANT_MAP = {
  Soprano: ['Soprano', 'Soprano_1', 'Soprano_2'],
  Alto: ['Alto', 'Alto_1', 'Alto_2'],
  Tenor: ['Tenor'],
  Baritone: ['Baritone', 'Baritone_1', 'Baritone_2', 'Tenor'],
  Bass: ['Bass'],
  Piano: ['Piano', 'PIANO']
};

function getInstrumentForPart(partName = '') {
  const normalized = partName.toLowerCase();
  if (normalized.includes('piano') || normalized.includes('keyboard')) {
    return PIANO_INSTRUMENT;
  }
  return VOCAL_INSTRUMENT;
}

// Initialize Verovio when ready
function initializeVerovio() {
  return new Promise((resolve, reject) => {
    console.log('Waiting for Verovio to load...');

    // Check if verovio is already loaded
    if (typeof verovio !== 'undefined') {
      console.log('Verovio module found, waiting for WASM initialization...');

      // Wait for WASM module to initialize
      verovio.module.onRuntimeInitialized = function() {
        try {
          verovioToolkit = new verovio.toolkit();
          console.log('Verovio initialized, version:', verovioToolkit.getVersion());

          // Initialize audio context
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          console.log('Audio context initialized');

          resolve();
        } catch (error) {
          reject(error);
        }
      };
    } else {
      // If verovio not loaded yet, wait and retry
      setTimeout(() => {
        initializeVerovio().then(resolve).catch(reject);
      }, 100);
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
  try {
    await initializeVerovio();

    updateTempoDisplay();
    updateZoomDisplay();
    window.addEventListener('resize', scheduleAutoFit);

    // Set up keyboard shortcuts
    setupKeyboardShortcuts();

    console.log('Verovio player ready!');
  } catch (error) {
    console.error('Failed to initialize Verovio:', error);
    document.getElementById('scoreDisplay').innerHTML =
      '<p style="color: red;">Failed to load Verovio. Please refresh the page.</p>';
  }
});

// Load and display a MusicXML score
async function loadScore(songId, displayName) {
  try {
    console.log(`Loading score: ${songId}`);

    if (!verovioToolkit) {
      alert('Verovio is still loading. Please wait a moment and try again.');
      return;
    }

    // Stop current playback
    if (isPlaying) {
      pauseScore();
    }

    currentSongId = songId;

    // Clear previous score
    const scoreDisplay = getScoreDisplayElement();
    if (scoreDisplay) {
      scoreDisplay.innerHTML = '<p>Loading score...</p>';
    }

    // Load MusicXML file
    const musicxmlPath = `scores/${songId}/${songId}.musicxml`;
    const response = await fetch(musicxmlPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${musicxmlPath}: ${response.status}`);
    }

    currentMusicXML = await response.text();
    console.log('MusicXML loaded, rendering with Verovio...');

    // Reset zoom state and render score (auto-fit will run after render)
    autoFitEnabled = true;
    currentZoom = DEFAULT_ZOOM;
    fittedZoom = DEFAULT_ZOOM;
    renderScore(currentZoom);

    console.log('Score rendered successfully');

    // Load MIDI files for all parts
    await loadMidiFiles(songId);
    applyInitialTempo(songId);

    // Update UI
    document.getElementById('placeholder')?.remove();

    // Update part names from score
    updatePartNamesFromScore();

  } catch (error) {
    console.error('Error loading score:', error);
    const scoreDisplay = getScoreDisplayElement();
    if (scoreDisplay) {
      scoreDisplay.innerHTML = `<p style="color: red;">Failed to load score: ${error.message}</p>`;
    }
  }
}

// Update part names from the loaded score
function updatePartNamesFromScore() {
  // For now, use default parts
  selectedParts = {
    'Soprano': true,
    'Alto': true,
    'Tenor': true,
    'Bass': true,
    'Piano': true
  };
  partVolumes = {
    'Soprano': 1.0,
    'Alto': 1.0,
    'Tenor': 1.0,
    'Bass': 1.0,
    'Piano': 1.0
  };
}

// Load MIDI files for all parts
async function loadMidiFiles(songId) {
  console.log('Loading MIDI files...');
  midiData = {};

  for (const [basePart, variants] of Object.entries(PART_VARIANT_MAP)) {
    let loaded = false;

    for (const variant of variants) {
      const trimmed = (variant || '').trim();
      if (!trimmed) continue;

      const patternSet = new Set([
        trimmed,
        trimmed.replace(/\s+/g, '-'),
        trimmed.replace(/\s+/g, '_'),
        trimmed.toLowerCase(),
        trimmed.toLowerCase().replace(/\s+/g, '-'),
        trimmed.toLowerCase().replace(/\s+/g, '_')
      ]);

      for (const nameVariant of patternSet) {
        if (!nameVariant) continue;

        const candidatePaths = [
          `scores/${songId}/${songId}-${nameVariant}.mid`,
          `scores/${songId}/${nameVariant}.mid`
        ];

        for (const midiPath of candidatePaths) {
          try {
            const response = await fetch(midiPath);
            if (!response.ok) {
              continue;
            }

            const arrayBuffer = await response.arrayBuffer();
            const parsed = parseMidi(arrayBuffer);

            midiData[basePart] = parsed;
            console.log(`Loaded MIDI for ${basePart} from ${midiPath}`);

            if (!(basePart in selectedParts)) {
              selectedParts[basePart] = true;
            }
            if (!(basePart in partVolumes)) {
              partVolumes[basePart] = 1.0;
            }

            loaded = true;
            break;
          } catch (error) {
            console.warn(`Failed to load MIDI for ${basePart} from ${midiPath}:`, error);
          }
        }

        if (loaded) {
          break;
        }
      }

      if (loaded) {
        break;
      }
    }

    if (!loaded) {
      console.warn(`No MIDI file found for ${basePart}`);
    }
  }

  // Load soundfonts
  await loadSoundfonts();
}

// Parse MIDI file using MidiParser library
function parseMidi(arrayBuffer) {
  try {
    if (typeof MidiParser === 'undefined') {
      console.warn('MidiParser not loaded, cannot parse MIDI');
      return { events: [], ticksPerBeat: 480, bpm: 120 };
    }

    const midi = MidiParser.parse(new Uint8Array(arrayBuffer));
    const notes = [];
    let currentTime = 0;
    let tempo = DEFAULT_MICROSECONDS_PER_QUARTER;
    const tempoMap = [{
      tick: 0,
      microsecondsPerQuarter: tempo
    }];

    if (!midi || !midi.track || midi.track.length === 0) {
      console.warn('Invalid MIDI data');
      return { events: [], ticksPerBeat: 480, bpm: 120 };
    }

    // Get ticks per beat
    const ticksPerBeat = midi.timeDivision || 480;

    // Process all tracks to find tempo and notes
    midi.track.forEach((track, trackIndex) => {
      currentTime = 0;
      track.event.forEach(event => {
        currentTime += event.deltaTime || 0;

        // Look for tempo events
        if (event.type === 255 && event.metaType === 81 && event.data) {
          const rawTempo = (event.data[0] << 16) | (event.data[1] << 8) | event.data[2];
          if (rawTempo > 1000) {
            tempo = rawTempo;
            const bpm = 60000000 / tempo;
            console.log(`Found tempo in track ${trackIndex}: ${bpm} BPM`);
            tempoMap.push({
              tick: currentTime,
              microsecondsPerQuarter: tempo
            });
          }
        }

        // Note on events
        if (event.type === 9 && event.data && event.data.length >= 2) {
          const note = event.data[0];
          const velocity = event.data[1];
          if (velocity > 0) {
            notes.push({
              type: 'noteOn',
              note: note,
              velocity: velocity,
              time: currentTime
            });
          } else {
            notes.push({
              type: 'noteOff',
              note: note,
              time: currentTime
            });
          }
        } else if (event.type === 8 && event.data && event.data.length >= 1) {
          // Note off events
          const note = event.data[0];
          notes.push({
            type: 'noteOff',
            note: note,
            time: currentTime
          });
        }
      });
    });

    const tempoSegments = buildTempoSegments(tempoMap, ticksPerBeat);
    const initialTempoMicros = tempoMap[0]?.microsecondsPerQuarter || DEFAULT_MICROSECONDS_PER_QUARTER;
    const bpm = Math.round(60000000 / initialTempoMicros);
    console.log(`Parsed ${notes.length} MIDI events, ticks per beat: ${ticksPerBeat}, BPM: ${bpm}`);
    return {
      events: notes,
      ticksPerBeat: ticksPerBeat,
      bpm: bpm,
      tempoMap,
      tempoSegments
    };
  } catch (err) {
    console.error('MIDI parsing error:', err);
    const tempoMap = [{ tick: 0, microsecondsPerQuarter: DEFAULT_MICROSECONDS_PER_QUARTER }];
    return {
      events: [],
      ticksPerBeat: 480,
      bpm: 120,
      tempoMap,
      tempoSegments: buildTempoSegments(tempoMap, 480)
    };
  }
}

// Load soundfonts
async function loadSoundfonts() {
  if (!window.Soundfont) {
    console.error('Soundfont player not loaded');
    return;
  }

  console.log('Loading soundfonts...');

  try {
    // Load choir sound for voice parts
    const choirInstrument = await window.Soundfont.instrument(audioContext, VOCAL_INSTRUMENT, {
      soundfont: 'MusyngKite'
    });

    soundfonts['Soprano'] = choirInstrument;
    soundfonts['Alto'] = choirInstrument;
    soundfonts['Tenor'] = choirInstrument;
    soundfonts['Bass'] = choirInstrument;
    soundfonts['Baritone'] = choirInstrument;

    // Load piano sound for piano part
    const pianoInstrument = await window.Soundfont.instrument(audioContext, PIANO_INSTRUMENT, {
      soundfont: 'MusyngKite'
    });

    soundfonts['Piano'] = pianoInstrument;
    soundfonts['PIANO'] = pianoInstrument;

    console.log('Soundfonts loaded');
  } catch (error) {
    console.error('Failed to load soundfonts:', error);
  }
}

// Play the score
function playScore() {
  if (!currentMusicXML || !verovioToolkit) {
    console.warn('No score loaded');
    return;
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (isPaused) {
    // Resume from pause
    isPaused = false;
    isPlaying = true;
    const now = audioContext.currentTime;
    playbackStartTime = now - pausedTime;
    scheduleNotesFromTime({
      startRealSeconds: pausedTime,
      startBaseSeconds: pausedBaseTime
    });
    startCursorAnimation();
    console.log(`Resumed from ${pausedTime.toFixed(2)}s`);
  } else {
    // Start from beginning
    stopAllNotes();
    isPlaying = true;
    isPaused = false;
    playbackStartTime = audioContext.currentTime;
    currentTime = 0;
    pausedTime = 0;
    pausedBaseTime = 0;
    scheduleNotesFromTime({ startRealSeconds: 0, startBaseSeconds: 0 });
    startCursorAnimation();
    console.log('Started playback');
  }
}

// Pause the score
function pauseScore() {
  if (!isPlaying) return;

  isPaused = true;
  isPlaying = false;
  pausedTime = audioContext.currentTime - playbackStartTime;
  const tempoMultiplier = getTempoMultiplier();
  pausedBaseTime = tempoMultiplier !== 0 ? pausedTime / tempoMultiplier : 0;
  stopAllNotes();
  stopCursorAnimation();
  console.log(`Paused at ${pausedTime.toFixed(2)}s`);
}

// Restart the score
function restartScore() {
  stopAllNotes();
  isPlaying = false;
  isPaused = false;
  currentTime = 0;
  pausedTime = 0;
  pausedBaseTime = 0;
  stopCursorAnimation();

  // Clear highlighting
  clearAllHighlights();

  // Restart playback
  setTimeout(() => playScore(), 100);

  console.log('Restarted');
}

// Schedule MIDI notes
function scheduleNotesFromTime({ startRealSeconds = 0, startBaseSeconds = null } = {}) {
  stopAllNotes();

  const now = audioContext.currentTime;
  const tempoMultiplier = getTempoMultiplier();
  const baseStartTime = startBaseSeconds != null
    ? startBaseSeconds
    : (tempoMultiplier !== 0 ? startRealSeconds / tempoMultiplier : 0);
  const realStartTime = baseStartTime * tempoMultiplier;

  for (const [partName, data] of Object.entries(midiData)) {
    if (!data || !data.events) continue;

    // Check if part is enabled
    const checkbox = document.getElementById(`part${partName}`);
    if (checkbox && !checkbox.checked) continue;

    const partVolume = partVolumes[partName] || 1.0;
    const instrument = soundfonts[partName];
    if (!instrument) continue;

    const events = data.events;
    const ticksPerBeat = data.ticksPerBeat || 480;

    const tempoSegments = data.tempoSegments || buildTempoSegments(data.tempoMap, ticksPerBeat);

    console.log(`Scheduling ${events.length} events for ${partName}, tempo: ${currentTempo} BPM`);

    const carryOverNotes = new Map();
    const activeNotes = new Map();
    let scheduledCount = 0;
    let resumedCarryOver = false;

    for (const event of events) {
      const eventBaseSeconds = ticksToSeconds(event.time, tempoSegments);
      const eventRealSeconds = eventBaseSeconds * tempoMultiplier;

      if (eventRealSeconds < realStartTime - 0.001) {
        if (event.type === 'noteOn') {
          carryOverNotes.set(event.note, event.velocity);
        } else if (event.type === 'noteOff') {
          carryOverNotes.delete(event.note);
        }
        continue;
      }

      if (!resumedCarryOver) {
        const resumeTime = now + 0.002;
        carryOverNotes.forEach((velocity, note) => {
          const velocityGain = (velocity / 127.0) * partVolume * masterVolume;
          if (velocityGain <= 0) return;
          const node = instrument.play(note, resumeTime, {
            gain: velocityGain,
            duration: 10
          });
          if (node) {
            scheduledNotes.push({ node, time: resumeTime, note, part: partName });
            activeNotes.set(note, { node });
          }
        });
        carryOverNotes.clear();
        resumedCarryOver = true;
      }

      const offsetSeconds = eventRealSeconds - realStartTime;
      const scheduleTime = now + Math.max(0, offsetSeconds);

      if (event.type === 'noteOn') {
        const velocityGain = (event.velocity / 127.0) * partVolume * masterVolume;
        if (velocityGain <= 0) continue;

        const noteNode = instrument.play(event.note, scheduleTime, {
          gain: velocityGain,
          duration: 10 // Long duration, will be stopped by noteOff
        });

        if (noteNode) {
          scheduledNotes.push({ node: noteNode, time: scheduleTime, note: event.note, part: partName });
          activeNotes.set(event.note, { node: noteNode, time: scheduleTime });
          scheduledCount++;
        }
      } else if (event.type === 'noteOff') {
        const activeNote = activeNotes.get(event.note);
        if (activeNote && activeNote.node && activeNote.node.stop) {
          try {
            activeNote.node.stop(scheduleTime);
          } catch (e) {
            // Note might already be stopped
          }
        }
        activeNotes.delete(event.note);
      }
    }

    console.log(`Scheduled ${scheduledCount} notes for ${partName}`);
  }
}

// Stop all scheduled notes
function stopAllNotes() {
  const now = audioContext.currentTime;
  for (const scheduled of scheduledNotes) {
    try {
      if (scheduled.node && scheduled.node.stop) {
        scheduled.node.stop(now);
      }
    } catch (e) {
      // Ignore errors from already stopped notes
    }
  }
  scheduledNotes = [];
}

// Cursor animation
function startCursorAnimation() {
  if (animationFrame) return;

  let lastTime = null;

  function animate(timestamp) {
    if (!isPlaying) return;

    if (lastTime === null) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    currentTime = audioContext.currentTime - playbackStartTime;

    // Update cursor position in Verovio
    updateCursorPosition(currentTime);

    animationFrame = requestAnimationFrame(animate);
  }

  animationFrame = requestAnimationFrame(animate);
}

function stopCursorAnimation() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

// Update cursor position in Verovio
function updateCursorPosition(timeInSeconds) {
  if (!verovioToolkit) return;

  const firstMidiData = Object.values(midiData)[0];
  if (!firstMidiData) return;

  const tempoMultiplier = getTempoMultiplier();
  const referenceSeconds = tempoMultiplier !== 0 ? timeInSeconds / tempoMultiplier : timeInSeconds;
  const tempoSegments = firstMidiData.tempoSegments || buildTempoSegments(firstMidiData.tempoMap, firstMidiData.ticksPerBeat || 480);
  const ticks = Math.floor(secondsToTicks(referenceSeconds, tempoSegments));

  // Get elements at current time from Verovio
  const elementsAtTime = verovioToolkit.getElementsAtTime(ticks);

  if (elementsAtTime && elementsAtTime.notes) {
    // Clear previous highlights
    clearAllHighlights();

    // Highlight current notes
    for (const noteId of elementsAtTime.notes) {
      const element = document.getElementById(noteId);
      if (element) {
        element.setAttribute('fill', '#33e033');
        element.setAttribute('fill-opacity', '0.5');

        // Scroll to keep element in view
        element.scrollIntoView({ block: 'center', inline: 'center' });
      }
    }
  }
}

// Clear all highlights
function clearAllHighlights() {
  const scoreDisplay = document.getElementById('scoreDisplay');
  if (!scoreDisplay) return;

  const highlighted = scoreDisplay.querySelectorAll('[fill="#33e033"]');
  highlighted.forEach(el => {
    el.removeAttribute('fill');
    el.removeAttribute('fill-opacity');
  });
}

// Toggle part on/off
function togglePart(partName, enabled) {
  console.log(`${partName}: ${enabled ? 'enabled' : 'disabled'}`);

  if (!enabled && isPlaying) {
    // Stop notes from this part immediately
    const now = audioContext.currentTime;
    scheduledNotes = scheduledNotes.filter(scheduled => {
      if (scheduled.part === partName) {
        try {
          if (scheduled.node && scheduled.node.stop) {
            scheduled.node.stop(now);
          }
        } catch (e) {
          // Ignore
        }
        return false;
      }
      return true;
    });
  }
}

// Set absolute tempo
function setAbsoluteTempo(bpm) {
  const slider = document.getElementById('tempoSlider');
  const minTempo = slider && Number.isFinite(parseInt(slider.min, 10)) ? parseInt(slider.min, 10) : 40;
  const maxTempo = slider && Number.isFinite(parseInt(slider.max, 10)) ? parseInt(slider.max, 10) : 240;
  const targetTempo = clamp(parseInt(bpm, 10) || currentTempo, minTempo, maxTempo);

  const wasPlaying = isPlaying;
  let resumeBaseTime = 0;

  if (wasPlaying && audioContext) {
    const elapsedReal = audioContext.currentTime - playbackStartTime;
    resumeBaseTime = elapsedReal / getTempoMultiplier();
    pauseScore();
  }

  currentTempo = targetTempo;
  updateTempoDisplay();
  console.log(`Tempo set to ${currentTempo} BPM`);

  if (!wasPlaying && isPaused) {
    pausedTime = pausedBaseTime * getTempoMultiplier();
  }

  if (wasPlaying) {
    pausedBaseTime = resumeBaseTime;
    pausedTime = resumeBaseTime * getTempoMultiplier();
    playScore();
  }
}

// Change master volume
function changeMasterVolume(value) {
  masterVolume = parseInt(value) / 100;
  document.getElementById('masterVolumeValue').textContent = value;
  console.log(`Master volume set to ${value}%`);
}

// Zoom controls
function zoomIn() {
  setZoomLevel(currentZoom + 5, { markManual: true, skipAutoFit: true });
}

function zoomOut() {
  setZoomLevel(currentZoom - 5, { markManual: true, skipAutoFit: true });
}

function resetZoom() {
  autoFitEnabled = true;
  const target = fittedZoom || DEFAULT_ZOOM;
  setZoomLevel(target, { skipAutoFit: true });
  requestAnimationFrame(() => autoFitScore(true));
}

// Seek to measure
function seekToMeasure(value) {
  console.log(`Seek to position: ${value}`);
  // TODO: Implement seeking
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    // Spacebar: Play/Pause
    if (event.key === ' ' || event.code === 'Space') {
      // Ignore if typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      event.preventDefault();

      if (isPlaying) {
        pauseScore();
      } else {
        playScore();
      }
    }
  });
}

console.log('Verovio player script loaded');
