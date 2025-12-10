-- Honda CR-V Master Guide (2002-2024)
-- Generated from web research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-crv-2002-2024',
  'Honda',
  'CR-V',
  2002,
  2024,
  '# Honda CR-V 2002-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda CR-V is one of the best-selling compact SUVs in America. This guide covers all generations from 2002-2024, with their specific transponder chips, FCC IDs, and programming procedures.

> **Pearl:** CR-V jobs are bread and butter for locksmiths. The key evolution follows the same pattern as Accord - ID13 → ID46 → ID47. Know the cutoff years and you''re golden.

---

## Transponder Chip Types by Generation

| Year Range | Generation | Chip Type | Protocol | Notes |
|------------|------------|-----------|----------|-------|
| 2002-2004 | Gen 2 (RD) | ID13 (Megamos) | T5 Crypto | Glass wedge chip |
| 2005-2006 | Gen 2 (RD) | ID46 (PCF7936) | Philips Crypto 2 | Transition year |
| 2007-2011 | Gen 3 (RE) | ID46 (PCF7961) | HITAG 2 | Remote head key standard |
| 2012-2016 | Gen 4 (RM) | ID46 / ID47 | Mixed | 2015-2016 transitioned to ID47 |
| 2017-2024 | Gen 5 (RW) | ID47 (Honda G) | HITAG 3 | Smart key on most trims |

---

## FCC IDs by Year

### Remote Head Keys (Bladed)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2002-2004 | OUCG8D-344H-A | 3B | 35111-S9A-305 |
| 2005-2006 | OUCG8D-380H-A | 3B | 35111-SCV-315 |
| 2007-2011 | MLBHLIK-1T | 4B | 35111-SWA-305 |
| 2012-2014 | MLBHLIK-1T | 4B | 35111-T0A-305 |

### Smart Keys (Proximity)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2015-2016 | MLBHLIK6-1T | 4B | 72147-T0A-A01 |
| 2017-2019 | KR5V2X | 5B | 72147-TLA-A01 |
| 2020-2024 | KR5T4X | 5B | 72147-TLA-A11 |

---

## Mechanical Key Information

**Key Blade:** HON66 (2002-2019), HU101 (emergency blade on smart keys)

**Lishi Tool:** HON66 2-in-1 Pick & Decoder
- **Compatible Years:** 2002-2020
- **Lock Type:** 4-track external, 6-cut
- **Depths:** 1-6 (1 shallowest, 6 deepest)

> **Pearl:** The 2002+ CR-V door lock contains all wafer positions. You can decode from the door and have a working ignition key - unlike some older Hondas.

---

## Autel IM608 Programming

### Menu Path
IMMO → Honda → Manual Selection → CR-V → [Year] → Smart Key or Blade Key

### Add Key Procedure (With Working Key)

1. Connect Autel IM608 via OBDII with J2534 VCI
2. Navigate: IMMO → Honda → CR-V → [Year]
3. Select "Add Key (Guided)"
4. Place working key inside vehicle
5. Turn ignition ON
6. System reads existing key data
7. Turn ignition OFF when prompted
8. Insert NEW key and turn ON
9. Confirm security light turns off
10. Test new key

### All Keys Lost Procedure

1. Connect Autel IM608 via OBDII
2. Navigate: IMMO → Honda → CR-V → [Year]
3. Select "All Keys Lost (Guided)"
4. For smart key: Press START button to wake system
5. Place new key inside vehicle
6. Follow on-screen ignition cycle prompts
7. System will register new keys
8. Confirm immobilizer light OFF
9. Test all programmed keys

---

## OBP Remote Programming (Bladed Keys 2002-2014)

1. Close all doors and sit in driver''s seat
2. Insert key in ignition (do NOT start)
3. **Cycle 1:** Turn ON → Press LOCK → Turn OFF (within 5 sec)
4. **Cycle 2:** Turn ON → Press LOCK → Turn OFF (within 5 sec)
5. **Cycle 3:** Turn ON → Press LOCK → Turn OFF (within 5 sec)
6. **Cycle 4:** Turn ON → Press LOCK
7. **Listen for lock cycle ("clunk")** = Programming mode
8. Press LOCK on each additional remote within 10 seconds
9. Turn OFF to save and exit
10. Test all remotes

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Green key light blinking | Wrong chip type | Verify ID46 vs ID47 based on year |
| 2015-2016 won''t program | Using ID46 instead of ID47 | Check if vehicle has HITAG 3 system |
| Smart key not detected | Low fob battery or interference | Replace CR2032 battery |
| Remote programs, won''t start | Wrong blade cut | Re-decode with Lishi HON66 |

---

## Quick Reference Card

| Item | Value |
|------|-------|
| **Blade Type** | HON66 (2002-2019) |
| **Lishi Tool** | HON66 2-in-1 |
| **2002-2004 Chip** | ID13 (Megamos) |
| **2005-2014 Chip** | ID46 (PCF7936/7961) |
| **2015-2024 Chip** | ID47 (Honda G / HITAG 3) |
| **Frequency** | 315 MHz (North America) |
| **Add Key Time** | ~5 minutes |
| **AKL Time** | ~15-20 minutes |

---

## Sources

- carandtruckremotes.com - FCC IDs and part numbers
- crvownersclub.com - Chip type specifications by year
- obd2gate.com - Autel IM608 procedures
- genuinelishi.com - Lishi HON66 compatibility
- abkeys.com - Remote specifications
',
  '{"sources": ["carandtruckremotes.com", "crvownersclub.com", "obd2gate.com", "genuinelishi.com", "abkeys.com", "key4.com", "vvdi.com", "autelshop.de"], "generated": "2024-12-10", "method": "web_research"}'
);
