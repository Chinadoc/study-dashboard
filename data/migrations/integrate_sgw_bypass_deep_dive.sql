-- SGW & Bypass Deep Dive Integration
-- Source: Vehicle_SGW_Access_and_Key_Programming.txt, VIN-Coded_Key_Requirements_Research.txt
-- Generated: 2025-12-26

-- ==============================================================================
-- PART 1: Schema Updates
-- ==============================================================================

ALTER TABLE vehicles_master ADD COLUMN sgw_required INTEGER DEFAULT 0;
ALTER TABLE vehicles_master ADD COLUMN bypass_method TEXT;
ALTER TABLE vehicles_master ADD COLUMN vin_coded_key INTEGER DEFAULT 0;

-- ==============================================================================
-- PART 2: Stellantis (FCA) SGW Updates
-- ==============================================================================

-- General Stellantis SGW (2018+)
UPDATE vehicles_master SET
    sgw_required = 1,
    bypass_method = '12+8 Bypass Cable / AutoAuth'
WHERE make IN ('Jeep', 'Ram', 'RAM', 'Dodge', 'Chrysler')
    AND EXISTS (
        SELECT 1 FROM vehicle_variants vv 
        WHERE vv.vehicle_id = vehicles_master.id 
        AND vv.year_start >= 2018
    );

-- Specialized Jeep WL/WS (2021+)
UPDATE vehicles_master SET
    security_notes = COALESCE(security_notes || ' | ', '') || 'SECURE GATEWAY: Access via Star Connector in Passenger Kick Panel. RFHUB LOCK: AKL requires bench unlock to prevent bricking.',
    bypass_method = 'Star Connector Cable / Bench Unlock (RFHub)'
WHERE make = 'Jeep' AND model IN ('Grand Cherokee L', 'Wagoneer', 'Grand Wagoneer');

-- ==============================================================================
-- PART 3: Nissan SGW Updates
-- ==============================================================================

-- Nissan B18/T33/R53 (2020+)
UPDATE vehicles_master SET
    sgw_required = 1,
    bypass_method = '16+32 Bypass Cable',
    security_notes = COALESCE(security_notes || ' | ', '') || 'GATEWAY: 16+32 configuration. AutoAuth for diag only; hardware bypass mandatory for immo writes.'
WHERE make = 'Nissan' AND model IN ('Sentra', 'Rogue', 'Pathfinder')
    AND (model || make) IN (
        SELECT (model || make) FROM vehicles_master 
        WHERE id IN (SELECT vehicle_id FROM vehicle_variants WHERE year_start >= 2020)
    );

-- ==============================================================================
-- PART 4: Ford Sync 4 / GWM Updates
-- ==============================================================================

-- Ford FNV2 (2021+)
UPDATE vehicles_master SET
    sgw_required = 1,
    bypass_method = 'Active Alarm Bypass Cable / FDRS',
    security_notes = COALESCE(security_notes || ' | ', '') || 'GWM LOCK: Gateway monitors active alarm. Use bypass cable at BCM/GWM to suppress alarm for programming.'
WHERE make = 'Ford' AND model IN ('F-150', 'Mustang Mach-E', 'Bronco')
    AND id IN (SELECT vehicle_id FROM vehicle_variants WHERE year_start >= 2021);

-- ==============================================================================
-- PART 5: VIN-Coded Key Mandates (High Severity)
-- ==============================================================================

-- Mercedes FBS4 (2016+)
UPDATE vehicles_master SET
    vin_coded_key = 1,
    security_notes = COALESCE(security_notes || ' | ', '') || 'FBS4 MANDATE: Key must be ordered by VIN from factory. No field programming available.'
WHERE make = 'Mercedes' 
    AND id IN (SELECT vehicle_id FROM vehicle_variants WHERE year_start >= 2016);

-- BMW G-Series (2019+)
UPDATE vehicles_master SET
    vin_coded_key = 1,
    security_notes = COALESCE(security_notes || ' | ', '') || 'G-SERIES MANDATE: Factory order required for keys. Post-06/2020 Bosch DME is locked.'
WHERE make = 'BMW' 
    AND id IN (SELECT vehicle_id FROM vehicle_variants WHERE year_start >= 2019);

-- VAG MQB-Evo (2021+)
UPDATE vehicles_master SET
    vin_coded_key = 1,
    security_notes = COALESCE(security_notes || ' | ', '') || 'MQB-EVO MANDATE: SFD2 protected. Online ODIS connection and factory-matched key required.'
WHERE (make = 'Volkswagen' AND model IN ('Golf', 'ID.4', 'Tiguan') AND id IN (SELECT vehicle_id FROM vehicle_variants WHERE year_start >= 2021))
   OR (make = 'Audi' AND model IN ('A3', 'S3', 'RS3') AND id IN (SELECT vehicle_id FROM vehicle_variants WHERE year_start >= 2021));

-- Porsche 992/Taycan
UPDATE vehicles_master SET
    vin_coded_key = 1,
    security_notes = COALESCE(security_notes || ' | ', '') || 'PPN MANDATE: Online server authentication (PPN) required. Keys are VIN-locked.'
WHERE make = 'Porsche' AND model IN ('911', 'Taycan')
    AND id IN (SELECT vehicle_id FROM vehicle_variants WHERE year_start >= 2020);
