#!/bin/bash

echo "Restarting Coqui TTS Server..."

# Find and kill existing TTS server
PID=$(lsof -ti:5050)
if [ ! -z "$PID" ]; then
    echo "Stopping existing server (PID: $PID)..."
    kill $PID
    sleep 2
fi

# Start the server
./start_tts.sh
