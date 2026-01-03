ï»¿Forensic Technical Report: 2022 Ford Maverick Immobilizer Architecture and Locksmithing Protocols
1. Executive Summary: The Gateway to Modern Ford Security
The 2022 Ford Maverick represents a watershed moment in the automotive locksmithing industry, serving as a high-volume, mass-market introduction to the next generation of Ford's electronic security architecture. Built upon the unibody C2 platformâshared with the Ford Bronco Sport and the Ford Escapeâthe Maverick is not merely a downsized truck; it is a sophisticated node in a secure, digital network. For the automotive locksmith, the Maverick demands a departure from the legacy diagnostic protocols that have defined Ford service for the past decade. It necessitates a forensic understanding of Controller Area Network Flexible Data-Rate (CAN FD) protocols, Secure Gateway Module (GWM) firewalls, and split-frequency remote environments.
This report provides an exhaustive, forensic analysis of the Maverickâs immobilizer systems, designed to serve as the definitive reference for an automotive locksmith database. The findings detailed herein are derived from a synthesis of field reports, technical schematics, and operational case studies. They indicate that while the Maverick retains the mechanical familiarity of the HU101 keyway and the cryptographic foundation of 128-bit Hitag Pro encryption, its electronic topology introduces significant procedural barriers. These include the mandatory use of CAN FD-capable hardware, the navigation of Active Alarm states during "All Keys Lost" (AKL) scenarios, and the management of a bifurcated remote frequency spectrum that alienates the base XL/XLT trims from the premium Lariat models.
The implications of this architecture are profound. The "plug-and-play" era of generic OBDII programmers is receding. Success with the 2022 Maverick requires a locksmith to operate not just as a key cutter, but as a network technician capable of negotiating digital handshakes with a vehicle that is actively designed to resist unauthorized intrusion.
2. Architectural Forensics: The C2 Platform & Network Topology
To successfully program keys for the 2022 Ford Maverick, one must first understand the digital terrain. The vehicleâs security is not a single module but a distributed network governed by the Passive Anti-Theft System (PATS), which is embedded within the Body Control Module (BCM). However, access to the BCM is no longer direct; it is guarded by a new gatekeeper.
2.1 The Gateway Module (GWM) Firewall
In previous generations of Ford vehicles (e.g., the 2015-2020 F-150), the pins of the OBDII port were hardwired directly to the High-Speed CAN (HS-CAN) and Medium-Speed CAN (MS-CAN) networks. A locksmithâs tool plugged into the port effectively became a node on the network, able to broadcast messages to the BCM, Instrument Panel Cluster (IPC), and Powertrain Control Module (PCM) without impediment.
The 2022 Maverick fundamentally alters this topology by integrating a Gateway Module (GWM).1 The GWM acts as a secure router and firewall, interposed between the physical OBDII Data Link Connector (DLC) and the vehicle's internal communication buses.
* Operational Theory: When a diagnostic tool connects to the OBDII port, it is communicating only with the GWM. The GWM inspects the data packets. If the packets do not conform to the expected protocol (CAN FD) or lack the necessary authentication headers, the GWM refuses to forward them to the internal networks where the BCM resides.
* The "Silent" Failure: This architecture explains the common field report where older diagnostic tools "power up" but fail to communicate or read the VIN. The tool is shouting instructions at the GWM, but because it is speaking "Classic CAN" (ISO 15765-4) rather than the required "CAN FD," the GWM discards the traffic, effectively firewalling the BCM from the locksmithâs equipment.


  



