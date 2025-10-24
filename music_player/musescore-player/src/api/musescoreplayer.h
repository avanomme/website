#ifndef MUSESCORE_PLAYER_H
#define MUSESCORE_PLAYER_H

#include <string>
#include <functional>
#include <memory>

namespace muse {
namespace player {

enum class PlaybackState {
    Stopped = 0,
    Playing = 1,
    Paused = 2,
    Loading = 3,
    Error = 4
};

struct ScoreMetadata {
    std::string title;
    std::string composer;
    std::string copyright;
    int measureCount;
    int numParts;
    float durationSeconds;
};

struct TrackInfo {
    int index;
    std::string name;
    std::string instrument;
    bool muted;
    float volume;
};

/**
 * @brief Main MuseScore Player API
 *
 * This class provides a simple interface for loading and playing
 * musical scores in various formats (MusicXML, MIDI, MuseScore).
 */
class MuseScorePlayer {
public:
    /**
     * @brief Create a new player instance
     * @return Pointer to new player (caller must delete)
     */
    static MuseScorePlayer* create();

    /**
     * @brief Destructor
     */
    virtual ~MuseScorePlayer();

    // File loading
    virtual bool loadFromURL(const char* url) = 0;
    virtual bool loadFromBuffer(const uint8_t* data, size_t size, const char* filename) = 0;
    virtual void unload() = 0;

    // Playback controls
    virtual void play() = 0;
    virtual void pause() = 0;
    virtual void stop() = 0;
    virtual void seek(float timeSeconds) = 0;

    // Settings
    virtual void setTempo(float factor) = 0;      // 0.5 = half speed, 2.0 = double
    virtual void setVolume(float volume) = 0;     // 0.0 to 1.0
    virtual void setLoop(bool enabled) = 0;
    virtual void setMute(int trackIndex, bool muted) = 0;
    virtual void setTrackVolume(int trackIndex, float volume) = 0;

    // State queries
    virtual PlaybackState getState() const = 0;
    virtual float getCurrentTime() const = 0;
    virtual float getDuration() const = 0;
    virtual bool isLoaded() const = 0;

    // Metadata
    virtual ScoreMetadata getMetadata() const = 0;
    virtual int getNumTracks() const = 0;
    virtual TrackInfo getTrackInfo(int index) const = 0;

    // Callbacks
    using StateCallback = std::function<void(PlaybackState)>;
    using TimeCallback = std::function<void(float)>;
    using ErrorCallback = std::function<void(const char*)>;
    using LoadedCallback = std::function<void()>;

    virtual void setOnStateChanged(StateCallback callback) = 0;
    virtual void setOnTimeUpdate(TimeCallback callback) = 0;
    virtual void setOnError(ErrorCallback callback) = 0;
    virtual void setOnLoaded(LoadedCallback callback) = 0;

protected:
    MuseScorePlayer() = default;
};

} // namespace player
} // namespace muse

#endif // MUSESCORE_PLAYER_H
