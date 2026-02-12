---
description: How AKS data flows from scrape → junction → vehicle detail API
---

# AKS Data Flow

## Overview
AKS (American Key Supply) data feeds into the vehicle detail pages through a multi-step pipeline. Understanding this flow is critical for debugging data contamination issues.

## Source Tables

### 1. `aks_vehicles` (raw scraped vehicle pages)
- Source: AKS vehicle pages (e.g., americankeysupply.com/vehicles/7623)
- Contains: make/model with **year ranges** (e.g., "Chevrolet Blazer 2019-2024")
- Has: lishi tool, transponder key, mechanical key, chip type, product lists
- **Problem**: Year ranges cover the entire model nameplate; does NOT distinguish generations

### 2. `aks_vehicles_by_year` (exploded per-year view)
- Source: Derived from `aks_vehicles` — one row per make/model/year
- Contains: `product_item_ids` (JSON array of item IDs listed on that vehicle page)
- **Problem**: Inherits the year-range issue — ALL products on the 2019-2024 Blazer page get linked to EVERY year including 2020, even if the product says "2021-2025"

### 3. `aks_products_complete` (product detail)
- Source: AKS product pages with full specs
- Contains: title, product_type, buttons, button_count, fcc_id, oem_part_numbers, chip, keyway, frequency, battery, reusable, cloneable, image
- Has a `compatible_vehicles` field listing which vehicles the product works with
- This is the **most detailed** source for per-product data

### 4. `aks_vehicle_products` (junction table)
- Source: Built by `data/scripts/rebuild_junction_from_vehicle_pages.py`
- Input: `data/scraped_sources/american_key_supply_v2/vehicles_products.json`
- Maps: (make, model, year) → product_page_id
- **Current problem**: Does NOT filter products by their title year ranges
  - AKS Blazer page covers 2019-2024 and lists 40 products
  - Script creates junction entries for ALL 40 products × ALL years (2019-2024)
  - Result: HYQ4ES (2021+) products get linked to 2019 and 2020

## Intended Logic (per user)

The junction should be the **UNION** of:

1. **Products from `aks_vehicles_by_year`** — filtered by year ranges in their titles
   - If a product title says "2021-2025", it should only appear for years 2021-2025
   - Even though AKS's vehicle page lists it for the entire 2019-2024 range

2. **+ Supplemental products from `aks_products_complete`** — via `compatible_vehicles`
   - Some products list specific vehicles in their compatible_vehicles field
   - These might not appear on the vehicle page but ARE valid for that year
   - Example: aftermarket Xhorse keys that list "2020 Chevrolet Blazer" as compatible

## API Year Filtering (safety net)

The API endpoint (`api/src/index.ts`, line 13178-13189) has a client-side year-title filter:
```
const m = title.match(/\b(20\d{2})\s*[-–]\s*(20\d{2})\b/);
```
**Known gaps**:
- Single-year titles like "Blazer 2021 3-Btn" — no range to parse, so kept
- Abbreviated ranges like "2021-25" — regex expects 4-digit years, misses it
- The `if (!m) return true` fallback is too conservative — keeps products even when they clearly don't match

## OEM Part Number Structure

Multiple OEM part numbers for the same key exist because:
1. **GM Supersession chains** — GM replaces part numbers on updates (13519177 → 13529639 → 13591384)
2. **STRATTEC vs GM** — STRATTEC manufactures GM keys with their own numbering (5944131 = 13529639)
3. **Logo/branding variants** — Different GM logos on identical hardware (Chevy vs GMC vs GM)

This data is NOT stored in the database — it comes from general automotive industry knowledge. Could be enriched by parsing the OEM fields in `aks_products_complete`.
