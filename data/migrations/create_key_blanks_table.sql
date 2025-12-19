-- Key Blanks Cross-Reference Table
-- Stores mechanical key blank data from Ilco, Strattec, and Silca catalogs

CREATE TABLE IF NOT EXISTS key_blanks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Vehicle matching
    make TEXT NOT NULL,
    model TEXT,                         -- NULL = applies to all models for this make
    year_start INTEGER,
    year_end INTEGER,
    
    -- Key blank references (cross-reference numbers)
    ilco_ref TEXT,                      -- Ilco part number (e.g., B111-PT, HO01T5)
    silca_ref TEXT,                     -- Silca part number (e.g., HON66R, TOY43)
    strattec_ref TEXT,                  -- Strattec SSC P/N (e.g., 5907553t)
    oem_ref TEXT,                       -- OEM part number
    
    -- Key specifications
    key_type TEXT,                      -- 'Mechanical', 'Transponder', 'Remote Head', 'Flip', 'Smart', 'Prox'
    blade_profile TEXT,                 -- Physical keyway profile (HO01, TOY43, HU100R, etc.)
    blade_style TEXT,                   -- 'Standard', 'Laser Cut', 'Sidewinder', '4-Track'
    spaces INTEGER,                     -- Number of pin/wafer positions
    depths INTEGER,                     -- Number of depth increments
    
    -- Transponder info (if applicable)
    chip_type TEXT,                     -- 'ID46', '4D63', 'ID47', 'H chip', 'Texas Fixed', etc.
    cloneable INTEGER DEFAULT 0,        -- 0/1 flag for whether chip can be cloned
    
    -- Programming info
    prog_tool TEXT,                     -- Recommended tool (Code-Seeker, Quick-Code, OBP-#, etc.)
    dealer_only INTEGER DEFAULT 0,      -- 0/1 flag for dealer-only programming
    
    -- Metadata
    source TEXT,                        -- 'ilco_2023', 'ilco_2025', 'strattec_2008', 'silca_2024'
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indices for common lookups
CREATE INDEX IF NOT EXISTS idx_key_blanks_make ON key_blanks(make);
CREATE INDEX IF NOT EXISTS idx_key_blanks_model ON key_blanks(model);
CREATE INDEX IF NOT EXISTS idx_key_blanks_years ON key_blanks(year_start, year_end);
CREATE INDEX IF NOT EXISTS idx_key_blanks_ilco ON key_blanks(ilco_ref);
CREATE INDEX IF NOT EXISTS idx_key_blanks_strattec ON key_blanks(strattec_ref);
CREATE INDEX IF NOT EXISTS idx_key_blanks_blade ON key_blanks(blade_profile);

-- Unique constraint to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_key_blanks_unique 
ON key_blanks(make, model, year_start, year_end, ilco_ref, strattec_ref);
