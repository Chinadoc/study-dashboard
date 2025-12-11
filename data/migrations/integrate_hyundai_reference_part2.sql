-- Integrate Hyundai Reference Document - Part 2
-- Kona, Palisade, Venue, Ioniq, Veloster, Santa Cruz

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI KONA - Compact SUV / EV
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'hyundai-kona-2018-2024',
  'Hyundai',
  'Kona',
  2018,
  2024,
  '# Hyundai Kona 2018-2024 Master Programming Guide
## Gas & Electric

---

## Overview

The Kona spans gas and EV models. 2024+ uses **HITAG-AES**.

> ⚠️ **Critical Warning (2024+):** New generation uses **HITAG-AES (ID4A)** and **CR2450** battery.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support (SGW required) |
| **Lishi KK12** | Universal for Kona |

---

## Generation Breakdown

### Gen 1 (2018-2020)
| Spec | Value |
|------|-------|
| Keyway | **KK12** |
| Smart Key | ID47 / NCF29A1X |
| FCC ID | TQ8-FOB-4F18 (433 MHz) |
| Battery | CR2032 |

### Gen 1 Refresh (2021-2023)
| Spec | Value |
|------|-------|
| Keyway | **KK12** |
| Smart Key | ID47 / HITAG3 |
| FCC ID | TQ8-FOB-4F43 (433 MHz) |
| Battery | CR2032 |

### Gen 2 (2024+)
| Spec | Value |
|------|-------|
| Keyway | **KK12** |
| Smart Key | **HITAG-AES / ID4A** |
| FCC ID | TQ8-FOB-4F61M43 (433 MHz) |
| Battery | **CR2450** |
| Buttons | 5-7 (Remote Start, Parking Assist) |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| EV vs Gas | Same programming, different buttons (Charge Port) |
| 2024+ Fail | Requires HITAG-AES support |

---

## Pro Tips from the Field

- ⚡ **EV Models:** Check for charge port button
- 📋 **SGW:** All years likely active
- 🔧 **KK12:** Standard blade for all years

---

## Key Information

- **Blade:** KK12
- **Lishi:** KK12
- **Battery:** CR2032 (2018-23), CR2450 (2024+)

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI PALISADE - Flagship SUV
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'hyundai-palisade-2020-2024',
  'Hyundai',
  'Palisade',
  2020,
  2024,
  '# Hyundai Palisade 2020-2024 Master Programming Guide
## Flagship SUV

---

## Overview

The Palisade is Hyundai''s flagship. Always uses **Security Gateway**.

> 💡 **Pearl:** 2022+ models updated to **7-button** remote with Remote Start and Parking Assist.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support (SGW required) |
| **Lishi KK12** | Standard |

---

## Specifications

| Years | Buttons | Chip | FCC ID | Part # |
|-------|---------|------|--------|--------|
| 2020-2022 | 5 | ID47 | TQ8-FOB-4F29 | 95440-S8010 |
| 2022-2024 | 7 | ID47 | TQ8-FOB-4F28 | 95440-S8600 |
| 2023-2024 | 6 | ID47 | TQ8-FOB-4F44 | 95440-S8560 |

Frequency: 433-434 MHz

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Button Count | Verify 5, 6, or 7 buttons |
| SGW Access | Mandatory for all years |

---

## Pro Tips from the Field

- ⚡ **Premium:** High value job, stock 7-button keys
- 📋 **SGW:** Always active
- 🔧 **KK12:** Emergency blade

---

## Key Information

- **Blade:** KK12
- **Lishi:** KK12
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI VENUE - Entry Crossover
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'hyundai-venue-2020-2024',
  'Hyundai',
  'Venue',
  2020,
  2024,
  '# Hyundai Venue 2020-2024 Master Programming Guide
## Entry Level Smart Key

---

## Overview

The Venue uses **HITAG-AES (ID4A)** despite being an entry-level model.

> ⚠️ **Critical Warning:** Uses **HITAG-AES (ID4A)**. Requires capable tools.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support (SGW + AES) |
| **Lishi KK12** | Standard |

---

## Specifications

| Spec | Value |
|------|-------|
| FCC ID | **SY5IGFGE04** |
| Chip | **HITAG-AES / ID4A** |
| Frequency | 433-434 MHz |
| Part # | 95440-K2400, 95440-K2410 |
| Buttons | 4 (Lock, Unlock, Remote Start, Panic) |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Programming Fail | Tool must support HITAG-AES |
| SGW | Active on all models |

---

## Pro Tips from the Field

- ⚡ **Entry Level:** Don''t assume old tech - uses AES!
- 📋 **SGW:** Always active
- 🔧 **KK12:** Standard blade

---

## Key Information

- **Blade:** KK12
- **Lishi:** KK12
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI IONIQ FAMILY - Hybrid / EV
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'hyundai-ioniq-2017-2024',
  'Hyundai',
  'Ioniq',
  2017,
  2024,
  '# Hyundai Ioniq Family 2017-2024 Master Programming Guide
