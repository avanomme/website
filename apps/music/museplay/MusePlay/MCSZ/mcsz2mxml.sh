#!/bin/bash
# Convert all .mscz files in the current directory to .musicxml

# Change this if your MuseScore binary is named differently
MSCORE_BIN="/Applications/MuseScore 4.app/Contents/MacOS/mscore"

if [ ! -x "$MSCORE_BIN" ]; then
    echo "Error: MuseScore binary not found at $MSCORE_BIN"
    echo "Edit the script to set the correct path (use 'which mscore4' to find it)."
    exit 1
fi

for file in *.mscz; do
    [ -e "$file" ] || continue  # skip if no .mscz files
    base="${file%.mscz}"
    echo "Converting: $file → $base.musicxml"
    "$MSCORE_BIN" -o "$base.musicxml" "$file"
done

echo "✅ Conversion complete."
