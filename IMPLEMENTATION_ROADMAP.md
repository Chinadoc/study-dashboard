# Implementation Roadmap: From Local CSVs to Cloudflare KV

## Timeline: Phase 1 → Production

---

## Phase 1: Setup & Verification (TODAY)

### 1.1 Revoke Exposed Token
- [ ] Go to https://dash.cloudflare.com/profile/api-tokens
- [ ] Delete the exposed token (`b4GKKmwYlCGlSCSsQLC7safqIgYo4sj7cddBttwQ`)
- [ ] Confirm deletion

### 1.2 Create New Token with Minimal Scopes
- [ ] Go to https://dash.cloudflare.com/profile/api-tokens
- [ ] Click "Create Token"
- [ ] Select "Custom token"
- [ ] Permissions:
  - Account > Workers Namespace > Edit
  - Account > Workers KV > Edit
  - Account > Workers Routes > Edit (optional)
- [ ] No zone-level permissions needed yet
- [ ] Copy token immediately

### 1.3 Store Token Securely
- [ ] Update `.env.local`:
  ```
  CLOUDFLARE_API_TOKEN=<your-new-token>
  CLOUDFLARE_ACCOUNT_ID=3ac1a6fafce90adf6b1c8f1280dfc94d
  ```
- [ ] **NEVER** share this file or commit it

### 1.4 Verify Token Works
```bash
export $(cat .env.local | xargs)
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify
```
- [ ] Should return `"success": true`

---

## Phase 2: Local Development Setup (Days 1-2)

### 2.1 Install Wrangler CLI
```bash
npm install -g @cloudflare/wrangler
# or
brew install wrangler
```

### 2.2 Create Wrangler Project
```bash
cd /Users/jeremysamuels/Documents/study-dashboard
wrangler init api
```

This creates:
```
api/
├── src/
│   └── index.js          ← Main Worker code
├── wrangler.toml         ← Configuration
└── package.json
```

### 2.3 Configure wrangler.toml
```toml
name = "locksmith-api"
main = "src/index.js"
compatibility_date = "2025-01-01"

[[kv_namespaces]]
binding = "LOCKSMITH_KV"
id = "YOUR_KV_ID"
preview_id = "YOUR_KV_PREVIEW_ID"

[env.production]
name = "locksmith-api-prod"
routes = [
  { pattern = "api.eurokeys.dev/api/*", zone_name = "eurokeys.dev" }
]
```

### 2.4 Write Basic Worker API
```javascript
// api/src/index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/immobilizers') {
      const data = await env.LOCKSMITH_KV.get('immobilizers/all');
      return new Response(data || '[]', {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};
```

### 2.5 Test Locally
```bash
cd api
wrangler dev
# Opens http://localhost:8787
# Test: http://localhost:8787/api/immobilizers
```

---

## Phase 3: Migrate CSVs to KV (Days 2-3)

### 3.1 Create Migration Script
Create `scripts/migrate-to-kv.js`:

```javascript
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

// Initialize Cloudflare API
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

async function uploadToKV(key, value) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${key}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(value)
    }
  );

  if (!response.ok) {
    throw new Error(`KV upload failed: ${response.statusText}`);
  }

  return response.json();
}

async function migrateImmobilizers() {
  console.log('📦 Migrating immobilizers.csv...');
  
  const csvPath = path.join(process.cwd(), 'data/immobilizers.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true
  });

  for (const record of records) {
    const id = `immobilizer-${record.make.toLowerCase()}-${record.module_or_system.toLowerCase().replace(/[\s\/]+/g, '-')}`;
    
    await uploadToKV(id, {
      ...record,
      id,
      last_updated: new Date().toISOString()
    });
    
    console.log(`✅ Uploaded: ${id}`);
  }

  // Upload full list
  await uploadToKV('immobilizers/all', records);
  console.log(`✅ Uploaded full immobilizer list (${records.length} records)`);
}

async function migrateSuppliers() {
  console.log('📦 Migrating suppliers_products.csv...');
  // Similar pattern...
}

async function main() {
  try {
    await migrateImmobilizers();
    await migrateSuppliers();
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
```

### 3.2 Add to package.json
```json
"scripts": {
  "migrate:kv": "node scripts/migrate-to-kv.js"
}
```

