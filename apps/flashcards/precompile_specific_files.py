#!/usr/bin/env python
"""
Precompile audio for specific markdown files
Usage: python precompile_specific_files.py file1.md file2.md file3.md
"""
import requests
import json
import hashlib
import time
from pathlib import Path
import sys
import re

# Configuration
COQUI_SERVER_URL = "http://localhost:5050"
MELO_SERVER_URL = "http://localhost:5051"
CACHE_DIR = Path("audio_cache")

def get_cache_key(text, voice_name):
    """Generate cache key from text and voice"""
    combined = f"{text}|{voice_name}"
    return hashlib.md5(combined.encode()).hexdigest()

def parse_markdown_file(filepath):
    """Parse markdown file to extract all text that needs TTS"""
    if not Path(filepath).exists():
        print(f"Error: {filepath} not found")
        return []

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    texts = []
    lines = content.split('\n')

    section = None
    question_buffer = []
    answer_buffer = []
    mode = 'idle'

    for line in lines:
        trimmed = line.strip()

        if not trimmed and mode == 'idle':
            continue

        if trimmed.startswith('<!--'):
            continue

        if trimmed.startswith('#### '):
            # Flush previous card
            if question_buffer:
                q_text = ' '.join(question_buffer).strip()
                a_text = ' '.join(answer_buffer).strip()
                if q_text:
                    texts.append(('question', q_text))
                if a_text:
                    texts.append(('answer', a_text))
                question_buffer = []
                answer_buffer = []

            section = trimmed.replace('####', '').strip()
            mode = 'idle'
            continue

        if trimmed.startswith('#flashcards'):
            if question_buffer:
                q_text = ' '.join(question_buffer).strip()
                a_text = ' '.join(answer_buffer).strip()
                if q_text:
                    texts.append(('question', q_text))
                if a_text:
                    texts.append(('answer', a_text))
                question_buffer = []
                answer_buffer = []
            continue

        if mode == 'question' and trimmed == '?':
            mode = 'answer'
            continue

        if mode == 'answer':
            answer_buffer.append(trimmed)
            continue

        if mode == 'question':
            question_buffer.append(trimmed)
            continue

        if mode == 'idle' and trimmed:
            question_buffer.append(trimmed)
            mode = 'question'
            continue

    # Flush last card
    if question_buffer:
        q_text = ' '.join(question_buffer).strip()
        a_text = ' '.join(answer_buffer).strip()
        if q_text:
            texts.append(('question', q_text))
        if a_text:
            texts.append(('answer', a_text))

    return texts

