// Enhanced MusicXML Player with playback controls, part selection, and tempo adjustment

// Song-specific BPM settings (when MIDI files don't have correct tempo)
const SONG_TEMPOS = {
  'our-gift-for-you': 92,
  'candlelight-carol': 92,
  'winter-song': 91,
  'most-wonderful': 180,
};

const VOCAL_INSTRUMENT = 'choir_aahs';
const PIANO_INSTRUMENT = 'acoustic_grand_piano';

let osmdInstance = null;
let audioCtx = null;
let currentTempo = 1.0;
let currentBaseBPM = 120; // Store the base BPM for the current song
let isPlaying = false;
let selectedParts = { Soprano: true, Alto: true, Tenor: true, Bass: true };
let partVolumes = {}; // Store volume for each part (0-1)
let currentPosition = 0;
let currentScorePath = null;
let currentSongName = null;
let midiPlayer = null;
let scheduledNotes = [];
let scheduledCursorTimeouts = [];
let loadedMidiData = {};
let midiPlayers = {};
let masterVolume = 0.5; // Master volume (0-1)
let soundfontInstruments = {}; // Store loaded soundfont instruments
let tempoChanges = []; // Array of tempo changes: [{measureIndex, bpm, timestamp}]
let fittedZoom = 1.0;
let autoFitEnabled = true;
let autoFitResizeTimeout = null;

function getInstrumentForPart(partName = '') {
  const normalized = (partName || '').toLowerCase();

  if (normalized.includes('piano') || normalized.includes('keyboard') || normalized.includes('rhythm')) {
    return PIANO_INSTRUMENT;
  }

  return VOCAL_INSTRUMENT;
}

function clearCursorFollowTimers() {
  scheduledCursorTimeouts.forEach(id => clearTimeout(id));
  scheduledCursorTimeouts = [];
}

function getCurrentZoom() {
  if (!osmdInstance) return 1.0;
  if (typeof osmdInstance.zoom === 'number') {
    return osmdInstance.zoom;
  }
  if (typeof osmdInstance.Zoom === 'number') {
    return osmdInstance.Zoom;
  }
  if (typeof osmdInstance.getZoom === 'function') {
    return osmdInstance.getZoom();
  }
  return 1.0;
}

async function setZoomLevel(targetZoom, options = {}) {
  if (!osmdInstance) return;

  const { markManual = false, rememberAsAutoFit = false } = options;
  const clampedZoom = Math.max(0.3, Math.min(3.0, targetZoom));
  const currentZoom = getCurrentZoom();

  if (markManual) {
    autoFitEnabled = false;
  }

  if (Math.abs(clampedZoom - currentZoom) < 0.001) {
    if (rememberAsAutoFit) {
      fittedZoom = clampedZoom;
    }
    updateZoomDisplay();
    return;
  }

  osmdInstance.zoom = clampedZoom;
  await osmdInstance.render();
  applyPartVisibility();

  if (rememberAsAutoFit) {
    fittedZoom = clampedZoom;
  }

  updateZoomDisplay();
  console.log(`Zoom level set to ${(clampedZoom * 100).toFixed(0)}%`);
}

async function autoFitScore(force = false) {
  if (!osmdInstance) return;
  if (!force && !autoFitEnabled) return;

  const container = document.getElementById('scoreDisplay');
  if (!container) return;

  // Allow layout to settle before measuring
  await new Promise(resolve => requestAnimationFrame(resolve));

  const svg = container.querySelector('svg');
  if (!svg) return;

  let firstSystem = svg.querySelector('.osmd-system, g[data-type="system"], g[id^="osmdSystem"]');
  if (!firstSystem) {
    console.warn('Could not find first system for auto-fit');
    return;
  }

  const bbox = firstSystem.getBBox();
  if (!bbox || bbox.width === 0 || bbox.height === 0) {
    console.warn('Invalid bounding box for first system, skipping auto-fit');
    return;
  }

  const padding = 40; // Allow space around the system
  const availableWidth = Math.max(container.clientWidth - padding, 100);
  const availableHeight = Math.max(container.clientHeight - padding, 100);

  const widthZoom = availableWidth / bbox.width;
  const heightZoom = availableHeight / bbox.height;
  const targetZoom = Math.min(widthZoom, heightZoom);

  autoFitEnabled = true;
  await setZoomLevel(targetZoom, { rememberAsAutoFit: true });
  container.scrollTo({ top: 0, behavior: 'auto' });
  console.log(`Auto-fit applied. First system fits at ${(getCurrentZoom() * 100).toFixed(0)}%`);
}

function scheduleAutoFit() {
  if (!osmdInstance || !autoFitEnabled) return;

  if (autoFitResizeTimeout) {
    clearTimeout(autoFitResizeTimeout);
  }

  autoFitResizeTimeout = setTimeout(() => {
    autoFitResizeTimeout = null;
    autoFitScore();
  }, 150);
}

window.addEventListener('resize', scheduleAutoFit);

function updatePlaybackPosition(measureIndex) {
  currentPosition = measureIndex;

  const seekSlider = document.getElementById("seekSlider");
  if (seekSlider) {
    seekSlider.value = measureIndex;
  }

  const seekValue = document.getElementById("seekValue");
  if (seekValue) {
    seekValue.textContent = measureIndex + 1;
  }
}

