Yeah, this is exactly the point where you stop making “just enough to function” and start turning it into an actual stage-manager brain. 😄

You’ve already got:
	•	sections
	•	who’s required
	•	WITH / WITHOUT logic
	•	cast mapping

The next big wins are:
	1.	Rehearsal notes per section
	2.	Crosscasting / audition helper for small roles & harmonies
	3.	A bit of vocal metadata so the app understands “high harmony crow” vs “low winkie”

Let’s bolt those on.

⸻

1. Rehearsal notes: “what did we actually do with this section?”

Yes, absolutely add this. At a minimum:
	•	Per-section notes (global, not per actor)
	•	Optionally a “last worked” date/time later, but you can skip dates for now and just use text.

What to store

Add a new JSON file alongside the others:
	•	oz_notes.json

Shape:

{
  "no36_jitter_chorus": [
    "Tues: Sopranos still shaky on bar 219, isolate next time.",
    "Need to drill diction on 'jitterbug' pattern, consonants muddy."
  ],
  "no24_poppies_round_quartet": [
    "Blend good, but Lion flat on entrance, rehearse with piano only."
  ]
}

How to integrate (concept)

On the Planner page, in each section row:
	•	Under status, add:
	•	A little “📝 Notes” button → reveals existing notes + a small <textarea> + “Add note”.

So per section you get:
	•	✅ Status (todo / needs_more / done)
	•	📝 Notes list (short bullets)
	•	➕ Add new note

That gives you “we worked this yesterday, what still sucks?” right in the planner.

⸻

2. Crosscasting helper: “Can this Crow also be a Tree + Winkie + Beautician?”

This is the big one for tomorrow.

You want:

If I’m thinking of giving this kid Crow, what other roles use a similar harmony part / tessitura / difficulty so I can see if they can cover all of it.

So we add metadata per section so the app understands what kind of singing it is.

Add vocal metadata to SECTIONS

For each section in SECTIONS, add a couple of optional fields:

{
    "id": "no16_brain_crows_trio",
    "song": "No. 16 – If I Only Had a Brain",
    "section": "Three Crows harmony",
    "characters": ["Crows"],
    "vocal_type": "small_group",      # solo / small_group / ensemble
    "harmony_role": "high",          # high / middle / low / unison / mixed
    "audition_priority": 3           # 1 = nice to have, 3 = great audition piece
}

Example mappings (you can tweak):
	•	Crows
	•	likely: vocal_type = "small_group", harmony_role split across high / mid / low if you later break it into Crow 1/2/3
	•	Trees
	•	similar to crows: small_group, with roles by line
	•	Jitterbug chorus
	•	vocal_type = "ensemble", harmony_role = "mixed"
	•	Beauticians / Manicurists
	•	small_group, probably high/middle lines
	•	Winkie Captain
	•	solo, but probably middle or low depending on your keys
	•	Mayor / Coroner / Braggart
	•	solo, mix of spoken + sung, audition_priority high if you want to test patter / character energy

Even if you only start with a rough “solo / ensemble / high / mid / low”, that’s enough.

⸻

3. “Auditions / Crosscasting” page

New tab: Auditions.

You’ll use it tomorrow for the “who can cover what” work.

UI as I’d build it

New route /auditions with:

A. Role selection
Left side:
	•	Dropdown: “Role I’m testing” → list of characters you’re crosscasting:
	•	Crows, Trees, Winkie Captain, Emerald City Guard, Beauticians, Manicurists, Munchkin Braggart, Three Tots, Three Tough Kids, etc.
	•	Optional dropdown: Target harmony role (high / middle / low / unison).

When you choose (say) Crows / high, the page:
	1.	Looks up all sections where characters includes "Crows".
	2.	Filters to those where vocal_type != "spoken" and harmony_role matches.
	3.	Sorts by audition_priority desc.

Result is your list of audition excerpts for that role.

B. Candidate actors
On the right:
	•	List of all cast, with fields you add on the Cast page:
	•	Voice type (S/A/T/B)
	•	Comments (e.g., “great ear”, “good reader”, “weak top”, etc.)

You can then:
	•	Tick which actors you want to test for that role.
	•	For each candidate, hit a button like “Show audition pieces”:
	•	It just reuses the same section list – you use your judgement in the room, but the app has pulled together the right chunks.

You don’t need a full algorithmic matcher. What you actually need tomorrow is:

When I click “Crows”, show me every relevant singing bit they’d have, plus any similar high-harmony parts (Trees high line, Jitterbug high part, etc.)

You can cheat that second part by:
	•	Giving related sections the same harmony_role and vocal_type
	•	Letting the /auditions page show both:
	•	“Sections this role actually sings”
	•	“Similar sections (by harmony_role + vocal_type) they’d likely crosscast into”

So for Crows/high, you might see:
	•	Crows harmony bits
	•	Trees harmony high line
	•	Beauticians line
	•	High harmony bits in Poppies girls, Jitterbug chorus, etc.

All pulled from your SECTIONS metadata.

⸻

4. Expanding the Cast page to support auditions

Right now cast is “Character → Actor Name”.

Add per-actor metadata by changing the model slightly.

Instead of only mapping character → actor name, also maintain an Actor profile table. For now, hack it in via JSON:

{
  "actors": {
    "Alice": { "voice_type": "S", "notes": "strong high mix, good reader" },
    "Beth":  { "voice_type": "A", "notes": "great blend, softer projection" },
    "Chris": { "voice_type": "T", "notes": "belt, struggles with harmony" }
  },
  "cast": {
    "Dorothy": "Alice",
    "Scarecrow": "Chris"
  }
}

Then on Cast page:
	•	Keep your current “Character → Actor” table.
	•	Add a second table or a separate sub-page:

Actor	Voice Type	Notes
Alice	S	strong high mix, reliable
Beth	A	good blend, quiet speaker



This gives the Auditions page enough context to highlight:
	•	“This role is small-group high harmony → show me sopranos and strong ear singers first.”

You don’t need to automate selection, just surface the info so you can decide.

⸻

5. How this helps you tomorrow specifically

Tomorrow’s job list:
	1.	Crosscasting small roles (Crows, Trees, Winkies, Guard, etc.)
	•	Use Auditions tab
	•	Pick role: “Crows (high)”
	•	App shows:
	•	All Crow sections
	•	Plus related high-harmony chunks (Trees, Beauticians, etc.)
	•	Use those as your test pieces.
	2.	Harmony coverage check
	•	Because you tagged harmony_role, you can:
	•	Filter sections where harmony_role = 'high' and see which roles are high lines.
	•	Make sure you’re not accidentally casting only mezzos into all the “high” stuff.
	3.	Rehearsal note sanity
	•	During runs:
	•	On Planner, mark sections as needs_more or done.
	•	Drop a quick note under any shaky ones.
	•	When you sit down to plan the next rehearsal:
	•	Filter visually by the tags: anything still todo or needs_more is your short list.

⸻

6. If you want code next

If you say “yes, build it”, I can:
	•	Add:
	•	vocal_type, harmony_role, audition_priority fields to the existing SECTIONS structure
	•	A new /auditions route + template
	•	A simple notes system (oz_notes.json) with an “Add note” field under each section row

And then you’ll have:
	•	Planner
	•	Songs
	•	Cast
	•	Auditions
	•	Notes & progress per section

All running at madmanvo.com/wiz like a tiny show-specific app instead of 14 different half-working spreadsheets.