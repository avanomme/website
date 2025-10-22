#!/bin/bash

echo "Starting Coqui TTS Server with XTTS-v2..."
echo ""

# Use Python 3.11 venv for TTS (requires Python < 3.12)
VENV_DIR=".venv-tts"

if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python 3.11 virtual environment..."
    python3.11 -m venv $VENV_DIR
fi

echo "Activating virtual environment..."
source $VENV_DIR/bin/activate

# Check if requirements are installed
echo "Checking dependencies..."
python -c "import TTS" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing dependencies (this may take a few minutes)..."
    pip install -r requirements.txt
fi

echo ""
echo "Starting TTS server on http://localhost:5050"
echo "Press Ctrl+C to stop"
echo ""

python tts_server.py
