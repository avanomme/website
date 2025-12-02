#!/usr/bin/env python3
"""Generate missing Cox voice audio files for SE Final flashcards."""

import subprocess
import os
from pathlib import Path
import re

CACHE_DIR = Path("audio_cache/cox_voice/SE_Final_Audio")
SE_FINAL_DIR = Path("se_final")
COX_SPEAK = os.path.expanduser("~/cox_tts/cox-speak-wrapper")

# Map folder names to lecture numbers
LECTURE_MAP = {
    'L11_SQA': '11',
    'L12_Review': '12',
    'L13_Testing': '13',
    'L14_Process_Models': '14',
    'L15_People_Management': '15',
    'L16_Agile_Goals': '16',
    'L17_Agile_Steps': '17',
    'L18_Agile_Models': '18',
    'L19_Agile_People': '19',
    'General': 'G'
}

def parse_card(filepath):
    """Parse a flashcard markdown file."""
    with open(filepath, 'r') as f:
        content = f.read()

    # Extract card ID (e.g., L19.1, G.2)
    id_match = re.search(r'\*\*([LG]\d*\.?\d+)\*\*', content)
    if not id_match:
        return None

    card_id = id_match.group(1)
    # Remove leading 'L' to match existing file format (SE_11.1_Q.wav not SE_L11.1_Q.wav)
    card_id = card_id.lstrip('L')

    # Split by ?
    parts = content.split('?')
    if len(parts) < 2:
        return None

    # Get question (after the ID)
    q_match = re.search(r'\*\*[LG]\d*\.?\d+\*\*\s*\*(.*?)\*', parts[0])
    question = q_match.group(1).strip() if q_match else ""

    # Get answer
    answer = parts[1].strip()
    # Clean up markdown
    answer = re.sub(r'\*\*([^*]+)\*\*', r'\1', answer)  # Remove bold
    answer = re.sub(r'\*([^*]+)\*', r'\1', answer)  # Remove italic
    answer = re.sub(r'^[-•]\s*', '', answer, flags=re.MULTILINE)  # Remove bullets

    return {
        'id': card_id,
        'question': question,
        'answer': answer
    }

def generate_audio(text, output_path):
    """Generate audio using cox-speak."""
    try:
        result = subprocess.run(
            [COX_SPEAK, text, "-o", str(output_path)],
            capture_output=True,
            text=True,
            timeout=120
        )
        if output_path.exists() and output_path.stat().st_size > 0:
            return True
        return False
    except Exception as e:
        print(f"  Error: {e}")
        return False

def main():
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Collect all cards
    cards = []
    for folder in sorted(SE_FINAL_DIR.iterdir()):
        if not folder.is_dir():
            continue
        lecture_num = LECTURE_MAP.get(folder.name, folder.name)

        for card_file in sorted(folder.glob("*.md")):
            card = parse_card(card_file)
            if card:
                cards.append(card)

    print(f"Found {len(cards)} cards total")

    # Find missing audio
    missing = []
    for card in cards:
        q_path = CACHE_DIR / f"SE_{card['id']}_Q.wav"
        a_path = CACHE_DIR / f"SE_{card['id']}_A.wav"

        if not q_path.exists():
            missing.append(('Q', card, q_path))
        if not a_path.exists():
            missing.append(('A', card, a_path))

    print(f"Missing {len(missing)} audio files")

    if not missing:
        print("All audio files exist!")
        return

    # Generate missing audio
    for i, (type_, card, path) in enumerate(missing, 1):
        text = card['question'] if type_ == 'Q' else card['answer']
        print(f"[{i}/{len(missing)}] SE_{card['id']}_{type_}.wav")
        print(f"    {text[:50]}...")

        if generate_audio(text, path):
            print(f"  → Generated ({path.stat().st_size:,} bytes)")
        else:
            print(f"  → FAILED")

if __name__ == "__main__":
    main()
