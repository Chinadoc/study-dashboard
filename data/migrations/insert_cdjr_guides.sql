-- CDJR (Chrysler, Dodge, Jeep, RAM) Comprehensive Locksmith Guides
-- Based on professional locksmith security architecture analysis
-- Covers SKIM, SKREEM, WIN, and RFH immobilizer generations

-- ═══════════════════════════════════════════════════════════════════════════
-- DODGE RAM 1500 (2013-2024) - RFH/Keyless Go System
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'dodge-ram-1500-2013-2024',
  'RAM',
  '1500',
  2013,
  2024,
  '# RAM 1500 2013-2024 Key Programming Master Guide
## Radio Frequency Hub (RFH) / Keyless Go System

---

## Overview

The RAM 1500 uses the **Radio Frequency Hub (RFH)** for push-to-start (Keyless Go) systems. The RFH manages passive entry antennas, TPMS, and remote start authorization.

> 💡 **Pearl:** The RFH is located on the rear cab wall. For 2019+, it''s behind the speedometer cluster or above the gas pedal (difficult access).

---

## Security Architecture by Year

| Years | System | Chip | SGW Required | PIN Type |
|-------|--------|------|--------------|----------|
| 2013-2017 | RFH | ID46 (PCF7953) | ❌ No | Static 4-digit |
| 2018 | RFH | ID46 | ⚠️ Some trucks | Rolling |
| 2019-2024 | RFH + SGW | HITAG AES (4A) | ✅ Yes | Rolling 5-digit |

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support with AutoAuth |
| **12+8 SGW Bypass Cable** | Required for 2019+ |
| **Star Connector Cable** | Alternative bypass method |
| **AutoProPad G2** | Alternative tool |
| **SmartPro** | Alternative with SGW support |

---

## Security Gateway (SGW) Bypass - 2019+

> ⚠️ **Critical:** 2019+ RAM 1500 has Security Gateway. OBD programming blocked without bypass!

### Physical Bypass Method

**SGW Location:** Behind speedometer cluster OR above gas pedal

1. Remove speedometer cluster (requires torx bits)
2. Locate SGW module (small black box with 12+8 pin connectors)
3. Disconnect both plugs from SGW
4. Connect 12+8 bypass cable
5. Route cable to OBDII port
6. Proceed with programming

### AutoAuth Method (Software Bypass)

1. Ensure tool has active AutoAuth subscription
2. Connect via Wi-Fi
3. Tool authenticates with Stellantis server
4. Programming unlocked via OBDII (no dash disassembly)

---

## Programming Procedures

### All Keys Lost (2013-2017)

**Tool Path:** Autel → IMMO → Chrysler → RAM → 2013-2017 → Smart Key

1. Connect via OBDII
2. Select **Read Immobilizer Password**
3. Record the 4-digit PIN (static)
4. Select **Erase All Keys** (recommended for AKL)
5. Select **Add Smart Key**
6. Press Unlock button on new key while near center console
7. Press Start button with fob nose when prompted
8. Wait for "Key Learned" confirmation
9. Test proximity unlock and push-to-start

**Time:** 10-15 minutes

### All Keys Lost (2019-2024) - With SGW Bypass

**Tool Path:** Autel → IMMO → Chrysler → RAM → 2019+ → Smart Key

1. **Bypass SGW** using 12+8 cable or AutoAuth
2. Connect to direct CAN bus
3. Select **Read PIN Code** (tool pulls from RFH)
4. Record PIN (credits may be consumed)
5. Select **Add Smart Key**
6. Hold new key against Start Button
7. Press button with key nose
8. Cluster updates key count
9. **Reassemble:** Reconnect OEM Star Connectors
10. Verify start without tool connected

**Time:** 20-45 minutes (including disassembly)

---

## PIN Code Management

| Year Range | PIN Type | Method |
|------------|----------|--------|
| 2013-2017 | Static 4-digit | Read via OBD (free) |
| 2018-2020 | Rolling | Server calculation (credits) |
| 2021-2024 | Rolling + Hub Lock | May require RF Hub replacement |

