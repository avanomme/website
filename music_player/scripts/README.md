# Score Utilities

This directory contains helper scripts for score preparation and playback resources.

- `download-soundfonts.sh` – Fetches the MusyngKite choir/piano soundfonts for offline use.
- `generate-steinway-samples.sh` – Renders a Steinway piano sample set (`soundfonts/steinway/*.wav`) from `steinway.SF2` using FluidSynth.
- `prerender-browser.js` – Browser-based MusicXML → MEI converter.

## Score Pre-rendering

This section explains how to optimize score loading performance by converting MusicXML files to Verovio's native MEI format.

## Why Pre-render?

**MusicXML files take a long time to load** because Verovio has to:
1. Parse the MusicXML format
2. Convert it to MEI internally
3. Process and render the score

**Pre-rendering converts MusicXML to MEI ahead of time**, which:
- ✅ **5-10x faster loading** (MEI is Verovio's native format)
- ✅ Reduces browser processing time
- ✅ Better user experience - no waiting for scores to load
- ✅ Works great for small libraries (like our 9 scores)

## Setup

1. **Install dependencies:**
   ```bash
   cd /Users/adam/projects/Stratford\ copy
   npm install
   ```

   This installs:
   - `puppeteer` - Headless browser to run Verovio (includes Chromium ~170MB)
   - `serve-handler` - Simple file server for the conversion process

   **Note:** This is a one-time download. Puppeteer includes its own Chromium browser.

## Usage

### Pre-render all scores (one-time)

```bash
npm run prerender
```

This will:
- Scan the `scores/` directory for all `.musicxml` files
- Convert each one to `.mei` format
- Save the `.mei` file next to the original `.musicxml`

Example output:
```
============================================================
Verovio Score Pre-rendering Tool (Browser-based)
Converts MusicXML files to MEI format for faster loading
============================================================

[Prerender] Scanning directory: /Users/adam/projects/Stratford copy/scores
[Prerender] Found 9 MusicXML files

[Prerender] Starting local web server...
[Server] Started on http://localhost:9876
[Prerender] Launching headless browser...
[Prerender] Waiting for Verovio to initialize...
[Prerender] ✓ Verovio ready!

[Prerender] Processing: candlelight-carol.musicxml
[Prerender]   Read 125340 bytes
[Prerender]   ✓ Converted to MEI (142567 bytes)
[Prerender]   ✓ Saved: candlelight-carol.mei
[Prerender]   Stats: 8 pages, 245.3s duration

... (repeats for all 9 scores)

============================================================
SUMMARY
============================================================

✓ Successfully converted: 9/9 files

[Server] Stopped
============================================================
[Prerender] Done! MEI files are ready for fast loading.
============================================================
```


## How It Works

### Before Pre-rendering

```
scores/
  candlelight-carol/
    candlelight-carol.musicxml    ← Slow to load (converts at runtime)
```

### After Pre-rendering

```
scores/
  candlelight-carol/
    candlelight-carol.musicxml    ← Original file (keep this!)
    candlelight-carol.mei         ← Fast to load! ✨
```

### Automatic Detection

The app automatically checks for `.mei` files first:

```javascript
// In score-library.js:
// 1. Check if candlelight-carol.mei exists → Use it (fast!)
// 2. Otherwise, fall back to candlelight-carol.musicxml (slower)
```

You'll see in the console:
```
[ScoreLibrary] ✓ Found pre-rendered MEI: candlelight-carol.mei
[ScoreLibrary] Found 9 scores: 9 MEI (fast), 0 MusicXML (slower)
```

Or if you haven't run pre-rendering yet:
```
[ScoreLibrary] No MEI found, using MusicXML: candlelight-carol.musicxml
[ScoreLibrary] Found 9 scores: 0 MEI (fast), 9 MusicXML (slower)
[ScoreLibrary] 💡 Tip: Run "npm run prerender" to convert MusicXML files to MEI for faster loading!
```

## File Sizes

MEI files are usually **slightly larger** than MusicXML because they're more verbose, but:
- The extra size is negligible (maybe 10-20% larger)
- Loading speed improvement is **much more significant** (5-10x faster)
- With only 9 scores, total size difference is minimal

Example:
- `candlelight-carol.musicxml`: 125 KB
- `candlelight-carol.mei`: 142 KB (13% larger)
- **But loads 8x faster!**

## When to Re-run

Re-run the pre-rendering script whenever you:
- Add new `.musicxml` files to the `scores/` directory
- Update existing `.musicxml` files
- Want to refresh the MEI cache

## Troubleshooting

### Script fails with "verovio not found"

Make sure you've run `npm install` first:
```bash
cd /Users/adam/projects/Stratford\ copy
npm install
```

### MEI files not being detected

Check the console in your browser - you should see:
```
[ScoreLibrary] ✓ Found pre-rendered MEI: candlelight-carol.mei
```

If you see "No MEI found", the file might not exist. Run:
```bash
npm run prerender
```

### Some files failed to convert

Check the summary at the end of the script output. Failed files will show an error message:
```
❌ Failed to convert 1 files:
   - broken-score.musicxml: Verovio failed to parse file
```

This usually means the MusicXML file has errors. Fix the source file and re-run.

## Performance Comparison

| Format | Load Time | Notes |
|--------|-----------|-------|
| MusicXML (.musicxml) | ~2-5 seconds | Requires conversion at runtime |
| MEI (.mei) | ~0.3-0.5 seconds | Native format, loads instantly! |

**With 9 scores, pre-rendering saves ~15-40 seconds total loading time across all scores!**
