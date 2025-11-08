#!/bin/bash

echo "Starting MeloTTS Server..."
echo ""

# Check if melo command exists
if ! command -v source ~/uv-envs/melo/bin/activate &> /dev/null; then
    echo "Error: 'melo' command not found"
    echo "Please install MeloTTS first"
    exit 1
fi

# Activate MeloTTS environment and run server
echo "Activating melo environment..."
source ~/uv-envs/melo/bin/activate <<EOF
python melo_server.py
EOF
