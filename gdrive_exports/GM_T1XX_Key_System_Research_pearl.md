ï»¿The T1XX Security Protocol: An Exhaustive Technical Analysis of General Motors Full-Size Truck and SUV Architectures (2019â2026)
Executive Introduction: The T1XX Paradigm Shift
The automotive industry is currently navigating a period of profound technological upheaval, a transformation nowhere more visible than in the security architectures of General Motorsâ full-size truck and SUV lineup. The T1XX platform, which underpins the Chevrolet Silverado 1500, GMC Sierra 1500, Chevrolet Tahoe, Chevrolet Suburban, GMC Yukon, and Cadillac Escalade, represents a critical case study in this evolution. Spanning the model years from 2019 through 2026, the T1XX era is not defined by a single static system but rather by a volatile migration from legacy electrical standards to a highly encrypted, cloud-dependent ecosystem.
For the automotive locksmith, the fleet manager, and the diagnostic technician, the T1XX platform presents a formidable challenge. It marks the deprecation of the Global A architectureâa system that, while secure, operated on understood principles of local controller area networksâand the ascendancy of the Global B, or Vehicle Intelligence Platform (VIP). This new architecture utilizes the Controller Area Network with Flexible Data-Rate (CAN FD) protocol, introduces strictly enforced server-side authentication for immobilizer programming, and eliminates the viability of many traditional aftermarket diagnostic tools.
This report serves as a comprehensive operational and strategic dossier on the T1XX security ecosystem. It is designed to navigate the complexities of the 2022 model year transition, where incompatible architectures were sold side-by-side, and to provide a definitive catalog of FCC IDs, programming methodologies, and aftermarket component compatibilities. Through a forensic examination of technical service bulletins, part number supersessions, and proprietary programming algorithms, this analysis exposes the underlying logic of GMâs security strategy. It addresses critical operational questions: Why do identical-looking key fobs fail to cross-program? What drives the persistent battery drain in specific smart keys? How has the semiconductor shortage permanently altered the frequency landscape of these vehicles? The answers lie in a deep technical understanding of the convergence between mechanical access and digital identity.1
________________
Section 1: Architectural Evolution and the Global B Paradigm
To navigate the intricacies of T1XX key programming, one must first deconstruct the electrical infrastructure that governs vehicle access. The period from 2019 to 2026 is characterized by a "civil war" between two distinct architectures: the legacy Global A and the modern Global B (VIP). The implications of this duality extend beyond simple part compatibility; they dictate the very language the vehicle speaks and the tools required to communicate with it.
1.1 The Legacy Baseline: Global A Architecture (2019â2021 Trucks)
When the T1XX platform launched with the 2019 Chevrolet Silverado and GMC Sierra (New Body Style), the security architecture was an evolution of the previous K2XX platform's Global A system. This architecture was built upon a high-speed GMLAN communication protocol, typically operating at 500 kilobits per second (kbps). While secure for its time, Global A was relatively permissive regarding diagnostic access. The Body Control Module (BCM) served as the primary gatekeeper for the immobilizer system, managing a challenge-response handshake with the key fob.3
In this environment, the immobilizer programming procedure was largely offline-capable. Although GM's Service Programming System (SPS) was the official method, the cryptographic seeds used for key learning were static enough that aftermarket engineering teams could reverse-engineer them. This allowed tools like the Autel IM608 or Smart Pro to extract the necessary PIN codes and seed-key combinations directly from the BCM via the OBD-II port without a continuous connection to GM's central servers. This "offline" capability defined the workflow for locksmiths servicing 2019, 2020, and most 2021 Silverado and Sierra 1500 models.4
The Global A environment on the T1XX trucks utilized a specific set of frequencies and modulation schemes. The primary smart keys for high-trim vehicles operated on 433 MHz, while fleet and lower-trim models occasionally utilized 315 MHz systems. The communication between the diagnostic tool and the vehicle occurred over standard CAN lines (pins 6 and 14 on the OBD-II connector), a standard that had been in place for over a decade.
1.2 The VIP Revolution: Global B (Vehicle Intelligence Platform)
The status quo was shattered with the introduction of the Global B architecture. First deployed in the 2020 Cadillac CT5 and Corvette C8, this architecture migrated to the T1XX SUVs (Tahoe, Suburban, Yukon, Escalade) for the 2021 model year and to the pickup trucks (Silverado, Sierra) during the mid-cycle refresh of 2022.1
Global B is not merely an incremental update; it is a fundamental redesign of the vehicle's nervous system. It was developed to support the massive data throughput required by advanced driver-assistance systems (ADAS) like Super Cruise, over-the-air (OTA) software updates, and next-generation infotainment systems. To achieve this, GM adopted the CAN FD protocol.
1.2.1 The CAN FD Protocol
The shift to CAN FD is the single most significant technical hurdle for technicians working on post-2021 GM vehicles. Traditional CAN bus networks are limited to 8 bytes of data per frame and speeds of 500 kbps. CAN FD (Flexible Data-Rate) allows for variable data rates, enabling speeds of up to 5 Mbps (and theoretically 8 Mbps in burst modes) and payload sizes of up to 64 bytes per frame.6
This increase in bandwidth and frame size means that a standard J2534 passthrough device or an older OBD-II scanner is physically incapable of interpreting the data stream. The tool attempts to read standard CAN frames, but the vehicle is broadcasting extended CAN FD frames, resulting in communication errors. This is why a specific CAN FD adapter is mandatory for any diagnostic interaction with Global B vehicles. Without this hardware bridge, the tool cannot synchronize with the vehicleâs gateway.7
1.2.2 The Cybersecurity Gateway
Beyond the physical layer of communication, Global B introduced a robust cybersecurity gateway housed within the Serial Data Gateway Module (SDGM). This gateway acts as a firewall, actively monitoring the OBD-II port for unauthorized traffic. In the Global A era, a tool could send a request to the BCM to initiate key learning, and provided it had the correct algorithm, the BCM would comply.
In the Global B environment, the BCM does not trust the tool. Instead, the gateway requires an encrypted, digital handshake that is authenticated against GMâs back-end servers (ACDelco TDS or Techline Connect). The tool must obtain a digital token from the server to prove its legitimacy before the gateway will allow any write commands to the immobilizer partitions of the BCM. This "server-side authentication" effectively killed offline programming for these vehicles. If the technician does not have a stable internet connection and authorized credentials (or an aftermarket tool that creates a specialized encrypted tunnel), the programming process will fail at the handshake stage.10


  



