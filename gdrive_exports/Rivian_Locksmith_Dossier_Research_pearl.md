ï»¿2022+ Rivian R1T / R1S / EDV: The Complete Locksmith Dossier & Security Architecture Analysis
1. Executive Intelligence Brief: The Post-Mechanical Locksmithing Era
1.1. The Paradigm Shift in Automotive Access
The automotive security landscape is currently undergoing a violent bifurcation, and the Rivian R1 platform stands at the epicenter of this rupture. For over a century, the profession of locksmithing has rested on a stable duality: the physical manipulation of mechanical tumblers and, more recently, the electronic programming of transponders via standardized ports. The introduction of the Rivian R1T (pickup) and R1S (SUV) effectively dissolves the first half of this trade for the consumer market and radically re-engineers the second, creating a platform that is less a vehicle and more a rolling, software-defined fortress.
For the modern locksmith, the Rivian platform represents a hostile environment for traditional methodologies. There are no external key cylinders on the consumer R1 vehicles.1 There are no OBD-II key programming pathways accessible to aftermarket tools like the Autel IM608, Xhorse Key Tool Plus, or similar distinct programmers.2 There is no "picking" a door lock to gain entry because there is no lock to pick. The vehicle relies entirely on a "Phone-as-a-Key" (PaaK) architecture, supported by proprietary NFC standards and Ultra-Wideband (UWB) triangulation, all guarded by a cloud-dependent authorization architecture that currently excludes the independent security professional from the administrative loop.
The implications for the trade are profound. The locksmithâs role shifts from "manipulator of locks" to "manipulator of voltage and logic." The primary failure mode for these vehicles is not a lost keyâthough that occursâbut a "dead vehicle" state where the 12-volt low-voltage system fails, rendering the electronic locks inoperable.1 In this context, the locksmithâs primary toolset transitions from the tension wrench and pick set to the high-amperage 12V jump pack and the Torx driver needed to disassemble vehicle panels.


  



