-- Integrate BMW Reference Document - Part 3
-- MINI, 1/2/4-Series

-- ═══════════════════════════════════════════════════════════════════════════
-- MINI COOPER - Fun & Complex
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'mini-cooper-2002-2024',
  'MINI',
  'Cooper',
  2002,
  2024,
  '# MINI Cooper 2002-2024 Master Programming Guide
## BMW Tech in a Small Package

---

## Overview

MINI uses BMW systems. R56 = CAS3. F56 = BDC.

> 💡 **Pearl:** R56 (2007-2015) uses a unique "UFO" key. It''s a **CAS3+** system.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608** | Full support |
| **Lishi HU100R** | F-Series |

---

## Generation Breakdown

### R50/R53 (2002-2006) - EWS
| Spec | Value |
|------|-------|
| System | **EWS3** |
| Keyway | **HU100** (early) |
| Chip | ID44 |

### R56 (2007-2015) - CAS3
| Spec | Value |
|------|-------|
| System | **CAS3 / CAS3+** |
| Keyway | **HU92** |
| Chip | ID46 |
| Note | "UFO" Disc Key |

### F56 (2014+) - BDC
| Spec | Value |
|------|-------|
| System | **BDC** |
| Keyway | **HU100R** |
| Chip | ID49 |
| Note | Round Smart Key |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| R56 Key Slot | Slot often fails to hold key. |
| F56 No Start | BDC sync lost. Restore coding. |

---

## Pro Tips from the Field

- ⚡ **R56:** CAS module is under the dash, hard to reach.
- 📋 **F56:** BDC is in passenger footwell.
- 🔧 **Blade:** HU92 (R56), HU100R (F56).

---

## Key Information

- **Blade:** HU100R (F56), HU92 (R56)
- **Lishi:** HU100R, HU92
- **Battery:** CR2032 / Rechargeable

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW 1-SERIES / 2-SERIES - Entry Level
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-1-series-2008-2024',
  'BMW',
  '1-Series',
  2008,
  2024,
  '# BMW 1-Series / 2-Series Master Programming Guide
## Compact Performance

---

## Overview

Entry-level BMWs often use **FEM** (F-Series).

> 💡 **Pearl:** F22 (2-Series) uses **FEM**. Same programming as F30 3-Series.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608** | Full support |

---

## Generation Breakdown

### E82/E88 (2008-2013) - CAS3
| Spec | Value |
|------|-------|
| System | **CAS3+** |
| Keyway | **HU92** |
| Chip | ID46 |

### F22/F23 (2014-2021) - FEM
| Spec | Value |
|------|-------|
| System | **FEM** |
| Keyway | **HU66** |
| Chip | ID49 |
| Programming | **Bench Required** |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| FEM Unlock | Must remove module. 10-20 min process. |

---

## Pro Tips from the Field

- ⚡ **FEM:** Located passenger kick panel.
- 📋 **Shared Tech:** 1/2/3/4 Series share FEM.
- 🔧 **Blade:** HU66 (F-Series).

---

## Key Information

- **Blade:** HU66 (F-Series), HU92 (E-Series)
- **Lishi:** HU66, HU92
- **Battery:** CR2450 (Smart), CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW 4-SERIES - The Coupe
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-4-series-2014-2024',
  'BMW',
  '4-Series',
  2014,
  2024,
  '# BMW 4-Series 2014-2024 Master Programming Guide
## Coupe Style

---

## Overview

The 4-Series split from the 3-Series. F32 = F30 tech. G22 = G20 tech.

> ⚠️ **Critical Warning:** G22 (2021+) uses **SGW**.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608** | Full support |

---

## Generation Breakdown

### F32/F33/F36 (2014-2020) - FEM
| Spec | Value |
|------|-------|
| System | **FEM** |
| Keyway | **HU66** |
| Chip | ID49 |
| Programming | **Bench Required** |

### G22 (2021+) - BDC/SGW
| Spec | Value |
|------|-------|
| System | **BDC2 / SGW** |
| Keyway | **HU66** |
| Chip | ID53 |
| Security | **SGW Active** |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Convertible | Top must be closed for programming! |

---

## Pro Tips from the Field

- ⚡ **Convertible:** Smart key antenna location varies.
- 📋 **SGW:** 2021+ requires auth.
- 🔧 **Blade:** HU66.

---

## Key Information

- **Blade:** HU66
- **Lishi:** HU66
- **Battery:** CR2450 (Smart)

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);