2.2 The Rise of CAN FD (Flexible Data-Rate)
The shift to CAN FD is driven by the increasing data density of modern vehicles. The Maverickâs modulesâcontrolling everything from the hybrid powertrain to the 8-inch infotainment screenâgenerate telematics data that exceeds the bandwidth of traditional CAN buses.
* Technical Distinction: Classic CAN is limited to a payload of 8 bytes per frame and a transmission speed of 1 Mbit/s. CAN FD allows for payloads of up to 64 bytes and speeds up to 5 Mbit/s.4
* Implication for Locksmiths: The key programming sequence involves transferring large blocks of encrypted data between the BCM and the diagnostic server (or tool). The Maverickâs BCM expects this data to be packaged in CAN FD frames.
* Hardware Requirement: This is a hardware-level requirement, not just software. The transceiver chips inside older OBDII dongles cannot physically modulate or demodulate the CAN FD signal. This necessitates the use of third-party CAN FD Adapters (such as those from Autel or XTool) which act as signal translators, or the use of newer generation tools (e.g., Autel MaxiIM IM608 Pro II, AutoProPad G2 Turbo) that have native CAN FD support.4 Without this hardware, the locksmith cannot even begin the authentication process.
2.3 The Passive Anti-Theft System (PATS) Evolution
Despite the networking changes, the core logic of the PATS system remains consistent with Fordâs "PATS 6" or "PATS 7" architectures. The system relies on a challenge-response mechanism between the BCM (the immobilizer master) and the transponder chip in the key.
* Encryption: The Maverick utilizes 128-bit encryption on the NXP HITAG PRO (ID49) platform.7 This level of encryption makes "cloning" keys virtually impossible in the field. Keys must be distinctively enrolled into the BCM's memory.
* Minimum Key Requirements: The system is designed to require a minimum of two programmed keys to close a programming session fully in some diagnostic modes, although "Add Key" functions can typically add a single key if one is already present.
* Parameter Reset: In the event of module replacement (BCM, PCM, or GWM), a "Parameter Reset" is required to resynchronize the encrypted handshake between these modules. This function is available on advanced locksmith tools but often requires server-side calculation (NASTF) or a 10-minute security delay.
3. Immobilizer System Identification & Part Forensics
A significant source of friction and financial loss in the locksmith community regarding the Maverick stems from the bifurcation of its key systems. Ford has segregated the Maverick into two distinct frequency domains based on trim level. These systems are mutually incompatible; a key form factor that fits the ignition will physically turn, but if the frequency and circuit board are incorrect, the remote will never program, and the transponder may not authenticate.
3.1 The Bladed "Flip" Key (XL & Standard XLT)
The base models of the Maverick (XL and standard XLT) utilize a traditional keyed ignition cylinder. This system relies on a high-security flip key that houses a discrete transponder chip and a remote circuit board.
* Part Number References: 164-R8269 is the primary part number for the Maverick.8 It is often cross-referenced with 164-R8130, a legacy part number used on the F-150.10
* FCC ID: N5F-A08TAA.7
* Frequency: 315 MHz.8
* Transponder: NXP HITAG PRO (ID49), 128-bit.
* Button Configuration: 3-Button (Lock, Unlock, Panic).
* Blade Profile: HU101 High Security.7
Forensic Insight: The persistence of the 315 MHz frequency for the bladed key is a critical detail. While many global platforms are consolidating to 433 MHz, Ford has retained the 315 MHz band for its North American keyed ignition trucks. This N5F-A08TAA key is a "universal soldier" in the Ford truck lineup, compatible with the F-150 (2015-2023), F-250 through F-550 (2017+), and the Ranger (2019+).10 Locksmiths likely already have this key in stock. It is vital to verify the FCC ID, as similar-looking Ford flip keys exist on 433 MHz or 902 MHz for other markets or models.
3.2 The Smart "Prox" Key (Lariat & XLT Luxury Package)
The Lariat trim and XLT models equipped with the "Luxury Package" feature Intelligent Access (Push-to-Start). This system operates on a significantly different frequency band to support the bidirectional data requirements of passive entry and longer-range remote start features.
* Part Number References: 164-R8182 (Primary), 164-R8297.13
* FCC ID: M3N-A2C931426.13
* Frequency: 902 MHz.13
* Transponder: HITAG PRO (ID49) / 49 Chip.
* Button Configuration: 4-Button (Lock, Unlock, Remote Start, Panic). There may be 5-button variations for models with specific tailgate options, but the 4-button is standard.
* Emergency Key Blade: HU101.13
Analysis of the Frequency Shift: The jump to 902 MHz is the primary trap for the unwary locksmith. Locksmiths attempting to program a 315 MHz smart key (commonly used on older Explorers, Fusions, or Edges with visually identical fobs) will encounter a specific failure mode: the key may program to the immobilizer (starting the car when placed in the backup slot) because the low-frequency (LF) transponder induction coil operates independently of the UHF remote. However, the remote buttons and passive entry functions will fail completely because the vehicle's Remote Function Actuator (RFA) is listening on 902 MHz, while the wrong key is broadcasting on 315 MHz or 433 MHz.
The "Urbanx" Anomaly: Some third-party marketplaces list keys with FCC ID M3N-A2C931423 (315 MHz) as compatible with the Maverick.16 Forensic analysis of the OEM part data 13 and successful programming logs suggests this is likely an error in aftermarket cataloging or refers to a very specific, rare sub-configuration. The definitive, safe standard for the 2022 Maverick Smart Key is M3N-A2C931426 (902 MHz).


  



