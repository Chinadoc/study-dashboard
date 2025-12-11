-- Integrate BMW Reference Document - Part 4
-- Advanced Data: Pricing, Procedures, Repairs, FCC IDs

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW 3-SERIES - The Definitive Guide (Updated)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-3-series-1999-2024',
  'BMW',
  '3-Series',
  1999,
  2024,
  '# BMW 3-Series 1999-2024 Master Programming Guide
## The Locksmith''s Bread & Butter

---

## Overview

The 3-Series spans all major BMW eras. Mastering this model means mastering BMW.

> 💡 **Business Strategy:**
> - **Spare Key (E/F-Series):** $250 - $350
> - **All Keys Lost (CAS3):** $450 - $600
> - **All Keys Lost (FEM):** $600 - $900 (Labor intensive)
> - **FRM Repair:** $200 - $300 (30 mins work)

---

## Generation Breakdown

### E46 (1999-2006) - EWS
| Spec | Value |
|------|-------|
| System | **EWS3 / EWS4** |
| Keyway | **HU92** |
| Chip | ID44 (PCF7935) |
| Tool | **AK90+** (Best), VVDI Prog |
| **Strategy** | EWS4 (2004+) requires soldering. Use AK90+ for EWS3. |

### E90/E91/E92 (2007-2013) - CAS3
| Spec | Value |
|------|-------|
| System | **CAS3 / CAS3+** |
| Keyway | **HU92** |
| Chip | ID46 (PCF7945) |
| FCC (315) | **KR55WK49127** (Smart), **KR55WK49123** (Slot) |
| **Repair** | **ELV Emulation** often needed for "Steering Lock" error (A0AA). |
| **Repair** | **FRM3 Repair** needed if windows/lights fail after battery change. |

### F30 (2012-2018) - FEM
| Spec | Value |
|------|-------|
| System | **FEM (Front Electronic Module)** |
| Keyway | **HU100R** |
| Chip | ID49 (PCF7953) |
| FCC (315) | **YGOHUF5662** |
| FCC (434) | **NBGIDGNG1** |
| **Procedure** | **Preprocessing Required.** Remove FEM, read 95128 EEPROM, write Service File, Flash, Restore. |

### G20 (2019+) - BDC3
| Spec | Value |
|------|-------|
| System | **BDC3 / SGW** |
| Keyway | **HU66** |
| Chip | NCF2951 (ID49/53) |
| FCC (434) | **N5F-ID21A** |
| **Warning** | **Cloud Calculation** required (Autel/Xhorse). 2021+ with Bosch MD1/MG1 DME has **No AKL Solution** via OBD. |

---

## Detailed Procedures

### 🔧 EWS3 All Keys Lost (AK90+)
1. **Remove** EWS module (driver kick panel).
2. **Clean** pins on MCU (0D46J/2D47J) meticulously.
3. **Connect** AK90 ribbon. Align red dot to Pin 1.
4. **Read** & Save Bin.
5. **Write** new PCF7935 chip.
6. **Reinstall**. No sync needed.

### 🔧 FEM Key Learning (Preprocessing)
1. **Backup Coding** via OBD.
2. **Remove FEM** & Read 95128 EEPROM (Bench).
3. **Write Service File** to EEPROM.
4. **Flash** FEM on bench/car.
5. **Restore Original EEPROM**.
6. **Learn Key** via coil.

---

## Troubleshooting & Repairs

| Issue | System | Fix |
|-------|--------|-----|
| **ELV Lock (A0AA)** | E90 CAS | Install **ELV Emulator** in steering column. Reset counter. |
| **FRM Bricked** | E90/E70 | Read D-Flash with VVDI Prog. Use "Partition Repair". |
| **CAS3+ Bricked** | CAS3+ | Failed downgrade? Repair bootloader with HexTag/Autohex. |

---

## Tool Decision Matrix

| Scenario | Best Tool | Backup | Note |
|----------|-----------|--------|------|
| EWS 3/4 AKL | **AK90+** | VVDI Prog | AK90 is faster & safer. |
| CAS3+ Add | **Autel IM608** | VVDI2 | Autel guided mode is superior. |
| FEM AKL | **ACDP** | IM608 | ACDP = No soldering risk. |
| G-Series Add | **Autel** | Dealer | Requires server sub (~$120). |

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide", "bmw_update_rtf"], "generated": "2024-12-11", "method": "reference_doc_v2"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW 5-SERIES - Tech Leader (Updated)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-5-series-1996-2024',
  'BMW',
  '5-Series',
  1996,
  2024,
  '# BMW 5-Series 1996-2024 Master Programming Guide
