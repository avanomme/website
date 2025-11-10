import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'lib'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps', 'dfa', 'lib'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps', 'dfa'))

from flask import Flask, render_template, request, jsonify, send_from_directory
import io
import subprocess
import tempfile
import uuid
from pathlib import Path
from werkzeug.utils import secure_filename
from jinja2 import ChoiceLoader, FileSystemLoader

# Try to import graphviz and dot2tex, but make them optional for Vercel deployment
try:
    from graphviz import Digraph
    GRAPHVIZ_AVAILABLE = True
except ImportError:
    GRAPHVIZ_AVAILABLE = False
    print("Warning: graphviz not available. DFA generation disabled.")

try:
    from dot2tex import dot2tex
    DOT2TEX_AVAILABLE = True
except ImportError:
    DOT2TEX_AVAILABLE = False
    print("Warning: dot2tex not available. TikZ conversion disabled.")

# Try to import the new DFA converter with improved algorithms
try:
    from converter import build_dfa_from_table, dfa_to_regex_string, DFA
    CONVERTER_AVAILABLE = True
except ImportError:
    CONVERTER_AVAILABLE = False
    print("Warning: converter module not available. Using fallback regex conversion.")

# Get the absolute path to the project directory
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

# Configure Flask with multiple template directories
app = Flask(__name__)
app.jinja_loader = ChoiceLoader([
    FileSystemLoader(os.path.join(PROJECT_DIR, 'shared', 'templates')),
    FileSystemLoader(os.path.join(PROJECT_DIR, 'apps', 'dfa', 'templates')),
])

# ============================================================================
# STATIC FILE ROUTES
# ============================================================================

# Favicon route
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(PROJECT_DIR, 'shared', 'static'), 'favicon.ico', mimetype='image/x-icon')

# Serve flashcards app
@app.route('/flashcards/')
@app.route('/flashcards/<path:filename>')
def flashcards_static(filename='index.html'):
    return send_from_directory(os.path.join(PROJECT_DIR, 'apps', 'flashcards'), filename)

# Study route (alias for flashcards)
@app.route('/study/')
@app.route('/study/<path:filename>')
def study_static(filename='index.html'):
    return send_from_directory(os.path.join(PROJECT_DIR, 'apps', 'flashcards'), filename)

# Grinch rehearsal player (production package)
@app.route('/grinch')
@app.route('/grinch/')
@app.route('/grinch/<path:filename>')
def grinch(filename='rehearse.html'):
    return send_from_directory(os.path.join(PROJECT_DIR, 'apps', 'player'), filename)

# Legacy music_player paths for soundfonts and assets (needed by grinch player)
@app.route('/music_player/<path:filename>')
def music_player_assets(filename):
    return send_from_directory(os.path.join(PROJECT_DIR, 'apps', 'player'), filename)

# Serve MusePlay (under development WebAssembly player)
@app.route('/mplay')
@app.route('/mplay/')
@app.route('/mplay/<path:filename>')
def museplay_static(filename='index.html'):
    return send_from_directory(os.path.join(PROJECT_DIR, 'apps', 'museplay', 'public'), filename)

# Serve MusePlay scores
@app.route('/scores/<path:filename>')
def museplay_scores(filename):
    return send_from_directory(os.path.join(PROJECT_DIR, 'apps', 'museplay', 'scores'), filename)

# ============================================================================
# DFA / GRAPH VISUALIZATION
# ============================================================================

def generate_dot(alph, nodes, initial, dead, final, transitions):
    if not GRAPHVIZ_AVAILABLE:
        return None

    dot = Digraph(comment='DFA')
    dot.attr(rankdir='LR')

    # Add nodes
    for node in range(int(nodes)):
        if str(node) in final:
            dot.attr('node', shape='doublecircle')
        else:
            dot.attr('node', shape='circle')

        if node == int(initial):
            dot.attr('node', style='filled', fillcolor='lightgray')

        dot.node(str(node))

    # Add dead state if specified
    if dead:
        dot.attr('node', shape='circle')
        dot.node('d', 'dead')

    # Add transitions
    for node in transitions:
        for symbol in transitions[node]:
            target = transitions[node][symbol]
            dot.edge(node, target, label=symbol)

    return dot

