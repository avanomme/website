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
from state import load_state, save_state, load_cast, save_cast, load_notes, save_notes, load_rehearsal_log, save_rehearsal_log, load_schedule, save_schedule
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
        "wiz/planner.html",
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


@wiz_bp.route("/schedule")
def schedule_page():
    from datetime import date, datetime
    from itertools import groupby

    items = load_schedule()
    items.sort(key=lambda x: (x.get("date", ""), x.get("time", "")))

    today = date.today().isoformat()
    upcoming = []
    past = []

    for date_key, group in groupby(items, key=lambda x: x.get("date", "")):
        entries = list(group)
        try:
            d = datetime.strptime(date_key, "%Y-%m-%d")
            date_display = f"{d.strftime('%A')} {d.strftime('%b')} {d.day} {d.year}"
        except Exception:
            date_display = date_key

        date_group = {"date": date_key, "date_display": date_display, "entries": entries}
        if date_key < today:
            past.append(date_group)
        else:
            upcoming.append(date_group)

    return render_template(
        "wiz/schedule.html",
        active_page="schedule",
        upcoming=upcoming,
        past=past,
        all_sections=SECTIONS,
        today=date.today().isoformat(),
    )


@wiz_bp.route("/schedule/add", methods=["POST"])
def add_schedule_item():
    from datetime import datetime

    section_id = request.form.get("section_id", "").strip()
    custom_label = request.form.get("custom_label", "").strip()

    label = custom_label
    if section_id:
        sec = next((s for s in SECTIONS if s["id"] == section_id), None)
        if sec:
            label = f"{sec['song']} – {sec['section']}"
    if not label:
        label = "(no section)"

    item = {
        "id": str(int(datetime.now().timestamp() * 1000)),
        "date": request.form.get("date", "").strip(),
        "time": request.form.get("time_block", "").strip(),
        "characters": request.form.get("chars", "").strip(),
        "section_label": label,
        "section_id": section_id,
        "created_at": datetime.now().isoformat(timespec="seconds"),
    }

    items = load_schedule()
    items.append(item)
    save_schedule(items)
    return redirect(url_for(".schedule_page"))


@wiz_bp.route("/schedule/edit", methods=["POST"])
def edit_schedule_item():
    item_id = request.form.get("item_id")
    items = load_schedule()
    for item in items:
        if item["id"] == item_id:
            item["date"] = request.form.get("date", item["date"]).strip()
            item["time"] = request.form.get("time_block", item["time"]).strip()
            item["characters"] = request.form.get("chars", item["characters"]).strip()

            section_id = request.form.get("section_id", "").strip()
            custom_label = request.form.get("custom_label", "").strip()
            label = custom_label
            if section_id:
                sec = next((s for s in SECTIONS if s["id"] == section_id), None)
                if sec:
                    label = f"{sec['song']} – {sec['section']}"
            if label:
                item["section_label"] = label
                item["section_id"] = section_id
            break
    save_schedule(items)
    return redirect(url_for(".schedule_page"))


@wiz_bp.route("/schedule/delete", methods=["POST"])
def delete_schedule_item():
    item_id = request.form.get("item_id")
    items = load_schedule()
    items = [i for i in items if i["id"] != item_id]
    save_schedule(items)
    return redirect(url_for(".schedule_page"))


@wiz_bp.route("/songs")
def songs_page():
    cast_data = load_cast()
    cast_chars = cast_data["cast"]
    songs = build_song_map()
    return render_template(
        "wiz/songs.html",
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
        "wiz/cast.html",
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
        "wiz/auditions.html",
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
        "wiz/crosscast.html",
        active_page="crosscast",
        cast_chars=cast_chars,
        actors=actors,
    )


@wiz_bp.route("/log", methods=["GET", "POST"])
def rehearsal_log_page():
    from datetime import datetime

    if request.method == "POST":
        entries = load_rehearsal_log()
        entry = {
            "id": str(int(datetime.now().timestamp())),
            "date": request.form.get("date", ""),
            "time": request.form.get("time", "").strip(),
            "songs": request.form.getlist("songs"),
            "cast_present": request.form.getlist("cast_present"),
            "notes": request.form.get("notes", "").strip(),
            "created_at": datetime.now().isoformat(timespec="seconds"),
        }
        entries.insert(0, entry)
        save_rehearsal_log(entries)
        return redirect(url_for(".rehearsal_log_page"))

    entries = load_rehearsal_log()
    cast_data = load_cast()
    cast_chars = cast_data["cast"]

    # Format date display for each entry
    for entry in entries:
        try:
            d = datetime.strptime(entry["date"], "%Y-%m-%d")
            entry["date_display"] = f"{d.strftime('%A')} {d.strftime('%b')} {d.month}/{d.day}"
        except Exception:
            entry["date_display"] = entry.get("date", "")

    # Build unique song names from sections (preserving score order)
    seen = set()
    song_names = []
    for s in SECTIONS:
        if s["song"] not in seen:
            seen.add(s["song"])
            song_names.append(s["song"])

    return render_template(
        "wiz/rehearsal_log.html",
        active_page="log",
        entries=entries,
        cast_chars=cast_chars,
        character_groups=CHARACTER_GROUPS,
        song_names=song_names,
        today=datetime.now().strftime("%Y-%m-%d"),
    )


@wiz_bp.route("/log/edit", methods=["POST"])
def edit_log_entry():
    from datetime import datetime

    entry_id = request.form.get("entry_id")
    entries = load_rehearsal_log()
    for entry in entries:
        if entry["id"] == entry_id:
            entry["date"] = request.form.get("date", entry["date"])
            entry["time"] = request.form.get("time", "").strip()
            entry["songs"] = request.form.getlist("songs")
            entry["cast_present"] = request.form.getlist("cast_present")
            entry["notes"] = request.form.get("notes", "").strip()
            break
    save_rehearsal_log(entries)
    return redirect(url_for(".rehearsal_log_page"))


@wiz_bp.route("/log/delete", methods=["POST"])
def delete_log_entry():
    entry_id = request.form.get("entry_id")
    entries = load_rehearsal_log()
    entries = [e for e in entries if e["id"] != entry_id]
    save_rehearsal_log(entries)
    return redirect(url_for(".rehearsal_log_page"))


# -------------------------------------------------------------------------
# MAIN ENTRY (standalone mode)
# -------------------------------------------------------------------------

if __name__ == "__main__":
    app = Flask(__name__)
    app.register_blueprint(wiz_bp)
    app.run(host="0.0.0.0", port=45100, debug=True)
