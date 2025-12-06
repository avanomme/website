#!/Users/adam/uv-envs/tts/bin/python3
"""
Generate Cox voice audio files for SE Final Lydia flashcards.
Loads model ONCE and processes all cards in batch for speed.
"""

import sys
import os
from pathlib import Path
import re
import warnings
import logging

# Suppress warnings
warnings.filterwarnings("ignore")
os.environ['TRANSFORMERS_NO_ADVISORY_WARNINGS'] = '1'
os.environ['TRANSFORMERS_VERBOSITY'] = 'error'
logging.getLogger("transformers").setLevel(logging.ERROR)
logging.getLogger("TTS").setLevel(logging.ERROR)

from tqdm import tqdm

# Config
INPUT_FILE = Path("se_final_lydia.md")
CACHE_DIR = Path("audio_cache/cox_voice/SE_Final_Lydia_Audio")

# Cox TTS paths
MODEL_DIR = Path.home() / "cox_tts"
CHECKPOINT = MODEL_DIR / "model.pth"
CONFIG = MODEL_DIR / "config.json"
VOCAB = MODEL_DIR / "vocab.json"
SPEAKER_REF = list((MODEL_DIR / "dataset/xtts_ft/dataset/wavs").glob("*.wav"))[0]

# XTTS max chars ~250, use 200 to be safe
MAX_CHUNK_SIZE = 200

# Global model - loaded once
_model = None
_gpt_cond_latent = None
_speaker_embedding = None
_device = None

def load_model():
    """Load the Cox TTS model (only once)"""
    global _model, _gpt_cond_latent, _speaker_embedding, _device

    if _model is not None:
        return

    print("Loading Cox custom voice model...")

    from TTS.tts.configs.xtts_config import XttsConfig
    from TTS.tts.models.xtts import Xtts
    import torch

    config = XttsConfig()
    config.load_json(str(CONFIG))

    import contextlib
    import io

    with contextlib.redirect_stderr(io.StringIO()):
        _model = Xtts.init_from_config(config)
        _model.load_checkpoint(
            config,
            checkpoint_path=str(CHECKPOINT),
            checkpoint_dir=str(MODEL_DIR),
            vocab_path=str(VOCAB),
            use_deepspeed=False
        )

    # Use Apple Silicon GPU (MPS) if available
    if torch.backends.mps.is_available():
        _device = "mps"
    elif torch.cuda.is_available():
        _device = "cuda"
    else:
        _device = "cpu"

    print(f"Using device: {_device}")
    _model = _model.to(_device)

    # Load speaker conditioning
    _gpt_cond_latent, _speaker_embedding = _model.get_conditioning_latents(
        audio_path=[str(SPEAKER_REF)]
    )

    print("Model loaded!")

def generate_speech_segment(text):
    """Generate speech for a single text segment"""
    import torch
    import contextlib
    import io

    with contextlib.redirect_stderr(io.StringIO()):
        out = _model.inference(
            text,
            "en",
            _gpt_cond_latent,
            _speaker_embedding,
            temperature=0.7,
            repetition_penalty=5.0,
        )

    return torch.tensor(out["wav"]).unsqueeze(0)

def split_text_into_chunks(text, max_size=MAX_CHUNK_SIZE):
    """Split text into chunks at sentence boundaries."""
    if len(text) <= max_size:
        return [text]

    chunks = []
    current_chunk = ""

    # Split by sentences
    sentences = re.split(r'(?<=[.!?\n])\s+', text)

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        if len(sentence) > max_size:
            # Split long sentences by comma
            parts = re.split(r'(?<=,)\s+', sentence)
            for part in parts:
                part = part.strip()
                if not part:
                    continue
                if len(part) > max_size:
                    # Force split
                    for i in range(0, len(part), max_size - 10):
                        chunk = part[i:i + max_size - 10]
                        if chunk:
                            chunks.append(chunk)
                elif len(current_chunk) + len(part) + 1 <= max_size:
                    current_chunk = (current_chunk + " " + part).strip()
                else:
                    if current_chunk:
                        chunks.append(current_chunk)
                    current_chunk = part
        elif len(current_chunk) + len(sentence) + 1 <= max_size:
            current_chunk = (current_chunk + " " + sentence).strip()
        else:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = sentence

    if current_chunk:
        chunks.append(current_chunk)

    return chunks

