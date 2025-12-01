# Flashcards TTS Precompile System

Complete guide for precompiling all voice audio files and deploying to production.

## Overview

This system precompiles audio for all flashcards using:
- **10 XTTS-v2 voices** (Coqui TTS - high quality, multilingual)
- **42 Edge TTS voices** (Microsoft Edge - cloud-based, free)

Total: **52 voices** with complete audio coverage for all flashcards.

## Prerequisites

### Start TTS Servers

You need both TTS servers running:

```bash
# Terminal 1: Start Coqui TTS (XTTS-v2)
./start_tts.sh
# Runs on http://localhost:5050

# Terminal 2: Start Edge TTS
./start_edge_tts.sh
# Runs on http://localhost:5052
```

## Step 1: Precompile All Voices

Run the comprehensive precompile script:

```bash
./precompile_all_voices.py
```

This will:
1. Parse all flashcards from `ml_midterm_cards.md`
2. Generate audio for each card (question + answer) × 52 voices
3. Save to `audio_cache/{voice_name}/{card_number}_{q/a}.wav`

**Expected output:**
- 52 voice directories
- ~66 cards × 2 (Q+A) × 52 voices = **~6,864 audio files**
- Total size: **~500-800 MB** (compressed: ~300-400 MB)

**Time estimate:** 4-6 hours (with rate limiting to avoid server overload)

### Partial Precompile (Faster Testing)

To precompile only card 1.1 for all voices:

```bash
./train_all_q1.py
```

This creates test files for verifying all voices work correctly.

## Step 2: Verify Audio Cache

Check the generated cache:

```bash
# Count files per voice
for dir in audio_cache/*/; do
  echo "$(basename "$dir"): $(ls "$dir"*.wav 2>/dev/null | wc -l | tr -d ' ') files"
done

# Check total size
du -sh audio_cache/

# List all voice directories
ls -1 audio_cache/
```

Expected structure:
```
audio_cache/
├── gracie_wise/          (XTTS-v2 - British female)
│   ├── 1.1_q.wav
│   ├── 1.1_a.wav
│   ├── 1.2_q.wav
│   └── ...
├── claribel_dervla/      (XTTS-v2 - Irish female)
├── andrew_chipper/       (XTTS-v2 - British male)
├── aria/                 (Edge TTS - US female)
├── sonia/                (Edge TTS - UK female)
└── ... (52 total)
```

## Step 3: Prepare for Upload

Create a compressed archive and deployment guide:

```bash
./prepare_upload.sh
```

This creates:
- `audio_cache.tar.gz` - Compressed archive (~300-400 MB)
- `UPLOAD_INSTRUCTIONS.md` - Deployment guide

## Step 4: Deploy to Production

### Option A: GitHub (Recommended for Testing)

```bash
# Add audio cache to git
git add audio_cache/
git commit -m "Add precompiled audio cache for all 52 voices"
git push

# Update app.js to use relative path (already configured)
# audioCacheDir: 'audio_cache'
```

### Option B: CDN (Recommended for Production)

Upload to a CDN for faster global delivery:

1. **AWS S3 + CloudFront:**
```bash
aws s3 sync audio_cache/ s3://your-bucket/flashcards/audio_cache/ \
  --acl public-read \
  --cache-control max-age=31536000
```

2. **Update app.js:**
```javascript
audioCacheDir: 'https://your-cdn.cloudfront.net/flashcards/audio_cache'
```

### Option C: Netlify

1. Create a new site on Netlify
2. Drag and drop the `audio_cache/` folder
3. Get the URL: `https://your-site.netlify.app/`
4. Update app.js:
```javascript
audioCacheDir: 'https://your-site.netlify.app/audio_cache'
```

## Voice List

### XTTS-v2 Voices (10)

| Voice Name | Gender | Accent | Description |
|------------|--------|--------|-------------|
| Gracie Wise | Female | British | Clear and articulate |
| Claribel Dervla | Female | Irish | Warm and friendly |
| Andrew Chipper | Male | British | Professional |
| Ana Florence | Female | American | Natural |
| Brenda Stern | Female | American | Clear |
| Craig Gutsy | Male | Australian | Energetic |
| Daisy Studious | Female | British | Sophisticated |
| Gitta Nikolina | Female | American | Pleasant |
| Sofia Hellen | Female | American | Conversational |
| Viktor Eka | Male | American | Authoritative |

### Edge TTS Voices (42)

#### US English (8 voices)
- Aria (F), Guy (M), Jenny (F), Ryan (M), Michelle (F), Eric (M), Steffan (M), Ana (F)

