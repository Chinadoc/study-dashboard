ï»¿2019 GMC Sierra 1500 Locksmith Intelligence Report: Platform Transition, Security Architecture, and Programming Protocols
1. Introduction: The Strategic Bifurcation of the 2019 Model Year
The automotive landscape of 2019 presented a unique and complex scenario for General Motors, specifically within the full-size truck segment. For security professionals, locksmiths, and fleet technicians, the 2019 GMC Sierra 1500 represents not merely a single model year but a distinct bifurcation point in automotive engineering history. This period marked the simultaneous production and sale of two completely divergent vehicle platforms: the legacy K2XX architecture, marketed as the "Sierra 1500 Limited," and the all-new T1XX architecture, introduced as the "Next Generation" or "New Body Style" Sierra.1
This duality is not a trivial marketing distinction; it is a fundamental divergence in chassis design, electronic infrastructure, immobilizer logic, and transponder technology. The implications for the locksmithing industry are profound, as the tools, hardware, and protocols required to service a "2019 Sierra" are entirely dependent on correctly identifying which of the two platforms is present. A failure to distinguish between the K2XX and T1XX platforms can lead to the purchase of incompatible key inventory, the application of incorrect diagnostic protocols, and, in severe cases, the potential corruption of vehicle control modules due to protocol mismatches.
The 2019 model year serves as the proving ground for General Motors' transition from the established Global A electronic architecture to the high-bandwidth requirements of modern vehicular networks. While the legacy Limited models continued to utilize the robust and well-understood high-speed CAN (HS-CAN) protocols associated with the previous generation, the T1XX platform introduced the Controller Area Network with Flexible Data-Rate (CAN FD) to the mass market. This shift was necessitated by the exponential increase in data throughput required by advanced features such as the MultiPro Tailgate, 360-degree camera systems, and enhanced telematics.2 Consequently, the 2019 Sierra T1XX became one of the first mass-production vehicles to mandate the use of CAN FD adapters for diagnostic communication, forcing a paradigm shift in aftermarket tool capabilities.
This report provides an exhaustive technical analysis of the immobilization systems, transponder technologies, programming protocols, and risk mitigation strategies essential for servicing the 2019 GMC Sierra 1500. It synthesizes data from technical manuals, field reports, and component specifications to offer a definitive guide for navigating the complexities of this transitional model year.
1.1 The "Limited" Legacy: K2XX Architecture
The "Sierra 1500 Limited" was a strategic continuation of the 2014â2018 body style, maintained in production to satisfy fleet contracts and provide a lower-cost entry point while T1XX production ramped up. From a security perspective, the Limited is effectively a 2018 vehicle. It operates on the mature Global A architecture, utilizes standard turn-key ignition (mostly) or standard proximity keys without the advanced encryption of later models, and communicates via standard OBD-II protocols. It shares its bed dimensions, cabin layout, and security components with the 2014â2018 Silverado and Sierra models.1
1.2 The T1XX Revolution: The "New Body Style"
The T1XX platform was a "clean sheet" redesign. It features a longer wheelbase, a lighter chassis utilizing mixed materials, and a completely overhauled electrical system designed to support future autonomous and connected vehicle technologies.2 For the locksmith, the T1XX is defined by its reliance on high-frequency (433 MHz) smart keys, the introduction of the HU100 high-security blade as standard for emergency access, and the absolute requirement for CAN FD communication. The T1XX platform is the foundation for the Sierra 1500, Silverado 1500, and their SUV counterparts (Tahoe, Suburban, Yukon) moving into the 2020s.5
2. Platform Identification and Verification Procedures
The primary source of error in servicing the 2019 GMC Sierra is misidentification. Because both platforms were sold as "2019" models, standard VIN year decoding (the 10th digit) is insufficient on its own to determine the security requirements. Technicians must rely on specific visual markers and VIN descriptors to confirm the platform before connecting any programming equipment.
2.1 Visual Identification Methodologies
Technicians in the field often do not have immediate access to build sheets. Therefore, identifying physical characteristics that distinguish the K2XX from the T1XX is the first line of defense against servicing errors.
2.1.1 Wheel Well Geometry
The most reliable rapid-identification feature is the shape of the wheel wells. The legacy K2XX (Limited) features traditional, symmetrical, rounded wheel arches. In contrast, the T1XX (New Body Style) utilizes a distinctively squared-off wheel well with a notched front corner. This design cue is unique to the newer GM truck generations and serves as an instant visual confirm of the T1XX platform.1
2.1.2 Side Mirror Mounting Points
The attachment point of the side view mirrors offers another definitive distinctio. On the K2XX Limited models, the mirrors are mounted at the "sail panel"âthe triangular corner of the window frame near the A-pillar. On the T1XX platform, the mirrors are mounted lower, directly onto the door skin itself, sitting below the window line. This change was implemented to improve aerodynamics and visibility but serves as a clear marker for the locksmith.1
2.1.3 Cargo Bed and Tailgate Features
The T1XX platform introduced the "MultiPro Tailgate," a complex six-function tailgate with a secondary hinged section. If a 2019 Sierra is equipped with the MultiPro Tailgate, it is unequivocally a T1XX model, as this feature was never engineered for the K2XX Limited.2 Additionally, the location of the tie-down punch-outs differs: on the T1XX, they are located lower in the bed wall, just above the fender bulge, whereas on the K2XX, they are positioned higher near the bed rail.1


  



