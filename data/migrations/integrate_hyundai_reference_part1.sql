-- Integrate Hyundai Reference Document - Part 1
-- Sonata, Elantra, Tucson, Santa Fe, Accent

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI SONATA - Mid-Size Sedan
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Hyundai Sonata 2006-2024 Master Programming Guide
## Evolution to Digital Key

---

## Overview

The Sonata spans from basic transponders to modern Digital Key systems. 2020+ models use **Security Gateway (SGW)**.

> ⚠️ **Critical Warning (2020+):** Requires **SGW-authorized tool** (Autel/Xhorse/Abrites) for access.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support (requires SGW auth for 2020+) |
| **Lishi HY22 / HY20** | See generation breakdown |
| **Battery Maintainer** | Critical for 2020+ programming |

---

## Generation Breakdown

### Gen 5 (2006-2010)
| Spec | Value |
|------|-------|
| Keyway | **HY20 / TOY48** |
| Chip | ID46 / PCF7936 |
| FCC ID | OSLOKA-310T (315 MHz) |
| Part # | 95430-3K202 |

### Gen 6 (2011-2014)
| Spec | Value |
|------|-------|
| Keyway | **HY22** (Quad Lifter) |
| Smart Key | ID46 / PCF7952A |
| FCC ID | SY5HMFNA04 (315 MHz) |
| Part # | 95440-3M100 |

### Gen 7 (2015-2019)
| Spec | Value |
|------|-------|
| Keyway | **HY22** |
| Smart Key | ID46 / 8A Chip |
| FCC ID | CQOFD00120 (433 MHz) |
| Part # | 95440-C1000 |

### Gen 8 (2020-2024) - SGW Era
| Spec | Value |
|------|-------|
| Keyway | **HY22 / KK12** |
| Smart Key | ID47 / NCF29A1X |
| FCC ID | TQ8-FOB-4F27/4F28 (433 MHz) |
| Part # | 95440-L1060 / 95440-L1500 |
| Security | **Security Gateway (SGW)** Active |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2020+ No Comm | Tool needs SGW authorization |
| HY22 Picking | Quad lifter - requires back-picking |
| "Kia Boyz" Patch | Check for anti-theft decal - may affect comms |

---

## Pro Tips from the Field

- ⚡ **Digital Key:** 2020+ supports phone-as-key
- 📋 **SGW Access:** Ensure tool subscription is active
- 🔧 **Lishi HY22:** Tricky lock - practice required

---

## Key Information

- **Blade:** HY22 (2011+), HY20 (2006-2010)
- **Lishi:** HY22, HY20
- **Battery:** CR2032 (most), CR2450 (some 2020+)

---

*Last Updated: December 2025*
'
WHERE make = 'Hyundai' AND model = 'Sonata';

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI ELANTRA - Compact Sedan
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Hyundai Elantra 2007-2024 Master Programming Guide
## From ID46 to HITAG-AES

---

## Overview

The Elantra introduced **HITAG-AES (ID4A)** in 2021. This requires updated tools and specific chips.

> ⚠️ **Critical Warning (2021+):** Uses **HITAG-AES (ID4A)**. Older tools cannot program this! Requires SGW access.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support (SGW + HITAG-AES) |
| **Lishi HY22 / HYN14R** | Verify year |

---

## Generation Breakdown

### Gen 4 (2007-2010)
| Spec | Value |
|------|-------|
| Keyway | **HYN14R** |
| Chip | ID46 / PCF7936 |
| FCC ID | OSLOKA-310T (315 MHz) |
| Part # | 95430-2L350 |

### Gen 5 (2011-2016)
| Spec | Value |
|------|-------|
| Keyway | **HY22** |
| Smart Key | ID46 / PCF7952 |
| FCC ID | SY5HMFNA04 (315 MHz) |
| Part # | 95440-3M220 |

