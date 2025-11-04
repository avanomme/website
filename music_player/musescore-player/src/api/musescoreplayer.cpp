#include "musescoreplayer.h"
#include <map>
#include <vector>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#include <emscripten/val.h>
using namespace emscripten;
#endif

namespace muse {
namespace player {

class MuseScorePlayerImpl : public MuseScorePlayer {
public:
    MuseScorePlayerImpl() :
        state_(PlaybackState::Stopped),
        currentTime_(0.0f),
        duration_(0.0f),
        tempo_(1.0f),
        volume_(0.8f),
        loop_(false),
        loaded_(false) {
    }

    ~MuseScorePlayerImpl() override {
        unload();
    }

    bool loadFromURL(const char* url) override {
        state_ = PlaybackState::Loading;
        notifyStateChanged();

#ifdef __EMSCRIPTEN__
        // Use Emscripten's fetch API
        EM_ASM({
            const url = UTF8ToString($0);
            const playerPtr = $1;

            fetch(url)
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    const data = new Uint8Array(buffer);
                    const ptr = Module._malloc(data.length);
                    Module.HEAPU8.set(data, ptr);

                    // Extract filename from URL
                    const filename = url.split('/').pop();
                    const filenamePtr = allocateUTF8(filename);

                    // Call C++ function
                    const success = Module.ccall('loadFromBufferInternal',
                        'boolean', ['number', 'number', 'number', 'number'],
                        [playerPtr, ptr, data.length, filenamePtr]);

                    Module._free(ptr);
                    _free(filenamePtr);

                    if (!success) {
                        console.error('Failed to load score');
                    }
                })
                .catch(error => {
                    console.error('Error loading score:', error);
                });
        }, url, this);
#endif
        return true;
    }

    bool loadFromBuffer(const uint8_t* data, size_t size, const char* filename) override {
        // For web version, we'll use OSMD (OpenSheetMusicDisplay) and Web MIDI
        // This is a simplified implementation

        loaded_ = true;
        state_ = PlaybackState::Stopped;

        // Parse basic metadata from filename
        metadata_.title = filename;
        metadata_.measureCount = 0;
        metadata_.numParts = 0;

        notifyStateChanged();
        if (loadedCallback_) {
            loadedCallback_();
        }

        return true;
    }

    void unload() override {
        stop();
        loaded_ = false;
        currentTime_ = 0.0f;
        duration_ = 0.0f;
        metadata_ = ScoreMetadata();
        tracks_.clear();
    }

    void play() override {
        if (!loaded_) return;

        if (state_ == PlaybackState::Stopped) {
            currentTime_ = 0.0f;
        }

        state_ = PlaybackState::Playing;
        notifyStateChanged();

#ifdef __EMSCRIPTEN__
        startPlaybackTimer();
#endif
    }

    void pause() override {
        if (state_ == PlaybackState::Playing) {
            state_ = PlaybackState::Paused;
            notifyStateChanged();
#ifdef __EMSCRIPTEN__
            stopPlaybackTimer();
#endif
        }
    }

    void stop() override {
        state_ = PlaybackState::Stopped;
        currentTime_ = 0.0f;
        notifyStateChanged();
#ifdef __EMSCRIPTEN__
        stopPlaybackTimer();
#endif
    }

    void seek(float timeSeconds) override {
        if (timeSeconds < 0) timeSeconds = 0;
        if (timeSeconds > duration_) timeSeconds = duration_;
        currentTime_ = timeSeconds;

        if (timeCallback_) {
            timeCallback_(currentTime_);
        }
    }

    void setTempo(float factor) override {
        if (factor < 0.25f) factor = 0.25f;
        if (factor > 4.0f) factor = 4.0f;
        tempo_ = factor;
    }

    void setVolume(float volume) override {
        if (volume < 0.0f) volume = 0.0f;
        if (volume > 1.0f) volume = 1.0f;
        volume_ = volume;
    }

