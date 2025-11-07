# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-purpose web project (`mvo-website`) containing:
1. **Flash Cards Application** - Interactive study app with TTS (Text-to-Speech) capabilities
2. **Music Player Applications** - Three different approaches to sheet music playback
3. **DOT/GraphViz to LaTeX Converter** - Tools for converting GraphViz graphs to TikZ/PGF formats
4. **Next.js Components** - React-based pages and components

## Technology Stack

- **Backend**: Python (Flask), Node.js (Express)
- **Frontend**: Vanilla JavaScript, React (Next.js components)
- **TTS**: Coqui TTS with XTTS-v2 model (Python 3.9-3.11 required)
- **Music Rendering**: OpenSheetMusicDisplay, Verovio, WebAssembly
- **Audio**: Tone.js, Web Audio API, MIDI
- **Graph Processing**: GraphViz, dot2tex library
- **Deployment**: Vercel (see vercel.json)

## Project Structure

### Flash Cards Application (`/flash_cards/`)
Standalone web app with autoplay study deck functionality:
- **`index.html`** - Main HTML interface with controls for autoplay, speech, and navigation
- **`app.js`** - Client-side logic for flashcard display, TTS integration, and autoplay features
- **`cards.md`** - Markdown-formatted flashcard data (format: `#flashcards/section`)
- **`tts_server.py`** - Coqui TTS server providing high-quality voice synthesis (port 5050)
- **`melo_server.py`** - Alternative TTS server using MeloTTS (port 5051)
- **`precompile_*.py`** - Scripts to prebuild audio cache for faster loading

### Music Player Applications

#### Sheet Music Player (`/sheet-music-player/`)
Custom-built player with direct MusicXML/MuseScore support and MIDI playback:
- **Technology**: OpenSheetMusicDisplay + Tone.js + JSZip
- **Supported formats**: MusicXML (.musicxml, .xml), compressed MusicXML (.mxl), MuseScore files (.mscz, .mscx)
- **Key features**: Variable tempo control (25%-200%), volume control, perfect synchronization, real-time cursor following
- **Architecture**: All timing computed from score in real-time, no timemap generation needed
- **Advantages**: Works perfectly with tempo changes at all speeds, no MEI conversion required

**Quick start:**
```bash
cd sheet-music-player
npm run dev
# or
python3 -m http.server 8000
```

#### Music Player / Stratford Choir (`/music_player/`)
Verovio-based rehearsal platform with MIDI playback and AI vocal synthesis:
- **Technology**: Verovio + Web Audio API + music21 (Python backend)
- **Supported formats**: MusicXML, MEI (pre-rendered for faster loading)
- **Key features**: SATB part selection, tempo adjustment (50%-150%), AI vocal synthesis via FastAPI backend
- **Optimization**: Pre-render MusicXML to MEI format for 5-10x faster loading

**Pre-render scores for faster loading:**
```bash
cd music_player
npm run prerender
```

**Generate timemaps and assets:**
```bash
npm run generate-all
```

#### MusePlay (`/MusePlay/`)
WebAssembly-based player compiled directly from MuseScore source code:
- **Technology**: MuseScore C++ source compiled to WebAssembly with Emscripten
- **Status**: Under development (not production-ready)
- **Goal**: 100% MuseScore compatible rendering and playback, completely self-contained, no external dependencies
- **Build**: Requires Emscripten SDK

### Python Backend (`/`)
- **`app.py`** - Flask server serving multiple applications (DFA/graph visualization, music_player routes, flash_cards routes)
- **`dot2tex.py`** - Main module for converting GraphViz DOT to LaTeX (TikZ/PGF/PSTricks)
- **`dotparsing.py`** - Parser for DOT graph format
- **`base.py`, `pgfformat.py`, `pstricksformat.py`** - LaTeX format converters

### Next.js/React Components
- **`/pages/`** - Next.js pages including `study.js` (FlashcardApp integration)
- **`/components/`** - React components (FlashcardApp, QuizletApp)
- **`/lib/parseFlashcards.js`** - Parser for `cards.md` format

### Supporting Directories
- **`/lib/graphviz/`** - GraphViz library source (excluded from git)
- **`/dist/`** - TypeScript build output
- **`/templates/`**, **`/static/`** - Flask template and static files
- **`/MuseScore/`** - MuseScore source code (for MusePlay compilation)
- **`/emsdk/`** - Emscripten SDK for WebAssembly compilation

## Common Commands

### Flash Cards App

Start the Coqui TTS server:
```bash
cd flash_cards
./start_tts.sh
```

Start the MeloTTS server:
```bash
cd flash_cards
python melo_server.py
```

Precompile audio for faster loading:
```bash
cd flash_cards
source .venv-tts/bin/activate
python precompile_all_cards.py
```