1.2. Scope of Dossier & Platform Definitions
This dossier serves as an exhaustive technical manual for the entry, authorization, and security systems of Rivianâs current vehicle lineup. It is designed to bridge the "Critical Gap" in locksmith knowledge regarding emerging EV manufacturers who do not adhere to legacy automotive standards.
The Consumer Platform (R1 Series):
* Rivian R1T (2022+): A dual- or quad-motor electric pickup truck. It is characterized by its "gear tunnel" (a storage compartment between the cab and bed) and a powered tonneau cover, both of which present unique lockout challenges.1
* Rivian R1S (2022+): A three-row electric SUV built on the same "skateboard" chassis. Its enclosed cabin creates different acoustic and pressure dynamics during door closure, and its rear liftgate operation is entirely electronic.4
The Fleet Platform (Commercial):
* Rivian EDV / RCV (500/700/900): The Electric Delivery Van, widely known as the Amazon Delivery Van (EDV). While sharing the battery and propulsion architecture of the R1, the upper body is a completely different organism with utilitarian hardware. Crucially, and unlike the R1, it retains a mechanical key cylinder for driver door access, creating a bifurcated approach for locksmiths depending on the client.5
The following sections dissect the physics of the entry sensors, the cryptographic nature of the credentials, the specific locations of emergency overrides, and the critical operational differences between the consumer and commercial variantsâa distinction that can mean the difference between a five-minute entry and a catastrophic damage claim.
________________
2. Vehicle Architecture & Identification
Before attempting any form of entry or service, positive identification of the platform and its specific generation is critical. Rivian vehicles undergo rapid "running changes" in production that affect the location of batteries, the type of glass used, and the availability of mechanical overrides.
2.1. The Consumer Platform: R1T & R1S
The R1T (Truck) and R1S (SUV) share approximately 91% of their components, yet their entry points differ significantly at the rear. The locksmith must recognize the flush door handles which sit flush with the bodywork when locked. These handles are electronically actuated; pulling on them when the vehicle is locked or dead yields no mechanical resistance or linkage engagement.7
Glass Composition Analysis:
Glass composition dictates the strategy for emergency destructive entry.
* Windshield: Acoustic Laminated glass. It possesses high resistance to impact and is extremely difficult to cut or break for entry.
* Front Side Windows: Laminated. This is a crucial "Gotcha" for first responders and locksmiths. The front driver and passenger windows utilize acoustic laminate layers for noise reduction. Standard spring-loaded center punches will fail here, resulting in a spiderweb crack but no penetration.8
* Rear Side Windows: Tempered. This is the designated "breach point" for destructive entry if absolutely necessary. A single point impact will shatter the glass into cubes, allowing for immediate clearing and access to the interior door release.8
* Roof: A single, massive fixed glass panel. It is laminated and structural. Never attempt entry through the roof.10
2.2. The Fleet Platform: EDV / RCV
The Electric Delivery Van (EDV) is a distinct beast. While it shares the "skateboard" chassis and battery architecture, its upper body is utilitarian and designed for high-cycle commercial use.
* Key Distinction: Unlike the R1T/R1S, the EDV does possess a mechanical key cylinder. It is located on the driverâs door, adjacent to the handle assembly. In some iterations, it may be concealed by a small trim piece, but it provides direct mechanical actuation of the latch.6
* Bulkhead Security: The EDV features a secure bulkhead door separating the driver cockpit from the cargo area. This door locks electronically. Locksmiths must be aware that gaining entry to the cab does not guarantee access to the cargo area, which operates on a separate logic loop dependent on the fobâs proximity.11
* Cargo Doors: The rear roll-up door and side slider are electronically controlled. There are no external mechanical cylinders for the cargo area, creating a scenario where a driver can be in the cab but locked out of the cargo if the electrical system fails.11
2.3. The 12-Volt Architecture Split (Gen 1 vs. Gen 2)
Understanding the low-voltage (12V) system is more important than understanding the lock cylinders, as the 12V system powers the locks.
* Dual Battery System (Early Gen 1): Vehicles produced before approximately March 2023 feature two 12V lead-acid batteries located in the cowl area (under the plastic trim between the frunk and windshield). One battery serves as the primary for startup/high-current loads, while the other maintains steady-state electronics. Failure in either can cause lockout conditions.12
* Single Battery System (Late Gen 1 & Gen 2): Vehicles produced after March 2023 moved to a single, proprietary 12V system. This is often a lithium-ion module (Ohmmu-style but Rivian specific) or a consolidated lead-acid layout in transitional models. This change affects how the vehicle responds to "jump" attempts; the lithium modules have internal BMS (Battery Management Systems) that can trip, requiring a specific wake-up voltage procedure.13
________________
3. The Authentication Ecosystem: "No Key" Operations
Rivianâs approach to authentication is a "Phone-as-a-Key" (PaaK) first philosophy. The physical objects handed to the ownerâthe fob and cardâare secondary backups, not primary tools. This hierarchy is essential for the locksmith to understand when diagnosing a lockout, as the failure of the primary (phone) is the most common cause of service calls.
3.1. Primary Layer: Phone-as-a-Key (PaaK)
The primary credential is the ownerâs smartphone running the Rivian App.
* Technology: Bluetooth Low Energy (BLE) is used for proximity detection. The vehicle has multiple BLE antennas located in the door pillars, mirrors, and rear bumper to "triangulate" the phone's position.
* Gen 2 Upgrade: Newer models (Gen 2 R1S/R1T) introduce Ultra-Wideband (UWB) chips. UWB allows for "Time of Flight" calculations, measuring the exact time it takes for a signal to travel from the phone to the car. This prevents relay attacks (where a thief boosts the signal from a key inside a house) and allows the car to know exactly where the phone is (e.g., inside the driverâs pocket vs. outside the door) with centimeter-level precision.14
* Failure Mode: If the phone battery dies, or the Bluetooth stack crashes (a common issue with early app versions), the user is locked out. Furthermore, if the Rivian App is "force closed" by the user, the BLE background service stops, and the key stops working.
3.2. Secondary Layer: The Key Fob
The Rivian key fob is a unique piece of hardware, designed to look like a carabiner.
* Construction: It is waterproof (IP67), TPU-coated, with an integrated aluminum carabiner loop. This rugged construction is intended for outdoor "adventure" use.16
* Signal: It operates on BLE (Bluetooth Low Energy) 2.4GHz, similar to the phone, rather than the 315MHz/433MHz frequencies used by traditional automotive fobs.17 This means standard RF signal detectors used by locksmiths to check for "pulse" may not detect the constant low-energy beacon of the Rivian fob.
* The "Sleep" Issue: To conserve its CR2450 battery, the fob goes into a deep sleep when motionless. It requires movement (accelerometer data) to wake up and transmit. A fob sitting on a car seat inside the vehicle might not be detected if it hasn't moved, leading to a lockout if the car auto-locks.18
* No Blade (R1 Platform): The R1T/R1S fob contains NO mechanical emergency key blade. It is a purely electronic device.
* Hidden Blade (EDV Platform): The EDV fob does contain a mechanical blade. It is ejected by pressing a button on the flat side of the fob. This is the only physical key in the Rivian ecosystem.6
3.3. Tertiary Layer: The Key Card
This is the "Service Key" and the ultimate backup.
* Form Factor: A standard ISO 7810 ID-1 card (credit card size).
* Technology: NFC (Near Field Communication) operating at 13.56 MHz.
* Chipset: The card utilizes the NXP MIFARE DESFire EV3 chip. This is a high-security smart card chip, significantly more robust than the MIFARE Classic used in older hotel keys or the basic NFC tags used by Tesla (which often use Java Card applets on different hardware).19
* Security: The DESFire EV3 uses AES-128 encryption. The card does not just "broadcast" a UID (Unique Identifier). The vehicle and the card perform a mutual authentication handshake. The car sends a challenge; the card must sign it with a stored private key. This makes "cloning" the card with simple tools like the Flipper Zero impossible for a functional key. While a Flipper Zero can read the UID (sniffing), it cannot extract the private encryption keys needed to respond to the vehicle's challenge.20
* Usage:
   * Entry: Tap the card on the sensor located on the exterior driverâs door handle.
   * Start: Tap the card on the interior trim of the driverâs door (on the armrest/grab handle area) or the center console, depending on the software version and model year.21
