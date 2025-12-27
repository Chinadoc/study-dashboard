-- Euro Phase B Enrichment: Mercedes, Volvo, Porsche, VW/Audi
-- Generated: 2025-12-26

-- ==============================================================================
-- MERCEDES-BENZ ENRICHMENT
-- ==============================================================================

-- C-Class W204 (2008-2014)
UPDATE vehicles SET 
    fcc_id = 'IYZDC07K', 
    lishi_tool = 'HU64', 
    battery = 'CR2025',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'W204 platform. FBS3/DAS3 system.'
WHERE make = 'Mercedes-Benz' AND model = 'C-Class' AND year_start >= 2008 AND year_end <= 2014;

-- C-Class W205 (2015-2021)
UPDATE vehicles SET 
    fcc_id = 'IYZ-3312', 
    lishi_tool = 'HU64', 
    battery = 'rechargeable',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'W205 platform. FBS4 system. Internal rechargeable battery.'
WHERE make = 'Mercedes-Benz' AND model = 'C-Class' AND year_start >= 2015 AND year_end <= 2021;

-- E-Class W213 (2017+)
UPDATE vehicles SET 
    fcc_id = 'NBGIDGNG1', 
    lishi_tool = 'HU64', 
    programming_method = 'IR/RF',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'W213 platform. FBS4 / DAS4 system.'
WHERE make = 'Mercedes-Benz' AND model = 'E-Class' AND year_start >= 2017;

-- ==============================================================================
-- VOLVO ENRICHMENT
-- ==============================================================================

-- S60/V60/XC60 (2015-2019)
UPDATE vehicles SET 
    lishi_tool = 'NE66', 
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'CEM-based security.'
WHERE make = 'Volvo' AND model IN ('S60', 'V60', 'XC60') AND year_start >= 2015 AND year_end <= 2019;

-- XC90 (2016+)
UPDATE vehicles SET 
    platform = 'SPA', 
    lishi_tool = 'NE66',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Scalable Product Architecture (SPA) platform.'
WHERE make = 'Volvo' AND model = 'XC90' AND year_start >= 2016;

-- ==============================================================================
-- PORSCHE ENRICHMENT
-- ==============================================================================

-- Cayenne (2011-2018)
UPDATE vehicles SET 
    fcc_id = 'KR55WK50138', 
    lishi_tool = 'HU66',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'BCM2 system. Smart selection common.'
WHERE make = 'Porsche' AND model = 'Cayenne' AND year_start >= 2011 AND year_end <= 2018;

-- Macan (2014+)
UPDATE vehicles SET 
    fcc_id = 'KR55WK50138', 
    lishi_tool = 'HU66',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Similar BCM2 architecture to Cayenne.'
WHERE make = 'Porsche' AND model = 'Macan' AND year_start >= 2014;

-- ==============================================================================
-- VW/AUDI ENRICHMENT
-- ==============================================================================

-- Jetta (2019+)
UPDATE vehicles SET 
    fcc_id = 'NBG010206T', 
    platform = 'MQB', 
    lishi_tool = 'HU162',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'MQB platform. Requires 16-byte CS.'
WHERE make = 'Volkswagen' AND model = 'Jetta' AND year_start >= 2019;

-- Passat (2020+)
UPDATE vehicles SET 
    fcc_id = 'NBGFS12P01', 
    platform = 'MQB-Evo', 
    lishi_tool = 'HU162',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'MQB-Evo platform. SFD Gateway protection.'
WHERE make = 'Volkswagen' AND model = 'Passat' AND year_start >= 2020;

-- Audi A4/A5 (2017+)
UPDATE vehicles SET 
    oem_part_number = '4M0959754', 
    lishi_tool = 'HU162',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'BCM2 / MQB platform interaction.'
WHERE make = 'Audi' AND model IN ('A4', 'A5') AND year_start >= 2017;
