#!/bin/bash
# MusePlay Build Script
# Compiles MuseScore source code to WebAssembly

set -e  # Exit on error

echo "🎵 MusePlay Build Script"
echo "========================"
echo ""

# Check for Emscripten
if ! command -v emcc &> /dev/null; then
    echo "❌ Emscripten not found!"
    echo "Please install Emscripten:"
    echo "  https://emscripten.org/docs/getting_started/downloads.html"
    echo ""
    echo "Quick install:"
    echo "  git clone https://github.com/emscripten-core/emsdk.git"
    echo "  cd emsdk"
    echo "  ./emsdk install latest"
    echo "  ./emsdk activate latest"
    echo "  source ./emsdk_env.sh"
    exit 1
fi

echo "✓ Emscripten found: $(emcc --version | head -n 1)"
echo ""

# Check for MuseScore source
if [ ! -d "../MuseScore" ]; then
    echo "❌ MuseScore source not found!"
    echo "Expected at: ../MuseScore"
    echo "The MuseScore directory should be at the same level as MusePlay"
    exit 1
fi

echo "✓ MuseScore source found"
echo ""

# Create build directory
echo "📁 Creating build directory..."
mkdir -p build
cd build

# Configure with CMake
echo "⚙️  Configuring with CMake..."
emcmake cmake .. \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=../public

# Build
echo "🔨 Compiling to WebAssembly..."
echo "This may take 5-15 minutes..."
emmake make -j$(nproc)

# Install
echo "📦 Installing..."
make install

cd ..

echo ""
echo "✅ Build complete!"
echo ""
echo "Output files:"
echo "  - public/wasm/musescore_core.wasm"
echo "  - public/wasm/musescore_core.js"
echo ""
echo "To test:"
echo "  cd public"
echo "  python3 -m http.server 8000"
echo "  open http://localhost:8000"
echo ""
