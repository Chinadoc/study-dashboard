-- ═══════════════════════════════════════════════════════════════════════════
-- TOYOTA/LEXUS COMPREHENSIVE RESEARCH INTEGRATION
-- Source: Google Drive Research Documents (TSS Protocols, AKL Procedures, Hardware ID)
-- Generated: 2025-12-26
-- ═══════════════════════════════════════════════════════════════════════════

-- ==============================================================================
-- PART 1: Update Vehicle Master Data (Security, Platforms, Lishi)
-- ==============================================================================

-- TNGA-K Platform (Camry 2018+, RAV4 2019+, Highlander 2020+)
UPDATE vehicles SET
    immobilizer_system = 'TSS 2.0/3.0 (Seed Code)',
    chip = '8A-AES (Page 1 AA/BA)',
    lishi_tool = 'TOY48',
    programming_method = 'OBD + Bypass (30-Pin)',
    notes = 'TNGA architecture. 2018-2022 uses Page 1 AA. 2023+ uses Page 1 BA. TSS 3.0 requires CAN-injection or 30-pin bypass cable. Seed code required for AKL via NASTF or calculation.'
WHERE make = 'Toyota' AND model IN ('Camry', 'RAV4', 'Highlander', 'Avalon', 'Sienna', 'Venza')
    AND year_start >= 2018;

-- TNGA-C Platform (Corolla 2019+, Corolla Cross 2022+)
UPDATE vehicles SET
    immobilizer_system = 'TSS 2.0 (8A) / Hitag-AES (4A)',
    chip = CASE WHEN model = 'Corolla Cross' THEN '4A (Hitag-AES)' ELSE '8A-AES' END,
    lishi_tool = 'TOY48',
    programming_method = 'OBD (8A) / Direct Connect (4A)',
    notes = 'Corolla Cross uses NXP Hitag-AES (4A) system. Others use TI 8A-AES. 2023+ models may have TGG (Toyota Security Gateway) blocking OBD write access.'
WHERE make = 'Toyota' AND model IN ('Corolla', 'Corolla Cross', 'Prius')
    AND year_start >= 2019;

-- TNGA-F Platform (Tundra 2022+, Sequoia 2023+, Land Cruiser 300)
UPDATE vehicles SET
    immobilizer_system = 'TSS 3.0',
    chip = '8A-BA',
    lishi_tool = 'TOY48',
    programming_method = '30-Pin Bypass / CAN Injection',
    notes = 'Modern Full-Size architecture. Uses 8A-BA (TMLF19D). 30-pin bypass cable is mandatory for AKL and most key additions to bypass Security Gateway.'
WHERE make = 'Toyota' AND model IN ('Tundra', 'Sequoia', 'Land Cruiser')
    AND year_start >= 2022;

-- Lexus TNGA Transition (NX 2022+, RX 2023+, ES 2019+)
UPDATE vehicles SET
    immobilizer_system = 'TSS 2.0/3.0',
    chip = CASE WHEN model IN ('NX', 'RX') AND year_start >= 2022 THEN '8A-BA' ELSE '8A-AES' END,
    lishi_tool = 'TOY48',
    programming_method = 'OBD/30-Pin Bypass',
    notes = 'NX (2022+) and RX (2023+) use the "BA" encryption system. Requires latest tool updates and often a 30-pin bypass cable to communicate with Certification ECU.'
WHERE make = 'Lexus' AND model IN ('ES 350', 'NX 250', 'NX 350', 'RX 350', 'UX 200')
    AND year_start >= 2019;

-- ==============================================================================
-- PART 2: FCC Reference & Hardware Mapping
-- ==============================================================================

-- Modern Smart Keys (2018-2024+)
INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes, oem_part_numbers)
VALUES 
    ('HYQ14FBC', 'Toyota', 'Camry', 2018, 2024, '315 MHz', '8A-AES', 'Smart Key', 'Denso Board 0351. Page 1 AA. US Production (VIN starts with 1, 2, 4, 5).', '89904-06240'),
    ('HYQ14FBC', 'Toyota', 'RAV4', 2019, 2024, '315 MHz', '8A-AES', 'Smart Key', 'Denso Board 0351. Page 1 AA. US Production.', '89904-0R080'),
    ('HYQ14FBN', 'Toyota', 'Camry', 2018, 2024, '314.3 MHz', '8A-AES', 'Smart Key', 'Tokai Rika Board B74EA. Japan Production (J-VIN).', '89904-06240'),
    ('HYQ14FBX', 'Toyota', 'RAV4', 2019, 2024, '314.3 MHz', '8A-AES', 'Smart Key', 'Tokai Rika Board B51TH. Japan Production (J-VIN).', '89904-0R080'),
    ('HYQ14FBE', 'Toyota', 'Tundra', 2022, 2024, '315 MHz', '8A-BA', 'Smart Key', 'Denso Board 231451-0410. TNGA-F. Requires 30-pin bypass.', '89904-0C020'),
    ('HYQ14FLB', 'Lexus', 'RX 350', 2023, 2024, '315 MHz', '8A-BA', 'Smart Key', 'Denso. Page 1 BA. Highly secured. Requires latest software.', '89904-48G20'),
    ('HYQ14FBW', 'Toyota', 'Corolla Cross', 2022, 2024, '315 MHz', '4A', 'Smart Key', 'Hitag-AES system. First Toyota 4A implementation in US.', '89904-02010')
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    notes = excluded.notes,
    chip_type = excluded.chip_type,
    oem_part_numbers = excluded.oem_part_numbers;

