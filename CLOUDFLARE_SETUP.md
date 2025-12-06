# Cloudflare Setup for study-dashboard

## Current Architecture
- **Frontend**: Vercel (index.html + static assets)
- **Backend API**: Cloudflare Workers (temporary) → will move to be single source of truth
- **Database**: CSV files → will migrate to Cloudflare KV storage (distributed cache)

---

## Phase 1: Local Development (Current)

### 1. Create a New Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Choose **"Custom token"**
4. Set these permissions:
   - **Account Resources**: Account > Workers Namespace > Edit
   - **Account Resources**: Account > Workers KV > Edit
   - **Zone Resources**: Include > Specific zone > (select your zone if needed)

5. Copy the token and add to `.env.local`:

```bash
# Edit .env.local and replace YOUR_NEW_TOKEN_HERE with your actual token
CLOUDFLARE_API_TOKEN=your-actual-token-here
CLOUDFLARE_ACCOUNT_ID=3ac1a6fafce90adf6b1c8f1280dfc94d
```

### 2. Verify Token Works

```bash
# Load from .env.local
export $(cat .env.local | xargs)

# Verify token
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify
```

Expected response:
```json
{
  "success": true,
  "result": {
    "id": "...",
    "status": "active",
    ...
  }
}
```

---

## Phase 2: Database Structure (Design)

### Current CSVs → Cloudflare KV

The goal is to establish **one source of truth** for all locksmith data:

```
KV Namespace: locksmith-data-prod

Keys structure:
├── immobilizers/all          → Full immobilizer list
├── immobilizers/by-make/{make}  → E.g., immobilizers/by-make/BMW
├── suppliers/all             → Full supplier list
├── suppliers/by-product/{type} → E.g., suppliers/by-product/diagnostic-scanners
├── oem-catalog/all           → OEM locksmith catalog
└── metadata/last-updated     → Timestamp of last sync
```

### Data Format (JSON)

Instead of CSV, store as JSON in KV for easier querying:

```json
{
  "make": "BMW",
  "module_or_system": "CAS3/CAS3+",
  "years": "~2006-2010",
  "models_notes": "BMW 3/5-series and related; Comfort Access CAS3+ smart keys.",
  "source": "suppliers_products.csv; cgdi_bmw_user_manual.pdf"
}
```

---

## Phase 3: API Endpoints (Temporary Local)

### Current Vercel + Local CSV approach

**Update**: Once Cloudflare Workers are ready, these endpoints will move:

```
GET /api/immobilizers              → All immobilizers
GET /api/immobilizers?make=BMW     → Filter by make
GET /api/suppliers                 → All suppliers
GET /api/oem-catalog              → OEM catalog
```

---

## Phase 4: Migration Plan

### Step 1: Create Cloudflare Worker (API)
- Set up Workers KV namespace
- Write API endpoints that serve from KV
- Add CSV → JSON sync function

### Step 2: Populate KV from CSVs
- Parse `data/immobilizers.csv`
- Parse `data/suppliers_products.csv`
- Parse `data/oem_locksmith_catalog.csv`
- Store as JSON in KV

### Step 3: Update Frontend
- Point `index.html` to Cloudflare Worker API instead of local CSVs
- Keep fallback embedded data for offline

### Step 4: Sync Process
- Create a scheduled Worker that syncs CSV → KV periodically
- Or manual sync script using this CLI

---

## Security Checklist

- ✅ `.env.local` in `.gitignore` (never commit)
- ✅ Token has minimal scopes (Workers KV + Edit only)
- ✅ Never share token in chat/docs again
- ✅ Rotate token if exposed
- ✅ Set `CLOUDFLARE_API_TOKEN` as Vercel env var (encrypted)

---

## Next Steps

1. **Create new Cloudflare token** (after revoking the exposed one)
2. **Update `.env.local`** with new token
3. **Verify token** works with curl
4. **Design KV schema** (JSON format)
5. **Build Workers API** to serve data from KV
6. **Migrate CSVs** to KV
7. **Update frontend** to fetch from Workers

---

## Files to Update

- `.env.local` ← Store token here (already ignored in git)
- `package.json` ← Add Cloudflare CLI scripts
- `api/` ← Create new Worker scripts here
- `index.html` ← Update API endpoints

---

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [KV Namespace API](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (for local development)
