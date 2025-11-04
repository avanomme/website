/**
 * Score Library - Auto-discover and load scores from directory
 */

export class ScoreLibrary {
    constructor(scoresPath = '../scores') {
        this.scoresPath = scoresPath;
        this.scores = [];
        this.currentIndex = 0;
    }

    async loadScoreList() {
        try {
            // Try to fetch the scores directory listing
            // This requires a server endpoint or pre-generated manifest
            const response = await fetch(`${this.scoresPath}/manifest.json`);

            if (response.ok) {
                const data = await response.json();
                this.scores = data.scores || [];
            } else {
                // Fallback to hardcoded list
                this.scores = await this.getHardcodedScores();
            }

            console.log(`Loaded ${this.scores.length} scores`);
            return this.scores;

        } catch (error) {
            console.warn('Could not load manifest, using hardcoded list:', error);
            this.scores = await this.getHardcodedScores();
            return this.scores;
        }
    }

    async getHardcodedScores() {
        // The 9 main score directories
        const directories = [
            'candlelight-carol',
            'holiday-favourites',
            'little-drummer',
            'mary-did',
            'marys-holy',
            'most-wonderful',
            'our-gift-for-you',
            'we-three',
            'winter-song'
        ];

        const scores = [];

        for (const dir of directories) {
            // Common MIDI file names
            const possibleFiles = [
                `${dir}.mid`,
                `${dir}.midi`,
                'full.mid',
                'full.midi',
                'score.mid',
                'score.midi'
            ];

            for (const file of possibleFiles) {
                const path = `${this.scoresPath}/${dir}/${file}`;

                // Try to check if file exists
                try {
                    const response = await fetch(path, { method: 'HEAD' });
                    if (response.ok) {
                        scores.push({
                            title: this.formatTitle(dir),
                            path: path,
                            directory: dir,
                            filename: file
                        });
                        break; // Found a file for this directory
                    }
                } catch (e) {
                    // File doesn't exist, try next
                    continue;
                }
            }
        }

        return scores;
    }

    formatTitle(dirName) {
        // Convert directory name to readable title
        return dirName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    getCurrentScore() {
        return this.scores[this.currentIndex];
    }

    getNextScore() {
        this.currentIndex = (this.currentIndex + 1) % this.scores.length;
        return this.getCurrentScore();
    }

    getPreviousScore() {
        this.currentIndex = (this.currentIndex - 1 + this.scores.length) % this.scores.length;
        return this.getCurrentScore();
    }

    selectScore(index) {
        if (index >= 0 && index < this.scores.length) {
            this.currentIndex = index;
            return this.getCurrentScore();
        }
        return null;
    }

    getAllScores() {
        return [...this.scores];
    }
}

// Auto-scan for score files, preferring pre-rendered MEI format
export async function scanForMIDIFiles(basePath = './scores') {
    console.log('[ScoreLibrary] Scanning for scores in:', basePath);

    // The 9 main score directories - hardcoded list since we know these exist
    const knownScores = [
        'candlelight-carol',
        'holiday-favourites',
        'little-drummer',
        'mary-did',
        'marys-holy',
        'most-wonderful',
        'our-gift-for-you',
        'we-three',
        'winter-song'
    ];

    const foundScores = [];

    // Check all scores in parallel for better performance
    const scoreChecks = knownScores.map(async (dir) => {
        const baseName = dir;
        const title = dir.split('-').map(w =>
            w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');

        // Try MEI first (Verovio's native format, loads 5-10x faster)
        const meiPath = `${basePath}/${dir}/${baseName}.mei`;
        const musicxmlPath = `${basePath}/${dir}/${baseName}.musicxml`;

        let foundPath = musicxmlPath; // Default to MusicXML
        let foundType = 'musicxml';

        // Silently check for MEI (don't block on errors)
        try {
            const meiResponse = await fetch(meiPath, { method: 'HEAD', cache: 'no-cache' });
            if (meiResponse.ok && meiResponse.status === 200) {
                foundPath = meiPath;
                foundType = 'mei';
                console.log(`[ScoreLibrary] ✓ Using pre-rendered MEI: ${baseName}.mei`);
            }
        } catch (e) {
            // Silently fall back to MusicXML - this is normal if MEI doesn't exist yet
        }

        // If we're using MusicXML and haven't logged MEI, log this
        if (foundType === 'musicxml') {
            console.log(`[ScoreLibrary] Using MusicXML: ${baseName}.musicxml`);
        }

        return {
            title,
            path: foundPath,
            directory: dir,
            filename: foundPath.split('/').pop(),
            type: foundType
        };
    });

    // Wait for all checks to complete
    const results = await Promise.all(scoreChecks);
    foundScores.push(...results);

    const meiCount = foundScores.filter(s => s.type === 'mei').length;
    const musicxmlCount = foundScores.filter(s => s.type === 'musicxml').length;

    console.log(`[ScoreLibrary] Found ${foundScores.length} scores: ${meiCount} MEI (fast), ${musicxmlCount} MusicXML (slower)`);
    if (musicxmlCount > 0) {
        console.log('[ScoreLibrary] 💡 Tip: Run "npm run prerender" to convert MusicXML files to MEI for faster loading!');
    }

    return foundScores;
}
