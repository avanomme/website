Yeah, honestly? At this point a tiny custom program is going to be way less annoying than trying to beat Google Sheets into being a rehearsal brain.

Let’s make it:
	•	Character-driven (not actor-driven)
	•	Section-based (not “all or nothing per song”)
	•	Able to:
	•	Let you type who you have → see what you can rehearse
	•	Let you type who you don’t have → see what’s still possible
	•	Track status per section: todo / needs_more / done
	•	Spit out a simple schedule like:
10:00–10:30 | Dorothy, Scarecrow | If I Only Had a Brain – Verse 1

Below is a single Python script you can drop into a folder and run from the CLI.

You can expand the song/section data as you go.

⸻

🧠 Design (in normal-human terms)
	•	You maintain a list of rehearsable sections, like:
	•	If I Only Had a Brain – Scarecrow solo
	•	Munchkinland – Lollipop Guild trio
	•	Poppies – Round (Dorothy, S/T/L)
	•	Each section has:
	•	id (short code, like "brain_scarecrow_solo")
	•	song
	•	section
	•	characters (list of character names)
	•	status (tracked separately: todo, needs_more, done)
	•	The script lets you:
	1.	Set available characters for this block (e.g. 10–12).
	2.	Ask:
	•	“What can I rehearse with these characters?”
	•	“What can I rehearse without these missing characters?”
	3.	Mark sections as:
	•	todo
	•	needs_more
	•	done
	4.	Build a quick schedule and print rows as:
time | Characters | Song / Section
	•	Persistent state (statuses) is stored in a simple oz_state.json in the same folder.

You can edit the sections list directly in the script whenever you want to add more.

⸻

🧾 The Script: oz_rehearsal_planner.py

#!/usr/bin/env python3
"""
Wizard of Oz Rehearsal Planner (Character-based, Section-level)

Usage:
    python oz_rehearsal_planner.py
"""

import json
from pathlib import Path
from typing import List, Dict

STATE_FILE = Path("oz_state.json")

# -------------------------------------------------------------------------
# 1. DEFINE YOUR REHEARSABLE SECTIONS HERE
#    You can extend this list as much as you want.
# -------------------------------------------------------------------------

SECTIONS: List[Dict] = [
    # --- OVER THE RAINBOW ---
    {
        "id": "otr_dorothy_full",
        "song": "Over the Rainbow",
        "section": "Dorothy solo (full song)",
        "characters": ["Dorothy"],
    },

    # --- MUNCHKINLAND / DING DONG SEQUENCE ---
    {
        "id": "munch_girls_chorus",
        "song": "Munchkinland",
        "section": "Girls chorus",
        "characters": ["Girls Chorus"],
    },
    {
        "id": "munch_lullaby_league",
        "song": "Munchkinland",
        "section": "Lullaby League trio",
        "characters": ["Lullaby League"],
    },
    {
        "id": "munch_lollipop_guild",
        "song": "Munchkinland",
        "section": "Lollipop Guild trio",
        "characters": ["Lollipop Guild"],
    },
    {
        "id": "munch_dingdong_speaks",
        "song": "Ding Dong (Sequence)",
        "section": "Mayor/Barrister/City Fathers/Coroner spoken",
        "characters": [
            "Mayor", "Barrister", "City Father 1",
            "City Father 2", "City Father 3", "Coroner"
        ],
    },

    # --- IF I ONLY HAD A BRAIN ---
    {
        "id": "brain_scarecrow_solo",
        "song": "If I Only Had a Brain",
        "section": "Scarecrow solo & main verse",
        "characters": ["Scarecrow"],
    },
    {
        "id": "brain_crows_trio",
        "song": "If I Only Had a Brain",
        "section": "Three Crows harmony",
        "characters": ["Crows"],
    },

    # --- IF I ONLY HAD A HEART ---
    {
        "id": "heart_tinman_solo",
        "song": "If I Only Had a Heart",
        "section": "Tinman solo",
        "characters": ["Tinman"],
    },
    {
        "id": "heart_trees_bits",
        "song": "If I Only Had a Heart",
        "section": "Three Trees bits",
        "characters": ["Trees"],
    },

    # --- IF I ONLY HAD THE NERVE ---
    {
        "id": "nerve_lion_solo",
        "song": "If I Only Had the Nerve",
        "section": "Lion solo & trio unison",
        "characters": ["Lion", "Dorothy", "Scarecrow", "Tinman"],
    },

    # --- POPPIES ---
    {
        "id": "poppies_girls",
        "song": "Poppies",
        "section": "Girls chorus",
        "characters": ["Girls Chorus"],
    },
    {
        "id": "poppies_boys",
        "song": "Poppies",
        "section": "Boys chorus",
        "characters": ["Boys Chorus"],
    },
    {
        "id": "poppies_glinda",
        "song": "Poppies",
        "section": "Glinda solo",
        "characters": ["Glinda"],
    },
    {
        "id": "poppies_round_leads",
        "song": "Poppies",
        "section": "Round (Dorothy, Scarecrow, Tinman, Lion)",
        "characters": ["Dorothy", "Scarecrow", "Tinman", "Lion"],
    },

    # --- MERRY OLD LAND OF OZ ---
    {
        "id": "merry_leads",
        "song": "Merry Old Land of Oz",
        "section": "Leads' lines (D/S/T/L only)",
        "characters": ["Dorothy", "Scarecrow", "Tinman", "Lion"],
    },
    {
        "id": "merry_oz_ensemble",
        "song": "Merry Old Land of Oz",
        "section": "Beauticians/Polishers/Manicurists/Ozians",
        "characters": ["Beauticians", "Polishers", "Manicurists", "Ozians"],
    },
    {
        "id": "merry_guard_bits",
        "song": "Merry Old Land of Oz",
        "section": "Emerald City Guard bits",
        "characters": ["Emerald City Guard"],
    },

    # --- WINKIES / WINKIE MARCH ---
    {
        "id": "winkies_march_chant",
        "song": "March of the Winkies",
        "section": "Winkie chant & march",
        "characters": ["Winkies"],
    },
    {
        "id": "winkies_captain",
        "song": "March of the Winkies",
        "section": "Winkie Captain spoken/sung bits",
        "characters": ["Winkie Captain"],
    },

    # --- JITTERBUG ---
    {
        "id": "jitter_leads",
        "song": "Jitterbug",
        "section": "Lead parts (D/S/T/L)",
        "characters": ["Dorothy", "Scarecrow", "Tinman", "Lion"],
    },
    {
        "id": "jitter_chorus",
        "song": "Jitterbug",
        "section": "Jitterbug 3-part chorus",
        "characters": ["Jitterbug Chorus"],
    },
    {
        "id": "jitter_featured",
        "song": "Jitterbug",
        "section": "Featured Jitterbugs",
        "characters": ["Featured Jitterbugs"],
    },

    # --- REPRISES / ENSEMBLE ---
    {
        "id": "wiz_reprise_3",
        "song": "We’re Off to See the Wizard (Reprise 3)",
        "section": "Quartet D/S/T/L",
        "characters": ["Dorothy", "Scarecrow", "Tinman", "Lion"],
    },
]

