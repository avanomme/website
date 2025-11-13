# Google Drive Service Account Setup (Simplified)

This uses a **Service Account** so backups happen automatically without any user needing to log in.

## Quick Setup (5 minutes)

### 1. Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one)
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "Service Account"
5. Name: "SE Mapper Backup Service"
6. Click "Create and Continue"
7. Skip role/permissions (click "Continue", then "Done")

### 2. Create Service Account Key

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Type: **JSON**
5. Click "Create"
6. A JSON file downloads - save it as `service-account.json`

### 3. Enable Google Drive API

1. Go to "APIs & Services" → "Library"
2. Search "Google Drive API"
3. Click it and press "ENABLE"

### 4. Share Your Drive Folder with Service Account

**IMPORTANT**: The service account needs access to your folder!

1. Open the JSON file you downloaded
2. Find the `client_email` field (looks like: `xxxx@yyyy.iam.gserviceaccount.com`)
3. Copy that email address
4. Go to your Google Drive folder: https://drive.google.com/drive/u/4/folders/16O82Uatw7XR2Ea1ki0khbOljIbk6qsFu
5. Click "Share" button
6. Paste the service account email
7. Give it "Editor" permissions
8. **Uncheck** "Notify people" (no need to email the service account)
9. Click "Share"

### 5. Place Service Account File

Save the `service-account.json` file here:
```
/Users/adam/projects/website/service-account.json
```

**This file is in .gitignore** and won't be committed.

### 6. Test It

```bash
cd /Users/adam/projects/website
python google_drive_backup.py
```

You should see: "✓ Backup successful!"

### 7. For Vercel Deployment

The service account JSON needs to be added as an environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Name**: `GOOGLE_SERVICE_ACCOUNT_JSON`
   - **Value**: (paste entire contents of service-account.json)
   - **Environment**: Production
3. Redeploy

## How It Works

- Service account = robot user that can access Drive
- No browser login needed
- Works on servers (Vercel)
- Everyone's saves backup to the same Drive folder
- Automatic versioning with timestamps

## Service Account JSON Format

The file looks like this:
```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "se-mapper-backup@project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

The `client_email` is what you share the Drive folder with!

## Security

- Service account has access ONLY to the specific folder you shared
- Can't access your other Drive files
- JSON file is in .gitignore (never committed)
- For Vercel, stored as encrypted environment variable

## Backup Behavior

- **Every save** creates a timestamped backup file
- Format: `shared-project_backup_2025-11-13_14-30-45.json`
- Backups are async (don't slow down saves)
- If backup fails, main save still works

## Done!

Once setup, all saves automatically backup to your Drive folder with full version history. No one else needs to do anything!
