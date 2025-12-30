-- ═══════════════════════════════════════════════════════════════════════════
-- VOLKSWAGEN COMPREHENSIVE DATA INTEGRATION
-- FCC IDs, Key Blanks, Programming Guides, and Vehicle Enrichment
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 1: VW VEHICLE DATA WITH FCC IDs AND KEY SPECS
-- ═══════════════════════════════════════════════════════════════════════════

-- VW Jetta 2002-2005 (Immo3 - ID48 Original)
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'Jetta', 2002, 2005, 'Flip Key', 'HLO1J0959753AM', 'ID48', '315 MHz', 'HU66', 'HU66', 'HU66T6', 'CR2032', '1J0959753AM', 'Immo3 System. 4-digit PIN from cluster 24C32 EEPROM. Megamos Crypto transponder.'),
    ('Volkswagen', 'Jetta', 2006, 2010, 'Flip Key', 'NBG92596263', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '1K0959753H', 'Immo4 System. CAN Bus. Megamos 48 CAN encrypted. PIN from cluster Micronas MCU.'),
    ('Volkswagen', 'Jetta', 2011, 2014, 'Flip Key', 'NBG010180T', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '5K0837202AE', 'Late Immo4. Megamos 48 CAN. Some models have push-to-start.'),
    ('Volkswagen', 'Jetta', 2015, 2018, 'Smart Key', 'NBGFS12P01', 'ID88 (MQB48)', '315 MHz', 'HU162T', 'HU162T', 'OEM Only', 'CR2032', '5G6959752BM', 'MQB Platform. Megamos AES (ID88). Requires ODIS or Autel for programming.'),
    ('Volkswagen', 'Jetta', 2019, 2024, 'Smart Key', 'NBGFS12P01', 'ID88 (MQB48)', '315 MHz', 'HU162T', 'HU162T', 'OEM Only', 'CR2032', '5G6959752BM', 'MQB-Evo Platform. High security. Online dealer programming may be required.');

-- VW Golf 2000-2020
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'Golf', 2000, 2005, 'Flip Key', 'HLO1J0959753F', 'ID48', '315 MHz', 'HU66', 'HU66', 'HU66T6', 'CR2032', '1J0959753F', 'Immo3 System. Megamos Crypto transponder.'),
    ('Volkswagen', 'Golf', 2006, 2009, 'Flip Key', 'NBG92596263', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '1K0959753H', 'Immo4 System. Megamos 48 CAN encrypted.'),
    ('Volkswagen', 'Golf', 2010, 2014, 'Flip Key', 'NBG010180T', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '5K0837202AE', 'Immo4. G-Chip equivalent logic.'),
    ('Volkswagen', 'Golf', 2015, 2020, 'Smart Key', 'NBGFS12A01', 'ID88 (MQB48)', '315 MHz', 'HU162T', 'HU162T', 'OEM Only', 'CR2032', '5G0959752A', 'MQB Platform (Golf Mk7). Megamos AES.'),
    ('Volkswagen', 'Golf R', 2015, 2020, 'Smart Key', 'NBGFS12A01', 'ID88 (MQB48)', '315 MHz', 'HU162T', 'HU162T', 'OEM Only', 'CR2032', '5G0959752A', 'MQB Platform. Performance variant.');

-- VW Passat 2002-2019
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'Passat', 2002, 2005, 'Flip Key', 'HLO1J0959753AM', 'ID48', '315 MHz', 'HU66', 'HU66', 'HU66T6', 'CR2032', '1J0959753AM', 'Immo3. B5.5 generation.'),
    ('Volkswagen', 'Passat', 2006, 2010, 'Smart Key', 'NBG009066T', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'Dealer FOB', 'CR2032', '3C0959752BA', 'B6 generation. Kessy push-button start. "Comfort Key" system.'),
    ('Volkswagen', 'Passat', 2011, 2015, 'Smart Key', 'NBG009066T', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'Dealer FOB', 'CR2032', '3C0959752BA', 'B7 generation. Push-button start.'),
    ('Volkswagen', 'Passat', 2016, 2019, 'Smart Key', 'NBGFS12P01', 'ID88 (MQB48)', '315 MHz', 'HU162T', 'HU162T', 'OEM Only', 'CR2032', '5G6959752BM', 'MQB Platform. Megamos AES.');

