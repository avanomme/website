# Local Soundfonts

This directory contains pre-downloaded soundfonts for faster loading.

## Contents

- `MusyngKite/choir_aahs-mp3.js` - Choir voices (3.0 MB)
- `MusyngKite/acoustic_grand_piano-mp3.js` - Piano (2.3 MB)
- `steinway.SF2` - High-quality Steinway grand piano SoundFont (21 MB)
- `steinway/` - Rendered WAV samples extracted from `steinway.SF2` for fast playback

## Setup

Run the download script to fetch the MusyngKite soundfonts:

```bash
./scripts/download-soundfonts.sh
```

This only needs to be done once. The soundfonts are served locally by the web server for instant loading.

### Steinway samples

To extract WAV samples from the Steinway SoundFont (used by the Verovio player and test harness), run:

```bash
./scripts/generate-steinway-samples.sh
```

This renders a set of key samples (A0, C1, F#1, ..., C8) to `soundfonts/steinway/` using FluidSynth. The files are small enough to keep in the repo and provide fast, offline playback.

## Source

Soundfonts from: https://github.com/gleitz/midi-js-soundfonts
Format: MusyngKite (high-quality)
License: Public domain

## Usage

- `verovio.html` loads `soundfonts/steinway/*.wav` for piano tracks and `MusyngKite/choir_aahs-mp3.js` for vocal parts.
- `steinway_test.html` is a standalone harness that plays the score using the Steinway samples only, so you can verify the timbre in isolation.
