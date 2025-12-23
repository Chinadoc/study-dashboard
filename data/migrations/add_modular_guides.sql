-- Migration: Modular Guide System
-- Adds support for JSON-structured vehicle guides with block-based content

-- 1. Add new columns to vehicle_guides for modular content
ALTER TABLE vehicle_guides ADD COLUMN IF NOT EXISTS content_json TEXT;
ALTER TABLE vehicle_guides ADD COLUMN IF NOT EXISTS legacy_content TEXT;
ALTER TABLE vehicle_guides ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE vehicle_guides ADD COLUMN IF NOT EXISTS estimated_time TEXT;
ALTER TABLE vehicle_guides ADD COLUMN IF NOT EXISTS system_id TEXT;

-- 2. Create guide_systems table for inheritance
CREATE TABLE IF NOT EXISTS guide_systems (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  applies_to_makes TEXT,
  year_start INTEGER,
  year_end INTEGER,
  architecture_notes TEXT,
  universal_blocks TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insert base security systems for inheritance
INSERT OR REPLACE INTO guide_systems (id, name, applies_to_makes, year_start, year_end, architecture_notes) VALUES
  ('bmw-ews', 'BMW EWS (E-Series)', 'BMW', 1995, 2006, 'EWS Box under dash, Motorola MCU, rolling codes with DME'),
  ('bmw-cas', 'BMW CAS (E-Series)', 'BMW', 2002, 2014, 'CAS Module, CAN-BUS, flash downgrade risk on CAS3+'),
  ('bmw-fem-bdc', 'BMW FEM/BDC (F-Series)', 'BMW,MINI', 2012, 2019, 'Body controller integrated security, EEPROM preprocessing required'),
  ('bmw-g-series', 'BMW BDC2/BDC3 (G-Series)', 'BMW', 2018, 2999, 'Cloud calculation required, AES-128, dealer-level on 2021+'),
  ('cdjr-skim', 'CDJR SKIM/SKREEM', 'Chrysler,Dodge,Jeep,RAM', 1998, 2010, 'Static PIN codes, ID46 transponders'),
  ('cdjr-win', 'CDJR WIN/Fobik', 'Chrysler,Dodge,Jeep,RAM', 2008, 2014, 'Wireless Ignition Node, Daimler-era design'),
  ('cdjr-rfh', 'CDJR RFH Keyless', 'Chrysler,Dodge,Jeep,RAM', 2011, 2999, 'RF Hub, rolling PINs, SGW bypass required 2018+'),
  ('mercedes-das3', 'Mercedes DAS3/FBS3', 'Mercedes-Benz', 2000, 2014, 'EIS central node, SHA-1 hash, IR communication'),
  ('mercedes-fbs4', 'Mercedes FBS4', 'Mercedes-Benz', 2014, 2999, '128-bit AES, dealer-only, no public solution'),
  ('nissan-nats5', 'Nissan NATS 5/6', 'Nissan,Infiniti', 2000, 2012, 'BCM-centric, static PIN from label'),
  ('nissan-rolling', 'Nissan Rolling Code', 'Nissan,Infiniti', 2013, 2999, '20/22-digit rolling codes, ESCL failure common'),
  ('ford-pats-legacy', 'Ford PATS I/II', 'Ford,Lincoln,Mercury', 1996, 2012, '40/80-bit chips, 2-key programming requirement, Incode/Outcode'),
  ('ford-pats-modern', 'Ford Modern PATS', 'Ford,Lincoln', 2013, 2999, 'BCM-based security, high encryption, RH850 on 2021+'),
  ('hyundai-smartra', 'Hyundai SMARTRA', 'Hyundai,Kia', 2006, 2016, 'Standalone or BCM-integrated, PIN code required'),
  ('hyundai-smartkey', 'Hyundai Smart Key', 'Hyundai,Kia', 2010, 2999, 'Proximity systems, SGW on 2019+, ID46/47/4A chips'),
  ('mazda-pats', 'Mazda Ford PATS Era', 'Mazda', 2000, 2013, 'Ford platform, 4D-63 chips, Incode/Outcode'),
  ('mazda-skyactiv', 'Mazda SkyActiv', 'Mazda', 2013, 2999, 'SSU architecture, ID49, SGW on 7th gen'),
  ('volvo-p2', 'Volvo P2 Platform', 'Volvo', 1999, 2014, 'CEM central, ID48 Megamos, remote in UEM mirror'),
  ('volvo-p3', 'Volvo P3 Platform', 'Volvo', 2007, 2018, 'CEM + KVM dual module, ID46, SCL failures'),
  ('volvo-spa', 'Volvo SPA/CMA', 'Volvo', 2016, 2999, 'HITAG AES, iCUP gateway on 2022+');

-- 4. Migrate existing content to legacy_content column
UPDATE vehicle_guides 
SET legacy_content = content 
WHERE content IS NOT NULL AND legacy_content IS NULL;

-- 5. Create index for JSON queries
CREATE INDEX IF NOT EXISTS idx_guides_system ON vehicle_guides(system_id);
CREATE INDEX IF NOT EXISTS idx_guides_make_model ON vehicle_guides(make, model);