-- VW Tiguan 2009-2024
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'Tiguan', 2009, 2014, 'Flip Key', 'NBG010180T', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '5K0837202AE', 'First gen. ID48 CAN chip.'),
    ('Volkswagen', 'Tiguan', 2015, 2017, 'Flip Key', 'NBG010206T', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '5K0959753BM', 'Late first gen.'),
    ('Volkswagen', 'Tiguan', 2018, 2024, 'Smart Key', 'NBGFS12P01', 'ID88 (MQB48)', '315 MHz', 'HU162T', 'HU162T', 'OEM Only', 'CR2032', '5G6959752BM', 'Second gen. MQB Platform.');

-- VW Beetle 1998-2019
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'Beetle', 1998, 2001, 'Flip Key', 'HLO1J0959753F', 'ID48', '315 MHz', 'HU66', 'HU66', 'HU66P', 'CR2032', '1J0959753F', 'New Beetle first gen. Older "Banjo" remote shape.'),
    ('Volkswagen', 'Beetle', 2002, 2005, 'Flip Key', 'HLO1J0959753AM', 'ID48', '315 MHz', 'HU66', 'HU66', 'HU66T6', 'CR2032', '1J0959753AM', 'Immo3 System.'),
    ('Volkswagen', 'Beetle', 2006, 2010, 'Flip Key', 'NBG92596263', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '1K0959753H', 'Immo4 System.'),
    ('Volkswagen', 'Beetle', 2012, 2016, 'Smart Key', 'NBG010180T', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '5K0837202AE', 'Third gen Beetle. Uses Immo4/Immo5 hybrid.'),
    ('Volkswagen', 'Beetle', 2017, 2019, 'Smart Key', 'NBGFS12P01', 'ID88 (MQB48)', '315 MHz', 'HU162T', 'HU162T', 'OEM Only', 'CR2032', '5K0959753BG', 'Final Beetle generation. Megamos AES.');

-- VW CC 2009-2017
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'CC', 2009, 2014, 'Flip Key', 'NBG010180T', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '5K0837202AE', 'Megamos 48 CAN Encrypted System.'),
    ('Volkswagen', 'CC', 2015, 2017, 'Smart Key', 'NBGFS12P01', 'ID88 (MQB48)', '315 MHz', 'HU162T', 'HU162T', 'OEM Only', 'CR2032', '5G6959752BM', 'MQB Platform.');

-- VW GTI 2006-2021
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'GTI', 2006, 2009, 'Flip Key', 'NBG92596263', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '1K0959753H', 'Mk5 GTI. Immo4.'),
    ('Volkswagen', 'GTI', 2010, 2014, 'Flip Key', 'NBG010180T', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '5K0837202AE', 'Mk6 GTI.'),
    ('Volkswagen', 'GTI', 2015, 2021, 'Smart Key', 'NBGFS12A01', 'ID88 (MQB48)', '315 MHz', 'HU162T', 'HU162T', 'OEM Only', 'CR2032', '5G0959752A', 'Mk7/7.5 GTI. MQB Platform. HU162T Blade.');

-- VW Eos 2007-2016
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'Eos', 2007, 2011, 'Flip Key', 'NBG92596263', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '1K0959753H', 'Megamos 48 Encrypted System.'),
    ('Volkswagen', 'Eos', 2012, 2016, 'Flip Key', 'NBG010180T', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'HU66T24', 'CR2032', '5K0837202AE', 'Late model Eos.');

-- VW Atlas 2018-2024
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'Atlas', 2018, 2024, 'Smart Key', 'NBGFS12P01', 'ID88 (MQB48)', '315 MHz', 'HU162T', 'HU162T', 'OEM Only', 'CR2032', '5G6959752BM', 'MQB Platform. Megamos AES.');

-- VW Touareg 2004-2017
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'Touareg', 2004, 2010, 'Smart Key', 'IYZ3203', 'ID46', '315 MHz', 'HU66', 'HU66', 'Dealer FOB', 'CR2032', 'N/A', 'Luxury SUV. Encrypted Megamos system.'),
    ('Volkswagen', 'Touareg', 2011, 2017, 'Smart Key', 'IYZVWTOUA', 'ID48 CAN', '315 MHz', 'HU66', 'HU66', 'Dealer FOB', 'CR2032', 'N/A', 'Second gen. Kessy system.');

-- VW Routan 2009-2014 (Chrysler platform)
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'Routan', 2009, 2014, 'FOBIK', 'IYZ-C01C', 'ID46', '315 MHz', 'Y170', 'CY24', 'Y170-PT', 'CR2032', 'N/A', 'Chrysler Town & Country rebadge. Uses Chrysler FOBIK system.');

