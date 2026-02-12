---
description: How to process dossier images from zipped HTML exports and upload to R2 for the gallery
---

# Dossier Image Pipeline Workflow

// turbo-all

This workflow documents how images get from Google Drive dossier exports to the eurokeys.app Vehicle Intelligence system.

## Current Status (Feb 2026)
- **553 documents** tracked in `gdrive_exports/document_manifest.json`
- **479 have all 3 formats** (HTML + images + TXT), **41 HTML+TXT** (no images)
- **1,730 images** in gallery manifest, **1,443 in D1 dossier_images table**
- Images stored in R2 bucket: `euro-keys-assets`

## 🚀 FULL REFRESH PIPELINE

Run these in sequence to pull new docs, extract images, enrich context/vehicle tags, upload to R2, and update D1:

```bash
cd /Users/jeremysamuels/Documents/study-dashboard

# Step 1: Download new docs from Google Drive (as HTML+images)
python3 scripts/gdrive_download_html_zips.py

# Step 1B: Export plain-text (.txt) for all docs into their folder
python3 scripts/export_dossier_txt.py

# Step 2: Centralize images, update manifest, upload new to R2
python3 scripts/sync_gallery_images.py

# Step 3: Enrich images with context + vehicle tagging
python3 scripts/enrich_image_manifest.py

# Step 4: Populate/refresh D1 dossier_images table
python3 scripts/populate_dossier_images_d1.py

# Step 5: Deploy API (if D1 schema changed or code updated)
cd api && npx wrangler deploy && cd ..
```

---

## How to Check for New Docs

When the user asks "get the latest docs" or "sync dossier images":

1. Run the full pipeline above
2. The download script checks Google Drive for ALL locksmith docs modified in the last N days
3. Only new docs are downloaded (existing folders are skipped)
4. The document manifest at `gdrive_exports/document_manifest.json` is updated automatically

### To check what's missing without downloading:

```bash
python3 -c "
import json
m = json.load(open('gdrive_exports/document_manifest.json'))
print(f'Stats: {json.dumps(m[\"stats\"], indent=2)}')
print(f'Last check: {m[\"last_drive_check\"]}')
[print(f'  {d[\"name\"][:50]} [{d[\"status\"]}]') for d in m['documents'] if d['status'] != 'complete']
"
```

## Document Manifest

**Location:** `gdrive_exports/document_manifest.json`

Tracks every document with:
| Field | Description |
|-------|-------------|
| `name` | Human-readable document name |
| `local_dir` | Directory name in `gdrive_exports/` |
| `status` | `complete` (HTML+images), `html_only`, `txt_only`, or `empty` |
| `has_html` | Whether HTML export exists |
| `has_images` | Whether images were extracted |
| `image_count` | Number of images |
| `last_downloaded` | Timestamp of last download |
| `drive_id` | Google Drive document ID (for re-downloading) |
| `drive_modified` | Last modification time on Drive |
| `is_copy` | Whether this is a `Copy_of_` duplicate |

## Pipeline Steps Detail

### Step 1: Download from Google Drive
**Script:** `scripts/gdrive_download_html_zips.py`  
**Auth:** Uses `gdrive_token.json` (OAuth2 credentials)  
**Action:** Downloads Google Docs as zipped HTML with embedded images  
**Output:** `gdrive_exports/[DocName]/` with `.html` and `/images/` subfolder  

### Step 2: Sync Images to Gallery
**Script:** `scripts/sync_gallery_images.py`  
**Action:** Centralizes images, generates tags, uploads new images to R2  
**Output:** `gdrive_exports/image_manifest.json` and `public/data/image_gallery_manifest.json`  

### Step 3: Enrich with Context & Vehicle Tags
**Script:** `scripts/enrich_image_manifest.py`  
**Action:** Parses HTML for context (headings, captions), extracts make/model/year from folder names  
**Output:** Updates manifest with `context`, `make`, `model`, `year_start`, `year_end` fields  

### Step 4: Populate D1 Table
**Script:** `scripts/populate_dossier_images_d1.py`  
**Action:** Generates SQL and pushes to D1 `dossier_images` table  
**Output:** D1 table with indexed make/model/year for vehicle-detail API  

## Image ID Naming Convention

**Format:** `{doc_slug}_{imageN}`

- `doc_slug` = document folder name, lowercase, underscores
- `imageN` = image1, image2, etc.

## R2 Configuration

| Setting | Value |
|---------|-------|
| Bucket | `euro-keys-assets` |
| Public URL | `https://euro-keys.jeremy-samuels17.workers.dev/api/r2/{path}` |
| Image path format | `images/{doc_slug}/{imageN}.png` |

## D1 Table: `dossier_images`

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | Image ID (doc_slug_imageN) |
| `make` | TEXT | Vehicle make (required) |
| `model` | TEXT | Vehicle model (nullable) |
| `year_start` | INTEGER | Start year range |
| `year_end` | INTEGER | End year range |
| `r2_path` | TEXT | R2 object key |
| `context` | TEXT | Extracted context description |
| `source_doc` | TEXT | Source document folder |
| `tags` | TEXT | JSON array of tags |

Indexed on: `make`, `(make, model)`, `(year_start, year_end)`

## File Locations

| Purpose | Path |
|---------|------|
| GDrive download script | `scripts/gdrive_download_html_zips.py` |
| Gallery sync script | `scripts/sync_gallery_images.py` |
| Enrichment script | `scripts/enrich_image_manifest.py` |
| D1 populate script | `scripts/populate_dossier_images_d1.py` |
| TXT export script | `scripts/export_dossier_txt.py` |
| Document manifest | `gdrive_exports/document_manifest.json` |
| Image manifest | `gdrive_exports/image_manifest.json` |
| Public image manifest | `public/data/image_gallery_manifest.json` |
| Extracted HTML folders | `gdrive_exports/[DocName]/` |
| Centralized images | `gdrive_exports/images/[doc_slug]/` |
| Gallery component | `app/gallery/ImageGalleryClient.tsx` |
| OAuth token | `gdrive_token.json` |

## Manual R2 Upload (if needed)

```bash
cd api
npx wrangler r2 object put "euro-keys-assets/images/doc_slug/image1.png" \
  --file="../gdrive_exports/images/doc_slug/image1.png" \
  --content-type="image/png" --remote
```

## Deploy After Updates

```bash
cd api && npx wrangler deploy
```

Verify at: https://eurokeys.app/gallery/
