// MuseScore-style rehearsal player built from the ground up.
// - Verovio for engraving and structural data (systems, measures, timestamps)
// - Combined MIDI playback with full tempo map, dynamics (velocity + CC), and part-level mixing
// - Web Audio + soundfont-player instruments (choir for voices, acoustic grand for piano)

const DEFAULT_TEMPO_PERCENT = 100;
const MIN_TEMPO_PERCENT = 40;
const MAX_TEMPO_PERCENT = 160;
const DEFAULT_MASTER_VOLUME = 0.75;
const DEFAULT_MICROSECONDS_PER_QUARTER = 500000;
const VOCAL_INSTRUMENT = 'choir_aahs';
const PIANO_INSTRUMENT = 'acoustic_grand_piano';
const BASE_RENDER_SCALE = 60;
const DEFAULT_ZOOM = 60;
const MIN_ZOOM = 30;
const MAX_ZOOM = 200;

const SONG_TEMPO_OVERRIDES = {
  'most-wonderful': 180,
  'our-gift-for-you': 92,
  'candlelight-carol': 92,
  'winter-song': 91
};

// Global state
let verovioToolkit = null;
let audioContext = null;
let masterGainNode = null;
let metronomeGainNode = null;
let metronomeEnabled = false;
let autoScrollEnabled = true;
let manualZoomActive = false;

let isPlaying = false;
let isPaused = false;
let isReady = false;

let currentSongId = null;
let currentMusicXML = null;
let currentMidi = null;
let currentTempoPercent = DEFAULT_TEMPO_PERCENT;
let baseTempoBpm = 120;
let tempoSegments = [];

let currentZoom = DEFAULT_ZOOM;
let fittedZoom = DEFAULT_ZOOM;

let playbackStartTime = 0;
let pausedRealSeconds = 0;
let pausedBaseSeconds = 0;
let currentSecondsElapsed = 0;

let animationFrameId = null;
let scheduledEvents = [];

const soundfonts = new Map();
const partRegistry = new Map(); // partName -> { enabled, gain, tracks: [], instrument, trackColor }

function setActiveSongButton(button) {
  document.querySelectorAll('.song-list button[data-song]').forEach(btn => {
    if (btn === button) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function applySvgZoom(scaleFactor) {
  const display = getScoreDisplay();
  if (!display) return;
  const svg = display.querySelector('svg');
  if (!svg) return;

  const scale = Number.isFinite(scaleFactor) && scaleFactor > 0 ? scaleFactor : 1;
  svg.style.transformOrigin = 'top left';
  svg.style.transform = `scale(${scale})`;
}

function renderScoreSvg() {
  if (!verovioToolkit || !currentMusicXML) return;

  verovioToolkit.setOptions(JSON.stringify({
    scale: BASE_RENDER_SCALE,
    adjustPageHeight: true,
    breaks: 'auto',
    footer: 'none',
    header: 'none',
    pageHeight: 2970,
    pageWidth: 2100
  }));

  verovioToolkit.loadData(currentMusicXML);
  const svg = verovioToolkit.renderToSVG(1);
  const display = getScoreDisplay();
  if (display) {
    display.innerHTML = svg;
    display.scrollTop = 0;
  }

  clearHighlights();
  applySvgZoom(currentZoom / DEFAULT_ZOOM);
}

function ensureNoteStack(part, note) {
  if (!part.activeNotes) {
    part.activeNotes = new Map();
  }
  const key = String(note);
  if (!part.activeNotes.has(key)) {
    part.activeNotes.set(key, []);
  }
  return part.activeNotes.get(key);
}

function stopNoteNode(noteInfo, when = (audioContext ? audioContext.currentTime : 0)) {
  if (!noteInfo || !noteInfo.node || noteInfo.stopped) return;
  try {
    noteInfo.node.stop(when + 0.01);
  } catch (err) {
    // ignore stopped nodes
  }
  noteInfo.stopped = true;
  noteInfo.node = null;
}

function pruneNoteStack(part, note) {
  if (!part.activeNotes) return;
  const key = String(note);
  const stack = part.activeNotes.get(key);
  if (!stack) return;
  for (let i = stack.length - 1; i >= 0; i--) {
    const info = stack[i];
    if ((info.stopped || !info.node) && !info.keyDown && !info.sustain) {
      stack.splice(i, 1);
    }
  }
  if (stack.length === 0) {
    part.activeNotes.delete(key);
  }
}

function updateSustainState(part, engaged) {
  if (!part.activeNotes) return;
  part.activeNotes.forEach(stack => {
    stack.forEach(info => {
      if (engaged) {
        info.sustain = true;
      } else if (!info.keyDown) {
        info.sustain = false;
      }
    });
  });
}

function releaseSustainedNotes(part) {
  if (!part.activeNotes) return;
  const now = audioContext ? audioContext.currentTime : 0;
  part.activeNotes.forEach((stack, key) => {
    for (let i = stack.length - 1; i >= 0; i--) {
      const info = stack[i];
      if (!info.keyDown && !info.sustain) {
        stopNoteNode(info, now);
        stack.splice(i, 1);
      }
    }
    if (stack.length === 0) {
      part.activeNotes.delete(key);
    }
  });
}

// Utilities -----------------------------------------------------------------

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeKey(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function getInstrumentForPart(partName = '') {
  const key = normalizeName(partName);
  if (key.includes('piano') || key.includes('keyboard') || key.includes('accompaniment')) {
    return PIANO_INSTRUMENT;
  }
  return VOCAL_INSTRUMENT;
}

function percentToGain(percent) {
  const value = clamp(percent, 0, 200);
  return Math.pow(value / 100, 1.2); // perceptual taper
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
      secondsPerTick
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

function ticksToSeconds(tick, segments = tempoSegments) {
  if (!segments || segments.length === 0) return 0;

  let active = segments[0];
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].tickStart <= tick) {
      active = segments[i];
    } else {
      break;
    }
  }
  const deltaTicks = tick - active.tickStart;
  return active.secondsStart + deltaTicks * active.secondsPerTick;
}

function secondsToTicks(seconds, segments = tempoSegments) {
  if (!segments || segments.length === 0) return 0;

  let active = segments[0];
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].secondsStart <= seconds) {
      active = segments[i];
    } else {
      break;
    }
  }
  const deltaSeconds = seconds - active.secondsStart;
  if (active.secondsPerTick <= 0) return active.tickStart;
  return active.tickStart + (deltaSeconds / active.secondsPerTick);
}

