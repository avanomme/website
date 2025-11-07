#ifdef __EMSCRIPTEN__

#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "../api/musescoreplayer.h"

using namespace emscripten;
using namespace muse::player;

// Wrapper functions for callbacks
void setOnStateChangedWrapper(MuseScorePlayer* player, val jsCallback) {
    player->setOnStateChanged([jsCallback](PlaybackState state) mutable {
        jsCallback(static_cast<int>(state));
    });
}

void setOnTimeUpdateWrapper(MuseScorePlayer* player, val jsCallback) {
    player->setOnTimeUpdate([jsCallback](float time) mutable {
        jsCallback(time);
    });
}

void setOnErrorWrapper(MuseScorePlayer* player, val jsCallback) {
    player->setOnError([jsCallback](const char* error) mutable {
        jsCallback(std::string(error));
    });
}

void setOnLoadedWrapper(MuseScorePlayer* player, val jsCallback) {
    player->setOnLoaded([jsCallback]() mutable {
        jsCallback();
    });
}

// Helper to load from JavaScript ArrayBuffer
bool loadFromArrayBuffer(MuseScorePlayer* player, val buffer, std::string filename) {
    const auto length = buffer["byteLength"].as<unsigned>();
    std::vector<uint8_t> data(length);

    val memoryView = val::global("Uint8Array").new_(buffer);
    for (unsigned i = 0; i < length; ++i) {
        data[i] = memoryView[i].as<uint8_t>();
    }

    return player->loadFromBuffer(data.data(), data.size(), filename.c_str());
}

EMSCRIPTEN_BINDINGS(musescore_player) {
    // Enums
    enum_<PlaybackState>("PlaybackState")
        .value("Stopped", PlaybackState::Stopped)
        .value("Playing", PlaybackState::Playing)
        .value("Paused", PlaybackState::Paused)
        .value("Loading", PlaybackState::Loading)
        .value("Error", PlaybackState::Error);

    // Metadata structures
    value_object<ScoreMetadata>("ScoreMetadata")
        .field("title", &ScoreMetadata::title)
        .field("composer", &ScoreMetadata::composer)
        .field("copyright", &ScoreMetadata::copyright)
        .field("measureCount", &ScoreMetadata::measureCount)
        .field("numParts", &ScoreMetadata::numParts)
        .field("durationSeconds", &ScoreMetadata::durationSeconds);

    value_object<TrackInfo>("TrackInfo")
        .field("index", &TrackInfo::index)
        .field("name", &TrackInfo::name)
        .field("instrument", &TrackInfo::instrument)
        .field("muted", &TrackInfo::muted)
        .field("volume", &TrackInfo::volume);

    // Main player class
    class_<MuseScorePlayer>("MuseScorePlayer")
        .class_function("create", &MuseScorePlayer::create, allow_raw_pointers())
        .function("loadFromURL", &MuseScorePlayer::loadFromURL, allow_raw_pointers())
        .function("loadFromArrayBuffer", &loadFromArrayBuffer, allow_raw_pointers())
        .function("unload", &MuseScorePlayer::unload, allow_raw_pointers())
        .function("play", &MuseScorePlayer::play, allow_raw_pointers())
        .function("pause", &MuseScorePlayer::pause, allow_raw_pointers())
        .function("stop", &MuseScorePlayer::stop, allow_raw_pointers())
        .function("seek", &MuseScorePlayer::seek, allow_raw_pointers())
        .function("setTempo", &MuseScorePlayer::setTempo, allow_raw_pointers())
        .function("setVolume", &MuseScorePlayer::setVolume, allow_raw_pointers())
        .function("setLoop", &MuseScorePlayer::setLoop, allow_raw_pointers())
        .function("setMute", &MuseScorePlayer::setMute, allow_raw_pointers())
        .function("setTrackVolume", &MuseScorePlayer::setTrackVolume, allow_raw_pointers())
        .function("getState", &MuseScorePlayer::getState, allow_raw_pointers())
        .function("getCurrentTime", &MuseScorePlayer::getCurrentTime, allow_raw_pointers())
        .function("getDuration", &MuseScorePlayer::getDuration, allow_raw_pointers())
        .function("isLoaded", &MuseScorePlayer::isLoaded, allow_raw_pointers())
        .function("getMetadata", &MuseScorePlayer::getMetadata, allow_raw_pointers())
        .function("getNumTracks", &MuseScorePlayer::getNumTracks, allow_raw_pointers())
        .function("getTrackInfo", &MuseScorePlayer::getTrackInfo, allow_raw_pointers());

    // Callback wrappers
    function("setOnStateChanged", &setOnStateChangedWrapper, allow_raw_pointers());
    function("setOnTimeUpdate", &setOnTimeUpdateWrapper, allow_raw_pointers());
    function("setOnError", &setOnErrorWrapper, allow_raw_pointers());
    function("setOnLoaded", &setOnLoadedWrapper, allow_raw_pointers());
}

#endif // __EMSCRIPTEN__
