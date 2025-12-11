# Hyundai Professional Locksmith Programming Guide: North American Market

Hyundai's immobilizer architecture has evolved through four distinct generations since 2006, each requiring different diagnostic approaches and PIN code protocols. This comprehensive reference covers **every North American Hyundai model from 2002-2024**, including transponder specifications, FCC IDs, programming procedures, and tool requirements. The most critical development for locksmiths is the 2019+ transition to Security Gateway systems requiring authorized tool access, combined with the shift from HITAG2 (ID46) to HITAG-AES (ID4A) encryption on 2021+ models.

---

## Immobilizer system evolution spans four generations

Hyundai's security architecture progressed from standalone SMARTRA modules to integrated gateway systems, fundamentally changing programming requirements at each transition.

### Generation 1: SMARTRA-2 (2006-2009)
The earliest US immobilizer systems used standalone **SMARTRA (Smart Key Transponder Antenna)** modules mounted on the steering column near the ignition cylinder. Communication occurred via K-line serial protocol with basic Hitag 2 encryption.

| Attribute | Specification |
|-----------|---------------|
| Module Location | Steering column, near ignition |
| Communication | K-line serial |
| Transponder | Texas 4C/4D, Philips ID46 (PCF7936) |
| PIN Format | 4-digit (default 2345) or 6-digit VIN-derived |
| PIN Source | Calculate from last 6 digits of VIN |
| Max Keys | 2-4 keys |

**Models covered:** Azera (2006), Veracruz (2007-2009), Genesis Sedan/Coupe (2008-2009), select Canadian models with broader deployment than US counterparts.

### Generation 2: SMARTRA-3 (2010-2016)
The most common system in the field, SMARTRA-3 introduced CAN-bus communication and dealer-secured PIN codes that cannot be calculated from VIN alone. The immobilizer module migrated to behind the instrument cluster or near the BCM.

| Attribute | Specification |
|-----------|---------------|
| Module Location | Behind instrument cluster or near BCM |
| Communication | High-Speed CAN-bus |
| Transponder | ID46 (PCF7936/PCF7952A) with Hitag 2 |
| PIN Format | 6-digit dealer-secured |
| PIN Source | NASTF, dealer portal, ADC190 dongle |
| Max Keys | 2 proximity keys, 4-8 mechanical |

**Models covered:** Sonata, Tucson, Santa Fe, Elantra, Accent (2010-2016), Genesis Coupe/Sedan (2010-2014), Equus/Azera (2011-2016), Veloster (2012-2015).

### Generation 3: Integrated BCM/Smart Key (2017-2018)
Immobilizer functions began integrating into the IBU (Integrated Body Unit), marking the transition to ID47 (HITAG3) transponders. Dual validation between BCM and ECM became standard.

| Attribute | Specification |
|-----------|---------------|
| Module Location | BCM under driver's dash |
| Communication | CAN-bus with enhanced security |
| Transponder | ID46 (mechanical), ID47 (smart keys beginning) |
| PIN Format | 6-digit, readable from working key |
| Max Keys | 2-3 smart keys |

### Generation 4: Security Gateway (2019-2024)
Current vehicles integrate the **Central Gateway (CGW)** within the ICU (Integrated Control Unit), routing all diagnostic communication through security validation. Tool authorization via digital certificates is required.

| Attribute | Specification |
|-----------|---------------|
| Module Location | ICU integrated under dashboard |
| Communication | CAN-FD with gateway routing |
| Transponder | ID47 (HITAG3), ID4A (HITAG-AES) on 2021+ |
| PIN Format | 6-digit, readable via SGW-authorized tool |
| Security | Returns NRC 0x33 for unauthorized requests |

**Security Gateway vehicles include:** Elantra CN7, Ioniq 5, Nexo, Palisade, Santa Fe TM, Sonata DN8, Tucson NX4, Venue, and all Genesis models (G70, G80, G90, GV70, GV80).

**Critical note:** Unlike FCA vehicles, Hyundai/Kia Security Gateway does NOT require hardware bypass—authorized diagnostic tools receive digital certificates for access.

---

## Transponder chip specifications determine programming approach