3.4. Quaternary Layer: The Key Band
An optional accessory, the Key Band is a ruggedized silicone bracelet containing a bent/flexible NFC inlay.
* Function: Identical to the Key Card. It is a passive device requiring no battery.
* Sensor Alignment: Because the antenna in the band is curved, the "coupling" with the door reader can be finicky. Users often report it failing to unlock unless held at a very specific angle against the door handle reader.7


  



________________
4. The "Dead 12V" Crisis: The Primary Lockout Scenario
The single most common reason a locksmith is called to a Rivian is a depleted 12V battery. In an internal combustion vehicle, a dead battery means the engine won't turn over, but the key still turns in the door. In a Rivian, a dead 12V system means the entire vehicle is a sealed brick. The door handles will not extend. The NFC readers will not energize to read a card. The Bluetooth radios will not broadcast to see the phone.
4.1. The Vampire Drain Phenomenon
Early Rivian models (2022-2023) suffered from high "phantom drain" or "vampire drain," losing 1-3% of main pack charge per day.22 However, the 12V battery dies not because the main pack is empty, but often because the DC-DC converter (which charges the 12V from the High Voltage pack) fails to wake up or the 12V battery itself develops an internal fault (common in the early lead-acid configurations).
When the 12V drops below a critical voltage (approx. 8V), the vehicleâs Body Control Modules (BCM) shut down to protect the electronics. At this point, the vehicle is comatose.13
4.2. The Locksmithâs Dilemma
To jump-start the car, you need to access the 12V battery. The 12V battery is under the hood (frunk). The hood latch is electronic. The electronic latch needs 12V power to open. This circular dependency is the defining challenge of modern EV locksmithing.
4.3. External Power Injection: The Hitch Solution (R1T/R1S)
Rivian engineers anticipated this "Dead 12V" scenario and provided a specialized bypass port. This is the primary non-destructive entry method.
Location: Rear bumper, immediately to the right of the tow hitch receiver.23
Access: A small, round plastic cap covers the port.
Procedure:
1. Remove Cover: Use a non-marring pry tool to pop the circular cap.
2. Extract Leads: Inside, you will find two wires (Red/Positive and Black/Negative) taped or clipped up.
3. Connection: These wires are not connected directly to the battery. They are connected to the hood latch mechanism via a diode or relay logic. They are "One-Way" circuits.
4. Energize: Connect a 12V booster pack or jump leads.
   * Warning: Many "Smart" lithium jump packs (like NOCO Boost) require the detection of voltage to engage safety relays. Since these leads show 0V (open circuit) until connected, the jump pack may not turn on. You must use the "Manual Override" button on the jump pack to force power output.25
