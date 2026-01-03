ï»¿2020 Ford Explorer (CD6 Platform): Comprehensive Technical Forensic Analysis for Automotive Locksmiths
1. Executive Introduction: The CD6 Paradigm Shift
The release of the 2020 Ford Explorer represented a watershed moment in automotive engineering and, consequently, a significant disruption for the automotive locksmithing industry. This model year marked the transition from the long-standing D4 platformâa front-wheel-drive architecture shared with the Taurus and Flexâto the all-new CD6 platform.1 For the casual observer, this shift manifests as a return to rear-wheel-drive dynamics and longitudinal engine mounting, mirroring the premium architecture of the Lincoln Aviator.1 However, for the security professional, the implications of the CD6 platform are far more profound, signaling a total overhaul of the vehicleâs digital identity, immobilizer topology, and physical access control mechanisms.
This report provides an exhaustive, forensic-level analysis of the 2020 Ford Explorerâs security ecosystem. It is designed specifically for inclusion in high-level locksmith databases and for use by field technicians who require a nuanced understanding of the risks and procedures associated with this vehicle. The analysis moves beyond superficial "add-a-key" instructions to dissect the underlying architecture of the Passive Anti-Theft System (PATS), the aggressive implementation of the Secure Gateway Module (SGW), the migration to CAN FD (Controller Area Network Flexible Data-Rate) protocols, and the critical mechanical evolution from the legacy HU101 keyway to the internal-track HU198 profile.
The 2020 Explorer presents a "perfect storm" of barriers for the unprepared technician: a sophisticated "Active Alarm" state that physically and digitally severs diagnostic communication 3, a high susceptibility to Body Control Module (BCM) corruption during low-voltage parameter resets 4, and a complex bifurcation of remote frequency logic (315 MHz vs. 902 MHz) dependent on trim-specific features.6 Furthermore, the divergence between civilian "Smart Key" systems and the Police Interceptor Utilityâs (PIU) fleet-keyed mechanical ignition creates a matrix of part numbers and procedural variances that demands precision.8
By synthesizing technical specifications, field procedural data, and architectural theory, this document establishes a definitive protocol for servicing the CD6 Explorer, ensuring operational success while mitigating the substantial risks of module failure.
2. CD6 Platform Architecture & Digital Topology
To successfully navigate the security barriers of the 2020 Explorer, one must first possess a deep understanding of the CD6 digital architecture. Unlike its predecessors, which operated on a more permissive network topology, the CD6 utilizes a highly integrated domain controller network that is heavily reliant on the Gateway Module (GWM) to police traffic between the external world (diagnostic port) and the vehicleâs internal high-speed networks.
2.1 The Gateway Module (GWM) and the Firewall Concept
In the CD6 architecture, the Gateway Module is not merely a bridge; it functions as a sophisticated firewall. Located deep within the dashboard structure, specifically positioned above the brake pedal assembly 10, the GWM physically isolates the OBD-II port (pins 6 and 14) from the vehicleâs internal High-Speed CAN (HS-CAN) and MS-CAN buses.
On previous platforms, a locksmithâs diagnostic tool connected directly to the CAN bus, allowing for relatively unfettered access to the BCM and PCM (Powertrain Control Module). On the 2020 Explorer, the tool communicates primarily with the GWM. The GWM then inspects the message packets. If the packets do not contain the correct cryptographic authorizationâor if the vehicle is in a locked-down state such as an Active Alarmâthe GWM simply drops the packets, preventing them from ever reaching the BCM.11 This "man-in-the-middle" architecture is the primary reason why legacy diagnostic tools often fail to even detect the vehicle's VIN or communicate with immobilizer modules during a lockout scenario.


  



