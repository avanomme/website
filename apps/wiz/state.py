"""
Wizard of Oz Rehearsal Planner — State Management

Supports two storage backends:
  1. KV (Redis) — used on Vercel, configured via configure_kv()
  2. Filesystem — local development fallback (JSON files in data/)
"""

import json
from pathlib import Path

# ---- Filesystem backend (local dev) ----

DATA_DIR = Path(__file__).parent / "data"

STATE_FILE = DATA_DIR / "oz_state.json"
CAST_FILE = DATA_DIR / "cast_state.json"
NOTES_FILE = DATA_DIR / "oz_notes.json"
LOG_FILE = DATA_DIR / "rehearsal_log.json"


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


# ---- KV backend (Redis on Vercel) ----

_kv_get = None
_kv_set = None

# Redis key prefix
_STATE_KEY = "wiz:state"
_CAST_KEY = "wiz:cast"
_NOTES_KEY = "wiz:notes"
_LOG_KEY = "wiz:rehearsal_log"


def configure_kv(kv_get_fn, kv_set_fn):
    """Configure KV storage backend. Called by the parent Flask app."""
    global _kv_get, _kv_set
    _kv_get = kv_get_fn
    _kv_set = kv_set_fn


# ---- Public API (unchanged signatures) ----

def load_state():
    if _kv_get:
        return _kv_get(_STATE_KEY) or {}
    return load_json_file(STATE_FILE, {})


def save_state(state):
    if _kv_set:
        _kv_set(_STATE_KEY, state)
    else:
        save_json_file(STATE_FILE, state)


def get_status(section_id, state):
    return state.get(section_id, "todo")


def load_notes():
    if _kv_get:
        return _kv_get(_NOTES_KEY) or {}
    return load_json_file(NOTES_FILE, {})


def save_notes(notes):
    if _kv_set:
        _kv_set(_NOTES_KEY, notes)
    else:
        save_json_file(NOTES_FILE, notes)


def load_cast():
    """Return dict with keys: cast (char->actor), actors (actor->meta)."""
    if _kv_get:
        raw = _kv_get(_CAST_KEY) or {}
    else:
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
    if _kv_set:
        _kv_set(_CAST_KEY, cast_data)
    else:
        save_json_file(CAST_FILE, cast_data)


def load_rehearsal_log():
    if _kv_get:
        return _kv_get(_LOG_KEY) or []
    return load_json_file(LOG_FILE, [])


def save_rehearsal_log(entries):
    if _kv_set:
        _kv_set(_LOG_KEY, entries)
    else:
        save_json_file(LOG_FILE, entries)


def normalize_name(name):
    return name.strip()
