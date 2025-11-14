#!/bin/bash
# Prepare audio cache for upload to CDN/static hosting
# Creates a compressed archive ready for deployment

set -e

CACHE_DIR="audio_cache"
OUTPUT_FILE="audio_cache.tar.gz"

echo "=================================================="
echo "  Preparing Audio Cache for Upload"
echo "=================================================="
echo ""

# Check if cache exists
if [ ! -d "$CACHE_DIR" ]; then
    echo "✗ Error: $CACHE_DIR not found"
    echo "Run ./precompile_all_voices.py first"
    exit 1
fi

# Count files and calculate size
echo "Analyzing cache..."
TOTAL_FILES=$(find "$CACHE_DIR" -name "*.wav" | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$CACHE_DIR" | cut -f1)
VOICE_COUNT=$(find "$CACHE_DIR" -type d -depth 1 | wc -l | tr -d ' ')

echo "✓ Found:"
echo "  - $VOICE_COUNT voices"
echo "  - $TOTAL_FILES audio files"
echo "  - $TOTAL_SIZE total size"
echo ""

# Create compressed archive
echo "Creating compressed archive..."
tar -czf "$OUTPUT_FILE" "$CACHE_DIR"
ARCHIVE_SIZE=$(du -sh "$OUTPUT_FILE" | cut -f1)

echo "✓ Created $OUTPUT_FILE ($ARCHIVE_SIZE)"
echo ""

# Create upload instructions
cat > UPLOAD_INSTRUCTIONS.md << 'EOF'
# Audio Cache Upload Instructions

## What to Upload

Upload the `audio_cache/` directory to your static hosting or CDN.

## Recommended Hosting Options

### Option 1: Vercel Static Files
1. Add `audio_cache/` to your repository
2. Update `.vercelignore` to NOT exclude `audio_cache/`
3. Vercel will automatically serve files from this directory
4. Access via: `https://yourdomain.com/flashcards/audio_cache/`

### Option 2: GitHub Pages
1. Create a new repository: `flashcards-audio-cache`
2. Upload the `audio_cache/` directory
3. Enable GitHub Pages in settings
4. Access via: `https://yourusername.github.io/flashcards-audio-cache/`

### Option 3: AWS S3 + CloudFront
```bash
# Install AWS CLI
aws configure

# Upload to S3
aws s3 sync audio_cache/ s3://your-bucket-name/flashcards/audio_cache/ \
  --acl public-read \
  --cache-control max-age=31536000

# Set up CloudFront distribution
# Access via: https://your-cloudfront-domain/flashcards/audio_cache/
```

### Option 4: Netlify
1. Drag and drop `audio_cache/` to Netlify
2. Get the URL: `https://your-site.netlify.app/`
3. Access via: `https://your-site.netlify.app/audio_cache/`

## Update app.js

After uploading, update the `audioCacheDir` in `app.js`:

```javascript
// Change this line (around line 30):
audioCacheDir: 'audio_cache',  // Local path

// To:
audioCacheDir: 'https://your-cdn-domain.com/flashcards/audio_cache',  // CDN path
```

## File Structure

```
audio_cache/
├── gracie_wise/
│   ├── 1.1_q.wav
│   ├── 1.1_a.wav
│   └── ...
├── claribel_dervla/
│   ├── 1.1_q.wav
│   └── ...
└── [52 voice directories total]
```

## CORS Configuration

If hosting on a different domain, ensure CORS headers are set:

### S3 CORS Policy
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### Netlify _headers file
```
/audio_cache/*
  Access-Control-Allow-Origin: *
```

## Cache Control

Set aggressive caching since audio files don't change:
- `Cache-Control: public, max-age=31536000` (1 year)

## Size Optimization

Total cache size: ~XXX MB
Individual voice directories: ~XXX MB each

Consider:
1. Upload all voices for complete coverage
2. Or upload only popular voices initially
3. Lazy-load additional voices on demand
EOF

echo "=================================================="
echo "  ✓ Upload Preparation Complete"
echo "=================================================="
echo ""
echo "Created files:"
echo "  - $OUTPUT_FILE (compressed archive)"
echo "  - UPLOAD_INSTRUCTIONS.md (deployment guide)"
echo ""
echo "Next steps:"
echo "  1. Review UPLOAD_INSTRUCTIONS.md"
echo "  2. Choose a hosting option"
echo "  3. Upload audio_cache/ directory"
echo "  4. Update audioCacheDir in app.js"
echo ""