### Philips/NXP HITAG Family

**PCF7936 (ID46) — Most common chip 2000-2015**
| Parameter | Value |
|-----------|-------|
| Frequency | 125 kHz |
| Encryption | Hitag 2 (48-bit Crypto 2) |
| Cloning | Fully supported via VVDI Super Chip, Autel AT100 |
| Variants | PCF7936AS (encrypted programming), PCF7936AA (unencrypted) |

**Vehicles:** Accent (1999-2012), Elantra (2000-2011), Sonata (2005-2010), Tucson (2004-2009), Santa Fe (2002-2011), Azera (2005-2011), Tiburon (2001-2008), Veracruz (2006-2012).

**PCF7952A (ID46) — Smart key transponder 2007-2017**
Combined with 315 MHz RF (US market) or 433 MHz (export). Used in Veracruz (2007-2012), Genesis (2008-2014), Sonata (2010-2014), Veloster (2010-2016), Santa Fe (2013-2017).

**PCF7938X (ID47/HITAG3) — Advanced security 2014+**
| Parameter | Value |
|-----------|-------|
| Frequency | 125 kHz |
| Encryption | 128-bit AES |
| Cloning | Limited—requires specialized tools |

**Vehicles:** Genesis (2014+), Kona (2016+), Ioniq (2016+), Santa Fe (2016+), all 2017-2022 smart key models.

**PCF7961M (ID4A/HITAG-AES) — Current generation 2019+**
| Parameter | Value |
|-----------|-------|
| Frequency | 125 kHz |
| Encryption | 128-bit AES (industry standard) |
| Cloning | Supported via Autel AT100, Xhorse Super Chip |

**Vehicles:** Venue (2021-2024), Santa Fe (2024), all 2021+ models transitioning to this chip.

### Texas Instruments Family

**Texas 4C (ID4C) — Fixed code 1995-2003**
Non-encrypted, easily clonable. Used in Accent (1996-1999), Sonata (1996-1998), early Elantra models.

**Texas 4D60 (ID60) — 40/80-bit crypto 1998-2010**
| Parameter | Value |
|-----------|-------|
| Frequency | 134.2 kHz |
| Encryption | 40-bit or 80-bit crypto |

**Vehicles:** Sonata (1998-2004), XG300/XG350 (2001-2005), early Santa Fe (2000-2002).

**DST80 (ID6E-MA) — 80-bit DST 2010-2019**
Uses LFSR-based key schedule with 200 rounds. **Known vulnerability:** Some Hyundai implementations used low-entropy keys, reducing effective security to ~2^41.

**Vehicles:** Accent (2011-2018), Elantra (2011-2015), Tucson (2015+).

**DST-AES (128-bit) — Current high-security 2012+**
| Parameter | Value |
|-----------|-------|
| Frequency | 134.2 kHz |
| Encryption | AES-128 |
| Tools | Abrites TA68 emulator required |

**Vehicles:** Azera (2012-2017), Elantra (2016+), Accent (2017+), Kona (2016+).

---

## Vehicle-specific data tables

### Elantra (2007-2024)

| Years | Key Type | Chip | FCC ID | Frequency | Blade | Battery |
|-------|----------|------|--------|-----------|-------|---------|
| 2007-2010 | Transponder + remote | ID46/PCF7936 | OSLOKA-310T | 315 MHz | HYN14R | CR2032 |
| 2011-2016 | Smart key option | ID46/PCF7952 | SY5HMFNA04 | 315 MHz | HY22 | CR2032 |
| 2017-2020 | Flip/Smart | ID46/PCF7952A | CQOFD00120 | 433 MHz | HY18/HY22 | CR2032 |
| 2021-2024 | Smart key | HITAG-AES/6A | NYOMBEC5FOB2004 | 434 MHz | KK12 | CR2032/CR2450 |

**Part numbers:** 95430-2L350 (2007-10), 95440-3M220 (2011-16 smart), 95440-F2002 (2017-20), 95440-AA000 (2021-23), 95440-AA500 (2024).

### Sonata (2006-2024)