## Hybrid, PHEV, EV, Ioniq 5, Ioniq 6

---

## Overview

The Ioniq family covers the original liftback (Hybrid/EV) and the new E-GMP platform (Ioniq 5/6).

> 💡 **Pearl:** Ioniq 5/6 use **HITAG-AES** and support **Digital Key 2.0** (UWB/NFC).

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support (SGW + AES) |
| **Lishi KK12** | Universal for Ioniq 5/6 |

---

## Model Breakdown

### Ioniq Hybrid/Electric (2017-2024)
| Years | Chip | FCC ID |
|-------|------|--------|
| 2017-2021 | HITAG3/ID47 | TQ8-FOB-4F11 |
| 2022-2024 | **HITAG-AES** | FG01190 |

### Ioniq 5 (2022-2024)
| Buttons | FCC ID | Chip | Part # |
|---------|--------|------|--------|
| 6-btn | CQOFD01470 | **HITAG-AES** | 95440-GI020 |
| 8-btn | CQOFD01480 | **HITAG-AES** | 95440-GI050 |
| 5-btn (N) | TQ8-FOB-4F89U44 | **HITAG-AES** | 95440-NI000 |

### Ioniq 6 (2023-2024)
| Spec | Value |
|------|-------|
| FCC ID | NYOMBEC7FOB2208 |
| Chip | **AES 6A** |
| Part # | 95440-KL000 |
| Battery | **CR2450** |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 8-button Key | Includes Parking Assist (Smart Park) |
| Digital Key | Phone-as-key supported on SEL/Limited |
| 12V Battery | EV 12V battery must be charged! |

---

## Pro Tips from the Field

- ⚡ **12V Critical:** EV main battery doesn''t power IMMO
- 📋 **Parking Assist:** Verify if car has Smart Park buttons
- 🔧 **N Model:** Unique 5-button key for Ioniq 5 N

---

## Key Information

- **Blade:** KK12
- **Lishi:** KK12
- **Battery:** CR2032 / CR2450 (Ioniq 6/5 N)

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI VELOSTER - Sport Compact
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'hyundai-veloster-2012-2021',
  'Hyundai',
  'Veloster',
  2012,
  2021,
  '# Hyundai Veloster 2012-2021 Master Programming Guide
## Sport Compact

---

## Overview

The Veloster spans two generations. 2019+ N models are popular.

> 💡 **Pearl:** 2012-2017 uses **315 MHz**. 2017+ switched to **433 MHz**.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi HY18** | Standard |

---

## Generation Breakdown

### Gen 1 (2012-2017)
| Spec | Value |
|------|-------|
| Keyway | **HY18-P** |
| Smart Key | ID46 / PCF7952 |
| FCC ID | SY5HMFNA04 (315 MHz) |

### Gen 2 (2017-2021)
| Spec | Value |
|------|-------|
| Keyway | **HY18** |
| Smart Key | ID47 / HITAG3 |
| FCC ID | SY5IGFGE04 (433 MHz) |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frequency | 315 vs 433 MHz split in 2017 |
| N Model | Same programming as standard |

---

## Pro Tips from the Field

- ⚡ **Discontinued:** 2021 was final year
- 📋 **N Performance:** Popular enthusiast car
- 🔧 **HY18:** Standard high security blade

---

## Key Information

- **Blade:** HY18
- **Lishi:** HY18
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI SANTA CRUZ - Sport Adventure Vehicle
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'hyundai-santa-cruz-2022-2024',
  'Hyundai',
  'Santa Cruz',
  2022,
  2024,
  '# Hyundai Santa Cruz 2022-2024 Master Programming Guide
## Sport Adventure Vehicle

---

## Overview

The Santa Cruz shares the Tucson N3 platform. 2024+ updated to **HITAG-AES**.

> ⚠️ **Critical Warning (2024+):** Updated to **HITAG-AES (ID4A)** and **CR2450** battery.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support (SGW + AES) |
| **Lishi KK12** | Standard |

---

## Specifications

| Years | Chip | FCC ID | Part # | Battery |
|-------|------|--------|--------|---------|
| 2022-2023 | HITAG3/ID47 | TQ8-FOB-4F27 | 95440-K5000 | CR2032 |
| 2024+ | **HITAG-AES** | TQ8-FOB-4F61M43 | 95440-K5500 | **CR2450** |

Buttons: 5 (Lock, Unlock, Remote Start, Tailgate, Panic)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2024+ Fail | Requires HITAG-AES support |
| SGW | Active on all models |

---

## Pro Tips from the Field

- ⚡ **Tucson Based:** Shares platform/electronics
- 📋 **Tailgate:** Has power tailgate button
- 🔧 **KK12:** Standard blade

---

## Key Information

- **Blade:** KK12
- **Lishi:** KK12
- **Battery:** CR2032 (2022-23), CR2450 (2024+)

---

*Last Updated: December 2025*
',
  '{"sources": ["hyundai_locksmith_guide"], "generated": "2024-12-11", "method": "reference_doc"}'
);