function getTempoMultiplier() {
  return currentTempoPercent / 100;
}

function getScoreDisplay() {
  return document.getElementById('scoreDisplay');
}

function getPartControlsContainer() {
  return document.getElementById('partControls');
}

function cancelScheduledEvents() {
  scheduledEvents.forEach(id => clearTimeout(id));
  scheduledEvents = [];
}

function stopMetronomeNow() {
  if (!metronomeGainNode) return;
  metronomeGainNode.gain.cancelScheduledValues(0);
  metronomeGainNode.gain.value = 0;
}

// Initialization -------------------------------------------------------------

async function initializeVerovio() {
  if (verovioToolkit) return;

  if (typeof verovio === 'undefined') {
    throw new Error('Verovio toolkit failed to load.');
  }

  await new Promise((resolve) => {
    verovio.module.onRuntimeInitialized = () => {
      verovioToolkit = new verovio.toolkit();
      resolve();
    };
  });
}

function ensureAudioContext() {
  if (audioContext) return;

  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = DEFAULT_MASTER_VOLUME;
  masterGainNode.connect(audioContext.destination);

  metronomeGainNode = audioContext.createGain();
  metronomeGainNode.gain.value = 0;
  metronomeGainNode.connect(masterGainNode);
}

// UI Wiring -----------------------------------------------------------------

function setupEventListeners() {
  document.getElementById('playBtn').addEventListener('click', playScore);
  document.getElementById('pauseBtn').addEventListener('click', pauseScore);
  document.getElementById('restartBtn').addEventListener('click', restartScore);

  document.getElementById('tempoSlider').addEventListener('input', (event) => {
    const value = parseInt(event.target.value, 10);
    setTempoPercent(value);
  });

  document.getElementById('masterVolumeSlider').addEventListener('input', (event) => {
    const value = parseInt(event.target.value, 10);
    setMasterVolume(value / 100);
  });

  document.getElementById('zoomInBtn').addEventListener('click', () => adjustZoom(5));
  document.getElementById('zoomOutBtn').addEventListener('click', () => adjustZoom(-5));
  document.getElementById('resetZoomBtn').addEventListener('click', () => resetZoom());

  document.getElementById('seekSlider').addEventListener('input', handleSeekInput);
  document.getElementById('toggleMetronomeBtn').addEventListener('click', toggleMetronome);
  document.getElementById('toggleAutoScrollBtn').addEventListener('click', toggleAutoScroll);

  document.querySelectorAll('.song-list button[data-song]').forEach(button => {
    button.addEventListener('click', () => {
      const folderId = button.getAttribute('data-song');
      const fileId = button.getAttribute('data-file') || folderId;
      if (folderId) {
        setActiveSongButton(button);
        loadSong(folderId, fileId);
      }
    });
  });

  window.addEventListener('resize', () => {
    if (!manualZoomActive) {
      scheduleAutoFit();
    }
  });

}