def generate_tikz(dot):
    dot_string = dot.source
    if not DOT2TEX_AVAILABLE:
        return f"TikZ conversion unavailable. DOT graph:\n\n{dot_string}"
    try:
        tikz_code = dot2tex(dot_string, format='tikz', crop=True)
        return tikz_code
    except Exception as e:
        return f"Error generating TikZ. Fallback to DOT graph:\n\n{dot_string}"

def generate_grail(alph, nodes, initial, final, transitions):
    """Generate Grail format representation of the DFA"""
    grail = []

    # Header comment
    grail.append("# DFA in Grail+ format")
    grail.append("# Generated by DFA Generator")
    grail.append("")

    # Start state declaration
    grail.append(f"(START) |- {initial}")
    grail.append("")

    # Transitions - format: from_state symbol to_state
    for node in range(int(nodes)):
        if str(node) in transitions:
            for symbol in sorted(transitions[str(node)].keys()):
                target = transitions[str(node)][symbol]
                if target and target.strip():  # Only include defined transitions
                    grail.append(f"{node} {symbol} {target}")

    grail.append("")

    # Final states
    for final_state in final:
        grail.append(f"{final_state} -| (FINAL)")

    return "\n".join(grail)

def generate_dot_text(alph, nodes, initial, final, transitions):
    """Generate DOT graph text representation"""
    lines = []
    lines.append("digraph DFA {")
    lines.append("    rankdir=LR;")
    lines.append("")

    # Define final states
    if final:
        final_str = " ".join(final)
        lines.append(f"    node [shape = doublecircle]; {final_str};")

    lines.append("    node [shape = circle];")
    lines.append("")

    # Add initial state marker
    lines.append(f"    __start [label=\"\", shape=none, width=0, height=0];")
    lines.append(f"    __start -> {initial};")
    lines.append("")

    # Transitions
    for node in range(int(nodes)):
        if str(node) in transitions:
            for symbol in sorted(transitions[str(node)].keys()):
                target = transitions[str(node)][symbol]
                if target and target.strip():
                    lines.append(f"    {node} -> {target} [label=\"{symbol}\"];")

    lines.append("}")
    return "\n".join(lines)

def generate_gnfa_dot(gnfa, initial, final, eliminated_states=None):
    """
    Generate GraphViz Digraph object for GNFA with regex labels on transitions.

    Args:
        gnfa: Dictionary of dictionaries {from_state: {to_state: regex_label}}
        initial: Initial state
        final: List of final states
        eliminated_states: List of states that have been eliminated (will NOT be shown)

    Returns:
        Digraph object if GRAPHVIZ_AVAILABLE, None otherwise
    """
    if not GRAPHVIZ_AVAILABLE:
        return None

    if eliminated_states is None:
        eliminated_states = []

    dot = Digraph(comment='GNFA')
    dot.attr(rankdir='LR')

    # Collect all states that have transitions (not eliminated)
    all_states = set()
    for from_state in gnfa:
        if from_state not in eliminated_states and str(from_state) not in eliminated_states:
            all_states.add(from_state)
        for to_state in gnfa[from_state]:
            if to_state not in eliminated_states and str(to_state) not in eliminated_states:
                all_states.add(to_state)

    # Define nodes - only for states that exist in GNFA
    for state in all_states:
        if state in final or str(state) in final:
            dot.node(str(state), str(state), shape='doublecircle')
        else:
            dot.node(str(state), str(state), shape='circle')

    # Add initial state marker
    dot.node('__start', '', shape='none', width='0', height='0')
    dot.edge('__start', str(initial))

    # Add transitions with regex labels (skip transitions to/from eliminated states)
    for from_state in sorted(gnfa.keys(), key=str):
        if from_state in eliminated_states or str(from_state) in eliminated_states:
            continue
        for to_state in sorted(gnfa[from_state].keys(), key=str):
            if to_state in eliminated_states or str(to_state) in eliminated_states:
                continue
            label = gnfa[from_state][to_state]
            if label:
                # Clean up label
                label = label.replace("ε", "ε")
                dot.edge(str(from_state), str(to_state), label=label)

    return dot