| Years | Key Type | Chip | FCC ID | Frequency | Blade | Battery |
|-------|----------|------|--------|-----------|-------|---------|
| 2006-2010 | Transponder + remote | ID46/PCF7936 | OSLOKA-310T | 315 MHz | HY20 | CR2032 |
| 2011-2014 | Smart key | ID46/PCF7952A | SY5HMFNA04 | 315 MHz | HY22 | CR2032 |
| 2015-2019 | Smart key | ID46/8A chip | CQOFD00120 | 433 MHz | HY22 | CR2032 |
| 2020-2024 | Smart key + Digital Key | ID47/NCF29A1X | TQ8-FOB-4F27/4F28 | 433 MHz | HY22/KK12 | CR2032/CR2450 |

**Part numbers:** 95430-3K202 (2006-10), 95440-3M100 (2011-14), 95440-C1000 (2015-19), 95440-L1060/L1500 (2020-24).

### Accent (2006-2024)

| Years | Key Type | Chip | FCC ID | Frequency | Blade | Battery |
|-------|----------|------|--------|-----------|-------|---------|
| 2006-2010 | Transponder + remote | ID46/PCF7936 | PLNHM-T002 | 315 MHz | HYN14 | CR2032 |
| 2011-2017 | Transponder/Flip | ID46/PCF7936 | TQ8-RKE-4F14 | 434 MHz | HY18 | CR2032 |
| 2018-2022 | Flip remote | ID46/HITAG2 | NYOSYEC4TX1707 | 433 MHz | HY18 | CR2032 |
| 2024+ | Smart key | DST-AES/ID6A | MBEC4FOB2006 | 433 MHz | HY18 | CR2032 |

### Tucson (2005-2024)

| Years | Key Type | Chip | FCC ID | Frequency | Blade | Battery |
|-------|----------|------|--------|-----------|-------|---------|
| 2005-2009 | Transponder | ID46/PCF7936 | N/A | 315 MHz | HYN6 | N/A |
| 2010-2015 | Smart key | HITAG2/PCF7953A | SY5HMFNA04 | 433 MHz | TOY48 | CR2032 |
| 2016-2020 | Smart key | ID47/HITAG3 | TQ8-FOB-4F07/4F11 | 433 MHz | LXP90 | CR2032 |
| 2021-2024 | Smart key (4-7 btn) | ID47/NCF29A1X | TQ8-FOB-4F26/4F27/4F28 | 433 MHz | LXP90 | CR2032/CR2450 |

**2024 update:** FCC ID TQ8-FOB-4F89U44 with HITAG-AES (ID4A), CR2450 battery.

### Santa Fe (2007-2024)

| Years | Key Type | Chip | FCC ID | Frequency | Blade | Battery |
|-------|----------|------|--------|-----------|-------|---------|
| 2007-2012 | Remote head key | ID46/PCF7936 | PINHA-T038 | 315 MHz | HYN14 | CR2032 |
| 2013-2018 | Smart key | ID46/PCF7952A | SY5DMFNA04 | 315 MHz | HY18R | CR2032 |
| 2019-2023 | Smart key (5-7 btn) | ID47/NCF29A1X | TQ8-FOB-4F27/4F28 | 433 MHz | HU134 | CR2032 |
| 2024+ | Smart key | HITAG-AES/ID4A | TQ8-FOB-4F61M43 | 433 MHz | KK12 | CR2450 |

### Kona (2018-2024)

| Years | Key Type | Chip | FCC ID | Frequency | Blade | Battery |
|-------|----------|------|--------|-----------|-------|---------|
| 2018-2020 | Smart key | ID47/NCF29A1X | TQ8-FOB-4F18 | 433 MHz | KK12 | CR2032 |
| 2021-2023 | Smart key | ID47/HITAG3 | TQ8-FOB-4F43 | 433 MHz | KK12 | CR2032 |
| 2024+ | Smart key (5-7 btn) | HITAG-AES/ID4A | TQ8-FOB-4F61M43 | 433 MHz | KK12 | CR2450 |

### Palisade (2020-2024)

