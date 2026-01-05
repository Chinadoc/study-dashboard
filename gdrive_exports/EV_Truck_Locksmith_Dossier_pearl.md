ï»¿Electric Fortress: A Comprehensive Security and Technical Dossier on the 2023+ Ford F-150 Lightning, GMC Hummer EV, and 2024+ Chevrolet Silverado EV
1. Executive Summary: The Electrification of Automotive Security
The automotive industry is currently navigating a seismic architectural shift, transitioning from legacy internal combustion engine (ICE) platforms to dedicated Battery Electric Vehicle (BEV) architectures. For the automotive security professional, forensic engineer, and locksmith, this transition represents a fundamental change in operational protocol. The 2023 Ford F-150 Lightning, the GMC Hummer EV, and the 2024 Chevrolet Silverado EV stand as the vanguards of this new era in the light-duty truck segment.
These vehicles are not merely electrified versions of their predecessors; they are software-defined platforms running on advanced electrical architecturesâFordâs Fully Networked Vehicle (FNV) architecture and General Motorsâ Vehicle Intelligence Platform (VIP), commonly referred to as Global B. This report provides an exhaustive technical analysis of these systems, specifically tailored for security access, key programming, emergency response, and technical service.
Our analysis reveals a divergence in cryptographic standards and physical access protocols. While Ford maintains a 315 MHz frequency standard with NXP HITAG-PRO transponders, GM has migrated its Ultium-based trucks to 433/434 MHz frequencies utilizing high-security encryption that demands Controller Area Network Flexible Data-Rate (CAN FD) communication protocols. Furthermore, the reliance on 12V auxiliary power for high-voltage contactor management creates critical failure modes where a "dead battery" renders the vehicle physically inaccessible and digitally unresponsive, necessitating new "jump-start" procedures that differ radically from ICE norms.
This dossier serves as a definitive operational guide, synthesizing technical specifications, programming pearls, and safety protocols to ensure successful service delivery and emergency interaction with these high-voltage giants.


  



