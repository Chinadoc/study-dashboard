-- ==========================================================
-- Vehicle Intelligence Builder Script
-- Populates the materialized vehicle_intelligence table
-- from all source tables via LEFT JOINs
-- ==========================================================
-- Run via: wrangler d1 execute locksmith-db --file=scripts/build_vehicle_intelligence.sql --remote
-- ==========================================================

-- Step 0: Clear existing data
DELETE FROM vehicle_intelligence;

-- ==========================================================
-- Step 1: Seed from aks_vehicles_by_year (anchor table)
-- This is the most comprehensive vehicle catalog (56 makes)
-- ==========================================================
INSERT INTO vehicle_intelligence (
    make, model, year_start, year_end,
    chip_type, lishi, keyway, spaces, depths, macs, code_series, battery,
    key_blank_refs,
    last_refreshed
)
SELECT 
    -- Normalize make names
    CASE 
        WHEN a.make = 'Land' AND a.model LIKE 'Rover%' THEN 'Land Rover'
        WHEN a.make = 'Mercedes' THEN 'Mercedes-Benz'
        WHEN a.make = 'Rolls' AND a.model LIKE 'Royce%' THEN 'Rolls-Royce'
        WHEN a.make = 'Alfa' AND a.model LIKE 'Romeo%' THEN 'Alfa Romeo'
        ELSE a.make
    END as make,
    -- Normalize model names (strip make prefix from model for multi-word makes)
    CASE
        WHEN a.make = 'Land' AND a.model LIKE 'Rover %' THEN SUBSTR(a.model, 7)
        WHEN a.make = 'Rolls' AND a.model LIKE 'Royce %' THEN SUBSTR(a.model, 7)
        WHEN a.make = 'Alfa' AND a.model LIKE 'Romeo %' THEN SUBSTR(a.model, 7)
        ELSE a.model
    END as model,
    a.year_start,
    a.year_end,
    a.chip_type,
    a.lishi,
    a.lishi as keyway,  -- Lishi tool maps 1:1 with keyway in most cases
    a.spaces,
    a.depths,
    a.macs,
    a.code_series,
    a.battery,
    -- Combine cross-reference fields into one
    CASE 
        WHEN a.ilco_ref IS NOT NULL OR a.jma_ref IS NOT NULL OR a.silca_ref IS NOT NULL
        THEN COALESCE(a.ilco_ref, '') || '|' || COALESCE(a.jma_ref, '') || '|' || COALESCE(a.silca_ref, '')
        ELSE NULL
    END as key_blank_refs,
    CURRENT_TIMESTAMP
FROM aks_vehicles_by_year a
WHERE a.make IS NOT NULL AND a.model IS NOT NULL;


-- ==========================================================
-- Step 2: Enrich with vehicles master table data
-- (key_type, fcc_id, frequency, buttons, immo, programming)
-- ==========================================================
UPDATE vehicle_intelligence
SET 
    key_type = COALESCE(vehicle_intelligence.key_type, v.key_type),
    fcc_ids = COALESCE(vehicle_intelligence.fcc_ids, v.fcc_id),
    oem_part_number = COALESCE(vehicle_intelligence.oem_part_number, v.oem_part_number),
    aftermarket_part = COALESCE(vehicle_intelligence.aftermarket_part, v.aftermarket_part),
    chip_type = COALESCE(vehicle_intelligence.chip_type, v.chip),
    frequency = COALESCE(vehicle_intelligence.frequency, v.frequency),
    buttons = COALESCE(vehicle_intelligence.buttons, v.buttons),
    battery = COALESCE(vehicle_intelligence.battery, v.battery),
    lishi = COALESCE(vehicle_intelligence.lishi, v.lishi_tool),
    keyway = COALESCE(vehicle_intelligence.keyway, v.keyway),
    spaces = COALESCE(vehicle_intelligence.spaces, v.spaces),
    depths = COALESCE(vehicle_intelligence.depths, v.depths),
    code_series = COALESCE(vehicle_intelligence.code_series, v.code_series),
    immo_system = v.immobilizer_system,
    programming_method = v.programming_method,
    pin_required = v.pin_required,
    service_notes = v.service_notes_pro,
    key_blank_refs = COALESCE(vehicle_intelligence.key_blank_refs, v.key_blank_refs)
FROM vehicles v
WHERE LOWER(vehicle_intelligence.make) = LOWER(v.make)
  AND LOWER(vehicle_intelligence.model) = LOWER(v.model)
  AND vehicle_intelligence.year_start <= v.year_end
  AND vehicle_intelligence.year_end >= v.year_start;


-- ==========================================================
-- Step 3: Enrich with tool coverage (per-tool status)
-- vehicle_coverage has one row per tool_family, so we pivot
-- ==========================================================

-- Autel
UPDATE vehicle_intelligence
SET autel_status = vc.status
FROM vehicle_coverage vc
WHERE LOWER(vehicle_intelligence.make) = LOWER(vc.make)
  AND LOWER(vehicle_intelligence.model) = LOWER(vc.model)
  AND vehicle_intelligence.year_start <= vc.year_end
  AND vehicle_intelligence.year_end >= vc.year_start
  AND LOWER(vc.tool_family) = 'autel';

-- Smart Pro
UPDATE vehicle_intelligence
SET smartpro_status = vc.status
FROM vehicle_coverage vc
WHERE LOWER(vehicle_intelligence.make) = LOWER(vc.make)
  AND LOWER(vehicle_intelligence.model) = LOWER(vc.model)
  AND vehicle_intelligence.year_start <= vc.year_end
  AND vehicle_intelligence.year_end >= vc.year_start
  AND LOWER(vc.tool_family) IN ('smartpro', 'smart pro', 'smart_pro');

