# Stratford Choir - Digital Rehearsal Platform

A fully accessible, production-ready web application for choral rehearsal with AI-powered vocal synthesis. Built for [stratfordchoir.ca](https://stratfordchoir.ca).

## Features

- **Interactive MusicXML Score Display**: View and interact with musical scores using OpenSheetMusicDisplay
- **Playback Controls**: Play/pause, tempo adjustment (50%-150%), and seek functionality
- **Voice Part Selection**: Toggle individual SATB (Soprano, Alto, Tenor, Bass) parts on/off
- **AI Vocal Synthesis**: Generate AI-sung audio with lyrics using Coqui TTS or OpenAI TTS
- **Full Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatic dark mode based on system preferences
- **Offline-Ready**: Frontend can work offline once loaded

## Project Structure

```
stratford/
├── index.html              # Landing page
├── rehearse.html           # Main rehearsal interface
├── js/
│   └── player.js          # Score player with AI voice integration
├── assets/
│   └── style.css          # Complete stylesheet with accessibility features
├── scores/
│   └── final/             # MusicXML score files
│       └── Candlelight Carol.musicxml
├── server/
│   ├── synth.py           # FastAPI backend for AI vocal synthesis
│   ├── requirements.txt   # Python dependencies
│   └── cache/             # Temporary audio cache (auto-created)
├── vercel.json            # Vercel deployment configuration
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Quick Start

### Frontend Setup (Local Development)

1. Clone or download this repository

2. Serve the frontend using any static file server:

   ```bash
   # Option 1: Python
   python3 -m http.server 8080

   # Option 2: Node.js
   npx serve .

   # Option 3: VS Code Live Server extension
   # Right-click index.html and select "Open with Live Server"
   ```

3. Open your browser to `http://localhost:8080`

### Backend Setup (Optional - For AI Voice Synthesis)

The app works without the backend for basic score viewing. To enable AI vocal synthesis:

1. **Install Python 3.9+**

2. **Create a virtual environment:**

   ```bash
   cd server
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Install system dependencies:**

   - **macOS:**
     ```bash
     brew install ffmpeg
     ```

   - **Linux (Ubuntu/Debian):**
     ```bash
     sudo apt-get update
     sudo apt-get install ffmpeg
     ```

   - **Windows:**
     Download from [ffmpeg.org](https://ffmpeg.org/download.html)

5. **Install TTS (Coqui TTS):**

   ```bash
   pip install TTS
   ```

   Note: First run will download the TTS model (~100MB)

6. **Run the backend server:**

   ```bash
   cd server
   python synth.py
   ```

   Server will start at `http://localhost:8000`

7. **Test the backend:**

   ```bash
   curl http://localhost:8000/health
   ```

## Deployment

### Frontend Deployment (Vercel)

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Deploy:**

   ```bash
   vercel
   ```

   Follow the prompts to link your project.

3. **For production deployment:**

   ```bash
   vercel --prod
   ```

4. **Alternative: GitHub Integration**

   - Push your code to GitHub
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Deploy automatically

### Backend Deployment

The backend can be deployed to any platform that supports Python:

#### Option 1: Render.com (Recommended)

1. Create a new Web Service on [render.com](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `cd server && pip install -r requirements.txt`
   - **Start Command:** `cd server && python synth.py`
   - **Environment:** Python 3.9+
4. Add environment variables if needed
5. Deploy

#### Option 2: Railway.app

1. Visit [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Configure root directory to `server/`
4. Deploy automatically

#### Option 3: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Create `Dockerfile` in `server/`:

   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   RUN apt-get update && apt-get install -y ffmpeg
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["python", "synth.py"]
   ```

3. Deploy:
   ```bash
   cd server
   fly launch
   fly deploy
   ```

#### Update Frontend Configuration

After deploying the backend, update the `BACKEND_URL` in `js/player.js`:

```javascript
const BACKEND_URL = 'https://your-backend-url.com';
```

## Accessibility Features

This application is designed to be fully accessible:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: ARIA labels and live regions throughout
- **Focus Indicators**: Clear visual focus states for keyboard navigation
- **Color Contrast**: WCAG AA compliant color ratios
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Responsive Text**: Scales properly with browser zoom
- **Semantic HTML**: Proper heading hierarchy and landmarks

### Testing Accessibility

1. **Keyboard Navigation Test:**
   - Navigate using Tab/Shift+Tab
   - Activate buttons with Enter/Space
   - Verify all interactive elements are reachable

2. **Screen Reader Test:**
   - Use NVDA (Windows), JAWS, or VoiceOver (macOS)
   - Verify all content is announced properly
   - Check that status updates are announced

3. **Automated Testing:**
   ```bash
   # Install axe-core CLI
   npm install -g @axe-core/cli

   # Run accessibility audit
   axe http://localhost:8080 --save results.json
   ```

4. **Browser Extensions:**
   - [axe DevTools](https://www.deque.com/axe/devtools/)
   - [WAVE](https://wave.webaim.org/extension/)
   - [Lighthouse](https://developers.google.com/web/tools/lighthouse) (built into Chrome DevTools)

## API Documentation

### Backend Endpoints

#### `GET /`
Health check endpoint

**Response:**
```json
{
  "status": "online",
  "service": "Stratford Choir AI Synthesis API",
  "tts_available": true
}
```

#### `GET /health`
Detailed health check

**Response:**
```json
{
  "status": "healthy",
  "tts_available": true,
  "scores_dir": "scores/final",
  "scores_dir_exists": true
}
```

#### `GET /synthesize`
Generate AI vocal synthesis

**Parameters:**
- `score` (required): Filename of MusicXML score (e.g., "Candlelight Carol.musicxml")
- `parts` (optional): Comma-separated voice parts (default: "Soprano,Alto,Tenor,Bass")
- `tempo` (optional): Tempo percentage 50-150 (default: 100)

**Example:**
```bash
curl "http://localhost:8000/synthesize?score=Candlelight%20Carol.musicxml&parts=Soprano,Alto&tempo=90" --output audio.mp3
```

**Response:**
- Content-Type: `audio/mpeg`
- Returns MP3 file with synthesized vocals

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Performance

- Frontend bundle size: ~50KB (excluding libraries)
- OpenSheetMusicDisplay CDN: ~500KB
- Backend response time: 5-30 seconds (depends on score complexity and TTS processing)
- Backend memory usage: ~500MB (with TTS model loaded)

## Troubleshooting

### Frontend Issues

**Score doesn't load:**
- Check browser console for errors
- Verify the score file exists in `scores/final/`
- Ensure file path matches exactly (case-sensitive)

**OpenSheetMusicDisplay not loading:**
- Check internet connection (CDN dependency)
- Try refreshing the page
- Check browser console for CSP errors

### Backend Issues

**TTS not available:**
```bash
# Reinstall TTS
pip uninstall TTS
pip install TTS --no-cache-dir
```

**FFmpeg not found:**
```bash
# Verify FFmpeg installation
ffmpeg -version

# If not installed, install it:
# macOS: brew install ffmpeg
# Linux: sudo apt-get install ffmpeg
```

**Out of memory:**
- Reduce the number of parts being synthesized
- Use a smaller TTS model
- Increase server memory allocation

**Slow synthesis:**
- First synthesis is slower (model loading)
- Use a faster TTS model
- Consider GPU acceleration for TTS

## Development

### Adding New Songs

Follow these simple steps to add a new song:

#### Step 1: Prepare Your Files

Create a new folder in the `scores/` directory with your song name (use lowercase with hyphens):

```
scores/
  └── my-new-song/
      ├── my-new-song.musicxml
      ├── my-new-song-Soprano.mid
      ├── my-new-song-Alto.mid
      ├── my-new-song-Tenor.mid
      ├── my-new-song-Bass.mid
      └── my-new-song-Piano.mid (optional)
```

**Important naming rules:**
- Folder name should match the base filename (e.g., `my-new-song`)
- MusicXML file should be `.musicxml` (uncompressed format, not `.mxl`)
- MIDI files should follow the pattern: `[song-name]-[Part].mid`
- Part names: `Soprano`, `Alto`, `Tenor`, `Bass`, `Piano`
- For multiple parts (like Alto 1 and Alto 2), name them: `Alto.mid` and `Alto_2.mid`

#### Step 2: Add the Song Button

Open `rehearse.html` and find the song list section (around line 36-46). Add a new button:

```html
<button onclick="loadScore('my-new-song', 'my-new-song')" aria-label="Load My New Song">
  My New Song
</button>
```

Replace:
- `'my-new-song'` (both instances) with your folder/file name
- `"My New Song"` with the display name shown to users

#### Step 3: Set the Tempo (Optional)

If your MIDI files don't have the correct tempo, you can override it manually.

Open `js/player.js` and find the `SONG_TEMPOS` object (around line 3-7):

```javascript
const SONG_TEMPOS = {
  'our-gift-for-you': 92,
  'candlelight-carol': 60,
  'my-new-song': 120,  // Add your song here with its BPM
};
```

Add your song with the desired BPM (beats per minute).

#### Step 4: Test It!

1. Open `index.html` in your browser
2. Click the **REHEARSE** button
3. Click your new song button
4. Verify that:
   - The score loads correctly
   - All parts are visible (nothing cut off)
   - Playback works for each part
   - The tempo is correct
   - Click-to-seek works

#### Troubleshooting

**"Failed to load score" error:**
- Check that your `.musicxml` file is in the correct folder
- Make sure the filename matches exactly (case-sensitive on Linux/macOS)
- Verify the file is uncompressed MusicXML (not `.mxl` compressed format)

**"No MIDI file found" warnings in console:**
- Check MIDI filenames match the pattern: `[song-name]-[Part].mid`
- Check capitalization: `Soprano`, `Alto`, `Tenor`, `Bass` (capital first letter)
- Open browser console (F12) to see the exact filenames it's trying to load

**Parts not playing:**
- Verify MIDI files are valid and not corrupted
- Check that part names in the MusicXML match the MIDI filenames
- Try opening MIDI files in a MIDI player to verify they work

**Wrong tempo:**
- Add your song to `SONG_TEMPOS` in `js/player.js` with the correct BPM

**Score cut off / parts not visible:**
- Check that your MusicXML has proper page margins
- The app should auto-fit, but you can adjust in `assets/style.css` if needed

#### Example: Complete Addition

Let's add "Silent Night" at 80 BPM:

1. **Create folder and add files:**
   ```
   scores/silent-night/
     ├── silent-night.musicxml
     ├── silent-night-Soprano.mid
     ├── silent-night-Alto.mid
     ├── silent-night-Tenor.mid
     ├── silent-night-Bass.mid
     └── silent-night-Piano.mid
   ```

2. **Add button to `rehearse.html`:**
   ```html
   <button onclick="loadScore('silent-night', 'silent-night')" aria-label="Load Silent Night">
     Silent Night
   </button>
   ```

3. **Set tempo in `js/player.js` (SONG_TEMPOS):**
   ```javascript
   const SONG_TEMPOS = {
     'our-gift-for-you': 92,
     'candlelight-carol': 60,
     'silent-night': 80,
   };
   ```

Done! Your song is now available in the rehearsal app.

### Customizing Styles

Edit `assets/style.css` to customize:
- Colors (CSS variables in `:root`)
- Layout dimensions
- Typography
- Accessibility features

### Extending Functionality

**Add new TTS voices:**
- Modify `server/synth.py` to use different TTS models
- See [Coqui TTS documentation](https://github.com/coqui-ai/TTS)

**Add MIDI playback:**
- Integrate [Tone.js](https://tonejs.github.io/) or [Web MIDI API](https://www.w3.org/TR/webmidi/)

**Add pitch correction:**
- Use audio manipulation libraries like [Rubberband](https://breakfastquay.com/rubberband/)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test accessibility (keyboard, screen reader)
5. Submit a pull request

## License

Copyright 2024 Stratford Choir. All rights reserved.

This software is proprietary. Unauthorized copying, modification, or distribution is prohibited.

## Support

For issues or questions:
- Open an issue on GitHub
- Email: [contact information]
- Visit: stratfordchoir.ca

## Credits

Built with:
- [OpenSheetMusicDisplay](https://opensheetmusicdisplay.github.io/)
- [music21](http://web.mit.edu/music21/)
- [Coqui TTS](https://github.com/coqui-ai/TTS)
- [FastAPI](https://fastapi.tiangolo.com/)
- [pydub](https://github.com/jiaaro/pydub)

---

Made with care for Stratford Choir
