# ✓ Complete Flash Cards Setup

## What You Now Have

### 1. **Beautiful Card-Based UI**
- Flash cards that look like actual cards
- Consistent sizing (400-600px height)
- Click to flip (question → answer)
- Click again to advance (answer → next card)
- Question shown at top when viewing answer

### 2. **High-Quality Text-to-Speech**

#### Coqui XTTS-v2 (10 voices)
**Preferred Accents (⭐ in dropdown):**
- ⭐ Andrew Chipper (male, British)
- ⭐ Claribel Dervla (female, Irish)
- ⭐ Craig Gutsy (male, Australian)
- ⭐ Daisy Studious (female, British)
- ⭐ Gracie Wise (female, British)

**Other Voices:**
- Ana Florence, Brenda Stern, Gitta Nikolina, Sofia Hellen, Viktor Eka

#### MeloTTS (4 accents)
- ⭐ EN-BR-Default (British)
- ⭐ EN-AU-Default (Australian)
- EN-US-Default (American)
- EN-Default (Generic)

### 3. **Audio Precompilation System**
- Generate all audio files once
- Instant playback (< 100ms)
- No server needed after compilation
- Falls back to on-demand if files missing

### 4. **Response Caching**
- Server-side caching at `/tmp/tts_cache/` and `/tmp/melo_cache/`
- First generation: ~2-3 seconds
- Cached responses: Instant
- Local precompiled audio: < 100ms

## Quick Start

### Daily Use

```bash
# Start Coqui TTS server
./start_tts.sh

# (Optional) Start MeloTTS server for more accents
./start_melo.sh

# Open index.html in your browser
open index.html
```

### One-Time Precompilation (Recommended)

```bash
# Start both TTS servers first
./start_tts.sh  # Terminal 1
./start_melo.sh # Terminal 2

# Then precompile (Terminal 3)
source .venv-tts/bin/activate
python precompile_all_cards.py
```

This generates all audio files (~30-40 minutes for 50 cards × 14 voices).
After this, audio plays **instantly** forever!

## Features

### UI Features
- ✓ Click cards to flip/advance
- ✓ Autoplay mode with adjustable delays
- ✓ Shuffle cards
- ✓ Loop deck
- ✓ Jump to specific section/card
- ✓ Voice selection with accent labels
- ✓ Speech rate control (browser TTS only)
- ✓ Preferred accents shown first (⭐ marked)

### TTS Features
- ✓ Multiple voice providers (Coqui + MeloTTS)
- ✓ Automatic server detection
- ✓ Fallback to browser TTS if servers unavailable
- ✓ English-only voices (filtered)
- ✓ Accent information displayed
- ✓ Response caching (server + local)
- ✓ Precompilation support

## File Structure

```
Flash_Cards/
├── index.html              # Main app
├── app.js                  # App logic with TTS integration
├── app.css                 # Card styles
├── theme.css               # Color theme
├── cards.md                # Your flash cards content
│
├── tts_server.py           # Coqui XTTS-v2 server
├── melo_server.py          # MeloTTS server
├── start_tts.sh            # Start Coqui server
├── start_melo.sh           # Start MeloTTS server
├── restart_tts.sh          # Restart Coqui server
│
├── precompile_all_cards.py # Precompile all audio
├── prebuild_cache.py       # Prebuild common phrases
├── test_tts.py             # Test TTS servers
│
├── requirements.txt        # Python dependencies
├── .venv-tts/              # Python 3.11 venv for TTS
│
├── audio_cache/            # Precompiled audio (local)
│   ├── Andrew_Chipper/
│   ├── Claribel_Dervla/
│   └── ...
│
├── TTS_README.md           # TTS setup guide
├── AUDIO_PRECOMPILATION.md # Precompilation guide
└── COMPLETE_SETUP.md       # This file
```

## Voice Selection Priority

The app automatically prioritizes British, Irish, and Australian accents:

1. **Preferred accents** shown first (with ⭐)
2. **Separator** (`──────────`)
3. **Other voices** below

