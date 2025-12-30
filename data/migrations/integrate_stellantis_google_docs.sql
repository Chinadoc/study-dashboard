-- Stellantis/CDJR Research Integration Migration
-- Sources: Stellantis_FCC_ID_VIN_Pre-coding_Research.txt, Stellantis_Key_FCC_ID_VIN_Mapping.txt, 
--          Jeep_Renegade_Hornet_Key_Programming_Issue.txt, Chrysler_Locksmith_Guide_Creation.txt
-- Generated: 2025-12-26

-- ==============================================================================
-- PART 1: vehicles ENRICHMENT (Security & Platform)
-- ==============================================================================

-- Dodge Hornet (2023-2025)
INSERT OR IGNORE INTO vehicles (make, model, make_normalized, model_normalized) 
VALUES ('Dodge', 'Hornet', 'dodge', 'hornet');

UPDATE vehicles SET
    chip_type = 'HITAG-AES (Type 4A)',
    platform = 'Alfa Romeo Tonale (Giorgio-derived)',
    security_notes = 'Italian-built (VIN starts with Z). Uses Giobert (2ADPXFI7PE) or Alfa (KR5ALFA434) hardware. Pre-coding REQUIRED. Locked RF Hub protocol means virgin keys must be pre-coded with CS bytes before adding.',
    lishi_tool = 'SIP22',
    bypass_method = 'AutoAuth / 12+8 Cable / Star Connector',
    sgw_required = 1
WHERE make = 'Dodge' AND model = 'Hornet';

-- Jeep Renegade (2022-2024 Evolution)
UPDATE vehicles SET
    chip_type = 'HITAG-AES (Type 6A)',
    platform = 'Small Wide 4x4',
    security_notes = 'Critical supplier split in 2022: Melfi plant (Italy) moved to Giobert (2ADPXFI7PE). NAFTA models may still use M3N. Italian-built (VIN starts with Z) requires pre-coding. Locked RF Hub status common.',
    lishi_tool = 'SIP22',
    bypass_method = '12+8 Cable / Star Connector / AutoAuth',
    sgw_required = 1
WHERE make = 'Jeep' AND model = 'Renegade' AND id IN (
    -- Target only variants that would be in the 2022+ range if normalized
    SELECT vehicle_id FROM vehicle_variants WHERE year_start >= 2022
);

-- Jeep Compass (2023-2024 Mexican Production)
UPDATE vehicles SET
    security_notes = 'NAFTA-built (VIN starts with 3) typically stay on M3N-40821302. SGW present but pre-coding usually NOT required compared to Hornet/Renegade. Verify VIN origin (Z=Italy, 3=Mexico).',
    lishi_tool = 'SIP22',
    bypass_method = '12+8 Cable / AutoAuth',
    sgw_required = 1
WHERE make = 'Jeep' AND model = 'Compass';

-- RAM ProMaster (2022-2024)
UPDATE vehicles SET
    security_notes = 'Fiat-based architecture. 2022+ models feature SGW and likely move to HITAG-AES. SIP22 lock is notoriously stiff; use caution with Lishi tools.',
    lishi_tool = 'SIP22',
    bypass_method = '12+8 Cable / AutoAuth',
    sgw_required = 1
WHERE make = 'RAM' AND model = 'ProMaster';

-- ==============================================================================
-- PART 2: fcc_reference INSERTS
-- ==============================================================================

INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes, oem_part_numbers)
VALUES 
    ('2ADPXFI7PE', 'Jeep', 'Renegade', 2022, 2024, '434 MHz', 'HITAG-AES (6A)', 'Smart Key', 'Giobert S.p.A. hardware. Italian-built. Requires pre-coding.', '7TB23DX9AA'),
    ('2ADPXFI7PE', 'Dodge', 'Hornet', 2023, 2025, '434 MHz', 'HITAG-AES (4A)', 'Smart Key', 'Giobert S.p.A. hardware. Integrated Key Fob Transmitter.', '7QV80LXHPA, 7QV81LXHPA'),
    ('KR5ALFA434', 'Dodge', 'Hornet', 2023, 2025, '434 MHz', 'HITAG-AES (4A)', 'Smart Key', 'Continental Europe hardware. Shared with Alfa Romeo Tonale.', '6EP44LXHAA'),
    ('M3N-40821302', 'Jeep', 'Compass', 2017, 2024, '433 MHz', 'ID46 / ID4A', 'Smart Key', 'NAFTA-built (Toluca, Mexico). Standard Smart Proximity key.', '68250343AB, 68417823AA')
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    notes = excluded.notes,
    oem_part_numbers = excluded.oem_part_numbers;

-- ==============================================================================
-- PART 3: vehicle_guides INSERTS (Tool Walkthroughs)
-- ==============================================================================

