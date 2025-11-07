# How to Regenerate JSON Timemaps

When you add or update .mei files, you need to regenerate their corresponding .json timemap files.

## Quick Fix (Browser Console)

1. Open the music player in your browser: http://127.0.0.1:5001/grinch
2. Open the browser console (F12)
3. Paste this script and hit Enter:

\`\`\`javascript
async function regenerateTimemap(scorePath) {
    const meiPath = scorePath + '.mei';
    const jsonPath = scorePath + '.json';
    
    try {
        // Load MEI file
        const response = await fetch(meiPath);
        const meiData = await response.text();
        
        // Create toolkit
        const tk = new verovio.toolkit();
        tk.loadData(meiData);
        
        // Generate timemap
        let timemap = tk.renderToTimemap();
        if (typeof timemap === 'string') {
            timemap = JSON.parse(timemap);
        }
        
        console.log(\`Generated timemap for \${scorePath} with \${timemap.length} entries\`);
        console.log('JSON content:', JSON.stringify(timemap, null, 2));
        
        return timemap;
    } catch (error) {
        console.error(\`Error for \${scorePath}:\`, error);
    }
}

// Generate for the two broken scores
await regenerateTimemap('/music_player/scores/009_one_of_a_kind/009_One_Of_A_Kind');
await regenerateTimemap('/music_player/scores/020_bows/020_Bows');
\`\`\`

4. Copy the JSON output from the console
5. Save it to the respective .json files

## Automatic Fix (Coming Soon)

A proper Node.js script will be added that uses Verovio correctly.
For now, use the browser console method above.

## Manual Process

If you need to do this manually:

1. Load the .mei file in the player
2. Open browser console
3. Run: \`JSON.stringify(tk.renderToTimemap(), null, 2)\`
4. Copy the output
5. Save to \`filename.json\` in the same directory as the .mei file