| Years | Buttons | Chip | FCC ID | Part Number | Battery |
|-------|---------|------|--------|-------------|---------|
| 2020-2022 | 5-button | ID47/HITAG3 | TQ8-FOB-4F29 | 95440-S8010 | CR2032 |
| 2022-2024 | 7-button | ID47/NCF29A1X | TQ8-FOB-4F28 | 95440-S8600 | CR2032 |
| 2023-2024 | 6-button | ID47/HITAG3 | TQ8-FOB-4F44 | 95440-S8560 | CR2032 |

Emergency blade: KK12. Frequency: 433-434 MHz.

### Venue (2020-2024)

| Specification | Value |
|---------------|-------|
| FCC ID | SY5IGFGE04 |
| Chip | HITAG-AES 128-bit / ID4A |
| Frequency | 433-434 MHz |
| Part Numbers | 95440-K2400, 95440-K2410 |
| Emergency Blade | KK12 |
| Battery | CR2032 |
| Buttons | 4 (Lock, Unlock, Remote Start, Panic) |

### Ioniq Hybrid/Electric (2017-2024)

| Years | Chip | FCC ID | Frequency | Battery |
|-------|------|--------|-----------|---------|
| 2017-2021 | HITAG3/ID47 | TQ8-FOB-4F11 | 434 MHz | CR2032 |
| 2022-2024 | HITAG-AES/ID4A | FG01190 | 433 MHz | CR2032 |

### Ioniq 5 (2022-2024)

| Buttons | FCC ID | Chip | Part Number | Battery |
|---------|--------|------|-------------|---------|
| 6-button | CQOFD01470 | HITAG-AES/4A | 95440-GI020 | CR2032 |
| 8-button | CQOFD01480 | HITAG-AES/4A | 95440-GI050 | CR2032/CR2450 |
| 5-btn (2024 N) | TQ8-FOB-4F89U44 | HITAG-AES/4A | 95440-NI000 | CR2450 |

Emergency blade: KK12. **Digital Key 2.0** with NFC/UWB on SEL/Limited trims.

### Ioniq 6 (2023-2024)

| Specification | Value |
|---------------|-------|
| FCC ID | NYOMBEC7FOB2208 |
| Chip | AES 6A / HITAG-AES |
| Frequency | 433 MHz |
| Part Numbers | 95440-KL000 (base), 95440-KL200 (parking assist) |
| Emergency Blade | KK12 / HY18 |
| Battery | CR2450 |

### Genesis G70 (2019-2024)

| Years | Buttons | FCC ID | Chip | Part Number | Battery |
|-------|---------|--------|------|-------------|---------|
| 2019-2021 | 4 | TQ8-FOB-4F16 | HITAG3/ID47 | 95440-G9000 | CR2032 |
| 2021-2023 | 8 | TQ8-FOB-4F35 | HITAG3/ID47 | 95440-AR010 | CR2032 |
| 2023-2024 | 5 | TQ8-FOB-4F75M44 | HITAG-AES/4A | 95440-G9720 | CR2450 |

Emergency blade: KIA9TE.

### Genesis G80 (2015-2024)

| Years | FCC ID | Chip | Part Number | Buttons |
|-------|--------|------|-------------|---------|
| 2015-2016 (Hyundai) | SY5DHFNA433 | ID47/HITAG3 | 95440-B1200 | 4 |
| 2017-2020 | SY5HIFGE04 | HITAG3/ID47 | 95440-D2000NNB | 4 |
| 2021-2024 | TQ8-FOB-4F35/4F36 | HITAG3/ID47 | 95440-T1200 | 6-8 |

### Genesis G90 (2017-2024)

| Years | FCC ID | Chip | Part Number | Buttons |
|-------|--------|------|-------------|---------|
| 2017-2020 | SY5HIFGE04 | HITAG3/ID47 | 95440-D2000NNB | 4 |
| 2021-2024 | TQ8-FOB-4F53U | HITAG3/ID47 | 95440-T4100/T4110 | 7 |

### Genesis GV70 (2022-2024)