2.2 VIN and RPO Code Verification
Beyond visual inspection, the Vehicle Identification Number (VIN) and Regular Production Option (RPO) codes provide data-driven confirmation. While the 10th digit for both platforms in 2019 is typically 'K' (indicating the 2019 model year), the chassis designation in the 4th and 5th digits often varies. Furthermore, looking for the specific body codes on the RPO sticker (typically found in the glove box or door jamb) is definitive. The code "J21" or "J22" engineering codes, or specific references to the "T1" platform, confirm the new architecture.5
3. Electronic Architecture: The Global A vs. Global B Transition
To understand the programming requirements for the 2019 Sierra, one must understand the underlying electronic architecture. The 2019 model year sits at a volatile intersection of GM's established "Global A" system and the emerging, encrypted "Global B" (or Vehicle Intelligence Platform - VIP).
3.1 The Global A Foundation with CAN FD Transport
There is a pervasive misconception in the aftermarket community that the 2019 Sierra T1XX is a "Global B" vehicle. This is technically inaccurate but functionally understandable given the hardware requirements. Detailed analysis of the snippet data indicates that the 2019 T1XX operates on a high-speed evolution of Global A, utilizing CAN FD as the physical transport layer.6
* Logic Structure: The immobilizer logicâhow the keys are stored, how the BCM verifies the transponder, and how the "pre-load" data is handledâremains rooted in Global A protocols. This explains why 2019 models are generally more permissive regarding diagnostic access and do not always require the strict, real-time dealer server connection that defines full Global B vehicles (which arrived later, around 2022.5 for the Sierra).8
* Physical Layer (CAN FD): The critical differentiator is the communication speed. The T1XX platform was designed to handle massive data loads from the new digital architecture. To accommodate this, GM implemented CAN FD (Flexible Data-Rate). While standard CAN bus operates at 500 kbps, CAN FD can transmit data at variable rates up to 5 Mbps or higher.3
* The "Language" Barrier: Even though the immobilizer "logic" is familiar, the "language" (CAN FD) is unintelligible to older OBD-II scanners. A standard scan tool listening for 500 kbps messages will fail to detect the BCM entirely on a CAN FD bus, leading to "Communication Error" messages. This is not a security lockout; it is a baud rate mismatch.
3.2 The Horizon of Global B (VIP)
Global B, or VIP, represents a fully encrypted, "locked-down" architecture where modules are cryptographically paired to the VIN and cannot be swapped or programmed without continuous authorization from GM's back-end servers.7 Snippet 9 clarifies that Global B implementation became widespread on the Sierra lineup during the mid-cycle refresh (approx. 2022.5).
* Implication for 2019: Locksmiths servicing a 2019 model can typically perform "All Keys Lost" programming using aftermarket tools with CAN FD capabilities, often bypassing the need for a live NASTF connection, provided the tool can calculate the challenge-response algorithm internally. This contrasts with 2021+ Global B models where the tool must push a wrapper file to the server for authentication.9
3.3 The Body Control Module (BCM) as the Security Hub
In the 2019 Sierra, the Body Control Module (BCM) serves as the central gateway for the immobilization system. It is the repository for known key identifiers (FCC IDs and transponder codes).
* Location: The BCM is physically located under the dashboard on the driver's side, often tucked high near the kick panel or behind the knee bolster.12
* Vulnerability: The BCM in 2019+ GM vehicles is notoriously sensitive to voltage fluctuations during the programming state. When the BCM is placed into "Learn Mode," it erases the existing key database and awaits new data. If communication is interruptedâdue to a loose CAN FD adapter or a voltage dropâthe BCM can become stuck in a boot loop, effectively "bricking" the vehicle.14
* Symptom of Failure: A "bricked" BCM will result in a vehicle that has no instrument cluster activity, no door lock response, and cannot communicate with any diagnostic tool.
4. Transponder Technology and Key Fob Compatibility
The diversity of key fobs for the 2019 Sierra is a direct result of the platform split and the varied trim levels (SLE, SLT, AT4, Denali). Correctly identifying the necessary replacement hardware is critical, as the dealership parts counter is often the only fallback if aftermarket inventory is incorrect.
4.1 Frequency Divergence: 315 MHz vs. 433 MHz
A fundamental incompatibility exists between the radio frequencies used by the K2XX and T1XX platforms.
* 315 MHz (Legacy / K2XX): This frequency is the standard for the Sierra Limited. It typically utilizes fobs with FCC IDs starting with M3N. These systems are designed for longer range but lower data throughput.17
* 433 MHz (New Body / T1XX): The T1XX platform shifted to 433 MHz (specifically 433.92 MHz in many markets) to support the higher bandwidth required for passive entry/passive start (PEPS) and bi-directional communication with the vehicle.19
* Testing Protocol: Because some base-model T1XX trucks (fleet grade) might use keyed ignitions that revert to 315 MHz, and some late-production K2XX trucks might feature upgrades, relying solely on the VIN is risky. The industry standard is to use a radio frequency tester (RF counter) on the customer's existing key (if available) to confirm the operating frequency before attempting to program a new fob.19
4.2 FCC ID Taxonomy and Interchangeability
The FCC ID is the definitive identifier for remote compatibility. The 2019 Sierra ecosystem is dominated by two primary families of IDs.
4.2.1 T1XX Smart Keys (Push-to-Start)
For the New Body Style with push-button start, the primary FCC IDs are HYQ1EA and HYQ1ES.
* Interchangeability: Research indicates a high degree of interchangeability between HYQ1EA and HYQ1ES. Snippet 22 highlights that while the distinct IDs often denote different trunk release logos (GMC vs. Chevy) or specific button graphics (Hatch vs. Tailgate), the underlying transponder logic is compatible. A HYQ1EA fob can often be programmed to a vehicle that originally came with HYQ1ES, and vice-versa.22
* Part Numbers: Common OEM part numbers include 13591396 (5-button), 13529632, and 13508398. The specific part number often dictates the button faceplate (e.g., listing "Remote Start" vs. "No Remote Start").21
4.2.2 K2XX / Keyed Ignition Remotes
For the Limited models or T1XX work trucks with keyed ignitions:
* FCC ID M3N-32337100: This is the standard flip-key (switchblade) or separate remote for the legacy architecture. It operates on 315 MHz and uses the Philips 46E (ID46 Extended) transponder chip.18


  



