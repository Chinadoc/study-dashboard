-- Create vehicle_descriptions table to store AI-generated descriptions
CREATE TABLE IF NOT EXISTS vehicle_descriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_key TEXT NOT NULL UNIQUE,  -- Format: "Make|Model"
  description TEXT NOT NULL,
  generated TEXT NOT NULL,           -- Date generated
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_vehicle_descriptions_key ON vehicle_descriptions(vehicle_key);
