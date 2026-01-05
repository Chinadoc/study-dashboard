ï»¿2022 Dodge Charger/Challenger (LD/LC) FORENSIC LOCKSMITH DOSSIER
1. Executive Intelligence Briefing
1.1. Operational Scope and Strategic Significance
This dossier constitutes an exhaustive forensic analysis of the access control, immobilization, and security architecture of the 2022 Dodge Charger (LD platform) and Dodge Challenger (LC platform). It is engineered for the master automotive locksmith, the forensic security analyst, and the fleet security director who demand a granular understanding of the "Last Call" generation of these iconic muscle cars. This document transcends standard service manual instructions, offering a deep-dive into the behavioral, architectural, and evolutionary logic of the Stellantis (formerly FCA) Keyless Enter-N-Goâ¢ system.
The 2022 model year represents a critical junctureâa "Singularity Event"âin the lineage of the modern American muscle car. As the production run of the legendary HEMI V8 concludes, these vehicles have appreciated into high-value assets, creating a parallel market for theft, cloning, and illicit parts trafficking. In response, Dodge deployed aggressive over-the-air (OTA) and dealership-level security patches, most notably Technical Service Bulletin (TSB) 08-086-22, widely known in the industry as the "RF Hub Lockdown."
For the locksmith, this security escalation transforms a once-routine key programming job into a complex navigation of digital firewalls, locked modules, and proprietary encryption protocols. The days of simple OBD-II "plug-and-play" are effectively over for this platform. Success now requires a forensic understanding of the vehicleâs network topology, specifically the interplay between the Secure Gateway Module (SGW), the Radio Frequency Hub (RF Hub), and the Body Control Module (BCM).
This report covers the full spectrum of the LD/LC ecosystem, from the base SXT V6 models to the high-output SRT Hellcat, Redeye, and Demon variants. It unifies the disparate threads of mechanical keyways (Y164), radio frequency (RF) protocols (433 MHz), Controller Area Network (CAN) bus architecture, and the specific forensic markers of the "Red Key" vs. "Black Key" authorization systems. Furthermore, it explicitly integrates the Chrysler 300 (LX platform), which shares the underlying cryptographic DNA of its Dodge siblings.
1.2. The Security Landscape of the 2022 LD/LC Platform
The security architecture of the 2022 Charger and Challenger is defined by a "Defense-in-Depth" strategy, comprised of three primary layers that present unique challenges to legitimate service providers:
1. The Secure Gateway Module (SGW): First introduced in the 2018 model year, this module acts as a digital firewall between the external Data Link Connector (DLC/OBD-II port) and the vehicleâs internal CAN bus networks. Its primary function is to segregate public access from private control, preventing unauthorized writing of commandsâsuch as "Program Key" or "Recalibrate Odometer"âwithout cryptographic authentication via an authorized server.1
2. The Radio Frequency Hub (RF Hub): The central nervous system of the vehicle's access control. It manages key validation, remote start, tire pressure monitoring (TPMS), and passive entry. In 2022, this module became the focal point of Dodge's anti-theft efforts. Through software updates, the "Key Learn" routine on existing modules has been permanently disabled in many vehicles to prevent relay attacks and hub cloning.3
3. The Hitag-AES Encryption Protocol: The transponder technology utilizes 128-bit AES encryption (chip ID 4A), a significant leap in cryptographic strength compared to the older Hitag-2 (chip ID 46) systems used in the pre-2015 era. This renders old cloning tools and "sniffer" devices obsolete.5


  



