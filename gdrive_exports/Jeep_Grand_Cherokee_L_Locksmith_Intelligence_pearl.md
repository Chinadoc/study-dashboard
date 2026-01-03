ï»¿2021 Jeep Grand Cherokee L (WL) Security Architecture & Forensic Locksmithing Dossier
1. Strategic Context and Architectural Evolution
The release of the 2021 Jeep Grand Cherokee L, designated internally as the WL platform, represents a watershed moment in the engineering history of Stellantis (formerly Fiat Chrysler Automobiles). This vehicle serves as the primary vector for the introduction of the "Atlantis" electrical architecture into the mass-market SUV segment, a transition that has fundamentally altered the operational landscape for automotive locksmiths, security researchers, and forensic technicians. Unlike its predecessor, the WK2 (2011â2021), which operated on the well-documented PowerNet architecture, the WL platform introduces a highly segmented, secure-gateway-enforced topology designed to support Level 2+ autonomous driving features, advanced connectivity, and over-the-air (OTA) update capabilities.
This architectural shift is not merely an incremental upgrade but a complete reimagining of the vehicle's nervous system. The implications for third-party access are profound. Where the WK2 allowed relatively permissive access to the Controller Area Network (CAN) bus via the OBDII port for key programming and diagnostics, the WL platform enforces a strict "Zero Trust" model. The Central Gateway (SGW) acts as a formidable firewall, isolating the diagnostic port from the vehicle's critical control networks, including the Interior High-Speed CAN (CAN-IHS) and the CAN-C powertrain bus.1
For the forensic locksmith, this necessitates a paradigm shift from software-based exploits to physical layer interventions. The days of simple "plug-and-play" key programming are effectively over for this lineage of vehicles. The integration of the Radio Frequency Hub Module (RFHM) into the vehicle's core security stackâlinking it inextricably with the Powertrain Control Module (PCM) and Body Control Module (BCM)âmeans that a failure in the immobilizer system is no longer just a "no-start" condition; it is a total system lockout that can immobilize the transmission via the Brake Transmission Shift Interlock (BTSI) and disable passive entry systems entirely.1
Furthermore, the launch of the WL platform occurred during the height of the global semiconductor crisis. This geopolitical supply chain constraint forced Stellantis to utilize varied suppliers for electronic control units (ECUs), leading to a fragmentation in hardware revisions. The RF Hub, specifically, has seen multiple iterations, some of which exhibit extreme sensitivity to aftermarket interrogation commands. This volatility has birthed the "Soft Lock" phenomenonâa catastrophic failure mode where the RF Hub enters a suspended bootloader state and refuses to exit, rendering the vehicle a "brick".3
This report provides an exhaustive forensic analysis of the WL platformâs security architecture. It synthesizes technical service bulletins, proprietary diagnostic manuals, and field intelligence from the global locksmith community to establish a definitive operational doctrine for the 2021 Jeep Grand Cherokee L.
2. The Radio Frequency Hub Module (RFHM): Architecture and Topology
The Radio Frequency Hub Module (RFHM) is the operational center of gravity for the WL platform's access control system. To understand the failures plaguing the locksmith industry, one must first understand the module's elevated role within the vehicle's topology.
2.1 Functional Integration and Authority
In previous generations, the RF Hub was primarily a receiverâa passive listener that demodulated 315 MHz or 433 MHz signals from the key fob and passed a "valid/invalid" flag to the Wireless Control Module (WCM) or BCM. In the WL architecture, the RFHM is an active logic controller with executive authority over vehicle immobilization.1
The RFHM communicates directly with the Ignition Node Module (IGNM) over a private serial bus, creating a secure, point-to-point link that is invisible to the main CAN bus. This ensures that the physical act of pressing the "Start" button is verified against the cryptographic signature of the key fob within milliseconds, without the latency or vulnerability of the public data bus. Simultaneously, the RFHM broadcasts authorization messages over the CAN-IHS to the Body Control Module (BCM) and bridges to the CAN-C to authorize the Powertrain Control Module (PCM).1
Crucially, the RFHM controls the Brake Transmission Shift Interlock (BTSI) solenoid. This is a critical safety and security feature. If the RF Hub detects a security anomalyâsuch as a failed "handshake" during a programming attempt or an invalid key signatureâit defaults to a "Lock" state. In this state, it physically cuts power to the BTSI solenoid, mechanically locking the transmission in Park. This explains why a "bricked" RF Hub results in a vehicle that cannot be shifted into Neutral for towing, complicating recovery operations significantly.1
2.2 Physical Displacement and Accessibility
One of the most disruptive changes in the WL platform is the physical relocation of the RFHM. For over a decade, technicians could expect to find the RF Hub behind the rear quarter trim panels, easily accessible for voltage testing or replacement. In the Grand Cherokee L (WL), Stellantis engineers moved the module to the center rear of the headliner, directly above the cargo area liftgate.4
This decision appears to be driven by RF propagation requirements. Placing the receiver high in the vehicle, away from the steel chassis of the quarter panels, theoretically improves the range and reliability of the Remote Keyless Entry (RKE) and Passive Entry (PE) systems. However, for the service technician, this location is a logistical nightmare.
Accessing the module now requires a delicate "headliner lowering" procedure.4 The headliner is a molded composite board, prone to creasing and fabric delamination if bent beyond a certain degree. To access the RF Hub, a technician must:
1. Remove the D-pillar trim panels.
2. Disengage the rear grab handles.
3. Remove the rear header trim panel using a non-marring trim stick to pop the retaining clips.4
4. Carefully lower the headliner sufficiently to reach the module connectors without inducing a permanent crease in the material.
This inaccessibility has profound implications for "All Keys Lost" (AKL) scenarios. In previous vehicles, if OBD programming failed, a technician could quickly remove the RF Hub and read the EEPROM data directly on a workbench ("bench programming"). On the WL, the labor time and liability associated with dropping the headliner discourage this approach, forcing technicians to rely heavily on OBD-based exploits that carry higher bricking risks.4


  



