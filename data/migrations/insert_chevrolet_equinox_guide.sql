-- Chevrolet Equinox Master Guide (2010-2024)
-- Generated from comprehensive research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'chevrolet-equinox-2010-2024',
  'Chevrolet',
  'Equinox',
  2010,
  2024,
  '# Chevrolet Equinox 2010-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Chevrolet Equinox spans the 2nd generation (2010-2017) and 3rd generation (2018-2024, refreshed 2022). Key systems evolved from traditional transponder keys to proximity smart keys with PEPS. Push-button start was introduced in 2018 on LT and Premier trims, expanding to RS by 2020.

> **Pearl:** The 2018 redesign is your key transition point. Pre-2018 uses flip/remote head keys with 30-min PK3+ relearn. Post-2018 uses smart keys with HITAG AES - know which generation you''re working on before ordering parts.

---

## Transponder Chip Types by Generation

| Year Range | Generation | Chip Type | Protocol | Notes |
|------------|------------|-----------|----------|-------|
| 2010-2017 | 2nd Gen | Philips Crypto ID46 (PK3+) | Circle Plus | Traditional transponder; 30-min relearn |
| 2018-2024 | 3rd Gen | HITAG Pro (ID4A) / NCF29A1 | AES Encryption | PEPS smart key; advanced security |

**Transition Details:**
- 2018 marked full PEPS introduction in 3rd gen redesign
- Base LS models retained traditional keys through mid-2020s
- LT/Premier had push-button start from 2018; RS added 2020

---

## FCC IDs by Generation

### Remote Head / Flip Keys (2010-2017)
| Year Range | FCC ID | Buttons | OEM Part Number | Notes |
|------------|--------|---------|-----------------|-------|
| 2010-2017 | OHT01060512 | 3-5B | 13500221 (flip), 13529636 (RHK) | Lock/Unlock/Remote Start/Trunk |

### Smart Keys / Proximity (2018-2024)
| Year Range | FCC ID | Buttons | OEM Part Number | Notes |
|------------|--------|---------|-----------------|-------|
| 2018-2024 | HYQ4AS | 5B | 13522875 | PEPS standard |
| 2018-2024 | HYQ4AA | 4-5B | 13585728 | Alternate variant |

---

## Mechanical Key Information

**Key Blanks:**
| Generation | Key Blank | Ilco/Strattec PN | Security Type |
|------------|-----------|------------------|---------------|
| 2010-2017 | HU100 / B119 | B119-PT, 5924205, 5927933 | High-security, side-milled |
| 2018-2024 | HU100 | 7013237 | 8-10 cut, high-security |

**Lishi 2-in-1 Tools:**
- **Primary:** HU100 (8-cut or 10-cut variants)
- **Alternate:** B111 for warded locks on some 2010-2019 variants
- Anti-glare finish recommended for visibility

---

## Battery and Frequency

| Spec | Value |
|------|-------|
| **Battery** | CR2032 (3V lithium) |
| **Frequency** | 315 MHz (North America) |

> **Tip:** Replace CR2032 every 2-3 years or when range decreases. Low battery can trigger false theft alarms.

---

## Autel IM608 Programming

### Menu Path
Diagnostics → Immobilizer → GM → Equinox → [Year] → Key Learning/Add Key/AKL

**Note:** For 2018+, may require CAN FD adapter for full functionality.

### Add Key Procedure (With Working Key)

1. Connect IM608 to OBD-II port
2. Select GM → Equinox → [Year]
3. Read PIN/code if prompted
4. Insert working key, turn ignition ON
5. Select "Add Key" function
6. Insert new cut key
7. Follow on-screen prompts (10-30 min for older models)
8. Test start and remote functions
9. Verify security light extinguishes

### All Keys Lost (AKL) Procedure

