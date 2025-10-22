#!/bin/bash

echo "================================"
echo "Flash Cards Setup Checker"
echo "================================"
echo ""

# Check Coqui TTS server
echo "[1/5] Checking Coqui TTS Server..."
if curl -s -f http://localhost:5050/api/health > /dev/null 2>&1; then
    VOICES=$(curl -s http://localhost:5050/api/voices | grep -o '"name"' | wc -l | tr -d ' ')
    echo "✓ Coqui server running with $VOICES voices"
else
    echo "✗ Coqui server NOT running (start with: ./start_tts.sh)"
fi
echo ""

# Check MeloTTS server
echo "[2/5] Checking MeloTTS Server..."
if curl -s -f http://localhost:5051/api/health > /dev/null 2>&1; then
    VOICES=$(curl -s http://localhost:5051/api/voices | grep -o '"name"' | wc -l | tr -d ' ')
    echo "✓ MeloTTS server running with $VOICES voices"
else
    echo "✗ MeloTTS server NOT running (start with: ./start_melo.sh)"
fi
echo ""

# Check cards.md
echo "[3/5] Checking cards.md..."
if [ -f "cards.md" ]; then
    CARDS=$(grep -c "^?" cards.md)
    echo "✓ cards.md exists with ~$CARDS cards"
else
    echo "✗ cards.md NOT found"
fi
echo ""

# Check audio cache
echo "[4/5] Checking precompiled audio..."
if [ -d "audio_cache" ]; then
    FILES=$(find audio_cache -name "*.wav" 2>/dev/null | wc -l | tr -d ' ')
    SIZE=$(du -sh audio_cache 2>/dev/null | cut -f1)
    if [ "$FILES" -gt 0 ]; then
        echo "✓ Audio cache exists: $FILES files ($SIZE)"
    else
        echo "⚠ Audio cache directory exists but empty"
        echo "  Run: python precompile_all_cards.py"
    fi
else
    echo "⚠ No audio cache found (optional)"
    echo "  For instant playback, run: python precompile_all_cards.py"
fi
echo ""

# Check Python environment
echo "[5/5] Checking Python environment..."
if [ -d ".venv-tts" ]; then
    PYTHON_VERSION=$(. .venv-tts/bin/activate && python --version 2>&1 | cut -d' ' -f2)
    echo "✓ Python venv exists: $PYTHON_VERSION"

    # Check if TTS is installed
    if . .venv-tts/bin/activate && python -c "import TTS" 2>/dev/null; then
        echo "✓ Coqui TTS library installed"
    else
        echo "✗ Coqui TTS library NOT installed"
        echo "  Run: source .venv-tts/bin/activate && pip install -r requirements.txt"
    fi
else
    echo "✗ Python venv NOT found"
    echo "  Run: python3.11 -m venv .venv-tts"
fi
echo ""

# Summary
echo "================================"
echo "SUMMARY"
echo "================================"
echo ""

# Determine status
HAS_COQUI=$(curl -s -f http://localhost:5050/api/health > /dev/null 2>&1 && echo "yes" || echo "no")
HAS_MELO=$(curl -s -f http://localhost:5051/api/health > /dev/null 2>&1 && echo "yes" || echo "no")
HAS_CACHE=$([ -d "audio_cache" ] && [ "$(find audio_cache -name "*.wav" 2>/dev/null | wc -l)" -gt 0 ] && echo "yes" || echo "no")

if [ "$HAS_COQUI" = "yes" ] || [ "$HAS_MELO" = "yes" ]; then
    if [ "$HAS_CACHE" = "yes" ]; then
        echo "✅ READY TO USE (Instant playback mode)"
        echo ""
        echo "Next steps:"
        echo "  1. Open index.html in your browser"
        echo "  2. Select your preferred voice"
        echo "  3. Click Play or click on cards"
    else
        echo "✅ READY TO USE (On-demand mode)"
        echo ""
        echo "Next steps:"
        echo "  1. Open index.html in your browser"
        echo "  2. Audio will generate on first play (~2-3s per card)"
        echo ""
        echo "Optional: For instant playback, run:"
        echo "  python precompile_all_cards.py"
    fi
else
    echo "⚠️  SETUP INCOMPLETE"
    echo ""
    echo "To use TTS, start at least one server:"
    echo "  ./start_tts.sh        (Coqui XTTS-v2)"
    echo "  ./start_melo.sh       (MeloTTS)"
    echo ""
    echo "Or use browser TTS (lower quality):"
    echo "  Just open index.html"
fi
echo ""
