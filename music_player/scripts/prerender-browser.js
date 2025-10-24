#!/usr/bin/env node

/**
 * Browser-based Pre-rendering Script
 * Uses Puppeteer to run Verovio in a headless browser and convert MusicXML to MEI
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');

const SCORES_DIR = path.join(__dirname, '..', 'scores');
const PORT = 9876;

// Simple static file server
let server;

function startServer() {
    return new Promise((resolve) => {
        server = http.createServer((request, response) => {
            return handler(request, response, {
                public: path.join(__dirname, '..')
            });
        });

        server.listen(PORT, () => {
            console.log(`[Server] Started on http://localhost:${PORT}`);
            resolve();
        });
    });
}

function stopServer() {
    if (server) {
        server.close();
        console.log('[Server] Stopped');
    }
}

/**
 * Find all MusicXML files
 */
function findMusicXMLFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findMusicXMLFiles(filePath, fileList);
        } else if (file.endsWith('.musicxml')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

/**
 * Convert a MusicXML file to MEI using browser-based Verovio
 */
async function convertToMEI(page, musicxmlPath) {
    console.log(`\n[Prerender] Processing: ${path.basename(musicxmlPath)}`);

    try {
        // Read the MusicXML file
        const musicxml = fs.readFileSync(musicxmlPath, 'utf-8');
        console.log(`[Prerender]   Read ${musicxml.length} bytes`);

        // Use the browser's Verovio to convert
        const result = await page.evaluate(async (xmlContent) => {
            // Wait for Verovio to be ready
            if (typeof verovio === 'undefined') {
                throw new Error('Verovio not loaded');
            }

            // Create toolkit
            const tk = new verovio.toolkit();

            // Load the MusicXML
            const loaded = tk.loadData(xmlContent);
            if (!loaded) {
                throw new Error('Failed to load MusicXML into Verovio');
            }

            // Get MEI
            const mei = tk.getMEI();

            // Get stats
            const pageCount = tk.getPageCount();
            const timemap = tk.renderToTimemap();
            let duration = 0;

            try {
                const timemapArray = typeof timemap === 'string' ? JSON.parse(timemap) : timemap;
                if (Array.isArray(timemapArray) && timemapArray.length > 0) {
                    duration = timemapArray[timemapArray.length - 1].tstamp / 1000;
                }
            } catch (e) {
                // Ignore timemap parsing errors
            }

            return {
                mei,
                pageCount,
                duration
            };
        }, musicxml);

        console.log(`[Prerender]   ✓ Converted to MEI (${result.mei.length} bytes)`);

        // Save the MEI file
        const meiPath = musicxmlPath.replace(/\.musicxml$/, '.mei');
        fs.writeFileSync(meiPath, result.mei, 'utf-8');
        console.log(`[Prerender]   ✓ Saved: ${path.basename(meiPath)}`);

        console.log(`[Prerender]   Stats: ${result.pageCount} pages, ${result.duration.toFixed(1)}s duration`);

        return {
            success: true,
            musicxmlPath,
            meiPath,
            pageCount: result.pageCount,
            duration: result.duration
        };

    } catch (error) {
        console.error(`[Prerender]   ❌ Error: ${error.message}`);
        return {
            success: false,
            musicxmlPath,
            error: error.message
        };
    }
}

/**
 * Main function
 */
async function main() {
    console.log('='.repeat(60));
    console.log('Verovio Score Pre-rendering Tool (Browser-based)');
    console.log('Converts MusicXML files to MEI format for faster loading');
    console.log('='.repeat(60));

    // Check if scores directory exists
    if (!fs.existsSync(SCORES_DIR)) {
        console.error(`[Prerender] Scores directory not found: ${SCORES_DIR}`);
        process.exit(1);
    }

    console.log(`\n[Prerender] Scanning directory: ${SCORES_DIR}`);

    // Find all MusicXML files
    const musicxmlFiles = findMusicXMLFiles(SCORES_DIR);
    console.log(`[Prerender] Found ${musicxmlFiles.length} MusicXML files\n`);

    if (musicxmlFiles.length === 0) {
        console.log('[Prerender] No files to process. Exiting.');
        process.exit(0);
    }

    // Start local server
    console.log('[Prerender] Starting local web server...');
    await startServer();

    let browser;
    try {
        // Launch headless browser
        console.log('[Prerender] Launching headless browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();

        // Load a minimal HTML page with Verovio
        const html = `
<!DOCTYPE html>
<html>
<head>
    <script src="https://www.verovio.org/javascript/latest/verovio-toolkit-wasm.js"></script>
</head>
<body>
    <div id="status">Loading Verovio...</div>
    <script>
        window.verovioReady = new Promise((resolve) => {
            if (typeof verovio !== 'undefined' && verovio.module) {
                verovio.module.onRuntimeInitialized = () => {
                    document.getElementById('status').textContent = 'Verovio Ready!';
                    resolve();
                };
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    if (typeof verovio !== 'undefined' && verovio.module) {
                        verovio.module.onRuntimeInitialized = () => {
                            document.getElementById('status').textContent = 'Verovio Ready!';
                            resolve();
                        };
                    }
                });
            }
        });
    </script>
</body>
</html>`;

        await page.setContent(html);

        // Wait for Verovio to be ready
        console.log('[Prerender] Waiting for Verovio to initialize...');
        await page.waitForFunction(() => {
            return typeof verovio !== 'undefined' &&
                   typeof verovio.toolkit !== 'undefined';
        }, { timeout: 30000 });

        console.log('[Prerender] ✓ Verovio ready!\n');

        // Process each file
        const results = [];
        for (const file of musicxmlFiles) {
            const result = await convertToMEI(page, file);
            results.push(result);
        }

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('SUMMARY');
        console.log('='.repeat(60));

        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        console.log(`\n✓ Successfully converted: ${successful.length}/${results.length} files`);

        if (failed.length > 0) {
            console.log(`\n❌ Failed to convert ${failed.length} files:`);
            failed.forEach(f => {
                console.log(`   - ${path.basename(f.musicxmlPath)}: ${f.error}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('[Prerender] Done! MEI files are ready for fast loading.');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('[Prerender] Fatal error:', error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
        stopServer();
    }
}

// Run the script
main().catch(error => {
    console.error('[Prerender] Fatal error:', error);
    stopServer();
    process.exit(1);
});
