ï»¿2020 Cadillac CT6: The Definitive Locksmith Professional Guide
Executive Summary
The 2020 Cadillac CT6 stands as a pivotal case study in the evolution of automotive security, representing the zenith of General Motors' "Global A" architecture immediately prior to the industry-wide shift toward the encrypted "Global B" (Vehicle Intelligence Platform) standard. For the professional locksmith, the CT6 offers a complex intersection of legacy accessibility and modern high-security integration. Unlike its stablematesâthe CT5 and the C8 Corvette, which introduced the restrictive Global B architecture in the same model yearâthe 2020 CT6 retained the Omega platform, thereby preserving critical On-Board Programming (OBP) capabilities and standard CAN bus communication protocols.
This comprehensive report provides an exhaustive technical analysis of the 2020 Cadillac CT6 from a security perspective. It is designed to serve as the ultimate reference for automotive locksmiths, security researchers, and diagnostic technicians. The document covers the vehicle's electronic topology, mechanical access specifications, transponder logic, programming methodologies, and diagnostic troubleshooting. Furthermore, it addresses the widespread confusion regarding Controller Area Network Flexible Data-Rate (CAN FD) requirements and provides a structured JSON data schema for integrating this vehicle's specifications into modern inventory management systems.
1. Architectural Foundation and Platform Analysis
1.1 The Omega Platform: A Divergent Path
To understand the security logic of the 2020 Cadillac CT6, one must first analyze its underlying engineering foundation. The CT6 is built upon the GM Omega platform, a dedicated rear-wheel-drive architecture designed specifically for full-size luxury sedans.1 This platform utilizes a mixed-material structure, incorporating 64% aluminum to achieve a balance of rigidity and weight reduction.3
Crucially, the lifecycle of the Omega platform did not coincide with the full rollout of GM's Global B electrical architecture. While the 2020 model year saw the introduction of Global B in high-volume launches like the Cadillac CT5 and the Chevrolet Corvette C8 4, the CT6 remained on the advanced iteration of Global A. This distinction is the single most important factor for the locksmithing profession. Global B vehicles are characterized by an encrypted gateway that requires a constant internet connection to GM's back-end servers for authentication during every module programming event, effectively blocking standalone aftermarket tools.
By contrast, the 2020 CT6âs retention of Global A architecture implies that the Body Control Module (BCM) and the Immobilizer system continue to operate on a logic that permits:
1. On-Board Programming (OBP): The ability to program keys through a manual, "pedal-dance" or "key-turn" sequence without the need for an external diagnostic device.5
2. Offline Authentication: The challenge-response mechanism between the key fob and the vehicle does not require a real-time "handshake" with the GM corporate server, allowing aftermarket tools like the Autel IM608 or Smart Pro to function effectively.6


  



