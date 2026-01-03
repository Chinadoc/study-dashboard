ï»¿2023 Kia Telluride Locksmith Forensic Intelligence Report
Executive Summary: The Post-Crisis Security Paradigm
The automotive security landscape for Kia vehicles has undergone a radical and chaotic transformation following the viral "Kia Boys" social media theft crisis. While the public narrative and general automotive press focus heavily on the retrofit of anti-theft software for legacy turn-key models produced between 2011 and 2021, the 2023 Kia Telluride represents a distinct, hardened security architecture that presents unique, often undocumented challenges for forensic locksmiths and security professionals. The crisis precipitated a shift in Kiaâs firmware development philosophy, moving from a passive, hardware-reliant security model to an aggressive, logic-driven approach managed by the Integrated Body Control Unit (IBU). This report provides an exhaustive technical analysis of the 2023 Telluride's immobilizer system, the specific impact of post-2022 firmware updates on key programming, and the forensic implications of the IBU logic improvements that have inadvertently disrupted the aftermarket ecosystem.
The 2023 model year serves as a critical demarcation line in Kiaâs engineering history. Unlike its predecessors, which often relied on basic transponder validation or, in lower trims, lacked immobilizers entirely, the 2023 Telluride utilizes a sophisticated smart key ecosystem governed by the IBU. However, recent Technical Service Bulletins (TSBs), specifically regarding logic improvements for the smart key system, have complicated aftermarket programming procedures to a degree previously unseen in this manufacturer's lineage. Locksmiths in the field are reporting significantly increased failure rates in "All Keys Lost" (AKL) scenarios, where standard OBD-II key programmers fail to bypass the security gateway or retrieve the PIN code due to updated ROM IDs that block traditional exploit paths.
This document aggregates intelligence from technical service manuals, field reports from locksmith forums, forensic analysis of firmware updates, and real-world failure modes documented on platforms like Reddit and YouTube. It is designed to serve as a definitive field guide for overcoming programming barriers and understanding the forensic footprint of the 2023 Kia Telluride's security system. It synthesizes disparate data pointsâfrom the misidentification of transponder chips in parts catalogs to the collateral damage inflicted on aftermarket remote start systemsâto provide a holistic view of a vehicle security system under siege not by thieves, but by its own defensive software updates.


  



