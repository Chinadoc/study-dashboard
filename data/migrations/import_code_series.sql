-- Fix keyway_registry schema and import code series data
-- Add missing columns for code series

ALTER TABLE keyway_registry ADD COLUMN code_series_start TEXT;
ALTER TABLE keyway_registry ADD COLUMN code_series_end TEXT;

-- Now import the keyway data
DELETE FROM keyway_registry;

INSERT INTO keyway_registry (keyway, blade_type, lishi_tool, code_series_start, code_series_end, cut_depths, cut_positions, cut_type, macs) VALUES
-- GM Keyways
('B106', 'Edge Cut', 'B106', 'G0001', 'G3631', '4', 10, 'Edge Cut Double-Sided', 4),
('B111', 'Edge Cut', 'B111', 'G0000', 'G3631', '4', 10, 'Edge Cut', 4),
('HU100-8cut', 'High Security', 'HU100-8cut', 'Z0001', 'Z2000', '4', 8, 'High Security Sidewinder', 4),
('HU100-10cut', 'High Security', 'HU100-10cut', 'V0001', 'V5573', '4', 10, 'High Security Sidewinder', 4),
-- Ford Keyways
('H75', 'Edge Cut', 'FO38', '0001X', '1706X', '5', 8, 'Edge Cut Double-Sided', 4),
('H84', 'Edge Cut', 'FO38', '0001X', '1706X', '5', 8, 'Edge Cut', 4),
('H92', 'Edge Cut', 'FO38', '0001X', '1706X', '5', 8, 'Edge Cut', 4),
('HU101', 'High Security', 'HU101-V3', '0001X', '1706X', '5', 10, 'High Security Sidewinder', 4),
-- Stellantis/Chrysler Keyways
('Y157', 'Edge Cut', 'CY24', 'L0001', 'L3580', '4', 7, 'Edge Cut Double-Sided', 4),
('Y159', 'Edge Cut', 'CY24', 'M1', 'M2618', '4', 8, 'Edge Cut', 4),
('Y164', 'Edge Cut', 'CY24', 'M1', 'M2618', '4', 7, 'Edge Cut', 4),
('CY24', 'Edge Cut', 'CY24', 'L0001', 'M2618', '4', 8, 'Edge Cut', 4),
-- Toyota Keyways
('TOY43', 'Edge Cut', 'TOY43-AT', '10001', '15000', '6', 8, 'Edge Cut Split Wafer', 4),
('TOY48', 'High Security', 'TOY48', '40000', '49999', '6', 10, 'High Security Sidewinder', 4),
('TOY51', 'High Security', 'TOY51', '80000', '89999', '6', 8, 'High Security Sidewinder', 4),
-- Honda Keyways
('HON66', 'High Security', 'HON66', 'K001', 'N718', '6', 12, 'High Security Sidewinder', 4),
('HON70', 'Edge Cut', 'HON70', 'J00', 'U39', '6', 8, 'Flat Edge Cut', 4),
-- Nissan Keyways
('NSN14', 'Edge Cut', 'NSN14', '00001', '22185', '4', 10, 'Edge Cut Double-Sided', 4),
('DA34', 'Edge Cut', 'NSN14', '00001', '22185', '4', 10, 'Edge Cut Double-Sided', 4),
-- Hyundai/Kia Keyways
('HY14', 'Edge Cut', 'HYN11', 'T0001', 'T1000', '4', 10, 'Edge Cut Double-Sided', 4),
('HY16', 'Edge Cut', 'HY16', 'V0001', 'V1200', '4', 10, 'Flat Edge Cut', 4),
('HY18', 'High Security', 'HY20', 'T1001', 'T3500', '4', 8, 'High Security Sidewinder', 4),
('HY22', 'High Security', 'HY22', 'G0001', 'G2500', '4', 12, 'High Security Sidewinder', 4),
('MIT17', 'Edge Cut', 'MIT17', 'F1', 'F1571', '4', 10, 'Edge Cut Standard', 4),
-- BMW Keyways
('HU58', 'Edge Cut', 'HU58-V3', 'BH010001', 'BH241450', '4', 8, 'Edge Cut 4-Track External', 4),
('HU92', 'High Security', 'HU92-V3', 'Dealer/VIN', 'Dealer/VIN', '4', 8, 'High Security 2-Track', 4),
('HU100R', 'High Security', 'HU100R-V3', 'Dealer/VIN', 'Dealer/VIN', '4', 8, 'High Security 2-Track Sidewinder', 4),
-- Mercedes Keyways
('HU64', 'High Security', 'HU64-V3', '001', '6700', '5', 10, 'High Security 2-Track External', 4),
('HU39', 'High Security', NULL, 'HY6001', 'HY8130', '5', 10, 'Edge Cut', 4),
('YM23', 'Edge Cut', 'YM23', 'MCC0001', 'MCC1000', '4', 8, 'Edge Cut', 4),
-- VW/Audi Keyways
('HU66', 'High Security', 'HU66', '0001', '6000', '4', 9, 'High Security 2-Track Internal', 4),
('HU162', 'High Security', 'HU162T', 'MQB-Series', 'MQB-Series', '4', 10, 'High Security Side Cuts', 4);

-- Now update vehicle_variants with code_series based on make/lishi_tool
UPDATE vehicle_variants SET code_series = 'V0001-V5573' WHERE lishi_tool = 'HU100' AND code_series IS NULL;
UPDATE vehicle_variants SET code_series = '0001X-1706X' WHERE lishi_tool = 'HU101' AND code_series IS NULL;
UPDATE vehicle_variants SET code_series = 'M1-M2618' WHERE lishi_tool = 'CY24' AND code_series IS NULL;
UPDATE vehicle_variants SET code_series = 'K001-N718' WHERE lishi_tool = 'HON66' AND code_series IS NULL;
UPDATE vehicle_variants SET code_series = '00001-22185' WHERE lishi_tool = 'NSN14' AND code_series IS NULL;
UPDATE vehicle_variants SET code_series = 'G0001-G2500' WHERE lishi_tool = 'HY22' AND code_series IS NULL;
UPDATE vehicle_variants SET code_series = 'T0001-T3500' WHERE lishi_tool IN ('HY16', 'HY20') AND code_series IS NULL;
UPDATE vehicle_variants SET code_series = 'Dealer/VIN' WHERE lishi_tool IN ('HU92', 'HU100R') AND code_series IS NULL;
UPDATE vehicle_variants SET code_series = '0001-6000' WHERE lishi_tool IN ('HU66', 'HU162') AND code_series IS NULL;
UPDATE vehicle_variants SET code_series = '0001X-1706X' WHERE lishi_tool = 'MAZ24R' AND code_series IS NULL;

-- Toyota by year
UPDATE vehicle_variants SET code_series = '10001-15000' WHERE lishi_tool = 'TOY43' AND code_series IS NULL;
UPDATE vehicle_variants SET code_series = '40000-49999' WHERE lishi_tool = 'TOY48' AND code_series IS NULL;
UPDATE vehicle_variants SET code_series = '80000-89999' WHERE lishi_tool = 'TOY51' AND code_series IS NULL;
