Here’s a battle-ready “drop-in” Claude Code prompt you can paste straight into your Claude project (or its /mvp-planner agent) to build the full end-to-end choral rehearsal web app — from static site to AI-sung voice playback — with zero ambiguity.

Copy everything below into Claude’s input box:

⸻

🧠 Claude Code Prompt — Full Choir Rehearsal App with AI Voice Singing

System Goal:
Build a fully functional, deployable web application for a choir (stratfordchoir.ca) that:
	1.	Displays and plays MusicXML scores with selectable parts (SATB).
	2.	Includes tempo control, seek bar, playback cursor, and per-part toggling.
	3.	Integrates AI vocal synthesis so each part can be sung with lyrics instead of simple MIDI instruments.
	4.	Can be deployed on Vercel or any static hosting provider.

⸻

🏗️ 1. Project Structure

Create this folder tree:

stratfordchoir/
├── index.html
├── rehearse.html
├── js/
│   └── player.js
├── server/
│   ├── synth.py
│   └── requirements.txt
├── assets/
│   └── style.css
└── scores/
    └── final/
        └── Candlelight Carol.musicxml

	•	index.html → Landing page with large “REHEARSE” button.
	•	rehearse.html → Two-column rehearsal UI with song list and score viewer.
	•	player.js → Client-side JS to load scores, manage playback, tempo, cursor, and part selection.
	•	server/synth.py → Flask or FastAPI backend to generate AI-sung audio from MusicXML.
	•	requirements.txt → Dependencies for the backend (Coqui TTS or OpenAI TTS).

⸻

🎼 2. Frontend Requirements
	•	Two-column UI:
	•	Left: Big buttons for songs (starting with Candlelight Carol).
	•	Right: Score viewer using OpenSheetMusicDisplay.
	•	Controls:
	•	▶️ Play / ⏸ Pause
	•	🎚️ Tempo slider (50%–150%)
	•	🎼 Seek bar (jump to measure)
	•	✅ Checkboxes to mute/solo Soprano, Alto, Tenor, Bass
	•	Playback Cursor: visually follows the music
	•	AI Voice Toggle: A button to switch from MIDI instrument playback to AI vocal playback.

⸻

🔊 3. AI Vocal Synthesis Backend

Use Coqui TTS or OpenAI TTS as the simplest path:
	•	Parse the .musicxml file with music21 to extract:
	•	Notes
	•	Lyrics
	•	Voice part labels
	•	Convert lyrics → phonemes per note.
	•	For each part:
	•	Synthesize voice audio (e.g., tts.tts_to_file(text=lyrics, speaker_wav="soprano_voice.wav")).
	•	Align generated phoneme timings with note durations.
	•	Mix all parts into a single .wav or .mp3.
	•	Serve this via a REST endpoint:
GET /synthesize?score=Candlelight%20Carol.musicxml&parts=Soprano,Alto

💡 Suggestion: Use Coqui TTS with pre-trained multi-speaker models (like tts_models/multilingual/multi-dataset/your_tts) — they work well for singing-like synthesis when phoneme alignment is done.

⸻

🔌 4. Frontend ↔ Backend Integration
	•	Add a toggle: “🔈 AI Voices” → when enabled:
	•	Client calls /synthesize with selected parts, tempo, and starting measure.
	•	Replaces MIDI playback with generated .mp3 stream.
	•	Add a progress indicator while audio is rendering.
	•	Provide a “Download MP3” button after synthesis.

⸻

🧪 5. Testing Plan

Claude should:
	1.	Generate a working synth.py using FastAPI.
	2.	Implement MusicXML parsing with music21.
	3.	Use Coqui TTS or OpenAI TTS for vocal synthesis.
	4.	Serve static files from the stratfordchoir/ directory.
	5.	Add a local dev script:

uvicorn server.synth:app --reload


	6.	Verify:
	•	Score loads visually.
	•	Playback works with tempo and seeking.
	•	Part toggling works.
	•	AI vocal synthesis endpoint returns valid audio for at least one voice.

⸻

📦 6. Deployment Instructions
	•	Frontend: Deploy index.html, rehearse.html, js/, and assets/ to Vercel.
	•	Backend: Deploy server/ as a separate Render.com / Fly.io / Railway.app service, or host on a VPS.
	•	Update player.js to point to the backend’s /synthesize endpoint.

⸻

🧰 Libraries to Use
	•	Frontend:
	•	opensheetmusicdisplay
	•	Tone.js (optional)
	•	Backend:
	•	fastapi
	•	music21 (MusicXML parsing)
	•	coqui-tts or openai
	•	pydub (audio mixing)

⸻

✅ Deliverables Claude Must Output:
	1.	All frontend HTML, CSS, and JS files.
	2.	Full server/synth.py backend with working synthesis endpoint.
	3.	Instructions for installing dependencies and running locally.
	4.	Sample .musicxml parsing and synthesis logs.
	5.	Notes on how to extend part-by-part voice training in future.

⸻

💡 Tip for Claude: Treat this as a real-world full-stack project — don’t hand-wave over the audio synthesis. Include example functions for phoneme timing alignment, part separation, and API request handling.

⸻

Would you like me to add a dataset builder step to fine-tune the AI voices with actual choir recordings later? (That’s the next level up — we can include it as an optional “Phase 2.”)