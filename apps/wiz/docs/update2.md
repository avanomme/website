Ohhh this is going to be so much nicer than wrestling Google Sheets. Let’s give you a proper little web app you can run locally and deploy to Vercel.

Here’s what this version does:
	•	✅ Full section-level breakdown of the show (not just whole songs)
	•	✅ Planner page:
	•	Mode 1: “I HAVE these characters” → shows FULL and PARTIAL sections
	•	Mode 2: “I’m MISSING these characters” → shows SAFE sections
	•	Per-section status: todo / needs_more / done
	•	✅ Songs page:
	•	Lists each song
	•	Shows all characters required (from all sections)
	•	Shows assigned actor names beside each character (if cast)
	•	✅ Cast page:
	•	Edit which actor is playing each character
	•	Saves to cast_state.json
	•	✅ Simple schedule builder:
	•	Outputs time | Characters | Song/Section lines ready to paste

All persistent bits (section status + cast list) are stored in JSON files next to the script:
	•	oz_state.json
	•	cast_state.json

You can expand or tweak the section list any time.

⸻

🧾 Full app: oz_rehearsal_web.py

Save this into a file called oz_rehearsal_web.py:

#!/usr/bin/env python3
"""
Wizard of Oz Rehearsal Planner – Web UI

Run locally:
    python oz_rehearsal_web.py

Then open:
    http://localhost:5000

You can adapt this for deployment on Vercel or any other platform that supports Flask.
"""

from flask import Flask, render_template_string, request, redirect, url_for
from pathlib import Path
import json

app = Flask(__name__)

STATE_FILE = Path("oz_state.json")
CAST_FILE = Path("cast_state.json")

# -------------------------------------------------------------------------
# 1. DEFINE REHEARSABLE SECTIONS
#    Each section is a specific chunk you might rehearse separately.
# -------------------------------------------------------------------------

