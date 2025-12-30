-- Migration: Legacy & Pre-2005 Deep Dive
-- Description: Integration of legacy transponder types and security data for pre-2005 vehicles.

-- 1. Create Historic Transponder Reference Table
CREATE TABLE IF NOT EXISTS historic_transponder_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chip_type TEXT UNIQUE,
    technology TEXT,
    modulation TEXT,
    oem_reference TEXT,
    logic_type TEXT, -- Fixed, Crypto (40-bit), Crypto (80-bit)
    common_vci_support TEXT
);

-- 2. Seed Historic Transponder Data
INSERT OR IGNORE INTO historic_transponder_reference (chip_type, technology, modulation, oem_reference, logic_type, common_vci_support) VALUES
('4C', 'TI Fixed', '134.2 kHz', 'Toyota Type 1', 'Fixed', 'Lonsdor SKE, Autel EEPROM'),
('4D60', 'TI Crypto', '134.2 kHz', 'Nissan NATS 5, Ford PATS', 'Crypto (40-bit)', 'Autel, Xhorse, Lonsdor'),
('4D63 (40-bit)', 'TI Crypto', '134.2 kHz', 'Ford PATS, Mazda', 'Crypto (40-bit)', 'Autel, Xhorse'),
('4D63 (80-bit)', 'TI Crypto', '134.2 kHz', 'Ford PATS (2011+)', 'Crypto (80-bit)', 'Autel, VVDI'),
('4D67', 'TI Crypto', '134.2 kHz', 'Toyota Type 2', 'Crypto (40-bit)', 'Autel (16-min Reset), Xhorse'),
('4D68', 'TI Crypto', '134.2 kHz', 'Lexus Type 2', 'Crypto (40-bit)', 'Autel, Lonsdor'),
('ID33', 'Fixed', '125 kHz', 'Nissan NATS 2, early GM', 'Fixed', 'Autel (14-pin adapter)'),
('ID46', 'Philips Hitag 2', '125 kHz', 'GM PK3+, Honda Type 2/3', 'Crypto (40-bit)', 'Autel, Xhorse, Smart Pro'),
('ID48', 'Megamos Crypto', '125 kHz', 'VW, Audi, early Honda', 'Crypto', 'VVDI, Autel'),
('Megamos 13', 'Fixed', '125 kHz', 'Honda Type 1 (Red Key)', 'Fixed', 'Autel EEPROM, XP400'),
('VATS', 'Resistor', 'Analog', 'GM (1986-2002)', 'Analog', 'Manual OHM Reading');

-- 3. Enrich vehicles for Legacy Models
-- Note: Using vehicles as per assignment, though consolidation might have occurred.
-- We target 1995-2005 ranges to update legacy-specific security notes and bypass methods.

-- Toyota 4C Legacy
UPDATE vehicles 
SET chip_type = '4C',
    security_notes = 'Type 1 Immobilizer. AKL requires EEPROM (93C66) or Lonsdor OBD Emulation. Master Key (Black) required for OBD Add Key.',
    bypass_method = 'EEPROM (Virginize) / Lonsdor SKE OBD'
WHERE make = 'Toyota' AND year_start <= 2002 AND (chip_type IS NULL OR chip_type = '');

-- Honda Red Key Legacy
UPDATE vehicles
SET chip_type = 'Megamos 13',
    security_notes = 'Type 1 "Red Key" System. AKL requires 93C46 EEPROM reading or ICU replacement.',
    bypass_method = 'EEPROM (93C46) / ICU Replacement'
WHERE make = 'Honda' AND model IN ('Prelude', 'NSX', 'CR-V', 'Odyssey') AND year_start <= 2001;

-- GM Passlock
UPDATE vehicles
SET security_notes = 'Passlock I/II (No Chip). Security is resistor-based in cylinder. Requires 30-minute manual relearn (3 cycles of 10 min).',
    programming_method = '30-Minute Relearn (Manual)',
    bypass_method = 'Resistor Bypass / Manual Relearn'
WHERE make = 'Chevrolet' AND model IN ('Impala', 'Malibu', 'Monte Carlo') AND year_start <= 2005 AND year_end >= 2000;

-- Nissan NATS 5
UPDATE vehicles
SET chip_type = '4D60',
    security_notes = 'NATS 5.0 system. Requires 4-digit PIN derived from 5-digit BCM label code.',
    programming_method = 'OBD with PIN (BCM Code)',
    bypass_method = 'BCM PIN Calculation'
WHERE make = 'Nissan' AND year_start >= 2000 AND year_end <= 2005;

-- Ford PATS (Early 4D)
UPDATE vehicles
SET chip_type = '4D63 (40-bit)',
    security_notes = 'PATS system. Historically requires 10-minute timed wait for OBD security access.',
    programming_method = 'OBD (10-min Timed Wait)',
    bypass_method = 'Timed Access'
WHERE make = 'Ford' AND year_start <= 2010 AND year_end >= 2000;
