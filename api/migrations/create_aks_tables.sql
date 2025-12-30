-- AKS Data Import Schema Migration
-- Generated: 2025-12-29
-- 
-- Creates:
-- 1. aks_products table for product-specific data
-- 2. fcc_cross_reference table for FCC ID lookups
-- 3. Indexes for efficient querying

-- ============================================
-- Table: aks_products
-- Product-centric data with FCC IDs, chips, etc.
-- ============================================

CREATE TABLE IF NOT EXISTS aks_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_num TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    model_num TEXT,
    ez_num TEXT,
    price TEXT,
    
    -- Key Specifications
    fcc_id TEXT,
    ic TEXT,
    chip TEXT,
    frequency TEXT,
    battery TEXT,
    keyway TEXT,
    buttons TEXT,
    button_count INTEGER,
    
    -- OEM/Cross-Reference (JSON array)
    oem_part_numbers TEXT,
    condition TEXT,
    
    -- Vehicle Compatibility (JSON array)
    compatible_vehicles TEXT,
    
    -- Metadata
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_aks_products_fcc ON aks_products(fcc_id);
CREATE INDEX IF NOT EXISTS idx_aks_products_chip ON aks_products(chip);
CREATE INDEX IF NOT EXISTS idx_aks_products_keyway ON aks_products(keyway);
CREATE INDEX IF NOT EXISTS idx_aks_products_frequency ON aks_products(frequency);
CREATE INDEX IF NOT EXISTS idx_aks_products_battery ON aks_products(battery);


-- ============================================
-- Table: fcc_cross_reference
-- Maps FCC IDs to specific vehicles
-- ============================================

CREATE TABLE IF NOT EXISTS fcc_cross_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fcc_id TEXT NOT NULL,
    make TEXT,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    product_item_num TEXT,
    chip TEXT,
    frequency TEXT,
    battery TEXT,
    
    UNIQUE(fcc_id, make, model, year_start)
);

-- Indexes for FCC lookups
CREATE INDEX IF NOT EXISTS idx_fcc_xref_fcc ON fcc_cross_reference(fcc_id);
CREATE INDEX IF NOT EXISTS idx_fcc_xref_make_model ON fcc_cross_reference(make, model);
CREATE INDEX IF NOT EXISTS idx_fcc_xref_years ON fcc_cross_reference(year_start, year_end);


-- ============================================
-- Add new columns to vehicles table for enrichment
-- (These should be run via ALTER TABLE)
-- ============================================

-- Note: D1 requires individual ALTER TABLE statements
-- Run these separately if columns don't exist

-- ALTER TABLE vehicles ADD COLUMN aks_id TEXT;
-- ALTER TABLE vehicles ADD COLUMN code_series TEXT;
-- ALTER TABLE vehicles ADD COLUMN lishi TEXT;
-- ALTER TABLE vehicles ADD COLUMN spaces INTEGER;
-- ALTER TABLE vehicles ADD COLUMN depths INTEGER;
-- ALTER TABLE vehicles ADD COLUMN macs INTEGER;
-- ALTER TABLE vehicles ADD COLUMN mechanical_key TEXT;
-- ALTER TABLE vehicles ADD COLUMN ilco_ref TEXT;
-- ALTER TABLE vehicles ADD COLUMN jma_ref TEXT;
-- ALTER TABLE vehicles ADD COLUMN silca_ref TEXT;
-- ALTER TABLE vehicles ADD COLUMN jet_ref TEXT;