-- VW Arteon 2019-2024
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'Arteon', 2019, 2024, 'Smart Key', 'NBGFS12P01', 'ID88 (MQB48)', '315 MHz', 'HU162T', 'HU162T', 'OEM Only', 'CR2032', '5G6959752BM', 'MQB Platform. Megamos AES.');

-- VW ID.4 2021-2024 (Electric)
INSERT OR REPLACE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip_type, frequency, keyway, lishi_tool, key_blank, battery, oem_part, notes)
VALUES 
    ('Volkswagen', 'ID.4', 2021, 2024, 'Smart Key', 'N/A', 'MEB Platform', '315 MHz', 'N/A', 'N/A', 'N/A', 'CR2032', 'N/A', 'Electric vehicle. MEB Platform. Dealer programming only.');

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 2: VW PROGRAMMING GUIDES
-- ═══════════════════════════════════════════════════════════════════════════

-- VW Jetta 2002-2010 (Pre-MQB) Guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'vw-jetta-2002-2010',
  'Volkswagen',
  'Jetta',
  2002,
  2010,
  '# 🚗 Volkswagen Jetta Master Guide (2002-2010)
## Pre-MQB Transponder Key Programming

---

## 📋 Overview

VW Jetta 2002-2010 spans two immobilizer generations: **Immo3** (2002-2005) and **Immo4** (2006-2010). Understanding the system is critical for successful key programming.

> **⚠️ Warning:** These systems require PIN extraction. Without the correct PIN, key programming will fail.

---

## 🔐 Transponder Chip Evolution

| Years | Immo Gen | Chip Type | Module Location |
|-------|----------|-----------|-----------------|
| 2002-2005 | Immo3 | ID48 (Megamos Crypto) | Instrument Cluster (24C32) |
| 2006-2010 | Immo4 | ID48 CAN (Megamos CAN) | Instrument Cluster (Micronas) |

---

## 📡 FCC IDs

| Years | FCC ID | Key Type | OEM Part |
|-------|--------|----------|----------|
| 2002-2005 | HLO1J0959753AM | Flip Key | 1J0959753AM |
| 2006-2010 | NBG92596263 | Flip Key | 1K0959753H |

---

## 🔧 Key Information

- **Blade:** HU66
- **Lishi:** HU66 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz (US)
- **Key Blank:** HU66T6 (2002-2005), HU66T24 (2006-2010)

---

## ⚙️ Programming Process

### Immo3 (2002-2005)

1. **Extract PIN** from instrument cluster 24C32 EEPROM via VAG-Tacho or OBD
2. **Enter PIN** in programming tool
3. **Insert new key** and turn ignition ON
4. **Adapt key** via VCDS or Autel

**Tools:**
- VVDI2 with VAG functions
- Autel IM608/IM508
- VAG-Tacho
- VCDS/VAG-COM

### Immo4 (2006-2010)

1. **Remove instrument cluster** (more complex - Micronas MCU)
2. **Read cluster data** via VVDI Prog or bench tools
3. **Calculate CS (Component Security)** bytes
4. **Prepare key file** and write to transponder
5. **Install key** via OBD adaptation

> **💡 Pro Tip:** Some newer tools can read Immo4 data via OBD "service mode" without cluster removal.

**Tools:**
- VVDI2 + VVDI Prog
- Autel IM608 (with cloud calculation)
- Lonsdor K518
- Rosfar

---

## 🔒 All Keys Lost (AKL) Procedure

### Immo3 AKL
- Read 24C32 EEPROM from cluster
- Extract 4-digit PIN
- Program new transponder key

### Immo4 AKL
- Remove cluster and read Micronas MCU + 24C32
- Calculate CS bytes from dump
- Generate dealer key
- Write to blank and adapt

---

## 📚 Sources

- EEPROM Research Database
- Cross-Reference Catalog
- Locksmith Tool Documentation
',
  '{"sources": ["eeprom_research", "cross_reference_database", "strattec_catalog"], "generated": "2024-12-23", "method": "database_research"}'
);

-- VW Universal Legacy Guide (1998-2005)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'vw-legacy-1998-2005',
  'Volkswagen',
  'All Models',
  1998,
  2005,
  '# 🚗 Volkswagen Legacy Systems Guide (1998-2005)
## Immo2 & Immo3 Reference

---

## 📋 Overview

Early VW immobilizer systems (Immo2/Immo3) are the most accessible for locksmith programming. These use **Megamos ID48** transponders with extractable PINs.

---

## 🔐 System Identification

| System | Years | PIN Location | Chip |
|--------|-------|--------------|------|
| Immo2 | 1998-2001 | Separate Immobox (93C56) | ID48 |
| Immo3 | 2002-2005 | Instrument Cluster (24C32) | ID48 |

