# Audio Generation for ML Midterm Flashcards

This document explains how to generate precompiled audio files for all ML midterm flashcards.

## Overview

The flashcard app supports **precompiled audio caching**:
- Audio files are generated once and saved locally
- Subsequent playback is instant (zero latency)
- Uses MP3 format (better for web, smaller file size than WAV)
- Falls back to on-demand generation if cached audio doesn't exist

## Quick Start

### 1. Start the Edge TTS Server

Edge TTS is free and requires no API keys:

```bash
cd apps/flashcards
python edge_tts_server.py
```

The server will run on `http://localhost:5052`

### 2. Generate All Audio Files

In a new terminal:

```bash
cd apps/flashcards
python precompile_ml_midterm.py
```

This script will:
- Parse all ML midterm card files (cards, quiz, review)
- Extract unique text segments
- Generate MP3 audio for each segment
- Save to `audio_cache/` directory
- Create an index for fast lookups

### 3. Upload Audio Files

After generation completes:

1. The audio files will be in `apps/flashcards/audio_cache/`
2. Upload this entire directory to your web server
3. The flashcard app will automatically use cached audio

## File Structure

```
apps/flashcards/
├── audio_cache/
│   ├── {Voice_Name}/
│   │   ├── {hash1}.mp3
│   │   ├── {hash2}.mp3
│   │   └── ...
│   └── index.json
├── ml_midterm_cards.md
├── ml_midterm_quiz.md
├── ml_midterm_review.md
├── edge_tts_server.py
└── precompile_ml_midterm.py
```

## How It Works

### Hash-Based Caching

Audio files are named using MD5 hashes of the text + voice name:

```javascript
// app.js
const combined = `${text}|${voiceName}`;
const hash = md5(combined);
// Path: audio_cache/{Voice_Name}/{hash}.mp3
```

### Automatic Format Detection

The app tries multiple formats:
1. First tries MP3 (recommended)
2. Falls back to WAV (legacy)
3. If neither exists, generates on-demand

### Voice Selection

The precompile script uses Edge TTS's default voice for generation. Users can select different voices in the UI, which will trigger on-demand generation for that voice.

## Advanced Usage

### Generate for Multiple Voices

To generate audio for multiple voices, edit `precompile_ml_midterm.py`:

```python
# Change this line:
return [v['name'] for v in data['voices'][:1]]  # Just use first voice

# To this:
return [v['name'] for v in data['voices']]  # All voices
```

Note: This will significantly increase generation time and storage requirements.

### Custom Card Files

To generate audio for other card files, add them to the `CARD_FILES` list:

```python
CARD_FILES = [
    "ml_midterm_cards.md",
    "ml_midterm_quiz.md",
    "ml_midterm_review.md",
    "my_custom_cards.md"  # Add your file here
]
```

### Cache Directory

By default, audio is cached in `audio_cache/`. To change this:

```python
# In precompile_ml_midterm.py
CACHE_DIR = Path("audio_cache")  # Change this path
```

```javascript
// In app.js
audioCacheDir: 'audio_cache',  // Change this path
```

## Deployment

### Local Development

Audio files work immediately - just generate and run the app.

### Production (Vercel/Web Server)

1. Generate audio locally
2. Upload `audio_cache/` directory to your server
3. Ensure the path is accessible from your web app
4. The app will automatically use cached audio

### Git Considerations

The `audio_cache/` directory is typically git-ignored due to large file sizes. Options:

1. **Git LFS**: Use Git Large File Storage for audio files
2. **Separate Storage**: Upload to CDN or cloud storage
3. **Build Step**: Generate during CI/CD deployment

## Performance

### File Sizes

- MP3 format: ~20-50 KB per segment
- WAV format: ~100-200 KB per segment
- Total for all ML midterm cards: ~10-30 MB (MP3)

### Generation Time

- ~2 seconds per audio file
- Total for ML midterm (~300 segments): ~10-15 minutes

### Playback Performance

- **Without cache**: 1-3 second delay (network + TTS generation)
- **With cache**: <100ms (instant playback)

## Troubleshooting

### Edge TTS 403 Forbidden Errors

**Error**: `✗ Error 500: {"error":"403, message='Invalid response status'`

**Cause**: Microsoft occasionally blocks the edge-tts library API temporarily

**Solutions**:

1. **Wait and Retry** (Recommended): Microsoft's blocks are usually temporary (hours to days)
   ```bash
   # Try again later
   python precompile_ml_midterm.py --yes
   ```

2. **Use Coqui TTS Instead**: Higher quality, but requires more setup
   ```bash
   ./start_tts.sh  # Start Coqui TTS server
   python precompile_all_cards.py  # Use original script
   ```

3. **Use Existing Cache**: The flashcard app already has audio_cache/ with cached files
   - Just use the existing cached audio
   - New cards will generate on-demand when played

### Server Not Available

**Error**: `Error: Edge TTS server not available`

**Solution**: Make sure the Edge TTS server is running:
```bash
python edge_tts_server.py
```

### Files Not Playing

**Check 1**: Verify audio files exist:
```bash
ls -la audio_cache/*/
```

**Check 2**: Check browser console for 404 errors

**Check 3**: Verify path matches in app.js:
```javascript
audioCacheDir: 'audio_cache',
```

### Permission Denied

**Error**: `Permission denied: 'audio_cache'`

**Solution**: Make sure the directory is writable:
```bash
chmod -R 755 audio_cache
```

## Additional TTS Servers

The app also supports:

### Coqui TTS (High Quality)
```bash
./start_tts.sh
```
Server: `http://localhost:5050`

### MeloTTS (Alternative)
```bash
python melo_server.py
```
Server: `http://localhost:5051`

### Browser TTS (Fallback)
No server needed - uses browser's built-in speech synthesis.

## See Also

- `precompile_all_cards.py` - Original precompile script for SE cards
- `precompile_edge_tts.py` - Alternative Edge TTS precompiler
- `LOGGING_README.md` - Logging system documentation
