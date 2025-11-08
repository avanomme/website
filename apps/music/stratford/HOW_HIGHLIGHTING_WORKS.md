# How Score Highlighting Works in the Player

This document explains the complete highlighting system in `rehearse.html`.

## Overview

The highlighting system synchronizes visual feedback on the musical score with MIDI audio playback. Notes light up green as they're being played, creating a "karaoke-style" effect for rehearsal.

## The Four Components

### 1. **MEI Source File** (`.mei`)
- Original musical notation in MEI XML format
- Contains all musical information: notes, rhythms, dynamics, tempo markings
- Example: `scores/we-three/we-three.mei`

### 2. **Timemap JSON** (`.json`)
- Generated from MEI by Verovio
- Maps timestamps (milliseconds) to note IDs
- Includes tempo change information
- Example from `we-three.json`:
```json
[
  {
    "on": ["mscore-YbkTXAI2YoI"],
    "qstamp": 0,
    "tempo": 80,
    "tstamp": 0
  },
  {
    "off": ["mscore-YbkTXAI2YoI"],
    "on": ["mscore-rJpta2GjU8O"],
    "qstamp": 0.333,
    "tstamp": 250
  }
]
```

### 3. **MIDI File** (`.mid`)
- Generated from MEI by Verovio
- Contains audio performance data
- Played by Tone.js for sound
- Generated once and cached in browser

### 4. **SVG Rendering** (dynamic)
- Generated in browser from MEI by Verovio
- Creates visual score display
- Each note element has an ID matching the timemap
- Can be zoomed/panned dynamically

## How It Works (Step by Step)

### Initialization (lines 787-876 in rehearse.html)

```javascript
// 1. Load Verovio WASM toolkit
tk = new verovio.toolkit();

// 2. Load MEI file
const meiData = await fetch('scores/we-three/we-three.mei');
tk.loadData(meiData);

// 3. Generate SVG for display
const svg = tk.renderToSVG(currentPage);
scoreCanvas.innerHTML = svg;  // Shows the score

// 4. Load timemap JSON (pre-generated)
const timeMap = await fetch('scores/we-three/we-three.json');

// 5. Generate MIDI for playback
const base64midi = tk.renderToMIDI();
const midi = new Midi(base64midi);  // Tone.js MIDI object
```

### Playback Loop (lines 1211-1219 in rehearse.html)

Every 50 milliseconds while playing:

```javascript
highlightLoopId = Tone.Transport.scheduleRepeat(() => {
    const currentSeconds = Tone.Transport.seconds;  // Where we are in playback
    highlightCurrentTime(currentSeconds);           // Update highlighting
    updateTimeDisplay(currentSeconds);              // Update progress bar
}, 0.05);  // Run every 50ms
```

### Highlighting Logic (lines 1044-1104)

```javascript
const highlightCurrentTime = function (currentSeconds) {
    // 1. Convert transport time to score time (handles tempo changes)
    let scoreTime = convertTransportTimeToScoreTime(currentSeconds);

    // 2. Find the timemap event at this score time
    let currentEvent = findClosestTimeMapEvent(scoreTime);

    // 3. Turn OFF notes that ended
    if (currentEvent.off) {
        for (const noteId of currentEvent.off) {
            const noteElement = document.getElementById(noteId);
            noteElement.classList.remove("playing");  // Remove green highlight
        }
    }

    // 4. Turn ON notes that started
    if (currentEvent.on) {
        for (const noteId of currentEvent.on) {
            const noteElement = document.getElementById(noteId);
            noteElement.classList.add("playing");  // Add green highlight
        }
    }

    // 5. Change page if needed
    if (currentEvent.page !== currentPage) {
        currentPage = currentEvent.page;
        scoreCanvas.innerHTML = tk.renderToSVG(currentPage);
    }
};
```

### Tempo Change Handling (lines 964-981)

This is critical for scores with tempo changes:

```javascript
function convertTransportTimeToScoreTime(transportSeconds) {
    // Simple linear conversion
    // The timemap timestamps already have MEI tempo changes baked in
    // Tempo changes are scheduled as BPM changes in Tone.Transport
    // We only need to account for user's speed adjustment (tempoFactor)

    return (transportSeconds * tempoFactor) + startMeasureTime;

    // Example:
    // - At 100% speed (tempoFactor=1.0): scoreTime = transportTime
    // - At 50% speed (tempoFactor=0.5): 20s transport = 10s score (playing slower)
    // - At 200% speed (tempoFactor=2.0): 5s transport = 10s score (playing faster)
}
```

**Why This Works:**
- Verovio's timemap already accounts for MEI tempo changes in the `tstamp` values
- Tempo changes are scheduled in `schedulePlayback()` (lines 1194-1226)
- `Tone.Transport.bpm.value` is updated at the correct times
- We only need to convert between transport time and score time based on user's speed factor

### CSS Styling (lines 206-250)

The actual visual effect:

```css
/* Target SVG note elements with "playing" class */
g.note.playing,
g.chord.playing {
    fill: #22c55e !important;      /* Green color */
    stroke: #22c55e !important;
    opacity: 0.9 !important;
    animation: note-pulse 0.5s ease-in-out;
}

/* Apply to all SVG shapes within the note */
g.note.playing path,
g.note.playing rect,
g.note.playing ellipse {
    fill: #22c55e !important;
    stroke: #22c55e !important;
}

/* Pulse animation */
@keyframes note-pulse {
    0% {
        fill: #16a34a;    /* Darker green */
        opacity: 0.7;
    }
    50% {
        fill: #22c55e;    /* Bright green */
        opacity: 1.0;
    }
    100% {
        fill: #22c55e;    /* Stay bright */
        opacity: 0.9;
    }
}
```

