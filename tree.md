./
├── CLAUDE.md
├── DEPLOYMENT.md
├── PROJECT_STRUCTURE.md
├── README.md
├── REPO_SPLIT_PLAN.md
├── __pycache__
│   ├── dot2tex.cpython-310.pyc
│   └── dot2tex.cpython-313.pyc
├── advanced_voice_clone.py
├── api
│   ├── cards.py
│   └── log.py
├── app.py
├── apphosting.yaml
├── apps
│   ├── descendants
│   ├── dfa
│   │   ├── converter.py
│   │   ├── converter_api.py
│   │   ├── image_to_dfa.py
│   │   ├── lib
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── dot2tex.py
│   │   │   ├── dotparsing.py
│   │   │   ├── pgfformat.py
│   │   │   ├── pstricksformat.py
│   │   │   └── utils.py
│   │   └── templates
│   │       └── dfa.html
│   ├── flashcards
│   │   ├── CLEANUP_PLAN.md
│   │   ├── ML_midterm_final_review.md
│   │   ├── Possible Exam Questions- filled in - Lydia.pdf
│   │   ├── README.md
│   │   ├── admin.html
│   │   ├── app.css
│   │   ├── app.js
│   │   ├── archive
│   │   │   ├── audio_samples
│   │   │   │   ├── sample_01_answer.wav
│   │   │   │   ├── sample_01_question.wav
│   │   │   │   ├── sample_02_answer.wav
│   │   │   │   ├── sample_02_question.wav
│   │   │   │   ├── sample_03_answer.wav
│   │   │   │   ├── sample_03_question.wav
│   │   │   │   ├── sample_04_answer.wav
│   │   │   │   ├── sample_04_question.wav
│   │   │   │   ├── sample_05_answer.wav
│   │   │   │   ├── sample_05_question.wav
│   │   │   │   ├── sample_06_answer.wav
│   │   │   │   ├── sample_06_question.wav
│   │   │   │   └── sample_07_question.wav
│   │   │   ├── image-1.png
│   │   │   ├── image-2.png
│   │   │   ├── image.png
│   │   │   ├── ml_midterm
│   │   │   ├── precompile_au_female.py
│   │   │   ├── precompile_natasha.py
│   │   │   ├── precompile_simple.py
│   │   │   ├── precompile_sofia.py
│   │   │   └── train_all_q1.py
│   │   ├── audio_cache
│   │   │   ├── Ana_Florence
│   │   │   │   ├── 1.1_a.wav
│   │   │   │   └── 1.1_q.wav
│   │   │   ├── Andrew_Chipper
│   │   │   │   ├── 1.1_a.wav
│   │   │   │   └── 1.1_q.wav
│   │   │   ├── Brenda_Stern
│   │   │   │   ├── 1.1_a.wav
│   │   │   │   └── 1.1_q.wav
│   │   │   ├── Claribel_Dervla
│   │   │   │   ├── 1.1_a.wav
│   │   │   │   └── 1.1_q.wav
│   │   │   ├── Craig_Gutsy
│   │   │   │   ├── 1.1_a.wav
│   │   │   │   └── 1.1_q.wav
│   │   │   ├── Daisy_Studious
│   │   │   │   ├── 1.1_a.wav
│   │   │   │   └── 1.1_q.wav
│   │   │   ├── Gitta_Nikolina
│   │   │   │   ├── 1.1_a.wav
│   │   │   │   └── 1.1_q.wav
│   │   │   ├── Gracie_Wise
│   │   │   │   ├── 1.1_a.wav
│   │   │   │   ├── 1.1_q.wav
│   │   │   │   ├── 1.2_a.wav
│   │   │   │   ├── 1.2_q.wav
│   │   │   │   ├── 1.3_a.wav
│   │   │   │   ├── 1.3_q.wav
│   │   │   │   ├── 10.1_a.wav
│   │   │   │   ├── 10.1_q.wav
│   │   │   │   ├── 10.2_a.wav
│   │   │   │   ├── 10.2_q.wav
│   │   │   │   ├── 11.1_a.wav
│   │   │   │   ├── 11.1_q.wav
│   │   │   │   ├── 11.2_a.wav
│   │   │   │   ├── 11.2_q.wav
│   │   │   │   ├── 11.3_a.wav
│   │   │   │   ├── 11.3_q.wav
│   │   │   │   ├── 11.4_a.wav
│   │   │   │   ├── 11.4_q.wav
│   │   │   │   ├── 11.5_a.wav
│   │   │   │   ├── 11.5_q.wav
│   │   │   │   ├── 11.6_a.wav
│   │   │   │   ├── 11.6_q.wav
│   │   │   │   ├── 11.7_a.wav
│   │   │   │   ├── 11.7_q.wav
│   │   │   │   ├── 11.8_a.wav
│   │   │   │   ├── 11.8_q.wav
│   │   │   │   ├── 11.9_a.wav
│   │   │   │   ├── 11.9_q.wav
│   │   │   │   ├── 2.1_a.wav
│   │   │   │   ├── 2.1_q.wav
│   │   │   │   ├── 2.2_a.wav
│   │   │   │   ├── 2.2_q.wav
│   │   │   │   ├── 3.1_a.wav
│   │   │   │   ├── 3.1_q.wav
│   │   │   │   ├── 3.2_a.wav
│   │   │   │   ├── 3.2_q.wav
│   │   │   │   ├── 3.3_a.wav
│   │   │   │   ├── 3.3_q.wav
│   │   │   │   ├── 4.1_a.wav
│   │   │   │   ├── 4.1_q.wav
│   │   │   │   ├── 4.2_a.wav
│   │   │   │   ├── 4.2_q.wav
│   │   │   │   ├── 4.3_a.wav
│   │   │   │   ├── 4.3_q.wav
│   │   │   │   ├── 5.1_a.wav
│   │   │   │   ├── 5.1_q.wav
│   │   │   │   ├── 5.2_a.wav
│   │   │   │   ├── 5.2_q.wav
│   │   │   │   ├── 6.1_a.wav
│   │   │   │   ├── 6.1_q.wav
│   │   │   │   ├── 6.2_a.wav
│   │   │   │   ├── 6.2_q.wav
│   │   │   │   ├── 6.3_a.wav
│   │   │   │   ├── 6.3_q.wav
│   │   │   │   ├── 7.1_a.wav
│   │   │   │   ├── 7.1_q.wav
│   │   │   │   ├── 7.2_a.wav
│   │   │   │   ├── 7.2_q.wav
│   │   │   │   ├── 8.1_a.wav
│   │   │   │   ├── 8.1_q.wav
│   │   │   │   ├── 8.2_a.wav
│   │   │   │   ├── 8.2_q.wav
│   │   │   │   ├── 9.1_a.wav
│   │   │   │   ├── 9.1_q.wav
│   │   │   │   ├── 9.2_a.wav
│   │   │   │   └── 9.2_q.wav
│   │   │   ├── Viktor_Eka
│   │   │   │   ├── 1.1_a.wav
│   │   │   │   └── 1.1_q.wav
│   │   │   ├── cox_custom_voice
│   │   │   │   ├── 1.1_a.wav
│   │   │   │   ├── 1.1_q.wav
│   │   │   │   ├── 1.2_a.wav
│   │   │   │   ├── 1.2_q.wav
│   │   │   │   ├── 1.3_a.wav
│   │   │   │   ├── 1.3_q.wav
│   │   │   │   ├── 10.1_a.wav
│   │   │   │   ├── 10.1_q.wav
│   │   │   │   ├── 10.2_a.wav
│   │   │   │   ├── 10.2_q.wav
│   │   │   │   ├── 11.1_a.wav
│   │   │   │   ├── 11.1_q.wav
│   │   │   │   ├── 11.2_a.wav
│   │   │   │   ├── 11.2_q.wav
│   │   │   │   ├── 11.3_a.wav
│   │   │   │   ├── 11.3_q.wav
│   │   │   │   ├── 11.4_a.wav
│   │   │   │   ├── 11.4_q.wav
│   │   │   │   ├── 11.5_a.wav
│   │   │   │   ├── 11.5_q.wav
│   │   │   │   ├── 11.6_a.wav
│   │   │   │   ├── 11.6_q.wav
│   │   │   │   ├── 11.7_a.wav
│   │   │   │   ├── 11.7_q.wav
│   │   │   │   ├── 11.8_a.wav
│   │   │   │   ├── 11.8_q.wav
│   │   │   │   ├── 11.9_a.wav
│   │   │   │   ├── 11.9_q.wav
│   │   │   │   ├── 2.1_a.wav
│   │   │   │   ├── 2.1_q.wav
│   │   │   │   ├── 2.2_a.wav
│   │   │   │   ├── 2.2_q.wav
│   │   │   │   ├── 3.1_a.wav
│   │   │   │   ├── 3.1_q.wav
│   │   │   │   ├── 3.2_a.wav
│   │   │   │   ├── 3.2_q.wav
│   │   │   │   ├── 3.3_a.wav
│   │   │   │   ├── 3.3_q.wav
│   │   │   │   ├── 4.1_a.wav
│   │   │   │   ├── 4.1_q.wav
│   │   │   │   ├── 4.2_a.wav
│   │   │   │   ├── 4.2_q.wav
│   │   │   │   ├── 4.3_a.wav
│   │   │   │   ├── 4.3_q.wav
│   │   │   │   ├── 5.1_a.wav
│   │   │   │   ├── 5.1_q.wav
│   │   │   │   ├── 5.2_a.wav
│   │   │   │   ├── 5.2_q.wav
│   │   │   │   ├── 6.1_a.wav
│   │   │   │   ├── 6.1_q.wav
│   │   │   │   ├── 6.2_a.wav
│   │   │   │   ├── 6.2_q.wav
│   │   │   │   ├── 6.3_a.wav
│   │   │   │   ├── 6.3_q.wav
│   │   │   │   ├── 7.1_a.wav
│   │   │   │   ├── 7.1_q.wav
│   │   │   │   ├── 7.2_a.wav
│   │   │   │   ├── 7.2_q.wav
│   │   │   │   ├── 8.1_a.wav
│   │   │   │   ├── 8.1_q.wav
│   │   │   │   ├── 8.2_a.wav
│   │   │   │   ├── 8.2_q.wav
│   │   │   │   ├── 9.1_a.wav
│   │   │   │   ├── 9.1_q.wav
│   │   │   │   ├── 9.2_a.wav
│   │   │   │   └── 9.2_q.wav
│   │   │   ├── cox_voice
│   │   │   │   └── SE_Final_Audio
│   │   │   │       ├── SE_11.1_A.wav
│   │   │   │       ├── SE_11.1_Q.wav
│   │   │   │       ├── SE_11.2_A.wav
│   │   │   │       ├── SE_11.2_Q.wav
│   │   │   │       ├── SE_12.1_A.wav
│   │   │   │       ├── SE_12.1_Q.wav
│   │   │   │       ├── SE_12.2_A.wav
│   │   │   │       ├── SE_12.2_Q.wav
│   │   │   │       ├── SE_12.3_A.wav
│   │   │   │       ├── SE_12.3_Q.wav
│   │   │   │       ├── SE_12.4_A.wav
│   │   │   │       ├── SE_12.4_Q.wav
│   │   │   │       ├── SE_13.1_A.wav
│   │   │   │       ├── SE_13.1_Q.wav
│   │   │   │       ├── SE_13.2_A.wav
│   │   │   │       ├── SE_13.2_Q.wav
│   │   │   │       ├── SE_13.3_A.wav
│   │   │   │       ├── SE_13.3_Q.wav
│   │   │   │       ├── SE_13.4_A.wav
│   │   │   │       ├── SE_13.4_Q.wav
│   │   │   │       ├── SE_13.5_A.wav
│   │   │   │       ├── SE_13.5_Q.wav
│   │   │   │       ├── SE_13.6_A.wav
│   │   │   │       ├── SE_13.6_Q.wav
│   │   │   │       ├── SE_13.7_A.wav
│   │   │   │       ├── SE_13.7_Q.wav
│   │   │   │       ├── SE_13.8_A.wav
│   │   │   │       ├── SE_13.8_Q.wav
│   │   │   │       ├── SE_14.1_A.wav
│   │   │   │       ├── SE_14.1_Q.wav
│   │   │   │       ├── SE_14.2_Q.wav
│   │   │   │       ├── SE_G.1_A.wav
│   │   │   │       ├── SE_G.1_Q.wav
│   │   │   │       ├── SE_G.2_A.wav
│   │   │   │       └── SE_G.2_Q.wav
│   │   │   ├── index.json
│   │   │   └── sofia_hellen
│   │   │       ├── 1.1_a.wav
│   │   │       ├── 1.1_q.wav
│   │   │       ├── 1.2_a.wav
│   │   │       ├── 1.2_q.wav
│   │   │       ├── 1.3_a.wav
│   │   │       ├── 1.3_q.wav
│   │   │       ├── 10.1_a.wav
│   │   │       ├── 10.1_q.wav
│   │   │       ├── 10.2_a.wav
│   │   │       ├── 10.2_q.wav
│   │   │       ├── 11.1_a.wav
│   │   │       ├── 11.1_q.wav
│   │   │       ├── 11.2_q.wav
│   │   │       ├── 11.3_a.wav
│   │   │       ├── 11.3_q.wav
│   │   │       ├── 11.4_a.wav
│   │   │       ├── 11.4_q.wav
│   │   │       ├── 11.5_a.wav
│   │   │       ├── 11.5_q.wav
│   │   │       ├── 11.6_a.wav
│   │   │       ├── 11.6_q.wav
│   │   │       ├── 11.7_a.wav
│   │   │       ├── 11.7_q.wav
│   │   │       ├── 11.8_a.wav
│   │   │       ├── 11.8_q.wav
│   │   │       ├── 11.9_a.wav
│   │   │       ├── 11.9_q.wav
│   │   │       ├── 2.1_a.wav
│   │   │       ├── 2.1_q.wav
│   │   │       ├── 2.2_a.wav
│   │   │       ├── 2.2_q.wav
│   │   │       ├── 3.1_a.wav
│   │   │       ├── 3.1_q.wav
│   │   │       ├── 3.2_a.wav
│   │   │       ├── 3.2_q.wav
│   │   │       ├── 3.3_a.wav
│   │   │       ├── 3.3_q.wav
│   │   │       ├── 4.1_a.wav
│   │   │       ├── 4.1_q.wav
│   │   │       ├── 4.2_a.wav
│   │   │       ├── 4.2_q.wav
│   │   │       ├── 4.3_a.wav
│   │   │       ├── 4.3_q.wav
│   │   │       ├── 5.1_a.wav
│   │   │       ├── 5.1_q.wav
│   │   │       ├── 5.2_a.wav
│   │   │       ├── 5.2_q.wav
│   │   │       ├── 6.1_a.wav
│   │   │       ├── 6.1_q.wav
│   │   │       ├── 6.2_a.wav
│   │   │       ├── 6.2_q.wav
│   │   │       ├── 6.3_a.wav
│   │   │       ├── 6.3_q.wav
│   │   │       ├── 7.1_a.wav
│   │   │       ├── 7.1_q.wav
│   │   │       ├── 7.2_a.wav
│   │   │       ├── 7.2_q.wav
│   │   │       ├── 8.1_a.wav
│   │   │       ├── 8.1_q.wav
│   │   │       ├── 8.2_a.wav
│   │   │       ├── 8.2_q.wav
│   │   │       ├── 9.1_a.wav
│   │   │       ├── 9.1_q.wav
│   │   │       ├── 9.2_a.wav
│   │   │       └── 9.2_q.wav
│   │   ├── cards.html
│   │   ├── cards.md
│   │   ├── components
│   │   │   ├── FlashcardApp.js
│   │   │   └── QuizletApp.js
│   │   ├── docs
│   │   │   ├── AUDIO_GENERATION.md
│   │   │   ├── AUDIO_PRECOMPILATION.md
│   │   │   ├── CARD_MANAGEMENT.md
│   │   │   ├── COMPLETE_SETUP.md
│   │   │   ├── EDGE_TTS_README.md
│   │   │   ├── EDGE_TTS_SETUP_COMPLETE.md
│   │   │   ├── LOGGING_README.md
│   │   │   ├── ML Quiz Review.md
│   │   │   ├── NAVIGATION.md
│   │   │   ├── PRECOMPILE_OPTIONS.md
│   │   │   ├── PRECOMPILE_README.md
│   │   │   ├── README_TOPICS.md
│   │   │   ├── SETUP_COMPLETE.md
│   │   │   └── TTS_README.md
│   │   ├── editor.html
│   │   ├── editor.js
│   │   ├── generate_cox_audio.py
│   │   ├── generate_lydia_audio.py
│   │   ├── generate_missing_audio.py
│   │   ├── generate_se_final_audio.py
│   │   ├── index.html
│   │   ├── lib
│   │   │   └── parseFlashcards.js
│   │   ├── manifest.json
│   │   ├── ml_midterm_cards.md
│   │   ├── ml_midterm_quiz.md
│   │   ├── ml_midterm_review.md
│   │   ├── pages
│   │   │   ├── study.html.js
│   │   │   └── study.js
│   │   ├── precompile_specific_files.py
│   │   ├── requirements-edge-tts.txt
│   │   ├── requirements.txt
│   │   ├── review.html
│   │   ├── review.js
│   │   ├── scripts
│   │   │   ├── check_setup.sh
│   │   │   ├── edge_tts_server.py
│   │   │   ├── generate_all_audio.py
│   │   │   ├── generate_ml_audio.sh
│   │   │   ├── generate_sample_audio.py
│   │   │   ├── generate_voice_previews.py
│   │   │   ├── melo_server.py
│   │   │   ├── prebuild_cache.py
│   │   │   ├── precompile_all_cards.py
│   │   │   ├── precompile_all_voices.py
│   │   │   ├── precompile_edge_tts.py
│   │   │   ├── precompile_ml_cards.py
│   │   │   ├── precompile_ml_midterm.py
│   │   │   ├── prepare_upload.sh
│   │   │   ├── restart_tts.sh
│   │   │   ├── start_edge_tts.sh
│   │   │   ├── start_melo.sh
│   │   │   ├── test_tts.py
│   │   │   └── tts_server.py
│   │   ├── se-cards.html
│   │   ├── se_final
│   │   │   ├── General
│   │   │   │   ├── 01_traditional_vs_agile.md
│   │   │   │   └── 02_model_selection.md
│   │   │   ├── L11_SQA
│   │   │   │   ├── 01_iso_certification.md
│   │   │   │   └── 02_tqm_steps.md
│   │   │   ├── L12_Review
│   │   │   │   ├── 01_error_vs_defect.md
│   │   │   │   ├── 02_defect_amplification.md
│   │   │   │   ├── 03_pair_programming.md
│   │   │   │   └── 04_formal_technical_review.md
│   │   │   ├── L13_Testing
│   │   │   │   ├── 01_good_test.md
│   │   │   │   ├── 02_whitebox_blackbox.md
│   │   │   │   ├── 03_basis_path_testing.md
│   │   │   │   ├── 04_equivalence_partitioning.md
│   │   │   │   ├── 05_regression_testing.md
│   │   │   │   ├── 06_smoke_testing.md
│   │   │   │   ├── 07_comparison_testing.md
│   │   │   │   └── 08_integration_testing.md
│   │   │   ├── L14_Process_Models
│   │   │   │   ├── 01_waterfall.md
│   │   │   │   ├── 02_prototyping.md
│   │   │   │   ├── 03_prototyping_pros_cons.md
│   │   │   │   ├── 04_spiral.md
│   │   │   │   └── 05_unified_process.md
│   │   │   ├── L15_People_Management
│   │   │   │   ├── 01_moi.md
│   │   │   │   ├── 02_team_paradigms.md
│   │   │   │   ├── 03_team_models.md
│   │   │   │   └── 04_high_expectations_toxicity.md
│   │   │   ├── L16_Agile_Goals
│   │   │   │   ├── 01_continuous_innovation.md
│   │   │   │   ├── 02_traditional_vs_agile.md
│   │   │   │   ├── 03_documentation_compliance.md
│   │   │   │   ├── 04_agile_budgeting.md
│   │   │   │   └── 05_timeboxing.md
│   │   │   ├── L17_Agile_Steps
│   │   │   │   ├── 01_vision_box.md
│   │   │   │   ├── 02_elevator_test.md
│   │   │   │   ├── 03_product_data_sheet.md
│   │   │   │   ├── 04_feature_card.md
│   │   │   │   ├── 05_deliverable_vs_milestone.md
│   │   │   │   ├── 06_prioritizing_features.md
│   │   │   │   ├── 07_self_managing_teams.md
│   │   │   │   ├── 08_frequent_integration.md
│   │   │   │   ├── 09_ruthless_testing.md
│   │   │   │   └── 10_oscillation_problem.md
│   │   │   ├── L18_Agile_Models
│   │   │   │   ├── 01_xp.md
│   │   │   │   ├── 02_pair_programming_xp.md
│   │   │   │   ├── 03_principle_of_extremes.md
│   │   │   │   ├── 04_scrum.md
│   │   │   │   ├── 05_scrum_agnostic.md
│   │   │   │   ├── 06_bad_decisions.md
│   │   │   │   ├── 07_pigs_chickens.md
│   │   │   │   ├── 08_standup_questions.md
│   │   │   │   ├── 09_xp_vs_scrum.md
│   │   │   │   ├── 10_agile_modeling.md
│   │   │   │   └── 11_agile_modeling_guidelines.md
│   │   │   └── L19_Agile_People
│   │   │       ├── 01_leadership_vs_management.md
│   │   │       ├── 02_self_organizing_teams.md
│   │   │       ├── 03_agile_leader_responsibilities.md
│   │   │       ├── 04_customer_vs_developer_team.md
│   │   │       ├── 05_servant_leadership.md
│   │   │       └── 06_participatory_vs_consensus.md
│   │   ├── se_final_cards.md
│   │   ├── se_final_lydia.md
│   │   ├── software_engineering_final.md
│   │   ├── start_tts.sh
│   │   ├── test_md5.html
│   │   ├── theme.css
│   │   ├── topics.html
│   │   ├── upload_lydia_to_blob.js
│   │   └── upload_to_vercel_blob.js
│   ├── freakyfriday
│   ├── museplay
│   │   ├── CMakeLists.txt
│   │   ├── GETTING_STARTED.md
│   │   ├── MCSZ
│   │   │   └── mcsz2mxml.sh
│   │   ├── README.md
│   │   ├── README_HYBRID.md
│   │   ├── STATUS.md
│   │   ├── build.sh
│   │   ├── public
│   │   │   ├── index.html
│   │   │   ├── museplay-enhanced.js
│   │   │   ├── museplay-final.js
│   │   │   ├── museplay.js
│   │   │   └── player.js
│   │   ├── run.py
│   │   ├── run.sh
│   │   ├── scores
│   │   │   ├── 000_Opening.mid
│   │   │   ├── 000_Opening.mscz
│   │   │   ├── 000_Opening.musicxml
│   │   │   ├── 001_Who_Likes_Christmas.mid
│   │   │   ├── 001_Who_Likes_Christmas.mscz
│   │   │   ├── 001_Who_Likes_Christmas.musicxml
│   │   │   ├── 002_This_Time_of_Year.mid
│   │   │   ├── 002_This_Time_of_Year.mscz
│   │   │   ├── 002_This_Time_of_Year.musicxml
│   │   │   ├── 003_I_Hate_Christmas_Eve.mid
│   │   │   ├── 003_I_Hate_Christmas_Eve.mscz
│   │   │   ├── 003_I_Hate_Christmas_Eve.musicxml
│   │   │   ├── 004_Whatchamawho.mid
│   │   │   ├── 004_Whatchamawho.mscz
│   │   │   ├── 004_Whatchamawho.musicxml
│   │   │   ├── 005_Welcome_Christmas.mid
│   │   │   ├── 005_Welcome_Christmas.mscz
│   │   │   ├── 005_Welcome_Christmas.musicxml
│   │   │   ├── 006_I_Hate_Christmas_Reprise.mid
│   │   │   ├── 006_I_Hate_Christmas_Reprise.mscz
│   │   │   ├── 006_I_Hate_Christmas_Reprise.musicxml
│   │   │   ├── 007_It's_the_Thought_That_Counts.mid
│   │   │   ├── 007_It's_the_Thought_That_Counts.mscz
│   │   │   ├── 007_It's_the_Thought_That_Counts.musicxml
│   │   │   ├── 007a_After_Thought.mid
│   │   │   ├── 007a_After_Thought.mscz
│   │   │   ├── 007a_After_Thought.musicxml
│   │   │   ├── 008_The_Grinch_Goes_Shopping.mid
│   │   │   ├── 008_The_Grinch_Goes_Shopping.mscz
│   │   │   ├── 008_The_Grinch_Goes_Shopping.musicxml
│   │   │   ├── 008_This_Time_of_Year_Reprise1.mid
│   │   │   ├── 008_This_Time_of_Year_Reprise1.mscz
│   │   │   ├── 008_This_Time_of_Year_Reprise1.musicxml
│   │   │   ├── 009_One_Of_A_Kind.mid
│   │   │   ├── 009_One_Of_A_Kind.mscz
│   │   │   ├── 009_One_Of_A_Kind.musicxml
│   │   │   ├── 010_Down_The_Chimney.mid
│   │   │   ├── 010_Down_The_Chimney.mscz
│   │   │   ├── 010_Down_The_Chimney.musicxml
│   │   │   ├── 011_Now's_The_Time.mid
│   │   │   ├── 011_Now's_The_Time.mscz
│   │   │   ├── 011_Now's_The_Time.musicxml
│   │   │   ├── 012_Down_The_Chimney.mid
│   │   │   ├── 012_Down_The_Chimney.mscz
│   │   │   ├── 012_Down_The_Chimney.musicxml
│   │   │   ├── 013_You're_a_Mean_One.mid
│   │   │   ├── 013_You're_a_Mean_One.mscz
│   │   │   ├── 013_You're_a_Mean_One.musicxml
│   │   │   ├── 014_Santa_For_a_Day.mid
│   │   │   ├── 014_Santa_For_a_Day.mscz
│   │   │   ├── 014_Santa_For_a_Day.musicxml
│   │   │   ├── 015A_You're_A_Mean_One_Reprise.mid
│   │   │   ├── 015A_You're_A_Mean_One_Reprise.mscz
│   │   │   ├── 015A_You're_A_Mean_One_Reprise.musicxml
│   │   │   ├── 015B_Stealing_Christmas_Part2.mid
│   │   │   ├── 015B_Stealing_Christmas_Part2.mscz
│   │   │   ├── 015B_Stealing_Christmas_Part2.musicxml
│   │   │   ├── 015_Stealing_Christmas.mid
│   │   │   ├── 015_Stealing_Christmas.mscz
│   │   │   ├── 015_Stealing_Christmas.musicxml
│   │   │   ├── 016_Who_Likes_Christmas_Reprise.mid
│   │   │   ├── 016_Who_Likes_Christmas_Reprise.mscz
│   │   │   ├── 016_Who_Likes_Christmas_Reprise.musicxml
│   │   │   ├── 017_One_of_a_Kind_Resprise.mid
│   │   │   ├── 017_One_of_a_Kind_Resprise.mscz
│   │   │   ├── 017_One_of_a_Kind_Resprise.musicxml
│   │   │   ├── 017a_This_Time_of_Year_Reprise2.mid
│   │   │   ├── 017a_This_Time_of_Year_Reprise2.mscz
│   │   │   ├── 017a_This_Time_of_Year_Reprise2.musicxml
│   │   │   ├── 018_Welcome_Christmas_Reprise.mid
│   │   │   ├── 018_Welcome_Christmas_Reprise.mscz
│   │   │   ├── 018_Welcome_Christmas_Reprise.musicxml
│   │   │   ├── 019_Finale.mid
│   │   │   ├── 019_Finale.mscz
│   │   │   ├── 019_Finale.musicxml
│   │   │   ├── 020_Bows.mid
│   │   │   ├── 020_Bows.mscz
│   │   │   ├── 020_Bows.musicxml
│   │   │   └── conversion_manifest.json
│   │   └── src
│   │       └── bindings
│   │           ├── midi_generator.cpp
│   │           ├── musescore_bindings.cpp
│   │           └── score_loader.cpp
│   ├── player
│   │   ├── IMPLEMENTATION_SUMMARY.md
│   │   ├── INTEGRATION.md
│   │   ├── MOBILE_FIXES.md
│   │   ├── QUICKSTART.md
│   │   ├── README.md
│   │   ├── TEST.sh
│   │   ├── assets
│   │   │   ├── favicon.png
│   │   │   └── style.css
│   │   ├── examples
│   │   │   └── test-score.musicxml
│   │   ├── generate-timemaps.js
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── player.js
│   │   ├── rehearse.html
│   │   ├── scores
│   │   │   ├── 000_opening
│   │   │   │   ├── 000_opening.json
│   │   │   │   └── 000_opening.mei
│   │   │   ├── 001_who_likes_christmas
│   │   │   │   ├── 001_Who_Likes_Christmas.json
│   │   │   │   └── 001_Who_Likes_Christmas.mei
│   │   │   ├── 002_this_time_of_year
│   │   │   │   ├── 002_This_Time_of_Year-metadata.json
│   │   │   │   ├── 002_This_Time_of_Year.json
│   │   │   │   └── 002_This_Time_of_Year.mei
│   │   │   ├── 003_i_hate_christmas
│   │   │   │   ├── 003_I_Hate_Christmas_Eve.json
│   │   │   │   └── 003_I_Hate_Christmas_Eve.mei
│   │   │   ├── 004_whatchamawho
│   │   │   │   ├── 004_Whatchamawho.json
│   │   │   │   └── 004_Whatchamawho.mei
│   │   │   ├── 005_welcome_christmas
│   │   │   │   ├── 005_Welcome_Christmas.json
│   │   │   │   └── 005_Welcome_Christmas.mei
│   │   │   ├── 006_i_hate_christmas_eve_reprise
│   │   │   │   ├── 006_I_Hate_Christmas_Reprise.json
│   │   │   │   └── 006_I_Hate_Christmas_Reprise.mei
│   │   │   ├── 007_its_the_thought
│   │   │   │   ├── 007_its_the_thought.json
│   │   │   │   └── 007_its_the_thought.mei
│   │   │   ├── 007a_after_thought
│   │   │   │   ├── 007a_After_Thought.json
│   │   │   │   └── 007a_After_Thought.mei
│   │   │   ├── 008_this_time_of_year_reprise1
│   │   │   │   ├── 008_This_Time_of_Year_Reprise1.json
│   │   │   │   └── 008_This_Time_of_Year_Reprise1.mei
│   │   │   ├── 009_one_of_a_kind
│   │   │   │   ├── 009_One_Of_A_Kind.json
│   │   │   │   └── 009_One_Of_A_Kind.mei
│   │   │   ├── 011_nows_the_time
│   │   │   │   ├── 011_Now's_The_Time.mei
│   │   │   │   ├── 011_Nows_The_Time.json
│   │   │   │   └── 011_Nows_The_Time.mei
│   │   │   ├── 013_youre_a_mean_one
│   │   │   │   ├── 013_Youre_a_Mean_One.json
│   │   │   │   └── 013_Youre_a_Mean_One.mei
│   │   │   ├── 014_santa_for_a_day
│   │   │   │   ├── 014_Santa_For_a_Day.json
│   │   │   │   └── 014_Santa_For_a_Day.mei
│   │   │   ├── 015a_youre_a_mean_one_reprise
│   │   │   │   ├── 015A_Youre_A_Mean_One_Reprise.json
│   │   │   │   └── 015A_Youre_A_Mean_One_Reprise.mei
│   │   │   ├── 016_whos_like_christmas_reprise
│   │   │   │   ├── 016_Who_Likes_Christmas_Reprise.json
│   │   │   │   └── 016_Who_Likes_Christmas_Reprise.mei
│   │   │   ├── 017_one_of_a_kind_reprise
│   │   │   │   ├── 017_One_of_a_Kind_Resprise.json
│   │   │   │   └── 017_One_of_a_Kind_Resprise.mei
│   │   │   ├── 017a_this_time_of_year_reprise2
│   │   │   │   ├── 017a_This_Time_of_Year_Reprise2.json
│   │   │   │   └── 017a_This_Time_of_Year_Reprise2.mei
│   │   │   ├── 018_welcome_christmas_reprise
│   │   │   │   ├── 018_Welcome_Christmas_Reprise.json
│   │   │   │   └── 018_Welcome_Christmas_Reprise.mei
│   │   │   ├── 019_finale
│   │   │   │   ├── 019_Finale.json
│   │   │   │   └── 019_Finale.mei
│   │   │   ├── 020_bows
│   │   │   │   ├── 020_Bows.json
│   │   │   │   └── 020_Bows.mei
│   │   │   └── scores.json
│   │   ├── soundfonts
│   │   │   ├── acoustic_grand_piano-ogg.js
│   │   │   └── choir_aahs-ogg.js
│   │   ├── test-audio.html
│   │   └── test-verovio.html
│   ├── se
│   │   ├── projects
│   │   │   └── software.json
│   │   ├── use-case-mapper-backup.html
│   │   ├── use-case-mapper-v2.html
│   │   └── use-case-mapper.html
│   └── wiz
│       ├── CLAUDE.md
│       ├── Rehearsal.md
│       ├── __pycache__
│       │   ├── app.cpython-311.pyc
│       │   ├── app.cpython-314.pyc
│       │   ├── logic.cpython-311.pyc
│       │   ├── sections.cpython-311.pyc
│       │   └── state.cpython-311.pyc
│       ├── app.py
│       ├── data
│       ├── docs
│       │   ├── cross_casting.md
│       │   ├── css.md
│       │   ├── info.md
│       │   ├── priority_song.md
│       │   ├── ui.md
│       │   ├── update2.md
│       │   ├── updates.md
│       │   ├── updates3.md
│       │   └── updates4.md
│       ├── logic.py
│       ├── project_plan.md
│       ├── project_structure.md
│       ├── requirements.txt
│       ├── sections.py
│       ├── state.py
│       ├── templates
│       │   ├── auditions.html
│       │   ├── base.html
│       │   ├── cast.html
│       │   ├── crosscast.html
│       │   ├── planner.html
│       │   └── songs.html
│       └── venv
│           ├── CACHEDIR.TAG
│           ├── bin
│           │   ├── activate
│           │   ├── activate.bat
│           │   ├── activate.csh
│           │   ├── activate.fish
│           │   ├── activate.nu
│           │   ├── activate.ps1
│           │   ├── activate_this.py
│           │   ├── deactivate.bat
│           │   ├── flask
│           │   ├── pydoc.bat
│           │   ├── python -> /opt/homebrew/opt/python@3.11/bin/python3.11
│           │   ├── python3 -> python
│           │   └── python3.11 -> python
│           ├── lib
│           │   └── python3.11
│           │       └── site-packages
│           │           ├── __pycache__
│           │           │   └── _virtualenv.cpython-311.pyc
│           │           ├── _virtualenv.pth
│           │           ├── _virtualenv.py
│           │           ├── blinker
│           │           │   ├── __init__.py
│           │           │   ├── __pycache__
│           │           │   │   ├── __init__.cpython-311.pyc
│           │           │   │   ├── _utilities.cpython-311.pyc
│           │           │   │   └── base.cpython-311.pyc
│           │           │   ├── _utilities.py
│           │           │   ├── base.py
│           │           │   └── py.typed
│           │           ├── blinker-1.9.0.dist-info
│           │           │   ├── INSTALLER
│           │           │   ├── LICENSE.txt
│           │           │   ├── METADATA
│           │           │   ├── RECORD
│           │           │   ├── REQUESTED
│           │           │   └── WHEEL
│           │           ├── click
│           │           │   ├── __init__.py
│           │           │   ├── __pycache__
│           │           │   │   ├── __init__.cpython-311.pyc
│           │           │   │   ├── _compat.cpython-311.pyc
│           │           │   │   ├── _utils.cpython-311.pyc
│           │           │   │   ├── core.cpython-311.pyc
│           │           │   │   ├── decorators.cpython-311.pyc
│           │           │   │   ├── exceptions.cpython-311.pyc
│           │           │   │   ├── formatting.cpython-311.pyc
│           │           │   │   ├── globals.cpython-311.pyc
│           │           │   │   ├── parser.cpython-311.pyc
│           │           │   │   ├── termui.cpython-311.pyc
│           │           │   │   ├── testing.cpython-311.pyc
│           │           │   │   ├── types.cpython-311.pyc
│           │           │   │   └── utils.cpython-311.pyc
│           │           │   ├── _compat.py
│           │           │   ├── _termui_impl.py
│           │           │   ├── _textwrap.py
│           │           │   ├── _utils.py
│           │           │   ├── _winconsole.py
│           │           │   ├── core.py
│           │           │   ├── decorators.py
│           │           │   ├── exceptions.py
│           │           │   ├── formatting.py
│           │           │   ├── globals.py
│           │           │   ├── parser.py
│           │           │   ├── py.typed
│           │           │   ├── shell_completion.py
│           │           │   ├── termui.py
│           │           │   ├── testing.py
│           │           │   ├── types.py
│           │           │   └── utils.py
│           │           ├── click-8.3.1.dist-info
│           │           │   ├── INSTALLER
│           │           │   ├── METADATA
│           │           │   ├── RECORD
│           │           │   ├── REQUESTED
│           │           │   ├── WHEEL
│           │           │   └── licenses
│           │           │       └── LICENSE.txt
│           │           ├── flask
│           │           │   ├── __init__.py
│           │           │   ├── __main__.py
│           │           │   ├── __pycache__
│           │           │   │   ├── __init__.cpython-311.pyc
│           │           │   │   ├── app.cpython-311.pyc
│           │           │   │   ├── blueprints.cpython-311.pyc
│           │           │   │   ├── cli.cpython-311.pyc
│           │           │   │   ├── config.cpython-311.pyc
│           │           │   │   ├── ctx.cpython-311.pyc
│           │           │   │   ├── debughelpers.cpython-311.pyc
│           │           │   │   ├── globals.cpython-311.pyc
│           │           │   │   ├── helpers.cpython-311.pyc
│           │           │   │   ├── logging.cpython-311.pyc
│           │           │   │   ├── sessions.cpython-311.pyc
│           │           │   │   ├── signals.cpython-311.pyc
│           │           │   │   ├── templating.cpython-311.pyc
│           │           │   │   ├── testing.cpython-311.pyc
│           │           │   │   ├── typing.cpython-311.pyc
│           │           │   │   └── wrappers.cpython-311.pyc
│           │           │   ├── app.py
│           │           │   ├── blueprints.py
│           │           │   ├── cli.py
│           │           │   ├── config.py
│           │           │   ├── ctx.py
│           │           │   ├── debughelpers.py
│           │           │   ├── globals.py
│           │           │   ├── helpers.py
│           │           │   ├── json
│           │           │   │   ├── __init__.py
│           │           │   │   ├── __pycache__
│           │           │   │   │   ├── __init__.cpython-311.pyc
│           │           │   │   │   ├── provider.cpython-311.pyc
│           │           │   │   │   └── tag.cpython-311.pyc
│           │           │   │   ├── provider.py
│           │           │   │   └── tag.py
│           │           │   ├── logging.py
│           │           │   ├── py.typed
│           │           │   ├── sansio
│           │           │   │   ├── README.md
│           │           │   │   ├── __pycache__
│           │           │   │   │   ├── app.cpython-311.pyc
│           │           │   │   │   ├── blueprints.cpython-311.pyc
│           │           │   │   │   └── scaffold.cpython-311.pyc
│           │           │   │   ├── app.py
│           │           │   │   ├── blueprints.py
│           │           │   │   └── scaffold.py
│           │           │   ├── sessions.py
│           │           │   ├── signals.py
│           │           │   ├── templating.py
│           │           │   ├── testing.py
│           │           │   ├── typing.py
│           │           │   ├── views.py
│           │           │   └── wrappers.py
│           │           ├── flask-3.1.2.dist-info
│           │           │   ├── INSTALLER
│           │           │   ├── METADATA
│           │           │   ├── RECORD
│           │           │   ├── REQUESTED
│           │           │   ├── WHEEL
│           │           │   ├── entry_points.txt
│           │           │   └── licenses
│           │           │       └── LICENSE.txt
│           │           ├── itsdangerous
│           │           │   ├── __init__.py
│           │           │   ├── __pycache__
│           │           │   │   ├── __init__.cpython-311.pyc
│           │           │   │   ├── _json.cpython-311.pyc
│           │           │   │   ├── encoding.cpython-311.pyc
│           │           │   │   ├── exc.cpython-311.pyc
│           │           │   │   ├── serializer.cpython-311.pyc
│           │           │   │   ├── signer.cpython-311.pyc
│           │           │   │   ├── timed.cpython-311.pyc
│           │           │   │   └── url_safe.cpython-311.pyc
│           │           │   ├── _json.py
│           │           │   ├── encoding.py
│           │           │   ├── exc.py
│           │           │   ├── py.typed
│           │           │   ├── serializer.py
│           │           │   ├── signer.py
│           │           │   ├── timed.py
│           │           │   └── url_safe.py
│           │           ├── itsdangerous-2.2.0.dist-info
│           │           │   ├── INSTALLER
│           │           │   ├── LICENSE.txt
│           │           │   ├── METADATA
│           │           │   ├── RECORD
│           │           │   ├── REQUESTED
│           │           │   └── WHEEL
│           │           ├── jinja2
│           │           │   ├── __init__.py
│           │           │   ├── __pycache__
│           │           │   │   ├── __init__.cpython-311.pyc
│           │           │   │   ├── _identifier.cpython-311.pyc
│           │           │   │   ├── async_utils.cpython-311.pyc
│           │           │   │   ├── bccache.cpython-311.pyc
│           │           │   │   ├── compiler.cpython-311.pyc
│           │           │   │   ├── defaults.cpython-311.pyc
│           │           │   │   ├── environment.cpython-311.pyc
│           │           │   │   ├── exceptions.cpython-311.pyc
│           │           │   │   ├── filters.cpython-311.pyc
│           │           │   │   ├── idtracking.cpython-311.pyc
│           │           │   │   ├── lexer.cpython-311.pyc
│           │           │   │   ├── loaders.cpython-311.pyc
│           │           │   │   ├── nodes.cpython-311.pyc
│           │           │   │   ├── optimizer.cpython-311.pyc
│           │           │   │   ├── parser.cpython-311.pyc
│           │           │   │   ├── runtime.cpython-311.pyc
│           │           │   │   ├── tests.cpython-311.pyc
│           │           │   │   ├── utils.cpython-311.pyc
│           │           │   │   └── visitor.cpython-311.pyc
│           │           │   ├── _identifier.py
│           │           │   ├── async_utils.py
│           │           │   ├── bccache.py
│           │           │   ├── compiler.py
│           │           │   ├── constants.py
│           │           │   ├── debug.py
│           │           │   ├── defaults.py
│           │           │   ├── environment.py
│           │           │   ├── exceptions.py
│           │           │   ├── ext.py
│           │           │   ├── filters.py
│           │           │   ├── idtracking.py
│           │           │   ├── lexer.py
│           │           │   ├── loaders.py
│           │           │   ├── meta.py
│           │           │   ├── nativetypes.py
│           │           │   ├── nodes.py
│           │           │   ├── optimizer.py
│           │           │   ├── parser.py
│           │           │   ├── py.typed
│           │           │   ├── runtime.py
│           │           │   ├── sandbox.py
│           │           │   ├── tests.py
│           │           │   ├── utils.py
│           │           │   └── visitor.py
│           │           ├── jinja2-3.1.6.dist-info
│           │           │   ├── INSTALLER
│           │           │   ├── METADATA
│           │           │   ├── RECORD
│           │           │   ├── REQUESTED
│           │           │   ├── WHEEL
│           │           │   ├── entry_points.txt
│           │           │   └── licenses
│           │           │       └── LICENSE.txt
│           │           ├── markupsafe
│           │           │   ├── __init__.py
│           │           │   ├── __pycache__
│           │           │   │   └── __init__.cpython-311.pyc
│           │           │   ├── _native.py
│           │           │   ├── _speedups.c
│           │           │   ├── _speedups.cpython-311-darwin.so
│           │           │   ├── _speedups.pyi
│           │           │   └── py.typed
│           │           ├── markupsafe-3.0.3.dist-info
│           │           │   ├── INSTALLER
│           │           │   ├── METADATA
│           │           │   ├── RECORD
│           │           │   ├── REQUESTED
│           │           │   ├── WHEEL
│           │           │   ├── licenses
│           │           │   │   └── LICENSE.txt
│           │           │   └── top_level.txt
│           │           ├── werkzeug
│           │           │   ├── __init__.py
│           │           │   ├── __pycache__
│           │           │   │   ├── __init__.cpython-311.pyc
│           │           │   │   ├── _internal.cpython-311.pyc
│           │           │   │   ├── _reloader.cpython-311.pyc
│           │           │   │   ├── exceptions.cpython-311.pyc
│           │           │   │   ├── formparser.cpython-311.pyc
│           │           │   │   ├── http.cpython-311.pyc
│           │           │   │   ├── local.cpython-311.pyc
│           │           │   │   ├── security.cpython-311.pyc
│           │           │   │   ├── serving.cpython-311.pyc
│           │           │   │   ├── test.cpython-311.pyc
│           │           │   │   ├── urls.cpython-311.pyc
│           │           │   │   ├── user_agent.cpython-311.pyc
│           │           │   │   ├── utils.cpython-311.pyc
│           │           │   │   └── wsgi.cpython-311.pyc
│           │           │   ├── _internal.py
│           │           │   ├── _reloader.py
│           │           │   ├── datastructures
│           │           │   │   ├── __init__.py
│           │           │   │   ├── __pycache__
│           │           │   │   │   ├── __init__.cpython-311.pyc
│           │           │   │   │   ├── accept.cpython-311.pyc
│           │           │   │   │   ├── auth.cpython-311.pyc
│           │           │   │   │   ├── cache_control.cpython-311.pyc
│           │           │   │   │   ├── csp.cpython-311.pyc
│           │           │   │   │   ├── etag.cpython-311.pyc
│           │           │   │   │   ├── file_storage.cpython-311.pyc
│           │           │   │   │   ├── headers.cpython-311.pyc
│           │           │   │   │   ├── mixins.cpython-311.pyc
│           │           │   │   │   ├── range.cpython-311.pyc
│           │           │   │   │   └── structures.cpython-311.pyc
│           │           │   │   ├── accept.py
│           │           │   │   ├── auth.py
│           │           │   │   ├── cache_control.py
│           │           │   │   ├── csp.py
│           │           │   │   ├── etag.py
│           │           │   │   ├── file_storage.py
│           │           │   │   ├── headers.py
│           │           │   │   ├── mixins.py
│           │           │   │   ├── range.py
│           │           │   │   └── structures.py
│           │           │   ├── debug
│           │           │   │   ├── __init__.py
│           │           │   │   ├── __pycache__
│           │           │   │   │   ├── __init__.cpython-311.pyc
│           │           │   │   │   ├── console.cpython-311.pyc
│           │           │   │   │   ├── repr.cpython-311.pyc
│           │           │   │   │   └── tbtools.cpython-311.pyc
│           │           │   │   ├── console.py
│           │           │   │   ├── repr.py
│           │           │   │   ├── shared
│           │           │   │   │   ├── ICON_LICENSE.md
│           │           │   │   │   ├── console.png
│           │           │   │   │   ├── debugger.js
│           │           │   │   │   ├── less.png
│           │           │   │   │   ├── more.png
│           │           │   │   │   └── style.css
│           │           │   │   └── tbtools.py
│           │           │   ├── exceptions.py
│           │           │   ├── formparser.py
│           │           │   ├── http.py
│           │           │   ├── local.py
│           │           │   ├── middleware
│           │           │   │   ├── __init__.py
│           │           │   │   ├── dispatcher.py
│           │           │   │   ├── http_proxy.py
│           │           │   │   ├── lint.py
│           │           │   │   ├── profiler.py
│           │           │   │   ├── proxy_fix.py
│           │           │   │   └── shared_data.py
│           │           │   ├── py.typed
│           │           │   ├── routing
│           │           │   │   ├── __init__.py
│           │           │   │   ├── __pycache__
│           │           │   │   │   ├── __init__.cpython-311.pyc
│           │           │   │   │   ├── converters.cpython-311.pyc
│           │           │   │   │   ├── exceptions.cpython-311.pyc
│           │           │   │   │   ├── map.cpython-311.pyc
│           │           │   │   │   ├── matcher.cpython-311.pyc
│           │           │   │   │   └── rules.cpython-311.pyc
│           │           │   │   ├── converters.py
│           │           │   │   ├── exceptions.py
│           │           │   │   ├── map.py
│           │           │   │   ├── matcher.py
│           │           │   │   └── rules.py
│           │           │   ├── sansio
│           │           │   │   ├── __init__.py
│           │           │   │   ├── __pycache__
│           │           │   │   │   ├── __init__.cpython-311.pyc
│           │           │   │   │   ├── http.cpython-311.pyc
│           │           │   │   │   ├── multipart.cpython-311.pyc
│           │           │   │   │   ├── request.cpython-311.pyc
│           │           │   │   │   ├── response.cpython-311.pyc
│           │           │   │   │   └── utils.cpython-311.pyc
│           │           │   │   ├── http.py
│           │           │   │   ├── multipart.py
│           │           │   │   ├── request.py
│           │           │   │   ├── response.py
│           │           │   │   └── utils.py
│           │           │   ├── security.py
│           │           │   ├── serving.py
│           │           │   ├── test.py
│           │           │   ├── testapp.py
│           │           │   ├── urls.py
│           │           │   ├── user_agent.py
│           │           │   ├── utils.py
│           │           │   ├── wrappers
│           │           │   │   ├── __init__.py
│           │           │   │   ├── __pycache__
│           │           │   │   │   ├── __init__.cpython-311.pyc
│           │           │   │   │   ├── request.cpython-311.pyc
│           │           │   │   │   └── response.cpython-311.pyc
│           │           │   │   ├── request.py
│           │           │   │   └── response.py
│           │           │   └── wsgi.py
│           │           └── werkzeug-3.1.5.dist-info
│           │               ├── INSTALLER
│           │               ├── METADATA
│           │               ├── RECORD
│           │               ├── REQUESTED
│           │               ├── WHEEL
│           │               └── licenses
│           │                   └── LICENSE.txt
│           └── pyvenv.cfg
├── build
│   ├── CMakeCache.txt
│   └── CMakeFiles
│       ├── 4.1.2
│       │   ├── CMakeCCompiler.cmake
│       │   ├── CMakeCXXCompiler.cmake
│       │   ├── CMakeDetermineCompilerABI_C.bin
│       │   ├── CMakeDetermineCompilerABI_CXX.bin
│       │   ├── CMakeSystem.cmake
│       │   ├── CompilerIdC
│       │   │   ├── CMakeCCompilerId.c
│       │   │   ├── a.out
│       │   │   └── apple-sdk.c
│       │   └── CompilerIdCXX
│       │       ├── CMakeCXXCompilerId.cpp
│       │       ├── a.out
│       │       └── apple-sdk.cpp
│       ├── CMakeConfigureLog.yaml
│       └── cmake.check_cache
├── clone_voice.py
├── original_project.html
├── package-lock.json
├── package.json
├── redis_vercel.md
├── requirements.txt
├── shared
│   ├── static
│   │   └── analytics.js
│   └── templates
│       ├── index.html
│       └── study.html
├── split_audio.py
├── study.html
├── test_drive_access.py
├── tree.md
├── tsconfig.json
├── vercel.json
├── vercel_blob.md
├── viz.js
└── xtts_voice_clone.py

137 directories, 969 files