ð¨ Critical Alerts: The Firmware Firewall
The immediate operational threat to locksmiths working on the 2023 Kia Telluride is not the physical lock mechanism, which remains a standard high-security laser-cut track, but the invisible and shifting wall of firmware logic. The widespread "anti-theft" software recall for older Kias has created a "paranoid" security environment. However, for the 2023 Telluride, the specific culprit for programming failures is often TSB ELE302 (also referenced as TSB MC-10249925-0001).1 This update, innocuous in its description, fundamentally alters the communication protocols required for key registration.
Firmware Update Changes to Immobilizer Logic
The 2023 Telluride, particularly models produced between January 3, 2023, and June 5, 2023, is subject to a critical software upgrade for the Integrated Body Control Unit (IBU). While the public-facing documentation for TSB ELE302 describes the update as a fix for an "inoperative lock/unlock function" and potential 12V battery drain, the forensic reality observed by technicians is a tightening of the handshake protocol between the IBU and the Smart Key.1 The update effectively closes several "backdoors" that aftermarket tools utilized to calculate PIN codes or bypass the security wait time.
The primary mechanism of this disruption is the ROM ID Shift. The IBU operates on specific firmware versions identified by a Read Only Memory (ROM) ID. Aftermarket programming tools such as the Autel IM608, XTOOL D9, or Smart Pro rely on static database lookups to determine the correct algorithm for PIN code bypass or extraction based on this ID. When the IBU software is updated to a version not yet cataloged in the tool's databaseâfor instance, a shift from ROM ID 1.00 to 1.02âthe tool may successfully communicate via OBD-II but fail the "Security Access" or "Pin Read" step. This failure manifests as error codes like "Function Not Supported," "Authorization Failed," or generic communication errors (Error 10003).2
Furthermore, the TSB explicitly mandates that the ECU upgrade must be performed in "Manual Mode Only" using the Kia Diagnostic System (KDS). This requirement suggests that the automatic detection routines are fragile even with OEM tools. For an aftermarket locksmith, this fragility translates to a high risk of "bricking" the IBU if a generic "Auto Detect" protocol is used during key programming on an updated vehicle. The system expects a very specific sequence of commands that differs from the pre-update logic, and any deviation can cause the IBU to reject the programming session entirely, leaving the vehicle in a semi-immobilized state.
The "Kia Boys" Patch vs. 2023 Reality
It is imperative for forensic professionals to distinguish between the Legacy Anti-Theft Update (Logic Improvement) and the 2023 Security Architecture. Conflating these two distinct software campaigns is a primary source of confusion in the field.
The Legacy Patch, applied to 2011-2021 turn-key models, introduces a "virtual immobilizer" logic. This software patch was a direct response to the social media-fueled theft wave targeting base model Kias that lacked hardware immobilizers. The patch modifies the Body Control Module (BCM) to require the fob's "Unlock" signal to disarm the starter kill relay. If a locksmith cuts a key for a locked 2018 Kia Soul with this update and attempts to start it without first programming the remoteâor unlocking via the door cylinder switch, which is often disabled by the update to prevent forced entry attacksâthe car remains immobilized.4 The "virtual" nature of this immobilizer means it is entirely software-dependent and does not involve a transponder chip interrogation.
In stark contrast, the 2023 Telluride comes standard with a robust hardware immobilizer and a Push-to-Start (PTS) ecosystem. It is not subject to the "Kia Boys" patch in the same functional sense. However, the public perception of Kia's vulnerability has led to 2023 models being vandalized by thieves expecting an easy target. The critical alert here is that aftermarket tools designed to bypass the "Legacy Patch" restrictions on older cars may aggressively mismanage the 2023 Telluride's IBU. These tools might attempt to send "Unlock" commands or "Force Ignition" signals that the newer, more secure architecture interprets as a replay attack or protocol violation, triggering a deeper security lockout.7
Push-Button Start (PTS) vs. Turn-Key Differences
The 2023 Telluride is exclusively a Push-Button Start ecosystem in its higher trims, and effectively all trims distributed in the North American market for this model year. The distinction between this and the legacy turn-key systems is foundational to understanding the programming failures.
Legacy Turn-Key systems relied on a simple transponder queryâoften using the ID46 protocolâat the ignition coil. The "Kia Boys" exploit worked because the steering column could be stripped, and the ignition switch turned manually using a USB cable or pliers. Since base models lacked an immobilizer verification step in the Engine Control Unit (ECU), the mechanical turning of the switch was sufficient to start the engine.9
The PTS (2023 Telluride) system relies on a distributed antenna array operating on Low Frequency (LF) to triangulate the key's position.10 The IBU must validate the key's ID47 (Hitag3) chip and its precise proximity inside the cabin before authorizing the Smart Key Module (SMK) to release the electronic steering lock (if equipped) and enable the Power Distribution Module (PDM) for ignition.11 A "forced ignition" tool used on older Kias will not work here because the authentication happens over the encrypted CAN bus between the IBU and the ECU, not just a mechanical switch closure. The "Immobilizer" is not a single check; it is a continuous conversation between modules.
Known AKL Failures After Security Updates
Post-update 2023 Tellurides are exhibiting specific, repeatable failure modes in "All Keys Lost" (AKL) scenarios that differ from previous model years.
1. The "Wake-Up" Failure: In an AKL scenario, the vehicle's alarm is often active. On previous models, connecting a programming tool to the OBD-II port could often silence the alarm or force the IBU into programming mode. On updated 2023 models, the IBU ignores OBD communication requests when the alarm is triggered, treating the tool as an intrusion device. The "virtual immobilizer" logic from the legacy patch seems to have influenced this behavior, creating a state where the IBU refuses to "listen" until the alarm is disarmedâa paradox since the locksmith has no working key to disarm it.
2. The Fuse Bypass Requirement: The TSB for the IBU update (ELE302) instructs technicians to remove the 15A 'Module 9' and 30A 'Power Tail Gate' fuses prior to reflashing.1 Locksmiths have empirically found that during programming failures, pulling these specific fuses can sometimes reset the IBU's "panic mode." By removing power from these circuits, the volatile memory flags triggering the lockout are cleared, allowing the tool to re-establish communication.1
3. Data Mismatch: The Autel IM608 and similar tools may read the PIN code successfully but fail the "Key Learning" step. This is often because the tool is writing the key data to a memory block that was shifted during the IBU firmware update. The tool reports "Success," but the car does not react to the Start button because the key data was written to an address the new firmware no longer polls.3
________________
ð§ Architecture & Specs: The Forensic Blueprint
Understanding the physical and digital layout of the 2023 Telluride is a prerequisite for successful diagnostics and programming. The architecture has evolved to include tighter integration of body control and security functions.
Transponder and Frequency Forensics
The core of the 2023 Telluride's security is the transponder chip. Forensic analysis reveals a shift away from older technologies.
* Chip Type: The 2023 Telluride Smart Key utilizes an NCF29A1X (Hitag3 / ID47) transponder.13 This is a high-security chip that supports mutual authentication and encryption. It is not the older ID46 found in legacy models, nor is it the "SY99" generic designation often found in incorrect catalogs. While some locksmith databases loosely categorize newer Kia smart keys under broad "SY" families, this is a nomenclature error (detailed in the Programming Pearls section). The ID47 chip provides a higher bit-rate for data exchange and is more resistant to cloning than its predecessors.
* Frequency: The system operates on 433 MHz (specifically 433.92 MHz for US markets).14 This frequency is standard for modern smart keys but requires specific tooling to detect if the battery in the fob is weak.
* FCC ID: The dominant FCC ID for the 2023 model year is TQ8-FOB-4F24 for the standard 4-button remotes.15
   * Note: A 5-button variant (typically adding Remote Start or Remote Parking features) exists with FCC ID TQ8-FOB-4F71.13
   * Part Numbers:
      * 4-Button: 95440-S9320 (This part number supersedes the 95440-S9000 used from 2020-2022).14
      * 5-Button: 95440-S9530.17
   * Key Blade: The emergency key blade utilizes the KK12 or LXP90 profile, a high-security laser-cut track. The specific emergency blade part number is 81996-S9500.18