### 3.3 Create KV Namespace
```bash
# Create namespace
wrangler kv:namespace create "locksmith-data"

# Output will show:
# [[kv_namespaces]]
# binding = "LOCKSMITH_KV"
# id = "abc123..."
# preview_id = "def456..."

# Add this to wrangler.toml
```

### 3.4 Run Migration
```bash
npm run migrate:kv
```

---

## Phase 4: Deploy Workers (Days 3-4)

### 4.1 Deploy to Cloudflare
```bash
cd api
wrangler publish
```

### 4.2 Get Worker URL
```bash
# Workers are deployed to: https://locksmith-api.<your-account>.workers.dev
```

### 4.3 Test Production
```bash
curl https://locksmith-api.<your-account>.workers.dev/api/immobilizers
```

---

## Phase 5: Update Frontend (Days 4-5)

### 5.1 Update API Endpoint in index.html

Change from local CSV:
```javascript
const IMMOBILIZER_CSV_URL = './data/immobilizers.csv';
```

To Workers API:
```javascript
const IMMOBILIZER_API_URL = 'https://locksmith-api.<your-account>.workers.dev/api/immobilizers';
```

### 5.2 Update loadImmobilizerList()
```javascript
async function loadImmobilizerList(forceRefresh = false) {
  if (!forceRefresh && IMMOBILIZER_DATA && IMMOBILIZER_DATA.length > 0) {
    renderImmobilizerTable();
    return;
  }

  try {
    // Try to load from API
    const response = await fetch(IMMOBILIZER_API_URL);
    if (response.ok) {
      IMMOBILIZER_DATA = await response.json();
      renderImmobilizerTable();
    }
  } catch (error) {
    console.warn('API fetch failed, using embedded data:', error);
    IMMOBILIZER_DATA = IMMOBILIZER_EMBED; // Fallback
    renderImmobilizerTable();
  }
}
```

### 5.3 Deploy to Vercel
```bash
git add .
git commit -m "chore: switch to Cloudflare Workers API for immobilizers"
git push
```

---

## Phase 6: Setup CORS & Domain (Days 5-6)

### 6.1 Add CORS Headers to Worker
```javascript
// api/src/index.js
export default {
  async fetch(request, env) {
    const response = new Response('...', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
      }
    });

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: response.headers });
    }

    return response;
  }
};
```

### 6.2 Map Custom Domain (Optional)
```bash
wrangler publish --env production
```

---

## Phase 7: Monitoring & Optimization (Days 6+)

### 7.1 Add Analytics
- Monitor API requests in Cloudflare Dashboard
- Set up alerts for failures

### 7.2 Cache Strategy
- Use KV with TTL for frequently accessed data
- Update on schedule or on-demand

### 7.3 Add Admin Endpoint
```
POST /api/admin/migrate
  → Re-upload CSVs to KV
  (Requires authentication)
```

---

## Checklist

- [ ] **Phase 1**: Token secured, verified
- [ ] **Phase 2**: Wrangler installed, Worker project created, local tests pass
- [ ] **Phase 3**: KV namespace created, migration script written, data uploaded
- [ ] **Phase 4**: Worker deployed, API endpoints accessible
- [ ] **Phase 5**: Frontend updated, pointing to Workers API
- [ ] **Phase 6**: CORS headers working, Vercel deployment successful
- [ ] **Phase 7**: Monitoring in place, all systems stable

---

## Commands Quick Reference

```bash
# Setup
export $(cat .env.local | xargs)
npm install -g @cloudflare/wrangler
wrangler init api

# Development
cd api
wrangler dev

# KV Management
wrangler kv:namespace create "locksmith-data"
npm run migrate:kv

# Deploy
wrangler publish
```

---

## Files Created/Modified

- ✅ `.env.local` (created)
- ✅ `CLOUDFLARE_SETUP.md` (created)
- ✅ `DATABASE_SCHEMA.md` (created)
- ⏳ `api/wrangler.toml` (to create)
- ⏳ `api/src/index.js` (to create)
- ⏳ `scripts/migrate-to-kv.js` (to create)
- ⏳ `index.html` (to update)

---

## Support

For issues:
1. Check Cloudflare Dashboard > Workers > Logs
2. Run `wrangler tail` for real-time logs
3. Verify KV namespace has data: `wrangler kv:key list`

