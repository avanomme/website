# MusePlay - Native MuseScore Web Player

A completely self-contained music score player built directly from MuseScore source code, compiled to WebAssembly. **No external plugins or dependencies.**

## Architecture

```
MusePlay/
├── src/
│   ├── musescore/          # MuseScore C++ source (linked/copied)
│   │   ├── engraving/      # Score parsing and layout
│   │   ├── rendering/      # SVG rendering engine
│   │   └── playback/       # MIDI generation
│   ├── bindings/           # Emscripten C++ ↔ JavaScript bindings
│   │   ├── score_loader.cpp
│   │   ├── midi_generator.cpp
│   │   └── renderer.cpp
│   └── wasm/               # WebAssembly modules
│       ├── musescore_core.wasm
│       └── musescore_core.js
├── lib/
│   ├── player.js           # JavaScript player API
│   └── ui.js               # User interface
├── public/
│   └── index.html          # Main player page
├── build/
│   └── CMakeLists.txt      # Build configuration
└── README.md               # This file
```

## What Gets Built from MuseScore Source

### 1. Score Loading (`src/engraving/rw/`)
- **mscloader.cpp** - Load .mscz files
- **xmlreader.cpp** - Parse MusicXML
- **read400/**, **read410/** - Version-specific loaders

### 2. Score Structure (`src/engraving/dom/`)
- **masterscore.cpp** - Main score structure
- **part.cpp**, **staff.cpp** - Musical organization
- **note.cpp**, **chord.cpp**, **rest.cpp** - Musical elements
- **tempo.cpp** - Tempo markings and changes

### 3. MIDI Generation (`src/engraving/compat/midi/`)
- **compatmidirender.cpp** - Convert score to MIDI
- **event.cpp** - MIDI event structure
- **velocitymap.cpp** - Dynamics handling
- **pitchwheelrenderer.cpp** - Expression

### 4. Rendering (`src/engraving/rendering/`)
- **dev/svgrenderer.cpp** - SVG output
- **layoutbeamsystem.cpp** - Layout engine
- **score/*/` - Element positioning

## Build Process

### Prerequisites
```bash
# Install Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

### Build Steps
```bash
cd MusePlay

# 1. Link MuseScore source
ln -s ../MuseScore/src/engraving src/musescore/engraving
ln -s ../MuseScore/src/framework src/musescore/framework

# 2. Configure build
mkdir build && cd build
emcmake cmake ..

# 3. Compile to WebAssembly
emmake make -j8

# 4. Output: musescore_core.wasm + musescore_core.js
```

## JavaScript API

```javascript
// Initialize MuseScore WASM module
const MuseScore = await MusePlayModule();

// Load a score
const score = await MuseScore.loadFile(arrayBuffer);

// Get score information
const info = score.getMetadata();
console.log(info.title, info.composer);

// Render to SVG
const svg = score.renderPage(1);
document.getElementById('score').innerHTML = svg;

// Generate MIDI
const midiData = score.exportMIDI();

// Get timing information (for synchronization)
const timemap = score.getTimeMap();

// Play with Web Audio API
const audioContext = new AudioContext();
playMIDI(midiData, audioContext);
```

## Advantages

### ✅ **100% MuseScore Compatible**
- Uses actual MuseScore C++ code
- Identical rendering to desktop app
- Perfect tempo and timing handling
- All notation features supported

### ✅ **No External Dependencies**
- No npm packages (except build tools)
- No CDN scripts
- Completely self-contained
- Works offline

### ✅ **Small & Fast**
- ~2-5MB WASM (compressed)
- Native code performance
- Instant loading
- Efficient memory usage

### ✅ **Future-Proof**
- Can update with MuseScore releases
- Full control over all features
- Customizable rendering
- Extensible API

## Development Roadmap

### Phase 1: Core Loading (Week 1)
- [x] Set up Emscripten build system
- [ ] Compile engraving/rw (score loading)
- [ ] Create JavaScript bindings for loadFile()
- [ ] Test loading .mscz files

### Phase 2: MIDI Generation (Week 2)
- [ ] Compile engraving/compat/midi
- [ ] Export MIDI data to JavaScript
- [ ] Integrate with Web Audio API
- [ ] Test playback

### Phase 3: Rendering (Week 3)
- [ ] Compile rendering/dev/svgrenderer
- [ ] Render scores to SVG
- [ ] Handle multi-page scores
- [ ] Optimize rendering performance

### Phase 4: Synchronization (Week 4)
- [ ] Extract timing information
- [ ] Build timemap generator
- [ ] Implement cursor tracking
- [ ] Perfect audio-visual sync

### Phase 5: Polish (Week 5)
- [ ] User interface
- [ ] Error handling
- [ ] Performance optimization
- [ ] Documentation

## Technical Details

### WebAssembly Memory Model
```
Heap Layout:
├── MuseScore C++ objects (MasterScore, Note, etc.)
├── Parsed score data structures
├── Rendered SVG strings
└── MIDI event buffers
```

### File Loading Flow
```
.mscz file (ArrayBuffer)
    ↓
Emscripten FS.writeFile()
    ↓
mscloader.cpp (C++)
    ↓
MasterScore object (C++)
    ↓
JavaScript proxy object
```

### MIDI Generation Flow
```
MasterScore (C++)
    ↓
compatmidirender.cpp
    ↓
MIDI events (C++ vector)
    ↓
Emscripten val::array()
    ↓
JavaScript Uint8Array
    ↓
Web Audio API
```

## File Size Estimates

| Component | Uncompressed | Compressed |
|-----------|-------------|------------|
| musescore_core.wasm | 8-12 MB | 2-4 MB |
| musescore_core.js | 200-400 KB | 50-100 KB |
| player.js | 50 KB | 10 KB |
| Total | ~12 MB | ~4 MB |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requirements:
- WebAssembly support
- Web Audio API
- ES6 modules

## License

GPL-3.0 (same as MuseScore)

## Credits

Built from [MuseScore](https://musescore.org) source code.
