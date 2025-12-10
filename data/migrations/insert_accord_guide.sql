-- Honda Accord Master Guide (1998-2024)
-- Generated from web research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-accord-1998-2024',
  'Honda',
  'Accord',
  1998,
  2024,
  '# Honda Accord 1998-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda Accord spans multiple generations from 1998-2024, with significant changes in immobilizer technology over the years. This guide covers all generations with their specific transponder chips, FCC IDs, and programming procedures.

> **Pearl:** The Honda Accord is one of the most common vehicles you''ll encounter. Master the generational differences and you''ll handle 90% of Honda key jobs confidently.

---

## Transponder Chip Types by Generation

| Year Range | Chip Type | Protocol | Notes |
|------------|-----------|----------|-------|
| 1998-2002 | ID13 (Megamos) | T5 Crypto | Legacy system, glass wedge chip |
| 2003-2012 | ID46 (PCF7936) | Philips Crypto 2 | Remote head key standard |
| 2013-2017 | ID47 (Honda G) | HITAG 3 | Transition to smart key on higher trims |
| 2018-2021 | ID47 (HITAG 3) | 128-bit AES | Smart key standard on most trims |
| 2022-2024 | ID4A (NCF29A1M) | 128-bit AES | Latest generation smart key |

---

## FCC IDs by Year

### Remote Head Keys (Bladed)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2003-2007 | OUCG8D-380H-A | 4B | 35118-SDA-A11 |
| 2008-2012 | MLBHLIK-1T | 4B | 35118-TA0-A00 |

### Smart Keys (Proximity)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2013-2015 | ACJ932HK1210A | 4B | 72147-T2A-A01 |
| 2016-2017 | KR5V1X | 5B | 72147-T2A-A11 |
| 2018-2021 | CWTWB1G0090 | 5B | 72147-TVA-A01 |
| 2022-2024 | KR5TP-4 | 4B | 72147-T6A-A01 |

---

## Mechanical Key Information

**Key Blade:** HON66 (2003-2018), HU101 (emergency blade on smart keys)

**Lishi Tool:** HON66 2-in-1 Pick & Decoder
- **Compatible Years:** 2003-2018
- **Lock Type:** 4-track external, 6-cut
- **Depths:** 1-6 (1 shallowest, 6 deepest)

---

## Autel IM608 Programming

### Menu Path
IMMO → Honda → Manual Selection → Accord → [Year] → Smart Key or Blade Key

### Add Key Procedure (With Working Key)

1. Connect Autel IM608 via OBDII with J2534 VCI
2. Navigate: IMMO → Honda → Accord → [Year]
3. Select "Add Key (Guided)"
4. Place working key inside vehicle
5. Press START button twice (ignition ON, not engine)
6. System reads existing key data
7. Turn ignition OFF when prompted
8. Remove working key, insert NEW key
9. Turn ignition ON (START button x2)
10. Confirm security light turns off
11. Test new key - start engine, lock/unlock doors

### All Keys Lost Procedure

1. Connect Autel IM608 via OBDII
2. Navigate: IMMO → Honda → Accord → [Year]
3. Select "All Keys Lost (Guided)"
4. Press and hold START button until ignition activates
5. For 2020+ models, confirm when prompted
6. Turn ignition OFF (without pressing brake)
7. Place new key inside vehicle
8. Turn ignition ON (START button x2 without brake)
9. Confirm keyless access + immo lights are OFF
10. Enter number of keys to program
11. Follow ignition cycle prompts (OFF → ON) for each key
12. Test all programmed keys

---

## OBP Remote Programming (Bladed Keys 1998-2012)

This procedure programs the remote buttons ONLY (not the transponder).

1. Close all doors and sit in driver''s seat
2. Insert key in ignition (do NOT start)
3. **Cycle 1:** Turn ON → Press LOCK button → Turn OFF (within 5 seconds)
4. **Cycle 2:** Turn ON → Press LOCK button → Turn OFF (within 5 seconds)
5. **Cycle 3:** Turn ON → Press LOCK button → Turn OFF (within 5 seconds)
6. **Cycle 4 (Programming Mode):** Turn ON → Press LOCK button
7. **Listen for door lock cycling ("clunk-clunk")** = Programming mode entered
8. **Within 10 seconds:** Press LOCK on each additional remote
9. Turn ignition OFF to exit and save
10. Test all remotes

> **Pearl:** Timing is critical! Complete each cycle within 5 seconds. If locks don''t cycle on step 6, start over.

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Green key light blinking | Wrong chip type | Verify ID46 vs ID47 based on year |
| Remote won''t program via OBP | Smart key system | OBP only works on bladed key models |
| "Communication Error" on IM608 | Low battery voltage | Connect battery maintainer, ensure 12.5V+ |
| Key programs but won''t start | Blade not cut correctly | Re-decode with Lishi HON66 |

---

## Quick Reference Card

| Item | Value |
|------|-------|
| **Blade Type** | HON66 (2003-2018) |
| **Lishi Tool** | HON66 2-in-1 |
| **1998-2002 Chip** | ID13 (T5) |
| **2003-2012 Chip** | ID46 (PCF7936) |
| **2013-2021 Chip** | ID47 (HITAG 3) |
| **2022-2024 Chip** | ID4A (NCF29A1M) |
| **Frequency** | 315 MHz (North America) |
| **Add Key Time** | ~5 minutes |
| **AKL Time** | ~15-20 minutes |

---

## Sources

- remotesandkeys.com - Chip and FCC ID specifications
- carandtruckremotes.com - OEM part numbers
- obd2gate.com - Autel IM608 procedures
- uhs-hardware.com - Lishi HON66 compatibility
- hondapartsonline.net - OBP programming procedure
- transpondery.com - Transponder chip database
',
  '{"sources": ["remotesandkeys.com", "carandtruckremotes.com", "obd2gate.com", "autelshop.de", "uhs-hardware.com", "hondapartsonline.net", "transpondery.com", "keyless2go.com", "key4.com"], "generated": "2024-12-10", "method": "web_research"}'
);
