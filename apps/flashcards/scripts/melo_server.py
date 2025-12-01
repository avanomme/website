#!/usr/bin/env python3
"""
MeloTTS server for Flash Cards app
Provides additional high-quality voices with British/Irish/Australian accents
"""
import os
import io
import json
import hashlib
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# MeloTTS imports
try:
    from melo.api import TTS
except ImportError:
    print("Error: MeloTTS not installed")
    print("Please install with: pip install git+https://github.com/myshell-ai/MeloTTS.git")
    exit(1)

app = Flask(__name__)
CORS(app)

# Create cache directory
CACHE_DIR = Path("/tmp/melo_cache")
CACHE_DIR.mkdir(exist_ok=True)

# Initialize MeloTTS
print("Loading MeloTTS models...")
try:
    # MeloTTS supports multiple languages with different accents
    tts_models = {}

    # English with different accents
    english_accents = ['EN-US', 'EN-BR', 'EN-AU', 'EN-Default']
    for accent in english_accents:
        try:
            tts_models[accent] = TTS(language='EN', device='cpu')
            print(f"✓ Loaded English model: {accent}")
        except Exception as e:
            print(f"✗ Failed to load {accent}: {e}")

    if not tts_models:
        raise Exception("No models loaded")

except Exception as e:
    print(f"✗ Error loading MeloTTS: {e}")
    tts_models = None

# MeloTTS voices with accent information
# Format: voice_id: (display_name, accent, gender)
MELO_VOICES = {
    'EN-US': [
        ('EN-US-Default', 'American', 'neutral'),
    ],
    'EN-BR': [
        ('EN-BR-Default', 'British', 'neutral'),
    ],
    'EN-AU': [
        ('EN-AU-Default', 'Australian', 'neutral'),
    ],
    'EN-Default': [
        ('EN-Default', 'English', 'neutral'),
    ],
}

def get_cache_key(text, voice_name):
    """Generate cache key from text and voice"""
    combined = f"{text}|{voice_name}"
    return hashlib.md5(combined.encode()).hexdigest()

def get_cached_audio(text, voice_name):
    """Get cached audio if available"""
    cache_key = get_cache_key(text, voice_name)
    cache_file = CACHE_DIR / f"{cache_key}.wav"
    if cache_file.exists():
        print(f"✓ Cache hit for: {text[:30]}...")
        return cache_file
    return None

def save_to_cache(text, voice_name, audio_path):
    """Save generated audio to cache"""
    cache_key = get_cache_key(text, voice_name)
    cache_file = CACHE_DIR / f"{cache_key}.wav"
    import shutil
    shutil.copy(audio_path, cache_file)
    print(f"✓ Cached: {text[:30]}...")

@app.route('/api/voices', methods=['GET'])
def get_voices():
    """Return list of available MeloTTS voices"""
    if not tts_models:
        return jsonify({"error": "TTS not initialized"}), 500

    voices = []
    for accent, voice_list in MELO_VOICES.items():
        if accent in tts_models:
            for voice_id, accent_name, gender in voice_list:
                voices.append({
                    "name": voice_id,
                    "accent": accent_name,
                    "gender": gender,
                    "language": "en"
                })

    return jsonify({"voices": voices})

@app.route('/api/speak', methods=['POST'])
def speak():
    """Generate speech from text"""
    if not tts_models:
        return jsonify({"error": "TTS not initialized"}), 500

    try:
        data = request.json
        text = data.get('text', '')
        speaker = data.get('speaker', 'EN-BR-Default')

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Find which accent model to use
        accent_code = speaker.split('-Default')[0] if 'Default' in speaker else 'EN-BR'
        if accent_code not in tts_models:
            accent_code = 'EN-BR'  # Default to British

        # Check cache first
        cached_file = get_cached_audio(text, speaker)
        if cached_file:
            with open(cached_file, "rb") as f:
                audio_data = f.read()
            audio_buffer = io.BytesIO(audio_data)
            audio_buffer.seek(0)
            return send_file(
                audio_buffer,
                mimetype='audio/wav',
                as_attachment=False,
                download_name='speech.wav'
            )

        # Generate audio
        print(f"Generating speech for: {text[:50]}... (voice: {speaker})")

        output_path = f"/tmp/melo_output_{os.getpid()}.wav"

        # Get speaker ID for MeloTTS (usually 0 for default)
        speaker_ids = tts_models[accent_code].hps.data.spk2id
        speaker_id = list(speaker_ids.keys())[0] if speaker_ids else 0

        # Generate speech
        tts_models[accent_code].tts_to_file(
            text=text,
            speaker_id=speaker_id,
            output_path=output_path,
            speed=1.0
        )

        # Save to cache
        save_to_cache(text, speaker, output_path)

        # Read the file and send it
        with open(output_path, "rb") as f:
            audio_data = f.read()

        # Clean up temp file
        if os.path.exists(output_path):
            os.remove(output_path)

        audio_buffer = io.BytesIO(audio_data)
        audio_buffer.seek(0)

        return send_file(
            audio_buffer,
            mimetype='audio/wav',
            as_attachment=False,
            download_name='speech.wav'
        )

    except Exception as e:
        print(f"Error generating speech: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    if not tts_models:
        return jsonify({"status": "error", "message": "TTS not initialized"}), 500

    return jsonify({
        "status": "ok",
        "model": "melo_tts",
        "accents": list(tts_models.keys()),
        "voices": sum(len(v) for v in MELO_VOICES.values() if v[0][0].split('-')[0] + '-' + v[0][0].split('-')[1] in tts_models),
        "cache_size": len(list(CACHE_DIR.glob("*.wav")))
    })

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Clear the audio cache"""
    try:
        count = 0
        for cache_file in CACHE_DIR.glob("*.wav"):
            cache_file.unlink()
            count += 1
        return jsonify({"status": "ok", "cleared": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    if tts_models:
        print(f"\n✓ MeloTTS Server ready")
        print(f"Loaded accents: {', '.join(tts_models.keys())}")
        print(f"Cache directory: {CACHE_DIR}")
        print("\nStarting server on http://localhost:5051")
        app.run(host='0.0.0.0', port=5051, debug=False)
    else:
        print("\n✗ Failed to initialize MeloTTS")
        exit(1)