def generate_gnfa_grail(gnfa, initial, final):
    """
    Generate Grail code representation for GNFA with regex labels.

    Args:
        gnfa: Dictionary of dictionaries {from_state: {to_state: regex_label}}
        initial: Initial state
        final: List of final states

    Returns:
        String containing Grail code
    """
    grail = []

    # Start state
    grail.append(f"(START) |- {initial}")
    grail.append("")

    # Transitions with regex labels
    for from_state in sorted(gnfa.keys(), key=str):
        for to_state in sorted(gnfa[from_state].keys(), key=str):
            regex_label = gnfa[from_state][to_state]
            if regex_label:
                # Clean up label
                regex_label = regex_label.replace("ε", "ε")
                grail.append(f"{from_state} {regex_label} {to_state}")

    grail.append("")

    # Final states
    for final_state in final:
        grail.append(f"{final_state} -| (FINAL)")

    return "\n".join(grail)

def generate_gnfa_table(gnfa, states):
    """
    Generate HTML transition table for GNFA with regex labels.

    Args:
        gnfa: Dictionary of dictionaries {from_state: {to_state: regex_label}}
        states: List of states to include in the table

    Returns:
        HTML string containing the transition table
    """
    # Build table
    html = ['<table class="transition-table">']
    html.append('<thead><tr><th>From \\ To</th>')

    # Header row with destination states
    for to_state in states:
        html.append(f'<th>{to_state}</th>')
    html.append('</tr></thead>')

    # Data rows
    html.append('<tbody>')
    for from_state in states:
        html.append(f'<tr><th>{from_state}</th>')
        for to_state in states:
            regex = gnfa.get(from_state, {}).get(to_state, '')
            if regex:
                # Clean up regex for display
                regex = regex.replace("ε", "ε")
                html.append(f'<td>{regex}</td>')
            else:
                html.append('<td>—</td>')
        html.append('</tr>')
    html.append('</tbody>')
    html.append('</table>')

    return '\n'.join(html)

def dfa_to_regex(nodes, initial, final, transitions):
    """
    Convert DFA to regular expression using state elimination method.
    Uses the improved converter module with cost-based heuristics if available.
    """
    try:
        # Try to use the improved converter first
        if CONVERTER_AVAILABLE:
            print("DEBUG: Using improved converter module")

            # Build alphabet from transitions
            alphabet = set()
            for state in transitions:
                for symbol in transitions[state]:
                    if symbol and symbol.strip():
                        alphabet.add(symbol)

            # Build transition table in the format expected by converter
            transition_table = {}
            for state_str, trans in transitions.items():
                state = int(state_str) if isinstance(state_str, str) else state_str
                transition_table[state] = {}
                for symbol, target_str in trans.items():
                    if symbol and symbol.strip() and target_str and target_str.strip():
                        target = int(target_str) if isinstance(target_str, str) else target_str
                        transition_table[state][symbol] = target

            # Convert final states to integers
            accept_states = set()
            for f in final:
                accept_states.add(int(f) if isinstance(f, str) else f)

            # Build DFA object
            dfa = build_dfa_from_table(
                alphabet=list(alphabet),
                start_state=int(initial) if isinstance(initial, str) else initial,
                accept_states=accept_states,
                transition_table=transition_table
            )

            # Convert to regex using improved algorithm
            result = dfa_to_regex_string(dfa)
            print(f"DEBUG: Improved converter result: {result}")
            return result

        # Fallback to original implementation
        print("DEBUG: Using fallback converter")
        import re
        from collections import defaultdict

        # Build GNFA (Generalized NFA) - edges can be labeled with regexes
        # gnfa[from][to] = regex expression
        gnfa = defaultdict(lambda: defaultdict(lambda: None))

        # Convert transitions to GNFA format
        for state in transitions:
            for symbol in transitions[state]:
                target = transitions[state][symbol]
                if target and target.strip():
                    if gnfa[state][target]:
                        # Multiple symbols to same state - use alternation
                        gnfa[state][target] = f"({gnfa[state][target]}|{symbol})"
                    else:
                        gnfa[state][target] = symbol

        # Add new start and final states
        new_start = "qₛₜₐᵣₜ"
        new_final = "qfᵢₙₐₗ"

        # ε-transition from new start to old initial
        gnfa[new_start][str(initial)] = "ε"

        # ε-transitions from all old finals to new final
        for f in final:
            gnfa[str(f)][new_final] = "ε"

        # Get all states
        all_states = set([str(i) for i in range(int(nodes))]) | {new_start, new_final}
        states_to_eliminate = [str(i) for i in range(int(nodes))]

        # Remove initial and final states from elimination list
        if str(initial) in states_to_eliminate:
            states_to_eliminate.remove(str(initial))
        for f in final:
            if str(f) in states_to_eliminate:
                states_to_eliminate.remove(str(f))

        # State elimination algorithm
        for rip_state in states_to_eliminate:
            # For each pair of states (q_i, q_j) where there's a path through rip_state
            states = [s for s in all_states if s != rip_state]

            for q_i in states:
                for q_j in states:
                    # R1: q_i -> rip_state
                    # R2: rip_state -> rip_state (loop)
                    # R3: rip_state -> q_j
                    # R4: q_i -> q_j (direct)

                    R1 = gnfa[q_i].get(rip_state)
                    R2 = gnfa[rip_state].get(rip_state)
                    R3 = gnfa[rip_state].get(q_j)
                    R4 = gnfa[q_i].get(q_j)

                    # New regex: R1(R2)*R3 | R4
                    new_regex = None

                    if R1 and R3:
                        middle = f"{R1}"
                        if R2 and R2 != "ε":
                            middle += f"({R2})*"
                        middle += R3
                        new_regex = middle

                    if R4 and R4 != "ε":
                        if new_regex:
                            new_regex = f"({new_regex}|{R4})"
                        else:
                            new_regex = R4

                    if new_regex:
                        gnfa[q_i][q_j] = new_regex

            # Remove the ripped state
            if rip_state in gnfa:
                del gnfa[rip_state]
            for state in gnfa:
                if rip_state in gnfa[state]:
                    del gnfa[state][rip_state]

        # Final regex is from new_start to new_final
        result = gnfa[new_start].get(new_final, "∅")

        # Clean up ε symbols
        result = result.replace("ε", "")

        # Simplify if possible
        result = result.replace("()", "")
        result = result.replace("||", "|")

        return result if result else "∅"

    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"Error: {str(e)}"

