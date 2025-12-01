# Website Deployment Guide

This document explains the file structure and what needs to be uploaded/configured for each application to work in production.

## Overview

The website is deployed on **Vercel** with large assets stored on **Vercel Blob Storage**.

- **Vercel Deployment**: Code, HTML, CSS, JS, Python backend
- **Vercel Blob**: Audio files, SoundFonts, large media (too big for git/Vercel functions)
- **Redis Cloud**: Project storage for SE Use Case Mapper

**Blob Storage URL**: `https://1hmdoc4cfrzddig0.public.blob.vercel-storage.com`

---

## File Structure

```
/website/
├── app.py                      # Flask backend (Vercel serverless)
├── vercel.json                 # Vercel configuration
├── .env                        # Environment variables (BLOB_READ_WRITE_TOKEN)
│
├── apps/                       # All web applications
│   ├── flashcards/            # Study flashcards with TTS
│   ├── player/                # Sheet music player
│   ├── music/stratford/       # Choir rehearsal platform
│   ├── museplay/              # MuseScore WASM player (dev)
│   ├── dfa/                   # DFA/Graph visualization
│   └── se/                    # SE Use Case Mapper
│
├── shared/                     # Shared resources
│   ├── templates/             # Flask templates
│   ├── static/                # Global static files
│   └── lib/                   # Shared JS libraries
│
└── external/                   # Large dependencies (git-ignored)
    ├── MuseScore/             # ~500MB (local only)
    └── emsdk/                 # ~1GB (local only)
```

---

## Application Requirements

### 1. Flashcards (`/flashcards/`)

**Git Repository** (auto-deployed):
- `apps/flashcards/index.html`
- `apps/flashcards/app.js`
- `apps/flashcards/app.css`
- `apps/flashcards/cards.md`
- `apps/flashcards/se_final/**/*.md` (SE Final flashcards)
- `apps/flashcards/lib/` (JS libraries)

**Vercel Blob Storage** (manual upload):
```
Software_final_Audio/
├── SE_11.1_Q.wav      # Lecture 11, Q1 Question
├── SE_11.1_A.wav      # Lecture 11, Q1 Answer
├── SE_11.2_Q.wav
├── SE_11.2_A.wav
├── ...
└── SE_G.2_A.wav       # General section
```

**Audio Naming Convention**:
- `SE_{lecture}.{question}_{Q|A}.wav`
- Examples: `SE_11.1_Q.wav`, `SE_G.2_A.wav`

**Local Generation** (not deployed):
- `apps/flashcards/audio_cache/` - Generated audio cache
- `apps/flashcards/generate_*.py` - Audio generation scripts
- `~/cox_tts/` - Cox TTS model

---

### 2. Sheet Music Player (`/music/player/`)

**Git Repository**:
- `apps/player/*.html`
- `apps/player/*.js`
- `apps/player/*.css`
- `apps/player/scores/` - MusicXML/MEI files

**Vercel Blob Storage**:
```
soundfonts/
├── acoustic_grand_piano-ogg.js
├── choir_aahs-ogg.js
└── FluidR3_GM.sf2          # 142MB SoundFont
```

---

### 3. Stratford Choir Platform (`/music/stratford/`)

**Git Repository**:
- `apps/music/stratford/*.html`
- `apps/music/stratford/*.js`
- `apps/music/stratford/scores/` - Pre-rendered MEI files
- `apps/music/stratford/timemaps/` - Audio sync data

**Vercel Blob Storage**:
```
stratford/
├── midi/                    # MIDI files per voice
└── soundfonts/             # Instrument samples
```

---

### 4. SE Use Case Mapper (`/se/`)

**Git Repository**:
- `apps/se/*.html`
- `apps/se/*.js`
- `apps/se/*.css`

**Redis Cloud** (for project storage):
```bash
REDIS_URL=redis://default:...@redis-17646.c274.us-east-1-3.ec2.cloud.redislabs.com:17646
```

- **Storage**: Redis Cloud (30 MB limit)
- **Capacity**: ~600-3000 projects (depending on size)
- **Fallback**: Filesystem for local development

---

### 5. DFA Generator (`/dfa/`)