2.2 The CAN FD Imperative
The 2020 Explorer is among the first mass-market Ford vehicles to fully implement the CAN FD (Controller Area Network Flexible Data-Rate) protocol for its critical security and diagnostic communications.13
Standard CAN (ISO 11898) is limited to a data payload of 8 bytes per frame and a transmission speed of 500 kbps or 1 Mbps. CAN FD, however, expands the data payload to 64 bytes per frame and supports significantly higher transmission speeds.14 The CD6 platform utilizes this increased bandwidth to facilitate the rapid exchange of dense cryptographic data between the Smart Key, the Radio Transceiver Module (RTM), and the BCM.
Forensic Implication for Locksmiths:
This shift renders many legacy diagnostic tools obsolete for this specific model year. Tools that are limited to standard CAN hardware cannot effectively interpret or transmit the high-speed CAN FD frames required to initiate key programming sessions. While some functions might work on the slower MS-CAN bus, the critical Immobilizer (IMMO) functions reside on the high-speed architecture. Consequently, technicians utilizing platforms such as the Autel IM608 or IM508 must utilize a specialized CAN FD Adapter or an upgraded VCI (Vehicle Communication Interface) that natively supports the protocol to bridge the communication gap.13 Without this hardware bridge, the tool will likely report "Communication Failure" or "Unable to Locate VIN" when attempting to access the BCM.17
2.3 The "Handshake" and Parameter Synchronization
The core of the 2020 Explorerâs immobilization strategy relies on a sophisticated tripartite handshake between three primary nodes:
1. The Key (Transponder): An ID49 / HITAG PRO 128-bit chip.18
2. The BCM (Body Control Module): The gatekeeper that stores the list of trusted key identifiers.20
3. The PCM (Powertrain Control Module): The executioner that enables fuel and spark only upon receiving a validated cryptographic release from the BCM.21
In a standard "Add Key" scenario, the technician is simply introducing a new 128-bit key ID into the BCMâs "Trusted Key List" (a specialized memory block). However, in an "All Keys Lost" (AKL) scenario, the stakes are significantly higher. Because the original trusted keys are erased, the systemâs rolling code sequenceâthe synchronized cryptographic language spoken between the BCM and PCMâis effectively broken or reset.
To restore vehicle functionality, the locksmith must perform a Parameter Reset (sometimes referred to as Module Initialization). This process forces the BCM and PCM to exchange new cryptographic seeds and re-establish their secure link. On the CD6 platform, this specific handshake is exceptionally vulnerable to voltage fluctuations. The BCM utilizes non-volatile flash memory to store these parameters. If the vehicleâs system voltage drops below a critical threshold (typically 12.0V) during the precise moment this write operation occurs, the write cycle may terminate incompletely. This results in corrupt configuration data, often leaving the BCM in a "bootloader" or "bricked" state.5 In this condition, the vehicle will display a "Starting System Fault," and while the key may appear to program successfully (the transponder is locked), the engine will crank but never fire because the PCM never receives the authorization to inject fuel.21
3. Forensic Part Data Analysis: Keys & Frequencies
A significant source of operational error and financial loss for locksmiths working on the 2020 Explorer is the complexity of the remote key ecosystem. Unlike previous generations that standardized largely on 315 MHz (North America) or 902 MHz (Bi-Directional) across the board, the 2020 model mixes these frequencies based on specific trim levels and factory-installed options. The physical shells of these keys are often identical, making visual identification impossible and necessitating a reliance on FCC IDs and part numbers.
3.1 The 315 MHz vs. 902 MHz Bifurcation
The frequency split is dictated by the presence of the Factory Remote Start feature and the capability of the installed Radio Transceiver Module (RTM).
* 902 MHz (High Frequency - Bi-Directional): This frequency is reserved for vehicles equipped with Factory Remote Start. The 902 MHz band offers superior range and signal penetration, which is a functional requirement for the long-distance operation of remote starters.7 These keys are typically 5-button configurations (Lock, Unlock, Remote Start, Hatch, Panic) and operate on a bi-directional protocol, meaning the car can send confirmation signals back to the fob (e.g., an LED flash confirming the engine has started).
   * Forensic Indicators: Higher trim levels (Limited, ST, Platinum) and XLT models with comfort packages almost exclusively use 902 MHz.25
   * FCC ID: M3N-A2C931426 or M3N-A2C93142600.7
* 315 MHz (Standard Frequency - Uni-Directional): This frequency is found on lower trim levels (Base, standard XLT) that lack the factory remote start option.24 These keys are typically 3-button (Lock, Unlock, Panic) or 4-button (Lock, Unlock, Hatch, Panic) configurations.
   * Forensic Indicators: Base models, fleet vehicles (non-police), and entry-level trims.
   * FCC ID: N5F-A08TAA or M3N-A2C931423.27
Operational Warning: Installing a 315 MHz key into a 902 MHz system (or vice versa) creates a specific failure mode: The transponder chip (ID49) will program successfully, and the vehicle will start. However, the remote functions (buttons) will be completely inoperative because the RTM cannot "hear" the mismatched frequency.24 This often leads to misdiagnosis, with technicians assuming the key is defective rather than incompatible.


  