4. Mechanical Security & Access Methods
While the electronic layers of the Maverick are novel, the mechanical interface adheres to the established Ford global standard. However, the "High Security" nature of the lock cylinders requires precision tools and technique.
4.1 The HU101 Keyway Forensics
The Maverick utilizes the HU101 laser-cut keyway, which has been the standard for Ford since the mid-2000s.18
* Profile: Internal 2-Track (a rectangular blade with a milled central groove).
* Bitting Specifications: The system uses 5 depths (1 being the shallowest, 5 being the deepest) and 10 cut positions.
* Code Series: The key codes typically fall within the 10001 - 13000 series range.20
4.2 Decoding Strategy: Lishi Tool Selection
The primary method for non-destructive entry and key generation is the Lishi HU101 (v3) 2-in-1 pick and decoder.21
* Door vs. Ignition Geometry: In many older vehicle architectures, the door lock cylinder contained fewer wafers (e.g., positions 3-9) than the ignition (positions 1-10). This often forced locksmiths to "progress" the cuts or remove the ignition cylinder to find the missing cuts. On the Maverick, field reports indicate that the door cylinder typically contains the full complement of wafers necessary to generate a complete key.
* Smart Key Access: On Lariat models, the physical keyhole is hidden behind a plastic cap on the driver's door handle. This cap must be carefully pried off (using the slot on the underside) to expose the cylinder for picking. There is no ignition cylinder on these models; the mechanical key blade is solely for emergency cabin access in the event of a dead battery.
* Ignition Picking (XL/XLT): On keyed ignition models, the ignition cylinder is recessed and can be challenging to manipulate with a Lishi tool due to the shroud. Locksmiths are advised to prioritize decoding the door cylinder first.
4.3 Digital Access: The SecuriCode
A unique feature of Ford vehicles, including the Maverick, is the SecuriCode keypad on the B-pillar.
* Retrieval via Sticker: The factory 5-digit master code is physically printed on a sticker located on the Smart Junction Box (SJB) / BCM. In the Maverick, this module is located in the passenger footwell, often behind the kick panel or carpet, or accessed by dropping the glovebox.23
* Retrieval via Diagnostics: Advanced diagnostic tools (Autel, FDRS) can read the keyless entry code directly from the BCM data stream during a "Read Pin/Code" function.24
* Retrieval via Two Keys: If the customer has two working keys, they can display the code on the dashboard by cycling the two keys in the ignition/slot sequentially. This is a useful "no-tool" method for assisting customers who have forgotten their code.23
5. Operational Procedures: On-Board Programming (OBP)
Ford remains one of the few manufacturers that empowers owners (and by extension, locksmiths) to program additional keys without diagnostic tools, provided a specific condition is met: the possession of two currently working keys. This functionality is fully active in the 2022 Maverick and represents the most efficient, risk-free, and cost-effective method for "Add Key" jobs.26
5.1 OBP Procedure for Push-to-Start (Smart Key)
The success of this procedure hinges on correctly identifying the programming slot. In the 2022 Maverick, this slot is located at the bottom of the center console storage bin.
1. Preparation: Remove the felt/rubber mat at the bottom of the center console. Locate the molded depression shaped like the key fob.27
2. Cycle Key 1: Place the first working smart key into the slot (buttons facing rear). Press the START/STOP button (do not press the brake) to enter Accessory Mode. Wait 5 seconds. Press the button again to turn the vehicle OFF. Remove Key 1.
3. Cycle Key 2: Within 5 seconds, place the second working smart key into the slot. Press START/STOP to enter Accessory Mode. Wait 5 seconds. Press the button again to turn the vehicle OFF. Remove Key 2.
4. Enroll New Key: Within 5 seconds, place the new, unprogrammed smart key into the slot. Press and HOLD the START/STOP button (do not press brake).
5. Confirmation: The door locks should cycle, and a message "Key Programmed" will appear on the instrument cluster.27
5.2 OBP Procedure for Keyed Ignition (Flip Key)
1. Cycle Key 1: Insert the first working key into the ignition. Turn to ON (Run) position (do not crank engine). Wait 5 seconds (watch for security light to turn off). Turn to OFF. Remove key.
2. Cycle Key 2: Within 5 seconds, insert the second working key. Turn to ON. Wait 5 seconds. Turn to OFF. Remove key.
3. Enroll New Key: Within 5 seconds, insert the new, unprogrammed key. Turn to ON. The security light should illuminate for 3 seconds and then extinguish, indicating successful enrollment.
Strategic Advantage: This procedure consumes zero tokens on diagnostic tools and completely bypasses the GWM and Active Alarm barriers. It should always be the primary method attempted if the requisite two keys are available.
6. Operational Procedures: Diagnostic Programming
When fewer than two working keys are available, or when all keys are lost (AKL), the locksmith must intervene electronically. This process involves interacting directly with the BCM via the OBDII port and is subject to the security protocols managed by the GWM.
6.1 Tooling & Hardware Requirements
* Protocol Support: As established in Section 2, a CAN FD Adapter is mandatory for reliable communication with the 2022 Maverickâs BCM. Tools such as the Autel MaxiIM IM508/IM608 (with CAN FD adapter) or the AutoProPad G2 Turbo (native support) are verified to work.5
* Software Ecosystem:
   * FDRS (Ford Diagnostic & Repair System): The OEM dealer tool. It is the most reliable but requires a paid subscription (approx. $50/2 days) and a J2534 pass-thru device.30 It is immune to many of the "bypass" issues as it authenticates directly with Ford's servers.
   * Aftermarket (Autel/XTool): These tools reverse-engineer the PATS protocol. They are generally effective but may require "tokens" (server access fees) for the calculation of the 40-digit security codes.26
