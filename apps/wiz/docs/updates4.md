Nice. We’re officially in “I built my own rehearsal software” territory. Let’s do it properly.

Below is a single upgraded app that adds:
	•	✅ Full section breakdown (same as last version)
	•	✅ Rehearsal notes per section
	•	✅ Cast list (characters → actors) + basic actor metadata (voice type, notes)
	•	✅ Auditions / cross-casting page:
	•	Pick a role (e.g. Crows, Trees, Winkie Captain)
	•	Optional harmony filter (high / middle / low / unison / mixed)
	•	See:
	•	all sections that role sings
	•	similar sections by harmony role (good cross-cast tests)
	•	Actor list with voice types + notes so you know who to throw at which harmonies

Persistence via JSON files in the same folder:
	•	oz_state.json – section status (todo / needs_more / done)
	•	cast_state.json – characters → actors + actor metadata
	•	oz_notes.json – rehearsal notes per section

You can run this locally, and later adapt it for Vercel at madmanvo.com/wiz.

⸻

🧾 Full app: oz_rehearsal_web.py

Save ALL of this into oz_rehearsal_web.py:

#!/usr/bin/env python3
"""
Wizard of Oz Rehearsal Planner – Web UI

Run locally:
    python oz_rehearsal_web.py

Then open:
    http://localhost:5000
"""

from flask import Flask, render_template_string, request, redirect, url_for
from pathlib import Path
import json

app = Flask(__name__)

STATE_FILE = Path("oz_state.json")
CAST_FILE = Path("cast_state.json")
NOTES_FILE = Path("oz_notes.json")

# -------------------------------------------------------------------------
# 1. DEFINE REHEARSABLE SECTIONS
#    Each section is a specific chunk you might rehearse separately.
#    Added basic vocal metadata for audition/crosscasting helper.
# -------------------------------------------------------------------------

