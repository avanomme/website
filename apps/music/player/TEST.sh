#!/bin/bash
# Test script for MuseScore-integrated Sheet Music Player

echo "🎵 MuseScore Sheet Music Player - Test Script"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "player.js" ]; then
    echo "❌ Error: Not in sheet-music-player directory"
    echo "   Please run: cd /Users/adam/projects/website/sheet-music-player"
    exit 1
fi

echo "✅ Found player.js"

# Check for required files
FILES=("index.html" "player.js" "README.md" "QUICKSTART.md" "INTEGRATION.md" "IMPLEMENTATION_SUMMARY.md")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found $file"
    else
        echo "❌ Missing $file"
    fi
done

echo ""
echo "📁 Checking for example files..."
if [ -d "examples" ]; then
    echo "✅ Found examples directory"
    ls -lh examples/
else
    echo "⚠️  No examples directory"
fi

echo ""
echo "🔗 Checking for MuseScore player library..."
MUSESCORE_PLAYER="../music_player/musescore-player/web/js/musescore-player-complete.js"
if [ -f "$MUSESCORE_PLAYER" ]; then
    echo "✅ Found MuseScore player library"
else
    echo "⚠️  MuseScore player not found at: $MUSESCORE_PLAYER"
    echo "   Player will use Tone.js fallback"
fi

echo ""
echo "🔗 Checking for MuseScore source..."
if [ -d "../MuseScore" ]; then
    echo "✅ Found MuseScore source directory"
    DEMO_COUNT=$(ls -1 ../MuseScore/demos/*.mscz 2>/dev/null | wc -l | tr -d ' ')
    if [ "$DEMO_COUNT" -gt 0 ]; then
        echo "   Found $DEMO_COUNT demo files"
    fi
else
    echo "⚠️  MuseScore source not found"
fi

echo ""
echo "🚀 Ready to test!"
echo ""
echo "To start the player:"
echo "  1. Run: python3 -m http.server 8000"
echo "  2. Open: http://localhost:8000"
echo "  3. Load a file and test playback"
echo ""
echo "Test files available:"
echo "  • examples/test-score.musicxml (if exists)"
echo "  • ../music_player/scores/*/*.mei"
echo "  • ../MuseScore/demos/*.mscz"
echo ""
echo "What to test:"
echo "  ✓ File loading (.mscz, .mscx, .musicxml, .mxl)"
echo "  ✓ Score rendering (clear, readable)"
echo "  ✓ Playback (audio starts, no glitches)"
echo "  ✓ Cursor following (tracks playback position)"
echo "  ✓ Tempo changes (work at 50%, 100%, 150%)"
echo "  ✓ Seek (click progress bar)"
echo "  ✓ Volume control"
echo "  ✓ Stop/Pause/Play cycle"
echo ""
echo "Check browser console for:"
echo "  • '✓ MuseScore player library loaded' or fallback message"
echo "  • '✓ OpenSheetMusicDisplay initialized'"
echo "  • '✓ Generated MIDI file data: N events'"
echo "  • No red errors"
echo ""
echo "Happy testing! 🎵"