2. Ford F-150 Lightning (2022+): The FNV Architecture
The Ford F-150 Lightning retains the visual identity of the ubiquitous F-Series, but beneath the aluminum skin lies a modified Global Electric 1 (GE1) platform integrated with Ford's modern Fully Networked Vehicle (FNV) electrical architecture. This architecture represents a significant departure from the CGEA (Common Global Electrical Architecture) 1.3 found in previous generations of Ford trucks. For the locksmith and technician, the Lightning presents a unique hybrid of legacy F-150 procedures and novel EV-specific access requirements that demand a nuanced understanding of digital handshakes and power management systems.
The FNV architecture facilitates Over-The-Air (OTA) updates, deep cloud integration, and enhanced cybersecurity measures, primarily orchestrated by the Gateway Module (GWM). This module acts as the central router for vehicle communications, strictly policing traffic between the various CAN buses and the external diagnostic port. Consequently, the days of simple offline key programming are largely over; access now requires authenticated sessions with Ford's backend servers, a reality that necessitates specialized tooling and strictly maintained accounts.
2.1. Key Fob and Transponder Specifications
The primary interface for vehicle access remains the Smart Keyless Entry fob. Unlike the shift seen in General Motors vehicles towards higher frequency bands, the F-150 Lightning continues to utilize the 315 MHz frequency band for its remote functions, a standard long associated with North American Ford products.1 This adherence to legacy frequency standards provides a semblance of familiarity, yet the underlying transponder technology has advanced significantly to combat relay attacks and cloning attempts.
The hardware identification for these keys is critical for the locksmith, as visual similarity to previous model years belies internal incompatibility. The dominant FCC ID for the 2023 model year Lightning is M3N-A3C054338 for the smart proximity keys.2 This specific fob is a high-security device, typically featuring five buttons: Lock, Unlock, Trunk (Frunk) Release, Power Tailgate, and Panic. For lower trims such as the Pro or fleet-spec XLT, a "flip key" variant is utilized, bearing the FCC ID N5F-A08TAA.1 It is imperative to note that while these keys operate on the same 315 MHz frequency, they are not interchangeable between trim levels due to the differing transceiver protocols used by the Body Control Module (BCM) for passive entry versus active remote keyless entry.
At the heart of these fobs lies the NXP HITAG-PRO ID49 128-bit transponder.2 This specification represents a critical divergence from the older Texas Instruments 4D63 (80-bit) chips found in Ford vehicles just a few years prior. The ID49 chip utilizes a robust challenge-response encryption protocol that requires the programming device to query the vehicle's BCM for a challenge code, calculate the appropriate response using the transponder's secret key, and return the validated string to the vehicle. This process renders simple "cloning" tools ineffective; the key must be cryptographically enrolled into the vehicle's authorized key list.
Physical access to the vehicle in the event of a total power failure is provided by the emergency key blade. The Lightning utilizes the HU198 keyway, colloquially known as the "blunt tip" or "high security" blade.1 This keyway is side-milled, requiring a high-precision duplicator capable of tracing the complex internal or external tracks. Unlike standard edge-cut keys, the HU198 offers significantly higher resistance to lock picking and manipulation, but it also demands that the locksmith possess properly calibrated milling cutters, as worn equipment will result in a key that fails to turn the stiff tumblers of the door lock cylinder.
2.2. Physical Security and Glass Composition
Security professionals must be adept at identifying glass types before attempting physical entry or bypass techniques. The composition of the vehicle's glazing dictates the appropriate tools and tactics, and misidentifying the glass can lead to failed entry attempts, unnecessary damage, or injury. The 2023 Lightning Lariat and Platinum trims are confirmed to use acoustic laminated glass for the front driver and passenger windows.4
Laminated glass consists of two layers of annealed glass bonded to an inner polyvinyl butyral (PVB) layer.5 This construction is primarily designed for noise reduction ("SoundScreen") and occupant ejection mitigation during crashes, but it has profound implications for emergency access. Standard window wedges or "big easy" tools may cause stress cracks that propagate differently than in tempered glass, potentially ruining the window without creating an opening. More critically, traditional center punches or spring-loaded window breakers will fail to shatter laminated glass. Instead of disintegrating into small, relatively harmless cubes, the glass will merely suffer a localized spiderweb fracture, held together by the PVB interlayer. To breach a laminated window, a rescuer or technician must use a glass saw or a reciprocating saw to physically cut through the plastic layer, a time-consuming and debris-generating process.
In contrast, the rear door windows in the Lightning are typically tempered.6 Tempered glass is heat-treated to induce internal stress, ensuring that it shatters completely upon impact. For emergency extraction or destructive entry when non-destructive methods fail, the rear windows should always be the primary target. Recognizing the "SoundScreen" logo or the double-layered edge profile of the front windows is a crucial skill for any operator working on these vehicles.
2.3. Programming Protocols: FDRS and PATS
The Passive Anti-Theft System (PATS) on the F-150 Lightning is managed via the Body Control Module (BCM) and requires an authenticated session with Ford's servers. The days of offline token-based programming are receding, replaced by a system that demands real-time verification of the technician's credentials and the vehicle's status.
2.3.1. The FDRS Requirement
The primary tool for programming keys and updating modules on the Lightning is the Ford Diagnostic and Repair System (FDRS).8 Unlike older models that could be serviced with the Integrated Diagnostic System (IDS), the FNV architecture mandates FDRS for all module programming and security functions. The software operates on a licensing model, requiring technicians to purchase short-term or long-term access directly from Motorcraft Service.
A robust J2534 Pass-Thru interface is the physical bridge between the FDRS software and the vehicle. The Mongoose-Plus Ford 2 is the widely recommended interface, validated for the high-speed CAN traffic generated by the FNV architecture.8 The Bosch Mastertech II and Ford's proprietary VCM3 are also supported. It is widely reported that cheap "clone" adapters often fail during the secure handshake required for PATS functions. These failures usually manifest as communication dropouts during the critical key learning phase, potentially leaving the vehicle in a semi-programmed state where the old keys are erased but new ones are not yet added.
A critical "pearl" for locksmiths operating in the FDRS environment is the strict two-key requirement. For an "All Keys Lost" situation, the PATS system typically requires two distinct RFID signatures to close the programming cycle successfully.11 If the technician only has one key available, the system may remain in a "learn mode" or fail to exit the anti-theft state, preventing the vehicle from starting. This logic is a carryover from earlier Ford systems but is enforced more rigidly in the FDRS workflow. Technicians must ensure they have two compatible ID49 keys on hand before initiating an "All Keys Lost" procedure to avoid being stranded mid-job.
2.3.2. Phone As A Key (PaaK) and Backup Codes
The Lightning supports "Phone As A Key," allowing a smartphone to authenticate the start sequence via Bluetooth Low Energy (BLE). This feature adds a layer of convenience for the owner but introduces complexity for the service provider. The phone acts as a secure credential, communicating directly with the vehicle's BLE nodes to authorize entry and ignition.
However, the system anticipates phone failures (dead battery, lost device). In such scenarios, the user or technician can start the vehicle using a Backup Start Passcode. This is a numeric code entered directly onto the SYNC 4A infotainment screen.12 Knowing that the vehicle can be started without a physical fob via the center screen is vital for diagnostics if the owner is present but their phone/fob is unavailable.14 To recover or reset this code, access to the FordPass app is usually required, meaning the technician must have the owner's credentials or the device itself. In a lockout scenario where the 12V battery is active, checking for the prompt on the screen can differentiate between a "no key detected" fault and a complete system lockout.
2.4. Technical Architecture: 12V Power & "The Dead Frunk"
One of the most common and perplexing failure modes for the F-150 Lightning is the 12V battery failure. Despite having a massive high-voltage (HV) battery capable of powering a house for days, the vehicle's electronics, door locks, and high-voltage contactors are powered by a standard 12V AGM battery located in the frunk (front trunk). This architecture creates a critical dependency: the HV battery cannot be engaged without the 12V system closing the contactors, and the 12V system cannot be charged by the HV battery if the contactors are open.
2.4.1. The Catch-22 of Electric Latches
The failure of the 12V battery precipitates a "Catch-22" scenario. The frunk latch is electronically operated. If the 12V battery dies, the frunk cannot be opened to access the battery for recharging or replacement. Since the 12V battery is inside the frunk, the technician is effectively locked out of the power source needed to unlock the access point. This design oversight necessitates a specific manual override procedure that is not immediately obvious to those trained on internal combustion engine vehicles.
2.4.2. Emergency Bumper Access Procedure
Ford engineers included a workaround for this exact scenario, accessible from the exterior of the vehicle. There is a manual electrical override located in the front bumper, a feature shared with the Mustang Mach-E.
The access point is a small square cover on the front bumper, typically located on the passenger side near the tow hook cover.15 Removing this cover reveals two leads (tethers): one Red (+) and one Black (-). These leads are not connected directly to the vehicle's main 12V bus. Instead, they power a dedicated circuit solely for the frunk latch actuator.
To operate this system, the technician must connect an external 12V power source (such as a portable jump box) to these leads. It is critical to understand that this circuit only powers the frunk latch; it does not jump-start the vehicle, power the instrument cluster, or energize the chassis electronics. Once the external power is applied, the frunk latch will release, or the release button can be pressed to pop the hood. Once the frunk is open, the technician can access the actual 12V battery located under the cowl panel 17 to perform a proper jump start or battery replacement.


  



