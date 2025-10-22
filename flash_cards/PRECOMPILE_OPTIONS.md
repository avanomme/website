# Audio Precompilation Options

## Quick Reference

### Option 1: Single Voice (Sofia Hellen) - FASTEST ⚡
**Best for**: Quick setup, testing, or if you only need one voice

```bash
source .venv-tts/bin/activate
python precompile_sofia.py
```

**Details:**
- Voice: Sofia Hellen (female, American accent)
- Time: ~2-4 minutes for 60 cards
- Size: ~5-10 MB
- Use case: Fast generation, single-voice preference

### Option 2: All Voices - COMPLETE 🎯
**Best for**: Maximum flexibility, all users, production deployment

```bash
source .venv-tts/bin/activate
python precompile_all_cards.py
```

**Details:**
- Voices: All available (Coqui + MeloTTS)
- Time: ~30-40 minutes for 60 cards × 14 voices
- Size: ~50-100 MB
- Use case: All voices precompiled, instant playback for any selection

### Option 3: On-Demand (No Precompilation) - ZERO SETUP ⏱️
**Best for**: Development, changing cards frequently, small decks

```bash
# Just start the server and use the app
./start_tts.sh
open index.html
```

**Details:**
- No precompilation needed
- First play: ~2-3 seconds (generation)
- Subsequent plays: Instant (server cache)
- Use case: Quick iterations, don't care about initial delay

## Comparison Table

| Method | Setup Time | First Play | Subsequent Play | Disk Space | Best For |
|--------|-----------|-----------|-----------------|------------|----------|
| **Sofia Only** | 2-4 min | Instant | Instant | ~10 MB | Quick start |
| **All Voices** | 30-40 min | Instant | Instant | ~100 MB | Production |
| **On-Demand** | 0 min | 2-3 sec | Instant | ~0 MB | Development |

## Creating Custom Single-Voice Scripts

Want to precompile a different voice? Copy and modify `precompile_sofia.py`:

```python
# Change this line:
VOICE_NAME = "Sofia Hellen"

# To any voice you want:
VOICE_NAME = "Andrew Chipper"    # British male ⭐
VOICE_NAME = "Claribel Dervla"   # Irish female ⭐
VOICE_NAME = "Craig Gutsy"       # Australian male ⭐
VOICE_NAME = "Daisy Studious"    # British female ⭐
VOICE_NAME = "Gracie Wise"       # British female ⭐
```

Save as `precompile_{voice}.py` and run it.

## Why Sofia Hellen?

Sofia Hellen was chosen for the quick script because:
- ✓ High-quality American accent (widely understood)
- ✓ Female voice (good for variety)
- ✓ Clear pronunciation
- ✓ Reliable generation (rarely fails)
- ✓ Not marked as "preferred" (so doesn't clutter that section)

## Performance Tips

### Parallel Generation (Advanced)
Generate multiple voices in parallel to save time:

```bash
# Terminal 1
source .venv-tts/bin/activate
python precompile_sofia.py

# Terminal 2 (modify script for different voice)
source .venv-tts/bin/activate
python precompile_andrew.py  # If you created this

# Terminal 3
source .venv-tts/bin/activate
python precompile_claribel.py  # If you created this
```

### Incremental Precompilation
Scripts automatically skip existing files, so you can:

1. Start with Sofia: `python precompile_sofia.py`
2. Test the app with that voice
3. Later add more: `python precompile_all_cards.py` (skips Sofia)

### Selective Voice Precompilation
Edit `precompile_all_cards.py` to only include specific voices:

```python
# Find the voice filtering section and add:
preferred_accents = ['British', 'Irish', 'Australian']
voices_to_compile = [v for v in all_voices if v['accent'] in preferred_accents]
```

## Workflow Recommendations

### For Development
1. Use on-demand (no precompilation)
2. Edit cards freely
3. Test changes immediately

### For Production
1. Finalize your cards.md
2. Run `precompile_all_cards.py` once
3. Commit `audio_cache/` to git (or deploy to CDN)
4. Users get instant playback

### For Personal Use
1. Run `precompile_sofia.py` (quick)
2. Test if you like it
3. If yes, optionally run `precompile_all_cards.py` for more voices

## Maintenance

### When Adding New Cards
```bash
# Option 1: Regenerate everything (fast, skips existing)
python precompile_all_cards.py

# Option 2: Just regenerate Sofia
python precompile_sofia.py

# Option 3: Use on-demand for new cards
# (they'll generate on first play, then be cached)
```

### Clearing Cache
```bash
# Clear precompiled local cache
rm -rf audio_cache/

# Clear server cache
rm -rf /tmp/tts_cache/ /tmp/melo_cache/

# Clear Sofia only
rm -rf audio_cache/Sofia_Hellen/
```

## Cost-Benefit Analysis

### Sofia Only (Quick Script)
- **Investment**: 2-4 minutes
- **Benefit**: 100% instant playback for one voice
- **Trade-off**: Users must use Sofia Hellen (no choice)

### All Voices (Full Script)
- **Investment**: 30-40 minutes
- **Benefit**: 100% instant playback for all voices
- **Trade-off**: Large disk space (~100 MB)

### On-Demand (No Script)
- **Investment**: 0 minutes
- **Benefit**: Maximum flexibility, no disk space
- **Trade-off**: First-time 2-3s delay per card

## Recommended Approach

For most users, we recommend:

1. **Start with Sofia** (`precompile_sofia.py`)
   - Quick setup
   - Test the system
   - Decide if you like it

2. **Upgrade to All** (if needed)
   - Run `precompile_all_cards.py`
   - Gets all voices
   - Sofia files are kept (skipped)

3. **Or Stay On-Demand** (if preferred)
   - No precompilation hassle
   - 2-3 second delay is acceptable for many users
   - Server cache makes it fast after first play

Choose what works best for your use case!