________________
2. Historical Platform Evolution (LX/LD/LC): Context for the Forensic Analyst
To fully comprehend the 2022 security architecture, one must understand the evolutionary path of the platform. The LD (Charger) and LC (Challenger) platforms are heavily modified derivatives of the original LX platform (Chrysler 300), which itself owes much of its suspension and electrical architecture to Mercedes-Benz designs from the DaimlerChrysler era. However, the security systems have diverged significantly over time.
2.1. The Legacy Era (2008â2014): The WIN Module and FOBIK
In the early years of the Challenger (2008-2014) and the Charger (2011-2014), the security architecture centered around the Wireless Ignition Node (WIN).
* The Interface: These vehicles utilized the "FOBIK" (Finger Operated Button Integrated Key). This was a trapezoidal plastic key that inserted into a receptacle in the dashboard and turned like a traditional key.
* The Logic: The WIN module acted as both the ignition switch and the receiver. It read the transponder data directly from the inserted key.
* Forensic Note: While some 2011+ models offered "Keyless Go" (Push Button Start), the button was often a removable cap that covered the FOBIK slot. The underlying architecture was still based on the WIN module. The transponder protocol was primarily Hitag-2 (ID46), which is now considered cryptographically weak and vulnerable to various exploitation tools.
2.2. The Electrical Architecture Refresh (2015â2017): Introduction of the RF Hub
The 2015 model year marked a massive overhaul for the Charger and Challenger. The interior was redesigned, the 8-speed Torqueflite transmission became standard, and critically, the electrical architecture migrated to a more modern standard.
* The Shift: The WIN module was eliminated. It was replaced by the Radio Frequency Hub (RF Hub) located in the rear of the vehicle.
* The Key: The FOBIK was retired in favor of the specialized "Smart Key" (Proximity Fob). While the emergency blade (Y164) remained the same, the transponder technology began its migration toward AES encryption.
* Network Change: The BCM (Body Control Module) architecture was updated, separating functions more distinctly between the BCM (lighting, locks) and the RF Hub (immobilizer, remote start). This period represents the "Transitional Era" where locksmiths had to upgrade their equipment to handle the new RF Hub protocols.5
2.3. The Fortress Era (2018â2021): The Secure Gateway
The 2018 model year introduced the Secure Gateway Module (SGW). This was a direct response to the "Jeep Hack" of 2015, where researchers demonstrated remote control of a vehicle via the cellular network.
* Impact: The SGW locked down the OBD-II port. Locksmiths could no longer program keys by simply plugging in. This necessitated the development of "Bypass Cables" and "Star Connector" interfaces.
* Standardization: By 2019, the 12+8 bypass method became the standard operating procedure for all Chrysler, Dodge, Jeep, and RAM vehicles.1
2.4. The Lockdown Era (2022â2023): The "Last Call" Security
The 2022 model year is distinct because of the retroactive and proactive security measures applied.
* The Intrusion Module: New for 2021/2022 was an enhanced intrusion sensor system designed to detect glass breakage and vehicle inclination (towing), triggering the alarm and inhibiting key programming.
* The Software Lock: TSB 08-086-22 (released early 2022) fundamentally changed the RF Hub's firmware. It removed the ability to add keys via diagnostic commands entirely in many scenarios, forcing a hardware replacement strategy for "All Keys Lost" situations. This is the defining characteristic of the 2022 platform.3


  



________________
3. Technical Architecture: The Hardware of Authorization
3.1. The Smart Key Fob: Forensic Identification
The primary interface for the 2022 Charger/Challenger is the "Smart Key" or Proximity Fob. Unlike the older FOBIK which acted as a physical turning device, the Smart Key remains in the driver's pocket, communicating via LF (Low Frequency) and RF (Radio Frequency) antennas.
3.1.1. Frequency and Cryptography
* Frequency: The system operates on 433 MHz (often listed as 433.92 MHz or 434 MHz). This is a departure from the 315 MHz systems used in older US domestic vehicles. The switch to 433 MHz aligns with global standards and offers better penetration in urban environments.5
* Transponder Chip: The transponder is a Hitag-AES chip, identified by diagnostic tools as PCF7953M or ID4A.6
   * Evolution: Pre-2015 models (and some low-trim 2015-2018s) used the Hitag-2 (ID46) protocol. Hitag-2 relies on a 48-bit secret key and proprietary encryption that has been cryptographically broken by researchers.
   * The Upgrade: Hitag-AES uses a 128-bit key and the open, robust Advanced Encryption Standard. This makes "cloning" a key by sniffing the airwaves virtually impossible without the secret key (ISK), which is stored securely in the RF Hub.
