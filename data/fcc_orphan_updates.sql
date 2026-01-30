-- FCC Orphan ID Updates from Research Documents
-- Generated: 2026-01-30
-- Sources: FCC_Orphan_ID_Analysis_and_Recovery.txt, FCC_ID_Investigation_for_Key_Fobs.txt

-- =============================================================================
-- PART 1: Update existing orphan FCC IDs with corrected data
-- =============================================================================

-- IYZ-AK2 (Audi B9 Smart Key - HIGH PRIORITY - needs image acquisition)
UPDATE fcc_complete SET
    manufacturer = 'Marquardt GmbH',
    frequency = 434,
    chip = 'Audi Advanced Key',
    key_type = 'smart',
    button_count = 4,
    notes = 'MLB Evo platform. Audi A4 B9, Q7 4M, A6/A7/A8 C8. 2017-2024. OEM Part: 4N0.959.754'
WHERE fcc_id = 'IYZ-AK2';

-- IYZ-MS2 (Mercedes FBS4 - Can map to IYZ3312 image)
UPDATE fcc_complete SET
    manufacturer = 'Marquardt GmbH',
    frequency = 315,
    chip = 'FBS4',
    key_type = 'smart',
    button_count = 4,
    notes = 'FBS4 generation. W205 C-Class, W222 S-Class, W213 E-Class. 2015-2020. OEM Part: A2229059610. Map to IYZ3312 image.'
WHERE fcc_id = 'IYZ-MS2';

-- IYZ-MS5 (Mercedes FBS4/UWB latest generation)
UPDATE fcc_complete SET
    manufacturer = 'Marquardt GmbH',
    frequency = 433,
    chip = 'FBS4/UWB',
    key_type = 'smart',
    button_count = 4,
    notes = 'Gen 2 keys. Mercedes EQS/EQE, W223 S-Class, W206 C-Class. 2022+. OEM Part: A2069058003. Map to IYZ3312 image.'
WHERE fcc_id = 'IYZ-MS5';

-- IYZDC07 (Mercedes FBS3 Chrome Key)
UPDATE fcc_complete SET
    manufacturer = 'Marquardt GmbH',
    frequency = 315,
    chip = 'FBS3',
    key_type = 'smart',
    button_count = 4,
    notes = 'W204 C-Class, W221 S-Class, W164 ML-Class. 2008-2012. OEM Part: 221-905-xx-xx. Map to IYZ3312 image.'
WHERE fcc_id = 'IYZDC07';

-- NBGDM3 (Mercedes FBS4 - Hella supplier)
UPDATE fcc_complete SET
    manufacturer = 'Hella KGaA Hueck & Co.',
    frequency = 315,
    chip = 'FBS4',
    key_type = 'smart',
    button_count = 4,
    notes = 'FBS4 DEALER-ONLY PROGRAMMING. CLA C117, GLA X156, E-Class W212. 2013-2020. OEM Part: A1779052201'
WHERE fcc_id = 'NBGDM3';

-- HUF5661 (BMW 868 MHz - QUARANTINE: Non-US frequency!)
UPDATE fcc_complete SET
    manufacturer = 'Huf Hülsbeck & Fürst',
    frequency = 868,
    chip = 'PCF7953 (Hitag Pro)',
    key_type = 'smart',
    button_count = 4,
    notes = '⚠️ NON-US FREQUENCY (868 MHz). European spec only. BMW F-Series CAS4/FEM. Do not sell for US vehicles.'
WHERE fcc_id = 'HUF5661';

-- CWTWBU619 (Infiniti FX - NOT Ford!)
UPDATE fcc_complete SET
    manufacturer = 'Alps Electric Co., Ltd.',
    frequency = 315,
    chip = 'Philips ID46',
    key_type = 'smart',
    button_count = 3,
    notes = 'Infiniti FX35/FX45 2005-2008. Oval intelligent key. OEM Part: 285E3-CL01D'
WHERE fcc_id = 'CWTWBU619';

-- MLBHLIK-1TA (Honda Remote Head Key Driver 2)
UPDATE fcc_complete SET
    manufacturer = 'Honda Lock Mfg.',
    frequency = 314,
    chip = 'Philips ID46',
    key_type = 'remote-head',
    button_count = 4,
    notes = 'Driver 2/Memory 2 config. Honda CR-V 2012-2013, Civic LX. OEM Part: 35118-T0A-A00. Same shell as MLBHLIK-1T.'
