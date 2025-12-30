-- Migration: Integrate Asian Makes from Google Docs Research
-- Target Tables: vehicles, fcc_reference, vehicle_guides



-- =============================================
-- 1. HONDA / ACURA
-- =============================================

-- Update vehicles for 11th Gen Honda/Acura
UPDATE vehicles 
SET 
    chip = 'Hitag AES (4A)',
    security_notes = 'Rolling Code Blockade: Extreme risk of BCM/BSI bricking if incorrect protocol selected. Manual selection "Civic FE" or "Accord CY" mandatory.',
    bypass_method = 'None (OBD Handshake)',
    sgw_required = 0
WHERE (make = 'Honda' AND model IN ('Civic', 'Accord') AND year_start >= 2022)
   OR (make = 'Acura' AND model = 'Integra' AND year_start >= 2023);

-- Insert FCC References for Honda
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, notes) VALUES
('KR5TP-4', 'Honda', 'Civic', 2022, 2025, '433.92MHz', 'NCF29A1M (4A)', '11th Gen Sedan/Hatchback'),
('KR5TP-4', 'Honda', 'Accord', 2023, 2025, '433.0MHz', 'NCF29A1M (4A)', '11th Gen'),
('KR5TP-2', 'Acura', 'Integra', 2023, 2025, '434.0MHz', 'Hitag AES (4A)', 'Uses KR5TP-2 specifically');

