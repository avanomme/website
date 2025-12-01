#!/usr/bin/env python3
"""
Generate Cox TTS audio for flashcard files
Uses the custom Cox voice model via cox-speak
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

def audio_exists(text, voice_name):
    """Check if audio already exists"""
    cache_key = get_cache_key(text, voice_name)
    voice_dir = CACHE_DIR / voice_name.replace(' ', '_')
    filepath = voice_dir / f"{cache_key}.wav"
    return filepath.exists()

def split_long_text(text, max_length=300):
    """Split long text into smaller chunks at sentence/phrase boundaries"""
    if len(text) <= max_length:
        return [text]

    # First try splitting by sentences (., !, ?)
    sentences = re.split(r'([.!?]+\s+)', text)

    chunks = []
    current_chunk = []
    current_length = 0

    for i in range(0, len(sentences), 2):
        sentence = sentences[i]
        separator = sentences[i + 1] if i + 1 < len(sentences) else ''
        full_sentence = sentence + separator

        # If a single sentence is too long, split it by clauses/phrases
        if len(full_sentence) > max_length:
            # Split by commas, hyphens, or other natural breaks
            sub_parts = re.split(r'([,;:\-]\s+)', full_sentence)
            for j in range(0, len(sub_parts), 2):
                part = sub_parts[j]
                sub_sep = sub_parts[j + 1] if j + 1 < len(sub_parts) else ''
                full_part = part + sub_sep

                if current_length + len(full_part) > max_length and current_chunk:
                    chunks.append(''.join(current_chunk).strip())
                    current_chunk = [full_part]
                    current_length = len(full_part)
                else:
                    current_chunk.append(full_part)
                    current_length += len(full_part)
        else:
            if current_length + len(full_sentence) > max_length and current_chunk:
                # Save current chunk and start new one
                chunks.append(''.join(current_chunk).strip())
                current_chunk = [full_sentence]
                current_length = len(full_sentence)
            else:
                current_chunk.append(full_sentence)
                current_length += len(full_sentence)

    # Add remaining chunk
    if current_chunk:
        chunks.append(''.join(current_chunk).strip())

    return chunks

def generate_audio_cox(text, output_path):
    """Generate audio using Cox TTS, with automatic text chunking for long segments"""
    # Check if text is too long and needs splitting
    if len(text) > 300:
        print(f"  (Text is {len(text)} chars, splitting into chunks...)")
        chunks = split_long_text(text, max_length=300)
        print(f"  (Split into {len(chunks)} chunks)")

        # Generate audio for each chunk
        temp_files = []
        for i, chunk in enumerate(chunks):
            temp_path = output_path.parent / f"{output_path.stem}_chunk{i}.wav"
            try:
                result = subprocess.run(
                    [str(Path.home() / "cox_tts" / "cox-speak-wrapper"), chunk, str(temp_path)],
                    capture_output=True,
                    text=True,
                    timeout=120
                )

                if result.returncode == 0:
                    temp_files.append(temp_path)
                else:
                    print(f"  ✗ Chunk {i+1} failed: {result.stderr[:100]}")
                    # Clean up temp files
                    for tf in temp_files:
                        tf.unlink(missing_ok=True)
                    return False
            except Exception as e:
                print(f"  ✗ Chunk {i+1} error: {e}")
                for tf in temp_files:
                    tf.unlink(missing_ok=True)
                return False

        # Concatenate audio files using ffmpeg or sox if available
        try:
            # Try using ffmpeg first
            concat_list = output_path.parent / f"{output_path.stem}_concat.txt"
            with open(concat_list, 'w') as f:
                for temp_file in temp_files:
                    f.write(f"file '{temp_file}'\n")

            result = subprocess.run(
                ['ffmpeg', '-f', 'concat', '-safe', '0', '-i', str(concat_list), '-c', 'copy', str(output_path)],
                capture_output=True,
                timeout=30
            )

            if result.returncode == 0:
                # Clean up temp files
                for tf in temp_files:
                    tf.unlink(missing_ok=True)
                concat_list.unlink(missing_ok=True)
                return True
            else:
                # Try sox as fallback
                result = subprocess.run(
                    ['sox'] + [str(tf) for tf in temp_files] + [str(output_path)],
                    capture_output=True,
                    timeout=30
                )

                # Clean up temp files
                for tf in temp_files:
                    tf.unlink(missing_ok=True)
                concat_list.unlink(missing_ok=True)

                return result.returncode == 0
        except Exception as e:
            print(f"  ✗ Audio concatenation failed: {e}")
            # If concatenation fails, just keep the first chunk
            if temp_files:
                temp_files[0].rename(output_path)
                for tf in temp_files[1:]:
                    tf.unlink(missing_ok=True)
                return True
            return False

    # Original code for short text
    try:
        # Use cox-speak via the wrapper
        result = subprocess.run(
            [str(Path.home() / "cox_tts" / "cox-speak-wrapper"), text, str(output_path)],
            capture_output=True,
            text=True,
            timeout=120
        )

        if result.returncode == 0:
            return True
        else:
            print(f"  ✗ Error: {result.stderr[:100]}")
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
        print("Usage: python generate_cox_audio.py file1.md file2.md ...")
        print("\nExample:")
        print("  python generate_cox_audio.py ml_midterm_review.md ml_midterm_cards.md")
        sys.exit(1)

    files = sys.argv[1:]

    print("=" * 70)
    print("Cox Voice Audio Generator for Flashcards")
    print("=" * 70)
    print(f"\nFiles to process: {len(files)}")
    for f in files:
        print(f"  • {f}")

    # Create cache directory
    CACHE_DIR.mkdir(exist_ok=True)

    # Parse all files
    print(f"\n[1/4] Parsing markdown files...")
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

    # Check existing
    print(f"\n[2/4] Checking existing audio...")
    existing_count = 0
    for text in speech_texts:
        if audio_exists(text, COX_VOICE_NAME):
            existing_count += 1

    to_generate = len(speech_texts) - existing_count
    print(f"  Already cached: {existing_count}")
    print(f"  To generate: {to_generate}")

    if to_generate == 0:
        print("\n✓ All audio already generated!")
        create_index()
        return

    # Confirm
    print(f"\n[3/4] Generating audio files with Cox voice...")
    print(f"Estimated time: ~{to_generate * 3} seconds (Cox TTS takes ~3s per clip)")

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

        if audio_exists(text, COX_VOICE_NAME):
            print(f"  → Skipped (cached)")
            skipped += 1
            continue

        print(f"  → Generating with Cox voice...", end=' ', flush=True)

        output_path = save_audio_path(text, COX_VOICE_NAME)
        if generate_audio_cox(text, output_path):
            file_size = output_path.stat().st_size
            print(f"✓ ({file_size:,} bytes)")
            generated += 1
        else:
            print("✗ Failed")
            failed += 1

    # Create index
    print("\n" + "=" * 70)
    print(f"\n[4/4] Creating index...")
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
    print("\n✓ Generation complete!")
    print("\nYour flash cards will now play with Cox's voice!")

if __name__ == "__main__":
    main()
