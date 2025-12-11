-- Add foreign key columns to existing tables
-- Run AFTER create_lookup_tables.sql

-- ============================================
-- STEP 2: Add FK columns to locksmith_data
-- ============================================

-- Note: SQLite doesn't support ALTER TABLE ADD COLUMN with REFERENCES,
-- but we can add the columns and use application-level constraints

-- Add vehicle_id column
ALTER TABLE locksmith_data ADD COLUMN vehicle_id INTEGER;

-- Add fcc_id_ref column (references fcc_ids.id)
ALTER TABLE locksmith_data ADD COLUMN fcc_id_ref INTEGER;

-- Add keyway_id column
ALTER TABLE locksmith_data ADD COLUMN keyway_id INTEGER;

-- Create indexes for efficient JOINs
CREATE INDEX IF NOT EXISTS idx_locksmith_vehicle_id ON locksmith_data(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_locksmith_fcc_id_ref ON locksmith_data(fcc_id_ref);
CREATE INDEX IF NOT EXISTS idx_locksmith_keyway_id ON locksmith_data(keyway_id);

-- ============================================
-- STEP 3: Add vehicle_id to vehicle_guides
-- ============================================

ALTER TABLE vehicle_guides ADD COLUMN vehicle_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_guides_vehicle_id ON vehicle_guides(vehicle_id);

-- ============================================
-- STEP 4: Add vehicle_id to video_tutorials
-- ============================================

ALTER TABLE video_tutorials ADD COLUMN vehicle_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_videos_vehicle_id ON video_tutorials(vehicle_id);

-- ============================================
-- STEP 5: Add keyway_id to lishi_tools
-- ============================================

ALTER TABLE lishi_tools ADD COLUMN keyway_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_lishi_keyway_id ON lishi_tools(keyway_id);