def generate_audio(text, output_path):
    """Generate audio, chunking if needed and concatenating"""
    import torch
    import torchaudio

    chunks = split_text_into_chunks(text)

    if len(chunks) == 1:
        audio = generate_speech_segment(chunks[0])
        torchaudio.save(str(output_path), audio, 24000)
        return True, None

    # Multiple chunks - generate and concatenate
    audio_segments = []
    for i, chunk in enumerate(chunks):
        try:
            audio = generate_speech_segment(chunk)
            audio_segments.append(audio)
        except Exception as e:
            return False, f"Chunk {i+1}/{len(chunks)} failed: {e}"

    # Concatenate
    combined = torch.cat(audio_segments, dim=1)
    torchaudio.save(str(output_path), combined, 24000)
    return True, None

def parse_cards(filepath):
    """Parse all cards from markdown file."""
    with open(filepath, 'r') as f:
        content = f.read()

    cards = []
    pattern = r'\*\*([A-Z0-9.]+)\*\*\s*\*(.*?)\*\s*\?\s*(.*?)(?=\n#flashcards|\n\*\*[A-Z0-9]+\.|\Z)'

    for match in re.finditer(pattern, content, re.DOTALL):
        card_id = match.group(1)
        question = match.group(2).strip()
        answer = match.group(3).strip()

        # Strip L prefix: L11.1 -> 11.1
        file_id = card_id[1:] if card_id.startswith('L') else card_id

        # Clean markdown
        clean_answer = answer
        clean_answer = re.sub(r'\*\*([^*]+)\*\*', r'\1', clean_answer)
        clean_answer = re.sub(r'\*([^*]+)\*', r'\1', clean_answer)
        clean_answer = re.sub(r'^[-•]\s*', '', clean_answer, flags=re.MULTILINE)
        clean_answer = re.sub(r'\n{3,}', '\n\n', clean_answer)

        cards.append({
            'id': file_id,
            'question': question,
            'answer': clean_answer.strip()
        })

    return cards

def main():
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    cards = parse_cards(INPUT_FILE)
    print(f"Found {len(cards)} cards in {INPUT_FILE}")

    # Find missing audio (1Q before 2A for alphabetical sorting)
    missing = []
    for card in cards:
        q_path = CACHE_DIR / f"SE_{card['id']}_Lydia_1Q.wav"
        a_path = CACHE_DIR / f"SE_{card['id']}_Lydia_2A.wav"

        if not q_path.exists():
            missing.append(('1Q', card, q_path))
        if not a_path.exists():
            missing.append(('2A', card, a_path))

    print(f"Missing {len(missing)} audio files")

    if not missing:
        print("All audio files exist!")
        return

    # Load model ONCE before processing
    load_model()

    success = 0
    failed = 0
    failed_items = []

    for type_, card, path in tqdm(missing, desc="Generating", unit="file"):
        text = card['question'] if type_ == '1Q' else card['answer']

        chunks = split_text_into_chunks(text)
        if len(chunks) > 1:
            tqdm.write(f"  {card['id']}_{type_}: {len(text)} chars -> {len(chunks)} chunks")

        try:
            ok, error = generate_audio(text, path)
            if ok:
                success += 1
            else:
                failed += 1
                failed_items.append((card['id'], type_, error))
                tqdm.write(f"FAILED: {card['id']}_{type_} - {error}")
        except Exception as e:
            failed += 1
            failed_items.append((card['id'], type_, str(e)))
            tqdm.write(f"FAILED: {card['id']}_{type_} - {e}")

    print(f"\nComplete! Success: {success}, Failed: {failed}")

    if failed_items:
        print("\n--- Failed Items ---")
        for card_id, type_, error in failed_items:
            print(f"  SE_{card_id}_Lydia_{type_}.wav: {error}")

if __name__ == "__main__":
    main()