| Specification | Value |
|---------------|-------|
| FCC ID | TQ8-FOB-4F35 / TQ8-FOB-4F36 |
| Chip | ID47 / HITAG3 |
| Frequency | 434 MHz |
| Part Numbers | 95440-AR011 (8-btn), 95440-DS010 (6-btn) |
| Emergency Blade | KIA9TE |
| Battery | CR2032 |

### Genesis GV80 (2021-2024)

| Specification | Value |
|---------------|-------|
| FCC ID | TQ8-FOB-4F35 / TQ8-FOB-4F53 |
| Chip | Philips ID47 |
| Frequency | 434 MHz |
| Part Numbers | 95440-T6011 (2021), 95440-T6014 (2022-24) |
| Emergency Blade | KIA9TE |
| Battery | CR2032 |
| Buttons | 8 (Lock, Unlock, Hatch, Panic, Remote Start, Lights, Parking Assist x2) |

### Veloster (2012-2021)

| Years | FCC ID | Chip | Frequency | Blade |
|-------|--------|------|-----------|-------|
| 2012-2017 | SY5HMFNA04 | ID46/PCF7952 | 315 MHz | HY18-P |
| 2017-2021 | SY5IGFGE04 | ID47/HITAG3 | 433 MHz | HY18 |

### Santa Cruz (2022-2024)

| Years | FCC ID | Chip | Part Number | Battery |
|-------|--------|------|-------------|---------|
| 2022-2023 | TQ8-FOB-4F27 | HITAG3/ID47 | 95440-K5000 | CR2032 |
| 2024+ | TQ8-FOB-4F61M43 | HITAG-AES/4A | 95440-K5500 | CR2450 |

Buttons: 5 (Lock, Unlock, Remote Start, Tailgate, Panic). Shares Tucson N3 platform.

### Legacy Models

**Azera (2006-2017)**
- 2006-2011: ID46/PCF7936, FCC SY55WY8212, 315 MHz, HY20 blade
- 2012-2017: ID46/PCF7952A, FCC SY5HMFNA04/SY5DMFNA433, 315-433 MHz, HY22 blade

**Equus (2011-2016)**
- 2011-2013: ID46/PCF7952A, FCC SY5HMFNA04, 315 MHz, HY22 blade
- 2014-2016: ID46/PCF7952A, FCC SY5DMFNA433, 433 MHz, LXP90 blade

**Veracruz (2007-2012)**
- ID46/PCF7952A, FCC SY5SVISMKFNA04, 315 MHz, K-2B020 blade
- Smart key Part #: 95440-3J600

**Entourage (2007-2009)**
- ID46/PCF7936, FCC SV3-100060235, 315 MHz, HY15/HYN7 blade
- 6-button remote (includes sliding door controls)
- NOT smart key—separate remote and transponder

**Tiburon (2003-2008)**
- **Non-immobilized** in US market
- Remote FCC: LXP-RKE225 (315 MHz)
- Blade: HYN6

**XG350 (2002-2005)**
- Texas 4D60/ID60 transponder
- FCC: OSLOKA-220T, 315 MHz
- Blade: HY021/HYN6

---

## Key blade profiles and Lishi tool compatibility

### Emergency Blade Cross-Reference

| Keyway | Profile | Years | Applications |
|--------|---------|-------|--------------|
| HYN6 | Older Hyundai | 2002-2008 | Tiburon, XG350, Tucson 1st gen |
| HYN14/HYN14R | 10-cut flat | 2007-2016 | Elantra, Santa Fe, Entourage |
| HY15 | Similar to HYN14R | 2006-2016 | Accent, Elantra, Tucson |
| HY18 | High-security 2-track | 2012+ | Accent, Elantra GT, Veloster, Santa Fe |
| HY20/TOY48 | Laser-cut | 2006-2014 | Azera, Sonata, Genesis, Tucson 2nd gen |
| HY22/LXP90 | Smart key emergency | 2009-2020 | Azera, Genesis, Sonata, Equus |
| KK12/KIA9 | Current generation | 2021+ | Elantra, Sonata, Ioniq 5/6, Kona, Venue |
| KIA9TE | Genesis premium | 2017-2024 | G70, G80, G90, GV70, GV80 |
| HU134 | Modern premium | 2019+ | Santa Fe 4th gen |

