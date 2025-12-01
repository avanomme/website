# Flashcards Directory Cleanup Plan

## Files to Archive (old/unused)
- .venv-tts.backup/
- .venv-edge-tts.backup/
- audio_cache_british/
- edge_tts_cache/
- audio_samples/
- *.log files
- precompile_au_female.py (specific voice scripts)
- precompile_natasha.py
- precompile_sofia.py
- precompile_simple.py
- train_all_q1.py

## Files to Move to docs/
- AUDIO_GENERATION.md
- AUDIO_PRECOMPILATION.md
- CARD_MANAGEMENT.md
- COMPLETE_SETUP.md
- EDGE_TTS_README.md
- EDGE_TTS_SETUP_COMPLETE.md
- LOGGING_README.md
- NAVIGATION.md
- PRECOMPILE_OPTIONS.md
- PRECOMPILE_README.md
- README_TOPICS.md
- SETUP_COMPLETE.md
- TTS_README.md

## Files to Move to scripts/
- check_setup.sh
- edge_tts_server.py
- generate_all_audio.py
- generate_ml_audio.sh
- generate_sample_audio.py
- generate_voice_previews.py
- melo_server.py
- prebuild_cache.py
- precompile_all_cards.py
- precompile_all_voices.py
- precompile_edge_tts.py
- precompile_ml_cards.py
- precompile_ml_midterm.py
- prepare_upload.sh
- restart_tts.sh
- start_edge_tts.sh
- start_melo.sh
- test_tts.py
- tts_server.py

## Files to Keep in Root
- index.html
- admin.html
- editor.html
- review.html
- topics.html
- cards.html
- se-cards.html
- test_md5.html
- app.js
- app.css
- editor.js
- review.js
- theme.css
- cards.md
- ml_midterm_cards.md
- ml_midterm_quiz.md
- ml_midterm_review.md
- ML_midterm_final_review.md
- generate_cox_audio.py (NEW - keep for Cox voice)
- precompile_specific_files.py (NEW - keep for targeted precompilation)
- start_tts.sh (keep - main TTS starter)
- requirements.txt
- requirements-edge-tts.txt
- manifest.json
- .gitignore

## Directories to Keep
- audio_cache/
- lib/
- components/
- pages/
- custom_models/
- custom_voices/
- .vercel/