---

## 🚙 Covered Models

| Model | Years |
|-------|-------|
| Jetta | 1999-2005 |
| Golf | 1999-2005 |
| Beetle | 1998-2005 |
| Passat (B5/B5.5) | 1998-2005 |
| GTI | 1999-2005 |
| Cabrio | 1999-2002 |
| EuroVan | 1999-2003 |

---

## 🔧 Key Specifications

- **Blade:** HU66 (all models)
- **Lishi:** HU66 2-in-1
- **Key Blanks:** HU66T6, HU66AT6 (Audi cross-compatible)
- **Battery:** CR2032
- **Frequency:** 315 MHz

---

## ⚙️ Programming Tools

| Tool | Capability |
|------|------------|
| **VAG-Tacho** | PIN reading, key adaptation |
| **VCDS (VAG-COM)** | Dealer-level diagnostics |
| **VVDI2** | Full VAG support, AKL capable |
| **Autel IM608** | OBD and EEPROM methods |
| **Tango** | EEPROM cloning and programming |

---

## 📚 Sources

- Strattec 2008 Catalog
- Ilco 2023 Reference
- EEPROM Data Research
',
  '{"sources": ["strattec_2008", "ilco_2023", "eeprom_research"], "generated": "2024-12-23", "method": "database_research"}'
);

-- VW MQB Platform Guide (2015+)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'vw-mqb-2015-2024',
  'Volkswagen',
  'MQB Platform',
  2015,
  2024,
  '# 🚗 Volkswagen MQB Platform Guide (2015-2024)
## Megamos AES / ID88 Key Programming

---

## 📋 Overview

The **MQB (Modular Transverse Matrix)** platform is VW''s current architecture. It uses **Megamos AES (ID88/MQB48)** transponders that **cannot be cloned**.

> **🔴 Critical:** These keys require online or server-based programming. No offline AKL solution exists.

---

## 🚙 MQB Models

| Model | MQB Years | Key Type |
|-------|-----------|----------|
| Golf Mk7/7.5/8 | 2015-2024 | Smart Key |
| Jetta (7th Gen) | 2019-2024 | Smart Key |
| Tiguan (2nd Gen) | 2018-2024 | Smart Key |
| Atlas | 2018-2024 | Smart Key |
| Arteon | 2019-2024 | Smart Key |
| Beetle (Final) | 2017-2019 | Smart Key |
| CC (Final) | 2016-2017 | Smart Key |
| GTI Mk7/7.5 | 2015-2021 | Smart Key |

---

## 🔐 Key Specifications

- **Chip:** ID88 / Megamos AES (MQB48)
- **Blade:** HU162T (side-cut)
- **Lishi:** HU162T 2-in-1
- **Frequency:** 315 MHz (US), 433 MHz (EU)
- **FCC ID:** NBGFS12P01 (most models)

---

## ⚙️ Programming Requirements

### Tools with MQB Support

| Tool | Method | Notes |
|------|--------|-------|
| **ODIS (Dealer)** | Online | Factory diagnostic tool |
| **VAG-COM / VCDS** | Online | With proper license |
| **Autel IM608** | Cloud | Requires internet connection |
| **VVDI2 + Key Tool** | Server | Sync Data calculation |
| **Lonsdor K518** | Online | With VAG license |

### ⚠️ All Keys Lost (AKL)

MQB AKL is **extremely difficult**:
1. Requires reading instrument cluster or BCM2
2. Sync Data/CS codes must be extracted
3. Server calculation or dealer access needed
4. Some vehicles require module replacement

---

## 🔧 Procedure (Add Key with Working Key)

1. Connect ODIS, Autel, or VVDI to OBD
2. Select VAG → Volkswagen → Model
3. Enter "Immobilizer" menu
4. Choose "Add Key" or "Key Learning"
5. Follow prompts to fetch Sync Data
6. Insert new programmed key
7. Adapt via tool

---

## 📚 Sources

- Automotive Transponder Chip Database
- Tool Manufacturer Documentation
- Cross-Reference Research
',
  '{"sources": ["transponder_database", "tool_documentation", "cross_reference_database"], "generated": "2024-12-23", "method": "database_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 3: UPDATE EXISTING VW VEHICLES WITH ENRICHED DATA
-- ═══════════════════════════════════════════════════════════════════════════

-- Update VW vehicles with Lishi tool and keyway data
UPDATE vehicles 
SET lishi_tool = 'HU66', keyway = 'HU66'
WHERE make = 'Volkswagen' AND year <= 2014 AND lishi_tool IS NULL;

