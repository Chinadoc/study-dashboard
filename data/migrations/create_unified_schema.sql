-- Definitive Unified Database Schema
-- Creates the core tables for a single source of truth

-- 1. Master Vehicle Registry (unique make/model combinations)
CREATE TABLE IF NOT EXISTS vehicles_master (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    make_normalized TEXT,
    model_normalized TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(make, model)
);

-- 2. Vehicle Variants (the definitive table with all data)
CREATE TABLE IF NOT EXISTS vehicle_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER REFERENCES vehicles_master(id),
    
    -- Year Range
    year_start INTEGER NOT NULL,
    year_end INTEGER NOT NULL,
    
    -- Variant Type (handles push-start vs non-push-start)
    key_type TEXT,           -- 'Flip Key', 'Smart Key', 'Prox', 'Standard'
    
    -- Immobilizer & Chip
    immobilizer_system TEXT, -- 'HITAG-AES', 'ID46', 'ID4A', 'Texas Crypto'
    chip TEXT,               -- 'PCF7952', 'PCF7936', '4D63'
    
    -- Keyway (Blade)
    keyway TEXT,             -- 'HY22', 'HON66', 'MIT17'
    
    -- FCC / Remote
    fcc_id TEXT,             -- 'SY5HMFNA04'
    frequency TEXT,          -- '315 MHz', '433 MHz'
    buttons INTEGER,         -- 3, 4, 5
    battery TEXT,            -- 'CR2032', 'CR2450'
    
    -- Part Numbers
    oem_part_number TEXT,    -- '95440-3M220'
    aftermarket_part TEXT,   -- 'KR5XXXA'
    
    -- Programming
    programmer TEXT,         -- 'Autel IM608', 'K518'
    programming_method TEXT, -- 'OBD', 'All Keys Lost', 'Add Key'
    pin_required INTEGER DEFAULT 0,
    
    -- Additional
    notes TEXT,
    verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(vehicle_id, year_start, year_end, key_type)
);

-- 3. FCC Registry (normalized FCC IDs)
CREATE TABLE IF NOT EXISTS fcc_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fcc_id TEXT UNIQUE NOT NULL,
    frequency TEXT,
    frequency_mhz REAL,
    buttons INTEGER,
    battery TEXT,
    remote_start INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. Keyway Registry (normalized keyways)
CREATE TABLE IF NOT EXISTS keyway_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyway TEXT UNIQUE NOT NULL,
    blade_type TEXT,        -- 'High Security', 'Standard'
    lishi_tool TEXT,        -- 'HY22', 'HON66'
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. Chip Registry (normalized chips/transponders)
CREATE TABLE IF NOT EXISTS chip_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chip_name TEXT UNIQUE NOT NULL,   -- 'ID46', 'ID4A', '4D63'
    chip_family TEXT,                 -- 'Philips', 'Texas', 'Hitag'
    cloneable INTEGER DEFAULT 0,
    requires_tool TEXT,               -- 'Tango', 'Zed-Full'
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_variants_vehicle_id ON vehicle_variants(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_variants_fcc_id ON vehicle_variants(fcc_id);
CREATE INDEX IF NOT EXISTS idx_variants_keyway ON vehicle_variants(keyway);
CREATE INDEX IF NOT EXISTS idx_variants_years ON vehicle_variants(year_start, year_end);
CREATE INDEX IF NOT EXISTS idx_master_make ON vehicles_master(make);
CREATE INDEX IF NOT EXISTS idx_master_model ON vehicles_master(model);