SECTIONS = [
    # --- NO. 1 – OPENING ---
    {
        "id": "no1_opening_girls_chorus",
        "song": "No. 1 – Opening",
        "section": "Girls chorus",
        "characters": ["Girls Chorus"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "audition_priority": 1,
    },

    # --- NO. 4 – OVER THE RAINBOW ---
    {
        "id": "no4_otr_dorothy_full",
        "song": "No. 4 – Over the Rainbow",
        "section": "Dorothy solo (full song)",
        "characters": ["Dorothy"],
        "vocal_type": "solo",
        "harmony_role": "unison",
        "audition_priority": 3,
    },

    # --- NO. 9 – MUNCHKINLAND ---
    {
        "id": "no9_munch_girls_3part",
        "song": "No. 9 – Munchkinland",
        "section": "Girls chorus (3-part high)",
        "characters": ["Girls Chorus"],
        "vocal_type": "ensemble",
        "harmony_role": "high",
        "audition_priority": 2,
    },

    # --- NO. 10–11 – MUNCHKIN SEQUENCE / DING DONG ---
    {
        "id": "no10_munch_glinda",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Glinda lead lines",
        "characters": ["Glinda"],
        "vocal_type": "solo",
        "harmony_role": "high",
        "audition_priority": 3,
    },
    {
        "id": "no10_munch_munchkins_unison",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Munchkin unison phrases",
        "characters": ["Munchkins"],
        "vocal_type": "ensemble",
        "harmony_role": "unison",
        "audition_priority": 1,
    },
    {
        "id": "no10_munch_dorothy_lines",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Dorothy vocal responses",
        "characters": ["Dorothy"],
        "vocal_type": "solo",
        "harmony_role": "unison",
        "audition_priority": 2,
    },
    {
        "id": "no10_munch_braggart_solo",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Munchkin Braggart solo",
        "characters": ["Braggart"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "audition_priority": 2,
    },
    {
        "id": "no10_munch_several_unison",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Several Munchkins unison",
        "characters": ["Munchkins"],
        "vocal_type": "ensemble",
        "harmony_role": "unison",
        "audition_priority": 1,
    },
    {
        "id": "no10_munch_teacher12_spoken",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Teachers 1 & 2 spoken bits",
        "characters": ["Teacher 1", "Teacher 2"],
        "vocal_type": "spoken",
        "harmony_role": "unison",
        "audition_priority": 1,
    },
    {
        "id": "no10_munch_mayor_spoken",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Mayor spoken bits",
        "characters": ["Mayor"],
        "vocal_type": "spoken",
        "harmony_role": "unison",
        "audition_priority": 2,
    },
    {
        "id": "no10_munch_barrister_spoken",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Barrister spoken bits",
        "characters": ["Barrister"],
        "vocal_type": "spoken",
        "harmony_role": "unison",
        "audition_priority": 1,
    },
    {
        "id": "no10_munch_city_fathers_spoken",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "City Fathers 1–3 spoken bits",
        "characters": ["City Father 1", "City Father 2", "City Father 3"],
        "vocal_type": "spoken",
        "harmony_role": "unison",
        "audition_priority": 1,
    },
    {
        "id": "no10_munch_coroner_solo",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Coroner solo",
        "characters": ["Coroner"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "audition_priority": 3,
    },
    {
        "id": "no10_munch_three_tots",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Three Tots harmony",
        "characters": ["Three Tots"],
        "vocal_type": "small_group",
        "harmony_role": "high",
        "audition_priority": 2,
    },
    {
        "id": "no10_munch_three_tough_kids",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Three Tough Kids harmony",
        "characters": ["Three Tough Kids"],
        "vocal_type": "small_group",
        "harmony_role": "middle",
        "audition_priority": 2,
    },
    {
        "id": "no10_munch_group_harmony",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Group harmony (all munchkins)",
        "characters": ["Munchkins"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "audition_priority": 2,
    },

    # --- NO. 14 – YELLOW BRICK ROAD ---
    {
        "id": "no14_ybr_mayor_solo",
        "song": "No. 14 – Yellow Brick Road",
        "section": "Mayor solo",
        "characters": ["Mayor"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "audition_priority": 2,
    },
    {
        "id": "no14_ybr_coroner_lines",
        "song": "No. 14 – Yellow Brick Road",
        "section": "Coroner lines",
        "characters": ["Coroner"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "audition_priority": 2,
    },
    {
        "id": "no14_ybr_munchkins",
        "song": "No. 14 – Yellow Brick Road",
        "section": "Munchkins chorus",
        "characters": ["Munchkins"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "audition_priority": 1,
    },
    {
        "id": "no14_ybr_fiddler_solo",
        "song": "No. 14 – Yellow Brick Road",
        "section": "Fiddler solo",
        "characters": ["Fiddler"],
        "vocal_type": "solo",
        "harmony_role": "high",
        "audition_priority": 2,
    },

    # --- NO. 16 – IF I ONLY HAD A BRAIN ---
    {
        "id": "no16_brain_scarecrow_solo",
        "song": "No. 16 – If I Only Had a Brain",
        "section": "Scarecrow solo & verse",
        "characters": ["Scarecrow"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "audition_priority": 3,
    },
    {
        "id": "no16_brain_crows_trio",
        "song": "No. 16 – If I Only Had a Brain",
        "section": "Three Crows harmony",
        "characters": ["Crows"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "audition_priority": 3,
    },
    {
        "id": "no16_brain_dorothy_spoken",
        "song": "No. 16 – If I Only Had a Brain",
        "section": "Dorothy spoken lines",
        "characters": ["Dorothy"],
        "vocal_type": "spoken",
        "harmony_role": "unison",
        "audition_priority": 1,
    },

    # --- NO. 17 – WE’RE OFF TO SEE THE WIZARD (duet) ---
    {
        "id": "no17_wiz_duet_ds",
        "song": "No. 17 – We’re Off to See the Wizard",
        "section": "Duet (Dorothy & Scarecrow)",
        "characters": ["Dorothy", "Scarecrow"],
        "vocal_type": "small_group",
        "harmony_role": "unison",
        "audition_priority": 2,
    },

    # --- NO. 19 – IF I ONLY HAD A HEART ---
    {
        "id": "no19_heart_tinman_solo",
        "song": "No. 19 – If I Only Had a Heart",
        "section": "Tinman solo & main line",
        "characters": ["Tinman"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "audition_priority": 3,
    },
    {
        "id": "no19_heart_trees_trio",
        "song": "No. 19 – If I Only Had a Heart",
        "section": "Three Trees interjections",
        "characters": ["Trees"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "audition_priority": 3,
    },
    {
        "id": "no19_heart_dorothy_lines",
        "song": "No. 19 – If I Only Had a Heart",
        "section": "Dorothy solo / octave harmony bits",
        "characters": ["Dorothy"],
        "vocal_type": "small_group",
        "harmony_role": "unison",
        "audition_priority": 2,
    },

    # --- NO. 21 – WE’RE OFF TO SEE THE WIZARD (trio) ---
    {
        "id": "no21_wiz_trio_dst",
        "song": "No. 21 – We’re Off to See the Wizard",
        "section": "Trio (Dorothy, Scarecrow, Tinman)",
        "characters": ["Dorothy", "Scarecrow", "Tinman"],
        "vocal_type": "small_group",
        "harmony_role": "unison",
        "audition_priority": 2,
    },

    # --- NO. 23 – IF I ONLY HAD THE NERVE ---
    {
        "id": "no23_nerve_lion_solo",
        "song": "No. 23 – If I Only Had the Nerve",
        "section": "Lion solo",
        "characters": ["Lion"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "audition_priority": 3,
    },
    {
        "id": "no23_nerve_trio_support",
        "song": "No. 23 – If I Only Had the Nerve",
        "section": "Dorothy, Scarecrow, Tinman unison support",
        "characters": ["Dorothy", "Scarecrow", "Tinman"],
        "vocal_type": "small_group",
        "harmony_role": "unison",
        "audition_priority": 2,
    },

    # --- NO. 23a – WIZARD REPRISE (quartet) ---
    {
        "id": "no23a_wiz_quartet_dstl",
        "song": "No. 23a – We’re Off to See the Wizard (Reprise)",
        "section": "Quartet (Dorothy, Scarecrow, Tinman, Lion)",
        "characters": ["Dorothy", "Scarecrow", "Tinman", "Lion"],
        "vocal_type": "small_group",
        "harmony_role": "unison",
        "audition_priority": 2,
    },

    # --- NO. 24 – POPPIES ---
    {
        "id": "no24_poppies_girls",
        "song": "No. 24 – Poppies",
        "section": "Girls chorus (4-part harmony)",
        "characters": ["Girls Chorus"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "audition_priority": 2,
    },
    {
        "id": "no24_poppies_boys",
        "song": "No. 24 – Poppies",
        "section": "Boys chorus (unison / 3-part)",
        "characters": ["Boys Chorus"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "audition_priority": 2,
    },
    {
        "id": "no24_poppies_glinda",
        "song": "No. 24 – Poppies",
        "section": "Glinda solo",
        "characters": ["Glinda"],
        "vocal_type": "solo",
        "harmony_role": "high",
        "audition_priority": 3,
    },
    {
        "id": "no24_poppies_round_quartet",
        "song": "No. 24 – Poppies",
        "section": "Round (Dorothy, Scarecrow, Tinman, Lion)",
        "characters": ["Dorothy", "Scarecrow", "Tinman", "Lion"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "audition_priority": 3,
    },

    # --- NO. 26-II – ENTR’ACTE PART TWO ---
    {
        "id": "no26_entracte_girls_offstage",
        "song": "No. 26-II – Entr’acte (Part 2)",
        "section": "Girls chorus offstage (3-part harmony)",
        "characters": ["Girls Chorus"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "audition_priority": 1,
    },

    # --- NO. 28 – THE MERRY OLD LAND OF OZ ---
    {
        "id": "no28_merry_dorothy",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Dorothy lines",
        "characters": ["Dorothy"],
        "vocal_type": "solo",
        "harmony_role": "unison",
        "audition_priority": 2,
    },
    {
        "id": "no28_merry_scarecrow",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Scarecrow lines",
        "characters": ["Scarecrow"],
        "vocal_type": "solo",
        "harmony_role": "unison",
        "audition_priority": 2,
    },
    {
        "id": "no28_merry_tinman",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Tinman lines",
        "characters": ["Tinman"],
        "vocal_type": "solo",
        "harmony_role": "unison",
        "audition_priority": 2,
    },
    {
        "id": "no28_merry_lion",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Lion lines",
        "characters": ["Lion"],
        "vocal_type": "solo",
        "harmony_role": "unison",
        "audition_priority": 2,
    },
    {
        "id": "no28_merry_guard",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Emerald City Guard lines",
        "characters": ["Emerald City Guard"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "audition_priority": 3,
    },
    {
        "id": "no28_merry_girls_spoken",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Girls spoken bits",
        "characters": ["Girls"],
        "vocal_type": "spoken",
        "harmony_role": "unison",
        "audition_priority": 1,
    },
    {
        "id": "no28_merry_beauticians",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Girls – Beauticians",
        "characters": ["Beauticians"],
        "vocal_type": "small_group",
        "harmony_role": "high",
        "audition_priority": 3,
    },
    {
        "id": "no28_merry_polishers",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Boys – Polishers",
        "characters": ["Polishers"],
        "vocal_type": "small_group",
        "harmony_role": "middle",
        "audition_priority": 3,
    },
    {
        "id": "no28_merry_manicurists",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Girls – Manicurists",
        "characters": ["Manicurists"],
        "vocal_type": "small_group",
        "harmony_role": "high",
        "audition_priority": 2,
    },
    {
        "id": "no28_merry_ensemble",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Ozians / general ensemble",
        "characters": ["Ozians"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "audition_priority": 1,
    },

    # --- NO. 29 – REPRISE: MERRY OLD LAND OF OZ ---
    {
        "id": "no29_merry_reprise_ensemble",
        "song": "No. 29 – Reprise: The Merry Old Land of Oz",
        "section": "Ensemble unison",
        "characters": ["Ozians"],
        "vocal_type": "ensemble",
        "harmony_role": "unison",
        "audition_priority": 1,
    },

    # --- NO. 30 – IF I WERE KING OF THE FOREST ---
    {
        "id": "no30_king_lion_main",
        "song": "No. 30 – If I Were King of the Forest",
        "section": "Lion main solo",
        "characters": ["Lion"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "audition_priority": 3,
    },
    {
        "id": "no30_king_trio_support",
        "song": "No. 30 – If I Were King of the Forest",
        "section": "Dorothy, Scarecrow, Tinman harmony support",
        "characters": ["Dorothy", "Scarecrow", "Tinman"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "audition_priority": 2,
    },

    # --- NO. 34/34a – MARCH OF THE WINKIES ---
    {
        "id": "no34_winkies_march_octaves",
        "song": "No. 34/34a – March of the Winkies",
        "section": "Winkies march / chant (octaves)",
        "characters": ["Winkies"],
        "vocal_type": "ensemble",
        "harmony_role": "low",
        "audition_priority": 2,
    },
    {
        "id": "no34_winkies_captain",
        "song": "No. 34/34a – March of the Winkies",
        "section": "Winkie Captain featured lines",
        "characters": ["Winkie Captain"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "audition_priority": 3,
    },

    # --- NO. 36 – JITTERBUG ---
    {
        "id": "no36_jitter_dorothy",
        "song": "No. 36 – Jitterbug",
        "section": "Dorothy (spoken then sung)",
        "characters": ["Dorothy"],
        "vocal_type": "solo",
        "harmony_role": "unison",
        "audition_priority": 2,
    },
    {
        "id": "no36_jitter_scarecrow",
        "song": "No. 36 – Jitterbug",
        "section": "Scarecrow lines",
        "characters": ["Scarecrow"],
        "vocal_type": "solo",
        "harmony_role": "unison",
        "audition_priority": 2,
    },
    {
        "id": "no36_jitter_tinman",
        "song": "No. 36 – Jitterbug",
        "section": "Tinman lines",
        "characters": ["Tinman"],
        "vocal_type": "solo",
        "harmony_role": "unison",
        "audition_priority": 2,
    },
    {
        "id": "no36_jitter_lion",
        "song": "No. 36 – Jitterbug",
        "section": "Lion lines",
        "characters": ["Lion"],
        "vocal_type": "solo",
        "harmony_role": "unison",
        "audition_priority": 2,
    },
    {
        "id": "no36_jitter_chorus",
        "song": "No. 36 – Jitterbug",
        "section": "Jitterbug 3-part chorus",
        "characters": ["Jitterbug Chorus"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "audition_priority": 3,
    },
    {
        "id": "no36_jitter_featured",
        "song": "No. 36 – Jitterbug",
        "section": "Featured Jitterbugs",
        "characters": ["Featured Jitterbugs"],
        "vocal_type": "small_group",
        "harmony_role": "high",
        "audition_priority": 3,
    },

    # --- NO. 37 – REPRISE: JITTERBUG ---
    {
        "id": "no37_jitter_reprise",
        "song": "No. 37 – Reprise: Jitterbug",
        "section": "Jitterbug chorus reprise",
        "characters": ["Jitterbug Chorus"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "audition_priority": 2,
    },

    # --- NO. 40a – REPRISE: WINKIES MARCH ---
    {
        "id": "no40_winkies_reprise_march",
        "song": "No. 40a – Reprise: Winkies March",
        "section": "Winkies march reprise",
        "characters": ["Winkies"],
        "vocal_type": "ensemble",
        "harmony_role": "low",
        "audition_priority": 2,
    },

    # --- NO. 41 – WINKIES MARCH WITH FRIENDS / OT R REPRISE ---
    {
        "id": "no41_winkies_with_friends",
        "song": "No. 41 – Winkies March with Friends & Reprise: Over the Rainbow",
        "section": "Winkies with friends",
        "characters": ["Winkies"],
        "vocal_type": "ensemble",
        "harmony_role": "low",
        "audition_priority": 2,
    },
    {
        "id": "no41_otr_reprise_dorothy",
        "song": "No. 41 – Winkies March with Friends & Reprise: Over the Rainbow",
        "section": "Over the Rainbow reprise (Dorothy)",
        "characters": ["Dorothy"],
        "vocal_type": "solo",
        "harmony_role": "unison",
        "audition_priority": 3,
    },

    # --- NO. 43 – REPRISE: DING DONG! THE WITCH IS DEAD ---
    {
        "id": "no43_dingdong_reprise_winkies",
        "song": "No. 43 – Reprise: Ding Dong! The Witch Is Dead",
        "section": "Winkies unison",
        "characters": ["Winkies"],
        "vocal_type": "ensemble",
        "harmony_role": "low",
        "audition_priority": 1,
    },
]

# -------------------------------------------------------------------------
# 2. STATE: section status, cast list, notes
# -------------------------------------------------------------------------

def load_json_file(path: Path, default):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return default
    return default

def save_json_file(path: Path, data):
    path.write_text(json.dumps(data, indent=2))

def load_state():
    return load_json_file(STATE_FILE, {})

def save_state(state):
    save_json_file(STATE_FILE, state)

def load_notes():
    return load_json_file(NOTES_FILE, {})

def save_notes(notes):
    save_json_file(NOTES_FILE, notes)

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

def get_status(section_id, state):
    return state.get(section_id, "todo")

def normalize_name(name: str) -> str:
    return name.strip()

def all_characters():
    names = set()
    for sec in SECTIONS:
        for c in sec["characters"]:
            names.add(c)
    return sorted(names)

ALL_CHARACTERS = all_characters()

# --- SONG MAP (for songs page) ---

def build_song_map():
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

# -------------------------------------------------------------------------
# 3. CORE LOGIC: matching sections & auditions
# -------------------------------------------------------------------------

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

def sections_for_role(role_name: str):
    role_name = normalize_name(role_name)
    return [s for s in SECTIONS if role_name in [normalize_name(c) for c in s["characters"]]]

def similar_sections_by_harmony(harmony: str, exclude_ids=None):
    if not harmony or harmony == "any":
        return []
    exclude_ids = exclude_ids or set()
    res = []
    for s in SECTIONS:
        if s["id"] in exclude_ids:
            continue
        if s.get("vocal_type") in ("small_group", "ensemble", "solo") and s.get("harmony_role") == harmony:
            res.append(s)
    # sort by audition_priority descending
    res.sort(key=lambda x: x.get("audition_priority", 1), reverse=True)
    return res

# -------------------------------------------------------------------------
# 4. TEMPLATES
# -------------------------------------------------------------------------

BASE_CSS = r"""
<style>
  body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 1.5rem; background: #f5f5f7; }
  h1 { margin-top: 0; }
  .nav { margin-bottom: 1rem; }
  .nav a { margin-right: 0.75rem; text-decoration: none; color: #0077ff; font-weight: 500; }
  .nav a.active { text-decoration: underline; }
  .card { background: #ffffff; border-radius: 12px; padding: 1rem 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
  .flex { display: flex; gap: 1.5rem; flex-wrap: wrap; }
  .col { flex: 1 1 280px; }
  .char-list { max-height: 260px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px; padding: 0.5rem 0.75rem; background: #fafafa; }
  label.char { display: block; font-size: 0.9rem; margin-bottom: 0.25rem; }
  .mode-radio { margin-right: 1rem; }
  button { padding: 0.4rem 1rem; border-radius: 999px; border: none; cursor: pointer; background: #0077ff; color: white; font-weight: 500; }
  button.secondary { background: #e0e0e0; color: #333; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { padding: 0.4rem 0.5rem; border-bottom: 1px solid #eee; vertical-align: top; }
  th { text-align: left; background: #fafafa; position: sticky; top: 0; }
  .tag { display: inline-block; padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
  .tag-full { background: #e3f7e3; color: #116611; }
  .tag-partial { background: #fff5d6; color: #8a5b00; }
  .tag-safe { background: #e3f7e3; color: #116611; }
  .tag-blocked { background: #ffe3e3; color: #991111; }
  .status-todo { background: #eee; color: #444; }
  .status-needs_more { background: #fff0c2; color: #8a5b00; }
  .status-done { background: #d6f5e3; color: #0b5b2f; }
  .small { font-size: 0.8rem; color: #666; }
  .schedule-line { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 0.85rem; }
  .pill-group { display: flex; gap: 0.3rem; flex-wrap: wrap; }
  .pill { padding: 0.05rem 0.45rem; border-radius: 999px; background: #ececec; font-size: 0.75rem; }
  input[type="text"], textarea, select { padding: 0.25rem 0.4rem; border-radius: 4px; border: 1px solid #ccc; width: 100%; max-width: 260px; font-size: 0.9rem; }
  textarea { min-height: 50px; }
  .notes-list { font-size: 0.75rem; color: #444; margin-top: 0.25rem; }
  .notes-list div { margin-bottom: 0.15rem; }
</style>
"""

PLANNER_TEMPLATE = r"""
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Wizard of Oz Rehearsal Planner</title>
  """ + BASE_CSS + r"""
</head>
<body>
  <h1>Wizard of Oz – Rehearsal Planner</h1>
  <div class="nav">
    <a href="{{ url_for('index') }}" class="active">Planner</a>
    <a href="{{ url_for('songs_page') }}">Songs & Required Singers</a>
    <a href="{{ url_for('cast_page') }}">Cast List</a>
    <a href="{{ url_for('auditions_page') }}">Auditions / Crosscasting</a>
  </div>

  <div class="card">
    <form method="POST" action="{{ url_for('index') }}">
      <div class="flex">
        <div class="col">
          <h3>1. Choose Mode</h3>
          <label class="mode-radio">
            <input type="radio" name="mode" value="available" {% if mode != 'missing' %}checked{% endif %}>
            I HAVE these characters (available)
          </label><br>
          <label class="mode-radio">
            <input type="radio" name="mode" value="missing" {% if mode == 'missing' %}checked{% endif %}>
            I am MISSING these characters
          </label>
          <p class="small">
            Example: 10–12 with leads → use "available".<br>
            Ensemble-only afternoon → use "missing" and tick the leads.
          </p>
        </div>

        <div class="col">
          <h3>2. Select Characters</h3>
          <div class="char-list">
            {% for c in all_characters %}
              <label class="char">
                <input type="checkbox" name="characters" value="{{ c }}"
                  {% if c in selected_characters %}checked{% endif %}>
                {{ c }}
                {% if cast_chars.get(c) %}
                  <span class="small">({{ cast_chars.get(c) }})</span>
                {% endif %}
              </label>
            {% endfor %}
          </div>
        </div>

        <div class="col">
          <h3>3. Go</h3>
          <p class="small">
            Status per section:<br>
            <b>todo</b> – not worked<br>
            <b>needs_more</b> – we hit it, needs tightening<br>
            <b>done</b> – solid for now<br><br>
            Add quick rehearsal notes under any section.
          </p>
          <button type="submit">Update Suggestions</button>
        </div>
      </div>
    </form>
  </div>

  {% if mode and results %}
    {% if mode == 'available' %}
      <div class="card">
        <h2>Sections You Can Work WITH These Characters</h2>
        <p class="small">
          Selected:
          {% if selected_characters %}
            <span class="pill-group">
              {% for c in selected_characters %}
                <span class="pill">{{ c }}{% if cast_chars.get(c) %} ({{ cast_chars.get(c) }}){% endif %}</span>
              {% endfor %}
            </span>
          {% else %}
            (none selected)
          {% endif %}
        </p>

        <h3>✅ Full Matches (all required present)</h3>
        {% if results.full %}
          <table>
            <tr>
              <th>Song</th>
              <th>Section</th>
              <th>Characters Required</th>
              <th>Match</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Update</th>
            </tr>
            {% for sec in results.full %}
              {% set status = state.get(sec.id, 'todo') %}
              {% set nlist = notes.get(sec.id, []) %}
              <tr>
                <td>{{ sec.song }}</td>
                <td>{{ sec.section }}</td>
                <td>
                  <span class="pill-group">
                    {% for c in sec.characters %}
                      <span class="pill">
                        {{ c }}{% if cast_chars.get(c) %} ({{ cast_chars.get(c) }}){% endif %}
                      </span>
                    {% endfor %}
                  </span>
                </td>
                <td><span class="tag tag-full">FULL</span></td>
                <td><span class="tag status-{{ status }}">{{ status }}</span></td>
                <td>
                  {% if nlist %}
                    <div class="notes-list">
                      {% for n in nlist[-3:] %}
                        <div>• {{ n }}</div>
                      {% endfor %}
                    </div>
                  {% endif %}
                  <form method="POST" action="{{ url_for('add_note') }}">
                    <input type="hidden" name="section_id" value="{{ sec.id }}">
                    <textarea name="note" placeholder="Add note..."></textarea>
                    <button type="submit" class="secondary">Add</button>
                  </form>
                </td>
                <td>
                  <form method="POST" action="{{ url_for('update_status') }}">
                    <input type="hidden" name="section_id" value="{{ sec.id }}">
                    <select name="status">
                      <option value="todo" {% if status == 'todo' %}selected{% endif %}>todo</option>
                      <option value="needs_more" {% if status == 'needs_more' %}selected{% endif %}>needs_more</option>
                      <option value="done" {% if status == 'done' %}selected{% endif %}>done</option>
                    </select>
                    <button type="submit" class="secondary">Save</button>
                  </form>
                </td>
              </tr>
            {% endfor %}
          </table>
        {% else %}
          <p class="small">No full matches for this set of characters.</p>
        {% endif %}

        <h3>🟡 Partial Matches (some of the required characters present)</h3>
        {% if results.partial %}
          <table>
            <tr>
              <th>Song</th>
              <th>Section</th>
              <th>Characters Required</th>
              <th>Match</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Update</th>
            </tr>
            {% for sec in results.partial %}
              {% set status = state.get(sec.id, 'todo') %}
              {% set nlist = notes.get(sec.id, []) %}
              <tr>
                <td>{{ sec.song }}</td>
                <td>{{ sec.section }}</td>
                <td>
                  <span class="pill-group">
                    {% for c in sec.characters %}
                      <span class="pill">
                        {{ c }}{% if cast_chars.get(c) %} ({{ cast_chars.get(c) }}){% endif %}
                      </span>
                    {% endfor %}
                  </span>
                </td>
                <td><span class="tag tag-partial">PARTIAL</span></td>
                <td><span class="tag status-{{ status }}">{{ status }}</span></td>
                <td>
                  {% if nlist %}
                    <div class="notes-list">
                      {% for n in nlist[-3:] %}
                        <div>• {{ n }}</div>
                      {% endfor %}
                    </div>
                  {% endif %}
                  <form method="POST" action="{{ url_for('add_note') }}">
                    <input type="hidden" name="section_id" value="{{ sec.id }}">
                    <textarea name="note" placeholder="Add note..."></textarea>
                    <button type="submit" class="secondary">Add</button>
                  </form>
                </td>
                <td>
                  <form method="POST" action="{{ url_for('update_status') }}">
                    <input type="hidden" name="section_id" value="{{ sec.id }}">
                    <select name="status">
                      <option value="todo" {% if status == 'todo' %}selected{% endif %}>todo</option>
                      <option value="needs_more" {% if status == 'needs_more' %}selected{% endif %}>needs_more</option>
                      <option value="done" {% if status == 'done' %}selected{% endif %}>done</option>
                    </select>
                    <button type="submit" class="secondary">Save</button>
                  </form>
                </td>
              </tr>
            {% endfor %}
          </table>
        {% else %}
          <p class="small">No partial matches.</p>
        {% endif %}
      </div>
    {% elif mode == 'missing' %}
      <div class="card">
        <h2>Sections SAFE WITHOUT These Characters</h2>
        <p class="small">
          Missing:
          {% if selected_characters %}
            <span class="pill-group">
              {% for c in selected_characters %}
                <span class="pill">{{ c }}{% if cast_chars.get(c) %} ({{ cast_chars.get(c) }}){% endif %}</span>
              {% endfor %}
            </span>
          {% else %}
            (none selected)
          {% endif %}
        </p>

        <h3>✅ Safe Sections (none of the missing characters required)</h3>
        {% if results.safe %}
          <table>
            <tr>
              <th>Song</th>
              <th>Section</th>
              <th>Characters Required</th>
              <th>Safe?</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Update</th>
            </tr>
            {% for sec in results.safe %}
              {% set status = state.get(sec.id, 'todo') %}
              {% set nlist = notes.get(sec.id, []) %}
              <tr>
                <td>{{ sec.song }}</td>
                <td>{{ sec.section }}</td>
                <td>
                  <span class="pill-group">
                    {% for c in sec.characters %}
                      <span class="pill">
                        {{ c }}{% if cast_chars.get(c) %} ({{ cast_chars.get(c) }}){% endif %}
                      </span>
                    {% endfor %}
                  </span>
                </td>
                <td><span class="tag tag-safe">SAFE</span></td>
                <td><span class="tag status-{{ status }}">{{ status }}</span></td>
                <td>
                  {% if nlist %}
                    <div class="notes-list">
                      {% for n in nlist[-3:] %}
                        <div>• {{ n }}</div>
                      {% endfor %}
                    </div>
                  {% endif %}
                  <form method="POST" action="{{ url_for('add_note') }}">
                    <input type="hidden" name="section_id" value="{{ sec.id }}">
                    <textarea name="note" placeholder="Add note..."></textarea>
                    <button type="submit" class="secondary">Add</button>
                  </form>
                </td>
                <td>
                  <form method="POST" action="{{ url_for('update_status') }}">
                    <input type="hidden" name="section_id" value="{{ sec.id }}">
                    <select name="status">
                      <option value="todo" {% if status == 'todo' %}selected{% endif %}>todo</option>
                      <option value="needs_more" {% if status == 'needs_more' %}selected{% endif %}>needs_more</option>
                      <option value="done" {% if status == 'done' %}selected{% endif %}>done</option>
                    </select>
                    <button type="submit" class="secondary">Save</button>
                  </form>
                </td>
              </tr>
            {% endfor %}
          </table>
        {% else %}
          <p class="small">No safe sections for this missing list.</p>
        {% endif %}
      </div>
    {% endif %}
  {% endif %}

  <div class="card">
    <h2>Quick Schedule Builder (copy & paste)</h2>
    <form method="POST" action="{{ url_for('build_schedule') }}">
      <p class="small">
        I'll output <code>time | Characters | Song/Section</code> that you can paste into your rehearsal doc.
      </p>
      <div>
        <label>Time block:</label><br>
        <input type="text" name="time_block" placeholder="10:00-10:20">
      </div>
      <div>
        <label>Characters:</label><br>
        <input type="text" name="chars" placeholder="Dorothy, Scarecrow">
      </div>
      <div>
        <label>Section (choose known or free text):</label><br>
        <select name="section_id">
          <option value="">-- free text (use field below) --</option>
          {% for sec in all_sections %}
            <option value="{{ sec.id }}">{{ sec.song }} – {{ sec.section }} ({{ sec.id }})</option>
          {% endfor %}
        </select>
      </div>
      <div>
        <label>Or custom song/section text:</label><br>
        <input type="text" name="custom_label" placeholder="If I Only Had a Brain – verse 1">
      </div>
      <br>
      <button type="submit" class="secondary">Add line</button>
    </form>

    {% if schedule_lines %}
      <h3>Schedule (copy below):</h3>
      <div>
        <div class="schedule-line"><b>time | Characters | Song/Section</b></div>
        {% for line in schedule_lines %}
          <div class="schedule-line">{{ line }}</div>
        {% endfor %}
      </div>
    {% endif %}
  </div>

</body>
</html>
"""

SONGS_TEMPLATE = r"""
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Wizard of Oz – Songs & Singers</title>
  """ + BASE_CSS + r"""
</head>
<body>
  <h1>Songs & Required Singers</h1>
  <div class="nav">
    <a href="{{ url_for('index') }}">Planner</a>
    <a href="{{ url_for('songs_page') }}" class="active">Songs & Required Singers</a>
    <a href="{{ url_for('cast_page') }}">Cast List</a>
    <a href="{{ url_for('auditions_page') }}">Auditions / Crosscasting</a>
  </div>

  <div class="card">
    <p class="small">
      Each song with all characters who sing in any section, plus current casting if set.
    </p>

    <table>
      <tr>
        <th>Song</th>
        <th>Characters Required</th>
      </tr>
      {% for s in songs %}
        <tr>
          <td>{{ s.song }}</td>
          <td>
            <span class="pill-group">
              {% for c in s.characters %}
                <span class="pill">
                  {{ c }}{% if cast_chars.get(c) %} ({{ cast_chars.get(c) }}){% endif %}
                </span>
              {% endfor %}
            </span>
          </td>
        </tr>
      {% endfor %}
    </table>
  </div>
</body>
</html>
"""

CAST_TEMPLATE = r"""
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Wizard of Oz – Cast List</title>
  """ + BASE_CSS + r"""
</head>
<body>
  <h1>Cast List (Character → Actor)</h1>
  <div class="nav">
    <a href="{{ url_for('index') }}">Planner</a>
    <a href="{{ url_for('songs_page') }}">Songs & Required Singers</a>
    <a href="{{ url_for('cast_page') }}" class="active">Cast List</a>
    <a href="{{ url_for('auditions_page') }}">Auditions / Crosscasting</a>
  </div>

  <div class="card">
    <form method="POST" action="{{ url_for('cast_page') }}">
      <p class="small">
        For each character, set the actor name. You can also set that actor's voice type (S/A/T/B/etc.)
        and any notes (ear, blend, range). If the same actor appears multiple times, their last-entered
        type & notes will be used.
      </p>
      <table>
        <tr>
          <th>Character</th>
          <th>Actor Name</th>
          <th>Actor Voice Type</th>
          <th>Actor Notes</th>
        </tr>
        {% for c in all_characters %}
          {% set actor_name = cast_chars.get(c, '') %}
          {% set actor_meta = actors.get(actor_name, {}) if actor_name else {} %}
          <tr>
            <td>{{ c }}</td>
            <td>
              <input type="text" name="actor::{{ c }}" value="{{ actor_name }}">
            </td>
            <td>
              <input type="text" name="voice::{{ c }}" value="{{ actor_meta.get('voice_type', '') }}">
            </td>
            <td>
              <input type="text" name="anotes::{{ c }}" value="{{ actor_meta.get('notes', '') }}">
            </td>
          </tr>
        {% endfor %}
      </table>
      <br>
      <button type="submit">Save Cast</button>
    </form>
  </div>
</body>
</html>
"""

AUDITIONS_TEMPLATE = r"""
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Wizard of Oz – Auditions / Crosscasting</title>
  """ + BASE_CSS + r"""
</head>
<body>
  <h1>Auditions / Crosscasting Helper</h1>
  <div class="nav">
    <a href="{{ url_for('index') }}">Planner</a>
    <a href="{{ url_for('songs_page') }}">Songs & Required Singers</a>
    <a href="{{ url_for('cast_page') }}">Cast List</a>
    <a href="{{ url_for('auditions_page') }}" class="active">Auditions / Crosscasting</a>
  </div>

  <div class="card">
    <form method="POST" action="{{ url_for('auditions_page') }}">
      <div class="flex">
        <div class="col">
          <h3>Role to Test</h3>
          <select name="role">
            <option value="">-- choose a character --</option>
            {% for c in all_characters %}
              <option value="{{ c }}" {% if c == selected_role %}selected{% endif %}>{{ c }}</option>
            {% endfor %}
          </select>
          <p class="small">
            e.g. Crows, Trees, Winkie Captain, Beauticians, Manicurists, etc.
          </p>
        </div>
        <div class="col">
          <h3>Harmony Focus (optional)</h3>
          <select name="harmony">
            <option value="any" {% if selected_harmony == 'any' %}selected{% endif %}>Any</option>
            <option value="high" {% if selected_harmony == 'high' %}selected{% endif %}>High</option>
            <option value="middle" {% if selected_harmony == 'middle' %}selected{% endif %}>Middle</option>
            <option value="low" {% if selected_harmony == 'low' %}selected{% endif %}>Low</option>
            <option value="unison" {% if selected_harmony == 'unison' %}selected{% endif %}>Unison</option>
            <option value="mixed" {% if selected_harmony == 'mixed' %}selected{% endif %}>Mixed</option>
          </select>
          <p class="small">
            This also pulls in similar sections for crosscasting (e.g. other high harmony lines).
          </p>
        </div>
        <div class="col">
          <h3>Go</h3>
          <p class="small">
            Use this to pick audition cuts for each small part and to sanity-check who can
            cover which harmony role.
          </p>
          <button type="submit">Show Sections</button>
        </div>
      </div>
    </form>
  </div>

  {% if selected_role %}
    <div class="card">
      <h2>Sections for Role: {{ selected_role }}</h2>
      {% if role_sections %}
        <table>
          <tr>
            <th>Song</th>
            <th>Section</th>
            <th>Characters</th>
            <th>Vocal</th>
            <th>Harmony</th>
            <th>Priority</th>
          </tr>
          {% for sec in role_sections %}
            <tr>
              <td>{{ sec.song }}</td>
              <td>{{ sec.section }}</td>
              <td>
                <span class="pill-group">
                  {% for c in sec.characters %}
                    <span class="pill">{{ c }}</span>
                  {% endfor %}
                </span>
              </td>
              <td>{{ sec.vocal_type }}</td>
              <td>{{ sec.harmony_role }}</td>
              <td>{{ sec.audition_priority }}</td>
            </tr>
          {% endfor %}
        </table>
      {% else %}
        <p class="small">No sections found using this character. (Check spelling or character list.)</p>
      {% endif %}
    </div>

    <div class="card">
      <h2>Similar Sections by Harmony ({{ selected_harmony }})</h2>
      {% if similar_sections %}
        <p class="small">
          These aren't necessarily for {{ selected_role }}, but they share the same harmony profile.
          Great for testing if someone cast as {{ selected_role }} can also cover similar parts.
        </p>
        <table>
          <tr>
            <th>Song</th>
            <th>Section</th>
            <th>Characters</th>
            <th>Vocal</th>
            <th>Harmony</th>
            <th>Priority</th>
          </tr>
          {% for sec in similar_sections %}
            <tr>
              <td>{{ sec.song }}</td>
              <td>{{ sec.section }}</td>
              <td>
                <span class="pill-group">
                  {% for c in sec.characters %}
                    <span class="pill">{{ c }}</span>
                  {% endfor %}
                </span>
              </td>
              <td>{{ sec.vocal_type }}</td>
              <td>{{ sec.harmony_role }}</td>
              <td>{{ sec.audition_priority }}</td>
            </tr>
          {% endfor %}
        </table>
      {% else %}
        <p class="small">No similar sections found for this harmony filter.</p>
      {% endif %}
    </div>

    <div class="card">
      <h2>Current Actors & Voice Types</h2>
      {% if actors %}
        <table>
          <tr>
            <th>Actor</th>
            <th>Voice Type</th>
            <th>Notes</th>
            <th>Characters Cast As</th>
          </tr>
          {% for name, meta in actors.items() %}
            <tr>
              <td>{{ name }}</td>
              <td>{{ meta.get('voice_type', '') }}</td>
              <td>{{ meta.get('notes', '') }}</td>
              <td>
                <span class="pill-group">
                  {% for ch, an in cast_chars.items() %}
                    {% if an == name %}
                      <span class="pill">{{ ch }}</span>
                    {% endif %}
                  {% endfor %}
                </span>
              </td>
            </tr>
          {% endfor %}
        </table>
      {% else %}
        <p class="small">No actors defined yet. Set them on the Cast List page first.</p>
      {% endif %}
    </div>
  {% endif %}
</body>
</html>
"""

# -------------------------------------------------------------------------
# 5. ROUTES
# -------------------------------------------------------------------------

@app.route("/", methods=["GET", "POST"])
def index():
    state = load_state()
    cast_data = load_cast()
    cast_chars = cast_data["cast"]
    actors = cast_data["actors"]
    notes = load_notes()

    mode = None
    selected = []
    results = None
    schedule_lines = []

    if request.method == "POST":
        mode = request.form.get("mode", "available")
        selected = request.form.getlist("characters")

        if mode == "available":
            full, partial = sections_with_available(selected)
            results = {"full": full, "partial": partial}
        elif mode == "missing":
            safe, blocked = sections_safe_without(selected)
            results = {"safe": safe, "blocked": blocked}

    return render_template_string(
        PLANNER_TEMPLATE,
        all_characters=ALL_CHARACTERS,
        selected_characters=selected,
        mode=mode,
        results=results,
        state=state,
        notes=notes,
        cast_chars=cast_chars,
        actors=actors,
        all_sections=SECTIONS,
        schedule_lines=schedule_lines,
    )

@app.route("/status", methods=["POST"])
def update_status():
    section_id = request.form.get("section_id")
    new_status = request.form.get("status", "todo")
    state = load_state()
    if section_id:
        state[section_id] = new_status
        save_state(state)
    ref = request.headers.get("Referer") or url_for("index")
    return redirect(ref)

@app.route("/note", methods=["POST"])
def add_note():
    section_id = request.form.get("section_id")
    note = (request.form.get("note") or "").strip()
    if section_id and note:
        notes = load_notes()
        notes.setdefault(section_id, []).append(note)
        save_notes(notes)
    ref = request.headers.get("Referer") or url_for("index")
    return redirect(ref)

@app.route("/schedule", methods=["POST"])
def build_schedule():
    time_block = request.form.get("time_block", "").strip()
    chars = request.form.get("chars", "").strip()
    section_id = request.form.get("section_id", "").strip()
    custom_label = request.form.get("custom_label", "").strip()

    label = custom_label
    if section_id:
        sec = next((s for s in SECTIONS if s["id"] == section_id), None)
        if sec:
            label = f"{sec['song']} – {sec['section']}"
    if not label:
        label = "(no section)"

    line = f"{time_block} | {chars} | {label}"

    state = load_state()
    cast_data = load_cast()
    cast_chars = cast_data["cast"]
    actors = cast_data["actors"]
    notes = load_notes()
    return render_template_string(
        PLANNER_TEMPLATE,
        all_characters=ALL_CHARACTERS,
        selected_characters=[],
        mode=None,
        results=None,
        state=state,
        notes=notes,
        cast_chars=cast_chars,
        actors=actors,
        all_sections=SECTIONS,
        schedule_lines=[line],
    )

@app.route("/songs")
def songs_page():
    cast_data = load_cast()
    cast_chars = cast_data["cast"]
    songs = build_song_map()
    return render_template_string(
        SONGS_TEMPLATE,
        songs=songs,
        cast_chars=cast_chars,
    )

@app.route("/cast", methods=["GET", "POST"])
def cast_page():
    cast_data = load_cast()
    cast_chars = cast_data["cast"]
    actors = cast_data["actors"]

    if request.method == "POST":
        new_cast_chars = {}
        new_actors = {}

        # first pass: get all actor names per character
        char_to_actor = {}
        for key, value in request.form.items():
            if key.startswith("actor::"):
                character = key.split("::", 1)[1]
                actor_name = value.strip()
                if actor_name:
                    char_to_actor[character] = actor_name

        # second pass: build actor metadata based on per-character voice/notes
        for key, value in request.form.items():
            if key.startswith("voice::"):
                character = key.split("::", 1)[1]
                actor_name = char_to_actor.get(character)
                if not actor_name:
                    continue
                vtype = value.strip()
                new_actors.setdefault(actor_name, {})
                if vtype:
                    new_actors[actor_name]["voice_type"] = vtype
            elif key.startswith("anotes::"):
                character = key.split("::", 1)[1]
                actor_name = char_to_actor.get(character)
                if not actor_name:
                    continue
                note = value.strip()
                new_actors.setdefault(actor_name, {})
                if note:
                    new_actors[actor_name]["notes"] = note

        new_cast_chars = char_to_actor
        cast_data = {"cast": new_cast_chars, "actors": new_actors}
        save_cast(cast_data)
        return redirect(url_for("cast_page"))

    return render_template_string(
        CAST_TEMPLATE,
        all_characters=ALL_CHARACTERS,
        cast_chars=cast_chars,
        actors=actors,
    )

@app.route("/auditions", methods=["GET", "POST"])
def auditions_page():
    cast_data = load_cast()
    cast_chars = cast_data["cast"]
    actors = cast_data["actors"]

    selected_role = ""
    selected_harmony = "any"
    role_sections = []
    similar = []

    if request.method == "POST":
        selected_role = (request.form.get("role") or "").strip()
        selected_harmony = (request.form.get("harmony") or "any").strip()
        if selected_role:
            role_sections = sections_for_role(selected_role)
            exclude_ids = {s["id"] for s in role_sections}
            similar = similar_sections_by_harmony(selected_harmony, exclude_ids=exclude_ids)

    return render_template_string(
        AUDITIONS_TEMPLATE,
        all_characters=ALL_CHARACTERS,
        selected_role=selected_role,
        selected_harmony=selected_harmony,
        role_sections=role_sections,
        similar_sections=similar,
        cast_chars=cast_chars,
        actors=actors,
    )

# -------------------------------------------------------------------------
# 6. MAIN ENTRY
# -------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


⸻

🧪 How you’ll actually use this tomorrow

Cast tab (before rehearsal):
	•	Fill in:
	•	Actor for each character you’ve decided
	•	Voice type + notes for your kids you’re testing for Crows/Trees/Winkies/etc.

Auditions tab (during crosscasting):
	•	Role: Crows
	•	Harmony: mixed or high
	•	You’ll see:
	•	All Crow sections you need them to sing
	•	Plus similar high/mixed harmony chunks from Trees, Beauticians, Jitterbug chorus, etc.
	•	Use that as your audition packet.

Planner tab (during rehearsal):
	•	10–12: tick Dorothy, Scarecrow, Tinman, Lion → hit “Update”.
	•	Work from Full matches first, then Partials.
	•	After you run a section:
	•	Set status → needs_more or done
	•	Add a quick note: “Lion flat on bar 4 entry”, “round shaky at ‘we’re off’ entrance”.
	•	Next day:
	•	Filter again with whatever cast shows up.
	•	Anything marked needs_more is your “fix this first” list.

⸻

If you want to tweak:
	•	Add/remove sections in SECTIONS
	•	Adjust vocal_type, harmony_role, audition_priority as you learn where the pain points really are.

But as-is, this should already give you:
	•	A rehearsal brain
	•	A crosscasting helper
	•	A notes log
	•	And copy-paste-ready time | Characters | Song lines for schedules.