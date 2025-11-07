from flask import Flask, render_template, request, jsonify
import subprocess

app = Flask(__name__)

def generate_dot(alphabet, states, initial, dead, final, transitions):
    dot = "digraph DFA {\n"
    dot += "    rankdir=LR;\n"
    dot += "    node [shape = circle];\n\n"

    for i in range(states):
        if i in final:
            dot += f'    {i} [label="{i}", shape=doublecircle];\n'
        else:
            dot += f'    {i} [label="{i}"];\n'

    if dead is not None:
        dot += f'    {dead} [label="d"];\n'

    dot += f'\n    {initial} [style=filled,fillcolor=lightgray];\n\n'

    for i in range(states):
        for symbol in alphabet:
            target = transitions.get(f"{i}_{symbol}")
            if target is not None:
                dot += f'    {i} -> {target} [label="{symbol}"];\n'

    dot += "}"
    return dot

def generate_tikz(dot_graph):
    try:
        result = subprocess.run(["dot2tex", "--autosize"], input=dot_graph, capture_output=True, text=True, check=True)
        tikz_graph = result.stdout
    except subprocess.CalledProcessError:
        tikz_graph = "Error: dot2tex command failed."
    except FileNotFoundError:
        tikz_graph = "Error: dot2tex is not installed or not found in PATH."
    
    return tikz_graph

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dfa.html', methods=['GET', 'POST'])
def dfa():
    if request.method == 'POST':
        alphabet = request.form['alphabet'].split()
        states = int(request.form['states'])
        initial = int(request.form['initial'])
        dead = int(request.form['dead']) if request.form['dead'] else None
        final = list(map(int, request.form['final'].split()))

        transitions = {}
        for i in range(states):
            for symbol in alphabet:
                key = f"transition_{i}_{symbol}"
                if key in request.form:
                    transitions[f"{i}_{symbol}"] = request.form[key]

        dot_graph = generate_dot(alphabet, states, initial, dead, final, transitions)
        tikz_graph = generate_tikz(dot_graph)
        return jsonify({"tikz": tikz_graph})

    return render_template('dfa.html')

if __name__ == '__main__':
    app.run(debug=True)