3.2 Transponder Technology: ID49 / HITAG PRO
Regardless of the remote frequency (315 or 902 MHz), the immobilizer transponder chip architecture remains consistent across the 2020 Explorer lineup. The vehicle utilizes the NXP HITAG PRO platform, which uses 128-bit AES encryption. In the locksmith industry, this is universally referred to as ID49 or the "Ford 128-Bit" system.19
* Chip ID: NCF2951.19
* Locking Logic: These transponders are "One-Time Programmable" (OTP) to the specific vehicleâs VIN (Vehicle Identification Number) once the configuration bytes are locked. While some aftermarket tools can unlock or "renew" used OEM keys, a virgin or properly renewed key is required for programming.
* Backwards Compatibility: It is critical to note that while the chip type (ID49) is shared with earlier models (e.g., 2015-2019 F-150), the key blade and frequency combinations are specific to the CD6 platform, meaning older keys cannot simply be reused without verifying the blade profile (HU198 vs HU101) and frequency match.
3.3 The Police Interceptor Utility (PIU) Variance
The Police Interceptor Utility (PIU) introduces a completely separate ecosystem of access control that operates in parallel to the civilian model. While based on the same CD6 unibody, the PIU prioritizes fleet management and secure idling over consumer convenience.
* Ignition Type: The most distinct difference is the ignition system. While almost all civilian 2020 Explorers feature a Push-Button Start (Intelligent Access) system, the PIU standardly features a mechanical keyed ignition.31 This design choice facilitates the "Police Engine Idle" (Option 47A), a secure idle feature that allows an officer to press a button, remove the physical key, and exit the vehicle while keeping the engine running and the transmission locked.33
* Fleet Keys: Agencies often order these vehicles with specific fleet key codes (e.g., the "1284x" or "1435x" series) rather than unique cuts. This allows a single key to operate an entire precinctâs fleet.31
* Remote Keyless Entry (RKE): Fobs (Option 55F) are optional and separate from the key bow. If present, they are typically 315 MHz standard remotes, but the absence of a fob is common, leaving the officer with only a mechanical transponder key.33
* Transponder: Even the bladed keys for the PIU contain the ID49 chip and must be programmed into the PATS system; they are not simple mechanical keys.32
4. Mechanical Access Specifications: The HU198 Evolution
A significant point of friction and tool failure for locksmiths transitioning to the 2020 Explorer is the mechanical keyway profile. For over a decade, Ford utilized the HU101 "High Security" laser cut keyway across almost its entire global lineup. The 2020 Explorer introduces a new standard: the HU198.38
4.1 HU101 vs. HU198: The Internal Track Divergence
Visually, the key blades appear nearly identical in width, material, and length. A casual inspection might lead a technician to believe they are dealing with the familiar HU101. However, the milling profile is fundamentally inverted.
* HU101 (Legacy): This is an External 2-Track system. The "bitting" or security cuts are milled on the outside edges of the key blade, creating a snake-like path along the perimeter.41
* HU198 (New Standard): This is an Internal 2-Track system. The security cuts are milled into a channel running down the center of the key blade face, leaving the outer edges flat and uncut. These outer edges act merely as guides for the keyway.38
Operational Consequence:
Inserting a standard HU101 Lishi pick/decoder tool into a 2020 Explorer door lock will invariably fail. The wafers in the HU198 lock cylinder are positioned to interact with the internal groove. The HU101 tool, designed to manipulate external wafers, will essentially "float" in the keyway without engaging the tumblers correctly.43
* Correct Tool: Lishi HU198 (often labeled "Ford 2017+"). This tool is specifically engineered with the picking lifters oriented for the internal track.40
* Alternative: Some advanced locksmiths report sporadic success using an HU101 V3 tool if it is designed to read "inverse" tracks or if the lock cylinder is a hybrid, but reliance on this is ill-advised. The HU198 specific tool is the mandatory forensic standard for reliable non-destructive entry on this model year.43
4.2 Emergency Key Slot Location
In "Dead Battery" or "Interference" situations where the Smart Keyâs battery is depleted, the passive entry and start functions will fail. The system requires the key to be placed in a specific induction pocket to energize the transponder chip via NFC (Near Field Communication).
* Location: Inside the center console storage bin.
* Configuration: A dedicated slot or molded pocket, typically located at the bottom or the front wall of the bin, sometimes hidden under a rubber mat or coin tray.3
* Procedure: Place the Smart Key in the slot (buttons usually facing out/up, depending on the specific molding). Press the brake pedal and the Start button. The BCM energizes the pocket coil, reads the passive ID49 chip, and authorizes the start.46
5. Immobilizer Procedures and Security Barriers
The 2020 Explorerâs security architecture is defined by its hostility to unauthorized access, manifested primarily through the "Active Alarm" state. This state is not just a nuisance; it is a digital lockdown designed to thwart OBD-II based attacks.
5.1 The "Active Alarm" Barrier and OBD-II Lockdown
In previous Ford generations (e.g., C1 MCA platform), triggering the alarm by picking the door lock would cause the horn to sound, but the OBD-II port would generally remain active, allowing a diagnostic tool to connect and silence the alarm via software. On the CD6 platform, the system logic is radically different.
* Mechanism: When the alarm is triggered (sounding or silently active), the Gateway Module (GWM) enters a security lockdown mode. It rejects all security access requests (Seed/Key exchange) originating from the OBD-II port. The diagnostic tool will display errors such as "Security Access Denied" or "Communication Failed".3
* The "Wait" Necessity: The system imposes a strict timeout period. If the alarm is triggered, the GWM will not accept security commands until the alarm state has timed out and the system has returned to a quiescent state. This timeout is typically hard-coded to 10 minutes.3
* Legacy Bypass Ineffectiveness: The old method of "disconnect battery, wait 1 minute, reconnect" is largely ineffective on CD6 vehicles. The BCM and GWM utilize capacitors and non-volatile memory that retain the "Alarm Active" state even after a power cycle, meaning the 10-minute timer often resumes or restarts immediately upon reconnection.17
5.2 Advanced Bypass Methodologies
To overcome the Active Alarm lockdown without waiting 10 minutes (which carries the risk of the alarm re-triggering), forensic locksmiths have developed three primary vectors.
Method A: The ADC2020 / Smart Pro Emulator (The "Golden Standard")
This method is widely regarded as the safest and most professional approach for the 2020 Explorer. It utilizes the Advanced Diagnostics Smart Pro programmer in conjunction with the ADC2020 Emulator Cable.47
1. Tooling: Smart Pro + ADC2020 Cable.
2. Process: The tool connects to the OBD port. The software (Ford ADS2269) initiates a specialized handshake that bypasses the standard security request. Instead of asking the BCM to "add a key," it asks the BCM to "read data".47
3. Emulation: The software extracts the necessary IMMO data and writes it to the ADC2020 cable, which is physically connected to the tester. The cable then acts as a "Master Key," transmitting a valid ID49 signal to the vehicle's start button coil.
4. Result: The vehicle believes a valid key is present. It immediately disarms the alarm, unlocks the doors, and opens the programming window. The entire process takes approximately 2-3 minutes, bypassing the 10-minute wait entirely.49
Method B: The "10-Minute Wait" (The Timer)
If specialized emulation hardware is unavailable, the technician must play by the vehicleâs rules. This method relies on the systemâs built-in timeout logic.
1. Trigger: Access the vehicle (alarm sounds).
2. Action: Connect the programmer (e.g., Autel IM608/508). Attempt to communicate.
3. Wait: The tool (and the vehicle) will enter a waiting period. The screen typically displays a countdown or a "Please Wait" message. The alarm may silence after 30-60 seconds, but the digital state remains active.3
4. Execution: After exactly 10 minutes, the GWM releases the lock for a brief window. The technician must execute the "Add Key" or "All Keys Lost" command immediately.
5. Risk: If a door is opened, a sensor tripped, or the tool disconnects during this wait, the timer resets to zero, requiring another 10-minute cycle.3
Method C: The Magnus Cable / Power Isolation (The Hardware Hack)
This method bridges the gap between battery disconnects and tool continuity, effectively "tricking" the BCM.
1. Tooling: A "Magnus" or "Lock Labs" cable kit (OBD adapter with external battery clamps).51
2. Concept: The objective is to keep the diagnostic tool powered and in an active session while simultaneously cutting power to the vehicle to kill the alarm state.
3. Process: The tool is powered independently via the external battery clamps. The vehicle battery is disconnected, silencing the alarm and clearing the volatile RAM of the BCM. Because the tool stays powered, it maintains its session state. When the vehicle battery is reconnected, the tool is already "inside" the session, sending communication packets before the BCM can fully reboot and re-engage the alarm logic.51


  