2.3 Network Topology: CAN-IHS and the Secure Gateway
The WL's nervous system relies on a segmented Controller Area Network (CAN). The RF Hub resides on the Interior High-Speed CAN (CAN-IHS), a bus network operating at 125 kbps or 500 kbps depending on the specific sub-architecture.2 This network handles non-critical body functions like climate control, infotainment, and door locks.
However, the RF Hub must also communicate with the Powertrain Control Module (PCM), which lives on the CAN-C (Powertrain CAN), running at a robust 500 kbps.2 In the PowerNet architecture (WK2), these buses were bridged by a Central Gateway that allowed relatively free flow of diagnostic messages. In the Atlantis architecture (WL), this bridge is guarded by the Secure Gateway Module (SGW).
The SGW is a cybersecurity device introduced to prevent remote hijacking of the vehicle (a response to the famous 2015 Jeep Hack). It physically isolates the OBDII port (pins 6 and 14) from the internal vehicle networks.2 When a diagnostic tool connects to the OBDII port, it can only read data. Any attempt to write dataâsuch as sending a command to the RF Hub to enter "Program Mode"âis blocked unless the tool presents a cryptographic certificate authorized by Stellantis (via AutoAuth).
For locksmiths using third-party tools (Autel, SmartPro) that may not always have perfect implementation of these certificates, or when working offline, the SGW represents a hard wall. This has necessitated the "Bypass" operational doctrine, where technicians physically disconnect the SGW or tap into the CAN bus behind the firewall, typically at the Star Connector.7
The Star Connector acts as a physical hub where multiple modules on the same CAN bus connect. In the WL Grand Cherokee L, the CAN-IHS and CAN-C Star Connectors are located in the passenger footwell, behind the kick panel.7 By plugging a "12+8" bypass cable or a direct CAN probe into this block, the locksmith effectively becomes an insider, bypassing the SGW entirely and gaining direct access to the RF Hub's communication lines.
3. Vulnerability Analysis: The "Soft Lock" Event
The most critical operational risk identified in the forensic analysis of the WL platform is the RF Hub "Soft Lock," colloquially known in the industry as "bricking the car." This failure mode is catastrophic, immediate, and often difficult to reverse without dealer intervention.
3.1 The Mechanics of Failure: Bootloader Injection
To understand why the RF Hub bricks, we must understand how aftermarket tools program keys. The OEM method (wiTECH) uses a pre-authorized diagnostic routine that instructs the RF Hub to enter learning mode using a verified PIN. Aftermarket tools, however, often rely on exploits to bypass wait times or security delays.
When an Autel IM608 or SmartPro attempts to "Read PIN" or "Program Key" on a 2021+ WL, it often attempts to inject a custom bootloader into the RF Hub's RAM.3 This bootloader is a small piece of code designed to suspend the module's normal operating system and grant the tool direct access to the EEPROM or Flash memory where the PIN and key data are stored.
The "Soft Lock" occurs when this process is interrupted or mismatched.
1. Interruption: If the connection to the CAN bus is unstable (e.g., loose probes at the Star Connector) or if the vehicle battery voltage drops below a critical threshold (typically 12.0V) during the bootloader execution, the module hangs.3
2. Mismatch: If the tool attempts to load a bootloader designed for an older firmware revision onto a newer "AM" suffix RF Hub, the execution fails.3
In either case, the RF Hub remains stuck in the "Bootloader" state. It does not reboot into its normal operating system. Because the normal OS is not running, the module ceases to transmit its "heartbeat" on the CAN bus. The BCM and PCM, detecting silence from the RF Hub, assume a security breach or hardware failure and engage total immobilization.1
3.2 Symptomatology of a Bricked Unit
The forensic signature of a soft-locked RF Hub is distinct and consistent across field reports:
* "Service Passive Entry" Warning: This message appears prominently on the Instrument Cluster Display (ICD).3 It indicates that the BCM cannot communicate with the passive entry controller (the RF Hub).
* Ignition Lockout: The Start/Stop button becomes unresponsive. The vehicle will not crank, and often will not even cycle to "Accessory" or "Run" mode.1
* Power Down Failure: In a particularly distressing variation, if the bricking occurs while the ignition is ON, the vehicle may refuse to shut off. The BCM requires a handshake from the RF Hub to authorize the power-down sequence; without it, the system hangs in an "On" state, draining the battery.3
* TPMS Light: The Tire Pressure Monitoring System warning light illuminates or flashes. The RF Hub is responsible for receiving signals from the TPMS sensors; a dead hub results in a loss of tire pressure data.10
* No Communication: A diagnostic scan will reveal that the RF Hub (Radio Frequency Hub) is "Not Communicating" or "Offline" on the network topology map.
3.3 The P0513 Invalid SKIM Key Code
A related but distinct failure mode involves the Diagnostic Trouble Code (DTC) P0513: Invalid SKIM Key. This code typically appears after a failed programming attempt or a module replacement that was not followed by a proper synchronization routine.11
The P0513 code does not necessarily mean the key is bad; it means the Security Seed exchange has failed. The WL immobilizer system uses a rolling code seed exchange between the PCM, BCM, and RF Hub. If the PCM has been reflashed or if the RF Hub has been reset, the "Seed Request" from the PCM may not match the response from the RF Hub. The PCM, acting as the final enforcement point for engine operation, disables the fuel injectors and spark.
Technical Service Bulletin (TSB) documents indicate that resolving P0513 often requires running the "PCM Replaced" routine in the diagnostic software. This forces the PCM to delete its stored security data and request a new seed from the RF Hub/BCM, effectively re-pairing the modules.12 If the RF Hub is soft-locked, however, it cannot respond to this request, and the P0513 code will persist until the hub is recovered.


  



