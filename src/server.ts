import express from 'express';
import path from 'path';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/generate-dot', (req, res) => {
    const { alph, nodes, initial, dead, final } = req.query;

    const alphArray = (alph as string).split(" ");
    const nodesArray = Array.from({ length: parseInt(nodes as string) + 1 }, (_, i) => i.toString());
    const initialNode = (initial as string).trim();
    const finalNodesArray = (final as string).split(" ");

    if ((dead as string).trim()) {
        const deadNode = (dead as string).trim();
        nodesArray[parseInt(deadNode)] = 'd';
    }

    const transitions: { [key: string]: { [key: string]: string } } = {};
    nodesArray.forEach(node => {
        transitions[node] = {};
        alphArray.forEach(alph => {
            transitions[node][alph] = ""; // Placeholder for transition entries
        });
    });

    // Initialize the DOT graph description
    let dot = "digraph DFA {\n";
    dot += `  rankdir=LR;\n  size="8,5"\n  node [shape = doublecircle]; ${finalNodesArray.join(" ")};\n`;
    dot += `  node [shape = circle];\n  ${initialNode} -> ${initialNode};\n`;

    for (const node in transitions) {
        for (const alph in transitions[node]) {
            const target = transitions[node][alph];
            if (target) {
                dot += `  ${node} -> ${target} [ label = "${alph}" ];\n`;
            }
        }
    }
    dot += "}";

    // Render the DOT graph using viz.js
    const viz = new Viz({ Module, render });
    viz.renderSVGElement(dot)
        .then((element: SVGSVGElement) => {
            res.send(element);
        })
        .catch((error: any) => {
            console.error(error);
            res.status(500).send('Error generating DOT graph');
        });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});