UPDATE vehicles 
SET lishi_tool = 'HU162T', keyway = 'HU162T'
WHERE make = 'Volkswagen' AND year >= 2015 AND lishi_tool IS NULL;

-- Update chip types for VW
UPDATE vehicles
SET chip_type = 'ID48'
WHERE make = 'Volkswagen' AND year BETWEEN 1998 AND 2005 AND chip_type IS NULL;

UPDATE vehicles
SET chip_type = 'ID48 CAN'
WHERE make = 'Volkswagen' AND year BETWEEN 2006 AND 2014 AND chip_type IS NULL;

UPDATE vehicles
SET chip_type = 'ID88 (MQB48)'
WHERE make = 'Volkswagen' AND year >= 2015 AND chip_type IS NULL;

-- Update frequency for all VW (US market)
UPDATE vehicles
SET frequency = '315 MHz'
WHERE make = 'Volkswagen' AND frequency IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 4: VW FCC ID REFERENCE TABLE
-- ═══════════════════════════════════════════════════════════════════════════

INSERT OR REPLACE INTO fcc_reference (fcc_id, make, models, year_start, year_end, key_type, buttons, chip_type, frequency, oem_parts, notes)
VALUES 
    ('HLO1J0959753AM', 'Volkswagen', 'Jetta, Golf, Beetle, Passat', 2002, 2005, 'Flip Key', 3, 'ID48', '315 MHz', '1J0959753AM', 'Immo3 System'),
    ('HLO1J0959753F', 'Volkswagen', 'Beetle, Golf', 1998, 2001, 'Flip Key', 3, 'ID48', '315 MHz', '1J0959753F', 'Older "Banjo" remote'),
    ('NBG92596263', 'Volkswagen', 'Jetta, Golf, GTI, Eos, Beetle', 2006, 2010, 'Flip Key', 3, 'ID48 CAN', '315 MHz', '1K0959753H', 'CAN Bus System'),
    ('NBG010180T', 'Volkswagen', 'Jetta, Golf, Tiguan, CC, Beetle', 2010, 2014, 'Flip Key', 3, 'ID48 CAN', '315 MHz', '5K0837202AE', 'G-Chip equivalent'),
    ('NBG010206T', 'Volkswagen', 'Tiguan', 2015, 2017, 'Flip Key', 3, 'ID48 CAN', '315 MHz', '5K0959753BM', 'Late Immo4'),
    ('NBG009066T', 'Volkswagen', 'Passat', 2006, 2015, 'Smart Key', 4, 'ID48 CAN', '315 MHz', '3C0959752BA', 'Comfort Key / Kessy'),
    ('NBGFS12P01', 'Volkswagen', 'Jetta, Golf, Tiguan, Atlas, Passat, Arteon, Beetle', 2015, 2024, 'Smart Key', 4, 'ID88 (MQB48)', '315 MHz', '5G6959752BM', 'MQB Platform'),
    ('NBGFS12A01', 'Volkswagen', 'Golf, GTI, Golf R', 2015, 2021, 'Smart Key', 4, 'ID88 (MQB48)', '315 MHz', '5G0959752A', 'MQB Golf 7 Series'),
    ('IYZ3203', 'Volkswagen', 'Touareg', 2004, 2010, 'Smart Key', 4, 'ID46', '315 MHz', 'N/A', 'Luxury SUV'),
    ('IYZVWTOUA', 'Volkswagen', 'Touareg', 2011, 2017, 'Smart Key', 4, 'ID48 CAN', '315 MHz', 'N/A', 'Second-gen Touareg'),
    ('IYZ-C01C', 'Volkswagen', 'Routan', 2009, 2014, 'FOBIK', 5, 'ID46', '315 MHz', 'N/A', 'Chrysler platform rebadge');

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 5: IMMOBILIZER SYSTEM DETAILS
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE vehicles 
SET immobilizer_system = 'VAG Immo2 / ID48'
WHERE make = 'Volkswagen' AND year BETWEEN 1998 AND 2001;

UPDATE vehicles 
SET immobilizer_system = 'VAG Immo3 / ID48'
WHERE make = 'Volkswagen' AND year BETWEEN 2002 AND 2005;

UPDATE vehicles 
SET immobilizer_system = 'VAG Immo4 / ID48 CAN'
WHERE make = 'Volkswagen' AND year BETWEEN 2006 AND 2014;

UPDATE vehicles 
SET immobilizer_system = 'VAG Immo5 / MQB ID88'
WHERE make = 'Volkswagen' AND year >= 2015;
