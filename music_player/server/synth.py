"""
Stratford Choir AI Vocal Synthesis Backend
FastAPI server for generating AI-sung choral audio from MusicXML files

Dependencies:
- FastAPI for API
- music21 for MusicXML parsing
- TTS (Coqui TTS) or OpenAI TTS for vocal synthesis
- pydub for audio mixing
"""

import os
import logging
from pathlib import Path
from typing import List, Optional
from io import BytesIO

from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import music21
from pydub import AudioSegment

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Stratford Choir AI Synthesis API",
    description="Generate AI vocal synthesis from MusicXML scores",
    version="1.0.0"
)

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SCORES_DIR = Path("scores/final")
CACHE_DIR = Path("server/cache")
CACHE_DIR.mkdir(exist_ok=True)

# Try to import TTS library (Coqui TTS)
try:
    from TTS.api import TTS
    TTS_AVAILABLE = True
    logger.info("Coqui TTS library loaded successfully")

    # Initialize TTS model (using a lightweight model for demo)
    # For production, use a better quality model
    tts_model = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False)
    logger.info("TTS model initialized")
except ImportError:
    TTS_AVAILABLE = False
    logger.warning("Coqui TTS not available. Install with: pip install TTS")
    tts_model = None
except Exception as e:
    TTS_AVAILABLE = False
    logger.error(f"Failed to initialize TTS: {e}")
    tts_model = None


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Stratford Choir AI Synthesis API",
        "tts_available": TTS_AVAILABLE
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "tts_available": TTS_AVAILABLE,
        "scores_dir": str(SCORES_DIR),
        "scores_dir_exists": SCORES_DIR.exists()
    }


@app.get("/synthesize")
async def synthesize_score(
    score: str = Query(..., description="Filename of the MusicXML score"),
    parts: str = Query("Soprano,Alto,Tenor,Bass", description="Comma-separated list of voice parts"),
    tempo: int = Query(100, description="Tempo percentage (50-150)")
):
    """
    Generate AI vocal synthesis for a MusicXML score

    Args:
        score: Filename of the MusicXML score (e.g., "Candlelight Carol.musicxml")
        parts: Comma-separated voice parts (e.g., "Soprano,Alto")
        tempo: Tempo adjustment percentage (50-150)

    Returns:
        Audio file (MP3) with synthesized vocals
    """
    logger.info(f"Synthesis request: score={score}, parts={parts}, tempo={tempo}")

    if not TTS_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="TTS service not available. Please install Coqui TTS: pip install TTS"
        )

    # Validate tempo
    if not 50 <= tempo <= 150:
        raise HTTPException(status_code=400, detail="Tempo must be between 50 and 150")

    # Parse requested parts
    requested_parts = [p.strip() for p in parts.split(",")]
    valid_parts = {"Soprano", "Alto", "Tenor", "Bass"}
    invalid_parts = set(requested_parts) - valid_parts

    if invalid_parts:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid parts: {invalid_parts}. Valid parts: {valid_parts}"
        )

    # Find the score file
    score_path = SCORES_DIR / score
    if not score_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Score not found: {score}. Available scores: {[f.name for f in SCORES_DIR.glob('*.musicxml')]}"
        )

    try:
        # Parse MusicXML
        logger.info(f"Parsing MusicXML: {score_path}")
        parsed_score = parse_musicxml(score_path)

        # Extract parts and lyrics
        logger.info(f"Extracting parts: {requested_parts}")
        parts_data = extract_parts(parsed_score, requested_parts)

        # Synthesize each part
        logger.info("Synthesizing vocal parts...")
        audio_tracks = []
        for part_name, part_info in parts_data.items():
            logger.info(f"Synthesizing {part_name}...")
            audio_track = synthesize_part(part_name, part_info, tempo)
            audio_tracks.append(audio_track)

        # Mix all parts together
        logger.info("Mixing audio tracks...")
        final_audio = mix_audio_tracks(audio_tracks)

        # Convert to MP3 and return
        logger.info("Exporting audio...")
        audio_buffer = BytesIO()
        final_audio.export(audio_buffer, format="mp3", bitrate="192k")
        audio_buffer.seek(0)

        return StreamingResponse(
            audio_buffer,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename={score.replace('.musicxml', '')}_AI_Voice.mp3"
            }
        )

    except Exception as e:
        logger.error(f"Synthesis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {str(e)}")


def parse_musicxml(score_path: Path) -> music21.stream.Score:
    """Parse a MusicXML file using music21"""
    try:
        score = music21.converter.parse(str(score_path))
        return score
    except Exception as e:
        raise ValueError(f"Failed to parse MusicXML: {e}")


