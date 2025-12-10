-- Standardize Audi, Lexus, BMW, Kia guides to Odyssey format

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDI A4 - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Audi A4 2009-2024 Key Programming Master Guide
## Using Autel IM608 + ODIS/VAG-COM

---

## Overview

The Audi A4 uses a **proximity key fob (smart key)** with Audi Advanced Key. Programming requires special attention due to the Megamos chipset and BCM2 module interaction.

> 💡 **Pearl:** All existing keys MUST be present when programming new Audi keys! The system clears and re-registers all keys during the procedure. If a customer has 2 keys and wants a 3rd, bring all 3 to the appointment.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | With VAG software update |
| **ODIS or VAG-COM** | Dealer-level access when needed |
| **Lonsdor K518 / Xhorse VVDI** | Alternative tools with Audi support |
| **New Programmable Proximity Fob** | See FCC ID table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Generation

| Years | FCC ID | Chip Type | Notes |
|-------|--------|-----------|-------|
| 2009-2016 | IYZFBSB802 | ID48 (Megamos) | Older platform |
| 2017-2024 | NBG92596263 | ID88 (MQB48) | MQB platform |

---

## Transponder Chip Evolution

| Years | Chip Type | Protocol | Notes |
|-------|-----------|----------|-------|
| 2009-2016 | ID48 | Megamos Crypto | VW/Audi standard |
| 2017-2024 | ID88 | Megamos AES (MQB) | Newer encryption |

> ⚠️ **Warning:** Megamos AES (ID88) requires professional tools with MQB support.

---

## Procedure: Add Key (With Working Key)

1. **Gather ALL existing keys** - critical for Audi!
2. **Connect IM608** to OBD-II port
3. **Navigate:** Audi → A4 → [Year] → Immobilizer
4. **Select:** Key Learning → Add Key
5. **Follow prompts:** May require ignition cycling
6. **Re-register all keys** including new one

**Total Time:** 15-30 minutes (all keys must be registered)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Key won''t register** | All existing keys must be present |
| **BCM2 error** | May need ODIS for dealer-level access |
| **2017+ Megamos AES** | Requires MQB-capable tools |
| **Can''t read PIN** | Some require special adapters |

---

## Pro Tips from the Field

- ⚡ **All keys present:** Critical! System re-registers all keys
- 📋 **MQB platform (2017+):** More secure, needs updated tools
- 🔧 **Higher complexity:** Charge premium for Audi key work
- 💰 **Dealer price:** $500-800+ vs $200-350 with right tools

---

## Key Information

- **Blade:** HU66
- **Lishi:** HU66 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz (US), 433 MHz (Europe)

---

*Last Updated: December 2025*
'
WHERE make = 'Audi' AND model = 'A4';

-- ═══════════════════════════════════════════════════════════════════════════
-- LEXUS RX - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Lexus RX 2016-2024 Key Programming Master Guide
## Using Autel IM608/Toyota Techstream

---

## Overview

The Lexus RX uses Toyota''s **proximity key fob (smart key)** system with keyless entry and push-button start. Programming is similar to Toyota with some Lexus-specific considerations.

> 💡 **Pearl:** Lexus uses the same H-chip (ID8A) as Toyota, but programming may require Techstream for some procedures. The IM608 covers most add-key scenarios.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **Toyota Techstream** | For all-keys-lost or stubborn vehicles |
| **New Programmable Proximity Fob** | HYQ14FBA or HYQ14FBB |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Year

| Years | FCC ID | Frequency | Notes |
|-------|--------|-----------|-------|
| 2016-2020 | HYQ14FBA | 315 MHz | Standard smart key |
| 2016-2024 | HYQ14FBB | 315 MHz | Alternative version |

---

## Transponder

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2016-2024 | ID8A (H-chip) | DST-AES 128 |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Lexus → RX → [Year] → Smart Key
3. **Select:** Register Smart Key → Add Key
4. **Follow prompts:** Place new key inside vehicle
5. **Complete and test** all functions

**Total Time:** 10-15 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Key not detected** | Place key in emergency slot on console |
| **IM608 fails** | Try Toyota Techstream |
| **Which FCC ID?** | Both HYQ14FBA and FBB similar |

---

## Pro Tips from the Field

