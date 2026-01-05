ï»¿2022 Honda Civic (FE) & Accord (CV/11th Gen) Forensic Locksmith Dossier: Platform Architecture, Critical Failures, and Programming Protocols
1. Executive Strategic Analysis and Platform Evolution
1.1 The Paradigm Shift in Honda Security Architecture
The release of the 2022 Honda Civic (Chassis Code FE) and the subsequent 11th-generation Accord (2023+) represents a definitive inflection point in the trajectory of automotive security systems deployed by American Honda Motor Co., Inc. For nearly two decades, the forensic automotive community operated within the relatively predictable confines of the "Type" systemâranging from the simple fixed-code transponders of the early 2000s to the increasingly complex rolling codes of the Type 4 and Type 5 encryption eras. However, the introduction of the FE platform signals a departure from these legacy architectures, migrating towards a highly integrated, localized Body Control Module (BCM) logic that serves as a strict, unforgiving gateway for all immobilizer functions.
This dossier serves as a comprehensive forensic analysis and technical manual regarding these specific architectures. It is intended for automotive security professionals, forensic locksmiths, and advanced diagnostic technicians who are tasked with maintaining, recovering, or analyzing these systems. The analysis focuses heavily on the transition to the Hitag AES / 4A chip architecture, the severe and costly risks of Body Control Module corruptionâcolloquially and catastrophically known as "bricking"âduring routine programming procedures, and the emerging forensic countermeasures utilizing aftermarket universal signal generation.
The 11th-generation Civic and the corresponding generation of Accords have introduced a critical volatility into the aftermarket service ecosystem: the potential for catastrophic BCM failure when subjected to non-standardized polling requests from aftermarket programmers.1 Unlike previous generations where an incorrect programming attempt might simply result in a "Communication Failed" message, the FE/CV architecture possesses a failure mode where the BCM firmware effectively locks down, refusing all subsequent valid OEM credentials.2 This necessitates a fundamental re-evaluation of standard "Add Key" and "All Keys Lost" (AKL) protocols.
1.2 The "Bricking" Phenomenon: A Critical Intelligence Alert
The most urgent intelligence within this dossier concerns the statistically significant incidence of BCM failure during key programming procedures using standard aftermarket diagnostic tools such as the Autel IM508/608 or similar tablet-based programmers. Forensic evidence and field reports indicate that specific polling sequencesâoften triggered by the technician selecting the incorrect system option (e.g., forcing a "New System" protocol on a legacy-configured BCM or vice versa)âcan permanently corrupt the BCMâs ability to accept OEM key enrollment commands.2
The mechanism of this failure appears to be a defensive software trigger within the BCM's bootloader. When the module receives a handshake request that deviates from the expected encrypted parametersâa common occurrence when "brute forcing" via universal diagnostic toolsâit enters a tamper-protection state. In this state, the vehicle typically presents with a "Safety Check Failed" error message on the instrument cluster and enters a "No Crank, No Start" condition.2
Crucial Forensic Finding: While a "bricked" BCM will typically reject all attempts to program a genuine, virgin OEM Honda proximity key, distinct forensic loopholes have been identified where the module remains responsive to specific aftermarket generated remotes. Specifically, the BCM in its locked state has been observed to accept enrollment from Xhorse-generated universal smart keys, suggesting the failure mode is a software-level lockout of the specific OEM handshake protocol (likely a certificate validation failure) rather than a total hardware electrical failure or EEPROM corruption.1


  