6.2 The "Active Alarm" Barrier & Management
In an "All Keys Lost" scenario, the vehicle is typically locked and armed. The alarm system is "Active."
* The Barrier: When a diagnostic tool attempts to gain security access (Security Access 0x27) to the BCM while the alarm is active, the BCM interprets this as an intrusion attempt. It will either block the request entirely or impose a mandatory 10-minute security delay.26
* Symptom: The diagnostic tool may display "Security Access Denied" or start a 10-minute countdown.
* Management Strategy 1: The Patience Method:
   * Connect the tool. Initiate the "All Keys Lost" function.
   * When the system triggers the delay, wait. Do not disconnect. Ensure the vehicle battery is supported by a jump pack to prevent voltage drop.
   * After 10 minutes, the BCM will essentially "time out" its defensive posture and allow the programming session to proceed.
* Management Strategy 2: The Battery Bypass (Magnus Kit):
   * For locksmiths who cannot afford the 10-minute wait, a specialized bypass technique exists using a kit like the Magnus Active Alarm Bypass.33
   * Procedure:
      1. Disconnect the vehicleâs positive and negative battery terminals.
      2. Connect the bypass cableâs clips to the vehicleâs disconnected battery cables (connecting positive to negative via the tool, effectively discharging the capacitors in the modules).
      3. Wait a defined period (approx. 1 minute) for the system to fully discharge (Cold Boot).
      4. Connect the diagnostic tool to the bypass cable, which is powered independently by the battery (or a jump pack), while keeping the vehicle "offline."
      5. The tool interacts with the BCM as it powers up, catching it in a state before the alarm logic fully arms.
   * Note: This method is aggressive and requires strict adherence to the cable manufacturer's instructions to avoid shorting the BCM.
