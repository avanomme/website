"""
Google Drive Backup using OAuth (user authentication)
Authenticate once, save token, everyone uses same token
"""

import os
import json
from datetime import datetime
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaInMemoryUpload
from googleapiclient.errors import HttpError

# Scopes for Drive access
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# Your Google Drive folder ID
DRIVE_FOLDER_ID = '16O82Uatw7XR2Ea1ki0khbOljIbk6qsFu'

class GoogleDriveOAuthBackup:
    def __init__(self, credentials_file='credentials.json', token_file='drive-token.json'):
        self.credentials_file = credentials_file
        self.token_file = token_file
        self.service = None

    def authenticate(self):
        """Authenticate using OAuth"""
        creds = None

        # Try environment variable first (for Vercel)
        token_json = os.environ.get('GOOGLE_DRIVE_TOKEN')
        if token_json:
            try:
                token_data = json.loads(token_json)
                creds = Credentials.from_authorized_user_info(token_data, SCOPES)
            except Exception as e:
                print(f"Failed to load token from environment: {e}")

        # Try token file (local)
        if not creds and os.path.exists(self.token_file):
            creds = Credentials.from_authorized_user_file(self.token_file, SCOPES)

        # If no valid credentials, authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception as e:
                    print(f"Token refresh failed: {e}")
                    creds = None

            if not creds:
                if not os.path.exists(self.credentials_file):
                    print(f"Warning: No OAuth credentials found. Google Drive backup disabled.")
                    print(f"  - Place credentials.json in project root, or")
                    print(f"  - Set GOOGLE_DRIVE_TOKEN environment variable")
                    return None

                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_file, SCOPES)
                creds = flow.run_local_server(port=0)

                # Save token for next time
                with open(self.token_file, 'w') as token:
                    token.write(creds.to_json())

                print(f"\n✓ Token saved to {self.token_file}")
                print("Copy this file content to Vercel environment variable: GOOGLE_DRIVE_TOKEN")

        self.service = build('drive', 'v3', credentials=creds)
        return self.service

    def backup_to_drive(self, data, project_name='shared-project'):
        """Backup project data to Google Drive with versioning"""
        if not self.service:
            self.authenticate()

        if not self.service:
            return {'success': False, 'error': 'Authentication failed'}

        try:
            # Create filename with timestamp
            timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
            filename = f"{project_name}_backup_{timestamp}.json"

            # Convert data to JSON
            json_data = json.dumps(data, indent=2)

            # Create file metadata
            file_metadata = {
                'name': filename,
                'parents': [DRIVE_FOLDER_ID],
                'mimeType': 'application/json',
                'description': f'Automatic backup of {project_name} at {datetime.now().isoformat()}'
            }

            # Upload file
            media = MediaInMemoryUpload(
                json_data.encode('utf-8'),
                mimetype='application/json',
                resumable=True
            )

            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, createdTime, webViewLink'
            ).execute()

            return {
                'success': True,
                'file_id': file.get('id'),
                'file_name': file.get('name'),
                'created_time': file.get('createdTime'),
                'web_link': file.get('webViewLink'),
                'timestamp': timestamp
            }

        except HttpError as error:
            print(f'Google Drive API error: {error}')
            return {'success': False, 'error': str(error)}
        except Exception as e:
            print(f'Backup error: {e}')
            return {'success': False, 'error': str(e)}

    def list_backups(self, project_name='shared-project', max_results=10):
        """List recent backups"""
        if not self.service:
            self.authenticate()

        if not self.service:
            return {'success': False, 'error': 'Authentication failed', 'backups': [], 'count': 0}

        try:
            query = f"name contains '{project_name}_backup_' and '{DRIVE_FOLDER_ID}' in parents and trashed=false"

            results = self.service.files().list(
                q=query,
                pageSize=max_results,
                orderBy='createdTime desc',
                fields='files(id, name, createdTime, webViewLink, size)'
            ).execute()

            files = results.get('files', [])
            return {
                'success': True,
                'backups': files,
                'count': len(files)
            }

        except Exception as e:
            print(f'List backups error: {e}')
            return {'success': False, 'error': str(e), 'backups': [], 'count': 0}


def test_backup():
    """Test the OAuth backup"""
    backup = GoogleDriveOAuthBackup()

    # Test data
    test_data = {
        'useCases': [
            {'id': 1, 'name': 'Test Use Case', 'x': 100, 'y': 100}
        ],
        'features': [],
        'connections': [],
        'lastSaved': datetime.now().isoformat()
    }

    print("Testing Google Drive OAuth backup...")
    result = backup.backup_to_drive(test_data, 'test-project')

    if result['success']:
        print(f"✓ Backup successful!")
        print(f"  File: {result['file_name']}")
        print(f"  Link: {result['web_link']}")
    else:
        print(f"✗ Backup failed: {result.get('error')}")

    return result


if __name__ == '__main__':
    test_backup()