5. The Result: Applying power here will not start the car. It will provide enough juice to the low-voltage bus to allow the key fob or phone key to unlock the doors and, crucially, unlock the frunk.24
6. Troubleshooting: If the frunk does not pop immediately, hold the frunk release button on the fob or app while power is applied.
Important Note for EDV: The EDV also features a jump port, but location varies. On the EDV 500/700, it is often behind a panel on the front bumper (tow eye cover) or rear step area. However, utilizing the mechanical key on the driver's door is far faster for cabin entry on the EDV.5


  



________________
5. Emergency Entry Procedures: Mechanical & Destructive
If the electronic jump method failsâperhaps the wiring harness is damaged, the jump pack is insufficient, or the rear of the vehicle is inaccessible due to parkingâmechanical or destructive methods become necessary.
5.1. The "Wheel Well" Manual Hood Release (The "Secret" Way)
This is a procedure often guarded by service technicians but essential for locksmiths. If the car has no power and the rear jump leads are failing, you must manually release the primary hood latch to access the battery directly.
* Location: Front Left (Driverâs side) wheel well.26
* Target: The primary hood latch cable.
* Procedure:
   1. Access: Turn the wheels to the right (if possible). If the car is dead, the steering is locked, making this difficult. You may need to jack up the front left corner to droop the suspension and create a gap.
   2. Disassembly: Remove the T20 Torx screws securing the front portion of the plastic wheel well liner.
   3. Peel Back: Pull the liner back towards the tire to expose the inner fender cavity.
   4. The Pull: Look for a thin wire loop or a cable mechanism. On early models, it may be a simple loop. On later models, it is more shrouded. Pulling this cable mechanically releases the primary latch of the frunk.
   5. Safety Warning: Do not mistake high-voltage orange cables for the release cable. The release cable is typically a thin steel Bowden cable, often black or bare silver.27
