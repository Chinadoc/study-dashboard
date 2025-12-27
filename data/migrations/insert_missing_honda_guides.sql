-- Legacy and Niche Honda Guides (Element, Passport, Insight, S2000)
-- Generated from locksmith knowledge base

-- 1. Honda Element (2003-2011)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-element-2003-2011', 'Honda', 'Element', 2003, 2011,
  '# Honda Element 2003-2011 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview
The Honda Element is a cult-classic utility vehicle that shares its platform and immobilizer system with the CR-V.

> **Pearl:** The Element never transitioned to "G" chip or Smart Keys. It stayed on the robust ID13/ID46 architecture until its discontinuation in 2011.

---

## Transponder Chip Types
| Year Range | Chip Type | Protocol | Notes |
|------------|-----------|----------|-------|
| 2003-2005 | ID13 (Megamos) | T5 Crypto | Glass wedge chip |
| 2006-2011 | ID46 (PCF7936) | Philips Crypto 2 | High security laser cut keys start 2006? No, mostly standard cut until later years. Check blade. |

**Blade Note:**
- 2003-2011: Most use standard double-sided HO01 blade (check specific VIN), but some later years or SC trims might use HON66. **Verify blade type visually.**

---

## FCC IDs
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2003-2006 | OUCG8D-344H-A | 3B | 72147-SCV-A01 |
| 2007-2011 | OUCG8D-440H-A | 3B | 72147-SCV-A02 |

---

## Autel IM608 Programming
1. **Menu:** IMMO -> Honda -> Manual Selection -> Element -> [Year]
2. **Add Key:** Straightforward OBD procedure.
3. **Remote:** OBP (On-Board Programming) works for all years.

## OBP Remote Procedure
1. Turn Ignition ON -> Press Lock -> Turn OFF
2. Repeat 3 times.
3. On 4th time, locks cycle. Press Lock on all remotes.
',
  '{"generated": "2024-12-23", "method": "synthesis"}'
);

-- 2. Honda Passport (2019-2024)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-passport-2019-2024', 'Honda', 'Passport', 2019, 2024,
  '# Honda Passport 2019-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview
Reintroduced in 2019, the Passport is essentially a shortened Pilot. It uses the modern Honda Smart Key system exclusively.

> **Pearl:** Treat the Passport exactly like a Pilot of the same year. It uses the same KR5V2X or KR5TP-4 fobs.

---

## Transponder Chip Types
| Year Range | Chip Type | Protocol | Notes |
|------------|-----------|----------|-------|
| 2019-2021 | ID47 (Honda G) | HITAG 3 | Smart Key |
| 2022-2024 | ID4A | 128-bit AES | **New Auth System** - may require CAN FD adapter |

---

## FCC IDs (Smart Keys)
| Year | FCC ID | Buttons | Part Number |
|------|--------|---------|-------------|
| 2019-2021 | KR5V2X | 5B | 72147-TGS-A01 |
| 2022-2024 | KR5TP-4 | 5B | 72147-TGS-A11 |

---

## Autel IM608 Programming
**Menu Path:** IMMO -> Honda -> Manual Selection -> Passport -> [Year] -> Smart Key

### All Keys Lost (2022+ Warning)
For 2022+ models with ID4A system, all keys lost may require dealer-level auth or specialized localized server calculation unless bypass is available.
**Check Function Viewer** on Autel before quoting 2022+ AKL jobs.
',
  '{"generated": "2024-12-23", "method": "synthesis"}'
);

-- 3. Honda Insight (2010-2014, 2019-2022)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-insight-2010-2022', 'Honda', 'Insight', 2010, 2022,
  '# Honda Insight Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview
The Insight covers two distinct eras:
1. **Gen 2 (2010-2014):** Traditional bladed keys (ID46).
2. **Gen 3 (2019-2022):** Based on the Civic X platform (Smart Key).

---

## Chip & Remote Matrix
| Gen | Years | Chip | FCC ID | Blade |
|-----|-------|------|--------|-------|
| **Gen 2** | 2010-2014 | ID46 | MLBHLIK-1T (3B) | HON66 |
| **Gen 3** | 2019-2022 | ID47 (Hitag 3) | KR5V2X (4B/5B) | HU101 |

## Programming Notes
- **Gen 2:** Standard Honda bladed procedure. OBP for remote.
- **Gen 3:** Standard Civic-style Smart Key procedure. Proximity programming takes ~2 mins.
',
  '{"generated": "2024-12-23", "method": "synthesis"}'
);

-- 4. Honda S2000 (2000-2009)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-s2000-2000-2009', 'Honda', 'S2000', 2000, 2009,
  '# Honda S2000 2000-2009 Key Programming Master Guide

---

## Overview
The legendary S2000 roadster.
**Note:** Early models use ID13, later use ID48 (verify!).

## Specs
| Years | Chip | FCC ID | Note |
|-------|------|--------|------|
| 2000-2003 | ID13 | E4EG8DJ | Separate Remote |
| 2004-2009 | ID48 (Megamos Crypto) | E4EG8DJ | Separate Remote |

> **Pearl:** The S2000 is one of the few Hondas to use **ID48** (Glass Crypto) in the US market during the mid-2000s (shared with some Acuras). Do NOT use ID46.

## Programming
- **Tools:** T-Code Pro, MVP, Autel IM608.
- **Remote:** OBP standard Honda procedure.
',
  '{"generated": "2024-12-23", "method": "synthesis"}'
);
