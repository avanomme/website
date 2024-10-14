from flask import Flask, render_template, request, jsonify
from dot2tex import dot2tex
from dot2tex.pgfformat import Dot2TikZConv

app = Flask(__name__)

def generate_tikz(dot_graph):
    try:
        converter = Dot2TikZConv()
        tikz_code = converter.convert(dot_graph)
        return tikz_code
    except Exception as e:
        return f"Error: {str(e)}"

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

        dot_graph = "digraph DFA {\n"
        dot_graph += "    rankdir=LR;\n"
        dot_graph += "    node [shape = circle];\n\n"

        for i in range(states):
            if i in final:
                dot_graph += f'    {i} [label="{i}", shape=doublecircle];\n'
            else:
                dot_graph += f'    {i} [label="{i}"];\n'

        if dead is not None:
            dot_graph += f'    {dead} [label="d"];\n'

        dot_graph += f'\n    {initial} [style=filled,fillcolor=lightgray];\n\n'

        for i in range(states):
            for symbol in alphabet:
                key = f"transition_{i}_{symbol}"
                if key in request.form:
                    target = request.form[key]
                    dot_graph += f'    {i} -> {target} [label="{symbol}"];\n'

        dot_graph += "}"

        tikz_code = generate_tikz(dot_graph)
        return jsonify({"tikz": tikz_code})

    return render_template('dfa.html')

if __name__ == '__main__':
    app.run(debug=True)