def clean_text_for_speech(text):
    """Clean markdown formatting for TTS"""
    # Remove markdown formatting
    text = re.sub(r'\*\*\*(.+?)\*\*\*', r'\1', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'`(.+?)`', r'\1', text)
    text = re.sub(r'~~(.+?)~~', r'\1', text)
    text = re.sub(r'[#>*`]', ' ', text)
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def get_coqui_voices():
    """Get voices from Coqui TTS server"""
    try:
        response = requests.get(f"{COQUI_SERVER_URL}/api/voices", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return [('coqui', v['name']) for v in data['voices']]
    except Exception as e:
        print(f"Warning: Coqui server not available: {e}")
    return []

def generate_audio(text, voice_name, provider):
    """Generate audio from TTS server"""
    url = COQUI_SERVER_URL if provider == 'coqui' else MELO_SERVER_URL

    try:
        response = requests.post(
            f"{url}/api/speak",
            json={"text": text, "speaker": voice_name},
            timeout=60
        )

        if response.status_code == 200:
            return response.content
        else:
            print(f"  ✗ Error {response.status_code}: {response.text[:100]}")
            return None
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None

def save_audio(audio_data, text, voice_name):
    """Save audio to organized cache"""
    cache_key = get_cache_key(text, voice_name)
    voice_dir = CACHE_DIR / voice_name.replace(' ', '_')
    voice_dir.mkdir(parents=True, exist_ok=True)

    filepath = voice_dir / f"{cache_key}.wav"
    with open(filepath, 'wb') as f:
        f.write(audio_data)

    return filepath

def audio_exists(text, voice_name):
    """Check if audio already exists"""
    cache_key = get_cache_key(text, voice_name)
    voice_dir = CACHE_DIR / voice_name.replace(' ', '_')
    filepath = voice_dir / f"{cache_key}.wav"
    return filepath.exists()

def create_index():
    """Create an index of all cached audio files"""
    index = {}

    for voice_dir in CACHE_DIR.iterdir():
        if voice_dir.is_dir():
            voice_name = voice_dir.name.replace('_', ' ')
            index[voice_name] = {}

            for audio_file in voice_dir.glob("*.wav"):
                cache_key = audio_file.stem
                index[voice_name][cache_key] = str(audio_file)

    index_file = CACHE_DIR / "index.json"
    with open(index_file, 'w') as f:
        json.dump(index, f, indent=2)

    print(f"\n✓ Created index: {index_file}")
    return index

def main():
    if len(sys.argv) < 2:
        print("Usage: python precompile_specific_files.py file1.md file2.md ...")
        print("\nExample:")
        print("  python precompile_specific_files.py ml_midterm_review.md ml_midterm_cards.md")
        sys.exit(1)

    files = sys.argv[1:]

    print("=" * 70)
    print("Flash Cards Audio Precompiler (Specific Files)")
    print("=" * 70)
    print(f"\nFiles to process: {len(files)}")
    for f in files:
        print(f"  • {f}")

    # Create cache directory
    CACHE_DIR.mkdir(exist_ok=True)

    # Parse all files
    print(f"\n[1/5] Parsing markdown files...")
    all_texts = []
    for filepath in files:
        print(f"  → {filepath}...", end=' ')
        texts = parse_markdown_file(filepath)
        all_texts.extend(texts)
        print(f"✓ {len(texts)} segments")

    if not all_texts:
        print("Error: No text found in any files")
        return

    # Clean texts for speech
    speech_texts = []
    seen = set()
    for text_type, text in all_texts:
        cleaned = clean_text_for_speech(text)
        if cleaned and cleaned not in seen:
            speech_texts.append(cleaned)
            seen.add(cleaned)

    print(f"✓ Found {len(speech_texts)} unique text segments total")

    # Get voices (only Coqui for now)
    print("\n[2/5] Discovering Coqui TTS voices...")
    coqui_voices = get_coqui_voices()

    if not coqui_voices:
        print("Error: Coqui TTS server not available")
        print("Please start the server:")
        print("  cd apps/flashcards")
        print("  ./start_tts.sh")
        return

    print(f"✓ Found {len(coqui_voices)} Coqui voices")

    # Calculate total
    total_combinations = len(speech_texts) * len(coqui_voices)
    print(f"\n[3/5] Will generate {total_combinations} audio files")
    print(f"  ({len(speech_texts)} texts × {len(coqui_voices)} voices)")

    # Check existing
    existing_count = 0
    for text in speech_texts:
        for provider, voice_name in coqui_voices:
            if audio_exists(text, voice_name):
                existing_count += 1

    to_generate = total_combinations - existing_count
    print(f"  Already cached: {existing_count}")
    print(f"  To generate: {to_generate}")

    if to_generate == 0:
        print("\n✓ All audio already generated!")
        create_index()
        return

    # Confirm
    print(f"\n[4/5] Generating audio files...")
    print(f"Estimated time: ~{to_generate * 2} seconds")

    response = input("\nProceed? [y/N]: ")
    if response.lower() != 'y':
        print("Cancelled.")
        return

    # Generate
    print("\n" + "=" * 70)
    generated = 0
    skipped = 0
    failed = 0

    for i, text in enumerate(speech_texts, 1):
        # Show progress
        text_preview = text[:60] + ('...' if len(text) > 60 else '')
        print(f"\n[{i}/{len(speech_texts)}] {text_preview}")

        for provider, voice_name in coqui_voices:
            if audio_exists(text, voice_name):
                skipped += 1
                continue

            print(f"  → {voice_name}...", end=' ', flush=True)

            audio_data = generate_audio(text, voice_name, provider)
            if audio_data:
                filepath = save_audio(audio_data, text, voice_name)
                print(f"✓ ({len(audio_data):,} bytes)")
                generated += 1
            else:
                print("✗ Failed")
                failed += 1

            time.sleep(0.5)  # Rate limiting

    # Create index
    print("\n" + "=" * 70)
    print(f"\n[5/5] Creating index...")
    index = create_index()

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Generated:  {generated}")
    print(f"Skipped:    {skipped}")
    print(f"Failed:     {failed}")
    print(f"Total:      {generated + skipped}")

    cache_size = sum(f.stat().st_size for f in CACHE_DIR.rglob('*.wav')) / 1024 / 1024
    print(f"\nCache size: {cache_size:.1f} MB")
    print(f"Location:   {CACHE_DIR.absolute()}")
    print("\n✓ Precompilation complete!")
    print("\nYour flash cards will now play instantly with zero latency!")

if __name__ == "__main__":
    main()
