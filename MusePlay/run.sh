#!/bin/bash
# MusePlay Standalone Server Launcher
# Simple shell script to launch the MusePlay player

PORT=8080
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "======================================================================"
echo "🎵 MusePlay - Native MuseScore Web Player"
echo "======================================================================"
echo ""
echo "📁 Serving from: $SCRIPT_DIR"
echo "🌐 Starting server on http://localhost:$PORT"
echo ""
echo "✅ Open your browser to: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "======================================================================"
echo ""

cd "$SCRIPT_DIR"
python3 -m http.server $PORT