4.3 Advanced Button Configurations: 5-Button vs. 6-Button
The T1XX platform introduced advanced features that required additional buttons on the fob, creating stock-keeping unit (SKU) complexity for locksmiths.
* 5-Button Fobs: Typically support Lock, Unlock, Remote Start, Panic, and Power Tailgate (Drop).
* 6-Button Fobs (Denali/High Country): These are reserved for high-trim models equipped with either the MultiPro tailgate or the Air Ride Adaptive Suspension. In some configurations, the 6th button allows the user to lower the suspension for easier entry/exit or to release the secondary glass/tailgate section.25
* Programming Logic: Programming a 6-button fob to a truck that only supports 5 functions generally works (the extra button does nothing), but programming a 5-button fob to a 6-button truck will result in the loss of that specific feature (e.g., no remote suspension lowering).
4.4 The Emergency Key Blade
The transition to T1XX formalized the adoption of the HU100 high-security laser-cut blade across the truck lineup.
* Specification: The HU100 blade is a center-milled (internal track) keyway. It utilizes the code series V0001-Z6000.27
* Compatibility: This blade profile is shared with the Chevy Cruze, Equinox, Camaro, and the entire SUV lineup (Tahoe/Suburban) from 2015 onwards. The specific emergency blade for the 2019 smart key is Strattec part number 5922084 (OEM 22984995).27
* Cutting: Requires a vertical milling machine (tracer) or a CNC key cutting machine. It cannot be duplicated on a standard edge-cut duplicator.
5. Programming Hardware and Connectivity Requirements
The requirement to program keys to the 2019 T1XX necessitates a tooling upgrade for many service providers. The "standard" OBD-II tools that serviced the 2018 models are physically incapable of communicating with the 2019 T1XX BCM without specific hardware adaptation.
5.1 The CAN FD Adapter Mandate
The defining hurdle for the 2019 T1XX is the CAN FD protocol. Standard J2534 or ISO 15765-4 interfaces operate at fixed baud rates that cannot interpret the variable speed headers of CAN FD frames.
* Hardware Solution: To interface with the vehicle, a CAN FD Adapter is required. This device sits between the diagnostic tool's main cable and the vehicle's OBD-II port. It actively translates the high-speed CAN FD signals into a format the tool can process, or acts as a physical layer transceiver that the tool software controls.3
* Autel Ecosystem: For users of the Autel MaxiIM IM608 (Gen 1) or IM508, the "Autel CAN FD Adapter" is a mandatory accessory. Without it, the tablet will scan the VIN but fail to enter the "Immo Status" or "Control Unit" menus.3
* Next-Gen Tools: Newer tools, such as the Autel IM608 Pro II (IM608 II), feature the MaxiFlash JVCI V200, which has internal CAN FD hardware. These units do not require the external adapter, streamlining the connection process.14
* Alternative Cables: Some legacy tools (like the MVP Pro or early Smart Pro) utilized specific cables (e.g., ADC2011) for GM, but for 2019+ CAN FD, manufacturers have released specific dongles (e.g., the Smart Pro CAN FD adapter). It is critical to differentiate between a "Bypass Cable" (used to jump around a Secure Gateway) and a "CAN FD Adapter" (used to read the signal). For the 2019 Sierra, the requirement is the Protocol Adapter, not necessarily a gateway bypass cable.33
5.2 Voltage Stabilization: Preventing BCM Corruption
The programming sequence for the 2019 Sierra is computationally intensive and time-consuming. It involves erasing flash memory, writing new identifiers, and performing handshake synchronizations that can take up to 12 minutes per cycle.36
* The Danger Zone: During this "Write" phase, the BCM is vulnerable. If the vehicle battery voltage drops below a critical threshold (typically ~12.0V), the BCM may abort the write process. In older architectures, this might just fail the process. In the CAN FD architecture, a write interruption can leave the BCM with a corrupted bootloader or incomplete firmware image, effectively "bricking" the module.14
* Mitigation Strategy: It is professionally negligent to attempt programming a 2019+ GM vehicle without a robust power supply connected. A simple jump pack is often insufficient as it does not regulate voltage. A Battery Support Unit (BSU) capable of maintaining a clean 13.5Vâ13.8V output is the industry standard recommendation.16 This ensures that even if the vehicle's fans, lights, or pumps cycle on during the process, the voltage at the BCM remains stable.
6. Operational Programming Procedures
Once the platform is identified and the correct hardware is connected, the programming procedure itself involves specific physical interactions with the vehicle. The 2019 Sierra introduced new locations for the "Immobilizer Reader" (programming slot) that continue to confuse technicians.
6.1 Locating the Programming Slot
The programming slot is the inductive coil where the key fob must be placed to communicate with the BCM during the learning process. Its location is dependent on the interior seating configuration.
* Center Console Configuration (Bucket Seats): In trucks equipped with a full center console (typically SLE, SLT, AT4, Denali), the slot is located inside the center console storage bin. It is often a molded pocket at the rear of the bin or, in some specific layouts, a cup-holder insert that must be positioned correctly.37
* Bench Seat Configuration (40/20/40 Split): This location is the most common source of frustration. For work trucks and lower trims with a front bench seat, the programming slot is hidden under the bottom seat cushion of the center jump seat. The technician must unlock the center seat storage (if applicable), lift the seat cushion, and locate a small slot near the floor level or hinge mechanism. It is not in the dashboard or the fold-down armrest.37


  



