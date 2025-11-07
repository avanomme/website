#!/usr/bin/env python3
"""
MusePlay Standalone Server
Serves the MusePlay application on http://localhost:8080
"""
import http.server
import socketserver
import os
from pathlib import Path

# Get the directory where this script lives
SCRIPT_DIR = Path(__file__).parent.resolve()
PUBLIC_DIR = SCRIPT_DIR / "public"
PORT = 8080

class MusePlayHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler to serve from the MusePlay directory"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SCRIPT_DIR), **kwargs)

    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Cache control
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def do_GET(self):
        # Redirect root to /public/index.html
        if self.path == '/' or self.path == '':
            self.path = '/public/index.html'
        # Handle /public/ prefix
        elif self.path.startswith('/public/'):
            pass  # Keep as is
        # Redirect requests without /public/ to check if they exist in public/
        elif not self.path.startswith('/scores/'):
            # Try to serve from public/ if file doesn't exist at root
            test_path = SCRIPT_DIR / self.path.lstrip('/')
            public_path = PUBLIC_DIR / self.path.lstrip('/')
            if not test_path.exists() and public_path.exists():
                self.path = '/public' + self.path

        return super().do_GET()

def main():
    """Start the MusePlay server"""
    os.chdir(SCRIPT_DIR)

    print("=" * 60)
    print("🎵 MusePlay - Native MuseScore Web Player")
    print("=" * 60)
    print(f"\n📁 Serving from: {SCRIPT_DIR}")
    print(f"🌐 Server starting on http://localhost:{PORT}")
    print(f"\n✅ Open your browser to: http://localhost:{PORT}")
    print(f"📂 Public files: {PUBLIC_DIR}")
    print(f"🎼 Scores directory: {SCRIPT_DIR / 'scores'}")
    print("\nPress Ctrl+C to stop the server\n")
    print("=" * 60 + "\n")

    with socketserver.TCPServer(("", PORT), MusePlayHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Shutting down server...")
            print("👋 Goodbye!\n")

if __name__ == "__main__":
    main()