-- Honda Guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool) VALUES
('honda-civic-11gen-bsi', 'Honda', 'Civic', 2022, 2025, 'Honda 11th Gen BSI Recovery', '## Honda 11th Gen BSI Recovery
1. **Selection Alert**: DO NOT select "Yes" when asked if vehicle is 2020+. Manually select "Civic (FE)".
2. **Procedure**: Immo Scan -> Manual Selection -> Civic -> Smart Key -> Push to Start.
3. **Recovery**: If BCM is "bricked" (No Start), use Xhorse Universal Smart Key (Honda 2022+ profile) to force sync. Capacitive discharge recommended before recovery.', 'AKL', 'Autel'),
('honda-accord-11gen-security', 'Honda', 'Accord', 2023, 2025, 'Honda Accord 11th Gen Security', '## Honda Accord 11th Gen Security
1. **BSI Access**: Connect via OBD. Requires internet for online challenge-response calculation.
2. **Warning**: Selecting generic CAN-FD protocol will induce Defensive Lockdown (Brick). Use Manual Selection CY chassis.', 'AKL', 'Autel'),
('acura-integra-fe-protocol', 'Acura', 'Integra', 2023, 2025, 'Acura Integra FE Protocol', 'Follow 11th Gen Civic FE protocol. Requires KR5TP-2 FCC ID key.', 'AKL', 'Autel');

-- =============================================
-- 2. NISSAN / INFINITI
-- =============================================

-- Update vehicles for New Gateway Systems
UPDATE vehicles 
SET 
    chip = 'Hitachi AES (4A)',
    security_notes = 'Security Gateway (SGW) present. 22-digit or 28-digit Rolling PIN. 433MHz standardize.',
    bypass_method = 'Nissan 16+32 or 40-Pin BCM',
    sgw_required = 1
WHERE make IN ('Nissan', 'Infiniti') AND year_start >= 2020;

-- Specific Bypass Requirements
UPDATE vehicles SET bypass_method = 'Nissan 40-Pin BCM Mandatory' WHERE make = 'Nissan' AND model IN ('Rogue', 'Pathfinder') AND year_start >= 2021;
UPDATE vehicles SET bypass_method = 'Nissan 40-Pin BCM Preferred' WHERE make = 'Nissan' AND model = 'Sentra' AND year_start >= 2020;
UPDATE vehicles SET bypass_method = '16+32 Bypass Cable' WHERE make = 'Nissan' AND model = 'Frontier' AND year_start >= 2022;

-- Insert FCC References for Nissan
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, notes) VALUES
('KR5TXN1', 'Nissan', 'Rogue', 2021, 2025, '433MHz', '4A', 'Base S/SV trims'),
('KR5TXN3', 'Nissan', 'Rogue', 2021, 2025, '433MHz', '4A', 'SL/Platinum trims'),
('KR5TXN7', 'Nissan', 'Pathfinder', 2022, 2025, '433MHz', '4A', 'R53 Platform'),
('KR5TXN3', 'Nissan', 'Sentra', 2020, 2025, '433MHz', '4A', 'B18 Platform'),
('KR5TXN7', 'Nissan', 'Frontier', 2022, 2025, '433MHz', '4A', 'D41 Platform');

-- Nissan Guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool) VALUES
('nissan-t33-r53-bypass', 'Nissan', 'Rogue', 2021, 2025, 'Nissan T33 / R53 Bypass Guide', '## Nissan T33 / R53 Bypass Guide
1. **AKL Requirement**: 16+32 cable is NOT sufficient for PIN reading on Read-Protected BCMs.
2. **Hardware**: Must use Nissan-40 Pin BCM Cable to connect directly to the BCM.
3. **PIN**: Requires server calculation for 22-digit rolling PIN.
4. **Frequency**: 433MHz only. 315MHz keys will fail.', 'AKL', 'General'),
('nissan-sentra-b18-akl', 'Nissan', 'Sentra', 2020, 2025, 'Sentra B18 AKL', '## Sentra B18 AKL
1. **Access**: SGW under driver dashboard. Use 40-pin BCM cable for reliable PIN extraction.
2. **PIN**: 28-digit encryption. Server calculation required.', 'AKL', 'Autel'),
('nissan-frontier-bypass', 'Nissan', 'Frontier', 2022, 2025, 'Nissan Frontier Bypass', '16+32 Bypass cable generally sufficient. SGW located near OBD or fuse box.', 'AKL', 'General');

-- =============================================
-- 3. HYUNDAI / KIA
-- =============================================

-- Update vehicles for CAN FD / SGW
UPDATE vehicles 
SET 
    chip = 'Hitag3 (ID47)',
    security_notes = 'Post-June 2023 production uses CAN FD. SGW 12+8 bypass often required. Campaign 993/CS920 blocks OBD PIN reading.',
    bypass_method = '12+8 Bypass + CAN FD Adapter',
    sgw_required = 1
WHERE (make IN ('Hyundai', 'Kia') AND year_start >= 2022);

-- Insert FCC References for Hyundai/Kia
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, notes) VALUES
('TQ8-FOB-4F24', 'Kia', 'Telluride', 2020, 2022, '433MHz', 'ID47', 'Standard CAN'),
('TQ8-FOB-4F27', 'Kia', 'Telluride', 2023, 2025, '433MHz', 'ID47', 'SGW/CAN FD'),
('TQ8-FOB-4F27', 'Kia', 'Sportage', 2023, 2025, '433MHz', 'ID47', 'SGW/CAN FD'),
('TQ8-FOB-4F27', 'Hyundai', 'Palisade', 2023, 2025, '433MHz', 'ID47', 'SGW/CAN FD'),
('TQ8-FOB-4F27', 'Hyundai', 'Santa Fe', 2021, 2024, '433MHz', 'ID47', 'SGW/CAN FD');

-- Hyundai/Kia Guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool) VALUES
('kia-hyundai-canfd-protocol', 'Kia', 'Telluride', 2023, 2025, 'Kia/Hyundai 2024+ CAN FD Protocol', '## Kia/Hyundai 2024+ CAN FD Protocol
1. **Hardware**: CAN FD Adapter is MANDATORY for post-June 2023 production.
2. **Bypass**: Use 12+8 Bypass cable if AutoAuth/SGW blocks write access.
3. **PIN**: OBD PIN reading is blocked by Campaign 993/CS920 firmware. Must purchase 6-digit PIN from dealer/broker.
4. **Teaching**: Once PIN is accepted, teaching window is only 5 seconds. Hold fob to button immediately.', 'AKL', 'General'),
('hyundai-solterra-etnga', 'Hyundai', 'Solterra', 2023, 2025, 'Hyundai Solterra e-TNGA', 'Uses Toyota e-TNGA platform. 315MHz frequency. FCC ID HYQ14FBX (Toyota 8A).', 'AKL', 'General');

-- =============================================
-- 4. MAZDA
-- =============================================

-- Update vehicles for SkyActiv / Gen 7
UPDATE vehicles 
SET 
    chip = 'Hitag Pro (ID49)',
    security_notes = 'SkyActiv SSU system. Gen 7 (2019+) uses SGW and 128-bit AES. OTP Keys (No Reuse).',
    bypass_method = 'SGW Online Auth (Hazard/Brake wake)',
    sgw_required = 1
WHERE make = 'Mazda' AND year_start >= 2013;

-- Insert FCC References for Mazda
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, notes) VALUES
('MAZ24', 'Mazda', '3', 2004, 2013, '315MHz', '4D-63', 'Ford PATS Era'),
('MAZ24', 'Mazda', '6', 2004, 2013, '315MHz', '4D-63', 'Ford PATS Era'),
('MZ31', 'Mazda', '3', 2014, 2018, '315MHz', 'ID49', 'SkyActiv Gen 1'),
('MZ31', 'Mazda', '3', 2019, 2025, '433MHz', 'ID49/AES', 'Gen 7 Secure Gateway');

