-- Honda HR-V Master Guide (2016-2024)
-- Generated from web research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-hrv-2016-2024',
  'Honda',
  'HR-V',
  2016,
  2024,
  '# Honda HR-V 2016-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda HR-V is a subcompact crossover SUV that exclusively uses smart key technology from its introduction. All HR-V models require professional key programming.

> **Pearl:** The HR-V uses the same KR5V1X smart key as the Honda Fit EX. Cross-check compatibility when sourcing aftermarket keys.

---

## Transponder Chip Type

| Year Range | Chip Type | Protocol | Notes |
|------------|-----------|----------|-------|
| 2016-2024 | ID47 (PCF7938) | HITAG 3 | Smart key only, no bladed key option |

---

## FCC IDs

### Smart Keys (Proximity)
| Year | FCC ID | Buttons | OEM Part Number | Battery |
|------|--------|---------|-----------------|---------|
| 2016-2020 | KR5V1X | 4B | 72147-T7S-A01 | CR2032 |
| 2021-2024 | KR5V1X | 4B | 72147-T7S-A11 | CR2032 |

**Button Configuration:** Lock, Unlock, Hatch, Panic

**Frequency:** 314 MHz (313.85 MHz)

---

## Mechanical Key Information

**Emergency Blade:** HU101 (integrated in smart key fob)

**Lishi Tool:** HU101 2-in-1 for emergency door access
- Not typically needed unless fob battery dead
- Door lock is emergency access point only

---

## Autel IM608 Programming

### Menu Path
IMMO → Honda → Manual Selection → HR-V → [Year] → Smart Key → Push to Start

### Add Key Procedure (With Working Key)

1. Connect Autel IM608 via OBDII with J2534 VCI
2. Navigate: IMMO → Honda → HR-V → [Year]
3. Select "Add Key (Guided)"
4. One registered key MUST be present in vehicle
5. Press START button twice (don''t press brake)
6. System reads existing key data
7. Follow on-screen prompts for ignition cycling
8. Place NEW key inside vehicle
9. Move other keys 5+ meters away
10. Confirm immobilizer light turns off
11. Test new key - start, lock/unlock, hatch

### All Keys Lost Procedure

1. Connect Autel IM608 via OBDII
2. May require XP400 Pro + APB131 adapter for some scenarios
3. Navigate: IMMO → Honda → HR-V → [Year]
4. Select "All Keys Lost (Guided)"
5. Press and hold START to wake system
6. Place new key inside vehicle
7. Follow on-screen ignition cycle prompts
8. If alarm activates, remove horn fuse during procedure
9. Confirm immobilizer light OFF
10. Test all programmed keys

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Smart key not detected | Low fob battery | Replace CR2032 battery |
| "Key Not Detected" message | Key too far from START | Hold key against START button |
| AKL fails on newer model | Requires XP400 Pro | Use auxiliary programmer |
| Alarm going off during AKL | Normal behavior | Remove horn fuse temporarily |

---

## Quick Reference Card

| Item | Value |
|------|-------|
| **Key Type** | Smart Key Only |
| **Emergency Blade** | HU101 |
| **2016-2024 Chip** | ID47 (PCF7938 HITAG 3) |
| **FCC ID** | KR5V1X |
| **Frequency** | 314 MHz |
| **Battery** | CR2032 |
| **Add Key Time** | ~10 minutes |
| **AKL Time** | ~20-30 minutes |

---

## Sources

- yourcarkeyguys.com - Key specifications
- locksmithkeyless.com - FCC ID and part numbers
- vvdi.com - HITAG 3 chip specifications
- youtube.com - Autel programming demonstrations
- autelshop.de - All keys lost procedure
',
  '{"sources": ["yourcarkeyguys.com", "locksmithkeyless.com", "vvdi.com", "youtube.com", "autelshop.de", "carandtruckremotes.com", "mk3.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- Honda Ridgeline Master Guide (2006-2024)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-ridgeline-2006-2024',
  'Honda',
  'Ridgeline',
  2006,
  2024,
  '# Honda Ridgeline 2006-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda Ridgeline is a unique pickup truck that uses standard Honda key technology across two generations. This guide covers both the original (2006-2014) and second generation (2017-2024) models.