function setTempoPercent(percent) {
  const wasPlaying = isPlaying;
  const wasPaused = isPaused && !isPlaying;

  if (wasPlaying) {
    pauseScore();
  }

  currentTempoPercent = clamp(percent, MIN_TEMPO_PERCENT, MAX_TEMPO_PERCENT);
  updateTempoDisplay();

  if (wasPaused) {
    pausedRealSeconds = pausedBaseSeconds / getTempoMultiplier();
  }

  if (wasPlaying) {
    playScore();
  }
}

function setMasterVolume(linearGain) {
  ensureAudioContext();
  const gain = clamp(linearGain, 0, 1.5);
  masterGainNode.gain.setValueAtTime(gain, audioContext.currentTime);
  const valueDisplay = document.getElementById('masterVolumeValue');
  if (valueDisplay) {
    valueDisplay.textContent = Math.round(gain * 100);
  }
}

function updateTempoDisplay() {
  const slider = document.getElementById('tempoSlider');
  const display = document.getElementById('tempoValue');
  if (slider) slider.value = currentTempoPercent;
  if (display) display.textContent = currentTempoPercent;
}

function updateZoomDisplay() {
  const zoomValue = document.getElementById('zoomValue');
  if (!zoomValue) return;
  zoomValue.textContent = Math.round(currentZoom);
}

// Auto-fit -------------------------------------------------------------------

let autoFitTimeout = null;

function scheduleAutoFit() {
  if (!autoScrollEnabled || manualZoomActive) return;
  if (autoFitTimeout) clearTimeout(autoFitTimeout);
  autoFitTimeout = setTimeout(() => {
    autoFitTimeout = null;
    autoFitScore();
  }, 150);
}

function autoFitScore(force = false) {
  if (manualZoomActive && !force) return;
  if (!verovioToolkit || !currentMusicXML) return;
  const container = getScoreDisplay();
  if (!container) return;

  const svg = container.querySelector('svg');
  if (!svg) return;

  const system = svg.querySelector('[data-system], g.system, g[id*="system"]') || svg.querySelector('g');
  if (!system || typeof system.getBBox !== 'function') return;

  let bbox;
  try {
    bbox = system.getBBox();
  } catch (err) {
    console.warn('Auto-fit measurement failed:', err);
    return;
  }

  if (!bbox || bbox.width === 0 || bbox.height === 0) return;

  const padding = 40;
  const availableWidth = Math.max(container.clientWidth - padding, 100);
  const availableHeight = Math.max(container.clientHeight - padding, 100);

  const widthFactor = availableWidth / bbox.width;
  const heightFactor = availableHeight / bbox.height;
  const targetZoom = clamp(Math.min(widthFactor, heightFactor) * DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM);

  if (!force && Math.abs(targetZoom - currentZoom) < 1) {
    return;
  }

  manualZoomActive = false;
  setZoom(targetZoom, { rememberFit: true });
  container.scrollTo({ top: 0, behavior: 'auto' });
}

function setZoom(targetZoom, { rememberFit = false } = {}) {
  currentZoom = clamp(targetZoom, MIN_ZOOM, MAX_ZOOM);
  if (rememberFit) {
    fittedZoom = currentZoom;
  }
  updateZoomDisplay();
  applySvgZoom(currentZoom / DEFAULT_ZOOM);
}

function adjustZoom(delta) {
  manualZoomActive = true;
  setZoom(currentZoom + delta, { rememberFit: false });
}

function resetZoom() {
  manualZoomActive = false;
  setZoom(DEFAULT_ZOOM, { rememberFit: true });
}

// Song Loading ---------------------------------------------------------------