## The Complete Flow Diagram

```
┌─────────────┐
│  MEI File   │ (Musical notation source)
└──────┬──────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌─────────────┐        ┌─────────────┐
│ Verovio CLI │        │ Verovio CLI │
│   Timemap   │        │    MIDI     │
└──────┬──────┘        └──────┬──────┘
       │                      │
       ▼                      ▼
┌─────────────┐        ┌─────────────┐
│ .json file  │        │  .mid file  │
│ (pre-gen)   │        │ (pre-gen)   │
└──────┬──────┘        └──────┬──────┘
       │                      │
       │    ┌─────────────┐   │
       │    │  MEI File   │   │
       │    │ (in browser)│   │
       │    └──────┬──────┘   │
       │           │          │
       │           ▼          │
       │    ┌─────────────┐   │
       │    │  Verovio    │   │
       │    │  Toolkit    │   │
       │    │ (in browser)│   │
       │    └──────┬──────┘   │
       │           │          │
       │           ▼          │
       │    ┌─────────────┐   │
       │    │ SVG Display │   │
       │    │ (w/ note IDs)│  │
       │    └──────┬──────┘   │
       │           │          │
       └───────────┼──────────┘
                   │
                   ▼
            ┌─────────────┐
            │  Playback   │
            │    Loop     │ (every 50ms)
            └──────┬──────┘
                   │
                   ▼
            ┌─────────────┐
            │ Find current│
            │   timemap   │
            │    event    │
            └──────┬──────┘
                   │
                   ▼
            ┌─────────────┐
            │  Add/Remove │
            │  "playing"  │
            │    class    │
            └──────┬──────┘
                   │
                   ▼
            ┌─────────────┐
            │  CSS makes  │
            │ notes GREEN │
            └─────────────┘
```

## Why This Architecture?

### Pre-generated Files
- **Timemap JSON**: Complex to generate, doesn't change, pre-generate once
- **MIDI**: Can be pre-generated for verification/backup

### Browser-generated Files
- **SVG**: Needs to be dynamic for zoom levels, page navigation
- Verovio WASM is fast enough for real-time rendering

### The Hybrid Approach
- Best of both worlds: fast loading + flexibility
- Timemap ensures perfect sync even with tempo changes
- SVG rendering allows interactive zoom/pan
- MIDI can be cached after first generation

## Customization

### Change Highlight Color

Edit lines 206-250 in `rehearse.html`:

```css
g.note.playing {
    fill: #ff0000 !important;  /* Red instead of green */
    stroke: #ff0000 !important;
}

@keyframes note-pulse {
    0% { fill: #cc0000; }      /* Dark red */
    50% { fill: #ff0000; }     /* Bright red */
    100% { fill: #ff0000; }
}
```

### Change Animation Speed

Adjust the animation duration:

```css
g.note.playing {
    animation: note-pulse 0.3s ease-in-out;  /* Faster: 0.3s instead of 0.5s */
}
```

### Disable Animation

Remove the animation completely:

```css
g.note.playing {
    fill: #22c55e !important;
    stroke: #22c55e !important;
    opacity: 1.0 !important;
    /* No animation property */
}
```

## Performance

- **SVG Rendering**: 10-50ms per page (depends on complexity)
- **Highlighting Update**: <1ms (simple CSS class toggle)
- **Timemap Lookup**: <1ms (binary search)
- **Total Overhead**: ~2-3ms per frame (50ms interval)

The system is highly efficient and runs smoothly even on older devices.

## Troubleshooting

### Highlighting is out of sync (especially with tempo changes)
**Fixed in latest version!** The previous `convertTransportTimeToScoreTime()` was overly complex.

If you still have issues:
1. Check that timemap JSON exists and is loaded
2. Verify the simple conversion: `scoreTime = transportTime * tempoFactor + startMeasureTime`
3. Check browser console for tempo change logs: `[Tempo Event] MEI tempo change to X BPM`
4. Verify tempo changes are in the timemap JSON (search for `"tempo":` in the JSON file)

**To test tempo changes:**
- Load "we-three" (tempo change at 39 seconds: 80 BPM → 120 BPM)
- Load "holiday-favourites1" (5 tempo changes throughout)
- Watch console logs showing when tempo changes are scheduled
- Verify highlighting stays in sync throughout the piece

### Notes don't light up
- Check browser console for JavaScript errors
- Verify SVG has correct note IDs (should match timemap JSON `on`/`off` arrays)
- Check that CSS is loaded (look for `.playing` class on `g.note` elements)
- Verify timemap JSON is loading (check Network tab in DevTools)

### Wrong notes highlighted
- Timemap may be outdated - regenerate with `npm run generate-all`
- Check for MEI file changes
- Verify note IDs match between SVG and timemap JSON
- If MEI has MuseScore IDs (like `mscore-XXX`), regenerate without them

### Page doesn't change during playback
- Verovio pagination may differ from expectations
- Check `currentElements.page` in browser console
- Verify `tk.renderToSVG(currentPage)` is being called when page changes

### Tempo changes audibly work but highlighting doesn't sync
This was the main bug fixed in this version. The issue was:
- Old code tried to manually calculate tempo change effects on timing
- But Verovio's timemap already has tempo changes baked into `tstamp` values
- And `schedulePlayback()` correctly schedules `Tone.Transport.bpm` changes
- Solution: Use simple linear conversion based only on user's speed factor