> **Pearl:** The first-gen Ridgeline (2006-2014) shares key specs with many Honda SUVs of that era. The second-gen (2017+) uses the same smart key platform as Pilot.

---

## Transponder Chip Types by Generation

| Year Range | Generation | Chip Type | Protocol | Notes |
|------------|------------|-----------|----------|-------|
| 2006-2014 | Gen 1 | ID46 (Philips "V") | Philips Crypto 2 | Remote head key |
| 2017-2024 | Gen 2 | ID47 / HITAG 3 | 128-bit AES | Smart key standard |

**Note:** No 2015-2016 model years were produced.

---

## FCC IDs by Year

### Remote Head Keys (Gen 1)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2006-2014 | OUCG8D-380H-A | 4B | 35111-SHJ-305 |

### Smart Keys (Gen 2)
| Year | FCC ID | Buttons | OEM Part Number | Battery |
|------|--------|---------|-----------------|---------|
| 2017-2020 | KR5V2X | 4-5B | 72147-T6Z-A01 | CR2032 |
| 2021-2024 | KR5V2X (V44) | 4-5B | 72147-T6Z-A51 | CR2032 |

---

## Mechanical Key Information

**Gen 1 Key Blade:** HON66 (2006-2014)
**Gen 2 Emergency Blade:** HU101 (in smart key fob)

**Lishi Tool:** HON66 2-in-1 for Gen 1
- **Compatible Years:** 2006-2014
- **Lock Type:** 4-track external, 6-cut

---

## Autel IM608 Programming

### Menu Path
IMMO → Honda → Manual Selection → Ridgeline → [Year] → [Key Type]

### Add Key - Gen 1 (2006-2014)

1. Connect Autel IM608 via OBDII
2. Navigate: IMMO → Honda → Ridgeline → [Year] → Blade Key
3. Select "Add Key (Guided)"
4. Insert working key and turn ON
5. System reads key data
6. Turn OFF, insert NEW key
7. Turn ON, confirm security light off
8. Test new key

### Add Key - Gen 2 (2017-2024)

1. Connect Autel IM608 via OBDII
2. Navigate: IMMO → Honda → Ridgeline → [Year] → Smart Key
3. Select "Add Key (Guided)"
4. One registered key must be present
5. Press START twice (no brake)
6. Follow on-screen prompts
7. Place new key in vehicle, move others away
8. Confirm lights off, test key

### All Keys Lost

1. Connect Autel IM608 via OBDII
2. IM608 supports AKL with code bypass for Ridgeline
3. Follow guided procedure
4. For Gen 2: XP400 Pro may be required
5. Test all keys after programming

---

## OBP Remote Programming (Gen 1 Only)

1. Close all doors, sit in driver''s seat
2. Insert key, do NOT start
3. **Cycle 1-3:** Turn ON → Press LOCK → Turn OFF (within 5 sec each)
4. **Cycle 4:** Turn ON → Press LOCK
5. Listen for lock cycle = Programming mode
6. Press LOCK on each remote within 10 sec
7. Turn OFF to save
8. Test all remotes

---

## Quick Reference Card

| Item | Gen 1 (2006-2014) | Gen 2 (2017-2024) |
|------|-------------------|-------------------|
| **Key Type** | Remote Head Key | Smart Key |
| **Blade** | HON66 | HU101 (emergency) |
| **Chip** | ID46 | ID47 / HITAG 3 |
| **FCC ID** | OUCG8D-380H-A | KR5V2X |
| **Frequency** | 314 MHz | 314 MHz |
| **Lishi Tool** | HON66 | N/A |

---

## Sources

- carandtruckremotes.com - FCC IDs and part numbers
- locksmithkeyless.com - Key specifications
- oemcarkeymall.com - Transponder chip info
- youtube.com - Autel programming demos
- hondainfocenter.com - Immobilizer system info
',
  '{"sources": ["carandtruckremotes.com", "locksmithkeyless.com", "oemcarkeymall.com", "youtube.com", "hondainfocenter.com", "northcoastkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);