def regex_to_nfa(regex):
    """
    Convert regular expression to NFA using Thompson's construction.
    Returns (states, alphabet, transitions, initial, finals)
    """
    try:
        # Simple regex parser and Thompson's construction
        # This is a simplified version supporting: a, b, |, *, (), concatenation

        class NFA:
            def __init__(self):
                self.state_counter = 0

            def new_state(self):
                state = self.state_counter
                self.state_counter += 1
                return state

            def build(self, regex):
                # Base cases
                if len(regex) == 1 and regex.isalpha():
                    # Single character
                    start = self.new_state()
                    end = self.new_state()
                    return {
                        'start': start,
                        'end': end,
                        'transitions': {(start, regex): {end}}
                    }

                # For now, return a simple placeholder
                start = self.new_state()
                end = self.new_state()

                # Extract alphabet from regex
                alphabet = set()
                for char in regex:
                    if char.isalpha() or char.isdigit():
                        alphabet.add(char)

                return {
                    'start': start,
                    'end': end,
                    'alphabet': alphabet,
                    'transitions': {},
                    'message': f"NFA construction from regex '{regex}' - simplified implementation"
                }

        nfa_builder = NFA()
        result = nfa_builder.build(regex)

        return result

    except Exception as e:
        return {'error': str(e)}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dfa')