1.2 Communication Protocols: The CAN FD Misconception
A significant source of confusion in the field involves the requirement for CAN FD (Controller Area Network Flexible Data-Rate) adapters. The automotive industry began transitioning to CAN FD around 2020 to handle the massive data throughput required by modern infotainment and ADAS systems.
For the 2020 Cadillac CT6, the reality is nuanced:
* Primary Security Communication: The BCM and the Remote Control Door Lock Receiver (RCDLR) primarily communicate via the High-Speed GMLAN (a standard CAN implementation), not CAN FD.8 This means that for the specific task of key programming, a standard OBD-II interface is sufficient.
* The "2020 GM" Umbrella: Many diagnostic tool manufacturers (like Autel and XTool) categorize all 2020+ GM vehicles into a single software bucket. Consequently, when a technician selects "2020 Cadillac," the tool may proactively prompt for a CAN FD adapter.9 This is often a software safeguard rather than a hardware necessity for the CT6. However, having a CAN FD adapter is recommended as best practice, as it ensures stable communication if the vehicle is equipped with updated modules that might utilize the faster protocol for peripheral checks.8
1.3 The Security Topology
The theft deterrent system in the CT6 is a distributed network of modules, not a single component. Understanding this topology is critical for advanced troubleshooting.
* Body Control Module (BCM): The "brain" of the operation. Located under the driver's side dashboard, to the far left against the A-pillar.11 It stores the known key identifiers and manages the start authorization.
* Radio Frequency Hub (RCDLR): Located typically in the rear shelf or headliner area, this module receives the 433 MHz signal from the remote.
* Passive Entry Passive Start (PEPS) Antennas: Distributed throughout the vehicle (door handles, trunk, center console). These Low-Frequency (LF) antennas wake up the key fob when the user approaches or presses the start button.
* Secure Gateway (SGW): While less aggressive than the FCA (Chrysler) implementation, late-production 2020 GM vehicles may have a gateway module that filters OBD port traffic. High-end tools handle this bypass automatically via server authentication.12
2. Mechanical Security Specifications
While the CT6 is a "Push-to-Start" vehicle heavily reliant on digital credentials, the mechanical layer remains the fail-safe access point. The mechanical key blade allows entry when the vehicle battery is dead or the fob battery is depleted.
2.1 The HU100 Laser Track System
The 2020 CT6 utilizes the HU100 keyway, a high-security internal "sidewinder" or laser-cut track system that has been the standard for General Motors since approximately 2010.14
Technical Specifications:
* Profile: HU100 (Silca reference).
* Cut Positions: The lock cylinder contains positions for 10 cuts (numbered 1 through 10 from the bow to the tip).
* Cut Depths: There are 4 distinct depths for each position.
* Code Series: The keys are cut to a code series, typically ranging from Z0001 to Z6000 or V0001 to V5798.16
* Wafer Configuration: While the key blade accommodates 10 cuts, the driver's door cylinder usually contains only 8 or 9 wafers. The ignition cylinder is non-existent in this PTS vehicle, but the glove box or trunk lockout cylinder (if present) may contain the remaining wafer positions.
2.2 Accessing the Hidden Lock Cylinder
One of the most frequent challenges for locksmiths and roadside assistance providers is locating the mechanical lock cylinder. To maintain a clean aesthetic, Cadillac concealed the lock cylinder behind a cosmetic cap on the driver's door handle. Improper removal of this cap is a leading cause of damage claims.
Standard Operating Procedure for Cap Removal 17:
1. Identify the Slot: Crouch down and look at the underside of the fixed portion of the driver's door handle (the rear cap). You will see a small rectangular slot, approximately 4mm wide.
2. Tool Selection: Use the emergency key blade itself or a dedicated non-marring probe tool. Avoid large screwdrivers that can chip the paint.
3. Vector of Force: Insert the tool vertically into the slot. The goal is to depress a spring-loaded plastic tab inside.
4. Disengagement: While maintaining upward pressure on the internal tab, pull the entire cap rearward (away from the front of the car) and slightly outward.
5. Release: The cap will slide off, revealing the silver face of the HU100 lock cylinder.
6. Operation: Insert the mechanical key and turn clockwise to unlock. Note that this is a mechanical linkage; you will feel the resistance of the latch mechanism.


  



2.3 Lishi Decoding Strategy
For "All Keys Lost" scenarios where the mechanical key code is unavailable, the locksmith must decode the lock cylinder. The preferred tool is the Original Lishi HU100 (10-Cut) 2-in-1 Pick & Decoder.14
Decoding Procedure:
1. Preparation: Flush the lock cylinder with a quality lubricant to ensure free movement of the wafers.
2. Insertion: Insert the Lishi tool fully.
3. Picking: Apply tension. Systematically feel each wafer position (1 through 10). A rigid wafer is binding; a springy wafer is set. Pick the binding wafers until the lock cylinder turns.
4. Decoding: Once the lock is turned (Open position), hold the tension. Run the reader arm across each position. The grid on the tool will indicate the depth (1-4) for each cut.
5. Transcription: Record the depths. Note that for the HU100, the "1" cut is the deepest (or shallowest depending on the machine calibration, usually 1 is high/uncut and 4 is deep). Correction: In standard GM HU100, a "1" depth typically represents the shallowest cut (least material removed), while a "4" is the deepest cut. Always verify with your specific cutting machine's software.
3. Transponder and Remote Intelligence
The electronic key (Smart Key) for the 2020 CT6 is a sophisticated piece of hardware that combines a passive transponder for the immobilizer and an active transmitter for Remote Keyless Entry (RKE).
3.1 Hardware Identification: The HYQ2EB Standard
The 2020 CT6 migrated to a high-frequency system, distinguishing it from older GM models.
* FCC ID: HYQ2EB.19
   * Critical Warning: Do not use HYQ2AB. While they look identical (5-button smart keys), HYQ2AB is typically 315 MHz or a different modulation used on the ATS, CTS, and older XTS. The 2020 CT6 requires the specific 433 MHz protocol of the HYQ2EB.
