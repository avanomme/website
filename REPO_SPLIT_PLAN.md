# Monorepo Split Plan

## Current Problem
- 13GB monorepo (4.6GB git history)
- Vercel deployment pushback/timeouts
- 5 apps with varying sizes crammed together

## Current Structure
```
website/ (13GB total)
├── apps/
│   ├── flashcards/  (3.7GB - audio cache, models)
│   ├── player/      (16MB - sheet music)
│   ├── museplay/    (18MB - under development)
│   ├── dfa/         (344KB - graph viz)
│   └── se/          (220KB - use case mapper)
├── app.py           (Flask backend)
├── api/             (serverless functions)
└── .git/            (4.6GB history)
```

## Recommended Split: 3 Repos

### Repo 1: `flashcards-app` (NEW)
**Contents:**
- `apps/flashcards/*`
- `api/cards.py`
- `api/log.py`

**Deploy size:** ~5MB (audio on Vercel Blob)
**Type:** Static + Serverless API

### Repo 2: `player-app` (NEW)
**Contents:**
- `apps/player/*`

**Deploy size:** ~16MB
**Type:** Pure static (no backend)

### Repo 3: `website` (KEEP, slimmed down)
**Contents:**
- `app.py` (Flask)
- `apps/dfa/`
- `apps/se/`
- `apps/museplay/`

**Deploy size:** ~50MB
**Type:** Flask + static

---

## How It Works: Vercel Rewrites

All apps stay under ONE domain using Vercel rewrites:

```
your-site.com/flashcards/*  →  flashcards-app.vercel.app/*
your-site.com/study/*       →  flashcards-app.vercel.app/*
your-site.com/grinch/*      →  player-app.vercel.app/*
your-site.com/music/player  →  player-app.vercel.app/*
your-site.com/dfa/*         →  (served from main repo)
your-site.com/se/*          →  (served from main repo)
```

Users see one domain. Vercel proxies to the right project invisibly.

---

## Migration Steps

### Step 1: Create Flashcards Repo
```bash
gh repo create avanomme/flashcards-app --private
cd ~/projects
mkdir flashcards-app && cd flashcards-app
git init

# Copy files
cp -r ~/projects/website/apps/flashcards/* .
mkdir api
cp ~/projects/website/api/cards.py api/
cp ~/projects/website/api/log.py api/
```

Create `vercel.json`:
```json
{
  "builds": [
    { "src": "api/*.py", "use": "@vercel/python" },
    { "src": "**/*", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1.py" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

### Step 2: Create Player Repo
```bash
gh repo create avanomme/player-app --private
cd ~/projects
mkdir player-app && cd player-app
git init

# Copy files
cp -r ~/projects/website/apps/player/* .
```

Create `vercel.json`:
```json
{
  "builds": [
    { "src": "**/*", "use": "@vercel/static" }
  ]
}
```

### Step 3: Deploy New Repos to Vercel
```bash
cd ~/projects/flashcards-app
vercel --prod

cd ~/projects/player-app
vercel --prod
```

### Step 4: Update Main Repo with Rewrites

Edit `website/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    { "src": "app.py", "use": "@vercel/python" },
    { "src": "apps/**/*", "use": "@vercel/static" }
  ],
  "rewrites": [
    { "source": "/flashcards/:path*", "destination": "https://flashcards-app.vercel.app/:path*" },
    { "source": "/flashcards", "destination": "https://flashcards-app.vercel.app/" },
    { "source": "/study/:path*", "destination": "https://flashcards-app.vercel.app/:path*" },
    { "source": "/grinch/:path*", "destination": "https://player-app.vercel.app/:path*" },
    { "source": "/music/player/:path*", "destination": "https://player-app.vercel.app/:path*" }
  ],
  "routes": [
    { "src": "/dfa(.*)", "dest": "/app.py" },
    { "src": "/se(.*)", "dest": "/apps/se/$1" },
    { "src": "/api/se/(.*)", "dest": "/app.py" },
    { "src": "/mplay(.*)", "dest": "/apps/museplay/public/$1" },
    { "src": "/(.*)", "dest": "/app.py" }
  ]
}
```

### Step 5: Remove Migrated Apps from Main Repo
```bash
cd ~/projects/website
rm -rf apps/flashcards
rm -rf apps/player
rm api/cards.py
rm api/log.py
git add -A
git commit -m "Remove flashcards and player (migrated to separate repos)"
```

### Step 6: Clean Git History (Optional)
```bash
# Install git-filter-repo
brew install git-filter-repo

# Remove flashcards from history
git filter-repo --path apps/flashcards --invert-paths --force

# This requires force push - be careful!
git push --force
```

---

## Local Development After Split

```bash
# Terminal 1: Flashcards
cd ~/projects/flashcards-app
python -m http.server 8001
# Access at http://localhost:8001

# Terminal 2: Player
cd ~/projects/player-app
python -m http.server 8002
# Access at http://localhost:8002

# Terminal 3: Main site
cd ~/projects/website
python app.py
# Access at http://localhost:5001
```

---

## Benefits

| Metric | Before | After |
|--------|--------|-------|
| Main repo | 13GB | ~500MB |
| Deploy size | 300MB+ | <50MB each |
| Deploy time | Timeouts | <30s |
| CI/CD | All or nothing | Independent |

---

## Apps That Need Flask Backend

| App | Needs Flask? | Why |
|-----|--------------|-----|
| flashcards | No | Static + serverless API |
| player | No | Pure static |
| dfa | Yes | graphviz/dot2tex processing |
| se | Yes | Redis for presence tracking |
| museplay | Yes | MuseScore CLI conversion |

---

## Vercel Project Setup

1. **flashcards-app** - Link to `avanomme/flashcards-app`
2. **player-app** - Link to `avanomme/player-app`
3. **website** (existing) - Keep linked to `avanomme/website`

All three can use the same custom domain via rewrites from the main project.
