#!/usr/bin/env python3
"""
Simple HTTP server for testing MuseScore Player
"""

import http.server
import socketserver
import os
import sys

PORT = 8000

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS support"""

    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def main():
    # Change to the project root directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Create server
    with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
        print(f"MuseScore Player Test Server")
        print(f"=" * 50)
        print(f"Server running at http://localhost:{PORT}/")
        print(f"")
        print(f"Available pages:")
        print(f"  Player:   http://localhost:{PORT}/../player4.html")
        print(f"  Rehearse: http://localhost:{PORT}/../rehearse4.html")
        print(f"  Tests:    http://localhost:{PORT}/tests/test-player.html")
        print(f"")
        print(f"Press Ctrl+C to stop")
        print(f"=" * 50)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            sys.exit(0)

if __name__ == "__main__":
    main()
