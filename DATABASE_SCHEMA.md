# Locksmith Database Schema - Cloudflare KV

## Overview

This document defines the structure for storing all locksmith data in **Cloudflare KV** as the single source of truth.

---

## KV Namespace: `locksmith-data-prod`

### Key Naming Convention

```
{category}/{subcategory}/{id}
```

---

## Tables / Collections

### 1. Immobilizers

**Purpose**: Track immobilizer modules by car make/model/year

**Keys**:
```
immobilizers/all                  → Entire list (JSON array)
immobilizers/by-make/BMW          → BMW immobilizers only
immobilizers/by-make/Mercedes     → Mercedes immobilizers only
immobilizers/{id}                 → Single immobilizer record
```

**Schema**:
```json
{
  "id": "immobilizer-bmw-cas3",
  "make": "BMW",
  "module_or_system": "CAS3/CAS3+",
  "years": "~2006-2010",
  "models_notes": "BMW 3/5-series and related; Comfort Access CAS3+ smart keys.",
  "source": "suppliers_products.csv; cgdi_bmw_user_manual.pdf",
  "last_updated": "2025-12-06T00:00:00Z",
  "created_at": "2025-12-06T00:00:00Z"
}
```

---

### 2. Suppliers (Products)

**Purpose**: Track locksmith tools/products by supplier

**Keys**:
```
suppliers/all                      → Entire list
suppliers/by-name/{supplier_name}  → E.g., suppliers/by-name/Autel
suppliers/by-category/{category}   → E.g., suppliers/by-category/diagnostic-scanners
suppliers/{id}                     → Single supplier product
```

**Schema**:
```json
{
  "id": "supplier-autel-dp600",
  "supplier_name": "Autel",
  "product_name": "DP600",
  "category": "diagnostic-scanner",
  "description": "Professional diagnostic scanner for key programming",
  "coverage": ["BMW", "Mercedes", "Audi", "VW"],
  "immobilizer_support": ["EWS", "CAS3", "CAS4", "FEM", "BCM2"],
  "source": "suppliers_products.csv",
  "url": "https://example.com/dp600",
  "last_updated": "2025-12-06T00:00:00Z"
}
```

---

### 3. OEM Locksmith Catalog

**Purpose**: OEM parts/vehicles for key programming

**Keys**:
```
oem-catalog/all                    → Entire list
oem-catalog/by-make/{make}         → E.g., oem-catalog/by-make/Toyota
oem-catalog/{id}                   → Single OEM entry
```

**Schema**:
```json
{
  "id": "oem-toyota-h-chip",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2015,
  "key_type": "H-chip",
  "immobilizer": "4D",
  "programming_method": "OBD",
  "notes": "Common transponder key type",
  "source": "oem_locksmith_catalog.csv",
  "last_updated": "2025-12-06T00:00:00Z"
}
```

---

### 4. Vehicle Coverage Matrix

**Purpose**: Quick lookup: "What immobilizer does this car have?"

**Keys**:
```
vehicles/by-make-model/{make}/{model} → E.g., vehicles/by-make-model/BMW/3-Series
vehicles/{id}                         → Single vehicle entry
```

**Schema**:
```json
{
  "id": "vehicle-bmw-3-series-2015",
  "make": "BMW",
  "model": "3-Series",
  "year_from": 2012,
  "year_to": 2018,
  "generation": "F30",
  "immobilizer_system": "CAS4",
  "key_type": "smart-key",
  "programming_methods": ["OBD", "JTAG", "EEPROM"],
  "recommended_tools": ["CGDI BMW", "Autel DP600"],
  "source": "immobilizers.csv; suppliers_products.csv",
  "last_updated": "2025-12-06T00:00:00Z"
}
```

---

### 5. Metadata

**Purpose**: Track data sync status and versions

**Keys**:
```
metadata/last-updated          → Last sync timestamp
metadata/csv-versions         → Which CSV versions are loaded
metadata/schema-version       → Schema version (for migrations)
```

**Schema**:
```json
{
  "last_updated": "2025-12-06T14:30:00Z",
  "csv_versions": {
    "immobilizers": "v1.2",
    "suppliers_products": "v3.1",
    "oem_locksmith_catalog": "v2.0"
  },
  "record_counts": {
    "immobilizers": 45,
    "suppliers": 120,
    "oem_catalog": 1200,
    "vehicles": 500
  },
  "schema_version": "1.0"
}
```

---

## API Endpoints (Cloudflare Workers)

### Immobilizers

```
GET /api/immobilizers
  → Returns: { immobilizers: [...] }

GET /api/immobilizers?make=BMW
  → Filters by make

GET /api/immobilizers/{id}
  → Single immobilizer
```

### Suppliers

```
GET /api/suppliers
  → All suppliers

GET /api/suppliers?category=diagnostic-scanner
  → Filter by category

GET /api/suppliers/by-make/BMW
  → Tools that support BMW
```

### Vehicles

```
GET /api/vehicles/make/{make}
  → All makes

GET /api/vehicles/make/{make}/model/{model}
  → All years of this make/model

GET /api/vehicles/make/{make}/model/{model}/year/{year}
  → Specific year, returns immobilizer info
```

### Metadata

```
GET /api/metadata
  → Last updated, record counts, schema version
```

---

## Data Migration Script

### From CSV → KV

```javascript
// Example: Load immobilizers.csv into KV
import Papa from 'papaparse'; // CSV parser

async function migrateImmobilizers(csvContent) {
  const parsed = Papa.parse(csvContent, { header: true });
  
  const records = parsed.data.filter(row => row.make); // Remove empty rows
  
  for (const record of records) {
    const id = `immobilizer-${record.make.toLowerCase()}-${record.module_or_system.toLowerCase().replace(/\//g, '-')}`;
    
    await KV_NAMESPACE.put(id, JSON.stringify({
      ...record,
      id,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    }));
  }
  
  // Also store the full list
  await KV_NAMESPACE.put(
    'immobilizers/all',
    JSON.stringify(records)
  );
  
  console.log(`Migrated ${records.length} immobilizer records`);
}
```

---

## Sync Strategy

### Option A: Manual Sync (Recommended for now)
- Run CLI command to upload CSVs to KV
- Use Wrangler or custom script

### Option B: Scheduled Worker (Future)
- Cloudflare Worker triggered on schedule
- Downloads latest CSVs from GitHub
- Parses and updates KV

### Option C: GitHub Actions (Production)
- On CSV change, trigger GitHub Action
- Action calls Cloudflare API to update KV

---

## Consistency & Validation

- **TTL**: No TTL (permanent storage)
- **Versioning**: Include `last_updated` timestamp
- **Validation**: Schema validation on put
- **Fallback**: Embed data in `index.html` (current approach)

---

## Next Steps

1. Create Cloudflare Worker project (using Wrangler)
2. Define KV namespace in `wrangler.toml`
3. Write migration script (CSV → JSON → KV)
4. Create API endpoint handlers
5. Deploy Workers
6. Update `index.html` to fetch from Workers API

