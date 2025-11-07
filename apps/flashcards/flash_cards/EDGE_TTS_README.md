# Edge TTS - FREE Text-to-Speech Integration

## Overview

**Edge TTS** is a completely **FREE** text-to-speech solution that uses Microsoft Edge's online TTS service. No API keys, no registration, no limits!

### Why Edge TTS?

✅ **Completely FREE** - No API keys or accounts required
✅ **40+ High-Quality Voices** - Natural sounding neural voices
✅ **Multiple Accents** - American, British, Australian, Irish, Canadian, Indian
✅ **Fast & Reliable** - Backed by Microsoft's infrastructure
✅ **No Rate Limits** - Use as much as you need
✅ **Automatic Caching** - Instant playback for repeated phrases

### Available Voices

**American English** (8 voices)
- Aria, Guy, Jenny, Ryan, Michelle, Eric, Steffan, Ana

**British English** (14 voices)
- Sonia, Ryan, Libby, Abbi, Alfie, Bella, Elliot, Ethan, Holly, Maisie, Noah, Oliver, Olivia, Thomas

**Australian English** (14 voices)
- Natasha, William, Annette, Carly, Darren, Duncan, Elsie, Freya, Joanne, Ken, Kim, Neil, Tim, Tina

**Irish English** (2 voices)
- Emily, Connor

**Canadian English** (2 voices)
- Clara, Liam

**Indian English** (2 voices)
- Neerja, Prabhat

## Installation

### Quick Start (Recommended)

```bash
cd flash_cards
./start_edge_tts.sh
```

This script will:
1. Create a Python virtual environment (`.venv-edge-tts`)
2. Install all dependencies
3. Start the TTS server on port 5052

### Manual Installation

If you prefer to install manually:

```bash
# Create virtual environment
python3 -m venv .venv-edge-tts

# Activate it
source .venv-edge-tts/bin/activate

# Install dependencies
pip install -r requirements-edge-tts.txt

# Start server
python edge_tts_server.py
```

## Usage

### 1. Start the Server

```bash
cd flash_cards
./start_edge_tts.sh
```

You should see:
```
==================================================
  Edge TTS Server - FREE High-Quality TTS
==================================================

✓ Loaded 40+ English voices
✓ Cache directory: /path/to/edge_tts_cache
✓ Default voice: Aria (en-US-AriaNeural)

Available accents:
  • American: 8 voices
  • Australian: 14 voices
  • British: 14 voices
  • Canadian: 2 voices
  • Indian: 2 voices
  • Irish: 2 voices

Starting server on http://localhost:5052
==================================================
```

### 2. Open the Flashcard App

