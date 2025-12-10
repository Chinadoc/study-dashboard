-- Insert the Honda Civic 2012 Master Guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, references) VALUES (
    'honda-civic-2012-2015',
    'Honda',
    'Civic',
    2012,
    2015,
    '# Honda Civic 2012-2015 Key Programming Master Guide

## Introduction
This guide covers programming keys and key fobs for Honda Civic models from 2012 to 2015. There are two main aspects: **Remote Programming** (for locking/unlocking doors) and **Transponder Programming** (for engine start).

---

## Part 1: Remote (Key Fob) Programming (DIY)

> **Pearl:** You can program the remote buttons yourself without any special tools, but all remotes must be programmed in a single session!

**Prerequisites:**
- All key fobs you want to program (the car forgets old ones)
- Working key that can start the car

**Steps:**

1. **Sit in the vehicle** with all doors and trunk closed.
2. **Turn the ignition to ON** (dash lights on, engine off) within 5 seconds.
3. **Press the Lock button** on your remote for about 1 second.
4. **Turn ignition to OFF**.
5. **Repeat steps 2-4 three more times** (total of 4 cycles). Complete each step within 5 seconds.
6. On the **4th ON position**, press the Lock button. You should hear the locks cycle ("clunk") confirming programming mode.
7. **For additional remotes:** Press Lock on each within 10 seconds. Locks will clunk for each.
8. **Turn ignition OFF** and remove key. Test all remotes.

---

## Part 2: Transponder (Immobilizer) Programming

> **⚠️ Professional Tools Required:** Transponder programming for Honda Civic 2012+ cannot be done manually. You will need an automotive programming tool.

**Recommended Tools:**
- **Autel IM508 / IM608 Pro** - Widely used by locksmiths
- **Smart Pro / T-Code** - OEM-level programming
- **Lonsdor K518** - Supports all keys lost scenarios

**General Process (Tool Dependent):**
1. Connect the tool to the OBD2 port (under dash, driver side).
2. Select Honda > Civic > 2012-2015.
3. Choose "Add Key" or "All Keys Lost".
4. Follow on-screen prompts (may require existing working key for "Add Key").
5. Some tools require a PIN code from the dealer or an online calculation.

**Notes:**
- The 2012-2015 Civic uses a **Honda/Hitag-2 46 chip** transponder.
- For "All Keys Lost", the immobilizer ECU may need to be addressed on the bench in some cases.

---

## References
- [Reddit: Honda Civic key programming discussions](https://reddit.com/r/Locksmith)
- [YouTube: BudgetClan - Honda Civic Autel IM508 Programming](https://www.youtube.com/watch?v=a4oUWkEFo4c)
- Various locksmith forum threads

---

*Last Updated: December 2025*
',
    '{"videos": ["a4oUWkEFo4c - BudgetClan: Honda Civic 2012-2015 with Autel IM508S"], "web": "Reddit, Locksmith Forums"}'
);