### Gen 6 (2017-2020)
| Spec | Value |
|------|-------|
| Keyway | **HY18 / HY22** |
| Smart Key | ID46 / PCF7952A |
| FCC ID | CQOFD00120 (433 MHz) |
| Part # | 95440-F2002 |

### Gen 7 (2021-2024) - CN7 Platform
| Spec | Value |
|------|-------|
| Keyway | **KK12** |
| Smart Key | **HITAG-AES / 6A** |
| FCC ID | NYOMBEC5FOB2004 (434 MHz) |
| Part # | 95440-AA000 (2021-23), 95440-AA500 (2024) |
| Security | **Security Gateway (SGW)** |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2021+ Programming Fail | Tool must support HITAG-AES |
| Wrong Blade | 2021+ uses KK12 (universal) |
| "Kia Boyz" Patch | Mechanical key models may have software kill |

---

## Pro Tips from the Field

- ⚡ **2021+ Change:** New chip, new blade, new security
- 📋 **KK12 Blade:** Universal for modern Hyundai/Kia
- 🔧 **Flip Keys:** 2017-2020 often flip key ID46

---

## Key Information

- **Blade:** KK12 (2021+), HY22 (2011-20), HYN14R (2007-10)
- **Lishi:** KK12, HY22, HYN14R
- **Battery:** CR2032 / CR2450

---

*Last Updated: December 2025*
'
WHERE make = 'Hyundai' AND model = 'Elantra';

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI TUCSON - Compact SUV
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Hyundai Tucson 2005-2024 Master Programming Guide
## SUV Evolution

---

## Overview

The Tucson evolved from basic ID46 to advanced HITAG-AES. 2021+ NX4 platform uses SGW.

> 💡 **Pearl:** 2024+ Tucson updated to **HITAG-AES (ID4A)** with FCC TQ8-FOB-4F89U44.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi LXP90 / HYN6** | Verify year |

---

## Generation Breakdown

### Gen 1 (2005-2009)
| Spec | Value |
|------|-------|
| Keyway | **HYN6** |
| Chip | ID46 / PCF7936 |
| Frequency | 315 MHz |

### Gen 2 (2010-2015)
| Spec | Value |
|------|-------|
| Keyway | **TOY48** |
| Smart Key | HITAG2 / PCF7953A |
| FCC ID | SY5HMFNA04 (433 MHz) |

### Gen 3 (2016-2020)
| Spec | Value |
|------|-------|
| Keyway | **LXP90** |
| Smart Key | ID47 / HITAG3 |
| FCC ID | TQ8-FOB-4F07/4F11 (433 MHz) |

### Gen 4 (2021-2024) - NX4 Platform
| Spec | Value |
|------|-------|
| Keyway | **LXP90** |
| Smart Key | ID47 / NCF29A1X |
| FCC ID | TQ8-FOB-4F26/4F27/4F28 |
| 2024 Update | **HITAG-AES** (TQ8-FOB-4F89U44) |
| Security | **Security Gateway (SGW)** |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2024+ won''t program | Verify if HITAG-AES (new system) |
| LXP90 Picking | Similar to HY22 but different spacing |

---

## Pro Tips from the Field

- ⚡ **2024 Update:** Watch for chip change to AES
- 📋 **SGW:** 2021+ requires authorized tool
- 🔧 **Battery:** CR2450 common in newer remotes

---

## Key Information

- **Blade:** LXP90 (2016+), TOY48 (2010-15), HYN6 (2005-09)
- **Lishi:** LXP90, TOY48, HYN6
- **Battery:** CR2032 / CR2450

---

*Last Updated: December 2025*
'
WHERE make = 'Hyundai' AND model = 'Tucson';

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI SANTA FE - Mid-Size SUV
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'hyundai-santa-fe-2007-2024',
  'Hyundai',
  'Santa Fe',
  2007,
  2024,
  '# Hyundai Santa Fe 2007-2024 Master Programming Guide
## Flagship SUV Evolution

---

## Overview

The Santa Fe has seen major changes. 2019+ TM platform introduced SGW. 2024+ is a complete redesign with HITAG-AES.

