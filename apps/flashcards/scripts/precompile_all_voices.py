#!/usr/bin/env python3
"""
Precompile ALL voices (XTTS-v2 + Edge TTS) for flashcards
Generates audio cache with human-readable filenames
"""
import requests
import asyncio
import time
from pathlib import Path
import sys

# Configuration
CARDS_FILE = "ml_midterm_cards.md"
CACHE_DIR = Path("audio_cache")

# XTTS-v2 voices (Coqui TTS)
COQUI_SERVER_URL = "http://localhost:5050/api/speak"
XTTS_VOICES = [
    ("Gracie Wise", "British female"),
    ("Claribel Dervla", "Irish female"),
    ("Andrew Chipper", "British male"),
    ("Ana Florence", "American female"),
    ("Brenda Stern", "American female"),
    ("Craig Gutsy", "Australian male"),
    ("Daisy Studious", "British female"),
    ("Gitta Nikolina", "American female"),
    ("Sofia Hellen", "American female"),
    ("Viktor Eka", "American male"),
]

# Edge TTS voices
EDGE_SERVER_URL = "http://localhost:5052/api/speak"
EDGE_VOICES = [
    # US English
    ("Aria", "American female", "en-US-AriaNeural"),
    ("Guy", "American male", "en-US-GuyNeural"),
    ("Jenny", "American female", "en-US-JennyNeural"),
    ("Ryan", "American male", "en-US-RyanNeural"),
    ("Michelle", "American female", "en-US-MichelleNeural"),
    ("Eric", "American male", "en-US-EricNeural"),
    ("Steffan", "American male", "en-US-SteffanNeural"),
    ("Ana", "American female", "en-US-AnaNeural"),

    # UK English
    ("Sonia", "British female", "en-GB-SoniaNeural"),
    ("Ryan (UK)", "British male", "en-GB-RyanNeural"),
    ("Libby", "British female", "en-GB-LibbyNeural"),
    ("Abbi", "British female", "en-GB-AbbiNeural"),
    ("Alfie", "British male", "en-GB-AlfieNeural"),
    ("Bella", "British female", "en-GB-BellaNeural"),
    ("Elliot", "British male", "en-GB-ElliotNeural"),
    ("Ethan", "British male", "en-GB-EthanNeural"),
    ("Holly", "British female", "en-GB-HollyNeural"),
    ("Maisie", "British female", "en-GB-MaisieNeural"),
    ("Noah", "British male", "en-GB-NoahNeural"),
    ("Oliver", "British male", "en-GB-OliverNeural"),
    ("Olivia", "British female", "en-GB-OliviaNeural"),
    ("Thomas", "British male", "en-GB-ThomasNeural"),

    # Australian English
    ("Natasha", "Australian female", "en-AU-NatashaNeural"),
    ("William", "Australian male", "en-AU-WilliamNeural"),
    ("Annette", "Australian female", "en-AU-AnnetteNeural"),
    ("Carly", "Australian female", "en-AU-CarlyNeural"),
    ("Darren", "Australian male", "en-AU-DarrenNeural"),
    ("Duncan", "Australian male", "en-AU-DuncanNeural"),
    ("Elsie", "Australian female", "en-AU-ElsieNeural"),
    ("Freya", "Australian female", "en-AU-FreyaNeural"),
    ("Joanne", "Australian female", "en-AU-JoanneNeural"),
    ("Ken", "Australian male", "en-AU-KenNeural"),
    ("Kim", "Australian female", "en-AU-KimNeural"),
    ("Neil", "Australian male", "en-AU-NeilNeural"),
    ("Tim", "Australian male", "en-AU-TimNeural"),
    ("Tina", "Australian female", "en-AU-TinaNeural"),

    # Irish English
    ("Emily", "Irish female", "en-IE-EmilyNeural"),
    ("Connor", "Irish male", "en-IE-ConnorNeural"),

    # Canadian English
    ("Clara", "Canadian female", "en-CA-ClaraNeural"),
    ("Liam", "Canadian male", "en-CA-LiamNeural"),

    # Indian English
    ("Neerja", "Indian female", "en-IN-NeerjaNeural"),
    ("Prabhat", "Indian male", "en-IN-PrabhatNeural"),
]

