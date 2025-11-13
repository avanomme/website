"""
Google Drive Backup Module for SE Use Case Mapper
Handles automatic versioned backups to Google Drive using Service Account
"""

import os
import json
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaInMemoryUpload
from googleapiclient.errors import HttpError

# Scopes for Drive access
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# Your Google Drive folder ID from the URL
DRIVE_FOLDER_ID = '16O82Uatw7XR2Ea1ki0khbOljIbk6qsFu'

class GoogleDriveBackup:
    def __init__(self, service_account_file='service-account.json'):
        """
        Initialize with service account credentials.
        Service account allows server-side auth without user interaction.
        """
        self.service_account_file = service_account_file
        self.service = None

    def authenticate(self):
        """Authenticate with Google Drive API using service account"""
        try:
            # Try to load from environment variable first (for Vercel)
            service_account_info = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')

            if service_account_info:
                # Load from environment variable
                credentials_dict = json.loads(service_account_info)
                credentials = service_account.Credentials.from_service_account_info(
                    credentials_dict, scopes=SCOPES
                )
            elif os.path.exists(self.service_account_file):
                # Load from file (local development)
                credentials = service_account.Credentials.from_service_account_file(
                    self.service_account_file, scopes=SCOPES
                )
            else:
                print(f"Warning: No service account credentials found. Google Drive backup disabled.")
                print(f"  - Set GOOGLE_SERVICE_ACCOUNT_JSON environment variable, or")
                print(f"  - Place service account JSON at {self.service_account_file}")
                return None

            self.service = build('drive', 'v3', credentials=credentials)
            return self.service

        except Exception as e:
            print(f"Google Drive authentication failed: {e}")
            return None

    def backup_to_drive(self, data, project_name='shared-project'):
        """
        Backup project data to Google Drive with versioning

        Args:
            data: Dictionary containing project data
            project_name: Name of the project (default: 'shared-project')

        Returns:
            dict: Result with success status and file info
        """
        if not self.service:
            self.authenticate()

        try:
            # Create filename with timestamp for versioning
            timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
            filename = f"{project_name}_backup_{timestamp}.json"

            # Convert data to JSON string
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
            return {
                'success': False,
                'error': str(error)
            }
        except Exception as e:
            print(f'Backup error: {e}')
            return {
                'success': False,
                'error': str(e)
            }

    def list_backups(self, project_name='shared-project', max_results=10):
        """List recent backups for a project"""
        if not self.service:
            self.authenticate()

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
            return {
                'success': False,
                'error': str(e),
                'backups': [],
                'count': 0
            }

    def get_latest_backup(self, project_name='shared-project'):
        """Get the most recent backup"""
        result = self.list_backups(project_name, max_results=1)
        if result['success'] and result['backups']:
            return result['backups'][0]
        return None

    def download_backup(self, file_id):
        """Download a specific backup file"""
        if not self.service:
            self.authenticate()

        try:
            request = self.service.files().get_media(fileId=file_id)
            content = request.execute()

            return {
                'success': True,
                'data': json.loads(content.decode('utf-8'))
            }

        except Exception as e:
            print(f'Download backup error: {e}')
            return {
                'success': False,
                'error': str(e)
            }


def test_backup():
    """Test the backup functionality"""
    backup = GoogleDriveBackup()

    # Test data
    test_data = {
        'useCases': [
            {'id': 1, 'name': 'Test Use Case', 'x': 100, 'y': 100}
        ],
        'features': [],
        'connections': [],
        'lastSaved': datetime.now().isoformat()
    }

    print("Testing Google Drive backup...")
    result = backup.backup_to_drive(test_data, 'test-project')

    if result['success']:
        print(f"✓ Backup successful!")
        print(f"  File: {result['file_name']}")
        print(f"  ID: {result['file_id']}")
        print(f"  Link: {result['web_link']}")
    else:
        print(f"✗ Backup failed: {result['error']}")

    print("\nListing recent backups...")
    backups = backup.list_backups('test-project')
    if backups['success']:
        print(f"Found {backups['count']} backups:")
        for b in backups['backups']:
            print(f"  - {b['name']} ({b['createdTime']})")

    return result


if __name__ == '__main__':
    test_backup()
