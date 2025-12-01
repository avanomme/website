# Flashcards App

Interactive study flashcards with Text-to-Speech support featuring Cox's custom voice.

## Quick Start

### Run the App

```bash
# Simply open in browser
open index.html

# Or serve with HTTP server
python3 -m http.server 8000
# Visit: http://localhost:8000
```

### View Different Modes

- **`index.html`** - Main flashcard viewer
- **`review.html`** - Review mode with spaced repetition
- **`editor.html`** - Card editor
- **`admin.html`** - Admin dashboard
- **`topics.html`** - Topic browser

## Features

- ✅ **Cox Voice TTS** - Custom-trained voice for natural speech
- ✅ **Autoplay Mode** - Automatic card progression
- ✅ **Multiple Formats** - Cards, quiz, review modes
- ✅ **Audio Caching** - Instant playback with precompiled audio
- ✅ **LaTeX Support** - Mathematical equations rendered beautifully
- ✅ **Image Support** - Base64-encoded images in cards

## Flashcard Files

- **`cards.md`** - Main flashcard deck
- **`ml_midterm_review.md`** - ML comprehensive review
- **`ml_midterm_cards.md`** - ML condensed cards
- **`ml_midterm_quiz.md`** - ML quiz questions
- **`ML_midterm_final_review.md`** - Final exam prep

## Audio Generation

### Generate Cox Voice Audio

```bash
# For specific files
python3 generate_cox_audio.py ml_midterm_review.md ml_midterm_cards.md

# For all files
python3 generate_cox_audio.py *.md
```

### Generate with Coqui TTS (Multiple Voices)

```bash
# Start TTS server
./start_tts.sh

# Generate audio (in another terminal)
python3 precompile_specific_files.py cards.md
```

## File Structure

```
/flashcards/
├── index.html              # Main app
├── app.js                  # Main JavaScript
├── app.css                 # Main styles
├── theme.css               # Theme styles
│
├── cards.md                # Flashcard content
├── ml_midterm_*.md         # ML study materials
│
├── generate_cox_audio.py   # Cox voice generator
├── precompile_specific_files.py  # Multi-voice generator
├── start_tts.sh            # TTS server starter
│
├── audio_cache/            # Cached audio files
│   ├── cox_voice/         # Cox voice audio
│   └── */                 # Other voices
│
├── scripts/                # Utility scripts
├── docs/                   # Documentation
├── archive/                # Old files
│
├── lib/                    # JavaScript libraries
├── components/             # Reusable components
└── pages/                  # Additional pages
```

## Documentation

See `docs/` directory for detailed documentation:

- **Audio Generation**: `docs/AUDIO_GENERATION.md`
- **Audio Precompilation**: `docs/AUDIO_PRECOMPILATION.md`
- **Card Management**: `docs/CARD_MANAGEMENT.md`
- **TTS Setup**: `docs/TTS_README.md`
- **Precompile Options**: `docs/PRECOMPILE_README.md`

## Scripts

### Audio Generation

- **`generate_cox_audio.py`** - Generate Cox voice audio for flashcards
- **`precompile_specific_files.py`** - Generate multi-voice audio
- **`scripts/generate_all_audio.py`** - Legacy: Generate all audio
- **`scripts/generate_voice_previews.py`** - Generate voice samples

### TTS Servers

- **`start_tts.sh`** - Start Coqui TTS server (port 5050)
- **`scripts/start_melo.sh`** - Start MeloTTS server (port 5051)
- **`scripts/start_edge_tts.sh`** - Start Edge TTS server (port 5052)

### Utilities

- **`scripts/check_setup.sh`** - Verify setup
- **`scripts/prepare_upload.sh`** - Prepare for deployment

## Cox Voice

The app uses a custom-trained Cox voice model for high-quality TTS.

**Cox TTS Location**: `~/cox_tts/`

**Usage**:
```bash
# Direct usage
cox-speak "Hello, this is Cox speaking"

# Generate for flashcards
python3 generate_cox_audio.py cards.md
```

See `~/cox_tts/COX_README.md` for complete Cox TTS documentation.

## Development

### Requirements

```bash
# Install Python dependencies
pip install -r requirements.txt

# For Cox voice (uses shared environment)
source ~/uv-envs/tts/bin/activate
```

### Adding New Cards

1. Edit `cards.md` (or create new `.md` file)
2. Follow format:
   ```markdown
   #flashcards/Category/Subcategory
   **Question text**
   ?
   Answer text
   ```

3. Generate audio:
   ```bash
   python3 generate_cox_audio.py your_file.md
   ```

### Card Format

```markdown
#### Section Title

#flashcards/Category/Topic
**Q1.1** *Question text here*
?
Answer text here

#flashcards/Category/Topic
**Q1.2** *Another question*
?
Another answer
```

## Audio Caching

Audio is cached in `audio_cache/` directory:

- **MD5 hash naming**: `{md5("text|voice_name")}.wav`
- **Instant playback**: Cached audio plays immediately
- **Cross-session**: Cache persists across sessions
- **Index file**: `audio_cache/index.json` for quick lookups

## LaTeX Support

Use LaTeX in your cards:

```markdown
**Question**: What is the quadratic formula?
?
$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
```

Inline math: `$E = mc^2$`

## Image Support

Base64-encoded images:

```markdown
![Description](data:image/png;base64,iVBORw0KG...)
```

## Troubleshooting

**No sound?**
1. Check if audio cache exists: `ls audio_cache/cox_voice/`
2. Generate audio: `python3 generate_cox_audio.py cards.md`
3. Check browser console for errors

**Cox voice not working?**
1. Verify Cox TTS installed: `ls ~/cox_tts/model.pth`
2. Test: `cox-speak "test"`
3. Check virtual environment: `source ~/uv-envs/tts/bin/activate`

**TTS server won't start?**
```bash
# Check if port is in use
lsof -i :5050

# Kill existing server
killall python3

# Restart
./start_tts.sh
```

## Git Configuration

`.gitignore` excludes:
- `audio_cache/` (except index.json)
- `.venv-*/`
- `*.log`
- Large audio files
- Temporary files

## Deployment

For Vercel/web deployment:

```bash
# Prepare
cd scripts
./prepare_upload.sh

# Deploy
vercel --prod
```

Note: TTS servers run locally only. Web deployment uses precompiled audio cache.

## License

Internal use - Cox voice model trained on personal voice samples.

## Support

For issues:
1. Check `docs/` directory for detailed guides
2. Review `CLEANUP_PLAN.md` for file organization
3. Check Cox TTS documentation: `~/cox_tts/COX_README.md`
