ï»¿Title: The Convergence of Identity and Architecture: An Exhaustive Technical Dossier on the 2022 Mitsubishi Outlander (GN) and the Renault-Nissan-Mitsubishi Alliance Platform Integration
1. Executive Summary: The Engineering of an Alliance
The automotive landscape of the current decade is defined not by individual marque distinctiveness, but by the strategic homogenization of platform architectures. The 2022 Mitsubishi Outlander (chassis code GN) serves as the premier case study of this paradigm shift within the Renault-Nissan-Mitsubishi Alliance. It represents a pivotal moment in automotive history where Mitsubishiâs proprietary engineering lineage was largely supplanted by the Allianceâs shared CMF-C/D (Common Module Family) architecture. For the automotive locksmith, diagnostic engineer, and security specialist, this vehicle is, in functional reality, a Nissan Rogue (T33) wearing the "Dynamic Shield" aesthetic of Mitsubishi. This dossier provides an exhaustive technical analysis of the 2022 Outlander (GN), specifically tailored for professionals engaged in key programming, security diagnostics, and platform architectural analysis.
The transition from the legacy Mitsubishi GS platform (which still underpins the 2022 Outlander Sport/RVR) to the Nissan-derived CMF-C/D platform has fundamentally altered the locksmithing landscape. Traditional Mitsubishi protocols (MUT-III based) and mechanical keyways (MIT11/MIT8) have been rendered obsolete for this specific model, replaced by Nissanâs consultative diagnostics, High-Voltage (HV) security gateways, and HITAG-AES transponder logic.1 The implications of this shift are profound. Accessing the On-Board Diagnostics (OBD) system now requires bypassing a hardware-level firewall known as the Security Gateway (SGW), a direct inheritance from Nissanâs recent architecture and Fiat Chrysler Automobiles (FCA) influence. Furthermore, the programming environment has shifted from a server-dependent, PIN-code heavy structure to a rolling-code, encrypted exchange that often necessitates specialized 16+32 bypass cabling.1
This report will dissect these systems with granular detail, distinguishing clearly between the "Outlander" (GN) and the confusingly named, legacy-based "Outlander Sport," ensuring that the field operative can distinguish the correct procedural approach for the specific chassis in front of them. The convergence of platforms has created a fascinating "parts bin" scenario where Nissan and Mitsubishi keys are electronically identical but cosmetically distinct, creating both opportunities and pitfalls for the aftermarket service provider.
2. Historical Context: The Strategic Necessity of the Alliance
To understand the technical specifications of the 2022 Outlander, one must first understand the corporate maneuvering that birthed it. The Renault-Nissan-Mitsubishi Alliance is not merely a financial partnership; it is an industrial integration engine designed to reduce Research and Development (R&D) costs through "Leader-Follower" vehicle development schemes. In the case of the Compact SUV segment, Nissan acted as the "Leader" with the development of the T33 Rogue (X-Trail in other markets), and Mitsubishi acted as the "Follower," utilizing the architecture to create the GN Outlander.
This strategy was necessitated by Mitsubishiâs need to replace the aging "Project Global" architecture, which had served as the backbone for the Lancer and previous Outlander generations for over a decade. Developing a new platform from scratch is a multi-billion dollar endeavor. By adopting the CMF-C/D platform, Mitsubishi could bring a modern, highly competitive vehicle to market significantly faster. However, this efficiency comes at the cost of unique technical identity. The 2022 Outlander is built in Japan, whereas the Rogue is manufactured in Tennessee, yet they share the same DNA.3 This geographical disparity in assembly does not translate to a disparity in electronic architecture; the wiring harnesses, control modules, and security protocols remain uniform across the Alliance, dictating the procedures strictly for locksmiths and technicians worldwide.
3. Platform Architecture: The CMF-C/D Paradigm Shift
3.1 The Departure from Project Global
For over a decade, Mitsubishi relied on the "Project Global" architecture (GS platform), co-developed with DaimlerChrysler. This platform underpinned the Lancer, the Outlander (CW/GF), and the Outlander Sport (GA). Mechanics and locksmiths became accustomed to the specific idiosyncrasies of the ETACS (Electronic Total Automobile Control System) Body Control Modules (BCM) found in these vehicles. These systems were characterized by specific pin-out configurations on the OBDII port and a programming logic that was distinctly "Mitsubishi," often involving a specific MUT-III scan tool protocol.
The 2022 Outlander (GN) breaks this lineage entirely. It adopts the CMF-C/D platform, shared with the 2021+ Nissan Rogue (T33) and the Nissan Qashqai (J12). This is not merely a shared chassis; it is a shared electronic nervous system. The Controller Area Network (CAN) topology, the gateway logic, and the module vendors are predominantly Nissan-sourced.1
3.1.1 Implications for Diagnostics
The shift to CMF-C/D means that the 2022 Outlander does not "speak" Mitsubishi in the traditional sense. When a diagnostic tool queries the vehicle, the response structure mirrors that of a Nissan Rogue.
* Protocol: The vehicle utilizes the latest ISO 15765-4 CAN protocols but wrapped in Nissanâs proprietary diagnostic layer (equivalent to Consult-III Plus).
* Module Identification: The BCM part numbers often cross-reference directly with Nissan hardware. For instance, diagnostic scans on the Outlander (GN) will reveal data streams identical to the Rogue, identifying modules such as the IPDM E/R (Intelligent Power Distribution Module Engine Room), a hallmark of Nissan architecture.1
The integration is so deep that diagnostic tools often struggle to differentiate the two. Technicians using tools like the Autel IM608 have reported that selecting "Nissan Rogue 2021+" in the menu is often a more reliable path to programming the Mitsubishi Outlander than the Mitsubishi menu itself, especially in the early days of the model's release.4 This is a critical insight: the software identifier (SW ID) broadcast by the BCM is effectively a Nissan ID.
3.2 Visualizing the Platform Convergence
To fully grasp the extent of this rebadging and its impact on servicing, one must visualize the structural and electronic identity of the vehicle. The physical locations of critical modules have migrated from their traditional Mitsubishi locations to Nissan-standard positions.


  



