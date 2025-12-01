#!/usr/bin/env python
"""
Precompile audio for ML Midterm flash cards
Generates MP3 audio files using Edge TTS (free, no API key needed)
Run this once to generate all audio files, then playback is instant
"""
import requests
import json
import hashlib
import time
from pathlib import Path
import sys
import re

# Configuration
EDGE_TTS_SERVER_URL = "http://localhost:5052"
CARD_FILES = [
    "ml_midterm_cards.md",
    "ml_midterm_quiz.md",
    "ml_midterm_review.md"
]
CACHE_DIR = Path("audio_cache")

def get_cache_key(text, voice_name):
    """Generate cache key from text and voice"""
    combined = f"{text}|{voice_name}"
    return hashlib.md5(combined.encode()).hexdigest()

def parse_flashcard_file(filepath):
    """Parse flashcard markdown file to extract all text that needs TTS"""
    if not Path(filepath).exists():
        print(f"Warning: {filepath} not found")
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

    # Remove special symbols
    text = re.sub(r'✓', 'correct', text)
    text = re.sub(r'✗', 'incorrect', text)

    # Clean up formatting
    text = re.sub(r'[#>*`]', ' ', text)
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def get_edge_tts_voices():
    """Get voices from Edge TTS server"""
    try:
        response = requests.get(f"{EDGE_TTS_SERVER_URL}/api/voices", timeout=5)
        if response.status_code == 200:
            data = response.json()
            # Return just one good voice for faster generation
            # User can select others in the UI later
            return [v['name'] for v in data['voices'][:1]]  # Just use first voice
    except Exception as e:
        print(f"Error: Edge TTS server not available: {e}")
        print("Please start the Edge TTS server first:")
        print("  cd apps/flashcards")
        print("  python edge_tts_server.py")
    return []

def generate_audio(text, voice_name):
    """Generate audio from Edge TTS server"""
    try:
        response = requests.post(
            f"{EDGE_TTS_SERVER_URL}/api/speak",
            json={"text": text, "voice": voice_name},
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

    # Save as MP3 for better web compatibility and smaller size
    filepath = voice_dir / f"{cache_key}.mp3"
    with open(filepath, 'wb') as f:
        f.write(audio_data)

    return filepath

def audio_exists(text, voice_name):
    """Check if audio already exists"""
    cache_key = get_cache_key(text, voice_name)
    voice_dir = CACHE_DIR / voice_name.replace(' ', '_')

    # Check both MP3 and WAV
    mp3_path = voice_dir / f"{cache_key}.mp3"
    wav_path = voice_dir / f"{cache_key}.wav"

    return mp3_path.exists() or wav_path.exists()

def create_index():
    """Create an index of all cached audio files"""
    index = {}

    for voice_dir in CACHE_DIR.iterdir():
        if voice_dir.is_dir():
            voice_name = voice_dir.name.replace('_', ' ')
            index[voice_name] = {}

            for audio_file in voice_dir.glob("*.mp3"):
                cache_key = audio_file.stem
                index[voice_name][cache_key] = str(audio_file)

            for audio_file in voice_dir.glob("*.wav"):
                cache_key = audio_file.stem
                if cache_key not in index[voice_name]:
                    index[voice_name][cache_key] = str(audio_file)

    index_file = CACHE_DIR / "index.json"
    with open(index_file, 'w') as f:
        json.dump(index, f, indent=2)

    print(f"\n✓ Created index: {index_file}")
    return index

def main():
    print("=" * 70)
    print("ML Midterm Flash Cards Audio Precompiler")
    print("=" * 70)

    # Create cache directory
    CACHE_DIR.mkdir(exist_ok=True)

    # Parse all card files
    print(f"\n[1/5] Parsing flashcard files...")
    all_texts = []
    for card_file in CARD_FILES:
        print(f"  - {card_file}...", end=' ')
        texts = parse_flashcard_file(card_file)
        all_texts.extend(texts)
        print(f"✓ {len(texts)} segments")

    if not all_texts:
        print("Error: No text found in card files")
        return

    # Clean texts for speech
    speech_texts = []
    seen = set()
    for text_type, text in all_texts:
        cleaned = clean_text_for_speech(text)
        if cleaned and cleaned not in seen:
            speech_texts.append(cleaned)
            seen.add(cleaned)

    print(f"✓ Found {len(speech_texts)} unique text segments")

    # Get voices
    print("\n[2/5] Discovering voices...")
    voices = get_edge_tts_voices()

    if not voices:
        print("Error: No TTS server available")
        return

    print(f"✓ Using voice: {voices[0]}")

    # Calculate total
    total_combinations = len(speech_texts) * len(voices)
    print(f"\n[3/5] Will generate {total_combinations} audio files")
    print(f"  ({len(speech_texts)} texts × {len(voices)} voice)")

    # Check existing
    existing_count = 0
    for text in speech_texts:
        for voice_name in voices:
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
    print(f"This will take approximately {to_generate * 2} seconds")

    # Check for --yes flag or auto-confirm
    if len(sys.argv) > 1 and sys.argv[1] == '--yes':
        print("\nAuto-confirmed with --yes flag")
    else:
        try:
            response = input("\nProceed? [y/N]: ")
            if response.lower() != 'y':
                print("Cancelled.")
                return
        except (EOFError, KeyboardInterrupt):
            print("\nAuto-confirming (non-interactive mode)")
            pass

    # Generate
    print("\n" + "=" * 70)
    generated = 0
    skipped = 0
    failed = 0

    for i, text in enumerate(speech_texts, 1):
        print(f"\n[Text {i}/{len(speech_texts)}] {text[:60]}...")

        for voice_name in voices:
            if audio_exists(text, voice_name):
                skipped += 1
                continue

            print(f"  → {voice_name}...", end=' ', flush=True)

            audio_data = generate_audio(text, voice_name)
            if audio_data:
                filepath = save_audio(audio_data, text, voice_name)
                print(f"✓ ({len(audio_data)} bytes)")
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

    # Calculate cache size
    total_size = sum(f.stat().st_size for f in CACHE_DIR.rglob('*.mp3'))
    total_size += sum(f.stat().st_size for f in CACHE_DIR.rglob('*.wav'))
    print(f"\nCache size: {total_size / 1024 / 1024:.1f} MB")
    print(f"Location:   {CACHE_DIR.absolute()}")
    print("\n✓ Precompilation complete!")
    print("\nNow your ML midterm flash cards will play instantly with zero latency!")

if __name__ == "__main__":
    main()