> ⚠️ **Lockout Warning:** 3 incorrect PIN attempts = 1 hour lockout!

---

## RF Hub "Lock" Issue (2021+)

On 2021+ trucks, if all keys are lost, the RF Hub may **lock itself** to the VIN:
- Cannot accept new keys via standard PIN methods
- May require **RF Hub replacement** with virgin unit
- Similar to Mercedes FBS4 lockout behavior

---

## Key Specifications

| Spec | Value |
|------|-------|
| **Keyway** | Y159 / CY24 (Emergency blade) |
| **Lishi Tool** | CY24 2-in-1 |
| **Transponder (2013-18)** | ID46 (PCF7953) |
| **Transponder (2019+)** | HITAG AES (ID4A) |
| **Frequency** | 433 MHz |
| **Battery** | CR2032 |
| **FCC ID (Common)** | GQ4-76T, OHT-4882056 |

---

## Common Issues

| Issue | Solution |
|-------|----------|
| SGW blocking programming | Use 12+8 bypass or AutoAuth |
| 1-hour lockout | Wait or try alternative tool |
| Key not detected | Check battery (common failure) |
| 2021+ Hub Lock | May need RF Hub replacement |
| Prox entry not working | Re-learn key, check door antennas |

---

## Pro Tips from the Field

- ⚡ **2018 is transitional:** Some have SGW, some don''t - check first!
- 📋 **SGW Location varies:** Dash vs. above gas pedal - confirm before quoting
- 🔧 **Star Connector shortcut:** Often faster than finding SGW module
- 💰 **AutoAuth subscription:** Worth it for volume CDJR work
- 🔋 **Always check battery voltage:** Must be >12.5V for programming

---

*Last Updated: December 2025*
',
  '{"sources": ["cdjr_security_architecture", "autel_procedures", "field_reports"], "generated": "2024-12-16", "method": "integrated_reference"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- JEEP WRANGLER JL (2018-2024) - SGW + SIP22/HITAG AES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'jeep-wrangler-2018-2024',
  'Jeep',
  'Wrangler',
  2018,
  2024,
  '# Jeep Wrangler JL 2018-2024 Key Programming Master Guide
## Security Gateway (SGW) + HITAG AES System

---

## Overview

The Jeep Wrangler JL uses the **Radio Frequency Hub (RFH)** with **Security Gateway (SGW)** protection. This is the highest security level in the CDJR lineup.

> ⚠️ **Critical:** The SGW blocks all OBD programming. Physical bypass or AutoAuth required!

---

## Security Architecture

| Component | Location | Function |
|-----------|----------|----------|
| **RFH** | Dash area | Key authorization |
| **SGW** | Behind radio or Star Connector bank | CAN bus firewall |
| **BCM** | Driver side | Body control |
| **PCM** | Engine bay | Powertrain control |

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 Pro** | With AutoAuth subscription |
| **12+8 SGW Bypass Cable** | For physical bypass |
| **Star Connector Cable** | Alternative bypass |
| **New Smart Keys** | HITAG AES compatible |
| **SIP22 Lishi** | For door locks |

---

## SGW Bypass Methods

### Method 1: Star Connector (Recommended)

**Location:** Behind glovebox (passenger side)

1. Remove glovebox (squeeze sides)
2. Locate Green (CAN-C) Star Connector block
3. Disconnect OEM connectors from green block
4. Connect Star Connector cable to open port
5. Route to programming tool
6. **Result:** Direct CAN bus access

### Method 2: Behind Radio

1. Remove center console trim
2. Pull radio unit
3. Locate SGW (small black box)
4. Disconnect 12+8 connectors
5. Connect bypass cable

### Method 3: AutoAuth (Software)

1. Connect tool to OBDII
2. Connect to Wi-Fi
3. Select AutoAuth login
4. Tool unlocks SGW digitally
5. No disassembly required

---

## Programming Procedure (All Keys Lost)

**Tool Path:** Autel → IMMO → Jeep → Wrangler JL → 2018-2024 → Smart Key

### With Physical Bypass:

1. **Bypass SGW** using Star Connector method
2. Connect tool to bypass cable
3. Select **Read PIN Code**
4. Tool pulls PIN from RFH via direct CAN
5. Record PIN (5-digit rolling code)
6. Select **Add Smart Key**
7. Hold new key against Start Button
8. Press button with key nose
9. Cluster updates key count
10. **Reassemble:** Reconnect Star Connectors
11. Test all functions without tool

**Time:** 30-45 minutes

---

## Key Specifications

| Spec | Value |
|------|-------|
| **Keyway** | SIP22 (laser-cut) |
| **Lishi Tool** | SIP22 2-in-1 |
| **Transponder** | HITAG AES (ID4A) |
| **Encryption** | 128-bit AES |
| **Frequency** | 433 MHz |
| **Battery** | CR2032 |
| **FCC ID** | OHT1130261, GQ4-76T |

---

## SIP22 Keyway Notes

> 💡 **Fiat Influence:** SIP22 is a Fiat-designed laser-cut track. Marks the shift from traditional Y159 edge-cut keys.

- **Lock Type:** Milled/laser-cut (not edge-cut)
- **Lishi Tips:** Requires distinct tension, avoid over-torquing
- **Decoding:** SIP22 2-in-1 pick/decoder

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "No Communication" via OBD | SGW is blocking - must bypass |
| Star Connector not found | Behind glovebox, green block |
| Key won''t program | Check HITAG AES chip type |
| Door lock stiff | SIP22 locks need care with Lishi |
| PIN lockout | Wait 1 hour, try again |

---

## Pro Tips

- ⚡ **Star Connector is fastest:** Skip digging for SGW module
- 📋 **AutoAuth saves time:** No disassembly if subscription active
- 🔧 **SIP22 vs CY24:** Doors use SIP22, some emergency slots use CY24
- 💡 **Key count on cluster:** Shows how many keys registered

---

*Last Updated: December 2025*
',
  '{"sources": ["cdjr_security_architecture", "autel_procedures"], "generated": "2024-12-16", "method": "integrated_reference"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- DODGE CHARGER (2011-2024) - RFH Keyless Go
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'dodge-charger-2011-2024',
  'Dodge',
  'Charger',
  2011,
  2024,
  '# Dodge Charger 2011-2024 Key Programming Master Guide
## RFH / Keyless Go System

---

## Overview

The Dodge Charger uses the **Radio Frequency Hub (RFH)** for push-button start. Shares the same key system with Challenger, Chrysler 300, and Jeep Grand Cherokee.

> 💡 **Pearl:** Same key (M3N-40821302) works for Charger, Challenger, 300, and Grand Cherokee! Stock one key for four vehicles.

---

## Security Architecture by Year

| Years | System | Chip | SGW | PIN Type |
|-------|--------|------|-----|----------|
| 2011-2016 | RFH | ID46 (PCF7953) | ❌ No | Static 4-digit |
| 2017-2018 | RFH | ID4A (HITAG AES) | ⚠️ Some | Rolling |
| 2019-2024 | RFH + SGW | ID4A | ✅ Yes | Rolling 5-digit |

---

## SGW Location

**2019+ Charger:** Under the dash, driver side, near steering column

---

## Programming Procedures

### Add Key (2011-2016) - No SGW

1. Connect via OBDII
2. Autel: IMMO → Chrysler → Charger → 2011-2016
3. Select **Read PIN** (static 4-digit)
4. Select **Add Smart Key**
5. Hold key near Start Button, press with fob nose
6. "Key Learned" appears
7. Test functions

**Time:** 5-10 minutes

### All Keys Lost (2019-2024) - SGW Bypass

1. Locate SGW under driver dash
2. Disconnect 12+8 connectors
3. Connect bypass cable
4. Read rolling PIN (credits consumed)
5. Add new smart key
6. Reassemble
7. Test all functions

**Time:** 25-40 minutes

---

## Key Specifications

| Spec | Value |
|------|-------|
| **FCC ID** | M3N-40821302 |
| **Keyway** | Y159 / CY24 |
| **Lishi** | CY24 2-in-1 |
| **Chip (2011-16)** | ID46 (PCF7953) |
| **Chip (2017+)** | HITAG AES (ID4A) |
| **Frequency** | 433 MHz |
| **Battery** | CR2032 |
| **Buttons** | 4-5 |

