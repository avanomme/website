#!/usr/bin/env python3
"""
Advanced Voice Cloning using multiple approaches:
1. Try OpenVoice (better quality)
2. Try Bark with voice cloning
3. Try Tortoise TTS (highest quality but slower)
"""
import os
import sys
from pathlib import Path

# Audio files
SAMPLE_FILES = [
    "/Users/adam/projects/website/cox7.wav",
    "/Users/adam/projects/website/cox8.wav"
]

OUTPUT_DIR = Path("/Users/adam/projects/website/cloned_voice_samples_advanced")
OUTPUT_DIR.mkdir(exist_ok=True)

TEST_TEXT = "Hello Adam, thank you for creating the fantastic voice. Let me know if I can ever do anything for you."

def extract_best_sample(input_file, output_file, duration=10):
    """Extract a clean 10s sample from the middle of the audio"""
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
        # Extract from middle
        start = max(5, (total_duration / 2) - 5)
    except:
        start = 10

    cmd = [
        'ffmpeg', '-y',
        '-i', input_file,
        '-ss', str(start),
        '-t', str(duration),
        '-ar', '24000',  # Higher quality
        '-ac', '1',
        '-acodec', 'pcm_s16le',
        output_file
    ]

    subprocess.run(cmd, capture_output=True)
    return output_file

def try_tortoise_tts():
    """Try Tortoise TTS - highest quality voice cloning"""
    print("\n" + "="*60)
    print("Method 1: Tortoise TTS (Highest Quality)")
    print("="*60)

    try:
        from tortoise.api import TextToSpeech
        from tortoise.utils.audio import load_audio

        print("Loading Tortoise TTS model...")
        tts = TextToSpeech()

        # Prepare reference samples
        print("Preparing voice samples...")
        reference_clips = []
        for sample_file in SAMPLE_FILES:
            sample_path = OUTPUT_DIR / f"ref_{Path(sample_file).stem}.wav"
            extract_best_sample(sample_file, str(sample_path), duration=10)
            reference_clips.append(load_audio(str(sample_path), 22050))
            print(f"  ✓ Loaded {Path(sample_file).name}")

        print(f"\nGenerating speech: '{TEST_TEXT}'")
        print("This will take several minutes...")

        # Generate with voice cloning
        gen = tts.tts_with_preset(
            TEST_TEXT,
            voice_samples=reference_clips,
            preset='high_quality',  # or 'ultra_fast' for testing
        )

        output_file = OUTPUT_DIR / "tortoise_result.wav"
        import torchaudio
        torchaudio.save(str(output_file), gen.squeeze(0).cpu(), 24000)

        print(f"✓ Generated: {output_file}")
        return True

    except ImportError:
        print("✗ Tortoise TTS not installed")
        print("Install with: pip install tortoise-tts")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def try_bark_voice_clone():
    """Try Bark with voice cloning"""
    print("\n" + "="*60)
    print("Method 2: Bark with Voice Cloning")
    print("="*60)

    try:
        from bark import SAMPLE_RATE, generate_audio, preload_models
        from bark.generation import ALLOWED_PROMPTS
        from bark.api import semantic_to_waveform
        import numpy as np

        print("Loading Bark models...")
        preload_models()

        print("Note: Bark's voice cloning is experimental")
        print("Generating with closest voice preset...")

        # Try different voice presets
        voices = ['v2/en_speaker_6', 'v2/en_speaker_9', 'v2/en_speaker_3']

        for voice in voices:
            print(f"\nTrying voice preset: {voice}")
            audio_array = generate_audio(TEST_TEXT, history_prompt=voice)

            output_file = OUTPUT_DIR / f"bark_{voice.replace('/', '_')}.wav"

            from scipy.io.wavfile import write as write_wav
            write_wav(str(output_file), SAMPLE_RATE, audio_array)
            print(f"  ✓ Generated: {output_file}")

        return True

    except ImportError:
        print("✗ Bark not installed")
        print("Install with: pip install git+https://github.com/suno-ai/bark.git")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def try_openvoice():
    """Try OpenVoice - better quality than XTTS"""
    print("\n" + "="*60)
    print("Method 3: OpenVoice (Better Quality)")
    print("="*60)

    try:
        # OpenVoice is more complex to set up
        print("✗ OpenVoice requires manual setup")
        print("See: https://github.com/myshell-ai/OpenVoice")
        return False

    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def try_so_vits_svc():
    """Try So-VITS-SVC for voice conversion"""
    print("\n" + "="*60)
    print("Method 4: So-VITS-SVC (Voice Conversion)")
    print("="*60)

    try:
        print("So-VITS-SVC requires training on your voice samples")
        print("This is a manual process that takes ~30 minutes")
        print("See: https://github.com/svc-develop-team/so-vits-svc")
        return False

    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def try_elevenlabs_alternatives():
    """List cloud-based alternatives"""
    print("\n" + "="*60)
    print("Cloud-based Alternatives (Better Quality)")
    print("="*60)

    print("""
High-quality cloud services for voice cloning:

1. ElevenLabs (https://elevenlabs.io)
   - Best quality, ~1 minute of audio needed
   - Free tier available
   - API access

2. Play.ht (https://play.ht)
   - Good quality
   - Voice cloning with 30s samples

3. Resemble.ai (https://resemble.ai)
   - Professional grade
   - Voice cloning and conversion

4. Murf.ai (https://murf.ai)
   - Good for longer content

For local solutions:
- RVC (Retrieval-based Voice Conversion) - requires training
- So-VITS-SVC - requires training (~30 min)
- Tortoise TTS - slow but highest local quality
""")

def main():
    print("Advanced Voice Cloning Test")
    print("Testing multiple approaches for better quality\n")

    success = False

    # Try Tortoise TTS first (best quality)
    if try_tortoise_tts():
        success = True

    # Try Bark
    if try_bark_voice_clone():
        success = True

    # Try OpenVoice
    # try_openvoice()

    # Show alternatives
    try_elevenlabs_alternatives()

    if success:
        print("\n" + "="*60)
        print("Results saved to:", OUTPUT_DIR)
        print("="*60)
    else:
        print("\n" + "="*60)
        print("No advanced models were available locally.")
        print("Consider using cloud-based services for best quality.")
        print("="*60)

if __name__ == '__main__':
    main()
