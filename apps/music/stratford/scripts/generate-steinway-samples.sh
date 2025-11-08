#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOUNDFONT="${REPO_ROOT}/soundfonts/steinway.SF2"
OUTPUT_DIR="${REPO_ROOT}/soundfonts/steinway"

if [[ ! -f "${SOUNDFONT}" ]]; then
  echo "SoundFont not found at ${SOUNDFONT}" >&2
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"

notes=(
  "A0 21"
  "C1 24"
  "F#1 30"
  "C2 36"
  "F#2 42"
  "C3 48"
  "F#3 54"
  "C4 60"
  "F#4 66"
  "C5 72"
  "F#5 78"
  "C6 84"
  "F#6 90"
  "C7 96"
  "F#7 102"
  "C8 108"
)

echo "Rendering Steinway samples from ${SOUNDFONT}"

for entry in "${notes[@]}"; do
  name="${entry%% *}"
  midi="${entry##* }"
  output="${OUTPUT_DIR}/${name}.wav"

  echo "→ Rendering ${name} (MIDI ${midi})"
  tmp_midi="$(mktemp "${OUTPUT_DIR}/tmp.XXXXXX.mid")"

  python3 <<PY
import struct
note = ${midi}
velocity = 0x78
tempo = 500000  # 120 BPM
division = 480

header = b'MThd' + (6).to_bytes(4, 'big') + (0).to_bytes(2, 'big') + (1).to_bytes(2, 'big') + division.to_bytes(2, 'big')

events = bytearray()
events.extend(b'\x00\xFF\x51\x03' + tempo.to_bytes(3, 'big'))
events.extend(b'\x00\xC0\x00')
events.extend(b'\x00' + bytes([0x90, note, velocity]))

duration = 960
vlq = bytearray()
value = duration
vlq.append(value & 0x7F)
value >>= 7
while value:
    vlq.insert(0, (value & 0x7F) | 0x80)
    value >>= 7

events.extend(vlq + bytes([0x80, note, 0x40]))
events.extend(b'\x00\xFF\x2F\x00')

track = b'MTrk' + len(events).to_bytes(4, 'big') + events

with open("${tmp_midi}", "wb") as fh:
    fh.write(header + track)
PY

  rm -f "${output}"

  fluidsynth -ni -F "${output}" "${SOUNDFONT}" "${tmp_midi}" >/dev/null
  rm -f "${tmp_midi}"

  if [[ ! -s "${output}" ]]; then
    echo "✗ Failed to render ${name}" >&2
    exit 1
  fi
done

echo "Samples written to ${OUTPUT_DIR}"
