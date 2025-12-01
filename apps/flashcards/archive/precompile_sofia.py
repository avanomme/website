#!/usr/bin/env python3
"""
Precompile Sofia Hellen (American Female) from XTTS-v2
"""
import requests
import time
from pathlib import Path
import sys
import re

# Configuration
COQUI_SERVER_URL = "http://localhost:5050/api/speak"
CARDS_FILE = "ml_midterm_cards.md"
CACHE_DIR = Path("audio_cache")

# Sofia Hellen voice
VOICE_NAME = "Sofia Hellen"
DESCRIPTION = "American female"

def parse_cards_md():
    """Parse ml_midterm_cards.md to extract all text with card numbers"""
    if not Path(CARDS_FILE).exists():
        print(f"Error: {CARDS_FILE} not found")
        return []

    with open(CARDS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    cards = []
    lines = content.split('\n')

    current_card_num = None
    current_question = []
    current_answer = []
    in_answer = False

    for line in lines:
        stripped = line.strip()

        if not stripped or stripped.startswith('<!--') or stripped.startswith('####'):
            continue

        if stripped.startswith('#flashcards'):
            if current_card_num and current_question:
                q_text = ' '.join(current_question).strip()
                q_text = re.sub(r'\*', '', q_text).strip()
                if q_text:
                    cards.append((current_card_num, 'q', q_text))

            if current_card_num and current_answer:
                a_text = ' '.join(current_answer).strip()
                a_text = re.sub(r'\*\*', '', a_text)
                a_text = re.sub(r'^\s*[-•]\s*', '', a_text, flags=re.MULTILINE)
                a_text = a_text.strip()
                if a_text:
                    cards.append((current_card_num, 'a', a_text))

            current_question = []
            current_answer = []
            in_answer = False
            current_card_num = None
            continue

        if stripped == '?':
            in_answer = True
            continue

        if not in_answer and not current_card_num:
            match = re.match(r'\*\*([\d.]+)\*\*', stripped)
            if match:
                current_card_num = match.group(1)

        if in_answer:
            current_answer.append(stripped)
        else:
            current_question.append(stripped)

    # Last card
    if current_card_num and current_question:
        q_text = ' '.join(current_question).strip()
        q_text = re.sub(r'\*', '', q_text).strip()
        if q_text:
            cards.append((current_card_num, 'q', q_text))

    if current_card_num and current_answer:
        a_text = ' '.join(current_answer).strip()
        a_text = re.sub(r'\*\*', '', a_text)
        a_text = re.sub(r'^\s*[-•]\s*', '', a_text, flags=re.MULTILINE)
        a_text = a_text.strip()
        if a_text:
            cards.append((current_card_num, 'a', a_text))

    return cards

def safe_filename(name):
    """Convert voice name to safe directory name"""
    return name.lower().replace(' ', '_')

def generate_audio(text, voice_name):
    """Generate audio via Coqui TTS"""
    try:
        response = requests.post(
            COQUI_SERVER_URL,
            json={"text": text, "speaker": voice_name},
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
    print(f"  Precompile {VOICE_NAME} ({DESCRIPTION})")
    print("="*60 + "\n")

    # Parse cards
    print("Parsing cards...")
    cards = parse_cards_md()

    if not cards:
        print("✗ No cards found")
        return 1

    print(f"✓ Found {len(cards)} items ({len(cards)//2} cards)\n")

    voice_dir = CACHE_DIR / safe_filename(VOICE_NAME)
    voice_dir.mkdir(parents=True, exist_ok=True)

    print(f"{'='*60}")
    print(f"  {VOICE_NAME} ({DESCRIPTION})")
    print('='*60)

    success = 0
    skip = 0
    errors = 0

    for card_num, qa_type, text in cards:
        filename = f"{card_num}_{qa_type}.wav"
        filepath = voice_dir / filename

        # Skip if exists
        if filepath.exists():
            skip += 1
            continue

        # Show progress
        preview = text[:50] + "..." if len(text) > 50 else text
        print(f"[{card_num}_{qa_type}] {preview}")

        # Generate
        audio_data = generate_audio(text, VOICE_NAME)

        if audio_data:
            filepath.write_bytes(audio_data)
            success += 1
            print(f"  ✓ Saved ({len(audio_data):,} bytes)")
        else:
            errors += 1

        time.sleep(0.3)  # Rate limit

    print(f"\n✓ Complete: {success} new, {skip} cached, {errors} errors")

    # Summary
    voice_dir = CACHE_DIR / safe_filename(VOICE_NAME)
    count = len(list(voice_dir.glob('*.wav')))
    print(f"\n{VOICE_NAME}: {count} files")
    print(f"Cache directory: {CACHE_DIR}")

    return 0

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n✗ Interrupted")
        sys.exit(1)
