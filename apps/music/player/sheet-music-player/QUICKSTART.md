# 🚀 Quick Start Guide

## Test the Player in 30 Seconds

### 1. Start the Server

```bash
cd /Users/adam/projects/website/sheet-music-player
python3 -m http.server 8000
```

### 2. Open in Browser

Navigate to: **http://localhost:8000**

### 3. Load a Test File

**Option A: Use the included test score**
1. Click "📂 Load File"
2. Navigate to `examples/test-score.musicxml`
3. Select it

**Option B: Use one of your existing files**
1. Click "📂 Load File"
2. Select any:
   - MusicXML file (.musicxml, .xml)
   - Compressed MusicXML (.mxl)
   - MuseScore file (.mscz, .mscx)

### 4. Play Music!

- Click **▶ Play** to start playback
- Adjust **Tempo** slider to change speed
- Watch the cursor follow along the score
- Click the **progress bar** to jump to any position

---

## Testing Your Grinch/Stratford Scores

### Copy a Score for Testing

```bash
# Copy a Grinch score
cp "/Users/adam/projects/website/music_player/scores/013_youre_a_mean_one/013_Youre_a_Mean_One.mei" \
   "/Users/adam/projects/website/sheet-music-player/examples/"

# Or copy a Stratford score
cp "/Users/adam/projects/Stratford copy/scores/most-wonderful/most-wonderful.mei" \
   "/Users/adam/projects/website/sheet-music-player/examples/"
```

Then load it in the player!

---

## Comparing with Old Player

### Old Verovio Player Issues:
- ❌ Tempo changes broke at different speeds
- ❌ Required MEI conversion
- ❌ Needed separate JSON timemaps
- ❌ Complex timing bugs

### New Custom Player:
- ✅ Tempo changes work perfectly at all speeds
- ✅ Loads MusicXML and MuseScore directly
- ✅ All timing computed from score
- ✅ Clean, simple architecture

---

## Next Steps

1. **Test with your actual scores** - Try loading different files
2. **Adjust the synth** - Edit `player.js` to use SoundFont
3. **Add features** - The code is modular and well-commented
4. **Deploy** - Works on any static host (Vercel, Netlify, GitHub Pages)

---

## Troubleshooting

### "No audio plays"
- Click anywhere on the page first (browser security)
- Check volume slider is not at 0%
- Check browser console for errors

### "Score doesn't load"
- Verify file is valid MusicXML/MuseScore
- Try the test file first (`examples/test-score.musicxml`)
- Check browser console for detailed error

### "Need help?"
- Check the full README.md
- Look at browser console logs
- The code has detailed comments

---

## Performance Tips

- **Endless page mode** - Best for continuous scrolling
- **Follow cursor** - Keeps current position visible
- **Tempo 50-150%** - Recommended range for practice
- **Seek anytime** - Click progress bar to jump

Enjoy your new music player! 🎵
