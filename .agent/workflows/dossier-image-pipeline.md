---
description: How to process dossier images from zipped HTML exports and upload to R2 for the gallery
---

# Dossier Image Pipeline Workflow

// turbo-all

This workflow documents how images get from Google Drive dossier exports to the eurokeys.app/gallery/.

## Current Status
- **805 unique images** from **245 source documents**
- Images stored in R2 bucket: `euro-keys-assets`
- Naming convention: `{doc_slug}_{imageN}` (e.g., `audi_a3_8y_locksmithing_challenges_image1`)

## 🚀 ONE-COMMAND AUTO-UPDATE

Run this to pull ALL new docs from Google Drive, extract images, update manifest, and upload to R2:

```bash
cd /Users/jeremysamuels/Documents/study-dashboard && \
python3 scripts/gdrive_download_html_zips.py && \
python3 scripts/sync_gallery_images.py
```

---

## Pipeline Overview

```
Google Drive → gdrive_download_html_zips.py → Extract images → Tag → Upload to R2 → Gallery
```

## Step 1: Pull New Research Docs from Google Drive

```bash
cd /Users/jeremysamuels/Documents/study-dashboard
python3 scripts/gdrive_download_html_zips.py
# This will:
# - Connect to Google Drive (using gdrive_token.json)
# - Search for locksmith-related docs
# - Download new docs as zipped HTML with images
# - Extract to gdrive_exports/[DocName]/ folders
```

## Step 2: Sync Images to Gallery (Auto-Extract + Upload)

```bash
python3 scripts/sync_gallery_images.py
# This will:
# - Find all doc folders with /images/ subfolders
# - Centralize images to gdrive_exports/images/[doc_slug]/
# - Auto-generate tags from folder names (Make, Year, Topic)
# - Update manifest with new entries (deduped by ID)
# - Copy manifest to public/data/
# - Upload new images to R2
```

## Image ID Naming Convention

**Format:** `{doc_slug}_{imageN}`

- `doc_slug` = document folder name, lowercase, underscores
- `imageN` = image1, image2, etc.

**Examples:**
- `audi_q7_4m_key_programming_research_image1`
- `ford_f150_locksmith_intelligence_dossier_image3`
- `vw_mqb_key_programming_dossier_image2`

This consistent naming enables:
- ✅ Duplicate detection (same ID = skip)
- ✅ Incremental sync (only upload new images)
- ✅ Easy tag association from folder name

## R2 Configuration

| Setting | Value |
|---------|-------|
| Bucket | `euro-keys-assets` |
| Endpoint | `https://3ac1a6fafce90adf6b1c8f1280dfc94d.r2.cloudflarestorage.com` |
| Public URL | `https://euro-keys.jeremy-samuels17.workers.dev/api/r2/{path}` |
| Image path format | `images/{doc_slug}/{imageN}.png` |

## Auto-Generated Tags

Tags are extracted from folder names:

**Makes:** Acura, Audi, Bmw, Cadillac, Chevrolet, Dodge, Ford, Genesis, Gmc, Honda, Hyundai, Infiniti, Jaguar, Jeep, Kia, Lexus, Lincoln, Mazda, Mercedes, Nissan, Porsche, Ram, Stellantis, Subaru, Tesla, Toyota, Volvo, Vw

**Topics:** AKL, BCM, CAN-FD, Chip, EEPROM, FBS, Immobilizer, MLB, MQB, PATS, Programming, Security, SGW, Smart Key

**Years:** 2014-2026 (auto-detected from folder name)

## File Locations

| Purpose | Path |
|---------|------|
| GDrive download script | `scripts/gdrive_download_html_zips.py` |
| Gallery sync script | `scripts/sync_gallery_images.py` |
| Extracted HTML folders | `gdrive_exports/[DocName]/` |
| Centralized images | `gdrive_exports/images/[doc_slug]/` |
| Source manifest | `gdrive_exports/image_manifest.json` |
| Public manifest | `public/data/image_gallery_manifest.json` |
| Gallery component | `app/gallery/ImageGalleryClient.tsx` |

## Manual R2 Upload (if needed)

```bash
cd api
npx wrangler r2 object put "euro-keys-assets/images/doc_slug/image1.png" \
  --file="../gdrive_exports/images/doc_slug/image1.png" \
  --content-type="image/png" --remote
```

## Deploy After Updates

```bash
npm run build && npx wrangler pages deploy
```

Then verify at: https://eurokeys.app/gallery/
