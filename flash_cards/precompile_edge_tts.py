#!/usr/bin/env python3
"""
Precompile all flashcard audio using Edge TTS
This speeds up the first-time experience by generating all audio in advance
"""
import asyncio
import hashlib
import re
from pathlib import Path
import edge_tts

# Default voice for precompilation
DEFAULT_VOICE = "en-US-AriaNeural"  # Can change to any voice from edge_tts_server.py

# Cache directory
CACHE_DIR = Path("edge_tts_cache")
CACHE_DIR.mkdir(exist_ok=True)

def parse_cards_md():
    """Parse cards.md and extract all text that needs TTS"""
    cards_file = Path("cards.md")
    if not cards_file.exists():
        print("❌ cards.md not found!")
        return []

    content = cards_file.read_text(encoding='utf-8')
    lines = content.split('\n')

    texts = []
    current_section = None

    for line in lines:
        # Section headers
        if line.startswith('#flashcards/'):
            current_section = line.replace('#flashcards/', '').strip()
            continue

        # Skip empty lines and question markers
        if not line.strip() or line.strip() == '?':
            continue

        # Skip markdown headers
        if line.startswith('#'):
            continue

        # Clean the text
        text = line.strip()

        # Remove markdown formatting
        text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # Bold
        text = re.sub(r'\*([^*]+)\*', r'\1', text)  # Italic
        text = re.sub(r'`([^`]+)`', r'\1', text)  # Code
        text = re.sub(r'<!--.*?-->', '', text)  # HTML comments

        # Skip very short texts or special markers
        if len(text) < 3 or text.startswith('SR:'):
            continue

        # Remove leading list markers
        text = re.sub(r'^[-\*]\s+', '', text)

        if text:
            texts.append(text)

    return texts

def get_cache_key(text, voice):
    """Generate cache key from text and voice"""
    combined = f"{text}|{voice}"
    return hashlib.md5(combined.encode()).hexdigest()

async def generate_speech(text, voice):
    """Generate speech using Edge TTS"""
    communicate = edge_tts.Communicate(text, voice)

    # Collect all audio chunks
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]

    return audio_data

async def precompile_audio(texts, voice):
    """Precompile all texts to audio files"""
    print(f"\n{'='*60}")
    print(f"  Precompiling Edge TTS Audio")
    print(f"{'='*60}\n")
    print(f"Voice: {voice}")
    print(f"Total texts to process: {len(texts)}")
    print(f"Cache directory: {CACHE_DIR.absolute()}\n")

    existing = 0
    generated = 0
    errors = 0

    for i, text in enumerate(texts, 1):
        cache_key = get_cache_key(text, voice)
        cache_file = CACHE_DIR / f"{cache_key}.mp3"

        # Skip if already cached
        if cache_file.exists():
            existing += 1
            print(f"[{i}/{len(texts)}] ✓ Cached: {text[:50]}...")
            continue

        # Generate audio
        try:
            print(f"[{i}/{len(texts)}] 🔊 Generating: {text[:50]}...")
            audio_data = await generate_speech(text, voice)

            # Save to cache
            with open(cache_file, "wb") as f:
                f.write(audio_data)

            generated += 1
            print(f"[{i}/{len(texts)}] ✓ Saved: {cache_file.name}")

        except Exception as e:
            errors += 1
            print(f"[{i}/{len(texts)}] ❌ Error: {e}")

        # Small delay to avoid overwhelming the service
        await asyncio.sleep(0.1)

    print(f"\n{'='*60}")
    print(f"  Precompilation Complete!")
    print(f"{'='*60}\n")
    print(f"✓ Already cached: {existing}")
    print(f"✓ Newly generated: {generated}")
    if errors > 0:
        print(f"❌ Errors: {errors}")
    print(f"\nTotal cache size: {sum(f.stat().st_size for f in CACHE_DIR.glob('*.mp3')) / 1024 / 1024:.2f} MB")
    print(f"Cache location: {CACHE_DIR.absolute()}\n")

async def main():
    """Main function"""
    # Parse cards
    print("📖 Parsing cards.md...")
    texts = parse_cards_md()

    if not texts:
        print("❌ No texts found to precompile!")
        return

    print(f"✓ Found {len(texts)} unique texts\n")

    # Deduplicate texts
    unique_texts = list(set(texts))
    print(f"✓ {len(unique_texts)} unique texts after deduplication\n")

    # Precompile
    await precompile_audio(unique_texts, DEFAULT_VOICE)

if __name__ == '__main__':
    asyncio.run(main())
