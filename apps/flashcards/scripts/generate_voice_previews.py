#!/usr/bin/env python3
"""
Generate voice preview samples for all XTTS-v2 voices
"""
import os
import sys
import time
from pathlib import Path
from TTS.api import TTS

# Output directory for previews
OUTPUT_DIR = Path(__file__).parent / "voice_previews"
OUTPUT_DIR.mkdir(exist_ok=True)

# All available XTTS-v2 voices
VOICES = [
    "Alexandra Hisakawa",
    "Alison Dietlinde",
    "Ana Florence",
    "Annmarie Nele",
    "Asya Anara",
    "Barbora MacLean",
    "Brenda Stern",
    "Camilla Holmström",
    "Chandra MacFarland",
    "Gitta Nikolina",
    "Henriette Usha",
    "Lilya Stainthorpe",
    "Maja Ruoho",
    "Narelle Moon",
    "Nova Hogarth",
    "Rosemary Okafor",
    "Sofia Hellen",
    "Szofi Granger",
    "Tammie Ema",
    "Tammy Grit",
    "Tanja Adelina",
    "Uta Obando",
    "Vjollca Johnnie",
    "Zofija Kendrick"
]

def sanitize_filename(name):
    """Convert voice name to safe filename"""
    return name.replace(" ", "_").replace("'", "")

def main():
    print("Loading XTTS-v2 model... This may take a moment.")
    try:
        tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)
        print("✓ XTTS-v2 model loaded successfully\n")
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        sys.exit(1)

    print(f"Generating previews for {len(VOICES)} voices...\n")

    successful = 0
    failed = 0

    for i, voice_name in enumerate(VOICES, 1):
        text = f"This is a preview of voice {voice_name}. How does this sound?"
        filename = sanitize_filename(voice_name) + ".wav"
        output_path = OUTPUT_DIR / filename

        print(f"[{i}/{len(VOICES)}] Generating: {voice_name}...", end=" ", flush=True)

        try:
            start_time = time.time()

            # Generate speech
            tts.tts_to_file(
                text=text,
                speaker=voice_name,
                language="en",
                file_path=str(output_path)
            )

            elapsed = time.time() - start_time
            size_kb = output_path.stat().st_size / 1024

            print(f"✓ ({elapsed:.1f}s, {size_kb:.1f}KB)")
            successful += 1

        except Exception as e:
            print(f"✗ Failed: {e}")
            failed += 1

    print(f"\n{'='*60}")
    print(f"Generation complete!")
    print(f"Successful: {successful}/{len(VOICES)}")
    if failed > 0:
        print(f"Failed: {failed}/{len(VOICES)}")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"{'='*60}\n")

    # List generated files
    print("Generated files:")
    for wav_file in sorted(OUTPUT_DIR.glob("*.wav")):
        size_kb = wav_file.stat().st_size / 1024
        print(f"  {wav_file.name} ({size_kb:.1f}KB)")

if __name__ == '__main__':
    main()
