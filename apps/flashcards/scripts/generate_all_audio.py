#!/usr/bin/env python3
"""
Generate audio for ALL flashcards using British female voice (Gracie Wise)
Handles math notation conversion to speakable text
"""

import os
import sys
import hashlib
import re
from pathlib import Path
from TTS.api import TTS

# Configuration
SPEAKER_NAME = "Gracie Wise"  # British female voice
CACHE_DIR = Path(__file__).parent / "audio_cache_british"
CACHE_DIR.mkdir(exist_ok=True)

print("Loading XTTS-v2 model...")
try:
    tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)
    print("✓ Model loaded successfully\n")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    sys.exit(1)

def convert_math_to_speech(text):
    """Convert mathematical notation to speakable text"""
    # Common LaTeX patterns
    replacements = [
        # Greek letters
        (r'\\alpha', 'alpha'),
        (r'\\beta', 'beta'),
        (r'\\gamma', 'gamma'),
        (r'\\delta', 'delta'),
        (r'\\epsilon', 'epsilon'),
        (r'\\theta', 'theta'),
        (r'\\lambda', 'lambda'),
        (r'\\mu', 'mu'),
        (r'\\sigma', 'sigma'),
        (r'\\Sigma', 'Sigma'),
        (r'\\pi', 'pi'),

        # Math operators
        (r'\\times', 'times'),
        (r'\\cdot', 'times'),
        (r'\\div', 'divided by'),
        (r'\\pm', 'plus or minus'),
        (r'\\leq', 'less than or equal to'),
        (r'\\geq', 'greater than or equal to'),
        (r'\\neq', 'not equal to'),
        (r'\\approx', 'approximately equal to'),
        (r'\\sum', 'sum'),
        (r'\\prod', 'product'),
        (r'\\int', 'integral'),
        (r'\\infty', 'infinity'),
        (r'\\partial', 'partial'),

        # Common fractions
        (r'\\frac\{([^}]+)\}\{([^}]+)\}', r'\1 over \2'),

        # Superscripts (powers)
        (r'\^2', ' squared'),
        (r'\^3', ' cubed'),
        (r'\^(\d+)', r' to the power of \1'),
        (r'\^\{([^}]+)\}', r' to the power of \1'),

        # Subscripts
        (r'_\{([^}]+)\}', r' sub \1'),
        (r'_(\w)', r' sub \1'),

        # Square roots
        (r'\\sqrt\{([^}]+)\}', r'square root of \1'),
        (r'\\sqrt', 'square root'),

        # Remove remaining LaTeX commands and curly braces
        (r'\\[a-zA-Z]+', ''),
        (r'[{}]', ''),
        (r'\$', ''),
    ]

    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)

    return text

def clean_text(text):
    """Clean text for TTS (remove markdown, convert math, extra formatting)"""
    # Convert math notation first
    text = convert_math_to_speech(text)

    # Replace common abbreviations
    text = text.replace(' ML ', ' Machine Learning ')
    text = text.replace(' AI ', ' Artificial Intelligence ')
    text = text.replace(' NN ', ' Neural Network ')
    text = text.replace(' CNN ', ' Convolutional Neural Network ')
    text = text.replace(' RNN ', ' Recurrent Neural Network ')
    text = text.replace(' MSE ', ' Mean Squared Error ')
    text = text.replace(' MAE ', ' Mean Absolute Error ')

    # Remove markdown bold/italic
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)

    # Remove card IDs like "1.1" or "Q1.1" at start
    text = re.sub(r'^\s*[QR]?\d+\.\d+\s*', '', text)

    # Clean up whitespace
    text = ' '.join(text.split())

    return text.strip()

def parse_flashcard_file(filepath):
    """Parse flashcard markdown file and extract all text"""
    cards = []

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    sections = content.split('#flashcards')

    for section in sections[1:]:
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

    return cards

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

def get_cache_path(text):
    """Get cache file path for text - matches app.js format"""
    # Match app.js format: text|voiceName
    combined = f"{text}|{SPEAKER_NAME}"
    text_hash = hashlib.md5(combined.encode()).hexdigest()

    # Create voice-specific subdirectory
    safe_voice_name = SPEAKER_NAME.replace(' ', '_')
    voice_dir = CACHE_DIR / safe_voice_name
    voice_dir.mkdir(exist_ok=True)

    return voice_dir / f"{text_hash}.wav"

def main():
    """Generate all flashcard audio"""
    print("="*70)
    print(f"GENERATING ALL FLASHCARD AUDIO - British English ('{SPEAKER_NAME}')")
    print("="*70 + "\n")

    flashcard_files = [
        ("ml_midterm_cards.md", "Flashcards"),
        ("ml_midterm_quiz.md", "Quiz Questions"),
        ("ml_midterm_review.md", "Review Cards")
    ]

    total_cards = 0
    total_audio_files = 0
    generated = 0
    cached = 0

    for filename, description in flashcard_files:
        filepath = Path(__file__).parent / filename
        if not filepath.exists():
            print(f"⚠️  File not found: {filename}")
            continue

        print(f"📄 {description}: {filename}")
        cards = parse_flashcard_file(filepath)
        print(f"   Found {len(cards)} cards\n")

        for i, card in enumerate(cards, 1):
            total_cards += 1

            # Generate question audio
            q_path = get_cache_path(card['question'])
            if not q_path.exists():
                print(f"   [{i:3d}/{len(cards)}] Q: {card['question'][:60]}...")
                if generate_audio(card['question'], q_path):
                    generated += 1
                    total_audio_files += 1
                    print(f"               ✓ Generated ({q_path.stat().st_size:,} bytes)")
            else:
                cached += 1
                total_audio_files += 1

            # Generate answer audio
            a_path = get_cache_path(card['answer'])
            if not a_path.exists():
                print(f"               A: {card['answer'][:60]}...")
                if generate_audio(card['answer'], a_path):
                    generated += 1
                    total_audio_files += 1
                    print(f"               ✓ Generated ({a_path.stat().st_size:,} bytes)")
            else:
                cached += 1
                total_audio_files += 1

        print()

    print("="*70)
    print("GENERATION COMPLETE")
    print("="*70)
    print(f"Total cards processed:    {total_cards}")
    print(f"Total audio files:        {total_audio_files}")
    print(f"Newly generated:          {generated}")
    print(f"Already cached:           {cached}")
    print(f"Cache directory:          {CACHE_DIR}")
    print(f"Total cache size:         {sum(f.stat().st_size for f in CACHE_DIR.glob('*.wav')):,} bytes")
    print()

    # Create index file
    index_file = CACHE_DIR / "index.json"
    import json
    index = {
        "speaker": SPEAKER_NAME,
        "total_files": total_audio_files,
        "generated": generated,
        "cached": cached
    }
    with open(index_file, 'w') as f:
        json.dump(index, f, indent=2)

    print(f"✓ Index saved to: {index_file}")

if __name__ == '__main__':
    main()