4. Diagnostic Command & Control: Operational Procedures
The operational landscape for programming the WL Grand Cherokee is dominated by three primary ecosystems: the Autel MaxiIM series, the Advanced Diagnostics SmartPro, and the OEM wiTECH 2.0 system. Each platform requires specific protocols and hardware configurations to navigate the Atlantis architecture safely.
4.1 Autel MaxiIM (IM508 / IM608) Procedures
The Autel ecosystem is the most widely used among independent locksmiths but also accounts for a significant portion of reported failures due to its aggressive "bootloader" approach to PIN reading.
Connection Protocol:
The standard OBDII connection is insufficient due to the Secure Gateway. Autel users utilize the "12+8" Bypass Cable.13
1. Locate Star Connector: The technician must locate the Star Connector block in the passenger footwell/kick panel area.
2. Disconnect SGW/Bridge: The 12+8 cable is plugged directly into the Star Connector, physically bridging the tool to the vehicle's internal CAN lines.15
3. Vehicle Selection: It is imperative to select the specific "Jeep Grand Cherokee L (2021+)" menu. Selecting the "Grand Cherokee (2014-2021)" menuâwhich corresponds to the WK2âwill cause the tool to send incompatible CAN messages, increasing the risk of a soft lock.16
Universal Key Generation:
Given the shortage of OEM keys, many locksmiths utilize the Autel KM100 or XP400Pro to generate "Universal Smart Keys." The Autel universal remotes must be generated specifically for the M3NWXF0B1 FCC ID and Hitag AES protocol before programming.17 Attempting to program a blank universal key that has not been "generated" (pre-coded) with the correct firmware will result in a "Key Not Detected" failure during the learning phase.
Risk Mitigation:
The "Auto Scan" function should be avoided on the WL platform. Autel technical support advises manually selecting the vehicle model and year to ensure the correct communication protocol is loaded into the VCI (Vehicle Communication Interface) before any data packets are sent to the car.3 Furthermore, a battery maintainer providing a stable 13.5Vâ14.0V is mandatory; the WL's heavy electronic load can cause voltage sags during the 5-10 minute PIN reading process, leading to bootloader failure.
4.2 Advanced Diagnostics (SmartPro) Procedures
The SmartPro platform offers a more guided, albeit token-based, approach. However, confusion regarding cable selection has been a persistent issue in the community.
The Cable Controversy: ADC2011 vs. ADC2012:
* ADC2011: This is the standard "Star Connector" cable. It connects to the CAN-C star connector in the passenger footwell. This is the correct and recommended cable for standard key programming on the WL Grand Cherokee L.19 It allows the SmartPro to communicate with the RF Hub via the CAN bus, bypassing the SGW.
* ADC2012: This cable is designed for a direct physical connection to the RF Hub itself. While theoretically more secure, it requires accessing the RF Hub in the headliner. Due to the difficulty of lowering the headliner, this cable is generally reserved for "All Keys Lost" scenarios where the alarm is active and blocking CAN communication, or when the ADC2011 fails to communicate.8
* Verdict: For 95% of use cases, the ADC2011 at the passenger kick panel is the standard operating procedure.
Software Modules:
SmartPro users must ensure they have the ADS2324 (Chrysler 2021) software module active. This software is specifically written for the Atlantis architecture and includes the necessary bypass algorithms for the new RF Hub security.23 Note: Reference to "Nissan 2022 ADS2326" in some research snippets is a red herring; that software is for Nissan proximity keys and is irrelevant to the Jeep WL.24
4.3 OEM Methodology: wiTECH 2.0
The "Gold Standard" for safety is the Stellantis wiTECH 2.0 system. Unlike aftermarket tools, wiTECH does not "hack" the RF Hub to read the PIN.
Operational Flow:
1. Authentication: The technician logs into the wiTECH 2.0 cloud interface using a specialized J2534 pass-through device (such as the CarDAQ Plus 3).25
2. PIN Acquisition: The PIN code is not read from the car. The technician must obtain the 4-digit PIN from the NASTF (National Automotive Service Task Force) Vehicle Security Professional (VSP) registry or the dealer's DealerConnect portal using the VIN.25
3. Programming Routine: The technician navigates to "Miscellaneous Functions" -> "Program Ignition Fobic." The software prompts the user to enter the PIN manually.
4. Execution: The tool instructs the RF Hub to open a learning window. The user presses the "Unlock" button on the fob while holding it near the center console (the location of the low-frequency antenna).
Safety Profile:
Because wiTECH uses the RF Hub's native diagnostic subroutines rather than a bootloader injection exploit, the risk of "bricking" is negligible. This makes it the preferred method for risk-averse shops, despite the high cost of subscriptions (Tech Authority, wiTECH licensing) and hardware.25


  



