#!/usr/bin/env python3
"""
Voice cloning script using Coqui XTTS-v2
Clones voice from audio samples and tests it
"""
import os
import sys
from pathlib import Path
from TTS.api import TTS
import torch

# Audio files to clone from
SAMPLE_FILES = [
    "/Users/adam/projects/website/cox7.wav",
    "/Users/adam/projects/website/cox8.wav"
]

# Output directory for cloned voice samples
OUTPUT_DIR = Path("/Users/adam/projects/website/cloned_voice_samples")
OUTPUT_DIR.mkdir(exist_ok=True)

def get_audio_duration(input_file):
    """Get duration of audio file in seconds"""
    import subprocess
    import json

    cmd = [
        'ffprobe', '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        input_file
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return None

    try:
        data = json.loads(result.stdout)
        return float(data['format']['duration'])
    except:
        return None

def extract_sample_segment(input_file, output_file, duration=10, start=0):
    """Extract a clean segment from audio file using ffmpeg"""
    import subprocess

    cmd = [
        'ffmpeg', '-y',
        '-i', input_file,
        '-ss', str(start),
        '-t', str(duration),
        '-ar', '22050',  # XTTS-v2 works with 22050 Hz
        '-ac', '1',      # Convert to mono
        '-acodec', 'pcm_s16le',
        output_file
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return False

    return True

def extract_multiple_samples(input_file, output_dir, duration=10, num_samples=5):
    """Extract multiple samples from different parts of the audio"""
    total_duration = get_audio_duration(input_file)

    if not total_duration:
        print(f"  Could not determine duration of {Path(input_file).name}")
        return []

    print(f"  Audio duration: {total_duration:.1f}s")
    print(f"  Extracting {num_samples} samples of {duration}s each...")

    samples = []
    # Skip first and last 5 seconds to avoid silence/noise
    usable_duration = max(0, total_duration - 10)

    if usable_duration < duration:
        print(f"  Warning: Audio too short, using what's available")
        start_positions = [5]
    else:
        # Evenly space samples throughout the audio
        step = (usable_duration - duration) / max(1, num_samples - 1)
        start_positions = [5 + i * step for i in range(num_samples)]

    for i, start in enumerate(start_positions, 1):
        output_file = output_dir / f"{Path(input_file).stem}_sample{i}_{duration}s.wav"

        if extract_sample_segment(input_file, str(output_file), duration, start):
            samples.append(str(output_file))
            print(f"    ✓ Sample {i} at {start:.1f}s -> {output_file.name}")

    return samples

def clone_and_test():
    """Clone voice from samples and test it"""

    print("\n" + "="*60)
    print("Voice Cloning with Coqui XTTS-v2")
    print("="*60 + "\n")

    # Check if sample files exist
    for sample_file in SAMPLE_FILES:
        if not Path(sample_file).exists():
            print(f"Error: Sample file not found: {sample_file}")
            return

    # Extract multiple samples from different parts (XTTS works best with 6-10 seconds)
    print("Step 1: Extracting voice samples...")
    print("-" * 60)

    all_extracted_samples = []
    for sample_file in SAMPLE_FILES:
        print(f"\nProcessing: {Path(sample_file).name}")
        samples = extract_multiple_samples(sample_file, OUTPUT_DIR, duration=10, num_samples=5)
        all_extracted_samples.extend(samples)

    if not all_extracted_samples:
        print("Error: Could not extract any samples")
        return

    print(f"\n✓ Extracted {len(all_extracted_samples)} samples total\n")

    # Load XTTS-v2 model
    print("Step 2: Loading XTTS-v2 model...")
    print("-" * 60)

    try:
        # Check if CUDA is available
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}")

        tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=(device == "cuda"))
        print("✓ Model loaded successfully\n")
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    # Test sentence - custom message for Adam
    test_text = "Hello Adam, thank you for creating the fantastic voice. Let me know if I can ever do anything for you."

    # Test with each sample to find the best one
    print("Step 3: Testing voice cloning with all samples...")
    print("-" * 60)
    print(f"\nTest message: '{test_text}'\n")

    best_samples = []
    for i, sample_file in enumerate(all_extracted_samples, 1):
        output_file = OUTPUT_DIR / f"test_result_{Path(sample_file).stem}.wav"

        try:
            print(f"[{i}/{len(all_extracted_samples)}] Using: {Path(sample_file).name}...", end=" ")

            tts.tts_to_file(
                text=test_text,
                speaker_wav=sample_file,
                language="en",
                file_path=str(output_file)
            )

            print(f"✓ {output_file.name}")
            best_samples.append((sample_file, output_file))

        except Exception as e:
            print(f"✗ Error: {e}")

    print("\n" + "="*60)
    print("Voice cloning complete!")
    print(f"Output directory: {OUTPUT_DIR}")
    print("="*60 + "\n")

    if best_samples:
        print(f"✓ Successfully generated {len(best_samples)} voice samples")
        print("\nNext steps:")
        print("1. Listen to the test results in:")
        print(f"   {OUTPUT_DIR}")
        print("   Files starting with 'test_result_' contain the cloned voice")
        print("\n2. Reference samples (10s each) are also saved:")
        print("   Files ending with '_10s.wav'")
        print("\n3. Choose the best sounding result and note its corresponding reference sample")
        print("\n4. To use in TTS server, use the reference sample file path:")
        print(f"   tts.tts_to_file(text='...', speaker_wav='[best_sample_path]', language='en')")
        print("\nAll samples tested with:")
        print(f"  '{test_text}'")
    else:
        print("✗ No samples were successfully generated")
        print("Check the errors above for details")

if __name__ == '__main__':
    try:
        clone_and_test()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
