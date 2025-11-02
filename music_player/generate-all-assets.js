#!/usr/bin/env node

/**
 * Generate timemaps and update scores.json from MEI files
 *
 * This script generates:
 * 1. Timemap JSON files (for highlighting synchronization)
 * 2. Updates scores.json with score names and paths
 *
 * Usage: node generate-all-assets.js
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
    console.error('Please install it with: npm install verovio');
    console.error('The verovio binary should be in node_modules/.bin/');
    process.exit(1);
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
            return 'verovio';
        }
    } catch (error) {
        // Not found globally
    }

    return 'verovio';
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
                        const basePath = path.join(subDir, file.replace('.mei', ''));
                        meiFiles.push({
                            meiPath: path.join(subDir, file),
                            basePath: basePath,
                            name: file.replace('.mei', ''),
                            dir: subDir
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
 * Generate timemap JSON for a MEI file
 */
function generateTimemap(verovioBin, meiPath, outputPath) {
    // Use --xml-id-seed to ensure consistent IDs that match browser rendering
    // This generates simple sequential IDs instead of using xml:id from MEI
    const command = `"${verovioBin}" "${meiPath}" -t timemap --xml-id-seed 0 -o "${outputPath}"`;
    execSync(command, { stdio: 'pipe' });

    if (!fs.existsSync(outputPath)) {
        throw new Error('Timemap file was not created');
    }

    // Read and verify
    const data = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    const events = Array.isArray(data) ? data : data.events;

    return {
        events: events.length,
        tempoChanges: events.filter(e => typeof e.tempo === 'number').length
    };
}


/**
 * Extract title from MEI file
 */
function extractTitle(meiPath) {
    try {
        const meiData = fs.readFileSync(meiPath, 'utf-8');

        // Try to extract title from MEI header
        const titleMatch = meiData.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1].trim()) {
            return titleMatch[1].trim();
        }

        // Fallback to filename
        return path.basename(meiPath, '.mei');
    } catch (error) {
        console.error(`Error extracting title: ${error.message}`);
        return path.basename(meiPath, '.mei');
    }
}

/**
 * Process a single MEI file and generate timemap
 */
function processFile(file) {
    console.log(`\n📄 Processing: ${file.name}`);
    console.log(`   MEI: ${file.meiPath}`);

    const results = {
        name: file.name,
        dir: file.dir,
        meiPath: file.meiPath,
        success: false,
        title: null,
        timemapInfo: null
    };

    try {
        const verovioBin = findVerovio();

        // 1. Generate Timemap JSON
        console.log(`   [1/2] Generating timemap...`);
        const timemapPath = `${file.basePath}.json`;
        const timemapInfo = generateTimemap(verovioBin, file.meiPath, timemapPath);
        results.timemapInfo = timemapInfo;
        results.timemapPath = timemapPath;
        console.log(`   ✓ Timemap: ${timemapInfo.events} events, ${timemapInfo.tempoChanges} tempo changes`);

        // 2. Extract title from MEI
        console.log(`   [2/2] Extracting title...`);
        const title = extractTitle(file.meiPath);
        results.title = title;
        console.log(`   ✓ Title: ${title}`);

        results.success = true;
        console.log(`   ✅ Complete!`);

    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        results.error = error.message;
    }

    return results;
}

/**
 * Generate id from title (kebab-case)
 */