SECTIONS = [
    # --- NO. 1 – OPENING ---
    {
        "id": "no1_opening_girls_chorus",
        "song": "No. 1 – Opening",
        "section": "Girls chorus",
        "characters": ["Girls Chorus"],
    },

    # --- NO. 4 – OVER THE RAINBOW ---
    {
        "id": "no4_otr_dorothy_full",
        "song": "No. 4 – Over the Rainbow",
        "section": "Dorothy solo (full song)",
        "characters": ["Dorothy"],
    },

    # --- NO. 9 – MUNCHKINLAND ---
    {
        "id": "no9_munch_girls_3part",
        "song": "No. 9 – Munchkinland",
        "section": "Girls chorus (3-part high)",
        "characters": ["Girls Chorus"],
    },

    # --- NO. 10–11 – MUNCHKIN SEQUENCE / DING DONG ---
    {
        "id": "no10_munch_glinda",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Glinda lead lines",
        "characters": ["Glinda"],
    },
    {
        "id": "no10_munch_munchkins_unison",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Munchkin unison phrases",
        "characters": ["Munchkins"],
    },
    {
        "id": "no10_munch_dorothy_lines",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Dorothy vocal responses",
        "characters": ["Dorothy"],
    },
    {
        "id": "no10_munch_braggart_solo",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Munchkin Braggart solo",
        "characters": ["Braggart"],
    },
    {
        "id": "no10_munch_several_unison",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Several Munchkins unison",
        "characters": ["Munchkins"],
    },
    {
        "id": "no10_munch_teacher12_spoken",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Teachers 1 & 2 spoken bits",
        "characters": ["Teacher 1", "Teacher 2"],
    },
    {
        "id": "no10_munch_mayor_spoken",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Mayor spoken bits",
        "characters": ["Mayor"],
    },
    {
        "id": "no10_munch_barrister_spoken",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Barrister spoken bits",
        "characters": ["Barrister"],
    },
    {
        "id": "no10_munch_city_fathers_spoken",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "City Fathers 1–3 spoken bits",
        "characters": ["City Father 1", "City Father 2", "City Father 3"],
    },
    {
        "id": "no10_munch_coroner_solo",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Coroner solo",
        "characters": ["Coroner"],
    },
    {
        "id": "no10_munch_three_tots",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Three Tots harmony",
        "characters": ["Three Tots"],
    },
    {
        "id": "no10_munch_three_tough_kids",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Three Tough Kids harmony",
        "characters": ["Three Tough Kids"],
    },
    {
        "id": "no10_munch_group_harmony",
        "song": "No. 10–11 – Munchkin Musical Sequence / Ding Dong",
        "section": "Group harmony (all munchkins)",
        "characters": ["Munchkins"],
    },

    # --- NO. 14 – YELLOW BRICK ROAD ---
    {
        "id": "no14_ybr_mayor_solo",
        "song": "No. 14 – Yellow Brick Road",
        "section": "Mayor solo",
        "characters": ["Mayor"],
    },
    {
        "id": "no14_ybr_coroner_lines",
        "song": "No. 14 – Yellow Brick Road",
        "section": "Coroner lines",
        "characters": ["Coroner"],
    },
    {
        "id": "no14_ybr_munchkins",
        "song": "No. 14 – Yellow Brick Road",
        "section": "Munchkins chorus",
        "characters": ["Munchkins"],
    },
    {
        "id": "no14_ybr_fiddler_solo",
        "song": "No. 14 – Yellow Brick Road",
        "section": "Fiddler solo",
        "characters": ["Fiddler"],
    },

    # --- NO. 16 – IF I ONLY HAD A BRAIN ---
    {
        "id": "no16_brain_scarecrow_solo",
        "song": "No. 16 – If I Only Had a Brain",
        "section": "Scarecrow solo & verse",
        "characters": ["Scarecrow"],
    },
    {
        "id": "no16_brain_crows_trio",
        "song": "No. 16 – If I Only Had a Brain",
        "section": "Three Crows harmony",
        "characters": ["Crows"],
    },
    {
        "id": "no16_brain_dorothy_spoken",
        "song": "No. 16 – If I Only Had a Brain",
        "section": "Dorothy spoken lines",
        "characters": ["Dorothy"],
    },

    # --- NO. 17 – WE’RE OFF TO SEE THE WIZARD (duet) ---
    {
        "id": "no17_wiz_duet_ds",
        "song": "No. 17 – We’re Off to See the Wizard",
        "section": "Duet (Dorothy & Scarecrow)",
        "characters": ["Dorothy", "Scarecrow"],
    },

    # --- NO. 19 – IF I ONLY HAD A HEART ---
    {
        "id": "no19_heart_tinman_solo",
        "song": "No. 19 – If I Only Had a Heart",
        "section": "Tinman solo & main line",
        "characters": ["Tinman"],
    },
    {
        "id": "no19_heart_trees_trio",
        "song": "No. 19 – If I Only Had a Heart",
        "section": "Three Trees interjections",
        "characters": ["Trees"],
    },
    {
        "id": "no19_heart_dorothy_lines",
        "song": "No. 19 – If I Only Had a Heart",
        "section": "Dorothy solo / octave harmony bits",
        "characters": ["Dorothy"],
    },

    # --- NO. 21 – WE’RE OFF TO SEE THE WIZARD (trio) ---
    {
        "id": "no21_wiz_trio_dst",
        "song": "No. 21 – We’re Off to See the Wizard",
        "section": "Trio (Dorothy, Scarecrow, Tinman)",
        "characters": ["Dorothy", "Scarecrow", "Tinman"],
    },

    # --- NO. 23 – IF I ONLY HAD THE NERVE ---
    {
        "id": "no23_nerve_lion_solo",
        "song": "No. 23 – If I Only Had the Nerve",
        "section": "Lion solo",
        "characters": ["Lion"],
    },
    {
        "id": "no23_nerve_trio_support",
        "song": "No. 23 – If I Only Had the Nerve",
        "section": "Dorothy, Scarecrow, Tinman unison support",
        "characters": ["Dorothy", "Scarecrow", "Tinman"],
    },

    # --- NO. 23a – WIZARD REPRISE (quartet) ---
    {
        "id": "no23a_wiz_quartet_dstl",
        "song": "No. 23a – We’re Off to See the Wizard (Reprise)",
        "section": "Quartet (Dorothy, Scarecrow, Tinman, Lion)",
        "characters": ["Dorothy", "Scarecrow", "Tinman", "Lion"],
    },

    # --- NO. 24 – POPPIES ---
    {
        "id": "no24_poppies_girls",
        "song": "No. 24 – Poppies",
        "section": "Girls chorus (4-part harmony)",
        "characters": ["Girls Chorus"],
    },
    {
        "id": "no24_poppies_boys",
        "song": "No. 24 – Poppies",
        "section": "Boys chorus (unison / 3-part)",
        "characters": ["Boys Chorus"],
    },
    {
        "id": "no24_poppies_glinda",
        "song": "No. 24 – Poppies",
        "section": "Glinda solo",
        "characters": ["Glinda"],
    },
    {
        "id": "no24_poppies_round_quartet",
        "song": "No. 24 – Poppies",
        "section": "Round (Dorothy, Scarecrow, Tinman, Lion)",
        "characters": ["Dorothy", "Scarecrow", "Tinman", "Lion"],
    },

    # --- NO. 26-II – ENTR’ACTE PART TWO ---
    {
        "id": "no26_entracte_girls_offstage",
        "song": "No. 26-II – Entr’acte (Part 2)",
        "section": "Girls chorus offstage (3-part harmony)",
        "characters": ["Girls Chorus"],
    },

    # --- NO. 28 – THE MERRY OLD LAND OF OZ ---
    {
        "id": "no28_merry_dorothy",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Dorothy lines",
        "characters": ["Dorothy"],
    },
    {
        "id": "no28_merry_scarecrow",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Scarecrow lines",
        "characters": ["Scarecrow"],
    },
    {
        "id": "no28_merry_tinman",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Tinman lines",
        "characters": ["Tinman"],
    },
    {
        "id": "no28_merry_lion",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Lion lines",
        "characters": ["Lion"],
    },
    {
        "id": "no28_merry_guard",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Emerald City Guard lines",
        "characters": ["Emerald City Guard"],
    },
    {
        "id": "no28_merry_girls_spoken",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Girls spoken bits",
        "characters": ["Girls"],
    },
    {
        "id": "no28_merry_beauticians",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Girls – Beauticians",
        "characters": ["Beauticians"],
    },
    {
        "id": "no28_merry_polishers",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Boys – Polishers",
        "characters": ["Polishers"],
    },
    {
        "id": "no28_merry_manicurists",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Girls – Manicurists",
        "characters": ["Manicurists"],
    },
    {
        "id": "no28_merry_ensemble",
        "song": "No. 28 – The Merry Old Land of Oz",
        "section": "Ozians / general ensemble",
        "characters": ["Ozians"],
    },

    # --- NO. 29 – REPRISE: MERRY OLD LAND OF OZ ---
    {
        "id": "no29_merry_reprise_ensemble",
        "song": "No. 29 – Reprise: The Merry Old Land of Oz",
        "section": "Ensemble unison",
        "characters": ["Ozians"],
    },

    # --- NO. 30 – IF I WERE KING OF THE FOREST ---
    {
        "id": "no30_king_lion_main",
        "song": "No. 30 – If I Were King of the Forest",
        "section": "Lion main solo",
        "characters": ["Lion"],
    },
    {
        "id": "no30_king_trio_support",
        "song": "No. 30 – If I Were King of the Forest",
        "section": "Dorothy, Scarecrow, Tinman harmony support",
        "characters": ["Dorothy", "Scarecrow", "Tinman"],
    },

    # --- NO. 34/34a – MARCH OF THE WINKIES ---
    {
        "id": "no34_winkies_march_octaves",
        "song": "No. 34/34a – March of the Winkies",
        "section": "Winkies march / chant (octaves)",
        "characters": ["Winkies"],
    },
    {
        "id": "no34_winkies_captain",
        "song": "No. 34/34a – March of the Winkies",
        "section": "Winkie Captain featured lines",
        "characters": ["Winkie Captain"],
    },

    # --- NO. 36 – JITTERBUG ---
    {
        "id": "no36_jitter_dorothy",
        "song": "No. 36 – Jitterbug",
        "section": "Dorothy (spoken then sung)",
        "characters": ["Dorothy"],
    },
    {
        "id": "no36_jitter_scarecrow",
        "song": "No. 36 – Jitterbug",
        "section": "Scarecrow lines",
        "characters": ["Scarecrow"],
    },
    {
        "id": "no36_jitter_tinman",
        "song": "No. 36 – Jitterbug",
        "section": "Tinman lines",
        "characters": ["Tinman"],
    },
    {
        "id": "no36_jitter_lion",
        "song": "No. 36 – Jitterbug",
        "section": "Lion lines",
        "characters": ["Lion"],
    },
    {
        "id": "no36_jitter_chorus",
        "song": "No. 36 – Jitterbug",
        "section": "Jitterbug 3-part chorus",
        "characters": ["Jitterbug Chorus"],
    },
    {
        "id": "no36_jitter_featured",
        "song": "No. 36 – Jitterbug",
        "section": "Featured Jitterbugs",
        "characters": ["Featured Jitterbugs"],
    },

    # --- NO. 37 – REPRISE: JITTERBUG ---
    {
        "id": "no37_jitter_reprise",
        "song": "No. 37 – Reprise: Jitterbug",
        "section": "Jitterbug chorus reprise",
        "characters": ["Jitterbug Chorus"],
    },

    # --- NO. 40a – REPRISE: WINKIES MARCH ---
    {
        "id": "no40_winkies_reprise_march",
        "song": "No. 40a – Reprise: Winkies March",
        "section": "Winkies march reprise",
        "characters": ["Winkies"],
    },

    # --- NO. 41 – WINKIES MARCH WITH FRIENDS / OT R REPRISE ---
    {
        "id": "no41_winkies_with_friends",
        "song": "No. 41 – Winkies March with Friends & Reprise: Over the Rainbow",
        "section": "Winkies with friends",
        "characters": ["Winkies"],
    },
    {
        "id": "no41_otr_reprise_dorothy",
        "song": "No. 41 – Winkies March with Friends & Reprise: Over the Rainbow",
        "section": "Over the Rainbow reprise (Dorothy)",
        "characters": ["Dorothy"],
    },

    # --- NO. 43 – REPRISE: DING DONG! THE WITCH IS DEAD ---
    {
        "id": "no43_dingdong_reprise_winkies",
        "song": "No. 43 – Reprise: Ding Dong! The Witch Is Dead",
        "section": "Winkies unison",
        "characters": ["Winkies"],
    },
]

