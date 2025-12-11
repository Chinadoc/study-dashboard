-- Integrate Ford Reference Document - Part 2
-- Mustang, Edge, Fusion

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD MUSTANG - The Pony Car
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ford-mustang-1996-2024',
  'Ford',
  'Mustang',
  1996,
  2024,
  '# Ford Mustang 1996-2024 Master Programming Guide
## Evolution of an Icon

---

## Overview

The Mustang has used every generation of PATS. 2015+ introduced smart keys and 2024+ has major changes.

> ⚠️ **Critical Warning:** 2024+ Mustang uses **434 MHz** keys and requires FD-CAN adapter for some tools.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi HU101 / FO38** | See generation breakdown |
| **Smart Keys** | 315, 902, 434 MHz |

---

## Generation Breakdown

### Gen 4 (1996-2004) - Legacy PATS
| Spec | Value |
|------|-------|
| Keyway | **FO38 / H75** |
| Chip | ID13 (1996-97) → ID63 (1998+) |
| System | PATS 1 / PATS 2 |

### Gen 5 (2005-2014) - Retro Style
| Spec | Value |
|------|-------|
| Keyway | **FO38** |
| Chip | ID63 (80-bit) |
| Remote | CWTWB1U793 (Remote Head) |

### Gen 6 (2015-2023) - S550 Platform
| Spec | Value |
|------|-------|
| Keyway | **HU101** |
| Smart Key | 315 MHz (M3N-A2C31243800) / 902 MHz |
| Backup Slot | Center console cupholder |

### Gen 7 (2024+) - S650 Platform
| Spec | Value |
|------|-------|
| Keyway | HU101 |
| Frequency | **434 MHz** |
| System | New architecture (FD-CAN) |

---

## Backup Slot Locations

- **2010-2014:** Center console cupholder (keyed)
- **2015-2023:** Center console cupholder (under rubber mat)
- **2024+:** Center console rear cupholder

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2015-2017 Frequency | Can be 315 or 902 MHz - verify FCC |
| Convertible top | Ensure top is closed for programming |
| Active Alarm | 2015+ requires active alarm bypass |

---

## Pro Tips from the Field

- ⚡ **Mach-E:** Uses same system as 2021+ F-150 (RH850)
- 📋 **Shelby GT350/500:** Same programming as standard Mustang
- 🔧 **Convertible:** Smart key slot may be in different spot (check manual)

---

## Key Information

- **Blade:** HU101 (2015+), FO38 (1996-2014)
- **Lishi:** HU101 V3, FO38
- **Battery:** CR2450 (Smart), CR2032 (Remote)

---

*Last Updated: December 2025*
',
  '{"sources": ["ford_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD EDGE - Mid-Size Crossover
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ford-edge-2007-2024',
  'Ford',
  'Edge',
  2007,
  2024,
  '# Ford Edge 2007-2024 Master Programming Guide
## Smart Key Pioneer

---

## Overview

The Edge was one of the first Fords to get smart keys (2011+).

> 💡 **Pearl:** 2011-2014 Edge smart keys are **ID46** (rare for Ford). 2015+ switched to **ID49**.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi HU101 / FO38** | Verify year |

---

## Generation Breakdown

### Gen 1 (2007-2014)
| Spec | Value |
|------|-------|
| Keyway | **FO38** (2007-10) → **HU101** (2011-14) |
| Chip | ID63 (Keyed) / ID46 (Smart 11-14) |
| Smart Key | M3N5WY8609 (315 MHz) |

### Gen 2 (2015-2024)
| Spec | Value |
|------|-------|
| Keyway | **HU101** |
| Smart Key | M3N-A2C931426 (902 MHz) / 315 MHz |
| Chip | ID49 / HITAG Pro |
| Backup Slot | Center console storage bin |

---

## Backup Slot Locations

- **2011-2014:** Center console storage bin
- **2015+:** Center console storage bin (bottom)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2011-2014 Smart Key | Uses ID46 chip - unique for Ford |
| 2015+ Frequency | 315 vs 902 MHz - verify FCC |
| Keypad Code | Often on BCM label (driver footwell) |

---

## Pro Tips from the Field

- ⚡ **2011-2014 ID46:** Don''t try to use ID63 or ID49 keys!
- 📋 **Titanium:** Always smart key
- 🔧 **ST Trim:** Same programming as standard Edge

---

## Key Information

- **Blade:** HU101 (2011+), FO38 (2007-2010)
- **Lishi:** HU101 V3, FO38
- **Battery:** CR2450 (Smart), CR2032 (Remote)

---

*Last Updated: December 2025*
',
  '{"sources": ["ford_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD FUSION - Mid-Size Sedan
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ford-fusion-2006-2020',
  'Ford',
  'Fusion',
  2006,
  2020,
  '# Ford Fusion 2006-2020 Master Programming Guide
## Fleet Favorite

---

## Overview

The Fusion was a fleet favorite. 2013+ redesign brought HU101 and widespread smart key adoption.

> 💡 **Pearl:** 2013-2016 Fusion smart keys are **315 MHz**. 2017+ can be **315 or 902 MHz**.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi HU101 / FO38** | Verify year |

---

## Generation Breakdown

### Gen 1 (2006-2012)
| Spec | Value |
|------|-------|
| Keyway | **FO38** |
| Chip | ID63 (80-bit) |
| Remote | OUC6000022 (Remote Head) |

### Gen 2 (2013-2020)
| Spec | Value |
|------|-------|
| Keyway | **HU101** |
| Smart Key | M3N-A2C31243300 (315 MHz) |
| Chip | ID49 / HITAG Pro |
| Backup Slot | Center console cupholder or storage |

---

## Backup Slot Locations

- **2013-2020:** Center console cupholder (under rubber mat) or storage bin

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Key won''t turn (Gen 1) | Ignition housing failure common |
| 2017+ Frequency | Verify 315 vs 902 MHz |
| Hybrid | 12V battery in trunk - check voltage |

---

## Pro Tips from the Field

- ⚡ **Discontinued 2020:** No new models
- 📋 **Titanium/Platinum:** Smart key standard
- 🔧 **Hybrid/Energi:** Same programming, check 12V battery

---

## Key Information

- **Blade:** HU101 (2013+), FO38 (2006-2012)
- **Lishi:** HU101 V3, FO38
- **Battery:** CR2450 (Smart), CR2032 (Remote)

---

*Last Updated: December 2025*
',
  '{"sources": ["ford_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);