1.3 Super Cruise and the Immobilizer
The architectural rigor of Global B is partly necessitated by the integration of Super Cruise (RPO UKL). This autonomous driving feature requires absolute certainty regarding the driverâs presence and the vehicleâs security state. The immobilizer system in Super Cruise-equipped vehicles (High Country, Denali Ultimate, Escalade) is tightly coupled with the ADAS modules.
When a BCM or Radio Frequency Hub is replaced in a Super Cruise vehicle, a simple reprogramming is insufficient. The technician must perform a specific "Setup" procedure within GMâs Techline Connect software to re-verify the security credentials across the ADAS network. Failure to strictly follow this sequence can result in the vehicle starting but Super Cruise being permanently disabled, as the system detects a potential security compromise in the access control chain.12 This underscores that in the Global B era, the key fob is no longer just a switch; it is a trusted node in a safety-critical network.
________________
Section 2: The 2022 Transitional Crisis and Identification Logic
The model year 2022 stands as the single most disruptive period in the history of the T1XX platform. Driven by supply chain constraints, semiconductor shortages, and the timing of the mid-cycle refresh, General Motors produced two distinct, incompatible versions of the Silverado 1500 and Sierra 1500 concurrently. This bifurcation has created a "trap" for technicians, where misidentification leads to the purchase of incompatible hardware and failed programming attempts.
2.1 The Tale of Two Trucks
For the 2022 model year, GM manufactured the "Limited" (LTD) and the "Refresh." These are not merely trim packages; they are effectively different vehicles sharing a nameplate.
2.1.1 2022 Silverado/Sierra 1500 Limited (LTD)
The "Limited" models are essentially a continuation of the 2021 production run. They were produced to maintain inventory flow while the refresh tooling was finalized.
* Architecture: Global A (Legacy).
* Visual Identifiers: These trucks retain the "old" interior design, characterized by an 8-inch infotainment screen (or smaller on base trims), a column shifter on lower trims, and the classic analog gauge cluster design.
* Key Fob: Utilizes the legacy HYQ1EA (Smart) or HYQ1ES (Flip) FCC IDs.
* Programming: Compatible with standard OBD-II tools without CAN FD adapters; offline PIN reading is often possible.14
2.1.2 2022 Silverado/Sierra 1500 Refresh
The "Refresh" models introduced the new front fascia and, significantly, the Global B architecture.
* Architecture: Global B (VIP) with CAN FD.
* Visual Identifiers: Most trims (LT, RST, LTZ, High Country) feature a completely redesigned interior with a 13.4-inch horizontal touchscreen and a 12.3-inch digital instrument cluster.
* Key Fob: Exclusively uses the high-security NXP Hitag Pro chips with FCC ID YG0G21TB2.
* Programming: Strictly requires a CAN FD adapter and server-connected diagnostic tools.16
2.2 The "Work Truck" Trap
The confusion is compounded by the Work Truck (WT) and Custom trims. Technicians often rely on a heuristic: "Old Dashboard = Global A / Limited." This rule is false and dangerous.
The 2022 Refresh WT and Custom trims received the Global B electrical architecture updates under the skin but retained the legacy dashboard design to control costs. A technician looking at a 2022 Refresh WT sees the old interior and assumes it takes the old key (HYQ1EA). In reality, the BCM is a Global B unit that demands the new encrypted key (YG0G21TB2). Attempting to program the legacy key will result in repeated "Configuration Failed" errors because the BCM cannot interpret the older chip's handshake.18
2.3 The B-Pillar QR Code Solution
Given the fallibility of visual identification, the only definitive method to distinguish a Limited from a Refresh is the VIN and RPO data. GM moved away from the glovebox "Service Parts Identification" (SPID) sticker for the Refresh models.
* Limited (Global A): Typically retains the SPID sticker in the glovebox.
* Refresh (Global B): Features a rectangular QR code sticker located on the driver-side B-pillar (door jamb), near the tire pressure label. Scanning this QR code reveals the vehicle's build data. The presence of engineering reference code "J22" often denotes the refreshed platform. Furthermore, the 12th digit of the VIN can sometimes indicate the split, though the QR code remains the primary source of truth.18


  



