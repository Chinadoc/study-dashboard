-- Migration to integrate Mercedes-Benz Locksmith Guide
-- Based on Mercedes Locksmith Comprehensive Guide.rtf

-- 1. C-Class (W204) - The most common locksmith scenario
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, content) VALUES (
    'Mercedes',
    'C-Class',
    2008,
    2014,
    '# Mercedes C-Class (W204) Key Programming Guide

> ⚠️ **Critical Warning: ESL Fatal Error**
> The Electronic Steering Lock (ESL/ELV) is a guaranteed failure point on this chassis. If the key turns but no lights/crank, the ESL motor or NEC chip has likely failed.
> **Do NOT** simply replace the motor if the "Fatal Error" flag is set in the ESL EEPROM. You must replace the unit or install an emulator.

## Overview
The W204 C-Class utilizes the **DAS 3 (FBS3)** system with an NEC-based Electronic Ignition Switch (EIS/EZS). Unlike older models, the password cannot be read directly from the EIS dump; it must be calculated using a "brute force" attack via the IR interface.

| Feature | Specification |
| :--- | :--- |
| **System** | DAS 3 (FBS3) |
| **Transponder** | Integrated in Key PCB (NEC) |
| **Keyway** | HU64 (2-Track High Security) |
| **Frequency** | 315 MHz (US/Japan) or 433 MHz (EU/ROW) |
| **OBD Port** | Under driver dash |

## Required Equipment
*   **Programmer:** Autel IM608/IM508S + XP400 Pro OR Xhorse VVDI MB Tool.
*   **Adapter:** Autel G-Box 2/3 or Xhorse Power Adapter (Mandatory for fast calculation).
*   **Key:** BE Key (Aftermarket) or OEM BGA Key.
*   **Power:** 13.5V Battery Maintainer (Critical for bench work).

## Generation Breakdown
*   **2008-2014 (W204):** DAS 3. Programmable via Password Calculation.
*   **2015+ (W205):** **FBS4**. Dealer Key Only. NO public solution for All Keys Lost.

## Procedures

### Add Key (One Working Key)
1.  **Connect:** IM608 to OBDII. Select W204.
2.  **Read EIS:** Note SSID and Used Key Rails.
3.  **Calculate Password:**
    *   Insert working key into EIS (Tool reads hash).
    *   Insert working key into XP400 (Tool reads IR data).
    *   Insert working key back into EIS.
    *   Tool performs "Data Acquisition" (2-5 mins).
4.  **Result:** Tool displays 16-digit Password. **Save this!**
5.  **Generate Key File:** Select empty rail (e.g., Rail 3). Format V51 (Half Key).
6.  **Write Key:** Insert blank BE key into XP400. Write the generated `.bin` file via IR.

### All Keys Lost (AKL) - Bench Method (Preferred)
> 💡 **Pro Tip:** OBD calculation is risky and slow on W204 due to the Gateway. Remove the EIS for bench programming.

1.  **Remove EIS:** Use W204 Bezel Tool to unscrew ignition ring. Unplug connectors.
2.  **Connect:** Wire EIS to G-Box 3 using W204 Harness (DB15). Connect G-Box to Programmer + 12V.
3.  **Calculate Password:** Select "On Bench (G-Box)".
    *   Tool will rapid-cycle power (relays clicking) to glitch the processor.
    *   Time: 15-60 minutes.
4.  **Success:** Password extracted. Proceed to Generate and Write Key as above.
5.  **Sync:** Insert new key into vehicle EIS. Wait 5 seconds for "Hash" synchronization. ESL should unlock.

## Troubleshooting
*   **Key turns, no lights:** Dead ESL (90% chance). Check for code A25464. Install Emulator.
*   **Fan runs 100%:** ECU not authorized or lost sync.
*   **Password Calc Fails:** Check G-Box power connections. Ensure correct EIS processor type selected.

## Lishi Tool
*   **HU64:** 2-Track High Security. Pick direction is critical.
'
);

-- 2. E-Class (W212) / E-Coupe (W207)
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, content) VALUES (
    'Mercedes',
    'E-Class',
    2010,
    2014,
    '# Mercedes E-Class (W212) Key Programming Guide

> ⚠️ **Critical Warning: FBS4 Transition**
> Late 2013 and 2014 models may be **FBS4**. Always read the EIS first. If the tool says "FBS4" or fails to show a Hash List, STOP. You cannot program this key.

## Overview
The W212 E-Class shares the **DAS 3 (FBS3)** architecture with the W204. Early models use the same ESL which is prone to failure. Later models (2012/2013+) moved to an integrated servo in the steering column or purely electronic lock, reducing mechanical failures but complicating replacement.

| Feature | Specification |
| :--- | :--- |
| **System** | DAS 3 (FBS3) |
| **Transponder** | Integrated NEC |
| **Keyway** | HU64 |
| **Frequency** | 315 MHz (US) / 433 MHz (EU) |

## Required Equipment
*   **Programmer:** Autel IM608 + XP400 Pro / VVDI MB.
*   **Adapter:** G-Box 3 (Essential for AKL).

## Procedures

### All Keys Lost (Bench)
1.  **Remove EIS:** Required for fastest calculation.
2.  **Connect:** Use W212/W207 specific harness or universal DB15 cable to G-Box.
3.  **Calculate:** Select "All Keys Lost" > "On Bench".
4.  **Glitch:** Tool power-cycles EIS to extract password (10-40 mins).
5.  **Write:** Generate key file on free rail (3-8) and write to BE key.

### ESL Repair (W207/W212 Early)
If the ESL fails (Key turns, no dash):
1.  **Extract Password:** You MUST have the EIS password.
2.  **Remove ESL:** If locked, drill 10mm hole to retract bolt manually.
3.  **Program Emulator:**
    *   Connect Emulator to tool.
    *   Load EIS Data + Password.
    *   "Personalize" and "Activate".
4.  **Install:** Plug emulator into vehicle harness.

## Key Information
*   **Keyless Go:** Standard BE keys do NOT support Keyless Go (Proximity). You must use specialized "Keyless Go" BE keys or OEM keys for push-to-start functionality.
*   **Rail Management:** Never write to Rail 1 or 2 unless you are sure the customer has lost those keys. Overwriting a used rail kills the old key.

## Lishi Tool
*   **HU64**
'
);

