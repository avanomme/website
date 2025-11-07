#!/usr/bin/env node
/**
 * Generate JSON timemap files for all MEI files in the scores directory
 * Run this whenever you add or update MEI files
 */

const fs = require('fs');
const path = require('path');

// Import Verovio - using the installed version
const verovio = require('verovio/wasm');

const SCORES_DIR = path.join(__dirname, 'scores');

async function generateTimemaps() {
    console.log('🎵 Generating JSON timemaps for MEI files...\n');

    // Initialize Verovio toolkit
    const tk = new verovio.toolkit();

    console.log(`✓ Verovio loaded: ${tk.getVersion()}\n`);

    // Find all subdirectories in scores/
    const scoreDirs = fs.readdirSync(SCORES_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => !name.startsWith('.'));

    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const dirName of scoreDirs) {
        const dirPath = path.join(SCORES_DIR, dirName);

        // Find .mei file in this directory
        const files = fs.readdirSync(dirPath);
        const meiFile = files.find(f => f.endsWith('.mei'));

        if (!meiFile) {
            console.log(`⚠️  No .mei file found in ${dirName}/`);
            skippedCount++;
            continue;
        }

        const meiPath = path.join(dirPath, meiFile);
        const jsonPath = path.join(dirPath, meiFile.replace('.mei', '.json'));

        try {
            // Check if JSON already exists and has content
            if (fs.existsSync(jsonPath)) {
                const existing = fs.readFileSync(jsonPath, 'utf8');
                const parsed = JSON.parse(existing);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    console.log(`✓ ${dirName}/${meiFile} → already has valid timemap (${parsed.length} entries)`);
                    skippedCount++;
                    continue;
                }
            }

            // Read MEI file
            const meiData = fs.readFileSync(meiPath, 'utf8');

            // Load into Verovio
            const loadSuccess = tk.loadData(meiData);
            if (!loadSuccess) {
                throw new Error('Verovio failed to load MEI data');
            }

            // Generate timemap
            const timemapData = tk.renderToTimemap();

            // Parse timemap (might be string or object)
            let timemap;
            if (typeof timemapData === 'string') {
                timemap = JSON.parse(timemapData);
            } else {
                timemap = timemapData;
            }

            // Ensure it's an array
            if (!Array.isArray(timemap)) {
                timemap = [];
            }

            // Write JSON file
            fs.writeFileSync(jsonPath, JSON.stringify(timemap, null, '\t'));

            console.log(`✓ ${dirName}/${meiFile} → ${meiFile.replace('.mei', '.json')} (${timemap.length} entries)`);
            processedCount++;

        } catch (error) {
            console.error(`✗ Error processing ${dirName}/${meiFile}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Generated: ${processedCount}`);
    console.log(`   Skipped:   ${skippedCount}`);
    console.log(`   Errors:    ${errorCount}`);
    console.log(`   Total:     ${scoreDirs.length}`);
}

// Run the generator
generateTimemaps().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