@app.route('/dfa/')
@app.route('/dfa.html', methods=['GET', 'POST'])
def dfa():
    if request.method == 'POST':
        alph = request.form['alphabet']
        nodes = request.form['states']
        initial = request.form['initial']
        dead = request.form.get('dead', '')  # Optional field
        final = request.form['final'].split()
        transitions = {}

        for i in range(int(nodes)):
            node = str(i)
            transitions[node] = {}
            for alph_char in alph.split():
                key = f"transition_{node}_{alph_char}"
                if key in request.form:
                    transitions[node][alph_char] = request.form[key]

        # Generate Grail code (doesn't require graphviz)
        grail_code = generate_grail(alph, nodes, initial, final, transitions)

        # Generate DOT text representation (doesn't require graphviz)
        dot_text = generate_dot_text(alph, nodes, initial, final, transitions)

        # Generate regex from DFA
        regex_output = dfa_to_regex(nodes, initial, final, transitions)

        # Try to generate SVG and TikZ if graphviz is available
        svg = None
        tikz_graph = None

        if GRAPHVIZ_AVAILABLE:
            try:
                dot = generate_dot(alph, nodes, initial, dead, final, transitions)
                if dot:
                    # Generate SVG for preview
                    svg = dot.pipe(format='svg').decode('utf-8')

                    # Generate TikZ code
                    tikz_graph = generate_tikz(dot)
            except Exception as e:
                print(f"Error generating graphviz output: {e}")
                # Fall back to text representation

        # If TikZ generation failed, provide DOT code
        if not tikz_graph:
            tikz_graph = f"% TikZ generation requires graphviz and dot2tex\n% DOT representation:\n\n{dot_text}"

        # Return JSON with svg=None if not available (client will render from DOT)
        return jsonify({"tikz": tikz_graph, "grail": grail_code, "regex": regex_output, "svg": svg, "dot": dot_text})

    return render_template('dfa.html')