async function loadSong(folderId, fileBase = folderId) {
  if (!folderId || isPlaying) {
    pauseScore();
  }

  ensureAudioContext();

  const scoreDisplay = getScoreDisplay();
  if (scoreDisplay) {
    scoreDisplay.innerHTML = '<p class="placeholder">Loading score...</p>';
  }

  currentSongId = folderId;
  currentMusicXML = null;
  currentMidi = null;
  tempoSegments = [];
  partRegistry.clear();
  soundfonts.clear();
  isReady = false;

  cancelScheduledEvents();
  stopCursorAnimation();

  try {
    await initializeVerovio();

    const xmlPath = `scores/${folderId}/${fileBase}.musicxml`;
    const midiPath = `scores/${folderId}/${fileBase}.mid`;

    const [xmlResponse, midiResponse] = await Promise.all([
      fetch(xmlPath),
      fetch(midiPath)
    ]);

    if (!xmlResponse.ok) {
      throw new Error(`Failed to load MusicXML (${xmlResponse.status})`);
    }
    if (!midiResponse.ok) {
      throw new Error(`Failed to load MIDI (${midiResponse.status})`);
    }

    const xmlText = await xmlResponse.text();
    const midiBuffer = await midiResponse.arrayBuffer();

    currentMusicXML = xmlText;

    manualZoomActive = false;
    currentZoom = DEFAULT_ZOOM;
    fittedZoom = DEFAULT_ZOOM;

    renderScoreSvg();
    autoFitScore(true);

    const partNames = extractPartNamesFromXML(xmlText);
    setupPartControls(partNames);

    currentMidi = parseMidiFile(midiBuffer);
    tempoSegments = buildTempoSegments(currentMidi.tempoMap, currentMidi.ticksPerBeat);
    baseTempoBpm = currentMidi.bpm || 120;

    if (SONG_TEMPO_OVERRIDES[folderId]) {
      baseTempoBpm = SONG_TEMPO_OVERRIDES[folderId];
    }

    updateTempoDisplay();
    updateSeekSlider(0);

    await ensureSoundfontsLoaded();
    mapTracksToParts();

    const placeholder = document.getElementById('placeholder');
    if (placeholder) placeholder.remove();

    isReady = true;
    console.log(`Loaded ${folderId}: ${partRegistry.size} parts, ${currentMidi.tracks.length} MIDI tracks`);
  } catch (err) {
    console.error('Failed to load song:', err);
    if (scoreDisplay) {
      scoreDisplay.innerHTML = `<p style="color: red;">Unable to load score: ${err.message}</p>`;
    }
  }
}

function extractPartNamesFromXML(xmlText) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');
    const partNodes = doc.querySelectorAll('score-part > part-name');
    const names = [];
    partNodes.forEach(node => {
      const text = node.textContent.trim();
      if (text) names.push(text);
    });
    if (names.length === 0) {
      return ['Soprano', 'Alto', 'Tenor', 'Bass', 'Piano'];
    }
    return names;
  } catch (err) {
    console.warn('Could not parse MusicXML part names:', err);
    return ['Soprano', 'Alto', 'Tenor', 'Bass', 'Piano'];
  }
}