-- ==============================================================================
-- PART 3: Vehicle Guides (Technical Walkthroughs)
-- ==============================================================================

-- TSS 2.0/3.0 Bypass Procedures
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'toyota-tss-bypass-guide',
    'Toyota',
    'TNGA Platforms',
    2018,
    2024,
    'Toyota TSS 2.0 & 3.0 Bypass Methodologies',
    '# Toyota TSS 2.0 & 3.0 Bypass Guide (2018–2024)

## Overview
Modern Toyota/Lexus vehicles use a "Secured Gateway" (TGG) that blocks OBD2 write commands. To program keys, you must bypass this gateway using hardware.

### 1. Autel Methodology (IM508/608)
- **TSS 2.0 (2018-2021)**: Use **APB112** Smart Key Simulator. 
    1. Backup IMMO Data (via OBD).
    2. Generate Simulator Key on APB112.
    3. Use Simulator to "Add Key".
- **TSS 3.0 / BA Keys (2022+)**: Requires **G-Box3** and **Toyota 30-Pin Cable**.
    1. Locate Certification ECU (usually behind glovebox or cluster).
    2. Connect 30-pin bypass cable directly to the ECU harness.
    3. Perform "All Keys Lost" or "Add Key" via G-Box3. **Server calculation required.**

### 2. Advanced Diagnostics (Smart Pro)
- **Cables**: Use **ADC2021** (Toyota Bypass Cable).
- **Procedure**: 
    1. Connect ADC2021 between the vehicle harness and the Smart Pro.
    2. This bypasses the 16-minute wait and the PIN/Seed code requirement for most 8A models.
    3. For newer BA systems, ensure the **ADC2015** emulator is used for signature verification.

### ⚠️ Warning: The 12nd Digit Rule
When ordering rolling codes or seed calculations, ensure you provide the full 96-byte seed or the tool-generated 12-digit request code. Page 1 "BA" systems (2023 Corolla Cross, Tundra) will NOT accept "AA" calculations.',
    'BYPASS_PROCEDURE',
    'Autel/Smart Pro'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content;

-- Hardware ID & Triage
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'toyota-hardware-triage',
    'Toyota/Lexus',
    'Smart Key Systems',
    2004,
    2024,
    'Hardware ID Triage: 16-Minute Reset vs. Seed Code',
    '# Diagnostic Triage: Reset Method Identification

### 1. The Legacy Era (2004–2016)
- **Identification**: FCC IDs HYQ14AAB, HYQ14AEM, HYQ14ACX.
- **Method**: **16-Minute Reset**.
- **Procedure**: 
    1. Erase/Reset Immobilizer.
    2. Wait 16 minutes with ignition ON.
    3. ECU enters learn mode automatically. No NASTF required.

### 2. The TNGA Era (2018–2024)
- **Identification**: FCC IDs HYQ14FBC, HYQ14FBE, HYQ14FBN.
- **Method**: **Seed Code / Rolling Code**.
- **Procedure**: 
    1. Tool requests Reset.
    2. Vehicle provides a 12-digit or 96-byte Seed.
    3. Technician enters Pass-Code (via NASTF or server calc).
    4. Immediate reset, no 16-minute wait.

### 3. Denso vs. Tokai Rika Warning
| Feature | Denso | Tokai Rika |
|---------|-------|------------|
| VIN | US-Built (1, 2, 4, 5) | Japan-Built (J-VIN) |
| Frequency | 315 MHz | 314.3 MHz |
| Incompatibility | Will NOT program | Will NOT program |

**Pro Tip**: Always check the "Board ID" inside the shell. Denso uses numeric IDs (e.g. 0351); Tokai Rika uses alphanumeric (e.g. B74EA).',
    'DIAGNOSTICS',
    'General'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content;
