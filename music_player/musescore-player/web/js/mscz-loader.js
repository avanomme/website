/**
 * MuseScore File Loader
 * Handles loading and extracting .mscz files
 */

import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

export class MSCZLoader {
    constructor() {
        this.zip = new JSZip();
    }

    /**
     * Load and extract a .mscz file
     * @param {string|File} source - URL or File object
     * @returns {Object} - { musicxml, midi, metadata }
     */
    async load(source) {
        let data;

        if (typeof source === 'string') {
            // Load from URL
            const response = await fetch(source);
            data = await response.arrayBuffer();
        } else {
            // Load from File object
            data = await source.arrayBuffer();
        }

        // Unzip the .mscz file
        const zip = await JSZip.loadAsync(data);

        // Extract main score (.mscx file)
        let musicxml = null;
        const mscxFiles = Object.keys(zip.files).filter(name =>
            name.endsWith('.mscx') && !name.includes('Excerpts/')
        );

        if (mscxFiles.length > 0) {
            musicxml = await zip.files[mscxFiles[0]].async('string');
        }

        // Extract metadata
        const metadata = await this.extractMetadata(zip);

        // Extract thumbnail if available
        let thumbnail = null;
        if (zip.files['Thumbnails/thumbnail.png']) {
            thumbnail = await zip.files['Thumbnails/thumbnail.png'].async('base64');
        }

        return {
            musicxml,
            metadata,
            thumbnail
        };
    }

    async extractMetadata(zip) {
        // Try to extract metadata from the MusicXML
        const metadata = {
            title: 'Untitled',
            composer: 'Unknown',
            arranger: null,
            copyright: null
        };

        // Parse audio settings if available
        if (zip.files['audiosettings.json']) {
            try {
                const audioSettings = await zip.files['audiosettings.json'].async('string');
                const audio = JSON.parse(audioSettings);
                // Audio settings might contain tempo, etc.
            } catch (e) {
                console.warn('Could not parse audio settings:', e);
            }
        }

        return metadata;
    }

    /**
     * Convert MusicXML to MIDI using tone mapping
     * This is a simplified version - for production use a proper MusicXML parser
     */
    musicXMLToMIDI(musicxml) {
        // For now, we'll rely on the MIDI files that already exist
        // A full implementation would parse the MusicXML and generate MIDI events
        console.warn('MusicXML to MIDI conversion not yet implemented');
        return null;
    }
}