function setupPartControls(partNames) {
  const container = getPartControlsContainer();
  if (!container) return;

  container.innerHTML = '';

  partNames.forEach(partName => {
    const instrument = getInstrumentForPart(partName);
    const defaultVolume = 1.0;

    partRegistry.set(partName, {
      name: partName,
      key: normalizeKey(partName),
      instrument,
      enabled: true,
      gain: defaultVolume,
      tracks: [],
      ccVolume: 1.0,
      ccExpression: 1.0,
      sustain: false,
      activeNotes: new Map()
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'part-control';
    wrapper.style.marginBottom = '1rem';

    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.justifyContent = 'space-between';
    label.style.gap = '0.75rem';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.dataset.part = partName;
    checkbox.addEventListener('change', () => {
      const part = partRegistry.get(partName);
      if (!part) return;
      part.enabled = checkbox.checked;
      if (!part.enabled && part.activeNotes) {
        part.activeNotes.forEach(stack => {
          stack.forEach(info => stopNoteNode(info));
          stack.length = 0;
        });
        part.activeNotes.clear();
        part.sustain = false;
      }
    });

    const text = document.createElement('span');
    text.textContent = partName;

    label.appendChild(checkbox);
    label.appendChild(text);

    const sliderContainer = document.createElement('div');
    sliderContainer.style.marginLeft = '1.5rem';
    sliderContainer.style.marginTop = '0.25rem';

    const sliderLabel = document.createElement('label');
    sliderLabel.style.fontSize = '0.85rem';
    sliderLabel.textContent = 'Volume: ';

    const valueSpan = document.createElement('span');
    valueSpan.id = `partVolume-${normalizeKey(partName)}`;
    valueSpan.textContent = `${Math.round(defaultVolume * 100)}%`;

    sliderLabel.appendChild(valueSpan);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '150';
    slider.value = `${Math.round(defaultVolume * 100)}`;
    slider.addEventListener('input', () => {
      const part = partRegistry.get(partName);
      if (!part) return;
      const gain = clamp(parseInt(slider.value, 10) / 100, 0, 1.5);
      part.gain = gain;
      valueSpan.textContent = `${slider.value}%`;
    });

    sliderContainer.appendChild(sliderLabel);
    sliderContainer.appendChild(slider);

    wrapper.appendChild(label);
    wrapper.appendChild(sliderContainer);
    container.appendChild(wrapper);
  });
}

async function ensureSoundfontsLoaded() {
  ensureAudioContext();
  if (typeof Soundfont === 'undefined') {
    throw new Error('soundfont-player library failed to load.');
  }

  const loadPromises = [];
  partRegistry.forEach(part => {
    if (soundfonts.has(part.instrument)) return;

    const promise = Soundfont.instrument(audioContext, part.instrument, {
      soundfont: 'MusyngKite'
    }).then(instrument => {
      soundfonts.set(part.instrument, instrument);
    }).catch(err => {
      console.error(`Failed to load soundfont (${part.instrument}):`, err);
    });

    loadPromises.push(promise);
  });

  await Promise.all(loadPromises);
}

// MIDI Parsing ---------------------------------------------------------------

function parseMidiFile(arrayBuffer) {
  if (typeof MidiParser === 'undefined') {
    throw new Error('MidiParser library is not available.');
  }

  const midi = MidiParser.parse(new Uint8Array(arrayBuffer));
  if (!midi || !Array.isArray(midi.track)) {
    throw new Error('Invalid MIDI data.');
  }

  const ticksPerBeat = midi.timeDivision || 480;
  const tempoMap = [];
  const tracks = [];
  let initialTempoMicros = DEFAULT_MICROSECONDS_PER_QUARTER;

  midi.track.forEach((track, trackIndex) => {
    let absoluteTick = 0;
    let trackName = `Track ${trackIndex + 1}`;
    const events = [];
    let currentVolume = 127;
    let currentExpression = 127;

    track.event.forEach(event => {
      absoluteTick += event.deltaTime || 0;

      if (event.metaType === 3 && event.data) { // Track name
        try {
          trackName = new TextDecoder().decode(new Uint8Array(event.data)).trim() || trackName;
        } catch (err) {
          // Ignore decoding issues
        }
      }

      if (event.type === 255 && event.metaType === 81 && event.data) {
        const microseconds = (event.data[0] << 16) | (event.data[1] << 8) | event.data[2];
        if (microseconds > 0) {
          tempoMap.push({ tick: absoluteTick, microsecondsPerQuarter: microseconds });
          if (absoluteTick === 0) {
            initialTempoMicros = microseconds;
          }
        }
        return;
      }

      if (event.type === 9 && event.data && event.data.length >= 2) {
        const note = event.data[0];
        const velocity = event.data[1];
        if (velocity > 0) {
          events.push({
            type: 'noteOn',
            note,
            velocity,
            time: absoluteTick,
            channel: event.channel ?? null,
            volume: currentVolume,
            expression: currentExpression
          });
        } else {
          events.push({
            type: 'noteOff',
            note,
            time: absoluteTick,
            channel: event.channel ?? null
          });
        }
        return;
      }

      if (event.type === 8 && event.data && event.data.length >= 1) {
        const note = event.data[0];
        events.push({
          type: 'noteOff',
          note,
          time: absoluteTick,
          channel: event.channel ?? null
        });
        return;
      }

      if (event.type === 11 && event.data && event.data.length >= 2) {
        const controller = event.data[0];
        const value = event.data[1];
        events.push({
          type: 'control',
          controller,
          value,
          time: absoluteTick,
          channel: event.channel ?? null
        });

        if (controller === 7) {
          currentVolume = value;
        } else if (controller === 11) {
          currentExpression = value;
        }
        return;
      }

      if (event.type === 12 && event.data && event.data.length >= 1) {
        events.push({
          type: 'program',
          program: event.data[0],
          time: absoluteTick,
          channel: event.channel ?? null
        });
      }
    });

    tracks.push({
      name: trackName,
      events
    });
  });

  const bpm = Math.round(60000000 / initialTempoMicros);
  return {
    ticksPerBeat,
    tempoMap,
    tracks,
    bpm
  };
}

function mapTracksToParts() {
  if (!currentMidi) return;

  const trackNameMap = currentMidi.tracks.map(track => ({
    name: track.name,
    key: normalizeKey(track.name),
    index: currentMidi.tracks.indexOf(track)
  }));

  partRegistry.forEach(part => {
    part.tracks = [];
  });

  partRegistry.forEach(part => {
    const partKey = part.key;
    const instrument = part.instrument;

    let bestMatch = null;
    let bestScore = -Infinity;

    trackNameMap.forEach(track => {
      const score = computeNameMatchScore(part.name, track.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = track;
      }
    });

    if (bestMatch) {
      part.tracks.push(bestMatch.index);
    } else if (instrument === PIANO_INSTRUMENT) {
      // fallback: assign tracks containing piano
      const pianoTrack = trackNameMap.find(track => track.key.includes('piano'));
      if (pianoTrack) {
        part.tracks.push(pianoTrack.index);
      }
    }
  });

  // Ensure all tracks are assigned
  currentMidi.tracks.forEach((track, index) => {
    const alreadyAssigned = Array.from(partRegistry.values()).some(part => part.tracks.includes(index));
    if (alreadyAssigned) return;

    const key = normalizeKey(track.name);

    let fallbackPart = null;
    if (key.includes('piano')) {
      fallbackPart = Array.from(partRegistry.values()).find(part => part.instrument === PIANO_INSTRUMENT);
    } else if (key.includes('baritone')) {
      fallbackPart = partRegistry.get('Baritone') || Array.from(partRegistry.values()).find(part => normalizeName(part.name).includes('baritone'));
    } else if (key.includes('tenor')) {
      fallbackPart = partRegistry.get('Tenor') || Array.from(partRegistry.values()).find(part => normalizeName(part.name).includes('tenor'));
    } else if (key.includes('alto')) {
      fallbackPart = partRegistry.get('Alto') || Array.from(partRegistry.values()).find(part => normalizeName(part.name).includes('alto'));
    } else if (key.includes('soprano')) {
      fallbackPart = partRegistry.get('Soprano') || Array.from(partRegistry.values()).find(part => normalizeName(part.name).includes('soprano'));
    }

    if (!fallbackPart) {
      fallbackPart = Array.from(partRegistry.values())[0];
    }

    if (fallbackPart) {
      fallbackPart.tracks.push(index);
    }
  });
}

function computeNameMatchScore(partName, trackName) {
  const partKey = normalizeName(partName);
  const trackKey = normalizeName(trackName);

  if (!partKey || !trackKey) return -10;
  if (partKey === trackKey) return 100;

  let score = 0;
  if (trackKey.includes(partKey)) score += 40;
  if (partKey.includes(trackKey)) score += 40;

  const tokens = partKey.split(' ');
  tokens.forEach(token => {
    if (token && trackKey.includes(token)) {
      score += 10;
    }
  });

  if (partKey.includes('piano') && trackKey.includes('piano')) score += 20;
  if (partKey.includes('soprano') && trackKey.includes('sop')) score += 20;
  if (partKey.includes('alto') && trackKey.includes('alt')) score += 20;
  if (partKey.includes('tenor') && trackKey.includes('ten')) score += 20;
  if (partKey.includes('bass') && trackKey.includes('bass')) score += 20;
  if (partKey.includes('baritone') && trackKey.includes('bar')) score += 20;

  return score;
}

// Playback -------------------------------------------------------------------

function playScore() {
  if (!isReady || !currentMidi) return;
  ensureAudioContext();

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (isPlaying) return;

  const startBaseSeconds = isPaused ? pausedBaseSeconds : 0;
  if (!isPaused) {
    pausedBaseSeconds = 0;
    pausedRealSeconds = 0;
  }

  schedulePlayback(startBaseSeconds);
  startCursorAnimation();

  isPlaying = true;
  isPaused = false;
  playbackStartTime = audioContext.currentTime;
  console.log('Playback started');
}

function pauseScore() {
  if (!isPlaying) return;

  cancelScheduledEvents();
  stopMetronomeNow();
  partRegistry.forEach(part => {
    if (part.activeNotes) {
      part.activeNotes.forEach(stack => {
        stack.forEach(info => stopNoteNode(info));
        stack.length = 0;
      });
      part.activeNotes.clear();
    }
    part.activeNotes = new Map();
    part.sustain = false;
  });

  const elapsedReal = audioContext.currentTime - playbackStartTime;
  const elapsedBase = elapsedReal * getTempoMultiplier();
  currentSecondsElapsed = pausedBaseSeconds + elapsedBase;
  pausedBaseSeconds = currentSecondsElapsed;
  pausedRealSeconds = elapsedReal;

  isPlaying = false;
  isPaused = true;
  console.log('Playback paused');
}

function restartScore() {
  pauseScore();
  pausedBaseSeconds = 0;
  pausedRealSeconds = 0;
  currentSecondsElapsed = 0;
  updateSeekSlider(0);
  clearHighlights();

  setTimeout(() => playScore(), 120);
}

function schedulePlayback(startBaseSeconds) {
  cancelScheduledEvents();
  stopMetronomeNow();

  const tempoMultiplier = getTempoMultiplier();
  const now = audioContext.currentTime;

  partRegistry.forEach(part => {
    part.activeNotes = new Map();
    part.sustain = false;
  });

  currentMidi.tracks.forEach((track, trackIndex) => {
    const owningPart = Array.from(partRegistry.values()).find(part => part.tracks.includes(trackIndex));
    if (!owningPart || !owningPart.enabled) return;

    const instrument = soundfonts.get(owningPart.instrument);
    if (!instrument) return;

    const ccState = {
      volume: 1.0,
      expression: 1.0,
      sustain: false
    };

    track.events.forEach(event => {
      const eventBaseSeconds = ticksToSeconds(event.time);
      if (eventBaseSeconds < startBaseSeconds - 0.001) {
        if (event.type === 'control') {
          applyControlChange(owningPart, ccState, event);
        }
        return;
      }

      const delaySeconds = (eventBaseSeconds - startBaseSeconds) / tempoMultiplier;
      const scheduledTime = Math.max(now + delaySeconds, now);

      if (event.type === 'control') {
        scheduledEvents.push(setTimeout(() => {
          applyControlChange(owningPart, ccState, event);
        }, Math.max((scheduledTime - audioContext.currentTime) * 1000, 0)));
        return;
      }

      if (event.type === 'noteOn') {
        const stateAtEvent = {
          volume: event.volume !== undefined ? event.volume / 127 : ccState.volume,
          expression: event.expression !== undefined ? event.expression / 127 : ccState.expression,
          sustain: ccState.sustain
        };

        const partGain = percentToGain(owningPart.gain * 100);
        const velocity = Math.pow(event.velocity / 127, 1.1);
        const amplitude = clamp(velocity * stateAtEvent.volume * stateAtEvent.expression * partGain, 0, 1.5);

        const noteStack = ensureNoteStack(owningPart, event.note);
        const noteInfo = {
          note: event.note,
          node: null,
          keyDown: true,
          sustain: stateAtEvent.sustain || owningPart.sustain,
          startTime: scheduledTime,
          stopped: false
        };
        noteStack.push(noteInfo);

        const timeoutId = setTimeout(() => {
          if (!owningPart.enabled) {
            const idx = noteStack.indexOf(noteInfo);
            if (idx >= 0) noteStack.splice(idx, 1);
            pruneNoteStack(owningPart, event.note);
            return;
          }
          try {
            const node = instrument.play(event.note, scheduledTime, {
              gain: amplitude,
              duration: 10
            });
            noteInfo.node = node;
          } catch (err) {
            console.warn('Failed to play note:', err);
            const idx = noteStack.indexOf(noteInfo);
            if (idx >= 0) noteStack.splice(idx, 1);
          }
        }, Math.max((scheduledTime - audioContext.currentTime) * 1000, 0));

        scheduledEvents.push(timeoutId);
      } else if (event.type === 'noteOff') {
        const noteStack = ensureNoteStack(owningPart, event.note);
        const timeoutId = setTimeout(() => {
          for (let i = noteStack.length - 1; i >= 0; i--) {
            const info = noteStack[i];
            if (info.keyDown) {
              info.keyDown = false;
              if (!info.sustain) {
                stopNoteNode(info, scheduledTime);
                noteStack.splice(i, 1);
              }
              break;
            }
          }
          pruneNoteStack(owningPart, event.note);
        }, Math.max((scheduledTime - audioContext.currentTime) * 1000, 0));

        scheduledEvents.push(timeoutId);
      }
    });
  });

  if (metronomeEnabled) {
    scheduleMetronome(startBaseSeconds);
  }
}

function applyControlChange(part, state, event) {
  if (event.controller === 7) {
    state.volume = event.value / 127;
    return;
  }

  if (event.controller === 11) {
    state.expression = event.value / 127;
    return;
  }

  if (event.controller === 64) {
    const engaged = event.value >= 64;
    state.sustain = engaged;
    part.sustain = engaged;

    if (engaged) {
      updateSustainState(part, true);
    } else {
      updateSustainState(part, false);
      releaseSustainedNotes(part);
    }
  }
}

function scheduleMetronome(startBaseSeconds) {
  ensureAudioContext();

  const tempoMapLocal = tempoSegments;
  const totalDuration = estimateSongDuration();
  const tempoMultiplier = getTempoMultiplier();
  const now = audioContext.currentTime;

  let beatIndex = 0;
  const tickStep = currentMidi.ticksPerBeat;

  while (true) {
    const tick = startBaseSeconds <= 0
      ? beatIndex * tickStep
      : secondsToTicks(startBaseSeconds + (beatIndex * (60 / baseTempoBpm)), tempoMapLocal);

    const baseSeconds = ticksToSeconds(tick, tempoMapLocal);
    const realSeconds = (baseSeconds - startBaseSeconds) / tempoMultiplier;

    if (realSeconds < -0.05) {
      beatIndex++;
      continue;
    }
    if (realSeconds > totalDuration - startBaseSeconds + 1) {
      break;
    }

    const clickTime = now + Math.max(realSeconds, 0);
    scheduledEvents.push(setTimeout(() => playMetronomeClick(clickTime), Math.max((clickTime - audioContext.currentTime) * 1000, 0)));
    beatIndex++;
  }
}

function playMetronomeClick(time) {
  if (!metronomeEnabled) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1500, time);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.8, time + 0.01);
  gain.gain.linearRampToValueAtTime(0, time + 0.1);

  osc.connect(gain);
  gain.connect(metronomeGainNode);

  osc.start(time);
  osc.stop(time + 0.12);
}