Default voice: First preferred accent available (usually Andrew Chipper or Claribel Dervla)

## Server Management

### Start Servers
```bash
./start_tts.sh        # Coqui on :5050
./start_melo.sh       # MeloTTS on :5051
```

### Stop Servers
```bash
lsof -ti:5050 | xargs kill  # Stop Coqui
lsof -ti:5051 | xargs kill  # Stop MeloTTS
```

### Restart
```bash
./restart_tts.sh      # Restart Coqui
```

### Check Status
```bash
curl http://localhost:5050/api/health | jq
curl http://localhost:5051/api/health | jq
```

## Performance Comparison

### On-Demand Generation
- **First request**: 2-3 seconds (generation time)
- **Server cached**: 100-300ms (network + file read)
- **Browser cached**: Instant

### Precompiled Audio
- **All requests**: < 100ms (local file read)
- **No server needed**: Works offline
- **No wait time**: Best UX

## Adding New Cards

1. Edit `cards.md` with new content
2. **Option A**: Rerun precompilation (only generates new files)
   ```bash
   source .venv-tts/bin/activate
   python precompile_all_cards.py
   ```
3. **Option B**: Let on-demand handle it (first play has delay, then cached)

## Troubleshooting

### No Voices in Dropdown
- **Check**: Servers are running (`curl localhost:5050/api/health`)
- **Fix**: Start at least one TTS server

### Voices Don't Show Accents
- **Check**: Updated `tts_server.py` with accent metadata
- **Fix**: Restart Coqui server: `./restart_tts.sh`

### Audio Not Playing
- **Check**: Browser console for errors
- **Check**: Audio files exist in `audio_cache/` if using precompiled
- **Check**: Server is responding: `curl -X POST localhost:5050/api/speak -H "Content-Type: application/json" -d '{"text":"test","speaker":"Andrew Chipper"}'`

### Precompilation Slow
- **Normal**: ~2-3 seconds per audio file
- **Optimize**: Run overnight for large decks
- **Alternative**: Only precompile your most-used voice

### Python Version Issues
- **Required**: Python 3.11 (Coqui TTS doesn't support 3.13)
- **Check**: The `.venv-tts/` uses Python 3.11
- **Fix**: `python3.11 -m venv .venv-tts` and reinstall

## Configuration

### Disable Precompiled Audio
In `app.js`:
```javascript
usePrecompiled: false,
```

### Change Default Delays
In `index.html` (or `app.js`):
```html
<input type="range" id="autoRevealDelay" value="1000">  <!-- 1 second -->
<input type="range" id="autoAdvanceDelay" value="1000"> <!-- 1 second -->
```

### Disable MeloTTS
Just don't start the server. App will use only Coqui voices.

## What's Next?

### Recommended Workflow

1. **Start servers** (once per session)
   ```bash
   ./start_tts.sh
   ```

2. **Precompile audio** (once ever, or when cards change)
   ```bash
   source .venv-tts/bin/activate
   python precompile_all_cards.py
   ```

3. **Use the app** (servers can be stopped after precompilation)
   ```bash
   open index.html
   ```

### Optional: MeloTTS

If you want British/Australian accents from MeloTTS:
```bash
./start_melo.sh
```

Then rerun precompilation to include those voices.

## Files You Can Ignore

- `.venv-tts/` - Virtual environment (regenerate anytime)
- `/tmp/tts_cache/`, `/tmp/melo_cache/` - Server caches (auto-managed)
- `audio_cache/` - Regenerate with precompilation script

## Files to Backup

- `cards.md` - Your flash card content
- `audio_cache/` - If you don't want to regenerate (50-100 MB)

## Summary

You now have a production-ready flash cards system with:
- ✅ Beautiful card UI with click interaction
- ✅ 14 high-quality voices (10 Coqui + 4 MeloTTS)
- ✅ Preferred accent prioritization (British/Irish/Australian)
- ✅ Instant audio playback via precompilation
- ✅ Automatic fallbacks (precompiled → cached → on-demand → browser)
- ✅ Easy to maintain and extend

Enjoy your flash cards! 🎉