WHERE fcc_id = 'MLBHLIK-1TA';

-- KR5V2X-V44 (Honda Smart Key Driver 2)
UPDATE fcc_complete SET
    manufacturer = 'Continental Automotive',
    frequency = 433.92,
    chip = 'Hitag 3 (ID47)',
    key_type = 'smart',
    button_count = 5,
    notes = 'Driver 2 variant. Honda CR-V/Civic/Pilot 2016-2022. OEM Part: 72147-TLA-A22. Same as KR5V2X.'
WHERE fcc_id = 'KR5V2X-V44';

-- KBRASTU10 (Nissan Legacy RKE - LOW PRIORITY)
UPDATE fcc_complete SET
    manufacturer = 'Calsonic Kansei (Marelli)',
    frequency = 315,
    chip = 'Rolling Code',
    key_type = 'rke-fob',
    button_count = 3,
    notes = 'Legacy 2000-2001 only. Nissan Pathfinder, Xterra, Infiniti QX4. OEM Part: 28268-7J119'
WHERE fcc_id = 'KBRASTU10';

-- AB01602T (Cadillac 1996-1999 - LEGACY)
UPDATE fcc_complete SET
    manufacturer = 'General Motors',
    frequency = 315,
    chip = 'Legacy GM',
    key_type = 'rke-fob',
    button_count = 4,
    notes = 'LEGACY 1996-1999. Cadillac Deville/Seville/Catera. OEM Part: 16259829'
WHERE fcc_id = 'AB01602T';

-- L2C0005T (GM 2000s workhorse)
UPDATE fcc_complete SET
    manufacturer = 'Delphi Electronics',
    frequency = 315,
    chip = 'Legacy GM',
    key_type = 'rke-fob',
    button_count = 4,
    notes = 'Cadillac CTS, Chevy Cavalier, Pontiac Sunfire. 2000-2007. OEM Part: 16263074'
WHERE fcc_id = 'L2C0005T';

-- LHJ009 (Saturn L-Series - DEAD/ARCHIVE)
UPDATE fcc_complete SET
    manufacturer = 'Continental Automotive (Siemens VDO)',
    frequency = 315,
    chip = 'Saturn Specific',
    key_type = 'rke-fob',
    button_count = 4,
    notes = 'ARCHIVE: Saturn L-Series 2000-2005 (brand defunct). OEM Part: 22692190'
WHERE fcc_id = 'LHJ009';

-- GOH-PCGEN2 / G0H-PCGEN2 (Dealer-installed aftermarket)
UPDATE fcc_complete SET
    manufacturer = 'Code Systems Inc.',
    frequency = 433,
    chip = 'Aftermarket',
    key_type = 'remote-start',
    button_count = 4,
    notes = 'Dealer-installed remote start. Hyundai Tucson/Sonata 2011-2013, Ford add-on. OEM Part: 00056-ADU10'
WHERE fcc_id = 'GOH-PCGEN2' OR fcc_id = 'G0H-PCGEN2';

-- A2C94464500 (Continental component part number, NOT an FCC ID)
UPDATE fcc_complete SET
    notes = '⚠️ NOT A VALID FCC ID. This is a Continental internal part number (BCM/ECU). Cross-listed in error.'
WHERE fcc_id = 'A2C94464500';

-- =============================================================================
-- PART 2: Insert new 2024-2026 FCC registrations
-- =============================================================================

INSERT OR IGNORE INTO fcc_complete (fcc_id, manufacturer, frequency, chip, key_type, button_count, notes)
VALUES
-- Toyota/Denso 2024+
('HYQ14FNA', 'Denso Corporation', 433.58, 'Denso AES', 'smart', 4, '2025 Camry XV80, Crown Signia. Dual-channel diversity FSK. Replaces HYQ14FBW.'),
('HYQ14AKE', 'Denso Corporation', 433, 'Denso AES', 'smart', 4, '2024+ Lexus card-key/alternate form factor.'),

