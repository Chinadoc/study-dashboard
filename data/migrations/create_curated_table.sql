
CREATE TABLE IF NOT EXISTS curated_overrides (
    fcc_id TEXT,
    make TEXT,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    frequency TEXT,
    chip TEXT,
    key_blank TEXT,
    notes TEXT,
    source TEXT,
    buttons TEXT,
    battery TEXT,
    oem_part TEXT,
    PRIMARY KEY (fcc_id, make, model, year_start)
);