-- 3.1 DODGE HORNET (2023-2025) GUIDE
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'dodge-hornet-2023-2025',
  'Dodge',
  'Hornet',
  2023,
  2025,
  '# Dodge Hornet 2023-2025 Key Programming Guide
## High-Security Italian Platform (Alfa Romeo Tonale Architecture)

---

## Overview

The Dodge Hornet is a rebadged **Alfa Romeo Tonale**, built in Pomigliano d''Arco, Italy (VIN starts with **ZAC**). It uses an entirely different security architecture from legacy Dodge models.

> ⚠️ **Critical:** Do NOT attempt to use standard Dodge keys (M3N). The Hornet requires pre-coded HITAG-AES keys (FCC 2ADPX or KR5ALFA).

---

## Security Architecture

| Feature | Specification |
|---------|---------------|
| **Immobilizer** | Radio Frequency Hub (RFH) - Locked |
| **Encryption** | HITAG-AES (128-bit) |
| **SGW** | Security Gateway active |
| **Supplier** | Giobert S.p.A / Continental Europe |

---

## Required Equipment

- **Autel IM608 Pro / Pro II** (with AutoAuth support)
- **12+8 SGW Bypass Cable** (if AutoAuth unavailable)
- **XP400 Pro** (for pre-coding blank chips)
- **Programming Key:** 7QV80LXHPA or 7QV81LXHPA

---

## The "Pre-Coding" Workflow (AKL)

Because the RF Hub is "Locked" at the factory, it cannot generate new Secret Keys for blank transponders.

1. **Read Immo Data:** Read CS (Component Security) bytes and MAC from the BCM/RFH.
2. **Pre-Code Key:** Use XP400 Pro to write this data to a virgin 2ADPX-compatible key. This turns the blank into a "Dealer Key" for this specific VIN.
3. **Connect to Vehicle:** Use WiTech 2.0 or Autel with SGW bypass.
4. **Enable Fobik:** Select the **"Enable Fobik"** routine (usually replacing the "Program Keys" option).
5. **Handshake:** Hold pre-coded key to Start Button and press Unlock when prompted.

---

## VIN Identification Tips

| VIN 1st Digit | Architecture | Programming |
|---------------|--------------|-------------|
| **Z** (Italy) | Italian/Giobert | Pre-coding REQUIRED |
| **1/2/3** (NAFTA) | Legacy/Continental | Standard OBD (if variant exists) |

---

## Common Issues

- **"Security Access Denied":** SGW is blocking communication or RF Hub is in alarm state (wait 1 hour).
- **"Key Not Supported":** Attempting to use a standard Dodge M3N key.
- **"Enable Fobik" only option:** Normal behavior for locked hubs; proceed with pre-coded key.

---
*Last Updated: December 2025*',
  '{"sources": ["Stellantis_FCC_ID_VIN_Research", "Jeep_Renegade_Hornet_Issue"], "generated": "2025-12-26"}'
);

-- 3.2 JEEP RENEGADE (2022-2024) - UPDATED SUPPLIER SPLIT
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'jeep-renegade-2022-2024-split',
  'Jeep',
  'Renegade',
  2022,
  2024,
  '# Jeep Renegade 2022-2024 Supplier Transition Guide
## Continental vs. Giobert Architectures

---

## The 2022 Supplier Split

Starting in mid-2022, Jeep Renegade models (Melfi, Italy assembly) transitioned from Continental to **Giobert** hardware.

| System | FCC ID | OEM Part # Starts With | Programming |
|--------|--------|------------------------|-------------|
| **Continental** | M3N-40821302 | **6...** (e.g., 6BY88) | Standard OBD |
| **Giobert** | 2ADPXFI7PE | **7...** (e.g., 7TB23) | Pre-coding REQUIRED |

---

## Identification Strategy (VIN)

Check the **11th character** of the VIN (Plant Code):
- **P** or **L** (Melfi, Italy): Likely Giobert for 2022+ models.
- **Prefix Rule:** If the OEM Part Number starts with **7**, it is the new Giobert system.

---

## RF Hub "Locked" Protocol (CSN Z23)

Vehicles with the Z23 update or newer revisions (...AM or later) feature a hardware-level lockdown.
- Rejects new keys without authenticated pre-coding.
- Requires **"Enable Fobik"** workflow in WiTech 2.0/Autel.
- If all keys lost and hub is bricked, RF Hub replacement may be necessary.

---

## Key Specs (2022+)

- **Keyway:** SIP22 (Laser-cut)
- **Lishi:** SIP22 2-in-1 (USE CAUTION - locks are stiff)
- **Chip:** HITAG-AES (Type 6A)
- **Frequency:** 434 MHz

---
*Last Updated: December 2025*',
  '{"sources": ["Stellantis_Key_FCC_Mapping"], "generated": "2025-12-26"}'
);
