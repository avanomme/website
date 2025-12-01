#!/usr/bin/env node
/**
 * Upload audio files to Vercel Blob
 * Reads all WAV files from audio_cache/cox_voice and uploads them
 */

const { put, list } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const CACHE_DIR = path.join(__dirname, 'audio_cache', 'cox_voice', 'SE_Final_Audio');
const BLOB_PREFIX = 'Software_final_Audio';
const BLOB_BASE_URL = 'https://1hmdoc4cfrzddig0.public.blob.vercel-storage.com';

async function uploadAudioFiles() {
    console.log('='.repeat(70));
    console.log('Vercel Blob Audio Uploader');
    console.log('='.repeat(70));
    console.log();

    // Check for token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('Error: BLOB_READ_WRITE_TOKEN not set in environment');
        process.exit(1);
    }

    // Get list of local files
    if (!fs.existsSync(CACHE_DIR)) {
        console.error(`Error: Cache directory not found: ${CACHE_DIR}`);
        process.exit(1);
    }

    const localFiles = fs.readdirSync(CACHE_DIR)
        .filter(f => f.endsWith('.wav'));

    console.log(`Found ${localFiles.length} local audio files`);
    console.log();

    // Get list of already uploaded files
    console.log('Checking existing uploads...');
    let existingFiles = new Set();
    try {
        const { blobs } = await list({ prefix: BLOB_PREFIX });
        for (const blob of blobs) {
            const filename = path.basename(blob.pathname);
            existingFiles.add(filename);
        }
        console.log(`Already uploaded: ${existingFiles.size} files`);
    } catch (e) {
        console.log('No existing uploads found or error listing:', e.message);
    }

    // Filter files to upload
    const toUpload = localFiles.filter(f => !existingFiles.has(f));
    console.log(`To upload: ${toUpload.length} files`);
    console.log();

    if (toUpload.length === 0) {
        console.log('All files already uploaded!');
        return;
    }

    // Upload files
    let uploaded = 0;
    let failed = 0;
    const urlMapping = {};

    for (const file of toUpload) {
        const localPath = path.join(CACHE_DIR, file);
        const blobPath = `${BLOB_PREFIX}/${file}`;

        process.stdout.write(`[${uploaded + failed + 1}/${toUpload.length}] ${file}... `);

        try {
            const fileBuffer = fs.readFileSync(localPath);
            const { url } = await put(blobPath, fileBuffer, {
                access: 'public',
                contentType: 'audio/wav'
            });

            console.log('✓');
            urlMapping[file] = url;
            uploaded++;
        } catch (e) {
            console.log(`✗ ${e.message}`);
            failed++;
        }
    }

    console.log();
    console.log('='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`Uploaded: ${uploaded}`);
    console.log(`Failed:   ${failed}`);
    console.log(`Total:    ${uploaded + existingFiles.size}`);
    console.log();

    // Save URL mapping
    const mappingPath = path.join(__dirname, 'audio_cache', 'blob_urls.json');

    // Load existing mapping if exists
    let fullMapping = {};
    if (fs.existsSync(mappingPath)) {
        fullMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    }

    // Merge new URLs
    Object.assign(fullMapping, urlMapping);

    fs.writeFileSync(mappingPath, JSON.stringify(fullMapping, null, 2));
    console.log(`URL mapping saved to: ${mappingPath}`);
    console.log();
    console.log('✓ Upload complete!');
}

uploadAudioFiles().catch(console.error);
