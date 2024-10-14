const { PythonShell } = require('python-shell');
const path = require('path');

export default function handler(req, res) {
    // Input to be processed by dot2tex (this could be a LaTeX or dot input)
    const dotInput = req.body.input || 'digraph G { a -> b; }';  // Example input

    // Path to the Python script that runs dot2tex
    const pythonScriptPath = path.join(process.cwd(), 'scripts', 'process_dot2tex.py');

    // Set up options for PythonShell
    let options = {
        mode: 'text',
        pythonOptions: ['-u'],  // Get print results in real-time
        scriptPath: path.dirname(pythonScriptPath),
    };

    // Run the Python script
    PythonShell.run(pythonScriptPath, options, function (err, results) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Results is an array of strings where each element is a line of the output
        res.status(200).json({ output: results.join('\n') });
    });
}