3.1.2. FCC ID Analysis
For the forensic locksmith, the FCC ID is the "fingerprint" of the key. Matching the correct ID is non-negotiable.
* Legacy (Pre-2011/Early LX): IYZ-C01C. This ID is found on the older FOBIK style keys. It is incompatible with the 2022 Keyless Go system.
* Modern (2011â2023): M3N-40821302. This is the ubiquitous ID for the Charger, Challenger, and Chrysler 300 smart keys. It covers a vast range of part numbers.
   * Crucial Insight: Just because two keys share the FCC ID M3N-40821302 does not mean they are interchangeable. The internal board configuration (PCB layout) and firmware vary between 3-button, 4-button, and 5-button layouts, and specifically between "Red" and "Black" key variants.5
3.1.3. OEM Part Number Matrix
A forensic locksmith must match the exact part number to the trim level to ensure full functionality, particularly for Remote Start and Panic features.
Vehicle Trim
	Button Configuration
	OEM Part Number
	FCC ID
	Chip ID
	SXT / GT / R/T
	3-Button (Lock, Unlock, Panic)
	68155686AA / AB
	M3N-40821302
	Hitag-AES (4A)
	SXT / GT / R/T
	4-Button (Lock, Unlock, Trunk, Panic)
	68394190AA
	M3N-40821302
	Hitag-AES (4A)
	R/T Scat Pack
	5-Button (Remote Start)
	68394196AA
	M3N-40821302
	Hitag-AES (4A)
	SRT Hellcat (Red)
	5-Button (Remote Start, Red Case)
	68394203AA / 68394205AA
	M3N-40821302
	Hitag-AES (4A)
	SRT Hellcat (Black)
	5-Button (Remote Start, Black Case)
	68234959AB
	M3N-40821302
	Hitag-AES (4A)
	Table 3.1: Key Fob Part Number Cross-Reference.5 Note that part numbers often supersede; 'AA' may become 'AB', 'AC', etc.
3.2. The RF Hub: Location and Function
The RF Hub is the "brain" of the locking system. It is a discrete module, separate from the BCM, that handles all wireless communication.
* Location Analysis:
   * User Confusion Alert: There is frequent confusion regarding the "Glove Box" vs. "Rear Shelf" location.
   * The Facts: The RF Hub Module itself is located on the rear shelf (C-pillar area) in the Charger and Challenger. In the Charger, it is often accessible by removing the rear seat backrest or through the trunk liner near the parcel shelf. In the Challenger, it is similarly located near the C-pillar.14
   * The Connection Point: The "Glove Box" location refers to the Star Connector (CAN Junction Block), which is the access point locksmiths use to communicate with the RF Hub.8
* Critical Functionality:
   1. Immobilizer Master: It stores the secret keys (SKIM codes) and validates the transponder signal.
   2. Remote Receiver: It contains the antenna receiver for the 433 MHz remote keyless entry (RKE) signals.
   3. TPMS Receiver: It processes signals from the tire pressure sensors.
   4. Ignition Authorization: Upon pressing the "Start" button, the RF Hub pings the interior Low Frequency (LF) antennas to triangulate the key's position. If the key is detected inside the cabin, it sends an "Ignition Allowed" message to the PCM.3