5. Signal Intelligence: Keys, Fuses, and Interference
Successful forensic interaction with the WL platform requires precise knowledge of the hardware components, specifically the key fobs and the electrical distribution system.
5.1 Key Fob Forensics: Specifications and Incompatibilities
The WL key fob is visually distinct (often square/rectangular) and electronically incompatible with the previous WK2 generation.
* FCC ID: M3NWXF0B1 (also documented as M3N-97395900).26 This identifies the transmitter's regulatory profile.
* Operating Frequency: 433.92 MHz (often simplified to 434 MHz). This frequency is standard for global platforms but differs from the 315 MHz used in some older US-market Chryslers.26
* Transponder Protocol: HITAG AES. This is a 128-bit encryption standard, significantly more secure than the HITAG 2 or PCF7953 chips used in the WK2. The shift to AES (Advanced Encryption Standard) is part of the "Atlantis" security upgrade. Aftermarket tools must be capable of pre-coding this specific transponder type.28
* Emergency Key Blade: The WL platform abandoned the long-standing "Y160" (Chrysler) keyway in favor of the SIP22 (Fiat) keyway.29 This is a milled "laser cut" key. Locksmiths must have a side-milling key machine (e.g., Condor, Triton) and the correct SIP22 jaw to cut the emergency blade. The older Y160 duplicators will not work.
5.2 Environmental Vulnerability: Short Range Radar (SRR) Interference
A unique operational anomaly discovered in the WL platform is its susceptibility to RF interference from its own safety systems. The Short Range Radar (SRR) sensors, used for Blind Spot Monitoring (BSM) and Cross-Path Detection, operate in frequency bands that can produce harmonics interfering with the 433 MHz Low Frequency (LF) challenge signal from the key fob.31
In "All Keys Lost" programming scenarios, if the vehicle's alarm is active or the system is in a "waked up" state, the radar sensors may flood the immediate area with RF noise. This results in the RF Hub failing to detect the new key fob during the programming window, even if the key is perfectly good.
Mitigation Protocol (Fuse Pulling):
To ensure a "clean" RF environment during programming, forensic protocols recommend disabling the radar and, in some cases, power-cycling the RF Hub itself. This is achieved by pulling specific fuses.
* Passenger Compartment Fuse Box (Under Dash):
   * F28 (10A Red): Short Range Radar (Rear Right/Left).32
   * F31 (10A Red): Radio Frequency Hub (RFHM). Pulling this performs a soft reset of the hub.32