---

## Cross-Compatible Keys

| FCC ID | Vehicles |
|--------|----------|
| M3N-40821302 | Charger, Challenger, 300, Grand Cherokee |

> 💰 **Business Tip:** Same key fits 4 popular vehicles. Stock generously!

---

## CY24 Lock Notes

- **Profile:** 8-cut, double-sided edge key
- **Door Lock Nuance:** Some locks have clutch mechanism - if picked wrong direction, cylinder spins freely
- **Lishi Strategy:** Standard wafer lock, some wafers are split (1-up/1-down)

---

*Last Updated: December 2025*
',
  '{"sources": ["cdjr_security_architecture"], "generated": "2024-12-16", "method": "integrated_reference"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- DODGE CHALLENGER (2011-2024) - Same as Charger
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'dodge-challenger-2011-2024',
  'Dodge',
  'Challenger',
  2011,
  2024,
  '# Dodge Challenger 2011-2024 Key Programming Master Guide
## RFH / Keyless Go System

---

## Overview

The Dodge Challenger shares its key system with the Charger, Chrysler 300, and Jeep Grand Cherokee. Uses the **Radio Frequency Hub (RFH)** for push-button start.

> 💡 **Pearl:** Same key (M3N-40821302) works for Challenger, Charger, 300, and Grand Cherokee!

---

## Security Architecture

| Years | System | Chip | SGW | PIN |
|-------|--------|------|-----|-----|
| 2011-2016 | RFH | ID46 | ❌ | Static 4-digit |
| 2017-2018 | RFH | ID4A | ⚠️ | Rolling |
| 2019-2024 | RFH + SGW | ID4A | ✅ | Rolling 5-digit |

---

## SGW Location

**SGW Location:** Under dash, driver side, near steering column

---

## Quick Programming (2011-2016)

1. OBDII → Autel → Chrysler → Challenger
2. Read PIN (static 4-digit)
3. Add Smart Key
4. Hold key at Start Button
5. Done in 5-10 minutes

## AKL Programming (2019-2024)

1. SGW bypass required (12+8 cable)
2. Read rolling PIN (uses credits)
3. Add new smart key
4. 25-40 minutes total

---

## Key Specs

| Spec | Value |
|------|-------|
| **FCC ID** | M3N-40821302 |
| **Keyway** | CY24 |
| **Lishi** | CY24 2-in-1 |
| **Chip (2017+)** | HITAG AES (ID4A) |
| **Battery** | CR2032 |

---

*Last Updated: December 2025*
',
  '{"sources": ["cdjr_security_architecture"], "generated": "2024-12-16", "method": "integrated_reference"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- JEEP GRAND CHEROKEE (2011-2024) - RFH System
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'jeep-grand-cherokee-2011-2024',
  'Jeep',
  'Grand Cherokee',
  2011,
  2024,
  '# Jeep Grand Cherokee 2011-2024 Key Programming Master Guide
## RFH / Keyless Go System

---

## Overview

The Jeep Grand Cherokee (WK2 2011-2021, WL 2022+) uses the **Radio Frequency Hub (RFH)** system. Shares keys with Dodge Charger/Challenger and Chrysler 300 on WK2 platform.

> 💡 **Pearl:** WK2 (2011-2021) uses same M3N-40821302 key as Charger! WL (2022+) has new key.

---

## Platform Differences

| Platform | Years | Key | SGW |
|----------|-------|-----|-----|
| WK2 | 2011-2021 | M3N-40821302 | 2018+ |
| WL (Grand Cherokee L) | 2021-2024 | GQ4-76T | ✅ Yes |

---

## Security Architecture

| Years | Chip | SGW | PIN |
|-------|------|-----|-----|
| 2011-2016 | ID46 | ❌ | Static |
| 2017-2020 | ID4A | ⚠️ Some | Rolling |
| 2021-2024 | ID4A | ✅ Yes | Rolling + Hub Lock |

---

## SGW Bypass

