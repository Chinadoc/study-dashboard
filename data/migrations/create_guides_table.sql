-- Recreate vehicle_guides table
DROP TABLE IF EXISTS vehicle_guides;

CREATE TABLE vehicle_guides (
    id TEXT PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    content TEXT,
    "references" TEXT,
    vehicle_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guides_make ON vehicle_guides(make);
CREATE INDEX IF NOT EXISTS idx_guides_model ON vehicle_guides(model);
