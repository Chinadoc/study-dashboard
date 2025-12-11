-- Integrate BMW Reference Document - Part 1
-- 3-Series, 5-Series, 7-Series

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW 3-SERIES - The Benchmark
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-3-series-1999-2024',
  'BMW',
  '3-Series',
  1999,
  2024,
  '# BMW 3-Series 1999-2024 Master Programming Guide
## EWS to BDC Evolution

---

## Overview

The 3-Series showcases the entire evolution of BMW immobilizers.

> ⚠️ **Critical Warning (2019+):** G20 models use **SGW (Security Gateway)**. Requires authorized tool certificate!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | FEM/BDC Bench, CAS OBD |
| **XP400 Pro** | Required for Bench work |
| **Lishi HU58 / HU66** | See generation breakdown |

---

## Generation Breakdown

### E46 (1999-2006) - EWS Era
| Spec | Value |
|------|-------|
| System | **EWS3 / EWS4** |
| Keyway | **HU58** (6-cut) |
| Chip | ID44 (Rolling Code) |
| Programming | OBD (2 keys) or Bench EEPROM |

### E90/E91/E92 (2006-2013) - CAS Era
| Spec | Value |
|------|-------|
| System | **CAS3 / CAS3+** |
| Keyway | **HU58** (early) / **HU66** |
| Chip | ID46 (PCF7936) |
| ISN | **Required for AKL** |
| Slot | Dash slot (must hold key) |

### F30/F31/F34 (2012-2019) - FEM Era
| Spec | Value |
|------|-------|
| System | **FEM (Front Electronic Module)** |
| Keyway | **HU66** |
| Chip | ID49 (HITAG Pro) |
| Programming | **Bench Required** (Unlock FEM) |
| ISN | Dual ISN (DME + FEM) |

### G20 (2019+) - BDC/SGW Era
| Spec | Value |
|------|-------|
| System | **BDC (Body Domain Controller)** |
| Security | **SGW (Security Gateway)** |
| Keyway | **HU66** |
| Chip | ID53 (Encrypted) |
| Programming | Requires SGW Auth + Bench |

---

## ISN Reading Guide

| System | Free Method | Paid Method |
|--------|-------------|-------------|
| EWS | No ISN needed | N/A |
| CAS3+ | OBD (Autel/Lonsdor) | N/A |
| FEM | Bench Read | N/A |
| BDC (G-Series) | Bench Read | Dealer/NASTF |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| ELV Lock (Red Steering) | Reset ELV counter after programming |
| FEM Bricking | Use stable power (>13V) during unlock! |
| SGW No Comm | Check internet & tool certificate |

---

## Pro Tips from the Field

- ⚡ **FEM Unlock:** Takes 10-20 mins. DO NOT DISCONNECT POWER.
- 📋 **SGW:** 2019+ G20 has it. No hardware bypass.
- 🔧 **Lishi:** HU58 for E46, HU66 for everything else.

---

## Key Information

- **Blade:** HU66 (2006+), HU58 (1999-2005)
- **Lishi:** HU66, HU58
- **Battery:** CR2032 (Comfort Access), VL2020 (Rechargeable Non-CA)

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW 5-SERIES - Executive Class
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-5-series-2004-2024',
  'BMW',
  '5-Series',
  2004,
  2024,
  '# BMW 5-Series 2004-2024 Master Programming Guide
## CAS to Curved Display

---

## Overview

The 5-Series introduced many technologies (CAS2, CAS4, BDC).

> 💡 **Pearl:** F10 (2011-2017) uses **CAS4/CAS4+**. Requires bench read or low-risk OBD unlock.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **G-Box 2/3** | Recommended for Bench work |

---

## Generation Breakdown

### E60 (2004-2010) - CAS2/CAS3
| Spec | Value |
|------|-------|
| System | **CAS2 / CAS3** |
| Keyway | **HU92** (2-track) |
| Chip | ID46 |
| Note | Diamond Key (Rechargeable) or Smart Fob |

### F10 (2011-2017) - CAS4
| Spec | Value |
|------|-------|
| System | **CAS4 / CAS4+** |
| Keyway | **HU100R** (Deep cut) |
| Chip | ID49 |
| Programming | Bench Read (Safe) or OBD (Risk) |

### G30 (2017-2023) - BDC
| Spec | Value |
|------|-------|
| System | **BDC** |
| Keyway | **HU66** |
| Chip | ID49 / ID53 |
| Note | Display Key supported |

### G60 (2024+) - SGW
| Spec | Value |
|------|-------|
| System | **BDC2 / SGW** |
| Security | **SGW Active** |
| Programming | Limited aftermarket support |

---

## ISN Reading

| System | Method |
|--------|--------|
| CAS2 | OBD (Free) |
| CAS4 | Bench Read (Free with tool) |
| BDC | Bench Read (Requires G-Box) |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CAS4 000000 | Flash corrupted. Restore backup! |
| Display Key | Requires specific frequency (433/315) |

---

## Pro Tips from the Field

- ⚡ **CAS4 Risk:** OBD unlock can brick. Bench is safer.
- 📋 **Keys:** F10 keys look like F30 but are different (CAS4 vs FEM).
- 🔧 **Blade:** F10 uses HU100R (like Chevy but reverse).

---

## Key Information

- **Blade:** HU100R (F10), HU92 (E60), HU66 (G30)
- **Lishi:** HU100R, HU92, HU66
- **Battery:** CR2450 (Smart), CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW 7-SERIES - Flagship Tech
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-7-series-2002-2024',
  'BMW',
  '7-Series',
  2002,
  2024,
  '# BMW 7-Series 2002-2024 Master Programming Guide
## Innovation Leader

---

## Overview

The 7-Series leads BMW tech. E65 was first with CAS. G11 introduced Display Key.

> ⚠️ **Critical Warning:** G70 (2023+) has **Encrypted ISN**. Very difficult AKL.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608** | Essential |
| **Bench Setup** | Mandatory for 7-Series |

---

## Generation Breakdown

### E65/E66 (2002-2008) - CAS1/CAS2
| Spec | Value |
|------|-------|
| System | **CAS1 / CAS2** |
| Keyway | **HU92** |
| Note | Rectangular "Slot" Key |

### F01/F02 (2009-2015) - CAS4
| Spec | Value |
|------|-------|
| System | **CAS4 / CAS4+** |
| Keyway | **HU100R** |
| Chip | ID49 |

### G11/G12 (2016-2022) - BDC
| Spec | Value |
|------|-------|
| System | **BDC** |
| Keyway | **HU66** |
| Note | Display Key / Gesture Control |

### G70 (2023+) - SGW
| Spec | Value |
|------|-------|
| System | **BDC2 / SGW** |
| Security | **SGW + Encrypted ISN** |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| E65 Key Stuck | Solenoid in dash slot fails |
| Display Key | Battery drains fast - charge wirelessly |

---

## Pro Tips from the Field

- ⚡ **E65 CAS:** Located under driver dash (pain to remove).
- 📋 **Display Key:** Expensive ($400+). Clone options exist.
- 🔧 **Luxury:** Don''t scratch the wood trim!

---

## Key Information

- **Blade:** HU66 (G-Series), HU100R (F-Series), HU92 (E-Series)
- **Lishi:** HU66, HU100R, HU92
- **Battery:** CR2032 / Rechargeable

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);