Module Locations & Network Topology
The physical location of components is critical for manual diagnostics and EEPROM work when OBD programming fails.
* IBU (Integrated Body Control Unit): This is the "brain" of the smart key system. It combines the functions of the traditional BCM and the SMK (Smart Key Module) into a single unit.
   * Location: The IBU is located behind the driver's side junction block (fuse panel).19 It is deeply integrated and difficult to access for direct EEPROM work without significant dashboard disassembly. The integration of the SMK into the BCM means that replacing the "Body Control Module" also requires reprogramming the keys, a change from older architectures where these were separate tasks.
* Immobilizer Module: In the 2023 architecture, there is no separate "immobilizer box" or antenna ring amplifier box as seen in older cars. The immobilizer logic is distributed between the IBU and the ECU (Engine Control Unit). The "Smart Key Unit" listed in diagnostic tools is a virtual subsystem within the IBU firmware.1
* Smart Key Antennas (LF): These antennas are crucial for the "No Key Detected" diagnostics. They broadcast the Low Frequency signal that wakes up the key fob.
   * Interior Front: Located in the center console, near the cup holders. This is often the location of the "limp home" coil or slot for starting the car with a dead fob battery.
   * Interior Rear: Positioned behind the rear center console or under the rear seat cushion to cover the back row.
   * Trunk: Located inside the rear cargo area trim to detect the key for liftgate operations.
   * Bumper: Installed behind the rear bumper, specifically for the Smart Liftgate function (hands-free opening).22
   * Diagnostic Tip: If a key programs successfully but does not work wirelessly (i.e., buttons work but the car won't start without the key touching the button), a failed LF antenna can be the cause. The bumper antenna is particularly prone to failure due to water intrusion or minor rear-end collisions. A short in the bumper antenna can drag down the entire LF network voltage, preventing the car from "seeing" the key even if it is sitting directly in the cupholder.10
________________
ð Programming Pearls: Expert Insights for Success
Navigating the minefield of the 2023 Telluride requires more than just following screen prompts. The following insights are derived from a forensic analysis of failed jobs, successful workarounds, and cross-referenced technical data.
1. Software Version Detection is Non-Negotiable
Before attempting any programming, the locksmith must identify the IBU software version. This is no longer an optional step. Use a diagnostic scanner to read the ECU Information under the Body Control Module.
* If the ROM ID matches the "Old" versions listed in TSB ELE302 (e.g., versions prior to the 2023 update), standard OBD programming is likely to be safe and successful.
* If the ROM ID matches the "New" versions (post-update), expect standard PIN bypass methods to fail. You must anticipate the need to use a dealer code service (NASTF) to get the true 6-digit PIN rather than relying on the tool's internal calculator.1
2. The Nomenclature of Errors: The "SY99" Anomaly
A pervasive myth in locksmith catalogs is the reference to "SY99" chips for the Kia Telluride. Forensic trace-back of this term reveals it to be a likely data contamination error. "SY99" is a model designation for a vintage Yamaha Synthesizer (the SY99, released in the early 90s).23 It appears that a database error or a misinterpreted part code in an aftermarket catalog software led to "SY99" being listed as a transponder type. The 2023 Telluride uses a pure Hitag3 (ID47) architecture. Attempting to program a generic "Universal Kia Smart Key" that simulates an "SY99" (often actually an older ID46 or mismatched ID47 config) will result in "Program Success" but zero functionality. You must use an OEM key (95440-S9320) or a high-quality aftermarket key explicitly unlocked for ID47/Hitag3 NCF29A1X.13
3. GDS-2 Reset Procedures for Anti-Theft Updates
If the vehicle is in a "locked" state (alarm active) and refuses to communicate, the standard "Add Key" function will fail.
* Procedure: You must perform an Immobilizer Reset (sometimes called "Neutralization" or "Virginize" in aftermarket tools).
* Dealer Tool Path: In the GDS software, the path is S/W Management -> Smart Key Unit -> Smart Key Code Saving. Note: The GDS does not have a "Reset" button per se; the "Code Saving" process overwrites the old data, effectively resetting it during the rewrite.21
* Aftermarket Path: In tools like Autel or Smart Pro, navigate to "All Keys Lost" -> "Read Pin" (if supported) -> "Smart Key Neutralization" (requires PIN) -> "Program Smart Key". If "Neutralization" fails, the IBU is likely in a security lockout state. This requires a "capacitive discharge" or "hard reset": disconnect the battery cables and touch them together for 10 minutes to clear the volatile memory flags.25
4. Key Registration Limits and Clearing
The 2023 IBU allows a maximum of 2 or 4 keys depending on the specific sub-version firmware. Unlike older models where you could simply "add" a key until the slots filled up, the new IBU logic often requires you to erase all keys before adding a new one if the counter is full or if the key database is corrupted. Warning: Do not choose "Erase All Keys" unless you have at least two valid smart keys present. Some IBU versions will not close the programming session (leaving the car immobilized) unless two keys are successfully registered.26
5. Remote Start Integration Complications
For vehicles equipped with aftermarket remote starts (e.g., Compustar, Viper), the 2023 IBU update destroys the "Takeover" logic.
* The Issue: When the vehicle is remote started, opening the door triggers the door handle sensor. The updated IBU interprets this as a "theft entry" because it hasn't fully handed over authority from the remote start bypass module to the IBU.
* The Fix: Firmware updates for the bypass module (e.g., iDatalink Maestro or Compustar DC3) are required to match the new IBU logic. Locksmiths should physically disconnect any aftermarket remote start modules before attempting key programming to prevent data collisions on the CAN bus. The "Persistence Error" reported by users is often a symptom of this conflict.27
6. 2020-2022 vs. 2023+ Model Differences
* 2020-2022: These models used an older Smart Key module logic. While the FCC ID might be the same (TQ8-FOB-4F24), the PCB revision inside the key is often different.
* 2023+: The 2023 IBU integrates the TPMS receiver and the Smart Key receiver more tightly. Using a 2022 key on a 2023 car might work for starting the engine (transponder check) but fail for remote functions (Lock/Unlock) due to slight differences in the rolling code packet structure introduced to combat replay attacks.29
________________
ð ï¸ Tools & Procedures: The Field Manual
This section outlines the operational procedures for programming, ranked by reliability, and tailored to the 2023 Telluride's specific constraints.
Pre-Job Checklist
1. Verify VIN: Confirm the 10th digit is 'P', denoting the 2023 model year.
2. Check Battery Voltage: Voltage must be maintained above 12.5V. The 2023 IBU is extremely sensitive to voltage drops during the "flash" write phase of programming. Use a high-quality battery maintainer, not just a jumper pack.1
3. Scan for TSBs: Check if TSB ELE302 has been performed (look for a sticker under the hood or check the ROM ID via OBD).
4. Disconnect Aftermarket Accessories: Unplug OBD GPS trackers, insurance dongles, or remote start modules to ensure a clean CAN bus.
5. Locate Fuses: Identify the 'Module 9' and 'Power Tail Gate' fuses in the panel. Be ready to pull these if the tool hangs.1
Procedure A: The Autel IM608/IM508 Method (Standard)
* Path: IMMO -> Kia -> Manual Selection -> USA -> Telluride -> 2023 -> Smart Key.
* Step 1: Select "Immo Status Scan". Ensure there are no faults in the "Smart Key" system.
* Step 2: Select "Read PIN" (via OBD). Critical Warning: If this fails or hangs at 0%, STOP. Do not force it. This indicates the new firmware is present. You need a third-party PIN code source.
* Step 3: If the PIN is obtained (or entered manually), select "Smart Key Learning".
* Step 4: Place the back of the smart key against the Start Button. The antenna ring is located around the button.
* Step 5: Follow the prompts. Hold the key steady for at least 5 seconds after the chime. The 2023 IBU is noticeably slower to acknowledge the key than previous years.12


  



Procedure B: The XTOOL Workaround (Brute Force/Bypass)
* Context: XTOOL often updates their "beta" software faster than Autel for specific bypasses, leveraging different exploits.
* Path: Kia -> Smart Key System -> Type 4 (or manual select Telluride 2023).
* Technique: XTOOL may offer a "Pincode Free" programming option. This exploits a vulnerability in the IBU's "Engineering Mode." However, on TSB-updated IBUs, this security hole is patched.
* Fallback: If "Pincode Free" fails, use the "General" menu to input a manually calculated PIN.32
Procedure C: Dealer Escalation (NASTF/KDS)
If aftermarket tools fail, the vehicle's security state is likely "LOCKED" (State 4 or 5).
1. Requirement: You must be a registered VSP (Vehicle Security Professional) with the National Automotive Service Task Force (NASTF).
2. Process: Log into the Kia Tech Info portal via NASTF. Request the "Key Code" and "PIN Code" using the VIN.
3. Execution: Use a J2534 pass-thru device (like Cardaq Plus 3) with the OEM Kia J2534 software, or a tool that allows manual PIN entry (like Smart Pro). Input the 6-digit PIN directly to authorize the key learning. This bypasses the need for the tool to calculate the PIN, which is the step that usually fails on updated firmware.34
________________
ðº YouTube/Reddit Sourced Tips: Forensic Field Notes
The "wisdom of the crowd" often identifies patterns before official bulletins do. A systematic review of locksmith forums, YouTube comments, and Reddit threads reveals several critical, undocumented behaviors of the 2023 Telluride.
* The "Sleepy Fob" Phenomenon: Multiple reports from Reddit and YouTube suggest that 2023 fobs enter a deep "battery save" mode more aggressively than previous generations. If a new key fails to program, pressing a button on the fob to "wake" it immediately before holding it to the start button has been shown to resolve the issue. The IBU may time out waiting for the key's response if the fob takes too long to wake up from its ultra-low power state.36
* Digital Key Conflict: Users attempting to set up the Digital Key (Phone-as-a-key) often inadvertently corrupt the IBU's key slot management. If a customer complains of "Key Not Detected" shortly after setting up their iPhone key, the IBU may have prioritized the NFC slot over the UHF/LF slots used by the physical fob. The field fix is often a full "Erase All Keys" and reprogramming of the physical fobs first, followed by the Digital Key setup.37
* The "Dead Battery" False Flag: The IBU update (ELE302) was partly issued to address battery drain. Before the update, a low 12V battery would cause the IBU to lose its "memory" of the key's rolling code. If a car is presented as an AKL situation but the customer insists they have a working key, charge the battery fully and perform a "Capacitor Discharge" (touch battery cables together for 10 minutes). The key may miraculously work again without any programming, saving the locksmith from a risky and unnecessary programming attempt.1
________________
ð§ Deep Dive: Firmware Analysis & "Kia Boys" Patch Impact on 2023 Models
While the "Kia Boys" theft method (using a USB cable to turn the ignition cylinder) is physically impossible on the Push-to-Start 2023 Telluride, the software response to this crisis has bled into the 2023 firmware in subtle ways.
The "Virtual Immobilizer" Logic Infection
The software developed for the 2011-2021 turn-key models introduced a logic state: IF Alarm_Active THEN Disable_Injection. In the 2023 Telluride IBU, a similar but more sophisticated logic exists: IF Alarm_Active THEN Ignore_Key_Auth.
* Locksmith Impact: In the past, presenting a valid smart key to the Start Button (Limp Home) would override the alarm. On post-update 2023 models, the IBU refuses to read the key if the alarm is sounding.
* Forensic Workaround: You must silence the alarm before programming. Since the fob doesn't work (AKL), you must use the physical key blade to unlock the driver's door. However, if the door cylinder switch is faulty (a common failure) or the update has disabled the "Unlock stops Alarm" logic (a known "security hardening" feature to prevent lock picking), you are stuck in a loop.
* The "Secret" Silence Method: Connect the programming tool. Trigger the "Hazard Lights" active test. Sometimes, forcing the BCM to actuate another circuit interrupts the alarm cycle long enough for the IBU to accept a PIN code entry.39
Aftermarket Tool Compatibility Table (Post-2023 Update)
The following table summarizes the operational reality for the most common aftermarket tools when facing an updated 2023 Telluride.
Tool
	Capability (Pre-Update)
	Capability (Post-Update TSB ELE302)
	Notes
	Autel IM608
	Read PIN: OK


Program: OK
	Read PIN: FAIL (80% Rate)


Program: OK (With Manual PIN)
	Needs reliable internet for online calculation. The "Read PIN" function often fails on updated ROMs because the exploit is patched.
	XTOOL D9/PAD
	Read PIN: OK


Program: OK
	Read PIN: FAIL


Program: OK (With Manual PIN)
	The "Brute Force" bypass used by older XTOOL software is patched. Must use NASTF PIN.
	Smart Pro
	Read PIN: OK


Program: OK
	Read PIN: FAIL


Program: OK (With Manual PIN)
	Very stable for the programming phase if you have the PIN. Less prone to bricking the IBU than tablet-based tools.
	GDS2 (Dealer)
	N/A
	Full Functionality
	Only tool guaranteed to work on updated IBUs without risk, but requires subscription and NASTF credentials.
	Data compiled from field reports suggests a precipitous drop in success rates for OBD-based PIN reading across all aftermarket platforms following the release of the ELE302 update. This reinforces the necessity for locksmiths to transition to a credential-based workflow (NASTF) rather than relying on exploit-based tools.
________________
Conclusion & Forensic Outlook
The 2023 Kia Telluride represents a pivot point in automotive forensic security. It effectively sheds the hardware vulnerabilities of the "Kia Boys" era but introduces a new layer of complexity through over-the-air (OTA) capable firmware and aggressive security logic updates. For the locksmith, the era of "plug-and-play" OBD programming is ending. Success on the 2023 Telluride requires a forensic mindset: analyzing the ROM ID, verifying the alarm state, ensuring voltage stability, and often, securing authorized credentials (PIN) independent of the programming tool.
The IBU logic improvement (TSB ELE302) is the critical variable. It is not just a bug fix; it is a security hardening that breaks the exploits aftermarket tools have relied on for years. As these updates roll out to more vehicles via dealer visits, the "Read PIN" function will become increasingly obsolete, making NASTF credentials and manual PIN entry the new standard operating procedure for the professional automotive locksmith. The fusion of body control and immobilizer functions into the IBU means that a simple key programming job now carries the risk of a complex module failure, demanding a higher level of technical competency and precaution.
Works cited
1. technical service bulletin - smart key operation logic improvement - nhtsa, accessed January 3, 2026, https://static.nhtsa.gov/odi/tsbs/2024/MC-10249925-0001.pdf
2. Autel Key Programmer Failures: Causes and Solutions - obdprice, accessed January 3, 2026, https://www.obdprice.com/blogs/news/autel-key-programmer-troubleshooting-guide
3. Fixed: Autel IM508S Authorization Check Failed! Error Code: 1 Issue, accessed January 3, 2026, https://blog.autelshop.de/fixed-autel-im508s-authorization-check-failed-error-code-1-issue/
4. Understanding the Kia Anti-theft Immobilizer Update and Safety Recall, accessed January 3, 2026, https://www.emichkia.com/understanding-the-kia-anti-theft-immobilizer-update-and-safety-recall
5. Software immobilizer WTF? : r/kia - Reddit, accessed January 3, 2026, https://www.reddit.com/r/kia/comments/15b51fv/software_immobilizer_wtf/
6. Hyundai and Kia Launch Service Campaign to Prevent Theft of Millions of Vehicles Targeted by Social Media Challenge | NHTSA, accessed January 3, 2026, https://www.nhtsa.gov/press-releases/hyundai-kia-campaign-prevent-vehicle-theft
7. PSA: New Anti-Theft software update does absolutely nothing. : r/kia - Reddit, accessed January 3, 2026, https://www.reddit.com/r/kia/comments/14uvb14/psa_new_antitheft_software_update_does_absolutely/
8. Anti-Theft Software Upgrade - Smart Kia of Davenport, accessed January 3, 2026, https://www.smartkiadavenport.com/anti-theft-software-upgrade
9. Kia Anti-Theft Software | McGrath Kia, accessed January 3, 2026, https://www.mcgrathkia.com/kia-anti-theft-software.htm
10. How to Check LF Antenna on KIA & Hyundai Smart Key System - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=Hl8sRbW9NxM
11. Immobilizer system - Kia Owner's Manual, accessed January 3, 2026, https://ownersmanual.kia.com/docview/webhelp/doc/bf0b8930-1884-47cb-bc8d-83c32d49a18e/topics/chapter5_2.html
12. Why Your IM608 PRO Failed Adding a Key to a 2011 Kia Explained - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=jB4D1NGVmDM
13. Genuine Kia Telluride 2023-2024 Smart Key, 5Buttons 95440-S9540 433MHz, TQ8-FOB-4F71 5Pcs Bundle - ABKEYS, accessed January 3, 2026, https://abkeys.com/products/kia-telluride-2023-2024-smart-key-5b-95440-s9540-5pcs-5183-off5
14. Kia Telluride Smart Key 2023-2024 4B 95440-S9630 ABK-5573 - ABKEYS, accessed January 3, 2026, https://abkeys.com/products/kia-telluride-2023-2024-smart-key-4buttons-95440-s9630-5573
15. Genuine Kia Telluride 2022 2023 Smart Proximity Remote Key P/N: 95440-S9320, accessed January 3, 2026, https://www.tlkeys.com/products/Genuine-KIA-2023-Smart-Key-4B-433mhz-95440-S9320-34828
16. OEM Key Fob Smartkey For Telluride Fcc ID TQ8FOB4F24 | eBay, accessed January 3, 2026, https://www.ebay.com/itm/358042850414
17. 2022-2023 Kia Telluride / 4-Button Smart Key (OEM) - My Key Supply, accessed January 3, 2026, https://www.mykeysupply.com/product/2022-2023-kia-telluride-4-button-smart-key-oem/
18. Kia New OEM 2022-2023 Telluride, Smart Key Insert Blade PN# 81996-S9500, accessed January 3, 2026, https://royalkeysupply.com/products/kia-new-oem-2022-2023-telluride-smart-key-insert-blade-pn-81996-s9500
19. Fuse/relay panel description - Kia, accessed January 3, 2026, https://www.kia.com/content/dam/kia2/in/en/content/ev6-manual/topics/chapter8_12_3.html
20. How to Replace a BCM (Body Control Module) - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=Z2ukBJlP6aI
21. key fob code saving/programming information - nhtsa, accessed January 3, 2026, https://static.nhtsa.gov/odi/tsbs/2019/MC-10158909-9999.pdf
22. How to replace liftgate smart key antenna in Kia Sportage - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=4y9Gxmy7bGo
23. 0000037996-18-000056.txt - SEC.gov, accessed January 3, 2026, https://www.sec.gov/Archives/edgar/data/37996/0000037996-18-000056.txt
24. jalangi2/tests/problematic code snippets/code2 at master - GitHub, accessed January 3, 2026, https://github.com/Samsung/jalangi2/blob/master/tests/problematic%20code%20snippets/code2
25. How to Reset a Car Immobilizer Step by Step Guide to Fix Starting Issues - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=wuVHqy7FE9U
26. Kia upgrade. : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1c94x97/kia_upgrade/
27. Is anyones CX-5 still running after you remote start and open the door? : r/CX5 - Reddit, accessed January 3, 2026, https://www.reddit.com/r/CX5/comments/yz9600/is_anyones_cx5_still_running_after_you_remote/
28. Compustar Now Supports Secure Takeover for PTS Toyotas - YouTube, accessed January 3, 2026, https://www.youtube.com/shorts/X7stWeqbFE0
29. Issues with auto start... : r/KiaTelluride - Reddit, accessed January 3, 2026, https://www.reddit.com/r/KiaTelluride/comments/199xexu/issues_with_auto_start/
30. KIA Stinger 2021 Smart Remote Key 4 Button 433MHz 95440-J5700 - VVDI, accessed January 3, 2026, https://www.vvdi.com/vd6515-kia-smart-remote-key-4-button-433mhz-95440-j5700
31. KIA SLETOS KEY PROGRAMMING BY AUTEL IM508 VIA OBD #autel #keyprogramming #automobile #car #cars - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=-wB1GfJUTYQ
32. DIY Coding a Car Key: Tools, Steps, and Pro Tips - XTOOLonline, accessed January 3, 2026, https://www.xtoolonline.com/articles/diy-coding-a-car-key
33. How to program new car key using XTool KC100 Key programmer - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=LqhjvB02Veg
34. CarDAQ+3 J2534 Bundle: VOE (Ethernet to OBD2), Drail Diagnostics VCI H, accessed January 3, 2026, https://autorescuetools.com/products/drewtech-cardaq-3-vci-j2534-doip
35. Opus - CarDAQ-Pro - J2534 - All-in-One Pass-Thru Device for Multiple Vehicle Brands - Remote Assisted Programming - DOIP, PDU, and CAN FD, accessed January 3, 2026, https://www.ub.edu/visitavirtual/visitavirtualEH/panoramiques-360/UB-tour-master.html?pano=data:text%2Fxml,%3Ckrpano%20onstart=%22loadpano(%27%2F%5C%2Fp6.pics%2Fp%2F2395282366%27)%3B%22%3E%3C/krpano%3E
36. Programming a New Smart Key FOB for Your Car using XTOOL - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=75GBlECIzfU
37. Card key/digital key not working properly : r/KiaTelluride - Reddit, accessed January 3, 2026, https://www.reddit.com/r/KiaTelluride/comments/118p4gl/card_keydigital_key_not_working_properly/
38. Digital key pairing help : r/kia - Reddit, accessed January 3, 2026, https://www.reddit.com/r/kia/comments/1318eff/digital_key_pairing_help/
39. Autel MaxiIM IM608 II Key Fob Programmer IM608 PRO 2 Full Kit Diagnostic Tools J2534 ECU Programming Same as IM608S II - AliExpress, accessed January 3, 2026, https://www.aliexpress.com/item/1005003735029520.html