#!/bin/bash

# Edge TTS Server Startup Script
# Completely FREE text-to-speech with Microsoft Edge voices

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

VENV_DIR=".venv-edge-tts"

echo "=================================================="
echo "  Edge TTS Server - FREE High-Quality TTS"
echo "=================================================="
echo ""

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Install/upgrade dependencies
echo "Installing dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements-edge-tts.txt

echo ""
echo "✓ All dependencies installed"
echo ""
echo "=================================================="
echo "  Starting Edge TTS Server on port 5052"
echo "=================================================="
echo ""
echo "Available features:"
echo "  • 40+ high-quality English voices"
echo "  • American, British, Australian, Irish accents"
echo "  • Automatic caching for instant playback"
echo "  • No API keys required"
echo "  • Completely FREE"
echo ""
echo "API Endpoints:"
echo "  http://localhost:5052/api/health"
echo "  http://localhost:5052/api/voices"
echo "  http://localhost:5052/api/speak"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

# Run the server
python edge_tts_server.py