3.3 The "Rebadging" Debate: Nuance in Engineering
While the electronic architecture is shared, it is crucial to acknowledge the mechanical tuning differences that Mitsubishi engineers implemented. Although the powertrain (2.5L 4-cylinder engine and CVT) is identical to the Rogue, offering 181 horsepower and 181 lb-ft of torque 3, the suspension tuning and all-wheel-drive logic (S-AWC) retain Mitsubishi's specific calibration. The Outlander is physically longer by 6 cm and wider by 5 mm than the Rogue, primarily to accommodate the third row of seats, a feature the Rogue lacks in this generation.3
However, these mechanical dimensions do not affect the locksmithing procedures. The elongation of the chassis does not change the CAN bus length limitations or the BCM location. The "Super All-Wheel Control" (S-AWC) system, while branded as Mitsubishi, communicates over the same CAN lines as Nissan's Intelligent AWD, utilizing the same wheel speed sensors and yaw rate sensors. Thus, for the purpose of electronic diagnostics, the "Mitsubishi-ness" is skin deep. The "brain" remains Nissan.
4. The Security Gateway (SGW) Firewall
The most significant hurdle for aftermarket professionals working on the 2022 Outlander is the presence of the Security Gateway Module (SGW). Introduced widely by FCA (Fiat Chrysler) in 2018 and subsequently adopted by the Renault-Nissan-Mitsubishi Alliance, the SGW acts as a firewall between the external world (the OBDII port) and the vehicleâs internal CAN networks.6
4.1 Historical Evolution and Purpose
The SGW was developed in response to rising concerns over automotive cybersecurity. Early demonstrations by researchers showed that vehicles could be hacked remotely or via the OBD port to control critical systems like braking and steering. In response, manufacturers began isolating the mission-critical networks (Private CAN) from the accessible networks (Public CAN).
In previous generations of Mitsubishi vehicles, the OBDII port (pins 6 and 14) connected directly to the vehicleâs CAN C (high speed) or CAN B (body) networks.7 This allowed any connected deviceâfrom a $10 Bluetooth dongle to a professional scan toolâto read data and write commands. A technician could simply plug in and command the BCM to "unlock doors," "program key," or "reset service light."
In the 2022 Outlander, the OBDII port connects only to the SGW.
* Public Sector: The OBDII port and Telematics unit (which connects to cellular networks).
* Private Sector: The BCM, ECM (Engine Control Module), ABS, and Immobilizer modules.
* The Firewall: The SGW filters all traffic. It acts as a digital bouncer. It allows "Read" commands (getting DTCs, viewing live data streams) to pass through, but it strictly blocks "Write" commands (active tests, key programming, code clearing, parameter resets) unless the tool possesses a digital certificate authorized by the OEM.8
4.2 The Operational Barrier
For the locksmith using aftermarket tools (like the Autel IM608, Smart Pro, or Lonsdor) that may not always have online OEM server access for Nissan/Mitsubishi, the SGW represents a hard stop. The diagnostic tool will report "Communication Failure," "Security Access Denied," or simply fail to execute the command when attempting to enter the Immobilizer Key Learning mode. Unlike FCA vehicles, where AutoAuth accounts can unlock the gateway via Wi-Fi on the tool, Nissan and Mitsubishi have been slower to integrate with aftermarket authentication services, making the physical bypass the primary method of entry for independent repairers.1
4.3 The Physical Bypass: The 16+32 Solution
Since the digital "front door" is locked and the digital key (AutoAuth) is often unavailable or unreliable for this specific marque, locksmiths must use the "back door." This involves physically disconnecting the SGW from the network and bridging the public and private networks directly, effectively removing the firewall from the equation.
4.3.1 Component Location
Unlike some FCA vehicles (like the Jeep Grand Cherokee) where the SGW is buried deep behind the radio or instrument cluster requiring extensive disassembly, the 2022 Outlander (and Rogue T33) places the SGW in a relatively accessible location, much to the relief of technicians.
* Location: Under the driverâs side dashboard, typically above the kick panel or near the steering column base.10
* Identification: It is a black plastic module, roughly the size of a deck of cards. It is distinguished by having two distinct connectors plugged into it. While FCA uses a 12-pin and 8-pin configuration, the new Nissan architecture utilizes a 40-pin configuration logic, often split physically into two banks (16-pin and 32-pin logic) or a single block that requires a specific breakout cable.12
4.3.2 The Bypass Cable Procedure
To bypass the module, the technician performs the following procedure:
1. Locate: visually identify the SGW module under the dash.
2. Disconnect: Unplug the two connectors going into the SGW. These are the vehicle-side harnesses. One carries the lines from the OBD port, the other carries the lines to the internal CAN bus.
3. Bridge: Plug these vehicle-side connectors into a specialized "Nissan 16+32 Bypass Cable" (also referred to as the ADC-2017 cable in the Advanced Diagnostics ecosystem).1
4. Connect: Connect the standard OBDII end of the bypass cable to the key programmer (Autel, Smart Pro, etc.).
This cable essentially acts as a jumper. It physically connects the external diagnostic tool wires directly to the internal CAN bus wires, completely circumventing the SGW hardware. The reports confirm that for the 2022 Outlander (GN) and Rogue (T33), this cable is mandatory for All Keys Lost (AKL) situations and strongly recommended for Add Key situations to ensure stable communication.1
4.3.3 Operational Decision Logic: The Bypass Protocol
Technicians often waste valuable time attempting to program keys via the standard OBDII port, only to fail after the process has initiated. It is critical to understand the distinction between "Read" and "Write" access. Standard diagnostics (reading a Check Engine Light code) can be done without the bypass. However, Key Programming is a Write operation. It modifies the memory of the BCM. Therefore, the SGW will block it.
* Rule of Thumb: If the tool needs to change the state of the vehicle (programming, actuation, clearing codes), the 16+32 cable is required.
* Model Distinction: This applies only to the 2022+ Outlander (GN). The 2022 Outlander Sport (GA) uses the old architecture and does not require this bypass, using a standard OBD connection.
5. Diagnostic Protocols & Tooling
The transition to CMF-C/D requires a re-evaluation of the locksmith's toolkit. The protocols used are no longer the legacy Mitsubishi CAN implementations.
5.1 Protocol Analysis
The 2022 Outlander utilizes a high-speed CAN protocol compliant with ISO 15765-4, but the application layer is strictly Nissan Consult-III Plus derived.
* Legacy Mitsubishi: Used pin 1 for specialized signaling in some generations, and a specific baud rate for the ETACS system.
* Modern Alliance: Uses Pins 6 (CAN High) and 14 (CAN Low) exclusively for main communication, with the SGW managing the gateway.
* The "Nissan Menu" Phenomenon: Because the underlying protocol is Nissan's, many locksmiths find that their tools (Autel, Key Tool Plus) fail to communicate when "Mitsubishi Outlander 2022" is selected if the tool manufacturer has not perfectly updated the database pointers. However, selecting "Nissan Rogue 2021+" forces the tool to use the exact Nissan handshake protocol required by the BCM, resulting in successful communication.4 This "hack" works because the BCM part numbers and firmware versions are often identical or cross-compatible.
5.2 Tool-Specific Requirements
* Advanced Diagnostics (Smart Pro):
   * Software: ADS2326 (Nissan/Mitsubishi 2020+). This software is specifically designed for the CMF-C/D platform.1
   * Hardware: ADC-2017 Cable. This is the proprietary version of the 16+32 bypass cable.
   * Server Logic: The Smart Pro software is often described as "Server Connection NOT Required" or "Stand-alone" for the PIN bypass on these specific models, implying that the bypass cable allows the tool to directly manipulate the BCM memory to extract or overwrite the PIN data without needing a cloud calculation.1