# -------------------------------------------------------------------------
# 2. STATE MANAGEMENT (status per section)
# -------------------------------------------------------------------------

def load_state() -> Dict[str, str]:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            return {}
    return {}


def save_state(state: Dict[str, str]) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2))


def get_status(section_id: str, state: Dict[str, str]) -> str:
    return state.get(section_id, "todo")  # default status


# -------------------------------------------------------------------------
# 3. CORE LOGIC
# -------------------------------------------------------------------------

def normalize_name(name: str) -> str:
    return name.strip()


def find_sections_with_available_chars(available: List[str], state: Dict[str, str]):
    available_set = {normalize_name(c) for c in available if c.strip()}
    results = []
    for sec in SECTIONS:
        required = {normalize_name(c) for c in sec["characters"]}
        if required.issubset(available_set):
            results.append((sec, "FULL"))  # all required present
        elif required & available_set:
            results.append((sec, "PARTIAL"))  # at least one present
    return results


def find_sections_safe_without(missing: List[str], state: Dict[str, str]):
    missing_set = {normalize_name(c) for c in missing if c.strip()}
    results = []
    for sec in SECTIONS:
        required = {normalize_name(c) for c in sec["characters"]}
        if not (required & missing_set):
            results.append(sec)
    return results


def print_section(sec: Dict, state: Dict[str, str], prefix: str = ""):
    status = get_status(sec["id"], state)
    chars = ", ".join(sec["characters"])
    print(f"{prefix}[{sec['id']}] {sec['song']} – {sec['section']} "
          f"\n    Characters: {chars}"
          f"\n    Status: {status}\n")


# -------------------------------------------------------------------------
# 4. CLI MENU
# -------------------------------------------------------------------------

def prompt_list(prompt: str) -> List[str]:
    raw = input(prompt).strip()
    if not raw:
        return []
    return [c.strip() for c in raw.split(",") if c.strip()]