// Load and display a MusicXML score
async function loadScore(folderName, displayName) {
  currentSongName = folderName;
  currentScorePath = `scores/${folderName}/${displayName}.musicxml`;

  const container = document.getElementById("scoreDisplay");
  const placeholder = document.getElementById("placeholder");

  if (placeholder) placeholder.style.display = 'none';
  if (container) container.innerHTML = "<p>Loading score...</p>";

  // Check if OpenSheetMusicDisplay is loaded
  if (typeof window.opensheetmusicdisplay === 'undefined' ||
      typeof window.opensheetmusicdisplay.OpenSheetMusicDisplay === 'undefined') {
    if (container) {
      container.innerHTML = "<p style='color: red;' role='alert'>OpenSheetMusicDisplay library not loaded. Check your internet connection or CDN URL.</p>";
    }
    console.error('OpenSheetMusicDisplay not found:', window.opensheetmusicdisplay);
    return;
  }

  try {
    console.log('Loading score from:', currentScorePath);

    // Create new instance each time for proper rendering
    const osmd = new window.opensheetmusicdisplay.OpenSheetMusicDisplay(container, {
      autoResize: true,
      backend: 'svg',
      drawTitle: true,
      drawPartNames: true,
      drawComposer: true,
      drawMeasureNumbers: true,
      drawingParameters: 'compact',
      pageFormat: 'Endless',
      followCursor: true, // Enable automatic scrolling when cursor moves
      cursorsOptions: [{
        type: 0,
        color: '#33e033',
        alpha: 0.5,
        follow: true
      }]
    });

    // Set rendering rules for single-system display
    if (osmd.EngravingRules) {
      osmd.EngravingRules.PageTopMargin = 5;
      osmd.EngravingRules.PageBottomMargin = 5;
      osmd.EngravingRules.SystemTopMargin = 3;
      osmd.EngravingRules.SystemBottomMargin = 3;
      osmd.EngravingRules.SystemLeftMargin = 5;
      osmd.EngravingRules.SystemRightMargin = 5;
      osmd.EngravingRules.MinimumDistanceBetweenSystems = 15;
    }


    console.log('Fetching score...');
    let response = await fetch(currentScorePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch score: ${response.status} ${response.statusText}`);
    }

    console.log('Loading score into OSMD...');
    // Load as text for uncompressed MusicXML
    const xmlText = await response.text();
    await osmd.load(xmlText);

    console.log('Rendering score...');
    await osmd.render();
    console.log('Score rendered successfully!');

    osmdInstance = osmd;

    // Configure cursor for note highlighting
    if (osmd.cursor) {
      osmd.cursor.show();
    }

    // Auto-fit the first system within the viewport
    await autoFitScore(true);

    // Extract and update part names from score
    updatePartNamesFromScore();

    // Apply part visibility based on current selections
    applyPartVisibility();

    // Extract tempo changes from the score
    extractTempoChanges();

    // Load MIDI files for each part
    await loadMidiFiles(folderName);

    // Update seek slider max value
    const seekSlider = document.getElementById("seekSlider");
    const seekValue = document.getElementById("seekValue");
    if (seekSlider && osmdInstance.graphic && osmdInstance.graphic.measureList) {
      seekSlider.max = osmdInstance.graphic.measureList.length;
      if (seekValue) seekValue.textContent = '1'; // Display starting from measure 1
    }

    // Add click-to-seek functionality
    enableClickToSeek();

    // Announce successful load to screen readers
    announceToScreenReader(`Score loaded successfully: ${displayName}`);
    console.log('Score is now visible in the scoreDisplay container');

  } catch (err) {
    console.error("Error loading score:", err);
    const message = err && err.message ? err.message : String(err);
    if (container) {
      container.innerHTML = `<p style='color: red;' role='alert'>Failed to load score: ${message}</p>`;
    }
  }
}

// Extract tempo changes from the MusicXML score
function extractTempoChanges() {
  tempoChanges = [];

  if (!osmdInstance || !osmdInstance.sheet) {
    console.warn('No score loaded, cannot extract tempo changes');
    return;
  }

  try {
    const musicSheet = osmdInstance.sheet;

    // Iterate through all source measures
    for (let i = 0; i < musicSheet.SourceMeasures.length; i++) {
      const measure = musicSheet.SourceMeasures[i];
      const measureIndex = measure.MeasureNumber - 1; // Convert to 0-based index

      // Check all tempo expressions in this measure
      if (measure.TempoExpressions && measure.TempoExpressions.length > 0) {
        for (const tempoExpr of measure.TempoExpressions) {
          let bpm = null;

          // Try to get BPM from tempo expression
          if (tempoExpr.TempoInBpm) {
            bpm = tempoExpr.TempoInBpm;
          } else if (tempoExpr.Label && tempoExpr.Label.text) {
            // Parse text labels like "♩ = 120" or "Allegro (♩ = 120)"
            const text = tempoExpr.Label.text;
            const bpmMatch = text.match(/[=:]\s*(\d+)/);
            if (bpmMatch) {
              bpm = parseInt(bpmMatch[1]);
            }
          }

          if (bpm && bpm > 0) {
            // Calculate timestamp for this tempo change
            const timestamp = measure.AbsoluteTimestamp;
            const timestampMs = timestamp ? timestamp.RealValue * 1000 : 0;

            tempoChanges.push({
              measureIndex: measureIndex,
              bpm: bpm,
              timestamp: timestampMs,
              label: tempoExpr.Label ? tempoExpr.Label.text : `Tempo = ${bpm}`
            });

            console.log(`Tempo change at measure ${measureIndex + 1}: ${bpm} BPM`);
          }
        }
      }

      // Also check for metronome marks in directions
      if (measure.StaffLinkedExpressions) {
        for (const staffExpressions of measure.StaffLinkedExpressions) {
          for (const expression of staffExpressions) {
            if (expression.TempoInBpm) {
              const bpm = expression.TempoInBpm;
              const timestamp = measure.AbsoluteTimestamp;
              const timestampMs = timestamp ? timestamp.RealValue * 1000 : 0;

              tempoChanges.push({
                measureIndex: measureIndex,
                bpm: bpm,
                timestamp: timestampMs,
                label: expression.Label ? expression.Label.text : `Tempo = ${bpm}`
              });

              console.log(`Tempo change at measure ${measureIndex + 1}: ${bpm} BPM (from direction)`);
            }
          }
        }
      }
    }

    // Sort by measure index
    tempoChanges.sort((a, b) => a.measureIndex - b.measureIndex);

    // If we found tempo changes, use the first one as the initial tempo
    if (tempoChanges.length > 0) {
      const initialTempo = tempoChanges[0];
      currentBaseBPM = initialTempo.bpm;
      console.log(`Using initial tempo from score: ${currentBaseBPM} BPM`);
      updateTempoDisplay();
    }

    console.log(`Extracted ${tempoChanges.length} tempo changes:`, tempoChanges);

  } catch (err) {
    console.error('Error extracting tempo changes:', err);
  }
}

// Load MIDI files for all voice parts
async function loadMidiFiles(folderName) {
  loadedMidiData = {};

  console.log('Loading MIDI files for:', folderName);

  // Get part names from the score
  const partNames = Object.keys(selectedParts);
  if (partNames.length === 0) {
    console.warn('No parts found in score');
    return;
  }

  console.log('Attempting to load MIDI for parts:', partNames);

  for (const part of partNames) {
    try {
      const variantSet = new Set([part]);
      const lowerPart = part.toLowerCase();

      if (lowerPart.startsWith('soprano')) {
        variantSet.add('Soprano');
        variantSet.add('Soprano_1');
        variantSet.add('Soprano_2');
      }

      if (lowerPart.startsWith('alto')) {
        variantSet.add('Alto');
        variantSet.add('Alto_1');
        variantSet.add('Alto_2');
      }

      if (lowerPart === 'tenor') {
        variantSet.add('Baritone');
      }

      if (lowerPart === 'baritone') {
        variantSet.add('Tenor');
      }

      if (lowerPart.includes('piano')) {
        variantSet.add('Piano');
        variantSet.add('PIANO');
      }

      if (lowerPart.includes('alto') && lowerPart.includes('2')) {
        variantSet.add('Alto_2');
      }

      const partVariants = Array.from(variantSet);

      const patternSet = new Set();
      for (const variant of partVariants) {
        const trimmed = (variant || '').trim();
        if (!trimmed) continue;

        const variations = new Set([
          trimmed,
          trimmed.replace(/\s+/g, '-'),
          trimmed.replace(/\s+/g, '_')
        ]);

        variations.forEach(nameVariant => {
          if (!nameVariant) return;
          patternSet.add(`scores/${folderName}/${folderName}-${nameVariant}.mid`);
        });
      }

      const patterns = Array.from(patternSet);

      let loaded = false;
      for (const midiPath of patterns) {
        try {
          console.log(`Trying to load: ${midiPath}`);
          const response = await fetch(midiPath);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const parsed = parseMidiFile(arrayBuffer);
            loadedMidiData[part] = {
              buffer: arrayBuffer,
              parsed: parsed
            };
            console.log(`✓ Loaded MIDI for ${part}:`, midiPath, `Events: ${parsed.events?.length || 0}`);
            loaded = true;
            break;
          } else {
            console.log(`  ${response.status} ${response.statusText}`);
          }
        } catch (e) {
          console.log(`  Error: ${e.message}`);
        }
      }

      if (!loaded) {
        console.warn(`✗ No MIDI file found for ${part}`);
      }
    } catch (err) {
      console.warn(`Error loading MIDI for ${part}:`, err);
    }
  }

  console.log('MIDI files loaded:', Object.keys(loadedMidiData));
  console.log('Total loaded:', Object.keys(loadedMidiData).length, 'of', partNames.length);
}

// Parse MIDI file using MidiParser library
function parseMidiFile(arrayBuffer) {
  try {
    if (typeof MidiParser === 'undefined') {
      console.warn('MidiParser not loaded, using fallback');
      return parseMidiFallback(arrayBuffer);
    }

    const midi = MidiParser.parse(new Uint8Array(arrayBuffer));
    const notes = [];
    let currentTime = 0;
    let tempo = 500000; // Default: 120 BPM (microseconds per quarter note)

    if (!midi || !midi.track || midi.track.length === 0) {
      console.warn('Invalid MIDI data');
      return { events: [], ticksPerBeat: 480, bpm: 120 };
    }

    // Get ticks per beat (for timing conversion)
    const ticksPerBeat = midi.timeDivision || 480;

    // Process all tracks to find tempo and notes
    midi.track.forEach((track, trackIndex) => {
      currentTime = 0;
      track.event.forEach(event => {
        currentTime += event.deltaTime || 0;

        // Look for tempo events (type 0xFF51)
        if (event.type === 255 && event.metaType === 81 && event.data) {
          // Tempo is stored as microseconds per quarter note
          const rawTempo = (event.data[0] << 16) | (event.data[1] << 8) | event.data[2];

          // Ignore invalid tempo values (0 or extremely small)
          if (rawTempo > 1000) {
            tempo = rawTempo;
            const bpm = 60000000 / tempo;
            console.log(`Found tempo in track ${trackIndex}: ${bpm} BPM (${tempo} μs/quarter)`);
          } else {
            console.warn(`Ignoring invalid tempo in track ${trackIndex}: ${rawTempo} μs/quarter`);
          }
        }

        if (event.type === 9 && event.data && event.data.length >= 2) {
          // Note on
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
            // Velocity 0 = note off
            notes.push({
              type: 'noteOff',
              note: note,
              time: currentTime
            });
          }
        } else if (event.type === 8 && event.data && event.data.length >= 1) {
          // Note off
          const note = event.data[0];
          notes.push({
            type: 'noteOff',
            note: note,
            time: currentTime
          });
        }
      });
    });

    const bpm = Math.round(60000000 / tempo);
    console.log(`Parsed ${notes.length} MIDI events, ticks per beat: ${ticksPerBeat}, BPM: ${bpm}`);
    return { events: notes, ticksPerBeat: ticksPerBeat, bpm: bpm };
  } catch (err) {
    console.error('MIDI parsing error:', err);
    return parseMidiFallback(arrayBuffer);
  }
}

// Fallback simple parser
function parseMidiFallback(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  const notes = [];
  let i = 0;
  let time = 0;

  while (i < data.length - 3) {
    if (data[i] === 0x90) {
      const note = data[i + 1];
      const velocity = data[i + 2];
      if (velocity > 0) {
        notes.push({ type: 'noteOn', note, velocity, time });
      }
      i += 3;
    } else if (data[i] === 0x80) {
      const note = data[i + 1];
      notes.push({ type: 'noteOff', note, time });
      i += 3;
    } else {
      i++;
    }
    time += 10;
  }

  return { events: notes, ticksPerBeat: 480 };
}

// Play MIDI files
async function playMidiFiles() {
  const startTime = audioCtx.currentTime;

  // Get BPM - priority: MusicXML tempo > song-specific tempo > MIDI file > default
  let bpm = 120; // Default
  let ticksPerBeat = 480;

  // First priority: Tempo from MusicXML (if extracted)
  if (tempoChanges.length > 0) {
    bpm = tempoChanges[0].bpm;
    console.log(`Using initial BPM from MusicXML: ${bpm}`);
  }
  // Second priority: Song-specific manual override
  else if (currentSongName && SONG_TEMPOS[currentSongName]) {
    bpm = SONG_TEMPOS[currentSongName];
    console.log(`Using song-specific BPM: ${bpm} for ${currentSongName}`);
  }
  // Third priority: MIDI file tempo
  else {
    for (const part in loadedMidiData) {
      const parsed = loadedMidiData[part].parsed;
      if (parsed && parsed.bpm && isFinite(parsed.bpm) && parsed.bpm > 0) {
        bpm = parsed.bpm;
        ticksPerBeat = parsed.ticksPerBeat || 480;
        console.log(`Using BPM from MIDI: ${bpm}, ticks per beat: ${ticksPerBeat}`);
        break;
      }
    }
  }

  // Get ticks per beat from MIDI
  for (const part in loadedMidiData) {
    const parsed = loadedMidiData[part].parsed;
    if (parsed && parsed.ticksPerBeat) {
      ticksPerBeat = parsed.ticksPerBeat;
      break;
    }
  }

  // Final safety check
  if (!isFinite(bpm) || bpm <= 0) {
    console.warn('Invalid BPM detected, using default 120');
    bpm = 120;
  }

  console.log(`Final BPM: ${bpm}, ticks per beat: ${ticksPerBeat}`);

  // Store the base BPM for tempo display
  currentBaseBPM = bpm;
  updateTempoDisplay();

  // Calculate time offset if starting from a specific position
  let timeOffsetMs = 0;
  if (currentPosition > 0 && osmdInstance && osmdInstance.cursor) {
    // Build cursor timestamps to find exact time at target measure
    const msPerBeat = 60000 / bpm;

    try {
      osmdInstance.cursor.reset();
      let foundTime = false;

      while (!osmdInstance.cursor.iterator.EndReached) {
        const iterator = osmdInstance.cursor.iterator;
        const timestamp = iterator.CurrentSourceTimestamp;
        const measureIndex = iterator.CurrentMeasureIndex || 0;

        // When we reach the target measure, use its timestamp
        if (measureIndex >= currentPosition && timestamp) {
          const timeMs = timestamp.RealValue * msPerBeat * 4; // RealValue is in quarter notes
          timeOffsetMs = timeMs;
          foundTime = true;
          console.log(`Found exact time for measure ${currentPosition}: ${timeOffsetMs}ms (timestamp: ${timestamp.RealValue})`);
          break;
        }

        osmdInstance.cursor.next();
      }

      if (!foundTime) {
        console.warn(`Could not find timestamp for measure ${currentPosition}, using fallback calculation`);
        // Fallback: use proportional calculation
        const totalMeasures = osmdInstance.graphic.measureList.length;
        let totalDurationTicks = 0;
        for (const part in loadedMidiData) {
          const parsed = loadedMidiData[part].parsed;
          if (parsed && parsed.events && parsed.events.length > 0) {
            const lastEvent = parsed.events[parsed.events.length - 1];
            totalDurationTicks = Math.max(totalDurationTicks, lastEvent.time);
          }
        }
        const msPerTick = (60000 / bpm) / ticksPerBeat;
        const totalDuration = totalDurationTicks * msPerTick;
        const progress = currentPosition / totalMeasures;
        timeOffsetMs = totalDuration * progress;
      }
    } catch (e) {
      console.warn('Error calculating time offset:', e);
    }

    console.log(`Starting from measure ${currentPosition}, time offset: ${timeOffsetMs}ms`);
  }

  // Play each selected part's MIDI
  for (const [part, enabled] of Object.entries(selectedParts)) {
    if (!enabled || !loadedMidiData[part]) continue;

    const midiData = loadedMidiData[part];

    if (midiData.parsed) {
      scheduleMidiNotes(midiData.parsed, startTime, part, bpm, timeOffsetMs);
    }
  }

  // Start cursor following
  followCursorWithMidi(startTime, bpm, timeOffsetMs);
}

// Schedule MIDI notes for playback
function scheduleMidiNotes(parsedData, startTime, part, bpm, timeOffsetMs = 0) {
  // Track active notes by pitch to match note-on with note-off
  const activeNotes = new Map();

  const events = parsedData.events || parsedData;
  const ticksPerBeat = parsedData.ticksPerBeat || 480;

  // Get volume for this part
  const partVolume = partVolumes[part] || 1.0;

  // Convert ticks to milliseconds
  const msPerTick = (60000 / bpm) / ticksPerBeat;

  console.log(`Scheduling notes for ${part}, volume: ${partVolume}, events: ${events.length}, msPerTick: ${msPerTick}`);

  let scheduledCount = 0;
  let skippedCount = 0;

  events.forEach(event => {
    const eventTimeMs = event.time * msPerTick;

    // Skip events before the offset
    if (eventTimeMs < timeOffsetMs) return;

    const adjustedTimeMs = eventTimeMs - timeOffsetMs;
    const eventTime = startTime + (adjustedTimeMs / 1000) / currentTempo;

    if (event.type === 'noteOn') {
      const noteId = `${part}_${event.note}_${Math.random()}`;

      const delayMs = (eventTime - audioCtx.currentTime) * 1000;
      if (delayMs < 0) {
        skippedCount++;
        return; // Skip notes that should have already played
      }

      const timeoutId = setTimeout(() => {
        if (isPlaying) {
          // Apply part volume to velocity
          const adjustedVelocity = (event.velocity / 127) * partVolume;
          midiPlayer.noteOn(event.note, adjustedVelocity, noteId, part); // Pass part name
          // Store this noteId so we can turn it off later
          activeNotes.set(event.note, noteId);
        }
      }, delayMs);

      scheduledNotes.push(timeoutId);
      scheduledCount++;

    } else if (event.type === 'noteOff') {
      const delayMs = (eventTime - audioCtx.currentTime) * 1000;
      if (delayMs < 0) {
        skippedCount++;
        return; // Skip notes that should have already stopped
      }

      const timeoutId = setTimeout(() => {
        if (isPlaying) {
          // Find the most recent note-on for this pitch
          const noteId = activeNotes.get(event.note);
          if (noteId) {
            midiPlayer.noteOff(noteId);
            activeNotes.delete(event.note);
          }
        }
      }, delayMs);

      scheduledNotes.push(timeoutId);
    }
  });

  console.log(`Scheduled ${scheduledCount} events for ${part}, skipped ${skippedCount}`);
}

// Soundfont-based MIDI player with realistic instruments
class SoundfontPlayer {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.activeNotes = new Map();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = masterVolume;
    this.masterGain.connect(this.ctx.destination);
    this.instruments = {};
    this.loadingInstruments = new Set();
  }

  async loadInstrument(instrumentName, partName) {
    if (this.instruments[partName] || this.loadingInstruments.has(partName)) {
      return;
    }

    this.loadingInstruments.add(partName);

    try {
      console.log(`Loading ${instrumentName} instrument for ${partName}...`);

      // Use soundfont-player library
      if (typeof Soundfont !== 'undefined') {
        const instrument = await Soundfont.instrument(this.ctx, instrumentName, {
          soundfont: 'MusyngKite', // High-quality soundfont
          gain: 1.0
        });

        this.instruments[partName] = instrument;
        console.log(`✓ Loaded ${instrumentName} for ${partName}`);
      } else {
        console.warn('Soundfont library not loaded, using fallback');
        this.instruments[partName] = null;
      }
    } catch (error) {
      console.error(`Error loading instrument for ${partName}:`, error);
      this.instruments[partName] = null;
    } finally {
      this.loadingInstruments.delete(partName);
    }
  }

  noteOn(pitch, velocity = 0.5, noteId = null, partName = 'default') {
    if (pitch < 0 || pitch > 127 || isNaN(pitch)) {
      console.warn('Invalid MIDI pitch:', pitch);
      return;
    }

    const instrument = this.instruments[partName];

    if (instrument && instrument.play) {
      // Calculate gain from velocity and master volume
      const gain = velocity * masterVolume * (partVolumes[partName] || 1.0);

      // Play using soundfont
      const audioNode = instrument.play(pitch, this.ctx.currentTime, {
        duration: 10, // Long duration, we'll stop it manually
        gain: gain
      });

      const key = noteId || `${partName}_${pitch}`;
      this.activeNotes.set(key, { audioNode, instrument, pitch });

      return key;
    } else {
      // Fallback to simple synth if soundfont not loaded
      return this.noteOnFallback(pitch, velocity, noteId);
    }
  }

  noteOnFallback(pitch, velocity = 0.5, noteId = null) {
    const freq = 440 * Math.pow(2, (pitch - 69) / 12);
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gainNode);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(velocity * masterVolume * 0.3, now + 0.05);
    gainNode.connect(this.masterGain);

    osc.start(now);

    const key = noteId || pitch;
    this.activeNotes.set(key, { oscillator: osc, gain: gainNode });

    return key;
  }

  noteOff(noteId) {
    if (this.activeNotes.has(noteId)) {
      const noteData = this.activeNotes.get(noteId);
      const now = this.ctx.currentTime;

      try {
        if (noteData.audioNode && noteData.audioNode.stop) {
          // Soundfont note
          noteData.audioNode.stop(now);
        } else if (noteData.oscillator) {
          // Fallback oscillator
          noteData.gain.gain.cancelScheduledValues(now);
          noteData.gain.gain.setValueAtTime(noteData.gain.gain.value, now);
          noteData.gain.gain.linearRampToValueAtTime(0, now + 0.1);
          noteData.oscillator.stop(now + 0.1);
        }
      } catch (e) {
        console.warn('Error stopping note:', e);
      }

      this.activeNotes.delete(noteId);
    }
  }

  stopAll() {
    this.activeNotes.forEach((note, id) => {
      this.noteOff(id);
    });
    this.activeNotes.clear();
  }

  updateMasterVolume(volume) {
    this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
  }
}

// Play the score with MIDI files
async function playScore() {
  if (isPlaying) return;

  clearCursorFollowTimers();

  if (!osmdInstance || Object.keys(loadedMidiData).length === 0) {
    alert('No score or MIDI files loaded. Please select a song first.');
    return;
  }

  isPlaying = true;

  // Create or resume audio context
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    console.log('Created new AudioContext, state:', audioCtx.state);
  }

  // Resume audio context if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    console.log('Resuming suspended AudioContext...');
    await audioCtx.resume();
    console.log('AudioContext resumed, state:', audioCtx.state);
  }

  if (!midiPlayer) {
    midiPlayer = new SoundfontPlayer(audioCtx);
    console.log('Created new SoundfontPlayer');
  }

  const partNames = Object.keys(selectedParts);
  await Promise.all(partNames.map(async (part) => {
    const instrumentName = getInstrumentForPart(part);
    await midiPlayer.loadInstrument(instrumentName, part);
  }));

  console.log('Starting playback with', Object.keys(loadedMidiData).length, 'MIDI files loaded');

  // Enable cursor for visual feedback
  if (osmdInstance.cursor) {
    osmdInstance.cursor.show();
    osmdInstance.cursor.reset();

    // Move cursor to current position if not starting from beginning
    if (currentPosition > 0) {
      for (let i = 0; i < currentPosition; i++) {
        osmdInstance.cursor.next();
      }
    }
  }

  // Play MIDI files for selected parts
  await playMidiFiles();

  announceToScreenReader('Playback started');
}

// Pause playback
function pauseScore() {
  isPlaying = false;

  // Clear scheduled notes FIRST before stopping synth
  scheduledNotes.forEach(id => clearTimeout(id));
  scheduledNotes = [];
  clearCursorFollowTimers();

  // Stop all playing notes in the synthesizer
  if (midiPlayer) {
    midiPlayer.stopAll();
  }

  // Keep cursor visible when paused
  // (Don't hide it - user should see where they paused)

  announceToScreenReader('Playback paused');
}

// Restart playback from the beginning
function restartScore() {
  const wasPlaying = isPlaying;

  // Pause current playback if playing
  if (wasPlaying) {
    pauseScore();
  }

  // Reset to beginning
  currentPosition = 0;
  seekToMeasure(0);

  // Auto-start playback
  setTimeout(() => {
    playScore();
  }, 100);

  announceToScreenReader('Restarting from beginning');
}

// Set absolute tempo in BPM
function setAbsoluteTempo(bpm) {
  const targetBPM = parseInt(bpm);
  currentTempo = targetBPM / currentBaseBPM;

  const tempoValue = document.getElementById("tempoValue");
  const tempoSlider = document.getElementById("tempoSlider");

  if (tempoValue) tempoValue.textContent = targetBPM;
  if (tempoSlider) tempoSlider.value = targetBPM;

  console.log(`Tempo set to ${targetBPM} BPM (multiplier: ${currentTempo.toFixed(2)})`);
}

// Update tempo display and slider to match current base BPM
function updateTempoDisplay() {
  const targetBPM = Math.round(currentBaseBPM * currentTempo);
  const tempoValue = document.getElementById("tempoValue");
  const tempoSlider = document.getElementById("tempoSlider");

  if (tempoValue) tempoValue.textContent = targetBPM;
  if (tempoSlider) tempoSlider.value = targetBPM;
}

// Adjust master volume (live adjustment)
function changeMasterVolume(value) {
  masterVolume = value / 100;
  const volumeValue = document.getElementById("masterVolumeValue");
  if (volumeValue) volumeValue.textContent = value;

  // Update the player's master volume in real-time
  if (midiPlayer && midiPlayer.updateMasterVolume) {
    midiPlayer.updateMasterVolume(masterVolume);
  }

  console.log('Master volume changed to:', masterVolume);
}

// Toggle individual voice parts
function togglePart(part, enabled) {
  selectedParts[part] = enabled;
  console.log("Part toggled:", part, enabled);

  // Apply visibility changes to the score
  applyPartVisibility();
}

// Update part names from the loaded score
function updatePartNamesFromScore() {
  if (!osmdInstance || !osmdInstance.sheet) return;

  const instruments = osmdInstance.sheet.Instruments;
  const partNames = [];

  for (const instrument of instruments) {
    const name = instrument.Name || instrument.NameLabel?.text || '';
    if (name) {
      partNames.push(name.trim());
    }
  }

  console.log('Parts found in score:', partNames);

  // Update the part selector checkboxes
  const partSelector = document.querySelector('.part-selector');
  if (!partSelector) return;

  // Clear existing checkboxes (except the h3)
  const labels = partSelector.querySelectorAll('label');
  labels.forEach(label => label.remove());
  const sliders = partSelector.querySelectorAll('.volume-slider-container');
  sliders.forEach(slider => slider.remove());

  // Reset selectedParts to match score
  selectedParts = {};
  partVolumes = {};

  // Create new checkboxes and volume sliders for each part
  partNames.forEach(partName => {
    selectedParts[partName] = true;
    const defaultVolume = 1.0;
    partVolumes[partName] = defaultVolume;

    // Create container for this part
    const partContainer = document.createElement('div');
    partContainer.className = 'part-control';
    partContainer.style.marginBottom = '0.75rem';

    // Create checkbox
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.id = `part${partName.replace(/\s+/g, '')}`;
    checkbox.onchange = function() {
      togglePart(partName, this.checked);
    };

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + partName));
    partContainer.appendChild(label);

    // Create volume slider container
    const volumeContainer = document.createElement('div');
    volumeContainer.className = 'volume-slider-container';
    volumeContainer.style.marginLeft = '1.5rem';
    volumeContainer.style.marginTop = '0.25rem';

    const volumeLabel = document.createElement('label');
    volumeLabel.style.fontSize = '0.85rem';
    volumeLabel.style.display = 'block';
    volumeLabel.textContent = 'Volume: ';

    const initialVolumePercent = Math.round(defaultVolume * 100);
    const volumeValue = document.createElement('span');
    volumeValue.id = `volume${partName.replace(/\s+/g, '')}`;
    volumeValue.textContent = `${initialVolumePercent}%`;
    volumeLabel.appendChild(volumeValue);

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '100';
    volumeSlider.value = `${initialVolumePercent}`;
    volumeSlider.style.width = '100%';
    volumeSlider.oninput = function() {
      const volume = this.value / 100;
      partVolumes[partName] = volume;
      volumeValue.textContent = this.value + '%';
    };

    volumeContainer.appendChild(volumeLabel);
    volumeContainer.appendChild(volumeSlider);
    partContainer.appendChild(volumeContainer);

    partSelector.appendChild(partContainer);
  });
}

// Apply part visibility based on selection
function applyPartVisibility() {
  if (!osmdInstance || !osmdInstance.graphic) return;

  const container = document.getElementById('scoreDisplay');
  if (!container) return;

  // Get all staff lines (SVG groups)
  const staffGroups = container.querySelectorAll('g[class*="vf-staff"]');

  staffGroups.forEach((group) => {
    // Try to find the part name from nearby text elements
    const parent = group.parentElement;
    if (!parent) return;

    // Look for part labels
    const textElements = parent.querySelectorAll('text');
    let partName = '';

    textElements.forEach(text => {
      const content = text.textContent.trim();
      // Check against actual part names in selectedParts
      for (const name in selectedParts) {
        if (content.includes(name) || content === name) {
          partName = name;
        }
      }
    });

    // Hide/show based on selection
    if (partName && !selectedParts[partName]) {
      group.style.opacity = '0.15';
      group.style.pointerEvents = 'none';
    } else if (partName) {
      group.style.opacity = '1';
      group.style.pointerEvents = 'auto';
    }
  });
}

// Enable click-to-seek on score measures
function enableClickToSeek() {
  if (!osmdInstance || !osmdInstance.graphic) {
    console.log('Cannot enable click to seek - no osmd or graphic');
    return;
  }

  const container = document.getElementById('scoreDisplay');
  if (!container) {
    console.log('Cannot enable click to seek - no container');
    return;
  }

  // Remove existing listener if any
  container.onclick = null;

  console.log('Click to seek enabled');

  // Add click handler to the container
  container.onclick = (event) => {
    console.log('Score clicked at', event.clientX, event.clientY);

    // Check if we clicked directly on a note element
    let clickedElement = event.target;
    let clickedMeasure = null;

    // Traverse up the DOM to find measure information
    while (clickedElement && clickedElement !== container) {
      // Check if this element has measure data
      if (clickedElement.classList && clickedElement.classList.contains('vf-stavenote')) {
        // Try to find the measure this note belongs to
        console.log('Clicked on a note element');
        break;
      }
      clickedElement = clickedElement.parentElement;
    }

    // Find if we clicked on a measure
    const measureList = osmdInstance.graphic.measureList;
    if (!measureList) {
      console.log('No measure list');
      return;
    }

    // Get click coordinates
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left + container.scrollLeft;
    const y = event.clientY - rect.top + container.scrollTop;

    console.log('Relative click position:', x, y, 'Measure count:', measureList.length);

    // Find the closest measure
    let closestMeasure = 0;
    let closestDistance = Infinity;

    measureList.forEach((measures, index) => {
      if (!Array.isArray(measures)) {
        measures = [measures];
      }

      measures.forEach(measure => {
        if (measure.PositionAndShape) {
          const measureX = measure.PositionAndShape.AbsolutePosition.x * 10;
          const measureY = measure.PositionAndShape.AbsolutePosition.y * 10;
          const measureWidth = measure.PositionAndShape.Size.width * 10;
          const measureHeight = measure.PositionAndShape.Size.height * 10;

          // Check if click is within measure bounds
          if (x >= measureX && x <= measureX + measureWidth &&
              y >= measureY && y <= measureY + measureHeight) {
            const distance = Math.abs(x - measureX);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestMeasure = index;
            }
          }
        }
      });
    });

    console.log('Closest measure:', closestMeasure, 'distance:', closestDistance);

    // Seek to the clicked measure
    if (closestDistance < Infinity) {
      console.log('Seeking to measure:', closestMeasure);

      const wasPlaying = isPlaying;

      // Stop current playback if playing
      if (wasPlaying) {
        pauseScore();
      }

      // Seek to the clicked position
      seekToMeasure(closestMeasure);

      // Restart playback from this position if it was playing
      if (wasPlaying) {
        console.log('Restarting playback from measure', closestMeasure);
        setTimeout(() => {
          playScore();
        }, 100);
      }
    } else {
      console.log('Click did not match any measure');
    }
  };
}

// Follow cursor with MIDI timing (with tempo changes)
function followCursorWithMidi(startTimeSeconds, initialBpm, timeOffsetMs = 0) {
  if (!osmdInstance || !osmdInstance.cursor || !isPlaying) {
    console.log('Cannot follow cursor:', { hasOsmd: !!osmdInstance, hasCursor: !!osmdInstance?.cursor, isPlaying });
    return;
  }

  clearCursorFollowTimers();

  console.log('Cursor timing setup:', {
    initialBpm,
    tempoChanges: tempoChanges.length,
    timeOffsetMs,
    startingAtMeasure: currentPosition,
    currentTempo
  });

  const getTempoForMeasure = (measureIndex) => {
    if (!tempoChanges || tempoChanges.length === 0) {
      return initialBpm;
    }

    let bpm = tempoChanges[0].bpm || initialBpm;
    for (let i = 0; i < tempoChanges.length; i++) {
      const change = tempoChanges[i];
      if (measureIndex >= change.measureIndex) {
        bpm = change.bpm;
      } else {
        break;
      }
    }
    return bpm || initialBpm;
  };

  const cursorTimestamps = [];
  try {
    osmdInstance.cursor.reset();
    let timestampIndex = 0;

    while (!osmdInstance.cursor.iterator.EndReached) {
      const iterator = osmdInstance.cursor.iterator;
      const timestamp = iterator.CurrentSourceTimestamp;
      const measureIndex = iterator.CurrentMeasureIndex || 0;

      if (timestamp) {
        const applicableBpm = getTempoForMeasure(measureIndex);
        const msPerBeat = 60000 / applicableBpm;
        const timeMs = timestamp.RealValue * msPerBeat * 4; // RealValue is in whole notes

        cursorTimestamps.push({
          index: timestampIndex,
          timeMs,
          measureIndex
        });
      }

      osmdInstance.cursor.next();
      timestampIndex++;
    }

    osmdInstance.cursor.reset();
  } catch (e) {
    console.warn('Error building cursor timestamps:', e);
  }

  console.log(`Built ${cursorTimestamps.length} cursor timestamps`);

  if (cursorTimestamps.length === 0) {
    return;
  }

  let startIndex = cursorTimestamps.findIndex(entry => entry.measureIndex >= currentPosition);
  if (startIndex === -1) {
    startIndex = cursorTimestamps.length - 1;
  }

  const offsetIndex = cursorTimestamps.findIndex(entry => entry.timeMs >= timeOffsetMs - 1);
  if (offsetIndex !== -1) {
    startIndex = Math.min(startIndex, offsetIndex);
  }

  try {
    osmdInstance.cursor.reset();
    for (let i = 0; i < startIndex; i++) {
      if (osmdInstance.cursor.iterator.EndReached) {
        break;
      }
      osmdInstance.cursor.next();
    }
  } catch (e) {
    console.warn('Error positioning cursor for playback:', e);
  }

  let lastCursorIndex = startIndex;
  const initialMeasure = cursorTimestamps[startIndex]?.measureIndex ?? 0;
  updatePlaybackPosition(initialMeasure);
  scrollToCursor();

  const scheduleCursorStep = (targetIndex) => {
    if (!isPlaying) return;

    const timestamp = cursorTimestamps[targetIndex];
    if (!timestamp) return;

    const relativeMs = timestamp.timeMs - timeOffsetMs;
    const adjustedMs = relativeMs < -10 ? null : Math.max(relativeMs, 0);
    if (adjustedMs === null) {
      return;
    }

    const targetSeconds = startTimeSeconds + (adjustedMs / 1000) / currentTempo;
    const nowSeconds = audioCtx ? audioCtx.currentTime : 0;
    const delayMs = (targetSeconds - nowSeconds) * 1000;

    const trigger = () => {
      if (!isPlaying || !osmdInstance || !osmdInstance.cursor) return;

      try {
        const steps = targetIndex - lastCursorIndex;
        for (let step = 0; step < steps; step++) {
          if (!osmdInstance.cursor.iterator.EndReached) {
            osmdInstance.cursor.next();
          }
        }
        lastCursorIndex = targetIndex;

        updatePlaybackPosition(timestamp.measureIndex);
        scrollToCursor();
      } catch (err) {
        console.warn('Cursor movement error:', err);
      }
    };

    if (delayMs <= 0) {
      trigger();
    } else {
      const timeoutId = setTimeout(trigger, delayMs);
      scheduledCursorTimeouts.push(timeoutId);
    }
  };

  for (let i = startIndex; i < cursorTimestamps.length; i++) {
    scheduleCursorStep(i);
  }
}

// Zoom in
async function zoomIn() {
  if (!osmdInstance) return;

  const currentZoom = getCurrentZoom();
  const newZoom = Math.min(currentZoom + 0.1, 3.0); // Max 300%

  await setZoomLevel(newZoom, { markManual: true });
}

// Zoom out
async function zoomOut() {
  if (!osmdInstance) return;

  const currentZoom = getCurrentZoom();
  const newZoom = Math.max(currentZoom - 0.1, 0.3); // Min 30%

  await setZoomLevel(newZoom, { markManual: true });
}

// Reset zoom to auto-fit
async function resetZoom() {
  if (!osmdInstance) return;

  await autoFitScore(true);
}

// Update zoom display
function updateZoomDisplay() {
  if (!osmdInstance) return;

  const zoomPercent = Math.round(getCurrentZoom() * 100);
  const zoomValue = document.getElementById("zoomValue");
  if (zoomValue) zoomValue.textContent = zoomPercent;
}

// Auto-scroll to keep cursor in view
function scrollToCursor() {
  if (!osmdInstance || !osmdInstance.cursor) return;

  const container = document.getElementById('scoreDisplay');
  if (!container) return;

  try {
    // Find the cursor element in the DOM
    const cursorElements = container.querySelectorAll('rect[fill="#33e033"], rect[style*="rgb(51, 224, 51)"]');

    if (cursorElements.length > 0) {
      const cursorElem = cursorElements[0];
      const cursorRect = cursorElem.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Check if cursor is out of view
      const isOutOfView = cursorRect.top < containerRect.top + 50 ||
                          cursorRect.bottom > containerRect.bottom - 50 ||
                          cursorRect.left < containerRect.left + 50 ||
                          cursorRect.right > containerRect.right - 50;

      if (isOutOfView) {
        // Scroll to bring cursor into view
        cursorElem.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    }
  } catch (e) {
    console.warn('Error scrolling to cursor:', e);
  }
}

// Seek to a specific measure
function seekToMeasure(measure) {
  const targetMeasure = parseInt(measure);
  updatePlaybackPosition(targetMeasure);

  console.log("Seek to measure:", currentPosition);

  // Move cursor to the specified measure
  if (osmdInstance && osmdInstance.cursor) {
    osmdInstance.cursor.show();
    osmdInstance.cursor.reset();

    try {
      // Advance cursor to the first timestamp of the target measure
      let currentMeasureIndex = 0;
      while (!osmdInstance.cursor.iterator.EndReached) {
        const iterator = osmdInstance.cursor.iterator;
        currentMeasureIndex = iterator.CurrentMeasureIndex || 0;

        // Stop when we reach the target measure
        if (currentMeasureIndex >= currentPosition) {
          break;
        }

        osmdInstance.cursor.next();
      }

      console.log(`Cursor positioned at measure ${currentMeasureIndex}`);
    } catch (e) {
      console.warn('Error seeking to measure:', e);
    }
  }
}

// Extract notes from the score for MIDI playback
function extractNotes() {
  if (!osmdInstance || !osmdInstance.sheet) return [];

  const notes = [];

  try {
    const instruments = osmdInstance.sheet.Instruments;

    for (const instrument of instruments) {
      const partName = instrument.Name || '';
      let isSelectedPart = false;

      // Check if this part is selected
      for (const [key, value] of Object.entries(selectedParts)) {
        if (value && partName.toLowerCase().includes(key.toLowerCase())) {
          isSelectedPart = true;
          break;
        }
      }

      if (!isSelectedPart) continue;

      console.log('Processing part:', partName);

      // Get voices from this instrument
      for (const voice of instrument.Voices) {
        let currentTime = 0;

        for (const voiceEntry of voice.VoiceEntries) {
          const timestamp = voiceEntry.Timestamp;
          const duration = (voiceEntry.Length ? voiceEntry.Length.RealValue : 0.25) * 2000; // Convert to ms

          for (const note of voiceEntry.Notes) {
            if (note.Pitch && !note.IsRestFlag) {
              // Calculate MIDI pitch correctly
              // FundamentalNote: 0=C, 1=D, 2=E, 3=F, 4=G, 5=A, 6=B
              // Octave: MIDI octave
              // Accidental: -2=double flat, -1=flat, 0=natural, 1=sharp, 2=double sharp
              const fundamentalNote = note.Pitch.FundamentalNote;
              const octave = note.Pitch.Octave;
              const accidental = note.Pitch.Accidental || 0;

              // MIDI note number: C4 = 60
              // Map fundamental note to semitones from C: C=0, D=2, E=4, F=5, G=7, A=9, B=11
              const noteMap = [0, 2, 4, 5, 7, 9, 11];
              const basePitch = noteMap[fundamentalNote] || 0;
              const midiPitch = (octave + 1) * 12 + basePitch + accidental;

              console.log(`Note: ${['C','D','E','F','G','A','B'][fundamentalNote]}${octave} -> MIDI ${midiPitch} (${440 * Math.pow(2, (midiPitch - 69) / 12)}Hz)`);

              notes.push({
                time: currentTime,
                pitch: midiPitch,
                duration: duration,
                part: partName,
                noteElement: note
              });
            }
          }

          currentTime += duration;
        }
      }
    }

    // Sort by time
    notes.sort((a, b) => a.time - b.time);
    console.log(`Extracted ${notes.length} notes`);
    return notes;

  } catch (err) {
    console.error('Error extracting notes:', err);
    console.error('Stack:', err.stack);
    return [];
  }
}

// Build a map of notes to their SVG elements for precise highlighting
function buildNoteMap() {
  if (!osmdInstance || !osmdInstance.graphic) return new Map();

  const noteMap = new Map();
  const container = document.getElementById('scoreDisplay');
  if (!container) return noteMap;

  // Get all graphical notes from OSMD
  try {
    const graphicalMusicSheet = osmdInstance.graphic;
    let noteId = 0;

    // Traverse the rendered score
    for (const page of graphicalMusicSheet.MusicPages) {
      for (const system of page.MusicSystems) {
        for (const staffLine of system.StaffLines) {
          for (const measure of staffLine.Measures) {
            for (const staffEntry of measure.staffEntries) {
              for (const graphicalNote of staffEntry.graphicalVoiceEntries[0]?.notes || []) {
                if (graphicalNote.sourceNote && !graphicalNote.sourceNote.isRest()) {
                  const pitch = graphicalNote.sourceNote.pitch;
                  if (pitch) {
                    const midiPitch = pitch.getHalfTone() + 60;

                    noteMap.set(noteId, {
                      svgElement: graphicalNote,
                      midiPitch: midiPitch,
                      sourceNote: graphicalNote.sourceNote
                    });
                    noteId++;
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not build note map:', err);
  }

  console.log(`Built note map with ${noteMap.size} notes`);
  return noteMap;
}

// Play score with MIDI synthesis and note highlighting
async function playWithMidi() {
  if (!osmdInstance) {
    isPlaying = false;
    return;
  }

  // Try advanced note extraction first
  let notes = extractNotes();

  if (notes.length === 0) {
    console.warn('No notes extracted, using simpler playback with basic chords');
    // Use simpler chord-based playback
    await playWithChords();
    return;
  }

  console.log(`Playing ${notes.length} notes`);
  const startTime = Date.now();
  let noteIndex = 0;
  const activeNoteIds = new Map();

  function scheduleNextNotes() {
    if (!isPlaying) {
      midiPlayer.stopAll();
      clearHighlighting();
      return;
    }

    const elapsed = (Date.now() - startTime) * currentTempo;

    // Schedule note-ons
    while (noteIndex < notes.length && notes[noteIndex].time <= elapsed + 100) {
      const note = notes[noteIndex];
      const noteId = `note_${noteIndex}`;

      // Play MIDI note with unique ID
      midiPlayer.noteOn(note.pitch, 0.5, noteId);

      // Highlight the specific note
      highlightSpecificNote(note.noteElement, true);
      activeNoteIds.set(noteId, note.noteElement);

      // Schedule note-off
      const offTime = Math.max(100, note.duration / currentTempo);
      const timeoutId = setTimeout(() => {
        midiPlayer.noteOff(noteId);
        if (activeNoteIds.has(noteId)) {
          highlightSpecificNote(activeNoteIds.get(noteId), false);
          activeNoteIds.delete(noteId);
        }
      }, offTime);

      scheduledNotes.push(timeoutId);
      noteIndex++;
    }

    // Update position slider
    const seekSlider = document.getElementById('seekSlider');
    const seekValue = document.getElementById('seekValue');
    if (notes.length > 0) {
      const progress = Math.floor((elapsed / (notes[notes.length - 1].time + 1000)) * 100);
      if (seekSlider) seekSlider.value = progress;
      if (seekValue) seekValue.textContent = progress;
    }

    if (noteIndex < notes.length) {
      const timeoutId = setTimeout(scheduleNextNotes, 50);
      scheduledNotes.push(timeoutId);
    } else {
      // Wait for last notes to finish
      setTimeout(() => {
        isPlaying = false;
        midiPlayer.stopAll();
        clearHighlighting();
        announceToScreenReader('Playback finished');
      }, 1000);
    }
  }

  scheduleNextNotes();
}

// Simple chord-based playback fallback
async function playWithChords() {
  if (!osmdInstance || !osmdInstance.graphic || !osmdInstance.graphic.measureList) {
    isPlaying = false;
    return;
  }

  // Define basic MIDI pitches for each voice part
  const partPitches = {
    'Soprano': 72, // C5
    'Alto': 67,    // G4
    'Tenor': 60,   // C4
    'Bass': 48     // C3
  };

  const totalMeasures = osmdInstance.graphic.measureList.length;
  const measureDuration = 1000 / currentTempo; // 1 second per measure adjusted by tempo

  try {
    if (osmdInstance.cursor) {
      osmdInstance.cursor.show();
      osmdInstance.cursor.reset();
    }

    for (let i = currentPosition; i < totalMeasures && isPlaying; i++) {
      if (osmdInstance.cursor) {
        osmdInstance.cursor.next();
      }

      const seekSlider = document.getElementById("seekSlider");
      const seekValue = document.getElementById("seekValue");
      if (seekSlider) seekSlider.value = i;
      if (seekValue) seekValue.textContent = i;

      // Play a simple chord for selected parts
      const activePitches = [];
      Object.entries(selectedParts).forEach(([part, enabled]) => {
        if (enabled && partPitches[part]) {
          const pitch = partPitches[part];
          midiPlayer.noteOn(pitch, 0.3);
          activePitches.push(pitch);
        }
      });

      // Hold notes for measure duration
      await new Promise(r => setTimeout(r, measureDuration));

      // Release notes
      activePitches.forEach(pitch => midiPlayer.noteOff(pitch));
    }
  } catch (err) {
    console.error('Playback error:', err);
  }

  isPlaying = false;
  if (osmdInstance.cursor) {
    osmdInstance.cursor.hide();
  }
}

// Fallback: Simulated playback cursor (if note extraction fails)
async function followPlayback() {
  if (!osmdInstance || !osmdInstance.graphic || !osmdInstance.graphic.measureList) {
    isPlaying = false;
    return;
  }

  const totalMeasures = osmdInstance.graphic.measureList.length;

  try {
    osmdInstance.cursor.show();
    osmdInstance.cursor.reset();

    for (let i = currentPosition; i < totalMeasures && isPlaying; i++) {
      osmdInstance.cursor.next();
      const seekSlider = document.getElementById("seekSlider");
      const seekValue = document.getElementById("seekValue");
      if (seekSlider) seekSlider.value = i;
      if (seekValue) seekValue.textContent = i;

      // Wait based on tempo (simplified timing)
      await new Promise(r => setTimeout(r, 1000 / currentTempo));
    }
  } catch (err) {
    console.error('Playback error:', err);
  }

  isPlaying = false;
}

// Highlight a specific note element
function highlightSpecificNote(noteElement, highlight) {
  if (!noteElement) return;

  try {
    // Store original color if highlighting
    if (highlight && !noteElement._originalFill) {
      noteElement._originalFill = noteElement.getSVGGElement ?
        getComputedStyle(noteElement.getSVGGElement()).fill : 'black';
    }

    // Apply highlighting to the note's SVG element
    if (noteElement.getSVGGElement) {
      const svgElement = noteElement.getSVGGElement();
      if (svgElement) {
        // Find all noteheads within this note
        const noteheads = svgElement.querySelectorAll('.vf-notehead, circle, ellipse');
        noteheads.forEach(notehead => {
          if (highlight) {
            notehead.setAttribute('data-highlighted', 'true');
            notehead.style.fill = '#00ff00';
            notehead.style.stroke = '#00ff00';
            notehead.style.strokeWidth = '2';
          } else {
            notehead.removeAttribute('data-highlighted');
            notehead.style.fill = noteElement._originalFill || '';
            notehead.style.stroke = '';
            notehead.style.strokeWidth = '';
          }
        });
      }
    }
  } catch (err) {
    console.error('Error highlighting note:', err);
  }
}

// Clear all note highlighting
function clearHighlighting() {
  const container = document.getElementById('scoreDisplay');
  if (!container) return;

  // Clear all highlighted notes
  const highlightedElements = container.querySelectorAll('[data-highlighted="true"]');
  highlightedElements.forEach(elem => {
    elem.removeAttribute('data-highlighted');
    elem.style.fill = '';
    elem.style.stroke = '';
    elem.style.strokeWidth = '';
  });
}

// Announce to screen reader (accessibility helper)
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'visually-hidden';
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Spacebar to play/pause
  if (event.key === ' ' || event.code === 'Space') {
    // Don't trigger if user is typing in an input or textarea
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Player initialized');
  announceToScreenReader('Press spacebar to play or pause');
});
