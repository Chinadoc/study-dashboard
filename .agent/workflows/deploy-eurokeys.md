---
description: Deploy EuroKeys updates to production (Cloudflare D1 and Pages)
---

# EuroKeys Deployment Workflow

## Project Info
- **Production Site**: eurokeys.app
- **Cloudflare Pages Project**: study-dashboard (NOT eurokeys)
- **Repo**: Chinadoc/study-dashboard
- **Database**: `locksmith-db` (Cloudflare D1)
- **API Worker**: euro-keys.jeremy-samuels17.workers.dev

> [!IMPORTANT]
> eurokeys.app uses automatic git deployments from Chinadoc/study-dashboard.
> Do NOT use `wrangler pages deploy` to eurokeys project - that's a different site!

## Deploy Frontend Changes

// turbo-all

1. Sync files to dist/:
```bash
rsync -av --delete js/ dist/js/ && rsync -av --delete css/ dist/css/
```

2. Git commit and push:
```bash
git add -A && git commit -m "chore: deploy update" && git push origin main
```

Cloudflare will automatically build and deploy to eurokeys.app.

## Deploy Database Migrations

Run SQL migrations against the production D1 database:

```bash
npx wrangler d1 execute locksmith-db --remote --file=data/migrations/<migration_file>.sql
```

## Key File Locations
- `js/browse.js` - Main browse functionality (5000+ lines)
- `js/modern-browse.js` - Search UI component
- `data/migrations/` - All SQL migrations
