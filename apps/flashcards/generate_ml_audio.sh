#!/bin/bash

# ML Midterm Audio Generation Script
# This script sets up Edge TTS and generates all audio files for ML midterm flashcards

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

VENV_DIR=".venv-edge-tts"

echo "=========================================================================="
echo "  ML Midterm Flashcard Audio Generator"
echo "=========================================================================="
echo ""
echo "This script will:"
echo "  1. Set up Python virtual environment"
echo "  2. Install Edge TTS (free, no API key needed)"
echo "  3. Start Edge TTS server in background"
echo "  4. Generate all audio files for ML midterm cards"
echo "  5. Stop the server when done"
echo ""
echo "=========================================================================="
echo ""

# Create virtual environment if needed
if [ ! -d "$VENV_DIR" ]; then
    echo "[1/5] Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
    echo "✓ Virtual environment created"
else
    echo "[1/5] Virtual environment already exists"
fi

# Activate virtual environment
echo ""
echo "[2/5] Activating virtual environment..."
source "$VENV_DIR/bin/activate"
echo "✓ Virtual environment activated"

# Install dependencies
echo ""
echo "[3/5] Installing dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements-edge-tts.txt -q
echo "✓ Dependencies installed (edge-tts, flask)"

# Start Edge TTS server in background
echo ""
echo "[4/5] Starting Edge TTS server..."
python edge_tts_server.py &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 3

# Check if server is running
if ! curl -s http://localhost:5052/api/health > /dev/null 2>&1; then
    echo "✗ Error: Server failed to start"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

echo "✓ Server running on http://localhost:5052"

# Generate audio files
echo ""
echo "[5/5] Generating audio files..."
echo "=========================================================================="
echo ""
python precompile_ml_midterm.py

# Cleanup
echo ""
echo "=========================================================================="
echo "Stopping Edge TTS server..."
kill $SERVER_PID 2>/dev/null || true
sleep 1

echo ""
echo "=========================================================================="
echo "✓ AUDIO GENERATION COMPLETE"
echo "=========================================================================="
echo ""
echo "Generated files location:"
echo "  $(pwd)/audio_cache/"
echo ""
echo "Next steps:"
echo "  1. Review the audio files in audio_cache/"
echo "  2. Upload the entire audio_cache/ directory to your web server"
echo "  3. The flashcard app will automatically use cached audio"
echo ""
echo "Cache directory size:"
du -sh audio_cache 2>/dev/null || echo "  (no files yet)"
echo ""
echo "=========================================================================="
