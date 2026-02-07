"""
Descendants: The Musical — Core Logic

Matching logic for available/missing characters, vocal breakdown, and song grouping.
"""

from sections import SECTIONS
from state import normalize_name


def sections_with_available(available_names):
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
    role_name = normalize_name(role_name)
    return [
        s for s in SECTIONS
        if role_name in [normalize_name(c) for c in s["characters"]]
    ]


def build_song_map():
    songs = {}
    order = []
    for sec in SECTIONS:
        key = sec["song"]
        if key not in songs:
            songs[key] = {"song": key, "sections": [], "characters": set()}
            order.append(key)
        songs[key]["sections"].append(sec)
        for c in sec["characters"]:
            songs[key]["characters"].add(c)
    for s in songs.values():
        s["characters"] = sorted(s["characters"])
    return [songs[k] for k in order]


def build_vocal_breakdown():
    """Build per-character vocal breakdown from sections data."""
    chars = {}
    for sec in SECTIONS:
        for c in sec["characters"]:
            if c not in chars:
                chars[c] = {
                    "name": c,
                    "songs": [],
                    "song_set": set(),
                    "vocal_types": set(),
                    "harmony_roles": set(),
                    "section_count": 0,
                    "max_priority": 0,
                    "max_difficulty": 0,
                }
            info = chars[c]
            info["section_count"] += 1
            info["vocal_types"].add(sec.get("vocal_type", ""))
            info["harmony_roles"].add(sec.get("harmony_role", ""))
            info["max_priority"] = max(info["max_priority"], sec.get("rehearsal_priority", 0))
            info["max_difficulty"] = max(info["max_difficulty"], sec.get("harmony_difficulty", 0))
            if sec["song"] not in info["song_set"]:
                info["song_set"].add(sec["song"])
                info["songs"].append(sec["song"])

    # Convert sets to sorted lists for template rendering
    result = []
    for info in chars.values():
        info["vocal_types"] = sorted(info["vocal_types"])
        info["harmony_roles"] = sorted(info["harmony_roles"])
        del info["song_set"]
        result.append(info)

    # Sort by priority desc, then section count desc
    result.sort(key=lambda x: (-x["max_priority"], -x["section_count"]))
    return result
