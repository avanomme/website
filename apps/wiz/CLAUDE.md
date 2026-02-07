# Wizard of Oz Rehearsal Planner

## Project Overview

A Flask web application for managing rehearsals for a Wizard of Oz musical production. Character-driven, section-level planning tool that replaces spreadsheet-based rehearsal management.

**Port:** 45100
**URL:** http://localhost:45100
**Python:** 3.11+ via `uv`
**Framework:** Flask
**Data Storage:** JSON files (no database)
**Future deployment:** Vercel (via Git repo)

## Core Concepts

- **Section**: A specific rehearsable chunk of a song (e.g., "Scarecrow solo & verse" within "If I Only Had a Brain"). NOT whole songs.
- **Character**: A role in the show (e.g., Dorothy, Scarecrow, Crows, Girls Chorus). These are character names, not actor names.
- **Status**: Per-section progress tracking: `todo` | `needs_more` | `done`
- **Cast**: Mapping of character -> actor name, plus actor metadata (voice type, notes)
- **Vocal metadata**: Per-section info for crosscasting: `vocal_type` (solo/small_group/ensemble/spoken), `harmony_role` (high/middle/low/unison/mixed), `audition_priority` (1-3)

## Pages / Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET/POST | **Planner** - Main page. Select characters (available or missing), see matching sections, update status, add notes |
| `/songs` | GET | **Songs & Required Singers** - Per-song breakdown showing all characters needed |
| `/cast` | GET/POST | **Cast List** - Character -> Actor mapping with voice type and notes |
| `/auditions` | GET/POST | **Auditions / Crosscasting** - Pick a role + harmony filter, see relevant sections + similar sections |
| `/status` | POST | Update section status (todo/needs_more/done), redirects back |
| `/note` | POST | Add rehearsal note to a section, redirects back |
| `/schedule` | POST | Quick schedule builder, outputs `time \| Characters \| Song/Section` |

## Data Files (JSON, gitignored)

- `data/oz_state.json` - Section statuses `{ "section_id": "todo|needs_more|done" }`
- `data/cast_state.json` - Cast + actor metadata `{ "cast": { char: actor }, "actors": { actor: { voice_type, notes } } }`
- `data/oz_notes.json` - Rehearsal notes `{ "section_id": ["note1", "note2"] }`

## Environment Setup

Uses `uv` for Python environment management (per global CLAUDE.md):
```bash
uvn 3.11 rehearsal_planner
reloadz
ln -s ~/uv-env/rehearsal_planner venv
rehearsal_planner  # activate
uv pip install flask
```

## Running

```bash
python app.py
# Opens on http://localhost:45100
```

## Key Design Decisions

- Templates use Jinja2 files in `templates/` directory (not inline `render_template_string`)
- Section data lives in `sections.py` as a Python list — easy to edit, no DB needed
- All state persists in JSON files under `data/` directory
- No authentication (local use only for now)
- Vercel deployment will be added later via git + serverless adapter

## Show Data

The show is "The Wizard of Oz" (RSC/TRW version). Sections are numbered by the score (No. 1, No. 4, No. 9, etc.). ~50 sections covering the full show. ~30 unique character/group names.
