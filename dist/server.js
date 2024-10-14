"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var viz_js_1 = __importDefault(require("viz.js"));
var full_render_js_1 = require("viz.js/full.render.js");
var app = (0, express_1.default)();
var port = 3000;
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.get('/generate-dot', function (req, res) {
    var _a = req.query, alph = _a.alph, nodes = _a.nodes, initial = _a.initial, dead = _a.dead, final = _a.final;
    var alphArray = alph.split(" ");
    var nodesArray = Array.from({ length: parseInt(nodes) + 1 }, function (_, i) { return i.toString(); });
    var initialNode = initial.trim();
    var finalNodesArray = final.split(" ");
    if (dead.trim()) {
        var deadNode = dead.trim();
        nodesArray[parseInt(deadNode)] = 'd';
    }
    var transitions = {};
    nodesArray.forEach(function (node) {
        transitions[node] = {};
        alphArray.forEach(function (alph) {
            transitions[node][alph] = ""; // Placeholder for transition entries
        });
    });
    // Initialize the DOT graph description
    var dot = "digraph DFA {\n";
    dot += "  rankdir=LR;\n  size=\"8,5\"\n  node [shape = doublecircle]; ".concat(finalNodesArray.join(" "), ";\n");
    dot += "  node [shape = circle];\n  ".concat(initialNode, " -> ").concat(initialNode, ";\n");
    for (var node in transitions) {
        for (var alph_1 in transitions[node]) {
            var target = transitions[node][alph_1];
            if (target) {
                dot += "  ".concat(node, " -> ").concat(target, " [ label = \"").concat(alph_1, "\" ];\n");
            }
        }
    }
    dot += "}";
    // Render the DOT graph using viz.js
    var viz = new viz_js_1.default({ Module: full_render_js_1.Module, render: full_render_js_1.render });
    viz.renderSVGElement(dot)
        .then(function (element) {
        res.send(element);
    })
        .catch(function (error) {
        console.error(error);
        res.status(500).send('Error generating DOT graph');
    });
});
app.listen(port, function () {
    console.log("Server is running at http://localhost:".concat(port));
});
