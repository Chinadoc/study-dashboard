-- Acura Master Guides (ILX, TLX, RDX, MDX, Integra)
-- Generated from locksmith knowledge base

-- 1. Acura Integra (2023-2024) - CRITICAL 11TH GEN ARCHITECTURE
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'acura-integra-2023-2024', 'Acura', 'Integra', 2023, 2024,
  '# Acura Integra 2023-2024 Key Programming Master Guide
## CRITICAL WARNING: BCM BRICKING RISK

> [!WARNING]
> **HIGH RISK VEHICLE - READ BEFORE CONNECTING**
> The 2023+ Acura Integra shares the **Honda 11th Gen Civic** platform.
> - **Risk:** Attempting "All Keys Lost" or even "Add Key" with some tools can **BRICK THE BCM** (Body Control Module), rendering the car dead.
> - **Cause:** The BCM uses a new rolling code algo (Hitag AES / ID4A). Older tool software may corrupt the sync data.
> - **Safe Tools:** Autel IM608/508 (with updated software & APB131/G-Box3 maybe), Smart Pro (check current TSB).
> - **Recommendation:** **Do NOT** attempt without verifying your tool''s specific coverage for "Honda Civic 2022+ / Integra 2023+". Many locksmiths decline this car.

---

## Overview
The reborn Integra replaces the ILX. It is effectively a luxury Civic Si.

## Transponder Chip
- **Chip:** ID4A (PCF7939/NCF29A1M)
- **Protocol:** factory-locked Hitag AES
- **System:** Rolling Code (11th Gen)

## FCC IDs
| Year | FCC ID | Buttons | OEM Part |
|------|--------|---------|----------|
| 2023-2024 | KR5TP-4 | 4B (Hatch) | 72147-3S5-A01 |

## Programming Protocol
**System:** "Honda Civic 2022+" / "Acura Integra 2023"
**Method:** CAN FD Adapter often required.
**AKL:** Requires server calculation or dealer tool.
',
  '{"generated": "2024-12-23", "method": "synthesis"}'
);

-- 2. Acura MDX (2014-2024)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'acura-mdx-2014-2024', 'Acura', 'MDX', 2014, 2024,
  '# Acura MDX 2014-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro
---
## Overview
The MDX is Acura''s flagship SUV.
- **Gen 3 (2014-2020):** Smart Key (ID47)
- **Gen 4 (2022-2024):** Smart Key (ID4A/47) - New Platform

## Chip Matrix
| Years | Chip | FCC ID | Note |
|-------|------|--------|------|
| 2014-2020 | ID47 (Honda G) | KR5V1X / KR5V2X | Standard Smart Key |
| 2022-2024 | ID47/4A | KR5TP-4 | New Body Style |

## Programming
- **2014-2020:** Standard Honda "Push to Start" procedure. Very reliable.
- **2022+:** May require CAN FD adapter.
',
  '{"generated": "2024-12-23", "method": "synthesis"}'
);

-- 3. Acura RDX (2013-2024)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'acura-rdx-2013-2024', 'Acura', 'RDX', 2013, 2024,
  '# Acura RDX 2013-2024 Key Programming Master Guide
---
## Overview
- **2013-2015:** ID46 Smart Key (rare transition era)
- **2016-2018:** ID47 Smart Key
- **2019-2024:** ID47 New Platform (True Touchpad Interface era)

## FCC IDs
- **2013-2015:** OUCG8D-380H-A (Blade) / ACJ932HK1210A (Smart) -- Check VIN!
- **2016-2018:** KR5V1X
- **2019+:** KR5V2X

## Programming
1. **2013-2018:** Standard Honda procedure.
2. **2019+:** Updated Smart Key system. Start button 2x to wake.
',
  '{"generated": "2024-12-23", "method": "synthesis"}'
);

-- 4. Acura TLX (2015-2024)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'acura-tlx-2015-2024', 'Acura', 'TLX', 2015, 2024,
  '# Acura TLX 2015-2024 Key Programming Master Guide
---
## Overview
Replaced the TL/TSX. Always Smart Key.
- **Gen 1 (2015-2020):** Uses **ID47 (Honda G)**.
- **Gen 2 (2021-2024):** Updated platform.

## Key Fobs
- **2015-2017:** KR5V1X (Driver 1/2 memory critical)
- **2018-2020:** KR5V2X
- **2021+:** KR5TP-4

> **Pearl:** Acura fobs often have "Driver 1" and "Driver 2" markings. The car can program multiple fobs, but memory seat functions are linked to slot position (1 or 2).

## Programming
Standard Honda Push-to-Start procedure.
',
  '{"generated": "2024-12-23", "method": "synthesis"}'
);
