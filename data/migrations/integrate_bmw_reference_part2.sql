-- Integrate BMW Reference Document - Part 2
-- X-Series, Z-Series

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW X5 - The Original SAV
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-x5-1999-2024',
  'BMW',
  'X5',
  1999,
  2024,
  '# BMW X5 1999-2024 Master Programming Guide
## EWS to SGW Evolution

---

## Overview

The X5 (E53) started with EWS. Modern G05 uses BDC/SGW.

> ⚠️ **Critical Warning:** F15 (2014-2018) uses **BDC** (early adoption). Requires bench read.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Bench Setup** | Mandatory for F15/G05 |

---

## Generation Breakdown

### E53 (1999-2006) - EWS
| Spec | Value |
|------|-------|
| System | **EWS3 / EWS4** |
| Keyway | **HU58** (early) / **HU92** |
| Chip | ID44 |
| Note | Door lock often fails (spinning cylinder) |

### E70 (2007-2013) - CAS3
| Spec | Value |
|------|-------|
| System | **CAS3 / CAS3+** |
| Keyway | **HU92** |
| Chip | ID46 |
| Note | Slot Key or Comfort Access |

### F15 (2014-2018) - BDC
| Spec | Value |
|------|-------|
| System | **BDC (Body Domain Controller)** |
| Keyway | **HU100R** |
| Chip | ID49 |
| Programming | **Bench Required** |

### G05 (2019+) - BDC/SGW
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
| E53 Door Lock | "Spinning" lock means tailpiece broken. Repair kit available. |
| F15 No Start | BDC sync lost. Restore coding backup. |

---

## Pro Tips from the Field

- ⚡ **E53:** EWS module is under driver dash, left side.
- 📋 **F15:** BDC is in passenger footwell (A-pillar).
- 🔧 **Lishi:** HU92 (E53/E70), HU100R (F15), HU66 (G05).

---

## Key Information

- **Blade:** HU66 (G05), HU100R (F15), HU92 (E70), HU58 (E53 early)
- **Lishi:** HU66, HU100R, HU92, HU58
- **Battery:** CR2032 / Rechargeable

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW X3 - Compact SAV
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-x3-2003-2024',
  'BMW',
  'X3',
  2003,
  2024,
  '# BMW X3 2003-2024 Master Programming Guide
## EWS4 to BDC

---

## Overview

The X3 (E83) is notorious for **EWS4** (difficult to read).

> 💡 **Pearl:** E83 (2003-2010) uses **EWS4**. Requires soldering or special adapter to read MCU.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608** | Full support |
| **AK90+** | Best for EWS reading |

---

## Generation Breakdown

### E83 (2003-2010) - EWS4
| Spec | Value |
|------|-------|
| System | **EWS4** |
| Keyway | **HU92** |
| Chip | ID44 / ID46 |
| Note | MCU is secured. AK90+ recommended. |

### F25 (2011-2017) - CAS4
| Spec | Value |
|------|-------|
| System | **CAS4 / CAS4+** |
| Keyway | **HU100R** |
| Chip | ID49 |

### G01 (2018+) - BDC
| Spec | Value |
|------|-------|
| System | **BDC** |
| Keyway | **HU66** |
| Chip | ID49 / ID53 |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| E83 No Crank | EWS rolling code sync lost. Resync DME-EWS. |
| CAS4 000000 | Flash corrupted. Restore backup. |

---

## Pro Tips from the Field

- ⚡ **E83 EWS:** Located driver kick panel. White box.
- 📋 **F25:** CAS4 module under dash.
- 🔧 **Blade:** HU92 (E83), HU100R (F25), HU66 (G01).

---

## Key Information

- **Blade:** HU66 (G01), HU100R (F25), HU92 (E83)
- **Lishi:** HU66, HU100R, HU92
- **Battery:** CR2032 / Rechargeable

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW Z4 - Roadster
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-z4-2003-2024',
  'BMW',
  'Z4',
  2003,
  2024,
  '# BMW Z4 2003-2024 Master Programming Guide
## Roadster Tech

---

## Overview

The Z4 shares tech with 3-Series. E85 = E46 tech. E89 = E90 tech.

> 💡 **Pearl:** G29 (2019+) shares platform with **Toyota Supra**. Both use BMW BDC system!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608** | Full support |

---

## Generation Breakdown

### E85/E86 (2003-2008) - EWS
| Spec | Value |
|------|-------|
| System | **EWS3 / EWS4** |
| Keyway | **HU92** |
| Chip | ID44 |

### E89 (2009-2016) - CAS3
| Spec | Value |
|------|-------|
| System | **CAS3+** |
| Keyway | **HU92** |
| Chip | ID46 |
| Note | Slot Key |

### G29 (2019+) - BDC
| Spec | Value |
|------|-------|
| System | **BDC** |
| Keyway | **HU66** |
| Chip | ID49 |
| Note | **Supra Twin** |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Supra Key | Yes, you can program Toyota Supra keys with BMW tools! |

---

## Pro Tips from the Field

- ⚡ **Supra:** 2020+ Supra IS a BMW Z4 electronically.
- 📋 **E85:** EWS module behind glovebox (unlike E46).
- 🔧 **Blade:** HU92 (E-Series), HU66 (G-Series).

---

## Key Information

- **Blade:** HU66 (G29), HU92 (E85/E89)
- **Lishi:** HU66, HU92
- **Battery:** CR2032 / Rechargeable

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);