### Lishi HYN14/HY16 (10-Cut Flat Key)
**Compatible vehicles:**
- Hyundai: Veracruz (2007-12), Sonata (2004-10), Santa Fe (2002-12), Genesis (2008+), Tucson (2010-12), Elantra (2011-19), Entourage (2007-09)
- Kia: Carnival, Sedona, Forte, Optima, Sportage

### Lishi HY18/HY20 (8-Cut, 2-Track Internal)
**Compatible vehicles:**
- Accent (2012-17), Elantra GT (2013-16), Veloster (2012-16), Santa Fe (2013-16)

### Lishi HY22 (4-Track Internal, Quad Lifter)
**Compatible vehicles:**
- Azera (2005-15), Equus (2011-13), Genesis Sedan (2009-14), Sonata (2010-14), Elantra Touring (2011-13)

**Usage note:** HY22 uses quad lifter—requires back-picking to return cylinder to lock position.

---

## Programming procedures by method

### PIN Code Requirements Summary

| Period | Format | Source |
|--------|--------|--------|
| Pre-2007 | 4-digit (2345) or 6-digit | Calculate from last 6 VIN digits |
| 2007-2018 | 6-digit | NASTF, dealer, read via OBD |
| 2019+ | 6-digit | SGW-authorized tool or dealer |

**Critical:** 3 incorrect PIN attempts triggers 1-hour lockout. Never enter unknown PINs.

### Autel IM508/IM608 Menu Paths

**Primary path:**
```
IMMO → Hyundai → [Manual Selection] → [Region] → [Model] → [Year] → Smart Key/Mechanical Key
```

**Alternative (when IMMO shows "incapable"):**
```
Diagnostics → Smart Key Unit → Remote Control Learning → Smart Key Learning
```

**Smart Key Add Procedure (2019+ Santa Fe example):**
1. Connect OBD2, select IMMO → Hyundai → SantaFe(TM) → 2019+ → Smart Key
2. Navigate: Control Unit → Keyless System → Remote Control Learning → Smart Key Learning
3. Turn ignition OFF, open/close driver door once
4. Within 5 seconds: Hold back of smart key against START button for 5 seconds until anti-theft lamp flashes
5. Repeat for additional keys, then exit programming mode

**ID47 Smart Key Add (All Keys Lost):**
1. Read PIN via "Read Immobilizer Password" function (erases ALL existing keys)
2. Program NEW key FIRST
3. Program ORIGINAL key LAST (programming stops after original added)
4. Test all keys

### All Keys Lost Procedures by Generation

| Generation | Method | PIN Requirement |
|------------|--------|-----------------|
| SMARTRA-2 (Pre-2007) | OBD with PIN | Calculate from VIN |
| SMARTRA-3 (2007-2018) | OBD with PIN | Read from ECU or obtain from NASTF/dealer |
| ID46 Blade Key | OBD—Autel reads PIN | 6-digit |
| ID47 Smart Key (2015+) | OBD | PIN read via diagnostic or dealer |
| ID4A Smart Key (2020+) | OBD | PIN readable by Xhorse/Autel |
| 2024+ New System | Limited aftermarket | Often dealer-only |

**EEPROM reading required** when PIN cannot be read via OBD. Use AVDI or Autel XP400 Pro. Supported ECUs: Kefico, Bosch EDC15/16/17, Delphi.

### Smart Key Pairing Procedure

1. Ignition OFF, Start/Stop button OFF
2. Select "Key Teaching" in diagnostic tool
3. Enter 6-digit PIN
4. MSL teaching starts automatically on some ECUs
5. Insert fob into Smart Key holder OR hold fob tip against Start/Stop button
6. Hold Start/Stop for 5 seconds with key in position
7. Repeat for additional keys

**Maximum keys:** 2-3 proximity keys per vehicle; 4-8 mechanical keys.

---

## Diagnostic tool capabilities comparison

### Autel IM508/IM608

| Function | Coverage |
|----------|----------|
| PIN Reading | ID46, ID47, ID4A via OBD |
| Add Key | All models with working key |
| AKL | Most 2007-2023 models |
| Smart Key | Full support with PIN |

