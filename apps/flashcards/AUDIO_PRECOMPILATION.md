# Flash Cards Audio Precompilation System

## Overview

This system allows you to **precompile all flash card audio** for instant playback with zero latency. Instead of generating speech on-the-fly, you can generate all audio files once and the app will use them directly.

## Benefits

- **Zero latency**: Audio plays instantly (no 2-3 second wait)
- **Offline capable**: Once compiled, no TTS server needed
- **Better UX**: Seamless card-to-card transitions
- **All voices**: Compile for every voice so users can switch freely
- **Persistent**: Audio files stay cached forever

## Voices Available

### Coqui XTTS-v2 (10 voices)

**Preferred Accents (⭐ marked in UI):**
- ⭐ **Andrew Chipper** (male, British)
- ⭐ **Claribel Dervla** (female, Irish)
- ⭐ **Craig Gutsy** (male, Australian)
- ⭐ **Daisy Studious** (female, British)
- ⭐ **Gracie Wise** (female, British)

**Other Voices:**
- Ana Florence (female, American)
- Brenda Stern (female, American)
- Gitta Nikolina (female, American)
- Sofia Hellen (female, American)
- Viktor Eka (male, American)

### MeloTTS (4 accents)

- **EN-BR-Default** (British accent) ⭐
- **EN-AU-Default** (Australian accent) ⭐
- EN-US-Default (American accent)
- EN-Default (Generic English)

## Quick Start

### 1. Start TTS Servers

```bash
# Terminal 1: Start Coqui TTS
./start_tts.sh

# Terminal 2: Start MeloTTS (optional but recommended for more accents)
./start_melo.sh
```

### 2. Run Precompilation

```bash
# With Coqui venv active
source .venv-tts/bin/activate
python precompile_all_cards.py
```

This will:
1. Parse `cards.md` to extract all text
2. Discover all available voices from both servers
3. Generate audio for every (text × voice) combination
4. Save organized by voice: `audio_cache/{Voice_Name}/{hash}.wav`
5. Create an index.json for quick lookups

### 3. Open Your App

Open `index.html` and enjoy instant audio playback!

## How It Works

### On-Demand (Current Behavior)

1. User plays card
2. App requests TTS server to generate audio (~2-3 seconds)
3. Audio is cached on server
4. Audio plays

### Precompiled (After Running Script)

1. User plays card
2. App checks local `audio_cache/` directory
3. Finds precompiled WAV file
4. Audio plays **instantly** (< 100ms)

If a file isn't found (e.g., new card added), it falls back to on-demand generation.

## File Structure

```
audio_cache/
├── Andrew_Chipper/
│   ├── a3f2b1c8d9e7f6a5.wav
│   ├── b4e3d2c1a9f8e7d6.wav
│   └── ...
├── Claribel_Dervla/
│   ├── c5f4e3d2b1a9f8e7.wav
│   └── ...
├── EN-BR-Default/
│   ├── d6g5f4e3c2b1a9f8.wav
│   └── ...
└── index.json
```

- Each voice gets its own directory
- Files named by MD5 hash of `text|voice_name`
- `index.json` maps hashes to file paths

## Adding New Cards

When you add new cards to `cards.md`:

**Option 1: Regenerate Everything**
```bash
source .venv-tts/bin/activate
python precompile_all_cards.py
```
(It will skip existing files, only generate new ones)

**Option 2: Let On-Demand Handle It**
- Just add your cards and use the app
- New cards will generate on first play
- They'll be cached on the server but not locally precompiled
- User experience: First play has 2-3s delay, subsequent plays are instant

## Cache Management

### Check Cache Size
```bash
du -sh audio_cache/
```

### Clear Cache
```bash
rm -rf audio_cache/
```

### Clear Server Caches
```bash
rm -rf /tmp/tts_cache/ /tmp/melo_cache/
```

## Configuration

### Disable Precompiled Audio

In `app.js`, set:
```javascript
usePrecompiled: false,
```

This forces on-demand generation even if precompiled files exist.

### Change Cache Directory

In `app.js`:
```javascript
audioCacheDir: 'my_custom_cache',
```

And in `precompile_all_cards.py`:
```python
CACHE_DIR = Path("my_custom_cache")
```

## Performance

### Precompilation Time

- **Per voice per card**: ~2-3 seconds
- **Example**: 50 cards × 14 voices = 700 files ≈ 30-40 minutes
- **Subsequent runs**: Only generate new/missing files

### Cache Size

- **Per audio file**: ~50-200 KB
- **Example**: 700 files ≈ 50-100 MB total
- Highly compressed WAV format

### Playback Performance

- **Precompiled**: < 100ms (nearly instant)
- **On-demand cached**: ~100-300ms (server cache)
- **On-demand fresh**: 2-3 seconds (generation time)

## Troubleshooting

### Precompilation Script Hangs

- **Cause**: TTS server not responding
- **Fix**: Check servers are running (`curl localhost:5050/api/health`)
- **Fix**: Restart servers if needed

### "No TTS servers available"

- **Fix**: Start at least one TTS server before running precompilation

### Files Not Found in App

- **Check**: Audio files exist in `audio_cache/{Voice_Name}/`
- **Check**: File names match hash format
- **Check**: `usePrecompiled: true` in app.js
- **Debug**: Open browser console, look for "Using precompiled audio" logs

### Hash Mismatches

The hash function in `app.js` must match `precompile_all_cards.py`. If you modify one, update the other.

Current algorithm: MD5 of `{text}|{voice_name}`

## Advanced: Committing Audio Cache

By default, `audio_cache/` is gitignored. To commit it:

1. Remove from `.gitignore`:
   ```
   # audio_cache/  <- comment this out
   ```

2. Commit:
   ```bash
   git add audio_cache/
   git commit -m "Add precompiled audio for instant playback"
   ```

**Pros:**
- Users get instant playback without running precompilation
- No TTS servers needed in production

**Cons:**
- Large repo size (50-100 MB+ per language/voice set)
- Every card change requires regeneration and re-commit

## Future Enhancements

- [ ] Progressive precompilation (generate in background)
- [ ] Compression (FLAC or Opus for smaller files)
- [ ] CDN deployment for audio files
- [ ] Automatic detection of new cards and selective compilation
- [ ] Voice sample preview in UI
- [ ] Per-voice enable/disable in precompilation

## Summary

Precompilation gives you **the best possible user experience** with instant audio playback. Run it once, enjoy it forever!
