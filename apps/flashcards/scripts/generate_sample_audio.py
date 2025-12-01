#!/usr/bin/env python3
"""
Generate audio for 10 sample flashcards using British female voice (Gracie Wise)
"""

import os
import sys
import hashlib
import re
from pathlib import Path
from TTS.api import TTS

# Configuration
SPEAKER_NAME = "Gracie Wise"  # British female voice
CACHE_DIR = Path(__file__).parent / "audio_samples"
CACHE_DIR.mkdir(exist_ok=True)

print("Loading XTTS-v2 model...")
try:
    tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)
    print("✓ Model loaded successfully\n")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    sys.exit(1)

def clean_text(text):
    """Clean text for TTS (remove markdown, extra formatting)"""
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'^\s*[QR]?\d+\.\d+\s*', '', text)
    text = ' '.join(text.split())
    return text.strip()

def parse_flashcard_file(filepath, limit=10):
    """Parse flashcard file and return first N cards"""
    cards = []

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    sections = content.split('#flashcards')

    for section in sections[1:]:
        if len(cards) >= limit:
            break

        lines = section.strip().split('\n')
        question_lines = []
        answer_lines = []
        in_answer = False

        for line in lines:
            stripped = line.strip()

            if stripped == '?':
                in_answer = True
                continue

            if stripped.startswith('#flashcards'):
                break

            if not in_answer:
                if stripped and not stripped.startswith('#'):
                    question_lines.append(stripped)
            else:
                if stripped and not stripped.startswith('#'):
                    answer_lines.append(stripped)

        question = ' '.join(question_lines).strip()
        answer = ' '.join(answer_lines).strip()

        if question and answer:
            question = clean_text(question)
            answer = clean_text(answer)

            if question and answer:
                cards.append({
                    'question': question,
                    'answer': answer
                })

    return cards[:limit]

def generate_audio(text, output_path):
    """Generate audio using Coqui TTS"""
    try:
        tts.tts_to_file(
            text=text,
            speaker=SPEAKER_NAME,
            language="en",
            file_path=str(output_path)
        )
        return True
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

def main():
    """Generate audio for 10 sample cards"""
    print("="*70)
    print(f"GENERATING 10 SAMPLE FLASHCARDS - British English ('{SPEAKER_NAME}')")
    print("="*70 + "\n")

    filepath = Path(__file__).parent / "ml_midterm_cards.md"
    if not filepath.exists():
        print(f"✗ File not found: {filepath}")
        return

    print(f"📄 Loading first 10 cards from: {filepath.name}\n")
    cards = parse_flashcard_file(filepath, limit=10)
    print(f"✓ Loaded {len(cards)} cards\n")

    for i, card in enumerate(cards, 1):
        print(f"[{i}/10] Generating audio...")
        print(f"   Q: {card['question'][:60]}...")

        # Generate question audio
        q_path = CACHE_DIR / f"sample_{i:02d}_question.wav"
        if generate_audio(card['question'], q_path):
            size = q_path.stat().st_size
            print(f"   ✓ Question: {q_path.name} ({size:,} bytes)")

        print(f"   A: {card['answer'][:60]}...")

        # Generate answer audio
        a_path = CACHE_DIR / f"sample_{i:02d}_answer.wav"
        if generate_audio(card['answer'], a_path):
            size = a_path.stat().st_size
            print(f"   ✓ Answer: {a_path.name} ({size:,} bytes)")

        print()

    print("="*70)
    print("SAMPLE GENERATION COMPLETE")
    print("="*70)
    print(f"Audio files saved to: {CACHE_DIR}")
    print(f"\nYou can listen to the samples to review voice quality:")
    for i in range(1, 11):
        print(f"  Card {i}: sample_{i:02d}_question.wav + sample_{i:02d}_answer.wav")

if __name__ == '__main__':
    main()