**WK2 SGW Location:** Behind center console/radio area

**WL SGW Bypass:** May require "Hub Lock" procedures on 2021+

---

## RF Hub Lock Warning (2021+)

> ⚠️ **Critical Issue:** On 2021+ WL platform, if all keys are lost, the RF Hub may lock itself. Standard PIN methods may not work - RF Hub replacement may be required.

---

## Programming (2011-2016)

1. OBDII connect
2. Read static 4-digit PIN
3. Add smart key
4. 5-10 minutes

## Programming (2021+ with Hub Lock)

1. Attempt SGW bypass
2. Try PIN read
3. If locked: RF Hub replacement may be needed
4. Contact dealer or use NASTF credentials

---

## Key Specs

| Spec | WK2 (2011-2021) | WL (2022+) |
|------|-----------------|------------|
| **FCC ID** | M3N-40821302 | GQ4-76T |
| **Keyway** | CY24 | CY24 / Y159-HS |
| **Chip** | ID46 → ID4A | ID4A |
| **Frequency** | 433 MHz | 433 MHz |

---

*Last Updated: December 2025*
',
  '{"sources": ["cdjr_security_architecture"], "generated": "2024-12-16", "method": "integrated_reference"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- DODGE CARAVAN / TOWN & COUNTRY (2008-2020) - WIN/Fobik System
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'dodge-caravan-2008-2020',
  'Dodge',
  'Grand Caravan',
  2008,
  2020,
  '# Dodge Grand Caravan 2008-2020 Key Programming Master Guide
## Wireless Ignition Node (WIN) / Fobik System

---

## Overview

The Dodge Grand Caravan (and Chrysler Town & Country) uses the **Wireless Ignition Node (WIN)** system - a Daimler-era design. The user inserts a "Fobik" into a dash slot instead of turning a key.

> ⚠️ **Known Issue:** WIN modules are notorious for mechanical detent failure. May need WIN replacement!

---

## WIN Module Function

The Fobik (Finger Operated Button Integrated Key) inserts into the WIN slot:
- Transponder data read from Fobik circuit board
- WIN communicates with PCM for authorization
- Still uses PIN-based programming

---

## Common WIN Failures

| Symptom | Cause |
|---------|-------|
| Fobik won''t rotate | Mechanical detent failure |
| Fobik falls out of "Run" | P57 recall-related issue |
| No crank, no start | WIN lost communication |
| Intermittent starting | Worn WIN contacts |

> 💡 **Diagnosis Tip:** Symptoms often mimic dead battery or starter failure. Check WIN communication first!

---

## WIN Module Diagnosis

1. Connect scanner
2. Read "WIN Module" live data
3. If "No Communication" → Check power/ground to WIN
4. If communicating → Check "Ignition Switch Status"
5. If status doesn''t change on Fobik insertion → WIN detents broken

---

## WIN Replacement Procedure

### Secret Key Transfer Method:

1. Install new WIN module
2. Use "Replace WIN" function
3. Tool reads SKIM Secret Key (SSK) from PCM
4. Writes SSK to new WIN
5. Existing Fobiks continue to work!

### If Transfer Fails:

1. Program WIN as "New"
2. Requires original vehicle PIN (from dealer)
3. Need NEW Fobiks (used Fobiks locked to old WIN)

---

## Fobik vs Pod Key

| Type | Description | Use |
|------|-------------|-----|
| **Fobik** | Plastic rectangle with buttons | Full RKE |
| **Pod Key** | Traditional key look, Fobik-style head | No buttons |

> 💡 A Pod Key can start a Fobik vehicle if transponder is programmed. RKE functions won''t work.

---

## Programming (Add Key - Working Key Present)

1. OBDII → Autel → Chrysler → Caravan
2. Select year range
3. Read PIN (if needed)
4. Insert new Fobik in WIN slot
5. Turn to "On"
6. Confirm "Key Learned"

---

## Key Specs

| Spec | Value |
|------|-------|
| **System** | WIN (Wireless Ignition Node) |
| **Key Type** | Fobik / Pod Key |
| **Chip** | ID46 (PCF7936) integrated |
| **Keyway** | N/A (plastic fob) / Y159 emergency |
| **Frequency** | 315/433 MHz |
| **Battery** | CR2032 |

