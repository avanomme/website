#!/usr/bin/env python3
"""
Generate card 1.1 (question and answer) for all Coqui TTS voices
"""
import requests
from pathlib import Path
import time

# All 10 Coqui TTS voices
voices = [
    "Ana Florence",      # American female
    "Andrew Chipper",    # British male (already done, but will regenerate)
    "Brenda Stern",      # American female
    "Claribel Dervla",   # Irish female (already done, but will regenerate)
    "Craig Gutsy",       # Australian male
    "Daisy Studious",    # British female
    "Gitta Nikolina",    # American female
    "Gracie Wise",       # British female (already done, but will regenerate)
    "Sofia Hellen",      # American female
    "Viktor Eka",        # American male
]

# Card 1.1 text
text_q = "What is the main idea behind Linear Regression?"
text_a = "Fits a straight line to predict continuous values using least squares."

print("\n" + "="*60)
print("  Training Card 1.1 for All Voices")
print("="*60 + "\n")

for voice_name in voices:
    print(f"\n{voice_name}:")
    print("-" * 40)

    safe_name = voice_name.lower().replace(' ', '_')
    voice_dir = Path("audio_cache") / safe_name
    voice_dir.mkdir(parents=True, exist_ok=True)

    for label, text in [("q", text_q), ("a", text_a)]:
        filepath = voice_dir / f"1.1_{label}.wav"

        print(f"  Generating 1.1_{label}.wav...")

        try:
            response = requests.post(
                "http://localhost:5050/api/speak",
                json={"text": text, "speaker": voice_name},
                timeout=30
            )

            if response.status_code == 200:
                filepath.write_bytes(response.content)
                size_kb = len(response.content) / 1024
                print(f"    ✓ Saved ({size_kb:.1f} KB)")
            else:
                print(f"    ✗ Server error {response.status_code}")
        except Exception as e:
            print(f"    ✗ Error: {e}")

        time.sleep(0.3)  # Rate limit

print("\n" + "="*60)
print("  Complete!")
print("="*60 + "\n")

# Show summary
print("Voice directories created:")
for voice_name in voices:
    safe_name = voice_name.lower().replace(' ', '_')
    voice_dir = Path("audio_cache") / safe_name
    count = len(list(voice_dir.glob("*.wav")))
    print(f"  {voice_name:20s} - {count} files")