-- Mazda Guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool) VALUES
('mazda-skyactiv-akl', 'Mazda', 'General', 2014, 2019, 'Mazda SkyActiv AKL', '## Mazda SkyActiv AKL
1. **Alarm**: Locked vehicles in AKL state will trigger alarm. Silence horn and wait for timer or use Forced Ignition.
2. **Procedure**: Immo Scan -> SSU -> All Keys Lost. Hold fob to Start Button (Inductive Backup).
3. **Note**: Keys are OTP (One-Time Programmable). Used keys cannot be reused.', 'AKL', 'Autel'),
('mazda-gen7-security', 'Mazda', 'General', 2019, 2025, 'Mazda Gen 7 Security', '## Mazda Gen 7 Security
1. **SGW Access**: Requires online auth token. Stable internet and battery maintainer (13.5V) mandatory.
2. **Wake-up**: Keep Hazard lights ON to prevent BCM Deep Sleep/Timeout during calculation.', 'AKL', 'General');

-- =============================================
-- 5. SUBARU
-- =============================================

-- Update vehicles for SGP
UPDATE vehicles 
SET 
    chip = 'DST-AES (8A/H)',
    security_notes = 'Subaru Global Platform (SGP). Secure Gateway (SGW) + DCM Telematics Interference. SLOA Brute-force Lockout.',
    bypass_method = '12+8 Bypass + DCM Fuse Pull',
    sgw_required = 1
WHERE make = 'Subaru' AND year_start >= 2019;

-- Insert FCC References for Subaru
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, notes) VALUES
('CWTB1G077', 'Subaru', 'Forester', 2019, 2024, '433MHz', 'H-Chip', 'Bladed RHK'),
('HYQ14AHK', 'Subaru', 'Forester', 2019, 2025, '433MHz', 'ID47/8A', 'Smart Prox'),
('HYQ14AKB', 'Subaru', 'Outback', 2020, 2025, '433MHz', 'ID47/8A', '7th Gen High Security'),
('HYQ14AKB', 'Subaru', 'Ascent', 2019, 2025, '433MHz', 'ID47/8A', 'SGP Platform');

-- Subaru Guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool) VALUES
('subaru-sgp-akl', 'Subaru', 'General', 2019, 2025, 'Subaru Global Platform (SGP) AKL', '## Subaru Global Platform (SGP) AKL
1. **Isolation**: Pull DCM/Telematics fuse and Eyesight fuse. DCM causes bus jamming; Eyesight causes write collisions.
2. **Bypass**: 12+8 Bypass mandatory. AutoAuth/Software bypass ineffective for Immobilizer.
3. **Lockout**: SLOA (Locking On Attempt) triggered by 3 failed attempts. If triggered, wait 15-30 mins with Ignition ON.
4. **H-Chip**: For bladed AKL, must use APB112/Simulator to sniff challenge and calculate master key signature.', 'AKL', 'General');


