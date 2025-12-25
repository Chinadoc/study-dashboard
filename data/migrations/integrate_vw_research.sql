-- ═══════════════════════════════════════════════════════════════════════════
-- VW/VAG COMPREHENSIVE DATA INTEGRATION
-- Source: Google Drive Research Documents (VW FCC ID Mapping, VW Immobilizer Specs)
-- Generated: 2024-12-23
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 1: VW JETTA (Mk4 1999-2005, Mk5 2006-2010, Mk6 2011-2014)
-- ═══════════════════════════════════════════════════════════════════════════

-- Jetta Mk4 (1999-2005) - Immo 2/3
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Jetta', year, 'Flip Key', 
    CASE WHEN year <= 2001 THEN 'ID48' ELSE 'ID48' END,
    'HLO1J0959753AM', '315 MHz', 'HU66', 'HU66', 'HU66T6',
    CASE WHEN year <= 2001 THEN 'Immo 2' ELSE 'Immo 3' END,
    'OBD with PIN (4-digit SKC)',
    '1J0959753AM',
    CASE WHEN year <= 2001 THEN 'Immo 2: PIN from cluster. Generic ID48 chip OK.' 
         ELSE 'Immo 3: VIN married. Generic ID48 chip OK. PIN required.' END
FROM (SELECT 1999 as year UNION SELECT 2000 UNION SELECT 2001 UNION SELECT 2002 UNION SELECT 2003 UNION SELECT 2004 UNION SELECT 2005);

-- Jetta Mk5 (2006-2010) - Immo 4
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Jetta', year, 'Flip Key', 'ID48 CAN (TP23)',
    'NBG92596263', '315 MHz', 'HU66', 'HU66', 'HU66T24',
    'Immo 4',
    'Pre-coded chip required. Read CS from cluster via OBD.',
    '1K0959753P',
    'Immo 4: TP23 pre-coded chip required. Generic ID48 will NOT work. Part supersedes 1K0959753H.'
FROM (SELECT 2006 as year UNION SELECT 2007 UNION SELECT 2008 UNION SELECT 2009 UNION SELECT 2010);

-- Jetta Mk6 (2011-2014) - Immo 4/5
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Jetta', year, 'Flip Key', 'ID48 CAN (TP23)',
    CASE WHEN year <= 2013 THEN 'NBG010180T' ELSE 'NBG010180T' END, 
    '315 MHz', 'HU66', 'HU66 V.3', 'HU66T24',
    CASE WHEN year = 2011 THEN 'Immo 4/5 (NEC+24C64)' ELSE 'Immo 4' END,
    'Advanced UDS tools required. Prepare Dealer Key function.',
    '5K0837202AE',
    'NCS platform (2011+). Uses NEC cluster. Lishi V.3 for sunken locks. Push-start models use NBG010206T with 5K0837202AK.'
FROM (SELECT 2011 as year UNION SELECT 2012 UNION SELECT 2013 UNION SELECT 2014);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 2: VW GOLF (Mk4 1999-2006, Mk5 2006-2009, Mk6 2010-2014)
-- ═══════════════════════════════════════════════════════════════════════════

-- Golf Mk4 (1999-2006) - Immo 2/3
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Golf', year, 'Flip Key', 'ID48',
    'HLO1J0959753AM', '315 MHz', 'HU66', 'HU66', 'HU66T6',
    CASE WHEN year <= 2001 THEN 'Immo 2' ELSE 'Immo 3' END,
    'OBD with PIN (4-digit SKC)',
    '1J0959753AM',
    CASE WHEN year <= 2001 THEN 'Immo 2: Cluster-based. Generic ID48.' 
         ELSE 'Immo 3: VIN married. VCDS shows VIN+ImmoID in Extra field.' END
FROM (SELECT 1999 as year UNION SELECT 2000 UNION SELECT 2001 UNION SELECT 2002 UNION SELECT 2003 UNION SELECT 2004 UNION SELECT 2005 UNION SELECT 2006);

