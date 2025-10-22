#!/usr/bin/env python
"""
Quick test script for Coqui TTS server
Run with: source .venv-tts/bin/activate && python test_tts.py
"""
import requests
import json

SERVER_URL = "http://localhost:5050"

def test_health():
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{SERVER_URL}/api/health")
        if response.status_code == 200:
            print(f"✓ Server is healthy: {response.json()}")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Cannot connect to server: {e}")
        return False

def test_voices():
    print("\nTesting voices endpoint...")
    try:
        response = requests.get(f"{SERVER_URL}/api/voices")
        if response.status_code == 200:
            data = response.json()
            voices = data.get("voices", [])
            print(f"✓ Found {len(voices)} voices")
            if voices:
                print(f"  Voices: {', '.join([v['name'] for v in voices[:5]])}")
                if len(voices) > 5:
                    print(f"           {', '.join([v['name'] for v in voices[5:]])}")
            return True
        else:
            print(f"✗ Voices request failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Voices request error: {e}")
        return False

def test_speak():
    print("\nTesting speech generation...")
    try:
        response = requests.post(
            f"{SERVER_URL}/api/speak",
            json={
                "text": "Hello, this is a test of the Coqui TTS system.",
                "speaker": "Claribel Dervla"
            },
            timeout=30
        )
        if response.status_code == 200:
            audio_size = len(response.content)
            print(f"✓ Generated audio: {audio_size} bytes")

            # Optionally save to file
            with open("/tmp/tts_test.wav", "wb") as f:
                f.write(response.content)
            print(f"  Saved to /tmp/tts_test.wav")
            return True
        else:
            print(f"✗ Speech generation failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Speech generation error: {e}")
        return False

if __name__ == "__main__":
    print("Coqui TTS Server Test")
    print("=" * 50)

    all_passed = True
    all_passed &= test_health()
    all_passed &= test_voices()
    all_passed &= test_speak()

    print("\n" + "=" * 50)
    if all_passed:
        print("✓ All tests passed!")
    else:
        print("✗ Some tests failed")
        print("\nMake sure the TTS server is running:")
        print("  ./start_tts.sh")