-- 3. S-Class (W221) / ML/GL (W164) - Gateway Models
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, content) VALUES (
    'Mercedes',
    'S-Class',
    2007,
    2013,
    '# Mercedes S-Class (W221) Key Programming Guide

> ⚠️ **Critical Warning: Gateway Firewall**
> The Central Gateway (ZGW) on the W221/W164 blocks OBD "All Keys Lost" attacks. You CANNOT calculate AKL via the OBD port. You must use a Gateway Bypass adapter or remove the EIS.

## Overview
The flagship S-Class uses **DAS 3**. Unlike the C-Class, it does not use a mechanical ESL (steering lock); it uses an ISM (Intelligent Servo Module) on the transmission.

| Feature | Specification |
| :--- | :--- |
| **System** | DAS 3 (FBS3) |
| **Keyway** | HU64 |
| **Gateway** | **Active Firewall** (Blocks OBD AKL) |

## Procedures

### All Keys Lost (Gateway Bypass)
1.  **Locate CAN Block:** Driver side dash fuse panel or floor.
2.  **Connect Bypass:** Unplug the CAN connector leading to the EIS. Plug in the **W164/W221 Gateway Adapter**.
    *   This connects your tool directly to the EIS CAN-B/C bus.
3.  **Calculate:** Perform standard AKL calculation. It will be fast (10-20 mins) as you have a direct line.
4.  **Alternative:** Remove EIS and do it on the bench (more labor intensive).

### Module Virginizing (7G-Tronic / ISM)
Used modules are locked ("Personalized") to the donor car.
1.  **Read:** Read module on bench (Diagspeed/VVDI).
2.  **Renew:** Calculate "Erase Password" and execute "Renew".
3.  **Teach-in:** Install in new car and use scanner (Xentry/Autel) to authorize with the EIS.

## Key Information
*   **Infrared:** All communication is IR. Battery is only for remote buttons.
*   **Frequency:** Check original key. US W221 is almost always 315MHz.

## Lishi Tool
*   **HU64**
'
);

-- 4. Sprinter (W906)
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, content) VALUES (
    'Mercedes',
    'Sprinter',
    2007,
    2018,
    '# Mercedes Sprinter (W906) Key Programming Guide

## Overview
The workhorse of the fleet. Sprinters generally use **DAS 3** with an EZS similar to the Viano/Vito.

> ⚠️ **Warning:** Some 2019+ Sprinters (W907/W910) are **FBS4**. Always identify the system first!

## Procedures
1.  **Add Key:** Standard OBD procedure. Read EIS -> Calculate Password (insert key) -> Write New Key.
2.  **All Keys Lost:** Bench calculation recommended. Remove EIS (easy access under dash panels).
3.  **Key Type:** Often uses the "Blade Key" style with remote buttons, but fully compatible with the Chrome/Smart Keys if generated correctly.

## Lishi Tool
*   **HU64** (Most common) or **YM15** (Older/Dodge rebadged versions - check keyway).
'
);

-- 5. GLE / GLC / C-Class (W205) - FBS4 Warning
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, content) VALUES (
    'Mercedes',
    'GLC',
    2016,
    2022,
    '# Mercedes GLC (X253) Key Programming Guide

> ⛔ **CRITICAL: FBS4 SYSTEM**
> This vehicle is equipped with **FBS4 (Fahrberechtigungssystem 4)**.
> *   **NO** Public Password Calculation.
> *   **NO** Aftermarket Key Generation.
> *   **NO** All Keys Lost Solution (without dealer).

## Service Path
1.  **Dealer Key:** You must order a pre-programmed key from Mercedes-Benz via the TRP program (requires NASTF VSP).
2.  **Diagnosis:** You can read the EIS to verify it is FBS4, but you cannot write to it.
3.  **Repair:** ECU/TCU cloning requires specialized "tuning" shops with private exploits.

## Identification
*   Connect tool (Autel/VVDI).
*   Read EIS.
*   If "FBS4" is displayed or Hash List is empty/zeros -> **STOP**.
'
);

-- 6. Legacy Models (W203 Early / W210)
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, content) VALUES (
    'Mercedes',
    'C-Class',
    2001,
    2007,
    '# Mercedes C-Class (W203) Key Programming Guide

## Overview
Early W203s (and W210/W220) use older Motorola HC908/HC912 processors in the EIS.

> ⚠️ **Warning:** These do **NOT** support "Fast Password Calculation" via IR. You cannot glitch them with a G-Box.

## Procedures
### All Keys Lost (EEPROM Method)
1.  **Remove EIS:** Remove from dash.
2.  **Open EIS:** Disassemble casing to expose PCB.
3.  **Read MCU:**
    *   Identify Motorola chip (Mask 1L59W, etc.).
    *   **Solder** wires (VCC, GND, RESET, BKGD) to BDM points.
    *   Use **VVDI Prog**, **Orange5**, or **R270** to read EEPROM.
4.  **Get Password:** Load dump into key tool. Password usually shows directly (older encryption).
5.  **Write Key:** Generate key file and write to BE key.

## Lishi Tool
*   **HU64**
'
);