5.2. Glass Entry Protocols
If non-destructive entry is impossible (e.g., a child locked inside in direct sunlight or a pet in distress), you must breach the vehicle. Choosing the wrong window is a catastrophic error on an R1 due to the specific glass types used.
* Front Door Glass: DO NOT TARGET. This is acoustic laminated glass. Striking it with a spring-loaded center punch will result in a "spider web" crack pattern but the glass will remain intact, held together by the PVB interlayer. You cannot clear this glass quickly; you would have to saw it out, creating a massive mess and delay.8
* Rear Door Glass: PRIMARY TARGET. This is tempered safety glass. A single strike in the bottom corner will shatter the entire pane into cubes, allowing for immediate clearing and access to the interior door handle.8
* Rear Quarter Glass: Tempered, but often glued in and harder to replace than a roll-down window. Avoid.
* Windshield/Roof: Laminated. Do not target.
5.3. Internal Door Egress (The "Child Lock" Factor)
Once access is gained via the window, opening the door may still be tricky if the "Child Locks" are electronically engaged.
* Front Doors: Pulling the interior handle twice usually overrides the electronic lock state mechanically (mechanical override).
* Rear Doors: If child locks are on, the interior handle is disabled. You must reach through to the front door handle or use the external handle if the vehicle has been unlocked via the central lock button.
________________
6. Technical Architecture: Signals & Sensors
A deep understanding of the signal environment aids in diagnosing "phantom" lockouts where the customer claims the key is present but the car refuses to open.
6.1. The NFC Protocol (Key Cards)
Rivian uses the ISO 14443 Type A standard.
* Chip: MIFARE DESFire EV3.
* Memory: 4KB (typically).
* Encryption: The authentication uses a diversification key based on the cardâs UID and a master key stored in the vehicle's Drive & Entry Module.
* Cloning: "Cloning" a Rivian card to a generic white card or a Flipper Zero is functionally impossible for a functioning key. While a Flipper Zero can read the UID (sniffing), it cannot extract the private encryption keys needed to respond to the vehicle's challenge. The vehicle will see the card, attempt the handshake, fail the auth, and ignore it.20
* Implication: You cannot "cut" a new key card in your van. All key cards must be provisioned by Rivian and paired to the vehicle via an authorized administrative session (which requires a working key to initiate).
6.2. Ultra-Wideband (UWB) & Bluetooth LE
The "Phone Key" relies on a sensor fusion of BLE and UWB.
* BLE: Used for initial handshake and long-range wake-up (approx. 10-30 meters).
* UWB: Used for precise localization (centimeter accuracy). The car has UWB anchors in the B-pillars, rear bumper, and dashboard.
* Locksmith Insight: If a customer is standing next to the driver's door with their phone but it won't unlock, the UWB signal might be occluded (phone in a faraday-like metal bag, or body blocking the signal) or the phone's UWB radio is asleep.
* Camp Mode Interference: If the vehicle is in "Camp Mode," proximity auto-locking and unlocking may be disabled to prevent the car from chirping and locking every time the camper walks near the tent. This is a common "false lockout" service call. Check if the mirrors are folded (usually locked) or out (unlocked).22
________________
7. Key Programming & Management: The "No AKL" Reality
For the automotive locksmith accustomed to plugging in a programmer and adding a key, Rivian presents a hard stop.
7.1. The "Walled Garden"
Currently, there is no aftermarket immobilizer programming solution for Rivian.
* No OBD Access: The OBD-II port under the dash does not expose the CAN bus segments required for key programming. It provides only legally mandated emissions data (which is null for EVs) and basic telemetry.
* Proprietary Diagnostics: Rivian uses a proprietary ethernet-based diagnostic tool (Rivian Diagnostic System) that authenticates with corporate servers.
* The "Add Key" Menu: The vehicle does have a user-facing menu to add keys (Settings > Drivers and Keys). However, accessing this menu requires:
   1. The vehicle to be unlocked.
   2. A valid, authorized admin key (card or phone) to be present to authorize the addition of a new key.14
* All Keys Lost (AKL): If a customer has lost all keys (phones, cards, fobs), an independent locksmith cannot help them generate a new key. The vehicle must be towed to a Rivian Service Center. The Service Center will need to verify ownership and likely replace the Drive & Entry Module or perform a cloud-based reset that only they can authorize.
7.2. Replacement Key Procurement
* Sourcing: Replacement fobs ($175-$250) and cards can only be purchased directly from Rivian. They are VIN-matched or pre-provisioned in a way that requires the "mothership" to recognize them.16
* Used Fobs: WARNING: Do not purchase used Rivian fobs from eBay. Gen 1 fobs are generally considered "write-once" or "married for life" to the original VIN. While some reports suggest Rivian Service can wipe them, it is not a procedure available to the public or locksmiths. Gen 2 fobs have different FCC IDs and are incompatible with Gen 1 trucks.28


  