6.2 The "Add Key" On-Board Procedure
Uniquely, GM retained an on-board programming method for the 2019 Sierra that allows a user to add a key without a diagnostic tool, provided they already possess two working smart keys. This is a vital procedure for fleet managers or for creating spares when the customer is not in an "All Keys Lost" situation.36
Procedure Sequence:
1. Place the two recognized keys in the driver's side cup holder.
2. Insert the new, unprogrammed key into the designated Programming Slot (as identified in 6.1).
3. With the vehicle off, quickly press the driver's door unlock button.
4. The Driver Information Center (DIC) should prompt "Ready for Remote #3" (or #4).
5. Press the ENGINE START/STOP button.
6. The DIC will display "Remote Learn Pending."
7. Press the Unlock button on the new remote. The door locks will cycle to confirm programming.
8. Press and hold the Start/Stop button for approximately 12 seconds to exit the programming mode.36
6.3 "All Keys Lost" (AKL) Procedure via OBD
When no working keys are available, the "All Keys Lost" procedure is required. This erases all existing keys from the BCM and programs new ones. This requires the CAN FD adapter and a diagnostic tool.
* Step 1: Security Access: The tool initiates communication with the BCM. In 2019 models, the system typically requires a 10-minute security wait time to bypass the anti-theft lockout, though some advanced tools with online calculation capabilities can bypass this.41
* Step 2: PIN Code Retrieval: Unlike older GMs, the 2019 T1XX often requires a PIN code to authorize the key erasure. Many tools (Autel, Smart Pro) attempt to read this PIN automatically from the BCM via the CAN FD connection. If the tool fails to read the PIN (a known issue with early firmware versions or specific BCM sub-variants), the technician must obtain the PIN from the dealer or a third-party service using the VIN.41
* Step 3: Key Learning Loop: Once access is granted, the tool will instruct the technician to place the first key in the slot and press the Start button. The cluster will acknowledge the key. This is repeated for subsequent keys.
* Step 4: Synchronization: Crucially, after the keys are learned, the technician must press and hold the Start/Stop button for 12â15 seconds with the ignition off. This step forces the BCM to close the programming session and synchronize the rolling codes. Failure to do this often results in keys that can lock/unlock the doors but fail to start the engine.36
6.4 Troubleshooting "No Remote Detected"
A common post-programming issue or service call involves the "No Remote Detected" message.
* Dead Battery Start: If the key battery is dead, the programming slot functions as a passive reader. Placing the fob in the slot allows the car to start via near-field communication (NFC/RFID), bypassing the need for the fob's internal battery. This confirms the key is programmed and the issue is power-related.44
* Interference: High-intensity LED lighting modifications or even the vehicle's own systems can cause RF interference. Snippets suggest that for Denali models with complex electronics, ensuring all doors are closed and potential interference sources are off can resolve learning failures.45
7. Regulatory Landscape: NASTF and VSP Requirements
The 2019 Sierra sits on the cusp of the industry's shift toward restricted security access, governed by the National Automotive Service Task Force (NASTF).
7.1 The Requirement for Credentials
While the 2019 model is not as strictly locked down as the 2021+ models (which essentially mandate online programming), holding a Vehicle Security Professional (VSP) credential is increasingly critical.
* PIN Codes: If the aftermarket tool fails to pull the PIN code via OBD (a frequent occurrence on patched BCMs), the only legitimate way to retrieve the code is through the ACDelco Technical Delivery System (TDS), which requires a VSP ID.11
* SPS2 Programming: If a BCM is "bricked" during the attempt, recovery requires reflashing the module using GM's SPS2 software. Accessing immobilization functions within SPS2 is strictly gated behind the NASTF VSP login. Without this, a tow to the dealership is the only option.47
7.2 Risk Management and Liability
The "bricking" phenomenon has introduced new liability concerns. Technicians are advised to have customers sign waivers acknowledging the risks inherent in programming CAN FD modules, or ensuring their insurance covers module replacement. The shift to CAN FD means that a simple software glitch can necessitate a hardware replacement, raising the stakes for every service call.15
8. Strategic Recommendations for Service Providers
To effectively capitalize on the service opportunities presented by the 2019 GMC Sierra 1500 while minimizing risk, locksmiths and fleet technicians should adopt the following operational strategies:
1. Invest in CAN FD Hardware: The industry is unequivocally moving toward high-speed protocols. Relying on legacy tools limits revenue potential. Every service vehicle should be equipped with a CAN FD adapter or a next-generation programmer with native support.
2. Standardize Inventory: Stock the HYQ1EA (433 MHz) fob family. Its high degree of backward compatibility with HYQ1ES models makes it a versatile solution for T1XX trucks. Verify button configurations (5 vs. 6) to avoid feature loss on high-trim vehicles.
3. Implement Visual Triage: Dispatchers must be trained to ask screening questions ("Are the mirrors on the door or the window corner?") to identify K2XX vs. T1XX platforms before a truck is rolled. This ensures the correct parts and tools arrive on site.
4. Mandate Power Support: Establish a strict policy of connecting a battery support unit (maintaining 13.5V+) for every key programming session on a 2019+ GM vehicle. The cost of a BSU is a fraction of the cost of a replacement BCM and the associated reputational damage.
By strictly adhering to these identification protocols, tooling requirements, and procedural safeguards, security professionals can navigate the complexities of the 2019 Sierra 1500 with confidence, turning a notorious "split year" challenge into a routine and profitable service operation.
Works cited
1. Is my truck bed the new body style or legacy? 2019 Sierra 1500 : r/gmcsierra - Reddit, accessed January 3, 2026, https://www.reddit.com/r/gmcsierra/comments/11o42nd/is_my_truck_bed_the_new_body_style_or_legacy_2019/
2. 2019 GMC Sierra: Choosing the Right Trim - Autotrader, accessed January 3, 2026, https://www.autotrader.com/comparisons/2019-gmc-sierra-choosing-the-right-trim
3. Autel CAN FD Adapter - ADAS Depot, accessed January 3, 2026, https://adasdepot.com/autel-can-fd-adapter/
4. 2019 GMC Sierra 1500: Finally Different - The Car Guide, accessed January 3, 2026, https://www.guideautoweb.com/en/articles/47730/2019-gmc-sierra-1500-finally-different/
5. GMT T1XX platform - Wikipedia, accessed January 3, 2026, https://en.wikipedia.org/wiki/GMT_T1XX_platform
6. Gretio Global B Status - Surreal Development, accessed January 3, 2026, https://surrealdev.com/gretio-global-b-status/
7. You're Going To Do What? Vehicle-Wide Programming - Gears Magazine, accessed January 3, 2026, https://gearsmagazine.com/magazine/youre-going-to-do-what-vehicle-wide-programming/
8. Driving the Future: GM's Global B Architecture Revolutionizes Vehicle Connectivity, accessed January 3, 2026, https://www.mcgoverngmcofwestborough.com/blog/2023/november/15/driving-the-future-gms-global-b-architecture-revolutionizes-vehicle-connectivity.htm
9. GLOBAL ARCHITECTURE : r/gmcsierra - Reddit, accessed January 3, 2026, https://www.reddit.com/r/gmcsierra/comments/1png6e3/global_architecture/
10. Autel CAN-FD Adapter, accessed January 3, 2026, https://autel.tools/products/autel-can-fd-adapter
11. Understanding Scan Tool Codes - NASTF Support Center, accessed January 3, 2026, https://support.nastf.org/support/solutions/articles/43000755700-understanding-scan-tool-codes
12. GMC SIERRA BCM BODY CONTROL MODULE FUSE LOCATION REPLACEMENT 2014 2015 2016 2017 2018 2019 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=gFyaA52e7ec
13. Chevy BCM Replacement - Master Automotive Training, accessed January 3, 2026, https://www.smartautotraining.com/chevy-bcm-replacement-guide/
14. How to fix Autel IM608 II Key Programmer if vehicle app disappears after update - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=jcU24O9j9T0
15. [COURT UPDATE] Car locksmith messed up programming another key fob and cost me $2000 worth of repair. - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1ff5imr/court_update_car_locksmith_messed_up_programming/
16. Identifying Common Symptoms of a Faulty Body Control Module (BCM) - Foxwell Diag, accessed January 3, 2026, https://www.foxwelldiag.com/blogs/car-diagnostic/body-control-module-failure
17. 315MHz Smart Proximity Keyless Entry Remote Key Fob 3 Buttons for Chevrolet Silverado for GMC Sierra 1500 2500 3500 Blue | Harfington, accessed January 3, 2026, https://www.harfington.com/products/p-1776711
18. 3 Button Remote Control M3N-32337100 Key Fob Replacement Chevy Silverado - fmsi.com, accessed January 3, 2026, https://fmsi.com/shop/product/review/add?ID=603150
19. 2019-2023 Chevrolet Silverado | GMC Sierra 3B Remote Fob 433mhz M3N-32337200, accessed January 3, 2026, https://yourcarkeyguys.com/products/2019-2023-chevrolet-silverado-gmc-sierra-3b-remote-fob-433mhz-m3n-32337200
20. New Replacement for Chevrolet GMC 2019-2021 Remote Control FCC ID: M3N-32337200, accessed January 3, 2026, https://www.ebay.com/itm/154529782895
21. 2019 GMC Sierra Smart Remote Key Fob w/ Engine Start & Tailgate - CarandTruckRemotes, accessed January 3, 2026, https://www.carandtruckremotes.com/products/2019-gmc-sierra-smart-remote-key-fob-w-engine-start-tailgate
22. HYQ1EA vs HYQ1ES GM Smart Keys : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/vebofi/hyq1ea_vs_hyq1es_gm_smart_keys/
23. Replacement Smart Key Fob Remote For 2019-2023 Chevy Silverado GMC Sierra 1500 2500 3500 - HYQ1EA HYQ1ES - GM Polyplast Limited, accessed January 3, 2026, https://gmpolyplast.com/2019-2023-Chevy-Silverado-GMC-Sierra-1500-2500-3500-HYQ1EA-j-626924
24. 2019 GMC Sierra transponder chip key blank 23209427 22984996 23286589 23286588 23326748 - Car and Truck Remotes, accessed January 3, 2026, https://www.carandtruckremotes.com/products/2019-gmc-sierra-transponder-key-blank-aftermarket
25. GMC GM Genuine Parts 5 Button Keyless Entry Remote Key Fob (Programming Required by Automotive Professional) | 13598518, accessed January 3, 2026, https://parts.gmc.com/product/gm-genuine-parts-5-button-keyless-entry-remote-key-fob-(programming-required-by-automotive-professional)-13598518
26. Adjust Air Ride Suspension | Sierra EV Quick Start Guide - GMC, accessed January 3, 2026, https://www.gmc.com/support/sierra-ev-quick-start-guides/air-ride-suspension
27. GMC HU100 Emergency Key - CLK Supplies, accessed January 3, 2026, https://www.clksupplies.com/products/gmc-hu100-emergency-key
28. Strattec 2014 - 2024 GM Smart Key High Security Emergency Blade - 5922084, accessed January 3, 2026, https://transponderisland.com/shop/tik-str-5922084-strattec-2014-2024-gm-smart-key-high-security-emergency-blade-5922084-1784
29. Chevrolet GMC Aftermarket Insert Key Blade 22984995 5922084 HU100 - Key4, accessed January 3, 2026, https://www.key4.com/chevrolet-gmc-key-remote-insert-blade-22984995
30. CAN FD ADAPTER - AutelMaxiSysADAS.com, accessed January 3, 2026, https://www.autelmaxisysadas.com/CAN-FD-ADAPTER_p_6925.html
31. Autel CANFD-ADAPT Protocol Adaptor for IM508 / IM608 - Key Innovations, accessed January 3, 2026, https://keyinnovations.com/products/autel-canfd-adapt-protocol-adaptor-for-im508-im608
32. Can Autel IM608 Support DOIP & CAN FD Protocol? | AutelSale.com Office Blog, accessed January 3, 2026, http://blog.autelsale.com/2024/03/22/can-autel-im608-support-doip-can-fd-protocol/
33. Autel Adapters & Cables AKG Working Store - Key Innovations, accessed January 3, 2026, https://keyinnovations.com/shop-automotive/programmers-and-cloners/autel-aurodiag/autel-adapters-and-cables/
34. Autel IM608 questions. : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/z8wnxi/autel_im608_questions/
35. Aazon.co: Autel CAN FD Protocol Adapter For G Y2020 For Ford For Chevrolet For Lincoln... - VisualSP, accessed January 3, 2026, https://www.visualsp.com/901316/Protocol-Adapter-For-G-Y2020-For-Ford-For-Chevrolet-For-Lincoln
36. How To Program A GMC Sierra Smart Key Remote Fob 2019 - 2021 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=TUGuBOYIGr4
37. 2019-2022 Chevy Silverado Key Fob Transmitter pocket Location - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=F8PLIKIfKCI
38. 2019 Chevy Silverado Key Programming Slot Location | Locksmith Mobile Car Key Service in Hanover, MD - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=nEXJgNds1lI
39. 2019-2021 Silverado Console vs Bench Comparison in Detail - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=xC626AJfq24
40. COMPREHENSIVE - STRATTEC Aftermarket Solutions, accessed January 3, 2026, https://aftermarket.strattec.com/application/files/2215/6596/0778/2020_Comprehensive_Catalog.pdf
41. How To Program keys All Keys Lost for Ford Fusionusing Autel IM608 Key Programmer, accessed January 3, 2026, https://www.youtube.com/watch?v=TimNTo5l5JE
42. Autel, FIX PIN CODE READ OF GM CARS!!!!, accessed January 3, 2026, https://bbs.autel.com/autelsupport/Diagnostics/27354.jhtml
43. How to program all keys lost on a 2019 Chevrolet silverado using Autel IM608 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=ZCF6jw20nzQ
44. 2019 - 2022 Chevy Silverado NO REMOTE DETECTED - How To Start Chevrolet With Dead Key Fob Battery - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=M6PkFUNa35g
45. 12 Functions with the GMC Key Fob Did you know of all 12? - Reddit, accessed January 3, 2026, https://www.reddit.com/r/gmc/comments/tvp6vn/12_functions_with_the_gmc_key_fob_did_you_know_of/
46. NASTF Memberships â National Automotive Service Task Force, accessed January 3, 2026, https://wp.nastf.org/?page_id=3969
47. NASTF Application Process - New VSP Primary Account Set Up, accessed January 3, 2026, https://support.nastf.org/support/solutions/articles/43000562902-nastf-application-process-new-vsp-primary-account-set-up