    void setLoop(bool enabled) override {
        loop_ = enabled;
    }

    void setMute(int trackIndex, bool muted) override {
        if (trackIndex >= 0 && trackIndex < static_cast<int>(tracks_.size())) {
            tracks_[trackIndex].muted = muted;
        }
    }

    void setTrackVolume(int trackIndex, float volume) override {
        if (trackIndex >= 0 && trackIndex < static_cast<int>(tracks_.size())) {
            if (volume < 0.0f) volume = 0.0f;
            if (volume > 1.0f) volume = 1.0f;
            tracks_[trackIndex].volume = volume;
        }
    }

    PlaybackState getState() const override {
        return state_;
    }

    float getCurrentTime() const override {
        return currentTime_;
    }

    float getDuration() const override {
        return duration_;
    }

    bool isLoaded() const override {
        return loaded_;
    }

    ScoreMetadata getMetadata() const override {
        return metadata_;
    }

    int getNumTracks() const override {
        return static_cast<int>(tracks_.size());
    }

    TrackInfo getTrackInfo(int index) const override {
        if (index >= 0 && index < static_cast<int>(tracks_.size())) {
            return tracks_[index];
        }
        return TrackInfo();
    }

    void setOnStateChanged(StateCallback callback) override {
        stateCallback_ = callback;
    }

    void setOnTimeUpdate(TimeCallback callback) override {
        timeCallback_ = callback;
    }

    void setOnError(ErrorCallback callback) override {
        errorCallback_ = callback;
    }

    void setOnLoaded(LoadedCallback callback) override {
        loadedCallback_ = callback;
    }

private:
    void notifyStateChanged() {
        if (stateCallback_) {
            stateCallback_(state_);
        }
    }

    void notifyTimeUpdate() {
        if (timeCallback_) {
            timeCallback_(currentTime_);
        }
    }

#ifdef __EMSCRIPTEN__
    void startPlaybackTimer() {
        EM_ASM({
            if (!Module.playbackTimers) Module.playbackTimers = {};
            const playerPtr = $0;

            Module.playbackTimers[playerPtr] = setInterval(() => {
                Module.ccall('updatePlayback', 'void', ['number'], [playerPtr]);
            }, 100); // Update every 100ms
        }, this);
    }

    void stopPlaybackTimer() {
        EM_ASM({
            const playerPtr = $0;
            if (Module.playbackTimers && Module.playbackTimers[playerPtr]) {
                clearInterval(Module.playbackTimers[playerPtr]);
                delete Module.playbackTimers[playerPtr];
            }
        }, this);
    }
#endif

    PlaybackState state_;
    float currentTime_;
    float duration_;
    float tempo_;
    float volume_;
    bool loop_;
    bool loaded_;

    ScoreMetadata metadata_;
    std::vector<TrackInfo> tracks_;

    StateCallback stateCallback_;
    TimeCallback timeCallback_;
    ErrorCallback errorCallback_;
    LoadedCallback loadedCallback_;
};

// Factory function
MuseScorePlayer* MuseScorePlayer::create() {
    return new MuseScorePlayerImpl();
}

MuseScorePlayer::~MuseScorePlayer() = default;

} // namespace player
} // namespace muse

// C API for Emscripten
#ifdef __EMSCRIPTEN__
extern "C" {

EMSCRIPTEN_KEEPALIVE
void updatePlayback(muse::player::MuseScorePlayer* player) {
    if (player->getState() == muse::player::PlaybackState::Playing) {
        float newTime = player->getCurrentTime() + 0.1f; // 100ms increment

        if (newTime >= player->getDuration()) {
            player->stop();
        } else {
            const_cast<muse::player::MuseScorePlayerImpl*>(
                static_cast<const muse::player::MuseScorePlayerImpl*>(player)
            )->seek(newTime);
        }
    }
}

}
#endif