6.3 Diagnostic Programming Sequence
1. Connection: Connect the programmer to the OBDII port via the CAN FD adapter.
2. Identification: Auto-detect VIN. Verify the vehicle is identified as "Ford Maverick 2022" with the correct key type (Blade vs. Smart).
3. Status Check: Read the "Number of Keys Programmed" data block. A new BCM can hold up to 4 or 5 keys.26
4. Programming (Add Key): Select "Add Key." This usually requires 1 token on aftermarket tools. Follow the prompts to insert the new key into the slot/ignition. The cluster will acknowledge success.
5. Programming (AKL): Select "All Keys Lost." The system will often require the erasure of all existing keys. Crucial: Ford PATS systems typically require two keys to be programmed to close the AKL session successfully. If you only have one key, the vehicle may remain in a "programming mode" with the security light flashing, or it may start but display a warning. Always aim to program two keys in an AKL scenario to restore full system functionality.35


  



7. Advanced Troubleshooting & Anomaly Resolution
The Maverickâs unique combination of new and old technologies creates specific failure modes that can baffle experienced locksmiths.
7.1 The "Caps Lock" Bug (AutoProPad)
A specific, documented software bug exists within the AutoProPad interface when programming the Maverick.
* The Issue: The security handshake requires the locksmith to manually enter a 40-digit alphanumeric "Outcode" or "Incode" displayed by the tool or a third-party calculator. The BCM expects this code in ALL CAPS.
* The Trap: The software keyboard on the AutoProPad does not automatically lock to uppercase, nor does it warn the user. If the code is entered in lowercase, the handshake fails with a generic "Communication Error" or "Wrong Code," potentially wasting a paid token.26
* The Fix: The locksmith must manually shift or lock caps for every character entry. This is a trivial but critical procedural step.
7.2 GWM Obstruction & Physical Bypass
While rare, there are instances where the GWM completely blocks aftermarket communication, even with a CAN FD adapter. This is more common in vehicles that have received recent Over-The-Air (OTA) updates that tighten security protocols.
* Physical Bypass Location: If OBDII access fails, the locksmith may need to bypass the GWM physically. The GWM is located behind the glovebox assembly or near the Smart Data Link module in the center stack.3
* Access: This requires dropping the glovebox (squeezing the sides to release the stops) to access the module connectors.
* Connection: A "Gateway Bypass Cable" (similar to the Chrysler 12+8, but specific to Ford's connector pinout) can be inserted to bridge the CAN lines directly to the tool, bypassing the GWM's filtering logic. Note: This is an advanced procedure and rarely needed if using updated tools like FDRS.
7.3 "Communication Failed" Diagnosis
If the tool fails to connect immediately:
1. Check Adapter: Is the CAN FD adapter connected? Is the green data light flashing?
2. Check Power: Does the OBDII port have power? (Check fuse).
3. Hard Reset: Disconnect the vehicle battery for 5 minutes. Reconnect and try again. This reboots the GWM and BCM, often clearing temporary "logic locks."
8. Cross-Reference & Ecosystem Compatibility
To optimize inventory management, the following cross-reference table identifies which Maverick keys are shared with other Ford platforms.


Component
	Part Number / FCC ID
	Compatible Vehicles
	Notes
	Flip Key
	164-R8269 (N5F-A08TAA)
	F-150 (2015-2023), F-250/350/450 (2017+), Ranger (2019+), Expedition (2018+), Explorer (2016+), EcoSport (2018+).8
	This is the universal modern Ford truck key. High stock priority. 315 MHz.
	Smart Key
	164-R8182 (M3N-A2C931426)
	Bronco Sport (2021+), Escape (2020+), Explorer (2020+), F-150 (2021+ Prox).13
	Must match 902 MHz. Incompatible with older 315/433 MHz smart keys used on Fusion/Edge.
	Emergency Blade
	HU101
	Focus (2012+), Fiesta (2011+), Transit (2014+), Fusion (2013+).
	Standard high-security blade.
	Lishi Tool
	HU101 (v3)
	Compatible with all above.
	Ensure "v3" or newer for best fitment on newer locks.
	9. Conclusion
The 2022 Ford Maverick is a rigorous test case for the modern automotive locksmith. It is not simply a smaller F-150; it is a distinct implementation of the C2 architecture that enforces strict adherence to next-generation protocols. The days of generic programming are effectively over for this platform. Success requires a tri-fold approach:
1. Hardware Readiness: The absolute necessity of CAN FD capability (via adapter or native tool) and the availability of Active Alarm Bypass equipment for AKL situations.
2. Inventory Discipline: The strict separation of 315 MHz (Flip) and 902 MHz (Smart) inventory to prevent costly mis-programming attempts.
3. Procedural Precision: The awareness of the 10-minute active alarm delay, the manual "Caps Lock" workaround, and the correct utilization of the "Spare Key" OBP loophole.
For the locksmith database, the 2022 Ford Maverick must be flagged with the following critical attributes: "CAN FD REQUIRED," "SPLIT FREQUENCY (315/902)," and "ACTIVE ALARM DELAY: 10 MIN." Adherence to these forensic details will ensure a high success rate and minimize liability in the field.


  



Works cited
1. Security Gateway Bypass Module - ZAutomotive, accessed January 3, 2026, https://www.zautomotive.com/products/z_sgw
2. FCA Security Gateway Module Basic Info and Location - JScan, accessed January 3, 2026, https://jscan.net/fca-security-gateway-module-basic-info-and-location/
3. Gateway Module A (GWM) - Maverick Truck Club, accessed January 3, 2026, https://www.mavericktruckclub.com/forum/attachments/gateway_module_location-pdf.84683/
4. Unveiling the Power of CAN FD Protocol and 3rd Party CAN FD Adapter in - UHS Hardware, accessed January 3, 2026, https://www.uhs-hardware.com/blogs/locksmith-industry-news/unveiling-the-power-of-can-fd-protocol-and-3rd-party-can-fd-adapters-in-automotive-locksmithing
5. CAN-FD Adapter Xtool AutoProPad â CarandTruckRemotes - Car and Truck Remotes, accessed January 3, 2026, https://www.carandtruckremotes.com/products/can-fd-adapter-xtool
6. Autel CAN FD Adapter - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/autel-can-fd-adapter
7. 2022 Ford Maverick Flip Key Fob 3B FCC# N5F-A08TAA - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2022-ford-maverick-flip-key-fob-3b-fcc-n5f-a08taa
8. 2022 Ford Maverick Remote Key Fob - CarandTruckRemotes, accessed January 3, 2026, https://www.carandtruckremotes.com/products/2022-ford-maverick-remote-key-fob
9. NEW OEM 2022-2024 FORD MAVERICK REMOTE FLIP KEY FOB N5F-A08TAA 164-R8269 5939651 | eBay, accessed January 3, 2026, https://www.ebay.com/itm/295094489141
10. 2015-2024 Ford 3B Flip Key 315MHz N5F-A08TAA - Your Car Key Guys, accessed January 3, 2026, https://yourcarkeyguys.com/products/2015-2023-ford-3b-flip-key-n5f-a08taa
11. OEM 2022-2024 FORD MAVERICK REMOTE FLIP KEY FOB N5F-A08TAA 164-R8269 5939651 | eBay, accessed January 3, 2026, https://www.ebay.com/itm/354166049931
12. 4 x 2015-2022 Ford / 3-Button Flip Key / PN: 164-R8130 / N5F-A08TAA (Pack of 4), accessed January 3, 2026, https://www.uhs-hardware.com/products/2015-2022-ford-3-button-flip-key-pn-164-r8130-n5f-a08taa-pack-of-4
13. 2022 Ford Maverick Smart Remote Key Fob w/ Engine Start, accessed January 3, 2026, https://www.carandtruckremotes.com/products/2022-ford-maverick-smart-remote-key-fob-w-engine-start-aftermarket
14. 2022 Ford Maverick Smart Key Fob PN: 5933004, 164-R8182, accessed January 3, 2026, https://remotesandkeys.com/products/2022-ford-maverick-smart-key-remote-3046
15. 2022 Ford Maverick Smart Key 4 Buttons FCC# M3N-A2C931426 - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2022-ford-maverick-smart-key-4-buttons-fcc-m3n-a2c931426
16. 2022 Ford Maverick Smart Key 4B FCC# M3N-A2C931423 - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2022-ford-maverick-smart-key-4b-fcc-m3n-a2c931423
17. Replcament Smart Key Fob for Ford Maverick 2022-2023 FCC M3N-A2C93142300 M3NA2C93142300 Part Number 164-R8197 164R8197 Pack of 2 - Urbanx, accessed January 3, 2026, https://urbanx.us/product/replcament-smart-key-fob-for-ford-maverick-2022-2023-fcc-m3n-a2c93142300-m3na2c93142300-part-number-164-r8197-164r8197-pack-of-2/
18. Ford HU101 High Security Mechanical Key (Bundle Of 10) ( Smart Tech ) - My Key Supply, accessed January 3, 2026, https://www.mykeysupply.com/product/ford-hu101-high-security-mechanical-key-bundle-of-10-smart-tech/
19. Mechanical High Security Metal Head Key for Ford HU101, accessed January 3, 2026, https://www.key4.com/mechanical-high-security-metal-head-key-ford-hu101
20. INSERT Ford 2017-2024 Smart Emergency Key Blade HU101 - Your Car Key Guys, accessed January 3, 2026, https://yourcarkeyguys.com/products/insert-ford-2017-2023-smart-emergency-key-blade-hu198
21. Automotive Lishi - Ford (HU101) - Vehicle Opening Tools - Covert Instruments, accessed January 3, 2026, https://covertinstruments.com/products/automotive-lishi-ford-hu101
22. Dent Wizard Tech Tips: Ford HU101 Lishi - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=VPRD6p9BdRQ
23. Door code : r/FordMaverickTruck - Reddit, accessed January 3, 2026, https://www.reddit.com/r/FordMaverickTruck/comments/1kgeiiw/door_code/
24. WHERE IS THE DOOR CODE ON THE FORD MAVERICK DOOR CODE LOCATION 30 SEC. - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=nRRfqgmi-Dk
25. 2022-2025 Ford Maverick How to retrieve Keyless Door Code - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=jrjhkmeiisg
26. 2022 ford maverick with auto propad : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1ohvku0/2022_ford_maverick_with_auto_propad/
27. Programming new Key Fob | MaverickTruckClub - 2022+ Ford Maverick Pickup Forum, News, Owners, Discussions, accessed January 3, 2026, https://www.mavericktruckclub.com/forum/threads/programming-new-key-fob.63638/
28. How to Save $$ Money $$ on Keys by Programming Yourself -- From a Locksmith and Owner :) | Page 20 | MaverickTruckClub, accessed January 3, 2026, https://www.mavericktruckclub.com/forum/threads/how-to-save-money-on-keys-by-programming-yourself-from-a-locksmith-and-owner.27104/page-20
29. what VCI and can fd adapter needed for 2022+ cars - Autel Support Communities, accessed January 3, 2026, https://bbs.autel.com/autelsupport/tools/38134.jhtml?createrId=2030005&view=1
30. Ford Maverick 2023- New Key Programming with FDRS How to Guide Autel V200 and Laptop - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=ujaCwvKBHU4
31. 2022 Ford Maverick akl key programming via FDRS + NASTF Lakelandcarkeys.com, accessed January 3, 2026, https://www.youtube.com/watch?v=aS1UVHTHplU
32. 2023 Ford active alarm, no keys : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1p2yl7a/2023_ford_active_alarm_no_keys/
33. Magnus Ford Active Alarm Bypass Kit - Best Key Supply, accessed January 3, 2026, https://www.bestkeysupply.com/products/magnus-ford-active-alarm-bypass-kit-p453
34. MAGNUS FORD ACTIVE ALARM KIT (ACTIVE ALARM BYPASS KIT) - - SFFobs, accessed January 3, 2026, https://www.sffobsinc.com/product/magnus-ford-active-alarm-kit-active-alarm-bypass-kit/
35. Autel CAN FD? : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/zurqs4/autel_can_fd/
36. Glove Compartment, accessed January 3, 2026, https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=6214&languageCode=en&countryCode=USA&moidRef=G1405361&Uid=G1740642&ProcUid=G1740643&userMarket=usa&div=l&vFilteringEnabled=False&buildtype=web