**2010-2017 (PK3+ 30-Minute Relearn):**
1. Insert new programmed transponder key
2. Turn ignition to ON (not start)
3. **Cycle 1:** Wait 10 minutes until security light turns OFF
4. Turn ignition OFF, then immediately back to ON
5. **Cycle 2:** Wait 10 minutes until security light turns OFF
6. Turn ignition OFF, then immediately back to ON
7. **Cycle 3:** Wait 10 minutes until security light turns OFF
8. Turn ignition OFF
9. Attempt to start vehicle - should now recognize new key

**2018-2024 (Tool Required):**
1. Connect IM608 with CAN FD adapter
2. Navigate to AKL function
3. May require EEPROM read/write if PIN unavailable
4. For secure ECM: May need bench BCM programming
5. Follow tool prompts for chip detection and sync
6. Test all functions

> **⚠️ Warning:** 2018+ AKL may require bench work or third-party data services if OBD access fails due to enhanced security.

---

## On-Board Programming (OBP) for Remotes

OBP works for **remotes only** - transponders require tools or relearn.

### 2010-2017 Procedure (via DIC or Ignition):
1. Insert working key and turn ignition to ON
2. Press DIC info button, scroll to "Relearn Remote Key"
3. Hold LOCK + UNLOCK on new fob simultaneously
4. Listen for door lock chime confirming sync
5. Repeat for additional remotes
6. Turn ignition OFF to exit

### Alternate Method (Two-Key):
1. Use two existing keys to cycle ignition
2. After cycles, insert new key to add

### 2018+ Key Fob Sync:
1. Hold LOCK + UNLOCK buttons until doors cycle
2. For PEPS: Place fob in center console pocket during sync
3. Professional tools recommended for full functionality

---

## Troubleshooting

| Issue | DTC Code | Solution |
|-------|----------|----------|
| "Service Theft Deterrent System" | - | Disconnect battery 10-15 min; or key cycle ON/OFF (30 min total) |
| Invalid Key | B2960 | Reprogram key; verify chip type |
| Lost BCM/ECM Communication | U0100 | Check wiring/reset battery; scan for module faults |
| Theft Deterrent Fuel Signal | P1626 | Perform VTD relearn via tool |
| Intermittent No-Start | - | Replace CR2032; check fob range and signal strength |

**BCM Replacement Requirements:**
- Use IM608 or dealer MDI to reflash and sync VTD
- Follow GM SI procedures for module pairing

---

## Quick Reference Card

| Item | 2010-2017 | 2018-2024 |
|------|-----------|-----------|
| **Chip** | ID46 (PK3+) | HITAG Pro (ID4A) |
| **Key Blank** | HU100/B119 | HU100 |
| **Lishi** | HU100 | HU100 |
| **FCC ID** | OHT01060512 | HYQ4AS/HYQ4AA |
| **AKL Method** | 30-min relearn | Tool required |
| **OBP Remote** | ✅ Yes (DIC) | ⚠️ Limited |
| **Frequency** | 315 MHz | 315 MHz |
| **Battery** | CR2032 | CR2032 |

---

## Tool Coverage

| Tool | 2010-2017 Coverage | 2018-2024 Coverage |
|------|---------------------|---------------------|
| Autel IM608 | ✅ Full (AKL/Relearn) | ✅ Full (PEPS/EEPROM) |
| VVDI Key Tool Max | ✅ Cloning/Generation | ✅ Remote/Smart Key |
| Smart Pro | ✅ Immobilizer | ✅ Proximity |
| Tech2/MDI | ✅ Dealer Flashes | Limited post-2017 |

---

## Sources

- GM TSBs (VTD relearn procedures)
- equinoxforum.net (community troubleshooting)
- carandtruckremotes.com (FCC IDs and OEM parts)
- key4.com (chip specifications)
- uhs-hardware.com (key blanks)
- obdii365.com (Autel training)
- YouTube locksmith tutorials
',
  '{"sources": ["cardone.com", "obdii365.com", "carandtruckremotes.com", "uhs-hardware.com", "chevyequinoxforum.com", "keylessentryremotefob.com", "nhtsa.gov", "carbuzz.com", "pridechevy.com"], "generated": "2024-12-27", "method": "web_research"}'
);
