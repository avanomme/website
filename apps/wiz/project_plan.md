# Implementation Plan

## Source Material

All design specs come from the `.md` files in the project root. The evolution was:

1. `info.md` — Original CLI concept (character-driven, section-level planning)
2. `ui.md` — First Flask web version (single page, checkboxes, status tracking)
3. `update2.md` — Multi-page version (added Songs page, Cast page, navigation)
4. `updates3.md` — Design doc for notes, crosscasting, vocal metadata, auditions
5. `updates4.md` — **Final complete version** with all features integrated

`updates4.md` is the canonical source. It contains the complete working code in a single-file format that we will refactor into a proper project structure.

---

## Phase 1: Project Setup

- [ ] Create uv virtual environment (`uvn 3.11 rehearsal_planner`)
- [ ] Symlink venv (`ln -s ~/uv-env/rehearsal_planner venv`)
- [ ] Create `requirements.txt` with `flask`
- [ ] Install dependencies (`uv pip install flask`)
- [ ] Create `data/` directory for JSON state files
- [ ] Create `.gitignore` (venv, data/, __pycache__, .pyc, .DS_Store)

## Phase 2: Core Data & Logic Modules

- [ ] Create `sections.py`
  - Extract the full SECTIONS list from `updates4.md` (all ~50 sections with vocal metadata)
  - Extract `all_characters()` function and `ALL_CHARACTERS` constant

- [ ] Create `state.py`
  - Extract JSON load/save helpers
  - `load_state()`, `save_state()`, `load_cast()`, `save_cast()`, `load_notes()`, `save_notes()`
  - `get_status()`, `normalize_name()`
  - All file paths point to `data/` subdirectory

- [ ] Create `logic.py`
  - `sections_with_available(names)` — returns (full, partial) section lists
  - `sections_safe_without(names)` — returns (safe, blocked) section lists
  - `sections_for_role(role_name)` — sections for a specific character
  - `similar_sections_by_harmony(harmony, exclude_ids)` — crosscasting helper
  - `build_song_map()` — groups sections by song for the songs page

## Phase 3: Templates

- [ ] Create `templates/base.html`
  - Full CSS from `updates4.md` BASE_CSS
  - Navigation bar with links to all 4 pages
  - Jinja2 block structure (`{% block content %}`)

- [ ] Create `templates/planner.html` (extends base)
  - Mode radio buttons (available / missing)
  - Character checkbox list with cast overlay
  - "Update Suggestions" button
  - Results: full/partial match tables OR safe/blocked tables
  - Each row: song, section, characters, match tag, status, notes, update form
  - Schedule builder form at bottom

- [ ] Create `templates/songs.html` (extends base)
  - Table: Song | Characters Required (with cast overlay)

- [ ] Create `templates/cast.html` (extends base)
  - Editable table: Character | Actor Name | Voice Type | Notes
  - Save Cast button

- [ ] Create `templates/auditions.html` (extends base)
  - Role dropdown, harmony filter dropdown
  - "Show Sections" button
  - Role sections table (song, section, characters, vocal type, harmony, priority)
  - Similar sections table (crosscasting suggestions)
  - Current actors table with voice types and assignments

## Phase 4: Flask App & Routes

- [ ] Create `app.py`
  - Flask app initialization
  - Import from sections, state, logic modules
  - Route: `GET/POST /` — Planner page
  - Route: `POST /status` — Update section status, redirect back
  - Route: `POST /note` — Add rehearsal note, redirect back
  - Route: `POST /schedule` — Build schedule line, re-render planner
  - Route: `GET /songs` — Songs page
  - Route: `GET/POST /cast` — Cast page
  - Route: `GET/POST /auditions` — Auditions page
  - `if __name__ == "__main__": app.run(host="0.0.0.0", port=45100, debug=True)`

## Phase 5: Test & Verify

- [ ] Run `python app.py` — confirm starts on port 45100
- [ ] Test Planner page:
  - Select "Available" mode, check Dorothy/Scarecrow/Tinman/Lion, verify full + partial matches
  - Select "Missing" mode, check the 4 leads, verify ensemble-only sections shown
  - Update a section status, verify it persists after reload
  - Add a rehearsal note, verify it displays
- [ ] Test Songs page: verify all songs listed with characters
- [ ] Test Cast page: enter actor names + voice types, save, verify persistence
- [ ] Test Auditions page: select Crows + "mixed" harmony, verify role sections + similar sections

## Phase 6: Organize Reference Docs

- [ ] Create `docs/` directory
- [ ] Move original .md files (info.md, ui.md, updates.md, update2.md, updates3.md, updates4.md) into `docs/`

---

## Implementation Notes

- Use `render_template()` (not `render_template_string`) since we're using proper template files
- All JSON data files go in `data/` — auto-created on first write if missing
- The `data/` directory is gitignored so user data never hits the repo
- Port is **45100** (not the default 5000)
- Eventually this will be deployed to Vercel, but that's a separate phase after local is working
