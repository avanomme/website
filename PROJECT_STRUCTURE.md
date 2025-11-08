# Website Project Structure

## Overview

This is a multi-application web platform serving different tools and applications through a single Flask backend. The project has been reorganized for clarity and maintainability.

## Directory Structure

```
/website/
├── app.py                    # Main Flask application entry point
├── requirements.txt          # Python dependencies
├── package.json             # Node.js dependencies
├── CLAUDE.md                # AI assistant documentation
├── README.md                # Project readme
│
├── apps/                    # All web applications
│   ├── dfa/                # DFA/Graph visualization tool
│   ├── flashcards/         # Study flashcards with TTS
│   └── music/              # Music-related applications
│       ├── player/         # Sheet music player
│       ├── stratford/      # Choir rehearsal platform
│       └── museplay/       # MuseScore WebAssembly player
│
├── shared/                  # Shared resources
│   ├── static/             # Global static files (favicon, etc.)
│   ├── templates/          # Shared HTML templates
│   ├── lib/                # Shared JavaScript libraries
│   └── types/              # TypeScript type definitions
│
├── external/                # Large external dependencies (git-ignored)
│   ├── MuseScore/          # MuseScore source code (~500MB)
│   └── emsdk/              # Emscripten SDK (~1GB)
│
├── lib/                     # Python libraries (git-ignored)
│   └── graphviz/           # GraphViz library source
│
├── sounds/                  # Audio files (git-ignored)
│   └── FluidR3_GM.sf2      # SoundFont file (142MB)
│
├── docs/                    # Documentation
├── .archived/               # Old/deprecated files
└── [config files]           # .gitignore, vercel.json, etc.
```

## Application Descriptions

### DFA / Graph Visualization (`/dfa`)
**Location**: `apps/dfa/`
**URL**: `http://localhost:5001/dfa`

- Converts GraphViz DOT graphs to LaTeX TikZ format
- Interactive DFA (Deterministic Finite Automaton) generator
- Generates SVG previews and LaTeX code

**Key Files**:
- `templates/dfa.html` - Web interface
- `lib/` - dot2tex conversion library (local copy)
- `src/dfa.ts` - TypeScript source
- `dist/dfa.js` - Compiled JavaScript

### Flashcards (`/flashcards`)
**Location**: `apps/flashcards/`
**URL**: `http://localhost:5001/flashcards/`

- Interactive study flashcards with autoplay
- Multiple TTS (Text-to-Speech) backends:
  - Precompiled audio (fastest)
  - Coqui TTS (high quality, port 5050)
  - MeloTTS (alternative, port 5051)
  - Browser TTS (fallback)

**Key Files**:
- `index.html` - Main flashcard interface
- `app.js` - Client-side logic
- `cards.md` - Flashcard content
- `tts_server.py` - Coqui TTS server
- `melo_server.py` - MeloTTS server
- `components/` - React components (FlashcardApp, QuizletApp)

**Commands**:
```bash
cd apps/flashcards
./start_tts.sh          # Start Coqui TTS server
python melo_server.py   # Start MeloTTS server
```

### Music Applications (`/music/*`)

#### Sheet Music Player (`/music/player/`)
**Location**: `apps/music/player/`
**URL**: `http://localhost:5001/music/player/`

Custom-built music player with MIDI playback:
- Direct MusicXML, .mxl, and MuseScore file support
- Variable tempo control (25%-200%)
- Perfect synchronization with score highlighting
- Real-time timing computation

**Technology**: OpenSheetMusicDisplay + Tone.js + JSZip

#### Stratford Choir Platform (`/music/stratford/`)
**Location**: `apps/music/stratford/`
**URL**: `http://localhost:5001/music/stratford/`

Choir rehearsal platform with SATB part selection:
- Verovio-based score rendering
- Pre-render MusicXML to MEI for 5-10x faster loading
- Per-voice control (muting/soloing)
- AI vocal synthesis (via Python backend)

**Commands**:
```bash
cd apps/music/stratford
npm run prerender      # Convert MusicXML to MEI
npm run generate-all   # Generate timemaps and assets
```

#### MusePlay (`/music/museplay/`)
**Location**: `apps/music/museplay/`
**URL**: `http://localhost:5001/music/museplay/`

WebAssembly-based player compiled from MuseScore C++ source:
- 100% MuseScore desktop compatibility
- Native C++ performance in browser
- Self-contained, no external dependencies
- **Status**: Under development

## URL Routes

### Main Routes
- `/` - Landing page
- `/dfa` or `/dfa/` - DFA generator
- `/flashcards/` - Flashcards app
- `/music/player/` - Sheet music player
- `/music/stratford/` - Choir rehearsal platform
- `/music/museplay/` - MuseScore WASM player

### Legacy URLs (redirects)
- `/flash_cards/` → `/flashcards/`
- `/music_player/` → `/music/stratford/`
- `/mplay` → `/music/museplay/`
- `/grinch` → `/music/stratford/rehearse.html`

### API Endpoints
- `/api/scores` - List available scores
- `/api/convert-mscz` - Convert MuseScore files
- `/api/converted/<id>/<file>` - Serve converted files

## Key Features

### Multi-Template Support
Flask is configured with multiple template directories:
- `shared/templates/` - Shared templates
- `apps/dfa/templates/` - DFA-specific templates

### Legacy URL Compatibility
All old URLs still work via redirects to maintain backwards compatibility.

### Git-Ignored Large Files
- `external/` - MuseScore (~500MB) + emsdk (~1GB)
- `lib/graphviz/` - GraphViz library
- `sounds/` - Audio files (142MB SoundFont)
- `apps/flashcards/.venv-tts/` - TTS virtual environment

## Development

### Running the Server
```bash
python app.py
# Server runs on http://127.0.0.1:5001
```

### Installing Dependencies
```bash
# Python dependencies
uv pip install -r requirements.txt

# Node.js dependencies
npm install
```

### TypeScript Compilation
```bash
npm run build        # Compile TypeScript
npm run build:watch  # Watch mode
npm run check        # Type-check only
npm run clean        # Clean dist/
```

## Deployment

### Vercel Configuration
- `vercel.json` configures routing
- Python backend uses `@vercel/python` builder
- Static files served for music apps
- TTS servers must be deployed separately

### Important Notes
- Vercel has 50MB compressed size limit
- External dependencies (~1.5GB) excluded via `.vercelignore`
- TTS servers cannot run on Vercel (deploy separately)

## Organization Principles

1. **Apps are self-contained** - Each app in its own directory with all related files
2. **Shared resources centralized** - Common assets in `shared/`
3. **Large files hidden** - External dependencies in `external/` and git-ignored
4. **Clean root** - Only essential files in root directory
5. **Legacy compatibility** - Old URLs still work via redirects

## Migration Notes

### What Changed
- `flash_cards/` → `apps/flashcards/`
- `music_player/` → `apps/music/stratford/`
- `sheet-music-player/` → `apps/music/player/`
- `MusePlay/` → `apps/music/museplay/`
- `dot2tex_local/` → `apps/dfa/lib/`
- `MuseScore/`, `emsdk/` → `external/`
- Old files → `.archived/`

### What Was Removed
- Duplicate files (`app2.py`, `app copy.py`)
- Temporary files (`temp.*`, `*.log`)
- Old venv directory
- Unused Next.js pages
- Firebase functions (unused with Vercel)

## Future Improvements

- Complete MusePlay WebAssembly implementation
- Add comprehensive tests
- Improve documentation
- Set up CI/CD pipeline
- Add monitoring and analytics