* Frequency: 433.92 MHz.
* OEM Part Numbers:
   * 13598540
   * 13598538
   * 13510255
   * 13510236
   * 13598505
* Button Configuration: 5-Buttons are standard for the CT6: Lock, Unlock, Remote Start, Trunk Release, and Panic.
3.2 Battery Specifications
* Cell Type: CR2032 Lithium Coin Cell (3V).19
* Replacement: The shell is designed to be pried open. There is a small notch near the key ring loop.
* Low Battery Symptoms: Reduced range, "Replace Battery in Remote Key" message on the DIC, or failure of passive entry functions.
3.3 Reusability and Unlocking (Reflashing)
A major economic consideration for locksmiths is the reusability of these keys.
* The Locking Mechanism: When a "New" smart key is programmed to a vehicle, the BCM writes a specific encryption "seed" or "signature" onto the transponder chip. The key is now "Locked" to that VIN. It cannot be programmed to a second vehicle in its current state.
* Unlocking Services: The HYQ2EB fobs are technically reusable if they are "unlocked" or "refreshed".20 This requires specialized hardware (like the Xhorse VVDI Key Tool Max with the appropriate renewal adapter/cable). The unlocking process wipes the VIN-specific data, returning the chip to a "Virgin" or "New" state, ready to be programmed again.
* Market Availability: "Unlocked" OEM fobs are a popular commodity in the secondary market, offering the quality of original electronics at a lower price point than "New Sealed" dealership stock.
4. Programming Procedures: Comprehensive Guide
The 2020 CT6 offers a redundant programming capability that is invaluable to the professional. It supports both On-Board Programming (OBP) (manual interface) and Diagnostic Programming (OBD-II interface).
4.1 The Transmitter Pocket (The Slot)
Regardless of the method used (Manual or OBD), the new key must be placed in the specific programming pocket to communicate with the immobilizer's Low-Frequency (LF) coil.
* Location: Inside the center console storage bin (armrest).
* Position: At the bottom of the bin. There is a molded depression shaped like the key fob.
* Orientation: The key must be placed with the buttons facing the rear of the vehicle (or effectively "up" relative to the slope of the pocket).5
* Troubleshooting: If the key is not detected, remove any rubber liners, coins, or metal objects from the pocket. Ensure the pocket is clean.


  



