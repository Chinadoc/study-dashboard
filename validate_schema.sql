-- Mock Schema for Validation
CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY,
    make TEXT,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    chip TEXT,
    platform TEXT,
    fcc_id TEXT,
    keyway TEXT,
    battery TEXT,
    type TEXT,
    sub_model TEXT,
    security_notes TEXT,
    lishi_tool TEXT,
    bypass_method TEXT,
    sgw_required INTEGER DEFAULT 0,
    make_normalized TEXT,
    model_normalized TEXT,
    immobilizer_system TEXT,
    programming_method TEXT,
    service_notes_pro TEXT,
    vin_ordered INTEGER DEFAULT 0,
    dealer_tool_only TEXT,
    source_name TEXT,
    confidence_score REAL
);

CREATE TABLE IF NOT EXISTS fcc_reference (
    id INTEGER PRIMARY KEY,
    fcc_id TEXT,
    make TEXT,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    frequency TEXT,
    chip_type TEXT,
    key_type TEXT,
    notes TEXT,
    oem_part_numbers TEXT,
    UNIQUE(fcc_id, make, model)
);

CREATE TABLE IF NOT EXISTS vehicle_guides (
    id TEXT PRIMARY KEY,
    make TEXT,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    title TEXT,
    content TEXT,
    category TEXT,
    tool TEXT,
    "references" TEXT -- Only to catch legacy errors if column missing
);
-- Note: I added "references" to table ref just in case, but if script inserts into it and it doesn't exist, it fails.
-- I should strictly mock the PRODUCTION schema (no references column).
DROP TABLE vehicle_guides;
CREATE TABLE vehicle_guides (
    id TEXT PRIMARY KEY,
    make TEXT,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    title TEXT,
    content TEXT,
    category TEXT,
    tool TEXT
);

CREATE TABLE IF NOT EXISTS locksmith_alerts (
    id INTEGER PRIMARY KEY,
    make TEXT,
    model TEXT,
    start_year INTEGER,
    end_year INTEGER,
    alert_type TEXT,
    severity TEXT,
    message TEXT
);

CREATE TABLE IF NOT EXISTS vehicle_variants (
    id INTEGER PRIMARY KEY,
    vehicle_id INTEGER,
    year_start INTEGER,
    year_end INTEGER,
    model_variant TEXT
);
