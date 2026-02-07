"""
Freaky Friday Rehearsal Planner — Section Data

All rehearsable sections of the show, with vocal metadata.
Edit this file to add/remove/update sections.

Based on the full two-act MTI stage version.
"""

SECTIONS = [
    # ===================================================================
    # ACT I
    # ===================================================================

    # --- PROLOGUE ---
    {
        "id": "act1_prologue_ellie_intro",
        "song": "Prologue",
        "section": "Ellie intro monologue / worst day setup",
        "characters": ["Ellie"],
        "vocal_type": "solo",
        "harmony_role": "high",
        "rehearsal_priority": 2,
    },

    # --- JUST ONE DAY ---
    {
        "id": "act1_just_one_day_family_chaos",
        "song": "Just One Day",
        "section": "Family morning chaos",
        "characters": ["Ellie", "Katherine", "Fletcher", "Mike"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
    },
    {
        "id": "act1_just_one_day_school_chorus",
        "song": "Just One Day",
        "section": "School / company chorus",
        "characters": ["Ellie", "Katherine", "Gretchen", "Hannah", "Savannah", "Students", "Parents"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },

    # --- THE HOURGLASS ---
    {
        "id": "act1_hourglass_argument",
        "song": "The Hourglass",
        "section": "Argument over the hourglass",
        "characters": ["Ellie", "Katherine"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },
    {
        "id": "act1_hourglass_body_swap",
        "song": "The Hourglass",
        "section": "Body-swap spell moment",
        "characters": ["Ellie", "Katherine"],
        "vocal_type": "small_group",
        "harmony_role": "unison",
        "rehearsal_priority": 2,
    },

    # --- I GOT THIS ---
    {
        "id": "act1_i_got_this_pep_start",
        "song": "I Got This",
        "section": "Katherine-as-Ellie at school (pep start)",
        "characters": ["Katherine", "Adam", "Savannah", "Students", "Teachers"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },
    {
        "id": "act1_i_got_this_company_build",
        "song": "I Got This",
        "section": "Company build / overlapping lives",
        "characters": ["Ellie", "Katherine", "Adam", "Savannah", "Students", "Teachers"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },

    # --- WHAT YOU GOT ---
    {
        "id": "act1_what_you_got_interview",
        "song": "What You Got",
        "section": "Interview verse (Weddings Magazine)",
        "characters": ["Katherine", "Torrey", "Danielle", "Louis"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },
    {
        "id": "act1_what_you_got_kitchen",
        "song": "What You Got",
        "section": "Kitchen party / cake chaos",
        "characters": ["Katherine", "Torrey", "Danielle", "Louis", "Catering Staff"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },

    # --- OH, BIOLOGY ---
    {
        "id": "act1_oh_biology_main",
        "song": "Oh, Biology",
        "section": "Main solo (Ellie in Katherine's body freaking out)",
        "characters": ["Ellie", "Adam"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
    },
    {
        "id": "act1_oh_biology_class",
        "song": "Oh, Biology",
        "section": "Class reactions / hallway students",
        "characters": ["Ellie", "Savannah", "Gretchen", "Hannah", "Parker", "Wells", "Students"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },

    # --- VOWS ---
    {
        "id": "act1_vows_mike_solo",
        "song": "Vows",
        "section": "Mike solo verses",
        "characters": ["Mike"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "rehearsal_priority": 3,
    },

    # --- BUSTED ---
    {
        "id": "act1_busted_secrets",
        "song": "Busted",
        "section": "Kids' secrets & parents' secrets",
        "characters": ["Ellie", "Katherine", "Gretchen", "Hannah", "Savannah", "Parents", "Students"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
    },
    {
        "id": "act1_busted_confrontation",
        "song": "Busted",
        "section": "Ellie & Katherine confrontation / mementos",
        "characters": ["Ellie", "Katherine"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
    },

    # --- SOMEBODY HAS GOT TO TAKE THE BLAME ---
    {
        "id": "act1_blame_conference",
        "song": "Somebody Has Got to Take the Blame",
        "section": "Parent/teacher conference (adult quartet)",
        "characters": ["Katherine", "Ellie", "Dr. Ehrin", "Señor O'Brien", "Mrs. Luckenbill"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },

    # --- I GOT THIS (REPRISE) ---
    {
        "id": "act1_i_got_this_reprise",
        "song": "I Got This (Reprise)",
        "section": "Katherine short reprise",
        "characters": ["Katherine"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "rehearsal_priority": 1,
    },

    # --- WATCH YOUR BACK ---
    {
        "id": "act1_watch_your_back_gym",
        "song": "Watch Your Back",
        "section": "Gym test / Ms. Meyers feature",
        "characters": ["Ms. Meyers", "Katherine", "Students"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },
    {
        "id": "act1_watch_your_back_gossip",
        "song": "Watch Your Back",
        "section": "School gossip & social hierarchy",
        "characters": ["Ellie", "Adam", "Gretchen", "Hannah", "Savannah", "Students"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },

    # --- PARENTS LIE ---
    {
        "id": "act1_parents_lie_ballad",
        "song": "Parents Lie",
        "section": "Katherine ballad (telling Fletcher the truth)",
        "characters": ["Katherine"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "rehearsal_priority": 3,
    },

    # --- JUST ONE DAY (REPRISE) ---
    {
        "id": "act1_just_one_day_reprise",
        "song": "Just One Day (Reprise)",
        "section": "Rehearsal dinner chaos / everyone's lives falling apart",
        "characters": ["Ellie", "Katherine", "Fletcher", "Torrey", "Gretchen", "Hannah", "Savannah", "Parents", "Wedding Guests", "Company"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
    },

    # ===================================================================
    # ACT II
    # ===================================================================

    # --- NOT MYSELF TODAY ---
    {
        "id": "act2_not_myself_today",
        "song": "Not Myself Today",
        "section": "Company panic over missing Fletcher",
        "characters": ["Katherine", "Ellie", "Torrey", "Wedding Guests", "Parents", "Company"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },

    # --- WOMEN AND SANDWICHES ---
    {
        "id": "act2_women_sandwiches",
        "song": "Women and Sandwiches",
        "section": "Bus stop duet",
        "characters": ["Adam", "Fletcher"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },

    # --- BRING MY BABY (BROTHER) HOME ---
    {
        "id": "act2_bring_baby_home",
        "song": "Bring My Baby (Brother) Home",
        "section": "Family + officers panic song",
        "characters": ["Katherine", "Ellie", "Mike", "Officer Sitz", "Officer Kowalski"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
    },

    # --- GO ---
    {
        "id": "act2_go_hunt_lead",
        "song": "Go",
        "section": "Hunt lead verse (Adam & Ellie)",
        "characters": ["Adam", "Ellie", "Gretchen", "Hannah"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
    },
    {
        "id": "act2_go_hunt_company",
        "song": "Go",
        "section": "Full Hunt company / city runaround",
        "characters": ["Adam", "Ellie", "Gretchen", "Hannah", "Wells", "Parker", "Savannah", "Savannah's Minions", "Students", "Company"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },

    # --- AFTER ALL OF THIS AND EVERYTHING ---
    {
        "id": "act2_after_all",
        "song": "After All of This and Everything",
        "section": "Katherine & Fletcher quiet scene",
        "characters": ["Katherine", "Fletcher"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },

    # --- NO MORE FEAR ---
    {
        "id": "act2_no_more_fear",
        "song": "No More Fear",
        "section": "Ellie power ballad (hourglass fight / Mrs. Time's shop)",
        "characters": ["Ellie", "Savannah", "Mrs. Time", "Adam", "Students"],
        "vocal_type": "solo",
        "harmony_role": "high",
        "rehearsal_priority": 3,
    },

    # --- THE OTHER HOURGLASS ---
    {
        "id": "act2_other_hourglass",
        "song": "The Other Hourglass",
        "section": "Katherine & Ellie duet (accepting each other's lives)",
        "characters": ["Ellie", "Katherine"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
    },

    # --- TODAY AND EV'RY DAY ---
    {
        "id": "act2_today_ceremony",
        "song": "Today and Ev'ry Day",
        "section": "Ceremony & vows (small group)",
        "characters": ["Ellie", "Katherine", "Mike", "Pastor Bruno"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
    },
    {
        "id": "act2_today_finale",
        "song": "Today and Ev'ry Day",
        "section": "Finale company / wedding celebration",
        "characters": ["Ellie", "Katherine", "Fletcher", "Mike", "Torrey", "Adam", "Gretchen", "Hannah", "Savannah", "Parents", "Wedding Guests", "Company"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
    },
]


def all_characters():
    """Return sorted list of all unique character names across all sections."""
    names = set()
    for sec in SECTIONS:
        for c in sec["characters"]:
            names.add(c)
    return sorted(names)


ALL_CHARACTERS = all_characters()

# Character groups for easier selection in the UI
CHARACTER_GROUPS = [
    ("Leads", [
        "Ellie", "Katherine", "Fletcher", "Mike", "Adam", "Savannah", "Torrey",
    ]),
    ("Featured Teens", [
        "Gretchen", "Hannah", "Parker", "Wells", "Laurel",
    ]),
    ("Featured Adults", [
        "Danielle", "Louis", u"Se\u00f1or O'Brien", "Dr. Ehrin", "Mrs. Luckenbill",
        "Ms. Meyers", "Grandpa Gordon", "Grandma Helen", "Pastor Bruno",
        "Mrs. Time", "Officer Sitz", "Officer Kowalski",
        "Adam's Mom", "Gretchen's Mom", "Parker's Dad",
    ]),
    ("Ensemble / Groups", [
        "Students", "Teachers", "Parents", "Catering Staff",
        "Savannah's Minions", "Wedding Guests", "Company",
    ]),
]
