-- Add NEW makes: Infiniti, Chrysler, Acura + standardize more existing guides

-- ═══════════════════════════════════════════════════════════════════════════
-- NEW: INFINITI QX60 (2014-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'infiniti-qx60-2014-2024',
  'Infiniti',
  'QX60',
  2014,
  2024,
  '# Infiniti QX60 2014-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Infiniti QX60 (3-row luxury SUV) uses Nissan''s **Intelligent Key** system. Platform shared with Nissan Pathfinder, programming is similar to Nissan vehicles.

> 💡 **Pearl:** QX60 uses same platform as Nissan Pathfinder - keys may be interchangeable! Check FCC ID before ordering.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost |
| **New Programmable Proximity Fob** | See FCC table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Year

| Years | FCC ID | Buttons | Notes |
|-------|--------|---------|-------|
| 2014-2020 | KR5S180144014 | 4 | 1st gen QX60 |
| 2022-2024 | KR5TXN7 | 4-5 | 2nd gen QX60 |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2014-2024 | ID46 / ID47 |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Infiniti → QX60 → [Year]
3. **Select:** Intelligent Key → Add Key
4. **Follow prompts** - similar to Nissan procedure
5. **Verify** start and remote functions

**Total Time:** 5-15 minutes

---

## Pro Tips from the Field

- ⚡ **Nissan platform:** Same as Pathfinder
- 📋 **Luxury brand:** Charge premium pricing
- 🔧 **Easy programming:** IM608 handles Infiniti well

---

## Key Information

- **Blade:** NSN14
- **Lishi:** NSN14 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz

---

*Last Updated: December 2025*
',
  '{"sources": ["locksmithkeyless.com", "northcoastkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- NEW: CHRYSLER 300 (2011-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'chrysler-300-2011-2024',
  'Chrysler',
  '300',
  2011,
  2024,
  '# Chrysler 300 2011-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Chrysler 300 uses a **proximity key fob (smart key)** with push-button start. Uses the same M3N-40821302 FCC ID as Dodge Charger, Challenger, and Jeep Grand Cherokee!

> 💡 **Pearl:** Chrysler 300, Dodge Charger, Challenger, and Jeep Grand Cherokee ALL use the same key (M3N-40821302)! Stock one key type for four popular vehicles.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost |
| **New Programmable Proximity Fob** | M3N-40821302 |
| **CR2032 Battery** | Replace before programming |

---

## FCC ID

| Years | FCC ID | Buttons | Frequency |
|-------|--------|---------|-----------|
| 2011-2024 | M3N-40821302 | 4-5 | 433 MHz |

---

## Transponder Chip Evolution

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2011-2016 | ID46 | PCF7941, PCF7945 |
| 2017-2024 | ID4A | HITAG AES (PCF7953M) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Chrysler → 300 → [Year]
3. **Select:** Proxi → Key Learning
4. **Follow prompts:** Place new fob on start button
5. **Verify** start and remote functions

**Total Time:** 5-10 minutes

---

## Pro Tips from the Field

- ⚡ **Cross-compatible:** Same key as Charger/Challenger/Grand Cherokee
- 📋 **2017 chip change:** ID46 → ID4A (HITAG AES)
- 🔧 **Luxury sedan:** Popular with business owners

---

## Key Information

- **Blade:** CY24
- **Lishi:** CY24 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["locksmithkeyless.com", "remotesandkeys.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- NEW: ACURA MDX (2007-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'acura-mdx-2007-2024',
  'Acura',
  'MDX',
  2007,
  2024,
  '# Acura MDX 2007-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Acura MDX (luxury 3-row SUV) uses Honda''s **proximity key fob (smart key)** system. Programming is similar to Honda vehicles.

> 💡 **Pearl:** Acura is Honda''s luxury brand - same HITAG chips, similar procedures! If you master Honda, you can do Acura.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **Honda HDS** | Alternative for dealer-level access |
| **New Programmable Proximity Fob** | See FCC table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Generation

| Years | FCC ID | Key Type | Notes |
|-------|--------|----------|-------|
| 2007-2013 | M3N5WY8145 | Smart Key | 2nd gen MDX |
| 2014-2020 | KR5V1X | Smart Key | 3rd gen MDX |
| 2022-2024 | KR5T4X | Smart Key | 4th gen MDX |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2007-2013 | ID46 |
| 2014-2024 | ID47 (HITAG 3) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Acura → MDX → [Year]
3. **Select:** Immobilizer → Add Key
4. **Follow prompts** for ignition cycling
5. **Verify** start and remote functions

**Total Time:** 5-15 minutes

---

## Pro Tips from the Field

- ⚡ **Honda platform:** Same chips as Honda
- 📋 **Luxury pricing:** Charge accordingly
- 🔧 **KR5V1X (2014-20):** Similar to Honda CR-V

---

## Key Information

- **Blade:** HON66, MIT11R
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["locksmithkeyless.com", "northcoastkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- NEW: ACURA RDX (2007-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'acura-rdx-2007-2024',
  'Acura',
  'RDX',
  2007,
  2024,
  '# Acura RDX 2007-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Acura RDX (compact luxury SUV) uses Honda''s **proximity key fob (smart key)** system with push-button start.

> 💡 **Pearl:** 2019+ RDX is a completely redesigned vehicle with new key system. Don''t assume old keys work - verify generation!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **New Programmable Proximity Fob** | See FCC table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Generation

| Years | FCC ID | Notes |
|-------|--------|-------|
| 2007-2012 | M3N5WY8145 | 1st gen RDX |
| 2013-2018 | KR5V1X | 2nd gen RDX |
| 2019-2024 | KR5T4X | 3rd gen RDX (redesigned) |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2007-2012 | ID46 |
| 2013-2024 | ID47 (HITAG 3) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Acura → RDX → [Year]
3. **Select:** Immobilizer → Add Key
4. **Follow prompts**
5. **Verify** all functions

**Total Time:** 5-15 minutes

---

## Pro Tips from the Field

- ⚡ **2019 redesign:** Completely new key system
- 📋 **Honda platform:** Similar to Honda procedures
- 🔧 **Popular luxury SUV:** Common programming job

---

## Key Information

- **Blade:** HON66
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["locksmithkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- NEW: INFINITI Q50 (2014-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'infiniti-q50-2014-2024',
  'Infiniti',
  'Q50',
  2014,
  2024,
  '# Infiniti Q50 2014-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Infiniti Q50 (luxury sport sedan) uses Nissan''s **Intelligent Key** system with push-button start.

> 💡 **Pearl:** Q50 uses same Nissan platform - programming similar to other Nissan/Infiniti vehicles.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **New Programmable Proximity Fob** | See FCC table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Year

| Years | FCC ID | Buttons |
|-------|--------|---------|
| 2014-2024 | KR5S180144204 | 4 |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2014-2024 | ID46 / ID47 |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Infiniti → Q50 → [Year]
3. **Select:** Intelligent Key → Add Key
4. **Follow prompts**
5. **Verify** all functions

**Total Time:** 5-15 minutes

---

## Pro Tips from the Field

- ⚡ **Nissan platform:** Easy programming
- 📋 **Consistent FCC ID:** Same key for many years
- 🔧 **Luxury pricing:** Charge accordingly

---

## Key Information

- **Blade:** NSN14
- **Lishi:** NSN14 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["locksmithkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- NEW: CHRYSLER PACIFICA (2017-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'chrysler-pacifica-2017-2024',
  'Chrysler',
  'Pacifica',
  2017,
  2024,
  '# Chrysler Pacifica 2017-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Chrysler Pacifica (minivan) uses a **proximity key fob (smart key)** with push-button start. Replaced the Town & Country.

> 💡 **Pearl:** Pacifica uses same M3N-97395900 FCC ID - NOT the same as Chrysler 300 (M3N-40821302)!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost |
| **New Programmable Proximity Fob** | M3N-97395900 |
| **CR2032 Battery** | Replace before programming |

---

## FCC ID

| Years | FCC ID | Buttons |
|-------|--------|---------|
| 2017-2024 | M3N-97395900 | 5-7 |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2017-2024 | ID4A (HITAG AES) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Chrysler → Pacifica → [Year]
3. **Select:** Proxi → Key Learning
4. **Follow prompts**
5. **Verify** start and remote functions

**Total Time:** 5-15 minutes

---

## Pro Tips from the Field

- ⚡ **Different FCC:** NOT same as 300/Charger
- 📋 **Family vehicle:** Popular minivan
- 🔧 **Up to 7 buttons:** Power doors option

---

## Key Information

- **Blade:** CY24
- **Lishi:** CY24 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
',
  '{"sources": ["locksmithkeyless.com", "remotesandkeys.com"], "generated": "2024-12-10", "method": "web_research"}'
);
