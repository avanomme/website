#!/usr/bin/env node

/**
 * Generate time maps for all MEI files in the scores directory
 *
 * This script:
 * 1. Scans the scores directory for MEI files
 * 2. Uses Verovio CLI to generate timemap for each MEI file
 * 3. Saves it as a JSON file alongside the MEI
 *
 * Usage: node generate-timemaps.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCORES_DIR = path.join(__dirname, 'scores');

// Check if verovio CLI is available
function checkVerovio() {
    try {
        execSync('verovio --version', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

if (!checkVerovio()) {
    console.error('Error: verovio CLI not found.');
    console.error('Please install it with: npm install -g verovio');
    console.error('Or install locally: npm install verovio');
    process.exit(1);
}

/**
 * Find all MEI files in the scores directory
 */
function findMEIFiles(dir) {
    const meiFiles = [];

    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const subDir = path.join(dir, entry.name);
                const files = fs.readdirSync(subDir);

                for (const file of files) {
                    if (file.endsWith('.mei')) {
                        meiFiles.push({
                            meiPath: path.join(subDir, file),
                            jsonPath: path.join(subDir, file.replace('.mei', '.json')),
                            name: file.replace('.mei', '')
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dir}:`, error.message);
    }

    return meiFiles;
}

/**
 * Find verovio binary - check local then global
 */
function findVerovio() {
    // Check local node_modules first
    const localBin = path.join(__dirname, 'node_modules', '.bin', 'verovio');
    if (fs.existsSync(localBin)) {
        return localBin;
    }

    // Try using npx to find it
    try {
        const result = execSync('which verovio', { encoding: 'utf-8' }).trim();
        if (result) {
            return 'verovio'; // Use global
        }
    } catch (error) {
        // Not found globally
    }

    return 'verovio'; // Let npx handle it
}

/**
 * Generate timemap for a single MEI file using verovio CLI
 */
function generateTimeMap(meiPath, jsonPath, name) {
    console.log(`\n📄 Processing: ${name}`);
    console.log(`   MEI: ${meiPath}`);
    console.log(`   JSON: ${jsonPath}`);

    try {
        // Use verovio CLI to generate timemap
        // Command: verovio input.mei -t timemap --xml-id-seed 0 -o output.json
        // xml-id-seed ensures consistent IDs that match browser rendering
        const verovioBin = findVerovio();
        const command = `"${verovioBin}" "${meiPath}" -t timemap --xml-id-seed 0 -o "${jsonPath}"`;

        execSync(command, {
            stdio: 'pipe',
            encoding: 'utf-8'
        });

        // Verify the file was created
        if (!fs.existsSync(jsonPath)) {
            throw new Error('Timemap file was not created');
        }

        // Read and parse the generated timemap
        const timemapData = fs.readFileSync(jsonPath, 'utf-8');
        const timemap = JSON.parse(timemapData);

        // Check if it's an array (CLI format) or object with events
        let events = Array.isArray(timemap) ? timemap : timemap.events;

        if (!events || events.length === 0) {
            console.warn(`   ⚠️  Warning: No timemap events found`);
            return false;
        }

        console.log(`   ✓ Generated timemap with ${events.length} events`);
        console.log(`   ✓ Already has on/off events - no processing needed`);

        // The verovio CLI already generates events with on/off arrays
        // No need to process further
        console.log(`   ✓ Saved to ${path.basename(jsonPath)}`);

        return true;
    } catch (error) {
        console.error(`   ❌ Error processing ${name}:`, error.message);
        if (error.stderr) {
            console.error(`   Error details: ${error.stderr.toString()}`);
        }
        return false;
    }
}


/**
 * Main function
 */
function main() {
    console.log('🎵 Stratford Choir Christmas - Timemap Generator');
    console.log('================================================\n');

    // Check if scores directory exists
    if (!fs.existsSync(SCORES_DIR)) {
        console.error(`Error: Scores directory not found at ${SCORES_DIR}`);
        process.exit(1);
    }

    // Find all MEI files
    const meiFiles = findMEIFiles(SCORES_DIR);

    if (meiFiles.length === 0) {
        console.log('No MEI files found in scores directory');
        process.exit(0);
    }

    console.log(`Found ${meiFiles.length} MEI files:\n`);
    meiFiles.forEach(file => {
        console.log(`  • ${file.name}`);
    });

    // Process each MEI file
    let successCount = 0;
    let failCount = 0;

    for (const file of meiFiles) {
        const success = generateTimeMap(file.meiPath, file.jsonPath, file.name);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    // Summary
    console.log('\n================================================');
    console.log('✅ Summary:');
    console.log(`   Total: ${meiFiles.length} files`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log('================================================\n');
}

// Run main function
try {
    main();
} catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
}
