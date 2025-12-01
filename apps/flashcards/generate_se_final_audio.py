#!/usr/bin/env python3
"""
Generate Cox TTS audio for SE Final flashcards
Parses all markdown files in se_final/ folder structure
"""
import subprocess
import hashlib
import sys
import re
from pathlib import Path
import json

# Configuration
CACHE_DIR = Path("audio_cache")
COX_VOICE_NAME = "cox_voice"
SE_FINAL_DIR = Path("se_final")

def get_cache_key(text, voice_name):
    """Generate cache key from text and voice"""
    combined = f"{text}|{voice_name}"
    return hashlib.md5(combined.encode()).hexdigest()

def clean_text_for_speech(text):
    """Clean markdown formatting for TTS"""
    # Remove markdown formatting
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
    """Parse a single flashcard markdown file and extract Q&A"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by the ? separator
    parts = content.split('\n?\n')
    if len(parts) != 2:
        return None

    question_part = parts[0]
    answer_part = parts[1]

    # Extract question text (after the **L##.#** marker)
    q_match = re.search(r'\*\*[A-Z]\d+\.\d+\*\*\s*\*(.+?)\*', question_part)
    if q_match:
        question = q_match.group(1)
    else:
        # Try alternate format
        q_match = re.search(r'\*\*[A-Z]+\.\d+\*\*\s*\*(.+?)\*', question_part)
        if q_match:
            question = q_match.group(1)
        else:
            return None

    answer = clean_text_for_speech(answer_part)
    question = clean_text_for_speech(question)

    return {
        'question': question,
        'answer': answer,
        'file': filepath.name
    }

def audio_exists(text, voice_name):
    """Check if audio already exists"""
    cache_key = get_cache_key(text, voice_name)
    voice_dir = CACHE_DIR / voice_name.replace(' ', '_')
    filepath = voice_dir / f"{cache_key}.wav"
    return filepath.exists()

def generate_audio_cox(text, output_path):
    """Generate audio using Cox TTS"""
    try:
        result = subprocess.run(
            [str(Path.home() / "cox_tts" / "cox-speak-wrapper"), text, str(output_path)],
            capture_output=True,
            text=True,
            timeout=120
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

def save_audio_path(text, voice_name):
    """Get the path where audio should be saved"""
    cache_key = get_cache_key(text, voice_name)
    voice_dir = CACHE_DIR / voice_name.replace(' ', '_')
    voice_dir.mkdir(parents=True, exist_ok=True)
    return voice_dir / f"{cache_key}.wav"

def update_index(voice_name):
    """Update the audio cache index"""
    voice_dir = CACHE_DIR / voice_name.replace(' ', '_')
    index_path = CACHE_DIR / "index.json"

    # Load existing index or create new
    if index_path.exists():
        with open(index_path, 'r') as f:
            index = json.load(f)
    else:
        index = {"voices": {}}

    # Update voice entry
    if voice_name not in index["voices"]:
        index["voices"][voice_name] = {"files": []}

    # List all files for this voice
    if voice_dir.exists():
        files = [f.name for f in voice_dir.glob("*.wav")]
        index["voices"][voice_name]["files"] = files
        index["voices"][voice_name]["count"] = len(files)

    with open(index_path, 'w') as f:
        json.dump(index, f, indent=2)

def main():
    print("=" * 70)
    print("Cox Voice Audio Generator for SE Final Flashcards")
    print("=" * 70)
    print()

    # Find all card files
    card_files = list(SE_FINAL_DIR.rglob("*.md"))
    print(f"Found {len(card_files)} flashcard files in {SE_FINAL_DIR}/")
    print()

    # Parse all cards
    all_texts = []
    for card_file in sorted(card_files):
        card = parse_card_file(card_file)
        if card:
            all_texts.append({
                'text': card['question'],
                'type': 'question',
                'file': card['file']
            })
            all_texts.append({
                'text': card['answer'],
                'type': 'answer',
                'file': card['file']
            })

    print(f"Parsed {len(all_texts)} text segments (questions + answers)")
    print()

    # Check which need generation
    to_generate = []
    cached = 0
    for item in all_texts:
        if audio_exists(item['text'], COX_VOICE_NAME):
            cached += 1
        else:
            to_generate.append(item)

    print(f"Already cached: {cached}")
    print(f"To generate: {len(to_generate)}")
    print()

    if not to_generate:
        print("All audio already cached!")
        return

    # Estimate time
    est_time = len(to_generate) * 5  # ~5 seconds per clip
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
        preview = item['text'][:60] + "..." if len(item['text']) > 60 else item['text']
        print(f"[{i+1}/{len(to_generate)}] {item['type'].upper()}: {preview}")

        output_path = save_audio_path(item['text'], COX_VOICE_NAME)
        print(f"  → Generating with Cox voice...", end=" ", flush=True)

        if generate_audio_cox(item['text'], output_path):
            size = output_path.stat().st_size
            print(f"✓ ({size:,} bytes)")
            generated += 1
        else:
            print()
            failed += 1

    print()
    print("=" * 70)
    print()

    # Update index
    update_index(COX_VOICE_NAME)
    print(f"✓ Updated index: {CACHE_DIR}/index.json")
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
    voice_dir = CACHE_DIR / COX_VOICE_NAME
    if voice_dir.exists():
        total_size = sum(f.stat().st_size for f in voice_dir.glob("*.wav"))
        print(f"Voice cache size: {total_size / 1024 / 1024:.1f} MB")

    print(f"Location: {CACHE_DIR.absolute()}")
    print()
    print("✓ Generation complete!")

if __name__ == "__main__":
    main()
