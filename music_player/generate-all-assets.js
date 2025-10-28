#!/usr/bin/env node

/**
 * Generate all assets needed for the player from MEI files
 *
 * This script generates:
 * 1. Timemap JSON files (for highlighting synchronization)
 * 2. MIDI files (for audio playback with Tone.js)
 * 3. First page SVG preview (for thumbnails/verification)
 * 4. Metadata JSON (page count, duration, composer, etc.)
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
 * Generate MIDI file for a MEI file
 */
function generateMIDI(verovioBin, meiPath, outputPath) {
    const command = `"${verovioBin}" "${meiPath}" -t midi -o "${outputPath}"`;
    execSync(command, { stdio: 'pipe' });

    if (!fs.existsSync(outputPath)) {
        throw new Error('MIDI file was not created');
    }

    const stats = fs.statSync(outputPath);
    return {
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2)
    };
}

/**
 * Generate SVG preview (first page) for a MEI file
 */
function generateSVGPreview(verovioBin, meiPath, outputPath) {
    // Generate first page only with specific options
    const command = `"${verovioBin}" "${meiPath}" --page 1 --scale 40 --adjust-page-height --breaks auto -o "${outputPath}"`;
    execSync(command, { stdio: 'pipe' });

    if (!fs.existsSync(outputPath)) {
        throw new Error('SVG file was not created');
    }

    const stats = fs.statSync(outputPath);
    return {
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2)
    };
}

/**
 * Extract metadata from MEI file
 */
function extractMetadata(verovioBin, meiPath) {
    try {
        // Use verovio to get page count
        // We can parse the MEI or use verovio's info
        const meiData = fs.readFileSync(meiPath, 'utf-8');

        // Extract basic metadata from MEI XML
        const titleMatch = meiData.match(/<title[^>]*>([^<]+)<\/title>/i);
        const composerMatch = meiData.match(/<composer[^>]*>([^<]+)<\/composer>/i);

        return {
            title: titleMatch ? titleMatch[1].trim() : path.basename(meiPath, '.mei'),
            composer: composerMatch ? composerMatch[1].trim() : 'Unknown',
            generated: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error extracting metadata: ${error.message}`);
        return {
            title: path.basename(meiPath, '.mei'),
            composer: 'Unknown',
            generated: new Date().toISOString()
        };
    }
}

/**
 * Process a single MEI file and generate all assets
 */
function processFile(file) {
    console.log(`\n📄 Processing: ${file.name}`);
    console.log(`   MEI: ${file.meiPath}`);

    const results = {
        name: file.name,
        dir: file.dir,
        success: false,
        assets: {}
    };

    try {
        const verovioBin = findVerovio();

        // 1. Generate Timemap JSON
        console.log(`   [1/4] Generating timemap...`);
        const timemapPath = `${file.basePath}.json`;
        const timemapInfo = generateTimemap(verovioBin, file.meiPath, timemapPath);
        results.assets.timemap = {
            path: timemapPath,
            ...timemapInfo
        };
        console.log(`   ✓ Timemap: ${timemapInfo.events} events, ${timemapInfo.tempoChanges} tempo changes`);

        // 2. Generate MIDI file
        console.log(`   [2/4] Generating MIDI...`);
        const midiPath = `${file.basePath}.mid`;
        const midiInfo = generateMIDI(verovioBin, file.meiPath, midiPath);
        results.assets.midi = {
            path: midiPath,
            ...midiInfo
        };
        console.log(`   ✓ MIDI: ${midiInfo.sizeKB} KB`);

        // 3. Generate SVG preview (first page)
        console.log(`   [3/4] Generating SVG preview...`);
        const svgPath = `${file.basePath}-preview.svg`;
        const svgInfo = generateSVGPreview(verovioBin, file.meiPath, svgPath);
        results.assets.svg = {
            path: svgPath,
            ...svgInfo
        };
        console.log(`   ✓ SVG Preview: ${svgInfo.sizeKB} KB`);

        // 4. Extract and save metadata
        console.log(`   [4/4] Extracting metadata...`);
        const metadata = extractMetadata(verovioBin, file.meiPath);
        metadata.assets = {
            mei: path.basename(file.meiPath),
            timemap: path.basename(timemapPath),
            midi: path.basename(midiPath),
            svgPreview: path.basename(svgPath)
        };
        metadata.stats = {
            timemapEvents: timemapInfo.events,
            tempoChanges: timemapInfo.tempoChanges,
            midiSizeKB: midiInfo.sizeKB
        };

        const metadataPath = `${file.basePath}-metadata.json`;
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
        results.assets.metadata = {
            path: metadataPath,
            ...metadata
        };
        console.log(`   ✓ Metadata: ${metadata.title} by ${metadata.composer}`);

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
        if (!result.success || !result.assets.metadata) continue;

        const metadata = result.assets.metadata;

        // Generate paths relative to /music_player/scores/
        const relativeDir = path.relative(SCORES_DIR, result.dir);
        const meiPath = `/music_player/scores/${relativeDir}/${metadata.assets.mei}`;
        const jsonPath = `/music_player/scores/${relativeDir}/${metadata.assets.timemap}`;

        // Check if score already exists (by path)
        const existingIndex = scoresData.scores.findIndex(s => s.path === meiPath);

        const scoreEntry = {
            id: generateId(metadata.title),
            title: metadata.title,
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
            title: r.assets.metadata?.title,
            composer: r.assets.metadata?.composer,
            timemapEvents: r.assets.timemap?.events,
            tempoChanges: r.assets.timemap?.tempoChanges,
            midiSizeKB: r.assets.midi?.sizeKB,
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
    console.log('🎵 Stratford Choir Christmas - Complete Asset Generator');
    console.log('=======================================================\n');
    console.log('This will generate for each MEI file:');
    console.log('  1. Timemap JSON (for highlighting)');
    console.log('  2. MIDI file (for playback)');
    console.log('  3. SVG preview (first page)');
    console.log('  4. Metadata JSON (title, composer, stats)');
    console.log('  5. Update scores.json (add/update entries, alphabetically sorted)');
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
    console.log('   • .json          - Timemap for highlighting');
    console.log('   • .mid           - MIDI for audio playback');
    console.log('   • -preview.svg   - First page preview');
    console.log('   • -metadata.json - File information');
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
