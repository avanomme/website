#!/usr/bin/env python3
"""
Convert .mscz files to MusicXML and MIDI using MuseScore CLI
This solves both Verovio's .mscz support and tempo sync issues
"""
import subprocess
import sys
from pathlib import Path
import json


def convert_mscz_to_musicxml(mscz_path, output_dir=None):
    """
    Convert .mscz file to MusicXML using MuseScore CLI

    Args:
        mscz_path: Path to .mscz file
        output_dir: Output directory (default: same as source)

    Returns:
        Path to generated .musicxml file
    """
    mscz_path = Path(mscz_path)
    if not mscz_path.exists():
        raise FileNotFoundError(f"File not found: {mscz_path}")

    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
    else:
        output_dir = mscz_path.parent

    # Output path
    musicxml_path = output_dir / f"{mscz_path.stem}.musicxml"

    print(f"Converting {mscz_path.name} to MusicXML...")

    # Run MuseScore CLI conversion
    result = subprocess.run(
        ['mscore', str(mscz_path), '-o', str(musicxml_path)],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        raise RuntimeError(f"Conversion failed: {result.stderr}")

    print(f"✓ Created: {musicxml_path}")
    return musicxml_path


def convert_mscz_to_midi(mscz_path, output_dir=None):
    """
    Convert .mscz file to MIDI using MuseScore CLI
    This MIDI will have correct tempos from the score

    Args:
        mscz_path: Path to .mscz file
        output_dir: Output directory (default: same as source)

    Returns:
        Path to generated .mid file
    """
    mscz_path = Path(mscz_path)
    if not mscz_path.exists():
        raise FileNotFoundError(f"File not found: {mscz_path}")

    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
    else:
        output_dir = mscz_path.parent

    # Output path
    midi_path = output_dir / f"{mscz_path.stem}.mid"

    print(f"Generating MIDI from {mscz_path.name}...")

    # Run MuseScore CLI conversion
    result = subprocess.run(
        ['mscore', str(mscz_path), '-o', str(midi_path)],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        raise RuntimeError(f"Conversion failed: {result.stderr}")

    print(f"✓ Created: {midi_path}")
    return midi_path


def convert_directory(input_dir, output_dir=None):
    """
    Convert all .mscz files in a directory

    Args:
        input_dir: Directory containing .mscz files
        output_dir: Output directory (default: same as input)

    Returns:
        Dict mapping .mscz files to their converted outputs
    """
    input_dir = Path(input_dir)

    mscz_files = list(input_dir.glob('**/*.mscz'))

    if not mscz_files:
        print(f"No .mscz files found in {input_dir}")
        return {}

    print(f"\nFound {len(mscz_files)} .mscz file(s)")
    print("=" * 60)

    results = {}

    for mscz_file in sorted(mscz_files):
        print(f"\nProcessing: {mscz_file.name}")
        print("-" * 60)

        try:
            # Determine output directory for this file
            if output_dir:
                # Preserve directory structure
                rel_path = mscz_file.parent.relative_to(input_dir)
                file_output_dir = Path(output_dir) / rel_path
            else:
                file_output_dir = mscz_file.parent

            # Convert to MusicXML and MIDI
            musicxml = convert_mscz_to_musicxml(mscz_file, file_output_dir)
            midi = convert_mscz_to_midi(mscz_file, file_output_dir)

            results[str(mscz_file)] = {
                'musicxml': str(musicxml),
                'midi': str(midi),
                'success': True
            }

        except Exception as e:
            print(f"✗ Failed: {e}")
            results[str(mscz_file)] = {
                'success': False,
                'error': str(e)
            }

    print("\n" + "=" * 60)
    print(f"\n✨ Conversion complete!")
    print(f"   Success: {sum(1 for r in results.values() if r.get('success'))}/{len(results)}")

    return results


def main():
    """Main CLI entry point"""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python convert_mscz.py <file.mscz>         # Convert single file")
        print("  python convert_mscz.py <directory>         # Convert all .mscz in directory")
        print("  python convert_mscz.py <input> <output>    # Specify output directory")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    if not input_path.exists():
        print(f"Error: Path not found: {input_path}")
        sys.exit(1)

    if input_path.is_file():
        # Convert single file
        if input_path.suffix.lower() != '.mscz':
            print(f"Error: Not a .mscz file: {input_path}")
            sys.exit(1)

        try:
            musicxml = convert_mscz_to_musicxml(input_path, output_dir)
            midi = convert_mscz_to_midi(input_path, output_dir)

            print("\n✅ Conversion successful!")
            print(f"   MusicXML: {musicxml}")
            print(f"   MIDI: {midi}")

        except Exception as e:
            print(f"\n❌ Conversion failed: {e}")
            sys.exit(1)

    elif input_path.is_dir():
        # Convert directory
        results = convert_directory(input_path, output_dir)

        # Save results manifest
        manifest_path = (Path(output_dir) if output_dir else input_path) / 'conversion_manifest.json'
        with open(manifest_path, 'w') as f:
            json.dump(results, f, indent=2)

        print(f"\n📄 Manifest saved: {manifest_path}")

    else:
        print(f"Error: Invalid path: {input_path}")
        sys.exit(1)


if __name__ == '__main__':
    main()
