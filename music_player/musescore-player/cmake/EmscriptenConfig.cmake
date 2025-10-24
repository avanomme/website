# Emscripten configuration for WebAssembly builds

if(NOT EMSCRIPTEN)
    message(WARNING "EmscriptenConfig.cmake included but EMSCRIPTEN is not set")
    return()
endif()

message(STATUS "Configuring for Emscripten/WebAssembly build")

# Compiler flags for all builds
set(EMSCRIPTEN_COMMON_FLAGS
    -sNO_EXIT_RUNTIME=1
    -sALLOW_MEMORY_GROWTH=1
    -sINITIAL_MEMORY=67108864      # 64MB
    -sMAXIMUM_MEMORY=1073741824    # 1GB
    -sEXPORTED_RUNTIME_METHODS=['ccall','cwrap','FS','getValue','setValue']
    -sMODULARIZE=1
    -sEXPORT_NAME=createMuseScoreModule
    -sFETCH=1
    -sWASM=1
    -sASYNCIFY=1
    -sWEBAUDIO=1
    --bind
    -std=c++17
)

# Optimization for release builds
set(EMSCRIPTEN_RELEASE_FLAGS
    -O3
    -flto
    --closure 1
    -sASSERTIONS=0
)

# Debug flags
set(EMSCRIPTEN_DEBUG_FLAGS
    -O0
    -g
    -sASSERTIONS=2
    -sSAFE_HEAP=1
    -sSTACK_OVERFLOW_CHECK=2
)

# Apply common flags
add_compile_options(${EMSCRIPTEN_COMMON_FLAGS})
add_link_options(${EMSCRIPTEN_COMMON_FLAGS})

# Apply build-type specific flags
if(CMAKE_BUILD_TYPE STREQUAL "Release")
    add_compile_options(${EMSCRIPTEN_RELEASE_FLAGS})
    add_link_options(${EMSCRIPTEN_RELEASE_FLAGS})
else()
    add_compile_options(${EMSCRIPTEN_DEBUG_FLAGS})
    add_link_options(${EMSCRIPTEN_DEBUG_FLAGS})
endif()

# Export functions
set(EXPORTED_FUNCTIONS
    _malloc
    _free
)

list(JOIN EXPORTED_FUNCTIONS "," EXPORTED_FUNCTIONS_STR)
add_link_options("SHELL:-sEXPORTED_FUNCTIONS=[${EXPORTED_FUNCTIONS_STR}]")

# Preload files (if needed)
# add_link_options("--preload-file ${CMAKE_SOURCE_DIR}/assets@/assets")

message(STATUS "Emscripten configuration complete")
