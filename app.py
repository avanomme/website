import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'lib'))

from flask import Flask, render_template, request, jsonify, send_from_directory
import io
import subprocess
import tempfile
import uuid
from pathlib import Path
from werkzeug.utils import secure_filename

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

app = Flask(__name__)

# Get the absolute path to the project directory
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

# Favicon route
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(PROJECT_DIR, 'static'), 'favicon.ico', mimetype='image/x-icon')

# Serve static files from flash_cards directory
@app.route('/flash_cards/<path:filename>')
def flash_cards_static(filename):
    return send_from_directory(os.path.join(PROJECT_DIR, 'flash_cards'), filename)

# Serve static files from music_player directory
@app.route('/music_player/<path:filename>')
def music_player_static(filename):
    return send_from_directory(os.path.join(PROJECT_DIR, 'music_player'), filename)

# Serve static files from MusePlay directory
@app.route('/mplay/<path:filename>')
def museplay_static(filename):
    return send_from_directory(os.path.join(PROJECT_DIR, 'MusePlay', 'public'), filename)

# Serve MusePlay scores
@app.route('/scores/<path:filename>')
def museplay_scores(filename):
    return send_from_directory(os.path.join(PROJECT_DIR, 'MusePlay', 'scores'), filename)

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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dfa.html', methods=['GET', 'POST'])
def dfa():
    if request.method == 'POST':
        if not GRAPHVIZ_AVAILABLE:
            return jsonify({"error": "GraphViz not available on this server"}), 503

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

        dot = generate_dot(alph, nodes, initial, dead, final, transitions)
        if dot is None:
            return jsonify({"error": "Failed to generate graph"}), 500

        tikz_graph = generate_tikz(dot)

        # Generate SVG for preview
        svg = dot.pipe(format='svg').decode('utf-8')

        return jsonify({"tikz": tikz_graph, "svg": svg})

    return render_template('dfa.html')

@app.route('/study.html')
def study():
    return render_template('study.html')

@app.route('/grinch')
@app.route('/grinch.html')
def grinch():
    return send_from_directory(os.path.join(PROJECT_DIR, 'music_player'), 'rehearse.html')

@app.route('/mplay')
@app.route('/mplay/')
def museplay():
    # Serve the new hybrid MusePlay interface
    return send_from_directory(os.path.join(PROJECT_DIR, 'MusePlay', 'public'), 'index.html')

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
        temp_dir = os.path.join(PROJECT_DIR, 'MusePlay', 'temp')
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
    temp_dir = os.path.join(PROJECT_DIR, 'MusePlay', 'temp', conversion_id)
    return send_from_directory(temp_dir, filename)

# API to list available scores
@app.route('/api/scores')
def list_scores():
    """List all available pre-converted scores"""
    scores_dir = os.path.join(PROJECT_DIR, 'MusePlay', 'scores')

    # Find all .musicxml files
    scores = []
    for filename in sorted(os.listdir(scores_dir)):
        if filename.endswith('.musicxml'):
            # Remove .musicxml extension (10 chars including the dot)
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