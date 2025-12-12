-- Fix part_crossref schema and import cross-reference data
-- Add missing columns to part_crossref

ALTER TABLE part_crossref ADD COLUMN make TEXT;
ALTER TABLE part_crossref ADD COLUMN oem_part TEXT;
ALTER TABLE part_crossref ADD COLUMN fcc_id TEXT;
ALTER TABLE part_crossref ADD COLUMN key_type TEXT;
ALTER TABLE part_crossref ADD COLUMN notes TEXT;

-- Import Cross-Reference Data from Research (ILCO/Strattec/JMA/KEYDIY)
INSERT INTO part_crossref (make, oem_part, ilco_part, strattec_part, jma_part, keydiy_part, fcc_id, key_type, notes) VALUES

-- GENERAL MOTORS
('Chevrolet', '15913421', 'B111-PT', '5903089', 'GM-38', 'B22-4', 'OUC60270', 'Remote Head', 'Silverado 2007-2013; Circle Plus Z-Keyway'),
('Chevrolet', '13577770', 'B119-PT', '5922534', 'GM-37', 'NB-ETT-GM', 'OHT01060512', 'Flip Key', 'Silverado 2014-2018; High Security Z-Keyway'),
('Chevrolet', '13500221', 'B116-PT', '5912543', 'GM-30E', 'NB-ETT-GM', 'OHT01060512', 'Flip Key', 'Equinox 2010-2017; HU100 Keyway'),
('Chevrolet', '13500226', 'B116-PT', '5912545', 'GM-30E', 'NB-ETT-GM', 'OHT01060512', 'Flip Key', 'Cruze 2011-2016; High Security'),
('Chevrolet', '13529634', NULL, '5929505', NULL, 'ZB-Series', 'HYQ4EA', 'Smart Key', 'Malibu 2016-2021; Proximity Push-to-Start'),
('GMC', '13500221', 'B119-PT', '5912545', 'GM-37', 'NB-ETT-GM', 'OHT01060512', 'Flip Key', 'Sierra 2014-2019'),
('GMC', '13580082', NULL, '5923896', NULL, 'ZB-Series', 'HYQ1AA', 'Smart Key', 'Yukon 2015-2020; 6-Button Hatch'),
('Cadillac', '22756465', 'B112-PT', '5912555', 'GM-38', 'B22-4', 'OUC6000066', 'Remote Head', 'Escalade 2007-2014; Circle Plus'),
('Cadillac', '25943676', NULL, '5922074', NULL, 'ZB-Series', 'M3N5WY7777A', 'Smart Key', 'CTS 2008-2013; Early Proximity'),
('Buick', '13500224', 'B116-PT', '5912548', 'GM-30E', 'NB-ETT-GM', 'OHT01060512', 'Flip Key', 'Encore 2013-2016'),
('Chevrolet', '25926479', NULL, '15254057', NULL, NULL, 'M3N5WY7777A', 'Smart Fob', 'Corvette 2005-2007; C6 no blade'),

-- FORD
('Ford', '164-R0475', 'H72-PT', '5904287', 'FO-15DE', 'B11-3', 'CWTWB1U331', 'Remote Head', 'F-150 2004-2010; 40-bit PATS 2'),
('Ford', '164-R8070', 'H92-PT', '5912560', 'FO-20DE', 'B11-3', 'CWTWB1U793', 'Remote Head', 'F-150 2011-2014; 80-bit SA stamp'),
('Ford', '164-R8130', 'H128-PT', '5925315', NULL, 'NB-Series', 'N5F-A08TAA', 'Flip Key', 'F-150 2015-2020; High Security HU101'),
('Ford', '164-R8046', 'H94-PT', '5919918', NULL, 'B11-3', 'KR55WK48801', 'Remote Head', 'Focus 2012-2019; Laser Cut HU101'),
('Ford', '164-R7986', 'H128-PT', '5923667', NULL, 'NB-Series', 'N5F-A08TAA', 'Flip Key', 'Fusion 2013-2016'),
('Ford', '164-R8092', NULL, '5921287', NULL, 'ZB-Series', 'M3N5WY8609', 'Smart Key', 'Explorer 2011-2015; Intelligent Access'),
('Ford', '164-R8073', 'H92-PT', '5912561', 'FO-20DE', 'B11-3', 'CWTWB1U793', 'Remote Head', 'Mustang 2010-2014; 80-bit'),
('Lincoln', '164-R7015', 'H72-PT', '693356', 'FO-15DE', NULL, 'CWTWB1U331', 'Remote Head', 'Navigator 2003-2006; 40-bit'),
('Ford', '164-R8126', NULL, '5925981', NULL, 'NB-Series', 'GK2T-15K601', 'Remote Key', 'Transit 2015-2020; HU101'),

