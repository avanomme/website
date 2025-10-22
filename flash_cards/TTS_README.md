# Coqui TTS Integration with XTTS-v2

This flash cards app now includes high-quality text-to-speech using Coqui TTS with the XTTS-v2 model.

## Features

- **High-quality voices**: Much better than browser TTS
- **33 English voices**: Only English speakers included
- **Automatic fallback**: Falls back to browser TTS if server isn't running
- **Easy to use**: Just start the server and refresh the page

## Setup

**Important:** Coqui TTS requires Python 3.9 - 3.11 (does not support Python 3.13+)

### 1. Start the TTS Server

```bash
./start_tts.sh
```

The script will automatically:
- Create a Python 3.11 virtual environment (`.venv-tts`)
- Install all dependencies
- Start the TTS server on http://localhost:5050

The first time you run it:
- Dependencies will be installed (~1GB)
- XTTS-v2 model will be downloaded (~2GB)
- This may take 5-10 minutes

### Manual Installation (Optional)

If you prefer to install manually:

```bash
# Create Python 3.11 venv
python3.11 -m venv .venv-tts

# Activate it
source .venv-tts/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python tts_server.py
```

### 3. Open the Flash Cards App

Just open `index.html` in your browser. The app will automatically detect the TTS server and use it.

If the TTS server isn't running, the app will fall back to browser TTS (with English voices only).

## Available Voices

The XTTS-v2 model includes 10 verified high-quality English voices:

**Female voices:**
- Ana Florence
- Brenda Stern
- Claribel Dervla
- Daisy Studious
- Gitta Nikolina
- Gracie Wise
- Sofia Hellen

**Male voices:**
- Andrew Chipper
- Craig Gutsy
- Viktor Eka

## Response Caching

The server automatically caches all generated audio to speed up repeated phrases:
- Cache location: `/tmp/tts_cache/`
- First generation: ~2-3 seconds
- Cached responses: Instant

### Prebuild Common Phrases

Speed up your first session by prebuilding the cache:

```bash
source .venv-tts/bin/activate
python prebuild_cache.py
```

This will cache common flash card phrases so they play instantly.

## Configuration

### Change TTS Server Port

Edit `tts_server.py` line 110:
```python
app.run(host='0.0.0.0', port=5050, debug=False)
```

And update `app.js` state:
```javascript
ttsServerUrl: 'http://localhost:5050',
```

### Disable Coqui TTS

In `app.js`, set:
```javascript
useCoquiTTS: false,
```

This will use browser TTS instead (with English voices only).

## Troubleshooting

### TTS Server Won't Start

1. Check Python version: `python3 --version` (need 3.8+)
2. Reinstall dependencies: `pip3 install --upgrade -r requirements.txt`
3. Check if port 5050 is in use: `lsof -i :5050`

### Audio Not Playing

1. Check browser console for errors
2. Verify TTS server is running: `curl http://localhost:5050/api/health`
3. Check browser allows audio autoplay (may need user interaction first)

### Model Download Issues

The first run downloads ~2GB. If it fails:
1. Check internet connection
2. Try manual download: `python3 -c "from TTS.api import TTS; TTS('tts_models/multilingual/multi-dataset/xtts_v2')"`

## Performance

- First request: ~3-5 seconds (model loading)
- Subsequent requests: ~1-2 seconds per sentence
- Memory usage: ~2-3GB RAM
- GPU support: Set `gpu=True` in `tts_server.py` for faster generation

## API Endpoints

- `GET /api/health` - Check if server is running
- `GET /api/voices` - List available voices
- `POST /api/speak` - Generate speech from text
  - Body: `{"text": "Hello world", "speaker": "Claribel Dervla"}`
  - Returns: WAV audio file