3.3. The Star Connector and CAN Topology
The Star Connector is a passive junction block that acts as a hub for the CAN bus wires. It connects multiple modules (Radio, HVAC, RF Hub, BCM) onto the same network segment.
* Location: In the 2022 Charger and Challenger, the primary CAN-C Star Connector (Green or White block) is located behind the passenger side glove box.8
* Forensic Relevance: This is the "Backdoor" to the vehicle's network. By unplugging a less critical module (like the Radio or HVAC) from this block and plugging in a locksmith's programming cable, one can inject messages directly onto the CAN-C bus, completely bypassing the Secure Gateway Module (SGW) located elsewhere in the dash.
________________
4. The Hellcat/Demon Special Operations: Red Key vs. Black Key
One of the most defining features of the Hellcat, Demon, and Jailbreak lineage is the dual-key system. For the forensic locksmith, understanding whether this is a hardware or software distinction is vital.
4.1. The Mechanism of Power Limitation
Contrary to some persistent myths, the "Red Key" and "Black Key" do not necessarily contain different types of transponder chips. Both use the same Hitag-AES architecture and FCC ID.13 The differentiation occurs at the software configuration level within the vehicle.
* Slot-Based Logic: When a key is programmed into the system, it is assigned a memory slot (e.g., Key 1, Key 2). The RF Hub associates the specific unique transponder ID of "Key 1" with a specific driver profile.
* The Power Table: In a Hellcat, the PCM references a lookup table. If the detected Transponder ID matches a key associated with "High Output" status (Red Key), the PCM unlocks the full fuel and spark maps (707+ HP). If the ID matches a "Restricted" status (Black Key), the PCM engages a rev limiter (4,000 RPM) and reduces boost pressure, capping output at ~500 HP.17
4.2. The SRT Track Key
A subset of this system is the SRT Track Key. While similar to the Red Key, the Track Key (often associated with the Demon or specific track packages) may unlock specific suspension and transmission calibrations optimized for drag racing (e.g., TransBrake, Line Lock logic). Forensically, this is handled identically to the Red Keyâit is a specific transponder ID authorized for a specific vehicle mode.
4.3. Aftermarket Shells and "False" Red Keys
A common issue in the secondary market is the "False Red Key."
* The Scenario: A customer buys a cheap red shell from Amazon, transfers the guts of their black key (or a generic programmed key) into it, and expects 700 HP.
* The Result: The car still sees the transponder ID associated with the "Restricted" profile. The shell color is irrelevant to the RF Hub.
* Forensic Implication: You generally cannot "program a black key to be a red key" simply by changing the plastic shell. The vehicle's BCM/RF Hub is often pre-configured or "taught" which key ID corresponds to which privilege level during the initial pairing process at the factory. However, aftermarket "cloning" attempts or improper slot programming by a locksmith can result in a "Red Key" shell that functionally acts as a "Black Key" if the vehicle does not recognize the privilege flag associated with that new transponder ID.7


  



