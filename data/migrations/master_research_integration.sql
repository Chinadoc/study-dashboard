-- Master Research Integration: Toyota, Kia, BMW
-- Surfacing architectural transitions and security requirements

-- 1. VIN WMI REFERENCE UPDATES
INSERT OR REPLACE INTO vin_wmi_reference (wmi, country, manufacturer, plant, key_architecture, notes)
VALUES 
-- Toyota: Japan builds use 314.3MHz (Tokai Rika), NA builds use 315MHz (Denso)
('JT', 'Japan', 'Toyota', 'Toyota City/Tahara', 'Tokai Rika (314.3MHz)', 'Verify Board ID for J-VIN Toyota models'),
('JTM', 'Japan', 'Toyota', 'Tahara', 'Tokai Rika (314.3MHz)', 'TSS 3.0/BA possible on 2023+'),
('2T3', 'Canada', 'Toyota', 'TMMC', 'Denso (315MHz)', 'Standard NAFTA Toyota architecture'),
('4T1', 'USA', 'Toyota', 'TMMK', 'Denso (315MHz)', 'Standard NAFTA Toyota architecture'),
('5TD', 'USA', 'Toyota', 'TMMI', 'Denso (315MHz)', 'Standard NAFTA Toyota architecture'),
-- BMW
('WBA', 'Germany', 'BMW', 'Munich', 'BMW Security', 'F-Series splits: F10=CAS4, F30=FEM'),
('WBS', 'Germany', 'BMW M', 'Munich', 'BMW Security', 'High probability of Locked DME post-06/2020'),
('5UX', 'USA', 'BMW', 'Spartanburg', 'BMW Security', 'X3/X5 architectures. F25=CAS4, F15=BDC'),
-- Kia/Hyundai
('5XX', 'USA', 'Kia', 'Georgia', 'Kia Security', 'Telluride/Sportage CAN FD split in June 2023'),
('KNA', 'Korea', 'Kia', 'Korea', 'Kia Security', 'Export models may have different SGW locations');

-- 2. TOYOTA ENRICHMENT (H-Chip & TSS 3.0 Splits)
-- Camry
UPDATE vehicles 
SET rf_system = 'Denso (315MHz)', service_notes_pro = 'H-Chip bladed key standard on L/LE trims. 2018+ XV70 is H-Chip only.'
WHERE make = 'Toyota' AND model = 'Camry' AND year_start >= 2018;

UPDATE vehicles 
SET rf_system = 'TSS 3.0 (BA)', service_notes_pro = '⚠️ 2025 XV80 Refresh uses BA-type encryption. Requires updated emulators.'
WHERE make = 'Toyota' AND model = 'Camry' AND year_start = 2025;

-- RAV4
UPDATE vehicles 
SET rf_system = 'Continental/Denso', service_notes_pro = '⚠️ Split Year: 2016-2018 is H-Chip. 2013-2015 is G-Chip. Check blade stamp.'
WHERE make = 'Toyota' AND model = 'RAV4' AND year_start BETWEEN 2013 AND 2018;

UPDATE vehicles 
SET rf_system = 'Denso (315MHz)', service_notes_pro = 'TNGA XA50 platform. All bladed keys are H-Chip.'
WHERE make = 'Toyota' AND model = 'RAV4' AND year_start >= 2019;

-- 3. KIA/HYUNDAI ENRICHMENT (Campaign 993 & CAN FD)
-- Campaign 993 Warnings
UPDATE vehicles 
SET service_notes_pro = '🛡️ Campaign 993 Updated. "Virtual Immobilizer" active. Must unlock via fob to disarm. OBD PIN reading blocked.'
WHERE (make = 'Kia' OR make = 'Hyundai') AND year_start BETWEEN 2011 AND 2021 AND key_type = 'Mechanical';

-- CAN FD Split (June 2023)
UPDATE vehicles 
SET dealer_tool_only = 'CAN FD Adapter', service_notes_pro = '⚠️ CAN FD Architecture. Standard OBD programmers will fail. June 2023 split.'
WHERE (make = 'Kia' OR make = 'Hyundai') 
AND (model = 'Telluride' OR model = 'Sportage' OR model = 'Santa Fe')
AND year_start >= 2023;

-- 4. BMW ENRICHMENT (CAS4 vs FEM/BDC & DME Lock)
-- CAS4 Models
UPDATE vehicles 
SET service_notes_pro = 'Architecture: CAS4. ISN retrieval from DME usually optional if CAS can be read.'
WHERE make = 'BMW' AND (model = '5-Series' OR model = 'X3') AND year_start BETWEEN 2011 AND 2016;

-- FEM/BDC Models
UPDATE vehicles 
SET service_notes_pro = 'Architecture: FEM/BDC. ⚠️ Circular Dependency: Requires DME ISN to unlock FEM for preprocessing.'
WHERE make = 'BMW' AND (model = '3-Series' OR model = '4-Series' OR model = 'X5') AND year_start BETWEEN 2012 AND 2018;

-- June 2020 DME Lock
UPDATE vehicles 
SET vin_ordered = 1, dealer_tool_only = 'Dealer Key / Lab Unlock', 
    service_notes_pro = '🛑 Post-06/2020 DME Lock. Aftermarket AKL effectively closed. Order key by VIN.'
WHERE make = 'BMW' AND year_start >= 2020;