4.2 On-Board Programming (OBP): The Manual Method
The Omega platform's Global A logic allows the vehicle to self-program keys without an internet connection or scan tool. This is a critical fallback procedure.
Method A: Adding a Key (Requires 2 Working Keys)
Use Case: The customer has two keys and wants a third spare.
1. Setup: Place the two fully functional keys in the front cupholder.
2. Insert: Place the new (unprogrammed) key into the Transmitter Pocket in the center console.
3. Engage: Insert the mechanical emergency key into the driver's door lock cylinder.
4. Cycle: Rapidly turn the key to the Unlock position 5 times within 10 seconds.5
5. Feedback: The Driver Information Center (DIC) will display: "Ready for Remote #3" (or #4).
6. Learn: Press the Engine Start/Stop button.
7. Success: The DIC will confirm the remote is learned.
8. Exit: Press and hold the Start button for 12 seconds or simply turn the car off and test the new key.
Method B: All Keys Lost (No Working Keys) - The "3 x 10" Procedure
Use Case: No keys are available, and no diagnostic tool is present.
1. Power Supply: Connect a robust battery charger or jumper pack. This process takes 30+ minutes and will drain the battery, potentially causing a voltage drop that aborts the programming.
2. Initiation: Insert the mechanical key into the driver's door lock. Turn to Unlock 5 times within 10 seconds.
3. Wait Cycle 1: The DIC displays "Remote Learn Pending, Please Wait." A countdown timer is running in the background. You must wait 10 minutes.
4. Action 1: The DIC changes to "Press Engine Start Button to Learn." Press the Engine Start/Stop button immediately. The screen reverts to "Remote Learn Pending."
5. Wait Cycle 2: Wait another 10 minutes.
6. Action 2: The DIC displays "Press Engine Start Button to Learn." Press the Engine Start/Stop button.
7. Wait Cycle 3: Wait a final 10 minutes.
8. Action 3: The DIC displays "Press Engine Start Button to Learn." Press the Engine Start/Stop button.
9. Wipe & Learn: The DIC displays "Ready for Remote #1." At this exact moment, all previous keys are erased from the BCM.
10. Programming Key 1: Place the first new key in the Transmitter Pocket. Press the Engine Start/Stop button. Wait for a beep or DIC confirmation ("Ready for Remote #2").
11. Programming Key 2: Remove Key 1. Place Key 2 in the pocket. Press the Engine Start/Stop button.
12. Exit: Press and hold the Engine Start/Stop button for approximately 12 seconds to exit programming mode.5


  



4.3 Diagnostic Programming (OBD-II Interface)
Professional locksmiths prefer the diagnostic method because it typically bypasses the full 30-minute wait, reducing it to a single 12-minute security delay.
Workflow:
1. Connection: Plug the programmer (e.g., Autel IM608) into the OBD-II port.
2. Selection: Navigate to GM > Cadillac > CT6 > 2016-2020 > Smart Key.
3. Status Check: The tool will query the BCM for the number of programmed keys.
4. PIN Code: The tool will attempt to read the PIN code (Security Access Code) from the BCM.
   * Note on Global A: The PIN is typically a calculated value based on the BCM seed. The tool handles this exchange automatically via internet server or internal database.
5. Security Wait: Once the PIN is entered/bypassed, the BCM enforces a 12-minute wait. This is hard-coded into the module firmware to prevent brute-force attacks. There is no way to bypass this 12-minute wait on the Omega platform.25
6. Erase/Add: The tool will prompt you to place the key in the pocket and press the Start button, similar to the manual method.
5. Tool Coverage and Compatibility Matrix
The following section evaluates the efficacy of major aftermarket tools on the 2020 CT6.
5.1 Autel (IM508 / IM608)
* Performance: Excellent. The Autel ecosystem is the market leader for GM Global A vehicles.
* Method: "Auto Detect" usually works. If manual selection is required, choose "Smart Mode."
* CAN FD: While the tool may ask "Do you have a CAN FD adapter?", it is often not strictly required for the immobilizer functions on the CT6. However, utilizing the Autel CAN FD Adapter is recommended to ensure robust communication if the vehicle has late-production firmware that utilizes the faster bus speed for gateway handshakes.8
* Server Access: Requires an active subscription to access the GM online server for PIN calculation.
5.2 Advanced Diagnostics (Smart Pro)
* Software: ADS2290 (GM 2020).7
* Performance: High. The Smart Pro is renowned for its stability.
* Advantages: It provides a guided, step-by-step interface that minimizes user error. The software automatically handles the PIN reading and bypasses the need for manual PIN entry.
* Cost: Operates on a token system or Unlimited Token Plan (UTP).
5.3 AutoProPAD (XTool)
* Performance: Good. The G2 and G3 Turbo models support the 2020 CT6.
* Adapter: XTool strongly advises using their CAN FD Adapter for all 2020+ GM models.9 Even if the CT6 is Global A, the adapter ensures the tool can communicate with the gateway if present.
* Updates: Ensure the "GM" software package is updated to the latest version to avoid "Communication Failed" errors.
5.4 Xhorse (VVDI Key Tool Plus)
* Performance: Moderate. While capable, the Xhorse ecosystem is sometimes less intuitive for US-domestic GM vehicles compared to Autel.
* Utility: The Xhorse tools are unmatched for Key Generation (creating a universal remote to mimic the HYQ2EB) and Unlocking used OEM fobs.28
Tool Platform
	Software Module
	PIN Read
	CAN FD Adapter
	Reliability
	Autel IM608/508
	GM Immo
	Auto
	Recommended
	5/5
	Smart Pro
	ADS2290
	Auto
	No
	5/5
	AutoProPAD
	GM V28.xx+
	Auto
	Recommended
	4/5
	Xhorse Key Tool
	GM Database
	Auto
	Required (Plus)
	3.5/5
	Proprietary
	GM SPS2 (Techline)
	N/A
	MDI2 Required
	5/5
	6. Troubleshooting and Common Failure Modes
6.1 "Service Theft Deterrent System" Message
This dashboard message is the "Blue Screen of Death" for Cadillac key programming. If this message is active, the BCM is in a fault state and will not enter programming mode.
Root Causes:
1. Intrusion Sensor Failure: The ultrasonic motion sensor (Part #13523277) located in the overhead console is a common failure point. If it sends erratic data, the BCM assumes a theft attempt.29
2. Low Voltage: Attempting to program with a battery below 12.0V can corrupt the BCM's theft partition.
3. Fob Battery: Paradoxically, a critically low battery in the only working fob can sometimes trigger a mismatch that escalates to this system fault.31
Resolution Workflow:
1. Hard Reset: Disconnect the vehicle's negative battery terminal for 15 minutes. Touch the negative cable to the positive cable (while disconnected from the battery!) to discharge capacitors.
2. Voltage: Charge the battery to 13.5V+.
3. Sensor Disconnect: If the message persists, try unplugging the overhead intrusion sensor. Sometimes removing the faulty node clears the BCM lock.
4. Dealer Intervention: If the BCM data is corrupted, it requires a "Shadow File" reset or module reprogramming using GM's SPS2 software and a J2534 passthrough tool.32
6.2 Dead Spots in the Programming Pocket
The center console pocket is deep and narrow.
* Issue: The LF antenna signal is weak or obstructed.
* Solution: Remove the rubber mat at the bottom of the console. Ensure no coins or metallic wrappers are shielding the key. Try rotating the key 180 degrees.
6.3 Super Cruise Calibration Loss
The 2020 CT6 is a technology flagship featuring Super Cruise.
* Risk: Disconnecting the battery for a theft deterrent reset can clear the volatile memory of the Active Safety Control Module (ASCM).33
* Symptom: The customer drives away with working keys, but Super Cruise will not engage (Blue bar instead of Green).
* Advisory: Warn the customer that the system may need to "re-learn" the sensors by driving on a mapped highway for 15-30 minutes with clear lane markings.
7. Digital Representation: The Security JSON Schema
To satisfy the requirement for a structured data representation, the following JSON schema is proposed. This structure allows locksmiths and developers to integrate the CT6's specific parameters into inventory and job management software.


JSON




{
 "vehicle_identity": {
   "make": "Cadillac",
   "model": "CT6",
   "year": 2020,
   "platform": "Omega",
   "architecture": "Global A (High-Speed GMLAN)"
 },
 "mechanical_security": {
   "keyway_profile": "HU100",
   "code_series": "Z0001-Z6000",
   "cut_count": 10,
   "cut_depths": 4,
   "lock_location": "Driver Door Handle (Concealed under cap)"
 },
 "electronic_credentials": {
   "fcc_id": "HYQ2EB",
   "frequency": "433.92 MHz",
   "ic": "1551A-2EB",
   "modulation": "FSK",
   "oem_part_numbers": [
     "13598540",
     "13598538",
     "13510255"
   ],
   "battery_type": "CR2032"
 },
 "programming_requirements": {
   "on_board_programming_supported": true,
   "obp_method": "3x10_minute_cycle",
   "obd_programming_supported": true,
   "can_fd_adapter_required": false,
   "min_voltage_requirement": 12.5,
   "slot_location": "Center Console Bottom Rear"
 },
 "tool_compatibility": {
   "autel_im608": "Supported - GM Smart Key",
   "smart_pro": "Supported - ADS2290",
   "autopropad": "Supported - GM 2020+"
 }
}

Conclusion
The 2020 Cadillac CT6 is a sophisticated machine that marks the end of an era for GM's accessible security architecture. By combining the mechanical precision of the HU100 lock system with the electronic robustness of the Global A platform, it offers the professional locksmith multiple pathways to successâprovided one understands the specific requirements of the HYQ2EB transponder and the nuances of the Omega platform.
Success on this vehicle requires a holistic approach: ensuring stable voltage, correctly identifying the specific 433 MHz hardware, respecting the programming timers, and carefully managing the interaction with the vehicle's advanced theft deterrent sensors. With the comprehensive data provided in this guide, the professional is equipped to handle every scenario from a simple spare key addition to a complex "All Keys Lost" recovery, all while navigating the potential pitfalls of modern ADAS integration.
Works cited
1. 2020 Cadillac CT6 - Research Models, accessed January 2, 2026, https://www.markmazdascottsdale.com/research-models/2020/cadillac/ct6
2. List of General Motors platforms - Wikipedia, accessed January 2, 2026, https://en.wikipedia.org/wiki/List_of_General_Motors_platforms
3. 2020 Cadillac CT6 Details, accessed January 2, 2026, https://www.fivestarcadillac.com/2020-cadillac-ct6/
4. Driving the Future: GM's Global B Architecture Revolutionizes Vehicle Connectivity, accessed January 2, 2026, https://www.mcgoverngmcofwestborough.com/blog/2023/november/15/driving-the-future-gms-global-b-architecture-revolutionizes-vehicle-connectivity.htm
5. How To Program A Cadillac CT6 Smart Key Remote Fob 2016 - 2020 - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=SvmY_yCUTyQ
6. Autel IM608 Pro | Make A Car Key Without The Original | Key Programming - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=4Dg8lKsGx3g
7. 2020 GM Key Programming Software ADS2290 For Smart Pro, accessed January 2, 2026, https://keyinnovations.com/products/2020-gm-key-programming-software-ads2290-for-smart-pro
8. Aazon.co: Autel CAN FD Protocol Adapter For G Y2020 For Ford For Chevrolet For Lincoln... - VisualSP, accessed January 2, 2026, https://www.visualsp.com/901316/Protocol-Adapter-For-G-Y2020-For-Ford-For-Chevrolet-For-Lincoln
9. CAN-FD Adapter Xtool AutoProPad â CarandTruckRemotes - Car and Truck Remotes, accessed January 2, 2026, https://www.carandtruckremotes.com/products/can-fd-adapter-xtool
10. Autel 16+32 Gateway Adapter Work with IM608, IM508, Lonsdor K518ISE and K518S | eBay, accessed January 2, 2026, https://www.ebay.com/itm/187296220979
11. Cadillac CT6 BCM location #cadillac #ct6 - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=hj5179y22Bk
12. FCA Security Gateway Module Basic Info and Location - JScan, accessed January 2, 2026, https://jscan.net/fca-security-gateway-module-basic-info-and-location/
13. North America - Secure Gateway Access - Autel, accessed January 2, 2026, https://www.autel.com/c/www/USgateway.jhtml
14. Original Lishi - GM HU100 (V.3) 10 Cut - 2-in-1 Pick/DecoderâAG - Royal Key Supply, accessed January 2, 2026, https://royalkeysupply.com/products/original-lishi-gm-hu100-v-3-10-cut-2-in-1-pick-decoder-ag
15. 2014 - 2024 Cadillac Emergency Key / HU100 - Locksmith Keyless, accessed January 2, 2026, https://www.locksmithkeyless.com/products/2014-2018-cadillac-emergency-key-hu100
16. Original Lishi 2-in-1 HU100 GM 10-Cut 2-in-1 Pick and Decoder for Door, Ignition, and Trunk - Anti Glare, accessed January 2, 2026, https://www.southernlock.com/itemdetail/132-4110
17. Keyless Open and Start | Vehicle Support - Cadillac, accessed January 2, 2026, https://www.cadillac.com/support/vehicle/security/keyless-open-start
18. Cadillac STX& CT6 Outer Door Handle Removal - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=tTZXdNRVht8
19. 2020 Cadillac CT6 Smart Proxy Remote Key Fob, accessed January 2, 2026, https://www.hurawalhi.com/360s/panorama_tour.html?pano=data:text%2Fxml,%3Ckrpano%20onstart=%22loadpano(%27%2F%5C%2Fp6.pics%2Fp%2F8887109692%27)%3B%22%3E%3C/krpano%3E
20. 2020 Cadillac CT6 Smart Proxy Remote Key Fob - CarandTruckRemotes, accessed January 2, 2026, https://www.carandtruckremotes.com/products/2020-cadillac-ct6-smart-proxy-remote-key-fob
21. Replacement For Cadillac CT6 Smart Key HYQ2EB 5 Button 2016?2020 Remote | eBay, accessed January 2, 2026, https://www.ebay.com/itm/306358047285
22. OEM CADILLAC Key Fob HYQ2EB Unlocked 5Btn w/ Insert â CT6 ATS CTS XTS 2016â2020 | eBay, accessed January 2, 2026, https://www.ebay.com/itm/306347045846
23. Open and Start Cadillac models with a dead key fob battery. - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=6LEt6Eb0pbE
24. 2020 Cadillac CT6 Keyless Entry Remote Fob Smart Key Programming Instructions, accessed January 2, 2026, https://keyless2go.com/blogs/program-instructions/2020-cadillac-ct6-keyless-entry-remote-fob-smart-key-programming-instructions
25. 2021 Cadillac XT6 Proximity Key Programmed with Autel IM608 - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=YVqTBBoI8bc
26. Autel CAN FD Adapter - Locksmith Keyless, accessed January 2, 2026, https://www.locksmithkeyless.com/products/autel-can-fd-adapter
27. Advanced Diagnostics ADB2203 GM Software - for Smart Pro - Southern Lock, accessed January 2, 2026, https://www.southernlock.com/itemdetail/026-1032
28. Xhorse VVDI Key Tool Max Pro Key Programmer Built-in OBD & CANFD XDKMP0EN - ABK-5091 - ABKEYS, accessed January 2, 2026, https://abkeys.com/products/xhorse-vvdi-key-tool-max-pro-key-programmer-xdkmp0en-5091
29. Theft Deterrent Alarm Module Sensor for Cadillac CT6 2016-2020 | eBay, accessed January 2, 2026, https://www.ebay.com/itm/156521725639
30. GM 13523277 Theft Deterrent Module Assembly - GM Parts Giant, accessed January 2, 2026, https://www.gmpartsgiant.com/parts/gm-module-asm-theft-dtrnt-13523277.html
31. r/Cadillac - 2020 XT6 - Service Theft Alarm - Reddit, accessed January 2, 2026, https://www.reddit.com/r/Cadillac/comments/10drf3h/2020_xt6_service_theft_alarm/
32. Service Bulletin TECHNICAL - nhtsa, accessed January 2, 2026, https://static.nhtsa.gov/odi/tsbs/2021/MC-10194095-9999.pdf
33. PIC6312A 2018 CT6 Super Cruise (RPO UKL) Diagnostic Tips - nhtsa, accessed January 2, 2026, https://static.nhtsa.gov/odi/tsbs/2017/MC-10125133-9999.pdf