function toggleMetronome() {
  metronomeEnabled = !metronomeEnabled;
  if (metronomeGainNode) {
    const target = metronomeEnabled ? 0.7 : 0.0;
    metronomeGainNode.gain.setValueAtTime(target, audioContext ? audioContext.currentTime : 0);
  }
  if (!metronomeEnabled) {
    stopMetronomeNow();
  }
}

function toggleAutoScroll() {
  autoScrollEnabled = !autoScrollEnabled;
}

// Cursor & Highlighting -----------------------------------------------------

function startCursorAnimation() {
  if (animationFrameId) return;
  const startTime = audioContext.currentTime - (pausedBaseSeconds / getTempoMultiplier());

  const animate = () => {
    if (!isPlaying) {
      animationFrameId = null;
      return;
    }

    const elapsedReal = audioContext.currentTime - playbackStartTime;
    currentSecondsElapsed = pausedBaseSeconds + elapsedReal * getTempoMultiplier();
    updateSeekSlider(currentSecondsElapsed);
    updateCursorPosition(currentSecondsElapsed);

    animationFrameId = requestAnimationFrame(animate);
  };

  animationFrameId = requestAnimationFrame(animate);
}

function stopCursorAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function updateCursorPosition(baseSeconds) {
  if (!verovioToolkit) return;

  const tick = secondsToTicks(baseSeconds);
  const elements = verovioToolkit.getElementsAtTime(tick);

  if (!elements || !elements.notes) return;
  highlightNotes(elements.notes);
}