No G-Scan adapter required for Hyundai.

### SmartPro (Advanced Diagnostics)

| License | Coverage |
|---------|----------|
| ADS2321 | 2018-2021 proximity, AKL |
| ADS2280 | 2015-2019 models |

Requires strong Wi-Fi. Token-based (~€20/token). Maximum 3 proximity keys.

### Xhorse VVDI Key Tool Plus

| Function | Coverage |
|----------|----------|
| PIN Reading | ID46, ID47, 8A transponders |
| Add Key | Via OBD after password reading |
| ID Modification | Alternative method for ID47 |

**Menu path:** Immo Programming → Asia → Hyundai → Select by Type → Key Programming

### AVDI/Abrites

| License | Function |
|---------|----------|
| HK011 | PIN reading and programming for ~100% of models |
| HK010 | ECU neutralization on bench |
| HK012 | VIN calibration |

Reads PIN from working key (HITAG 2/3, HITAG-AES, DST-AES, DST80). Supports ALL Hyundai/KIA 2001-2022+.

### GDS/KDS (Dealer Tool)
Full OEM coverage, all years. Key teaching via IMMO menu. Limp mode activation. Module neutralization.

---

## Critical warnings and compatibility issues

### 2019+ Security Gateway
Hyundai's Security Gateway does NOT require hardware bypass like FCA vehicles. Authorized tools (Autel IM608 Pro II, Xhorse VVDI, Abrites HK011) receive digital certificates for access. SGW authorization is typically an additional license ($50+).

### Anti-Theft Software Update (2011-2021 Kia Boyz Fix)
**Affected:** 2011-2021 mechanical key vehicles without factory immobilizer.
**Update:** Free software patch creates electronic "ignition kill"—car won't crank unless locked with remote fob.
**Identification:** "Immobilizer Installed" decal on window.
**Impact on locksmiths:** Patched vehicles may have communication issues or module mismatches.

### Chip Cloning Restrictions
- **Used smart keys CANNOT be programmed to another vehicle**—only virgin keys work
- ID47 keys can sometimes be cloned via ID modification (Xhorse method)
- ID46 fully clonable with VVDI Super Chip, Autel AT100

### US vs Export Frequency
- **US market:** 315 MHz (older) transitioning to 433 MHz (2015+)
- **Export:** 433 MHz
- Always verify FCC ID matches original before ordering

### Known Programming Failures
1. **Server overload** (Autel)—avoid peak times
2. **Dead communication** on 2022+ models—power-cycle tool or disconnect battery 10-15 seconds
3. **"Incapable" errors**—switch from IMMO to Diagnostics path
4. **PIN reading failure**—use alternative tool or NASTF/dealer
5. **Modules asleep**—lock/unlock car to wake CAN network before programming

### 2024+ Limitations
New style smart keys have limited aftermarket support. Many require dealer programming. Lonsdor and OBDSTAR G3 showing expanded 2024 coverage with recent updates.

---

## Conclusion

The transition from SMARTRA-2 to Security Gateway systems represents the most significant shift in Hyundai locksmith programming over the past two decades. **For 2007-2018 vehicles**, standard IMMO tools with PIN reading capability handle most scenarios. **2019+ models** require SGW-authorized tools—ensure your Autel, Xhorse, or Abrites subscription includes Hyundai Security Gateway access. The industry-wide shift to **HITAG-AES (ID4A) encryption on 2021+ models** demands current tool software updates, as older firmware cannot program these transponders.

Key selection starts with verifying FCC ID against original—part numbers beginning with **95440-** indicate smart keys while **95430-** denotes remote-only. Emergency blades have migrated from HYN14/HY22 profiles to the universal **KK12** keyway across most 2021+ models. For Genesis vehicles, **KIA9TE** remains the standard emergency profile across the entire luxury lineup.

The "Kia Boyz" software patches on 2011-2021 mechanical-key vehicles introduce an additional variable—these vehicles may exhibit communication anomalies or module sync issues post-update. Always verify whether the anti-theft decal is present before beginning diagnostics.