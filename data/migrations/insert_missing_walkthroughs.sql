-- All Keys Lost Guides for Missing Vehicles
-- This migration adds 11 new guides discovered during gap analysis.

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content)
VALUES 
('jeep-gladiator-2020-2024', 'Jeep', 'Gladiator', 2020, 2024, 
'# Jeep Gladiator 2020-2024 AKL Programming Guide

## Overview
This guide covers All Keys Lost (AKL) procedures for the Jeep Gladiator (2020-2024). These vehicles use a **Security Gateway Module (SGM)** and a locked **RFHub**.

---

## Required Equipment
| Item | Notes |
|------|-------|
| **Autel IM608 Pro / IM508** | Preferred for RFHub unlocking |
| **FCA 12+8 Bypass Cable** | Required to bypass the SGM |
| **G-Box2 / G-Box3** | Optional but helpful for some tools |
| **New Smart Key** | FCC ID: `GQ4-71T` (4-button) or `OHT-4882056` |

---

## AKL Procedure
1. **SGM Bypass:** Connect the **FCA 12+8 Cable** to the Security Gateway Module (located above the OBD-II port or behind the radio).
2. **Ignition:** Turn the hazards ON to wake the BCM.
3. **Select Vehicle:** Jeep -> Gladiator -> 2020-2024 -> Smart Key.
4. **Read PIN:** Use the "Read PIN" function. This requires an internet connection for FCA servers.
5. **Unlock RFHub:** If the RFHub is locked, you must perform the "RFHub Reset" or "Unlock RFHub" procedure first. Some tools require a specific sequence of cycling the ignition.
6. **Key Learning:** Select "Add Smart Key (AKL)". The tool will use the PIN code. 
7. **Programming:** Hold the new key next to the Start button when prompted. The vehicle will beep to confirm the key is registered.

---

> ⚠️ **Warning:** If the RFHub is locked and your tool cannot unlock it, you may need a factory-authorized service or a dealer login (NASTF) for some newer firmware versions.'),

('toyota-avalon-2007-2012', 'Toyota', 'Avalon', 2007, 2012,
'# Toyota Avalon 2007-2012 AKL Programming Guide

## Overview
Covers 3rd Generation Avalon with Push-Button Start. Uses Gen 1 Smart Key architecture.

---

## Key Specifications
| Feature | Details |
|---------|---------|
| **System** | Gen 1 Smart Key |
| **FCC ID** | `HYQ14AAB` |
| **Page 1** | **94** or **98** (verify original) |
| **Emergency Blade** | TR47/TOY40 (8-cut) |

---

## Required Equipment
- **Autel IM608 / IM508**
- **Autel APB112 Simulator** (Recommended)
- Correct transponder key (FCC: HYQ14AAB)

---

## AKL Procedure (Simulator)
1. **Backup IMMO:** Connect tool to OBD and select Toyota -> Avalon -> 2007-2012 -> Smart Key.
2. **Back Up EEPROM:** Select "Backup IMMO Data".
3. **Generate Simulator:** Plug in the **APB112** and select "Generate Simulator Key" using the backup file.
4. **Waking the Car:** Touch the APB112 to the Start button. The dash should light up.
5. **Add Key:** Once the vehicle is "awake", selection "Add Key" and follow prompts to learn the new fob.

---

> 💡 **Tip:** If you don''t have a simulator, you can perform a **16-minute reset**. Connect a battery maintainer, as the ignition must stay ON for the full duration.'),

('toyota-avalon-2013-2018', 'Toyota', 'Avalon', 2013, 2018,
'# Toyota Avalon 2013-2018 AKL Programming Guide

## Overview
Covers 4th Generation Avalon with updated Smart Key system.

---

## Key Specifications
| Feature | Details |
|---------|---------|
| **System** | Gen 2 Smart Key |
| **FCC ID** | `HYQ14FBA` (2013-2015) or `HYQ14FBE` (2016-2018) |
| **Chip Type** | 8A (H-Chip) |

---

## AKL Procedure
1. **Backup:** Select Toyota -> Avalon -> 2013-2018. Backup IMMO Data.
2. **Emergency Key:** Create an emergency key using **APB112** or **Lonsdor Emulator**.
3. **Register:** Use the emergency key to turn the ignition ON.
4. **Add Smart Key:** Follow tool prompts. You must touch the new smart key to the Start button within 30 seconds of the beep.

---

> ⚠️ **Important:** 2017-2018 models may have a newer Smart Box that requires a more advanced backup or a rolling code bypass through some newer tool updates.'),

('toyota-matrix-2009-2013', 'Toyota', 'Matrix', 2009, 2013,
'# Toyota Matrix 2009-2013 AKL Programming Guide

## Overview
Standard bladed key system. Shares architecture with the Toyota Corolla of the same era.

---

## Key Specifications
| Year | Chip | Identification |
|------|------|----------------|
| 2009-2010 | **4D-67** | Dot on blade |
| 2010.5-2013 | **G-Chip** | "G" on blade |

---

## AKL Procedure
1. **Mechanical Key:** Cut a new key by VIN or Lishi TOY43.
2. **Connection:** Plug tool into OBD-II.
3. **Immobilizer Reset:** Select "All Keys Lost" or "Reset Immobilizer".
4. **Security Wait:** This vehicle requires a **16-minute security wait**. The ignition must be in the ON position.
5. **Learning:** After the 16 minutes, the security light will stop flashing or change status. Insert the new key to finalize registration.

---

## Remote Programming (Manual)
1. Open driver''s door, insert/remove key twice.
2. Close/open door twice.
3. Insert/remove key once.
4. Close/open door twice.
5. Insert key, close door, cycle ignition ON/OFF, remove key.
6. Press Lock+Unlock for 1.5s, then Lock for 1s on the remote.'),

('toyota-mirai-2016-2020', 'Toyota', 'Mirai', 2016, 2020,
'# Toyota Mirai 2016-2020 AKL Programming Guide

## Overview
The hydrogen-powered Mirai uses a high-security Smart Key system similar to the Lexus GS/RX.

---

## Required Equipment
- **Autel IM608 / IM508**
- **G-Box2 / G-Box3**
- **APB112 Simulator**
- FCC ID: `HYQ14FBA`

---

## AKL Procedure
1. **Smart Box Access:** In some cases, you must access the Smart Box directly if the OBD reset is blocked.
2. **G-Box Connection:** Connect the G-Box to the vehicle''s OBD and the tool.
3. **Backup Data:** Perform a data backup to extract the security password.
4. **Simulator Key:** Generate a software-based emergency key.
5. **Programming:** Use the simulator key to wake the car and then select "Add Smart Key".

---

> ⚠️ **Caution:** Ensure the vehicle''s 12V battery is fully charged. Hydrogen systems have complex power management that can interfere if voltage is low.'),

('toyota-prius-2016-2022', 'Toyota', 'Prius', 2016, 2022,
'# Toyota Prius 2016-2022 AKL Programming Guide

## Overview
Covers the 4th Generation Prius. Newer models (2019+) use the **8A-AA** or **8A-BA** platform.

---

## Requirements
| Model Year | Platform | Cable Required |
|------------|----------|----------------|
| 2016-2018 | 8A Smart | Standard OBD |
| 2019-2022 | 8A-AA / BA | **8A AKL Cable** |

---

## AKL Procedure (Newer Models)
1. **Harness Connection:** Use the **Toyota 8A AKL Cable** to bridge the Smart ECU and the tool.
2. **Password Calculation:** The tool will calculate the security password via server (internet required).
3. **Key Generation:** Generate an emergency key or a simulator key.
4. **Key Addition:** Use the generated key to register the new smart fob.

---

> 💡 **Tip:** Replacing the smart box is NOT required if you use the correct bypass cables and newest tool software.'),

('toyota-sequoia-2008-2019', 'Toyota', 'Sequoia', 2008, 2019,
'# Toyota Sequoia 2008-2019 AKL Programming Guide

## Overview
Covers both bladed and smart key systems for this large SUV.

---

## Key Specifications
| Ignition Type | Years | Chip Type |
|---------------|-------|-----------|
| **Bladed** | 2008-2010 | 4D-67 |
| **Bladed** | 2011-2017 | G-Chip |
| **Bladed** | 2018-2019 | H-Chip |
| **Smart Key** | 2008-2019 | 8A Smart |

---

## AKL Procedure (Bladed)
1. **Cut Key:** Cut TOY43 blade.
2. **OBD Reset:** Standard **16-minute** immobilizer reset via OBD-II.
3. **Registration:** Cycle new master key(s) after the wait period to finalize.

---

## AKL Procedure (Smart Key)
1. Use **APB112 Simulator** to backup and generate an emergency key.
2. Follow standard Toyota "Add Key" procedure once vehicle is awake.

---

> 💡 **Manual Remote Sync:** Most bladed models support the "Chicken Dance" manual programming method for the remote lock/unlock functions.'),

('toyota-tundra-2008-2018', 'Toyota', 'Tundra', 2008, 2018,
'# Toyota Tundra 2008-2018 AKL Programming Guide

## Overview
Primarily uses a bladed key system. Shares the 16-minute reset architecture of the Sequoia/Sienna.

---

## Key Identification (Blade Stamps)
| Stamp | Chip Type | Year Range |
|-------|-----------|------------|
| **Dot** | 4D-67 | 2007-2009 |
| **G** | G-Chip | 2010-2017 |
| **H** | H-Chip | 2018+ |

---

## AKL Procedure
1. **Mechanical:** Cut new key to code.
2. **Reset:** Select "Reset Immobilizer" in the tool menu.
3. **The Wait:** Wait **16 minutes** with ignition ON. Do not turn off the tool or key.
4. **Finish:** When the timer ends, the security light will stop its regular blink pattern. Cycle the key to register.

---

> ⚠️ **Note:** Some 2018 models might require the **8A H-Chip AKL Cable** if the tool cannot reset the immobilizer via standard OBD.'),

('toyota-venza-2009-2015', 'Toyota', 'Venza', 2009, 2015,
'# Toyota Venza 2009-2015 AKL Programming Guide

## Overview
Uses the 1st Generation Toyota Smart Key system, similar to the 2007+ Camry.

---

## Key Specifications
| Feature | Details |
|---------|---------|
| **FCC ID** | `HYQ14AAB` |
| **Page 1 Chip** | **98** |
| **Frequency** | 315 MHz |

---

## AKL Procedure
1. **Backup:** Backup the Smart Box EEPROM data via OBD.
2. **Simulator:** Generate an emergency key using **APB112**.
3. **Learning:** Wake car with simulator, then register new Smart Key via "Add Key" function.

---

> 💡 **Tip:** If the simulator function fails, the **16-minute reset** is the reliable fallback. Ensure a battery charger is connected.'),

('toyota-venza-2021-2024', 'Toyota', 'Venza', 2021, 2024,
'# Toyota Venza 2021-2024 AKL Programming Guide

## Overview
Newer 8A-BA platform with Security Gateway. Requires physical bypass.

---

## Required Equipment
- **Autel IM608 II / IM508S**
- **Toyota 30-pin Bypass Cable**
- **New Smart Key** (FCC: `HYQ14FBN`)

---

## AKL Procedure
1. **Direct Connection:** Access the Smart Key ECU (behind the glove box). Unplug the 30-pin harness and connect the bypass cable.
2. **Password Backup:** Read and backup security data via the bypass cable (no PIN needed).
3. **Emergency Key:** Create a simulator key from the backup file.
4. **Learning:** Use the simulator to wake the vehicle, then register the new smart key.

---

> ⚠️ **Warning:** The Smart Box is located in a tight spot behind the glove box. Be careful not to damage the plastic clips when removing trim panels.');
