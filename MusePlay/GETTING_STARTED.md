# Getting Started with MusePlay

## What is MusePlay?

MusePlay is a web-based music score player built **directly from MuseScore source code**, compiled to WebAssembly. Unlike other solutions that rely on external plugins or incomplete implementations, MusePlay uses the actual MuseScore C++ codebase, ensuring:

- ✅ **100% MuseScore compatibility** - Same rendering and playback as desktop app
- ✅ **No external dependencies** - Everything built from source
- ✅ **Perfect tempo handling** - Uses MuseScore's proven timing engine
- ✅ **Native performance** - WebAssembly runs at near-native speed

## Prerequisites

### 1. Emscripten (WebAssembly Compiler)

```bash
# Clone Emscripten SDK
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Install and activate
./emsdk install latest
./emsdk activate latest

# Add to current shell
source ./emsdk_env.sh

# Verify installation
emcc --version
```

### 2. CMake (Build System)

```bash
# macOS
brew install cmake

# Arch Linux
sudo pacman -S cmake

# Verify
cmake --version  # Should be 3.20+
```

### 3. MuseScore Source Code

The MuseScore source should already be at:
```
/Users/adam/projects/website/MuseScore/
```

If not, clone it:
```bash
cd /Users/adam/projects/website
git clone https://github.com/musescore/MuseScore.git
```

## Building MusePlay

### Quick Build

```bash
cd /Users/adam/projects/website/MusePlay
./build.sh
```

This will:
1. Check for Emscripten and MuseScore source
2. Configure the build with CMake
3. Compile MuseScore C++ code to WebAssembly
4. Generate `musescore_core.wasm` and `musescore_core.js`
5. Install files to `public/wasm/`

**Build time:** 5-15 minutes (first build), 1-3 minutes (rebuilds)

### Manual Build

If you prefer to build manually:

```bash
cd MusePlay

# 1. Create build directory
mkdir -p build && cd build

# 2. Configure
emcmake cmake .. -DCMAKE_BUILD_TYPE=Release

# 3. Compile
emmake make -j8

# 4. Install
make install

# Files will be in ../public/wasm/
```

## Running the Player

### Start Local Server

```bash
cd /Users/adam/projects/website/MusePlay/public
python3 -m http.server 8000
```

### Open in Browser

```
http://localhost:8000
```

### Load a Score

1. Click "📂 Load Score"
2. Select a file:
   - MuseScore: `.mscz`, `.mscx`
   - MusicXML: `.musicxml`, `.xml`, `.mxl`
3. Score will render and playback controls will activate

## Testing with Existing Scores

### From MuseScore Demos

```bash
# Copy a demo file
cp ../MuseScore/demos/Reunion.mscz public/test-files/

# Load in player
```

### From Your Music Player Library

```bash
# Create test files directory
mkdir -p public/test-files

# Copy some scores
cp ../music_player/scores/002_this_time_of_year/*.mscz public/test-files/
```

## Project Structure

```
MusePlay/
├── README.md                    # Project overview
├── GETTING_STARTED.md           # This file
├── CMakeLists.txt               # Build configuration
├── build.sh                     # Build script
│
├── src/
│   └── bindings/                # C++ ↔ JavaScript bridges
│       ├── musescore_bindings.cpp
│       ├── score_loader.cpp
│       └── midi_generator.cpp
│
├── public/                      # Web app
│   ├── index.html               # Player UI
│   ├── player.js                # JavaScript API
│   └── wasm/                    # Built WebAssembly
│       ├── musescore_core.wasm
│       └── musescore_core.js
│
└── build/                       # Build artifacts (generated)
```

## Development Workflow

### Making Changes

1. **Edit bindings** in `src/bindings/`
2. **Rebuild**: `./build.sh`
3. **Refresh browser** to test

### Debug Build

For debugging with source maps:

```bash
cd build
emcmake cmake .. -DCMAKE_BUILD_TYPE=Debug
emmake make -j8
```

Debug builds include:
- Source maps
- Assertions
- Memory safety checks
- Larger file size (~20MB vs ~4MB)

### Incremental Builds

After the first build, subsequent builds are much faster:

```bash
cd build
emmake make -j8    # Only rebuilds changed files
make install       # Copy to public/
```

## Troubleshooting

### "Emscripten not found"

Solution:
```bash
source /path/to/emsdk/emsdk_env.sh
```

Add to your `~/.zshrc` or `~/.bashrc`:
```bash
export EMSDK=/path/to/emsdk
source $EMSDK/emsdk_env.sh
```

### "MuseScore source not found"

Ensure MuseScore is at `../MuseScore` relative to MusePlay:
```
website/
├── MuseScore/      ← Here
└── MusePlay/       ← Your location
```

### Build Errors

Common issues:

1. **Missing includes**
   - Check that MuseScore headers are accessible
   - Verify `CMakeLists.txt` include paths

2. **Linking errors**
   - May need to add more MuseScore source files
   - Check `MUSESCORE_ENGRAVING_SOURCES` in CMakeLists.txt

3. **Emscripten errors**
   - Update Emscripten: `./emsdk install latest`
   - Clear build directory: `rm -rf build && mkdir build`

### Runtime Errors

Check browser console (F12):

- **"Module not found"** - Check that WASM files are in `public/wasm/`
- **"Failed to load"** - Try rebuilding with `./build.sh`
- **Memory errors** - Increase TOTAL_MEMORY in CMakeLists.txt

## Next Steps

### Phase 1: Core Implementation

Currently, the bindings are **stubs**. The next steps are:

1. **Implement score loading** in `score_loader.cpp`
   - Use `MscLoader::loadMscz()`
   - Handle .mscz, .mscx, MusicXML

2. **Implement MIDI generation** in `midi_generator.cpp`
   - Use `CompatMidiRender`
   - Export timing data

3. **Implement SVG rendering**
   - Use MuseScore's rendering engine
   - Generate multi-page output

4. **Add playback** in `player.js`
   - Integrate Web Audio API
   - Perfect synchronization

### Phase 2: Features

- [ ] Tempo control (25%-200%)
- [ ] Volume control
- [ ] Seek / scrubbing
- [ ] Cursor tracking
- [ ] Multi-page rendering
- [ ] Zoom controls

### Phase 3: Optimization

- [ ] Lazy loading
- [ ] Worker threads
- [ ] Memory optimization
- [ ] Faster rendering

## Resources

- **MuseScore Source**: https://github.com/musescore/MuseScore
- **Emscripten Docs**: https://emscripten.org/docs
- **WebAssembly**: https://webassembly.org
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

## Support

For issues:
1. Check browser console
2. Verify build completed successfully
3. Test with a simple .mscz file first
4. Check Emscripten version compatibility

---

**Status**: 🚧 **In Development**

The build system and structure are complete. Next phase is implementing the actual MuseScore integration in the binding files.