-- Golf Mk5 (2006-2009) - Immo 4
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Golf', year, 'Flip Key', 'ID48 CAN (TP23)',
    'NBG92596263', '315 MHz', 'HU66', 'HU66', 'HU66T24',
    'Immo 4',
    'Pre-coded TP23 chip required. 7-byte CS from cluster.',
    '1K0959753P',
    'Immo 4: TP23 mandatory. VVDI2/AVDI/Autel for CS extraction.'
FROM (SELECT 2006 as year UNION SELECT 2007 UNION SELECT 2008 UNION SELECT 2009);

-- Golf Mk6 (2010-2014) - Immo 4/4c
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Golf', year, 'Flip Key', 'ID48 CAN (TP23)',
    'NBG010180T', '315 MHz', 'HU66', 'HU66 V.3', 'HU66T24',
    'Immo 4/4c',
    'NEC+24C64 cluster. EEPROM read may require cluster removal.',
    '5K0837202AE',
    'Late Mk6 (2011+) have NEC clusters. Use service mode or VVDI2 bypass.'
FROM (SELECT 2010 as year UNION SELECT 2011 UNION SELECT 2012 UNION SELECT 2013 UNION SELECT 2014);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 3: VW GTI (follows Golf platform)
-- ═══════════════════════════════════════════════════════════════════════════

-- GTI Mk5 (2006-2009)
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'GTI', year, 'Flip Key', 'ID48 CAN (TP23)',
    'NBG92596263', '315 MHz', 'HU66', 'HU66', 'HU66T24',
    'Immo 4',
    'Pre-coded TP23 chip required.',
    '1K0959753P',
    'Same as Golf Mk5. TP23 chip mandatory.'
FROM (SELECT 2006 as year UNION SELECT 2007 UNION SELECT 2008 UNION SELECT 2009);

-- GTI Mk6 (2010-2014)
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'GTI', year, 'Flip Key', 'ID48 CAN (TP23)',
    'NBG010180T', '315 MHz', 'HU66', 'HU66 V.3', 'HU66T24',
    'Immo 4/4c',
    'NEC+24C64 cluster. Advanced tools required.',
    '5K0837202AE',
    'Same as Golf Mk6. Sunken lock face - use Lishi V.3.'
FROM (SELECT 2010 as year UNION SELECT 2011 UNION SELECT 2012 UNION SELECT 2013 UNION SELECT 2014);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 4: VW PASSAT (B5 1998-2005, B6 2006-2010, NMS 2012-2014)
-- ═══════════════════════════════════════════════════════════════════════════

-- Passat B5/B5.5 (1998-2005) - Immo 2/3
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Passat', year, 'Flip Key', 'ID48',
    'HLO1J0959753AM', '315 MHz', 'HU66', 'HU66', 'HU66T6',
    CASE WHEN year <= 2000 THEN 'Immo 2' ELSE 'Immo 3' END,
    'OBD with PIN. Cluster-based security.',
    '1J0959753AM',
    CASE WHEN year <= 2000 THEN 'B5 Immo 2. Generic ID48.' 
         ELSE 'B5.5 Immo 3. VIN married.' END
FROM (SELECT 1998 as year UNION SELECT 1999 UNION SELECT 2000 UNION SELECT 2001 UNION SELECT 2002 UNION SELECT 2003 UNION SELECT 2004 UNION SELECT 2005);

-- Passat B6 (2006-2010) - Slot Key / CCM-based
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Passat', year, 'Slot Key (Fobik)', 
    'ID48 CAN',
    'NBG009066T', '315 MHz', 'HU66', 'HU66', 'Dealer FOB (3C0959752BA or BG)',
    'Immo 4 (CCM)',
    'Security in Comfort Module (CCM) - NOT cluster. 95320 EEPROM read often required.',
    CASE WHEN year <= 2008 THEN '3C0959752BA' ELSE '3C0959752BA' END,
    'B6 KESSY: 3C0959752BG for push-start. BA for non-prox. CCM behind glovebox. ID46 for some Keyless Go models.'
