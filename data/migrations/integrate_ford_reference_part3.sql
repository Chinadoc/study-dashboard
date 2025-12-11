-- Integrate Ford Reference Document - Part 3 (Fixed)
-- Focus, Transit, Transit Connect

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD FOCUS - Compact Car
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ford-focus-2000-2018',
  'Ford',
  'Focus',
  2000,
  2018,
  '# Ford Focus 2000-2018 Master Programming Guide
## Global Platform Evolution

---

## Overview

The Focus evolved from FO38 (Gen 1) to HU101 (Gen 2+). 2012+ introduced smart keys.

> 💡 **Pearl:** 2012-2018 Focus smart keys are **315 MHz**. Don''t confuse with 902 MHz keys used on other Fords of this era.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi HU101 / FO38** | Verify year |

---

## Generation Breakdown

### Gen 1 (2000-2011)
| Spec | Value |
|------|-------|
| Keyway | **FO38** |
| Chip | ID63 (40/80 bit) |
| Remote | OUC6000022 (Remote Head) |

### Gen 3 (2012-2018)
| Spec | Value |
|------|-------|
| Keyway | **HU101** |
| Smart Key | M3N5WY8609 (315 MHz) |
| Chip | ID63 (Keyed) / ID49 (Smart) |
| Backup Slot | Steering column (keyed) or Console (smart) |

---

## Backup Slot Locations

- **2012-2018:** Steering column (hold key against marked area) or center console storage

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Ignition failure (Gen 1) | Common issue - housing breaks |
| Transmission Control Module | TCM failure causes no-start (not IMMO) |
| 2012+ Keyed | Uses ID63-80 bit chip |

---

## Pro Tips from the Field

- ⚡ **Discontinued 2018:** No US models after 2018
- 📋 **ST/RS:** Same programming as standard Focus
- 🔧 **TCM Issues:** Check for "Transmission Fault" on dash

---

## Key Information

- **Blade:** HU101 (2012+), FO38 (2000-2011)
- **Lishi:** HU101 V3, FO38
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["ford_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD TRANSIT - Commercial Van
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ford-transit-2015-2024',
  'Ford',
  'Transit',
  2015,
  2024,
  '# Ford Transit 2015-2024 Master Programming Guide
## Commercial Workhorse

---

## Overview

The full-size Transit replaced the E-Series. Uses **HU101** keyway and high-security keys.

> 💡 **Pearl:** Most Transits are keyed ignition (ID63-80 bit). Smart keys are rare but exist on high trims.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi HU101** | Standard for all years |

---

## Specifications

| Spec | Value |
|------|-------|
| Keyway | **HU101** |
| Chip | **ID63 (80-bit)** |
| Remote | Integrated Remote Head (3-button) |
| Smart Key | Rare - check FCC if present |

---

## Blue Key (Tibbe) Warning

Older Transit Connects (2010-2013) used **Tibbe** keys (6-cut). Full-size Transit (2015+) uses **HU101**.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Rear door lock | Often seized from lack of use |
| Side door contacts | Dirty contacts cause "Door Ajar" |
| AKL | Requires 2 keys to close cycle |

---

## Pro Tips from the Field

- ⚡ **Fleet Keys:** Often keyed alike - check fleet code
- 📋 **Remote Head:** Buttons wear out fast - stock shells
- 🔧 **Cargo Area:** Lock cylinder often different if replaced

---

## Key Information

- **Blade:** HU101
- **Lishi:** HU101 V3
- **Battery:** CR2032 (Remote Head)

---

*Last Updated: December 2025*
'
  , '{"sources": ["ford_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD TRANSIT CONNECT - Compact Commercial
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ford-transit-connect-2010-2023',
  'Ford',
  'Transit Connect',
  2010,
  2023,
  '# Ford Transit Connect 2010-2023 Master Programming Guide
## Tibbe vs HU101

---

## Overview

Major change in 2014 from **Tibbe** keys to **HU101**.

> ⚠️ **Critical Warning:** 2010-2013 uses **Tibbe (6-cut)** keys. Requires special Tibbe pick/decoder!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Tibbe Pick** | Required for 2010-2013 |
| **Lishi HU101** | For 2014+ |

---

## Generation Breakdown

### Gen 1 (2010-2013)
| Spec | Value |
|------|-------|
| Keyway | **Tibbe (6-cut)** |
| Chip | ID63 (80-bit) |
| Remote | Separate fob or Blue Head key |

### Gen 2 (2014-2023)
| Spec | Value |
|------|-------|
| Keyway | **HU101** |
| Chip | ID63 (80-bit) |
| Remote | Integrated Remote Head |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tibbe decoding | Read: 1=No Cut, 4=Deepest Cut |
| Bonnet Lock | Gen 1 hood opens with KEY (front grille) |
| No Chip? | Some base models have NO transponder! |

---

## Pro Tips from the Field

- ⚡ **Hood Lock:** Gen 1 requires key to open hood
- 📋 **No Chip:** Verify if "PATS" light exists on dash
- 🔧 **Tibbe:** Practice decoding - it''s unique

---

## Key Information

- **Blade:** HU101 (2014+), Tibbe (2010-2013)
- **Lishi:** HU101 V3, Tibbe Pick
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
  , '{"sources": ["ford_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);
