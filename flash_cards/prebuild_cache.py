#!/usr/bin/env python
"""
Prebuild TTS cache for common flash card phrases
Run this after starting the TTS server to speed up first-time playback
"""
import requests
import json
import time
from pathlib import Path

SERVER_URL = "http://localhost:5050"

# Common phrases that appear in flash cards
COMMON_PHRASES = [
    "What is",
    "Define",
    "Explain",
    "Describe",
    "How does",
    "Why is",
    "When was",
    "Where is",
    "Who was",
    "Which",
]

# Test questions from cards.md (you can customize these)
TEST_QUESTIONS = [
    "What is the capital of France?",
    "What is Python?",
    "Explain the concept of recursion.",
    "Define machine learning.",
]

def check_server():
    """Check if server is running"""
    try:
        response = requests.get(f"{SERVER_URL}/api/health", timeout=2)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Server is running: {data}")
            return True
    except Exception as e:
        print(f"✗ Server not reachable: {e}")
        return False

def get_voices():
    """Get available voices"""
    try:
        response = requests.get(f"{SERVER_URL}/api/voices")
        if response.status_code == 200:
            data = response.json()
            return [v['name'] for v in data['voices']]
    except Exception as e:
        print(f"Error getting voices: {e}")
    return []

def prebuild_phrase(text, speaker):
    """Generate and cache a phrase"""
    try:
        response = requests.post(
            f"{SERVER_URL}/api/speak",
            json={"text": text, "speaker": speaker},
            timeout=30
        )
        if response.status_code == 200:
            size = len(response.content)
            print(f"  ✓ Cached: '{text[:40]}...' ({size} bytes)")
            return True
        else:
            print(f"  ✗ Failed: '{text[:40]}...' ({response.status_code})")
            return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    print("TTS Cache Prebuilder")
    print("=" * 60)

    if not check_server():
        print("\nPlease start the TTS server first:")
        print("  ./start_tts.sh")
        return

    voices = get_voices()
    if not voices:
        print("No voices available")
        return

    print(f"\nFound {len(voices)} voices: {', '.join(voices[:3])}...")

    # Use the first voice (or specify your preferred one)
    default_voice = voices[0]
    print(f"\nUsing voice: {default_voice}")

    print(f"\nPrebuilding {len(COMMON_PHRASES) + len(TEST_QUESTIONS)} phrases...")
    print("-" * 60)

    total = 0
    success = 0

    # Prebuild common phrases
    for phrase in COMMON_PHRASES:
        total += 1
        if prebuild_phrase(phrase, default_voice):
            success += 1
        time.sleep(0.5)  # Small delay to not overwhelm the server

    # Prebuild test questions
    for question in TEST_QUESTIONS:
        total += 1
        if prebuild_phrase(question, default_voice):
            success += 1
        time.sleep(0.5)

    print("-" * 60)
    print(f"\n✓ Prebuilt {success}/{total} phrases")

    # Check cache status
    health = requests.get(f"{SERVER_URL}/api/health").json()
    print(f"Cache contains {health.get('cache_size', 0)} files")

if __name__ == "__main__":
    main()
