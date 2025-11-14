#!/usr/bin/env python3
"""Test if service account can access the Drive folder"""

from google_drive_backup import GoogleDriveBackup

def test_folder_access():
    backup = GoogleDriveBackup()
    service = backup.authenticate()

    if not service:
        print("Failed to authenticate")
        return

    folder_id = '16O82Uatw7XR2Ea1ki0khbOljIbk6qsFu'

    print(f"Testing access to folder: {folder_id}")
    print(f"Service account: software@software-engineering-478113.iam.gserviceaccount.com")
    print()

    # Try to get folder metadata
    try:
        folder = service.files().get(
            fileId=folder_id,
            fields='id, name, owners, permissions, capabilities'
        ).execute()

        print("✓ Can access folder!")
        print(f"  Folder name: {folder.get('name')}")
        print(f"  Can add children: {folder.get('capabilities', {}).get('canAddChildren', False)}")
        print(f"  Can edit: {folder.get('capabilities', {}).get('canEdit', False)}")

        # List permissions
        if 'permissions' in folder:
            print(f"\n  Permissions:")
            for perm in folder.get('permissions', []):
                print(f"    - {perm.get('emailAddress', 'N/A')}: {perm.get('role')}")

        return True

    except Exception as e:
        print(f"✗ Cannot access folder: {e}")
        print()
        print("Please share the folder with the service account:")
        print("1. Go to: https://drive.google.com/drive/u/4/folders/16O82Uatw7XR2Ea1ki0khbOljIbk6qsFu")
        print("2. Click 'Share'")
        print("3. Add: software@software-engineering-478113.iam.gserviceaccount.com")
        print("4. Give 'Editor' permission")
        print("5. Uncheck 'Notify people'")
        print("6. Click 'Share'")
        return False

if __name__ == '__main__':
    test_folder_access()
