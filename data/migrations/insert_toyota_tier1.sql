-- Toyota Tier 1 High-Volume Master Guides: Camry, Corolla, RAV4
-- Generated from web research with verified sources

-- Camry 2000-2024
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'toyota-camry-2000-2024',
  'Toyota',
  'Camry',
  2000,
  2024,
  '# Toyota Camry 2000-2024 Key Programming Master Guide

## Overview
The Toyota Camry is one of the best-selling sedans in America. This guide covers chip evolution from 4C to H-chip across 5 generations.

> **Pearl:** Toyota switched to H-chip around 2012. The 2018+ US market has AKL restrictions on Autel - you may need alternative tools for all keys lost.

## Transponder Chip Types
| Year | Chip Type | Protocol |
|------|-----------|----------|
| 2000-2002 | 4C | Fixed Code |
| 2003-2006 | 4D67 (Dot) | Texas Crypto |
| 2007-2011 | 4D67 | Texas Crypto DST |
| 2012-2017 | H-chip (8A) | 128-bit AES |
| 2018-2024 | H-chip (8A) | 128-bit AES |

## FCC IDs
| Year | FCC ID | Key Type | Buttons |
|------|--------|----------|---------|
| 2007-2011 | HYQ12BBY | Remote Head Key | 4B |
| 2010-2011 | HYQ14AABS | Smart Key | 4B |
| 2018-2023 | HYQ14FBC | Smart Key | 4B |
| 2018-2024 | HYQ14FLA | Smart Key | 4B |
| 2018-2024 | HYQ12BFB/BGF | Flip Key | 3-4B |

## Key Information
- **Blade:** TOY43 (older), TOY48 (newer smart keys)
- **Lishi Tool:** TOY43 2-in-1 (2000-2017)
- **Battery:** CR2032 (smart keys)
- **Frequency:** 315 MHz (USA)

## Autel IM608 Programming
### Important US Market Restriction
⚠️ **Toyota AKL is restricted on Autel IM608 Pro II in US market.** Add key with master key present still works.

### Add Key (With Working Key)
1. Connect via OBDII
2. Navigate: IMMO → Toyota → Camry → [Year]
3. Insert master key, turn ON
4. Follow guided prompts for key registration
5. Insert new key when prompted
6. Test new key

### All Keys Lost (Non-US or alternative tools)
- Requires VVDI, Lonsdor, or Smart Pro
- May require PIN code from immo ECU

## OBP Remote Programming (Some Models)
For older models with 4D67 chip:
1. Insert master key and remove 5 times quickly
2. Close/open driver door 6 times
3. Insert key, turn ON
4. Press LOCK 3 times within 40 seconds
5. Locks cycle = success

## Quick Reference
| Item | Value |
|------|-------|
| Blade | TOY43 / TOY48 |
| Lishi | TOY43 |
| 2000-2006 Chip | 4C / 4D67 |
| 2007-2011 Chip | 4D67 |
| 2012-2024 Chip | H-chip (8A) |
| Frequency | 315 MHz |

## Sources
- transpondery.com, key4.com, autelshop.de, locksmithkeyless.com
',
  '{"sources": ["transpondery.com", "key4.com", "autelshop.de", "locksmithkeyless.com", "yourcarkeyguys.com", "auteleshop.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- Corolla 2008-2024
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'toyota-corolla-2008-2024',
  'Toyota',
  'Corolla',
  2008,
  2024,
  '# Toyota Corolla 2008-2024 Key Programming Master Guide

## Overview
The Toyota Corolla is one of the most popular compact cars. Chip technology evolved from 4D67 to G to H across this period.

> **Pearl:** Corolla 2014 is a transition year - verify G vs H chip before ordering blanks. Look at the key head marking.

## Transponder Chip Types
| Year | Chip Type | Protocol |
|------|-----------|----------|
| 2008-2013 | 4D67 (Dot) | Texas Crypto |
| 2014 | G or H | Verify VIN |
| 2014-2024 | H-chip (8A) | 128-bit AES |