- ⚡ **Toyota platform:** Uses same H-chip as Toyota
- 📋 **Premium brand:** Lexus owners pay premium prices
- 🔧 **Techstream backup:** Have it ready for difficult cases
- 💰 **High profit:** Luxury vehicle = luxury pricing

---

## Key Information

- **Blade:** TOY48
- **Lishi:** TOY48 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Lexus' AND model = 'RX';

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW 3-SERIES - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# BMW 3-Series 2012-2024 Key Programming Master Guide
## Using Autel IM608 + BMW ICOM

---

## Overview

The BMW 3-Series uses BMW''s **Comfort Access** smart key system. Programming can be complex due to CAS (Car Access System) and later FEM/BDC modules.

> 💡 **Pearl:** BMW key programming complexity varies by generation. F30 (2012-2018) uses FEM, G20 (2019+) uses BDC. Make sure your tools support the specific module!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | With BMW software update |
| **BMW ICOM / ISTA** | Dealer-level for complex cases |
| **Xhorse VVDI BIM** | Alternative for BMW |
| **New Programmable Proximity Fob** | 4-button comfort access |
| **CR2032/CR2450 Battery** | Varies by year |

---

## FCC IDs by Generation

| Generation | Years | FCC ID | Module |
|------------|-------|--------|--------|
| F30 | 2012-2018 | YGOHUF5767 | FEM |
| G20 | 2019-2024 | (Multiple) | BDC |

---

## Transponder

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2012-2018 | ID49 | HITAG Pro |
| 2019-2024 | ID49/AES | Enhanced security |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** BMW → 3-Series → [Year]
3. **Identify module:** FEM (2012-18) vs BDC (2019+)
4. **Select:** Key Learning → Add Key
5. **Follow specific procedure** for your module type

**Total Time:** 15-30 minutes (varies by generation)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **FEM vs BDC confusion** | Check year: 2019+ = BDC |
| **Key won''t register** | May need dealer tools (ISTA) |
| **All keys lost** | Very complex, charge accordingly |

---

## Pro Tips from the Field

- ⚡ **Know your module:** FEM vs BDC changes procedure
- 📋 **BMW = premium:** Charge accordingly for complexity
- 🔧 **ISTA backup:** Have dealer tools available for BMW
- 💰 **Dealer price:** $500-1000 at dealer

---

## Key Information

- **Blade:** HU92, HU100R
- **Lishi:** HU92, HU100R
- **Battery:** CR2032 or CR2450

---

*Last Updated: December 2025*
'
WHERE make = 'BMW' AND model = '3-Series';

-- ═══════════════════════════════════════════════════════════════════════════
-- KIA SPORTAGE - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Kia Sportage 2011-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Kia Sportage uses a **proximity key fob (smart key)** with push-button start on most trims. Similar to Hyundai (shared platform), all existing keys must be present during programming.

> 💡 **Pearl:** Kia and Hyundai share platforms! Many Kia and Hyundai keys are interchangeable. If you stock Hyundai keys, check compatibility with Kia models.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost |
| **New Programmable Proximity Fob** | See FCC table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs

| Years | FCC ID | Notes |
|-------|--------|-------|
| 2017-2021 | TQ8-FOB-4F08 | 4-button smart key |
| 2022-2024 | TQ8-FOB-4F35 | 5th gen Sportage |

---

## Transponder

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2011-2024 | ID47 | HITAG 3 |

---

## Procedure: Add Key (With Working Key)

1. **Gather ALL existing keys** - required!
2. **Connect IM608** to OBD-II port
3. **Navigate:** Kia → Sportage → [Year]
4. **Select:** Smart Key → Add Key
5. **Register all keys** including new one

**Total Time:** 10-15 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **All keys required** | Must have all existing keys present |
| **Platform shared** | Hyundai tools/keys may work |
| **No onboard programming** | Professional tools required |

---

## Pro Tips from the Field

- ⚡ **Hyundai/Kia shared:** Same platform, similar procedures
- 📋 **All keys present:** Required for registration
- 🔧 **Stock smart:** Similar keys work across brands

---

## Key Information

- **Blade:** HY15, HY20
- **Lishi:** HY22 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Kia' AND model = 'Sportage';
