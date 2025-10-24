
⏺ Project Summary

  Main Application

  File: /Users/adam/pr
  ojects/Stratford
  copy/rehearse.html

  A web-based
  rehearsal tool for
  the Stratford
  Christmas Choir 2025
   that combines:
  - Verovio (develop
  branch) for MEI
  music notation
  rendering
  - Tone.js for MIDI
  audio synthesis with
   tempo control
  - Custom JSON timing
   events for precise
  note highlighting
  - MIDI.js soundfonts
   (acoustic_grand_pia
  no, choir_aahs)

  Recent Work 
  Completed

  1. Highlighting 
  Improvements (rehear
  se5.html:205-246,
  974-1046)
    - Changed color
  from purple to
  vibrant green
  (#22c55e) for better
   visibility
    - Implemented
  sustained note
  highlighting using
  "on"/"off" arrays
  from JSON timing
  files
    - Notes now stay
  highlighted for
  their full duration
  (whole notes = 4
  beats, etc.)
  2. Piano Volume 
  Default (rehearse5.h
  tml:1480-1485,
  1611-1615)
    - Piano tracks
  default to 70%
  volume instead of
  100%
    - Other
  instruments remain
  at 100%
    - Users can adjust
   via slider in parts
   dropdown
  3. CSS Animation 
  Tempo Sync (rehearse
  5.html:206-208,
  1123-1141,
  1153-1170)
    - Animation
  duration now scales
  with tempo changes
    - Formula: (0.5s ×
   100 BPM) / actual
  BPM
    - Forces animation
   restart when MEI
  tempo changes occur
  during playback
    - Works for both
  user tempo slider
  changes and MEI/MIDI
   tempo events
  4. Progress Bar 
  Seeking (rehearse5.h
  tml:1660-1683)
    - Click anywhere
  on progress bar to
  jump to that
  position
    - Sets
  startMeasureTime to
  clicked position
    - Next playback
  starts from that
  point
    - Stop button
  resets to beginning
  5. Piano Parts 
  Grouping (rehearse5.
  html:1746-1792)
    - All piano tracks
   (Piano, Piano 1,
  Piano 2) combined
  into single "Piano"
  option
    - Mute/volume
  controls affect all
  grouped tracks
  6. Measure Slider 
  Removal
    - Removed
  non-functional
  measure slider from
  sidebar
    - Discovered
  timeMap.measures
  returns empty array
  (0 measures)

  Current Issue

  TimeMap Measures 
  Problem:
  - Console shows:
  [App] TimeMap 
  measures count: 0
  - Verovio's
  renderToTimemap()
  returns measures
  array but it's empty
  - Added debugging
  logs to investigate
  (lines 1452-1454,
  1462-1469)
  - Custom timing JSON
   files
  (we-three.json,
  etc.) have qstamp
  and tstamp but no
  measure data

  Key Technical 
  Details

  Time Scaling for 
  Tempo:
  - MIDI scheduling:
  (noteTime - 
  startTime) /
  tempoFactor
  - Highlighting
  lookup:
  (transportTime × 
  tempoFactor) +
  startTime
  - Ensures perfect
  sync at any tempo
  (50%, 75%, 100%,
  etc.)

  State Variables
  (rehearse.html:745-
  767):
  - timeMap: Timing
  events + measures
  (from Verovio or
  custom JSON)
  - startMeasureTime:
  Where playback
  should begin (in
  seconds)
  - tempoFactor: User
  tempo adjustment
  (1.0 = 100%)
  - playerState:
  'stopped',
  'playing', or
  'paused'

  File Structure:
  scores/
    scores.json
  (manifest with 9
  scores)
    candlelight-carol/
      candlelight-caro
  l.mei
      candlelight-caro
  l.json
    we-three/
      we-three.mei
      we-three.json
    ...

  Next Steps / Open 
  Questions

  1. Investigate why
  timeMap.measures is
  empty - check
  console output for
  Verovio timeMap
  structure
  2. Potentially need
  alternative approach
   to measure
  navigation
  3. Consider
  extracting measure
  boundaries from
  qstamp values in
  custom JSON events

  Reference Files

  - /Users/adam/projec
  ts/Stratford copy/ve
  rovio_midi.html -
  Working reference
  implementation
  - /Users/adam/projec
  ts/CLAUDE.md -
  Project instructions
   (for score-miner,
  different project)