________________
Section 3: Detailed Vehicle Analysis and FCC ID Catalog
This section provides an exhaustive, model-by-model breakdown of the key fob hardware, frequencies, and compatibility requirements. It is organized to reflect the divergent paths of the trucks and SUVs.
3.1 Chevrolet Silverado 1500 & GMC Sierra 1500 (2019â2026)
The truck lineup represents the most fractured ecosystem due to the sheer variety of trim levels and the mid-cycle architectural pivot.
3.1.1 2019â2021 (and 2022 Limited) - The Global A Era
Vehicles in this bracket utilize the Global A architecture. The key fobs operate on 315 MHz or 433 MHz, with the latter being standard for most retail trims equipped with push-button start.
* Smart Keys (Proximity): The dominant FCC ID for high-trim models (LT, RST, LTZ, High Country, SLE, SLT, AT4, Denali) is HYQ1EA (433 MHz). These fobs feature a chrome trim and a distinct button feel. A crucial variant is the 5-button fob (Lock, Unlock, Remote Start, Tailgate, Panic) versus the 3- or 4-button versions. The part numbers 13591396, 13529632, and 13508398 are frequently interchangeable within this group, provided the button configuration matches the vehicle's RPO codes.19
* Flip Keys (Bladed): For lower trims (WT, Custom, Base Sierra), GM utilized a flip-key design. The FCC ID is HYQ1ES (433 MHz). While visually similar to the older K2XX flip keys, the transponder logic is different. The "ES" suffix is critical; earlier "AA" or "EA" variants from the previous generation will not program.21
* The 315 MHz Anomaly: A subset of early 2019-2020 trucks, often fleet or specific export configurations, utilized 315 MHz fobs with FCC ID M3N-32337200. This ID is more commonly associated with the Colorado/Canyon mid-size trucks but appears on the T1XX platform in specific build configurations. Technicians must verify frequency with an RF tester before attempting to sell a 433 MHz replacement.23
Table 3.1: Silverado/Sierra Global A FCC ID Matrix (2019-2022 LTD)
Component Type
	FCC ID
	Frequency
	OEM Part Numbers
	Application Notes
	Smart Key (5-Btn)
	HYQ1EA
	433 MHz
	13591396, 13529632, 13508398
	High trims (LTZ/Denali). Includes Tailgate & Remote Start.
	Smart Key (4-Btn)
	HYQ1EA
	433 MHz
	13529664, 13591388
	Mid trims. Usually lacks Power Tailgate.
	Flip Key (4-Btn)
	HYQ1ES
	433 MHz
	13522854, 13547784
	WT/Custom trims. Physical blade ignition.
	Smart Key (3-Btn)
	M3N-32337200
	315 MHz
	13577765, 84209236
	Rare fleet configurations. Verify frequency first.
	3.1.2 2022 Refresh â 2026 - The Global B Era
With the arrival of the Refresh, the entire fob ecosystem shifted. The supplier base moved toward Continental and Hella, utilizing NXP Hitag Pro (ID49) chips with 128-bit AES encryption.
* The Universal Refresh Fob: The FCC ID YG0G21TB2 became the unified standard for the Refresh Silverado and Sierra. Whether the truck is a stripped-down Work Truck or a loaded Denali Ultimate, if it is a 2023+ model (or 2022 Refresh), it uses this FCC ID.
* Part Number Specificity: While the FCC ID is shared, the Part Number dictates the button mask. A 5-button fob (13548437) has the firmware to send the "Tailgate Drop" command. A 3-button fob (13548436) for a WT does not. Although a 5-button fob might program to a 3-button truck, the extra buttons will be non-functional, and using a 3-button fob on a high-trim truck will result in the loss of remote start and tailgate functions.25
* Frequency Standardization: The Global B trucks standardized on 433.92 MHz (often rounded to 434 MHz). The variability of the Global A era was largely eliminated to streamline the Super Cruise security handshake.
Table 3.2: Silverado/Sierra Global B FCC ID Matrix (2022 Refresh-2026)
Component Type
	FCC ID
	Frequency
	OEM Part Numbers
	Application Notes
	Smart Key (5-Btn)
	YG0G21TB2
	433 MHz
	13548437, 13514331, 13560205
	Standard Refresh Fob. Remote Start + Tailgate.
	Smart Key (4-Btn)
	YG0G21TB2
	433 MHz
	13548441, 13560202
	Lacks Remote Start or Tailgate (Trim dependent).
	Smart Key (3-Btn)
	YG0G21TB2
	433 MHz
	13548436, 13514330
	Base trims (WT/Custom). Note: WT uses Smart Key on Global B.
	3.2 Chevrolet Tahoe/Suburban & GMC Yukon/XL (2021â2026)