**Git Repository** (all files):
- `apps/dfa/templates/dfa.html`
- `apps/dfa/lib/` - dot2tex library
- `apps/dfa/dist/dfa.js`

**No Blob Storage Required**

---

## Vercel Blob Upload

### Setup
```bash
npm install @vercel/blob dotenv
```

### Environment Variable
Add to `.env`:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```

### Upload Script
```bash
cd apps/flashcards
node upload_to_vercel_blob.js
```

### Manual Upload via Vercel Dashboard
1. Go to Vercel Project → Storage → Blob
2. Create folder (e.g., `Software_final_Audio`)
3. Upload `.wav` files

---

## Git Ignored Files

These files are NOT in git and must be managed separately:

```gitignore
# Large dependencies
external/MuseScore/
external/emsdk/
lib/graphviz/

# Audio/media files
sounds/
apps/flashcards/audio_cache/
apps/flashcards/.venv-tts/

# Build artifacts
apps/museplay/temp/
.archived/

# Environment
.env
```

---

## Deployment Checklist

### First-Time Setup
- [ ] Configure Vercel project
- [ ] Set up Vercel Blob storage
- [ ] Add `BLOB_READ_WRITE_TOKEN` to Vercel environment
- [ ] Add `REDIS_URL` to Vercel environment (for SE app)
- [ ] Upload SoundFonts to Blob
- [ ] Upload initial audio files to Blob

### Adding New Flashcard Content
1. Create markdown files in `apps/flashcards/se_final/` or `cards.md`
2. Generate audio locally: `python generate_se_final_audio.py`
3. Upload audio to Vercel Blob: `node upload_to_vercel_blob.js`
4. Commit and push markdown files to git

### Adding New Music Scores
1. Add MusicXML/MEI to `apps/player/scores/` or `apps/music/stratford/scores/`
2. Generate timemaps if needed: `npm run generate-all`
3. Upload MIDI files to Blob if using separate audio
4. Commit and push

---

## URL Structure

### Production URLs
- Flashcards: `https://your-domain.vercel.app/flashcards/`
- Music Player: `https://your-domain.vercel.app/music/player/`
- Stratford: `https://your-domain.vercel.app/music/stratford/`
- SE Mapper: `https://your-domain.vercel.app/se/`
- DFA: `https://your-domain.vercel.app/dfa/`

### Blob Storage URLs
- Base: `https://1hmdoc4cfrzddig0.public.blob.vercel-storage.com/`
- Audio: `{base}/Software_final_Audio/SE_11.1_Q.wav`
- SoundFonts: `{base}/soundfonts/FluidR3_GM.sf2`

---

## Cox TTS Audio Generation

### Prerequisites
- Cox TTS model at `~/cox_tts/`
- Python virtual environment at `~/uv-envs/tts/`

### Generate SE Final Audio
```bash
cd apps/flashcards
python generate_se_final_audio.py
```

Files are saved to: `audio_cache/cox_voice/SE_Final_Audio/`

### File Naming
- `SE_11.1_Q.wav` - Lecture 11, Question 1, Question audio
- `SE_11.1_A.wav` - Lecture 11, Question 1, Answer audio
- `SE_G.1_Q.wav` - General section, Question 1

---

## Troubleshooting

### Audio Not Playing
1. Check Vercel Blob upload completed
2. Verify URL in browser: `https://1hmdoc4cfrzddig0.public.blob.vercel-storage.com/Software_final_Audio/SE_11.1_Q.wav`
3. Check browser console for CORS errors
4. Ensure `access: 'public'` was set during upload

### Flashcards Not Loading
1. Check `cards.md` format (needs `#flashcards/` tags)
2. Verify markdown parser in `lib/parseFlashcards.js`
3. Check browser console for errors

### Music Player Silent
1. Verify SoundFonts uploaded to Blob
2. Check audio context unlocked (user interaction required)
3. Look for MIDI loading errors in console

### Redis Connection Issues
If Redis fails to connect, the SE app automatically falls back to filesystem storage.

```bash
# Test Redis connection
python -c "import redis; r = redis.from_url('REDIS_URL'); r.ping(); print('Connected!')"
```

---

**Last Updated**: 2025-12-01