5.3 All Keys Lost (AKL) Procedure & Key Count Limits
Key Count Architecture
The 2020 Explorerâs BCM manages key memory in two distinct tiers: Admin Keys and MyKeys.
* Admin Keys: The system enforces a strict limit of 4 Admin Keys (Master Keys with full privileges to change settings and program other keys).53
* MyKeys: The system can support a higher number of restricted "MyKeys" (often up to 8 total keys in the stack), which are keys with imposed limitations (speed, volume) usually intended for teen drivers.53
* Erase Requirement: In an AKL scenario, or if the vehicle has reached its 4-key Admin limit (common in former rental or fleet vehicles), the "Add Key" function will fail. The technician must perform an "Erase All Keys" function. This resets the key counter to zero (or 2, depending on the programming cycle requirement).54
The AKL Workflow
1. Delete Keys: The user must typically select "All Keys Lost" or "Delete Keys" rather than "Add Key" if no working key is present. This clears the trusted list and prepares the BCM for a new master set.54
2. Add Key 1 & 2: A minimum of two keys is often required to close the programming cycle and extinguish the theft light. The system expects a second unique ID49 transponder to be presented to the induction slot to verify the cycle.54
3. Parameter Reset: Once the keys are added, the diagnostic tool initiates a "Parameter Reset" or "Module Initialization." This is the critical phase where the BCM and PCM align their encrypted rolling codes.
5.4 Risk Management: BCM Bricking and Voltage Sensitivity
The Parameter Reset phase is the moment of highest risk for the 2020 Explorer. The CD6 BCM is exceptionally sensitive to voltage stability during this write operation.
* The Failure Mode: If the battery voltage drops below ~12.0V while the BCM is writing new parameters to its flash memory, the process can hang or corrupt the boot sector of the module.
* The "Brick" Symptom: The process fails. The cluster displays "Starting System Fault." The key appears to be programmed (transponder data is accepted), but the engine cranks and does not start because the PCM has effectively "locked out" the fuel injectors due to a handshake mismatch.21
* Prevention: It is mandatory to connect a high-quality external power supply (battery maintainer/charger) capable of delivering clean power at 12.6V to 13.6V throughout the entire programming session.5 Relying on the vehicleâs battery alone, especially if it has been drained by the alarm or door opening, is a recipe for catastrophic module failure.


  



