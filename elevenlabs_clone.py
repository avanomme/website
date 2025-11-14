#!/usr/bin/env python3
"""
Voice cloning with ElevenLabs API
Much better quality than local models
"""
import os
import sys
from pathlib import Path

# Get API key from environment
API_KEY = os.environ.get('ELEVENLABS_API_KEY', '')

SAMPLE_FILES = [
    "/Users/adam/projects/website/cox7.wav",
    "/Users/adam/projects/website/cox8.wav"
]

OUTPUT_DIR = Path("/Users/adam/projects/website/cloned_voice_samples_elevenlabs")
OUTPUT_DIR.mkdir(exist_ok=True)

TEST_TEXT = "Hello Adam, thank you for creating the fantastic voice. Let me know if I can ever do anything for you."

def prepare_sample(input_file, output_file, duration=60):
    """Prepare a 60-second sample for ElevenLabs (they need longer samples)"""
    import subprocess
    import json

    # Get duration
    probe_cmd = [
        'ffprobe', '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        input_file
    ]

    result = subprocess.run(probe_cmd, capture_output=True, text=True)
    try:
        data = json.loads(result.stdout)
        total_duration = float(data['format']['duration'])
        # Extract from middle - ElevenLabs wants 1-2 minutes
        start = max(10, (total_duration / 2) - 30)
    except:
        start = 10

    cmd = [
        'ffmpeg', '-y',
        '-i', input_file,
        '-ss', str(start),
        '-t', str(duration),
        '-ar', '44100',  # ElevenLabs prefers 44.1kHz
        '-ac', '1',      # Mono
        '-acodec', 'libmp3lame',  # MP3 format
        '-b:a', '192k',  # Good quality
        output_file
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✓ Prepared: {output_file}")
        return True
    else:
        print(f"✗ Failed to prepare: {output_file}")
        print(result.stderr)
        return False

def clone_with_elevenlabs():
    """Clone voice using ElevenLabs API"""

    if not API_KEY:
        print("\n" + "="*60)
        print("ElevenLabs API Setup Required")
        print("="*60)
        print("""
To use ElevenLabs voice cloning:

1. Sign up at https://elevenlabs.io (free tier available)
2. Go to Profile Settings → API Key
3. Copy your API key
4. Set environment variable:
   export ELEVENLABS_API_KEY='your-api-key-here'
5. Run this script again

ElevenLabs offers:
- Best-in-class voice cloning quality
- Fast generation (2-3 seconds)
- Free tier: 10,000 characters/month
- Voice cloning with 1-2 minutes of audio

Alternative: Use their web interface at elevenlabs.io/voice-lab
to clone the voice manually.
""")

        # Still prepare samples for manual upload
        print("\nPreparing voice samples for manual upload...")
        for i, sample_file in enumerate(SAMPLE_FILES, 1):
            output_file = OUTPUT_DIR / f"elevenlabs_sample_{i}.mp3"
            prepare_sample(sample_file, str(output_file), duration=60)

        print(f"\nSamples saved to: {OUTPUT_DIR}")
        print("Upload these files to ElevenLabs Voice Lab for cloning.")
        return False

    try:
        # Try using elevenlabs package
        try:
            from elevenlabs import clone, generate, play, set_api_key, Voice
            set_api_key(API_KEY)
        except ImportError:
            print("Installing elevenlabs package...")
            import subprocess
            subprocess.run([sys.executable, '-m', 'pip', 'install', 'elevenlabs'],
                         check=True, capture_output=True)
            from elevenlabs import clone, generate, play, set_api_key, Voice
            set_api_key(API_KEY)

        print("\n" + "="*60)
        print("ElevenLabs Voice Cloning")
        print("="*60)

        # Prepare samples
        print("\nPreparing voice samples...")
        sample_paths = []
        for i, sample_file in enumerate(SAMPLE_FILES, 1):
            output_file = OUTPUT_DIR / f"elevenlabs_sample_{i}.mp3"
            if prepare_sample(sample_file, str(output_file), duration=60):
                sample_paths.append(str(output_file))

        if not sample_paths:
            print("✗ Failed to prepare samples")
            return False

        print(f"\n✓ Prepared {len(sample_paths)} samples")
        print("\nCreating voice clone...")

        # Clone the voice
        voice = clone(
            name="Adam's Voice Clone",
            description="Cloned voice from audio samples",
            files=sample_paths
        )

        print(f"✓ Voice cloned successfully! Voice ID: {voice.voice_id}")

        # Generate test speech
        print(f"\nGenerating test audio...")
        print(f"Text: '{TEST_TEXT}'")

        audio = generate(
            text=TEST_TEXT,
            voice=voice,
            model="eleven_multilingual_v2"
        )

        # Save the audio
        output_file = OUTPUT_DIR / "elevenlabs_result.mp3"
        with open(output_file, 'wb') as f:
            f.write(audio)

        print(f"✓ Generated: {output_file}")
        print("\n" + "="*60)
        print("Success! Listen to the result in:")
        print(f"  {OUTPUT_DIR}")
        print("="*60)

        return True

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("Advanced Voice Cloning with ElevenLabs")
    print("Best quality voice cloning available\n")

    clone_with_elevenlabs()

if __name__ == '__main__':
    main()