-- Mercedes/Marquardt 2024+
('IYZMS7I', 'Marquardt GmbH', 433.92, 'Marquardt Secure Element', 'smart', 4, 'MMA platform (2024+ CLA). Motion sensor for relay attack prevention. FSK modulation.'),
('IYZUK1', 'Marquardt GmbH', 2402, 'NFC+UWB+BLE SoC', 'smart', 4, 'Universal UWB key. Mercedes MMA platform, Lucid Gravity. BLE 2.4GHz + UWB 5-9GHz + NFC 13.56MHz.'),
('IYZMUB1', 'Marquardt GmbH', 8000, 'UWB Anchor', 'uwb-anchor', 0, 'Vehicle-side UWB anchor node for Digital Key triangulation. Mercedes MMA.'),

-- VW/Hella 2024+
('NBGFS197R', 'HELLA GmbH & Co. KGaA', 433.92, 'Megamos AES', 'smart', 4, 'VW Golf 8, ID.4, ID. Buzz. FS19 family revision. Hybrid 125kHz LF + 433MHz UHF.'),

-- Hyundai/Kia/Mobis
('TQ8-FOB-4FA1U44', 'Hyundai Mobis', 433.92, 'NCF29A1M (Hitag AES)', 'smart', 7, 'Kia EV9, Hyundai Ioniq 9. 2024-2026. Full UWB 7.9GHz. Digital Pattern lighting.'),

-- Ford/Continental
('LHJ-FE5NAR110', 'Continental Automotive Systems', 2402, 'Telematics Bridge', 'telematics', 0, 'Ford FNV2 TCU. Phone-as-Key gateway. BLE 2.4GHz.'),

-- Honda/Alps Alpine
('CWTB230X', 'Alps Alpine Co., Ltd.', 60000, 'Radar SoC', 'sensor', 0, '60GHz FMCW gesture sensor. Frictionless entry. Honda Afeela, premium Acura EVs.');


-- =============================================================================
-- PART 3: Image URL fallbacks (for display in app)
-- =============================================================================

-- These are eBay/locksmith supply URLs for image reference
-- In production, download these and upload to R2

UPDATE fcc_complete SET image_url = 'https://i.ebayimg.com/images/g/ZX4AAOSwBIxnnykc/s-l1600.jpg' WHERE fcc_id = 'IYZ-AK2' AND image_url IS NULL;
UPDATE fcc_complete SET image_url = 'https://i.ebayimg.com/images/g/a0wAAOSwW55hyPhf/s-l1600.jpg' WHERE fcc_id = 'IYZ-MS2' AND image_url IS NULL;
UPDATE fcc_complete SET image_url = 'https://i.ebayimg.com/images/g/C7IAAOSwAhpnV6F1/s-l1600.jpg' WHERE fcc_id = 'IYZ-MS5' AND image_url IS NULL;
UPDATE fcc_complete SET image_url = 'https://i.ebayimg.com/images/g/ZhkAAOSwR1VbLh0O/s-l1600.jpg' WHERE fcc_id = 'IYZDC07' AND image_url IS NULL;
UPDATE fcc_complete SET image_url = 'https://i.ebayimg.com/images/g/qbsAAOSwFQhnrBns/s-l1600.jpg' WHERE fcc_id = 'NBGDM3' AND image_url IS NULL;
UPDATE fcc_complete SET image_url = 'https://i.ebayimg.com/images/g/rMgAAOxy0xBMEknQ/s-l1600.jpg' WHERE fcc_id = 'HUF5661' AND image_url IS NULL;
UPDATE fcc_complete SET image_url = 'https://i.ebayimg.com/images/g/hkcAAOSwU~VnBnfj/s-l1600.jpg' WHERE fcc_id = 'CWTWBU619' AND image_url IS NULL;
UPDATE fcc_complete SET image_url = 'https://i.ebayimg.com/images/g/y84AAOSwK6RkT80f/s-l1600.jpg' WHERE fcc_id = 'AB01602T' AND image_url IS NULL;
UPDATE fcc_complete SET image_url = 'https://i.ebayimg.com/images/g/fToAAOSwNTZmNdmq/s-l1600.jpg' WHERE fcc_id = 'L2C0005T' AND image_url IS NULL;
UPDATE fcc_complete SET image_url = 'https://i.ebayimg.com/images/g/4REAAOSW1LxmhJXg/s-l1600.jpg' WHERE fcc_id = 'LHJ009' AND image_url IS NULL;
UPDATE fcc_complete SET image_url = 'https://i.ebayimg.com/images/g/176842525250/s-l1600.jpg' WHERE fcc_id = 'IYZ-AK2' AND image_url IS NULL;