6. Procedural Deep Dive: Tool-Specific Nuances
6.1 Autel IM608 / IM508 Configuration
The Autel platform is a popular choice for this vehicle, but it requires specific configuration to function on the CD6 platform.
* Adapter Requirement: The tool must be used with the CAN FD Adapter (or the newer VCI V200/MaxiFlash VCI which supports it natively). The adapter connects between the main cable and the vehicleâs OBD port. Without this, the tool cannot communicate with the high-speed bus.13
* Menu Path: "Ford" -> "USA" -> "Explorer" -> "2020-" -> "Smart Key".
* Update Warning: Technicians should ensure their software is up to date, as Autel has released specific patches (e.g., post-August 2023 updates) to improve the stability of the alarm bypass and parameter reset functions.60
6.2 Advanced Diagnostics Smart Pro Configuration
* Software Module: Ford ADS2269.3
* Hardware: ADC2000 (Standard) or ADC2020 (Emulator).
* Strategy: The Smart Pro software automatically detects if the alarm is active. If the ADC2020 emulator is connected, it will prompt the user to execute the emulation bypass. If standard hardware is used, it will default to the 10-minute wait timer. The tool also provides live voltage monitoring, which is a critical safety feature for monitoring the risk of BCM bricking.47
7. Conclusions & Recommendations for the Locksmith Database
The 2020 Ford Explorer represents a high-security environment that strictly penalizes "trial and error" approaches. The convergence of Active Alarm logic, CAN FD protocols, and the voltage-sensitive Parameter Reset creates a narrow operational window for successful key programming.
Summary of Critical Data Points for Database Entry:
* Platform: CD6 (Rear Wheel Drive / Longitudinal).
* Keyway: HU198 (Internal 2-Track). Do not use HU101 tools.
* Transponder: ID49 / HITAG PRO (128-Bit).
* Remote Frequencies:
   * 902 MHz (5-Button): Required for vehicles with Factory Remote Start.
   * 315 MHz (3/4-Button): Required for vehicles without Factory Remote Start.