function generateId(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Update scores.json with processed files
 */
function updateScoresJSON(results) {
    const scoresJSONPath = path.join(SCORES_DIR, 'scores.json');

    // Read existing scores.json or create new structure
    let scoresData = { scores: [] };
    if (fs.existsSync(scoresJSONPath)) {
        try {
            scoresData = JSON.parse(fs.readFileSync(scoresJSONPath, 'utf-8'));
        } catch (error) {
            console.warn('Warning: Could not parse existing scores.json, creating new one');
        }
    }

    // Track changes
    let added = 0;
    let updated = 0;

    // Process each successful result
    for (const result of results) {
        if (!result.success || !result.title) continue;

        // Generate paths relative to /music_player/scores/
        const relativeDir = path.relative(SCORES_DIR, result.dir);
        const meiFileName = path.basename(result.meiPath);
        const timemapFileName = path.basename(result.timemapPath);

        const meiPath = `/music_player/scores/${relativeDir}/${meiFileName}`;
        const jsonPath = `/music_player/scores/${relativeDir}/${timemapFileName}`;

        // Check if score already exists (by path)
        const existingIndex = scoresData.scores.findIndex(s => s.path === meiPath);

        const scoreEntry = {
            id: generateId(result.title),
            title: result.title,
            path: meiPath,
            jsonPath: jsonPath
        };

        if (existingIndex >= 0) {
            // Update existing entry
            scoresData.scores[existingIndex] = scoreEntry;
            updated++;
        } else {
            // Add new entry
            scoresData.scores.push(scoreEntry);
            added++;
        }
    }

    // Sort alphabetically by title
    scoresData.scores.sort((a, b) => a.title.localeCompare(b.title));

    // Write back to scores.json
    fs.writeFileSync(scoresJSONPath, JSON.stringify(scoresData, null, 2) + '\n', 'utf-8');

    return { added, updated, total: scoresData.scores.length };
}

/**
 * Generate summary report
 */
function generateSummaryReport(results, outputPath) {
    const summary = {
        generated: new Date().toISOString(),
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        files: results.map(r => ({
            name: r.name,
            success: r.success,
            title: r.title,
            timemapEvents: r.timemapInfo?.events,
            tempoChanges: r.timemapInfo?.tempoChanges,
            error: r.error
        }))
    };

    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
    return summary;
}

/**
 * Main function
 */
function main() {
    console.log('🎵 Stratford Choir Christmas - Timemap Generator');
    console.log('=======================================================\n');
    console.log('This will generate for each MEI file:');
    console.log('  1. Timemap JSON (for highlighting synchronization)');
    console.log('  2. Update scores.json (add/update entries, alphabetically sorted)');
    console.log('');

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

    console.log(`Found ${meiFiles.length} MEI files\n`);
    console.log('=======================================================');

    // Process each MEI file
    const results = [];
    const startTime = Date.now();

    for (const file of meiFiles) {
        const result = processFile(file);
        results.push(result);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Update scores.json with new entries
    console.log('\n=======================================================');
    console.log('📝 Updating scores.json...');
    const scoresUpdate = updateScoresJSON(results);
    console.log(`✓ Added: ${scoresUpdate.added}, Updated: ${scoresUpdate.updated}, Total: ${scoresUpdate.total}`);

    // Generate summary report
    console.log('\n=======================================================');
    console.log('📊 Generating summary report...');
    const summaryPath = path.join(SCORES_DIR, '_generation-report.json');
    const summary = generateSummaryReport(results, summaryPath);
    console.log(`✓ Report saved to: ${summaryPath}`);

    // Display summary
    console.log('\n=======================================================');
    console.log('✅ GENERATION COMPLETE');
    console.log('=======================================================');
    console.log(`   Total Files:     ${summary.total}`);
    console.log(`   Successful:      ${summary.successful}`);
    console.log(`   Failed:          ${summary.failed}`);
    console.log(`   Time Elapsed:    ${elapsed}s`);
    console.log('=======================================================');

    if (summary.failed > 0) {
        console.log('\n⚠️  Failed files:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   • ${r.name}: ${r.error}`);
        });
    }

    console.log('\n📁 Generated assets:');
    console.log('   • .json - Timemap for highlighting');
    console.log('\n📋 Updated scores.json:');
    console.log(`   • ${scoresUpdate.added} new entries added`);
    console.log(`   • ${scoresUpdate.updated} entries updated`);
    console.log(`   • ${scoresUpdate.total} total scores (alphabetically sorted)\n`);

    // Exit with error code if any failed
    process.exit(summary.failed > 0 ? 1 : 0);
}

// Run main function
try {
    main();
} catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
}
