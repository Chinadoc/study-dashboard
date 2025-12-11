-- Migration to integrate Nissan Locksmith Guide
-- Based on Nissan Locksmith Programming Guide.rtf

-- 1. Nissan Altima - Covers multiple generations
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, content) VALUES (
    'Nissan',
    'Altima',
    2007,
    2018,
    '# Nissan Altima Key Programming Guide

> ⚠️ **Critical Warning: 20-Digit Rolling Code**
> 2013+ Altimas use a **20-digit rolling code** system. The PIN changes every time the ignition cycles or BCM is re-queried. Calculation MUST be performed immediately with a stable connection.

## Overview
The Altima utilizes the **NATS 6 Intelligent Key** system. The BCM is the central gatekeeper—unlike Ford''s PATS, the key data is stored in the BCM, not the PCM.

| Feature | Specification |
| :--- | :--- |
| **System** | NATS 6 / Intelligent Key |
| **Transponder** | ID46 (PCF7936) 2007-2012, ID47 (HITAG 3) 2013-2018 |
| **Keyway** | NSN14 (10-cut, 4-track) |
| **Frequency** | 315 MHz (2007-2012), 433 MHz (2013+) |

## Required Equipment
*   **Programmer:** Autel IM608/IM508 OR SmartPro OR Lonsdor K518.
*   **Key:** ID46 Fob (2007-2012), ID47 Fob (2013+). **Virgin keys ONLY for ID47**.
*   **Tool:** Lishi NSN14 2-in-1.

## Generation Breakdown
*   **2007-2012 (ID46):** Standard 4-digit PIN from BCM label.
*   **2013-2018 (ID47):** **20-digit rolling code**. Requires server calculation. Autel handles this automatically.

## Procedures

### Add Key (2016 Altima - Push-to-Start)
1.  **Connect:** Autel/SmartPro to OBD-II.
2.  **Security Access:** Tool reads 20-digit Challenge from BCM.
    *   Autel: Auto-sends to server (requires internet).
    *   SmartPro: Consumes a token.
3.  **Program:**
    *   Touch Start Button with **first programmed key** (or blade near button).
    *   Press Start Button (Ignition ON).
    *   Touch **New Key** to Start Button.
    *   Watch for Security Light to **flash 5 times**.
4.  **Verify:** Test proximity lock/unlock and push-to-start.

### All Keys Lost (2007-2012)
1.  **Pick Door:** Use Lishi NSN14 on driver''s door. Decode position 3-10.
2.  **Cut Blade:** Calculate missing positions 1-2 via InstaCode or trial-and-error.
3.  **Read BCM:** Tool reads 5-digit BCM ID -> auto-calculates 4-digit PIN.
4.  **Program:** Insert key, turn ON. Flash sequence confirms success.

## Troubleshooting
*   **BCM Lock Mode:** Wrong PIN 3-5 times locks BCM. Disconnect battery 15-20 mins.
*   **Voltage Critical:** BCM is sensitive. Maintain 13.5V during programming.

## Lishi Tool
*   **NSN14:** Door lock has cuts 3-10; ignition has 1-10. Decode door, progress 1-2.
'
);

-- 2. Nissan Rogue
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, content) VALUES (
    'Nissan',
    'Rogue',
    2008,
    2020,
    '# Nissan Rogue Key Programming Guide

> ⚠️ **Critical Warning: ESCL Failure**
> The Electronic Steering Column Lock (ESCL) is a **major failure point** on Twist Knob Rogues (2008-2013). If the ignition knob won''t turn, the ESCL motor is likely jammed—NOT an immobilizer issue.

## Overview
The Rogue features the **Twist Knob Intelligent Key** system (2008-2013) and **Push-to-Start** (2014+).

| Feature | Specification |
| :--- | :--- |
| **System** | NATS 6 / Intelligent Key |
| **Transponder** | ID46 (2008-2013), ID47 (2014-2020) |
| **Keyway** | NSN14 |
| **Frequency** | 315 MHz (2008-2013), 433 MHz (2014+) |

## ESCL Troubleshooting
*   **Symptoms (Twist Knob):** Key won''t turn the plastic knob—feels physically locked.
*   **Symptoms (Push Start):** No crank/no start. Yellow "Key" light. Silence when pressing Start (normally a *zzzt-clunk* is audible).
*   **The Tap Test:** Vigorously strike the steering column with a rubber mallet while pressing Start. This can free stuck motor brushes.
*   **DTCs:** B2609 (Steering Lock Status), B2610 (Ignition Relay).
*   **Fix:** Install an **ESCL Emulator** ($20-$40). Plugs in and permanently mimics the "Unlocked" signal.

## Procedures

### All Keys Lost (2011 Rogue - Twist Knob)
1.  **Pick Door:** Lishi NSN14. Decode positions 3-10.
2.  **Cut Emergency Blade:** Progress missing cuts 1-2.
3.  **Access Ignition:** Insert blade into knob slot. Turn ON.
4.  **If Knob Won''t Turn:** ESCL is jammed. Perform Tap Test or emulate.
5.  **Connect Tool:** Autel IM608 to OBD-II.
6.  **Read BCM:** IMMO > Nissan > Intelligent Key > Read BCM Code. Tool calculates 4-digit PIN.
7.  **Program:**
    *   Insert key, turn ON with blade.
    *   Security Light flashes 5 times.
    *   OFF. Remove. Press UNLOCK on fob near antenna.
    *   Turn ON again. Flash sequence. Door cycle to exit.

## Lishi Tool
*   **NSN14**
'
);