The SUV lineup migrated to the T1XX platform in the 2021 model year. Unlike the trucks, there was no "Limited" phase; all T1XX SUVs are Global B native.
* Architecture: Fully Global B from launch (MY 2021).
* Key Fob Differentiation: While sharing the YG0G21TB2 FCC ID with the trucks, the SUV fobs have unique button mappings for the Glass Hatch (rear window) versus the Liftgate (entire door).
   * 6-Button Fob: The most common configuration for Premier, High Country, and Denali trims. It features buttons for Lock, Unlock, Remote Start, Panic, Liftgate, and Glass Hatch. Part numbers include 13541565 and 13537962.27
   * Cross-Compatibility Warning: Technicians must not use a Silverado "Tailgate" fob on a Tahoe. While the FCC ID matches and it may program to the immobilizer, the auxiliary functions (Glass/Liftgate) will likely be mapped incorrectly or fail to operate, as the BCM expects a specific signal ID for the glass release that the truck fob does not transmit.
Table 3.3: Tahoe/Suburban/Yukon FCC ID Matrix
Component Type
	FCC ID
	Frequency
	OEM Part Numbers
	Application Notes
	Smart Key (6-Btn)
	YG0G21TB2
	433 MHz
	13541565, 13537962, 13548431
	Includes Glass Hatch & Power Liftgate.
	Smart Key (5-Btn)
	YG0G21TB2
	433 MHz
	13541563, 13537960
	Lacks Glass Hatch release (lower trims).
	Legacy Smart Key
	HYQ1AA
	315 MHz
	13580802
	Found on extremely early 2021 fleet builds; rare.
	3.3 Cadillac Escalade & Escalade ESV (2021â2026)