________________
8. Fleet Specifics: The Amazon EDV (Electric Delivery Van)
The EDV is the exception to many of the rules above. Locksmiths servicing fleet accounts must treat this vehicle differently.
8.1. The Mechanical Override
As confirmed in the snippet analysis 6, the EDV 500/700/900 series key fob contains a mechanical blade. This blade corresponds to a physical lock cylinder on the driver's door.
* Location: Next to the driver door handle (sometimes covered by a small trim piece or exposed depending on the model year).
* Function: This provides direct mechanical actuation of the latch, bypassing the 12V system entirely for cabin entry.
* Locksmith Opportunity: Unlike the R1 series, this cylinder can be picked (standard automotive wafer lock) or impressioned if the key is lost but the vehicle is open, though key codes are restricted.
8.2. The Bulkhead & Cargo
* Separation: The cargo area is electronically locked. Opening the driverâs door does not pop the rear roll-up door or the bulkhead slider.
* Power Fail: If the EDV has a dead 12V, unlocking the cabin via the mechanical key gets you to the 12V battery (located under the driver/passenger floor area or accessible via hood release). You must restore power to open the cargo bay. There is no external key cylinder for the rear roll-up door.
8.3. Emergency Loop Cutting (First Responders)
The EDV has clearly marked "Cut Loops" for first responders to disable the High Voltage (HV) system.
* Warning: Locksmiths must identify these loops (often marked with a firefighter helmet symbol) to AVOID them. Cutting these loops bricks the vehicleâs propulsion system and requires major service to repair. Do not mistake the "First Responder Cut Loop" for a 12V charging wire.29
________________
9. Security Systems & Surveillance: Gear Guard
Rivian vehicles are sentient surveillance platforms. The Gear Guard system uses the vehicle's perimeter cameras (Side mirrors, front bumper, rear bed/gate) to record motion.
9.1. Operational Awareness
* The "Gary" Effect: The Gear Guard character (a Yeti named Gary) appears on the center screen when the car detects motion.
* Recording: If you are working on a lockout, assume you are being recorded. This footage is stored on a USB-C drive in the center console or internal storage.
* Liability: If you scratch the paint while prying the window for a wedge, Gear Guard will have a 4K video of you doing it.
* Alarm State: Triggering the alarm (e.g., by opening a door from the inside after window breach) will cause the cameras to save the event to a permanent "Incidents" folder.30
________________
10. Towing & Recovery Mode
If entry is achieved but the vehicle cannot be started (e.g., HV battery failure), it must be moved.
* Electronic Park Brake (EPB): The EPB is automatically applied in Park. To tow, the vehicle must be put in "Neutral" or "Transport Mode" via the center screen.26
* Dead Vehicle Towing: If the vehicle is dead, you cannot shift to Neutral.
* The "Skate" Solution: You must use wheel dollies (skates/go-jaks) to move the vehicle. Dragging a Rivian with locked wheels can damage the permanent magnet motors in the drive units (creating back-EMF voltage that can fry inverters).
* Tow Eye: The tow eye is located behind a plastic panel on the front bumper (R1T/R1S) or rear bumper. It is a standard threaded eyelet found in the tire service kit (frunk or spare tire compartment).
________________
11. Locksmith Tooling Dossier for Rivian Support
To successfully service a Rivian callout, the standard locksmith van inventory is insufficient. The following specialized loadout is required:
11.1. Electronic Support
* High-Amp Jump Pack: Must be capable of pushing 30A continuous. (e.g., NOCO GB150 or equivalent). Critical Feature: Must have a "Manual Override" button to force output into a 0V circuit.25
* Multimeter: For verifying voltage at the hitch leads (should be 0V until energized).
* Faraday Bag: To test for interference or shield a key during testing.
* Signal Detector (RF): To verify if a fob is transmitting (433MHz vs 2.4GHz BLE).
11.2. Mechanical Support
* T20 & T25 Torx Drivers: Essential for wheel well liner removal to access the manual hood release.26
* Plastic Trim Tools: High-quality, non-marring wedges for prying the hitch cover and wheel well clips.
* Laminated Glass Cutter: (e.g., Rhno II or Glas-Master) for windshield removal in extreme entrapment scenarios (First Responder focus).
* Wall-climbing "Air Wedge": Standard air wedges work, but the frameless windows on R1T/R1S require care not to shatter the glass tip.


  



