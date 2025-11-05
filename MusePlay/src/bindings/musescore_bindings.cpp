/**
 * MusePlay - Emscripten bindings for MuseScore C++ to JavaScript
 *
 * This file creates the JavaScript API that wraps MuseScore's C++ functionality.
 */

#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>
#include <vector>

// MuseScore includes
#include "engraving/dom/masterscore.h"
#include "engraving/rw/mscloader.h"
#include "engraving/compat/midi/compatmidirender.h"

using namespace emscripten;
using namespace mu::engraving;

/**
 * Wrapper class for MasterScore that provides JavaScript-friendly methods
 */
class MuseScoreWrapper {
private:
    MasterScore* score;

public:
    MuseScoreWrapper() : score(nullptr) {}

    ~MuseScoreWrapper() {
        if (score) {
            delete score;
        }
    }

    /**
     * Load a score from file data
     * @param data - File contents as Uint8Array
     * @param filename - Original filename (for format detection)
     * @return true if loaded successfully
     */
    bool loadFromData(const std::string& data, const std::string& filename) {
        if (score) {
            delete score;
        }

        score = new MasterScore();

        // Create temporary file in Emscripten virtual filesystem
        // TODO: Implement actual loading using MscLoader

        return score != nullptr;
    }

    /**
     * Get score metadata
     */
    val getMetadata() {
        if (!score) {
            return val::null();
        }

        val metadata = val::object();
        metadata.set("title", score->title());
        metadata.set("composer", score->composer());
        metadata.set("copyright", score->copyright());

        return metadata;
    }

    /**
     * Get number of measures
     */
    int getMeasureCount() {
        if (!score) return 0;
        return score->nmeasures();
    }

    /**
     * Get number of parts/instruments
     */
    int getPartCount() {
        if (!score) return 0;
        return score->parts().size();
    }

    /**
     * Export score as MIDI data
     * @return MIDI file contents as Uint8Array
     */
    val exportMIDI() {
        if (!score) {
            return val::null();
        }

        // Generate MIDI using MuseScore's MIDI renderer
        // TODO: Implement using CompatMidiRender

        std::vector<uint8_t> midiData;
        // ... MIDI generation code ...

        // Convert to JavaScript Uint8Array
        return val(typed_memory_view(midiData.size(), midiData.data()));
    }

    /**
     * Render score page to SVG
     * @param pageNumber - Page to render (1-indexed)
     * @return SVG string
     */
    std::string renderPageSVG(int pageNumber) {
        if (!score) {
            return "";
        }

        // TODO: Implement SVG rendering
        return "<svg></svg>";
    }

    /**
     * Get timing map for synchronization
     * Maps musical time to note IDs
     */
    val getTimeMap() {
        if (!score) {
            return val::null();
        }

        val timemap = val::array();

        // TODO: Generate timemap similar to Verovio's output
        // Iterate through all notes and create timing entries

        return timemap;
    }
};

/**
 * Standalone functions
 */

/**
 * Get MuseScore version info
 */
std::string getVersion() {
    return "MusePlay 1.0 (MuseScore 4.x core)";
}

/**
 * Check if a file format is supported
 */
bool isSupportedFormat(const std::string& filename) {
    std::string ext = filename.substr(filename.find_last_of(".") + 1);
    return ext == "mscz" || ext == "mscx" ||
           ext == "musicxml" || ext == "xml" ||
           ext == "mxl";
}

/**
 * Emscripten bindings - exposes C++ API to JavaScript
 */
EMSCRIPTEN_BINDINGS(musescore_module) {
    // Main score wrapper class
    class_<MuseScoreWrapper>("MuseScore")
        .constructor<>()
        .function("loadFromData", &MuseScoreWrapper::loadFromData)
        .function("getMetadata", &MuseScoreWrapper::getMetadata)
        .function("getMeasureCount", &MuseScoreWrapper::getMeasureCount)
        .function("getPartCount", &MuseScoreWrapper::getPartCount)
        .function("exportMIDI", &MuseScoreWrapper::exportMIDI)
        .function("renderPageSVG", &MuseScoreWrapper::renderPageSVG)
        .function("getTimeMap", &MuseScoreWrapper::getTimeMap);

    // Standalone functions
    function("getVersion", &getVersion);
    function("isSupportedFormat", &isSupportedFormat);
}
