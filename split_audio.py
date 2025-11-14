#!/usr/bin/env python3
"""
Split audio file into 30-second clips
"""
import subprocess
import json
from pathlib import Path

INPUT_FILE = "/Users/adam/projects/website/cox7.wav"
OUTPUT_DIR = Path("/Users/adam/projects/website/cox7_clips")
CLIP_DURATION = 30  # seconds

OUTPUT_DIR.mkdir(exist_ok=True)

def get_duration(audio_file):
    """Get the duration of an audio file in seconds"""
    cmd = [
        'ffprobe', '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        audio_file
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        data = json.loads(result.stdout)
        return float(data['format']['duration'])
    except:
        return None

def split_audio(input_file, output_dir, duration=30):
    """Split audio file into clips of specified duration"""

    print(f"Input file: {input_file}")

    total_duration = get_duration(input_file)
    if not total_duration:
        print("Error: Could not determine audio duration")
        return

    print(f"Total duration: {total_duration:.2f} seconds")
    print(f"Clip duration: {duration} seconds")

    num_clips = int(total_duration / duration) + (1 if total_duration % duration > 0 else 0)
    print(f"Will create {num_clips} clips\n")

    clips_created = []

    for i in range(num_clips):
        start_time = i * duration
        clip_num = i + 1

        output_file = output_dir / f"clip_{clip_num:03d}.wav"

        cmd = [
            'ffmpeg', '-y',
            '-i', input_file,
            '-ss', str(start_time),
            '-t', str(duration),
            '-acodec', 'pcm_s16le',
            '-ar', '44100',
            '-ac', '2',
            str(output_file)
        ]

        print(f"Creating clip {clip_num}/{num_clips} (starting at {start_time}s)...", end=' ')

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            # Get actual duration of clip
            clip_duration = get_duration(str(output_file))
            file_size = output_file.stat().st_size / (1024 * 1024)  # MB

            print(f"✓ {clip_duration:.1f}s, {file_size:.1f}MB")
            clips_created.append({
                'number': clip_num,
                'file': output_file.name,
                'start': start_time,
                'duration': clip_duration,
                'size_mb': file_size
            })
        else:
            print(f"✗ Failed")
            print(f"Error: {result.stderr}")

    print("\n" + "="*60)
    print(f"Created {len(clips_created)} clips in: {output_dir}")
    print("="*60)

    print("\nClip Summary:")
    print(f"{'#':<5} {'File':<20} {'Start':<10} {'Duration':<12} {'Size':<10}")
    print("-" * 60)

    total_size = 0
    for clip in clips_created:
        print(f"{clip['number']:<5} {clip['file']:<20} {clip['start']:<10.1f} "
              f"{clip['duration']:<12.1f} {clip['size_mb']:<10.1f}")
        total_size += clip['size_mb']

    print("-" * 60)
    print(f"Total: {len(clips_created)} clips, {total_size:.1f} MB")

    print("\n" + "="*60)
    print("All clips saved to:")
    print(f"  {output_dir}")
    print("="*60)

if __name__ == '__main__':
    split_audio(INPUT_FILE, OUTPUT_DIR, CLIP_DURATION)