2.4.3. Jump Starting the System
Once the frunk is open, the technician must charge or jump the actual 12V battery. A crucial "pearl" for this procedure involves the source of the jump. Technicians must never attempt to jump-start an internal combustion engine (ICE) vehicle using the Lightning's 12V system. The Lightning's 12V battery is maintained by a DC-DC converter, not an alternator. This converter is designed to sustain steady-state accessory loads, not the massive, instantaneous current surge (Cold Cranking Amps) required to turn over a starter motor on a gas engine. Attempting to do so can blow the main fuses or damage the DC-DC converter.17
However, the reverse operationâusing an ICE vehicle to jump the Lightningâis permissible and safe. The Lightning only requires a modest amount of current to wake up the ECUs and close the high-voltage contactors. Once the contactors are closed, the high-voltage battery takes over, powering the DC-DC converter to recharge the 12V battery.
3. GMC Hummer EV & Chevrolet Silverado EV: The Ultium VIP Architecture
General Motors has introduced a radically different technological beast with the Ultium platform. The Hummer EV and Silverado EV utilize the Vehicle Intelligence Platform (VIP), also known internally as Global B. This architecture represents a quantum leap in data security, utilizing high-bandwidth communications and robust encryption that render older GM programming tools and techniques obsolete. While Ford's FNV feels like an evolution, GM's VIP is a revolution, a clean-sheet design prioritizing data throughput and cybersecurity above backward compatibility.
3.1. Architecture and Communication Protocols
The defining feature of the VIP architecture is the pervasive use of Controller Area Network Flexible Data-Rate (CAN FD). This protocol is an enhancement of the traditional CAN bus, designed to meet the bandwidth demands of modern software-defined vehicles.
3.1.1. The Physics of CAN FD
Traditional OBD-II programming tools and diagnostic scanners communicate at a standard rate of 500 kbps (kilobits per second). The CAN FD protocol, however, allows for data rates to switch to much higher speedsâup to 5-8 Mbpsâduring the data transmission phase of the frame. Furthermore, CAN FD supports a payload size of up to 64 bytes per frame, compared to the 8-byte limit of classic CAN.19
This technological shift creates a hard barrier for legacy equipment. A standard J2534 interface or an older key programmer cannot interpret the high-speed data stream; it sees the signal as noise or fails to synchronize with the bit timing. This leads to immediate communication failures where the tool cannot "wake up" the ECU or read the VIN, let alone perform complex security functions.20
3.1.2. The Locksmith Pearl: CAN FD Hardware
For the locksmith, the implication is clear: any attempt to program keys to a Silverado EV or Hummer EV must utilize a programmer capable of native CAN FD communication.
* Autel Tools: The MaxiIM IM608 Pro II has built-in CAN FD support, making it a "ready-to-go" solution. However, the older IM608 (Gen 1) requires a specialized CAN FD Adapter that plugs between the VCI and the OBD port to translate the signal.21
* Other Platforms: Tools from XTool and OBDStar also require specific CAN FD adapters if the hardware generation does not support it natively.19
* Failure Mode: Attempting to program without this hardware will result in a communication error. The tool will simply fail to connect, often leading the technician to incorrectly diagnose a vehicle fault when the issue is purely a tool incompatibility.
3.2. Key Fob and Cryptographic Standards
The shift to Global B has also brought a frequency change and a stricter reliance on OEM-proprietary codes, diverging from the domestic GM truck standards of the past two decades.
3.2.1. Specifications and Identification
* Frequency: Both the Hummer EV and Silverado EV utilize 433 MHz (specifically listed as 433.92 or 434 MHz in various regions).24 This is a sharp departure from the 315 MHz standard often seen in domestic GM trucks like the ICE Silverado or Tahoe.
* FCC ID: The unifying FCC ID for the Ultium truck platform is YG0G21TB2.24 This single ID covers both the Hummer and Silverado EV, streamlining inventory for the locksmith, although button configurations vary.
* Part Numbers:
   * Hummer EV (6-Button): Part numbers 13542577 and 13560224 are common. These fobs are feature-rich, including buttons for Lock, Unlock, Remote Start, Panic, Hood, and Tailgate.24
   * Silverado EV (3 to 5-Button): Part numbers 13547258 and 13548436 cover these models. The button layout varies by trim but often includes the "Frunk" (Bonnet) release.26
