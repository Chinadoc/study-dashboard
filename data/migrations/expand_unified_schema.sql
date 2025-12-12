-- Schema Expansion: Add missing fields to unified database
-- Adds columns for immobilizer, code series, cross-references, EEPROM data

-- 1. Add missing columns to vehicle_variants
ALTER TABLE vehicle_variants ADD COLUMN code_series TEXT;           -- Z0001-Z6000, B0001-B4000
ALTER TABLE vehicle_variants ADD COLUMN emergency_key TEXT;         -- HU100, B111
ALTER TABLE vehicle_variants ADD COLUMN cloning_possible INTEGER;   -- 1=yes, 0=no
ALTER TABLE vehicle_variants ADD COLUMN obd_program TEXT;           -- 'Yes - 2 Key Learning'
ALTER TABLE vehicle_variants ADD COLUMN akl_procedure TEXT;         -- All Keys Lost steps
ALTER TABLE vehicle_variants ADD COLUMN max_keys INTEGER;           -- Max programmable keys
ALTER TABLE vehicle_variants ADD COLUMN lishi_tool TEXT;            -- HU100, GM100

-- 2. Expand chip_registry
ALTER TABLE chip_registry ADD COLUMN technology TEXT;               -- 'Philips Crypto 2'
ALTER TABLE chip_registry ADD COLUMN bits INTEGER;                  -- 46

-- 3. Expand keyway_registry for bitting specs
ALTER TABLE keyway_registry ADD COLUMN cut_depths TEXT;             -- '4/5'
ALTER TABLE keyway_registry ADD COLUMN cut_positions INTEGER;       -- 10
ALTER TABLE keyway_registry ADD COLUMN cut_spacing TEXT;            -- '0.1875"'
ALTER TABLE keyway_registry ADD COLUMN macs INTEGER;                -- 4
ALTER TABLE keyway_registry ADD COLUMN cut_type TEXT;               -- 'Edge Cut', 'High Security Sidewinder'

-- 4. Create cross-reference table for OEM/aftermarket parts
CREATE TABLE IF NOT EXISTS part_crossref (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_variant_id INTEGER REFERENCES vehicle_variants(id),
    ilco_part TEXT,
    strattec_part TEXT,
    jma_part TEXT,
    keydiy_part TEXT,
    dealer_part TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create EEPROM/Advanced immobilizer data table
CREATE TABLE IF NOT EXISTS eeprom_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_variant_id INTEGER REFERENCES vehicle_variants(id),
    bcm_chip TEXT,              -- HC9S12, MC9S12XEQ384
    icm_chip TEXT,              -- 24C02
    module_location TEXT,       -- 'Under dash, left side near fuse box'
    pin_retrieval_steps TEXT,   -- Step by step PIN retrieval
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_crossref_variant ON part_crossref(vehicle_variant_id);
CREATE INDEX IF NOT EXISTS idx_eeprom_variant ON eeprom_data(vehicle_variant_id);
CREATE INDEX IF NOT EXISTS idx_variants_lishi ON vehicle_variants(lishi_tool);
CREATE INDEX IF NOT EXISTS idx_variants_code_series ON vehicle_variants(code_series);
