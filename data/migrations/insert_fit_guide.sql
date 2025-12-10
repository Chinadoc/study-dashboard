-- Honda Fit Master Guide (2007-2020)
-- Generated from web research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-fit-2007-2020',
  'Honda',
  'Fit',
  2007,
  2020,
  '# Honda Fit 2007-2020 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda Fit (Jazz in other markets) is a compact hatchback that uses different key technologies across its three generations. This guide covers all model years with their specific transponder chips, FCC IDs, and programming procedures.

> **Pearl:** The Fit has unique chip variations - the 2007 model uses the rare ID8E "H" chip, while 2008+ switched to standard Honda chips. Always verify year before ordering blanks.

---

## Transponder Chip Types by Generation

| Year Range | Generation | Chip Type | Protocol | Notes |
|------------|------------|-----------|----------|-------|
| 2007 | Gen 1 (GD) | ID8E (Megamos) | "H" Chip | Unique to 2007 Fit |
| 2008 | Gen 1 (GD) | ID46 (PCF7936) | Philips Crypto 2 | Transition year |
| 2009-2014 | Gen 2 (GE) | ID46 (PCF7936) | Philips Crypto 2 | Standard remote head key |
| 2015-2020 | Gen 3 (GK) | PCF7938 G | Honda G Chip | Smart key on EX trim |

---

## FCC IDs by Year

### Remote Head Keys (Bladed)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2007 | OUCG8D-380H-A | 3B | 35111-SAA-305 |
| 2007 (Sport) | G8D-384H-A | 3B | 35111-SAA-315 |
| 2009-2013 | MLBHLIK-1T | 3B | 35111-TK6-305 |

### Smart Keys (Proximity) - EX Trim Only
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2015-2017 | KR5V1X | 4B | 72147-T5A-A01 |
| 2018-2020 | KR5V1X | 4B | 72147-T5A-A11 |

---

## Mechanical Key Information

**Key Blade:** HON66 (2007-2020), HU101 (emergency blade on smart keys)

**Lishi Tool:** HON66 2-in-1 Pick & Decoder
- **Compatible Years:** 2007-2020
- **Lock Type:** 4-track external, 6-cut
- **Depths:** 1-6

---

## Autel IM608 Programming

### Menu Path
IMMO → Honda → Manual Selection → Fit → [Year] → Smart Key or Blade Key

### Add Key Procedure (With Working Key)

1. Connect Autel IM608 via OBDII with J2534 VCI
2. Navigate: IMMO → Honda → Fit → [Year]
3. Select "Add Key (Guided)"
4. Insert/place working key in vehicle
5. Turn ignition ON (or press START twice for smart key)
6. System reads existing key data
7. Turn ignition OFF when prompted
8. Insert/place NEW key
9. Turn ignition ON
10. Confirm security light turns off
11. Test new key

### All Keys Lost Procedure

1. Connect Autel IM608 via OBDII
2. Navigate: IMMO → Honda → Fit → [Year]
3. Select "All Keys Lost (Guided)"
4. Follow on-screen prompts for ignition cycling
5. Place new key in vehicle
6. Confirm immobilizer light OFF
7. Test all programmed keys

---

## OBP Remote Programming (Bladed Keys 2007-2014)

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

## Special Notes for 2007 Model

The 2007 Fit uses the rare **ID8E "H" chip** (Megamos). This is different from other Honda chips:
- Verify chip type before ordering blanks
- Some aftermarket chips labeled "Honda 8E" or "Megamos 8E"
- Programming via OBD supported on Autel IM608

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| 2007 won''t program | Wrong chip type | Verify ID8E "H" chip, not standard ID46 |
| Green key light blinking | Chip mismatch | Check year - 2007 vs 2008+ use different chips |
| Smart key not detected | Low fob battery | Replace CR2032 battery |
| Blade key won''t turn | Wrong cut | Re-decode with Lishi HON66 |

---

## Quick Reference Card

| Item | Value |
|------|-------|
| **Blade Type** | HON66 |
| **Lishi Tool** | HON66 2-in-1 |
| **2007 Chip** | ID8E (Megamos "H") |
| **2008-2014 Chip** | ID46 (PCF7936) |
| **2015-2020 Chip** | PCF7938 G (Honda G) |
| **Frequency** | 315 MHz (North America) |
| **Add Key Time** | ~5 minutes |
| **AKL Time** | ~15 minutes |

---

## Sources

- fitfreak.net - Chip specifications by year (2007 ID8E)
- carandtruckremotes.com - FCC IDs and part numbers
- locksmithkeyless.com - Key specifications
- youtube.com - Autel IM608 programming demos
- transponderisland.com - Transponder database
',
  '{"sources": ["fitfreak.net", "carandtruckremotes.com", "locksmithkeyless.com", "youtube.com", "transponderisland.com", "keyless2go.com", "autelshop.de"], "generated": "2024-12-10", "method": "web_research"}'
);
