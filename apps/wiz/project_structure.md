# Project Structure

```
rehearsal_planner/
├── CLAUDE.md                  # Project instructions for Claude Code
├── project_plan.md            # Implementation plan
├── project_structure.md       # This file
├── requirements.txt           # Python dependencies (flask)
├── app.py                     # Flask app entry point, route definitions
├── sections.py                # SECTIONS data list (all rehearsable sections with metadata)
├── state.py                   # JSON file load/save helpers, state management functions
├── logic.py                   # Core matching logic (available/missing/audition filtering)
├── templates/
│   ├── base.html              # Shared layout: head, nav, CSS, body wrapper
│   ├── planner.html           # Main planner page (character selection, results, notes, schedule)
│   ├── songs.html             # Songs & Required Singers overview
│   ├── cast.html              # Cast List editor (character -> actor + voice type + notes)
│   └── auditions.html         # Auditions / Crosscasting helper
├── data/                      # Runtime JSON state (gitignored)
│   ├── oz_state.json          # Section statuses
│   ├── cast_state.json        # Cast assignments + actor metadata
│   └── oz_notes.json          # Rehearsal notes per section
├── venv -> ~/uv-env/rehearsal_planner  # Symlink to uv venv
├── .gitignore
└── docs/                      # Original design docs (reference only)
    ├── info.md
    ├── ui.md
    ├── updates.md
    ├── update2.md
    ├── updates3.md
    └── updates4.md
```

## Module Responsibilities

### `app.py`
- Flask app creation and configuration
- All route handlers (`/`, `/songs`, `/cast`, `/auditions`, `/status`, `/note`, `/schedule`)
- Runs on `host="0.0.0.0"`, `port=45100`

### `sections.py`
- `SECTIONS` list: all ~50 rehearsable sections
- Each section dict has: `id`, `song`, `section`, `characters`, `vocal_type`, `harmony_role`, `audition_priority`
- `ALL_CHARACTERS`: sorted unique character names derived from SECTIONS
- `all_characters()` helper function

### `state.py`
- `load_state()` / `save_state()` - section statuses from `data/oz_state.json`
- `load_cast()` / `save_cast()` - cast + actor metadata from `data/cast_state.json`
- `load_notes()` / `save_notes()` - rehearsal notes from `data/oz_notes.json`
- `get_status()` helper
- Generic `load_json_file()` / `save_json_file()` utilities
- Backward-compatible cast loading (handles old flat format)

### `logic.py`
- `sections_with_available(names)` -> (full, partial) lists
- `sections_safe_without(names)` -> (safe, blocked) lists
- `sections_for_role(role_name)` -> list of sections for that character
- `similar_sections_by_harmony(harmony, exclude_ids)` -> similar sections for crosscasting
- `build_song_map()` -> grouped song data for the songs page

### `templates/base.html`
- Common HTML head with CSS
- Navigation bar (Planner | Songs | Cast | Auditions)
- Block structure for child templates to extend

### `templates/planner.html`
- Mode selection (available vs missing)
- Character checkboxes with cast overlay
- Results tables (full/partial matches or safe/blocked sections)
- Per-row: status dropdown, notes display + add form
- Schedule builder at bottom

### `templates/songs.html`
- Table of all songs with required characters + cast overlay

### `templates/cast.html`
- Editable table: character -> actor name, voice type, notes
- Save button persists to JSON

### `templates/auditions.html`
- Role dropdown + harmony filter
- Sections for selected role
- Similar sections by harmony (crosscasting suggestions)
- Actor list with voice types and current assignments

### `data/` directory
- Created automatically on first run if missing
- All JSON files created on first write
- Gitignored — user data, not source