def parse_cards_md():
    """Parse ml_midterm_cards.md to extract all text with card numbers"""
    import re

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

        # Skip empty, comments, headers
        if not stripped or stripped.startswith('<!--') or stripped.startswith('####'):
            continue

        # New card marker
        if stripped.startswith('#flashcards'):
            # Save previous card
            if current_card_num and current_question:
                q_text = ' '.join(current_question).strip()
                q_text = re.sub(r'\*', '', q_text)
                q_text = q_text.strip()
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

        # Question/answer separator
        if stripped == '?':
            in_answer = True
            continue

        # Extract card number from question line
        if not in_answer and not current_card_num:
            match = re.match(r'\*\*([\d.]+)\*\*', stripped)
            if match:
                current_card_num = match.group(1)

        # Add to buffer
        if in_answer:
            current_answer.append(stripped)
        else:
            current_question.append(stripped)

    # Last card
    if current_card_num and current_question:
        q_text = ' '.join(current_question).strip()
        q_text = re.sub(r'\*', '', q_text)
        q_text = q_text.strip()
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
    # Handle special cases
    if name == "Ryan (UK)":
        return "ryan_uk"
    return name.lower().replace(' ', '_').replace('(', '').replace(')', '')

def generate_coqui_audio(text, voice_name):
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

def generate_edge_audio(text, voice_id):
    """Generate audio via Edge TTS"""
    try:
        response = requests.post(
            EDGE_SERVER_URL,
            json={"text": text, "voice": voice_id},
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
    print("\n" + "="*70)
    print("  Precompile ALL Voices - XTTS-v2 + Edge TTS")
    print("="*70 + "\n")

    # Parse cards
    print("Parsing cards...")
    cards = parse_cards_md()

    if not cards:
        print("✗ No cards found")
        return 1

    print(f"✓ Found {len(cards)} items ({len(cards)//2} cards)\n")

    total_voices = len(XTTS_VOICES) + len(EDGE_VOICES)
    print(f"Total voices to precompile: {total_voices}")
    print(f"  - XTTS-v2: {len(XTTS_VOICES)} voices")
    print(f"  - Edge TTS: {len(EDGE_VOICES)} voices\n")

    # Precompile XTTS-v2 voices
    print("="*70)
    print("  PART 1: XTTS-v2 Voices (Coqui TTS)")
    print("="*70 + "\n")

    for voice_name, description in XTTS_VOICES:
        voice_dir = CACHE_DIR / safe_filename(voice_name)
        voice_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n{'='*70}")
        print(f"  {voice_name} ({description})")
        print('='*70)

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
            audio_data = generate_coqui_audio(text, voice_name)

            if audio_data:
                filepath.write_bytes(audio_data)
                success += 1
                print(f"  ✓ Saved ({len(audio_data):,} bytes)")
            else:
                errors += 1

            time.sleep(0.3)  # Rate limit

        print(f"\n✓ Complete: {success} new, {skip} cached, {errors} errors")

    # Precompile Edge TTS voices
    print("\n" + "="*70)
    print("  PART 2: Edge TTS Voices")
    print("="*70 + "\n")

    for voice_name, description, voice_id in EDGE_VOICES:
        voice_dir = CACHE_DIR / safe_filename(voice_name)
        voice_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n{'='*70}")
        print(f"  {voice_name} ({description})")
        print('='*70)

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
            audio_data = generate_edge_audio(text, voice_id)

            if audio_data:
                filepath.write_bytes(audio_data)
                success += 1
                print(f"  ✓ Saved ({len(audio_data):,} bytes)")
            else:
                errors += 1

            time.sleep(0.3)  # Rate limit

        print(f"\n✓ Complete: {success} new, {skip} cached, {errors} errors")

    # Summary
    print("\n" + "="*70)
    print("  FINAL SUMMARY")
    print("="*70 + "\n")

    print("Voice directories created:")

    print("\nXTTS-v2 Voices:")
    for voice_name, description in XTTS_VOICES:
        voice_dir = CACHE_DIR / safe_filename(voice_name)
        count = len(list(voice_dir.glob('*.wav')))
        print(f"  {voice_name:25s} - {count:3d} files ({description})")

    print("\nEdge TTS Voices:")
    for voice_name, description, voice_id in EDGE_VOICES:
        voice_dir = CACHE_DIR / safe_filename(voice_name)
        count = len(list(voice_dir.glob('*.wav')))
        print(f"  {voice_name:25s} - {count:3d} files ({description})")

    total_files = sum(len(list(d.glob('*.wav'))) for d in CACHE_DIR.iterdir() if d.is_dir())
    cache_size_mb = sum(f.stat().st_size for f in CACHE_DIR.rglob('*.wav')) / (1024 * 1024)

    print(f"\nTotal: {total_voices} voices, {total_files} files, {cache_size_mb:.1f} MB")
    print(f"\nCache directory: {CACHE_DIR}")

    return 0

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n✗ Interrupted")
        sys.exit(1)