-- 3. Nissan Sentra / Versa (2020+ with 22-Digit)
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, content) VALUES (
    'Nissan',
    'Sentra',
    2020,
    2025,
    '# Nissan Sentra (B18) Key Programming Guide

> ⛔ **CRITICAL: 22-Digit Pre-Safe System & Gateway Firewall**
> 2020+ Sentras require a **22-digit PIN calculation** (server-dependent) and have a **physical gateway firewall** that blocks standard OBD access.

## Overview
The B18 Sentra uses the **Modern Prox** system with **ID4A (HITAG-AES)** transponders and a **16+32 Gateway**.

| Feature | Specification |
| :--- | :--- |
| **System** | Modern Prox / Pre-Safe |
| **Transponder** | ID4A (HITAG-AES) |
| **Keyway** | NSN14 |
| **Frequency** | 433 MHz |
| **Gateway** | **16+32 Physical Bypass Required** |

## Gateway Bypass
Unlike Hyundai''s software-based SGW (AutoAuth), Nissan requires a **physical bypass**:
1.  **Locate Gateway Module:** Near BCM or glovebox. Remove trim panels.
2.  **Connect 16+32 Y-Cable:** Plug in-line to physically bridge and bypass the firewall logic.
3.  **Proceed:** Tool can now access BCM for PIN calculation.

## Procedures
1.  **Gateway Bypass:** Install 16+32 adapter.
2.  **Connect Tool:** Autel/SmartPro needs internet for 22-digit server calculation.
3.  **Read Challenge:** Tool sends to server.
4.  **Program Key:** Touch new ID4A key to Start Button. Watch for flash confirmation.

## Key Information
*   **Server Fee:** 22-digit calculations often incur a token/subscription cost.
*   **Virgin Keys Only:** ID4A keys are OTP; used keys cannot be reprogrammed.
*   **NASTF:** For official data releases on 2024+ models.

## Lishi Tool
*   **NSN14**
'
);

-- 4. Nissan Maxima
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, content) VALUES (
    'Nissan',
    'Maxima',
    2007,
    2020,
    '# Nissan Maxima Key Programming Guide

## Overview
The Maxima is a **Push-to-Start** flagship vehicle using the **NATS 6 Intelligent Key** system.

| Feature | Specification |
| :--- | :--- |
| **System** | NATS 6 / Intelligent Key |
| **Transponder** | ID46 (2007-2014), ID47 (2015-2020) |
| **Keyway** | NSN14 (Emergency Blade) |
| **Frequency** | 315 MHz (older), 433 MHz (newer) |

## Procedures
*   **Add Key:** Standard Push-to-Start procedure. Touch new key to Start Button after security access.
*   **AKL:** 20/22-digit rolling code. Server calculation required for 2015+.

## Lishi Tool
*   **NSN14**
'
);

-- 5. Nissan Frontier / Titan (Commercial/Truck)
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, content) VALUES (
    'Nissan',
    'Frontier',
    2005,
    2021,
    '# Nissan Frontier Key Programming Guide

## Overview
The Frontier retains older **NATS 5/6 architecture** with **TI 4D-60** chips for many years.

| Feature | Specification |
| :--- | :--- |
| **System** | NATS 5 (Legacy) / NATS 6 |
| **Transponder** | 4D-60 (40-bit, 2005-2018), ID46 Extended (2016+ Steel Key) |
| **Keyway** | NSN14 (Some older models: DA34) |
| **Frequency** | N/A (Chip Only) or 315 MHz |

## Chip Notes
*   **4D-60:** Robust, reusable. Note: Ford 4D-60 format differs—Nissan-format chips required.
*   **ID46 Extended:** Found on 2016+ Push-Start Titans/Frontiers.

## Procedures
*   **Legacy (4D-60):** Read BCM label code (5-digit) -> Calculate 4-digit PIN -> Program.
*   **Modern:** Standard ID46/ID47 procedure.

## Lishi Tool
*   **NSN14** or **DA34** (pre-2005 trucks).
'
);

-- 6. Nissan Pathfinder
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, content) VALUES (
    'Nissan',
    'Pathfinder',
    2013,
    2022,
    '# Nissan Pathfinder Key Programming Guide

## Overview
The Pathfinder uses **Push-to-Start** with **ID47 (HITAG 3)** transponders and the **20-digit rolling code** system.

| Feature | Specification |
| :--- | :--- |
| **System** | NATS 6 / Modern Prox |
| **Transponder** | ID47 (HITAG 3) |
| **Keyway** | NSN14 |
| **Frequency** | 433 MHz |

## Procedures
*   **Add Key / AKL:** 20-digit rolling code. Server calculation via Autel/SmartPro/Lonsdor.
*   **Virgin Keys Only:** ID47 is OTP. Used keys cannot be reprogrammed.

## Lishi Tool
*   **NSN14**
'
);
