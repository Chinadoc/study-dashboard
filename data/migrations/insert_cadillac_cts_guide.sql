-- Cadillac CTS Master Guide (2003-2019)
-- Generated from comprehensive research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'cadillac-cts-2003-2019',
  'Cadillac',
  'CTS',
  2003,
  2019,
  '# Cadillac CTS 2003-2019 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Cadillac CTS spans three generations with distinct key technologies from General Motors. Gen 1 (2003-2007) uses traditional PK3+ transponder keys, Gen 2 (2008-2013) integrates remotes with keyless entry, and Gen 3 (2014-2019) shifts to passive entry passive start (PEPS) smart keys. This guide covers all generations with their specific transponder chips, FCC IDs, and programming procedures.

> **Pearl:** Always cross-check year-specific details, as overlaps exist (e.g., some 2013 models mimic Gen 3 features). The 30-minute PK3+ relearn is your bread and butter for Gen 1/2.

---

## Transponder Chip Types by Generation

| Year Range | Generation | Chip Type | Protocol | Notes |
|------------|------------|-----------|----------|-------|
| 2003-2007 | Gen 1 | PK3+ (Megamos 48) | Passkey 3+ | Basic transponder; 30-min relearn common |
| 2008-2013 | Gen 2 | PK3+ (Megamos 48/ID46) | Passkey 3+ with RKE | Hybrid remote/transponder; optional push-start |
| 2014-2019 | Gen 3 | ID46/NCF29A (PEPS) | Global A PEPS | Proximity-focused; advanced encryption |

---

## FCC IDs by Year

### Remote Keyless Entry (RKE)
| Year Range | FCC ID | Buttons | OEM Part Number | Notes |
|------------|--------|---------|-----------------|-------|
| 2003-2007 | L2C0005T | 4B | 25695954 | Standard remote |
| 2008-2013 | OUC6000066 | 4B/5B | 20998255 | Trunk/memory options |
| 2008-2013 | M3N5WY7777A | 5B | 25943677 | Smart key variant |
| 2014-2019 | HYQ2AB | 4B/5B | 13580802 / 22984994 | PEPS with remote start |

---

## Mechanical Key Information

**Key Blanks by Generation:**
| Generation | Key Blank | Security Type |
|------------|-----------|---------------|
| Gen 1 (2003-2007) | B99/B102/B112 | 10-cut, sidebar laser |
| Gen 2 (2008-2013) | B106/B111 | Warded, high-security |
| Gen 3 (2014-2019) | HU100 | 8-10 cut, PEPS-compatible |

**Lishi 2-in-1 Tools:**
| Generation | Lishi Tool | Notes |
|------------|------------|-------|
| Gen 1 | GM39 / B102 | 10-cut sidebar |
| Gen 2 | B106/GM37 or B111 | Warded keyway |
| Gen 3 | HU100 | 10-cut, non-warded |

> **Pearl:** All CTS blades are high-security laser-cut with sidebar features. Use code-based cutting machines for precision duplication.

---

## Battery and Frequency

| Spec | Value |
|------|-------|
| **Battery** | CR2032 (3V lithium) |
| **Frequency** | 315 MHz (North America) |

---

## Autel IM608 Programming

### Menu Path
Diagnostics → Immobilizer → USA → Cadillac → CTS → Manual Selection → [Year/Engine] → Key Learning/Add Key/AKL

### Add Key Procedure (With Working Key)

1. Insert working key into ignition
2. Turn ignition to ON position
3. Connect Autel IM608 via OBD-II
4. Navigate to: Immobilizer → Cadillac → CTS → [Year]
5. Select "Add Key" function
6. Follow on-screen prompts to insert new key
7. For Gen 1/2: Complete 10-minute security cycle if prompted
8. Confirm new key is registered
9. Test new key - start engine, lock/unlock doors

### All Keys Lost (AKL) Procedure

**Gen 1/2 (PK3+ 30-Minute Relearn):**
1. Insert new programmed transponder key
2. Turn ignition to ON (not start)
3. **Cycle 1:** Wait 10 minutes until security light turns OFF
4. Turn ignition OFF, then back to ON
5. **Cycle 2:** Wait 10 minutes until security light turns OFF
6. Turn ignition OFF, then back to ON
7. **Cycle 3:** Wait 10 minutes until security light turns OFF
8. Turn ignition OFF
9. Attempt to start vehicle - should now recognize new key

