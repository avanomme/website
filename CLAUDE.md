# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-purpose web project (`mvo-website`) containing:
1. **Flash Cards Application** - An interactive study app with TTS (Text-to-Speech) capabilities
2. **DOT/GraphViz to LaTeX Converter** - Tools for converting GraphViz graphs to TikZ/PGF formats
3. **Next.js Components** - React-based pages and components

## Technology Stack

- **Backend**: Python (Flask), Node.js (Express)
- **Frontend**: Vanilla JavaScript, React (Next.js components)
- **TTS**: Coqui TTS with XTTS-v2 model (Python 3.9-3.11 required)
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

### Python Backend (`/`)
- **`app.py`** - Flask server for DFA/graph visualization with dot2tex conversion
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

### DOT to LaTeX Conversion Flow
1. User submits DOT graph data via Flask form (`/dfa.html`)
2. `dot2tex.py` parses the DOT source using `dotparsing.py`
3. Format converters (`Dot2TikZConv`, `Dot2PGFConv`, etc.) generate LaTeX code
4. Result returned as both TikZ code and SVG preview

### Deployment
The project is configured for Vercel deployment:
- Python backend uses `@vercel/python` builder
- Static files served via `@vercel/static`
- All routes directed to `app.py`

## Important Development Notes

### Python Version Requirements
- **Coqui TTS**: Requires Python 3.9-3.11 (incompatible with 3.13+)
- **Flask/dot2tex**: Compatible with Python 3.8+

### Git Ignored Assets
Large assets are excluded from git (see `.gitignore`):
- `lib/graphviz/` - GraphViz library source
- `sounds/` - Audio files
- `venv/`, `.venv-tts/` - Virtual environments
- `.DS_Store` - macOS system files

### TTS Cache Location
Generated audio is cached in `/tmp/tts_cache/` (not persistent across reboots).

### React/Next.js Integration
The project mixes vanilla JavaScript (flash cards) with Next.js components:
- Flash cards app is standalone (no build step required)
- Next.js components in `/pages/` and `/components/` use SSG with `getStaticProps`

## Build and Deployment

### Vercel Deployment Issues

**Problem**: The deployment fails with `FUNCTION_INVOCATION_FAILED` due to large files being included in the build.

**Large Files to Exclude**:
- `flash_cards/.venv-tts/` - Python virtual environment (~500MB+)
- `lib/graphviz/` - GraphViz library source (~75MB)
- `sounds/FluidR3_GM.sf2` - SoundFont file (142MB, managed by Git LFS)

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
- Static files from `lib/**` directory
- All routes forwarded to `app.py`

**Important**: Vercel serverless functions have size limits (50MB compressed). The TTS functionality (`tts_server.py`, `melo_server.py`) cannot run on Vercel and must be deployed separately or run locally.

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
- The `/study.html` route works independently and doesn't require these libraries

This allows the flashcard functionality (`/study.html`) to work on Vercel even when GraphViz/dot2tex dependencies fail.
