"""
Wizard of Oz Rehearsal Planner — State Management

Handles JSON file persistence for section statuses, cast data, and rehearsal notes.
All data files live in the data/ subdirectory.
"""

import json
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"

STATE_FILE = DATA_DIR / "oz_state.json"
CAST_FILE = DATA_DIR / "cast_state.json"
NOTES_FILE = DATA_DIR / "oz_notes.json"


def _ensure_data_dir():
    DATA_DIR.mkdir(exist_ok=True)


def load_json_file(path, default):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return default
    return default


def save_json_file(path, data):
    _ensure_data_dir()
    path.write_text(json.dumps(data, indent=2))


# --- Section status ---

def load_state():
    return load_json_file(STATE_FILE, {})


def save_state(state):
    save_json_file(STATE_FILE, state)


def get_status(section_id, state):
    return state.get(section_id, "todo")


# --- Rehearsal notes ---

def load_notes():
    return load_json_file(NOTES_FILE, {})


def save_notes(notes):
    save_json_file(NOTES_FILE, notes)


# --- Cast data ---

def load_cast():
    """Return dict with keys: cast (char->actor), actors (actor->meta)."""
    raw = load_json_file(CAST_FILE, {})
    # Backward compatibility: if it's just char->actor dict
    if raw and "cast" not in raw and "actors" not in raw:
        return {"cast": raw, "actors": {}}
    if "cast" not in raw:
        raw["cast"] = {}
    if "actors" not in raw:
        raw["actors"] = {}
    return raw


def save_cast(cast_data):
    save_json_file(CAST_FILE, cast_data)


def normalize_name(name):
    return name.strip()