# -------------------------------------------------------------------------
# 2. STATE: section status & cast list
# -------------------------------------------------------------------------

def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            return {}
    return {}

def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))

def load_cast():
    if CAST_FILE.exists():
        try:
            return json.loads(CAST_FILE.read_text())
        except Exception:
            return {}
    return {}

def save_cast(cast):
    CAST_FILE.write_text(json.dumps(cast, indent=2))

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
    # convert sets to sorted lists
    for s in songs.values():
        s["characters"] = sorted(s["characters"])
    # sort songs by name
    return [songs[k] for k in sorted(songs.keys())]

# -------------------------------------------------------------------------
# 3. CORE LOGIC: matching sections
# -------------------------------------------------------------------------

def sections_with_available(available_names):
    available = {normalize_name(c) for c in available_names}
    full = []
    partial = []
    for sec in SECTIONS:
        required = {normalize_name(c) for c in sec["characters"]}
        if required.issubset(available) and required:
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
  input[type="text"] { padding: 0.25rem 0.4rem; border-radius: 4px; border: 1px solid #ccc; width: 100%; max-width: 260px; }
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
                {% if cast.get(c) %}
                  <span class="small">({{ cast.get(c) }})</span>
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
            <b>done</b> – solid for now
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
                <span class="pill">{{ c }}{% if cast.get(c) %} ({{ cast.get(c) }}){% endif %}</span>
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
              <th>Update</th>
            </tr>
            {% for sec in results.full %}
              {% set status = state.get(sec.id, 'todo') %}
              <tr>
                <td>{{ sec.song }}</td>
                <td>{{ sec.section }}</td>
                <td>
                  <span class="pill-group">
                    {% for c in sec.characters %}
                      <span class="pill">
                        {{ c }}{% if cast.get(c) %} ({{ cast.get(c) }}){% endif %}
                      </span>
                    {% endfor %}
                  </span>
                </td>
                <td><span class="tag tag-full">FULL</span></td>
                <td><span class="tag status-{{ status }}">{{ status }}</span></td>
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
              <th>Update</th>
            </tr>
            {% for sec in results.partial %}
              {% set status = state.get(sec.id, 'todo') %}
              <tr>
                <td>{{ sec.song }}</td>
                <td>{{ sec.section }}</td>
                <td>
                  <span class="pill-group">
                    {% for c in sec.characters %}
                      <span class="pill">
                        {{ c }}{% if cast.get(c) %} ({{ cast.get(c) }}){% endif %}
                      </span>
                    {% endfor %}
                  </span>
                </td>
                <td><span class="tag tag-partial">PARTIAL</span></td>
                <td><span class="tag status-{{ status }}">{{ status }}</span></td>
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
                <span class="pill">{{ c }}{% if cast.get(c) %} ({{ cast.get(c) }}){% endif %}</span>
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
              <th>Update</th>
            </tr>
            {% for sec in results.safe %}
              {% set status = state.get(sec.id, 'todo') %}
              <tr>
                <td>{{ sec.song }}</td>
                <td>{{ sec.section }}</td>
                <td>
                  <span class="pill-group">
                    {% for c in sec.characters %}
                      <span class="pill">
                        {{ c }}{% if cast.get(c) %} ({{ cast.get(c) }}){% endif %}
                      </span>
                    {% endfor %}
                  </span>
                </td>
                <td><span class="tag tag-safe">SAFE</span></td>
                <td><span class="tag status-{{ status }}">{{ status }}</span></td>
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
  </div>

  <div class="card">
    <p class="small">
      This page summarizes each song, which characters sing in it (from all sections),
      and (if assigned) which actor is playing each role.
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
                  {{ c }}{% if cast.get(c) %} ({{ cast.get(c) }}){% endif %}
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
  </div>

  <div class="card">
    <form method="POST" action="{{ url_for('cast_page') }}">
      <p class="small">
        Enter your actors for each character. This will be used everywhere else (planner & songs pages).
      </p>
      <table>
        <tr>
          <th>Character</th>
          <th>Actor Name</th>
        </tr>
        {% for c in all_characters %}
          <tr>
            <td>{{ c }}</td>
            <td>
              <input type="text" name="actor::{{ c }}" value="{{ cast.get(c, '') }}">
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

# -------------------------------------------------------------------------
# 5. ROUTES
# -------------------------------------------------------------------------

@app.route("/", methods=["GET", "POST"])
def index():
    state = load_state()
    cast = load_cast()
    mode = None
    selected = []
    results = None
    schedule_lines = []

    if request.method == "POST" and request.path == "/":
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
        cast=cast,
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
    cast = load_cast()
    return render_template_string(
        PLANNER_TEMPLATE,
        all_characters=ALL_CHARACTERS,
        selected_characters=[],
        mode=None,
        results=None,
        state=state,
        cast=cast,
        all_sections=SECTIONS,
        schedule_lines=[line],
    )

@app.route("/songs")
def songs_page():
    cast = load_cast()
    songs = build_song_map()
    return render_template_string(
        SONGS_TEMPLATE,
        songs=songs,
        cast=cast,
    )

@app.route("/cast", methods=["GET", "POST"])
def cast_page():
    cast = load_cast()
    if request.method == "POST":
        new_cast = {}
        for key, value in request.form.items():
            if key.startswith("actor::"):
                character = key.split("::", 1)[1]
                name = value.strip()
                if name:
                    new_cast[character] = name
        save_cast(new_cast)
        cast = new_cast
        return redirect(url_for("cast_page"))

    return render_template_string(
        CAST_TEMPLATE,
        all_characters=ALL_CHARACTERS,
        cast=cast,
    )

# -------------------------------------------------------------------------
# 6. MAIN ENTRY
# -------------------------------------------------------------------------

if __name__ == "__main__":
    # For local use; for Vercel you'll adapt to their handler pattern.
    app.run(host="0.0.0.0", port=5000, debug=True)


⸻

🛠 How to run this locally

From the directory where you saved oz_rehearsal_web.py:

python -m pip install flask

python oz_rehearsal_web.py

Then go to:

http://localhost:5000

	•	Planner tab → your WITH / WITHOUT engine
	•	Songs & Required Singers tab → per-song breakdown + cast overlay
	•	Cast List tab → set who plays who

Section and cast info will be saved into:
	•	oz_state.json
	•	cast_state.json

⸻

🚀 About Vercel / madmanvo.com/wiz

You can:
	•	Wrap this Flask app with Vercel’s Python runtime (serverless)
or
	•	Port it to a small FastAPI or Next.js API route if you want to stay very Vercel-native

But structurally, everything you need is now:
	•	Pure Python data model
	•	Clear routes
	•	No hidden dependencies beyond Flask and JSON files

If you want, next step I can:
	•	Turn this into a minimal FastAPI app for Vercel’s serverless model
	•	Or generate a static JSON + JS SPA version (no backend) that uses localStorage instead of JSON files.