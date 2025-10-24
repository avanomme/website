#!/bin/bash

# Download MusyngKite soundfonts locally for faster loading

SOUNDFONT_DIR="./soundfonts/MusyngKite"

mkdir -p "$SOUNDFONT_DIR"

echo "Downloading MusyngKite soundfonts..."
echo "This will download ~20MB of soundfont data"
echo ""

# The two instruments we use
INSTRUMENTS=(
    "choir_aahs"
    "acoustic_grand_piano"
)

BASE_URL="https://gleitz.github.io/midi-js-soundfonts/MusyngKite"

for instrument in "${INSTRUMENTS[@]}"; do
    echo "Downloading $instrument..."

    # Download the soundfont
    curl -L -o "$SOUNDFONT_DIR/${instrument}-mp3.js" \
        "$BASE_URL/${instrument}-mp3.js"

    if [ $? -eq 0 ]; then
        echo "✓ Downloaded $instrument"
    else
        echo "✗ Failed to download $instrument"
    fi
    echo ""
done

echo "Done! Soundfonts saved to: $SOUNDFONT_DIR"
echo ""
echo "Total size:"
du -sh "$SOUNDFONT_DIR"
