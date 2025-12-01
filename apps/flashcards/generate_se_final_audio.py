#!/usr/bin/env python3
"""
Generate Cox TTS audio for SE Final flashcards
Names files as SE_11.1_Q.wav (question) and SE_11.1_A.wav (answer)
"""
import subprocess
import sys
import re
from pathlib import Path
import json

# Configuration
CACHE_DIR = Path("audio_cache/cox_voice/SE_Final_Audio")
SE_FINAL_DIR = Path("se_final")

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

def clean_text_for_speech(text):
    """Clean markdown formatting for TTS"""
    text = re.sub(r'\*\*\*(.+?)\*\*\*', r'\1', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'`(.+?)`', r'\1', text)
    text = re.sub(r'~~(.+?)~~', r'\1', text)
    text = re.sub(r'[#>*`]', ' ', text)
    text = re.sub(r'^\s*[-•]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def parse_card_file(filepath):
    """Parse a single flashcard markdown file and extract Q&A with ID"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Get lecture number from parent folder
    parent_folder = filepath.parent.name
    lecture_num = LECTURE_MAP.get(parent_folder, '0')

    # Split by the ? separator
    parts = content.split('\n?\n')
    if len(parts) != 2:
        return None

    question_part = parts[0]
    answer_part = parts[1]

    # Extract question number from **L##.#** or **G.#** pattern
    q_match = re.search(r'\*\*([A-Z]+)(\d+)\.(\d+)\*\*', question_part)
    if q_match:
        question_num = q_match.group(3)
    else:
        # Try filename for question number (e.g., 01_iso_certification.md)
        fname_match = re.match(r'(\d+)_', filepath.name)
        question_num = fname_match.group(1).lstrip('0') if fname_match else '1'

    # Extract question text
    q_text_match = re.search(r'\*\*[A-Z]+\d*\.\d+\*\*\s*\*(.+?)\*', question_part)
    if q_text_match:
        question = q_text_match.group(1)
    else:
        question = clean_text_for_speech(question_part)

    answer = clean_text_for_speech(answer_part)
    question = clean_text_for_speech(question)

    # Create ID like "11.1" or "G.1"
    card_id = f"{lecture_num}.{question_num}"

    return {
        'id': card_id,
        'question': question,
        'answer': answer,
        'file': filepath.name
    }

def generate_audio_cox(text, output_path):
    """Generate audio using Cox TTS"""
    try:
        result = subprocess.run(
            [str(Path.home() / "cox_tts" / "cox-speak-wrapper"), text, str(output_path)],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes for longer texts
        )

        if result.returncode == 0:
            return True
        else:
            print(f"  ✗ Error: {result.stderr[:100] if result.stderr else 'Unknown error'}")
            return False
    except subprocess.TimeoutExpired:
        print(f"  ✗ Timeout")
        return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    print("=" * 70)
    print("Cox Voice Audio Generator for SE Final Flashcards")
    print("=" * 70)
    print()

    # Create output directory
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Find all card files
    card_files = list(SE_FINAL_DIR.rglob("*.md"))
    print(f"Found {len(card_files)} flashcard files in {SE_FINAL_DIR}/")
    print()

    # Parse all cards
    cards = []
    for card_file in sorted(card_files):
        card = parse_card_file(card_file)
        if card:
            cards.append(card)

    print(f"Parsed {len(cards)} flashcards")
    print()

    # Check which need generation
    to_generate = []
    cached = 0

    for card in cards:
        q_path = CACHE_DIR / f"SE_{card['id']}_Q.wav"
        a_path = CACHE_DIR / f"SE_{card['id']}_A.wav"

        if not q_path.exists():
            to_generate.append({
                'id': card['id'],
                'type': 'Q',
                'text': card['question'],
                'path': q_path
            })
        else:
            cached += 1

        if not a_path.exists():
            to_generate.append({
                'id': card['id'],
                'type': 'A',
                'text': card['answer'],
                'path': a_path
            })
        else:
            cached += 1

    print(f"Already cached: {cached}")
    print(f"To generate: {len(to_generate)}")
    print()

    if not to_generate:
        print("All audio already cached!")
        return

    # Estimate time
    est_time = len(to_generate) * 8  # ~8 seconds per clip
    print(f"Estimated time: ~{est_time // 60} min {est_time % 60} sec")
    print()

    response = input("Proceed? [y/N]: ").strip().lower()
    if response != 'y':
        print("Aborted.")
        return

    print()
    print("=" * 70)
    print()

    # Generate audio
    generated = 0
    failed = 0

    for i, item in enumerate(to_generate):
        filename = f"SE_{item['id']}_{item['type']}.wav"
        preview = item['text'][:50] + "..." if len(item['text']) > 50 else item['text']
        print(f"[{i+1}/{len(to_generate)}] {filename}")
        print(f"    {preview}")

        print(f"  → Generating...", end=" ", flush=True)

        if generate_audio_cox(item['text'], item['path']):
            size = item['path'].stat().st_size
            print(f"✓ ({size:,} bytes)")
            generated += 1
        else:
            print()
            failed += 1

    print()
    print("=" * 70)
    print()

    # Create index file
    index = {
        'voice': 'cox_voice',
        'section': 'SE_Final',
        'files': {}
    }

    for wav_file in CACHE_DIR.glob("SE_*.wav"):
        index['files'][wav_file.stem] = wav_file.name

    index_path = CACHE_DIR / "index.json"
    with open(index_path, 'w') as f:
        json.dump(index, f, indent=2)

    print(f"✓ Created index: {index_path}")
    print()

    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Generated:  {generated}")
    print(f"Failed:     {failed}")
    print(f"Cached:     {cached}")
    print(f"Total:      {generated + cached}")
    print()

    # Cache size
    if CACHE_DIR.exists():
        total_size = sum(f.stat().st_size for f in CACHE_DIR.glob("*.wav"))
        print(f"Cache size: {total_size / 1024 / 1024:.1f} MB")

    print(f"Location: {CACHE_DIR.absolute()}")
    print()
    print("✓ Generation complete!")

if __name__ == "__main__":
    main()