The Escalade utilizes the Global B architecture but maintains a degree of exclusivity in its hardware protocols to prevent cross-brand programming and maintain brand prestige.
* Distinct FCC ID: The Escalade fobs utilize FCC ID YG0G20TB1 (note the 20TB1 vs 21TB2 difference). These are not interchangeable with the Chevy/GMC fobs. The encryption keys or "Extension" bytes in the transponder are brand-specific.
* Frequency: 433 MHz is standard, though some literature references 315 MHz for early builds (FCC ID HYQ2AB). However, the vast majority of 2021+ Escalades require the new YG0G20TB1 hardware.29
* Escalade-V Series: The high-performance V-Series (2023+) uses the same YG0G20TB1 electronics but houses them in a specialized shell with the V-Series logo. Part numbers 13541571 and 13546300 are common. The V-Series fob often commands a significantly higher price from the dealer solely due to the branding and specific part number validation in the catalog.31
________________
Section 4: Programming Intelligence and Security Protocols
Programming keys for the T1XX Global B vehicles is a procedure that tolerates zero deviation from the protocol. The "offline" methods of the past are obsolete. This section details the specific workflows, hardware requirements, and fail-safes necessary for success.
4.1 The Connectivity Chain of Command
Successful programming is contingent on a robust "chain of connectivity." If any link in this chain is weak, the process will abort, often leaving the vehicle in a theft-deterrent state.
1. Vehicle State: Ignition must be OFF. Emergency Flashers (Hazards) must be ON. The flashers serve a critical technical purpose: they keep the BCM and Gateway awake and preventing them from entering sleep mode during the initial handshake.32
2. Interface Hardware: A J2534 passthrough device or an advanced automotive locksmith tool (e.g., Autel MaxiIM IM608 Pro II, Advanced Diagnostics Smart Pro) is required.
3. The CAN FD Bridge: This is non-negotiable for 2020+ Global B vehicles. The interface must support CAN FD. For Autel users, this means using the V200 interface (which has built-in CAN FD) or the separate CAN FD Adapter connected to the J2534 box. Without this, the tool cannot communicate at the 5 Mbps rate required by the vehicle's modules.7
4. Network Stability: The tool requires a stable, high-speed Wi-Fi connection to communicate with the OEM server (for Techline Connect) or the third-party server (for Autel/Smart Pro calculation).
5. Power Supply: A robust battery maintainer capable of delivering 50-70 Amps is critical. The programming process keeps multiple high-draw modules active for extended periods. A voltage drop below 12.0V during the writing phase can corrupt the BCM memory, "bricking" the unit.4
4.2 "All Keys Lost" (AKL) vs. "Add Key" Workflows
The procedure differs significantly depending on whether a working key is present.
4.2.1 Add Key (Spare Key Programming)
If the customer has one working key, the "Add Key" procedure is relatively streamlined.
1. Authentication: The working key is placed in the cupholder or programming slot. The system reads its transponder data to authenticate the user.
2. Slot Insertion: The tool prompts the user to remove the working key and insert the new, blank key into the slot.
3. Learning: The BCM writes the new key ID to the "Allowed" list. This process typically takes 10-15 minutes but bypasses the deep security wait time associated with AKL.
4.2.2 All Keys Lost (AKL)
This is the most technically demanding procedure.
1. Server Calculation: The diagnostic tool reads the BCM data and sends it to the server to calculate the specific PIN or seed-key.
2. The 12-Minute Security Wait: Once the PIN is entered (or auto-populated), the vehicle initiates a strictly enforced 10 to 12-minute security timer. This is a theft deterrent designed to make drive-away theft impractical. There is no bypass for this timer. The tool will count down; the technician must ensure vehicle voltage remains stable during this window.32
3. The Two-Key Requirement: A critical logic gate in the T1XX BCM (especially on trucks) is the requirement for two keys to close the learning loop. In an AKL scenario, if the technician only programs one key, the vehicle may remain in a "Theft Deterrent" mode or display a "Theft Attempted" message on the DIC. The procedure must be: Program Key 1 -> Remove Key 1 -> Program Key 2 -> Finalize. If only one key is available, the cycle may not complete successfully, leaving the vehicle immobilized.34
4.3 The "Slot" Location Geography
A frequent point of failure is the inability to locate the correct programming pocket. The T1XX platform utilizes varied locations based on the interior configuration.
* Center Console Configuration (LTZ, High Country, Denali, Premier): The slot is located inside the center console storage bin. It is often a designated cup-holder insert or a marked depression at the bottom front of the bin.
* Bench Seat / Work Truck Configuration (WT, Custom, SLE): This is the "Hidden Slot" that baffles many technicians. In trucks lacking a full center console, the programming slot is located under the bottom cushion of the middle jump seat. The technician must unlock the under-seat storage compartment (if equipped) or simply lift the seat cushion to reveal a small, specialized pocket near the floor transmission tunnel. Placing the key anywhere else (e.g., on the seat, in the dash cup holder) will result in a "No Remote Detected" error.33
* Tahoe/Yukon/Escalade: Typically found in the center console, often to the right of the USB ports or under the rubber mat at the bottom.


  



________________
Section 5: Aftermarket Parts Matrix and Component Intelligence
The aftermarket sector has responded to the Global B challenge with varying degrees of success. While OEM keys remain the reliability gold standard, specific aftermarket solutions have been reverse-engineered.
5.1 The Chip Shortage Legacy and Frequency Shifts
The global semiconductor crisis (2020-2022) forced General Motors to diversify its supply chain for Remote Keyless Entry (RKE) receivers. This led to " interim" builds where vehicles within the same model year might use different receiver components (e.g., Renesas vs. NXP).
* Implication: The "Year/Make/Model" lookup is no longer infallible. A 2021 Silverado should be 433 MHz, but if it was built during a specific shortage week, it might have a receiver tuned to 315 MHz (using the older M3N protocol). Technicians must use an RF frequency tester to read the original key (if available) or check the RKE module part number to confirm the frequency before cutting a new key.35
5.2 Aftermarket Shells vs. Internals
* Shells: Aftermarket shells are widely compatible and are an excellent solution for cosmetic repair. The button pads are generally modular.
* Internals/Universal Keys: Companies like Xhorse and Autel produce "Universal Smart Keys" that can be generated to mimic the GM Global B protocols. However, these must be generated using specific "CAN FD" or "Global B" software options. Standard "GM Smart Key" generation profiles will create a signal that the T1XX receiver ignores.
* Emergency Blades: The high-security HU100 laser-cut blade is standard across the platform. The OEM part number for the blank insert is usually 13536164 or 22984995. Aftermarket equivalents like the Strattec 5922084 are fully compatible and widely available.37
Table 5.1: Aftermarket Compatibility Matrix
OEM Part (Ref)
	Ilco / Strattec Ref
	Blade Profile
	Chip Type
	Notes
	13548437 (Silverado 5-Btn)
	PRX-GM-5B17
	HU100
	NXP Hitag Pro
	Compatible with 2022+ Refresh. Must use CAN FD programming.
	13541565 (Tahoe 6-Btn)
	PRX-CHEVY-6B
	HU100
	NXP Hitag Pro
	Verify "Glass Hatch" vs "Tailgate" mapping.
	13580802 (Legacy 315MHz)
	AX00012590
	HU100
	Philips ID46
	Strictly for pre-2021 or Limited/Legacy builds.
	13522854 (Flip Key)
	5922084 (Blade)
	HU100
	NXP AES 128-bit
	Used on Global A WT/Custom. Do not confuse with K2XX keys.
	________________
