# Google Drive Backup Setup Guide

This guide will help you set up automatic versioned backups to Google Drive for the SE Use Case Mapper.

## What You Need

1. **Google Cloud Project** with Drive API enabled
2. **OAuth 2.0 Credentials** (credentials.json file)
3. **Google Drive Folder ID**: `16O82Uatw7XR2Ea1ki0khbOljIbk6qsFu`

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note the project name

### 2. Enable Google Drive API

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on it and press "ENABLE"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose user type:
   - **Internal**: If using Google Workspace (recommended)
   - **External**: If using personal Gmail
3. Fill in required fields:
   - App name: "SE Use Case Mapper"
   - User support email: Your email
   - Developer contact: Your email
4. Click "Save and Continue"
5. **Scopes**: Skip this (we'll add in code)
6. **Test users** (if External):
   - Click "Add Users"
   - Add your email address
7. Click "Save and Continue"

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Desktop app**
4. Name: "SE Use Case Mapper Desktop"
5. Click "Create"
6. **IMPORTANT**: Click "DOWNLOAD JSON"
7. Save the downloaded file as `credentials.json`

### 5. Place Credentials File

Move the downloaded `credentials.json` to your project root:

```bash
/Users/adam/projects/website/credentials.json
```

**Important**: This file is already in `.gitignore` and will NOT be committed to git.

### 6. Test the Setup

Run the test script to verify everything works:

```bash
cd /Users/adam/projects/website
python google_drive_backup.py
```

This will:
1. Open a browser window
2. Ask you to log in to Google
3. Request permission to access Drive
4. Create a test backup in your Drive folder
5. List recent backups

### 7. Authorize the Application

When you run it the first time:

1. A browser window will open automatically
2. Select your Google account
3. You may see "Google hasn't verified this app" warning:
   - Click "Advanced"
   - Click "Go to SE Use Case Mapper (unsafe)"
   - This is safe - it's your own app!
4. Click "Allow" to grant permissions
5. The script will continue and create `token.json`

### 8. Verify Backup Location

Check your Google Drive folder:
- URL: https://drive.google.com/drive/u/4/folders/16O82Uatw7XR2Ea1ki0khbOljIbk6qsFu
- You should see backup files named: `test-project_backup_YYYY-MM-DD_HH-MM-SS.json`

## How It Works

### Automatic Backups

Every time the SE Use Case Mapper saves to the server:
1. Data is saved to Redis/filesystem
2. **ALSO** backed up to Google Drive with timestamp
3. Backup is non-blocking (won't slow down saves)
4. Failures are logged but don't affect the main save

### Backup File Naming

Format: `{project_name}_backup_{timestamp}.json`

Example: `shared-project_backup_2025-11-13_14-30-45.json`

### Versioning

- Each save creates a NEW file (never overwrites)
- Files are timestamped
- You can restore from any previous version
- Old backups can be manually deleted if needed

## Files Created

- `credentials.json` - OAuth credentials (keep secret, in .gitignore)
- `token.json` - Access token (auto-created, in .gitignore)

## Troubleshooting

### "Credentials file not found"
- Make sure `credentials.json` is in `/Users/adam/projects/website/`
- Check the file name is exactly `credentials.json`

### "Access denied" or "Invalid grant"
- Delete `token.json` and re-authorize
- Make sure your email is added as a test user

### "Google hasn't verified this app"
- This is normal for personal projects
- Click "Advanced" → "Go to ... (unsafe)"
- Your app is safe, Google just hasn't reviewed it

### Backup fails silently
- Check server logs: `tail -f /tmp/flask.log`
- Backups are non-critical - main save still works

## API Rate Limits

Google Drive API has these limits:
- 10,000 queries per 100 seconds per user
- Each backup counts as 1 query
- With auto-save every 10 seconds, you'll use ~8,640 queries/day
- Well within limits!

## Security Notes

- `credentials.json` and `token.json` are in `.gitignore`
- Never commit these files to git
- Token expires and auto-refreshes
- Access is limited to the specific Drive folder

## For Production (Vercel)

The Google Drive backup currently only works locally. For Vercel:

**Option 1**: Service Account (recommended for production)
- Create a service account in Google Cloud
- Share the Drive folder with the service account email
- Add service account JSON to Vercel environment variables

**Option 2**: Manual token deployment
- Run locally once to generate `token.json`
- Add token as Vercel environment variable
- Note: Token may expire and need refresh

For now, the local backups provide versioning and recovery for your development workflow!