def extract_parts(score: music21.stream.Score, requested_parts: List[str]) -> dict:
    """
    Extract voice parts with lyrics from a music21 score

    Returns:
        Dict mapping part name to {notes: [], lyrics: [], durations: []}
    """
    parts_data = {}

    # Get all parts from the score
    for part in score.parts:
        part_name = part.partName or "Unknown"

        # Try to match with requested parts (case-insensitive)
        matched_part = None
        for req_part in requested_parts:
            if req_part.lower() in part_name.lower():
                matched_part = req_part
                break

        if not matched_part:
            continue

        # Extract notes and lyrics
        notes = []
        lyrics = []
        durations = []

        for element in part.flatten().notesAndRests:
            if isinstance(element, music21.note.Note):
                notes.append(element.pitch.nameWithOctave)
                durations.append(element.duration.quarterLength)

                # Extract lyrics
                if element.lyrics:
                    lyric_text = " ".join([lyric.text for lyric in element.lyrics if lyric.text])
                    lyrics.append(lyric_text if lyric_text else "_")
                else:
                    lyrics.append("_")  # Use underscore for notes without lyrics

            elif isinstance(element, music21.note.Rest):
                notes.append("rest")
                lyrics.append("_")
                durations.append(element.duration.quarterLength)

        parts_data[matched_part] = {
            "notes": notes,
            "lyrics": lyrics,
            "durations": durations,
            "key": get_key_signature(part),
            "time_signature": get_time_signature(part)
        }

    if not parts_data:
        raise ValueError(f"No matching parts found. Requested: {requested_parts}, Available: {[p.partName for p in score.parts]}")

    return parts_data


def get_key_signature(part: music21.stream.Part) -> str:
    """Extract key signature from a part"""
    for element in part.flatten():
        if isinstance(element, music21.key.KeySignature):
            return str(element)
        if isinstance(element, music21.key.Key):
            return str(element)
    return "C major"


def get_time_signature(part: music21.stream.Part) -> str:
    """Extract time signature from a part"""
    for element in part.flatten():
        if isinstance(element, music21.meter.TimeSignature):
            return str(element)
    return "4/4"


def synthesize_part(part_name: str, part_info: dict, tempo: int) -> AudioSegment:
    """
    Synthesize a single voice part using TTS

    This is a simplified implementation. For production:
    - Use proper phoneme-to-note alignment
    - Apply pitch shifting to match actual notes
    - Handle tempo more accurately
    """
    notes = part_info["notes"]
    lyrics = part_info["lyrics"]
    durations = part_info["durations"]

    # Combine lyrics into phrases (group by phrases for more natural synthesis)
    full_text = " ".join([lyric for lyric in lyrics if lyric != "_"])

    if not full_text.strip():
        # No lyrics, generate a simple humming sound
        full_text = "la " * len(notes)

    logger.info(f"{part_name} text: {full_text[:100]}...")

    # Generate speech using TTS
    temp_audio = CACHE_DIR / f"temp_{part_name}.wav"

    try:
        tts_model.tts_to_file(
            text=full_text,
            file_path=str(temp_audio)
        )

        # Load the generated audio
        audio = AudioSegment.from_wav(str(temp_audio))

        # Apply tempo adjustment
        tempo_factor = tempo / 100.0
        if tempo_factor != 1.0:
            # Change speed without changing pitch
            audio = audio._spawn(
                audio.raw_data,
                overrides={"frame_rate": int(audio.frame_rate * tempo_factor)}
            ).set_frame_rate(audio.frame_rate)

        # Clean up temp file
        temp_audio.unlink(missing_ok=True)

        return audio

    except Exception as e:
        logger.error(f"Failed to synthesize {part_name}: {e}")
        # Return silence if synthesis fails
        return AudioSegment.silent(duration=5000)


def mix_audio_tracks(tracks: List[AudioSegment]) -> AudioSegment:
    """
    Mix multiple audio tracks together

    All tracks are overlaid and mixed at equal volume
    """
    if not tracks:
        return AudioSegment.silent(duration=1000)

    # Start with the first track
    mixed = tracks[0]

    # Overlay remaining tracks
    for track in tracks[1:]:
        # Pad shorter track to match lengths
        if len(track) < len(mixed):
            track = track + AudioSegment.silent(duration=len(mixed) - len(track))
        elif len(track) > len(mixed):
            mixed = mixed + AudioSegment.silent(duration=len(track) - len(mixed))

        # Overlay and reduce volume to prevent clipping
        mixed = mixed.overlay(track)

    # Normalize volume
    mixed = mixed.normalize()

    return mixed


# For development and testing
if __name__ == "__main__":
    import uvicorn

    logger.info("Starting Stratford Choir AI Synthesis Server...")
    logger.info(f"Scores directory: {SCORES_DIR.absolute()}")
    logger.info(f"TTS available: {TTS_AVAILABLE}")

    uvicorn.run(
        "synth:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
