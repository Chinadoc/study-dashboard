-- Migration: add_vin_ordered_columns.sql
-- Purpose: Add columns to track VIN-ordered keys and dealer tool requirements
-- Source: Locksmith field intel (Dec 2025) - Stellantis/Fiat EU-assembled vehicles

-- Add new columns to vehicles table
ALTER TABLE vehicles ADD COLUMN vin_ordered INTEGER DEFAULT 0;
-- Flag: 1 = key must be ordered by VIN (precoded at factory)

ALTER TABLE vehicles ADD COLUMN dealer_tool_only TEXT;
-- Dealer diagnostic tool required (e.g., 'WiTech', 'TechStream', 'SDD', 'ODIS')

-- ============================================================================
-- STELLANTIS VIN-ORDERED KEY DATA (2023-2025)
-- Intel: Keys come precoded from Fiat/Europe, cannot use aftermarket fobs
-- ============================================================================

-- Jeep Renegade 2023+ (WiTech only, VIN-ordered keys)
UPDATE vehicles 
SET vin_ordered = 1, 
    dealer_tool_only = 'WiTech',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'VIN-ORDERED KEY: Must order fob by VIN from Fiat/Europe. Aftermarket fobs will NOT work. WiTech required for programming.',
    programming_method = 'WiTech Only - VIN Precoded'
WHERE make = 'Jeep' AND model LIKE '%Renegade%' AND year_start >= 2023;

-- Jeep Grand Cherokee WL 2023+ (WiTech required)
UPDATE vehicles 
SET vin_ordered = 1, 
    dealer_tool_only = 'WiTech',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'VIN-ORDERED KEY: Must order fob by VIN. WiTech required for programming.',
    programming_method = 'WiTech Only - VIN Precoded'
WHERE make = 'Jeep' AND model LIKE '%Grand Cherokee%' AND year_start >= 2023;

-- Dodge Hornet 2023+ (VIN-ordered, WiTech required)
UPDATE vehicles 
SET vin_ordered = 1, 
    dealer_tool_only = 'WiTech',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'VIN-ORDERED KEY: Must order fob by VIN from Fiat/Europe. Aftermarket fobs will NOT work. WiTech required for programming.',
    programming_method = 'WiTech Only - VIN Precoded'
WHERE make = 'Dodge' AND model LIKE '%Hornet%' AND year_start >= 2023;

-- Chrysler Voyager 2025 (last year without WiTech requirement)
UPDATE vehicles 
SET vin_ordered = 0, 
    dealer_tool_only = NULL,
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Last model year programmable without WiTech.'
WHERE make = 'Chrysler' AND model LIKE '%Voyager%' AND year_start = 2025;

-- Jeep Compass 2025 (last year without WiTech requirement)  
UPDATE vehicles 
SET vin_ordered = 0, 
    dealer_tool_only = NULL,
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Last model year programmable without WiTech.'
WHERE make = 'Jeep' AND model LIKE '%Compass%' AND year_start = 2025;

-- Insert new records if Hornet doesn't exist (new model 2023+)
INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, key_type, vin_ordered, dealer_tool_only, programming_method, service_notes_pro, chip)
VALUES 
    ('Dodge', 'Hornet', 2023, 2023, 'Smart Key', 1, 'WiTech', 'WiTech Only - VIN Precoded', 'VIN-ORDERED KEY: Must order fob by VIN from Fiat/Europe. Aftermarket fobs will NOT work.', 'AES'),
    ('Dodge', 'Hornet', 2024, 2024, 'Smart Key', 1, 'WiTech', 'WiTech Only - VIN Precoded', 'VIN-ORDERED KEY: Must order fob by VIN from Fiat/Europe. Aftermarket fobs will NOT work.', 'AES'),
    ('Dodge', 'Hornet', 2025, 2025, 'Smart Key', 1, 'WiTech', 'WiTech Only - VIN Precoded', 'VIN-ORDERED KEY: Must order fob by VIN from Fiat/Europe. Aftermarket fobs will NOT work.', 'AES');

-- Create index for fast VIN-ordered lookups
CREATE INDEX IF NOT EXISTS idx_vehicles_vin_ordered ON vehicles(vin_ordered) WHERE vin_ordered = 1;
CREATE INDEX IF NOT EXISTS idx_vehicles_dealer_tool ON vehicles(dealer_tool_only) WHERE dealer_tool_only IS NOT NULL;
