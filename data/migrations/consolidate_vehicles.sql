-- Database Consolidation: Merge vehicles + vehicle_variants into unified vehicles table
-- Adds data quality tracking: confidence_score, source_name, source_url, verified_at

-- Step 1: Create new unified vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Identity
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year_start INTEGER NOT NULL,
    year_end INTEGER NOT NULL,
    
    -- Key Type & Security
    key_type TEXT,           -- 'Smart Key', 'Flip Key', 'Fobik', 'Standard'
    immobilizer_system TEXT, -- 'BDC', 'CAS4', 'HITAG-AES', 'ID46'
    chip TEXT,               -- 'ID49', 'PCF7953', '4D63'
    
    -- Physical Key
    keyway TEXT,             -- 'HU100R', 'HY22', 'MIT17'
    lishi_tool TEXT,         -- 'HU100', 'HY22', 'MIT17'
    
    -- Remote/FCC
    fcc_id TEXT,             -- 'NBGIDGNG1', 'N5FID21A'
    frequency TEXT,          -- '315 MHz', '433 MHz'
    buttons INTEGER,
    battery TEXT,            -- 'CR2450', 'CR2032'
    
    -- Part Numbers
    oem_part_number TEXT,
    aftermarket_part TEXT,
    amazon_asin TEXT,
    
    -- Programming
    programming_method TEXT,
    pin_required INTEGER DEFAULT 0,
    akl_procedure TEXT,
    max_keys INTEGER,
    
    -- DATA QUALITY TRACKING
    confidence_score REAL DEFAULT 0.5,  -- 0.0-1.0
    source_name TEXT,                    -- 'keylessentryremotefob.com', 'oem_catalog'
    source_url TEXT,                     -- Full URL for verification
    verified_at TEXT,                    -- Last verification date
    
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create index for common queries
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_fcc ON vehicles(fcc_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year_start, year_end);

-- Step 3: Migrate data from old tables
INSERT INTO vehicles (
    make, model, year_start, year_end,
    key_type, immobilizer_system, chip,
    keyway, lishi_tool,
    fcc_id, frequency, buttons, battery,
    oem_part_number, aftermarket_part, amazon_asin,
    programming_method, pin_required, akl_procedure, max_keys,
    confidence_score, source_name, notes, created_at
)
SELECT 
    m.make, m.model, v.year_start, v.year_end,
    v.key_type, v.immobilizer_system, v.chip,
    v.keyway, v.lishi_tool,
    v.fcc_id, v.frequency, v.buttons, v.battery,
    v.oem_part_number, v.aftermarket_part, v.amazon_asin,
    v.programming_method, v.pin_required, v.akl_procedure, v.max_keys,
    CASE WHEN v.verified = 1 THEN 0.7 ELSE 0.5 END,
    'legacy_import',
    v.notes, v.created_at
FROM vehicle_variants v
JOIN vehicles m ON v.vehicle_id = m.id;

-- Step 4: Backup old tables (rename instead of delete)
ALTER TABLE vehicles RENAME TO vehicles_backup;
ALTER TABLE vehicle_variants RENAME TO vehicle_variants_backup;