* Power Distribution Center (Under Hood):
   * F05 (10A Red): Primary power for the RF Hub. Pulling this along with F31 ensures a complete power cut.32
   * F11 (10A Red): Blind Spot Sensors / SRR.32
   * F12 (10A Red): Short Range Radar (Front Right/Left).32


  



6. Field Recovery Protocols
When a "Soft Lock" occurs, the window for recovery is narrow. The following protocols prioritize non-invasive methods before escalating to hardware replacement.
6.1 The "Hard Reset" Protocol
The first line of defense against a "Service Passive Entry" lock or a confused RF Hub is a complete power cycle. The RF Hub contains capacitors that can maintain volatile memory (and the corrupt bootloader state) for several minutes after power is removed.
1. Disconnect Battery: Remove the negative terminal of the main 12V battery.
2. Capacitor Discharge: Wait a minimum of 10-15 minutes. Some technicians advise touching the negative cable to the positive cable (while disconnected from the battery!) to instantly discharge capacitors, though this carries risks for other modules.3
3. Fuse Pull Alternative: Alternatively, pull F31 (Passenger) and F05 (Underhood). This cuts power specifically to the RF Hub without resetting radio presets or seat memory, which is preferable for customer relations.32
4. Reconnect and Test: Re-energize the system. If the "Service Passive Entry" message clears, the module has successfully exited the bootloader loop.
6.2 Dealer Recovery (The "PCM Replaced" Routine)
If the Hard Reset fails, the module likely has corrupted configuration data. The "PCM Replaced" routine in wiTECH can sometimes save a "soft-bricked" system by forcing the PCM to re-request the security seed from the RF Hub.12
* Procedure: In wiTECH, run the "PCM Replaced" function. This initiates a fresh handshake. If the RF Hub is alive but out of sync (causing P0513), this will resolve it. If the RF Hub is unresponsive to CAN requests, this will fail.12 This highlights the importance of the distributed security modelâthe PCM can be used to "jumpstart" the security credentials of the RF Hub.
6.3 Hardware Replacement and Bench Programming
In cases of permanent corruption (true "brick") or hardware failure (e.g., from water intrusion or voltage spikes), replacement is the only option.
* Part Sourcing: Requires a new RF Hub ending in the correct revision (e.g., "AM"). Installing a used module is problematic because the VIN is written permanently to the module's EEPROM.4
* Bench Connection: For advanced forensic technicians, it is possible to communicate with the RF Hub on the bench to attempt EEPROM recovery or data transfer. The pinout for the RF Hub typically follows standard Stellantis patterns, but specialized harnesses are required.34
* Restore Vehicle Configuration: After installing a new hub, the "Restore Vehicle Configuration" routine in wiTECH must be run. This downloads the vehicle's specific option codes (Proxi Configuration) from the central server and writes the VIN to the new hub.36 Failure to do this will result in a vehicle that starts but shuts off after a few seconds due to VIN mismatch.
7. Case Studies and Community Intelligence
The locksmith community, organized loosely on platforms like Reddit and specialized forums, serves as a distributed early warning system for these failures.
The "Liability" Consensus:
Experienced locksmiths view the 2021+ WL as a "high-risk" vehicle. Unlike the reliable WK2, the WL has a high probability of complicating a simple job. Many refuse to attempt "All Keys Lost" scenarios without OEM tools, citing the high cost of replacing a bricked RF Hub (approx. $500 for the part + 4 hours of labor to drop the headliner) versus the profit margin of a single key programming job.3 The phrase "Dealer Only" is frequently applied to this vehicle in discussion threads, reflecting a risk-averse posture.
The "Cable" Confusion:
A significant amount of community chatter revolves around the specific 12+8 cables. Cheap clones from Amazon often fail to make proper contact with the Star Connector pins, leading to connection drops mid-programming. The consensus is to use high-quality cables (e.g., ADC2011 or genuine Autel/G-Box adapters) and to physically inspect the pins of the Star Connector for corrosion or damage before connecting.19
Interference Anecdotes:
Real-world reports validate the "Interference" theory. Users have reported their key fobs failing to work near specific buildings (likely utilizing heavy industrial RF automated doors) or when parked near other vehicles with active radar systems. In one case, a technician noted that the key would only program when the vehicle was moved away from a specific area of a parking lot, suggesting environmental RF saturation can block the low-power 433 MHz programming signal.31
8. Conclusion
The 2021 Jeep Grand Cherokee L (WL) security architecture is a hostile environment for the unprepared forensic locksmith. The convergence of the Atlantis electrical architecture, the Secure Gateway, and the highly sensitive RF Hub creates a "minefield" where a single misstepâbe it a voltage drop, a wrong menu selection, or a cheap cableâcan result in a catastrophic "soft lock."
The era of casual OBDII programming is effectively over for this platform. Success requires a disciplined, "surgery-grade" approach:
1. Verification: Confirming the platform (WL vs WK2) and the part numbers.
2. Stabilization: Using battery maintainers to guarantee voltage.
3. Access: utilizing the Star Connector (12+8) bypass method rather than hoping for an OBDII exploit.
4. Preparedness: Having the capability to perform hard resets (fuse pulling) and holding the correct SIP22 mechanical key cutting equipment.
For the forensic investigator or locksmith, the WL platform is not just another car; it is a test of technical rigor. Those who respect the architecture and adhere to the protocols outlined in this dossier will succeed; those who treat it like a "legacy" Chrysler will inevitably face the "Service Passive Entry" screen of death.
Works cited
1. STOP! JeepÂ® Tells Dealers To Suspend Sales Of Its All-New Grand Cherokee (WL)!, accessed January 3, 2026, https://moparinsiders.com/stop-jeep-tells-dealers-to-suspend-sales-of-its-all-new-grand-cherokee-wl/
2. Hacking the Jeep Interior CAN-Bus | Chad Gibbons' Blog, accessed January 3, 2026, https://chadgibbons.com/2013/12/29/hacking-the-jeep-interior-can-bus/
3. Locked RF Hub 22 Renegade : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1m3kvyj/locked_rf_hub_22_renegade/
4. Customer Satisfaction Notification Z23 Radio Frequency Hub Module - nhtsa, accessed January 3, 2026, https://static.nhtsa.gov/odi/tsbs/2022/MC-10228024-9999.pdf
5. How To Remove 2022-2026 Jeep Grand Cherokee Overhead Console. - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=v_ynAEpVHAY
6. CAN Bus wave pattern for 2007 Jeep GC WK? - Pico Technology - PicoScope Automotive, accessed January 3, 2026, https://www.picoauto.com/support/viewtopic.php?t=21894
7. 2021 Grand Cherokee L Star Connector Location : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/xp3sle/2021_grand_cherokee_l_star_connector_location/
8. Advanced Diagnostics ADC2012 Bypass Cable - Smallwood Lock & Supply, accessed January 3, 2026, https://smallwoodlock.com/advanced-diagnostics-bypass-cable-adc2012/
9. 2023 DODGE HORNET OWNER'S MANUAL - Dealer E Process, accessed January 3, 2026, https://cdn.dealereprocess.org/cdn/servicemanuals/dodge/ca/2023-hornet.pdf
10. Jeep Compass 2021 - New Key - SmartPro & ADC2012 Cable - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=ltoM4XisJZ0
11. P0513 Code: Invalid Immobilizer Key â Causes, Symptoms & Fix - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=-1VKKTkU-NE
12. No Start, After Flash And Or PCM Replace, DTC P0513 Invalid Skim - nhtsa, accessed January 3, 2026, https://static.nhtsa.gov/odi/tsbs/2022/MC-10220715-9999.pdf
13. (576) 2021 Jeep Grand Cherokee Location of SGW SGM Secure Gateway Module, accessed January 3, 2026, https://www.youtube.com/watch?v=NDHsbCQVylI
14. How to Locate the 12+8 Connector on a Jeep Grand Cherokee | Quick Guide - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=ZvjCyt7AAqQ
15. Read And Clear Codes 12+8 OBD adapter / Jeep Grand Cherokee Security Gateway Module location WK2 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=yT4RQkUbM-8
16. How to Program Jeep Grand Cherokee Key Fob - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=FRD_-4C0LWk
17. How I Programmed a Dodge/Chrysler/Jeep Key/Fobik key in Minutes with the Autel KM100, accessed January 3, 2026, https://www.youtube.com/watch?v=TAaZcM0YTHg
18. Smart Key_V1.60 Function List - Autel, accessed January 3, 2026, https://www.autel.com/u/cms/www/202210/24020108tdxp.pdf
19. 2021 Jeep Cherokee - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=ktd0nxdGIDw
20. Key Programming | The SMART PRO Programs a Proximity Key For a JEEP Cherokee!, accessed January 3, 2026, https://www.clksupplies.com/blogs/news/key-programming-the-smart-pro-programs-a-proximity-key-for-a-jeep-cherokee
21. Advanced Diagnostics - Chrysler / Dodge / Jeep Bypass Cable ADC2011 For SMART Pro Programmer - Keyless City, accessed January 3, 2026, https://keyless-city.com/products/advanced-diagnostics-chrysler-dodge-jeep-bypass-cable-adc2011-for-smart-pro-programmer
22. Chrysler, Dodge, Jeep SmartPro Cable for RFH - CLK Supplies, accessed January 3, 2026, https://www.clksupplies.com/products/chrysler-dodge-jeep-smartpro-cable-for-rfh-adc-2012
23. Advanced Diagnostics - ILCO.US, accessed January 3, 2026, https://www.ilco.us/support/ad-software-updates
24. Advanced Diagnostics - ADS2326 - 2022 - Nissan Proximity Key Software - UHS Hardware, accessed January 3, 2026, https://www.uhs-hardware.com/products/advanced-diagnostics-ads2326-2022-nissan-proximity-key-software
25. 2021 Jeep Grand Cherokee L (WL) proximity key programming WiTech 2.0 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=2N6N5FdK2sg
26. oem 2021 2022 2023 jeep grand cherokee l smart key remote fob m3nwxf0b1 68377534, accessed January 3, 2026, https://www.visualsp.com/949568/OEM-2021-2022-2023-JEEP-GRAND-CHEROKEE-L-SMART-KEY-REMOTE-FOB
27. 2021 Jeep Grand Cherokee L Smart Key 5B Fob FCC# M3NWXF0B1 - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2021-jeep-grand-cherokee-l-smart-key-5b-fob-fcc-m3nwxf0b1-aftermarket
28. 2021 Jeep Grand Cherokee L Smart Key Remote PN: 68377529AB, accessed January 3, 2026, https://remotesandkeys.com/products/2021-jeep-grand-cherokee-l-smart-key-remote-pn-68377529ab
29. 2015-2021 Jeep Fiat / Emergency Key Blade / SIP22 / (AFTERMARKET) - Keyless City, accessed January 3, 2026, https://keyless-city.com/products/2015-2021-jeep-fiat-emergency-key-blade-sip22-aftermarket
30. 2015-2021 Jeep / Fiat / SIP22 Emergency Key - My Key Supply, accessed January 3, 2026, https://www.mykeysupply.com/product/jeep-fiat-2015-2018-sip22-emergency-key/
31. fob interference ? : r/Jeep - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Jeep/comments/1e9ua1p/fob_interference/
32. Fuse box location and diagrams: Jeep Grand Cherokee (WL; 2021-2023) - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=yFAEM3n-6Xs
33. How To Fix Grand Cherokee âKey Fob Not Detectedâ â Battery, RFHUB & Antenna Reset, accessed January 3, 2026, https://www.youtube.com/watch?v=M3FKOJMuxw4
34. Bench Harness Pinouts - Custom ECM, accessed January 3, 2026, https://www.customecm.com/tune-file-repo-and-info-here/bench-harness-pinouts
35. RFHUB Programming and Algo scanning. - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=Gnm4VdDqcm4
36. Resetting your RF Hub after a Push Button Conversion (or you just had to replace the hub), accessed January 3, 2026, https://www.youtube.com/watch?v=CNwWHbK4bJk
37. All Keys Lost 2021 Grand Cherokee L : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/13foj7c/all_keys_lost_2021_grand_cherokee_l/
38. 2020 Jeep Grand Cherokee programming fail : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/158u2bo/2020_jeep_grand_cherokee_programming_fail/