@app.route('/regex-to-dfa', methods=['POST'])
def regex_to_dfa_endpoint():
    """API endpoint to convert regex to DFA"""
    try:
        regex = request.json.get('regex', '')

        if not regex:
            return jsonify({"error": "No regex provided"}), 400

        # Build NFA from regex using Thompson's construction
        nfa_result = regex_to_nfa(regex)

        if 'error' in nfa_result:
            return jsonify({"error": nfa_result['error']}), 400

        # For now, return a simple DFA structure
        # Full NFA to DFA conversion (subset construction) would go here

        # Simple example: create a 2-state DFA for demonstration
        alphabet = sorted(list(nfa_result.get('alphabet', {'a', 'b'})))

        result = {
            "alphabet": " ".join(alphabet),
            "states": "2",
            "initial": "0",
            "final": "1",
            "transitions": {
                "0_" + alphabet[0]: "1" if len(alphabet) > 0 else "",
                "0_" + alphabet[1]: "0" if len(alphabet) > 1 else "",
                "1_" + alphabet[0]: "1" if len(alphabet) > 0 else "",
                "1_" + alphabet[1]: "1" if len(alphabet) > 1 else "",
            },
            "message": f"Simplified DFA for regex: {regex}\n(Full Thompson's construction + subset construction coming soon)"
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/eliminate-state', methods=['POST'])
def eliminate_state():
    """API endpoint for interactive state elimination"""
    try:
        # Debug: log the raw request data
        raw_data = request.get_data(as_text=True)
        print(f"DEBUG: Raw request data: {raw_data[:200]}...")

        data = request.json
        state_to_eliminate = int(data['state'])
        dfa = data['dfa']

        from collections import defaultdict

        # Build GNFA from current DFA state
        gnfa = defaultdict(lambda: defaultdict(lambda: None))

        # Convert transitions to GNFA format
        transitions = dfa['transitions']
        for state_str in transitions:
            state = int(state_str)
            for key in transitions[state_str]:
                value = transitions[state_str][key]
                if not value or not str(value).strip():
                    continue

                # Handle two formats:
                # 1. Regular DFA: key is symbol, value is target state
                # 2. GNFA from previous elimination: key is "_target", value is regex
                if key.startswith('_'):
                    # GNFA format: key is _target, value is regex
                    target = int(key[1:])  # Remove underscore prefix
                    regex = value
                    if gnfa[state][target]:
                        gnfa[state][target] = f"({gnfa[state][target]}|{regex})"
                    else:
                        gnfa[state][target] = regex
                else:
                    # Regular DFA format: key is symbol, value is target
                    target = int(value)
                    symbol = key
                    if gnfa[state][target]:
                        gnfa[state][target] = f"({gnfa[state][target]}|{symbol})"
                    else:
                        gnfa[state][target] = symbol

        # Perform state elimination for the specified state
        rip_state = state_to_eliminate
        all_states = list(range(dfa['states']))

        new_transitions_added = []

        for q_i in all_states:
            if q_i == rip_state:
                continue
            for q_j in all_states:
                if q_j == rip_state:
                    continue

                # R1: q_i -> rip_state
                # R2: rip_state -> rip_state (loop)
                # R3: rip_state -> q_j
                # R4: q_i -> q_j (direct)

                R1 = gnfa[q_i].get(rip_state)
                R2 = gnfa[rip_state].get(rip_state)
                R3 = gnfa[rip_state].get(q_j)
                R4 = gnfa[q_i].get(q_j)

                # New regex: R1(R2)*R3 | R4
                new_regex = None

                if R1 and R3:
                    middle = f"{R1}"
                    if R2:
                        middle += f"({R2})*"
                    middle += R3
                    new_regex = middle

                if R4:
                    if new_regex:
                        new_regex = f"({new_regex}|{R4})"
                    else:
                        new_regex = R4

                if new_regex:
                    gnfa[q_i][q_j] = new_regex
                    new_transitions_added.append(f"{q_i} → {q_j}: {new_regex}")

        # Remove the ripped state
        if rip_state in gnfa:
            del gnfa[rip_state]
        for state in gnfa:
            if rip_state in gnfa[state]:
                del gnfa[state][rip_state]

        # Convert back to simple transitions format
        new_transitions = {}
        for from_state in gnfa:
            new_transitions[str(from_state)] = {}
            for to_state in gnfa[from_state]:
                # Store regex expressions as transitions
                symbol_or_regex = gnfa[from_state][to_state]
                new_transitions[str(from_state)][f"_{to_state}"] = symbol_or_regex

        # Generate updated DOT graph with regex labels
        dot_graph = generate_gnfa_dot(gnfa, dfa['initial'], dfa['final'], [rip_state])

        # Generate SVG if graphviz available
        svg = None
        if GRAPHVIZ_AVAILABLE:
            try:
                svg = dot_graph.pipe(format='svg').decode('utf-8')
            except:
                svg = None

        # Generate Grail representation of GNFA
        grail_code = generate_gnfa_grail(gnfa, dfa['initial'], dfa['final'])

        # Compute current regex (from initial to finals through remaining states)
        current_regex = compute_current_regex(gnfa, dfa['initial'], dfa['final'])

        # Build step description
        description = f"Eliminated state {rip_state}. "
        if new_transitions_added:
            description += f"Added {len(new_transitions_added)} new regex transition(s)."
        else:
            description += "No new transitions needed."

        result = {
            "transitions": new_transitions,
            "regex": current_regex,
            "svg": svg,
            "grail": grail_code,
            "step": {
                "state": rip_state,
                "description": description,
                "new_transitions": new_transitions_added
            }
        }

        return jsonify(result)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def compute_current_regex(gnfa, initial, finals):
    """Compute the current regex from initial to final states by continuing elimination"""
    try:
        from collections import defaultdict
        import copy

        # Make a deep copy of GNFA to avoid modifying the original
        gnfa_copy = defaultdict(lambda: defaultdict(lambda: None))
        for from_state in gnfa:
            for to_state in gnfa[from_state]:
                if gnfa[from_state][to_state]:
                    gnfa_copy[from_state][to_state] = gnfa[from_state][to_state]

        # Check if there's already a direct path
        regexes = []
        for final in finals:
            if gnfa_copy.get(initial, {}).get(final):
                regexes.append(gnfa_copy[initial][final])

        if regexes:
            if len(regexes) == 1:
                return regexes[0]
            else:
                return "(" + "|".join(regexes) + ")"

        # If no direct path, we need to continue eliminating states
        # Get all states except initial and finals
        all_states = set()
        for from_state in gnfa_copy:
            all_states.add(from_state)
            for to_state in gnfa_copy[from_state]:
                all_states.add(to_state)

        states_to_eliminate = [s for s in all_states if s != initial and s not in finals]

        # Continue eliminating until we have a direct path
        for rip_state in states_to_eliminate:
            remaining = [s for s in all_states if s != rip_state]

            for q_i in remaining:
                for q_j in remaining:
                    R1 = gnfa_copy[q_i].get(rip_state)
                    R2 = gnfa_copy[rip_state].get(rip_state)
                    R3 = gnfa_copy[rip_state].get(q_j)
                    R4 = gnfa_copy[q_i].get(q_j)

                    new_regex = None

                    if R1 and R3:
                        middle = f"{R1}"
                        if R2:
                            middle += f"({R2})*"
                        middle += R3
                        new_regex = middle

                    if R4:
                        if new_regex:
                            new_regex = f"({new_regex}|{R4})"
                        else:
                            new_regex = R4

                    if new_regex:
                        gnfa_copy[q_i][q_j] = new_regex

            # Remove the eliminated state
            if rip_state in gnfa_copy:
                del gnfa_copy[rip_state]
            for state in gnfa_copy:
                if rip_state in gnfa_copy[state]:
                    del gnfa_copy[state][rip_state]

            all_states.discard(rip_state)

        # Now get the final regex
        regexes = []
        for final in finals:
            if gnfa_copy.get(initial, {}).get(final):
                regexes.append(gnfa_copy[initial][final])

        if not regexes:
            return "(no path found)"

        if len(regexes) == 1:
            result = regexes[0]
        else:
            result = "(" + "|".join(regexes) + ")"

        # Clean up
        result = result.replace("ε", "")
        result = result.replace("()", "")

        return result if result else "ε"

    except Exception as e:
        return f"(computing... {str(e)})"

@app.route('/study.html')
def study():
    return render_template('study.html')

# ============================================================================
# MUSEPLAY API ENDPOINTS
# ============================================================================

# API endpoint for converting .mscz files
@app.route('/api/convert-mscz', methods=['POST'])
def convert_mscz():
    """
    Convert uploaded .mscz file to MusicXML and MIDI
    Returns JSON with URLs to converted files
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.lower().endswith('.mscz'):
        return jsonify({'error': 'Only .mscz files are supported'}), 400

    try:
        # Create temporary directory for this conversion
        temp_dir = os.path.join(PROJECT_DIR, 'apps', 'museplay', 'temp')
        os.makedirs(temp_dir, exist_ok=True)

        # Generate unique ID for this conversion
        conversion_id = str(uuid.uuid4())
        conversion_dir = os.path.join(temp_dir, conversion_id)
        os.makedirs(conversion_dir, exist_ok=True)

        # Save uploaded file
        filename = secure_filename(file.filename)
        base_name = os.path.splitext(filename)[0]
        mscz_path = os.path.join(conversion_dir, filename)
        file.save(mscz_path)

        # Convert to MusicXML
        musicxml_path = os.path.join(conversion_dir, f"{base_name}.musicxml")
        result = subprocess.run(
            ['mscore', mscz_path, '-o', musicxml_path],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            return jsonify({'error': f'MusicXML conversion failed: {result.stderr}'}), 500

        # Convert to MIDI
        midi_path = os.path.join(conversion_dir, f"{base_name}.mid")
        result = subprocess.run(
            ['mscore', mscz_path, '-o', midi_path],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            return jsonify({'error': f'MIDI conversion failed: {result.stderr}'}), 500

        # Return URLs to converted files
        return jsonify({
            'success': True,
            'conversion_id': conversion_id,
            'musicxml_url': f'/api/converted/{conversion_id}/{base_name}.musicxml',
            'midi_url': f'/api/converted/{conversion_id}/{base_name}.mid',
            'title': base_name
        })

    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Conversion timed out'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve converted files
@app.route('/api/converted/<conversion_id>/<filename>')
def serve_converted(conversion_id, filename):
    """Serve converted MusicXML or MIDI files"""
    temp_dir = os.path.join(PROJECT_DIR, 'apps', 'museplay', 'temp', conversion_id)
    return send_from_directory(temp_dir, filename)

# API to list available scores
@app.route('/api/scores')
def list_scores():
    """List all available pre-converted scores"""
    scores_dir = os.path.join(PROJECT_DIR, 'apps', 'museplay', 'scores')

    # Find all .musicxml files
    scores = []
    if os.path.exists(scores_dir):
        for filename in sorted(os.listdir(scores_dir)):
            if filename.endswith('.musicxml'):
                # Remove .musicxml extension
                base_name = filename.replace('.musicxml', '')
                midi_file = f"{base_name}.mid"

                # Check if corresponding MIDI exists
                if os.path.exists(os.path.join(scores_dir, midi_file)):
                    scores.append({
                        'name': base_name,
                        'musicxml': f'/scores/{filename}',
                        'midi': f'/scores/{midi_file}'
                    })

    return jsonify({'scores': scores})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
