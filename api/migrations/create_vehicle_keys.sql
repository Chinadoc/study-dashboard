-- Create vehicle_keys join table for fast lookups
-- This table expands the compatible_vehicles JSON from aks_products
-- into individual rows for efficient querying

CREATE TABLE IF NOT EXISTS vehicle_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    product_item_num TEXT NOT NULL,
    product_title TEXT,
    chip TEXT,
    frequency TEXT,
    battery TEXT,
    fcc_id TEXT,
    price TEXT,
    url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_vehicle_keys_make_model ON vehicle_keys(make, model);
CREATE INDEX IF NOT EXISTS idx_vehicle_keys_years ON vehicle_keys(year_start, year_end);
CREATE INDEX IF NOT EXISTS idx_vehicle_keys_product ON vehicle_keys(product_item_num);
