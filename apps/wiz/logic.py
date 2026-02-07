"""
Wizard of Oz Rehearsal Planner — Core Logic

Matching logic for available/missing characters, audition filtering,
and song grouping.
"""

from sections import SECTIONS
from state import normalize_name


def sections_with_available(available_names):
    """Given available characters, return (full_matches, partial_matches)."""
    available = {normalize_name(c) for c in available_names}
    full = []
    partial = []
    for sec in SECTIONS:
        required = {normalize_name(c) for c in sec["characters"]}
        if required and required.issubset(available):
            full.append(sec)
        elif required & available:
            partial.append(sec)
    return full, partial


def sections_safe_without(missing_names):
    """Given missing characters, return (safe_sections, blocked_sections)."""
    missing = {normalize_name(c) for c in missing_names}
    safe = []
    blocked = []
    for sec in SECTIONS:
        required = {normalize_name(c) for c in sec["characters"]}
        if required & missing:
            blocked.append(sec)
        else:
            safe.append(sec)
    return safe, blocked


def sections_for_role(role_name):
    """Return all sections where a specific character/role appears."""
    role_name = normalize_name(role_name)
    return [
        s for s in SECTIONS
        if role_name in [normalize_name(c) for c in s["characters"]]
    ]


def similar_sections_by_harmony(harmony, exclude_ids=None):
    """Return sections matching a harmony role, excluding given IDs. Sorted by priority."""
    if not harmony or harmony == "any":
        return []
    exclude_ids = exclude_ids or set()
    res = []
    for s in SECTIONS:
        if s["id"] in exclude_ids:
            continue
        if s.get("vocal_type") in ("small_group", "ensemble", "solo") and s.get("harmony_role") == harmony:
            res.append(s)
    res.sort(key=lambda x: x.get("audition_priority", 1), reverse=True)
    return res


def build_song_map():
    """Group sections by song. Returns list of dicts with song name, sections, and characters."""
    songs = {}
    for sec in SECTIONS:
        key = sec["song"]
        if key not in songs:
            songs[key] = {"song": key, "sections": [], "characters": set()}
        songs[key]["sections"].append(sec)
        for c in sec["characters"]:
            songs[key]["characters"].add(c)
    for s in songs.values():
        s["characters"] = sorted(s["characters"])
    return [songs[k] for k in sorted(songs.keys())]