FROM (SELECT 2006 as year UNION SELECT 2007 UNION SELECT 2008 UNION SELECT 2009 UNION SELECT 2010);

-- Passat NMS/B7 (2012-2014) - Return to Flip Key
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Passat', year, 
    'Flip Key',
    'ID48 CAN (TP23)',
    'NBG010180T', '315 MHz', 'HU66', 'HU66 V.3', '5K0837202AE',
    'Immo 4',
    'OBD programming. Pre-coded TP23.',
    '5K0837202AE',
    'NMS platform (US-built). Non-prox: NBG010180T. Push-start/KESSY: NBG010206T with 5K0837202AK.'
FROM (SELECT 2012 as year UNION SELECT 2013 UNION SELECT 2014);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 5: VW BEETLE (1998-2010 on PQ34, 2012-2019 on PQ35/MQB)
-- ═══════════════════════════════════════════════════════════════════════════

-- New Beetle (1998-2004) - Immo 2/3
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Beetle', year, 'Flip Key', 'ID48',
    'HLO1J0959753AM', '315 MHz', 'HU66', 'HU66', 'HU66T6',
    CASE WHEN year <= 2000 THEN 'Immo 2' ELSE 'Immo 3' END,
    'OBD with PIN',
    '1J0959753AM',
    'PQ34 platform (Mk4 chassis). Generic ID48 OK for pre-2005.'
FROM (SELECT 1998 as year UNION SELECT 1999 UNION SELECT 2000 UNION SELECT 2001 UNION SELECT 2002 UNION SELECT 2003 UNION SELECT 2004);

-- New Beetle (2005-2010) - Late PQ34 with Immo 4 upgrade
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Beetle', year, 'Flip Key', 'ID48 CAN (TP23)',
    'NBG92596263', '315 MHz', 'HU66', 'HU66', 'HU66T24',
    'Immo 4 (CAN)',
    'Pre-coded TP23 required despite Mk4 chassis.',
    '1K0959753P',
    'TRAP: Looks like Mk4 but has CAN-bus Immo 4. TP23 chip required. Generic ID48 will fail.'
FROM (SELECT 2005 as year UNION SELECT 2006 UNION SELECT 2007 UNION SELECT 2008 UNION SELECT 2009 UNION SELECT 2010);

-- Beetle (2012-2016) - Third gen
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Beetle', year, 'Flip Key', 'ID48 CAN (TP23)',
    'NBG010180T', '315 MHz', 'HU66', 'HU66 V.3', '5K0837202AE',
    'Immo 4/4c',
    'Advanced OBD tools. NEC cluster possible.',
    '5K0837202AE',
    'Third-gen Beetle. Same platform as Golf Mk6.'
FROM (SELECT 2012 as year UNION SELECT 2013 UNION SELECT 2014 UNION SELECT 2015 UNION SELECT 2016);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 6: VW CC (2009-2017) - Shares B6 Passat architecture
-- ═══════════════════════════════════════════════════════════════════════════

INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'CC', year, 
    CASE WHEN year <= 2012 THEN 'Slot Key (Fobik)' ELSE 'Flip Key' END,
    'ID48 CAN',
    CASE WHEN year <= 2012 THEN 'NBG009066T' ELSE 'NBG010180T' END,
    '315 MHz', 'HU66', 'HU66', 
    CASE WHEN year <= 2012 THEN '3C0959752BA' ELSE '5K0837202AE' END,
    'Immo 4 (CCM)',
    'B6-derived. CCM-based until 2012.',
    CASE WHEN year <= 2012 THEN '3C0959752BA' ELSE '5K0837202AE' END,
    'Shares Passat B6 Slot Key system until ~2012. BA=non-prox, BG=KESSY.'
