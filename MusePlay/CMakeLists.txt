cmake_minimum_required(VERSION 3.20)
project(MusePlay)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Emscripten-specific settings
if(EMSCRIPTEN)
    message(STATUS "Building for WebAssembly with Emscripten")

    # Emscripten compiler flags
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s WASM=1")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s ALLOW_MEMORY_GROWTH=1")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s MODULARIZE=1")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s EXPORT_NAME='MusePlayModule'")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s EXPORTED_RUNTIME_METHODS=['FS','ccall','cwrap']")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s TOTAL_MEMORY=256MB")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s FILESYSTEM=1")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} --bind")

    # Optimization flags
    if(CMAKE_BUILD_TYPE MATCHES Release)
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3")
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s ASSERTIONS=0")
    else()
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O0 -g")
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s ASSERTIONS=1")
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s SAFE_HEAP=1")
    endif()
endif()

# MuseScore source directories
set(MUSESCORE_ROOT "${CMAKE_SOURCE_DIR}/../MuseScore")
set(MUSESCORE_SRC "${MUSESCORE_ROOT}/src")

# Include directories
include_directories(
    ${MUSESCORE_SRC}
    ${MUSESCORE_SRC}/engraving
    ${MUSESCORE_SRC}/framework
    ${CMAKE_SOURCE_DIR}/src/bindings
)

# Collect MuseScore source files needed for core functionality
set(MUSESCORE_ENGRAVING_SOURCES
    # Core engraving
    ${MUSESCORE_SRC}/engraving/engravingproject.cpp
    ${MUSESCORE_SRC}/engraving/engravingmodule.cpp

    # Score loading
    ${MUSESCORE_SRC}/engraving/rw/mscloader.cpp
    ${MUSESCORE_SRC}/engraving/rw/xmlreader.cpp
    ${MUSESCORE_SRC}/engraving/rw/xmlwriter.cpp

    # DOM (Score structure)
    ${MUSESCORE_SRC}/engraving/dom/masterscore.cpp
    ${MUSESCORE_SRC}/engraving/dom/score.cpp
    ${MUSESCORE_SRC}/engraving/dom/note.cpp
    ${MUSESCORE_SRC}/engraving/dom/chord.cpp
    ${MUSESCORE_SRC}/engraving/dom/rest.cpp
    ${MUSESCORE_SRC}/engraving/dom/measure.cpp
    ${MUSESCORE_SRC}/engraving/dom/segment.cpp
    ${MUSESCORE_SRC}/engraving/dom/staff.cpp
    ${MUSESCORE_SRC}/engraving/dom/part.cpp
    ${MUSESCORE_SRC}/engraving/dom/tempo.cpp

    # MIDI rendering
    ${MUSESCORE_SRC}/engraving/compat/midi/compatmidirender.cpp
    ${MUSESCORE_SRC}/engraving/compat/midi/event.cpp
    ${MUSESCORE_SRC}/engraving/compat/midi/velocitymap.cpp
)

# Our binding code
set(BINDING_SOURCES
    src/bindings/musescore_bindings.cpp
    src/bindings/score_loader.cpp
    src/bindings/midi_generator.cpp
)

# Build the WebAssembly module
add_executable(musescore_core
    ${MUSESCORE_ENGRAVING_SOURCES}
    ${BINDING_SOURCES}
)

# Link libraries (if needed)
if(EMSCRIPTEN)
    target_link_libraries(musescore_core
        # Add any required libraries here
    )
endif()

# Installation
install(TARGETS musescore_core
    RUNTIME DESTINATION ${CMAKE_SOURCE_DIR}/public/wasm
)

install(FILES
    ${CMAKE_BINARY_DIR}/musescore_core.wasm
    ${CMAKE_BINARY_DIR}/musescore_core.js
    DESTINATION ${CMAKE_SOURCE_DIR}/public/wasm
)
