import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'lib'))

from flask import Flask, render_template, request, jsonify, send_from_directory
import io

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

# Serve static files from flash_cards directory
@app.route('/flash_cards/<path:filename>')
def flash_cards_static(filename):
    return send_from_directory('flash_cards', filename)

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
        dead = request.form['dead']
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

if __name__ == '__main__':
    app.run(debug=True)