FROM (SELECT 2009 as year UNION SELECT 2010 UNION SELECT 2011 UNION SELECT 2012 UNION SELECT 2013 UNION SELECT 2014 UNION SELECT 2015 UNION SELECT 2016 UNION SELECT 2017);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 7: VW TIGUAN (2009-2017)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Tiguan', year, 'Flip Key', 'ID48 CAN (TP23)',
    'NBG010180T', '315 MHz', 'HU66', 'HU66 V.3', '5K0837202AE',
    'Immo 4',
    'OBD with pre-coded TP23.',
    '5K0837202AE',
    'PQ35 platform. TP23 chip required.'
FROM (SELECT 2009 as year UNION SELECT 2010 UNION SELECT 2011 UNION SELECT 2012 UNION SELECT 2013 UNION SELECT 2014 UNION SELECT 2015 UNION SELECT 2016 UNION SELECT 2017);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 8: VW EOS (2007-2016)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Eos', year, 'Flip Key', 'ID48 CAN (TP23)',
    CASE WHEN year <= 2010 THEN 'NBG92596263' ELSE 'NBG010180T' END,
    '315 MHz', 'HU66', 'HU66', 'HU66T24',
    'Immo 4',
    'OBD with pre-coded TP23.',
    CASE WHEN year <= 2010 THEN '1K0959753P' ELSE '5K0837202AE' END,
    'Retractable hardtop coupe. Same Mk5/Mk6 key systems as Golf.'
FROM (SELECT 2007 as year UNION SELECT 2008 UNION SELECT 2009 UNION SELECT 2010 UNION SELECT 2011 UNION SELECT 2012 UNION SELECT 2013 UNION SELECT 2014 UNION SELECT 2015 UNION SELECT 2016);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 9: VW TOUAREG (2004-2017)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Touareg', year, 'Smart Key', 
    CASE WHEN year <= 2010 THEN 'ID46' ELSE 'ID48 CAN' END,
    CASE WHEN year <= 2010 THEN 'IYZ3203' ELSE 'IYZVWTOUA' END,
    '315 MHz', 'HU66', 'HU66', 'Dealer FOB',
    CASE WHEN year <= 2010 THEN 'Kessy' ELSE 'Kessy' END,
    'Dealer or advanced tools. Push-start system.',
    'Dealer Only',
    'Luxury SUV. Keyless-Go standard. ID46 on early models.'
FROM (SELECT 2004 as year UNION SELECT 2005 UNION SELECT 2006 UNION SELECT 2007 UNION SELECT 2008 UNION SELECT 2009 UNION SELECT 2010 UNION SELECT 2011 UNION SELECT 2012 UNION SELECT 2013 UNION SELECT 2014 UNION SELECT 2015 UNION SELECT 2016 UNION SELECT 2017);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 10: VW ROUTAN (2009-2014) - Chrysler platform
-- ═══════════════════════════════════════════════════════════════════════════

INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, lishi_tool, key_blank, immobilizer_system, prog_method, oem_part, notes)
SELECT 'Volkswagen', 'volkswagen', 'Routan', year, 'FOBIK', 'ID46',
    'IYZ-C01C', '315 MHz', 'Y170', 'CY24', 'Y170-PT',
    'Chrysler FOBIK',
    'Chrysler FOBIK programming. PIN from WCM.',
    'IYZ-C01C',
    'Chrysler Town & Country rebadge. Uses Chrysler FOBIK system, NOT VAG!'
FROM (SELECT 2009 as year UNION SELECT 2010 UNION SELECT 2011 UNION SELECT 2012 UNION SELECT 2013 UNION SELECT 2014);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 11: UPDATE EXISTING RECORDS WITH MISSING DATA
-- ═══════════════════════════════════════════════════════════════════════════

-- Fill in any existing VW records that have NULL Lishi tool
UPDATE locksmith_data 
SET lishi_tool = 'HU66'
WHERE make = 'Volkswagen' AND lishi_tool IS NULL AND year <= 2009;

