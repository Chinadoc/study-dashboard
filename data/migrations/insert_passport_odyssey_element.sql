-- Honda Passport, Odyssey Extended, Element Master Guides
-- Generated from web research with verified sources

-- Passport 2019-2024
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-passport-2019-2024',
  'Honda',
  'Passport',
  2019,
  2024,
  '# Honda Passport 2019-2024 Key Programming Master Guide

## Overview
The Honda Passport returned in 2019 as a mid-size SUV with smart key technology only.

> **Pearl:** Passport shares its platform with the Pilot. FCC ID KR5T44 is unique to Passport - don''t confuse with Pilot''s KR5V2X.

## Transponder Chip
| Year | Chip Type | Protocol |
|------|-----------|----------|
| 2019-2024 | ID47 (Philips) | HITAG 3 |

## FCC IDs
| Year | FCC ID | Buttons | Part Number |
|------|--------|---------|-------------|
| 2019-2021 | KR5T44 | 5B | 72147-TGS-A01 |
| 2022-2024 | KR5V44 | 5B | 72147-TGS-A11 |

## Key Information
- **Key Type:** Smart Key Only
- **Emergency Blade:** HU101
- **Battery:** CR2032
- **Frequency:** 314 MHz

## Autel IM608 Programming
### Menu Path
IMMO → Honda → Passport → [Year] → Smart Key

### Add Key (With Working Key)
1. Connect via OBDII
2. One registered key must be present
3. Press START twice (no brake)
4. Follow guided prompts
5. Place new key inside, move others away
6. Confirm immo light off

### All Keys Lost
- Autel IM608 supports AKL via OBD
- May require XP400 Pro for some scenarios
- Follow on-screen guided procedure

## No OBP - Professional Tool Required

## Quick Reference
| Item | Value |
|------|-------|
| Chip | ID47 (HITAG 3) |
| FCC ID | KR5T44 / KR5V44 |
| Lishi | N/A (smart key only) |
| Add Key | ~10 min |
| AKL | ~20-30 min |

## Sources
- locksmithkeyless.com, carandtruckremotes.com, autelkeytools.com
',
  '{"sources": ["locksmithkeyless.com", "carandtruckremotes.com", "autelkeytools.com", "americankeysupply.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- Odyssey Extended (2018-2024) - Update existing guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-odyssey-2018-2024',
  'Honda',
  'Odyssey',
  2018,
  2024,
  '# Honda Odyssey 2018-2024 Key Programming Master Guide

## Overview
The 5th generation Odyssey (2018+) features advanced 7-button smart keys with sliding door controls.

> **Pearl:** The 2018+ Odyssey has SEVEN buttons including left/right sliding door controls. This makes it unique among Honda smart keys.

## Transponder Chip
| Year | Chip Type | Protocol |
|------|-----------|----------|
| 2018-2024 | ID47 (Philips) | HITAG 3 |

## FCC IDs
| Year | FCC ID | Buttons | Part Number |
|------|--------|---------|-------------|
| 2018-2020 | KR5V2X | 7B | 72147-THR-A11/-A21/-A31 |
| 2021-2024 | KR5T4X | 7B | 72147-THR-A51/-A61/-A72 |

## Button Configuration
Lock, Unlock, Panic, Remote Start, LEFT Door, RIGHT Door, Hatch

## Key Information
- **Key Type:** Smart Key (7 Button)
- **Emergency Blade:** HU101
- **Battery:** CR2032
- **Frequency:** 433 MHz

## Autel IM608 Programming
### Menu Path
IMMO → Honda → Odyssey → [Year] → Smart Key → Push to Start

### Add Key
1. Connect via OBDII with J2534 VCI
2. Registered key must be in vehicle
3. Press START twice (no brake)
4. Follow guided prompts
5. Keep unlearned keys away
6. Place new key, confirm registration

### All Keys Lost
- Requires Autel IM608 or dealer
- XP400 Pro + APB131 may be required
- Active subscription needed

## No OBP - Professional Tool Required

## Quick Reference
| Item | Value |
|------|-------|
| Chip | ID47 (HITAG 3) |
| FCC ID | KR5V2X / KR5T4X |
| Buttons | 7 (with sliding doors) |
| Frequency | 433 MHz |
| Add Key | ~10 min |
| AKL | ~25-30 min |

## Sources
- remotesandkeys.com, carandtruckremotes.com, locksmithkeyless.com, youtube.com
',
  '{"sources": ["remotesandkeys.com", "carandtruckremotes.com", "locksmithkeyless.com", "youtube.com", "americankeysupply.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- Element 2003-2011
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-element-2003-2011',
  'Honda',
  'Element',
  2003,
  2011,
  '# Honda Element 2003-2011 Key Programming Master Guide

## Overview
The Honda Element is a compact crossover with standard remote head key technology.

> **Pearl:** Element chips changed in 2006 - earlier models use ID13, later use ID46. Always verify year before ordering blanks.

## Transponder Chip Types
| Year | Chip Type | Protocol |
|------|-----------|----------|
| 2003-2005 | ID13 (Megamos) | T5 Crypto |
| 2006-2011 | ID46 (Philips) | Crypto 2 |

## FCC IDs
| Year | FCC ID | Buttons | Notes |
|------|--------|---------|-------|
| 2003-2006 | NHVWB1U521/523 | 3B | Early remote |
| 2003-2011 | OUCG8D-344H-A | 3B | Common |
| 2007-2011 | OUCG8D-380H-A | 3B | Later models |

## Mechanical Key Information
- **Key Blade:** HON66
- **Lishi Tool:** HON66 2-in-1
- **Compatible Years:** 2003-2011

## OBP Remote Programming
1. Sit in driver''s seat, close all doors
2. Insert key in ignition
3. **Cycle 1-3:** ON → Press LOCK → OFF (within 5 sec each)
4. **Cycle 4:** ON → Press LOCK
5. Locks cycle = Programming mode
6. Press LOCK on each remote within 9 seconds
7. Turn OFF to save

## Autel IM608 Programming
### Menu Path
IMMO → Honda → Element → [Year] → Blade Key

### Add Key
1. Connect via OBDII
2. Insert working key, turn ON
3. System reads key data
4. Turn OFF, insert NEW key
5. Turn ON, confirm security light off

### All Keys Lost
- Autel IM608 supports via OBD
- May require pin code for older models

## Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| 2003-2005 won''t start | Wrong chip | Use ID13, not ID46 |
| Key blinks | Chip not registered | Re-program with Autel |

## Quick Reference
| Item | 2003-2005 | 2006-2011 |
|------|-----------|-----------|
| Chip | ID13 | ID46 |
| Blade | HON66 | HON66 |
| OBP | Yes | Yes |

## Sources
- carandtruckremotes.com, transpondery.com, elementownersclub.com
',
  '{"sources": ["carandtruckremotes.com", "transpondery.com", "elementownersclub.com", "keyless2go.com", "advanceautoparts.com"], "generated": "2024-12-10", "method": "web_research"}'
);