-- Lonsdor
UPDATE vehicle_intelligence
SET lonsdor_status = vc.status
FROM vehicle_coverage vc
WHERE LOWER(vehicle_intelligence.make) = LOWER(vc.make)
  AND LOWER(vehicle_intelligence.model) = LOWER(vc.model)
  AND vehicle_intelligence.year_start <= vc.year_end
  AND vehicle_intelligence.year_end >= vc.year_start
  AND LOWER(vc.tool_family) = 'lonsdor';

-- VVDI
UPDATE vehicle_intelligence
SET vvdi_status = vc.status
FROM vehicle_coverage vc
WHERE LOWER(vehicle_intelligence.make) = LOWER(vc.make)
  AND LOWER(vehicle_intelligence.model) = LOWER(vc.model)
  AND vehicle_intelligence.year_start <= vc.year_end
  AND vehicle_intelligence.year_end >= vc.year_start
  AND LOWER(vc.tool_family) IN ('vvdi', 'xhorse');


-- ==========================================================
-- Step 4: Enrich with platform security data
-- ==========================================================
UPDATE vehicle_intelligence
SET 
    platform = ps.platform_code,
    architecture = ps.architecture,
    security_level = ps.security_level,
    adapter_type = CASE 
        WHEN ps.can_fd_required = 1 THEN 'CAN FD'
        WHEN ps.sgw_required = 1 THEN 'SGW Bypass'
        WHEN ps.doip_required = 1 THEN 'DoIP'
        ELSE 'Standard OBD'
    END,
    obd_supported = COALESCE(ps.obd_typical, 1),
    bench_required = COALESCE(ps.bench_typical, 0)
FROM platform_security ps
WHERE LOWER(vehicle_intelligence.make) LIKE LOWER(ps.make) || '%'
  AND (
    vehicle_intelligence.platform IS NULL 
    OR vehicle_intelligence.platform = ''
  )
  AND (
    -- Match by year range overlap
    (ps.year_start IS NOT NULL AND vehicle_intelligence.year_start <= ps.year_end AND vehicle_intelligence.year_end >= ps.year_start)
    OR ps.year_start IS NULL
  );


-- ==========================================================
-- Step 5: Enrich with EEPROM / AKL data
-- ==========================================================
UPDATE vehicle_intelligence
SET 
    eeprom_chip = e.eeprom_chip,
    eeprom_module = e.module_name,
    eeprom_location = e.module_location,
    eeprom_tools = e.tools_supported,
    akl_method = e.akl_method
FROM eeprom_data e
WHERE LOWER(vehicle_intelligence.make) = LOWER(e.make)
  AND LOWER(vehicle_intelligence.model) LIKE LOWER(e.model) || '%'
  AND vehicle_intelligence.year_start <= e.year_end
  AND vehicle_intelligence.year_end >= e.year_start;


-- ==========================================================
-- Step 6: Enrich with vehicle descriptions
-- ==========================================================
UPDATE vehicle_intelligence
SET description = vd.description
FROM vehicle_descriptions vd
WHERE vd.vehicle_key = LOWER(vehicle_intelligence.make) || '_' || LOWER(vehicle_intelligence.model);


-- ==========================================================
-- Step 7: Compute counts (pearls, comments, walkthroughs)
-- ==========================================================

-- Pearl count
UPDATE vehicle_intelligence
SET pearl_count = (
    SELECT COUNT(*) FROM vehicle_pearls vp
    WHERE LOWER(vp.make) = LOWER(vehicle_intelligence.make)
      AND LOWER(vp.model) LIKE LOWER(vehicle_intelligence.model) || '%'
      AND vp.year_start <= vehicle_intelligence.year_end
      AND vp.year_end >= vehicle_intelligence.year_start
);

-- Walkthrough availability
UPDATE vehicle_intelligence
SET has_walkthrough = (
    SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END 
    FROM walkthroughs_v2 w
    WHERE LOWER(w.make) = LOWER(vehicle_intelligence.make)
      AND LOWER(w.model) LIKE LOWER(vehicle_intelligence.model) || '%'
);

-- Programming guide availability 
UPDATE vehicle_intelligence
SET has_guide = (
    SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
    FROM programming_guides pg
    WHERE LOWER(pg.make) = LOWER(vehicle_intelligence.make)
      AND LOWER(pg.model) LIKE LOWER(vehicle_intelligence.model) || '%'
      AND pg.year_start <= vehicle_intelligence.year_end
      AND pg.year_end >= vehicle_intelligence.year_start
);

-- Critical alerts
UPDATE vehicle_intelligence
SET critical_alert = (
    SELECT alert_message FROM locksmith_alerts la
    WHERE LOWER(la.make) = LOWER(vehicle_intelligence.make)
      AND LOWER(la.model) LIKE LOWER(vehicle_intelligence.model) || '%'
      AND la.alert_level = 'CRITICAL'
      AND la.year_start <= vehicle_intelligence.year_end
      AND la.year_end >= vehicle_intelligence.year_start
    LIMIT 1
);

-- Comment count  
UPDATE vehicle_intelligence
SET comment_count = (
    SELECT COUNT(*) FROM vehicle_comments vc
    WHERE vc.vehicle_key = LOWER(vehicle_intelligence.make) || '_' || LOWER(vehicle_intelligence.model)
      AND COALESCE(vc.is_deleted, 0) = 0
);
