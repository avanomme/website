#!/usr/bin/env python3
"""
Fix MEI tempo markings to always use quarter note = BPM format.

This script finds all <tempo> elements in MEI files and ensures the displayed
tempo matches the midi.bpm attribute (which is always in quarter notes per minute).

Usage:
    python fix_mei_tempos.py [directory]

If no directory is specified, processes all MEI files in ./scores/
"""

import os
import sys
import re
import xml.etree.ElementTree as ET
from pathlib import Path


def fix_tempo_element(tempo_elem, namespace):
    """
    Fix a single tempo element to display quarter note tempo.

    Args:
        tempo_elem: XML element for <tempo>
        namespace: MEI namespace dict

    Returns:
        bool: True if the element was modified
    """
    # Get midi.bpm attribute
    midi_bpm = tempo_elem.get('{http://www.music-encoding.org/ns/mei}bpm')
    if not midi_bpm and 'midi.bpm' in tempo_elem.attrib:
        # Try without namespace
        midi_bpm = tempo_elem.get('midi.bpm')

    if not midi_bpm:
        print(f"  Warning: tempo element {tempo_elem.get('id')} has no midi.bpm attribute")
        return False

    try:
        bpm_value = int(float(midi_bpm))
    except (ValueError, TypeError):
        print(f"  Warning: invalid midi.bpm value: {midi_bpm}")
        return False

    # Get the text content (the displayed tempo)
    # The format is usually: <rend>glyph</rend> = 123
    text_content = ''.join(tempo_elem.itertext()).strip()

    # Extract the number from the text (after the = sign)
    match = re.search(r'=\s*(\d+)', text_content)
    if not match:
        print(f"  Warning: couldn't parse tempo text: {text_content}")
        return False

    displayed_tempo = int(match.group(1))

    # Check if it needs fixing
    if displayed_tempo == bpm_value:
        return False  # Already correct

    # Fix the text content
    # Replace the number after = with the midi.bpm value
    new_text = re.sub(r'=\s*\d+', f'= {bpm_value}', text_content)

    # Update the element's text
    # The structure is: <tempo><rend>glyph</rend> = 123</tempo>
    # We need to update the tail of the <rend> element or the text of <tempo>

    rend_elem = tempo_elem.find('.//{http://www.music-encoding.org/ns/mei}rend')
    if rend_elem is None:
        # Try without namespace
        rend_elem = tempo_elem.find('.//rend')

    if rend_elem is not None:
        # Update the tail of <rend> (text after </rend> but inside <tempo>)
        old_tail = rend_elem.tail or ''
        new_tail = re.sub(r'=\s*\d+', f'= {bpm_value}', old_tail)
        if new_tail != old_tail:
            rend_elem.tail = new_tail
            print(f"  ✓ Fixed: {text_content} → quarter = {bpm_value}")
            return True
    else:
        # No <rend> element, tempo might have direct text
        if tempo_elem.text:
            old_text = tempo_elem.text
            new_text = re.sub(r'=\s*\d+', f'= {bpm_value}', old_text)
            if new_text != old_text:
                tempo_elem.text = new_text
                print(f"  ✓ Fixed: {text_content} → quarter = {bpm_value}")
                return True

    return False


def fix_mei_file(filepath):
    """
    Fix all tempo markings in an MEI file.

    Args:
        filepath: Path to the MEI file

    Returns:
        int: Number of tempo markings fixed
    """
    print(f"\nProcessing: {filepath}")

    # Register MEI namespace
    namespace = {'mei': 'http://www.music-encoding.org/ns/mei'}
    ET.register_namespace('', 'http://www.music-encoding.org/ns/mei')

    try:
        # Parse the MEI file
        tree = ET.parse(filepath)
        root = tree.getroot()

        # Find all tempo elements
        tempo_elements = root.findall('.//{http://www.music-encoding.org/ns/mei}tempo', namespace)
        if not tempo_elements:
            # Try without namespace
            tempo_elements = root.findall('.//tempo')

        if not tempo_elements:
            print("  No tempo markings found")
            return 0

        print(f"  Found {len(tempo_elements)} tempo marking(s)")

        # Fix each tempo element
        fixes_made = 0
        for tempo_elem in tempo_elements:
            if fix_tempo_element(tempo_elem, namespace):
                fixes_made += 1

        # Save the file if any changes were made
        if fixes_made > 0:
            # Create backup
            backup_path = str(filepath) + '.backup'
            if not os.path.exists(backup_path):
                import shutil
                shutil.copy2(filepath, backup_path)
                print(f"  Backup created: {backup_path}")

            # Write the fixed file
            tree.write(filepath, encoding='utf-8', xml_declaration=True)
            print(f"  ✅ Saved {fixes_made} fix(es) to {filepath}")
        else:
            print("  ℹ️  No fixes needed")

        return fixes_made

    except Exception as e:
        print(f"  ❌ Error processing file: {e}")
        import traceback
        traceback.print_exc()
        return 0


def main():
    """Main function to process MEI files."""
    # Determine directory to process
    if len(sys.argv) > 1:
        base_dir = Path(sys.argv[1])
    else:
        base_dir = Path(__file__).parent / 'scores'

    if not base_dir.exists():
        print(f"Error: Directory not found: {base_dir}")
        sys.exit(1)

    print(f"Scanning for MEI files in: {base_dir}")

    # Find all MEI files
    mei_files = list(base_dir.glob('**/*.mei'))

    if not mei_files:
        print("No MEI files found")
        sys.exit(0)

    print(f"Found {len(mei_files)} MEI file(s)\n")
    print("=" * 60)

    # Process each file
    total_fixes = 0
    for mei_file in sorted(mei_files):
        fixes = fix_mei_file(mei_file)
        total_fixes += fixes

    print("\n" + "=" * 60)
    print(f"\n✨ Complete! Total fixes made: {total_fixes}")

    if total_fixes > 0:
        print("\n⚠️  Important: You should now regenerate the JSON timemaps:")
        print("   node generate-timemaps.js")


if __name__ == '__main__':
    main()