Open the flash cards app:
```bash
# Simply open flash_cards/index.html in a browser
# Or serve with a static server:
cd flash_cards
python -m http.server 8000
```

### Sheet Music Player

Start development server:
```bash
cd sheet-music-player
npm run dev
# or
python3 -m http.server 8000
```

### Music Player (Stratford Choir)

Serve the player:
```bash
cd music_player
npm run serve
```

Pre-render MusicXML to MEI for faster loading:
```bash
cd music_player
npm run prerender
```

Generate all assets (timemaps, MEI files):
```bash
cd music_player
npm run generate-all
```

### MusePlay (WebAssembly)

Build the WebAssembly module:
```bash
cd MusePlay
source ../emsdk/emsdk_env.sh
./build.sh
```

Run the player:
```bash
cd MusePlay
python3 run.py
# or
./run.sh
```

### Flask Server (DOT to LaTeX)

Run the Flask development server:
```bash
python app.py
```

### Next.js/Development

Install dependencies:
```bash
npm install
```

Build TypeScript:
```bash
npx tsc
```

## Architecture Notes

### Flash Cards Markdown Format
The `cards.md` file uses a custom format parsed by `lib/parseFlashcards.js`:
- Section markers: Lines starting with `#flashcards/`
- Question lines: Usually formatted as `**1.1** *Question text*`
- Optional `?` separator line
- Answer lines: Continue until next `#flashcards/` marker

### TTS Integration Architecture
The flash cards app supports three TTS backends with automatic fallback:
1. **Precompiled Audio** (`usePrecompiled: true`) - Fastest, uses cached WAV files
2. **Coqui TTS** (`useCoquiTTS: true`) - High-quality XTTS-v2 model (port 5050)
3. **MeloTTS** (`useMeloTTS: true`) - Alternative TTS engine (port 5051)
4. **Browser TTS** - Final fallback using Web Speech API

The app checks servers in order and falls back to the next available option.

### Music Player Architecture Comparison

#### Sheet Music Player (`/sheet-music-player/`)
**File Loading → Score Rendering → MIDI Extraction → Playback → Synchronization**

1. Files parsed with JSZip (for compressed formats)
2. OpenSheetMusicDisplay renders SVG notation
3. MIDI data extracted directly from musical structure
4. Notes scheduled in Tone.js transport with real-time tempo scaling
5. Cursor updated via requestAnimationFrame

**Advantages:**
- Tempo changes work perfectly at all playback speeds
- No conversion or preprocessing needed
- All timing computed in real-time from score
- Simpler architecture, easier to modify

#### Music Player / Stratford (`/music_player/`)
**Pre-rendering (optional) → Score Loading → Verovio Rendering → MIDI Playback**

1. Optional: Pre-render MusicXML to MEI with `npm run prerender` for 5-10x faster loading
2. Verovio loads MEI (fast) or MusicXML (slower)
3. Score rendered to SVG with cursor tracking
4. MIDI files loaded separately for each voice part
5. Timemaps coordinate audio-visual synchronization

**Advantages:**
- MEI pre-rendering provides fastest loading
- Separate MIDI files allow per-voice control (muting/soloing)
- AI vocal synthesis available via Python backend
- Proven architecture with timemap synchronization

#### MusePlay (`/MusePlay/`)
**MuseScore C++ Source → Emscripten → WebAssembly**

1. Actual MuseScore code compiled to WASM
2. Native C++ performance in browser
3. Identical rendering to MuseScore desktop
4. All features available (loading, MIDI, rendering, timing)

**Advantages (when complete):**
- 100% MuseScore compatible
- No external dependencies
- Native performance
- Future-proof (can update with MuseScore releases)

**Status:** Under development, not production-ready

### DOT to LaTeX Conversion Flow
1. User submits DOT graph data via Flask form (`/dfa.html`)
2. `dot2tex.py` parses the DOT source using `dotparsing.py`
3. Format converters (`Dot2TikZConv`, `Dot2PGFConv`, etc.) generate LaTeX code
4. Result returned as both TikZ code and SVG preview

### Flask App Routing
The main Flask server (`app.py`) handles multiple sub-applications:
- `/flash_cards/*` - Serves flash cards app
- `/music_player/*` - Serves Stratford choir rehearsal app
- `/mplay/*` - Serves MusePlay application
- `/scores/*` - Serves MusePlay score files
- `/dfa.html` - DOT to LaTeX converter
- All other routes directed to `app.py`

### Deployment
The project is configured for Vercel deployment:
- Python backend uses `@vercel/python` builder
- Static files served via `@vercel/static` for `/music_player/**`
- All routes directed to `app.py`

## Important Development Notes

### Python Version Requirements
- **Coqui TTS**: Requires Python 3.9-3.11 (incompatible with 3.13+)
- **Flask/dot2tex**: Compatible with Python 3.8+
- **music21 (Music Player backend)**: Compatible with Python 3.8+