UPDATE locksmith_data 
SET lishi_tool = 'HU66 V.3'
WHERE make = 'Volkswagen' AND lishi_tool IS NULL AND year >= 2010;

-- Fill in keyway
UPDATE locksmith_data 
SET keyway = 'HU66'
WHERE make = 'Volkswagen' AND keyway IS NULL AND model != 'Routan';

-- Fill in frequency
UPDATE locksmith_data 
SET frequency = '315 MHz'
WHERE make = 'Volkswagen' AND frequency IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 12: VW PROGRAMMING GUIDE
-- ═══════════════════════════════════════════════════════════════════════════

INSERT OR REPLACE INTO programming_guides (id, make, model, year_start, year_end, content, category, "references")
VALUES (
  'vw-immo4-comprehensive',
  'Volkswagen',
  'All Models',
  2006,
  2014,
  '# 🚗 Volkswagen Immo 4 Master Guide (2006-2014)

## ⚠️ Critical Pre-Programming Knowledge

**The #1 cause of VW key programming failure is using generic ID48 chips on Immo 4 vehicles.**

---

## 🔐 Chip Selection by Year

| Years | Immo Gen | Required Chip | Notes |
|-------|----------|---------------|-------|
| 1999-2001 | Immo 2 | ID48 (Generic) | Any blank ID48 works |
| 2002-2005 | Immo 3 | ID48 (Generic) | VIN married, still generic chip |
| 2006-2010 | Immo 4 | ID48 CAN (TP23) | **MUST be pre-coded** |
| 2011-2014 | Immo 4/5 | ID48 CAN (TP23) | NEC clusters, advanced tools |

---

## 📡 FCC ID Quick Reference

| FCC ID | Models | Years | Part Numbers |
|--------|--------|-------|--------------|
| NBG92596263 | Jetta, Golf, GTI, Beetle, Eos | 2006-2010 | 1K0959753P |
| NBG009066T | Passat B6, CC | 2006-2012 | 3C0959752BA (non-prox), BG (KESSY) |
| NBG010180T | Jetta, Golf, Passat NMS, Tiguan | 2010-2014 | 5K0837202AE |
| NBG010206T | Passat, Jetta (Push-Start) | 2012-2014 | 5K0837202AK |

---

## 🔧 Immo 4 Programming Steps

1. **Read Component Security (CS)** - Extract 7-byte CS from cluster via OBD
2. **Generate Dealer Key** - Write CS to blank ID48 using VVDI2/AVDI/Autel
3. **Adapt Key to Vehicle** - Standard OBD adaptation after pre-coding
4. **Verify via Measuring Blocks** - Check Group 022/023 for key status

---

## ⚡ Common Failure Points

| Symptom | Cause | Solution |
|---------|-------|----------|
| Key starts car, no remote | 433 MHz key in US car | Order 315 MHz (FCC NBG...) |
| Adaptation fails | Generic ID48 on Immo 4 | Use pre-coded TP23 chip |
| Remote works, no start | Wrong TP profile | Verify VW = TP23, not TP22/24/25 |
| 2011+ cluster issues | NEC+24C64 cluster | Use service mode or dump |

---

## 🛠️ Required Tools

- **VVDI2 with VAG functions** - CS extraction and dealer key
- **Autel IM608/IM508** - Cloud-based CS calculation
- **AVDI/Abrites** - Full VAG coverage
- **Lishi HU66 V.3** - All lock generations including sunken face

---

## 📚 Passat B6 Special Procedure (CCM-Based)

The Passat B6 (2006-2010) is **NOT** cluster-based:
1. Security master is **Comfort Control Module (CCM)** behind glovebox
2. Must read CCM 95320 EEPROM if OBD extraction fails
3. BA = half-smart (insert to start), BG = full KESSY (proximity)
',
  'GUIDE',
  '{"sources": ["VW_Jetta_Passat_FCC_ID_Mapping.txt", "VW_Immobilizer_Specs_and_Lishi_Mapping.txt"], "generated": "2024-12-23"}'
);
