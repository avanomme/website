#!/usr/bin/env python
"""
Precompile flash card audio for Sofia Hellen voice only
Quick generation for a single high-quality American female voice
"""
import requests
import hashlib
import time
from pathlib import Path
import re

# Configuration
COQUI_SERVER_URL = "http://localhost:5050"
VOICE_NAME = "Sofia Hellen"
CARDS_FILE = "cards.md"
CACHE_DIR = Path("audio_cache")

def get_cache_key(text, voice_name):
    """Generate cache key from text and voice"""
    combined = f"{text}|{voice_name}"
    return hashlib.md5(combined.encode()).hexdigest()

def parse_cards_md():
    """Parse cards.md to extract all text that needs TTS"""
    if not Path(CARDS_FILE).exists():
        print(f"Error: {CARDS_FILE} not found")
        return []

    with open(CARDS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    texts = []
    lines = content.split('\n')

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
                    texts.append(q_text)
                if a_text:
                    texts.append(a_text)
                question_buffer = []
                answer_buffer = []

            mode = 'idle'
            continue

        if trimmed.startswith('#flashcards'):
            if question_buffer:
                q_text = ' '.join(question_buffer).strip()
                a_text = ' '.join(answer_buffer).strip()
                if q_text:
                    texts.append(q_text)
                if a_text:
                    texts.append(a_text)
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
            texts.append(q_text)
        if a_text:
            texts.append(a_text)

    return texts

def clean_text_for_speech(text):
    """Clean markdown formatting for TTS"""
    text = re.sub(r'\*\*\*(.+?)\*\*\*', r'\1', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'`(.+?)`', r'\1', text)
    text = re.sub(r'~~(.+?)~~', r'\1', text)
    text = re.sub(r'[#>*`]', ' ', text)
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def check_server():
    """Check if Coqui server is running"""
    try:
        response = requests.get(f"{COQUI_SERVER_URL}/api/health", timeout=5)
        if response.status_code == 200:
            return True
    except Exception:
        pass
    return False

def generate_audio(text):
    """Generate audio from Coqui TTS server"""
    try:
        response = requests.post(
            f"{COQUI_SERVER_URL}/api/speak",
            json={"text": text, "speaker": VOICE_NAME},
            timeout=60
        )

        if response.status_code == 200:
            return response.content
        else:
            print(f"  ✗ Error {response.status_code}")
            return None
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None

def save_audio(audio_data, text):
    """Save audio to cache"""
    cache_key = get_cache_key(text, VOICE_NAME)
    voice_dir = CACHE_DIR / VOICE_NAME.replace(' ', '_')
    voice_dir.mkdir(parents=True, exist_ok=True)

    filepath = voice_dir / f"{cache_key}.wav"
    with open(filepath, 'wb') as f:
        f.write(audio_data)

    return filepath

def audio_exists(text):
    """Check if audio already exists"""
    cache_key = get_cache_key(text, VOICE_NAME)
    voice_dir = CACHE_DIR / VOICE_NAME.replace(' ', '_')
    filepath = voice_dir / f"{cache_key}.wav"
    return filepath.exists()

def main():
    print("=" * 70)
    print(f"Flash Cards Audio Generator - {VOICE_NAME}")
    print("=" * 70)

    # Check server
    print(f"\n[1/4] Checking Coqui TTS server...")
    if not check_server():
        print("✗ Error: Coqui TTS server not available")
        print("Please start the server first:")
        print("  ./start_tts.sh")
        return

    print("✓ Coqui server is running")

    # Parse cards
    print(f"\n[2/4] Parsing {CARDS_FILE}...")
    texts = parse_cards_md()
    if not texts:
        print("Error: No text found in cards.md")
        return

    # Clean and deduplicate
    speech_texts = []
    seen = set()
    for text in texts:
        cleaned = clean_text_for_speech(text)
        if cleaned and cleaned not in seen:
            speech_texts.append(cleaned)
            seen.add(cleaned)

    print(f"✓ Found {len(speech_texts)} unique text segments")

    # Check existing
    existing_count = sum(1 for text in speech_texts if audio_exists(text))
    to_generate = len(speech_texts) - existing_count

    print(f"\n[3/4] Audio generation plan:")
    print(f"  Voice: {VOICE_NAME} (female, American)")
    print(f"  Total texts: {len(speech_texts)}")
    print(f"  Already cached: {existing_count}")
    print(f"  To generate: {to_generate}")

    if to_generate == 0:
        print("\n✓ All audio already generated!")
        cache_dir = CACHE_DIR / VOICE_NAME.replace(' ', '_')
        print(f"Cache location: {cache_dir.absolute()}")
        return

    # Confirm
    print(f"\nThis will take approximately {to_generate * 2} seconds (~{to_generate * 2 / 60:.1f} minutes)")
    response = input("\nProceed? [y/N]: ")
    if response.lower() != 'y':
        print("Cancelled.")
        return

    # Generate
    print(f"\n[4/4] Generating audio...")
    print("=" * 70)

    generated = 0
    skipped = 0
    failed = 0

    for i, text in enumerate(speech_texts, 1):
        if audio_exists(text):
            skipped += 1
            continue

        print(f"[{i}/{len(speech_texts)}] {text[:60]}...", end=' ', flush=True)

        audio_data = generate_audio(text)
        if audio_data:
            save_audio(audio_data, text)
            print(f"✓ ({len(audio_data)} bytes)")
            generated += 1
        else:
            print("✗ Failed")
            failed += 1

        time.sleep(0.5)  # Rate limiting

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Voice:      {VOICE_NAME}")
    print(f"Generated:  {generated}")
    print(f"Skipped:    {skipped}")
    print(f"Failed:     {failed}")
    print(f"Total:      {generated + skipped}")

    cache_dir = CACHE_DIR / VOICE_NAME.replace(' ', '_')
    total_files = len(list(cache_dir.glob("*.wav")))
    total_size = sum(f.stat().st_size for f in cache_dir.glob("*.wav")) / 1024 / 1024

    print(f"\nCache stats:")
    print(f"  Files:    {total_files}")
    print(f"  Size:     {total_size:.1f} MB")
    print(f"  Location: {cache_dir.absolute()}")

    print("\n✓ Generation complete!")
    print(f"\nNow open index.html and select '{VOICE_NAME}' for instant playback!")

if __name__ == "__main__":
    main()