* Autel (IM508/IM608):
   * Hardware: Autel 16+32 Gateway Adapter. This adapter connects between the main diagnostic cable and the bypass point.
   * Menu Path: IMMO > Mitsubishi > Manual Selection > Outlander > 2022- > Smart Key > Immo Status Scan > All Keys Lost.4
   * Alternative Path: IMMO > Nissan > Rogue > 2021+.
   * Password Calculation: The Autel system typically reads a rolling password (e.g., 20-digit or 22-digit). The system may prompt for a 4-digit PIN in some specific sub-routines (like "8A62"), but usually handles the complex calculation in the background.4
* Lonsdor/XTool:
   * These tools also list specific requirements for a "Nissan 40-pin BCM cable" or "16+32 connector," reinforcing that the hardware requirement is universal across all tool brands.11
6. Key Programming: The Core Procedure
The programming environment for the 2022 Outlander is a direct mirror of the Nissan Rogue T33, utilizing a Proximity (Prox) system also known as the Intelligent Key system.
6.1 The "All Keys Lost" (AKL) Preference
The security architecture of the CMF-C/D platform favors an "All Keys Lost" approach. Unlike older systems where one could simply "add" a key to an empty slot, the modern encryption handshake often requires a reset of the trust chain between the BCM and the keys.
* Data Erasure: The procedure typically begins by erasing all currently programmed keys from the BCM memory.1 This ensures that any lost or stolen keys are immediately invalidated.
* Risk: This procedure carries higher risk. If the programming fails after the erasure step (e.g., due to low battery or bad key), the vehicle is rendered immobile ("bricked") until the procedure is successfully completed. This highlights the absolute necessity of the SGW bypass cable and a stable power supply.
6.2 Step-by-Step Workflow
1. Preparation:
   * Ensure the vehicle battery is fully charged. Connect a specialized battery maintainer (not just a jumper pack) to maintain 13.5V+. Critical Note for PHEV: Access the 12V battery in the rear cargo area, not the under-hood points, to avoid voltage drop (See Section 10).
   * Ensure all keys to be programmed (at least one, preferably two) are present inside the vehicle.
   * Hazard lights should be ON in some procedures to wake the BCM.