## The Executive Express

---

## Overview

The 5-Series often introduces new tech first (CAS4, G-Series).

> 💡 **Pearl:** F10 (2011-2016) uses **CAS4/CAS4+**. This is DIFFERENT from F30 (FEM).

---

## Generation Breakdown

### E39 (1996-2003) - EWS
| Spec | Value |
|------|-------|
| System | **EWS3** |
| Keyway | **HU92** |
| Chip | ID44 |

### E60 (2004-2010) - CAS2/3
| Spec | Value |
|------|-------|
| System | **CAS2** (Early) / **CAS3** (Late) |
| Keyway | **HU92** |
| Chip | ID46 |
| FCC (315) | **KR55WK49127** (Smart), **KR55WK49123** (Slot) |

### F10 (2011-2016) - CAS4
| Spec | Value |
|------|-------|
| System | **CAS4 / CAS4+** |
| Keyway | **HU100R** |
| Chip | ID49 |
| FCC (315) | **YGOHUF5662** |
| FCC (434) | **YGOHUF5767** |
| **Warning** | **Bench Read Required.** Do not attempt OBD unlock on CAS4+. |

### G30 (2017+) - BDC2
| Spec | Value |
|------|-------|
| System | **BDC2** |
| Keyway | **HU66** |
| Chip | NCF2951 |
| **Strategy** | BDC2 is easier than BDC3. Bench add key possible with ACDP/Key Tool Plus. |

---

## Detailed Procedures

### 🔧 CAS4+ All Keys Lost (ACDP)
1. **Remove CAS4** (White/Black box under dash).
2. **Install Interface Board** (No soldering).
3. **Read P-Flash & D-Flash**.
4. **Generate Dealer Key** using the data.
5. **Write Key** to blank.
6. **Reinstall**. Syncs automatically.

---

## Key Information

- **Blade:** HU66 (G30), HU100R (F10), HU92 (E60/E39)
- **Lishi:** HU66, HU100R, HU92
- **Battery:** CR2450 (Smart), CR2032 (Comfort), VL2020 (Rechargeable Slot)

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide", "bmw_update_rtf"], "generated": "2024-12-11", "method": "reference_doc_v2"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW X5 - The SAV (Updated)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-x5-1999-2024',
  'BMW',
  'X5',
  1999,
  2024,
  '# BMW X5 1999-2024 Master Programming Guide
## EWS to BDC3

---

## Overview

The X5 follows the 5-Series tech but with some twists.

> 💡 **Pearl:** F15 (2014-2018) uses **BDC** (Body Domain Controller), same procedure as FEM.

---

## Generation Breakdown

### E53 (1999-2006) - EWS
| Spec | Value |
|------|-------|
| System | **EWS3** |
| Keyway | **HU92** |
| Chip | ID44 |

### E70 (2007-2013) - CAS3
| Spec | Value |
|------|-------|
| System | **CAS3+** |
| Keyway | **HU92** |
| Chip | ID46 |
| **Issue** | **FRM3 Failure** common on E70. |

### F15 (2014-2018) - BDC
| Spec | Value |
|------|-------|
| System | **BDC** |
| Keyway | **HU100R** |
| Chip | ID49 |
| FCC (315) | **YGOHUF5662** |
| FCC (434) | **NBGIDGNG1** |

### G05 (2019+) - BDC3
| Spec | Value |
|------|-------|
| System | **BDC3 / SGW** |
| Keyway | **HU66** |
| Chip | NCF2951 |
| FCC (434) | **N5F-ID21A** |
| **Warning** | **Cloud Calculation** required. |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **FRM3 Dead** | Windows/Lights fail. Repair D-Flash partition. |
| **E70 No Start** | CAS-DME Sync lost. Realign with scanner. |

---

## Pro Tips from the Field

- ⚡ **E53:** Door locks (HU92) are notoriously difficult to pick.
- 📋 **F15:** BDC is in passenger footwell (A-pillar).
- 🔧 **G05:** 2021+ AKL is dealer only (MD1/MG1 DME locked).

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide", "bmw_update_rtf"], "generated": "2024-12-11", "method": "reference_doc_v2"}'
);
