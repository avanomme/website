# MusePlay - Project Status

## ✅ Phase 1: Foundation - COMPLETE

### What's Been Built

A complete build system and infrastructure for compiling MuseScore source code to WebAssembly and running it as a web player.

### Files Created

```
MusePlay/
├── README.md                         ✅ Complete architecture overview
├── GETTING_STARTED.md                ✅ Step-by-step build guide
├── STATUS.md                         ✅ This file
├── CMakeLists.txt                    ✅ Emscripten build configuration
├── build.sh                          ✅ Automated build script
│
├── src/bindings/                     ✅ C++ ↔ JavaScript bridges (stubs)
│   ├── musescore_bindings.cpp        - Emscripten bindings
│   ├── score_loader.cpp              - Score loading (TODO: implement)
│   └── midi_generator.cpp            - MIDI generation (TODO: implement)
│
└── public/                           ✅ Web application
    ├── index.html                    - Player UI
    ├── player.js                     - JavaScript API
    └── wasm/                         - WebAssembly output (empty until built)
```

### Key Achievements

1. ✅ **Complete build system** - CMake + Emscripten configured
2. ✅ **Emscripten bindings structure** - C++ classes exposed to JavaScript
3. ✅ **JavaScript API** - Clean interface for loading and playing scores
4. ✅ **Modern UI** - Professional player interface
5. ✅ **Build automation** - One-command build process
6. ✅ **Comprehensive documentation** - README, getting started guide, inline comments

## 🚧 Phase 2: Implementation - TODO

### What Needs to Be Done

The **binding implementations** need to be completed. Currently they are stubs.

### Priority 1: Score Loading

**File:** `src/bindings/score_loader.cpp`

**Task:** Implement actual MuseScore file loading

```cpp
// Use MuseScore's native loaders
#include "engraving/rw/mscloader.h"

bool loadMscz(const std::string& data, MasterScore* score) {
    // 1. Write data to Emscripten virtual filesystem
    // 2. Use MscLoader::loadMscz() to parse
    // 3. Return success/failure
}
```

**MuseScore source to use:**
- `MuseScore/src/engraving/rw/mscloader.cpp` - .mscz loader
- `MuseScore/src/engraving/rw/xmlreader.cpp` - XML parsing
- `MuseScore/src/engraving/rw/read400/` - Format 4.x support

### Priority 2: MIDI Generation

**File:** `src/bindings/midi_generator.cpp`

**Task:** Generate MIDI data from loaded score

```cpp
// Use MuseScore's MIDI renderer
#include "engraving/compat/midi/compatmidirender.h"

std::vector<uint8_t> generateMIDI(MasterScore* score) {
    // 1. Use CompatMidiRender::renderScore()
    // 2. Extract MIDI events
    // 3. Build Standard MIDI File format
    // 4. Return as byte array
}
```

**MuseScore source to use:**
- `MuseScore/src/engraving/compat/midi/compatmidirender.cpp`
- `MuseScore/src/engraving/compat/midi/event.cpp`
- `MuseScore/src/engraving/compat/midi/velocitymap.cpp`

### Priority 3: SVG Rendering

**Task:** Render score pages to SVG

```cpp
// Use MuseScore's rendering engine
#include "engraving/rendering/dev/svgrenderer.h"

std::string renderPageSVG(MasterScore* score, int page) {
    // 1. Use SvgRenderer
    // 2. Render specific page
    // 3. Return SVG string
}
```

**MuseScore source to use:**
- `MuseScore/src/engraving/rendering/dev/svgrenderer.cpp`
- `MuseScore/src/engraving/rendering/score/` - Layout engine

### Priority 4: Timing/Timemap

**Task:** Generate timing information for synchronization

```cpp
// Extract note timing for cursor tracking
std::vector<TimingEvent> getTimeMap(MasterScore* score) {
    // 1. Iterate through all notes
    // 2. Calculate timestamps
    // 3. Map to note IDs
    // 4. Include tempo changes
}
```

## 📋 Build Checklist

### Before First Build

- [ ] Install Emscripten (see GETTING_STARTED.md)
- [ ] Verify CMake 3.20+
- [ ] Ensure MuseScore source is at `../MuseScore`

### Building

```bash
cd /Users/adam/projects/website/MusePlay
./build.sh
```

**Expected outcome:**
- ✅ Build completes (5-15 minutes)
- ✅ Files created:
  - `public/wasm/musescore_core.wasm` (~2-4 MB compressed)
  - `public/wasm/musescore_core.js` (~50-100 KB)

### Testing

