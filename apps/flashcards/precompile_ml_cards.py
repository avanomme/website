#!/usr/bin/env python3
"""
Precompile ML Midterm flash card audio for specific voices
Generates cached audio for ml_midterm_cards.md
"""
import requests
import hashlib
import time
from pathlib import Path
import sys
import re

# Configuration
COQUI_SERVER_URL = "http://localhost:5050/api/speak"
CARDS_FILE = "ml_midterm_cards.md"
CACHE_DIR = Path("audio_cache_british")

# Voices to precompile
VOICES = [
    "Gracie Wise",      # British female (Coqui)
    "Claribel Dervla"   # Irish female (Coqui)
]

def get_cache_key(text, voice_name):
    """Generate cache key from text and voice"""
    combined = f"{text}|{voice_name}"
    return hashlib.md5(combined.encode()).hexdigest()

def parse_cards_md():
    """Parse ml_midterm_cards.md to extract all text that needs TTS"""
    if not Path(CARDS_FILE).exists():
        print(f"Error: {CARDS_FILE} not found")
        return []

    with open(CARDS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    texts = []
    lines = content.split('\n')

    current_question = []
    current_answer = []
    in_answer = False

    for line in lines:
        stripped = line.strip()

        # Skip empty lines and comments
        if not stripped or stripped.startswith('<!--'):
            continue

        # New card marker
        if stripped.startswith('#flashcards'):
            # Save previous card if exists
            if current_question:
                q_text = ' '.join(current_question).strip()
                if q_text:
                    # Remove markdown formatting
                    q_text = re.sub(r'\*\*[\d.]+\*\*\s*\*', '', q_text)  # Remove **1.1** *
                    q_text = re.sub(r'\*', '', q_text)  # Remove remaining *
                    q_text = q_text.strip()
                    if q_text:
                        texts.append(q_text)

            if current_answer:
                a_text = ' '.join(current_answer).strip()
                if a_text:
                    # Remove markdown formatting
                    a_text = re.sub(r'\*\*', '', a_text)  # Remove bold
                    a_text = re.sub(r'^\s*[-•]\s*', '', a_text, flags=re.MULTILINE)  # Remove bullets
                    a_text = a_text.strip()
                    if a_text:
                        texts.append(a_text)

            current_question = []
            current_answer = []
            in_answer = False
            continue

        # Question/answer separator
        if stripped == '?':
            in_answer = True
            continue

        # Add to appropriate buffer
        if in_answer:
            current_answer.append(stripped)
        else:
            current_question.append(stripped)

    # Don't forget the last card
    if current_question:
        q_text = ' '.join(current_question).strip()
        if q_text:
            q_text = re.sub(r'\*\*[\d.]+\*\*\s*\*', '', q_text)
            q_text = re.sub(r'\*', '', q_text)
            q_text = q_text.strip()
            if q_text:
                texts.append(q_text)

    if current_answer:
        a_text = ' '.join(current_answer).strip()
        if a_text:
            a_text = re.sub(r'\*\*', '', a_text)
            a_text = re.sub(r'^\s*[-•]\s*', '', a_text, flags=re.MULTILINE)
            a_text = a_text.strip()
            if a_text:
                texts.append(a_text)

    return texts

def generate_audio(text, voice_name):
    """Generate audio via Coqui TTS"""
    try:
        response = requests.post(
            COQUI_SERVER_URL,
            json={"text": text, "voice": voice_name},
            timeout=30
        )

        if response.status_code == 200:
            return response.content
        else:
            print(f"    ✗ Server error {response.status_code}")
            return None
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return None

def main():
    print("\n" + "="*60)
    print("  Precompile ML Midterm Cards Audio")
    print("="*60 + "\n")

    # Parse cards
    print("Step 1: Parsing card file...")
    texts = parse_cards_md()

    if not texts:
        print("✗ No text found to process")
        return 1

    print(f"✓ Found {len(texts)} text segments to precompile\n")

    # Create cache directory
    CACHE_DIR.mkdir(exist_ok=True)

    # Precompile for each voice
    for voice_name in VOICES:
        print(f"\nStep 2: Precompiling for {voice_name}...")
        print("-" * 60)

        success_count = 0
        skip_count = 0
        error_count = 0

        for i, text in enumerate(texts, 1):
            # Generate cache key
            cache_key = get_cache_key(text, voice_name)
            cache_file = CACHE_DIR / f"{cache_key}.wav"

            # Skip if already exists
            if cache_file.exists():
                skip_count += 1
                if i % 10 == 0:
                    print(f"  Progress: {i}/{len(texts)} ({skip_count} cached, {success_count} new, {error_count} errors)")
                continue

            # Show what we're generating
            preview = text[:60] + "..." if len(text) > 60 else text
            print(f"  [{i}/{len(texts)}] {preview}")

            # Generate audio
            audio_data = generate_audio(text, voice_name)

            if audio_data:
                cache_file.write_bytes(audio_data)
                success_count += 1
                print(f"    ✓ Saved ({len(audio_data):,} bytes)")
            else:
                error_count += 1

            # Rate limiting
            time.sleep(0.5)

        print(f"\n✓ {voice_name} complete:")
        print(f"  - New files: {success_count}")
        print(f"  - Already cached: {skip_count}")
        print(f"  - Errors: {error_count}")

    print("\n" + "="*60)
    print("  Precompilation Complete!")
    print("="*60)
    print(f"\n✓ Cache directory: {CACHE_DIR}")
    print(f"✓ Total files: {len(list(CACHE_DIR.glob('*.wav')))}")
    print("\nNow audio playback will be instant for these voices!")

    return 0

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n✗ Interrupted by user")
        sys.exit(1)