**Gen 3 (PEPS - Requires Tool):**
1. Connect Autel IM608 via OBD-II
2. Navigate to AKL function
3. Tool will read BCM/EEPROM data
4. Follow prompts for key registration
5. May require Tech2/MDI for some vehicles
6. Clear DTCs after successful programming

> **⚠️ Warning:** Gen 3 PEPS vehicles often require dealer-level access for EEPROM reading. Have backup tools (Tech2/MDI) available.

---

## On-Board Programming (OBP) for Remotes

The CTS supports DIY remote programming via ignition cycles for most years.

### Gen 1/2 Procedure:
1. Close all doors, sit in driver''s seat
2. Insert key into ignition
3. Cycle ignition ON/OFF 5 times within 10 seconds
4. Press Driver Information Center (DIC) INFO button until "Relearn Remote" appears
5. Press and hold LOCK + UNLOCK on remote simultaneously
6. Listen for door lock chirp confirming programming
7. Repeat for additional remotes
8. Turn ignition OFF to exit programming mode

### Gen 3 Procedure:
1. Place smart key fob in center console pocket
2. If key cylinder present: cycle door lock 5 times using emergency blade
3. Follow DIC prompts for fob sync
4. Note: Transponder portion still requires OBD tool

---

## Troubleshooting

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| "Theft System Problem" | Desynced key/module | 10-minute wait with key ON for security light to extinguish |
| Security light stays on | BCM/ECM desync | Perform 3x10-min relearn cycles |
| No crank, no start | Key not recognized | Check for DTC U0100 (lost BCM comms); resync modules |
| Intermittent starting | Low fob battery | Replace CR2032, test signal strength |
| Key programs but won''t start | Wrong chip type | Verify Megamos 48 for Gen 1/2, ID46 for Gen 3 |
| Remote buttons don''t work | Not synced | Re-run OBP remote procedure |

> **Pearl:** Always replace CR2032 battery first - low battery mimics many fault conditions. A $3 battery can save hours of diagnostics.

---

## Quick Reference Card

| Item | Gen 1 (2003-2007) | Gen 2 (2008-2013) | Gen 3 (2014-2019) |
|------|-------------------|-------------------|-------------------|
| **Chip** | PK3+ (Megamos 48) | PK3+/ID46 | ID46/NCF29A |
| **Key Blank** | B99/B102/B112 | B106/B111 | HU100 |
| **Lishi** | GM39/B102 | B106/B111 | HU100 |
| **FCC ID** | L2C0005T | OUC6000066 / M3N5WY7777A | HYQ2AB |
| **AKL Method** | 30-min relearn | 30-min relearn | Tool required |
| **OBP Remote** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **Frequency** | 315 MHz | 315 MHz | 315 MHz |
| **Battery** | CR2032 | CR2032 | CR2032 |

---

## Tool Coverage

| Tool | Gen 1 | Gen 2 | Gen 3 AKL |
|------|-------|-------|-----------|
| Autel IM608 | ✅ Full | ✅ Full | ✅ Full |
| VVDI Key Tool | ✅ | ✅ | ⚠️ Limited |
| Smart Pro | ✅ | ✅ | ✅ |
| Tech2/MDI | ✅ | ✅ | ✅ (Required for some) |

---

## Sources

- key4.com - Transponder chip specifications
- carandtruckremotes.com - FCC IDs and OEM part numbers
- northcoastkeyless.com - Remote configurations
- locksmithkeyless.com - Key blank references
- originallishi.com - Lishi tool compatibility
- YouTube - Autel IM608 programming tutorials
- GM TIS2Web - OEM TSBs and relearn procedures
- cadillacforums.com - Community troubleshooting
',
  '{"sources": ["key4.com", "carandtruckremotes.com", "northcoastkeyless.com", "locksmithkeyless.com", "originallishi.com", "youtube.com", "cadillacforums.com", "southernlock.com", "amazon.com"], "generated": "2024-12-27", "method": "web_research"}'
);
