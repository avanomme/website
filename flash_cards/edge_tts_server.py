#!/usr/bin/env python3
"""
Edge TTS Server - Completely FREE text-to-speech using Microsoft Edge
No API keys required, high-quality voices, fast and reliable
"""
import os
import io
import hashlib
import asyncio
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import edge_tts

app = Flask(__name__)
CORS(app)

# Create cache directory
CACHE_DIR = Path("edge_tts_cache")
CACHE_DIR.mkdir(exist_ok=True)

# High-quality English voices from Edge TTS
# Format: voice_id: (name, gender, accent, description)
ENGLISH_VOICES = {
    # US English - Natural sounding voices
    "en-US-AriaNeural": ("Aria", "female", "American", "Friendly and warm"),
    "en-US-GuyNeural": ("Guy", "male", "American", "Professional and clear"),
    "en-US-JennyNeural": ("Jenny", "female", "American", "Conversational"),
    "en-US-RyanNeural": ("Ryan", "male", "American", "Energetic"),
    "en-US-MichelleNeural": ("Michelle", "female", "American", "Natural"),
    "en-US-EricNeural": ("Eric", "male", "American", "Casual"),
    "en-US-SteffanNeural": ("Steffan", "male", "American", "Young adult"),
    "en-US-AnaNeural": ("Ana", "female", "American", "Child-like"),

    # UK English - British accents
    "en-GB-SoniaNeural": ("Sonia", "female", "British", "Clear and friendly"),
    "en-GB-RyanNeural": ("Ryan (UK)", "male", "British", "Professional"),
    "en-GB-LibbyNeural": ("Libby", "female", "British", "Youthful"),
    "en-GB-AbbiNeural": ("Abbi", "female", "British", "Warm"),
    "en-GB-AlfieNeural": ("Alfie", "male", "British", "Young"),
    "en-GB-BellaNeural": ("Bella", "female", "British", "Pleasant"),
    "en-GB-ElliotNeural": ("Elliot", "male", "British", "Clear"),
    "en-GB-EthanNeural": ("Ethan", "male", "British", "Friendly"),
    "en-GB-HollyNeural": ("Holly", "female", "British", "Cheerful"),
    "en-GB-MaisieNeural": ("Maisie", "female", "British", "Young"),
    "en-GB-NoahNeural": ("Noah", "male", "British", "Calm"),
    "en-GB-OliverNeural": ("Oliver", "male", "British", "Professional"),
    "en-GB-OliviaNeural": ("Olivia", "female", "British", "Sophisticated"),
    "en-GB-ThomasNeural": ("Thomas", "male", "British", "Articulate"),

    # Australian English
    "en-AU-NatashaNeural": ("Natasha", "female", "Australian", "Friendly"),
    "en-AU-WilliamNeural": ("William", "male", "Australian", "Clear"),
    "en-AU-AnnetteNeural": ("Annette", "female", "Australian", "Warm"),
    "en-AU-CarlyNeural": ("Carly", "female", "Australian", "Upbeat"),
    "en-AU-DarrenNeural": ("Darren", "male", "Australian", "Casual"),
    "en-AU-DuncanNeural": ("Duncan", "male", "Australian", "Professional"),
    "en-AU-ElsieNeural": ("Elsie", "female", "Australian", "Pleasant"),
    "en-AU-FreyaNeural": ("Freya", "female", "Australian", "Young"),
    "en-AU-JoanneNeural": ("Joanne", "female", "Australian", "Mature"),
    "en-AU-KenNeural": ("Ken", "male", "Australian", "Experienced"),
    "en-AU-KimNeural": ("Kim", "female", "Australian", "Friendly"),
    "en-AU-NeilNeural": ("Neil", "male", "Australian", "Clear"),
    "en-AU-TimNeural": ("Tim", "male", "Australian", "Energetic"),
    "en-AU-TinaNeural": ("Tina", "female", "Australian", "Cheerful"),

    # Irish English
    "en-IE-EmilyNeural": ("Emily", "female", "Irish", "Warm"),
    "en-IE-ConnorNeural": ("Connor", "male", "Irish", "Friendly"),

    # Canadian English
    "en-CA-ClaraNeural": ("Clara", "female", "Canadian", "Professional"),
    "en-CA-LiamNeural": ("Liam", "male", "Canadian", "Clear"),

    # Indian English
    "en-IN-NeerjaNeural": ("Neerja", "female", "Indian", "Pleasant"),
    "en-IN-PrabhatNeural": ("Prabhat", "male", "Indian", "Professional"),
}

# Default voice
DEFAULT_VOICE = "en-US-AriaNeural"

def get_cache_key(text, voice):
    """Generate cache key from text and voice"""
    combined = f"{text}|{voice}"
    return hashlib.md5(combined.encode()).hexdigest()

