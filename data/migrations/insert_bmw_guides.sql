-- BMW Locksmith Guides - X3 and Related Models
-- Based on BMW Professional Locksmith Programming Guide (1995-2025)

-- Ensure BMW exists in vehicles (optional check, but safer to focus on guides)
-- Existing vehicles table handles the master list.

-- BMW X3 (G01) 2018-2025 - FEM/BDC Era Guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, created_at)
VALUES (
    'bmw-x3-2018-2025',
    'BMW',
    'X3',
    2018,
    2025,
    '# BMW X3 (G01) Key Programming Guide
**Years:** 2018-2025
**System:** FEM/BDC (Body Domain Controller)
**Chip:** ID49 (HITAG Pro)
**Keyway:** HU100R

---

## Overview

The G01 X3 uses BMW''s FEM/BDC security architecture. All key programming requires online authorization through BMW servers. The Body Domain Controller (BDC) manages immobilizer functions.

---

## Security Architecture

| Component | Function |
|-----------|----------|
| **BDC** | Body Domain Controller - replaces FEM, handles immobilizer |
| **DME/DDE** | Engine control, receives ISN from BDC |
| **CAS** | Not used - replaced by BDC |
| **Key** | ID49 transponder with rolling code |

---

## Required Equipment

| Tool | Purpose |
|------|---------|
| **Autel IM608 Pro** | OBD programming with online auth |
| **VVDI Key Tool Plus** | Key generation + programming |
| **Yanhua ACDP** | Direct BDC access (bench) |
| **Lishi HU100R** | Emergency blade cutting |
| **Key Blank** | HU100R blade |

---

## Programming Requirements

> **⚠️ CRITICAL: All key programming requires ONLINE BMW server authorization**

| Scenario | Method | Time |
|----------|--------|------|
| Add Key (working key present) | OBD via tool | 5-10 min |
| All Keys Lost (AKL) | Bench BDC or IMMO bypass | 30-60 min |
| Proximity/Keyless | Same as smart key | 10-15 min |

---

## Procedure: Add Key (Working Key Present)

1. **Prepare New Key**
   - Use VVDI/Autel to generate ID49 transponder
   - Cut emergency blade to HU100R profile

2. **Connect Diagnostic Tool**
   - Connect OBD adapter to DLC (under dash)
   - Ensure stable **13.8V** power supply
   - Launch BMW immo module

3. **Online Authorization**
   - Tool connects to BMW server
   - VIN and key count verified
   - Authorization token received

4. **Program Key**
   - Follow on-screen prompts
   - New key syncs with BDC
   - Test start and remote functions

---

## All Keys Lost (AKL) Procedure

> **⚠️ Requires extra security verification or bench work**

**Option 1: Online with Proof of Ownership**
- Provide title/registration to tool vendor
- 48-72 hour verification window
- Remote authorization granted

**Option 2: Bench BDC Programming**
1. Remove BDC module (behind glove box)
2. Connect to ACDP or similar bench tool
3. Read ISN and key data
4. Generate dealer key file
5. Program new key
6. Reinstall BDC

---

## Pro Tips from the Field

> 💡 **Battery First**: BMW systems are voltage-sensitive. Always connect a battery support unit maintaining **13.5-14V**. Programming failures often trace to voltage drops.

> 💡 **ISN Extraction**: If DME replacement needed, extract ISN first. Syncing ISN between BDC and new DME is critical.

> 💡 **Frequency**: US models use **315 MHz**, EU uses **434 MHz**. Verify before ordering replacement keys.

> 💡 **Comfort Access**: If vehicle has Comfort Access, key must support it. Not all aftermarket keys do.

---

## FCC IDs (North America)

| FCC ID | Description |
|--------|-------------|
| **HUF5661** | Standard smart key |
| **HUF5767** | Updated smart key 2020+ |
| **IDGNG1** | Display key (if equipped) |

---

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No communication | Gateway/BDC gateway filter | Use OBD bypass adapter |
| Auth timeout | Poor internet connection | Use mobile hotspot |
| Key not detected | ID49 not initialized | Regenerate transponder |
| Partial functions | Key not fully synced | Re-run programming |

---

## OEM Part Numbers

| Part | Number |
|------|--------|
| Smart Key (Base) | 66 12 8 739 952 |
| Smart Key (Comfort) | 66 12 8 739 953 |
| Display Key | 66 12 5 A3A 2A9 |

---

*Guide verified December 2024*',
    datetime('now')
);

-- BMW X3 (F25) 2011-2017 - CAS4/CAS4+ Era Guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, created_at)
VALUES (
    'bmw-x3-2011-2017',
    'BMW',
    'X3',
    2011,
    2017,
    '# BMW X3 (F25) Key Programming Guide
**Years:** 2011-2017
**System:** CAS4 / CAS4+
**Chip:** PCF7953 (ID46 encrypted)
**Keyway:** HU92R

---

## Overview

The F25 X3 uses BMW''s CAS4 (2011-2014) or CAS4+ (2015-2017) immobilizer system. CAS4+ introduced stricter security requiring ISN synchronization.

---

## Security Architecture

| Component | Function |
|-----------|----------|
| **CAS4/CAS4+** | Car Access System - immobilizer module |
| **DME** | Engine control, synced via ISN |
| **FRM** | Footwell Module - remote functions |

---

## Required Equipment

| Tool | Purpose |
|------|---------|
| **Yanhua ACDP** | CAS4 programming (recommended) |
| **VVDI Key Tool Max** | Key generation |
| **Autel IM608** | OBD access |
| **Lishi HU92** | Lock decoding/picking |

---

## Programming: Add Key

1. Connect diagnostic tool via OBD
2. Access CAS4 module
3. Read key data (8 slots available)
4. Write new key to empty slot
5. Key must be synchronized with DME

---

## CAS4+ Considerations

> **⚠️ CAS4+ requires ISN sync after any key changes**

- ISN stored in CAS and DME
- Mismatch = no start condition
- Tools like ACDP can sync ISN properly

---

## Pro Tips

> 💡 **Key Slot Management**: CAS4 has 8 key slots. Always check for lost keys and delete them before adding new ones.

> 💡 **FRM Reset**: After key programming, the FRM may need re-coding for remote functions.

---

*Guide verified December 2024*',
    datetime('now')
);

-- BMW 3 Series (G20) 2019-2025 - Modern BDC Guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, created_at)
VALUES (
    'bmw-3series-2019-2025',
    'BMW',
    '3 Series',
    2019,
    2025,
    '# BMW 3 Series (G20) Key Programming Guide
**Years:** 2019-2025
**System:** BDC (Body Domain Controller)
**Chip:** ID49 (HITAG Pro)
**Keyway:** HU100R

---

## Overview

The G20 3 Series shares the same BDC-based security as the G01 X3. All programming requires online BMW authorization.

---

## Key Programming

Same procedure as BMW X3 (G01). Refer to X3 guide for detailed steps.

Key differences:
- Same FCC IDs
- Same chip (ID49)
- Same procedures

---

## FCC IDs

| FCC ID | Description |
|--------|-------------|
| **HUF5661** | Smart key |
| **HUF5767** | Updated smart key 2020+ |

---

*Guide verified December 2024*',
    datetime('now')
);
