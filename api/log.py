from flask import Flask, request, jsonify
from datetime import datetime
import json
import os

app = Flask(__name__)

# Log file path
LOG_FILE = '/tmp/flashcard_logs.jsonl'

def get_client_ip():
    """Get the real client IP address, handling proxies"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    return request.remote_addr

def log_event(event_type, data):
    """Log an event to the log file"""
    log_entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'event_type': event_type,
        'ip': get_client_ip(),
        'user_agent': request.headers.get('User-Agent', 'Unknown'),
        'data': data
    }

    try:
        with open(LOG_FILE, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
        return True
    except Exception as e:
        print(f"Error logging event: {e}")
        return False

@app.route('/api/log', methods=['POST'])
def log_endpoint():
    """Main logging endpoint"""
    try:
        data = request.get_json()

        if not data or 'event_type' not in data:
            return jsonify({'error': 'Missing event_type'}), 400

        event_type = data.get('event_type')
        event_data = data.get('data', {})

        # Log the event
        success = log_event(event_type, event_data)

        if success:
            return jsonify({'status': 'logged', 'timestamp': datetime.utcnow().isoformat()}), 200
        else:
            return jsonify({'error': 'Failed to log event'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Retrieve logs (requires authentication in production)"""
    try:
        # Check for auth token
        auth_token = request.headers.get('Authorization')
        if auth_token != 'Bearer YOUR_SECRET_TOKEN_HERE':
            return jsonify({'error': 'Unauthorized'}), 401

        # Read logs
        if not os.path.exists(LOG_FILE):
            return jsonify({'logs': []}), 200

        logs = []
        with open(LOG_FILE, 'r') as f:
            for line in f:
                try:
                    logs.append(json.loads(line))
                except:
                    continue

        # Get query parameters for filtering
        limit = request.args.get('limit', default=100, type=int)
        event_type = request.args.get('event_type')

        # Filter by event type if specified
        if event_type:
            logs = [log for log in logs if log.get('event_type') == event_type]

        # Return most recent logs first
        logs.reverse()
        logs = logs[:limit]

        return jsonify({'logs': logs, 'count': len(logs)}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs/stats', methods=['GET'])
def get_stats():
    """Get statistics about logs"""
    try:
        # Check for auth token
        auth_token = request.headers.get('Authorization')
        if auth_token != 'Bearer YOUR_SECRET_TOKEN_HERE':
            return jsonify({'error': 'Unauthorized'}), 401

        if not os.path.exists(LOG_FILE):
            return jsonify({'stats': {}}), 200

        stats = {
            'total_events': 0,
            'page_views': 0,
            'card_creations': 0,
            'card_edits': 0,
            'unique_ips': set(),
            'event_types': {}
        }

        with open(LOG_FILE, 'r') as f:
            for line in f:
                try:
                    log = json.loads(line)
                    stats['total_events'] += 1

                    event_type = log.get('event_type', 'unknown')
                    stats['event_types'][event_type] = stats['event_types'].get(event_type, 0) + 1

                    if event_type == 'page_view':
                        stats['page_views'] += 1
                    elif event_type == 'card_created':
                        stats['card_creations'] += 1
                    elif event_type == 'card_edited':
                        stats['card_edits'] += 1

                    stats['unique_ips'].add(log.get('ip', 'unknown'))
                except:
                    continue

        # Convert set to count
        stats['unique_ips'] = len(stats['unique_ips'])

        return jsonify({'stats': stats}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def handler(request):
    """Vercel serverless function handler"""
    with app.request_context(request.environ):
        return app.full_dispatch_request()