________________
12. Conclusion & Operational Recommendations
The Rivian R1 and EDV platforms represent the "Event Horizon" for the traditional locksmith. The skills that defined the trade for a centuryâimpressioning, picking, cuttingâare rendered 90% obsolete on the consumer R1 platform, while the EDV retains a vestigial mechanical link.
Final Recommendations for the Locksmith:
1. Do Not Attempt to Pick: On an R1T/R1S, searching for a keyhole is futile and unprofessional. Go straight to the 12V diagnosis.
2. Master the Jump: The hitch-area jump port is your "Golden Key." Practice accessing it and have the right jump pack that allows 0V forced output.
3. Know the Manual Release: Learn the wheel well liner removal procedure. It is the only fail-safe way into a dead truck if the rear electrical path fails.
4. Verify Platform: Distinguish the EDV immediately. It has a keyhole. Use it.
5. Stay "Clean": Assume you are on camera (Gear Guard). Professionalism in demeanor and technique is recorded for the clientâs review.
This dossier confirms that while the mechanism of entry has changed from tumblers to electrons, the need for a skilled professional who understands the system's architecture remains. The lock has not disappeared; it has simply moved into the wiring harness.
13. Appendices: Technical Data Sheets
13.1. Battery Specifications
Component
	Spec
	Note
	Key Fob Battery
	CR2450
	Panasonic or Murata recommended. 3V.
	Key Card Chip
	MIFARE DESFire EV3
	4KB, AES-128 Encryption.
	R1T/R1S 12V (Gen 1)
	2x Lead Acid
	Located in cowl. Group size typically Ohmmu-compatible or OEM specific.
	R1T/R1S 12V (Gen 2)
	1x Lithium-Ion
	Proprietary module. Lightweight. Cannot be replaced with generic Lead Acid.
	13.2. Frequency Reference
Signal
	Frequency
	Purpose
	NFC
	13.56 MHz
	Key Card / Band entry.
	BLE
	2.4 GHz
	Phone Key / Fob proximity.
	UWB
	3.1 - 10.6 GHz
	Precision location (Gen 2 / Refresh).
	LTE
	Cellular Bands
	OTA Updates / Remote App Commands.
	Wi-Fi
	2.4 / 5 GHz
	Service diagnostics / Data upload.
	Works cited
