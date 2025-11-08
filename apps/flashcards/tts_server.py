#!/usr/bin/env python3
"""
Coqui TTS server for Flash Cards app using XTTS-v2
"""
import os
import io
import json
import hashlib
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from TTS.api import TTS

app = Flask(__name__)
CORS(app)

# Create cache directory
CACHE_DIR = Path("/tmp/tts_cache")
CACHE_DIR.mkdir(exist_ok=True)

# Initialize TTS with XTTS-v2
print("Loading XTTS-v2 model... This may take a moment.")
try:
    tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)
    print("✓ XTTS-v2 model loaded successfully")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    tts = None

# XTTS-v2 reference speakers from the model
# Format: name: (gender, accent)
# Accents marked based on voice characteristics and names
ENGLISH_VOICES = {
    "Ana Florence": ("female", "American"),
    "Andrew Chipper": ("male", "British"),  # ⭐ British accent
    "Brenda Stern": ("female", "American"),
    "Claribel Dervla": ("female", "Irish"),  # ⭐ Irish accent (Dervla is Irish name)
    "Craig Gutsy": ("male", "Australian"),  # ⭐ Australian accent
    "Daisy Studious": ("female", "British"),  # ⭐ British accent
    "Gitta Nikolina": ("female", "American"),
    "Gracie Wise": ("female", "British"),  # ⭐ British accent
    "Sofia Hellen": ("female", "American"),
    "Viktor Eka": ("male", "American"),
}

def get_cache_key(text, speaker):
    """Generate cache key from text and speaker"""
    combined = f"{text}|{speaker}"
    return hashlib.md5(combined.encode()).hexdigest()

def get_cached_audio(text, speaker):
    """Get cached audio if available"""
    cache_key = get_cache_key(text, speaker)
    cache_file = CACHE_DIR / f"{cache_key}.wav"
    if cache_file.exists():
        print(f"✓ Cache hit for: {text[:30]}...")
        return cache_file
    return None

def save_to_cache(text, speaker, audio_path):
    """Save generated audio to cache"""
    cache_key = get_cache_key(text, speaker)
    cache_file = CACHE_DIR / f"{cache_key}.wav"
    import shutil
    shutil.copy(audio_path, cache_file)
    print(f"✓ Cached: {text[:30]}...")

@app.route('/api/voices', methods=['GET'])
def get_voices():
    """Return list of available English voices"""
    if not tts:
        return jsonify({"error": "TTS not initialized"}), 500

    voices = [
        {"name": name, "language": "en", "gender": gender, "accent": accent}
        for name, (gender, accent) in ENGLISH_VOICES.items()
    ]
    return jsonify({"voices": voices})

@app.route('/api/speak', methods=['POST'])
def speak():
    """Generate speech from text"""
    if not tts:
        return jsonify({"error": "TTS not initialized"}), 500

    try:
        data = request.json
        text = data.get('text', '')
        speaker = data.get('speaker', 'Claribel Dervla')

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Ensure speaker is in our list
        if speaker not in ENGLISH_VOICES:
            speaker = 'Claribel Dervla'

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
        print(f"Generating speech for: {text[:50]}... (speaker: {speaker})")

        output_path = f"/tmp/tts_output_{os.getpid()}.wav"

        # For XTTS-v2, we need to get the speaker wav file from the model
        try:
            # Try using speaker_wav parameter with XTTS-v2
            speaker_wav = tts.synthesizer.tts_config.get("speaker_wav", None)

            # Generate speech
            tts.tts_to_file(
                text=text,
                speaker=speaker,
                language="en",
                file_path=output_path
            )
        except Exception as e:
            print(f"Error with speaker parameter: {e}")
            # Fallback: try without speaker parameter
            tts.tts_to_file(
                text=text,
                language="en",
                file_path=output_path
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
    if not tts:
        return jsonify({"status": "error", "message": "TTS not initialized"}), 500
    return jsonify({
        "status": "ok",
        "model": "xtts_v2",
        "voices": len(ENGLISH_VOICES),
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
    if tts:
        print(f"\n✓ Coqui TTS Server ready with {len(ENGLISH_VOICES)} English voices")
        print(f"Available voices: {', '.join(list(ENGLISH_VOICES.keys())[:5])}...")
        print(f"Cache directory: {CACHE_DIR}")
        print("\nStarting server on http://localhost:5050")
        app.run(host='0.0.0.0', port=5050, debug=False)
    else:
        print("\n✗ Failed to initialize TTS model")
        exit(1)