-- STELLANTIS
('Dodge', '56046638AC', 'Y164-PT', '5913502', 'CHR-15E', 'NB-11', 'IYZ-C01C', 'Fobik', 'Ram 2009-2012; Integrated Key'),
('Dodge', '68066873AA', 'Y170-PT', '5923790', NULL, 'NB-11', 'GQ4-53T', 'Fobik', 'Ram 2013-2018; Pod Key backup'),
('Dodge', '68291691AC', NULL, '5933934', NULL, 'ZB-Series', 'OHT-4882056', 'Smart Key', 'Ram 2019-2023; Push-to-Start'),
('Jeep', '68003389AA', 'Y164-PT', '692960', 'CHR-15E', 'NB-Series', 'OHT692713AA', 'Remote Head', 'Wrangler JK 2007-2018; Y159'),
('Jeep', '68293535AA', 'SIP22-PT', NULL, 'FI-16', 'NB-Series', 'OHT1130261', 'Flip Key', 'Wrangler JL 2018-2024; SIP22 blade'),
('Jeep', '68143505AA', NULL, '5926058', NULL, 'ZB-Series', 'M3N-40821302', 'Smart Key', 'Grand Cherokee 2014-2021; Hitag AES'),
('Chrysler', '05179513AA', 'Y160-PT', '692325', 'CHR-15', 'B22-3', 'OHT692427AA', 'Remote Head', '300 2005-2007'),
('Chrysler', '05026197AD', 'Y164-PT', '5913502', NULL, 'NB-11', 'IYZ-C01C', 'Fobik', 'Town Country 2008-2016'),
('Dodge', '56046759AA', NULL, '5923758', NULL, 'ZB-Series', 'M3N-40821302', 'Smart Key', 'Charger 2011-2018; Keyless Go'),

-- TOYOTA
('Toyota', '89070-06420', 'TOY43-PT', NULL, 'TOYO-15E', 'B01-3', 'HYQ12BDM', 'Remote Head', 'Camry 2012-2014; G stamp'),
('Toyota', '89070-42D30', 'TR47-PT', NULL, 'TOYO-15', 'B01-3', 'HYQ12BDM', 'Remote Head', 'RAV4 2013-2018; H stamp 8A'),
('Toyota', '89070-02880', 'TOY44H-PT', NULL, 'TOYO-36', 'B01-3', 'HYQ12BEL', 'Remote Head', 'Corolla 2014-2019; H stamp 128-bit'),
('Toyota', '89070-04040', 'TR47-PT', NULL, 'TOYO-15', 'B01-3', 'HYQ12BDM', 'Remote Head', 'Tacoma 2016-2021; H stamp'),
('Toyota', '89070-48130', 'TOY43-PT', NULL, 'TOYO-15E', 'B01-3', 'HYQ14AAB', 'Remote Head', 'Highlander 2008-2013; G stamp 2011+'),
('Lexus', '89904-48190', NULL, NULL, NULL, 'ZB-Series', 'HYQ14ACX', 'Smart Key', 'RX350 2010-2015; Proximity'),
('Toyota', '89070-0C050', 'TR47-PT', NULL, 'TOYO-15', 'B01-3', 'HYQ12BBY', 'Remote Head', 'Tundra 2007-2017'),
('Toyota', '89904-08010', NULL, NULL, NULL, 'ZB-Series', 'HYQ14ADR', 'Smart Key', 'Sienna 2011-2020; Sliding doors'),
('Toyota', '89904-47230', NULL, NULL, NULL, 'ZB-Series', 'HYQ14ACX', 'Smart Key', 'Prius 2010-2015; Silver logo'),
('Toyota', '89070-35170', 'TOY43-PT', NULL, 'TOYO-15E', 'B01-3', 'HYQ12BBY', 'Remote Head', '4Runner 2010-2019; G/H vary'),