function clearHighlights() {
  const display = getScoreDisplay();
  if (!display) return;
  display.querySelectorAll('[data-highlight="active"]').forEach(node => {
    node.removeAttribute('data-highlight');
    node.removeAttribute('fill');
    node.removeAttribute('fill-opacity');
  });
}

function highlightNotes(noteIds) {
  clearHighlights();

  const display = getScoreDisplay();
  if (!display) return;

  noteIds.forEach(id => {
    const element = display.querySelector(`#${CSS.escape(id)}`);
    if (!element) return;
    element.setAttribute('data-highlight', 'active');
    element.setAttribute('fill', '#33e033');
    element.setAttribute('fill-opacity', '0.55');
    if (autoScrollEnabled) {
      element.scrollIntoView({
        block: 'center',
        inline: 'center'
      });
    }
  });
}

function estimateSongDuration() {
  if (!currentMidi) return 0;
  let maxTick = 0;
  currentMidi.tracks.forEach(track => {
    if (track.events.length > 0) {
      const lastEvent = track.events[track.events.length - 1];
      if (lastEvent.time > maxTick) {
        maxTick = lastEvent.time;
      }
    }
  });
  return ticksToSeconds(maxTick);
}

// Seeking -------------------------------------------------------------------

function handleSeekInput(event) {
  if (!currentMidi || !isReady) return;

  const sliderValue = parseInt(event.target.value, 10) || 0;
  const totalDuration = estimateSongDuration();
  const targetBaseSeconds = (sliderValue / 100) * totalDuration;

  pauseScore();
  pausedBaseSeconds = targetBaseSeconds;
  pausedRealSeconds = targetBaseSeconds / getTempoMultiplier();
  currentSecondsElapsed = pausedBaseSeconds;
  updateCursorPosition(pausedBaseSeconds);

  const seekValueDisplay = document.getElementById('seekValue');
  if (seekValueDisplay) {
    seekValueDisplay.textContent = sliderValue;
  }
}

function updateSeekSlider(baseSeconds) {
  const slider = document.getElementById('seekSlider');
  const valueDisplay = document.getElementById('seekValue');
  if (!slider || !valueDisplay) return;

  const total = estimateSongDuration();
  const percent = total > 0 ? clamp((baseSeconds / total) * 100, 0, 100) : 0;
  slider.value = Math.round(percent);
  valueDisplay.textContent = slider.value;
}

// Metronome / Auto-scroll toggles already handled above ---------------------

// Entrypoint -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initializeVerovio();
    ensureAudioContext();
    setupEventListeners();
    updateTempoDisplay();
    updateZoomDisplay();
    console.log('MuseScore-mode rehearsal player ready.');
  } catch (err) {
    console.error('Failed to initialise rehearsal player:', err);
    const display = getScoreDisplay();
    if (display) {
      display.innerHTML = `<p style="color: red;">Failed to initialise player: ${err.message}</p>`;
    }
  }
});