* Transponder: The chip is an NXP HITAG-PRO ID49 128-bit, similar to the Ford spec, but the data structure and encryption keys are distinct to GM's VIP architecture.25 They are not cross-compatible.
* Emergency Key: The mechanical key blade remains the HU100, a standard high-security laser-cut key used by GM for over a decade.25 This continuity allows locksmiths to use existing milling equipment and tracers.


  



3.3. Programming Protocols: SPS2 and the 10-Minute Wait
Programming keys on the Ultium platform is notoriously difficult due to the "online-only" nature of GM's security architecture. The vehicle essentially acts as a dumb terminal that must be authorized by the GM mothership for every security-related transaction.
3.3.1. SPS2 and Techline Connect
The official and most reliable method requires GM Techline Connect software accessing the Service Programming System 2 (SPS2). This is a cloud-based subscription service.
* Process: The technician must purchase a VIN-specific subscription (typically costing around $45 per slot). The software connects to the vehicle via the J2534 tool, reads the VIN, and then downloads the specific security calculation directly from GM's servers. There is no offline pin code reading or manual entry.
* The "VTD Secure Access" Pearl: A common and frustrating error encountered during programming is the "VTD Secure Access Locked" message.31 This error often halts the process before it begins. It is frequently caused by a mismatch between the software version in the Body Control Module (BCM) and the requirements of the new key or the SPS2 system. The solution, counter-intuitively, is often to update the BCM software first before attempting the key learning immobilization function. This update aligns the module's firmware with the latest security tables on the server.
* The 10-Minute Timer: The security access wait time is strictly enforced and is a legacy logic persisting in the new architecture. The system requires a 10-minute security wait where the ignition must remain in a specific state to prove physical presence and intent. Interrupting this timer, opening a door, or letting the voltage drop will abort the process 31, forcing the technician to restart the entire sequence.
3.3.2. Voltage Stability is Paramount
Electric vehicles, despite their massive propulsion batteries, are incredibly sensitive to 12V voltage fluctuations during programming. The high-speed modules of the VIP architecture draw significant current when "awake."
* Requirement: A clean, stable power supply (battery maintainer) providing 13.4V to 13.8V is mandatory.32
* Warning: Do not use a standard battery charger. Standard chargers often introduce AC ripple (noise) into the DC line, which can interfere with the delicate CAN FD signal. Use a programming-grade power supply. If the voltage drops below 12.5V, the SPS2 session will terminate with a "Severe Error" (code E4399 or E4403), potentially bricking the module and leaving the vehicle in a non-starting state.33
3.4. Emergency Access and Manual Overrides
In the event of total power failure or fob malfunction, the GM Ultium trucks offer specific manual override protocols that differ from the Ford approach.
3.4.1. Manual Entry
* Hummer EV: The manual key cylinder is located on the driver's door handle. In keeping with the vehicle's sleek aesthetic, the cylinder is often hidden behind a cosmetic cap. This cap must be carefully pried offâusually by inserting the key blade into a small slot underneathâto reveal the lock.34
* Silverado EV: Features a similar setup. It is important to note that the manual key only opens the door mechanical latch; it does not disable the alarm or start the car. Upon opening the door, the alarm will likely sound until the vehicle is started.
3.4.2. Backup Start Pockets
If the key fob battery is depleted, the vehicle can still be started using the passive Near Field Communication (NFC) coil embedded in the fob. This requires placing the fob in a specific location where the vehicle's reader can energize the chip.
* Hummer EV: The designated pocket is located in the center console cupholder (often the rear one). The fob must be placed with the buttons facing up to align the internal antenna with the reader coil.36
* Silverado EV: The pocket is also located in the center console/cupholder area. If the system fails to detect the key, the Driver Information Center (DIC) will display a prompt: "Place Transmitter in Pocket to Start".38
* Key Card: The Hummer EV also supports an NFC Key Card, similar to the system popularized by Tesla. The card is tapped on the B-pillar to unlock the vehicle and placed in the wireless charging pad or a specific spot in the console to authorize the drive system.39
3.4.3. The 12V Dead Battery & Hood Access
Like the Lightning, the GM EVs rely on 12V power to release the hood/frunk latches. However, GM has opted for a mechanical redundancy rather than an electrical one.
* Manual Release: Both the Hummer EV and Silverado EV feature a manual release cable located in the driver's footwell. It is typically found on the outboard side, near the kick panel or hood release lever area. This is a physical cable that must be pulled firmly twice to pop the hood latches.34
* Advantage: This mechanical solution is superior to Ford's electrical bumper leads in scenarios where the vehicle is accessible but completely dead. There is no need for an external jump box just to open the hood; physical force is sufficient.
* 12V Battery Location: Once the hood is open, the 12V battery is typically located under a plastic sight shield on the passenger side (Hummer) or near the firewall (Silverado).34
* Jump Starting: The procedure is standard: connect positive to positive and negative to the designated ground stud. Crucial Warning: Do not connect the negative jumper cable directly to the battery's negative terminal if a Battery Management System (BMS) sensor is present on the post. Connecting directly to the terminal bypasses the sensor, meaning the vehicle's computer will not register the incoming charge current. This can confuse the state-of-charge logic and lead to persistent battery warning messages or premature shutdown.43
4. Safety Protocols and High Voltage Management
For first responders, tow operators, and technicians, the presence of 400V+ (and potentially 800V in the Hummer EV's series/parallel battery configuration) requires strict adherence to safety protocols to prevent electrocution or thermal runaway.
4.1. High Voltage (HV) Disabling
In the event of a severe accident, extrication, or major service, the HV system must be reliably isolated to ensure the chassis is safe to touch and tools can be used without arcing risks.
* The "Cut Loop" System: Both Ford and GM vehicles feature a low-voltage "First Responder Cut Loop." This is a dedicated low-voltage wire that, when severed, breaks the circuit powering the high-voltage contactors. Since the contactors are "normally open" (they require power to stay closed), cutting this loop causes them to spring open, physically disconnecting the HV battery from the rest of the vehicle.
   * Ford: The loop is often located in the frunk area or near the 12V battery service disconnect.45
   * GM (Ultium): The cut loop is typically marked clearly with yellow tape and located under the hood near the front compartment sight shield. The specific protocol for GM vehicles is to double cut this loopâremoving a section of the wire entirelyâto ensure that the ends cannot accidentally touch and re-complete the circuit.46
* 12V Disconnect: Disconnecting the 12V battery negative cable is the secondary method of disabling the HV system. Without 12V control power, the HV contactors cannot remain closed. However, GM explicitly warns not to disable the 12V battery if the "Battery Danger Detected" notification is active on the dashboard. In this specific scenario, the 12V system is powering the thermal runaway mitigation pumps and fans, which are actively cooling a damaged battery to prevent a fire. Disabling the 12V power in this state could accelerate a thermal event.46
4.2. Glass Composition and Extrication Tactics
In emergency extrication, knowing the glass type is vital for rapid entry and patient access. The transition to EVs has driven manufacturers to use more laminated glass to improve cabin acoustics (masking the lack of engine noise) and thermal efficiency.
* Windshields: Always laminated, as per federal regulation.
* Side Windows:
   * Ford Lightning: The front side windows are confirmed to be Laminated (acoustic glass) on higher trims.4 This presents a barrier to standard punches. The rear side windows, however, are often Tempered, making them the softer target for entry.
   * GM EVs: The Silverado EV and Hummer EV typically feature Laminated front side windows.46 The rear side windows and the rear windshield are typically Tempered.48
* Tactical Implication: Rescuers approaching a locked vehicle with an unresponsive patient should prioritize the rear door windows for rapid entry using a center punch. Attempting to break the front driver's window with a punch will likely fail, wasting valuable seconds. If front entry is required, a glass saw (such as a Glass-Master) or a reciprocating saw is necessary to cut through the PVB layer of the laminated glass.
5. Comparative Analysis & Locksmith Pearls
5.1. Philosophy of Access: Physical vs. Digital
The comparison between the Ford and GM platforms reveals a distinct philosophical difference. Ford's "dead frunk" solutionâelectrical leads in the bumperâis a digital-first approach. It assumes the availability of a jump box and prioritizes a clean exterior design free of mechanical levers. It is elegant but introduces a dependency on external tools. GM's approachâa mechanical cable in the footwellâis a pragmatic, analog solution. It ensures that if you can get into the cabin (which has its own mechanical backup), you can open the hood. For a technician in the field without a charged jump pack, the GM solution is significantly more robust.
5.2. The "All Keys Lost" Scenario
In an "All Keys Lost" scenario, the difference in difficulty between the two platforms is stark.
* Ford Lightning: The process is time-consuming but straightforward if the technician has FDRS and two keys. The "two-key" rule is the primary stumbling block. The cost of the job is driven by the need for two expensive OEM fobs.
* GM Ultium: The process is high-stakes. The requirement for CAN FD hardware, the 10-minute online timer, and the strict voltage requirements make this a "pass/fail" exam for the locksmith. A voltage drop at minute 9 can abort the process, requiring a full restart. The "VTD Secure Access" error is a common showstopper that demands diagnostic capability (updating modules) beyond simple key programming.
5.3. Recovery from "Bricked" Updates
Both platforms are susceptible to "bricking" during Over-The-Air (OTA) updates or failed module programming, often leaving the vehicle unresponsive.
* Ford Pearl: If an update fails and the vehicle appears dead, the 12V reset is the first line of defense. Disconnecting the negative terminal for 15+ minutes can force a reboot of the Gateway Module. Furthermore, ensuring the 12V battery is at 100% state of charge (SOC) is critical; many update failures are false positives caused by a weak 12V battery triggering a BMS cutoff to preserve starting power.49
* GM Pearl: If an SPS2 programming session fails with a communication error (E4399), technicians should not replace the control module immediately. The SPS2 software includes a "Replace and Reprogram" function that can attempt to overwrite the corrupted partition even if the module is not identifying correctly. If the "VTD Lock" persists, leaving the battery disconnected for 15 minutes can reset the BCM's internal security timer logic, clearing the lockout state.51
5.4. Diagnostic Protocol for No-Start Conditions
When a technician approaches a non-responsive EV truck, a rigid diagnostic hierarchy must be followed to avoid misdiagnosis.
1. Check Key Fob Signal: Ensure the fob battery is good. Try the backup slot immediately. If the vehicle starts, the issue is RF interference or a bad fob battery, not the truck.
2. Check 12V Status: If the vehicle is completely dark (no dome lights, no screens), the 12V is likely dead.
   * Ford: Apply power to bumper leads -> Open Frunk -> Test Battery.
   * GM: Pull manual cable -> Open Hood -> Test Battery.
3. Check High Voltage Interlock: If the 12V is good but the vehicle won't go into "Ready" mode (Green car icon), check if the HV disconnect loop has been tampered with or if the 12V disconnect switch (if equipped for transport) is open.
6. Conclusion
The 2023 Ford F-150 Lightning and the 2024 GM Ultium trucks (Hummer/Silverado EV) represent a bifurcation in automotive security. Ford has chosen an iterative path, adapting its FNV architecture with 315 MHz legacy support and unique physical overrides like the bumper access leads. General Motors has opted for a revolutionary path with the VIP architecture, demanding 433 MHz, CAN FD, and strict online programming protocols that raise the barrier to entry for independent service providers.
For the locksmith and security professional, the toolkit must evolve. High-quality J2534 interfaces, CAN FD adapters, and robust 12V power supplies are no longer optional accessoriesâthey are prerequisites for entry. Furthermore, the understanding of 12V auxiliary system dependencies is now a critical safety skill; mismanaging the 12V system can leave a technician locked out, or worse, inadvertently disable safety cooling loops for the high-voltage battery. As these platforms mature, we anticipate a continued hardening of security protocols, likely necessitating even closer integration with OEM cloud services for all authorized access.
7. Comprehensive Data Tables
7.1. Key Fob & Transponder Specifications


Feature
	2023 Ford F-150 Lightning
	GMC Hummer EV / Silverado EV (2024+)
	Platform
	GE1 (Modified FNV)
	Ultium (VIP / Global B)
	Remote Frequency
	315 MHz 1
	433 / 434 MHz 24
	Primary FCC ID
	M3N-A3C054338 (Smart) / N5F-A08TAA (Flip)
	YG0G21TB2 24
	Transponder Chip
	NXP HITAG-PRO ID49 (Ford Spec)
	NXP HITAG-PRO ID49 (GM VIP Spec)
	Emergency Blade
	HU198 (Blunt Tip / High Security)
	HU100 (Laser Cut / High Security)
	Programming Tool
	FDRS (J2534) or Forscan (limited)
	SPS2 via Techline Connect (J2534 + CAN FD)
	Adapter Requirement
	Standard J2534 (Mongoose-Plus)
	CAN FD Adapter Mandatory 23
	Backup Start
	Passcode on SYNC Screen 13
	Key Pocket in Cupholder/Console 37
	7.2. Emergency Access & 12V Management


Feature
	2023 Ford F-150 Lightning
	GMC Hummer EV / Silverado EV (2024+)
	Hood/Frunk Access (Dead 12V)
	Electronic Override: Power leads behind front bumper panel.15
	Mechanical Override: Manual cable pull in driver's footwell.40
	12V Battery Location
	Under Frunk Cowl (Passenger Side).17
	Under Hood Sight Shield (Passenger/Firewall).34
	Jump Start Point
	Remote posts under frunk panel (once opened).
	Remote posts under hood.
	Jump Start Constraint
	Do NOT jump ICE vehicle from Lightning (DC-DC limit).17
	Standard precautions; do not bypass BMS sensor.
	HV Cut Loop Location
	Frunk/Engine Bay (Low Voltage Disconnect).
	Under Hood (Double Cut Loop - Yellow Tape).46
	Glass Type (Front)
	Laminated (Acoustic).4
	Laminated.46
	Glass Type (Rear)
	Tempered (Usually).6
	Tempered (Usually).46
	Works cited
1. 2023 Ford F - 150 F150 Remote Key Fob - CarandTruckRemotes, accessed January 3, 2026, https://www.carandtruckremotes.com/products/2023-ford-f-150-f150-remote-key-fob
2. 2023 Ford F-150 Lightning Smart Key Remote PN: 164-R8304, NL3T-15K601-EB, accessed January 3, 2026, https://remotesandkeys.com/products/2023-ford-lightning-smart-key-remote-pn-164-r8304-nl3t-15k601-eb
3. 5 x 2020-2023 Ford / HU198 / Flip Blade Key Replacements w / 7 Pins / 5942527 / (STR, accessed January 3, 2026, https://www.uhs-hardware.com/products/5-x-2020-2023-ford-hu198-flip-blade-key-replacements-w-7-pins-5942527-str-5942527-bundle-of-5
4. Does the Lightning have acoustic (laminated) glass?, accessed January 3, 2026, https://www.f150lightningforum.com/forum/threads/does-the-lightning-have-acoustic-laminated-glass.10241/
5. What's the Difference Between Tempered and Laminate Windshield Glass?, accessed January 3, 2026, https://www.dkboosglass.com/blog/difference-between-tempered-laminate-windshield-glass/
6. Ford F150 Rear Glass Replacement 2023-2024 Ford F-Series Right Rear Door Window Glass (Crew Cab Models) - Tempered & Solar Controlled Passenger Window - martinispa.com, accessed January 3, 2026, https://www.martinispa.com/Ford-F-Series-Right-Rear-Door-Window-Glass-Crew-Cab-Models/795363
7. 2023-2024 Ford F-Series Right Rear Door Window Glass (Crew Cab Models) - Tempered & Solar Controlled - gilgharda.com, accessed January 3, 2026, https://www.gilgharda.com/goods/Ford-F-Series-Right-Rear-Door-Window-Glass-Crew-Cab-Models/1090229
8. Programming your Ford in your Driveway | FDRS Intro - Ford Diagnostic and Repair System, accessed January 3, 2026, https://www.youtube.com/watch?v=ShMTtJoqfKc
9. The Complete DIY Guide to Updating Your Mach-E with FDRS | MachEforum, accessed January 3, 2026, https://www.macheforum.com/guide-to-updating-your-mach-e-with-fdrs-alternative-to-forscan/
10. How to Install FDRS (Ford Diagnostics) for your F-150, Lightning, or Mustang, Step by Step, accessed January 3, 2026, https://www.youtube.com/watch?v=d01ghEu6ZAQ
11. Ford FDRS : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1ati7ci/ford_fdrs/
12. How do I recover my Backup Start Passcode for Phone As A Key? - Ford, accessed January 3, 2026, https://www.ford.com/support/how-tos/ford-app/phone-as-a-key/how-do-i-recover-my-backup-start-passcode-for-phone-as-a-key/
13. How do I make a Phone As A Key Backup Start Passcode for my Ford vehicle?, accessed January 3, 2026, https://www.ford.com/support/how-tos/ford-app/phone-as-a-key/how-do-i-make-a-phone-as-a-key-backup-start-passcode-for-my-ford-vehicle/
14. How do I set up Phone As A Key with the Ford app?, accessed January 3, 2026, https://www.ford.com/support/how-tos/ford-app/phone-as-a-key/how-do-i-set-up-phone-as-a-key-with-the-ford-app/
15. How do I open the front luggage compartment on my Mustang Mach-E without vehicle power? - Ford, accessed January 3, 2026, https://www.ford.com/support/how-tos/more-vehicle-topics/storage-and-trunk/how-do-i-open-the-front-luggage-compartment-on-my-mustang-mach-e-without-vehicle-power/
16. How to gain access with dead 12v : r/MachE - Reddit, accessed January 3, 2026, https://www.reddit.com/r/MachE/comments/1huneks/how_to_gain_access_with_dead_12v/
17. Ford electric F150 Lightning 12v battery access and boosting - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=xc5iZYHp_-0
18. Jump starting : r/F150Lightning - Reddit, accessed January 3, 2026, https://www.reddit.com/r/F150Lightning/comments/1iek626/jump_starting/
19. OBDSTAR CAN FD Programming Adapter - 2020-2023 GM - Your Car Key Guys, accessed January 3, 2026, https://yourcarkeyguys.com/products/obd-star-can-fd-programming-adapter-2020-2021-gm
20. Autel CAN FD? : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/zurqs4/autel_can_fd/
21. Autel MaxiIM IM608 PRO II Automotive All-In-One Key Programming and Di - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/autel-maxiim-im608-pro-ii-automotive-all-in-one-key-programming-and-diagnostic-tool-no-area-restriction
22. How To Use Autel IM608 Pro Car Key Programmer - Introduction and Unboxing - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=t1OvWATiRh4
23. XTool AutoProPAD CAN-FD Adapter For 2020-2023+ GM Vehicles - Key Innovations, accessed January 3, 2026, https://keyinnovations.com/products/xtool-can-fd-adapter
24. 2024 GMC Hummer Ev Smart Key Remote PN: 13542577, accessed January 3, 2026, https://remotesandkeys.com/products/2024-gmc-hummer-ev-smart-key-remote-pn-13542577
25. GMC New OEM 2024-2025 Hummer EV Smart Key 6B Hood, accessed January 3, 2026, https://royalkeysupply.com/products/gmc-new-oem-2024-2025-hummer-ev-smart-key-6b-hood-remote-start-fccid-yg0g21tb2-pn-13542579
26. 2024 Chevrolet Silverado Ev Smart Key Remote PN: 13547258, accessed January 3, 2026, https://remotesandkeys.com/products/2024-chevrolet-silverado-ev-smart-key-remote-pn-13547258
27. 2024 Chevrolet Silverado Smart Key 3B Fob FCC# YG0G21TB2 - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2024-chevrolet-silverado-smart-key-3b-fob-fcc-yg0g21tb2
28. GMC Hummer EV Pickup Prox Key 13560224 YGOG21TB2 6B Grade A - Key4, accessed January 3, 2026, https://www.key4.com/gmc-hummer-ev-pickup-smart-remote-key-13560224-ygog21tb2-6b-refurbished-grade-a
29. Chevrolet Silverado EV Proximity Remote Key 13547258 YG0G21TB2 5B - Key4, accessed January 3, 2026, https://www.key4.com/chevrolet-silverado-ev-smart-remote-key-13547258-yg0g21tb2-5b
30. 2022-2024 GMC Hummer EV / 6-Button Smart Key / PN: 13542577 / YG0G21TB2 (OEM), accessed January 3, 2026, https://www.uhs-hardware.com/products/2022-2024-gmc-hummer-ev-6-button-smart-key-pn-13542577-yg0g21tb2-oem
31. Sps2 VTD secure access lock : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/1j8zxns/sps2_vtd_secure_access_lock/
32. Latest Techline Connect Tips Shared by the TCSC - TechLink, accessed January 3, 2026, https://gm-techlink.com/wp-content/uploads/2023/01/GM_TechLink_23_December_2022.pdf
33. Service Programming System (SPS) Errors (E4398, E4399, E4403, M4404, M4413, M6954 - nhtsa, accessed January 3, 2026, https://static.nhtsa.gov/odi/tsbs/2022/MC-10222841-0001.pdf
34. Hummer EV 12V Battery & Manual Frunk Access - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=6IFZ_t-oWiw
35. Keyless Open and Start | Vehicle Support - GMC, accessed January 3, 2026, https://www.gmc.com/support/vehicle/security/keyless-open-start
36. How to Start Your GMC if Your Key Fob Battery Dies [2025] - Eagle Buick GMC, accessed January 3, 2026, https://www.eaglebuickgmc.com/blogs/6949/how-to-start-your-gmc-if-your-key-fob-battery-dies-2025
37. Open and Start GMC SUVs and Trucks with a dead key fob, 2021 through 2024. - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=Gc2nloFzURs
38. 2019 - 2022 Chevy Silverado NO REMOTE DETECTED - How To Start Chevrolet With Dead Key Fob Battery - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=M6PkFUNa35g
39. How to Use Key Card | Vehicle Support - GMC, accessed January 3, 2026, https://www.gmc.com/support/vehicle/security/how-to-use-key-card
40. GMC HUMMER EV Truck / Pickup, accessed January 3, 2026, https://www.gmstc.com/wp-content/uploads/2022/12/GMC-Hummer-EV-Pickup-2022-Emergency-Response-Guide_English.pdf
41. GMC HUMMER EV Truck / SUV, accessed January 3, 2026, https://www.gmstc.com/wp-content/uploads/2022/12/GMC-Hummer-EV-SUV-2024-Emergency-Response-Guide_English.pdf
42. eTrunk | Silverado EV Quick Start Guide - Chevrolet, accessed January 3, 2026, https://www.chevrolet.com/support/silverado-ev-quick-start-guides/etrunk
43. Jump Starting an EV | Rick Hendrick Chevrolet, accessed January 3, 2026, https://www.rickhendrickchevy.com/service/service-tips/how-to-jump-start-an-ev/
44. Jump Starting Car Using EV | Shakopee Chevrolet, accessed January 3, 2026, https://www.shakopeechevrolet.com/service/service-parts-information/how-to-jump-start-an-ev/
45. First Responder Resources | Electric Vehicles | FordÂ®, accessed January 3, 2026, https://www.ford.com/firstresponder/
46. Chevrolet Silverado EV 4 Door Pick-up Truck 2024 -, accessed January 3, 2026, https://www.gmstc.com/wp-content/uploads/2024/11/Chevrolet_Silverado-EV_Pick-up_2024_4d_Electric_EN_-1GC-23101.pdf
47. Chevrolet Silverado EV 4 Door Pick-up Truck, accessed January 3, 2026, https://www.gmstc.com/wp-content/uploads/2024/11/Chevrolet_Silverado-EV_Pick-up_2024_4d_Electric_EN_ERG_-1GC-23101.pdf
48. Tempered Passenger Right Side Rear Door Window Door Glass Compatible with Chevrolet Silverado EV 2024-2025 Models (Only For Electric Vehicles) - National Auto Glass Direct, accessed January 3, 2026, https://nagd1.com/products/tempered-passenger-right-side-rear-door-window-door-glass-compatible-with-chevrolet-silverado-ev-2024-models-only-for-electric-vehicles
49. Brand new lightning 12V battery dead. Stuck in middle of road. : r/F150Lightning - Reddit, accessed January 3, 2026, https://www.reddit.com/r/F150Lightning/comments/1nbskqe/brand_new_lightning_12v_battery_dead_stuck_in/
50. Been like this for a couple weeks now. Anyone know of any way to rectify? : r/F150Lightning, accessed January 3, 2026, https://www.reddit.com/r/F150Lightning/comments/1dk8bm5/been_like_this_for_a_couple_weeks_now_anyone_know/
51. PRELIMINARY INFORMATION - nhtsa, accessed January 3, 2026, https://static.nhtsa.gov/odi/tsbs/2025/MC-11022132-0001.pdf
52. Resolving Service Programming Errors - GM Repair Insights, accessed January 3, 2026, https://gmrepairinsights.com/programming-errors/