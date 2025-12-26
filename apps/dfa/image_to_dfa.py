#!/usr/bin/env python3
"""
DFA Image Recognition Module

Converts screenshot images of DFAs (handwritten or computer-generated)
to structured transition tables using OpenRouter Vision API.

Usage:
    python image_to_dfa.py screenshot.png           # Output markdown table
    python image_to_dfa.py screenshot.png --json    # Output JSON format
    python image_to_dfa.py screenshot.png --both    # Output both formats
"""

import argparse
import base64
import json
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional
import urllib.request
import urllib.error


VISION_PROMPT = """Analyze this DFA (Deterministic Finite Automaton) diagram image.

Extract the complete DFA structure and return ONLY a JSON object (no markdown, no explanation):

{
  "states": ["q0", "q1", "q2"],
  "alphabet": ["a", "b"],
  "initial_state": "q0",
  "final_states": ["q2"],
  "transitions": [
    {"from": "q0", "to": "q1", "symbol": "a"},
    {"from": "q0", "to": "q0", "symbol": "b"},
    {"from": "q1", "to": "q2", "symbol": "a"},
    {"from": "q1", "to": "q0", "symbol": "b"},
    {"from": "q2", "to": "q2", "symbol": "a"},
    {"from": "q2", "to": "q2", "symbol": "b"}
  ]
}

Recognition rules:
- States are circles with labels (q0, q1, A, B, 0, 1, etc.)
- Initial state has an arrow pointing to it from outside/nowhere (no source state)
- Final/accepting states have double circles (circle within a circle)
- Transitions are arrows between states with symbol labels
- Self-loops are arrows that return to the same state
- Read ALL transition labels carefully - they may be single characters or comma-separated
- If a transition has multiple symbols (e.g., "a,b"), create separate transition entries for each

Return ONLY the JSON object, nothing else."""


@dataclass
class DFAResult:
    """Holds the recognized DFA structure."""
    states: List[str]
    alphabet: List[str]
    initial_state: str
    final_states: List[str]
    transitions: Dict[str, Dict[str, str]]  # {from_state: {symbol: to_state}}
    raw_transitions: List[dict] = field(default_factory=list)
    confidence: float = 1.0
    warnings: List[str] = field(default_factory=list)

    def to_markdown_table(self) -> str:
        """Generate a markdown transition table."""
        if not self.states or not self.alphabet:
            return "Error: No states or alphabet detected"

        # Sort alphabet for consistent column order
        sorted_alphabet = sorted(self.alphabet)

        # Build header
        header = "| State |"
        separator = "|-------|"
        for symbol in sorted_alphabet:
            header += f" {symbol} |"
            separator += "---|"

        lines = [header, separator]

        # Sort states, putting initial state first
        sorted_states = sorted(self.states, key=lambda s: (s != self.initial_state, s))

        for state in sorted_states:
            # Add markers for initial (→) and final (*) states
            state_label = state
            if state == self.initial_state:
                state_label = "→" + state_label
            if state in self.final_states:
                state_label = "*" + state_label

            row = f"| {state_label} |"

            state_trans = self.transitions.get(state, {})
            for symbol in sorted_alphabet:
                next_state = state_trans.get(symbol, "—")
                row += f" {next_state} |"

            lines.append(row)

        # Add legend
        lines.append("")
        lines.append(f"**Initial state:** {self.initial_state}")
        lines.append(f"**Final states:** {', '.join(self.final_states) if self.final_states else 'None'}")
        lines.append(f"**Alphabet:** {{{', '.join(sorted_alphabet)}}}")

        if self.warnings:
            lines.append("")
            lines.append("**Warnings:**")
            for warning in self.warnings:
                lines.append(f"- {warning}")

        return "\n".join(lines)

    def to_json(self) -> dict:
        """Generate JSON representation compatible with the visual editor."""
        return {
            "states": self.states,
            "alphabet": self.alphabet,
            "initial_state": self.initial_state,
            "final_states": self.final_states,
            "transitions": self.transitions,
            "confidence": self.confidence,
            "warnings": self.warnings
        }

    def to_editor_json(self) -> dict:
        """Generate JSON format for the visual DFA editor."""
        # Create state objects with positions (arrange in a circle)
        import math
        n = len(self.states)
        radius = 150
        center_x, center_y = 300, 300

        state_positions = {}
        states_list = []

        for i, state in enumerate(self.states):
            angle = (2 * math.pi * i / n) - math.pi / 2  # Start from top
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            state_positions[state] = (x, y)
            states_list.append({
                "id": i,
                "x": x,
                "y": y,
                "label": state,
                "isFinal": state in self.final_states
            })

        # Create state label to ID mapping
        label_to_id = {state: i for i, state in enumerate(self.states)}

        # Create transition objects
        transitions_list = []
        for from_state, trans in self.transitions.items():
            from_id = label_to_id.get(from_state)
            if from_id is None:
                continue

            # Group by destination
            dest_symbols = {}
            for symbol, to_state in trans.items():
                to_id = label_to_id.get(to_state)
                if to_id is None:
                    continue
                if to_id not in dest_symbols:
                    dest_symbols[to_id] = []
                dest_symbols[to_id].append(symbol)

            for to_id, symbols in dest_symbols.items():
                transitions_list.append({
                    "from": from_id,
                    "to": to_id,
                    "labels": sorted(symbols),
                    "curve": {"x": None, "y": None}
                })

        initial_id = label_to_id.get(self.initial_state, 0)

        return {
            "version": "1.0",
            "states": states_list,
            "transitions": transitions_list,
            "initialState": initial_id,
            "nextStateId": len(self.states)
        }


