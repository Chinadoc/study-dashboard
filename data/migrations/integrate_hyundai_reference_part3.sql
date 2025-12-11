-- Integrate Hyundai Reference Document - Part 3
-- Genesis Brand & Legacy Models

-- ═══════════════════════════════════════════════════════════════════════════
-- GENESIS G70 - Compact Luxury Sedan
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'genesis-g70-2019-2024',
  'Genesis',
  'G70',
  2019,
  2024,
  '# Genesis G70 2019-2024 Master Programming Guide
## Compact Luxury

---

## Overview

The G70 competes with the BMW 3-Series. 2023+ models updated to **HITAG-AES**.

> ⚠️ **Critical Warning (2023+):** Updated to **HITAG-AES (ID4A)** and **CR2450** battery.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support (SGW required) |
| **Lishi KIA9TE** | Standard Genesis blade |

---

## Specifications

| Years | Buttons | Chip | FCC ID | Part # | Battery |
|-------|---------|------|--------|--------|---------|
| 2019-2021 | 4 | ID47 | TQ8-FOB-4F16 | 95440-G9000 | CR2032 |
| 2021-2023 | 8 | ID47 | TQ8-FOB-4F35 | 95440-AR010 | CR2032 |
| 2023-2024 | 5 | **AES** | TQ8-FOB-4F75M44 | 95440-G9720 | **CR2450** |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2023+ Fail | Requires HITAG-AES support |
| SGW | Active on all models |

---

## Pro Tips from the Field

- ⚡ **Luxury:** High value job
- 📋 **SGW:** Always active
- 🔧 **KIA9TE:** Unique Genesis/Kia blade

---

## Key Information

- **Blade:** KIA9TE
- **Lishi:** KIA9TE
- **Battery:** CR2032 (2019-23), CR2450 (2023+)

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- GENESIS G80 - Mid-Size Luxury Sedan
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'genesis-g80-2017-2024',
  'Genesis',
  'G80',
  2017,
  2024,
  '# Genesis G80 2017-2024 Master Programming Guide
## Mid-Size Luxury

---

## Overview

The G80 replaced the Hyundai Genesis Sedan.

> 💡 **Pearl:** 2015-2016 models are branded "Hyundai Genesis" but use same system.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support (SGW for 2020+) |
| **Lishi KIA9TE** | Standard |

---

## Specifications

| Years | FCC ID | Chip | Part # | Buttons |
|-------|--------|------|--------|---------|
| 2017-2020 | SY5HIFGE04 | ID47 | 95440-D2000NNB | 4 |
| 2021-2024 | TQ8-FOB-4F35 | ID47 | 95440-T1200 | 6-8 |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Hyundai vs Genesis | 2015-16 = Hyundai, 2017+ = Genesis |
| SGW | Active on 2020+ models |

---

## Pro Tips from the Field

- ⚡ **Rebranding:** Watch for Hyundai logo on older models
- 📋 **SGW:** 2020+ requires auth
- 🔧 **KIA9TE:** Standard blade

---

## Key Information

- **Blade:** KIA9TE
- **Lishi:** KIA9TE
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- GENESIS G90 - Flagship Luxury Sedan
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'genesis-g90-2017-2024',
  'Genesis',
  'G90',
  2017,
  2024,
  '# Genesis G90 2017-2024 Master Programming Guide
## Flagship Luxury

---

## Overview

The G90 replaced the Hyundai Equus.

> 💡 **Pearl:** 2021+ models use **7-button** remote with Smart Park.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support (SGW required) |
| **Lishi KIA9TE** | Standard |

---

## Specifications

| Years | FCC ID | Chip | Part # | Buttons |
|-------|--------|------|--------|---------|
| 2017-2020 | SY5HIFGE04 | ID47 | 95440-D2000NNB | 4 |
| 2021-2024 | TQ8-FOB-4F53U | ID47 | 95440-T4100 | 7 |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Equus vs G90 | G90 is new platform (2017+) |
| SGW | Active on all models |

---

## Pro Tips from the Field

- ⚡ **Flagship:** Highest value job
- 📋 **SGW:** Always active
- 🔧 **KIA9TE:** Standard blade

---

## Key Information

- **Blade:** KIA9TE
- **Lishi:** KIA9TE
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- GENESIS GV70 - Compact Luxury SUV
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'genesis-gv70-2022-2024',
  'Genesis',
  'GV70',
  2022,
  2024,
  '# Genesis GV70 2022-2024 Master Programming Guide
## Compact Luxury SUV

---

## Overview

The GV70 is Genesis''s best-selling SUV.

> 💡 **Pearl:** Uses **434 MHz** ID47 keys.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support (SGW required) |
| **Lishi KIA9TE** | Standard |

---

## Specifications

| Spec | Value |
|------|-------|
| FCC ID | TQ8-FOB-4F35 / 4F36 |
| Chip | ID47 / HITAG3 |
| Frequency | 434 MHz |
| Part # | 95440-AR011 (8-btn), 95440-DS010 (6-btn) |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SGW | Active on all models |
| Button Count | Verify 6 vs 8 buttons |

---

## Pro Tips from the Field

- ⚡ **Popular:** Common luxury SUV
- 📋 **SGW:** Always active
- 🔧 **KIA9TE:** Standard blade

