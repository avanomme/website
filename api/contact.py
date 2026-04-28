"""
Vercel serverless: relay a contact-form submission to SMTP2GO.

Frontend POSTs JSON {name, email, message, _hp} to /api/contact.

Required env vars (set in Vercel → Settings → Environment Variables):
  SMTP2GO_API_KEY      — your SMTP2GO API key
  SMTP2GO_TO_EMAIL     — where contact mail is delivered (e.g. contact@madmanvo.com)
  SMTP2GO_FROM_EMAIL   — verified sender on the SMTP2GO domain
                         (e.g. noreply@madmanvo.com)

Optional:
  SMTP2GO_FROM_NAME      — display name for From header (default: "MadmanVO Contact")
  SMTP2GO_SUBJECT_PREFIX — subject prefix (default: "[madmanvo] Contact")

Honeypot: if the `_hp` field comes through non-empty, we silently 200
the request without sending mail. Catches dumb bots without showing a captcha.
"""

import json
import os
import re
import urllib.request
import urllib.error

from flask import Flask, request, jsonify

app = Flask(__name__)

EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')


@app.route('/api/contact', methods=['POST'])
def contact():
    try:
        body = request.get_json(silent=True) or {}
    except Exception:
        return jsonify({'error': 'Invalid JSON'}), 400

    # Honeypot: bot filled the hidden field — drop the message.
    hp = (body.get('_hp') or '').strip()
    if hp:
        print('[contact] honeypot triggered, silently dropping')
        return jsonify({'ok': True}), 200

    name = (body.get('name') or '').strip()
    email = (body.get('email') or '').strip()
    message = (body.get('message') or '').strip()

    if not name or not email or not message:
        return jsonify({'error': 'Name, email, and message are required.'}), 400
    if len(name) > 200 or len(message) > 5000:
        return jsonify({'error': 'Submission too long.'}), 400
    if not EMAIL_RE.match(email):
        return jsonify({'error': 'Invalid email address.'}), 400

    api_key = os.environ.get('SMTP2GO_API_KEY')
    to_email = os.environ.get('SMTP2GO_TO_EMAIL')
    from_email = os.environ.get('SMTP2GO_FROM_EMAIL')
    from_name = os.environ.get('SMTP2GO_FROM_NAME', 'MadmanVO Contact')
    subject_prefix = os.environ.get('SMTP2GO_SUBJECT_PREFIX', '[madmanvo] Contact')

    if not api_key or not to_email or not from_email:
        print('[contact] missing SMTP2GO env vars')
        return jsonify({'error': 'Email service is not configured. Contact the site admin.'}), 500

    subject = f'{subject_prefix}: {name}'
    text_body = f'Name:    {name}\nEmail:   {email}\n\n{message}'

    payload = {
        'sender': f'{from_name} <{from_email}>',
        'to': [to_email],
        'subject': subject,
        'text_body': text_body,
        'custom_headers': [
            {'header': 'Reply-To', 'value': f'{name} <{email}>'},
        ],
    }
    data = json.dumps(payload).encode('utf-8')

    req = urllib.request.Request(
        'https://api.smtp2go.com/v3/email/send',
        data=data,
        method='POST',
        headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Smtp2go-Api-Key': api_key,
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp_body = resp.read().decode('utf-8', errors='replace')
            try:
                resp_data = json.loads(resp_body)
            except Exception:
                resp_data = {}
            # SMTP2GO sometimes returns 200 with an error in the body
            if resp_data.get('data', {}).get('error'):
                print('[contact] SMTP2GO body error:', resp_data)
                return jsonify({'error': 'Email service rejected the message. Try again later.'}), 502
            return jsonify({'ok': True}), 200
    except urllib.error.HTTPError as e:
        body_text = e.read().decode('utf-8', errors='replace') if e.fp else ''
        print('[contact] SMTP2GO HTTPError:', e.code, body_text)
        return jsonify({'error': 'Email service rejected the message. Try again later.'}), 502
    except urllib.error.URLError as e:
        print('[contact] SMTP2GO URLError:', e)
        return jsonify({'error': 'Could not reach the email service. Try again later.'}), 502
    except Exception as e:
        print('[contact] unexpected error:', e)
        return jsonify({'error': 'Unexpected error. Try again later.'}), 500