________________
5. The "RF Hub Lockdown": TSB 08-086-22
5.1. The "Nuclear" Anti-Theft Patch
In early 2022, responding to high theft rates, Dodge released Technical Service Bulletin (TSB) 08-086-22. This is arguably the single most important factor for a locksmith working on a 2022 model.
The Update: The TSB involves flashing the RF Hub with new firmware.
The Consequence: Once updated, the RF Hub's "Program Key" routine is permanently disabled for the aftermarket and even for standard dealer tools in many contexts. The module is "locked" to the existing keys.
The Lockout: The software prevents any new key IDs from being written to the memory. It is a "Key Programming Lockdown" designed to stop relay attacks and OBD key-cloning thieves.3
5.2. Forensic Identification of a Locked Hub
Before attempting any work, the locksmith must determine if the vehicle has this update.
1. Check the UConnect Screen: Often, the update coincides with a "Valet Mode" enhancement or "Security Mode" prompt on the screen.
2. Scan Tool Identification: High-end programmers (Autel IM608, Smart Pro) may return a specific "Security Access Denied" or "Procedure Not Supported" error immediately upon attempting to access the RF Hub programming function, distinct from a standard SGW block.4
3. VIN Check: Run the VIN through a dealer service portal or a third-party check to see if TSB 08-086-22 has been performed.
5.3. The "Catch-22" of Service
If a customer loses all keys ("All Keys Lost" - AKL) on a 2022 Charger with the Lockdown update, the situation is critical.
* Standard Programming: Will fail. The hub will not accept a new key.
* The Remedy: You must replace the RF Hub with a new, virgin unit.
* The Problem: To initialize a new RF Hub, you typically need to turn the ignition ON to communicate. But you have no working keys, so you cannot turn the ignition ON. This creates a "Catch-22".21
The Workaround:
Forensic locksmiths utilize "Force Ignition" cables or specific menu functions in tools like the Autel IM608 ("Force Ignition ON" via CAN injection) to wake up the bus. Alternatively, on the bench, the new RF Hub can be pre-coded if the ISK (Secret Key) and VIN are known, but in the field, replacing the hub requires the ability to write the VIN to the new unit before programming keys. If the tools cannot communicate due to the SGW or lack of ignition, the job is dead in the water without specialized "CAN-wakeup" probes.15
________________
6. Forensic Programming Procedures: Step-by-Step
6.1. Equipment Requirements
To successfully service a 2022 Dodge Charger/Challenger, the following loadout is mandatory:
1. Advanced Programmer: Autel IM608 Pro (or II), Smart Pro, or wiTECH 2.0 (Dealer Tool).23
2. SGW Bypass: Chrysler 12+8 Cable or a Star Connector direct-connect cable.8
3. Power Supply: A robust battery maintainer (JNC660 or similar). These vehicles consume significant amperage during "Key On" engine-off modes, and voltage drops can brick the BCM.3
4. Virgin RF Hub (For AKL/Lockdown): If the vehicle is locked, a new OEM RF Hub (Part # varies by VIN) is required.
6.2. "Add Key" Procedure (If Not Locked)
If the vehicle does not have the Lockdown TSB (rare for 2022s maintained by dealers, but possible), or if you are adding a key to a system that still permits it:
1. Bypass Installation: Locate the Star Connector behind the glovebox. Connect the 12+8 or Star cable.
2. Read PIN: Connect the programmer. Select "Immo Status Scan". The tool will attempt to read the 4-digit PIN code from the RF Hub. In 2022 models, this often requires internet access as the PIN is pulled from a cloud database via the tool manufacturer (e.g., Autel server) or read via a "Dump" of the RF Hub eeprom data.26
3. Key Learning: Select "Add Smart Key".
4. The "Button Press" Ritual: The vehicle will prompt to press the UNLOCK button on the new key while holding it near the console or Start button.
5. Synchronization: The RF Hub handshakes with the key. If successful, the cluster will display "Key Memorized".
6.3. "All Keys Lost" (AKL) on a Locked System
This is the most challenging scenario facing modern locksmiths.
1. Confirm Lockdown: Attempt to read PIN or Connect. If "Security Access Denied", the hub is locked.
2. Hardware Replacement:
   * Physically remove the rear seat/shelf to access the RF Hub.
   * Disconnect and remove the Locked RF Hub.
   * Install the Virgin RF Hub.
3. The Ignition Problem: With a virgin hub and no programmed keys, the car will not turn "ON".
4. Force Ignition: Use the programmer's "Force Ignition" function or a specialized probe to energize the IGN relay.
5. Write VIN: CRITICAL STEP. You must write the vehicle's VIN into the new RF Hub immediately. Failing to do so or writing the wrong VIN can cause a mismatch with the PCM/BCM, leading to a "Start/Stall" condition (engine runs for 3 seconds then dies).15
6. Program Keys: Once the VIN is written, the new Hub is in "Learn Mode". Proceed with standard key programming. The first 2 keys programmed will become the "Masters".
7. Proxi Alignment: In some cases, a "Proxi Alignment" (restoring vehicle configuration data) is needed to sync the new Hub with the BCM's odometer and feature settings.


  



________________
7. Threat Vectors and Forensic Evidence
7.1. The "Relay Attack"
The primary threat to the LD/LC platform (before the Lockdown) was the relay attack. Thieves use two range extendersâone near the house (picking up the key signal) and one near the car.
* Forensic Evidence: There is virtually no physical evidence on the vehicle. The RF Hub logs a "Valid Key Authenticated" event. The only anomaly might be the timestamp of the entry, which would occur when the owner was asleep.
7.2. The "Hub Swap" Attack
Sophisticated thieves, knowing about the programming lockdown, may bring their own unlocked RF Hub and a matched key.
* Method: They break the window, rip out the rear seat, unplug the owner's Locked RF Hub, plug in their "Trojan" Hub, and drive away.
* Forensic Evidence:
   * Physical: Damaged rear seat latches, broken glass, loose trim panels near the C-pillar.
   * Digital: If the vehicle is recovered, the installed RF Hub will have a mismatched VIN (or no VIN) compared to the chassis. This is the "smoking gun" of a Hub Swap attack.
7.3. The "Can Injection" Attack (Headlight Hack)
Thieves access the CAN bus via the radar sensor or headlight wiring (accessible from the exterior wheel well). They inject "Unlock" messages directly into the bus.
* Forensic Evidence: Scratches or disturbed mud/debris inside the front wheel well liners. Unplugged headlight connectors.
________________
8. Dossier Data Sheets & Reference Tables
8.1. Critical Part Numbers


Component
	Part Number
	Notes
	RF Hub (Virgin)
	VIN Specific
	Must be ordered by VIN from dealer.
	Star Connector
	68322676AA
	Replacement block if pins are damaged.
	Bypass Cable
	Generic
	"12+8" or "Star Connector" type.
	Fob Battery
	CR2032
	Standard across all years.5
	8.2. Glossary of Terms
* FOBIK: Finger Operated Button Integrated Key (Older generation, inserts into dash).
* PEPS: Passive Entry Passive Start (The technical name for "Keyless Go").
* RFHM: Radio Frequency Hub Module.
* SGW: Secure Gateway Module.
* WIN: Wireless Ignition Node (The predecessor to the RF Hub, used in older Chryslers).
* ESL: Electronic Steering Lock (Rare on newer Chargers, but part of the immo chain on older LX platforms).
8.3. Troubleshooting Matrix


Symptom
	Probable Cause
	Forensic Solution
	Car starts then dies (3 sec)
	VIN Mismatch in RF Hub
	Perform "RF Hub Replace" routine again, focus on VIN write.15
	Remote works, No Start
	Key detected outside but not inside
	Check LF Antennas (center console, rear shelf) for disconnection.
	"Key Not Detected" (Good Battery)
	RF Interference / Aftermarket LED
	Unplug aftermarket LED lights or dash cams; they emit RF noise.27
	Programmer "Security Error"
	Locked RF Hub (TSB 08-086-22)
	Replace RF Hub with virgin unit.
	________________
9. Conclusion and Strategic Outlook
The 2022 Dodge Charger and Challenger represent the apex of internal combustion muscle cars, not just in performance, but in the complexity of their security architecture. The "RF Hub Lockdown" was a necessary response to an epidemic of thefts, but it has fundamentally altered the locksmithing landscape.
For the professional, the era of "plug and play" programming via the OBD port is over. Success now requires a forensic understanding of the vehicle's network topology (Star Connectors, SGW), a hardware-level readiness to replace modules (RF Hubs), and a nuanced grasp of the software logic that governs the Hellcat's dual-key personality.
As these vehicles age and enter the secondary market, the demand for "Unlocking" services for used RF Hubs will likely spawn a grey market of EEPROM flashing solutions. However, for now, the only compliant path for a locked 2022 model is the installation of virgin factory hardwareâa costly but secure procedure that ensures the integrity of the "Last of the V8s."
Works cited
1. FCA Security Gateway Module Basic Info and Location - JScan, accessed January 3, 2026, https://jscan.net/fca-security-gateway-module-basic-info-and-location/
2. Dodge Challenger: How to Diagnose Security Gateway Module (SGM) Issues | Clear DTCs, accessed January 3, 2026, https://www.youtube.com/watch?v=-q9ei9-LsOc
3. Technical Service Bulletin (TSB) - Flash: Radio Frequency Hub Module (RFHM) Updates - nhtsa, accessed January 3, 2026, https://static.nhtsa.gov/odi/tsbs/2023/MC-10236919-9999.pdf
4. Is IGLA still worth getting if the RF hub lockout was done? : r/Challenger - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Challenger/comments/1m9x3ix/is_igla_still_worth_getting_if_the_rf_hub_lockout/
5. 2022 Dodge Challenger Smart Remote Key Fob by Car & Truck Remotes, accessed January 3, 2026, https://www.carandtruckremotes.com/products/2022-dodge-challenger-smart-remote-key-fob-aftermarket
6. Dodge Charger 2019-2023 Smart Key, 3Buttons, 433MHz, M3M-40821302 - ABKEYS, accessed January 3, 2026, https://abkeys.com/products/dodge-charger-smart-key-3buttons-433mhz-m3m-40821302-2509
7. Used key fob (Dodge) : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/188cqjv/used_key_fob_dodge/
8. How to Find STAR connector in 2021 Dodge Challenger and Program New Smart Key with AutoProPAD G2 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=mJgdC6T82o0
9. Customer Satisfaction Notification YA7 Reprogram Powertrain Control Module - nhtsa, accessed January 3, 2026, https://static.nhtsa.gov/odi/tsbs/2022/MC-10222966-9999.pdf
10. 2022 Dodge Charger Challenger SRT Logo Limited Power Smart Key - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2019-2022-dodge-charger-challenger-srt-logo-limited-power-smart-key-5b-fob-fcc-m3n-40821302-68394198aa
11. NEW OEM 2019-2023 DODGE CHALLENGER SRT HELLCAT RED EYE REMOTE START FOB 68394205 | eBay, accessed January 3, 2026, https://www.ebay.com/itm/115725972996
12. 2019-2023 Dodge Integrated Key Fob Transmitter 68394203AA - My Mopar Parts, accessed January 3, 2026, https://www.mymoparparts.com/oem-parts/mopar-integrated-key-fob-transmitter-68394203aa
13. 2017 Dodge Challenger SRT Hellcat Smart Remote Key Fob - CarandTruckRemotes, accessed January 3, 2026, https://www.carandtruckremotes.com/products/2017-dodge-challenger-srt-hellcat-smart-remote-key-fob
14. 2013-2016 Dodge Charger / Chrysler 300 RFHUB Theft Locking Module Location and Removal - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=WY-5j8Fecd4
15. Resetting your RF Hub after a Push Button Conversion (or you just had to replace the hub), accessed January 3, 2026, https://www.youtube.com/watch?v=CNwWHbK4bJk
16. 2020 Dodge Charger SRT Hellcat Demon V8 Smart Remote Key Fob, accessed January 3, 2026, https://www.carandtruckremotes.com/products/2020-dodge-charger-srt-hellcat-demon-v8-smart-remote-key-fob
17. Red Key vs. Black Key: Unlocking Hellcat Power | Capital One Auto Navigator, accessed January 3, 2026, https://www.capitalone.com/cars/learn/finding-the-right-car/red-key-vs-black-key-unlocking-hellcat-power/2723
18. Dodge Charger SRT Hellcat Red Key Vs. Black Key Differences, accessed January 3, 2026, https://www.bomninchryslerdodgejeepram.com/dodge-charger-srt-hellcat-redeye-widebody-red-key-vs-black-key.htm
19. What Does The Red Key Mean On A Hellcat? (And How It's Different From Black), accessed January 3, 2026, https://www.slashgear.com/1834703/hellcat-red-key-vs-black-differences/
20. rf hub lockdown security update issues - Challenger - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Challenger/comments/1cd3fzk/rf_hub_lockdown_security_update_issues/
21. 2017 RAM 2500 -- Key Programming Catch 22 - ScannerDanner Forum, accessed January 3, 2026, https://www.scannerdanner.com/forum/post-your-repair-questions-here/32556-2017-ram-2500-key-programming-catch-22.html
22. 2014 Dodge Ram RF hub replacement. - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=nzNh4CUpVZw
23. 2022-2025 Dodge Pro-Master Smart Key Programming . - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=DvHCwwoUMXE
24. Autel IM608 | All Keys Lost on a 2016 Dodge Ram 3500 | Case Study 2020 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=lumgci703_Y
25. 2018-2022 Chrysler / Dodge / Jeep / Security Bypass Universal Programming Cable, accessed January 3, 2026, https://www.uhs-hardware.com/products/2018-2022-chrylser-dodge-jeep-security-bypass-universal-programming-cable
26. 4th Gen Ram (2013+), Reading your 4 digit RF Hub PIN with Alfaobd - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=C2RA5jvZeY8
27. Security Gateway Module Location & Bypass 5th Gen RAM 2500 3500 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=C5IktfsPu8U