Simply open `index.html` in your browser. The app will automatically:
- Detect the Edge TTS server
- Load all 40+ voices
- Use Edge TTS by default (since it's free!)

### 3. Select Your Voice

In the flashcard app:
1. Click the voice dropdown
2. Choose from 40+ voices
3. Voices are organized by accent
4. ⭐ indicates preferred accents (British, Irish, Australian)

## API Endpoints

The Edge TTS server provides the following endpoints:

### GET `/api/health`
Check if server is running

**Response:**
```json
{
  "status": "ok",
  "service": "edge-tts",
  "voices": 42,
  "cache_size": 15,
  "cache_dir": "/path/to/edge_tts_cache"
}
```

### GET `/api/voices`
List all available voices

**Response:**
```json
{
  "voices": [
    {
      "id": "en-US-AriaNeural",
      "name": "Aria",
      "language": "en",
      "gender": "female",
      "accent": "American",
      "description": "Friendly and warm"
    },
    ...
  ]
}
```

### POST `/api/speak`
Generate speech from text

**Request:**
```json
{
  "text": "Hello, world!",
  "voice": "en-US-AriaNeural"
}
```

**Response:**
- Audio file (MP3 format)
- Automatically cached for future requests

### POST `/api/cache/clear`
Clear all cached audio files

**Response:**
```json
{
  "status": "ok",
  "cleared": 15
}
```

### GET `/api/cache/stats`
Get cache statistics

**Response:**
```json
{
  "count": 15,
  "total_size_mb": 2.3,
  "cache_dir": "/path/to/edge_tts_cache"
}
```

## Configuration

### Change Port

Edit `edge_tts_server.py` (last line):
```python
app.run(host='0.0.0.0', port=5052, debug=False)
```

Then update `flash_cards/app.js`:
```javascript
edgeTtsServerUrl: 'http://localhost:5052',
```

### Change Default Voice

Edit `edge_tts_server.py`:
```python
DEFAULT_VOICE = "en-GB-SoniaNeural"  # British female
# or
DEFAULT_VOICE = "en-AU-WilliamNeural"  # Australian male
```

### Disable Edge TTS

In `flash_cards/app.js`, set:
```javascript
useEdgeTTS: false,
```

The app will fall back to other TTS options or browser TTS.

## Caching

### How it Works

- All generated audio is automatically cached
- Cache location: `flash_cards/edge_tts_cache/`
- Files are named with MD5 hash of text + voice
- Cached files are served instantly (no generation delay)

### Cache Management

**Clear cache via API:**
```bash
curl -X POST http://localhost:5052/api/cache/clear
```

**Clear cache manually:**
```bash
rm -rf flash_cards/edge_tts_cache/*
```

**View cache stats:**
```bash
curl http://localhost:5052/api/cache/stats
```

## Precompiling Audio

For even faster performance, you can precompile all flashcard audio:

```bash
cd flash_cards
source .venv-edge-tts/bin/activate
python precompile_edge_tts.py
```

This will:
1. Parse all cards from `cards.md`
2. Generate speech for all questions and answers
3. Cache everything for instant playback

## Troubleshooting

### Server Won't Start

**Check Python version:**
```bash
python3 --version  # Should be 3.7+
```

**Reinstall dependencies:**
```bash
source .venv-edge-tts/bin/activate
pip install --upgrade -r requirements-edge-tts.txt
```

### Port Already in Use

Check what's using port 5052:
```bash
lsof -i :5052
```

Kill the process or change the port (see Configuration above).

### Audio Not Playing

1. **Check browser console** for errors
2. **Verify server is running:**
   ```bash
   curl http://localhost:5052/api/health
   ```
3. **Check browser allows audio autoplay** (may need user interaction first)

### Slow First Generation

The first time you generate speech for a phrase:
- **Generation time**: ~1-2 seconds
- **Subsequent plays**: Instant (cached)

This is normal! The cache makes everything fast after the first play.

### Network Issues

Edge TTS requires internet connection since it uses Microsoft's online service. If offline:
- Server will fail to generate speech
- App will fall back to browser TTS

## Performance

### Speed

- **First request**: ~1-2 seconds (generation + caching)
- **Cached requests**: < 100ms (instant playback)
- **Concurrent requests**: Limited by your internet speed

### Memory Usage

- **Server**: ~50-100 MB RAM
- **Cache size**: ~100 KB per minute of audio
- **Example**: 100 flashcards ≈ 5-10 MB cache

### Comparison with Other TTS

| Feature | Edge TTS | Coqui TTS | Browser TTS |
|---------|----------|-----------|-------------|
| Cost | **FREE** | FREE | FREE |
| Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Voices | 40+ | 10 | Varies |
| Setup | Easy | Complex | None |
| Offline | ❌ | ✅ | ✅ |
| API Keys | ❌ | ❌ | ❌ |

## Integration with Flashcard App

The flashcard app automatically integrates Edge TTS:

1. **Auto-detection**: Checks for Edge TTS server on startup
2. **Voice loading**: Loads all 40+ voices into dropdown
3. **Smart fallback**: Falls back to other TTS if unavailable
4. **Caching**: Automatically uses cached audio when available
5. **Accent preference**: Prioritizes British/Irish/Australian voices

## Production Deployment

### Local Network

Run the server on your local network:
```bash
python edge_tts_server.py
# Server runs on http://0.0.0.0:5052
```

Then access from any device on your network:
```
http://YOUR_IP:5052
```

### Docker (Optional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements-edge-tts.txt .
RUN pip install -r requirements-edge-tts.txt
COPY edge_tts_server.py .
EXPOSE 5052
CMD ["python", "edge_tts_server.py"]
```

Build and run:
```bash
docker build -t edge-tts .
docker run -p 5052:5052 edge-tts
```

### Cloud Deployment

Edge TTS can be deployed to:
- **Railway** (free tier)
- **Fly.io** (free tier)
- **Render** (free tier)
- **Heroku** (paid)
- Any VPS with Python support

## License & Credits

- **Edge TTS**: Uses Microsoft Edge's TTS service (free to use)
- **edge-tts Python library**: MIT License
- **This integration**: Part of your flashcard app

## Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Verify server is running: `curl http://localhost:5052/api/health`
3. Check browser console for errors
4. Ensure you have internet connection (Edge TTS is online only)

---

**🎉 Enjoy completely FREE, high-quality text-to-speech!**