> 💡 **Pearl:** 2024+ Santa Fe uses **HITAG-AES (ID4A)** and **KK12** blade. Complete departure from previous generations.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi HU134 / HY18R** | Verify year |

---

## Generation Breakdown

### Gen 2 (2007-2012)
| Spec | Value |
|------|-------|
| Keyway | **HYN14** |
| Chip | ID46 / PCF7936 |
| FCC ID | PINHA-T038 (315 MHz) |

### Gen 3 (2013-2018)
| Spec | Value |
|------|-------|
| Keyway | **HY18R** |
| Smart Key | ID46 / PCF7952A |
| FCC ID | SY5DMFNA04 (315 MHz) |

### Gen 4 (2019-2023) - TM Platform
| Spec | Value |
|------|-------|
| Keyway | **HU134** |
| Smart Key | ID47 / NCF29A1X |
| FCC ID | TQ8-FOB-4F27/4F28 (433 MHz) |
| Security | **Security Gateway (SGW)** |

### Gen 5 (2024+) - MX5 Platform
| Spec | Value |
|------|-------|
| Keyway | **KK12** |
| Smart Key | **HITAG-AES / ID4A** |
| FCC ID | TQ8-FOB-4F61M43 (433 MHz) |
| Battery | CR2450 |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2019+ No Comm | SGW authorization required |
| HU134 Picking | Unique to this generation Santa Fe |
| 2024+ New System | Requires HITAG-AES support |

---

## Pro Tips from the Field

- ⚡ **2024 Redesign:** Boxy look = New Key System (AES)
- 📋 **HU134:** Don''t confuse with HY22
- 🔧 **SGW:** 2019+ is definitely gated

---

## Key Information

- **Blade:** KK12 (2024+), HU134 (2019-23), HY18R (2013-18)
- **Lishi:** KK12, HU134, HY18R
- **Battery:** CR2032 / CR2450

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI ACCENT - Subcompact
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'hyundai-accent-2006-2024',
  'Hyundai',
  'Accent',
  2006,
  2024,
  '# Hyundai Accent 2006-2024 Master Programming Guide
## Economy Key Systems

---

## Overview

The Accent is straightforward but has specific chip requirements. 2024+ moved to smart key standard.

> 💡 **Pearl:** 2011-2017 Accent Flip Keys use **ID46**. 2018+ Flip Keys use **HITAG2**.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi HY18 / HYN14** | Verify year |

---

## Generation Breakdown

### Gen 3 (2006-2010)
| Spec | Value |
|------|-------|
| Keyway | **HYN14** |
| Chip | ID46 / PCF7936 |
| FCC ID | PLNHM-T002 (315 MHz) |

### Gen 4 (2011-2017)
| Spec | Value |
|------|-------|
| Keyway | **HY18** |
| Key Type | Transponder / Flip |
| Chip | ID46 / PCF7936 |
| FCC ID | TQ8-RKE-4F14 (434 MHz) |

### Gen 5 (2018-2022)
| Spec | Value |
|------|-------|
| Keyway | **HY18** |
| Key Type | Flip Remote |
| Chip | ID46 / HITAG2 |
| FCC ID | NYOSYEC4TX1707 (433 MHz) |

### 2024+
| Spec | Value |
|------|-------|
| Keyway | **HY18** |
| Smart Key | **DST-AES / ID6A** |
| FCC ID | MBEC4FOB2006 (433 MHz) |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Flip Key Fail | Verify correct generation (Gen 4 vs 5) |
| "Kia Boyz" | Highly targeted - check for software patch |

---

## Pro Tips from the Field

- ⚡ **Targeted:** High theft rate model
- 📋 **Flip Keys:** Look similar but chips differ
- 🔧 **Simple:** Generally easy to pick/program

---

## Key Information

- **Blade:** HY18 (2011+), HYN14 (2006-10)
- **Lishi:** HY18, HYN14
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);
