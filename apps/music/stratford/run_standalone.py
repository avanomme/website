#!/usr/bin/env python3
"""
Music Player Standalone Server
Serves the Verovio-based music player on http://localhost:8080
"""
import http.server
import socketserver
import os
from pathlib import Path

# Get the directory where this script lives
SCRIPT_DIR = Path(__file__).parent.resolve()
PORT = 8080

class MusicPlayerHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler to serve from the music_player directory"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SCRIPT_DIR.parent), **kwargs)

    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Cache control
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def do_GET(self):
        # Redirect root to music_player/rehearse.html
        if self.path == '/' or self.path == '':
            self.path = '/music_player/rehearse.html'

        return super().do_GET()

def main():
    """Start the Music Player server"""
    os.chdir(SCRIPT_DIR.parent)

    print("=" * 70)
    print("🎵 Music Player (Verovio-based)")
    print("=" * 70)
    print(f"\n📁 Serving from: {SCRIPT_DIR.parent}")
    print(f"🌐 Server starting on http://localhost:{PORT}")
    print(f"\n✅ Open your browser to: http://localhost:{PORT}")
    print(f"📂 Scores: {SCRIPT_DIR / 'scores'}")
    print("\nPress Ctrl+C to stop the server\n")
    print("=" * 70 + "\n")

    with socketserver.TCPServer(("", PORT), MusicPlayerHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Shutting down server...")
            print("👋 Goodbye!\n")

if __name__ == "__main__":
    main()
