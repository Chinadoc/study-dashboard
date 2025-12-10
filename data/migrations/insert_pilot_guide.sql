-- Honda Pilot Master Guide (2003-2024)
-- Generated from web research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-pilot-2003-2024',
  'Honda',
  'Pilot',
  2003,
  2024,
  '# Honda Pilot 2003-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda Pilot is a mid-size SUV that has evolved significantly in key technology over three generations. This guide covers all model years with their specific transponder chips, FCC IDs, and programming procedures.

> **Pearl:** The Pilot follows standard Honda chip evolution - ID13 → ID46 → ID47/HITAG 3. The 2016 model year is the key transition point to smart keys.

---

## Transponder Chip Types by Generation

| Year Range | Generation | Chip Type | Protocol | Notes |
|------------|------------|-----------|----------|-------|
| 2003-2005 | Gen 1 (YF1) | ID13 (Megamos) | T5 Crypto | Glass wedge chip |
| 2006-2008 | Gen 1 (YF2) | ID46 (PCF7936) | Philips Crypto 2 | Transition |
| 2009-2015 | Gen 2 (YF3/YF4) | ID46 (PCF7941A) | HITAG 2 | Remote head key standard |
| 2016-2018 | Gen 3 | HITAG 3 | ID47 | Smart key transition |
| 2019-2024 | Gen 3/4 | ID47 / ID4A | HITAG 3 / AES | Latest smart key |

---

## FCC IDs by Year

### Remote Head Keys (Bladed)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2003-2005 | OUCG8D-340H-A | 3B | 35111-S9V-305 |
| 2006-2008 | OUCG8D-380H-A | 4B | 35111-S9V-325 |
| 2009-2015 | KR55WK49308 | 4B | 35111-SZA-305 |

### Smart Keys (Proximity)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2016-2018 | KR5V2X | 5B | 72147-TG7-A01 |
| 2019-2021 | KR5V2X | 5B | 72147-TG7-A11 |
| 2022-2024 | KR5TP-4 | 4B | 72147-TG7-A21 |

---

## Mechanical Key Information

**Key Blade:** HON66 (2003-2019), HU101 (emergency blade on smart keys)

**Lishi Tool:** HON66 2-in-1 Pick & Decoder
- **Compatible Years:** 2003-2020
- **Lock Type:** 4-track external, 6-cut
- **Depths:** 1-6 (1 shallowest, 6 deepest)

---

## Autel IM608 Programming

### Menu Path
IMMO → Honda → Manual Selection → Pilot → [Year] → Smart Key or Blade Key

### Add Key Procedure (With Working Key)

1. Connect Autel IM608 via OBDII with J2534 VCI
2. Navigate: IMMO → Honda → Pilot → [Year]
3. Select "Add Key (Guided)"
4. Place working key inside vehicle
5. For smart key: Press START twice (don''t press brake)
6. System reads existing key data
7. Turn ignition OFF when prompted
8. Insert/place NEW key in vehicle
9. Turn ignition ON
10. Confirm security light turns off
11. Test new key

### All Keys Lost Procedure

1. Connect Autel IM608 via OBDII
2. For 2020 Pilot AKL: Tool supports via OBD connection
3. Navigate: IMMO → Honda → Pilot → [Year]
4. Select "All Keys Lost (Guided)"
5. For smart key: Press and hold START to wake system
6. Place new key inside vehicle (remove all others 5+ meters away)
7. Follow on-screen ignition cycle prompts
8. Confirm immobilizer light OFF
9. Test all programmed keys

---

## OBP Remote Programming (Bladed Keys 2003-2015)

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

> **Pearl:** When programming remotes via OBP, all previously programmed remotes are erased. Have ALL remotes ready to program in the same session.

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Green key light blinking | Wrong chip type | Verify ID46 vs HITAG 3 based on year |
| 2016+ won''t program with OBP | Smart key system | OBP only works on bladed key models |
| "All Keys Lost" fails | Need XP400 Pro | Some AKL scenarios require auxiliary programmer |
| Remote programs, won''t start | Wrong blade cut | Re-decode with Lishi HON66 |

---

## Quick Reference Card

| Item | Value |
|------|-------|
| **Blade Type** | HON66 (2003-2019) |
| **Lishi Tool** | HON66 2-in-1 |
| **2003-2005 Chip** | ID13 (Megamos) |
| **2006-2015 Chip** | ID46 (PCF7941A) |
| **2016-2024 Chip** | HITAG 3 / ID47 |
| **Frequency** | 315 MHz (North America) |
| **Add Key Time** | ~5 minutes |
| **AKL Time** | ~15-20 minutes |

---

## Sources

- oemcarkeymall.com - Chip specifications by year
- carandtruckremotes.com - FCC IDs and part numbers
- vvdi.com - HITAG 3 specifications for 2016+
- youtube.com - Autel IM608 2020 Pilot AKL demo
- genuinelishi.com - Lishi HON66 compatibility
- mk3.com - Remote specifications
',
  '{"sources": ["oemcarkeymall.com", "carandtruckremotes.com", "vvdi.com", "youtube.com", "genuinelishi.com", "mk3.com", "locksmithkeyless.com", "abkeys.com"], "generated": "2024-12-10", "method": "web_research"}'
);