---

*Last Updated: December 2025*
',
  '{"sources": ["cdjr_security_architecture"], "generated": "2024-12-16", "method": "integrated_reference"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- JEEP WRANGLER JK (2007-2017) - SKREEM/Fobik System
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'jeep-wrangler-jk-2007-2017',
  'Jeep',
  'Wrangler',
  2007,
  2017,
  '# Jeep Wrangler JK 2007-2017 Key Programming Master Guide
## SKREEM / Remote Head Key System

---

## Overview

The Jeep Wrangler JK (2007-2017) uses the **SKREEM (Sentry Key Remote Entry Module)** system - much simpler than the JL generation. No Security Gateway required!

> 💡 **Good News:** No SGW bypass needed. Straightforward OBD programming.

---

## Security Architecture

| Years | System | Chip | SGW |
|-------|--------|------|-----|
| 2007-2011 | SKREEM | ID46 (PCF7936) | ❌ No |
| 2012-2017 | SKREEM | ID46 (PCF7941) | ❌ No |

---

## SKREEM Module Location

Behind dash, near steering column

---

## Programming Procedure

**Tool Path:** Autel → IMMO → Jeep → Wrangler → 2007-2017

1. Connect via OBDII
2. Select **Read PIN** (static 4-digit)
3. PIN is free - no credits consumed
4. Select **Add Key**
5. Turn ignition to "On" with new key
6. Security light turns off
7. Test RKE functions

**Time:** 5-10 minutes

---

## Key Specifications

| Spec | Value |
|------|-------|
| **System** | SKREEM |
| **Keyway** | Y160 / CY24 |
| **Lishi** | CY24 2-in-1 |
| **Chip** | ID46 (PCF7936/7941) |
| **Frequency** | 315 MHz |
| **Battery** | CR2032 |
| **Buttons** | 3-4 |

> 💡 **JK vs JL:** JK uses ID46 and no SGW. JL (2018+) uses ID4A + SGW.

---

*Last Updated: December 2025*
',
  '{"sources": ["cdjr_security_architecture"], "generated": "2024-12-16", "method": "integrated_reference"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- JEEP RENEGADE (2015-2024) - SIP22 / HITAG AES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'jeep-renegade-2015-2024',
  'Jeep',
  'Renegade',
  2015,
  2024,
  '# Jeep Renegade 2015-2024 Key Programming Master Guide
## Fiat-Based SIP22 / HITAG AES System

---

## Overview

The Jeep Renegade is built on a **Fiat platform**, introducing the SIP22 keyway and modern Fiat security architecture to the CDJR lineup.

> 💡 **Fiat DNA:** SIP22 is a Fiat-designed laser-cut key. Different from traditional Chrysler Y159.

---

## Security Architecture

| Years | Chip | SGW |
|-------|------|-----|
| 2015-2017 | ID46 (mixed) | ❌ No |
| 2018-2024 | HITAG AES (ID4A) | ✅ Yes |

---

## SIP22 Keyway

| Spec | Value |
|------|-------|
| **Profile** | High-security laser-cut (milled) |
| **Lishi Tool** | SIP22 2-in-1 |
| **Picking Notes** | Lock is often stiff, avoid over-torquing |
| **Similar To** | Fiat 500, Ram ProMaster |

> ⚠️ **Lishi Caution:** SIP22 locks on Renegade and ProMaster are stiff. Lishi tool risks bending if over-torqued.

---

## Programming (2018+)

1. SGW bypass required for 2018+
2. Use 12+8 cable or AutoAuth
3. Read rolling PIN
4. Add smart key
5. Test all functions

---

## Key Specs

| Spec | Value |
|------|-------|
| **Keyway** | SIP22 |
| **Lishi** | SIP22 2-in-1 |
| **Chip** | HITAG AES (ID4A) |
| **Encryption** | 128-bit AES |
| **Frequency** | 433 MHz |
| **Battery** | CR2032 |

---