-- HONDA
('Honda', '35118-TA0-A00', 'HO03-PT', '5907553', 'HOND-24', 'B11-4', 'OUCG8D-380H-A', 'Remote Head', 'Accord 2008-2012; High Security'),
('Honda', '35118-SNA-A11', 'HO03-PT', NULL, 'HOND-24', 'B11-3', 'N5F-S0084A', 'Remote Head', 'Civic 2006-2013'),
('Honda', '35118-SWA-A01', 'HO03-PT', NULL, 'HOND-24', 'B11-3', 'OUCG8D-380H-A', 'Remote Head', 'CR-V 2007-2013'),
('Honda', '35118-TK8-A10', 'HO03-PT', NULL, 'HOND-31', 'B11-5', 'N5F-A04TAA', 'Remote Head', 'Odyssey 2011-2013; Sliding doors'),
('Acura', '35118-STX-A01', 'HO03-PT', NULL, 'HOND-31', 'B11-4', 'OUCG8D-439H-A', 'Remote Head', 'MDX 2007-2013'),
('Honda', '35118-SZA-A02', 'HO03-PT', NULL, 'HOND-31', 'B11-4', 'KR55WK49308', 'Remote Head', 'Pilot 2009-2015; Trunk'),
('Honda', '35118-T2A-A20', 'HO05-PT', NULL, NULL, 'NB-Series', 'MLBHLIK6-1T', 'Remote Head', 'Accord 2013-2015; G-Blade ID47'),
('Honda', '72147-TBA-A11', NULL, NULL, NULL, 'ZB-Series', 'KR5V2X', 'Smart Key', 'Civic 2014-2020; Proximity 433MHz'),
('Honda', '35118-TK6-A00', 'HO03-PT', NULL, 'HOND-24', 'B11-3', 'OUCG8D-380H-A', 'Remote Head', 'Fit 2009-2013'),

-- NISSAN
('Nissan', '285E3-JA02A', NULL, '692059', 'DAT-15', 'ZB-Series', 'KR55WK48903', 'Smart Key', 'Altima 2007-2012; Intelligent Key'),
('Nissan', '285E3-JM00D', NULL, NULL, 'DAT-15', 'ZB-Series', 'CWTWB1U751', 'Smart Key', 'Rogue 2008-2013; Twist Knob'),
('Nissan', 'H0564-ET000', 'NI04-T', '7003526', 'DAT-15', NULL, NULL, 'Transponder', 'Sentra 2007-2012; ID46'),
('Nissan', 'H0561-C993A', 'NI04-T', NULL, 'DAT-15', 'B01-3', 'CWTWB1U751', 'Remote Head', 'Versa 2007-2012'),
('Infiniti', '285E3-1NC0D', NULL, NULL, NULL, 'ZB-Series', 'KR55WK49622', 'Smart Key', 'G37 2009-2013; Oval Push Start'),
('Nissan', '28268-7Z800', 'NI04-T', NULL, 'DAT-15', 'B01-3', 'CWTWB1U331', 'Remote Head', 'Titan 2004-2015'),
('Nissan', '285E3-9N00A', NULL, NULL, NULL, 'ZB-Series', 'KR55WK49622', 'Smart Key', 'Maxima 2009-2014'),
('Nissan', '28268-EA000', 'NI04-T', NULL, 'DAT-15', 'B01-3', 'CWTWB1U343', 'Remote Head', 'Frontier 2005-2018; NSN14'),

-- HYUNDAI/KIA
('Hyundai', '95430-3Q000', 'HY18-PT', NULL, 'HY-18', 'NB-Series', 'OSLOKA-870T', 'Flip Key', 'Sonata 2011-2014; High Security'),
('Hyundai', '95430-3X500', 'HY18-PT', NULL, 'HY-18', 'NB-Series', 'OSLOKA-950T', 'Flip Key', 'Elantra 2011-2016'),
('Kia', '95430-2T000', 'KK10-PT', NULL, 'KIA-7', 'NB-Series', 'NYOSEKS-TF10ATX', 'Flip Key', 'Optima 2011-2013; Laser cut'),
('Kia', '95430-2K250', 'KK8-PT', NULL, 'KIA-3', 'NB-Series', 'NYOSEKS-AM08TX', 'Flip Key', 'Soul 2010-2013; KK8 blade'),
('Hyundai', '95440-4Z200', NULL, NULL, NULL, 'ZB-Series', 'SY5DMFNA433', 'Smart Key', 'Santa Fe 2013-2018; Proximity'),
('Kia', '95440-1U500', NULL, NULL, NULL, 'ZB-Series', 'SY5HMFNA04', 'Smart Key', 'Sorento 2014-2015; Proximity'),
('Hyundai', '95430-2S201', 'HY18-PT', NULL, 'HY-18', 'NB-Series', 'TQ8-RKE-3F04', 'Flip Key', 'Tucson 2010-2015'),
('Kia', '95430-A7100', 'KK12-PT', NULL, 'KIA-9', 'NB-Series', 'OSLOKA-875T', 'Flip Key', 'Forte 2014-2018; KK12 Center'),
('Hyundai', '95430-1R000', 'HY18-PT', NULL, 'HY-18', 'NB-Series', 'OKA-N028', 'Flip Key', 'Accent 2012-2017'),