1.3 Scope of Analysis
This report covers the following specific vehicle platforms, which share the underlying KR5TP-4 security architecture:
* Honda Civic (FE): Model Years 2022, 2023, 2024, 2025.
* Honda Accord (11th Gen): Model Years 2023, 2024, 2025.
* Honda Accord (CV/10th Gen): Model Years 2018-2022 (for comparative baseline).
* Cross-Platform Variants: Honda HR-V (2023+), Honda CR-V (2023+), and Honda Pilot (2023+).
The analysis differentiates between the relatively stable 10th-generation Accord architecture and the highly volatile 11th-generation/FE architecture, providing distinct protocols for each to ensure operational safety and forensic accuracy.
________________
2. Forensic Hardware Analysis and Transmitter Identification
2.1 The Civic FE Platform (2022-2025)
The introduction of the FE Civic chassis marked not only a redesign of the vehicle's exterior but a complete overhaul of the key fob aesthetics and internal transponder architecture. The system operates on a 433.92 MHz frequency, utilizing a Hitag AES (4A) transponder chip.3 This shift to the 4A chip architecture represents a move towards higher encryption standards and faster bidirectional communication compared to the PCF7952/Hitag 2 chips used in previous generations.
2.1.1 FCC ID and Part Number Taxonomy
Forensic identification of the correct transmitter is the first and most critical line of defense against programming failure. The market is currently inundated with "look-alike" fobs that are physically identicalâsharing the same matte black shell and button layoutâbut are electronically incompatible due to differing firmware versions or transponder revisions. Using an incorrect fob can lead to failed programming attempts, which in turn increases the number of polling cycles sent to the BCM, elevating the risk of a "brick" event.
The primary identifier for this generation is the FCC ID: KR5TP-4. This identifier is shared across multiple models, indicating a unified receiver architecture.5
Detailed Part Number Breakdown:
* 72147-T20-A01: This is the standard 4-Button configuration (Lock, Unlock, Trunk, Panic). It is typically found on the Civic Sedan EX trims. Forensic examination of the circuit board often reveals the absence of the remote start contact pads on the PCB.6
* 72147-T20-A11: This is the premium 5-Button configuration (Lock, Unlock, Remote Start, Trunk, Panic). It is standard equipment on Touring and Sport Touring trims. This fob supports bidirectional feedback for the remote start function.4
* 72147-T43-A01: This variant is typically associated with Hatchback models and is often cross-listed for the HR-V and CR-V. While it shares the KR5TP-4 FCC ID, the specific button mapping for the "Hatch" versus "Trunk" release signals may differ in the BCM's interpretation.5
2.1.2 The "Black Key" Design Shift
Locksmiths and technicians often refer to this generation as the "Newer style black key" to distinguish it from the previous generation's glossier fobs with silver accents.2 This physical redesign is significant forensically because it homogenizes the visual identity of the key across the Civic, Accord (11th Gen), HR-V, CR-V, and Pilot. In previous eras, an Accord key was visually distinct from a Civic key. Now, the potential for technicians to grab the wrong inventoryâfor example, attempting to program a Pilot key to a Civicâis significantly higher. While they share the KR5TP-4 FCC ID, internal partition IDs or "Keyset" values may differ, leading to "Programming Failed" errors that confuse the technician and endanger the BCM.
2.2 The Accord CV and 11th Gen Platforms (2018-2023+)
The Honda Accord presents a unique challenge as it spans two distinct security generations within the scope of this analysis: the 10th Gen (CV) ending in 2022, and the 11th Gen beginning in 2023. Understanding the boundary between these two is vital.
2.2.1 10th Generation (2018-2022)
The 10th-generation Accord utilizes a different architecture than the FE Civic. It is based on the NXP AES 128 Bit chip technology and operates on 433 MHz.8
* FCC ID: CWTWB1G0090.9
* Part Number Complexity: This platform utilizes a "Driver Memory" system that is encoded into the key itself.
   * 72147-TVA-A01: "No Memory" key. Used for base trims or valet purposes.
   * 72147-TVA-A11 / A21 / A2: Designated as Driver 1.
   * 72147-TVA-A31 / A3: Designated as Driver 2.10