def menu():
    state = load_state()
    while True:
        print("\n=== Wizard of Oz Rehearsal Planner ===")
        print("1) List all sections and status")
        print("2) Given AVAILABLE characters, suggest sections")
        print("3) Given MISSING characters, suggest sections")
        print("4) Update status of a section (todo / needs_more / done)")
        print("5) Build a quick schedule (time | Characters | Song/Section)")
        print("0) Quit")
        choice = input("Select an option: ").strip()

        if choice == "0":
            save_state(state)
            print("Goodbye!")
            break

        elif choice == "1":
            print("\nAll sections:")
            for sec in SECTIONS:
                print_section(sec, state)

        elif choice == "2":
            available = prompt_list(
                "Enter AVAILABLE characters (comma-separated, e.g. Dorothy, Scarecrow, Tinman, Lion): "
            )
            matches = find_sections_with_available_chars(available, state)
            if not matches:
                print("\nNo sections found for that set of characters.")
            else:
                print("\nSuggested sections WITH these characters:")
                for sec, kind in matches:
                    prefix = f"[{kind}] "
                    print_section(sec, state, prefix=prefix)

        elif choice == "3":
            missing = prompt_list(
                "Enter MISSING characters (comma-separated): "
            )
            matches = find_sections_safe_without(missing, state)
            if not matches:
                print("\nNo sections are safe without those characters.")
            else:
                print("\nSections you can rehearse WITHOUT those characters:")
                for sec in matches:
                    print_section(sec, state)

        elif choice == "4":
            sec_id = input("Enter section id to update (see [id] in list): ").strip()
            matching = [s for s in SECTIONS if s["id"] == sec_id]
            if not matching:
                print("No such section id.")
                continue
            new_status = input("Enter new status (todo / needs_more / done): ").strip().lower()
            if new_status not in {"todo", "needs_more", "done"}:
                print("Invalid status.")
                continue
            state[sec_id] = new_status
            save_state(state)
            print(f"Updated {sec_id} to status '{new_status}'.")

        elif choice == "5":
            print("\nBuild rehearsal lines (ends when you submit empty time).")
            lines = []
            while True:
                time_block = input("Time (e.g. 10:00-10:30) [blank to finish]: ").strip()
                if not time_block:
                    break
                chars = input("Characters (e.g. Dorothy, Scarecrow): ").strip()
                sec_id = input("Section id (or free text song/section): ").strip()
                # If they type a known id, expand it nicely:
                label = sec_id
                found = [s for s in SECTIONS if s["id"] == sec_id]
                if found:
                    s = found[0]
                    label = f"{s['song']} – {s['section']}"
                lines.append((time_block, chars, label))

            print("\n==== Rehearsal Schedule (copy/paste) ====")
            print("time | Characters | Song/Section")
            for t, c, s in lines:
                print(f"{t} | {c} | {s}")
            print("========================================\n")

        else:
            print("Invalid choice. Try again.")


if __name__ == "__main__":
    menu()


⸻

🧩 How this matches what you asked for

“For example, I have Dorothy Scarecrow Lion and Tinman from 10–12 today…”

	1.	Run the script:

python oz_rehearsal_planner.py


	2.	Choose option 2 (Given AVAILABLE characters).
	3.	Enter:

Dorothy, Scarecrow, Tinman, Lion


	4.	It will show:
	•	Full Wizard reprises
	•	Over the Rainbow
	•	Brain/Heart/Nerve leads
	•	Poppies round
	•	Jitterbug leads
	•	Merry Old Land leads
	•	etc.

You can then use option 5 to build:

10:00-10:20 | Dorothy | Over the Rainbow – full solo
10:20-10:40 | Scarecrow | If I Only Had a Brain – Scarecrow solo & verse
10:40-11:00 | Tinman | If I Only Had a Heart – Tinman solo
11:00-11:20 | Lion | If I Only Had the Nerve – Lion solo
11:20-12:00 | Dorothy, Scarecrow, Tinman, Lion | Poppies – Round (D/S/T/L)

…and paste that straight into your rehearsal doc.

“…then I have Scarecrow Lion and Tinman from 12–1…”

Run option 2 again with:

Scarecrow, Tinman, Lion

Find all sections where those 3 are either full or partial → build another hour.

“…tomorrow I have everyone but the 4 leads from 1–3”

Use option 3 (MISSING characters) with:

Dorothy, Scarecrow, Tinman, Lion

It’ll show all the ensemble-only sections that are safe to work:
Munchkinland, Winkies, Jitterbug chorus, Oz ensemble, etc.

⸻

🛠 Customizing it for your production

You can:
	•	Add more sections to SECTIONS at the top (I kept it reasonably small so it’s readable).
	•	Use the status to track:
	•	todo – not yet touched
	•	needs_more – we hit it, but it’s shaky
	•	done – good enough for now

Over time, the planner becomes a real “rehearsal map” of your show.

⸻

If you want, I can:
	•	Flesh out all remaining song sections from your part breakdown into this format.
	•	Or convert this into a tiny local web app (still simple: Flask + one HTML page) with checkboxes instead of typing.

But this script already gives you:

time | Characters | Song

exactly how you described, with actual brains behind it.


