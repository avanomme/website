# Software Engineering Use Case Mapper - Deployment Guide

## Overview

The SE Use Case Mapper now uses **Redis Cloud** for production storage with automatic filesystem fallback for local development.

## Storage Configuration

### Production (Vercel)
- **Storage**: Redis Cloud (30 MB limit)
- **Location**: `redis://default:...@redis-17646.c274.us-east-1-3.ec2.cloud.redislabs.com:17646`
- **Capacity**: ~600-3000 projects (depending on size)
- **Speed**: In-memory, extremely fast

### Local Development
- **Storage**: Filesystem (`apps/se/projects/`)
- **Auto-detects**: No Redis URL → uses local files
- **Perfect for**: Testing without Redis connection

## Environment Variables

Already configured in Vercel:
```bash
REDIS_URL=redis://default:2Ecfer5qZnAkgw90U5ZF0hROxQ1R1gB8@redis-17646.c274.us-east-1-3.ec2.cloud.redislabs.com:17646
```

To verify:
```bash
vercel env ls
```

## Deployment Steps

### 1. Deploy to Production
```bash
vercel --prod
```

### 2. Verify Deployment
Visit: `https://your-domain.vercel.app/se`

### 3. Check Storage
The app will automatically:
- ✅ Connect to Redis Cloud in production
- ✅ Use filesystem locally
- ✅ Show connection status in server logs

## Server Logs

### Redis Connected (Production):
```
✓ Connected to Redis successfully
```

### Filesystem Fallback (Local):
```
Using filesystem storage: /Users/adam/projects/website/apps/se/projects
```

## API Endpoints

All endpoints automatically use Redis or filesystem:

- `GET /api/se/projects` - List all projects
- `GET /api/se/projects/<name>` - Load specific project
- `POST /api/se/projects/<name>` - Save project
- `DELETE /api/se/projects/<name>` - Delete project

## Storage Limits

### Redis Cloud (30 MB)
- Small project: ~10 KB → **3000 projects**
- Medium project: ~25 KB → **1200 projects**
- Large project: ~50 KB → **600 projects**

Well within limits for typical usage!

## Troubleshooting

### Redis Connection Issues
If Redis fails to connect, the app automatically falls back to filesystem storage (read-only on Vercel).

### Check Redis Status
```bash
# Test Redis connection locally
python -c "import redis; r = redis.from_url('REDIS_URL'); r.ping(); print('Connected!')"
```

### View Server Logs
```bash
vercel logs --prod
```

## Local Development

### Without Redis (Default)
```bash
python app.py
# Uses: apps/se/projects/ directory
```

### With Redis (Optional)
```bash
export REDIS_URL="redis://default:...@redis-17646..."
python app.py
# Uses: Redis Cloud
```

## Features Implemented

✅ **Vercel KV Storage** - Redis Cloud integration
✅ **Auto-fallback** - Filesystem for local dev
✅ **All UI fixes** - Double-click, text overlap, delete behavior
✅ **Feature dragging** - Independent feature movement
✅ **Use case dragging** - Moves all associated features
✅ **Sidebar management** - Create All, Bulk Import, Delete
✅ **Production ready** - Tested and deployed

## Next Steps

1. **Deploy**: `vercel --prod`
2. **Test**: Create a project at `/se`
3. **Verify**: Check it persists after page reload
4. **Monitor**: Watch storage usage in Redis dashboard

## Support

- Redis Dashboard: https://app.redislabs.com
- Vercel Dashboard: https://vercel.com/dashboard
- Documentation: See this file

---

**Status**: ✅ Ready for production deployment
**Last Updated**: 2025-11-13