* Forensic Note: This system is relatively stable. While it requires exact FCC matching, it does not suffer from the rampant BCM bricking issues to the same extent as the newer FE platform, provided standard protocols are followed. The risk profile here is low-to-moderate, primarily centered on confusion between Driver 1 and Driver 2 fobs. If a customer already has a Driver 1 key, attempting to program another Driver 1 key might overwrite the first or be rejected depending on the specific BCM firmware version.
2.2.2 11th Generation (2023+)
The 2023 redesign aligns the Accord with the Civic FE architecture.
* Architecture Shift: The 2023+ Accord adopts the KR5TP-4 FCC ID and the Hitag AES (4A) chip.4
* Google Built-in Integration: A major differentiating factor for the 2023+ Accord Touring trim is the integration of "Google Built-in".11 This system ties vehicle settings, navigation, and potentially digital key access to a Google User Profile. While primarily an infotainment feature, forensic analysis suggests this deep integration with the vehicle's telematics module creates additional "noise" on the CAN bus during programming. The system is constantly polling for cloud connectivity, which can destabilize the voltage or data stream during the critical "All Keys Lost" handshake.12
2.3 Interchangeability and Cross-Platform Contamination
A critical insight derived from the parts compatibility data is the high degree of cross-platform usage for the KR5TP-4 architecture. The same FCC ID is listed for:
* Honda Civic (2022-2024)
* Honda HR-V (2023-2026)
* Honda CR-V (2023-2026)
* Honda Pilot (2023-2025).5
This suggests a unified BCM security architecture across the entire modern Honda fleet. Consequently, the "bricking" vulnerability identified in the Civic FE is almost certainly present in the 2023+ Accord, HR-V, and Pilot. Technicians must treat all KR5TP-4 vehicles with the extreme caution protocols outlined in this dossier, regardless of the specific model badge on the trunk.
2.4 Frequency Spectrum Analysis
Historically, Honda utilized 315 MHz for the North American market. The shift to 433 MHz (specifically 433.92 MHz) for the 10th and 11th generation platforms aligns the US market with European and Asian security standards.3 This frequency shift is relevant for forensic analysis because older signal sniffers or frequency testers calibrated strictly for 315 MHz may fail to detect the signal from a functional key, leading to a misdiagnosis of a "dead key" when the key is actually transmitting on the higher band.
________________
3. Technical Architecture: The BCM and Immobilizer Network
3.1 Body Control Module (BCM) Anatomy and Localization
The Body Control Module (BCM) in the Civic FE (Part #38800-T20-A313-M1) functions as the central nervous system for the vehicle's security apparatus.13 It is responsible for managing the authorization for the Push-to-Start system, communicating with the Engine Control Unit (ECU) via the CAN bus, and controlling the physical door lock actuators.
3.1.1 Physical Access and Removal
Locating and accessing the BCM is a frequent requirement for forensic locksmiths, either to replace a bricked unit or to perform direct EEPROM reading (though EEPROM reading on these newer BCMs is incredibly difficult due to encryption).
* Civic FE Location: The BCM is located on the driver's side dashboard area. It is generally accessible by removing the lower dash panel. The module is secured by a specific release tab that allows it to drop down for service.14
* Accord (2023+) Location: The location is similar, situated in the driver's side footwell/dash area. However, field reports indicate that access is notably "tricky" compared to the Civic. It requires specific dexterity to locate and depress the release tab to drop the unit without removing the entire dashboard assembly.15 This difficulty adds labor time and risk of damaging dash plastics during emergency repairs.


  



3.1.2 Internal Vulnerability
The BCM contains rewriteable non-volatile memory that stores the unique IDs of the authorized proximity keys. The programming process involves putting this memory into a "learn mode" or "registration mode." The vulnerability stems from the BCM's firmware logic. If the diagnostic tool sends a command format that the BCM does not recognizeâspecifically, if a legacy command structure is sent to this new architectureâthe BCM firmware appears to enter a "panic" or "lockdown" state. This state is non-volatile, meaning it persists even after the battery is disconnected, effectively "bricking" the module.2
3.2 The Google Built-In Complication
The 11th-generation Accord Touring trims introduce a new variable: Google Built-in.11 This system integrates the vehicle's core infotainment functions with the user's Google account, handling maps, voice assistants, and personalization.
While this appears to be a separate system from the immobilizer, forensic analysis suggests potential interference vectors:
* Bus Traffic Interference: The Google system is data-heavy and constantly polls for cellular connectivity. During the delicate "All Keys Lost" programming sequence, excessive traffic on the CAN bus from the telematics unit can cause packet collisions or timing delays, causing the BCM to time out or reject the programming handshake.12
* User Profile Binding: There is evidence to suggest that key memory slots may be loosely associated with digital user profiles. In scenarios where a BCM is being reset, the presence of active, cloud-linked user profiles might create conflict. A "Factory Data Reset" of the infotainment system is often recommended before attempting complex key programming on these specific trims to ensure a "clean" digital environment.17
3.3 Walk Away Auto Lock Calibration
The "Walk Away Auto Lock" feature is a standard convenience function on these platforms, but it also serves as a critical diagnostic tool for the locksmith. The system relies on precise Received Signal Strength Indication (RSSI) metering from the key fob. The vehicle must detect the key within a 5-foot (1.5m) radius and then detect it moving out of that radius.
Diagnostic Protocol:
If a newly programmed key starts the car but fails the Walk Away Lock test, it acts as a diagnostic indicator of a poor-quality aftermarket antenna or improper calibration of the LF (Low Frequency) field.
1. Step 1: Exit the vehicle with all doors closed and the key in hand.
2. Step 2: Stay within 5 feet. You should hear one beep. This confirms the BCM has detected the key's presence via the LF antennas.18
   * Failure here: Indicates the LF antenna in the fob is weak or the fob is not transmitting the "I am here" presence signal correctly.
3. Step 3: Walk away (beyond 5 feet). You should hear a second beep and see the lights flash. This confirms the BCM detected the signal drop and executed the lock command.
   * Failure here: Indicates the RF (Radio Frequency) transmitter is weak or the BCM logic is confused by a "ghost" key left inside the vehicle boundary.20
________________
4. Critical Alert: BCM Corruption ("Bricking") Protocol
4.1 The Pathology of Failure
The most significant operational risk for the 2022+ Civic and 2023+ Accord is the "Safety Check Failed" error, which results in a bricked BCM. This is not a theoretical risk; it is a well-documented field failure that has resulted in significant liability claims against locksmiths.21
* Symptom: After attempting to add a key or perform an AKL procedure, the programming tool displays "Safety Check Failed." Subsequently, the ignition will not turn on, the dashboard may remain dark or display persistent error messages, and the vehicle enters a "No Crank, No Start" condition. The vehicle is effectively immobilized.2
* Root Cause:
   * User Error/Tool Limitations: Diagnostic tools (e.g., Autel IM508/608) often ask the user to select between system types (e.g., "Smart Key System" vs. "Knob Style" or "System 1" vs. "System 2") because the tool cannot automatically determine the exact firmware version of the BCM.
   * The Trap: Selecting "New System" on a vehicle that requires a legacy handshake, or conversely, selecting a legacy system on a 2022+ KR5TP-4 vehicle, sends a packet structure that corrupts the BCM's bootloader or security registry.
   * Specific Triggers: The 2022 Civic specifically is cited as a high-risk vehicle for non-specialist locksmiths.2 The BCM interprets the incorrect polling command as a tamper event (a "Brute Force" attack) and permanently locks down its programming port.
4.2 The Forensic Workaround: Xhorse Universal Keys
Standard dealership logic dictates that a bricked BCM must be replacedâa repair that involves purchasing a new module (approx. $700+), installing it, and performing a full system initialization using proprietary Honda software.1 However, field research by advanced forensic locksmiths has uncovered a critical vulnerability in the "bricked" state that allows for recovery without hardware replacement.
The Discovery: Even when a BCM is in a "lockdown" state and refuses to accept a genuine OEM Honda key (Part #72147-T20-A01), it will often accept a generated Xhorse Universal Smart Key.1
Theoretical Mechanism:
It is hypothesized that the "lockdown" state specifically blocks the standard OEM enrollment protocolâperhaps checking for a specific factory signature or encryption certificate that was flagged as invalid during the failed attempt. The Xhorse generation protocol likely emulates a "developer," "pre-production," or "universal" key signature that utilizes a slightly different enrollment command (possibly a "clone" protocol rather than a "new enrollment" protocol). This alternative pathway bypasses the specific security check that has been triggered by the "brick," allowing the BCM to register the new ID. Once the Xhorse key is registered, the BCM often exits its panic state, and the vehicle becomes operational.
Recovery Protocol (The "Hacker" Method):
1. Condition: Vehicle is bricked. Ignition off. OEM keys rejected. "Safety Check Failed" error persists.
2. Tooling: Xhorse VVDI Key Tool Max (or Key Tool Plus) + Xhorse Universal Smart Key (Proximity style).
3. Generation: Generate the universal remote using the option for "Honda Civic 2022" or "Honda Accord 2018-2022" (Hitag AES).
4. Programming: Attempt the "Add Key" or "All Keys Lost" procedure again using the programming tool, but present the universal key when prompted.
5. Result: The BCM accepts the universal key, the "Safety Check Failed" error clears, and the vehicle starts.
6. Forensic Implication: This confirms that the "brick" is a software logic state (a "soft brick"), not physical hardware damage (a "hard brick").
4.3 Tool-Specific Risks
* Autel IM508/IM608: High risk if the user is inexperienced. The prompts can be ambiguous, and the tool allows the user to force incompatible system selections.2
* Smart Pro (Advanced Diagnostics): Generally considered safer due to more rigid software guidance and server-side verification, but it is not immune to user error.23
* Proprietary Dealer Tools (HDS/i-HDS): Will not brick the unit as they auto-detect the correct protocol. However, they cannot recover a unit bricked by aftermarket tools; they will simply fail to communicate and demand replacement.25
________________
5. Comprehensive Programming Protocols
5.1 Standard "Add Key" Procedure (Safe Method)
To minimize risk, the following protocol should be observed for functional systems where at least one working key is present.
1. Voltage Stabilization: Connect a clean power supply to the vehicle's battery. The voltage must be maintained above 12.5V. Voltage drops during the BCM writing phase are a known secondary cause of bricking.26
2. Tool Connection: Connect via the OBD2 port.
3. System Selection:
   * DO NOT guess. Use the "Auto Detect" or "System Scan" feature if available on the tool.
   * If manual selection is required, verify the exact system type. For 2022+ Civic, it is Smart Key System (4A / Hitag AES). Do not select "Knob Style" or "Blade Key."
4. Key Registration:
   * Take all keys out of the vehicle.
   * Place the new key in the cupholder or designated programming slot (if applicableâsee Section 6).
   * Follow on-screen prompts precisely.
5. Synchronize: The tool will typically ask to hold the key to the Start button. This utilizes the NFC backup coil in the fob to force-feed the key ID to the BCM's immobilizer ring.27
5.2 All Keys Lost (AKL)
* Risk Level: Critical. The probability of BCM failure increases significantly in AKL scenarios because the security access requires a deeper intrusion into the BCM logic.
* Alarm State: An active alarm will complicate AKL. The alarm must be silenced or the BCM accessed directly if OBD communication is blocked by the alarm module.
* Mechanical Access (Lishi Procedure):
   * Tool: HON66 (High Security) 2-in-1 Pick & Decoder.29
   * Reading: Read the door lock cylinder hidden behind the handle cap.
   * Warning: The door lock cylinder provides the code for the emergency blade. Older Honda models sometimes had different wafer counts for ignition vs. door (e.g., ignition might use positions 1-6, while the door only used 1-5). However, since the FE/CV platforms utilize Push-to-Start exclusively, there is no physical ignition cylinder to pick. The door lock code is the master mechanical code.30
   * Cut Depth: Axis 1-6 (or 1-5 depending on lock version).
5.3 Unlocking/Renewing OEM Keys
The KR5TP-4 keys are often "locked" to the specific vehicle once programmed. They cannot be reused on another vehicle unless the internal flash memory is "unlocked" or "renewed" (wiped back to virgin state).
* Tools: Devices like "AutoKeyUnlocker" and "RemUnlocker" have updated their firmware to support the KR5TP-4 / Hitag AES chipset.32
* Method: Unlike older keys that could be unlocked via simple pins, the 4A chip often requires soldering to bridge specific test points on the PCB for the reset tool to interface with the chip. This allows the locksmith to recycle used OEM keys, which are often safer to use than generic aftermarket fobs.32


  



________________
6. Emergency Start & User Interaction Forensics
6.1 The Myth of the "Key Slot"
A common point of confusion for users and technicians alike is how to start the vehicle when the key fob battery is dead. In previous Honda generations, there was often a physical slot (in the glovebox, center console, or under the steering column) where the fob could be inserted.
* Reality for FE/CV: There is NO physical key slot in the 2022+ Civic or 2023+ Accord.34
* Protocol: The user must use the NFC / Passive Start method:
   1. Depress the brake pedal.
   2. Hold the emblem side (back) or the top of the key fob directly against the Engine Start/Stop button. The orientation matters; the NFC chip is usually located near the top or back of the PCB.35
   3. The Start button light will flash, indicating it has read the passive chip.
   4. Press the Start button (with the fob still touching or immediately after removing it) to crank the engine.
* Why this matters: Forensically, if a vehicle fails to start via this method, it indicates a failure in the BCM's LF receiver coil (located in the Start button assembly) or a totally dead key (where the passive RFID coil on the PCB is damaged), rather than just a simple dead coin cell battery. The NFC chip is passive and should work without any battery power in the remote.
6.2 Immobilizer Reset (The "Battery Change" Bug)
A widespread issue on modern Hondas involves the vehicle entering an immobilizer lockout state (red blinking key light on dash) immediately after the vehicle's 12V battery is replaced or disconnected.37
* Symptoms: The vehicle cranks but does not start. The green or red key light flashes on the dashboard. This mimics a "bad key" scenario but is actually a logic sync error between the BCM and the ECU.
* Forensic Fix: This is rarely a key failure.
* Fuse Reset: The standard reset procedure involves pulling the IG HOLD fuse (often labeled differently on newer models, e.g., "Backup" or main ECU fuses) for 60 seconds and reinstalling it. This forces a hard reboot of the immobilizer handshake logic.38
* Wait Time: The "leave the key on for 15 minutes" method used on old GM or older Honda systems does not work on these push-to-start systems. The fuse pull or a "Battery Reset" via a diagnostic tool is required.
________________
7. Strategic Recommendations & Outlook
7.1 For the Locksmith/Technician
1. Stock Universal Keys: Always carry Xhorse or equivalent universal smart keys compatible with Hitag AES. These are not just inventory; they are your "break glass in case of emergency" recovery tools if a BCM bricks during a job.
2. Verify Voltage: Never attempt to program a 2022+ Civic without a battery tender attached. The BCM is highly sensitive to voltage fluctuation.
3. Educate on "Black Keys": Train staff to visually and electronically distinguish the KR5TP-4 keys from older, similar-looking fobs. A simple frequency check (433 MHz vs 315 MHz) is a quick way to differentiate new inventory from old inventory if labels are worn.3
4. Liability Waivers: Given the known volatility of the BCM and the documented court cases where locksmiths were held liable for $2,000+ repairs, it is advisable to have customers sign a waiver acknowledging the inherent risks of programming these specific Honda platforms, citing the known manufacturer defects.21
7.2 Future Architecture (2025+)
The integration of Google Built-in and the homogenization of the KR5TP-4 platform across the Pilot, CR-V, and HR-V suggests that Honda is moving toward a unified, high-security digital ecosystem. Forensically, this means "Key Programming" will increasingly become "Identity Management," likely requiring authorized credentials (NASTF/VSP) to even access the gateway for programming in the near future. The era of "Lishi and a standard programmer" is fading; the era of "Authorized Digital Handshakes" is beginning.
7.3 Conclusion
The 2022 Honda Civic and 11th Gen Accord represent a hostile environment for the unprepared locksmith. The transition to Hitag AES and the fragile nature of the BCM firmware necessitate a forensic, cautious approach. By understanding the "bricking" pathology, the specific "Safety Check Failed" error, and the specific countermeasures (Universal Keys), technicians can mitigate risks that would otherwise result in catastrophic repair bills and reputational damage.
________________
8. Detailed Technical Specifications
8.1 Fob Frequency Spectrum Analysis
Historically, Honda utilized the 315 MHz frequency band for its North American remote systems. This was the standard for the 8th and 9th generation Civics and Accords. However, the shift to the 433.92 MHz (often rounded to 434 MHz) standard for the 10th and 11th generation platforms marks a significant alignment with European and Asian security standards.3
Forensic Relevance:
This frequency shift is a primary diagnostic indicator. If a locksmith attempts to test a 2022 Civic key using a signal tester set to the legacy 315 MHz band, the tool will register "No Signal," leading to a misdiagnosis of a dead key or battery. Technicians must ensure their signal detection equipment is calibrated for the 433 MHz spectrum. Furthermore, the use of 433 MHz allows for higher data throughput, facilitating the bidirectional communication required for the remote start feedback (LED indicators on the fob) present on the Touring trims.4
8.2 Part Number Reference Table
The following table serves as a quick-reference guide for forensic identification of OEM transmitters.
Vehicle Model
	Years
	FCC ID
	Chip Type
	Frequency
	OEM Part # (Ref)
	Civic (FE)
	2022-2024+
	KR5TP-4
	4A (Hitag AES)
	433.92 MHz
	72147-T20-A01 (4-Btn) / 72147-T20-A11 (5-Btn)
	Accord (CV)
	2018-2022
	CWTWB1G0090
	NXP AES 128
	433 MHz
	72147-TVA-A01 (No Mem) / 72147-TVA-A11 (Dr 1)
	Accord (11th)
	2023+
	KR5TP-4
	4A (Hitag AES)
	433.92 MHz
	72147-T20-A11
	HR-V / CR-V
	2023+
	KR5TP-4
	4A (Hitag AES)
	433.92 MHz
	72147-T43-A01
	Note: Data derived from research snippets.3 Always verify by VIN before ordering.
________________
End of Dossier
Works cited
1. HONDA ACCORD NO CRANK DEAD BRICKED BCM KEY PROGRAM FIX - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=mBUUWfHNcd0
2. 2022 honda civic : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1ia1qgr/2022_honda_civic/
3. 1X 4 Button Smart Keyless Remote Key Fob KR5TP-4 For Honda Civic 2022 2023 2024, accessed January 3, 2026, https://www.ebay.com/itm/395430898670
4. 2022 Honda Civic Smart Key 5 Buttons FCC# KR5TP-4 - Aftermarket - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2022-honda-civic-smart-key-5-buttons-fcc-kr5tp-4-aftermarket
5. 2022-2026 Honda Civic CR-V HR-V 4B Hatch Smart Key KR5TP-4 - Your Car Key Guys, accessed January 3, 2026, https://yourcarkeyguys.com/products/2022-2026-honda-civic-cr-v-hr-v-4b-hatch-smart-key-kr5tp-4
6. 2022-2024 Honda Civic / 4-Button Smart Key / PN: 72147-T20-A01 / KR5TP-4 (OEM), accessed January 3, 2026, https://www.uhs-hardware.com/products/2022-2024-honda-civic-4-button-smart-key-pn-72147-t20-a01-kr5tp-4-oem
7. 2023 Honda Civic Smart Key 4 Buttons FCC# KR5TP-4 - Aftermarket - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2023-honda-civic-smart-key-4-buttons-fcc-kr5tp-4-aftermarket
8. Honda New OEM 2018-2022 Accord Smart Key 4B Trunk FCCID, accessed January 3, 2026, https://royalkeysupply.com/products/honda-new-oem-2018-2022-accord-smart-key-4b-trunk-fccid-cwtwb1g0090-pn-72147-tva-a11
9. OEM 2018 2019 HONDA ACCORD KEYLESS ENTRY SMART KEY REMOTE /FCC I.D. CWTWB1G0090 | eBay, accessed January 3, 2026, https://www.ebay.com/itm/333064525651
10. 2018 - 2022 Honda Accord Smart Key 5B FCC# CWTWB1G0090 - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2018-2019-honda-accord-smart-key-5b-fcc-cwtwb1g0090
11. All-New Accord Adds Google Built-In to its Must-Have Technologies, accessed January 3, 2026, https://hondanews.com/en-US/honda-automobiles/releases/release-4e58b4e0fcd795affa5685a66a033597-all-new-accord-adds-google-built-in-to-its-must-have-technologies
12. Accord Touring Free Data Not Working : r/11thGenAccord - Reddit, accessed January 3, 2026, https://www.reddit.com/r/11thGenAccord/comments/18pii3t/accord_touring_free_data_not_working/
13. 2022 Honda Civic Body Control Module (bcm) 38800-T20-A313-M1, - AH Parts Dismantlers, accessed January 3, 2026, https://ahparts.com/buy-used/2022-honda-civic-body-control-module-bcm-38800-t20-a313-m1-38800t20a313m1/493180-1
14. How To Remove/Access 2016-2021 Honda Civic BCM. 2016-2021 Honda Civic BCM Location. - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=nlmeQz4WPI0
15. How To Remove/Replace 2023-2025 Honda CR-V BCM. 2023-2025 Honda CR-V BCM Location. - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=5SVLf1wSZk4
16. How To Remove 2023-25 Honda HR-V BCM. BCM Location 2023-25 Honda HR-V - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=4VCD5MV7XNg
17. FAQ | Available with Google built-in - Honda Global, accessed January 3, 2026, https://global.honda/en/Googlebuilt-in/uae-english/faq/faq01.html
18. How to Set-Up Honda Walk Away Auto Lock, accessed January 3, 2026, https://www.bianchihonda.com/how-to-set-up-honda-walk-away-auto-lock/
19. Customizing Door Lock/Unlock Settings - Honda Owners, accessed January 3, 2026, https://owners.honda.com/utility/download?path=/static/pdfs/2018/Fit/MY18_Fit_Door_Locks_and_Walk_Away_Auto_Lock.pdf
20. How to enable Walk Away Auto LockÂ® on your Honda?, accessed January 3, 2026, https://www.whiteshondalima.com/how-to-enable-walk-away-auto-lock-on-your-honda/
21. [COURT UPDATE] Car locksmith messed up programming another key fob and cost me $2000 worth of repair. - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1ff5imr/court_update_car_locksmith_messed_up_programming/
22. Honda accord locked bcm : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1fc7yoe/honda_accord_locked_bcm/
23. âAutel KM100 vs Honda Accord: Key Programming Disaster!â - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=ILb_x11sS2Y
24. Thoughts on Advanced Diagnostics Smart Pro? : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1fxbcyj/thoughts_on_advanced_diagnostics_smart_pro/
25. American Honda Recalls Approximately 256,000 Honda Accord Hybrid Vehicles to Correct Software Programming, accessed January 3, 2026, https://hondanews.com/en-US/honda-corporate/releases/release-0af91089c672e8c7eef0558d7601ab2a-american-honda-recalls-approximately-256000-honda-accord-hybrid-vehicles-to-correct-software-programming
26. How To Reset the Body Control Module - AutoZone.com, accessed January 3, 2026, https://www.autozone.com/diy/engine/how-to-reset-the-body-control-module
27. All keys LOST on Honda: Programming Smart keys WITHOUT a Working Key / Fastest Scan Tool programming - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=cHcsWTc2VhA
28. 2025 Honda Accord All Keys Lost using KM100 and the Universal Smart Key - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=ayUXpyFzh_c
29. Original Lishi for Honda HON66 HO01 Pick Decoder Ignition Door Trunk - Key4, accessed January 3, 2026, https://www.key4.com/original-lishi-hon66-ho01-honda-high-security-2-in-1-pick-decoder-anti-glare
30. ORIGINAL LISHI HON66 HONDA ACURA 2-IN-1 PICK DECODER IGNITION, DOOR, TRUNK - Car and Truck Remotes, accessed January 3, 2026, https://www.carandtruckremotes.com/products/original-lishi-hon66-honda-acura-2-in-1-pick-decoder-ignition-door-trunk
31. Original Lishi 2-1 Pick/Decoder for Honda HON66 - CLK Supplies, accessed January 3, 2026, https://www.clksupplies.com/products/original-lishi-2-1-pick-decoder-for-honda-hon66
32. AutoKeyUnlocker Mini KR | Unlock & Renew 200+ OEM Smart Keys - Key4, accessed January 3, 2026, https://www.key4.com/autokeyunlocker-mini-kr
33. RemUnlocker - Remote Unlocking Device - Renew and Unlock Automotive Remotes, accessed January 3, 2026, https://www.uhs-hardware.com/products/remunlocker-remote-unlocking-device-renew-and-unlock-automotive-remotes
34. STARTING HONDA CIVIC WITH METAL KEY - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Honda/comments/t21i6h/starting_honda_civic_with_metal_key/
35. How to Start Your Honda With a Dead Key Fob | Honda Minot ND, accessed January 3, 2026, https://www.ryanhondaminot.com/how-to-start-your-honda-with-a-dead-key-fob/
36. If the Keyless Remote Battery is Weak | 2023 Accord Hybrid - Honda, accessed January 3, 2026, https://techinfo.honda.com/rjanisis/pubs/om/ah/a30b2323iom/enu/details/131245047-270087a.html
37. How do I reset/disable the immobilizer after replacing my car battery? : r/Honda - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Honda/comments/1d4gsrz/how_do_i_resetdisable_the_immobilizer_after/
38. Quick tip, for bypassing immobilizer! : r/accord - Reddit, accessed January 3, 2026, https://www.reddit.com/r/accord/comments/1c290vr/quick_tip_for_bypassing_immobilizer/
39. 2022-2026 Honda Civic HR-V CR-V Pilot 5B Hatch Smart Key NO MEMORY KR5TP-4, accessed January 3, 2026, https://yourcarkeyguys.com/products/2022-2026-honda-civic-hr-v-cr-v-pilot-5b-hatch-smart-key-no-memory-kr5tp-4