Section 6: Critical Alerts and Technical Service Bulletins (TSBs)
The T1XX platform has developed a set of endemic issues related to its entry system, documented in various Technical Service Bulletins (TSBs). These documents provide the "missing link" for diagnosing persistent failures that defy standard logic.
6.1 The "Sleeping Fob" Syndrome (TSB 21-NA-241)
Technicians frequently encounter a scenario where a new OEM fob fails to program, returning a "Device Control Not Available" or "Communication Error" message.
* Root Cause: TSB 21-NA-241 identifies that the Radio Frequency (RF) Hub or BCM may enter a non-responsive state or "logic loop" where it refuses to acknowledge the programming command, even if the tool and key are correct.
* Resolution: The TSB advises a hard reset of the vehicle's electrical system (disconnecting the negative battery terminal for 15+ minutes) to reboot the RF Hub. Furthermore, it explicitly warns against RF interferenceâtechnicians are advised to remove all other fobs, cell phones, and chargers from the vehicle cabin during the programming attempt.39
6.2 The Battery Drain Epidemic
Owners of 2021â2023 models have reported key fob batteries (CR2450 or CR2032) dying within weeks of replacement.
* Mechanism: The proximity logic in the fob is overly aggressive. It constantly "pings" the vehicle to assess proximity for passive entry features. If the key is stored within RF range of the vehicle (e.g., on a hook in the garage), the fob and vehicle engage in a continuous "are you there?" conversation, draining the coin cell rapidly.
* Mitigation: GM has released BCM software updates to optimize the polling frequency of the passive entry system. Technicians encountering this complaint should check for available software updates via SPS2.
* Battery Specificity: For Global B fobs (YG0G21TB2), the CR2450 is the standard battery. It is thicker and has a higher capacity than the common CR2032. Some users accidentally install a CR2032, which may make contact but will suffer from intermittent connection ("Remote Not Detected") and extremely short life due to the lower milliamp-hour (mAh) rating.40
6.3 Super Cruise Security Interlock
For High Country, Denali, and Escalade models equipped with Super Cruise, the immobilizer is a safety-critical component. If the "Immobilizer Learn" procedure is not followed by the specific "Super Cruise Setup" function in Techline Connect, the vehicle may start, but the Super Cruise system will be permanently disabled. The system interprets the new key or replaced BCM as a potential security breach (e.g., a "man-in-the-middle" attack) and disables autonomous features to prevent hijacking. This requires the technician to have full access to GM's ADAS calibration tools, not just a key programmer.12
________________
Conclusion: The Future of T1XX Security
The 2019â2026 GM T1XX platform serves as a definitive roadmap for the future of automotive security. The industry has irreversibly moved away from hardware-centric security (the physical key) to a software-defined, server-authenticated ecosystem (the digital token).
For the automotive professional, success on this platform is no longer about having the right mechanical pick; it is about data dominance. It requires:
1. Forensic Identification: Using the B-pillar QR code and RPO data to see past the dashboard and identify the true electrical architecture.
2. Infrastructure Investment: The necessity of CAN FD adapters, high-amperage battery maintainers, and subscription-based diagnostic software.
3. Procedural Discipline: Respecting the 12-minute security wait times and the two-key programming requirements as immutable laws of the system.
As the platform evolves through 2026, we anticipate further integration of Ultra-Wideband (UWB) technology, likely facilitating more robust "Phone-as-a-Key" implementations that may eventually relegate the physical fob to a backup role. However, for the millions of T1XX vehicles currently on the road, the "Refresh" architecture is the new baseline, and mastering it is the only path to operational viability.
Works cited
1. Vehicle Intelligence Platform - TechLink, accessed January 5, 2026, https://gm-techlink.com/wp-content/uploads/2021/04/GM_TechLink_06_Mid-March_2021.pdf
2. Driving the Future: GM's Global B Architecture Revolutionizes Vehicle Connectivity, accessed January 5, 2026, https://www.mcgoverngmcofwestborough.com/blog/2023/november/15/driving-the-future-gms-global-b-architecture-revolutionizes-vehicle-connectivity.htm
3. GDS2 SCAN TOOL-SUPPORTED VEHICLES, accessed January 5, 2026, https://www.gmparts.com/content/dam/gmparts/na/us/en/index/technical-resources/diagnostic-support-resources/02-pdfs/gds2-scan-tool-sheet.pdf
4. Programming a GM TCM with an Autel - YouTube, accessed January 5, 2026, https://www.youtube.com/watch?v=DtmiQD_pzC4
5. Autel, FIX PIN CODE READ OF GM CARS!!!!, accessed January 5, 2026, https://bbs.autel.com/autelsupport/Diagnostics/27354.jhtml
6. Unveiling the Power of CAN FD Protocol and 3rd Party CAN FD Adapter in - UHS Hardware, accessed January 5, 2026, https://www.uhs-hardware.com/blogs/locksmith-industry-news/unveiling-the-power-of-can-fd-protocol-and-3rd-party-can-fd-adapters-in-automotive-locksmithing
7. OBDSTAR CAN FD Programming Adapter - 2020-2023 GM - Your Car Key Guys, accessed January 5, 2026, https://yourcarkeyguys.com/products/obd-star-can-fd-programming-adapter-2020-2021-gm
8. How to program remote for 2023 Chevy Silverado Using CAN FD & Auto Pro Pad - YouTube, accessed January 5, 2026, https://www.youtube.com/watch?v=J_nLTx2r9-0
9. Autel CAN FD Adapter Compatible with Autel VCI work for Maxisys Series Tablets - AutelShop.us, accessed January 5, 2026, https://www.autelshop.us/products/autel-can-fd-adapter-compatible-with-autel-vci-work-for-maxisys-series-tablets
10. New âSecurity Requirementsâ from Ford and GM | Locksmith Ledger, accessed January 5, 2026, https://www.locksmithledger.com/keys-tools/transponder-programming-equipment/article/55000936/new-security-requirements-from-ford-and-gm
11. GM Dealer Infrastructure & SECURITY Guidelines (DISG) - You are not authorized to view the requested information. - General Motors, accessed January 5, 2026, https://gsitlc.ext.gm.com/userguides/Aftermarket%20Infrastructure%20Guideline%20v1.0.pdf
12. GM Introduces New Super Cruise Features to 6 Model Year 2022 Vehicles, accessed January 5, 2026, https://news.gm.com/home.detail.html/Pages/news/us/en/2021/jul/0723-gm-supercruise.html
13. General Motors Says That Their Super Cruise System Will Upgrade With Lane Changes and More - Miami Lakes Automall Chevrolet, accessed January 5, 2026, https://www.miamilakesautomall.com/chevy-blog/general-motors-says-that-their-super-cruise-system-will-upgrade-with-lane-changes-and-more/
14. 2022 SILVERADO CUSTOM LTD VS 2022 CUSTOM REFRESH - YouTube, accessed January 5, 2026, https://www.youtube.com/watch?v=brh8P8IoUSA
15. How to tell if you have a Refreshed GMC Sierra or Chevy Silverado - Wicked Warnings, accessed January 5, 2026, https://www.wickedwarnings.com/how-to-tell-if-you-have-refreshed-gmc-sierra-chevy-silverado/
16. How to Identify If Your 2022 Chevy/GMC Truck is a Limited or Refreshed Silverado or Sierra, accessed January 5, 2026, https://boostautoparts.com/pages/2022-refreshed
17. 2022 Chevrolet Silverado Refresh VS LTD || This Interior is a Huge Upgrade Over The Outgoing!!! - YouTube, accessed January 5, 2026, https://www.youtube.com/watch?v=6WSBg6pVH7Y
18. How to Tell If Your Silverado or Sierra Is a Refresh Model (2022.5+)âEven If It Looks Like the Old Interior, accessed January 5, 2026, https://www.whiteautoandmedia.com/2025/12/08/how-to-tell-if-you-have-a-refresh-silverado-or-sierra/
19. Keyless Entry Remote Fob Replacement For GMC Sierra & Chevy Silverado 2019-2023 (FCC ID HYQ1ES/HYQ1EA), accessed January 5, 2026, https://clinicadentalrociomontero.com/Replacement-For-GMC-Sierra-Chevy-Silverado-2019-2023-FCC-ID-r-730828
20. 2019 - 2022 GMC Sierra Smart Key 5B Key Tailgate FCC# HYQ1EA - Locksmith Keyless, accessed January 5, 2026, https://www.locksmithkeyless.com/products/2019-2022-gmc-sierra-smart-key-5-buttons-key-fob-with-remote-start-tailgate-fcc-hyq1ea
21. 2021 2022 Oem Chevy Silverado 1500 2500 Smart Key Prox remote fob / fcc id: HYQ1ES /434 mhz - KEYTECH TOOLS, accessed January 5, 2026, https://keytectools.com/product/2021-2022-oem-chevy-silverado-1500-2500-smart-key/
22. 2021-2023 Chevrolet Silverado 5-Button Smart Key Fob Remote (HYQ1ES, 13547784, 13522854) - NorthCoast Keyless, accessed January 5, 2026, https://northcoastkeyless.com/product/chevrolet-silverado-5-button-smart-key-fob-remote-fcc-hyq1es-pn-13522854/
23. OEM GENUINE 19-23 Chevrolet Silverado keyless remote fob M3N-32337200 & Chip key, accessed January 5, 2026, https://www.ebay.com/itm/197302282123
24. 2019 Chevrolet Silverado Keyless Entry 4B Fob FCC# M3N-32337200, accessed January 5, 2026, https://www.locksmithkeyless.com/products/2019-chevrolet-silverado-keyless-entry-4b-fob-fcc-m3n-32337200
25. Chevrolet New OEM 2022-2026 Silverado, Tahoe Smart Key 4B Remote Start FCCID: YG0G21TB2 PN# 13548442, accessed January 5, 2026, https://royalkeysupply.com/products/chevrolet-new-oem-2022-2023-silverado-tahoe-smart-key-4b-remote-start-fccid-yg0g21tb2-pn-13548442
26. 2024 Chevrolet Silverado Smart Key 3B Fob FCC# YG0G21TB2 - Locksmith Keyless, accessed January 5, 2026, https://www.locksmithkeyless.com/products/2024-chevrolet-silverado-smart-key-3b-fob-fcc-yg0g21tb2
27. MK3. Chevrolet Suburban Tahoe Smart Remote Key 13541561, accessed January 5, 2026, https://www.mk3.com/chevrolet-suburban-tahoe-smart-remote-key-13541561
28. Chevrolet New OEM 2021-2026 Suburban, Tahoe Smart Key 6B Hatch/Glass/R, accessed January 5, 2026, https://royalkeysupply.com/products/chevrolet-new-oem-2021-2023-suburban-tahoe-smart-key-6b-hatch-glass-remote-start-fccid-yg0g21tb2-pn-13541565
29. OEM 2021â2024 Cadillac Escalade 6B Smart Key Fob Remote YG0G20TB1 P/N 84570459, accessed January 5, 2026, https://www.ebay.com/itm/205330683559
30. Cadillac New OEM 2021-2024 Escalade Smart Key 6B - Royal Key Supply, accessed January 5, 2026, https://royalkeysupply.com/products/cadillac-new-oem-2021-2023-escalade-smart-key-6b-hatch-glass-remote-start-fccid-yg0g20tb1-pn-13541571-13538864-13546300
31. 2021-2025 Cadillac Escalade Keyless Remote Entry Key Fob Transmitter GM | eBay, accessed January 5, 2026, https://www.ebay.com/itm/267118376940
32. AUTEL IM608 PRO CHEVROLET SILVERADO AKL 2019-2022 - YouTube, accessed January 5, 2026, https://www.youtube.com/watch?v=qBpCbXQR8yk
33. 2022 Chevy Silverado Smart Key Programming | IM608 Pro II + Slot Location Tip - YouTube, accessed January 5, 2026, https://www.youtube.com/watch?v=WeQCG22YVLU
34. Programming key fob : r/Silverado - Reddit, accessed January 5, 2026, https://www.reddit.com/r/Silverado/comments/1d3pi4p/programming_key_fob/
35. Wholesalekey Replacement for 2017-2021 GMC Chevrolet M3N-32337200 3 Buttons Remote Key Fob 434MHz - Walmart.com, accessed January 5, 2026, https://www.walmart.com/ip/Wholesalekey-Replacement-for-2017-2021-GMC-Chevrolet-M3N-32337200-3-Buttons-Remote-Key-Fob-434MHz/17270853224
36. GM Remote Key Fob 4-Button for Chevrolet Colorado Silverado 1500 2500, accessed January 5, 2026, https://www.bestkeysolution.com/products/gm-remote-key-fob-4-button-for-chevrolet-colorado-silverado-1500-2500-3500hd-gmc-canyon-sierra-fcc-id-m3n-32337200-433-mhz
37. INSERT 2021-2025 Chevrolet Buick GMC Smart Emergency Key Blade HU100, accessed January 5, 2026, https://yourcarkeyguys.com/products/insert-2021-2024-chevrolet-buick-gmc-smart-emergency-key-blade-hu100
38. Chevrolet GMC Aftermarket Insert Key Blade 22984995 5922084 HU100 - Key4, accessed January 5, 2026, https://www.key4.com/chevrolet-gmc-key-remote-insert-blade-22984995
39. Programming Key Fob Transmitters - TechLink, accessed January 5, 2026, https://gm-techlink.com/wp-content/uploads/2023/08/GM_TechLink_10_Mid-May_2023.pdf
40. 2026 GMC Sierra Smart Remote Key Fob by Car & Truck Remotes, accessed January 5, 2026, https://www.carandtruckremotes.com/products/2026-gmc-sierra-smart-remote-13548439
41. 2024 GMC Sierra Key Fob Battery Replacement - YouTube, accessed January 5, 2026, https://www.youtube.com/watch?v=6bY7w8Vzl88
42. How to Replace Key Fob Battery 2024 GMC Sierra 1500 Step by Step - YouTube, accessed January 5, 2026, https://www.youtube.com/watch?v=z6nALW4ZTyQ