#### UK English (14 voices)
- Sonia (F), Ryan UK (M), Libby (F), Abbi (F), Alfie (M), Bella (F), Elliot (M), Ethan (M), Holly (F), Maisie (F), Noah (M), Oliver (M), Olivia (F), Thomas (M)

#### Australian English (14 voices)
- Natasha (F), William (M), Annette (F), Carly (F), Darren (M), Duncan (M), Elsie (F), Freya (F), Joanne (F), Ken (M), Kim (F), Neil (M), Tim (M), Tina (F)

#### Irish English (2 voices)
- Emily (F), Connor (M)

#### Canadian English (2 voices)
- Clara (F), Liam (M)

#### Indian English (2 voices)
- Neerja (F), Prabhat (M)

## File Naming Convention

All audio files follow this pattern:
```
{voice_name}/{card_number}_{q_or_a}.wav

Examples:
- gracie_wise/1.1_q.wav       (Card 1.1 question)
- gracie_wise/1.1_a.wav       (Card 1.1 answer)
- aria/2.3_q.wav              (Card 2.3 question)
- ryan_uk/2.3_a.wav           (Card 2.3 answer, UK Ryan)
```

Voice names are converted to safe directory names:
- Spaces → underscores
- Lowercase
- Special characters removed
- Example: "Ryan (UK)" → "ryan_uk"

## Updating Voice Configuration

### To Add a New Voice

1. **For XTTS-v2:** Add to `XTTS_VOICES` in `precompile_all_voices.py`
2. **For Edge TTS:** Add to `EDGE_VOICES` in `precompile_all_voices.py`
3. Add to `voicesToCache` array in `app.js`
4. Re-run precompile script
5. Deploy updated cache

### To Remove a Voice

1. Delete the voice directory: `rm -rf audio_cache/{voice_name}/`
2. Remove from `voicesToCache` in `app.js`
3. Re-deploy

## Performance Optimization

### Browser Loading
- Files are loaded on-demand (only when voice is selected)
- First load triggers download, then cached by browser
- Subsequent plays are instant

### CDN Benefits
- Global edge caching
- Faster downloads
- Reduced bandwidth costs
- Better user experience

### Cache Headers
Set aggressive caching (files never change):
```
Cache-Control: public, max-age=31536000
```

## Troubleshooting

### Audio Not Loading
1. Check browser console for 404 errors
2. Verify `audioCacheDir` path in app.js
3. Check CORS headers if using CDN
4. Test with: `curl https://your-cdn/audio_cache/gracie_wise/1.1_q.wav`

### Voice Not in Picker
1. Verify voice is in `voicesToCache` array in app.js
2. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Check if corresponding TTS server is running

### Precompile Errors
1. Ensure both TTS servers are running
2. Check server logs for errors
3. Try with smaller batch first (test with `train_all_q1.py`)
4. Check disk space (need ~1 GB free)

## Cost Analysis

### Storage Costs

| Hosting | Size | Cost/Month |
|---------|------|------------|
| GitHub | ~400 MB | Free (< 1 GB) |
| AWS S3 | ~400 MB | ~$0.01 |
| Netlify | ~400 MB | Free (< 100 GB) |
| Vercel | ~400 MB | Free |

### Bandwidth Costs

With CDN and caching, each user only downloads voices they use.
Average user: 2-3 voices × 66 files × ~200 KB = ~30-40 MB/user

## Development vs Production

### Development (Local)
```javascript
audioCacheDir: 'audio_cache'  // Relative path
```
Files served from local directory during development.

### Production (CDN)
```javascript
audioCacheDir: 'https://cdn.example.com/audio_cache'  // Absolute CDN URL
```
Files served from CDN for fast global delivery.

## Maintenance

### Adding New Flashcards
1. Update `ml_midterm_cards.md` with new cards
2. Run `./precompile_all_voices.py` (only generates new files)
3. Deploy updated `audio_cache/` directory
4. No code changes needed

### Updating Existing Cards
1. Edit card text in `ml_midterm_cards.md`
2. Delete old audio files: `rm audio_cache/*/{card_number}_*.wav`
3. Re-run precompile script
4. Deploy updated files

## Scripts Reference

| Script | Purpose | Runtime |
|--------|---------|---------|
| `precompile_all_voices.py` | Generate all 52 voices | 4-6 hours |
| `train_all_q1.py` | Test generation (card 1.1 only) | 5-10 min |
| `precompile_simple.py` | Legacy script (XTTS only) | 1-2 hours |
| `prepare_upload.sh` | Create deployment package | < 1 min |
| `start_tts.sh` | Start Coqui TTS server | - |
| `start_edge_tts.sh` | Start Edge TTS server | - |

## Support

For issues or questions:
1. Check the browser console for errors
2. Review server logs (TTS servers)
3. Test individual voice files with curl
4. Verify all servers are running