2. Connection:
   * Locate the SGW under the driver's dash.
   * Disconnect the vehicle harnesses and install the 16+32 Bypass Cable.
   * Connect the programmer to the bypass cable.
3. Access:
   * Select the vehicle menu (Nissan Rogue 2021+ or Mitsubishi Outlander 2022).
   * Select "All Keys Lost" or "Program Smart Key".
4. Bypass & PIN:
   * The tool will communicate with the BCM. It will likely bypass the security PIN code automatically using the direct connection.
5. Learning Sequence:
   * The tool will prompt to "Place the first key on the Start Button."
   * Hold the logo side of the Smart Key against the Start/Stop button.
   * Press the Start button (ignition ON).
   * The instrument cluster should display a confirmation (e.g., "Key ID Registered" or security light flashes 5 times).15
   * Switch ignition OFF.
   * Repeat immediately for the second key.
6. Completion:
   * Disconnect the bypass cable.
   * Reconnect the SGW modules.
   * Test all remote functions (Lock, Unlock, Panic, Hatch).
   * Start the engine to verify the immobilizer handshake.
6.3 The "Add Key" Nuance
Snippet 1 suggests "Add Key ONLY Supported" for some Nissan Sentra models, while confirming "All Keys Lost Supported" for Outlander and Rogue. This distinction is vital. While "Add Key" is theoretically safer (it doesn't delete existing keys), the software capability on the aftermarket tools is often more robust for AKL on this specific platform. Locksmiths should prioritize the AKL method if "Add Key" fails or is unavailable in the menu, but must warn the customer that all previous keys will be deleted.
7. Transponder Forensics & Parts Bin Engineering
The convergence of platforms has created a scenario where Nissan and Mitsubishi keys are electronically identical but cosmetically distinct. This "parts bin" engineering allows for cross-compatibility that savvy locksmiths can exploit.
7.1 The Fob Specifications
* Model: 2022 Mitsubishi Outlander (GN).
* FCC ID: KR5TXPZ1 (Shared with Nissan Rogue T33) or KR5MTXN1 (Mitsubishi Specific Part Number).16
* Frequency: 433.92 MHz (often listed as 434 MHz).
* Chip Type: HITAG AES (4A Chip). This is a critical detail. Older Mitsubishis used ID46 or ID47 chips. The switch to HITAG AES (4A) is the definitive marker of the Renault-Nissan architecture.16
* Button Configuration: Typically 3 or 4 buttons (Lock, Unlock, Panic, Hatch).
7.2 The Rogue vs. Outlander Interchangeability
Research confirms that the 2021-2022 Nissan Rogue (T33) key fob (FCC ID: KR5TXPZ1) shares the exact same electronic architecture as the 2022 Outlander.1
* Can a Nissan Rogue key be programmed to an Outlander? Yes. The BCM does not distinguish between the plastic shell of the key, only the transponder ID and the remote frequency/encryption.
* Caveat: The buttons must match electronically. A 5-button Rogue key might program, but the "Remote Start" button might not function if the Outlander BCM isn't coded for it. However, the core functions (Start, Lock, Unlock) will work. This is a vital fallback for locksmiths who may stock Nissan keys but not the specific Mitsubishi-branded inventory. The underlying hardware is Continental, and the FCC ID KR5TXPZ1 is the "Skeleton Key" for the CMF-C/D platform in the North American market.


  



8. Mechanical Security: The Keyway Conundrum
A significant point of contention in the aftermarket dataâand a frequent source of frustration in the fieldâis the emergency key blade profile. The physical lock cylinder hidden inside the door handle determines which Lishi pick tool or key cutter jaw is required.
8.1 The MIT vs. NSN Confusion
* Legacy Mitsubishi: Uses MIT11 (Left groove) or MIT8 (Right groove), and newer laser keys like MIT3 (central groove).
* Nissan: Predominantly uses NSN14 (High security, 10-cut, usually external or internal track).
Snippet 24 lists the 2022 Outlander emergency key as "Keyway: MIT3". However, given the door handles and lock cylinders are sourced from the Nissan T33 supply chain, there is a high probability of NSN14 being the actual functional profile for the lock cylinder, even if aftermarket catalogs label it broadly as Mitsubishi. This is a common cataloging error during platform transitions. The MIT3 and NSN14 share similarities in that they are both high-security laser keys, but the warding and depth spacing differ.
8.2 Operational Strategy
A locksmith attending a 2022 Outlander (GN) lockout should be prepared with both NSN14 and MIT3 Lishi tools. The "Rebadged" nature strongly favors the NSN14 geometry, as retooling the door handle mechanism solely for a keyway change is economically inefficient in platform sharing. However, the external cap of the door handle may have been modified to accept a Mitsubishi-style blade for brand consistency. Visual inspection of the keyhole is the only definitive confirmation in the field.
9. PHEV-Specific Considerations: Power & Safety
The 2022 Outlander PHEV (Plug-in Hybrid Electric Vehicle) introduces high-voltage variables that the standard locksmith need not worry about, but the diagnostic specialist must respect. The PHEV system adds a layer of complexity to the simple act of providing auxiliary power during programming.
9.1 The 12V Battery Location Anomaly
In the gasoline (Internal Combustion Engine - ICE) model, the 12V battery is in the standard engine bay location. However, in the PHEV model, the engine bay is crowded with the inverter, electric motor components, and charging hardware. Consequently, the 12V Auxiliary Battery is relocated to the rear cargo area (boot).18
* Location: Hidden behind a side panel in the rear trunk/cargo space.
* Access: It requires removing plastic trim panels to access the terminals directly.
* Why this matters: Successful key programming requires stable voltage (13.5V+ recommended). If a locksmith attempts to hook a jump pack to the "jump posts" under the hood, they are connecting via a long cable run to the rear battery. During the high-current demands of a programming cycle (when modules wake up, fans spin, and relays click), the voltage drop across this length can be significant. A drop below 12V during the BCM writing phase can cause a failure or "brick" the BCM.
* Best Practice: For PHEV models, take the time to access the rear 12V battery directly and connect the power supply there. This ensures the BCM receives clean, stable power.
9.2 High Voltage (HV) Safety
While key programming rarely interacts with the HV system directly, the proximity to HV lines (orange cabling) requires caution.
* Service Plug: The HV service disconnect is located under the floor or center console area. It is generally not necessary to pull this for key programming.
* Interlock Logic: The vehicle will not start (Ready Mode) if the 12V battery is weak, even if the HV battery is full. The 12V system powers the contactors (relays) that engage the HV battery. Therefore, a "dead" PHEV is often just a dead 12V battery.
* Safety Precaution: If any work is done near the BCM (which often sits near HV routing in the dash), technicians must be aware of the orange cabling. Do not pierce or probe orange cables.21
10. The Legacy Trap: Outlander vs. Outlander Sport
A critical failure point for diagnostics is the confusion between the "2022 Mitsubishi Outlander" and the "2022 Mitsubishi Outlander Sport". These are two completely different vehicles sold under similar names in the same year.
* 2022 Outlander (GN): The new Nissan-based car. Requires 16+32 Cable. Uses HITAG AES (4A) keys. 434 MHz. The visual cue is the "Dynamic Shield" face and a modern floating infotainment screen.
* 2022 Outlander Sport (GA): The old GS-platform car (sold alongside the new one). Does NOT use the SGW (or uses a different, older config that is easily bypassed via OBD). Uses legacy Mitsubishi keys (ID47/PCF7961X). 315 MHz.15
If a locksmith attempts to program a 2022 Outlander Sport using the Nissan Rogue software/cable, it will fail because the protocols don't match. Conversely, treating the new GN Outlander like the old Sport will result in a total lack of communication because the SGW will block the tool. The technician must visually identify the vehicleâspecifically the interior dashboard layoutâbefore connecting any tools.
11. Conclusion and Strategic Recommendations
The 2022 Mitsubishi Outlander (GN) is a Mitsubishi in name and a Nissan in function. For the research and repair community, this vehicle confirms the total integration of the Alliance's engineering resources. The shift from the GS platform to the CMF-C/D platform is not subtle; it is a complete replacement of the vehicle's digital identity.
Key Takeaways for the Professional:
1. Adopt Nissan Protocols: When approaching a 2022 Outlander (GN), think "Nissan Rogue." Use Nissan diagnostic menus if Mitsubishi specific ones fail. The BCM speaks Nissan.
2. Hardware Mandatory: The 16+32 Secure Gateway Bypass Cable is not optional for key programming; it is a necessity. Diagnostic work is impossible without it.
3. Stock Strategy: Stocking FCC ID: KR5TXPZ1 (Nissan Rogue) keys is a versatile strategy, as they cover both the high-volume Rogue and the lower-volume Outlander, maximizing inventory efficiency.
4. Power Management: On PHEV models, connect power supplies directly to the rear 12V battery to ensure the stability of the programming session.
5. Identify the Model: Distinguish clearly between the Outlander (GN) and Outlander Sport (GA) to avoid wasted time and protocol mismatch.
This vehicle is a harbinger of the future of automotive repair: a world where the badge on the grille is marketing, but the silicon in the dashboard tells the true story of the vehicle's origin.
12. Appendix: Glossary of Technical Terms
* AKL: All Keys Lost. A situation where no working key is available, requiring a reset of the immobilizer.
* BCM: Body Control Module. The computer responsible for authorization of keys, door locks, and other body electronics.
* CMF-C/D: Common Module Family (Compact/Mid-size). The shared platform architecture of the Alliance.
* DTC: Diagnostic Trouble Code.
* HITAG AES: A high-security transponder encryption protocol used by NXP semiconductors, common in modern Renault/Nissan vehicles.
* SGW: Security Gateway. A module that acts as a firewall for the vehicle's CAN bus.
* IPDM: Intelligent Power Distribution Module. Nissan's terminology for the under-hood fuse and relay control unit.
* PHEV: Plug-in Hybrid Electric Vehicle.
* CAN: Controller Area Network. The internal communications network of the vehicle.
________________
Disclaimer: This report is for educational and research purposes. Procedures involving vehicle security systems should only be performed by authorized and licensed professionals in accordance with local laws and regulations.
Works cited
1. 2022 Mitsubishi Outlander proximity key programming via Smart Pro! - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=_US0ODtHRAA
2. 2022 Mitsubishi Outlander VS 2021 Nissan Rogue. SIMILAR OR NOT? - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=UF51S3dbY0k
3. Nissan Rogue VS Mitsubishi Outlander Comparison // Are they different? - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=-bZgZZ5Mn6o
4. Autel IM608 II/ IM508S Program Mitsubishi Outlander Sport AKL - AutelShop.de Official Blog, accessed January 3, 2026, https://blog.autelshop.de/autel-im608-ii-im508s-program-mitsubishi-outlander-sport-akl/
5. Autel IM608 II/ IM508S Program Mitsubishi Outlander Sport AKL - AutelShop.de Official Blog, accessed January 3, 2026, http://blog.autelshop.de/autel-im608-ii-im508s-program-mitsubishi-outlander-sport-akl/
6. Security Gateway Bypass Module - ZAutomotive, accessed January 3, 2026, https://www.zautomotive.com/products/z_sgw
7. Mitsubishi and Hyundai OBD and OBD II Connectors - 1 | PDF | Manufactured Goods, accessed January 3, 2026, https://www.scribd.com/document/370059457/Mitsubishi-and-Hyundai-OBD-and-OBD-II-Connectors-1
8. FCA Security Gateway Module Basic Info and Location - JScan, accessed January 3, 2026, https://jscan.net/fca-security-gateway-module-basic-info-and-location/
9. Security Gateway (SGW) Bypass - diagnostic tool - Appcar DiagFCA, accessed January 3, 2026, https://appcar-diagfca.com/en/diy/security-gateway-sgw-bypass/
10. Nissan Universal 16+32G Bypass Cable with CGW Adapter - CLK Supplies, accessed January 3, 2026, https://www.clksupplies.com/products/nissan-universal-16-32g-bypass-cable-with-cgw-adapter
11. Nissan 16 & 32G Bypass Cable with CGW Adapter (XTool) for Sale - UHS Hardware, accessed January 3, 2026, https://www.uhs-hardware.com/products/nissan-16-32g-bypass-cable-with-cgw-adapter-xtool
12. 2 Ways to Program Nissan Rogue 2022+ Smart Key with Autel IM608 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=FF0t18ML0VY
13. 2023 Mitsubishi Outlander - All Keys Lost Autel IM608 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=PcOt1SySkLI
14. Advanced Diagnostics Smart Pro Key Programming Bypass Cable ADC2017 fo - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/advanced-diagnostics-smart-pro-key-programming-bypass-cable-adc2017-for-nissan-and-mitsubishi
15. 2022 Mitsubishi Outlander Sport Keyless Entry Remote Fob Smart Key Pro â CarandTruckRemotes, accessed January 3, 2026, https://www.carandtruckremotes.com/blogs/program-instructions/2022-mitsubishi-outlander-sport-keyless-entry-remote-fob-smart-key-programming-instructions
16. 2022 - 2024 Mitsubishi Outlander Smart Key 3B Fob FCC# KR5MTXN1 - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2021-2022-mitsubishi-outlander-smart-key-3-buttons-fob-fcc-kr5mtxn1
17. CNSZKEY FCC ID: KR5TXPZ1 OEM Smart Remote Key FOB 434Mhz FSK ID4A Chip For 2022-2024 Nissan Versa 3+1 Buttons PN - AliExpress, accessed January 3, 2026, https://www.aliexpress.com/item/1005006215867542.html
18. OUTLANDER PHEV - ELV Solutions, accessed January 3, 2026, https://elvsolutions.org/wp-content/uploads/2012/12/Mitsubishi-2018-2022-Outlander-PHEV-Battery-Dismantling-Guide.pdf
19. Where is Battery located? | PHEV vs GAS Outlander 2023 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=UtJr8oN40f4
20. MITSUBISHI OUTLANDER PHEV, accessed January 3, 2026, https://www.mitsubishi-motors.com/en/RS/oceania/OUTLANDER_PHEV/pdf/GGW-ANRS-EN02.pdf?20240924
21. 2022 Mitsubishi Outlander PHEV - I-CAR Repairability Technical Support Portal, accessed January 3, 2026, https://rts.i-car.com/hyb-1993.html
22. GENERAL PDI PROCEDURES FOR 2022 OUTLANDER PHEV - nhtsa, accessed January 3, 2026, https://static.nhtsa.gov/odi/tsbs/2021/MC-10200353-9999.pdf
23. 2018 -2022 Mitsubishi Eclipse Cross Key Fob 3B FCC# OUCJ166N - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2018-2022-mitsubishi-eclipse-cross-key-fob-3b-fcc-oucj166n
24. 2021 2022 Mitsubishi Outlander Emergency Key - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2021-2022-mitsubishi-outlander-emergency-key