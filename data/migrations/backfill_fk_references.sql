-- Backfill foreign key references in existing tables
-- Run AFTER populate_lookup_tables.sql

-- ============================================
-- STEP 9: Backfill vehicle_id in locksmith_data
-- ============================================

UPDATE locksmith_data 
SET vehicle_id = (
    SELECT v.id 
    FROM vehicles v 
    WHERE v.make_norm = locksmith_data.make_norm 
      AND v.model = locksmith_data.model
    LIMIT 1
)
WHERE vehicle_id IS NULL
  AND make_norm IS NOT NULL 
  AND model IS NOT NULL;

-- ============================================
-- STEP 10: Backfill fcc_id_ref in locksmith_data
-- ============================================

UPDATE locksmith_data 
SET fcc_id_ref = (
    SELECT f.id 
    FROM fcc_ids f 
    WHERE f.fcc_id = locksmith_data.fcc_id
    LIMIT 1
)
WHERE fcc_id_ref IS NULL
  AND fcc_id IS NOT NULL 
  AND fcc_id != '' 
  AND fcc_id != 'N/A';

-- ============================================
-- STEP 11: Backfill keyway_id in locksmith_data
-- ============================================

UPDATE locksmith_data 
SET keyway_id = (
    SELECT k.id 
    FROM keyways k 
    WHERE k.keyway = locksmith_data.keyway
    LIMIT 1
)
WHERE keyway_id IS NULL
  AND keyway IS NOT NULL 
  AND keyway != '' 
  AND keyway != 'N/A';

-- ============================================
-- STEP 12: Backfill vehicle_id in vehicle_guides
-- ============================================

UPDATE vehicle_guides 
SET vehicle_id = (
    SELECT v.id 
    FROM vehicles v 
    WHERE LOWER(v.make) = LOWER(vehicle_guides.make) 
      AND LOWER(v.model) = LOWER(vehicle_guides.model)
    LIMIT 1
)
WHERE vehicle_id IS NULL
  AND make IS NOT NULL 
  AND model IS NOT NULL;

-- ============================================
-- STEP 13: Backfill vehicle_id in video_tutorials
-- ============================================

UPDATE video_tutorials 
SET vehicle_id = (
    SELECT v.id 
    FROM vehicles v 
    WHERE LOWER(v.make) = LOWER(video_tutorials.related_make) 
      AND LOWER(v.model) = LOWER(video_tutorials.related_model)
    LIMIT 1
)
WHERE vehicle_id IS NULL
  AND related_make IS NOT NULL 
  AND related_model IS NOT NULL;

-- ============================================
-- STEP 14: Backfill keyway_id in lishi_tools
-- ============================================

UPDATE lishi_tools 
SET keyway_id = (
    SELECT k.id 
    FROM keyways k 
    WHERE k.keyway = lishi_tools.keyway
    LIMIT 1
)
WHERE keyway_id IS NULL
  AND keyway IS NOT NULL 
  AND keyway != '';

-- ============================================
-- STEP 15: Populate lishi_tool_keyways junction
-- ============================================

INSERT OR IGNORE INTO lishi_tool_keyways (lishi_tool_id, keyway_id)
SELECT lt.id, k.id
FROM lishi_tools lt
JOIN keyways k ON k.keyway = lt.keyway
WHERE lt.keyway IS NOT NULL AND lt.keyway != '';
