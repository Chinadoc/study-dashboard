-- Insert the Honda Odyssey 2011-2017 Master Guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references") VALUES (
    'honda-odyssey-2011-2017',
    'Honda',
    'Odyssey',
    2011,
    2017,
    '# Honda Odyssey 2011-2017 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The 2011-2017 Honda Odyssey (4th generation) uses a **proximity key fob (smart key)** system as standard across all trims (LX, EX, EX-L, Touring, Elite). This includes keyless entry and push-button start functionality, with an integrated emergency metal blade for manual door/ignition access if the fob battery fails.

The Autel IM608 is highly effective for Honda key programming and **walks you through everything** with on-screen prompts, making it one of the easiest vehicles to program.

> 💡 **Pearl:** Honda key programming with the IM608 is super easy – you can complete an add-key procedure in under 5 minutes. The hood must be closed for horn chirp confirmation during remote testing.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost scenarios |
| **New Programmable Proximity Fob** | OEM: PN 72147-TK8-A01 or compatible aftermarket |
| **CR2032 Battery** | Replace before programming |

---

## Procedure: Add Key (With Working Key)

This is the most common scenario. Requires at least **one working key**.

### Step-by-Step Walkthrough

1. **Connect the IM608** to the OBD-II port (under dashboard, driver side).

2. **Navigate to the Immobilizer Menu:**
   - Select **Diagnostics** → **Honda** → **Odyssey** → **[Year]** → **USA**
   - Choose **Immobilizer** (system will auto-detect)

3. **Enter Immobilizer Setup:**
   - Select **Add/Delete Keys**
   - Choose **Add One Key**
   - Read all on-screen prompts carefully

4. **Key Programming Sequence:**
   - **Turn ignition OFF** with old key → Remove old key
   - **Insert NEW key** → Turn ignition **ON** within 16 seconds
   - Wait for prompt → Turn ignition **OFF**
   - Turn ignition **ON** without changing key
   - Turn **OFF** again
   - Turn **ON** one last time

5. **Confirm Programming:**
   - The IM608 will display: *"Immobilizer light is turned off"*
   - Select **Yes** to confirm
   - Display: *"Key has been programmed"*

6. **Test the New Key:**
   - Start the car ✅
   - Test lock/unlock remote functions ✅
   - Note: Hood must be closed for horn chirp

7. **Exit and Clear Codes** (optional)

**Total Time:** ~5 minutes

---

## Procedure: All Keys Lost

For situations where no working keys are available.

### Steps

1. **Connect IM608** and navigate to Honda → Odyssey → Immobilizer

2. **Select "All Keys Lost"** option

3. **Read PIN/ECU Data:**
   - Device will read immobilizer PIN via OBD
   - May require XP400 Pro for key generation

4. **Generate New Key:**
   - Use XP400 to write transponder data to blank fob
   - Follow on-screen prompts for ignition cycling

5. **Register & Verify:**
   - Complete registration sequence
   - Confirm immobilizer light off
   - Test start and remote functions

**Note:** Backup ECU data before proceeding. All Keys Lost takes 10-20 minutes.

---

## Remote Fob Learning (If Needed Separately)

Some cases require separate remote learning after transponder registration:

1. Press and **hold Lock + Unlock** buttons near steering column module
2. Hold for ~10 seconds
3. Test all buttons: Lock, Unlock, Trunk, Panic

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Fob not detected** | Replace CR2032 battery; ensure fob is on start button/dash |
| **Immobilizer light stays on** | Retry programming sequence; check for fault codes |
| **Remote doesn''t work after programming** | Perform separate remote learning (see above) |
| **Vehicle beeps during programming** | Another fob detected inside – remove all fobs >5m from car |
| **IM608 shows error** | Update firmware; verify vehicle year selection |

---

## Pro Tips from the Field

- ⚡ **Speed matters:** Complete each ignition cycle within the time window (typically 15-16 seconds)
- 🔋 **Check batteries first:** Low fob battery is the #1 cause of detection failures
- 📡 **Remove all fobs:** Other key fobs inside the vehicle will interfere
- 🔧 **IM608 vs Dealer:** Programming cost ~$50 (your time) vs $200-500 at dealer
- 📋 **Function Viewer:** Use IM608''s Function Viewer to verify coverage before quoting jobs

---

## Coverage by Year

| Year | Key Type | Notes |
|------|----------|-------|
| 2011 | Smart Key (Proximity + Blade) | Early ECU may need PIN read via OBD |
| 2012 | Smart Key (Proximity + Blade) | Blade may be prompted for ignition access |
| 2013 | Smart Key (Proximity + Blade) | Video-tested; consistent procedure |
| 2014 | Smart Key (Proximity + Blade) | Add key mode typical |
| 2015 | Smart Key (Proximity + Blade) | All-keys-lost fully supported |
| 2016 | Smart Key (Proximity + Blade) | Standard push-start across all trims |
| 2017 | Smart Key (Proximity + Blade) | End-of-gen; no major ECU changes |

---

## References

- **YouTube:** Honda Odyssey 2011-2017 Autel IM608 Programming (First-hand tutorial)
- **Autel IM608 User Manual:** Honda IMMO section
- **DIY Forums:** Locksmith/automotive key programming communities
- **Video Tested:** Procedure confirmed on 2013 model with IM608

---

*Last Updated: December 2025*
',
    '{"videos": ["Honda Odyssey 2011-2017 Autel IM608 Tutorial"], "web": "YouTube, Autel Guides, Locksmith Forums"}'
);
