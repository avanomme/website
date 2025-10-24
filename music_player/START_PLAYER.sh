#!/bin/bash
# Quick start script for MuseScore Player

echo "Starting MuseScore Web Player..."
echo "================================"
echo ""

cd "musescore-player"

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✓ Python 3 found"
    echo ""
    echo "Server will start on http://localhost:8000"
    echo ""
    echo "Available pages:"
    echo "  • Player:   http://localhost:8000/../player4.html"
    echo "  • Rehearse: http://localhost:8000/../rehearse4.html"
    echo "  • Tests:    http://localhost:8000/tests/test-player.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "================================"
    echo ""
    
    python3 server.py
else
    echo "✗ Error: Python 3 not found"
    echo "Please install Python 3 to run the server"
    exit 1
fi