def get_cached_audio(text, voice):
    """Get cached audio if available"""
    cache_key = get_cache_key(text, voice)
    cache_file = CACHE_DIR / f"{cache_key}.mp3"
    if cache_file.exists():
        print(f"✓ Cache hit for: {text[:30]}...")
        return cache_file
    return None

def save_to_cache(text, voice, audio_data):
    """Save generated audio to cache"""
    cache_key = get_cache_key(text, voice)
    cache_file = CACHE_DIR / f"{cache_key}.mp3"
    with open(cache_file, "wb") as f:
        f.write(audio_data)
    print(f"✓ Cached: {text[:30]}...")

async def generate_speech_async(text, voice):
    """Generate speech using Edge TTS (async)"""
    communicate = edge_tts.Communicate(text, voice)

    # Collect all audio chunks
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]

    return audio_data

def generate_speech(text, voice):
    """Generate speech using Edge TTS (sync wrapper)"""
    return asyncio.run(generate_speech_async(text, voice))

@app.route('/api/voices', methods=['GET'])
def get_voices():
    """Return list of available English voices"""
    voices = []
    for voice_id, (name, gender, accent, description) in ENGLISH_VOICES.items():
        voices.append({
            "id": voice_id,
            "name": name,
            "language": "en",
            "gender": gender,
            "accent": accent,
            "description": description
        })
    return jsonify({"voices": voices})

@app.route('/api/speak', methods=['POST'])
def speak():
    """Generate speech from text"""
    try:
        data = request.json
        text = data.get('text', '')
        voice = data.get('speaker', DEFAULT_VOICE)

        # Support both 'speaker' and 'voice' parameters
        if 'voice' in data:
            voice = data['voice']

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Ensure voice is valid
        if voice not in ENGLISH_VOICES:
            # Try to find by name
            voice_found = False
            for voice_id, (name, _, _, _) in ENGLISH_VOICES.items():
                if name.lower() == voice.lower():
                    voice = voice_id
                    voice_found = True
                    break

            if not voice_found:
                voice = DEFAULT_VOICE

        # Check cache first
        cached_file = get_cached_audio(text, voice)
        if cached_file:
            with open(cached_file, "rb") as f:
                audio_data = f.read()
            audio_buffer = io.BytesIO(audio_data)
            audio_buffer.seek(0)
            return send_file(
                audio_buffer,
                mimetype='audio/mpeg',
                as_attachment=False,
                download_name='speech.mp3'
            )

        # Generate audio
        print(f"Generating speech for: {text[:50]}... (voice: {voice})")
        audio_data = generate_speech(text, voice)

        if not audio_data:
            return jsonify({"error": "Failed to generate speech"}), 500

        # Save to cache
        save_to_cache(text, voice, audio_data)

        # Return audio
        audio_buffer = io.BytesIO(audio_data)
        audio_buffer.seek(0)

        return send_file(
            audio_buffer,
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name='speech.mp3'
        )

    except Exception as e:
        print(f"Error generating speech: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "edge-tts",
        "voices": len(ENGLISH_VOICES),
        "cache_size": len(list(CACHE_DIR.glob("*.mp3"))),
        "cache_dir": str(CACHE_DIR.absolute())
    })

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Clear the audio cache"""
    try:
        count = 0
        for cache_file in CACHE_DIR.glob("*.mp3"):
            cache_file.unlink()
            count += 1
        return jsonify({"status": "ok", "cleared": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/cache/stats', methods=['GET'])
def cache_stats():
    """Get cache statistics"""
    files = list(CACHE_DIR.glob("*.mp3"))
    total_size = sum(f.stat().st_size for f in files)

    return jsonify({
        "count": len(files),
        "total_size_mb": round(total_size / 1024 / 1024, 2),
        "cache_dir": str(CACHE_DIR.absolute())
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("  Edge TTS Server - FREE High-Quality Text-to-Speech")
    print("="*60)
    print(f"\n✓ Loaded {len(ENGLISH_VOICES)} English voices")
    print(f"✓ Cache directory: {CACHE_DIR.absolute()}")
    print(f"✓ Default voice: {ENGLISH_VOICES[DEFAULT_VOICE][0]} ({DEFAULT_VOICE})")
    print("\nAvailable accents:")
    accents = set(info[2] for info in ENGLISH_VOICES.values())
    for accent in sorted(accents):
        count = sum(1 for info in ENGLISH_VOICES.values() if info[2] == accent)
        print(f"  • {accent}: {count} voices")
    print("\nStarting server on http://localhost:5052")
    print("="*60 + "\n")

    app.run(host='0.0.0.0', port=5052, debug=False)