*Last Updated: December 2025*
',
  '{"sources": ["cdjr_security_architecture"], "generated": "2024-12-16", "method": "integrated_reference"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RAM PROMASTER (2014-2024) - Fiat SIP22 Platform
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ram-promaster-2014-2024',
  'RAM',
  'ProMaster',
  2014,
  2024,
  '# RAM ProMaster 2014-2024 Key Programming Master Guide
## Fiat Ducato Platform / SIP22 System

---

## Overview

The RAM ProMaster is based on the **Fiat Ducato** platform, using Fiat security architecture with the SIP22 keyway.

> 💡 **Fiat Platform:** ProMaster shares DNA with Fiat Ducato, not traditional RAM trucks.

---

## SIP22 Lock Warning

> ⚠️ **Critical:** The SIP22 lock on ProMasters is **notoriously stiff**. The Lishi tool risks bending if over-torqued!

---

## Security Architecture

| Years | Chip | System |
|-------|------|--------|
| 2014-2018 | ID46/ID48 | Fiat-style |
| 2019-2024 | HITAG AES (ID4A) | SGW protected |

---

## Key Specs

| Spec | Value |
|------|-------|
| **Keyway** | SIP22 |
| **Lishi** | SIP22 2-in-1 (use caution!) |
| **Chip** | ID4A (2019+) |
| **Frequency** | 433 MHz |
| **Battery** | CR2032 |

---

## Programming Notes

- Use Fiat procedures on some tools
- May require Fiat-specific adapters
- SGW bypass for 2019+

---

*Last Updated: December 2025*
',
  '{"sources": ["cdjr_security_architecture"], "generated": "2024-12-16", "method": "integrated_reference"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- DODGE JOURNEY (2009-2020) - RFH Keyless Go
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'dodge-journey-2009-2020',
  'Dodge',
  'Journey',
  2009,
  2020,
  '# Dodge Journey 2009-2020 Key Programming Master Guide
## RFH / Keyless Go System

---

## Overview

The Dodge Journey uses the **Radio Frequency Hub (RFH)** for push-to-start models, or **SKREEM** for traditional key models.

---

## Security Architecture

| Years | System | Chip | Key Type |
|-------|--------|------|----------|
| 2009-2012 | SKREEM | ID46 | Remote Head Key |
| 2013-2020 | RFH | ID46 (PCF7953) | Proximity |

---

## Programming (Standard)

1. OBDII connect
2. Autel → Chrysler → Journey → Year
3. Read static 4-digit PIN
4. Add key
5. Test functions

**Time:** 5-15 minutes

---

## Key Specs

| Spec | Value |
|------|-------|
| **Keyway** | Y159 / CY24 |
| **Lishi** | CY24 2-in-1 |
| **Chip** | ID46 (PCF7953) |
| **Frequency** | 433 MHz |
| **Battery** | CR2032 |
| **FCC ID (Prox)** | M3N-40821302 |

---

*Last Updated: December 2025*
',
  '{"sources": ["cdjr_security_architecture"], "generated": "2024-12-16", "method": "integrated_reference"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- DODGE DART (2013-2016) - Fiat Platform
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'dodge-dart-2013-2016',
  'Dodge',
  'Dart',
  2013,
  2016,
  '# Dodge Dart 2013-2016 Key Programming Master Guide
## Fiat Compact Platform

---

## Overview

The Dodge Dart is built on the **Fiat Compact Wide platform**, sharing components with Alfa Romeo Giulietta.

---

## Security Architecture

| System | Chip | Key Type |
|--------|------|----------|
| RFH | ID46 (PCF7953) | Proximity Smart Key |

---

## Key Specs

| Spec | Value |
|------|-------|
| **Keyway** | Y159 emergency blade |
| **Chip** | ID46 (PCF7953) |
| **Frequency** | 433 MHz |
| **Battery** | CR2032 |

---

## Programming

- Standard OBD programming
- 4-digit static PIN
- No SGW issues

---

*Last Updated: December 2025*
',
  '{"sources": ["cdjr_security_architecture"], "generated": "2024-12-16", "method": "integrated_reference"}'
);
