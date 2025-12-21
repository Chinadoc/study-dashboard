-- Master Research Integration: GM, Ford, VAG
-- Surfacing high-security architectural splits and bypass requirements

-- 1. GM GLOBAL B (VIP) ENRICHMENT
-- Corvette C8
UPDATE vehicles 
SET rf_system = 'Global B (VIP)', service_notes_pro = '⚠️ Global B Architecture. Native CAN FD. Requires 24-digit online token. E99 ECM is heavily encrypted.'
WHERE make = 'Chevrolet' AND model = 'Corvette' AND year_start >= 2020;

-- Silverado/Sierra 1500 (2022 Split)
UPDATE vehicles 
SET rf_system = 'Global A (Legacy)', service_notes_pro = '⚠️ Limited (Pre-Refresh). Global A Architecture. Verified if 12th VIN digit is 0-4.'
WHERE (make = 'Chevrolet' OR make = 'GMC') AND (model = 'Silverado 1500' OR model = 'Sierra 1500') AND year_start = 2022;

UPDATE vehicles 
SET rf_system = 'Global B (VIP)', vin_ordered = 1, dealer_tool_only = 'CAN FD + Online Token',
    service_notes_pro = '🛡️ Refresh (2022.5). Global B Architecture. 12th VIN digit is 5-9. Mandatory CAN FD adapter.'
WHERE (make = 'Chevrolet' OR make = 'GMC') AND (model = 'Silverado 1500' OR model = 'Sierra 1500') AND year_start >= 2023;

-- Full-Size SUVs
UPDATE vehicles 
SET rf_system = 'Global B (VIP)', dealer_tool_only = 'CAN FD + Online Token',
    service_notes_pro = '⚠️ Global B Architecture. Online server handshake required for all key functions.'
WHERE make IN ('Chevrolet', 'GMC', 'Cadillac') AND model IN ('Tahoe', 'Suburban', 'Yukon', 'Yukon XL', 'Escalade') AND year_start >= 2021;

-- 2. FORD 2021+ SECURITY (LOCKED BCM)
-- F-150 & Bronco
UPDATE vehicles 
SET dealer_tool_only = '12-Pin BCM Bypass', 
    service_notes_pro = '🛡️ Locked BCM. "Active Theft" mode disables OBD port. Use 12-pin bypass cable at BCM.'
WHERE make = 'Ford' AND (model = 'F-150' OR model = 'Bronco') AND year_start >= 2021;

-- Mach-E
UPDATE vehicles 
SET dealer_tool_only = 'SGW Bypass', 
    service_notes_pro = '⚠️ Secure Gateway (SGW) active. Requires Ford SGW bypass for writing.'
WHERE make = 'Ford' AND model = 'Mustang Mach-E' AND year_start >= 2021;

-- 3. VAG MQB-EVO PLATFORM
-- Golf 8 & Audi A3 8Y
UPDATE vehicles 
SET rf_system = 'MQB-Evo', dealer_tool_only = 'Online ODIS/SVM',
    service_notes_pro = '🛑 MQB-Evo Platform. Sync Data reading blocked via OBD. Dealer adaptation or specialized ECU lab work required.'
WHERE (make = 'Volkswagen' AND model = 'Golf') AND year_start >= 2020;

UPDATE vehicles 
SET rf_system = 'MQB-Evo', dealer_tool_only = 'Online ODIS/SVM',
    service_notes_pro = '🛑 MQB-Evo Platform. Sync Data reading blocked. 2020+ A3 (8Y) uses FS12P smart keys.'
WHERE (make = 'Audi' AND model = 'A3') AND year_start >= 2020;

-- 4. VIN WMI REFERENCE UPDATES
INSERT OR REPLACE INTO vin_wmi_reference (wmi, country, manufacturer, plant, key_architecture, notes)
VALUES 
('1G1', 'USA', 'Chevrolet', 'Bowling Green', 'Global B (VIP)', 'Corvette C8 Architecture'),
('1GC', 'USA', 'Chevrolet', 'Fort Wayne', 'GM Platforms', 'Check 12th digit for 2022 Silverado platform split'),
('1GT', 'USA', 'GMC', 'Fort Wayne', 'GM Platforms', 'Check 12th digit for 2022 Sierra platform split'),
('3GY', 'Mexico', 'Cadillac', 'Ramos Arizpe', 'Global B (VIP)', 'CT4/CT5 Security Protocol'),
('CD', 'Germany', 'Volkswagen', 'Wolfsburg', 'MQB-Evo', 'Golf Mk8 Platform'),
('GY', 'Germany', 'Audi', 'Ingolstadt', 'MQB-Evo', 'Audi A3 (8Y) Platform');