class DFAImageRecognizer:
    """Recognizes DFA structure from images using OpenRouter Vision API."""

    OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the recognizer.

        Args:
            api_key: OpenRouter API key. If not provided, uses OPENROUTER_API_KEY env var.
        """
        self.api_key = api_key or os.environ.get("OPENROUTER_API_KEY")

        if not self.api_key:
            raise ValueError(
                "OpenRouter API key required. Set OPENROUTER_API_KEY environment variable "
                "or pass api_key parameter."
            )

    def recognize(self, image_source: str | bytes | Path) -> DFAResult:
        """
        Recognize DFA structure from an image.

        Args:
            image_source: Path to image file, or raw image bytes

        Returns:
            DFAResult with extracted DFA structure
        """
        image_bytes = self._load_image(image_source)
        image_base64 = base64.standard_b64encode(image_bytes).decode("utf-8")
        media_type = self._detect_media_type(image_bytes)

        response = self._call_vision_api(image_base64, media_type)
        return self._parse_response(response)

    def _load_image(self, source: str | bytes | Path) -> bytes:
        """Load image from file path or return bytes directly."""
        if isinstance(source, bytes):
            return source

        path = Path(source)
        if not path.exists():
            raise FileNotFoundError(f"Image file not found: {path}")

        with open(path, "rb") as f:
            return f.read()

    def _detect_media_type(self, image_bytes: bytes) -> str:
        """Detect image media type from magic bytes."""
        if image_bytes[:8] == b'\x89PNG\r\n\x1a\n':
            return "image/png"
        elif image_bytes[:2] == b'\xff\xd8':
            return "image/jpeg"
        elif image_bytes[:4] == b'GIF8':
            return "image/gif"
        elif image_bytes[:4] == b'RIFF' and image_bytes[8:12] == b'WEBP':
            return "image/webp"
        else:
            # Default to PNG
            return "image/png"

    def _call_vision_api(self, image_base64: str, media_type: str) -> dict:
        """Call OpenRouter Vision API with the image."""

        # Build the request payload for OpenRouter
        payload = {
            "model": "amazon/nova-lite-v1",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{media_type};base64,{image_base64}"
                            }
                        },
                        {
                            "type": "text",
                            "text": VISION_PROMPT
                        }
                    ]
                }
            ],
            "max_tokens": 2048
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/adammpkins/website",
            "X-Title": "DFA Image Recognizer"
        }

        # Make the request
        req = urllib.request.Request(
            self.OPENROUTER_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST'
        )

        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                result = json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8') if e.fp else str(e)
            raise ValueError(f"OpenRouter API error ({e.code}): {error_body}")
        except urllib.error.URLError as e:
            raise ValueError(f"Network error: {e.reason}")

        # Extract text response
        try:
            response_text = result['choices'][0]['message']['content']
        except (KeyError, IndexError) as e:
            raise ValueError(f"Unexpected API response format: {result}")

        # Parse JSON from response
        try:
            # Try to extract JSON if wrapped in markdown code blocks
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()

            return json.loads(json_str)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse Vision API response as JSON: {e}\nResponse: {response_text}")

    def _parse_response(self, response: dict) -> DFAResult:
        """Parse and validate the Vision API response into a DFAResult."""
        warnings = []

        # Extract states
        states = response.get("states", [])
        if not states:
            warnings.append("No states detected in image")

        # Extract alphabet
        alphabet = response.get("alphabet", [])
        if not alphabet:
            # Try to infer from transitions
            alphabet = set()
            for trans in response.get("transitions", []):
                if "symbol" in trans:
                    alphabet.add(trans["symbol"])
            alphabet = sorted(alphabet)
            if alphabet:
                warnings.append("Alphabet inferred from transitions")

        # Extract initial state
        initial_state = response.get("initial_state", "")
        if not initial_state and states:
            initial_state = states[0]
            warnings.append(f"Initial state not detected, assuming '{initial_state}'")

        # Extract final states
        final_states = response.get("final_states", [])

        # Process transitions into dict format
        raw_transitions = response.get("transitions", [])
        transitions: Dict[str, Dict[str, str]] = {}

        for trans in raw_transitions:
            from_state = trans.get("from", "")
            to_state = trans.get("to", "")
            symbol = trans.get("symbol", "")

            if not from_state or not to_state or not symbol:
                continue

            if from_state not in transitions:
                transitions[from_state] = {}

            # Handle comma-separated symbols
            symbols = [s.strip() for s in symbol.split(",")]
            for sym in symbols:
                if sym:
                    transitions[from_state][sym] = to_state
                    if sym not in alphabet:
                        alphabet.append(sym)

        # Validate: check for missing transitions
        for state in states:
            if state not in transitions:
                warnings.append(f"No outgoing transitions detected for state '{state}'")
            else:
                for sym in alphabet:
                    if sym not in transitions[state]:
                        warnings.append(f"Missing transition from '{state}' on symbol '{sym}'")

        return DFAResult(
            states=states,
            alphabet=sorted(set(alphabet)),
            initial_state=initial_state,
            final_states=final_states,
            transitions=transitions,
            raw_transitions=raw_transitions,
            confidence=1.0 if not warnings else 0.8,
            warnings=warnings
        )


def recognize_dfa_from_image(
    image_source: str | bytes | Path,
    api_key: Optional[str] = None
) -> DFAResult:
    """
    Convenience function to recognize a DFA from an image.

    Args:
        image_source: Path to image file, or raw image bytes
        api_key: Optional OpenRouter API key (uses env var if not provided)

    Returns:
        DFAResult with extracted DFA structure
    """
    recognizer = DFAImageRecognizer(api_key=api_key)
    return recognizer.recognize(image_source)


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Convert DFA screenshot images to transition tables",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s screenshot.png              # Output markdown table
  %(prog)s screenshot.png --json       # Output JSON
  %(prog)s screenshot.png --both       # Output both formats
  %(prog)s screenshot.png --editor     # Output editor-compatible JSON
        """
    )
    parser.add_argument("image", help="Path to DFA screenshot image (PNG, JPEG)")
    parser.add_argument("--json", action="store_true", help="Output JSON format")
    parser.add_argument("--both", action="store_true", help="Output both markdown and JSON")
    parser.add_argument("--editor", action="store_true", help="Output editor-compatible JSON")
    parser.add_argument("--api-key", help="OpenRouter API key (or set OPENROUTER_API_KEY env var)")

    args = parser.parse_args()

    try:
        result = recognize_dfa_from_image(args.image, api_key=args.api_key)

        if args.editor:
            print(json.dumps(result.to_editor_json(), indent=2))
        elif args.json:
            print(json.dumps(result.to_json(), indent=2))
        elif args.both:
            print("# Markdown Table\n")
            print(result.to_markdown_table())
            print("\n\n# JSON\n")
            print(json.dumps(result.to_json(), indent=2))
        else:
            print(result.to_markdown_table())

    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