---

## Key Information

- **Blade:** KIA9TE
- **Lishi:** KIA9TE
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- GENESIS GV80 - Mid-Size Luxury SUV
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'genesis-gv80-2021-2024',
  'Genesis',
  'GV80',
  2021,
  2024,
  '# Genesis GV80 2021-2024 Master Programming Guide
## Mid-Size Luxury SUV

---

## Overview

The GV80 is the first Genesis SUV.

> 💡 **Pearl:** 8-button remote includes Remote Start, Lights, and Parking Assist (x2).

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support (SGW required) |
| **Lishi KIA9TE** | Standard |

---

## Specifications

| Spec | Value |
|------|-------|
| FCC ID | TQ8-FOB-4F35 / 4F53 |
| Chip | Philips ID47 |
| Frequency | 434 MHz |
| Part # | 95440-T6011 (2021), 95440-T6014 (2022-24) |
| Buttons | 8 |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SGW | Active on all models |
| 8 Buttons | Complex remote - verify functions |

---

## Pro Tips from the Field

- ⚡ **Flagship SUV:** High value
- 📋 **SGW:** Always active
- 🔧 **KIA9TE:** Standard blade

---

## Key Information

- **Blade:** KIA9TE
- **Lishi:** KIA9TE
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI AZERA - Legacy Premium
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'hyundai-azera-2006-2017',
  'Hyundai',
  'Azera',
  2006,
  2017,
  '# Hyundai Azera 2006-2017 Master Programming Guide
## Legacy Premium

---

## Overview

The Azera was Hyundai''s premium sedan before Genesis.

> 💡 **Pearl:** 2012-2017 uses **HY22** blade. 2006-2011 uses **HY20**.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi HY22 / HY20** | Verify year |

---

## Generation Breakdown

### Gen 4 (2006-2011)
| Spec | Value |
|------|-------|
| Keyway | **HY20** |
| Chip | ID46 / PCF7936 |
| FCC ID | SY55WY8212 (315 MHz) |

### Gen 5 (2012-2017)
| Spec | Value |
|------|-------|
| Keyway | **HY22** |
| Smart Key | ID46 / PCF7952A |
| FCC ID | SY5HMFNA04 (315 MHz) |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| HY20 vs HY22 | Major change in 2012 |
| Smart Key | Standard ID46 programming |

---

## Pro Tips from the Field

- ⚡ **Discontinued:** Replaced by Genesis G80
- 📋 **Premium:** Often has smart key
- 🔧 **HY22:** Quad lifter

---

## Key Information

- **Blade:** HY22 (2012+), HY20 (2006-11)
- **Lishi:** HY22, HY20
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI EQUUS - Legacy Flagship
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'hyundai-equus-2011-2016',
  'Hyundai',
  'Equus',
  2011,
  2016,
  '# Hyundai Equus 2011-2016 Master Programming Guide
## Legacy Flagship

---

## Overview

The Equus was the predecessor to the Genesis G90.

> 💡 **Pearl:** 2014-2016 uses **LXP90** blade (unique). 2011-2013 uses **HY22**.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi LXP90 / HY22** | Verify year |

---

## Generation Breakdown

### Gen 1 (2011-2013)
| Spec | Value |
|------|-------|
| Keyway | **HY22** |
| Smart Key | ID46 / PCF7952A |
| FCC ID | SY5HMFNA04 (315 MHz) |

### Gen 2 (2014-2016)
| Spec | Value |
|------|-------|
| Keyway | **LXP90** |
| Smart Key | ID46 / PCF7952A |
| FCC ID | SY5DMFNA433 (433 MHz) |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blade Type | Check 2014 split year carefully |
| Frequency | 315 vs 433 MHz split in 2014 |

---

## Pro Tips from the Field

- ⚡ **Rare:** Low volume vehicle
- 📋 **Flagship:** High quality components
- 🔧 **LXP90:** Unique blade for late models

---

## Key Information

- **Blade:** LXP90 (2014+), HY22 (2011-13)
- **Lishi:** LXP90, HY22
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI VERACRUZ - Legacy SUV
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'hyundai-veracruz-2007-2012',
  'Hyundai',
  'Veracruz',
  2007,
  2012,
  '# Hyundai Veracruz 2007-2012 Master Programming Guide
## Legacy SUV

---

## Overview

The Veracruz was a premium SUV. Used **K-2B020** blade (rare).

> 💡 **Pearl:** Uses unique **K-2B020** blade. Often confused with HYN14.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi HYN14** | Works for picking (usually) |

---

## Specifications

| Spec | Value |
|------|-------|
| Keyway | **K-2B020** |
| Smart Key | ID46 / PCF7952A |
| FCC ID | SY5SVISMKFNA04 (315 MHz) |
| Part # | 95440-3J600 |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blade | Unique profile - stock specific blank |
| Smart Key | Standard ID46 programming |

---

## Pro Tips from the Field

- ⚡ **Discontinued:** Replaced by Santa Fe LWB
- 📋 **Blade:** Verify profile visually
- 🔧 **Smart Key:** Early adoption for Hyundai

---

## Key Information

- **Blade:** K-2B020
- **Lishi:** HYN14 (compatible for picking)
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);