```bash
cd public
python3 -m http.server 8000
open http://localhost:8000
```

**Expected behavior:**
- ✅ Page loads
- ✅ "Ready" status appears
- ✅ Can click "Load Score" button
- ⚠️ Loading will fail until bindings are implemented

## 🎯 Next Steps

### Immediate (This Week)

1. **Install Emscripten**
   ```bash
   cd /Users/adam/projects
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```

2. **First build attempt**
   ```bash
   cd /Users/adam/projects/website/MusePlay
   ./build.sh
   ```

3. **Test web app**
   ```bash
   cd public
   python3 -m http.server 8000
   ```

### Short Term (Next 2 Weeks)

1. **Implement score loading** (Priority 1)
   - Study `MuseScore/src/engraving/rw/mscloader.cpp`
   - Implement in `src/bindings/score_loader.cpp`
   - Test with simple .mscz files

2. **Implement MIDI generation** (Priority 2)
   - Study `MuseScore/src/engraving/compat/midi/`
   - Implement in `src/bindings/midi_generator.cpp`
   - Test playback with Web Audio API

3. **Implement SVG rendering** (Priority 3)
   - Study `MuseScore/src/engraving/rendering/`
   - Add rendering support
   - Test visual display

### Medium Term (Next Month)

1. **Timing/synchronization**
   - Timemap generation
   - Cursor tracking
   - Perfect audio-visual sync

2. **Feature additions**
   - Tempo control
   - Volume control
   - Multi-page support
   - Zoom controls

3. **Optimization**
   - Reduce WASM size
   - Faster loading
   - Memory efficiency

## 📊 Progress Tracking

### Foundation (Phase 1)
- [x] Project structure
- [x] Build system
- [x] Bindings framework
- [x] JavaScript API
- [x] UI design
- [x] Documentation

### Implementation (Phase 2)
- [ ] Score loading (0%)
- [ ] MIDI generation (0%)
- [ ] SVG rendering (0%)
- [ ] Timing/timemap (0%)

### Features (Phase 3)
- [ ] Playback controls (0%)
- [ ] Synchronization (0%)
- [ ] Multi-page support (0%)
- [ ] Advanced features (0%)

## 🎓 Learning Resources

### Understanding the Codebase

1. **MuseScore Architecture**
   - Read: `MuseScore/docs/`
   - Study: `MuseScore/src/engraving/README.md`

2. **Emscripten**
   - Docs: https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html
   - Examples: https://github.com/emscripten-core/emscripten/tree/main/test/embind

3. **WebAssembly**
   - Intro: https://webassembly.org/getting-started/developers-guide/
   - MDN: https://developer.mozilla.org/en-US/docs/WebAssembly

### Key MuseScore Files to Study

1. **Score Loading:**
   - `src/engraving/rw/mscloader.cpp:72` - Main load function
   - `src/engraving/rw/xmlreader.cpp` - XML parsing
   - `src/engraving/dom/masterscore.cpp` - Score structure

2. **MIDI Generation:**
   - `src/engraving/compat/midi/compatmidirender.cpp:50` - Main render function
   - `src/engraving/compat/midi/event.cpp` - MIDI events
   - `src/engraving/playback/` - Playback system

3. **Rendering:**
   - `src/engraving/rendering/dev/svgrenderer.cpp` - SVG output
   - `src/engraving/rendering/score/` - Layout calculations

## 💡 Tips

### Debugging

1. **Use debug builds:**
   ```bash
   cd build
   emcmake cmake .. -DCMAKE_BUILD_TYPE=Debug
   ```

2. **Check browser console:**
   - F12 → Console tab
   - Look for Emscripten errors
   - Check WASM module loading

3. **Add logging:**
   ```cpp
   #include <iostream>
   std::cout << "Debug: " << value << std::endl;
   ```

### Incremental Development

1. **Start simple:** Load just the score structure first
2. **Test frequently:** Build and test after each change
3. **Use git:** Commit working states

### Getting Help

- **Emscripten issues:** https://github.com/emscripten-core/emscripten/issues
- **MuseScore source questions:** Study existing code patterns
- **WebAssembly:** Stack Overflow

## 🎉 Current Status

**Foundation: ✅ COMPLETE**

Everything is in place to start building the actual integration. The hard infrastructure work is done - now it's "just" connecting the pieces using MuseScore's existing, proven code.

**Next action:** Run `./build.sh` and start implementing the bindings!

---

**Created:** 2025-01-05
**Status:** Ready for implementation
**Location:** `/Users/adam/projects/website/MusePlay/`
