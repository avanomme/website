"""
Descendants: The Musical — Section Data

All rehearsable sections of the show, with vocal metadata.
Based on the full two-act MTI stage version.
"""

SECTIONS = [
    # ===================================================================
    # ACT I
    # ===================================================================

    # --- ROTTEN TO THE CORE ---
    {
        "id": "act1_rotten_vk_intros",
        "song": "Rotten to the Core",
        "section": "VK Introductions (Mal, Evie, Jay, Carlos)",
        "characters": ["Mal", "Evie", "Jay", "Carlos", "VK Kids"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
        "harmony_difficulty": 2,
    },
    {
        "id": "act1_rotten_mal_solo",
        "song": "Rotten to the Core",
        "section": "Mal Solo Breakdown",
        "characters": ["Mal"],
        "vocal_type": "solo",
        "harmony_role": "high",
        "rehearsal_priority": 3,
        "harmony_difficulty": 1,
    },
    {
        "id": "act1_rotten_company_chant",
        "song": "Rotten to the Core",
        "section": "Company Chant / Groove",
        "characters": ["VK Kids", "Mal", "Evie", "Jay", "Carlos"],
        "vocal_type": "ensemble",
        "harmony_role": "unison",
        "rehearsal_priority": 2,
        "harmony_difficulty": 1,
    },

    # --- EVIL LIKE ME ---
    {
        "id": "act1_evil_maleficent_solo",
        "song": "Evil Like Me",
        "section": "Maleficent Solo Verse",
        "characters": ["Maleficent"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "rehearsal_priority": 3,
        "harmony_difficulty": 2,
    },
    {
        "id": "act1_evil_mal_maleficent",
        "song": "Evil Like Me",
        "section": "Mal + Maleficent Exchange",
        "characters": ["Mal", "Maleficent"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
        "harmony_difficulty": 2,
    },
    {
        "id": "act1_evil_isle_parents",
        "song": "Evil Like Me",
        "section": "Isle Parent Ensemble Callback",
        "characters": ["Maleficent", "Grimhilde", "Jafar", "Cruella de Vil"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
        "harmony_difficulty": 2,
    },

    # --- GOOD IS THE NEW BAD ---
    {
        "id": "act1_good_new_bad_dance_off",
        "song": "Good Is the New Bad",
        "section": "VKs vs Auradon Students Dance-Off",
        "characters": ["Mal", "Evie", "Jay", "Carlos", "Auradonian Students"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
        "harmony_difficulty": 2,
    },
    {
        "id": "act1_good_new_bad_evie_chad",
        "song": "Good Is the New Bad",
        "section": "Evie/Chad Bit",
        "characters": ["Evie", "Chad"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
        "harmony_difficulty": 1,
    },

    # --- DID I MENTION ---
    {
        "id": "act1_did_i_mention",
        "song": "Did I Mention",
        "section": "Chad Solo + Backup",
        "characters": ["Chad", "Auradonian Students"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
        "harmony_difficulty": 1,
    },

    # --- IF ONLY (MAL SOLO) ---
    {
        "id": "act1_if_only_mal",
        "song": "If Only",
        "section": "Mal Reflective Solo",
        "characters": ["Mal"],
        "vocal_type": "solo",
        "harmony_role": "high",
        "rehearsal_priority": 3,
        "harmony_difficulty": 2,
    },

    # --- BE OUR GUEST ---
    {
        "id": "act1_be_our_guest_ensemble",
        "song": "Be Our Guest",
        "section": "Ensemble Choreography",
        "characters": ["Company", "Auradonian Students", "Royal Court"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 1,
        "harmony_difficulty": 2,
    },
    {
        "id": "act1_be_our_guest_ben_fg",
        "song": "Be Our Guest",
        "section": "Ben + FG Segment",
        "characters": ["Ben", "Fairy Godmother"],
        "vocal_type": "small_group",
        "harmony_role": "unison",
        "rehearsal_priority": 1,
        "harmony_difficulty": 1,
    },

    # --- IF ONLY (REPRISE 1) ---
    {
        "id": "act1_if_only_reprise1",
        "song": "If Only (Reprise 1)",
        "section": "Bridge scene duet",
        "characters": ["Mal", "Ben"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
        "harmony_difficulty": 2,
    },

    # --- GOAL ---
    {
        "id": "act1_goal_tourney_chant",
        "song": "Goal",
        "section": "Tourney Team Chant",
        "characters": ["Jay", "Carlos", "Tourney Team", "Auradonian Students"],
        "vocal_type": "ensemble",
        "harmony_role": "unison",
        "rehearsal_priority": 2,
        "harmony_difficulty": 1,
    },
    {
        "id": "act1_goal_jay_carlos",
        "song": "Goal",
        "section": "Jay/Carlos Comedy Bit",
        "characters": ["Jay", "Carlos"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
        "harmony_difficulty": 1,
    },

    # --- BETTER TOGETHER ---
    {
        "id": "act1_better_mal_evie",
        "song": "Better Together",
        "section": "Mal & Evie verse",
        "characters": ["Mal", "Evie"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
        "harmony_difficulty": 2,
    },
    {
        "id": "act1_better_company",
        "song": "Better Together",
        "section": "Full Company Chorus",
        "characters": ["Company"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
        "harmony_difficulty": 2,
    },

    # ===================================================================
    # ACT II
    # ===================================================================

    # --- IF ONLY (REPRISE 2) ---
    {
        "id": "act2_if_only_quartet",
        "song": "If Only (Reprise 2)",
        "section": "VK Quartet Harmony",
        "characters": ["Mal", "Evie", "Jay", "Carlos"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
        "harmony_difficulty": 3,
    },

    # --- EVIL LIKE ME (REPRISE) ---
    {
        "id": "act2_evil_reprise",
        "song": "Evil Like Me (Reprise)",
        "section": "Maleficent Command",
        "characters": ["Maleficent"],
        "vocal_type": "solo",
        "harmony_role": "middle",
        "rehearsal_priority": 3,
        "harmony_difficulty": 2,
    },

    # --- CHILLIN' LIKE A VILLAIN ---
    {
        "id": "act2_chillin_trio_teach",
        "song": "Chillin' Like a Villain",
        "section": "VK Trio Teach Ben",
        "characters": ["Jay", "Carlos", "Evie", "Ben"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
        "harmony_difficulty": 2,
    },
    {
        "id": "act2_chillin_company",
        "song": "Chillin' Like a Villain",
        "section": "Company Groove",
        "characters": ["Company", "VK Kids"],
        "vocal_type": "ensemble",
        "harmony_role": "unison",
        "rehearsal_priority": 1,
        "harmony_difficulty": 1,
    },

    # --- IF ONLY (FINALE VERSION) ---
    {
        "id": "act2_if_only_finale_mal",
        "song": "If Only (Finale Version)",
        "section": "Mal Finale Solo Line",
        "characters": ["Mal"],
        "vocal_type": "solo",
        "harmony_role": "high",
        "rehearsal_priority": 3,
        "harmony_difficulty": 2,
    },
    {
        "id": "act2_if_only_finale_company",
        "song": "If Only (Finale Version)",
        "section": "Company Build",
        "characters": ["Company"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 2,
        "harmony_difficulty": 2,
    },

    # --- BREAK THIS DOWN ---
    {
        "id": "act2_break_vk_leads",
        "song": "Break This Down",
        "section": "Mal + Evie + Jay + Carlos Lead Lines",
        "characters": ["Mal", "Evie", "Jay", "Carlos"],
        "vocal_type": "small_group",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
        "harmony_difficulty": 2,
    },
    {
        "id": "act2_break_ben_chorus",
        "song": "Break This Down",
        "section": "Ben/Evie/Company Chorus",
        "characters": ["Ben", "Evie", "Company", "Auradonian Students", "VK Kids"],
        "vocal_type": "ensemble",
        "harmony_role": "mixed",
        "rehearsal_priority": 3,
        "harmony_difficulty": 2,
    },
    {
        "id": "act2_break_mega_finale",
        "song": "Break This Down",
        "section": "Mega Finale Company",
        "characters": ["Company"],
        "vocal_type": "ensemble",
        "harmony_role": "unison",
        "rehearsal_priority": 2,
        "harmony_difficulty": 1,
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

CHARACTER_GROUPS = [
    ("Leads (Core VKs & AKs)", [
        "Mal", "Evie", "Jay", "Carlos", "Ben",
    ]),
    ("Featured Auradon Teens", [
        "Audrey", "Chad", "Doug", "Jane", "Lonnie",
    ]),
    ("Featured Isle Characters", [
        "Maleficent", "Grimhilde", "Jafar", "Cruella de Vil",
    ]),
    ("Adults / Faculty", [
        "Fairy Godmother", "Snow White", "Beast", "Belle", "Maurice",
    ]),
    ("Ensemble / Groups", [
        "Auradonian Students", "VK Kids", "Guards", "Party Guests",
        "Royal Court", "Cheer Team", "Tourney Team", "Company",
    ]),
]