* OBD Interface: Requires CAN FD Adapter for most aftermarket tools to penetrate the Gateway Module firewall.
* Active Alarm: Enforces OBD lockout. Requires ADC2020 Emulator bypass or 10-minute wait.
* Voltage Protocol: MANDATORY external power supply (>12.6V) during Parameter Reset to prevent BCM corruption.
* Key Count: Limit of 4 Admin Keys. "Erase All Keys" required if limit is reached.
* Fleet Note: Police Interceptor Utility uses mechanical ignition (HU198) and often lacks RKE fobs; verify specific fleet key codes.
By adhering to these forensic protocols and utilizing the correct frequency and mechanical data, the automotive locksmith can service the 2020 Ford Explorer safely and efficiently, turning a high-risk lockout into a routine procedure. The CD6 platform demands respect, but it is fully serviceable with the correct intelligence and tooling.
Works cited
1. Ford CD6 platform - Wikipedia, accessed January 3, 2026, https://en.wikipedia.org/wiki/Ford_CD6_platform
2. Ford CD6 platform, accessed January 3, 2026, https://grokipedia.com/page/Ford_CD6_platform
3. 2020 Ford Explorer deactivating the alarm & programming without NASTF or WIFI - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=ygPr_PzJne4
4. Parameter Reset for Ford Vehicles: A Step-by-Step Guide - Solo Auto Electronics, accessed January 3, 2026, https://www.solopcms.com/blog/ford-vehicle-parameter-resets/
5. Built at Dearborn Truck Plant on 25-May-2022 and through 3-Sep-2022, accessed January 3, 2026, https://www.fordservicecontent.com/Ford_Content/vdirsnet/TSB/EU/~WTSB23-2099/US/EN/~UEmployee/default.aspx?VIN=&ver
6. 902MHz For 2017 2018 2019 2020 Ford Edge Explorer Smart Remote Key Fob 164-R8149, accessed January 3, 2026, https://www.ebay.com/itm/297099588272
7. 2017-2022 Ford / 5-Button Smart Key / PN: 164-R8149 / M3N-A2C93142600 / 902 Mhz (OEM Refurb) - UHS Hardware, accessed January 3, 2026, https://www.uhs-hardware.com/products/2017-2022-ford-5-button-smart-key-pn-164-r8149-m3n-a2c93142600-902-mhz-oem-refurb
8. 2020 Police Interceptor Utility and Hybrid Utility Modifiers Guide, accessed January 3, 2026, https://www.policeinterceptor.com/pdf/2020PIUmodifier.pdf
9. Police InterceptorÂ® Utility - Ford, accessed January 3, 2026, https://www.ford.com/cmslibs/content/dam/brand_ford/en_us/brand/resources/general/pdf/brochures/2020_PI_Utility_Mini-Brochure2_lr.pdf
10. Explorer (20-24') Start / Stop Eliminator - 4D Tech | Ford Upgrades ..., accessed January 3, 2026, https://www.4dtech.com/ford-explorer-20-24-start-stop-eliminator/
11. Security Gateway Bypass Module - ZAutomotive, accessed January 3, 2026, https://www.zautomotive.com/products/z_sgw
12. Ford Escape Gateway Module : r/CarHacking - Reddit, accessed January 3, 2026, https://www.reddit.com/r/CarHacking/comments/xvy88d/ford_escape_gateway_module/
13. Autel CAN FD Adapter Compatible with Autel VCI Maxisys Tablets - ABKEYS, accessed January 3, 2026, https://abkeys.com/products/autel-can-fd-adapter-compatible-with-autel-vci-maxisys-tablets-1409
14. Autel CAN FD Adapter For Ford GM 2018-2021 Works With MS906, MS906BT - AutelTool.us, accessed January 3, 2026, https://www.auteltool.us/products/autel-can-fd-adapter-for-ford-gm
15. Autel - CAN FD Adapter for 2018-2020 Ford / GM Vehicles for Sale | UHS Hardware, accessed January 3, 2026, https://www.uhs-hardware.com/products/autel-can-fd-adapter
16. CAN FD Adapter for Autel MaxiSys Gen1 and Gen2 - AESwave.com, accessed January 3, 2026, https://www.aeswave.com/can-fd-adapter-for-maxisys-gen1-and-gen2-p9903.html
17. Ford factory alarm mode how to disable to add keys? IM608 - Autel Support Communities, accessed January 3, 2026, https://bbs.autel.com/autelsupport/Diagnostics/33100.jhtml?createrId=1315934&view=1
18. 2 Replacement for 2018 2019 2020 Ford Explorer Smart Fob Remote Car Key Entry | eBay, accessed January 3, 2026, https://www.ebay.com/itm/395790849720
19. Ford Smart Key Fob 2018-2022 - OEM Refurbished - Best Key Solution, accessed January 3, 2026, https://www.bestkeysolution.com/products/2018-2019-ford-expedition-explorer-edge-remote-start-prox-smart-key-factory-fcc-id-m3n-a2c931426-164-r8198
20. Bad Body Control Module Symptoms To Never Ignore - Flagship One Blog, accessed January 3, 2026, https://www.fs1inc.com/blog/bad-body-control-module-symptoms-to-never-ignore/
21. Ford Explorer Immobilizer Non-Start Issue FIX!! - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=YP2c0ujWpL0
22. 10 Steps for 100% Safe Car Key Programming (AVOID BRICKING!) - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=lR9jv9WjwGk
23. 2020 Ford Explorer Smart Key Programming with the Advanced Diagnostics Smart Pro, accessed January 3, 2026, https://www.youtube.com/watch?v=BK7dpcu06gE
24. OEM 2018 2019 2020 2021 2022 FORD EXPLORER REMOTE START Smart KEY FOB Great Cond | eBay, accessed January 3, 2026, https://www.ebay.com/itm/126699918802
25. Frequency In Ranger 2020 Xlt 315mhz or 902mhz all key lost Flip key : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1bnwhiv/frequency_in_ranger_2020_xlt_315mhz_or_902mhz_all/
26. 2020 Ford Explorer Smart Key Fob PN: 164-R8244, accessed January 3, 2026, https://remotesandkeys.com/products/2020-ford-explorer-remote-head-key-9000
27. 2020 Ford Explorer Remote Key Fob - CarandTruckRemotes, accessed January 3, 2026, https://www.carandtruckremotes.com/products/2020-ford-explorer-remote-key-fob
28. 2020 Ford Explorer Flip Key Fob 3B FCC# N5F-A08TAA - 164-R8269 - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2020-ford-explorer-flip-key-fob-3b-fcc-n5f-a08taa
29. M3NA2C931423 315MHz Keyless Entry Remote Key Fob for Ford Fusion 2017-2020 for Ford Explorer 2018-2022 ID49 Replacement Car Key - Walmart.com, accessed January 3, 2026, https://www.walmart.com/ip/M3NA2C931423-315MHz-Keyless-Entry-Remote-Key-Fob-for-Ford-Fusion-2017-2020-for-Ford-Explorer-2018-2022-ID49-Replacement-Car-Key/15257909648
30. CN018109 315/434/868/902 Remote Key For Ford Edge Explorer Expedition Fusion Mondeo F150 Replacement Smart Keyless Proximity - AliExpress, accessed January 3, 2026, https://www.aliexpress.com/i/1005002913209686.html
31. Ford Police InterceptorÂ® | Purpose-Built Features, accessed January 3, 2026, https://www.ford.com/police-vehicles/features/purpose-built/
32. 2020 Utility Police Interceptor Order Guide - Nevada State Purchasing!, accessed January 3, 2026, https://purchasing.nv.gov/uploadedfiles/purchasingnvgov/content/Contracts/Vehicles/pfordcint.pdf
33. FACTORY OPTIONS 2020 Ford Interceptor Complete FULL GUIDE - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=ZgrNhk4MrZ4
34. Ford Police Fleet Key | Lockjaw MFG., accessed January 3, 2026, https://www.lockjawmfg.com/product-page/ford-police-car-fleet-key
35. Ford Fleet Varietal Key Set - Red Team Tools, accessed January 3, 2026, https://www.redteamtools.com/ford-fleet-varietal-key-set/
36. 2020 Police Interceptor Utility RKE Fob Programming : r/Ford - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Ford/comments/1hxns54/2020_police_interceptor_utility_rke_fob/
37. OEM Ford Transponder Key - Features Embedded Anti-Theft Chip For Enhanced Security for 2021 Ford Explorer - Car Keys Express, accessed January 3, 2026, https://store.carkeysexpress.com/keys-and-remotes/Ford/Explorer/2021/1010717-oem-ford-transponder-key-features-embedded-anti-theft-chip-for-enhanced-security
38. Original Lishi 2-1 Pick/Decoder for HU198 for New Ford Keyway - CLK Supplies, accessed January 3, 2026, https://www.clksupplies.com/products/original-lishi-2-1-pick-decoder-for-hu198-for-new-ford-keyway
39. Original Lishi 2-In-1 Pick and Decoder HU198 - Best Key Supply, accessed January 3, 2026, https://www.bestkeysupply.com/products/original-lishi-2-in-1-pick-and-decoder-hu198-l20
40. ORIGINAL LISHI HU198 FORD 2017 NEW KEYWAY 2-IN-1 PICK â ANTI-GLARE - - SFFobs, accessed January 3, 2026, https://www.sffobsinc.com/product/original-lishi-hu198-ford-2017-new-keyway-2-in-1-pick-anti-glare/
41. How To Pick And Decode The New Ford HU198 Lock Using An Original Mr Li Pick & Decoder - Keyprint Security Ltd, accessed January 3, 2026, https://www.keyprint.co.uk/news/how-to-pick-and-decode-the-new-ford-hu198-lock-using-an-original-mr-li-pick-decoder
42. Ford Jaguar HU198 Picking and Decoding Guide - TradeLocks Blog, accessed January 3, 2026, https://blog.tradelocks.co.uk/picking-decoding-ford-hu198-genuine-lishi/
43. HU198 Lishi doesn't work on a '23 F150. Is there a newer one I am unaware of? - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/11b4ntv/hu198_lishi_doesnt_work_on_a_23_f150_is_there_a/
44. Original Lishi - Ford 2017+ HU198 - 2-In-1 Pick/Decoder - AG - Royal Key Supply, accessed January 3, 2026, https://royalkeysupply.com/products/original-lishi-ford-2017-hu198-2-in-1-pick-decoder-ag-1
45. How do I find the intelligent key backup slot? - Ford, accessed January 3, 2026, https://www.ford.com/support/how-tos/keys-and-locks/replace-and-reprogram-keys/how-do-i-find-the-intelligent-key-backup-slot/
46. Manual Start 2020 Ford Explorer with Key? - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Ford/comments/e7hnjy/manual_start_2020_ford_explorer_with_key/
47. ADC2020 - Ford Emulator Cable - For SMART Pro Programmer and Advanced Diagnostics, accessed January 3, 2026, https://www.uhs-hardware.com/products/advanced-diagnostics-adc2020-ford-emulator-cable-for-smart-pro-programmer-and-advanced-diagnostics
48. ADC2020 - Ford Emulator Cable - For SMART Pro Programmer and Advanced Diagnostics - InterContinental Warszawa, accessed January 3, 2026, https://warszawa.intercontinental.com/virtualtour/?pano=data:text%2Fxml,%3Ckrpano%20onstart=%22loadpano(%27%2F%5C%2Fp6.pics%2Fp%2F2395274224%27)%3B%22%3E%3C/krpano%3E
49. Smart Pro Game changing FORD active alarm software! - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=0Lcrf_yI0t8
50. FORD menu options for the ADC-2020 emulator! - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=8KutRnJw-Mc
51. Magnus - Active Alarm Bypass Kit for Ford - Keyless City, accessed January 3, 2026, https://keyless-city.com/products/magnus-active-alarm-bypass-kit-for-ford
52. Magnus - Ford Active Alarm Bypass Kit - OBDII Adapter & Extension Cable - UHS Hardware, accessed January 3, 2026, https://www.uhs-hardware.com/products/ford-active-alarm-bypass-kit-obdii-adapter-extension-cable-lock-labs
53. What are the different types of keys my vehicle can have? - Ford, accessed January 3, 2026, https://www.ford.com/support/how-tos/keys-and-locks/replace-and-reprogram-keys/what-are-the-different-types-of-keys-my-vehicle-can-have/
54. 2020 Ford Explorer; programming an ILCO look-a-like proximity key via the Smart Pro Lite!, accessed January 3, 2026, https://www.youtube.com/watch?v=PTWG0NEK8Fw
55. 2020 Ford Fusion programming ALL KEYS LOST with Autel IM608! disable delete reset Ford MyKey - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=vsyYpSHR4zI
56. 2019 Ford Explorer all keys lost via Smart Pro! - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=iHYcuVCaC5U
57. 1x New Replacement Key Fob for Select Ford Vehicles 315 MHz | eBay, accessed January 3, 2026, https://www.ebay.com/itm/285130148873
58. Ford Battery Monitoring System (BMS) Explanation | Page 2 - Maverick Truck Club, accessed January 3, 2026, https://www.mavericktruckclub.com/forum/threads/ford-battery-monitoring-system-bms-explanation.43482/page-2
59. What Vehicles Can Autel IM608 Work On? U.S. Compatibility Guide - UHS Hardware, accessed January 3, 2026, https://www.uhs-hardware.com/blogs/locksmith-industry-news/what-vehicles-can-the-autel-im608-work-on-a-complete-u-s-vehicle-compatibility-guide
60. Autel removing Ford IMMO : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1mirks4/autel_removing_ford_immo/
61. 2021 Ford Ranger All Keys Lost (Active Alarm) using Autel IM608 Pro2 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=ZgRVjtMG5hY
62. 2020 Ford Expedition all keys lost with an active alarm without NASTF or WiFi - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=BObe1auZW3M