-- ═══════════════════════════════════════════════════════════════════════════
-- CROSS-REFERENCE DEEP DIVE MIGRATION
-- Source: Cross-Reference Database, System Specs, Transponder Chip DB, Universal Remotes
-- Generated: 2025-12-26
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN TRANSACTION;

-- 1. Chip ID Reference Table
CREATE TABLE IF NOT EXISTS chip_id_reference (
    chip_id TEXT PRIMARY KEY,
    common_name TEXT,
    encryption TEXT,
    clonability TEXT,
    compatible_substrates TEXT,
    technical_notes TEXT
);

INSERT OR REPLACE INTO chip_id_reference (chip_id, common_name, encryption, clonability, compatible_substrates, technical_notes) VALUES
('4C', 'Texas Fixed Code', 'None (Fixed)', 'Yes', 'CN1, TPX1, XT27', 'Glass or carbon wedge; early Ford/Toyota'),
('4D-60', 'Texas Crypto Generic', '40-bit', 'Yes (Sniff)', 'CN2, TPX2, XT27', 'Generic TI logic'),
('4D-63 (40)', 'Ford/Mazda 40-bit', '40-bit', 'Yes (Sniff)', 'CN2, TPX2, XT27', 'Blue chip; early PATS 3'),
('4D-63 (80)', 'Ford/Mazda 80-bit', '80-bit', 'Yes (Sniff)', 'CN5, LKP-02, XT27', 'SA/HA stamp; backward compatible with 40-bit'),
('4D-67', 'Toyota Dot Chip', '40-bit', 'Yes (Sniff)', 'CN2, TPX2, XT27', 'Dot/dimple stamp on blade'),
('4D-72 (G)', 'Toyota G-Chip', '80-bit', 'Yes (Sniff)', 'CN5, LKP-02, XT27', 'G stamp on blade; TI DST-80'),
('8A (H)', 'Toyota H-Chip', '128-bit AES', 'Yes (Advanced)', 'LKP-04, XT27', 'H stamp on blade; modern bladed Toyota'),
('ID46', 'Philips Crypto 2', '48-bit', 'Yes (Sniff)', 'CN3, TPX3/4, XT27', 'GM Circle Plus, Honda, Nissan, Chrysler'),
('ID47', 'Hitag 3', '96-bit', 'No/Limited', 'XT27 (some)', 'Honda Smart Key (2014+), Hyundai/Kia'),
('ID48', 'Megamos Crypto', '48-bit', 'Yes (96-bit Cloud)', 'Super Chip, GDX', 'VAG Immo 3/4, Volvo, Honda (2003-06)'),
('ID49', 'Hitag Pro', '128-bit', 'No', 'N/A', 'Ford/Mazda modern (2015+); Proximity'),
('ID4A', 'Hitag AES', '128-bit', 'No/Limited', 'N/A', 'Nissan 2020+, Hyundai/Kia latest'),
('ID88 (MQB)', 'Megamos AES', '128-bit', 'No', 'N/A', 'VAG MQB platform; highly secure'),
('8A-BA', 'Toyota Smart (New)', '128-bit AES', 'No', 'N/A', 'Toyota TNGA platform 2019+; restricted bypass');

-- 2. Frequency By Chassis Table
CREATE TABLE IF NOT EXISTS frequency_by_chassis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT,
    model TEXT,
    chassis_code TEXT,
    region TEXT DEFAULT 'US',
    frequency_mhz REAL,
    modulation TEXT,
    notes TEXT
);

INSERT INTO frequency_by_chassis (make, model, chassis_code, region, frequency_mhz, modulation, notes) VALUES
('Ford', 'F-150', 'Gen 13', 'US', 902.0, 'FSK', 'High bandwidth; Signal penetration'),
('Ford', 'F-150', 'Gen 11/12', 'US', 315.0, 'ASK', 'Legacy system'),
('Nissan', 'Altima', 'L33', 'US', 433.92, 'FSK', 'Hitag 3 logic'),
('Nissan', 'Altima', 'L34', 'US', 433.92, 'FSK', 'Hitag AES logic'),
('Toyota', 'RAV4', 'XA40', 'US', 312.1, 'Dual', '312.1/314.35 MHz dual pair'),
('Toyota', 'RAV4', 'XA50', 'US', 315.0, 'FSK', 'TNGA smart key system'),
('BMW', 'E-Series', 'CAS3', 'US', 315.0, 'ASK', 'Rechargeable battery (VL2020)'),
('BMW', 'F-Series', 'CAS4', 'US', 315.0, 'FSK', 'Rolling code security'),
('Mercedes', 'C-Class', 'W204', 'US', 315.0, 'FSK', 'Infrared (IR) primary/RF backup');

-- 3. Key Blank Cross-Reference Table
CREATE TABLE IF NOT EXISTS key_blank_crossref (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    oem_ref TEXT,
    ilco_ref TEXT,
    silca_ref TEXT,
    jma_ref TEXT,
    strattec_ref TEXT,
    blade_type TEXT,
    notes TEXT
);

INSERT INTO key_blank_crossref (oem_ref, ilco_ref, silca_ref, jma_ref, strattec_ref, blade_type, notes) VALUES
('164-R8070', 'H92-PT', 'FO38', 'FO-20DE', '5912560', 'Edge (8-cut)', 'Ford 80-bit IKT'),
('164-R8130', 'H128-PT', 'HU101', 'FO-24', '5925315', 'Laser-Internal', 'Ford 2015+ Flip Key'),
('89070-06420', 'TOY43-PT', 'TOY43', 'TOYO-15E', '--', 'Edge (TR47)', 'Toyota G-Stamp'),
('89070-42D30', 'TR47-PT', 'TOY43', 'TOYO-15', '--', 'Edge (TR47)', 'Toyota H-Stamp'),
('35118-TA0-A00', 'HO03-PT', 'HON66', 'HOND-24', '5907553', 'Laser-External', 'Honda 2008-2012 Accord'),
('13577770', 'B119-PT', 'HU100', 'GM-37', '5922534', 'Laser-Internal', 'GM HU100 Z-Keyway'),
('68066873AA', 'Y170-PT', 'CY24', 'CHR-15E', '5923790', 'Edge (Double)', 'Chrysler/Dodge Fobik Pod Key'),
('68293535AA', 'SIP22-PT', 'SIP22', 'FI-16', '--', 'Laser-Internal', 'Jeep Wrangler JL / Fiat logic');

COMMIT;