-- BMW
('BMW', '66126955748', 'BMW-HU92', NULL, 'BM-6', 'NB-Series', 'LX8 FZV', 'Remote Key', '3-Series E46 1999-2005; Diamond'),
('BMW', '66126933077', 'BMW-HU58', NULL, 'BM-5', 'NB-Series', 'LX8 FZV', 'Remote Key', '5-Series E39 1997-2003; HU58'),
('BMW', '66126986583', NULL, NULL, NULL, 'ZB-Series', 'KR55WK49127', 'Smart Fob', '3-Series E90 2006-2011; CAS3'),
('BMW', '66129268488', NULL, NULL, NULL, 'ZB-Series', 'KR55WK49127', 'Smart Fob', 'X5 E70 2007-2013; CAS3+'),
('BMW', '66128723602', NULL, NULL, NULL, 'ZB-Series', 'YGOHUF5662', 'Smart Fob', 'F-Series 2012-2018; FEM/BDC'),
('BMW', '66126955750', 'BMW-HU92', NULL, 'BM-6', 'NB-Series', 'LX8 FZV', 'Remote Key', 'Z4 E85 2003-2008; HU92'),
('BMW', '66123456368', NULL, NULL, NULL, 'ZB-Series', 'KR55WK49333', 'Smart Fob', 'Mini Cooper 2007-2014; Pie CAS3'),

-- MERCEDES
('Mercedes-Benz', 'A2049056202', 'MB-HU64', NULL, 'ME-HM', 'FBS3-BE', 'IYZ3312', 'IR Fob', 'C-Class W204 2008-2014; FBS3'),
('Mercedes-Benz', 'A2117663601', 'MB-HU64', NULL, 'ME-HM', 'FBS3-BE', 'IYZ3312', 'IR Fob', 'E-Class W211 2003-2009; FBS3'),
('Mercedes-Benz', 'A1647602206', 'MB-HU64', NULL, 'ME-HM', 'FBS3-BE', 'IYZ3312', 'IR Fob', 'ML-Class W164 2006-2011; FBS3'),
('Mercedes-Benz', 'A2217663601', 'MB-HU64', NULL, 'ME-HM', 'FBS3-BE', 'IYZ3312', 'IR Fob', 'S-Class W221 2007-2013; FBS3'),
('Mercedes-Benz', 'A9067602206', NULL, NULL, NULL, 'NB-Series', 'IYZ3312', 'Remote Key', 'Sprinter 2007-2018; Blade key'),
('Mercedes-Benz', 'A1569053200', NULL, NULL, NULL, NULL, 'FBS4', 'IR Fob', 'GLA X156 2014-2019; DEALER ONLY'),

-- VW/AUDI
('Volkswagen', '1J0959753AM', 'HU66-PT', NULL, 'VO-2', 'B01-3', 'HLO1J0959753AM', 'Flip Key', 'Jetta 2002-2005; AM Remote 315MHz'),
('Volkswagen', '1K0959753H', 'HU66-PT', NULL, 'VO-2', 'NB-Series', 'NBG92596263', 'Flip Key', 'Jetta 2006-2010; CAN Bus'),
('Volkswagen', '3C0959752BA', NULL, NULL, NULL, 'NB-Series', 'NBG009066T', 'Fob Key', 'Passat 2006-2014; Comfort Key'),
('Volkswagen', '5K0837202AE', 'HU66-PT', NULL, 'VO-2', 'NB-Series', 'NBG010180T', 'Flip Key', 'Golf 2010-2014'),
('Audi', '8E0837220L', 'HU66-PT', NULL, 'AU-2', 'NB-Series', '8E0837220L', 'Flip Key', 'A4 B7 2005-2008; ID48'),
('Audi', '8K0959754G', NULL, NULL, NULL, 'ZB-Series', 'IYZFBSB802', 'Smart Key', 'A4 B8 2009-2016; BCM2'),
('Volkswagen', '5G0959752A', NULL, NULL, NULL, 'NB-Series', 'NBGFS12A01', 'Flip Key', 'GTI 2015-2020; MQB HU162T'),
('Audi', '8T0959754C', NULL, NULL, NULL, 'ZB-Series', 'IYZFBSB802', 'Smart Key', 'Q5 2009-2017; BCM2');

-- Create indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_crossref_make ON part_crossref(make);
CREATE INDEX IF NOT EXISTS idx_crossref_oem ON part_crossref(oem_part);
CREATE INDEX IF NOT EXISTS idx_crossref_ilco ON part_crossref(ilco_part);
CREATE INDEX IF NOT EXISTS idx_crossref_fcc ON part_crossref(fcc_id);
