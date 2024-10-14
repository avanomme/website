import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

document.addEventListener("DOMContentLoaded", () => {
    const alphInput = document.getElementById("alph") as HTMLInputElement;
    const nodesInput = document.getElementById("nodes") as HTMLInputElement;
    const initialInput = document.getElementById("initial") as HTMLInputElement;
    const deadInput = document.getElementById("dead") as HTMLInputElement;
    const finalInput = document.getElementById("final") as HTMLInputElement;
    const graphDiv = document.getElementById("graph") as HTMLDivElement;

    (window as any).generateDot = () => {
        const alph = alphInput.value;
        const nodes = parseInt(nodesInput.value);
        const initial = initialInput.value;
        const dead = deadInput.value;
        const final = finalInput.value;

        const alphArray = alph.split(" ");
        const nodesArray = Array.from({ length: nodes + 1 }, (_, i) => i.toString());
        const initialNode = initial.trim();
        const finalNodesArray = final.split(" ");

        if (dead.trim()) {
            const deadNode = dead.trim();
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
                graphDiv.innerHTML = "";
                graphDiv.appendChild(element);
            })
            .catch((error: any) => {
                console.error(error);
            });
    };
});