cmake_minimum_required(VERSION 3.22)
project(MuseScorePlayer VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Build options
option(BUILD_WASM "Build WebAssembly target" ON)
option(BUILD_TESTS "Build test suite" ON)
option(BUILD_EXAMPLES "Build example applications" ON)
option(ENABLE_SOUNDFONT "Include SoundFont support" ON)

# Include custom CMake modules
list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")

# Platform detection
if(EMSCRIPTEN)
    set(BUILD_WASM ON)
    include(EmscriptenConfig)
endif()

# Core library (will be populated with extracted MuseScore code)
add_library(mscore_player_core STATIC
    src/core/placeholder.cpp
)

target_include_directories(mscore_player_core PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

# API layer
add_library(mscore_player_api STATIC
    src/api/musescoreplayer.cpp
)

target_link_libraries(mscore_player_api PUBLIC
    mscore_player_core
)

# WASM target with Emscripten bindings
if(BUILD_WASM)
    add_executable(musescore_player_wasm
        src/bindings/embind.cpp
    )

    target_link_libraries(musescore_player_wasm
        mscore_player_api
        mscore_player_core
    )

    if(EMSCRIPTEN)
        set_target_properties(musescore_player_wasm PROPERTIES
            OUTPUT_NAME "musescore-player"
            SUFFIX ".js"
        )
    endif()
endif()

# Tests
if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()

# Examples
if(BUILD_EXAMPLES)
    add_subdirectory(examples)
endif()

# Installation
install(TARGETS mscore_player_core mscore_player_api
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
)

install(DIRECTORY src/api/
    DESTINATION include/musescore-player
    FILES_MATCHING PATTERN "*.h"
)

if(BUILD_WASM AND EMSCRIPTEN)
    install(FILES
        ${CMAKE_BINARY_DIR}/musescore-player.js
        ${CMAKE_BINARY_DIR}/musescore-player.wasm
        DESTINATION web
    )
endif()
