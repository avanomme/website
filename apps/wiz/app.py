#!/usr/bin/env python3
"""
Wizard of Oz Rehearsal Planner – Web UI

Run locally:
    python app.py

Then open:
    http://localhost:45100

Also importable as a Flask Blueprint for integration into a parent app.
"""

from flask import Blueprint, Flask, render_template, request, redirect, url_for

from sections import SECTIONS, ALL_CHARACTERS, CHARACTER_GROUPS
from state import load_state, save_state, load_cast, save_cast, load_notes, save_notes
from logic import (
    sections_with_available,
    sections_safe_without,
    sections_for_role,
    similar_sections_by_harmony,
    build_song_map,
)

import os as _os
_WIZ_DIR = _os.path.dirname(_os.path.abspath(__file__))

wiz_bp = Blueprint('wiz', __name__,
                   template_folder='templates',
                   root_path=_WIZ_DIR)


# -------------------------------------------------------------------------
# ROUTES
# -------------------------------------------------------------------------

@wiz_bp.route("/", methods=["GET", "POST"])
def index():
    state = load_state()
    cast_data = load_cast()
    cast_chars = cast_data["cast"]
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

    return render_template(
        "planner.html",
        active_page="planner",
        all_characters=ALL_CHARACTERS,
        character_groups=CHARACTER_GROUPS,
        selected_characters=selected,
        mode=mode,
        results=results,
        state=state,
        notes=notes,
        cast_chars=cast_chars,
        all_sections=SECTIONS,
        schedule_lines=schedule_lines,
    )


@wiz_bp.route("/status", methods=["POST"])
def update_status():
    section_id = request.form.get("section_id")
    new_status = request.form.get("status", "todo")
    state = load_state()
    if section_id:
        state[section_id] = new_status
        save_state(state)
    ref = request.headers.get("Referer") or url_for(".index")
    return redirect(ref)


@wiz_bp.route("/note", methods=["POST"])
def add_note():
    section_id = request.form.get("section_id")
    note = (request.form.get("note") or "").strip()
    if section_id and note:
        notes = load_notes()
        notes.setdefault(section_id, []).append(note)
        save_notes(notes)
    ref = request.headers.get("Referer") or url_for(".index")
    return redirect(ref)


@wiz_bp.route("/schedule", methods=["POST"])
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
    notes = load_notes()

    return render_template(
        "planner.html",
        active_page="planner",
        all_characters=ALL_CHARACTERS,
        character_groups=CHARACTER_GROUPS,
        selected_characters=[],
        mode=None,
        results=None,
        state=state,
        notes=notes,
        cast_chars=cast_chars,
        all_sections=SECTIONS,
        schedule_lines=[line],
    )


@wiz_bp.route("/songs")
def songs_page():
    cast_data = load_cast()
    cast_chars = cast_data["cast"]
    songs = build_song_map()
    return render_template(
        "songs.html",
        active_page="songs",
        songs=songs,
        cast_chars=cast_chars,
    )


@wiz_bp.route("/cast", methods=["GET", "POST"])
def cast_page():
    cast_data = load_cast()
    cast_chars = cast_data["cast"]
    actors = cast_data["actors"]

    if request.method == "POST":
        new_cast_chars = {}
        new_actors = {}

        # First pass: get all actor names per character
        char_to_actor = {}
        for key, value in request.form.items():
            if key.startswith("actor::"):
                character = key.split("::", 1)[1]
                actor_name = value.strip()
                if actor_name:
                    char_to_actor[character] = actor_name

        # Second pass: build actor metadata
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

        cast_data = {"cast": char_to_actor, "actors": new_actors}
        save_cast(cast_data)
        return redirect(url_for(".cast_page"))

    return render_template(
        "cast.html",
        active_page="cast",
        all_characters=ALL_CHARACTERS,
        character_groups=CHARACTER_GROUPS,
        cast_chars=cast_chars,
        actors=actors,
    )


@wiz_bp.route("/auditions", methods=["GET", "POST"])
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

    return render_template(
        "auditions.html",
        active_page="auditions",
        all_characters=ALL_CHARACTERS,
        selected_role=selected_role,
        selected_harmony=selected_harmony,
        role_sections=role_sections,
        similar_sections=similar,
        cast_chars=cast_chars,
        actors=actors,
    )


@wiz_bp.route("/crosscast")
def crosscast_page():
    cast_data = load_cast()
    cast_chars = cast_data["cast"]
    actors = cast_data["actors"]
    return render_template(
        "crosscast.html",
        active_page="crosscast",
        cast_chars=cast_chars,
        actors=actors,
    )


# -------------------------------------------------------------------------
# MAIN ENTRY (standalone mode)
# -------------------------------------------------------------------------

if __name__ == "__main__":
    app = Flask(__name__)
    app.register_blueprint(wiz_bp)
    app.run(host="0.0.0.0", port=45100, debug=True)