1. The Emergency Stuff No One Talks About But Every Rivian Owner Should Know, accessed January 3, 2026, https://riviantrackr.com/news/the-emergency-stuff-no-one-talks-about-but-every-rivian-owner-should-know/
2. How to Program a Car Key When All Keys Lost - XTOOLonline, accessed January 3, 2026, https://www.xtoolonline.com/articles/how-to-program-a-car-key
3. How to open and jump start a Rivian that has a dead start (12-volt) battery. - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=-jLnupWdOq8
4. R1S Owner's Guide - Rivian, accessed January 3, 2026, https://assets.rivian.com/2md5qhoeajym/7Ao7NIFkLxOZtvdc7Fqh70/727b65a04f7fadc859da0ab91412f504/r1s-og-en-us-20230522.pdf
5. 2021-Present Rivian EDV 2 Keys Lock Latch Emergency Release Kit Shaved - Autoloc, accessed January 3, 2026, https://shop.autoloc.com/products/2021-present-rivian-edv-2-keys-lock-latch-emergency-release-kit-shaved-door-garage-disconnect-edv-500-edv-900-edv-700
6. Rivian Commercial Van Operating Guide, accessed January 3, 2026, https://assets.ctfassets.net/2md5qhoeajym/3yv3gW6KuKETjgpje8q70V/89e190f07b1b85fb283e66e29d123eb0/rcv700-og-en-us-20250421.pdf
7. Unlocking your Rivian - Rivian Stories | Electric Vehicle Adventures, accessed January 3, 2026, https://stories.rivian.com/unlock-your-vehicle
8. Question about fire safety : r/Rivian - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Rivian/comments/1feier2/question_about_fire_safety/
9. Any windows tempered (not laminated) on Rivians?, accessed January 3, 2026, https://www.rivianforums.com/forum/threads/any-windows-tempered-not-laminated-on-rivians.25050/
10. R1S Unreasonably Fragile Roof Glass | Page 2 | Rivian Forum, accessed January 3, 2026, https://www.rivianforums.com/forum/threads/r1s-unreasonably-fragile-roof-glass.23624/page-2
11. Rivians fatal flaw - no way to manually open cargo doors : r/AmazonDSPDrivers - Reddit, accessed January 3, 2026, https://www.reddit.com/r/AmazonDSPDrivers/comments/17hqf2d/rivians_fatal_flaw_no_way_to_manually_open_cargo/
12. "New" 12V Battery Jump Start process update from Rivian, accessed January 3, 2026, https://www.rivianforums.com/new-12v-battery-jump-start-process-update-from-rivian/
13. What exactly is the issue with the 12v batteries : r/Rivian - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Rivian/comments/1mjyhpr/what_exactly_is_the_issue_with_the_12v_batteries/
14. What is Rivian Digital Key?, accessed January 3, 2026, https://rivian.com/support/article/what-is-rivian-digital-key
15. New Rivian Key Fob 2.0 w/ Ultra-Wideband (UWB) passed by FCC, accessed January 3, 2026, https://www.rivianforums.com/new-rivian-key-fob-2-0-w-ultra-wideband-uwb-passed-by-fcc/
16. Key Fob - Rivian Gear Shop, accessed January 3, 2026, https://gearshop.rivian.com/products/key-fob
17. 2AW3A-1WWG20R1TKFB - FCC ID, accessed January 3, 2026, https://fcc.report/FCC-ID/2AW3A-1WWG20R1TKFB
18. R1S Owner's Guide - Rivian, accessed January 3, 2026, https://assets.rivian.com/2md5qhoeajym/7Ao7NIFkLxOZtvdc7Fqh70/8ccd071c4f1209c000a8db48d1cd38e0/r1s-og-en-us-20231204.pdf
19. Programming Your Own Key Cards? - Rivian Forum, accessed January 3, 2026, https://www.rivianforums.com/forum/threads/programming-your-own-key-cards.41592/
20. Has anyone made a custom NFC key? : r/Rivian - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Rivian/comments/ysh213/has_anyone_made_a_custom_nfc_key/
21. R1T Owner's Guide - Rivian, accessed January 3, 2026, https://assets.rivian.com/2md5qhoeajym/530xs9hu11xOKefT2JrvA5/dc3aa6d8771044cdbf9f3f8f4ef443dd/r1t-og-en-us-20240205.pdf
22. Fixing Rivian Efficiency - Defeating Phantom Drain - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=iu_GakKwmHM
23. Completely Dead Battery on a Rivian R1S, none of the doors open! What now? - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=LKiUAqNPorA
24. R1T + R1S Tow Operator Guide - Rivian, accessed January 3, 2026, https://assets.rivian.com/2md5qhoeajym/2IDu0dpJ4j6r298xoLa5sG/f5cb76753554ca8a10c0993426459fdd/R1-tow-operator-guide-en-us-20240621.pdf
25. How to "Jump Start" Rivian if 12v battery dies without another "donor" vehicle - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Rivian/comments/185btfd/how_to_jump_start_rivian_if_12v_battery_dies/
26. R1T + R1S Tow Operator Guide - Rivian, accessed January 3, 2026, https://assets.rivian.com/2md5qhoeajym/2IDu0dpJ4j6r298xoLa5sG/aeb759d8a1c10ac42777e270e97a4638/R1-tow-operator-guide-en-us-20230117.pdf
27. Alternate Frunk Release for Gen 2 | Rivian Forum, accessed January 3, 2026, https://www.rivianforums.com/forum/threads/alternate-frunk-release-for-gen-2.52822/
28. Questions About Key Fobs | Rivian Forum - R1T R1S R2 R3 News, Specs, Models, RIVN Stock, accessed January 3, 2026, https://www.rivianforums.com/forum/threads/questions-about-key-fobs.34305/
29. Electric Delivery Vehicle Emergency Response Guide - Rivian, accessed January 3, 2026, https://assets.rivian.com/2md5qhoeajym/5IJ9NmL3Ct2AwgXHsM4Ds9/56ce157d07c94da059c9adc7e684d6d8/emergency-response-guide-edv-en-us-20220929.pdf
30. Gear guard doing its job. Keep your vehicles locked! : r/Rivian - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Rivian/comments/1829qi5/gear_guard_doing_its_job_keep_your_vehicles_locked/