### Git Ignored Assets
Large assets are excluded from git (see `.gitignore`):
- `lib/graphviz/` - GraphViz library source
- `sounds/` - Audio files
- `venv/`, `.venv-tts/` - Virtual environments
- `.DS_Store` - macOS system files
- `emsdk/` - Emscripten SDK
- `flash_cards/.venv-tts/` - TTS virtual environment

### TTS Cache Location
Generated audio is cached in `/tmp/tts_cache/` (not persistent across reboots).

### Music Player Performance Optimization

**Sheet Music Player:**
- No preprocessing needed
- All timing computed in real-time
- Good for: Small to medium scores, tempo changes, quick testing

**Music Player / Stratford:**
- Pre-render MusicXML to MEI with `npm run prerender` for 5-10x faster loading
- MEI files slightly larger (~10-20%) but load much faster
- Run pre-rendering after adding/updating MusicXML files
- Good for: Production deployments, larger scores, repeated loading

**Example loading times:**
- MusicXML: ~2-5 seconds
- MEI (pre-rendered): ~0.3-0.5 seconds

### React/Next.js Integration
The project mixes vanilla JavaScript (flash cards, music players) with Next.js components:
- Flash cards and music players are standalone (no build step required)
- Next.js components in `/pages/` and `/components/` use SSG with `getStaticProps`

## Build and Deployment

### Vercel Deployment Issues

**Problem**: The deployment fails with `FUNCTION_INVOCATION_FAILED` due to large files being included in the build.

**Large Files to Exclude**:
- `flash_cards/.venv-tts/` - Python virtual environment (~500MB+)
- `lib/graphviz/` - GraphViz library source (~75MB)
- `sounds/FluidR3_GM.sf2` - SoundFont file (142MB, managed by Git LFS)
- `emsdk/` - Emscripten SDK (~1GB+)
- `MuseScore/` - MuseScore source code (~500MB+)

**Solution**: These directories must be excluded from Vercel deployment via `.vercelignore`.

### NPM Scripts
Available commands:
```bash
npm run build         # Compile TypeScript to JavaScript (./dist/)
npm run build:watch   # Compile TypeScript in watch mode
npm run check         # Type-check without emitting files
npm run clean         # Remove all compiled files from dist/
```

The project doesn't use Next.js build tooling despite having Next.js-style components in `/pages/`. The Flask app (`app.py`) is the primary server.

### TypeScript Build
The project includes TypeScript files in `/src/`:
- `dfa.ts` - Client-side DOT graph visualization
- `server.ts` - Express server for graph generation

To compile:
```bash
npm run build
# or
npx tsc
```

Output goes to `./dist/` directory with ES5 target and CommonJS modules.

### Vercel Configuration
The `vercel.json` specifies:
- Python backend using `@vercel/python` builder for `app.py`
- Static files from `music_player/**` directory
- All routes forwarded to `app.py`

**Important**: Vercel serverless functions have size limits (50MB compressed). The TTS functionality (`tts_server.py`, `melo_server.py`) and AI vocal synthesis backend cannot run on Vercel and must be deployed separately or run locally.

### Import Error Fixes

The `app.py` has been modified to handle optional imports gracefully:

**Problem**: The `dot2tex` module uses relative imports (`.base`, `.pgfformat`) which fail in Vercel's serverless environment with error:
```
ImportError: attempted relative import with no known parent package
```

**Solution**: All GraphViz and dot2tex imports are wrapped in try/except blocks:
- `GRAPHVIZ_AVAILABLE` - Set to `False` if graphviz can't be imported
- `DOT2TEX_AVAILABLE` - Set to `False` if dot2tex can't be imported
- The `/dfa.html` route returns a 503 error if GraphViz is unavailable
- The music players and flashcard routes work independently and don't require these libraries

This allows the flashcard and music player functionality to work on Vercel even when GraphViz/dot2tex dependencies fail.

## Choosing the Right Music Player

**Use Sheet Music Player (`/sheet-music-player/`) when:**
- You need tempo changes to work perfectly at all speeds
- You want to load MusicXML or MuseScore files directly without preprocessing
- You need a simple, easy-to-modify architecture
- You're prototyping or testing new scores
- You want real-time timing computation

**Use Music Player / Stratford (`/music_player/`) when:**
- You need the fastest possible loading (pre-rendered MEI)
- You need per-voice control (muting/soloing individual SATB parts)
- You want AI vocal synthesis capabilities
- You're deploying for production with a fixed set of scores
- You need proven timemap-based synchronization

**Use MusePlay (`/MusePlay/`) when:**
- You need 100% MuseScore desktop compatibility
- You want native performance
- You need a completely self-contained solution with no external dependencies
- Note: Currently under development, not production-ready
