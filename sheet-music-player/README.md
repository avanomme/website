# 🎵 Sheet Music Player

A custom-built sheet music player with MIDI playback and score display. Built from scratch for complete control over timing, synchronization, and tempo handling.

## Features

✅ **Direct File Support**
- Load MusicXML (.musicxml, .xml)
- Load compressed MusicXML (.mxl)
- Load MuseScore files (.mscz, .mscx)

✅ **Score Display**
- Beautiful rendering with OpenSheetMusicDisplay
- Automatic page layout
- Real-time cursor following
- Zoom and pan support

✅ **MIDI Playback**
- Accurate timing with Tone.js
- Variable tempo control (25% - 200%)
- Volume control
- Play, pause, stop controls
- Seek to any position

✅ **Perfect Synchronization**
- Score highlighting matches audio perfectly
- Handles tempo changes correctly
- No drift or timing issues

## Getting Started

### Prerequisites

- Python 3 (for local server)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. **Navigate to the directory:**
```bash
cd /Users/adam/projects/website/sheet-music-player
```

2. **Start the local server:**
```bash
npm run dev
# or
python3 -m http.server 8000
```

3. **Open in browser:**
```
http://localhost:8000
```

4. **Load a file:**
   - Click "📂 Load File"
   - Select a MusicXML or MuseScore file
   - The score will render and playback controls will activate

## Usage

### Controls

- **📂 Load File** - Load MusicXML, .mxl, or MuseScore files
- **▶ Play** - Start playback from current position
- **⏸ Pause** - Pause playback (resume with Play)
- **⏹ Stop** - Stop and reset to beginning
- **Tempo Slider** - Adjust playback speed (25% - 200%)
- **Volume Slider** - Adjust playback volume (0% - 100%)
- **Progress Bar** - Click to seek to any position

### Keyboard Shortcuts (Coming Soon)

- `Space` - Play/Pause
- `Home` - Go to beginning
- `←/→` - Seek backward/forward
- `↑/↓` - Adjust tempo

## Architecture

### Technology Stack

- **OpenSheetMusicDisplay** - Score rendering
- **Tone.js** - MIDI playback and synthesis
- **JSZip** - Compressed file handling
- **Vanilla JavaScript** - No framework dependencies

### How It Works

1. **File Loading**
   - MusicXML/MuseScore files are parsed
   - Compressed files (.mxl, .mscz) are unzipped
   - XML content extracted

2. **Score Rendering**
   - OpenSheetMusicDisplay renders SVG notation
   - Layout computed automatically
   - Cursor positioned at start

3. **MIDI Extraction**
   - Note data extracted from musical structure
   - Timing calculated based on tempo
   - MIDI note numbers computed from pitch

4. **Playback**
   - Notes scheduled in Tone.js transport
   - Tempo scaling applied to all events
   - Real-time BPM updates for tempo changes

5. **Synchronization**
   - Cursor updated via requestAnimationFrame
   - Position calculated from Transport time
   - Tempo changes accounted for in all calculations

## Advantages Over Verovio Player

### ✅ **Better Tempo Handling**
- Tempos always in quarter notes (no confusion)
- Tempo changes work at all playback speeds
- No manual MEI file fixing needed

### ✅ **Native File Support**
- Load MuseScore files directly
- No conversion to MEI required
- Preserves all musical information

### ✅ **Complete Control**
- Custom playback engine
- Adjustable timing algorithms
- Easy to add new features

### ✅ **Simpler Architecture**
- No timemap generation scripts
- No separate JSON files
- Everything computed from the score

## Development

### Project Structure

```
sheet-music-player/
├── index.html          # Main HTML page
├── player.js           # Player class and logic
├── package.json        # Dependencies
├── README.md           # This file
└── examples/           # Example scores
```

### Adding Features

The `SheetMusicPlayer` class is modular and easy to extend:

```javascript
// Add a new feature
player.myNewFeature = function() {
    // Your code here
};
```

### Debugging

Open browser console to see detailed logs:
- File loading progress
- MIDI extraction results
- Playback events
- Timing information

## Known Limitations

1. **Synthesizer** - Currently uses simple synth (could add SoundFont)
2. **Cursor Accuracy** - OSMD cursor API may need refinement
3. **Tempo Extraction** - Basic implementation (can be enhanced)
4. **Multi-track** - Single synth for all parts (could separate)

## Future Enhancements

- [ ] SoundFont support for realistic instruments
- [ ] Per-track muting/soloing
- [ ] Transpose functionality
- [ ] Loop sections
- [ ] Metronome click
- [ ] Export to MIDI file
- [ ] Practice mode with slow-down on difficult sections
- [ ] Recording playback

## Troubleshooting

### No audio plays
- Check browser console for errors
- Ensure browser allows audio (click anywhere first)
- Check volume slider is not at 0%

### Score doesn't render
- Verify file is valid MusicXML or MuseScore
- Check browser console for parsing errors
- Try a different file

### Timing is off
- Check if file has unusual tempo markings
- Verify tempo slider is at 100%
- Look for console logs about tempo changes

## License

MIT License - Feel free to use and modify

## Credits

- OpenSheetMusicDisplay - Score rendering
- Tone.js - Audio synthesis
- JSZip - File compression

Built with ❤️ for better music education and practice
