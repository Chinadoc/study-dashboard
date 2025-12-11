-- Create Normalized Lookup Tables for Unified Data Schema
-- This enables cross-tab navigation via shared IDs

-- ============================================
-- STEP 1: Create lookup tables
-- ============================================

-- Vehicles lookup (unique make/model combinations)
CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    make_norm TEXT NOT NULL,
    model TEXT NOT NULL,
    model_norm TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    UNIQUE(make_norm, model)
);

CREATE INDEX IF NOT EXISTS idx_vehicles_make_norm ON vehicles(make_norm);
CREATE INDEX IF NOT EXISTS idx_vehicles_model ON vehicles(model);

-- FCC IDs lookup (unique FCC IDs with shared attributes)
CREATE TABLE IF NOT EXISTS fcc_ids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fcc_id TEXT NOT NULL UNIQUE,
    frequency TEXT,
    frequency_mhz REAL,
    buttons INTEGER,
    battery TEXT,
    remote_start TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_fcc_ids_fcc_id ON fcc_ids(fcc_id);

-- Keyways lookup (unique keyways with blade info)
CREATE TABLE IF NOT EXISTS keyways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyway TEXT NOT NULL UNIQUE,
    keyway_norm TEXT,
    blade_type TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_keyways_keyway ON keyways(keyway);
CREATE INDEX IF NOT EXISTS idx_keyways_keyway_norm ON keyways(keyway_norm);

-- Junction table for lishi_tools to keyways (many-to-many)
CREATE TABLE IF NOT EXISTS lishi_tool_keyways (
    lishi_tool_id INTEGER NOT NULL,
    keyway_id INTEGER NOT NULL,
    PRIMARY KEY (lishi_tool_id, keyway_id),
    FOREIGN KEY (lishi_tool_id) REFERENCES lishi_tools(id),
    FOREIGN KEY (keyway_id) REFERENCES keyways(id)
);