## FCC IDs
| Year | FCC ID | Key Type | Buttons |
|------|--------|----------|---------|
| 2008-2013 | HYQ12BBY | Remote Head Key | 4B |
| 2014-2019 | HYQ12BDM | Remote Head Key | 4B |
| 2019-2024 | HYQ12BFW | Flip Key | 4B |
| 2024-2025 | HYQ14FBW | Smart Key (GR) | 4B |

## Key Information
- **Blade:** TOY43 (pre-2019), TOY48 (2019+)
- **Lishi Tool:** TOY43 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz

## OBP Remote Programming
For 2004-2013 models:
1. Open driver door
2. Insert key, turn ON/OFF 2 times
3. Close/open driver door 2 times
4. Insert key, turn ON/OFF 2 times
5. Close/open driver door 2 times
6. Insert key, turn ON
7. Locks cycle = programming mode
8. Press remote buttons to register

## Autel IM608 Programming
⚠️ **US AKL Restricted** - Use VVDI or Lonsdor for all keys lost.

### Add Key
1. Connect via OBDII
2. Navigate: IMMO → Toyota → Corolla → [Year]
3. Follow guided procedure with master key

## Quick Reference
| Item | Value |
|------|-------|
| Blade | TOY43 / TOY48 |
| Lishi | TOY43 |
| 2008-2013 Chip | 4D67 |
| 2014 Chip | G or H (verify) |
| 2014-2024 Chip | H-chip (8A) |

## Sources
- carandtruckremotes.com, abkeys.com, transpondery.com, bestkeysolution.com
',
  '{"sources": ["carandtruckremotes.com", "abkeys.com", "transpondery.com", "bestkeysolution.com", "programautokeys.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- RAV4 2006-2024
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'toyota-rav4-2006-2024',
  'Toyota',
  'RAV4',
  2006,
  2024,
  '# Toyota RAV4 2006-2024 Key Programming Master Guide

## Overview
The Toyota RAV4 is Toyotas best-selling compact SUV. Key technology evolved from 4D67 through G to H chip.

> **Pearl:** 2010-2012 RAV4 could have either Dot or G chip - always verify before ordering. 2013+ consistently uses H-chip.

## Transponder Chip Types
| Year | Chip Type | Protocol |
|------|-----------|----------|
| 2006-2009 | 4D67 (Dot) | Texas Crypto |
| 2010-2012 | 4D67 or G | Verify VIN |
| 2013-2018 | H-chip (8A) | 128-bit AES |
| 2019-2024 | H-chip (8A) | 128-bit AES |

## FCC IDs
| Year | FCC ID | Key Type | Buttons |
|------|--------|----------|---------|
| 2006-2011 | HYQ12BBY | Remote Head Key | 3B |
| 2013-2019 | HYQ12BDM | Remote Head Key | 4B |
| 2017 | GQ4-52T | Remote Head Key | 4B |
| 2019-2024 | HYQ12BFW | Flip Key | 4B |

## Key Information
- **Blade:** TOY43 (pre-2019), TOY48 (2019+)
- **Lishi Tool:** TOY43 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz

## OBP Transponder Programming (2006-2010 with master key)
1. Open driver door
2. Insert and remove master key 5 times rapidly
3. Close/open driver door 6 times
4. Insert new key, turn ON
5. Wait 60 seconds for registration
6. Light off = success

## Autel IM608 Programming
⚠️ **US AKL Restricted** - Can use Autel for add key. For AKL, use emulator function or alternative tools.

### Add Key
1. Connect via OBDII
2. Navigate: IMMO → Toyota → RAV4 → [Year]
3. Follow guided procedure
4. Master key required for registration

## Quick Reference
| Item | Value |
|------|-------|
| Blade | TOY43 / TOY48 |
| Lishi | TOY43 |
| 2006-2009 Chip | 4D67 |
| 2010-2012 Chip | 4D67 or G |
| 2013-2024 Chip | H-chip (8A) |

## Sources
- locksmithkeyless.com, carandtruckremotes.com, northcoastkeyless.com, programautokeys.com
',
  '{"sources": ["locksmithkeyless.com", "carandtruckremotes.com", "northcoastkeyless.com", "programautokeys.com", "key4.com", "rav4world.com"], "generated": "2024-12-10", "method": "web_research"}'
);
