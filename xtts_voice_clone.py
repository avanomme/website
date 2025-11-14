#!/usr/bin/env python3
"""
XTTS-v2 Voice Cloning for cox8.wav
Using the correct virtual environment with proper audio preprocessing
"""
import os
import sys
from pathlib import Path

# Input and output
INPUT_FILE = "/Users/adam/projects/website/cox8.wav"
OUTPUT_DIR = Path("/Users/adam/projects/website/cloned_voice_samples_xtts")
OUTPUT_DIR.mkdir(exist_ok=True)

# Test messages
TEST_MESSAGES = [
    "Hello Adam, thank you for creating the fantastic voice. Let me know if I can ever do anything for you.",
    "The quick brown fox jumps over the lazy dog.",
    "This is a test of the voice cloning capabilities with XTTS version 2."
]

def extract_clean_samples(input_file, output_dir, num_samples=3, duration=10):
    """Extract multiple clean samples from different parts of the audio"""
    import subprocess
    import json

    print(f"Extracting samples from: {Path(input_file).name}")

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
        print(f"  Total duration: {total_duration:.1f}s")
    except:
        print("  Could not determine duration, using defaults")
        total_duration = 60

    samples = []

    # Extract samples from different positions
    # Skip first 5s and last 5s to avoid silence
    usable_duration = max(0, total_duration - 10)

    if usable_duration < duration:
        positions = [5]
    else:
        # Extract from beginning, middle, and end
        positions = [
            5,  # Beginning
            (total_duration / 2) - (duration / 2),  # Middle
            total_duration - duration - 5  # End
        ][:num_samples]

    for i, start in enumerate(positions, 1):
        output_file = output_dir / f"reference_sample_{i}.wav"

        cmd = [
            'ffmpeg', '-y',
            '-i', input_file,
            '-ss', str(start),
            '-t', str(duration),
            '-ar', '22050',  # XTTS-v2 native sample rate
            '-ac', '1',      # Mono
            '-acodec', 'pcm_s16le',
            str(output_file)
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            samples.append(str(output_file))
            print(f"  ✓ Sample {i} extracted (starting at {start:.1f}s)")
        else:
            print(f"  ✗ Failed to extract sample {i}")
            print(f"    Error: {result.stderr}")

    return samples

def clone_voice_xtts():
    """Clone voice using XTTS-v2"""

    print("\n" + "="*60)
    print("XTTS-v2 Voice Cloning")
    print("="*60 + "\n")

    # Check input file
    if not Path(INPUT_FILE).exists():
        print(f"✗ Input file not found: {INPUT_FILE}")
        return False

    print(f"Input: {INPUT_FILE}")
    print(f"Output: {OUTPUT_DIR}\n")

    # Extract reference samples
    print("Step 1: Extracting reference samples...")
    print("-" * 60)
    reference_samples = extract_clean_samples(INPUT_FILE, OUTPUT_DIR, num_samples=3, duration=10)

    if not reference_samples:
        print("✗ Failed to extract reference samples")
        return False

    print(f"\n✓ Extracted {len(reference_samples)} reference samples\n")

    # Load XTTS-v2
    print("Step 2: Loading XTTS-v2 model...")
    print("-" * 60)

    try:
        from TTS.api import TTS
        import torch

        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}")

        tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=(device == "cuda"))
        print("✓ XTTS-v2 loaded successfully\n")

    except ImportError as e:
        print(f"✗ Error: TTS library not installed")
        print(f"  {e}")
        print("\nInstall with: pip install TTS")
        return False
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        return False

    # Test each reference sample
    print("Step 3: Testing voice cloning with each reference sample...")
    print("-" * 60 + "\n")

    results = []

    for sample_idx, ref_sample in enumerate(reference_samples, 1):
        print(f"Using reference sample {sample_idx}: {Path(ref_sample).name}")

        for msg_idx, text in enumerate(TEST_MESSAGES, 1):
            output_file = OUTPUT_DIR / f"result_sample{sample_idx}_msg{msg_idx}.wav"

            try:
                print(f"  Generating message {msg_idx}: '{text[:50]}...'", end=' ')

                tts.tts_to_file(
                    text=text,
                    speaker_wav=ref_sample,
                    language="en",
                    file_path=str(output_file)
                )

                print(f"✓")
                results.append({
                    'sample': sample_idx,
                    'message': msg_idx,
                    'file': output_file.name,
                    'text': text
                })

            except Exception as e:
                print(f"✗ Error: {e}")

        print()

    # Summary
    print("="*60)
    print("Voice Cloning Complete!")
    print("="*60 + "\n")

    if results:
        print(f"✓ Generated {len(results)} voice samples")
        print(f"\nOutput directory: {OUTPUT_DIR}")
        print("\nGenerated files:")
        for r in results:
            print(f"  - {r['file']}")

        print("\n" + "="*60)
        print("Instructions:")
        print("="*60)
        print("1. Listen to the generated samples in the output directory")
        print("2. Compare samples 1, 2, and 3 (different reference positions)")
        print("3. Choose the best-sounding result")
        print("\nReference samples were extracted from:")
        print("  - Sample 1: Beginning of audio")
        print("  - Sample 2: Middle of audio")
        print("  - Sample 3: End of audio")
        print("\nThe best results typically come from clean speech")
        print("with minimal background noise.")

        return True
    else:
        print("✗ No samples were generated successfully")
        return False

if __name__ == '__main__':
    try:
        success = clone_voice_xtts()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
