-- Key Blanks Data Migration
-- Generated from Ilco and Strattec catalogs

-- Clear existing data (optional - comment out to append)
-- DELETE FROM key_blanks;

-- Batch 1
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Acura', 'CL', 1998, 2003, 'HD106-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13) Fixed Code System'),
    ('Acura', 'CL', 1998, 2003, 'HD106-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'CL', 1998, 2003, 'HD107-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'CL', 1998, 2003, 'HD107-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'CSX (CANADA)', 2006, 2011, 'HO03-PT(V)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Philips (46) Encrypted System'),
    ('Acura', 'CSX (CANADA)', 2006, 2011, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'EL (CANADA)', 2003, 2005, 'HO01-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13) Fixed Code System'),
    ('Acura', 'EL (CANADA)', 2003, 2005, 'HO01T5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'ILX PREM/TECHPLUS', 2018, 2022, 'OEM# 72147-TX6-C61 or
72147-TX6-C71', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2018', 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'ILX BASE', 2016, 2022, 'OEM# 72147-TX6-C51 or
72147-TX6-C61', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2018', 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'ILX', 2019, 2019, 'OEM# 72147-TZ3-A01 or
72147-TZ3-A11 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'INTEGRA', 2000, 2001, 'HD106-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13) Fixed Code System'),
    ('Acura', 'INTEGRA', 2000, 2001, 'HD106-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'INTEGRA', 2000, 2001, 'HD107-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'INTEGRA', 2000, 2001, 'HD107-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'LEGEND', 1991, 1996, 'X208', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'LEGEND', 1991, 1996, 'X209', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'MDX', 2022, 2023, 'OEM# 72147-TYA-A11 or
72147-TYA-A21', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'MDX', 2019, 2020, 'OEM# 72147-TZ5-A01', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'NSX', 2017, 2018, 'OEM# 72147-T6N-A01 OR
72147-T6N-A11', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'RDX', 2019, 2021, 'OEM# 72147-TJB-A01 or
72147-TJB-A11', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2020', 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'RL', 2005, 2009, 'HD111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2005', 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Acura', 'RL', 2005, 2009, 'EK3P-HD111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'RLX ADV', 2019, 2020, 'OEM# 72147-TX6-C61 or
72147-TX6-C71', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'RLX TECH', 2016, 2020, 'OEM# 72147-TZ3-A01 or
72147-TZ3-A11 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'RLX', 2014, 2015, 'OEM# 72147-TY2-A01 or
72147-TY2-A11', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'RSX', 2002, 2006, 'HD106-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13) Fixed Code System'),
    ('Acura', 'RSX', 2002, 2006, 'HD106-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'RSX', 2002, 2006, 'HD107-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'RSX', 2002, 2006, 'HD107-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'TL W/ PROX', 2009, 2014, 'OEM# 72147-TK4-A71 or
72147-TK4-A81', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'TL', 2007, 2014, 'HO03-PT(V) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Philips (46) Encrypted System'),
    ('Alfa Romeo', 'TL', 2007, 2014, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key. Philips (46) Encrypted System'),
    ('Alfa Romeo', 'TLX BASE', 2021, 2023, 'OEM# 72147-TGV-A01 or
72147-TGV-A11', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Alfa Romeo', 'TLX BASE', 2020, 2020, 'OEM# 72147-TZ3-A22 or
72147-TZ3-A32', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Alfa Romeo', 'TLX ADV', 2020, 2022, 'OEM# 72147-TZ3-A71 or
72147-TZ3-A81', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Alfa Romeo', 'TLX TECH', 2021, 2022, 'OEM# 72147-TGV-A01 or
72147-TGV-A11', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Alfa Romeo', 'TLX', 2018, 2019, 'OEM# 72147-TZ3-A21', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Alfa Romeo', 'TSX', 2009, 2014, 'HO03-PT(V) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Philips (46) Encrypted System'),
    ('Alfa Romeo', 'TSX', 2009, 2014, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Alfa Romeo', 'VIGOR', 1992, 1994, 'X208', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Alfa Romeo', 'VIGOR', 1992, 1994, 'X209', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Alfa Romeo', 'ZDX W/ REGULAR
IGNITION', 2010, 2012, 'HO03-PT(V) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Philips (46) Encrypted System'),
    ('Alfa Romeo', 'ZDX W/ REGULAR
IGNITION', 2010, 2012, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Alfa Romeo', 'ZDX W/ PROX', 2010, 2013, 'OEM# 72147-SZN-A71 or
72147-SZN-A81', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Alfa Romeo', '164', 1990, 1995, 'SP25A-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Alfa Romeo', '164', 1990, 1995, 'X152', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Alfa Romeo', 'GTV/6', 1981, 1989, 'S10LAA-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Alfa Romeo', 'GTV/6', 1981, 1989, 'X152', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'MILANO', 1986, 1989, 'X166', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'SPIDER, GRADUATE', 1981, 1994, 'F91C', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'SPIDER, GRADUATE', 1981, 1994, 'F91C2', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'SPIDER, GRADUATE', 1981, 1994, 'F91C8', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'SPIDER, GRADUATE', 1981, 1994, 'X152', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('AMC', 'ALLIANCE GTA', 1986, 1988, 'X150', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('AMC', 'ALLIANCE GTA', 1986, 1988, 'X147', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('AMC', 'EAGLE', 1982, 1987, 'S1970AM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('AMC', 'EAGLE', 1982, 1987, '1970AM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('AMC', 'ENCORE', 1986, 1986, 'X150', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('AMC', 'ENCORE', 1986, 1986, 'X147', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', '4000', 1985, 1987, 'X139', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', '4000', 1985, 1987, 'X9', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', '100, 200', 1989, 1994, 'X139', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', '100, 200', 1989, 1994, 'X9', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', '5000 SEDAN WAGON', 1985, 1988, 'X139', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', '5000 SEDAN WAGON', 1985, 1988, 'X9', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', '80 SEDAN, 90', 1988, 1995, 'X139', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', '80 SEDAN, 90', 1988, 1995, 'X9', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'A3', 2006, 2015, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System, Ordered by VIN'),
    ('Audi', 'A3', 2006, 2015, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'A4 AVANT/
CABRIOLET,', 2002, 2007, 'HU66AT6', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Audi', 'A4 AVANT/
CABRIOLET,', 2002, 2007, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'A4, S4', 2006, 2015, 'Dealer Key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2008', 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System, Ordered by VIN'),
    ('Audi', 'A4, S4', 2006, 2015, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'A4, S4, T T, ALLROAD,
QUATTRO', 2002, 2005, 'HU66AT6', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Audi', 'A5, S5', 2008, 2015, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System, Ordered by VIN'),
    ('Audi', 'A6, S6', 2001, 2005, 'HU66AT6', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Encrypted Megamos Transponder
System'),
    ('Audi', 'A6, S6', 2001, 2005, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'A6, S6, ALLROAD
QUATTRO', 2006, 2015, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System, Ordered by VIN'),
    ('Audi', 'A6, S6, ALLROAD
QUATTRO', 2006, 2015, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'A8', 1997, 2000, 'HU66AT6', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key.'),
    ('Audi', 'A8', 1997, 2000, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'A8, S8', 2008, 2015, 'Dealer FOB', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System, Ordered by VIN'),
    ('Audi', 'ALLROAD QUATTRO', 1999, 2005, 'HU66AT6', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key.'),
    ('Audi', 'ALLROAD QUATTRO', 1999, 2005, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'Q5, Q7 3.6, 4.2', 2007, 2015, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System, Ordered by VIN'),
    ('Audi', 'Q5, Q7 3.6, 4.2', 2007, 2015, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'RS4 SEDAN', 2006, 2008, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Audi', 'RS6 S4, AVANT', 2004, 2007, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Audi', 'S4 - AVANT,
CABRIOLET, SEDAN', 2006, 2007, 'HU66AT6', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Audi', 'S6, S8 SEDAN', 2005, 2007, 'HU66AT6', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2005', 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Audi', 'TT COUPE,
ROADSTER', 2005, 2015, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System, Ordered by VIN'),
    ('Audi', 'TT COUPE,
ROADSTER', 2005, 2015, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('BMW', '1 SERIES- 128I, 135I', 2008, 2011, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('BMW', '1 SERIES', 2004, 2011, 'HU92RMH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('BMW', '1 SERIES W/ PROX', 2008, 2014, 'HU92RMHK#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('BMW', '3 SERIES- 318i,
323i,323iC,323iS, 335i', 1999, 2007, 'Dealer Key (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Philips Rolling Code System'),
    ('BMW', '3 SERIES- 318i,
323i,323iC,323iS, 335i', 1985, 1991, 'X144', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('BMW', '3 SERIES- 318i,
323i,323iC,323iS, 335i', 1985, 1991, 'HF40', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('BMW', '3 SERIES- 328i, 328Xi,
335i, 335XI', 2008, 2011, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Philips Rolling Code System');

-- Batch 2
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('BMW', '3 SERIES', 2005, 2011, 'HU92RMH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('BMW', '3 SERIES W/ PROX', 2006, 2011, 'HU92RMHK# (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('BMW', '5 SERIES - 524TD,
525i,525Xi, 528E,
530Xi, 533i, 535i,
550i, M5', 2004, 2007, 'Dealer Key (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Philips Rolling Code System'),
    ('BMW', '5 SERIES - 524TD,
525i,525Xi, 528E,
530Xi, 533i, 535i,
550i, M5', 1985, 1987, 'X144', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('BMW', '5 SERIES - 524TD,
525i,525Xi, 528E,
530Xi, 533i, 535i,
550i, M5', 1985, 1987, 'HF40', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('BMW', '5 SERIES - 528i,
528Xi, 535i, 535Xi, 550i', 2008, 2011, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Philips Rolling Code System'),
    ('BMW', '5 SERIES', 2003, 2010, 'HU92RMH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('BMW', '5 SERIES W/ PROX', 2006, 2011, 'HU92RMHK# (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('BMW', '6 SERIES - 630I, 633I,
633CSI,635I, 635CSI,
645CSI, 650I', 2005, 2007, 'Dealer Key (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Philips Rolling Code System'),
    ('BMW', '6 SERIES - 630I, 633I,
633CSI,635I, 635CSI,
645CSI, 650I', 1985, 1989, 'X144', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('BMW', '6 SERIES - 630I, 633I,
633CSI,635I, 635CSI,
645CSI, 650I', 1985, 1989, 'HF40', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('BMW', '6 SERIES - 650i', 2008, 2009, 'Dealer FOB', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Philips Rolling Code System'),
    ('BMW', '6 SERIES', 2004, 2011, 'HU92RMH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('BMW', '7 SERIES - 733i, 735i,
735Li, 740i, 760i, 760Li', 2003, 2007, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Philips Rolling Code System'),
    ('BMW', '7 SERIES - 733i, 735i,
735Li, 740i, 760i, 760Li', 1985, 1987, 'X144', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('BMW', '7 SERIES - 733i, 735i,
735Li, 740i, 760i, 760Li', 1985, 1987, 'HF40', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('BMW', '7 SERIES - 750i, 750Li,
760Li', 2008, 2009, 'Dealer FOB', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System'),
    ('BMW', '7 SERIES', 2002, 2008, 'HU92RMH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('BMW', '8 SERIES - 840Ci', 1996, 1997, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System'),
    ('BMW', '8 SERIES - 840Ci', 1990, 1994, 'S6BW', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('BMW', 'M3 & M5 SERIES', 2000, 2007, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System'),
    ('BMW', 'M5, M6 SEDAN,
CONVERTIBLE', 2008, 2008, 'Dealer FOB', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System'),
    ('BMW', 'X3 - 3.0Si', 2007, 2007, 'Dealer Key (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System'),
    ('BMW', 'X3 2.5i/3.0i', 2004, 2007, 'Dealer Key (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System'),
    ('BMW', 'X3, X5, X6', 2008, 2009, 'Dealer Key (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System'),
    ('BMW', 'X5 W/ PROX', 2007, 2011, 'HU92RMHK#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('BMW', 'X5 - 3.0Si, 4.8i', 2007, 2007, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System'),
    ('BMW', 'X5 3.0i. 4.4i, 4.8iS', 2000, 2007, 'Dealer Key (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System'),
    ('BMW', 'X6 W/ PROX', 2008, 2013, 'HU92RMHK#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('BMW', 'Z3,Z3 COUPE', 1995, 2002, 'Dealer Key (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System'),
    ('BMW', 'Z4 2.5I, 3.0I', 2003, 2011, 'Dealer Key (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System'),
    ('BMW', 'Z4 W/ PROX', 2008, 2013, 'HU92RMHK#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('BMW', 'Z4', 2003, 2011, 'HU92RMH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('BMW', 'Z4, M ROADSTER, M
COUPE', 2008, 2008, 'Dealer FOB', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System'),
    ('BMW', 'ALL', 1996, 2002, '01122A', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('BMW', 'ALL', 1996, 2002, '01122AR', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('BMW', 'ALL', 1996, 2002, '1098M', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('BMW', 'ALL', 1996, 2002, 'L1054B', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'ALLURE (CANADA)', 2010, 2012, 'OEM# 13504202', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Buick', 'ALLURE (CANADA)', 2010, 2012, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'CASCADA', 2016, 2019, 'OEM# 13599912 or 13599913', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Buick', 'CENTURY', 2000, 2005, 'S1105', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'CENTURY', 2000, 2005, 'VATS SYSTEM (B82-P-2
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'CENTURY', 1997, 1999, 'S1105', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'CENTURY', 1997, 1999, 'VATS SYSTEM (B82-P-2
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'ENCLAVE', 2020, 2021, 'OEM#13532751', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2020', 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'ENCORE', 2014, 2023, 'B119-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Buick', 'ENCORE', 2014, 2023, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'ENVISION', 2021, 2021, 'OEM# 13537970', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Buick', 'LACROSSE', 2017, 2019, 'OEM# 13508414 (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'LACROSSE/ALLURE
(CANADA)', 2005, 2009, 'PT04-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'PK3 System'),
    ('Buick', 'LACROSSE/ALLURE
(CANADA)', 2005, 2009, 'PT04-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'LESABRE', 2000, 2005, 'B99-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos Fixed Code System'),
    ('Buick', 'LESABRE', 2000, 2005, 'B99-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'LESABRE', 2000, 2005, 'B100-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'LESABRE', 2000, 2005, 'B100-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'LUCERNE - CX, CXL
V6, CXL V8, CXS', 2006, 2011, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Buick', 'LUCERNE - CX, CXL
V6, CXL V8, CXS', 2006, 2011, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1991, 1996, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1991, 1996, 'P1098E', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1981, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1981, 'P1098E', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'PARK AVENUE', 2003, 2005, 'B97-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos Fixed Code System'),
    ('Buick', 'PARK AVENUE', 2003, 2005, 'B97-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'PARK AVENUE', 1991, 1996, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'PARK AVENUE', 1991, 1996, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'RAINIER', 2005, 2007, 'B99-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos Fixed Code System'),
    ('Buick', 'RAINIER', 2005, 2007, 'B99-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'RAINIER', 2005, 2007, 'B100-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'RAINIER', 2005, 2007, 'B100-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'REATTA, RIVIERA', 1991, 1992, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'REATTA, RIVIERA', 1991, 1992, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'REGAL W/PROX', 2018, 2020, 'OEM# 13506665', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Buick', 'REGAL W/ PEPS', 2011, 2017, 'OEM# 13504202 or 13504203
(LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Buick', 'REGAL W/O PEPS', 2011, 2017, 'B119-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Buick', 'REGAL W/O PEPS', 2011, 2017, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'REGAL', 2000, 2004, 'S1105', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'REGAL', 2000, 2004, 'VATS SYSTEM (B82-P-2
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'REGAL', 1994, 1996, 'S1098WH', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'REGAL', 1994, 1996, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'RENDEZVOUS,
RENDEZVOUS ULTRA', 2002, 2007, 'B99-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos Fixed Code System'),
    ('Buick', 'RENDEZVOUS,
RENDEZVOUS ULTRA', 2002, 2007, 'B99-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'RENDEZVOUS,
RENDEZVOUS ULTRA', 2002, 2007, 'B100-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'RENDEZVOUS,
RENDEZVOUS ULTRA', 2002, 2007, 'B100-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'RIVIERA', 1995, 1999, 'VATS SYSTEM (B82-P-2
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'RIVIERA', 1995, 1999, 'S1105', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'ROADMASTER', 1994, 1996, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'ROADMASTER', 1994, 1996, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'SIGNIA', 2005, 2007, 'B106-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'SKYLARK', 1995, 1998, 'P1107', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'SKYLARK', 1993, 1993, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'SKYLARK', 1993, 1993, 'P1101', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'TERRAZA', 2007, 2008, 'PT04-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'PK3 System'),
    ('Buick', 'TERRAZA', 2007, 2008, 'PT04-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Buick', 'VERANO W/ PEPS', 2012, 2017, 'OEM# 13504202', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Buick', 'VERANO', 2012, 2017, 'B119-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Buick', 'VERANO', 2012, 2017, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'ATS', 2016, 2019, 'OEM# 13598507 (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'BROUGHAM,
FLEETWOOD', 1993, 1996, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'BROUGHAM,
FLEETWOOD', 1993, 1996, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL);

-- Batch 3
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Cadillac', 'BROUGHAM,
FLEETWOOD', 1987, 1990, 'S1098D', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'BROUGHAM,
FLEETWOOD', 1987, 1990, 'P1098C', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'CATERA', 2000, 2001, 'OEM # 90541902', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Phillips Encrypted Code System'),
    ('Cadillac', 'CIMARRON', 1987, 1987, 'S1098D', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'CIMARRON', 1987, 1987, 'P1098C', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'CONCOURS', 1991, 1999, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'CONCOURS', 1991, 1999, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'CT4/CT5', 2020, 2022, 'OEM# 13538860 or 13536990', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'CTS/CTS-V', 2003, 2007, 'B112-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'PK3+ System'),
    ('Cadillac', 'CTS W/ PROX', 2014, 2019, 'OEM# 13580811 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'CTS/CTS-V W/ PROX', 2008, 2013, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'CTS/CTS-V W/O
PROX', 2008, 2013, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Cadillac', 'CTS/CTS-V W/O
PROX', 2008, 2013, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'CT6', 2016, 2020, 'OEM# 13595838 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'DEVILLE', 2000, 2005, 'B99-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos Fixed Code System'),
    ('Cadillac', 'DEVILLE', 2000, 2005, 'B99-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'DEVILLE', 2000, 2005, 'B100-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'DEVILLE', 2000, 2005, 'B100-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'DTS (REPLACES DIS-
CONTINUED DEVILLE)', 2006, 2011, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Cadillac', 'DTS (REPLACES DIS-
CONTINUED DEVILLE)', 2006, 2011, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'ELDORADO', 1991, 2003, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'ELDORADO', 1991, 2003, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'ELR', 2014, 2017, 'OEM# 20984232 or 22856930', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2016', 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Cadillac', 'ESCALADE', 2000, 2006, 'P1113', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'ESCALADE, ESV,
EXT', 2007, 2009, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Cadillac', 'ESCALADE, ESV,
EXT', 2007, 2009, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'ESCALADE, EXT', 2007, 2014, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Cadillac', 'ESCALADE, EXT', 2007, 2014, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'ESCALADE, ESV W/
PROX', 2021, 2022, 'OEM# 13538864 or 13538866', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'ESCALADE, ESV W/
PROX', 2015, 2020, 'OEM# 13580812 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1991, 1996, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1991, 1996, 'P1098E', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'SEVILLE', 2000, 2005, 'B99-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos Fixed Code System'),
    ('Cadillac', 'SEVILLE', 2000, 2005, 'B99-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'SEVILLE', 2000, 2005, 'B100-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'SEVILLE', 2000, 2005, 'B100-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'SEVILLE', 1991, 1996, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'SEVILLE', 1991, 1996, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'SRX', 2015, 2017, 'OEM# 13580800 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2016', 0, NULL, 0, 'ilco_2023', NULL),
    ('Cadillac', 'SRX', 2010, 2013, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'CAMARO W/ PROX', 2016, 2020, 'OEM# 13584504', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'CAMARO', 2010, 2016, 'B119-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'CAMARO', 2010, 2016, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'CAMARO, Z28', 1991, 2002, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'CAMARO, Z28', 1991, 2002, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'CAMARO, Z28', 1989, 1990, 'S1098D', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'CAMARO, Z28', 1989, 1990, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'CAPRICE PPV
(POLICE &
DETECTIVE)', 2014, 2017, 'B119-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'CAPRICE PPV
(POLICE &
DETECTIVE)', 2014, 2017, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'CAVALIER', 2000, 2005, 'P1107', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'COBALT', 2006, 2010, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Chevrolet', 'COBALT', 2006, 2010, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'CORVETTE', 2020, 2022, 'OEM# 13538851', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'CORVETTE', 1986, 1986, 'S1098B', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'CORVETTE', 1986, 1986, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'CRUZE W/ PROX', 2016, 2019, 'OEM# 13584504 (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'CRUZE', 2017, 2019, 'OEM# 13514135 or 13588756', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'EPICA', 2004, 2007, 'DW05T5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Megamos Fixed Code System'),
    ('Chevrolet', 'IMPALA W/ PROX', 2014, 2020, 'OEM#
13500318', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'IMPALA', 2014, 2019, 'B119-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'IMPALA', 2014, 2019, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'IMPALA, CAPRICE', 2000, 2005, 'P1111', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'LUMINA', 1995, 2001, 'S1098WH', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'LUMINA', 1995, 2001, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'MALIBU W/ PROX', 2016, 2021, 'OEM# 13584504', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'MALIBU', 2014, 2016, 'B119-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'MALIBU / MALIBU
MAX', 2004, 2013, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Chevrolet', 'MALIBU / MALIBU
MAX', 2004, 2013, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'MALIBU CLASSIC', 2004, 2005, 'P1111', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'METRO', 1998, 2001, 'X180', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'MONTE CARLO', 2006, 2007, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Chevrolet', 'MONTE CARLO', 2006, 2007, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'NOVA', 1986, 1988, 'X146', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'NOVA', 1986, 1988, 'X145', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'OPTRA', 2004, 2007, 'DW04RAP', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'PRIZM', 1998, 2002, 'X217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'SONIC', 2012, 2018, 'B119-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'SONIC', 2012, 2018, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'SPARK', 2016, 2022, 'B119-PT (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'SPARK', 2016, 2022, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'SPECTRUM', 1985, 1989, 'X143', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'SPRINT', 1984, 1988, 'X54', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'TRAVERSE', 2018, 2023, 'OEM# 13519177', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'VIVANT', 2004, 2007, 'DW05RT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Megamos Fixed Code System'),
    ('Chevrolet', 'VOLT', 2016, 2021, 'OEM# 13585722 or 13585728
(LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46+) Encrypted System'),
    ('Chevrolet', 'ASTRO VAN', 2000, 2005, 'P1113', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'AVALANCHE', 2007, 2013, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Chevrolet', 'AVALANCHE', 2007, 2013, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'BLAZER', 2019, 2023, 'OEM# 13529638
OEM# 13585728
OEM# 13530713', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'CAPTIVA SPORT', 2012, 2015, 'B114R-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Chevrolet', 'CAPTIVA SPORT', 2012, 2015, 'EK3P-B114R', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'CITY EXPRESS', 2015, 2018, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Chevrolet', 'CITY EXPRESS', 2015, 2018, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'C/K PICK UP,
SILVERADO,
TYPHOON', 2004, 2006, 'P1114', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'COLORADO -
CREW, EXTENDED,
REGULAR CABS', 2015, 2023, 'B119-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'COLORADO -
CREW, EXTENDED,
REGULAR CABS', 2015, 2023, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'COLORADO -
CREW, EXTENDED,
REGULAR CABS
(CANADA)', 2008, 2012, 'OEM#19267217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (48) Encrypted System'),
    ('Chevrolet', 'COLORADO -
CREW, EXTENDED,
REGULAR CABS
(CANADA)', 2008, 2012, 'TOY43R-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'EQUINOX W/ PROX', 2018, 2021, 'OEM# 13585723', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'EQUINOX', 2010, 2019, 'B119-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)');

-- Batch 4
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Chevrolet', 'EQUINOX', 2010, 2019, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'EXPRESS', 2015, 2023, 'B120-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'EXPRESS', 2015, 2023, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'FSR, FRR, FTR', 2006, 2007, 'P1113', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'HHR', 2006, 2011, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Chevrolet', 'HHR', 2006, 2011, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'LUMINA APV', 1991, 1995, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'LUMINA APV', 1991, 1995, 'P1098E', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'LUMINA APV', 1990, 1990, 'S1098D', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'LUMINA APV', 1990, 1990, 'P1098C', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1991, 1996, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1991, 1996, 'P1098E', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1987, 1990, 'S1098D', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1987, 1990, 'P1098C', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'ORLANDO (CANADA)', 2012, 2014, 'OEM# 13500222 or 13504199', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID12', 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Chevrolet', 'NPR, NRR, W4, W5', 1989, 2000, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'NQR', 2000, 2003, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'S-10 PICK-UP', 2000, 2004, 'P1113', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'SILVERADO - 1500
CREW, EXTENDED
CABS, SILVERADO
HYBRID, SSR', 2014, 2023, 'B119-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'SILVERADO - 1500
CREW, EXTENDED
CABS, SILVERADO
HYBRID, SSR', 2014, 2023, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'SILVERADO -
CLASSIC SS', 2007, 2014, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Chevrolet', 'SILVERADO -
CLASSIC SS', 2007, 2014, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'SILVERADO 1500/HD/
SS, 2500/HD/3500', 2004, 2007, 'P1114', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'SUBURBAN W/ PROX', 2021, 2022, 'OEM# 13541561', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'SUBURBAN W/ PROX', 2015, 2020, 'OEM# 13580802 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'SUBURBAN', 2015, 2023, 'B119-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'SUBURBAN', 2015, 2023, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'TAHOE W/ PROX', 2021, 2022, 'OEM# 13537962', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'TAHOE', 2015, 2023, 'B119-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'TAHOE', 2015, 2023, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'TAHOE', 2007, 2014, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Chevrolet', 'TAHOE', 2007, 2014, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'TAHOE, G VAN', 2000, 2006, 'P1107', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'TRACKER', 1998, 2004, 'X180', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'TRAILBLAZER W/
PROX', 2021, 2023, 'OEM# 13530711', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'TRAILBLAZER W/
REGULAR IGNITION', 2021, 2023, 'B119-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'TRAILBLAZER W/
REGULAR IGNITION', 2021, 2023, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'TRAX (CANADA)', 2013, 2021, 'B119-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Chevrolet', 'TRAX (CANADA)', 2013, 2021, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'TRAX (CANADA)', 2013, 2021, 'PT04-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chevrolet', 'VENTURE VAN', 2003, 2005, 'B97-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos Fixed Code System'),
    ('Chevrolet', 'VENTURE VAN', 2003, 2005, 'B97-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'CIRRUS', 1999, 2000, 'P1795', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'CIRRUS', 1999, 2000, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'CIRRUS', 1999, 2000, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'CONCORDE', 1998, 2004, 'P1795', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'CONCORDE', 1998, 2004, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'CONCORDE', 1998, 2004, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'CROSSFIRE', 2003, 2008, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Ordered by VIN'),
    ('Chrysler', 'LHS', 1999, 2001, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D64) Encrypted System'),
    ('Chrysler', 'LHS', 1999, 2001, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1995, 1996, 'P1794', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1995, 1996, '1794V', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'NEW YORKER', 1998, 2001, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D64) Encrypted System'),
    ('Chrysler', 'NEW YORKER', 1998, 2001, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'PACIFICA', 2017, 2022, 'OEM# 68217827', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'PROWLER', 2001, 2002, 'P1794', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'PT CRUISER', 2006, 2011, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Chrysler', 'PT CRUISER', 2006, 2011, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'SEBRING
CONVERTIBLE', 2007, 2011, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Chrysler', 'SEBRING
CONVERTIBLE', 2007, 2011, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'SEBRING COUPE', 2001, 2006, 'Y165-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D61) Encrypted System'),
    ('Chrysler', 'SEBRING COUPE', 2001, 2006, 'EK3-MIT9', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'SEBRING COUPE', 1998, 2000, 'X245', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'SEBRING COUPE', 1998, 2000, 'X213', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'SEBRING SEDAN
(4-DOOR)', 2007, 2011, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Chrysler', 'SEBRING SEDAN
(4-DOOR)', 2007, 2011, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'TOWN & COUNTRY
VAN', 2008, 2016, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Chrysler', 'TOWN & COUNTRY
VAN', 2008, 2016, 'EK3P-Y170', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'TOWN & COUNTRY
VAN', 2001, 2003, 'P1795', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Optional Texas Instruments Read/Write system'),
    ('Chrysler', 'TOWN & COUNTRY
VAN', 2001, 2003, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Chrysler', 'TOWN & COUNTRY
VAN', 2001, 2003, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Daihatsu', 'TOWN & COUNTRY
VAN', 1991, 1991, 'P1789', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Daihatsu', 'VOYAGER', 2020, 2022, 'OEM# 68217827', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Daihatsu', 'LANOS', 1998, 1999, 'DW05RAP', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Transponder is buyer option'),
    ('Daihatsu', 'LEGANZA', 2005, 2005, 'DW05AP', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Transponder is buyer option'),
    ('Daihatsu', 'NUBIRA', 2004, 2004, 'DW04RAP', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Transponder is buyer option'),
    ('Daihatsu', 'CHARADE, ROCKY', 1988, 1992, 'X174', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Daihatsu', 'DE LOREAN', 1981, 1981, 'X169', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Daihatsu', 'DE LOREAN', 1981, 1981, 'X29', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', '2 DOOR & 4 DOOR
MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1995, 1996, 'P1794', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', '2 DOOR & 4 DOOR
MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1995, 1996, '1794V', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', '2 DOOR & 4 DOOR
MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1985, 'P1770U', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', '2 DOOR & 4 DOOR
MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1985, 'S1770U', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', '3 DOOR & 5 DOOR
MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1995, 1996, 'P1794', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', '3 DOOR & 5 DOOR
MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1995, 1996, '1794V', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', '3 DOOR & 5 DOOR
MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1990, 1991, 'P1789', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'AVENGER', 2008, 2014, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'AVENGER', 2008, 2014, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'CALIBER', 2007, 2012, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'CALIBER', 2007, 2012, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'CHALLENGER', 2019, 2021, 'OEM#
68394195AA', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'CHARGER', 2019, 2022, 'OEM#
68394195AA', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'CHARGER, CHARGER
DAYTONA R/T', 2008, 2008, 'Y164-PT (LAL), or Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'CHARGER, CHARGER
DAYTONA R/T', 2008, 2008, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'COLT, COLT VISTA', 1993, 1994, 'X224', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'COLT, COLT VISTA', 1993, 1994, 'X229', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'DART', 2013, 2016, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'DART', 2013, 2016, 'EK3P-Y170', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'DART W/ PROX', 2013, 2017, 'OEM# 68051387AC or
05026676AC (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System');

-- Batch 5
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Dodge', 'INTREPID', 1998, 2004, 'P1795', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'INTREPID', 1998, 2004, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'INTREPID', 1998, 2004, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'INTREPID', 1998, 2004, '1794V', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'JOURNEY', 2009, 2015, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'JOURNEY', 2009, 2015, 'EK3P-Y170', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'MAGNUM', 2008, 2009, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'MAGNUM', 2008, 2009, 'EK3P-Y170', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'MONACO', 1990, 1992, 'X122', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'MONACO', 1990, 1992, 'X175', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'NEON, SRT', 2000, 2005, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D64) Encrypted System'),
    ('Dodge', 'NEON, SRT', 2000, 2005, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'NITRO - SLT, SXT', 2007, 2012, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'NITRO - SLT, SXT', 2007, 2012, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'SPIRIT', 1994, 1995, 'P1794', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'SPIRIT', 1994, 1995, '1794V', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'SPRINTER', 2007, 2013, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Ordered by VIN'),
    ('Dodge', 'SPRINTER', 2007, 2013, 'EK3P-HU64', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'STEALTH', 1991, 1996, 'X176', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'STEALTH', 1991, 1996, 'X213', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'STRATUS COUPE', 2002, 2005, 'Y165-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D61) Encrypted System'),
    ('Dodge', 'STRATUS COUPE', 2002, 2005, 'EK3-MIT9', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'STRATUS SEDAN', 1999, 2006, 'P1795', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'STRATUS SEDAN', 1999, 2006, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'STRATUS SEDAN', 1999, 2006, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'VIPER', 2013, 2016, 'OEM# 05035395AA or
05035188AB (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'VIPER', 1993, 1993, 'P1793', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'CARAVAN & GRAND
CARAVAN', 2008, 2020, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'CARAVAN & GRAND
CARAVAN', 2008, 2020, 'EK3P-Y170', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'DAKOTA', 2001, 2004, 'P1795', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'DAKOTA', 2001, 2004, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'DAKOTA', 2001, 2004, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D64) Encrypted System'),
    ('Dodge', 'DAKOTA CLUB/
QUAD CABS SLT, ST,
LARAMIE', 2005, 2012, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'DAKOTA CLUB/
QUAD CABS SLT, ST,
LARAMIE', 2005, 2012, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'DURANGO', 2015, 2022, 'OEM# 68066349AG', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips PCF7945A'),
    ('Dodge', 'DURANGO', 2001, 2006, 'P1795', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Optional Texas Instruments Read/Write system'),
    ('Dodge', 'DURANGO', 2001, 2006, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'DURANGO', 2001, 2006, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'PICKUP TRUCKS,
RAM & DAKOTA (U.S.
MADE)', 2006, 2008, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'PICKUP TRUCKS,
RAM & DAKOTA (U.S.
MADE)', 2006, 2008, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'PROMASTER', 2014, 2021, 'OEM# 68224014AA or
68224015AA (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'PROMASTER', 2014, 2021, 'SIP22MH', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'PROMASTER CITY', 2015, 2021, 'SIP22MH (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'RAIDER', 1987, 1990, 'X121', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM 1500/2500/3500', 2009, 2018, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'RAM 1500/2500/3500', 2009, 2018, 'EK3P-Y170', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM 1500', 2019, 2021, 'OEM# 68291689AD', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM 1500', 2002, 2005, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D64) Encrypted System'),
    ('Dodge', 'RAM 1500', 2002, 2005, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM 1500 SPORT,
TRX4,ST, LARAMIE', 2006, 2008, 'P1795', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM 1500 SPORT,
TRX4,ST, LARAMIE', 2006, 2008, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM 1500 SPORT,
TRX4,ST, LARAMIE', 2006, 2008, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM 2500', 2002, 2005, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D64) Encrypted System'),
    ('Dodge', 'RAM 2500', 2002, 2005, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM 2500 ST, SPORT,
LARAMIE, POWER
WAGON, SLT, TRX4', 2006, 2010, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'RAM 2500 ST, SPORT,
LARAMIE, POWER
WAGON, SLT, TRX4', 2006, 2010, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM 3500', 2002, 2005, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D64) Encrypted System'),
    ('Dodge', 'RAM 3500', 2002, 2005, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM 3500 SPORT,
LARAMIE, ST, SLT', 2006, 2010, '164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'RAM 3500 SPORT,
LARAMIE, ST, SLT', 2006, 2010, 'K3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM CHARGER', 1993, 1993, '1793', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM CHARGER', 1981, 1985, '1770U', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM CHARGER', 1981, 1985, '970AM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM/QUAD CAB', 2001, 2005, '1795', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'RAM/QUAD CAB,
SRT 10', 2006, 2008, '164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Dodge', 'RAM/QUAD CAB,
SRT 10', 2006, 2008, 'K3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'VANS (FULL SIZE)', 2001, 2004, '1795', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'MEDALLION SEDAN', 1988, 1989, '122', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'MEDALLION SEDAN', 1988, 1989, '147', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'MEDALLION WAGON', 1988, 1989, '171', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Dodge', 'MEDALLION WAGON', 1988, 1989, '147', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ferrari', 'PREMIER', 1988, 1992, 'X122', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ferrari', 'PREMIER', 1988, 1992, 'X175', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ferrari', 'SUMMIT', 1993, 1996, 'X224', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ferrari', 'SUMMIT', 1993, 1996, 'X229', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ferrari', 'TALON', 1996, 1998, 'X245', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ferrari', 'TALON', 1996, 1998, 'X213', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ferrari', 'VISION', 1998, 1998, 'P1794', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ferrari', 'VISION', 1998, 1998, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Ferrari', 'VISION', 1998, 1998, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ferrari', '512TR', 1992, 1995, 'X152', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ferrari', 'CALIFORNIA', 2011, 2015, 'SIP22-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Megamos (48) Encrypted System'),
    ('Ferrari', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1986, 1988, 'H61VR', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ferrari', 'TESTAROSSA', 1984, 1991, 'X152', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Fiat', '124 SPIDER', 2017, 2020, 'OEM# 68314449AA or
68458550AA', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (47) Encrypted System'),
    ('Fiat', '500', 2012, 2018, 'OEM# 68334510AA or
68269686AA (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Fiat', '500', 2012, 2018, 'SIP22MH', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Fiat', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1983, 'F91C', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Fiat', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1983, 'F91C2', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Fiat', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1983, 'F91C8', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Fiat', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1983, 'F91CR', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Fiat', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1983, 'FT37', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Fiat', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1983, 'FT38', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Fiat', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1983, 'FT6R', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Fiat', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1983, 'X109', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'CONTOUR (EXCEPT
‘98-00 V6 LX)', 1996, 1996, '1193FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'CONTOUR (EXCEPT
‘98-00 V6 LX)', 1996, 1996, '1195FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'CONTOUR (EXCEPT
‘98-00 V6 LX)', 1996, 1996, '1196CM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'CONTOUR 2.51 V6', 1997, 1998, 'EK3-H73', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Ford', 'CONTOUR 2.51 V6', 1997, 1998, 'H73-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL);

-- Batch 6
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Ford', 'CONTOUR V6 LX3', 1997, 2000, 'EK3-H73', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Ford', 'CONTOUR V6 LX3', 1997, 2000, 'H73-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'CROWN VICTORIA', 2003, 2012, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'CROWN VICTORIA', 2003, 2012, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'ECOSPORT W/ REG
IGNITION', 2018, 2023, 'H128-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'ECOSPORT W/ PROX', 2018, 2023, 'OEM# 164-R8163', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'EDGE W/ REG IGNITION', 2015, 2023, 'H128-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'EDGE W/ POWER
LIFTGATE', 2011, 2015, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Ford', 'EDGE W/O POWER
LIFTGATE', 2011, 2015, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Ford', 'EDGE W/ PROX', 2016, 2022, 'OEM# 164-R8149
OEM164-R8150
OEM#164-R8151
OEM#164-R8163 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'EDGE - SE, SEL, SEL
PLUS', 2007, 2010, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'EDGE - SE, SEL, SEL
PLUS', 2007, 2010, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'ESCAPE W/ REGULAR
IGNITION', 2020, 2022, 'H128-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'ESCAPE', 2015, 2019, 'H94-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Ford', 'ESCAPE W/ PROX', 2020, 2022, 'OEM# 164-R8163
OEM#164-R8197
OEM# 164-R8182
OEM# 164-R8198', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'ESCAPE HYBRID', 2005, 2010, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'ESCAPE HYBRID', 2005, 2010, 'H92-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'ESCORT', 1997, 2003, 'X244', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FESTIVA', 1989, 1993, 'X202', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FIESTA', 2011, 2019, 'H94-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'FIESTA', 2011, 2019, 'HU101GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FIVE HUNDRED', 2005, 2007, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'FIVE HUNDRED', 2005, 2007, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FIVE HUNDRED/
TAURUS', 2008, 2008, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'FIVE HUNDRED/
TAURUS', 2008, 2008, 'H92-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FLEX W/ PROX', 2013, 2019, 'OEM # 164-R8091 or 164-
R8092', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FLEX W/ POWER
LIFTGATE', 2011, 2018, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Ford', 'FLEX W/ POWER
LIFTGATE', 2011, 2018, 'H84-GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FLEX W/O POWER
LIFTGATE', 2011, 2018, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Ford', 'FLEX W/O POWER
LIFTGATE', 2011, 2018, 'H84-GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FLEX', 2009, 2010, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'FLEX', 2009, 2010, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FOCUS W/ PROX', 2015, 2023, 'OEM# 164-R8147', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FOCUS', 2012, 2023, 'H94-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Ford', 'FORD GT', 2005, 2006, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Ford', 'FORD GT', 2005, 2006, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FREESTYLE', 2005, 2007, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'FREESTYLE', 2005, 2007, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FUSION W/ PROX', 2017, 2020, 'OEM# 164-R8149 or 164-
R8150 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'FUSION W/ REGULAR
IGNITION', 2013, 2022, 'H128-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'FUSION', 2011, 2012, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Ford', 'FUSION', 2011, 2012, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'LTD', 1998, 2003, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Ford', 'MACH E', 2021, 2022, 'OEM# 164-R8308 or 164-
R8310', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Ford', 'MUSTANG W/ PROX', 2023, 2023, 'OEM# 164-R8324 or 164-
R8325', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'MUSTANG W/
REGULAR IGNITION', 2015, 2023, 'H128-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'MUSTANG COBRA W/
REGULAR IGNITION', 2018, 2022, 'H128-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'MUSTANG COBRA W/
PROX', 2018, 2022, 'OEM# 164-R8187', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'MUSTANG GT', 1996, 1996, 'EK3-H73', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Ford', 'MUSTANG GT', 1996, 1996, 'H73-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'PROBE', 1996, 1998, 'X221', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TAURUS W/ PROX', 2013, 2019, 'OEM# 164-R8091 or 164-
R8092 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TAURUS W/
REGULAR IGNITION', 2011, 2019, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Ford', 'TAURUS', 2000, 2011, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'TAURUS', 2000, 2011, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TAURUS LX', 1996, 1999, 'EK3-H72', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Ford', 'TAURUS LX', 1996, 1999, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TAURUS SHO & LS', 1998, 1999, 'EK3-H72', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Ford', 'TAURUS SHO & LS', 1998, 1999, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TAURUS SHO & LS', 1986, 1988, '1193MU', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TAURUS SHO & LS', 1986, 1988, 'S1186TS [-P]', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TAURUS X,
FREESTYLE', 2008, 2008, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'TAURUS X,
FREESTYLE', 2008, 2008, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TEMPO', 1987, 1994, '1184FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TEMPO', 1987, 1994, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'THUNDERBIRD', 2003, 2005, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'THUNDERBIRD', 2003, 2005, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'THUNDERBIRD (NON-
TURBO)', 1985, 1987, '1184FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'THUNDERBIRD (NON-
TURBO)', 1985, 1987, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'THUNDERBIRD
(TURBO)', 1985, 1987, '1185T-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'THUNDERBIRD
(TURBO)', 1985, 1987, 'S1185T-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'ZX2', 1991, 1996, '1191ET', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'AEROSTAR', 1997, 1997, '1196FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'AEROSTAR', 1991, 1993, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'AEROSTAR', 1991, 1993, '1184FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'BRONCO W/ REG
IGNITION', 2021, 2022, 'H128-PT (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'BRONCO W/ PROX', 2021, 2023, 'OEM# 164-R8295', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'BRONCO, BRONCO II', 1994, 1996, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'BRONCO, BRONCO II', 1994, 1996, '1193FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'BRONCO SPORT W/
REGULAR IGNITION', 2021, 2022, 'H128-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'BRONCO SPORT W/
PROX', 2021, 2022, 'OEM# 164-R8287', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2021', 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'CARGO TRUCK', 1989, 2002, '62FT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'CARGO TRUCK', 1989, 2002, 'X239', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'ECONOLINE VAN,
CLUB WAGON', 1997, 2006, '1196FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'ECONOLINE VAN,
CLUB WAGON', 1980, 1991, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'ECONOLINE VAN,
CLUB WAGON', 1980, 1991, '1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'E-SERIES', 2021, 2023, 'H128-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'EXCURSION', 2000, 2006, 'EK3-H72', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Ford', 'EXCURSION', 2000, 2006, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'EXPEDITION W/
REGULAR IGNITION', 2018, 2023, 'H128-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'EXPEDITION W/
PROX', 2018, 2022, 'OEM# 164-R8149', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'EXPEDITION', 2011, 2017, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Ford', 'EXPEDITION', 2011, 2017, 'H84-GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'EXPLORER W/
REGULAR IGNITION', 2016, 2023, 'H128-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'EXPLORER W/ PROX', 2018, 2022, 'OEM# 164-R8149', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'EXPLORER &
EXPLORER SPORT', 1996, 1998, '1196FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'F-150 HERITAGE', 2004, 2004, 'EK3-H72', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Ford', 'F-150 HERITAGE', 2004, 2004, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'F-150 W/ PROX', 2018, 2023, 'OEM# 164-R8163 or 164-
R8166 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'F-150 W/ REGULAR
IGNITION', 2015, 2023, 'H128-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA');

-- Batch 7
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Ford', 'F-150', 2011, 2014, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Ford', 'F-150, F-250 SERIES
LIGHT DUTY', 2004, 2010, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'F-150, F-250 SERIES
LIGHT DUTY', 2004, 2010, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'F-150, F-250 SERIES
LIGHT DUTY', 1997, 1998, '1196FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'F-150, F-250 SERIES
LIGHT DUTY', 1980, 1991, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'F-150, F-250 SERIES
LIGHT DUTY', 1980, 1991, '1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'F-250, 350, 450, 550
SUPER DUTY SERIES', 2017, 2023, 'H128-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'F-250, 350, 450 , 550
SUPER DUTY SERIES
W/ PROX', 2017, 2023, 'OEM# 164-R8163 or 164-
R8166 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'F-250, 350, 450
SUPER DUTY SERIES', 2011, 2016, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Ford', 'FREESTAR', 2004, 2007, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Ford', 'FREESTAR', 2004, 2007, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'LIGHTNING W/
REGULAR IGNITION', 2023, 2023, 'H128-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'LIGHTNING W/ PROX', 2023, 2023, 'OEM# 164-R8163 or 164-
R8166 (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'MAVERICK W/
REGULAR IGNITION', 2020, 2022, 'H128-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'MAVERICK W/ PROX', 2022, 2022, 'OEM# 164-R8163', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'RANGER PICKUP', 2019, 2023, 'H128-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'RANGER PICKUP', 2005, 2005, 'H75', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'RANGER PICKUP W/
PROX', 2019, 2023, 'OEM# 164-R8163 or 164-
R8182 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'SUPER DUTY SERIES', 2008, 2017, 'H87-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TRANSFER HEAVY
TRUCKS 6000, 9000,
CF7000', 2000, 2004, 'EK3-H72', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Ford', 'TRANSFER HEAVY
TRUCKS 6000, 9000,
CF7000', 2000, 2004, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TRANSFER HEAVY
TRUCKS 6000, 9000,
CF7000', 1986, 1996, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TRANSFER HEAVY
TRUCKS 6000, 9000,
CF7000', 1986, 1996, '1184FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TRANSFER HEAVY
TRUCKS CF7000', 1996, 1999, 'RV1', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Ford', 'TRANSIT', 2020, 2023, 'H128-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'TRANSIT CONNECT
W/ REG IGNITION', 2020, 2023, 'H128-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Ford', 'TRANSIT CONNECT
W/ PROX', 2019, 2023, 'OEM# 164-R8234 or 164-
R8235', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'TRANSIT CONNECT', 2014, 2019, 'H94-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Genesis', 'TRANSIT CONNECT', 2014, 2019, 'HU101GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'WINDSTAR', 2001, 2003, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted Code System'),
    ('Genesis', 'WINDSTAR', 2001, 2003, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'CENTURY CLASS', 1996, 2003, '1588', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'COLUMBIA', 2004, 2013, '1588', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'M/D', 2004, 2004, '1629-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'M/D', 2004, 2004, 'Y159-(-P)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'M/D 6/7', 2004, 2004, '1628-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'M/D 6/7', 2004, 2004, 'Y159-(-P)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1994, 2004, '1584', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'SPRINTER', 2007, 2011, 'HU64-GTK', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID4', 1, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'G70', 2019, 2020, 'OEM# 95440-G9000', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'G80', 2017, 2020, 'OEM# 95440-D2000', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'G90', 2019, 2020, 'OEM# 95440-G9000', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'GV70', 2022, 2022, 'OEM# 95440-AR000 or
95440-AR010', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Genesis', 'GV80', 2021, 2021, 'OEM# 95440-T6011 or 95440-
T6100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Geo', 'PRIZM', 1993, 1997, '5', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Geo', 'SPECTRUM', 1985, 1989, '3', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Geo', 'STORM', 1990, 1993, '4', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Geo', 'TRACKER', 1989, 1997, '0', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'ACADIA', 2007, 2017, '-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips Encrypted System'),
    ('GMC', 'ACADIA', 2007, 2017, 'P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'CANYON PICKUP', 2015, 2023, '-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('GMC', 'CANYON PICKUP', 2015, 2023, 'P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'CANYON PICKUP
(CANADA)', 2008, 2012, '# 19267217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (48) Encrypted System'),
    ('GMC', 'CANYON PICKUP
(CANADA)', 2008, 2012, '43R-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'DENALI', 2007, 2008, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips Encrypted System'),
    ('GMC', 'DENALI', 2007, 2008, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'ENVOY', 2002, 2009, 'P1113', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'FSR,FRR,FTR, W4,
W5', 1984, 2004, 'X154', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'JIMMY', 2000, 2006, 'P1113', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1991, 1994, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1991, 1994, 'P1098E', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1982, 1982, 'S1098K', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1982, 1982, 'P1098', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'NPR, NRR, W4,W5', 1989, 2004, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'NQR', 2000, 2003, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'SAFARI, SAVANA', 2000, 2007, 'P1107', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'SAVANA,
PASSENGER, CARGO', 2008, 2014, 'B111-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('GMC', 'SAVANA,
PASSENGER, CARGO', 2008, 2014, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'SAVANA', 2015, 2023, 'B120-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('GMC', 'SAVANA', 2015, 2023, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'SIERRA', 2014, 2023, 'B119-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'SIERRA', 2014, 2023, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'SIERRA, SIERRA
DENALI, YUKON', 2000, 2006, 'P1113', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'SIERRA, SONOMA,
YUKON', 1999, 1999, 'P1113', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'TERRAIN', 2010, 2023, 'B119-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'TERRAIN', 2010, 2023, 'EK3P-HU100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'TILTMASTER W4', 1988, 2011, 'X154', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'TILTMASTER W5', 1988, 2011, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'TILTMASTER W6', 1988, 2001, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'TILTMASTER W7', 2008, 2011, 'X275', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('GMC', 'TILTMASTER NQR', 2000, 2011, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'ACCORD W/ PROX', 2018, 2022, 'OEM# 72147-TVA-A11', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'ACCORD W/ PROX', 2013, 2015, 'OEM# 72147-T2A-A11 or
72147-T2A-A21', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'ACCORD W/
REGULAR IGNITION', 2013, 2019, 'HO05-PT(G) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (49-1C) Encrypted System'),
    ('Honda', 'ACCORD SEDAN,
COUPE', 2003, 2012, 'HO03-PT(V) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Honda', 'ACCORD SEDAN,
COUPE', 2003, 2012, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'ACCORD STATION
WAGON, LX, EX', 1991, 1997, 'X214', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'ACCORD STATION
WAGON, LX, EX', 1991, 1997, 'X215', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CIVIC', 2001, 2002, 'HD106-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13) Fixed Code System'),
    ('Honda', 'CIVIC', 2001, 2002, 'HD106-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CIVIC', 2001, 2002, 'HD107-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CIVIC', 2001, 2002, 'HD107-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CIVIC', 1994, 2000, 'X214', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CIVIC', 1994, 2000, 'X215', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CIVIC / HYBRID W/
REGULAR IGNITION', 2014, 2021, 'HO05-PT(G) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (49-1C) Encrypted System'),
    ('Honda', 'CIVIC / HYBRID W/
REGULAR IGNITION', 2014, 2021, 'HO03-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CIVIC / HYBRID W/
PROX', 2022, 2022, 'OEM# 72147-TLA-A02', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CIVIC / HYBRID', 2006, 2013, 'HO03-PT(V) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Honda', 'CIVIC / HYBRID', 2006, 2013, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CIVIC / HYBRID', 2003, 2005, 'HO01-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13) Fixed Code System');

-- Batch 8
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Honda', 'CIVIC / HYBRID', 2003, 2005, 'HO01T5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CIVIC / HYBRID', 2003, 2005, 'HOV01T5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CROSSTOUR W/
PROX', 2013, 2016, 'OEM# 72147-TP6-A61 or
72147-TP6-A71', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CROSSTOUR W/
REGULAR IGNITION', 2013, 2016, 'HO05-PT(G) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (49-1C) Encrypted System'),
    ('Honda', 'CROSSTOUR W/
REGULAR IGNITION', 2013, 2016, 'HO03-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CROSSTOUR', 2010, 2012, 'HO03-PT(V) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Honda', 'CROSSTOUR', 2010, 2012, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CR-V W/ PROX', 2021, 2022, 'OEM# 72147-TLA-A02', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2021', 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CR-V', 2014, 2022, 'HO05-PT(G) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (49-1C) Encrypted System'),
    ('Honda', 'CR-V', 2014, 2022, 'HO03-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CRX', 1988, 1991, 'X182', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'CR-Z', 2011, 2014, 'HO03-PT(V) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Honda', 'CR-Z', 2011, 2014, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'DEL SOL', 1993, 1997, 'X214', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'ELEMENT', 2006, 2011, 'HO03-PT(V) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Honda', 'ELEMENT', 2006, 2011, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'FIT W/ PROX', 2015, 2019, 'OEM# 72147-T5A-A01 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'FIT W/ REGULAR
IGNITION', 2015, 2021, 'HO05-PT(G) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (49-1C) Encrypted System'),
    ('Honda', 'FIT W/ REGULAR
IGNITION', 2015, 2021, 'HO03-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'FIT', 2009, 2014, 'HO03-PT(V) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Honda', 'FIT', 2009, 2014, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'HR-V W/ PROX', 2016, 2022, 'OEM# 72147-T7S-A01 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (47) Encrypted System'),
    ('Honda', 'HR-V W/ REGULAR
IGNITION', 2016, 2022, 'HO05-PT(G) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (49-1C) Encrypted System'),
    ('Honda', 'HR-V W/ REGULAR
IGNITION', 2016, 2022, 'HO03-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'INSIGHT', 2019, 2022, 'OEM# 72147-TXM-A01 or
72147-TWA-A11', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'INSIGHT', 2000, 2004, 'HD106-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13) Fixed Code System'),
    ('Honda', 'INSIGHT', 2000, 2004, 'HD106-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'INSIGHT HYBRID', 2005, 2006, 'HD106-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13) Fixed Code System'),
    ('Honda', 'INSIGHT HYBRID', 2005, 2006, 'HD106-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'ODYSSEY W/ PROX', 2021, 2023, 'OEM# 72147-THR-A41', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'ODYSSEY', 2005, 2016, 'HO03-PT(V) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Honda', 'PASSPORT W/ PROX', 2020, 2023, 'OEM# 72147-TG7-AA1', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2020', 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'PASSPORT W/
REGULAR IGNITION', 2019, 2020, 'HO05-PT(G)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (49-1C) Encrypted System'),
    ('Honda', 'PASSPORT W/
REGULAR IGNITION', 2019, 2020, 'HO03-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'PASSPORT', 1998, 2002, 'X214', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'PILOT W/ PROX', 2021, 2021, 'OEM#72147-TG7-AA1', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'PILOT W/ PROX', 2016, 2018, 'OEM# 72147-TG7-A01', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Honda', 'PILOT', 2006, 2015, 'HO03-PT(V) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Honda', 'PILOT', 2006, 2015, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'PILOT', 2003, 2005, 'HO01T5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Megamos (13) Fixed Code System'),
    ('Honda', 'PILOT', 2003, 2005, 'HOV01T5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'PRELUDE', 1997, 2002, 'HD106-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13) Fixed Code System'),
    ('Honda', 'PRELUDE', 1997, 2002, 'HD106-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'PRELUDE', 1997, 2002, 'HD107-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'PRELUDE', 1997, 2002, 'HD107-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'RIDGELINE W/ PROX', 2020, 2023, 'OEM# 72147-T6Z-A51 or
72147-T6Z-A61', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2021', 0, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'RIDGELINE', 2006, 2014, 'HO03-PT(V) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Honda', 'RIDGELINE', 2006, 2014, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'S2000', 2008, 2009, 'HO03-PT(V)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Honda', 'S2000', 2008, 2009, 'EK3P-HO03', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'S2000', 2004, 2005, 'HO01-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13) Fixed Code System'),
    ('Honda', 'S2000', 2004, 2005, 'HO01T5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Honda', 'S2000', 2004, 2005, 'HOV01T5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'H2', 2008, 2009, 'B111-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Hummer', 'H2', 2008, 2009, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'H3 (TRANSPONDER
OPTIONAL)', 2006, 2009, 'P1113', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System (Optional)'),
    ('Hummer', 'H3', 2003, 2005, 'P1113', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'ACCENT (CANADA)', 2017, 2017, 'HY18-GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'AZERA W/ PROX', 2015, 2016, 'OEM# 95440-3V022', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Hummer', 'AZERA (REPLACES
THE ‘05 XG350)', 2006, 2011, 'HY20-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Hummer', 'AZERA (REPLACES
THE ‘05 XG350)', 2006, 2011, 'EK3P-HY20', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'ELANTRA', 2017, 2022, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'ELANTRA (CANADA)', 2017, 2019, 'HYN14R-GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'ELANTRA TOURING', 2009, 2012, 'KK10-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Hummer', 'ELANTRA TOURING
(CANADA)', 2009, 2012, 'HY20-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Hummer', 'ELANTRA TOURING
(CANADA)', 2009, 2012, 'EK3P-HY20', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'ELANTRA GT W/
PROX', 2018, 2020, 'OEM# 95440-D2000', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'ELANTRA GT', 2013, 2017, 'HY18-P (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Hummer', 'ELANTRA
GT(CANADA)', 2013, 2017, 'EB3-F-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'ELANTRA W/ PROX', 2021, 2023, 'OEM# 95440-AA000', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'ENTOURAGE', 2007, 2008, 'HY15-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'ENTOURAGE
(CANADA)', 2007, 2009, 'HYN14RT14', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Hummer', 'ENTOURAGE
(CANADA)', 2007, 2009, 'HYN14RMH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'EQUUS', 2014, 2016, 'OEM# 95440-3N470 or 95443-
3N100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'EXCEL', 1990, 1994, 'X196', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'GENESIS COUPE W/
PROX', 2010, 2015, 'OEM# 95440-2M300, 2M351
or 2M420', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID10', 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Hummer', 'GENESIS COUPE
W/O PROX', 2010, 2016, 'HYN14RT14', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Hummer', 'GENESIS COUPE
W/O PROX', 2010, 2016, 'HYN14RMH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'GENESIS W/ PROX
(4 DR.)', 2015, 2015, 'OEM# 95440-B1200-BLH', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'GENESIS W/O PROX
(4 DR.)', 2009, 2010, 'EK3P-HY20', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Hummer', 'IONIQ', 2020, 2022, 'OEM# 95440-G2500', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2021', 0, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'KONA W/ REGULAR
KEY', 2018, 2022, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hummer', 'KONA W/ PROX', 2022, 2022, 'OEM# 95440-J9450', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'NEXO (CANADA)', 2019, 2020, 'OEM# 95440-M5300', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'PALISADE W/ PROX', 2023, 2023, 'OEM# 95440-S8550 or 95440-
S8600', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'PALISADE W/
REGULAR IGNITION', 2020, 2021, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'PONY', 1985, 1987, 'X121', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'SANTA CRUZ', 2023, 2023, 'OEM# 95440-K5002 or 95440-
K5012', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'SANTE FE', 2020, 2021, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'SANTE FE (CANADA)', 2007, 2010, 'HYN14RT14', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Hyundai', 'SANTE FE (CANADA)', 2007, 2010, 'HYN14RMH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'SANTA FE W/ PROX', 2023, 2023, 'OEM# 95440-S1660 or 95440-
S1670', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'SANTA FE SPORT', 2013, 2019, 'HY18R-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'SANTA FE SPORT W/
PROX', 2013, 2018, 'OEM# 95440-4Z200', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'SANTA FE
SPORT(CANADA)', 2013, 2019, 'HY18R-GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'SCOUPE', 1991, 1994, 'X196', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'SONATA', 2006, 2010, 'HY15-P (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'SONATA (CANADA)', 2011, 2018, 'HY20-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Hyundai', 'SONATA (CANADA)', 2011, 2018, 'EK3P-HY20', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'SONATA W/ PROX', 2021, 2022, 'OEM# 95440-L1010', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL);

-- Batch 9
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Hyundai', 'SONATA W/
REGULAR KEY', 2020, 2022, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'SONATA HYBRID W/
PROX', 2016, 2018, 'OEM# 95440-C1001', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'TIBURON', 2002, 2009, 'X236', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID022', 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'TIBURON (CANADA)', 2001, 2010, 'HYN6MH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Hyundai', 'TUCSON', 2021, 2022, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Hyundai', 'TUCSON W/ PROX', 2023, 2023, 'OEM# 95440-N9072 or 95440-
N9082', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'TUCSON W/ PROX', 2016, 2018, 'OEM# 95440-D3100', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'TUCSON (CANADA)', 2016, 2019, 'EB3-G-TOY40', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'VELOSTER W/ PROX', 2019, 2022, 'OEM# 95440-K9000', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2020', 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'VELOSTER', 2018, 2020, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'VELOSTER(CANADA)', 2015, 2016, 'HY18-GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'VENUE W/ PROX', 2023, 2023, 'OEM# 95440-K2410', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'VERACRUZ W/ PROX
SYSTEM', 2008, 2012, 'OEM# 95440-3J600', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Encrypted System'),
    ('Infiniti', 'VERACRUZ W/
REGULAR IGNITION', 2007, 2012, 'HY15-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Cut Depths: 5 = deepest, 1 = shallowest'),
    ('Infiniti', 'VERACRUZ (CANADA)', 2007, 2010, 'HYN6MH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'XG300', 2001, 2003, 'X232', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID021', 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'EX37', 2013, 2013, 'OEM# 285E3-1BA2A or
285E3-1BA5A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'FX35/FX45 W/
REGULAR IGNITION', 2003, 2008, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'FX35/FX45 W/
REGULAR IGNITION', 2003, 2008, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'FX35/FX45 W/ TWIST
KNOB IGNITION', 2003, 2008, 'Dealer Prox FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Optional'),
    ('Infiniti', 'FX35/FX50', 2009, 2013, 'OEM# 285E3-1BA2A or
285E3-1BA5A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'FX50', 2009, 2013, 'OEM# 285E3-1BA2A or
285E3-1BA5A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Infiniti', 'G20', 2000, 2002, 'NI01T or NI02T', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D60) Encrypted System'),
    ('Infiniti', 'G20', 2000, 2002, 'EK3-NI02', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'G25', 2011, 2012, 'OEM# 285E3-JK62A or
285E3-JK65A (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'G35', 2003, 2004, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'G35', 2003, 2004, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'G35 W/ PUSH
BUTTON START', 2007, 2008, 'Dealer Prox FOB (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'G35 W/ REGULAR
IGNITION', 2005, 2008, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'G35 W/ REGULAR
IGNITION', 2005, 2008, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'G35 W/ TWIST KNOB
IGNITION', 2005, 2008, 'Dealer Prox FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Optional'),
    ('Infiniti', 'G37 COUPE', 2008, 2013, 'OEM# 285E3-JK65A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'G37 SEDAN', 2009, 2014, 'OEM# 285E3-JK62A or
285E3-JK65A (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'I30, I35', 2000, 2004, 'NI01T or NI02T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D60) Encrypted System'),
    ('Infiniti', 'I30, I35', 2000, 2004, 'EK3-NI02', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'I30, I35', 1996, 1996, 'X210', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'IPL G COUPE', 2011, 2012, 'Dealer Prox FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'J30', 1997, 1997, 'X243', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'JX35', 2013, 2015, 'OEM# 285E3-3JA5A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'M30', 1990, 1992, 'X210', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'M35', 2006, 2010, 'OEM# 285E3-EH11A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2006', 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'M37', 2011, 2013, 'OEM# 285E3-1MP0D', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'M45', 2006, 2010, 'OEM# 285E3-EH11A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2006', 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'M56', 2011, 2013, 'OEM# 285E3-EH11A or
285E3-1MP0D', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'Q40', 2015, 2015, 'OEM# 285E3-JK65A (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'Q45', 2002, 2005, 'NI04T', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Infiniti', 'Q45', 2002, 2005, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Infiniti', 'Q50', 2020, 2022, 'OEM# 285E3-6HE1A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'Q60', 2020, 2022, 'OEM# 285E3-6HE1A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'Q70', 2014, 2019, 'OEM# 285E3-1MP0D', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Isuzu', 'Q70L', 2017, 2018, 'OEM# 285E3-1MP0D', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Isuzu', 'QX4', 1999, 2003, 'EK3-NI02', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D60) Encrypted System'),
    ('Isuzu', 'QX30', 2017, 2018, 'OEM# 285E3-5DM1B', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'QX50', 2019, 2022, 'OEM# 285E3-5NA2A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'QX55', 2022, 2022, 'OEM# 285E3-5NY7A', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'QX56', 2008, 2013, 'OEM# 285E3-ZQ30B or
285E3-1LL0D', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Isuzu', 'QX60', 2020, 2021, 'OEM# 285E3-6E1A or 285E3-
6HE6A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2020', 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'QX70', 2014, 2018, 'OEM# 285E3-1CA5A or
285E3-1CA7A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Isuzu', 'QX80', 2014, 2022, 'OEM# 285E3-1LA5A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46)Transponder key'),
    ('Isuzu', 'CV4500/5500/6500', 2019, 2022, 'B119-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'AMIGO VIN #4S1', 1990, 1993, 'X198', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'AMIGO VIN #JAA', 1988, 1993, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'ASCENDER', 2003, 2006, 'P1113', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'AXIOM', 2003, 2004, 'OEM # 8-97319-522-0', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'AXIOM', 2003, 2004, 'HD106-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'FTR DIESEL TRUCK,
TILTMASTER, I MARK', 1985, 1990, 'X143', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'HOMBRE PICK UP', 2000, 2001, 'P1113', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'i-280 EXT. CAB
(REBADGED
CANYON/COLORADO
PICKUP)', 2006, 2007, 'P1114', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'i-290 - S, LS', 2007, 2007, 'P1114', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'i-350 EXT. CAB
(REBADGED
CANYON/COLORADO
PICKUP)', 2006, 2007, 'P1114', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'IMPULSE', 1990, 1993, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'NPR', 2008, 2014, 'X275', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'NPR, NRR, NQR,
DIESEL TRUCK, FSR', 1989, 2004, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'OASIS', 1996, 2001, 'X250', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'OASIS', 1996, 2001, 'X215', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'PICKUP -P’UP', 1985, 1987, 'X121', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'PICKUP -P’UP VIN
#4S1', 1990, 1995, 'X198', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'PICKUP -P’UP VIN
#JAA', 1988, 1995, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'RODEO', 2003, 2004, 'OEM # 8-97319-522-0', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'RODEO', 2003, 2004, 'HD106-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'RODEO', 1991, 1994, 'X198', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'RODEO SPORT', 2001, 2003, 'X250', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'STYLUS', 1990, 1993, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'TROOPER, TROOPER
II', 1991, 2003, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Isuzu', 'VEHICROSS', 2000, 2002, 'X184', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jaguar', 'ALL', 1983, 1988, 'FT37', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jaguar', 'ALL', 1983, 1988, 'FT38', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jaguar', 'ALL', 1983, 1988, 'X155', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jaguar', 'XF', 2008, 2014, 'OEM # C2P-17155', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jaguar', 'XJ', 2010, 2014, 'OEM # C2P-17155', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jaguar', 'XJ, XK , XK8, XKR', 2000, 2008, 'OEM # XR8-1611', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments Encrypted
System'),
    ('Jaguar', 'XJ6, XJ12,
SOVERIEGN, VANDEN
PLAS, XJR', 1992, 1996, 'S32FJ-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Jeep', 'XJ6, XJ12,
SOVERIEGN, VANDEN
PLAS, XJR', 1986, 1989, 'X86', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'XJ6, XJ12,
SOVERIEGN, VANDEN
PLAS, XJR', 1986, 1989, 'FT6R', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'XJ8, XJR, VANDEN
PLAS', 2004, 2009, 'FO21T7 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Tibbe Key. Texas Instruments (4D60) Encrypted System'),
    ('Jeep', 'XJ8, XJR, VANDEN
PLAS', 2004, 2009, 'FO21MH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'XJ8, XJR', 2000, 2003, 'OEM # HJD-7230AA1', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos Fixed Code System'),
    ('Jeep', 'XK8, XKR', 2007, 2014, 'OEM # C2P-17152', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'X-TYPE', 2002, 2008, 'FO21T7 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Tibbe Key. Texas Instruments (4D60) Encrypted System'),
    ('Jeep', 'X-TYPE', 2002, 2008, 'FO21MH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL);

-- Batch 10
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Jeep', 'CHEROKEE W/ FOBIK', 2014, 2022, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'HI-TAG (AES)PCF7938'),
    ('Jeep', 'CHEROKEE', 2014, 2022, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Jeep', 'CHEROKEE', 2014, 2022, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'CHEROKEE', 1992, 1992, 'P1789', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'CHEROKEE', 1992, 1992, 'P1793', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'CHEROKEE W/ PROX', 2014, 2022, 'OEM# 68105087', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'COMMANDER', 2008, 2010, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Jeep', 'COMMANDER', 2008, 2010, 'EK3P-Y170', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'COMPASS', 2007, 2019, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Jeep', 'COMPASS', 2007, 2019, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'COMPASS W/ PROX', 2017, 2021, 'OEM# 68250335AB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'GLADIATOR', 2019, 2022, 'OEM# 68416784AA (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'GRAND CHEROKEE
W/ PROX', 2014, 2022, 'OEM# 68143502AC', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Jeep', 'GRAND CHEROKEE', 2009, 2013, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Jeep', 'GRAND CHEROKEE', 2009, 2013, 'EK3P-Y170', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'GRAND CHEROKEE', 1992, 1992, 'P1789', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'GRAND CHEROKEE', 1992, 1992, 'P1793', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'GRAND WAGONEER', 1986, 1991, 'S1970AM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'GRAND WAGONEER', 1986, 1991, 'P1098J', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'GRAND WAGONEER', 1981, 1984, 'S1970AM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'GRAND WAGONEER', 1981, 1984, '1970AM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'LIBERTY', 2005, 2013, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Jeep', 'LIBERTY', 2005, 2013, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'PATRIOT', 2007, 2017, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Jeep', 'PATRIOT', 2007, 2017, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'RENEGADE', 2015, 2021, 'OEM# 5YK41LXHAA or
5ZD44LXHAA', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos Encrypted (48) System (128 Bit)'),
    ('Jeep', 'WRANGLER', 2018, 2022, 'OEM# 68416782AA or
68416784AA (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'ALL US MODELS', 1994, 2004, 'K1994', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'ALL US MODELS', 1978, 1993, '1098DB', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'MIDRANGER', 1988, 1990, 'X53', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Jeep', 'MIDRANGER', 1988, 1990, 'X170', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'AMANTI', 2007, 2009, 'EK3P-KK9', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Kia', 'BORREGO W/ PROX', 2009, 2011, 'OEM# 95460-2J750', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Kia', 'BORREGO W/
REGULAR IGNITION', 2009, 2011, 'HY20-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Kia', 'BORREGO W/
REGULAR IGNITION', 2009, 2011, 'EK3P-HY20', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'CADENZA W/ PROX', 2022, 2022, 'OEM# 95440-F6000', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Kia', 'CARNIVAL', 2021, 2022, 'OEM# 95440-R0410 or 95440-
R0420', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'FORTE (CANADA)', 2019, 2019, 'OEM# 95440-M7000', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'FORTE W/ PROX', 2019, 2023, 'OEM# 95430-M6000', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'FORTE', 2019, 2021, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'FORTE KOUP', 2010, 2013, 'KK8-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'K5 W/ PROX', 2022, 2023, 'OEM# 95440-L3430', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'K5 W/ PROX', 2021, 2022, 'OEM# 95440-L3020', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'K5 W/ REGULAR
IGNITION', 2021, 2022, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'K900', 2018, 2020, 'OEM# 95440-J6000', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'K900 (CANADA)', 2019, 2021, 'OEM# 95440-J6000', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'MAGENTIS (CANADA)', 2009, 2011, 'HY20-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Philips (46) Encrypted System'),
    ('Kia', 'MAGENTIS (CANADA)', 2009, 2011, 'EK3P-HY20', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'NIRO', 2023, 2023, 'OEM# 95440-AT110', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'OPTIMA W/ PROX', 2016, 2020, 'OEM# 95440-D4000 or 95440-
D5000 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'OPTIMA W/ REGULAR
IGNITION', 2017, 2020, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'OPTIMA', 2007, 2009, 'HY15-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'OPTIMA (CANADA)', 2001, 2006, 'KIA3RMH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Kia', 'RIO W/ PROX', 2023, 2023, 'OEM# 95440-H9150', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'RIO', 2018, 2021, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'RIO (CANADA)', 2012, 2015, 'OEM# 81966-1W000', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Texas Instruments (4D60) 80 Bit
System'),
    ('Kia', 'RONDO', 2011, 2011, 'KK10-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Kia', 'RONDO', 2007, 2010, 'HY17-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Cut Depths: 5 = deepest, 1 = shallowest'),
    ('Kia', 'RONDO (CANADA)', 2014, 2014, 'EB3-G-TOY40', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'SEDONA EX
W/ OPTIONAL
TRANSPONDER', 2012, 2012, 'HYN14RT14', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Kia', 'SEDONA', 2015, 2021, 'KK10-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Kia', 'SEDONA W/ PROX', 2015, 2021, 'OEM# 95440-A9300', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'SEDONA (CANADA)', 2006, 2009, 'HYN14RMH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Kia', 'SELTOS W/ REGULAR
IGNITION', 2021, 2023, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'SELTOS W/ PROX', 2021, 2021, 'OEM# 95430-Q5000 or 95440-
Q5000', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'SEPHIA (CANADA)', 2004, 2004, 'KIA3RMH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Kia', 'SEPHIA', 1998, 2002, 'X253', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'SORENTO W/ PROX', 2021, 2022, 'OEM# 95440-R5000 or 95440-
P2000', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'SORENTO', 2021, 2023, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Kia', 'SORENTO (CANADA)', 2016, 2018, 'HY18R-GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D60) 80 Bit System'),
    ('Kia', 'SORENTO SUV', 2003, 2008, 'X232', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'SOUL W/ PROX', 2023, 2023, 'OEM# 95440-K0320', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'SOUL W/ REGULAR
IGNITION', 2020, 2022, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Kia', 'SOUL (CANADA)', 2014, 2019, 'EB3-F-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D60) 80 Bit System'),
    ('Kia', 'SPECTRA', 2005, 2009, 'X236', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'SPORTAGE W/ PROX', 2021, 2022, 'OEM# 95440-D9600', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'SPORTAGE', 2021, 2022, 'KK12-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'SPORTAGE (CANADA)', 2017, 2019, 'EB3-F-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D60) 80 Bit System'),
    ('Lamborghini', 'SPORTAGE CONV.', 2001, 2006, 'X253', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'SPORTAGE W/AUTO.
TRANSMISSION', 2001, 2002, 'X267', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'SPORTAGE
W/MANUAL
TRANSMISSION', 2001, 2002, 'X253', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'STINGER', 2022, 2023, 'OEM# 95440-J5500 or 95440-
J5501', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'TELLURIDE', 2023, 2023, 'OEM# 95440-S9540', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'CONTACH', 1988, 1989, 'F91C', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'CONTACH', 1988, 1989, 'F91C2', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'CONTACH', 1988, 1989, 'F91C8', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'CONTACH', 1988, 1989, 'F91CR', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'CONTACH', 1988, 1989, 'X152', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'CONTACH', 1980, 1987, 'F91C', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'CONTACH', 1980, 1987, 'F91C2', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'CONTACH', 1980, 1987, 'F91C8', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'CONTACH', 1980, 1987, 'FT37', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'CONTACH', 1980, 1987, 'FT38', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lamborghini', 'CONTACH', 1980, 1987, 'X109', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Land Rover', 'DISCOVERY', 1994, 2004, 'X239', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Land Rover', 'EVOQUE', 2012, 2014, 'Dealer Key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Ordered by VIN'),
    ('Land Rover', 'FREELANDER', 2002, 2006, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Ordered by VIN'),
    ('Land Rover', 'LR2', 2005, 2009, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto Transponder, High Security Key, Ordered
by VIN'),
    ('Land Rover', 'LR3', 2005, 2009, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto Transponder, High Security Key, Ordered
by VIN'),
    ('Land Rover', 'LR3', 2005, 2009, 'HU101MH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL);

-- Batch 11
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Land Rover', 'LR4', 2010, 2014, 'Dealer Key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Ordered by VIN'),
    ('Land Rover', 'RANGE ROVER', 2003, 2009, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto Transponder, High Security Key, Ordered
by VIN'),
    ('Land Rover', 'RANGE ROVER
SPORT', 2010, 2014, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Ordered by VIN'),
    ('Lexus', 'ES250', 2021, 2022, 'OEM# 8990H-06020', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'ES250', 1990, 1993, 'LXP90-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'ES300H', 2019, 2021, 'OEM# 8990H-06010', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'ES300', 2002, 2003, 'TOY48BT4 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments (4C) System'),
    ('Lexus', 'ES300', 2002, 2003, 'EK3-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'ES300', 1998, 2001, 'TOY40BT4 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments (4C) System'),
    ('Lexus', 'ES300', 1998, 2001, 'EK3-TOY40', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'ES330', 2004, 2006, 'EK3-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments fixed code system'),
    ('Lexus', 'ES330', 2004, 2006, 'TOY50-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID04', 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'ES350', 2018, 2023, 'OEM# 8990H-06010', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'GS300, GS400', 2006, 2008, 'Dealer Prox FOB (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments fixed code system'),
    ('Lexus', 'GS350', 2018, 2020, 'OEM# 89904-06170 or 89904-
30A31', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'GS430', 2006, 2008, 'OEM# 89904-30270 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key.'),
    ('Lexus', 'GS450H', 2013, 2017, 'OEM# 89904-30A91 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'GX460', 2019, 2022, 'OEM# 89904-60U80', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'GS470', 2002, 2007, 'EK3-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments Fixed Code
System'),
    ('Lexus', 'GX470', 2003, 2010, 'TOY50-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2004', 0, NULL, 0, 'ilco_2023', 'High Security Key, Texas Instruments (4D68) Encrypted
System'),
    ('Lexus', 'HS250H', 2010, 2013, 'OEM# 89904-75030 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'IS250, IS250C, IS350,
IS350C', 2013, 2017, 'OEM# 89904-53650 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'IS250, IS350', 2006, 2008, 'OEM# 89904-30270 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'IS300, IS350', 2021, 2022, 'OEM# 89904-53E70 or 89904-
24340', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'IS300', 2017, 2019, 'OEM# 89904-53650 or 89904-
53651 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'ISF', 2013, 2015, 'OEM# 89904-53650', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'LS 600H L', 2010, 2013, 'OEM# 89904-50D40', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'LS400, LS430', 2001, 2006, 'EK3-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments Fixed Code
System'),
    ('Lexus', 'LS400, LS430', 2001, 2006, 'TOY50-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID04', 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'LS400, LS430', 1997, 1997, 'TOY40BT4', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments (4C) System'),
    ('Lexus', 'LS400, LS430', 1997, 1997, 'EK3-TOY40', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'LS460', 2013, 2017, 'OEM# 89904-50K80 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'LS500', 2019, 2022, 'OEM# 8990H-06010', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'LX450', 1998, 1998, 'TOY40BT4', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments (4C) System'),
    ('Lexus', 'LX450', 1998, 1998, 'EK3-TOY40', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'LX460', 2007, 2008, 'Dealer Key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'LX470', 2003, 2008, 'EK3-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments Fixed Code
System'),
    ('Lexus', 'LX470', 2003, 2008, 'TOY50-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'LX570', 2020, 2021, 'OEM#89904-48V80', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'NX200T', 2015, 2020, 'OEM# 89904-78460 or 89904-
78470', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key Texas Instruments 128 bit (4D 74)
System'),
    ('Lexus', 'NX300', 2016, 2021, 'OEM# 89904-78470', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'NX300H', 2020, 2021, 'OEM#89904-48V80', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'RC-F', 2020, 2022, 'OEM# 89904-53E70 or 89904-
24340', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'RC300, RC350', 2021, 2021, 'OEM# 89904-53E70 or 89904-
24340', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'RX300', 1997, 2003, 'TOY48BT4 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments (4C) System'),
    ('Lexus', 'RX300', 1997, 2003, 'EK3-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'RX330', 2004, 2009, 'TOY50-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID04', 0, NULL, 0, 'ilco_2023', 'High Security Key, Texas Instruments (4D68) Encrypted
System'),
    ('Lexus', 'RX330', 2004, 2009, 'EK3-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'RX350', 2004, 2011, 'TOY50-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Texas Instruments (4D68) Encrypted
System'),
    ('Lexus', 'RX350', 2004, 2011, 'EK3-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments Fixed Code
System'),
    ('Lexus', 'RX350 W/ PROX', 2020, 2021, 'OEM#89904-48V80', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'RX400H', 2010, 2010, 'Dealer Prox FOB (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Lexus', 'RX450H', 2016, 2020, 'OEM# 89904-0E160 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Texas Instruments 128 Bit Encrypted
System'),
    ('Lexus', 'RX450L W/ PROX', 2020, 2022, 'OEM#89904-48V80', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'SC300, SC400', 2002, 2006, 'Dealer Key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2004', 0, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments fixed code system'),
    ('Lexus', 'SC300, SC400', 2002, 2006, 'EK3-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Lexus', 'SC300, SC400, SC430', 1998, 2001, 'TOY40BT4 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Texas Instruments (4C) System'),
    ('Lexus', 'SC300, SC400, SC430', 1998, 2001, 'EK3-TOY40', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'SC430', 2002, 2011, 'TOY50-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Texas Instruments (4D68) Encrypted
System'),
    ('Lincoln', 'SC430', 2002, 2011, 'EK3-TOY48', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'UX200', 2019, 2021, 'OEM# 8990H-76010', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'UX250H', 2019, 2022, 'OEM# 8990H-76010', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'BLACKWOOD', 2002, 2002, 'EK3-H72', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) System'),
    ('Lincoln', 'BLACKWOOD', 2002, 2002, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'CONTINENTAL W/
REGULAR IGNITION', 2017, 2020, 'H128-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Lincoln', 'CONTINENTAL W/
PROX', 2020, 2023, 'OEM# 164-R8275 or 164-
R8276', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'CONTINENTAL', 1998, 2002, 'EK3-H72', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) System'),
    ('Lincoln', 'CONTINENTAL', 1998, 2002, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'CORSAIR W/
REGULAR IGNITION', 2020, 2020, 'H128-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Lincoln', 'CORSAIR W/ PROX', 2020, 2022, 'OEM# 164-R8278 or 164-
R8279', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'LS6, LS8', 2003, 2006, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'MARK LT (TRUCK)', 2011, 2014, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments 80 Bit Encrypted System'),
    ('Lincoln', 'MARK SERIES', 1997, 1998, 'OEM # 164-R0467', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Motorola Inpala Fixed Code system'),
    ('Lincoln', 'MKC', 2017, 2023, 'OEM# 164-R8154, 164-
R8155, 164-R8156, 164-
R8226', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'MKS', 2013, 2016, 'OEM# 164-R8094 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'MKT', 2013, 2020, 'OEM# 164-R8094 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'MKX W/ PROX', 2016, 2019, 'OEM# 164-R8106', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'MKX', 2007, 2011, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Lincoln', 'MKX W/ POWER
LIFTGATE', 2012, 2013, 'H84-GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Lincoln', 'MKX W/O POWER
LIFTGATE', 2012, 2013, 'H84-GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Lincoln', 'MKZ W/ PROX', 2017, 2020, 'OEM# 164-R8154', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Lincoln', 'MKZ', 2018, 2020, 'H128-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Lincoln', 'NAUTILUS W/ PROX', 2022, 2023, 'OEM# 164-R8321', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'NAUTILUS W/
REGULAR IGNITION', 2019, 2021, 'H128-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Lincoln', 'NAVIGATOR W/ PROX', 2022, 2023, 'OEM# 164-R8321', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Lincoln', 'NAVIGATOR W/
REGULAR IGNITION', 2018, 2021, 'H128-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Lincoln', 'NAVIGATOR', 2018, 2019, 'OEM# 164-R8226', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) PCF7939PA'),
    ('Lincoln', 'TOWN CAR', 2003, 2012, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Maserati', 'TOWN CAR', 1985, 1992, '1190LN', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Maserati', 'TOWN CAR', 1985, 1992, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Maserati', 'ZEPHYR (SISTER
MODEL TO FORD
FUSION)', 2006, 2009, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Maserati', 'ZEPHYR (SISTER
MODEL TO FORD
FUSION)', 2006, 2009, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Maserati', 'MIDLINER', 1989, 1989, 'R62UC', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Maserati', 'MIDLINER', 1989, 1989, 'DAV10', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Maserati', 'US DESIGNED', 1987, 2004, '1098M', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Maserati', 'ALL', 1989, 1990, 'R62UC', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Maserati', 'GHIBLI', 2014, 2022, 'OEM# A2-C739-349 or 350 or
351-0-00', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips PCF7945A'),
    ('Maserati', 'LEVANTE', 2017, 2022, 'OEM# A2-C739-349 or 350 or
351-0-00', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips PCF7945A'),
    ('Maserati', 'QUATTROPORTE', 2014, 2020, 'OEM# A2-C739-349 or 350 or
351-0-00', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', '626ES, LX - 4CYL.,
626 STD., 626, MX6', 1998, 2000, 'X249', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL);

-- Batch 12
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Mazda', '929', 1992, 1995, 'X201', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', '929', 1992, 1995, 'X200', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'CX-3', 2021, 2021, 'OEM# TAYA-67-5DYB', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'CX-5', 2013, 2014, 'MAZ24R-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mazda', 'CX-5', 2013, 2014, 'EK3-MAZ24', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'CX-5 W/ PROX', 2019, 2022, 'OEM# TAYA-67-5DY', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'CX-7', 2007, 2014, 'EK3-MAZ24', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mazda', 'CX-7', 2007, 2014, 'MAZ24R-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'CX-7 W/ PROX', 2010, 2014, 'OEM# TEY1-67-EHY5 or
TEY1-67-5RYA', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments Encrypted Code System'),
    ('Mazda', 'CX-9', 2007, 2016, 'EK3-MAZ24', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mazda', 'CX-9', 2007, 2016, 'MAZ24R-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'CX-9 W/ PROX', 2019, 2021, 'OEM# TAYA-67-5DY', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'CX-30 W/ PROX', 2020, 2022, 'OEM# BCYN-67-5DY', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MAZDA 2', 2011, 2015, 'MAZ24R-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mazda', 'MAZDA 2', 2011, 2015, 'EK3-MAZ24', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MAZDA 3', 2004, 2013, 'EK3-MAZ24', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mazda', 'MAZDA 3', 2004, 2013, 'MAZ24R-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MAZDA 3 W/ PROX', 2019, 2021, 'OEM# BCYA-67-5DY or
BCYN-67-5DY', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MAZDA 5', 2006, 2015, 'EK3-MAZ24', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mazda', 'MAZDA 5', 2006, 2015, 'MAZ24R-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MAZDA 6', 2003, 2013, 'EK3-MAZ24', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mazda', 'MAZDA 6', 2003, 2013, 'MAZ24R-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MAZDA 6 W/ PROX', 2019, 2021, 'OEM# NFYR-67-5DYB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MAZDA 6 W/ PROX', 2006, 2008, 'OEM# GPYA-67-5RYC', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments Encrypted Code System'),
    ('Mazda', 'MAZDA SPEED 6', 2006, 2008, 'EK3-MAZ24', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mazda', 'MAZDA SPEED 6', 2006, 2008, 'MAZ24R-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MIATA', 2001, 2005, 'OEM# BJYV-76-2GX', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments Encrypted Code System'),
    ('Mazda', 'MIATA', 2001, 2005, 'EK3-MAZ24', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MIATA', 2001, 2005, 'X249', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MILLENIA', 1995, 2002, 'LXP90-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Mazda', 'MILLENIA', 1995, 2002, 'LXV90-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MX3', 1992, 1995, 'X201', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MX3', 1992, 1995, 'X200', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MX5 MIATA', 2014, 2016, 'MAZ24-GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Mazda', 'MX5 MIATA W/ PROX', 2020, 2021, 'OEM# NFYR-67-5DYB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MX5, MIATA', 1998, 1999, 'X249', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'PROTEGÉ', 2002, 2003, 'X249', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'PROTEGÉ, 323', 1997, 2003, 'X249', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'RX7', 1993, 1995, 'X222', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'RX8', 2004, 2011, 'EK3-MAZ24', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mazda', 'RX8', 2004, 2011, 'MAZ24R-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'TRIBUTE', 2005, 2011, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mazda', 'TRIBUTE', 2005, 2011, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'B SERIES', 2001, 2009, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mazda', 'B SERIES', 2001, 2009, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'B SERIES', 1999, 2000, 'EK3-H72', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Mazda', 'B SERIES', 1999, 2000, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'B25000 P’UP', 1999, 1999, 'X247', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MP3', 2002, 2002, 'X249', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'MPV VAN', 2005, 2007, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments Encrypted Code System'),
    ('Mazda', 'NAVAJO', 1991, 1995, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', '190 CLASS, D, E W/O
ALARM', 1984, 1993, 'S50HF-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Mazda', '190 CLASS, D, E W/O
ALARM', 1984, 1993, 'S53HF-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', '190 CLASS, D, E WITH
ALARM', 1984, 1993, 'S58HF-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Mazda', '300 SERIES', 1986, 1993, 'S48HF-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Mazda', '300 SERIES', 1986, 1993, 'S49HF-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'C CLASS - C220,
C230, C280, C43', 1997, 2009, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Crypto Transponder, Ordered by VIN'),
    ('Mazda', 'CL CLASS - CL500,
CL600, CL55, CL65', 1998, 2008, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System,
Ordered by VIN'),
    ('Mazda', 'CLK CLASS - CLK320,
CLK430, CABRIOLET', 1998, 2008, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System,
Ordered by VIN'),
    ('Mazda', 'CLS CLASS - CLS500,
CLS555', 2006, 2008, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mazda', 'E CLASS - E55, E350,
E500, E300D, E320,
E430', 2005, 2009, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Crypto Transponder, Ordered by VIN'),
    ('Mazda', 'G CLASS - G55, G500', 2004, 2011, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Crypto Transponder, Ordered by VIN'),
    ('Mazda', 'M CLASS', 2006, 2009, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Crypto Transponder, Ordered by VIN'),
    ('Mazda', 'ML320, ML430', 1998, 2008, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System,
Ordered by VIN'),
    ('Mazda', 'R CLASS - R350, R500', 2006, 2009, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Crypto Transponder, Ordered by VIN'),
    ('Mazda', 'S CLASS - S320,
S450, S500', 2001, 2009, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Crypto Transponder, Ordered by VIN'),
    ('Mazda', 'SL CLASS - SL320,
SL500, SL600, 380SL,
420SL, 450SL', 1997, 2008, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System,
Ordered by VIN'),
    ('Mazda', 'SLK 55, SLK230,
SLK280, SLK350', 1998, 2008, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System,
Ordered by VIN'),
    ('Mazda', 'SLR MC LAREN', 2005, 2008, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Phillips Rolling Code System,
Ordered by VIN'),
    ('Mazda', 'SPRINTER', 2007, 2013, 'EK3P-HU64', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'CAPRI', 1991, 1994, 'X207', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'COUGAR', 1999, 2002, 'EK3-H73', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) System'),
    ('Mercury', 'COUGAR', 1999, 2002, 'H73-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'GRAND MARQUIS', 2003, 2011, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mercury', 'GRAND MARQUIS', 2003, 2011, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'GRAND MARQUIS', 1993, 1996, '1193MU', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'GRAND MARQUIS', 1993, 1996, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'GRAND MARQUIS', 1990, 1992, '1184FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'GRAND MARQUIS', 1990, 1992, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'LYNX', 1983, 1986, '1181FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'LYNX', 1983, 1986, 'S1181FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'MARAUDER', 2003, 2005, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mercury', 'MARAUDER', 2003, 2005, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'MARINER (SISTER TO
FORD ESCAPE)', 2007, 2011, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mercury', 'MILAN (SISTER
MODEL TO ‘06 FORD
FUSION)', 2006, 2011, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mercury', 'MILAN (SISTER
MODEL TO ‘06 FORD
FUSION)', 2006, 2011, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1995, '1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1995, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'MONTEGO', 2007, 2008, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mercury', 'MYSTIQUE GL & LS', 1997, 1997, '1196CM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'MYSTIQUE GS', 1998, 2000, '1196CM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'MYSTIQUE LS', 1998, 2000, 'H73-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) System'),
    ('Mercury', 'SABLE (SISTER TO
FORD TAURUS)', 2008, 2009, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mercury', 'SABLE (SISTER TO
FORD TAURUS)', 2008, 2009, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'SABLE GS', 1999, 1999, 'EK3-H72', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) System'),
    ('Mercury', 'SABLE GS', 1999, 1999, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'SABLE GS & LS', 2000, 2007, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mercury', 'SABLE GS & LS', 2000, 2007, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'SABLE GS & LS', 1993, 1995, '1193MU', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'SABLE GS & LS', 1993, 1995, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL);

-- Batch 13
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Mercury', 'SABLE LS, SE, SHO', 1998, 1999, 'EK3-H72', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) System'),
    ('Mercury', 'SABLE LS, SE, SHO', 1998, 1999, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'TOPAZ', 1987, 1994, '1184FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'TOPAZ', 1987, 1994, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'TRACER', 1997, 1999, 'X244', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'MONTEREY', 2004, 2007, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mercury', 'MONTEREY', 2004, 2007, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mercury', 'MOUNTAINEER', 2002, 2011, 'EK3-H84', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D63) Encrypted System'),
    ('Mercury', 'MOUNTAINEER', 2002, 2011, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mini', 'MOUNTAINEER', 1998, 2001, 'EK3-H72', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) System'),
    ('Mini', 'MOUNTAINEER', 1998, 2001, 'H72-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mini', 'MOUNTAINEER', 1998, 2001, 'H82-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mini', 'VILLAGER', 1996, 2002, '1196FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mini', 'XR4TI', 1985, 1989, 'X86', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mini', 'ALL', 1981, 1981, '62FS', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mini', 'ALL', 1981, 1981, '62FT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mini', 'ALL', 1981, 1981, 'X29', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mini', 'COOPER', 2007, 2010, 'Dealer Prox FOB', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Crypto Transponder'),
    ('Mini', 'COOPER, COOPER S', 2004, 2007, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Crypto Transponder, Ordered by VIN'),
    ('Mitsubishi', 'DIAMANTE', 2001, 2006, 'MIT12-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2001', 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D61) Encrypted System'),
    ('Mitsubishi', 'ECLIPSE', 2008, 2012, 'MIT17A-PT(A) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Encrypted (46) System'),
    ('Mitsubishi', 'ECLIPSE', 2008, 2012, 'EK3P-MIT17', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ECLIPSE CROSS W/
REG IGNITION', 2018, 2022, 'OEM# 6370C135', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'NXP Encrypted (ID47) System'),
    ('Mitsubishi', 'ECLIPSE CROSS W/
PROX', 2018, 2022, 'OEM# 8637B639', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ENDEAVOR', 2007, 2011, 'MIT17A-PT(A) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Encrypted (46) System'),
    ('Mitsubishi', 'ENDEAVOR', 2007, 2011, 'EK3P-MIT17', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ENDEAVOR (WITH "N"
ON BLADE)', 2004, 2006, 'EK3-MIT9', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D61) Encrypted System'),
    ('Mitsubishi', 'ENDEAVOR (WITH "A"
ON BLADE)', 2001, 2006, 'EK3P-MIT16', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Philips Encrypted (46) System'),
    ('Mitsubishi', 'EXPO', 1992, 1994, 'X176', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'EXPO', 1992, 1994, 'X213', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'GALANT', 2008, 2012, 'MIT17A-PT(A) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Encrypted (46) System'),
    ('Mitsubishi', 'GALANT', 2008, 2012, 'EK3P-MIT17', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'I-MIEV', 2012, 2017, 'MIT17A-PT(A) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Encrypted (46) System'),
    ('Mitsubishi', 'I-MIEV', 2012, 2017, 'EK3P-MIT17', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'LANCER', 2002, 2006, 'X224', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'LANCER EVO', 2008, 2009, 'Dealer FOB', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'FOB Only'),
    ('Mitsubishi', 'LANCER W/ PROX
SYSTEM', 2008, 2016, 'OEM# 8637A228', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'LANCER W/ REGULAR
IGNITION', 2007, 2017, 'MIT17A-PT(A) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Encrypted (46) System'),
    ('Mitsubishi', 'LANCER W/ REGULAR
IGNITION', 2007, 2017, 'EK3P-MIT17', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'MIRAGE G4', 2017, 2019, 'MIT17A-PT(A) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Encrypted (46) System'),
    ('Mitsubishi', 'MIRAGE G4', 2017, 2019, 'EK3P-MIT17', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'MIRAGE W/ PROX', 2014, 2021, 'OEM# 6370B711', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'MIRAGE', 2014, 2022, 'MIT17A-PT(A) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Encrypted (46) System'),
    ('Mitsubishi', 'MIRAGE', 2014, 2022, 'EK3P-MIT17', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'MONTERO', 2001, 2006, 'MIT12-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D61) Encrypted System'),
    ('Mitsubishi', 'MONTERO SPORT', 2007, 2008, 'Dealer Key (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments Encrypted Code System'),
    ('Mitsubishi', 'OUTLANDER', 2004, 2008, 'EK3-MIT14', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments Plastic Wedge Encrypted System'),
    ('Mitsubishi', 'OUTLANDER W/
PROX SYSTEM', 2021, 2022, 'OEM# 8637C253 or 8637C254', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'OUTLANDER W/
PROX SYSTEM
(DIFFERENT PROX
FROM 2007)', 2008, 2020, 'OEM# 8637A316', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID08', 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'OUTLANDER W/
REGULAR IGNITION', 2007, 2021, 'MIT17A-PT(A) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2016', 0, NULL, 0, 'ilco_2023', 'Philips Encrypted (46) System'),
    ('Mitsubishi', 'OUTLANDER W/
REGULAR IGNITION', 2007, 2021, 'EK3P-MIT17', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'OUTLANDER SPORT
W/ PROX SYSTEM', 2011, 2021, 'OEM# 8637A316', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID11', 0, NULL, 0, 'ilco_2023', 'Philips Encrypted System'),
    ('Mitsubishi', 'OUTLANDER SPORT
W/ REGULAR
IGNITION', 2011, 2019, 'MIT17A-PT(A) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Encrypted (46) System'),
    ('Mitsubishi', 'OUTLANDER SPORT
W/ REGULAR
IGNITION', 2011, 2019, 'EK3P-MIT17', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'PICKUP TRUCK', 1997, 1999, 'X176', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'PRECIS', 1990, 1994, 'X196', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'RAIDER', 2006, 2010, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Encrypted (46) System'),
    ('Mitsubishi', 'RAIDER', 2006, 2010, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'RVR (CANADA)', 2011, 2018, 'MIT17A-PT(A) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Encypted (46) System'),
    ('Mitsubishi', 'RVR (CANADA)', 2011, 2018, 'EK3P-MIT17', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'SIGMA, CORDIA,
STARION, TREDIA', 1983, 1989, 'X121', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'VAN WAGON', 1995, 2001, 'X245', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ALL', 1981, 2004, 'S1970AM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ALL', 1981, 2004, '1970AM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ALL', 1973, 1980, '1970AM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ALL', 1973, 1980, 'S1970AM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', '300ZX, 280ZX', 1984, 1996, 'X197', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', '350Z ROADSTER', 2003, 2009, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', '350Z ROADSTER', 2003, 2009, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', '370Z COUPE', 2019, 2022, 'OEM# 285E3-1ET5D', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ALL MODELS EXCEPT
280ZX & 810', 1981, 1981, 'X6', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ALTIMA', 2023, 2023, 'OEM# 285E3-6LS5A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ALTIMA', 2019, 2022, 'OEM# 285E3-6CA1A or
285E3-6CA6A (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ARIYA', 2023, 2023, 'OEM# 285E3-5MR3B or
285E3-5MR1B', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ARMADA W/ PROX', 2017, 2022, 'OEM# 285E3-1LK0D', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'ARMADA W/
REGULAR IGNITION', 2004, 2014, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'ARMADA W/
REGULAR IGNITION', 2004, 2014, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'AXXES, NX, STANZA', 1982, 1993, 'X123', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'CUBE W/ PROX', 2009, 2015, 'OEM# 285E3-1HJ2A (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'CUBE W/ REGULAR
IGNITION', 2009, 2015, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'CUBE W/ REGULAR
IGNITION', 2009, 2015, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'FRONTIER W/ PROX', 2021, 2023, 'OEM# 285E3-9BU5A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'FRONTIER', 2006, 2021, 'NI04T (LAL) (Optional)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'FRONTIER', 2006, 2021, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'GT-R', 2013, 2021, 'OEM# 285E3-JF30A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'JUKE W/ PROX', 2011, 2017, 'OEM# 285E3-1KM0D or
285E3-1KM0A (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'JUKE W/O PROX', 2011, 2015, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'JUKE W/O PROX', 2011, 2015, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'KICKS W/ PROX', 2023, 2023, 'OEM# 285E3-6RA5A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'KICKS W/ REGULAR
IGNITION', 2018, 2021, 'NI07T', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (47) Hitag3'),
    ('Mitsubishi', 'LEAF', 2018, 2021, 'OEM# 285E3-5SA1A or
285E3-5SA1B', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2020', 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'MAXIMA', 2023, 2023, 'OEM# 285E3-9DL5A', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'MAXIMA, 810', 2000, 2003, 'NI01T or NI02T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D60) Encrypted System'),
    ('Mitsubishi', 'MAXIMA, 810', 2000, 2003, 'EK3-NI02', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'MICRA W/ PROX
(CANADA)', 2015, 2017, 'OEM# H0561-C992A or
H0561-C993A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'MICRA W/ REGULAR
IGNITION (CANADA)', 2015, 2017, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder Key'),
    ('Mitsubishi', 'MICRA W/ REGULAR
IGNITION (CANADA)', 2015, 2017, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'MURANO W/ PROX', 2022, 2023, 'OEM# 285E3-9BU5A or
285E3-9UH7A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'MURANO W/
REGULAR IGNITION', 2009, 2013, 'OEM# 285E3-1AA0A or
285E3-1AA0B', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder Key'),
    ('Mitsubishi', 'MURANO W/ PROX', 2005, 2008, 'Dealer Key Prox FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key');

-- Batch 14
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Mitsubishi', 'MURANO W/
REGULAR IGNITION', 2003, 2008, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'MURANO W/
REGULAR IGNITION', 2003, 2008, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'NV 200', 2013, 2021, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder Key'),
    ('Mitsubishi', 'NV 200', 2013, 2021, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'NV 1500/2500/3500', 2012, 2021, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'NV 1500/2500/3500', 2012, 2021, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'NV 1500/2500/3500', 2012, 2021, 'EK3-NI02', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'PATHFINDER W/
PROX', 2022, 2023, 'OEM# 285E3-7LA7A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2022', 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'PATHFINDER W/
REGULAR IGNITION', 2005, 2014, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'PATHFINDER W/
REGULAR IGNITION', 2005, 2014, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'PICKUP', 1982, 1997, 'X123', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'QUEST W/ PROX', 2011, 2017, 'OEM# 285E3-1KM0D, 285E3-
1JA1A, or 285E3-1JA2A (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto Transponder key'),
    ('Mitsubishi', 'QUEST', 2004, 2010, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'QUEST', 2004, 2010, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ROGUE W/ PROX', 2023, 2023, 'OEM# 285E3-5MR1B or
285E3-6RA5A', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'ROGUE W/ REGULAR
IGNITION', 2016, 2021, 'NI07T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (47) Hitag3'),
    ('Mitsubishi', 'SENTRA W/ PROX', 2019, 2022, 'OEM# 285E3-6CA1A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'SENTRA W/ REGULAR
IGNITION', 2007, 2021, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'SENTRA W/ REGULAR
IGNITION', 2007, 2021, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'SENTRA, SE-R,
200SX, 240SX', 2000, 2007, 'X237', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'TITAN W/ PROX', 2022, 2023, 'OEM# 285E3-9BU5A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2022', 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'TITAN W/ PROX', 2019, 2022, 'OEM# 285E3-9UF1A', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'TITAN', 2004, 2021, 'NI04T (LAL) (Optional)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'TITAN', 2004, 2021, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'VERSA W/ PROX', 2020, 2022, 'OEM# 285E3-6CA1A or
285E3-6CA6A (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Mitsubishi', 'VERSA W/ REGULAR
IGNITION', 2007, 2018, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder key'),
    ('Mitsubishi', 'VERSA W/ REGULAR
IGNITION', 2007, 2018, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'XTERRA', 2005, 2015, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'hilips Crypto (46) Transponder key'),
    ('Oldsmobile', 'XTERRA', 2005, 2015, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'XTERRA W/O
TRANSPONDER', 2000, 2004, 'X237', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'X-TRAIL (CANADA)', 2005, 2006, 'NI02T', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'exas Instruments (4D60) Encrypted System'),
    ('Oldsmobile', 'X-TRAIL (CANADA)', 2005, 2006, 'EK3-NI02', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'ALERO', 2000, 2004, 'P1112', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'AURORA', 2001, 2003, 'B99-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13)Fixed Code System'),
    ('Oldsmobile', 'AURORA', 2001, 2003, 'B99-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'AURORA', 2001, 2003, 'B100-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'AURORA', 2001, 2003, 'B100-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'AURORA', 1995, 2000, 'S1105', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'AURORA', 1995, 2000, 'VATS SYSTEM ( B82-P-2
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'BRAVADA', 2000, 2004, 'P1113', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'CUTLASS', 2000, 2000, 'P1111', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'CUTLASS SUPREME', 1994, 1998, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'CUTLASS SUPREME', 1994, 1998, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'EIGHTY-EIGHT', 1992, 1999, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'EIGHTY-EIGHT', 1992, 1999, 'VATS SYSTEM (B62-P-1
THRU 15) (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'INTRIGUE', 2000, 2003, 'P1112', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'LSS', 1999, 1999, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'LSS', 1999, 1999, 'VATS SYSTEM (B62-P-1
THRU 15) (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1991, 1996, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1991, 1996, 'P1098E', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'REGENCY 98', 1991, 1998, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'REGENCY 98', 1991, 1998, 'VATS SYSTEM (B62-P-1
THRU 15) (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'SILHOUETTE', 1999, 2004, 'B97-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13)Fixed Code System'),
    ('Oldsmobile', 'SILHOUETTE', 1999, 2004, 'B97-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'SILHOUETTE', 1999, 2004, 'B98-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'SILHOUETTE', 1999, 2004, 'B98-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'TORONADO', 1991, 1993, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'TORONADO', 1991, 1993, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Oldsmobile', 'ESPERANTE', 2001, 2006, 'H72-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Oldsmobile', 'ESPERANTE', 2001, 2006, 'EK3-H72', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Peugeot', 'MIDRANGER', 1988, 1990, 'X53', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Peugeot', 'MIDRANGER', 1988, 1990, 'X239', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Peugeot', 'US DESIGNED', 1981, 2004, '1098PB', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Peugeot', '405', 1989, 1991, 'X147', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Peugeot', '405', 1989, 1991, 'X171', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Peugeot', '505', 1985, 1991, 'X147', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Peugeot', '505', 1985, 1991, 'X148', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Peugeot', '505', 1985, 1991, 'X89', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', '3 AND 5 DOOR
HATCHBACK', 1994, 1994, 'P1794', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', '3 AND 5 DOOR
HATCHBACK', 1994, 1994, '1794V', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', '4 DR. STATION
WAGON', 1992, 1992, 'P1789', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', '4 DR. STATION
WAGON', 1992, 1992, 'P1793', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', '4 DR. STATION
WAGON', 1986, 1989, 'P1786', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', '4 DR. STATION
WAGON', 1986, 1989, 'S1770U', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'ACCLAIM', 1995, 1995, 'P1794', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'ACCLAIM', 1995, 1995, '1794V', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'BREEZE', 1999, 2000, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D64) Encrypted System'),
    ('Plymouth', 'BREEZE', 1999, 2000, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'BREEZE', 1996, 1997, 'P1794', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'BREEZE', 1996, 1997, '1794V', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'COLT, COLT VISTA', 1993, 1994, 'X224', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'COLT, COLT VISTA', 1993, 1994, 'X229', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'CONQUEST', 1984, 1986, 'X121', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'GRAND VOYAGER,
VOYAGER', 2001, 2003, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D64) Encrypted System'),
    ('Plymouth', 'GRAND VOYAGER,
VOYAGER', 2001, 2003, 'Y160-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'LASER', 1990, 1994, 'X176', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1994, 1996, 'P1794', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1994, 1996, '1794V', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'NEON', 2000, 2001, 'EK3-Y160', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D64) Encrypted System'),
    ('Plymouth', 'NEON', 2000, 2001, 'Y160-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Plymouth', 'PROWLER', 1998, 2002, 'P1795', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'AZTEK', 2001, 2005, 'B99-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13)Fixed Code System'),
    ('Pontiac', 'AZTEK', 2001, 2005, 'B99-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'AZTEK', 2001, 2005, 'B100-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'AZTEK', 2001, 2005, 'B100-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'BONNEVILLE', 2000, 2005, 'B99-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13)Fixed Code System'),
    ('Pontiac', 'BONNEVILLE', 2000, 2005, 'B99-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'BONNEVILLE', 2000, 2005, 'B100-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'BONNEVILLE', 2000, 2005, 'B100-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'FIREBIRD', 1991, 2002, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL);

-- Batch 15
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Pontiac', 'FORMULA', 1991, 2002, 'S1098H', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'G3', 2010, 2010, 'DWO4RT6 (Optional)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos Encrypted Transponder (Optional)'),
    ('Pontiac', 'G3', 2010, 2010, 'DWO4R-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'G5', 2007, 2010, 'B111-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Pontiac', 'G5', 2007, 2010, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'G6', 2005, 2010, 'B111-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Pontiac', 'G6', 2005, 2010, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'G8', 2008, 2009, 'Dealer key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Ordered by VIN'),
    ('Pontiac', 'G8', 2008, 2009, 'EK3P-GM45 or EK3LB-GM45', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'GRAND AM', 2000, 2005, 'P1112', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'GRAND PRIX', 2004, 2008, 'PT04-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'PK3 Megamos (13)Fixed Code System'),
    ('Pontiac', 'GRAND PRIX', 2004, 2008, 'PT04-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'GRAND PRIX', 2000, 2003, 'B103-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13)Fixed Code System'),
    ('Pontiac', 'GRAND PRIX', 2000, 2003, 'B103-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'GRAND PRIX', 2000, 2003, 'B104-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'GRAND PRIX', 2000, 2003, 'B104-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'GTA', 1988, 1988, 'S1098D', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'GTA', 1988, 1988, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'GTO', 2005, 2008, 'OEM # 92123129', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID04', 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'LEMANS', 1988, 1993, 'X168', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1991, 1995, 'P1098A', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1991, 1995, 'P1098E', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'MONTANA', 1999, 2004, 'B97-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13)Fixed Code System'),
    ('Pontiac', 'MONTANA', 1999, 2004, 'B97-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'MONTANA', 1999, 2004, 'B98-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'MONTANA', 1999, 2004, 'B98-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'MONTANA SV6
(CANADA)', 2007, 2009, 'B99-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13)Fixed Code System'),
    ('Pontiac', 'MONTANA SV6
(CANADA)', 2007, 2009, 'B99-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'MONTANA SV6', 2005, 2006, 'B99-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13)Fixed Code System'),
    ('Pontiac', 'MONTANA SV6', 2005, 2006, 'B99-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'MONTANA SV6', 2005, 2006, 'PT04-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'PURSUIT', 2006, 2010, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Pontiac', 'PURSUIT', 2006, 2010, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'SOLSTICE', 2006, 2009, 'B111-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Pontiac', 'SOLSTICE', 2006, 2009, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Pontiac', 'SUNFIRE', 2000, 2005, 'P1107', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Porsche', 'TORRENT (SIS-
TER MODEL TO
CHEVROLET
EQUINOX)', 2007, 2009, 'B111-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Porsche', 'TORRENT (SIS-
TER MODEL TO
CHEVROLET
EQUINOX)', 2007, 2009, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Porsche', 'TRANS AM, GTA', 1989, 1990, 'VATS SYSTEM (B62-P-1
THRU 15)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Porsche', 'TRANS SPORT', 1999, 1999, 'B97-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos (13)Fixed Code System'),
    ('Porsche', 'TRANS SPORT', 1999, 1999, 'B97-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Porsche', 'VIBE', 2009, 2010, 'TOY44D-PT(optional) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D67) Encrypted System'),
    ('Porsche', 'WAVE (CANADA)', 2005, 2010, 'DW04RT6', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Megamos Encrypted Transponder (Optional)'),
    ('Porsche', 'WAVE (CANADA)', 2005, 2010, 'DWO4R-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Porsche', '944', 1983, 1991, 'X9', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Porsche', '968', 1992, 1995, 'X9', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Porsche', '911 TURBO
CABRIOLET', 2004, 2005, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos Fixed Code System'),
    ('Porsche', '911, 912', 1999, 2009, 'Dealer Key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos Encrypted System'),
    ('Porsche', '928 WITH ALARM', 1981, 1995, 'HF55-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Porsche', '928 WITHOUT ALARM', 1981, 1995, 'HF52-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Porsche', '944, 924', 1976, 1988, '61VW', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Porsche', '944, 924', 1976, 1988, 'S62DW', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Porsche', '944, 924', 1976, 1988, 'U61VW', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Porsche', '944, 924', 1976, 1988, 'V61VW', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Saab', 'BOXSTER', 2005, 2011, 'HU66MH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Saab', 'CAYENNE', 2003, 2010, 'HU66MH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Saab', 'CAYENNE', 2003, 2010, 'HU66T6', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Saab', 'CAYMAN', 2006, 2009, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos Encrypted System,
Ordered by VIN'),
    ('Saab', 'GT3', 2004, 2007, 'Dealer Key', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos Fixed Code System'),
    ('Renault', 'ALLIANCE ENCORE', 1986, 1988, 'X150', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Renault', 'ALLIANCE ENCORE', 1986, 1988, 'X147', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Renault', 'FUEGO', 1986, 1986, 'X150', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Renault', 'FUEGO', 1986, 1986, 'X147', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Renault', 'PHANTOM', 2004, 2007, 'Dealer Key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Renault', 'SILVER SPIRIT', 1981, 1991, '62HF', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Renault', 'SILVER SPUR', 1981, 1991, '62HG', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Saab', '9000', 1986, 1998, 'S32YS-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Saab', '9-3', 2004, 2011, 'OEM # 12783781', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2', 0, NULL, 0, 'ilco_2023', 'Philips Crypto Transponder'),
    ('Saab', '9-5', 2004, 2009, 'OEM # 5363015', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos System'),
    ('Saturn', '900, 99', 1981, 1993, 'X52', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Saturn', '9-2X', 2005, 2008, 'Dealer Key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', '9-3, 9-5', 1999, 2003, 'OEM # 4851762', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2', 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos Encrypted System'),
    ('Saturn', '9-3, 9-5', 1999, 2003, 'YM30T5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', '9-4X', 2010, 2011, 'Dealer Key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Saturn', '9-7,', 2006, 2009, 'PT04-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'PK3 Megamos (13)Fixed Code System'),
    ('Saturn', '9-7,', 2006, 2009, 'PT04-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', 'ASTRA', 2008, 2009, 'OEM # 93192428', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Z1-2000(card 758), Z2001-4000(card 923), & Z4001-
6000(card 766)'),
    ('Saturn', 'AURA', 2007, 2010, 'B111-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Saturn', 'AURA', 2007, 2010, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', 'ION', 2003, 2007, 'P1115', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', 'L SERIES', 2000, 2005, 'P1110', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', 'L300', 2003, 2005, 'P1110', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', 'OUTLOOK', 2007, 2010, 'B111-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Saturn', 'OUTLOOK', 2007, 2010, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', 'OUTLOOK', 2007, 2010, 'PT04-PT5', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', 'SC & SL', 2001, 2002, 'P1110', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', 'SKY', 2007, 2010, 'B111-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Saturn', 'SKY', 2007, 2010, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', 'SW', 2001, 2001, 'P1110', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', 'VUE', 2008, 2010, 'B114-PT or B114R-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Saturn', 'VUE', 2008, 2010, 'EK3P-B114R', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Saturn', 'VUE', 2002, 2007, 'P1110', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Scion', 'IA', 2016, 2016, 'OEM# 89904-WB003 or
DD1B-67-5RY', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Scion', 'IM', 2016, 2016, 'OEM# 89070-12B00', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Scion', 'IQ', 2012, 2014, 'X217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Scion', 'IQ (CANADA)', 2012, 2013, 'TOY44G-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments 80 Bit Encrypted System'),
    ('Scion', 'TC', 2014, 2014, 'OEM# 89070-52G30', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Limited Release Edition'),
    ('Scion', 'XA', 2004, 2007, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D67) Encrypted Code System'),
    ('Scion', 'XB (CANADA)', 2011, 2012, 'TOY44G-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments 80 Bit Encrypted System'),
    ('Scion', 'XB (CANADA)', 2011, 2012, 'TOY43-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL);

-- Batch 16
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Scion', 'XB', 2004, 2014, 'X217', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID44', 0, NULL, 0, 'ilco_2023', NULL),
    ('Scion', 'XD (CANADA)', 2011, 2012, 'TOY44G-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments 80 Bit Encrypted System'),
    ('Scion', 'XD (CANADA)', 2011, 2012, 'TOY43-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Scion', 'XD', 2008, 2014, 'X217', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID44', 0, NULL, 0, 'ilco_2023', NULL),
    ('Smart', 'FORTWO', 2008, 2016, 'OEM# A4518203797', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Smart', 'FORTWO', 2008, 2016, 'VA6MH#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'AKTERA', 2004, 2007, '1630-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'ALL OTHERS', 1998, 2004, 'S1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'ALL OTHERS', 1998, 2004, '1167FD', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'BULLET', 2008, 2009, 'Y164-PT (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Subaru', 'BULLET', 2008, 2009, 'EK3P-Y164', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'CARGO', 2000, 2004, '62FT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'CARGO', 2000, 2004, 'X239', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'ASCENT W/PROX', 2019, 2022, 'OEM# 88835-FL03A or
88835-FL03C (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'B9 TRIBECA', 2006, 2013, 'EK3-SUB4', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas instruments (4D62) Encrypted System'),
    ('Subaru', 'B9 TRIBECA', 2006, 2013, 'SUB4-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2006', 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'BAJA', 2003, 2006, 'X251', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'BRAT', 1985, 1987, 'X123', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'BRAT', 1985, 1987, 'X124', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'BRZ W/ PROX', 2022, 2023, 'OEM# 88835-FL032', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2022', 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'BRZ W/ REGULAR
IGNITION', 2012, 2018, 'OEM# 57497-CA110 or 57497-
CA310', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'DL, GL, STD', 1985, 1990, 'X123', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'DL, GL, STD', 1985, 1990, 'X124', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'FORESTER W/ PROX', 2019, 2022, 'OEM# 88835-FL030', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'FORESTER W/
REGULAR IGNITION', 2019, 2022, 'TOY43RH-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', '"H" Chip'),
    ('Subaru', 'FORESTER', 2011, 2013, 'DAT17T42 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'FORESTER', 2011, 2013, 'EK3-SUB1', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'IMPREZA W/ PROX', 2017, 2023, 'OEM# 88835-FL03A or
88835-FL03C (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'IMPREZA', 2019, 2023, 'TOY43RH-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'IMPREZA WRX', 2015, 2015, 'OEM# 184297-FJ021', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'LEGACY (CANADA)', 2015, 2015, 'OEM# 57497-FJ030', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (82) Encrypted System'),
    ('Subaru', 'LEGACY W/ PROX', 2020, 2023, 'OEM# 88835-AN00C', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'LEGACY', 2020, 2022, 'TOY43RH-PT (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'LEGACY', 2010, 2014, 'DAT17T42 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Texas (4D62) Encrypted System'),
    ('Subaru', 'LEGACY', 2010, 2014, 'EK3-SUB1', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'LEGACY, OUTBACK', 2005, 2009, 'SUB4-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas instruments (4D62) Encrypted System'),
    ('Subaru', 'LEGACY, OUTBACK', 2005, 2009, 'EK3-SUB4', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'LOYALE & JUSTY', 1991, 1994, 'X123', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'OUTBACK W/ PROX', 2018, 2023, 'OEM# 88835-FL03A or
88835-FL03C (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2019', 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'OUTBACK (CANADA)', 2015, 2015, 'OEM# 57497-FJ030', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (82) Encrypted System'),
    ('Subaru', 'OUTBACK', 2020, 2022, 'TOY43RH-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'SVX', 1992, 1997, 'X123', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'SVX', 1992, 1997, 'X124', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'WRX W/ PROX', 2019, 2021, 'OEM# 88835-FL030', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2020', 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'WRX', 2011, 2014, 'DAT17T42 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'WRX', 2011, 2014, 'EK3-SUB1', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'XT-6', 1991, 1991, 'X123', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'XT-6', 1991, 1991, 'X124', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'XV CROSSTREK
(CANADA)', 2013, 2015, 'OEM# 57497-FJ030', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (82) Encrypted System'),
    ('Subaru', 'XV CROSSTREK W/
PROX', 2018, 2023, 'OEM# 88835-FL032', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2022', 0, NULL, 0, 'ilco_2023', NULL),
    ('Subaru', 'XV CROSSTREK', 2019, 2023, 'TOY43RH-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'EQUATOR', 2009, 2012, 'NI04T (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Suzuki', 'EQUATOR', 2009, 2012, 'EK3P-NI04', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'ESTEEM', 1995, 2002, 'X185', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'FORENZA', 2004, 2008, 'DW04RAP', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'KIZASHI', 2011, 2013, 'Smart Pass Prox 37172-57L20', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto Transponder key'),
    ('Suzuki', 'RENO', 2005, 2008, 'DW04RAP', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'SAMURAI', 1986, 1995, 'X121', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'SIDEKICK', 1989, 2002, 'X186', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'SWIFT', 1998, 2002, 'X186', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'SX4', 2006, 2013, 'SUZ20-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'SX4 W/ PROX
(CANADA)', 2007, 2011, 'OEM# 37145-57J10', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID07', 0, NULL, 0, 'ilco_2023', 'Philips (46) Encrypted System'),
    ('Suzuki', 'VERONA', 2004, 2007, 'DW05AP', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'VITARA, GRAND
VITARA W/ SMART
PASS', 2010, 2013, 'Smart Pass Prox FOB', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'VITARA, GRAND
VITARA', 1999, 2010, 'SUZ20-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'X90', 1996, 1998, 'X186', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Suzuki', 'XL-7', 2007, 2009, 'B111-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Circle +, Philips (46) Encrypted System'),
    ('Suzuki', 'XL-7', 2007, 2009, 'EK3P-B111', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'AVALON W/ REGULAR
IGNITION', 2012, 2012, 'TOY44G-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments 80 Bit Encrypted System'),
    ('Toyota', 'AVALON W/ REGULAR
IGNITION', 2012, 2012, 'TOY43-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'AVALON XLS, XL', 2002, 2005, 'TOY43AT4 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Toyota', 'AVALON XLS, XL', 2002, 2005, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'AVALON XLS, XL', 1998, 2004, 'TOY43AT4 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Toyota', 'AVALON XLS, XL', 1998, 2004, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'AVALON XLS, XL', 1998, 2004, 'X217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'C-HR W/ REGULAR
IGNITION', 2018, 2022, 'TOY48H-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'C-HR W/ REGULAR
IGNITION', 2018, 2022, 'TOY40B-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'C-HR W/ PROX', 2018, 2022, 'OEM# 89904-F4020', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CAMRY CE & LE', 2003, 2009, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Toyota', 'CAMRY CE & LE
(TYPE 1 SYSTEM)', 2003, 2006, 'TOY43AT4', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Toyota', 'CAMRY CE & LE
(TYPE 2 SYSTEM)', 2003, 2006, 'TOY44D-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D67) Encrypted System'),
    ('Toyota', 'CAMRY HYBRID', 2007, 2007, 'TOY44D-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D67) Encrypted System'),
    ('Toyota', 'CAMRY W/ PROX', 2018, 2022, 'OEM# 89904-06220', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2018', 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CAMRY W/ REGULAR
IGNITION', 2018, 2023, 'TOY48H-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2019', 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'CAMRY W/ REGULAR
IGNITION', 2018, 2023, 'TOY40B-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CAMRY XLE', 2002, 2003, 'TOY43AT4 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Toyota', 'CAMRY XLE', 2002, 2003, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CAMRY, CAMRY LE', 1998, 2002, 'TOY43AT4', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Toyota', 'CAMRY, CAMRY LE', 1998, 2002, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CAMRY, CAMRY LE', 1998, 2002, 'X217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CELICA
CONVERTIBLE', 1994, 1999, 'X217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CELICA
CONVERTIBLE', 1994, 1999, 'X220', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CELICA COUPE', 1994, 2005, 'X217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CELICA LIFTBACK', 1991, 1993, 'X212', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'COROLLA W/ PROX', 2019, 2022, 'OEM# 8990H-12180 or
8990H-02030', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'COROLLA', 2020, 2022, 'TOY48H-PT (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'COROLLA', 2020, 2022, 'TOY40B-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'COROLLA', 1993, 2001, 'X217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'COROLLA', 1993, 2001, 'X220', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'COROLLA CROSS W/
REGULAR PROX', 2022, 2022, 'OEM# 8990H-0A010 or
8990H-0A020', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL);

-- Batch 17
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Toyota', 'COROLLA CROSS W/
REGULAR IGNITION', 2022, 2022, 'TOY44H-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'COROLLA iM', 2017, 2019, 'TOY48H-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'COROLLA LIFTBACK', 1984, 1989, 'X137', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'COROLLA SEDAN,
COUPE, HARDTOP', 1991, 1992, 'X211', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'COROLLA SEDAN,
COUPE, HARDTOP', 1991, 1992, 'X219', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'COROLLA WAGON,
COROLLA STATION
WAGON 2WD', 1993, 1995, 'X223', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'COROLLA, FX, FX16', 1987, 1988, 'X146', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CORONA', 1981, 1982, 'X37', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CRESSIDA', 1981, 1987, 'TR25', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CRESSIDA SEDAN', 1989, 1992, 'X174', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'CRESSIDA SEDAN', 1989, 1992, 'X219', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'ECHO', 2003, 2005, 'X217-TR47 (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'FJ CRUSIER', 2011, 2015, 'TOY44G-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments 80 Bit Encrypted System'),
    ('Toyota', 'FJ CRUSIER', 2011, 2015, 'TOY43-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'MATRIX', 2011, 2014, 'TOY44G-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments 80 Bit Encrypted System'),
    ('Toyota', 'MATRIX', 2011, 2014, 'TOY43-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1982, 'TR25', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1982, 'X137', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1982, 'X146', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'MODELS AND YEARS
NOT REFERENCED
ELSEWHERE', 1981, 1982, 'X159', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'MR2', 1991, 1995, 'X174', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'MR2 SPYDER', 2001, 2005, 'TOY57-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Toyota', 'PASEO', 1992, 1998, 'X212', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'PRIUS', 2021, 2022, 'OEM# 89904-47710', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'PRIUS', 2004, 2008, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D67) Encrypted System'),
    ('Toyota', 'PRIUS', 2004, 2008, 'TOY44D-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'PRIUS C W/ PROX', 2012, 2018, 'OEM# 89904-52290 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'PRIUS C W/
REGULAR IGNITION', 2015, 2019, 'TOY44H-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 Bit Encrypted System'),
    ('Toyota', 'SOLARA', 2004, 2010, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D67) Encrypted System'),
    ('Toyota', 'SOLARA', 2004, 2010, 'TOY44D-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'SOLARA SE', 2002, 2003, 'TOY43AT4', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Toyota', 'SOLARA SE', 2002, 2003, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'SOLARA SLE', 2004, 2008, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4D67) Encrypted System'),
    ('Toyota', 'SOLARA SLE', 2004, 2008, 'TOY44D-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'SUPRA', 1993, 1999, 'X217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'SUPRA', 1993, 1999, 'X220', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'TERCEL LIFTBACK', 1988, 1990, 'X151', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'TERCEL, TERCEL
SEDAN, STATION
WAGON', 1991, 1998, 'X212', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'VENZA W/ PROX', 2021, 2022, 'OEM# 8990H-48050', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'YARIS W/ PROX', 2017, 2020, 'OEM# 89904-WB001', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'YARIS', 2015, 2018, 'TOY44H-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'YARIS IA', 2017, 2018, 'OEM# DD1B-67-5RY or
89904-WB003', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', '4 RUNNER', 1999, 2002, 'TOY43AT4 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Toyota', '4 RUNNER', 1999, 2002, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', '4 RUNNER LTD.', 1999, 2002, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Toyota', '4 RUNNER W/ PROX', 2020, 2021, 'OEM# 89904-0E091 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', '4 RUNNER W/
REGULAR IGNITION', 2020, 2022, 'TOY44H-PT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', '4 RUNNER W/
REGULAR IGNITION', 2020, 2022, 'TOY43-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'HIGHLANDER', 2001, 2003, 'TOY43AT4 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Toyota', 'HIGHLANDER', 2001, 2003, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'HIGHLANDER', 2001, 2003, 'X217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'HIGHLANDER W/
PROX', 2020, 2022, 'OEM# 8990H-0E020', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'HIGHLANDER W/
REGULAR IGNITION', 2014, 2019, 'TOY44H-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'LAND CRUISER', 2020, 2021, 'OEM# 89904-60X20 or 89904-
60X40', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'PREVIA VAN', 1991, 1998, 'X212', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'RAV 4 W/ PROX', 2019, 2022, 'OEM# 8990H-0R010 or
8990H-0R030 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'RAV 4 W/ REGULAR
IGNITION', 2019, 2023, 'TOY48H-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'RAV 4 W/ REGULAR
IGNITION', 2019, 2023, 'TOY40B-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'RAV 4', 2011, 2012, 'TOY44G-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments 80 Bit Encrypted System'),
    ('Toyota', 'SEQUOIA W/ PROX', 2019, 2022, 'OEM# 89904-0E092 or 89904-
0E121 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'SEQUOIA', 2015, 2020, 'TOY44H-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'SIENNA W/ PROX', 2021, 2022, 'OEM# 8990H-08020', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'SIENNA W/ REGULAR
IGNITION', 2015, 2020, 'TOY44H-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'SIENNA VAN, CE', 2004, 2010, 'X217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'SIENNA VAN, XLE-LE', 1998, 2003, 'TOY43AT4 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4C) Encrypted System'),
    ('Toyota', 'SIENNA VAN, XLE-LE', 1998, 2003, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'SIENNA VAN, XLE-LE', 1998, 2003, 'X217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'SIENNA VAN, XLE-LE-
LIMITED', 2004, 2010, 'TOY44D-PT', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D67) Encrypted System'),
    ('Toyota', 'SIENNA VAN, XLE-LE-
LIMITED', 2004, 2010, 'EK3-TOY43', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'SMALL PICKUP', 1989, 1995, 'X174', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'T100 PICKUP', 1993, 1998, 'X217', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'TACOMA W/ PROX', 2016, 2022, 'OEM# 89904-0E091 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'TACOMA', 2016, 2022, 'TOY44H-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'TACOMA', 2016, 2022, 'TOY43-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'TUNDRA W/ PROX', 2019, 2021, 'OEM# 89904-0E091 or 89904-
0E092 (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Toyota', 'TUNDRA', 2016, 2022, 'TOY44H-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Texas Instruments (4D74) 128 bit System'),
    ('Toyota', 'TUNDRA', 2016, 2022, 'TOY43-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'TR6, STAG, GT6,
SPITFIRE', 1981, 1981, '62FS', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'TR6, STAG, GT6,
SPITFIRE', 1981, 1981, '62FT', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'TR6, STAG, GT6,
SPITFIRE', 1981, 1981, 'MG1', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'TR6, STAG, GT6,
SPITFIRE', 1981, 1981, 'FT6R', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'TR8, TR7', 1981, 1981, 'MG1', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'ATLAS', 2018, 2020, 'OEM# 5G6959752BM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'BEETLE', 2017, 2019, 'OEM# 5K0 959 753 BG', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos (88) Crypto2 System'),
    ('Volkswagen', 'BEETLE', 1998, 1999, 'HU66P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Volkswagen', 'CC', 2009, 2014, 'HU66T24 (LAL)', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key, Megamos (48 CAN) Encrypted
System, Ordered by VIN'),
    ('Volkswagen', 'CC', 2009, 2014, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'CABRIO, EUROVAN', 2000, 2004, 'Dealer Key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System'),
    ('Volkswagen', 'EOS', 2007, 2015, 'HU66T24', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID07', 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos (48) Encrypted System'),
    ('Volkswagen', 'EOS', 2007, 2015, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'FOX', 1997, 1998, 'X203', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'FOX', 1997, 1998, 'X9', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'GLOVE BOX IF NOT
REFERENCED ELSE-
WHERE', 1980, 2007, '61VW', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'GLOVE BOX IF NOT
REFERENCED ELSE-
WHERE', 1980, 2007, 'S62DW', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'GLOVE BOX IF NOT
REFERENCED ELSE-
WHERE', 1980, 2007, 'U61VW', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'GLOVE BOX IF NOT
REFERENCED ELSE-
WHERE', 1980, 2007, 'V61VW', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'GOLF', 2018, 2020, 'OEM# 5G6959752BG or
5G6959752BM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'GOLF', 2000, 2006, 'HU66T6 (or dealer FOB) (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos (48) Encrypted System'),
    ('Volkswagen', 'GOLF', 2000, 2006, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'GOLF, GTI, RABBIT', 1985, 1987, 'X88', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL);

-- Batch 18
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Volkswagen', 'GOLF, GTI, RABBIT', 1985, 1987, 'X9', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'GOLF, JETTA,
CABRIO, CORRADO', 1999, 1999, 'X9', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'GLI', 2008, 2010, 'HU66T24', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos (48) Encrypted System'),
    ('Volkswagen', 'GTI', 2007, 2016, 'HU66T24', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2012', 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos (48) Encrypted System'),
    ('Volkswagen', 'GTI', 2007, 2016, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'JETTA', 2017, 2019, 'OEM# 5K0 959 753 BM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos (88) Crypto2 System'),
    ('Volkswagen', 'PASSAT', 2009, 2019, 'Dealer FOB (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID2012', 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System, Ordered by VIN'),
    ('Volkswagen', 'PASSAT (SEDAN)', 2006, 2008, 'HU66T24 or FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System'),
    ('Volkswagen', 'PASSAT (SEDAN)', 2006, 2008, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'PASSAT (WAGON)', 2006, 2008, 'Dealer Key or FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System'),
    ('Volkswagen', 'PHAETON', 2006, 2008, 'Dealer Key or FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volkswagen', 'R32 VR6', 2004, 2007, 'HU66T6', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos (48) Encrypted System'),
    ('Volkswagen', 'RABBIT', 2009, 2011, 'HU66T24', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System, Ordered by VIN'),
    ('Volkswagen', 'RABBIT', 2009, 2011, 'HU66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'ROUTAN', 2009, 2015, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'Philips Crypto (46) Transponder'),
    ('Volvo', 'ROUTAN', 2009, 2015, 'EK3P-Y170 or EK3LB-Y170', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'SCIROCCO', 1984, 1987, 'X88', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'SCIROCCO', 1984, 1987, 'X9', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'TIGUAN', 2017, 2019, 'OEM# 5K0 959 753 BM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos (88) Crypto2 System'),
    ('Volvo', 'TOUAREG', 2004, 2016, 'Dealer FOB', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID04', 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System, Ordered by VIN'),
    ('Volvo', 'VANAGON', 1981, 1990, 'X110', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', '740', 1985, 1991, 'X140', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', '740', 1985, 1991, 'X80', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', '240 SERIES, DL, GL', 1986, 1993, 'X140', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', '240 SERIES, DL, GL', 1986, 1993, 'X80', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', '760, 780', 1988, 1992, 'S66NN-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Volvo', '760, 780', 1988, 1992, 'S67NN-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', '850GLT', 1993, 1997, 'S66NN-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Volvo', '850GLT', 1993, 1997, 'S67NN-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', '900 SERIES', 1991, 1997, 'S66NN-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Volvo', 'C30, S40', 2007, 2013, 'OEM# 31252732 or 31300258
(LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System, Ordered by VIN'),
    ('Volvo', 'C70, S80', 2006, 2008, 'OEM# 30772198 or 30667913
(LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Volvo', 'S40, V40', 2000, 2008, 'Dealer Key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos (48) Encrypted System'),
    ('Volvo', 'S40, V40', 2000, 2008, 'HU101-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'S60', 2011, 2012, 'HU137MHK#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Push Button Start Ignition'),
    ('Volvo', 'S60R/V70R, S60,
XC70', 2004, 2008, 'Dealer Key (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Encrypted Megamos Transponder
System, Ordered by VIN'),
    ('Volvo', 'S70, V70', 1999, 2008, 'Dealer Key', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Volvo', 'S70, V70', 1999, 2008, 'NE66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'S80', 2008, 2012, 'HU137MHK#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Push Button Start Ignition'),
    ('Volvo', 'S90, V90', 1998, 1998, 'S66NN-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key'),
    ('Volvo', 'S90, V90', 1998, 1998, 'S67NN-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'V50', 2008, 2012, 'OEM# 30772198 or 30667913
(LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'V50', 2008, 2012, 'HU101-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'V60', 2014, 2014, 'OEM# 30659502 or 30659637', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'V60', 2014, 2014, 'HU101-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'V70', 2008, 2011, 'HU137MHK#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Push Button Start Ignition'),
    ('Volvo', 'XC60', 2010, 2014, 'HU137MHK#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Push Button Start Ignition'),
    ('Volvo', 'XC70', 2008, 2014, 'HU137MHK#', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', 'Push Button Start Ignition'),
    ('Volvo', 'XC70/90 SUV', 2004, 2014, 'OEM# 8688799 & 31253386
(LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', 'High Security Key. Megamos (48) Encrypted System'),
    ('Volvo', 'XC70/90 SUV', 2004, 2014, 'NE66-GTS w', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID5', 1, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'MV-1', 2012, 2014, 'H84-GTS', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, 'ID4', 1, NULL, 0, 'ilco_2023', 'Texas Instruments (80 Bit) Encrypted Code System'),
    ('Volvo', 'MV-1', 2012, 2014, 'H92-PT (LAL)', NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'ALL', 2001, 2007, '1970AM', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'ALL', 2001, 2007, 'S60HF-P', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'SEMI', 1988, 2007, 'X80', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'SEMI', 1988, 2007, 'O1122A', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'VOLVO LOADER', 1987, 1987, 'X51', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'GV', 1986, 1987, 'FT37', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'GV', 1986, 1987, 'FT38', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'GV', 1986, 1987, 'X153', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'GV', 1986, 1987, 'X167', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Volvo', 'GV', 1986, 1987, 'X152', NULL, NULL, NULL, 'Mechanical', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'ilco_2023', NULL),
    ('Acura', 'CSX (Canada)', 2006, 2006, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 1, 'strattec_2008', NULL),
    ('Acura', 'Integra', 2000, 2001, 'HD106-PT', NULL, '692246', NULL, 'Transponder', 'HD106', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Acura', 'MDX', 2001, 2007, 'HD106-PT', NULL, '692246', NULL, 'Transponder', 'HD106', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Acura', 'NSX', 1997, 1997, 'HD106-PT', NULL, '692246', NULL, 'Transponder', 'HD106', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Acura', 'RL', 1996, 1996, 'HD106-PT', NULL, '692246', NULL, 'Transponder', 'HD106', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Acura', 'RSX', 2002, 2006, 'HD106-PT', NULL, '692246', NULL, 'Transponder', 'HD106', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Acura', 'TL', 1998, 2003, 'HD106-PT', NULL, '692246', NULL, 'Transponder', 'HD106', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Acura', 'TL', 2004, 2007, NULL, NULL, '5907552t', '35113-SEC', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Acura', 'TSX', 2004, 2007, NULL, NULL, '5907552t', '35113-SEC', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Audi', 'A4/S4', 2002, 2005, 'HU66AT6', NULL, NULL, NULL, 'Transponder', 'HU66', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Audi', 'A6/S6/ALLROAD', 2001, 2005, 'HU66AT6', NULL, NULL, NULL, 'Transponder', 'HU66', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Audi', 'A8/S8', 2003, 2003, 'HU66AT6', NULL, NULL, NULL, 'Transponder', 'HU66', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Audi', 'TT', 2001, 2005, 'HU66AT6', NULL, NULL, NULL, 'Transponder', 'HU66', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Buick', 'Allure (Canada)', 2005, 2008, 'B107-PT', NULL, '691205', NULL, 'Transponder', 'B107', NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Buick', 'Enclave', 2007, 2008, NULL, NULL, '693126', '12451816', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Buick', 'LaCrosse', 2005, 2008, 'B107-PT', NULL, '691205', NULL, 'Transponder', 'B107', NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Buick', 'LeSabre', 2000, 2006, 'B99-PT', NULL, '690898', NULL, 'Transponder', 'B99', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Buick', 'Lucerne', 2006, 2008, NULL, NULL, '693126', '12451816', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Buick', 'Park Avenue', 1997, 2005, 'B97-PT', NULL, '690552', '88891799', 'Transponder', 'B97', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Buick', 'Rainier', 2003, 2005, 'B99-PT', NULL, '690898', NULL, 'Transponder', 'B99', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Buick', 'Rendezvous', 2005, 2006, 'B97-PT', NULL, '690552', '88891799', 'Transponder', 'B97', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Buick', 'Terraza', 2007, 2007, NULL, NULL, '692952', '15821269', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'strattec_2008', NULL),
    ('Buick', 'Terraza', 2005, 2006, 'B97-PT', NULL, '690552', '88891799', 'Transponder', 'B97', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Cadillac', 'CTS', 2003, 2007, NULL, NULL, '692139', '12450813', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'strattec_2008', NULL),
    ('Cadillac', 'CTS', 2008, 2008, NULL, NULL, '5904001t', '25847343', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Cadillac', 'Catera', 1997, 2001, NULL, NULL, NULL, '9120300', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Cadillac', 'DeVille', 2000, 2005, 'B99-PT', NULL, '690898', NULL, 'Transponder', 'B99', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Cadillac', 'DTS', 2005, 2008, NULL, NULL, '692933', '25847343', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Cadillac', 'Escalade/ESV/EXT', 2007, 2008, NULL, NULL, '692933', '25847343', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Cadillac', 'Seville', 1997, 2005, 'B99-PT', NULL, '690898', NULL, 'Transponder', 'B99', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Cadillac', 'SRX', 2004, 2008, NULL, NULL, '692383', NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'strattec_2008', NULL),
    ('Cadillac', 'STS', 2000, 2001, 'B99-PT5', NULL, '692065', NULL, 'Transponder', 'B99', NULL, NULL, NULL, NULL, 1, 'Quick-Code', 0, 'strattec_2008', NULL),
    ('Cadillac', 'STS', 2004, 2008, NULL, NULL, '692933', '25847343', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Chevrolet', 'Avalanche', 2007, 2008, NULL, NULL, '692931', '89024363', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Chevrolet', 'Cobalt', 2006, 2008, NULL, NULL, '692931', '89024363', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Chevrolet', 'Equinox', 2007, 2008, NULL, NULL, '692931', '89024363', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Chevrolet', 'HHR', 2006, 2008, NULL, NULL, '692931', '89024363', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Chevrolet', 'Impala', 2006, 2008, NULL, NULL, '692931', '89024363', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL);

-- Batch 19
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Chevrolet', 'Malibu Maxx', 2004, 2008, NULL, NULL, '692931', '89024363', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Chevrolet', 'Monte Carlo', 2006, 2007, NULL, NULL, '692931', '89024363', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Chevrolet', 'Silverado', 2007, 2008, NULL, NULL, '692931', '89024363', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Chevrolet', 'Suburban', 2007, 2008, NULL, NULL, '692931', '89024363', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Chevrolet', 'Tahoe', 2007, 2008, NULL, NULL, '692931', '89024363', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Chevrolet', 'Uplander', 2007, 2008, NULL, NULL, '692955', '15821273', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'strattec_2008', NULL),
    ('Chevrolet', 'Uplander', 2005, 2006, 'B97-PT', NULL, '690552', '88891799', 'Transponder', 'B97', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chevrolet', 'Venture Van', 1999, 2005, 'B97-PT', NULL, '690552', '88891799', 'Transponder', 'B97', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', '300C', 2005, 2007, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', '300', 2008, 2008, NULL, NULL, '5909874t', NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-10', 0, 'strattec_2008', NULL),
    ('Chrysler', '300M/LHS/300', 1998, 2005, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'Aspen', 2007, 2008, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'Cirrus Sedan', 1999, 2000, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'Concorde', 1998, 2004, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'Pacifica', 2004, 2008, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'PT Cruiser', 2001, 2005, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'PT Cruiser', 2006, 2008, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'Sebring Coupe', 2001, 2001, '“N”', NULL, '692354', '05086272AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'Sebring Coupe', 2002, 2008, NULL, NULL, '692353', '05086276AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'Sebring Sedan', 1999, 2008, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'Sebring Convertible', 1998, 2006, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'Town & Country Van', 2001, 2003, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'Town & Country Van', 2004, 2007, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Chrysler', 'Town & Country Van', 2008, 2008, NULL, NULL, '5909874t', NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-10', 0, 'strattec_2008', NULL),
    ('Dodge', 'Caravan LE, SE, Grand', 2001, 2003, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Caravan LE, SE, Grand', 2004, 2007, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Caravan LE, SE, Grand', 2008, 2008, NULL, NULL, '5909874t', NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-10', 0, 'strattec_2008', NULL),
    ('Dodge', 'Charger', 2006, 2007, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Charger', 2008, 2008, NULL, NULL, '5909874t', NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-10', 0, 'strattec_2008', NULL),
    ('Dodge', 'Dakota', 2001, 2004, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Dakota', 2005, 2008, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Durango', 2001, 2003, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Durango', 2004, 2004, NULL, NULL, NULL, '05135670AA 05179513AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Dodge', 'Durango', 2005, 2008, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Intrepid', 1998, 2004, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Magnum', 2005, 2007, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Magnum', 2008, 2008, NULL, NULL, '5909874t', NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-10', 0, 'strattec_2008', NULL),
    ('Dodge', 'Neon', 2000, 2006, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Nitro', 2007, 2008, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Ram', 2002, 2005, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Ram', 2006, 2008, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Sprinter Van', 2004, 2006, 'BYS15TK1', NULL, NULL, NULL, 'Transponder', 'BYS15', NULL, NULL, NULL, NULL, 1, 'Quick-Code', 1, 'strattec_2008', NULL),
    ('Dodge', 'Stratus 4 Door', 1999, 2006, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Stratus Coupe', 2001, 2006, NULL, NULL, '692353', '05086276AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Voyager Van', 2001, 2003, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Dodge', 'Voyager Van', 2004, 2005, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Eagle', 'Vision', 1998, 1998, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Contour, All', 1997, 1998, 'H73-PT', NULL, '692055', '011-R0225', 'Transponder', 'H73', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Contour, All', 1999, 2000, 'H73-PT', NULL, '692055', '011-R0225', 'Transponder', 'H73', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Contour V6', 1997, 1998, 'H73-PT', NULL, '692055', '011-R0225', 'Transponder', 'H73', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Contour V6', 1999, 2000, 'H73-PT', NULL, '692055', '011-R0225', 'Transponder', 'H73', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Crown Victoria', 1998, 2002, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Escape', 2001, 2004, 'H74/H86-PT', NULL, '691643', '011-R0250', 'Transponder', 'H74', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Escape', 2005, 2007, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Escape', 2008, 2008, NULL, NULL, '692813t', '164-R7016', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Hybrid Escape', 2005, 2006, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Edge', 2007, 2008, NULL, NULL, '692813t', '164-R7016', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Excursion', 2000, 2005, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Expedition', 1997, 1998, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Expedition', 1999, 2002, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Expedition', 2003, 2008, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Explorer', 1998, 1998, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Explorer', 2001, 2008, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Explorer Sport Trac', 2001, 2008, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Explorer Sport Trac', 1998, 2001, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Fairlane', 2008, 2008, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Five Hundred', 2005, 2006, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Five Hundred', 2007, 2007, NULL, NULL, '692395', '164-R7013', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'F-Series Truck', 1999, 2003, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'F-Series Truck', 2004, 2008, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'F-Series Super Duty', 2008, 2008, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Focus', 2000, 2005, 'H74/H86-PT', NULL, '691643', '011-R0250', 'Transponder', 'H74', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Freestar', 2004, 2007, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Freestyle', 2005, 2006, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Freestyle', 2007, 2007, NULL, NULL, '692813t', '164-R7016', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Fusion', 2006, 2008, NULL, NULL, '692395t', '164-R7013', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Mustang (8 cut)', 1996, 1997, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Mustang (8 cut)', 1998, 2006, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Mustang (8 cut)', 2005, 2008, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Mustang (10 cut)', 1996, 1996, 'H73-PT', NULL, '692055', '011-R0225', 'Transponder', 'H73', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Ranger', 2001, 2001, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Ranger V6', 1999, 2000, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Taurus', 1996, 1999, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Taurus', 2000, 2007, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Taurus', 2008, 2008, NULL, NULL, '692810t', '164-R8013', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Taurus X', 2008, 2008, NULL, NULL, '682814t', '164-R8016', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Thunderbird', 2002, 2002, 'H74/H86-PT', NULL, '691643', '011-R0250', 'Transponder', 'H74', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Thunderbird', 2003, 2006, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Windstar', 1998, 2000, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Ford', 'Windstar', 1999, 2003, NULL, NULL, '599114', '164-R0475', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('GMC', 'Acadia', 2007, 2008, NULL, NULL, '692932', '15824470', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('GMC', 'Sierra', 2007, 2008, NULL, NULL, '692932', '15824470', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('GMC', 'Yukon/XL', 2007, 2008, NULL, NULL, '692932', '15824470', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Honda', 'Accord', 1998, 2002, 'HD106-PT', NULL, '692246', NULL, 'Transponder', 'HD106', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Accord', 2003, 2008, NULL, NULL, '5907553t', '35118-SDA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Civic', 2001, 2002, 'HD106-PT', NULL, '692246', NULL, 'Transponder', 'HD106', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Civic', 2003, 2005, 'HO01T5', NULL, '692247', NULL, 'Transponder', 'HO01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Civic', 2006, 2008, NULL, NULL, '5907553t', '35118-SDA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'CR-V', 2002, 2006, 'HO01T5', NULL, '692247', NULL, 'Transponder', 'HO01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'CR-V', 2007, 2008, NULL, NULL, '5907553t', '35118-SDA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL);

-- Batch 20
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Honda', 'Element', 2003, 2005, 'HO01T5', NULL, '692247', NULL, 'Transponder', 'HO01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Element', 2006, 2008, NULL, NULL, '5907553t', '35118-SDA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Insight', 2000, 2006, 'HD106-PT', NULL, '692246', NULL, 'Transponder', 'HD106', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Odyssey', 1998, 2002, 'HD106-PT', NULL, '692246', NULL, 'Transponder', 'HD106', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Odyssey', 2003, 2004, 'HO01T5', NULL, '692247', NULL, 'Transponder', 'HO01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Odyssey', 2005, 2008, NULL, NULL, '5907553t', '35118-SDA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Pilot', 2003, 2005, 'HO01T5', NULL, '692247', NULL, 'Transponder', 'HO01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Pilot', 2006, 2008, NULL, NULL, '5907553t', '35118-SDA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Prelude', 1997, 1997, 'HD106-PT', NULL, '692246', NULL, 'Transponder', 'HD106', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'Ridgeline', 2005, 2008, NULL, NULL, '5907553t', '35118-SDA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'S2000', 2000, 2003, 'HD106-PT', NULL, '692246', NULL, 'Transponder', 'HD106', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'S2000', 2004, 2005, 'HO01T5', NULL, '692247', NULL, 'Transponder', 'HO01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Honda', 'S2000', 2006, 2006, NULL, NULL, NULL, '35118SDA01', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Hummer', 'H2', 2007, 2008, NULL, NULL, '693254t', '15898567', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Infiniti', 'FX35/45', 2004, 2006, 'NI104T', NULL, '7003526t', NULL, 'Transponder', 'NI104', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Infiniti', 'G20', 2000, 2002, 'NI01T', NULL, '692060', NULL, 'Transponder', 'NI01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Infiniti', 'G35', 2003, 2006, 'NI04T', NULL, '7003526t', NULL, 'Transponder', 'NI04', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Infiniti', 'I30', 2000, 2004, 'NI01T', NULL, '692060', NULL, 'Transponder', 'NI01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Infiniti', 'I30', 1999, 1999, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Infiniti', 'I35', 2002, 2004, 'NI01T', NULL, '692060', NULL, 'Transponder', 'NI01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Infiniti', 'Q45', 1997, 2001, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Infiniti', 'QX4', 1999, 2004, 'NI01T', NULL, '692060', NULL, 'Transponder', 'NI01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Infiniti', 'QX56', 2004, 2006, 'NI04T', NULL, '7003526t', NULL, 'Transponder', 'NI04', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Jaguar', 'XJ & XK Series', 1998, 1999, 'TBE1T5', NULL, NULL, NULL, 'Transponder', 'TBE1', NULL, NULL, NULL, NULL, 1, 'Quick-Code', 0, 'strattec_2008', NULL),
    ('Jaguar', 'S-Types', 2000, 2002, NULL, NULL, NULL, 'XR8-1611', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Jeep', 'Cherokee', 1998, 2001, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Jeep', 'Commander', 2005, 2007, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Jeep', 'Commander', 2008, 2008, NULL, NULL, '5909874t', NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-10', 0, 'strattec_2008', NULL),
    ('Jeep', 'Compass', 2007, 2008, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Jeep', 'Grand Cherokee', 1999, 2004, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Jeep', 'Grand Cherokee', 2005, 2007, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Jeep', 'Grand Cherokee', 2008, 2008, NULL, NULL, '5909874t', NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-10', 0, 'strattec_2008', NULL),
    ('Jeep', 'Liberty', 2002, 2004, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Jeep', 'Liberty', 2005, 2008, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Jeep', 'Patriot', 2007, 2008, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Jeep', 'Wrangler', 1998, 2005, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Jeep', 'Wrangler', 2006, 2008, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lexus', 'ES300', 2002, 2003, 'TOY48BT4', NULL, NULL, '89070-53530', 'Transponder', 'TOY48', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Lexus', 'GS300/400/430', 1998, 2001, 'TOY48BT4', NULL, NULL, NULL, 'Transponder', 'TOY48', NULL, NULL, NULL, NULL, 0, 'OBP-8', 1, 'strattec_2008', NULL),
    ('Lexus', 'GS300/400/430', 2002, 2005, 'TOY48BT4', NULL, NULL, '89070-50170', 'Transponder', 'TOY48', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Lexus', 'IS300', 2001, 2001, 'TOY48BT4', NULL, NULL, NULL, 'Transponder', 'TOY48', NULL, NULL, NULL, NULL, 0, 'OBP-8', 1, 'strattec_2008', NULL),
    ('Lexus', 'IS300', 2002, 2005, 'TOY48BT4', NULL, NULL, '89070-53350', 'Transponder', 'TOY48', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Lexus', 'LS400', 1997, 1997, 'TOY40BT4', NULL, NULL, NULL, 'Transponder', 'TOY40', NULL, NULL, NULL, NULL, 0, 'OBP-8', 1, 'strattec_2008', NULL),
    ('Lexus', 'LS400', 1998, 2000, 'TOY48BT4', NULL, NULL, NULL, 'Transponder', 'TOY48', NULL, NULL, NULL, NULL, 0, 'OBP-5', 1, 'strattec_2008', NULL),
    ('Lexus', 'LX470', 2001, 2006, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Lexus', 'RX330', 2004, 2006, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 1, 'strattec_2008', NULL),
    ('Lexus', 'SC300/400/430', 2002, 2006, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Lincoln', 'Aviator', 2003, 2006, NULL, NULL, '691259', '164-R0463', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'Blackwood', 2002, 2003, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'Continental', 1998, 2002, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'Continental', 2002, 2004, NULL, NULL, '691259', '164-R0463', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'LS', 2000, 2002, 'H74/H86-PT', NULL, '691643', '011-R0250', 'Transponder', 'H74', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'LS', 2003, 2006, NULL, NULL, '691259', '164-R0463', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'Mark LT', 2006, 2008, NULL, NULL, '691259', '164-R0463', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'Mark VIII', 1997, 1998, NULL, NULL, '691641*', '164-R0467', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'MKX', 2007, 2008, NULL, NULL, '693356t', '164-R7015', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'MKZ', 2007, 2008, NULL, NULL, '693356t', '164-R7015', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'Navigator', 1997, 1998, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'Navigator', 1998, 2002, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'Navigator', 2003, 2008, NULL, NULL, '691259', '164-R0463', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'Town Car', 1998, 2002, 'H72-PT', NULL, '597602', '011-R0221', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'Town Car', 2003, 2008, NULL, NULL, '691259', '164-R0463', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Lincoln', 'Zephyr', 2006, 2006, NULL, NULL, '693356t', '164-R7015', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mazda', '3', 2004, 2006, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Mazda', '626ES/LX-V6-4cyl', 1998, 1999, 'MAZ24RT5', NULL, '692080', NULL, 'Transponder', 'MAZ24', NULL, NULL, NULL, NULL, 1, 'Quick-Code', 0, 'strattec_2008', NULL),
    ('Mazda', '626ES/LX-V6', 2000, 2002, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 1, 'strattec_2008', NULL),
    ('Mazda', 'Miata', 2001, 2003, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 1, 'strattec_2008', NULL),
    ('Mazda', 'MPV Van', 2000, 2003, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 1, 'strattec_2008', NULL),
    ('Mazda', 'Pickups 3000/4000', 1999, 2000, 'H72-PT', NULL, '598333', NULL, 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mazda', 'Pickups 3000/4000', 2001, 2001, NULL, NULL, '690212', NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mazda', 'Pickup (option)', 2006, 2006, NULL, NULL, '690212', NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mazda', 'RX8', 2004, 2005, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Mazda', 'Tribute', 2001, 2005, 'H74/H86-PT', NULL, '691643', '011-R0250', 'Transponder', 'H74', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mazda', 'Tribute', 2005, 2006, NULL, NULL, '690212', NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Cougar', 1999, 2002, 'H73-PT', NULL, '692055', '011-R0225', 'Transponder', 'H73', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Grand Marquis', 1998, 2002, 'H72-PT', NULL, '597603', '011-R0222', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Grand Marquis', 2003, 2008, NULL, NULL, '599179', '164-R0455', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Marauder', 2003, 2005, NULL, NULL, '599179', '164-R0455', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Mariner', 2005, 2007, NULL, NULL, '599179', '164-R0455', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Mariner', 2008, 2008, NULL, NULL, '692811t', '164-R7014', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Milan', 2006, 2008, NULL, NULL, '692811t', '164-R7014', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Monterey', 2004, 2007, NULL, NULL, '599179', '164-R0455', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Montego', 2005, 2006, NULL, NULL, '599179', '164-R0455', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Montego', 2007, 2008, NULL, NULL, '692811', '164-R7014', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Mountaineer', 1998, 1998, 'H72-PT', NULL, '597603', '011-R0222', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Mountaineer', 2001, 2008, NULL, NULL, '599179', '164-R0455', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Mystique V6 LS', 1997, 1997, 'H73-PT', NULL, '692055', '011-R0225', 'Transponder', 'H73', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Mystique V6 LS', 1998, 2002, 'H73-PT', NULL, '692055', '011-R0225', 'Transponder', 'H73', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Sable LS, SE, SHO', 1996, 1999, 'H72-PT', NULL, '597603', '011-R0222', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Sable GS', 1996, 1997, 'H72-PT', NULL, '597603', '011-R0222', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Sable GS', 1998, 2006, 'H72-PT', NULL, '597603', '011-R0222', 'Transponder', 'H72', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Sable GS & LS', 2000, 2005, NULL, NULL, '599179', '164-R0455', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Sable Wagon', 2000, 2003, NULL, NULL, '599179', '164-R0455', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mercury', 'Sable', 2008, 2008, NULL, NULL, '692812t', '164-R8014', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mitsubishi', 'Eclipse', 2000, 2000, 'MIT8-PT', NULL, '692058', 'MR587315', 'Transponder', 'MIT8', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mitsubishi', 'Eclipse', 2001, 2005, NULL, NULL, '692564', 'MR482512', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mitsubishi', 'Eclipse', 2006, 2006, NULL, NULL, '692562', 'MN141060', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mitsubishi', 'Endeavor', 2004, 2005, NULL, NULL, '692564', 'MR482512', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mitsubishi', 'Endeavor', 2006, 2006, NULL, NULL, '692562', 'MN141060', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mitsubishi', 'Galant', 2000, 2001, NULL, NULL, '692565', 'MR482513V', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL);

-- Batch 21
INSERT OR IGNORE INTO key_blanks (
    make, model, year_start, year_end,
    ilco_ref, silca_ref, strattec_ref, oem_ref,
    key_type, blade_profile, blade_style, spaces, depths,
    chip_type, cloneable, prog_tool, dealer_only,
    source, notes
) VALUES
    ('Mitsubishi', 'Galant', 2002, 2005, NULL, NULL, '629564', 'MR482512', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mitsubishi', 'Galant', 2006, 2006, NULL, NULL, '692562', 'MN141060', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mitsubishi', 'Lancer Evo', 2003, 2006, NULL, NULL, NULL, 'MR587430', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Mitsubishi', 'Montero & Montero Sport', 2000, 2000, 'MIT8-PT', NULL, '692058', 'MR587315', 'Transponder', 'MIT8', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mitsubishi', 'Montero', 2001, 2006, 'MIT12-PT', NULL, '5907793t', 'MR587315', 'Transponder', 'MIT12', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mitsubishi', 'Montero Sport', 2001, 2004, 'MIT12-PT', NULL, '5907793t', 'MR587315', 'Transponder', 'MIT12', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mitsubishi', 'Outlander', 2004, 2006, NULL, NULL, NULL, 'MN141307', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Mitsubishi', 'Raider', 2006, 2007, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Mitsubishi', 'Spyder', 2000, 2001, NULL, NULL, '692565', 'MR482513V', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', '350Z', 2003, 2006, 'NI04T', NULL, '7003526t', NULL, 'Transponder', 'NI04', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Altima', 2000, 2004, 'NI01T', NULL, '692060', NULL, 'Transponder', 'NI01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Altima', 2005, 2006, 'NI04T', NULL, '7003526t', NULL, 'Transponder', 'NI04', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Armada', 2004, 2007, 'NI04T', NULL, '7003526t', NULL, 'Transponder', 'NI04', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Frontier P/Up', 2002, 2004, 'NI01T', NULL, '692060', NULL, 'Transponder', 'NI01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Frontier P/Up', 2006, 2006, 'NI04T', NULL, '7003526t', NULL, 'Transponder', 'NI04', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Maxima', 1999, 1999, 'NSN11T2', NULL, NULL, NULL, 'Transponder', 'NSN11', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Nissan', 'Maxima', 2000, 2003, 'NI01T', NULL, '692060', NULL, 'Transponder', 'NI01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Maxima', 2004, 2006, 'NI04T', NULL, '7003526t', NULL, 'Transponder', 'NI04', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Murano', 2003, 2006, 'NI04T', NULL, '7003526t', NULL, 'Transponder', 'NI04', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Pathfinder', 1999, 2004, 'NI01T', NULL, '692060', NULL, 'Transponder', 'NI01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Pathfinder', 2005, 2006, 'NI04T', NULL, '7003526', NULL, 'Transponder', 'NI04', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Quest', 2004, 2006, 'NI04T', NULL, '7003526t', NULL, 'Transponder', 'NI04', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Sentra/Stanza', 2000, 2007, 'NI01T', NULL, '692060', NULL, 'Transponder', 'NI01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'Titan', 2004, 2006, 'NI04T', NULL, '7003526t', NULL, 'Transponder', 'NI04', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'X-Terra', 2002, 2004, 'NI01T', NULL, '692060', NULL, 'Transponder', 'NI01', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Nissan', 'X-Terra', 2005, 2006, 'NI04T', NULL, '7003526t', NULL, 'Transponder', 'NI04', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Oldsmobile', 'Aurora', 2001, 2003, 'B99-PT', NULL, '690898', NULL, 'Transponder', 'B99', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Oldsmobile', 'Silhouette', 1999, 2004, 'B97-PT', NULL, '690552', '88891799', 'Transponder', 'B97', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Plymouth', 'Breeze', 2000, 2000, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Plymouth', 'Voyager, Grand Voyager', 2001, 2001, 'Y160-PT', NULL, '692325', '05010366AA', 'Transponder', 'Y160', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Plymouth', 'Neon', 2000, 2000, '“S”', NULL, '692352', '05134937AA', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Pontiac', 'Aztek', 2001, 2005, 'B99-PT', NULL, '690898', NULL, 'Transponder', 'B99', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Pontiac', 'Bonneville', 2000, 2005, 'B99-PT', NULL, '690898', NULL, 'Transponder', 'B99', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Pontiac', 'G5', 2007, 2008, NULL, NULL, '693121', '15282677', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Pontiac', 'G6', 2005, 2008, NULL, NULL, '693121', '15282677', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Pontiac', 'Grand Prix', 2000, 2003, 'B97-PT', NULL, '690552', '88891799', 'Transponder', 'B97', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Pontiac', 'Grand Prix', 2004, 2008, NULL, NULL, '5902386t', '88956263', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Pontiac', 'Montana/SV6', 2007, 2008, NULL, NULL, '692954', '15821271', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Pontiac', 'Montana', 2005, 2006, 'B97-PT', NULL, '690552', '88891799', 'Transponder', 'B97', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Pontiac', 'Pursuit', 2006, 2008, NULL, NULL, '693121', '15282677', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Pontiac', 'Solstice', 2006, 2008, NULL, NULL, '693121', '15282677', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Pontiac', 'Torrent', 2006, 2008, NULL, NULL, '693121', '15282677', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Porsche', '911', 1998, 1998, 'HU66T5', NULL, NULL, NULL, 'Transponder', 'HU66', NULL, NULL, NULL, NULL, 1, 'Quick-Code', 1, 'strattec_2008', NULL),
    ('Porsche', 'Boxster', 1997, 1998, 'HU66T5', NULL, NULL, NULL, 'Transponder', 'HU66', NULL, NULL, NULL, NULL, 1, 'Quick-Code', 1, 'strattec_2008', NULL),
    ('Saab', '9.3, 9.5', 1999, 2001, 'YM30T5', NULL, NULL, NULL, 'Transponder', 'YM30', NULL, NULL, NULL, NULL, 1, 'Quick-Code', 1, 'strattec_2008', NULL),
    ('Saturn', 'Aura', 2007, 2008, NULL, NULL, '693127', '15296738', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Saturn', 'Outlook', 2007, 2008, NULL, NULL, '693127', '15296738', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Saturn', 'Relay', 2005, 2006, 'B97-PT', NULL, '690552', '88891799', 'Transponder', 'B97', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Saturn', 'Relay', 2007, 2007, NULL, NULL, '692953', '15821267', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, 'strattec_2008', NULL),
    ('Saturn', 'Sky', 2007, 2008, NULL, NULL, '693127', '15296738', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'OBP-1', 0, 'strattec_2008', NULL),
    ('Toyota', '4-Runner', 1999, 2002, 'TOY43AT4', NULL, '692062', NULL, 'Transponder', 'TOY43', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Toyota', '4-Runner', 2003, 2006, NULL, NULL, NULL, '89785-60160', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Toyota', 'Avalon XL / XLS', 1998, 2001, 'TOY43AT4', NULL, '692062', NULL, 'Transponder', 'TOY43', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Toyota', 'Camry XLE', 1998, 2003, 'TOY43AT4', NULL, '692062', NULL, 'Transponder', 'TOY43', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Toyota', 'Camry CE', 2002, 2005, 'TOY43AT4', NULL, '692062', NULL, 'Transponder', 'TOY43', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Toyota', 'Camry LE', 1998, 2005, 'TOY43AT4', NULL, '692062', NULL, 'Transponder', 'TOY43', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Toyota', 'Camry', 2003, 2008, NULL, NULL, NULL, '89785-60160', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Toyota', 'Celica', 2005, 2005, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Toyota', 'Corolla', 2005, 2008, NULL, NULL, NULL, '89785-08020', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Toyota', 'Echo', 2003, 2005, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Toyota', 'Highlander', 2001, 2003, 'TOY43AT4', NULL, '692062', NULL, 'Transponder', 'TOY43', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Toyota', 'Highlander', 2004, 2006, NULL, NULL, NULL, '89785-60160', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Toyota', 'Landcrusier', 1998, 2002, 'TOY43AT4', NULL, '692062', NULL, 'Transponder', 'TOY43', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Toyota', 'Landcrusier', 2003, 2006, NULL, NULL, NULL, '89070-60750', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Toyota', 'Matrix', 2005, 2008, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, NULL, 1, 'strattec_2008', NULL),
    ('Toyota', 'MR2 Spider', 2001, 2005, 'TOY57PT', NULL, NULL, NULL, 'Transponder', 'TOY57', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Toyota', 'Prius', 2001, 2003, 'TOY43AT4', NULL, '692062', NULL, 'Transponder', 'TOY43', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Toyota', 'Prius', 2004, 2006, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Toyota', 'Sequoia', 2001, 2002, 'TOY43AT4', NULL, '692062', NULL, 'Transponder', 'TOY43', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Toyota', 'Sequoia', 2003, 2008, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Toyota', 'Sienna', 1998, 2003, 'TOY43AT4', NULL, '692062', NULL, 'Transponder', 'TOY43', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Toyota', 'Sienna', 2004, 2008, NULL, NULL, NULL, '89785-08020', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Toyota', 'Solara', 1999, 2003, 'TOY43AT4', NULL, '692062', NULL, 'Transponder', 'TOY43', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 0, 'strattec_2008', NULL),
    ('Toyota', 'Solara', 2004, 2008, NULL, NULL, NULL, '89785-08020', 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Volkswagen', 'Beetle', 2000, 2008, 'HU66T6', NULL, NULL, NULL, 'Transponder', 'HU66', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Volkswagen', 'Cabrio', 2000, 2003, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Volkswagen', 'Cabriolet', 2000, 2004, 'HU66T6', NULL, NULL, NULL, 'Transponder', 'HU66', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Volkswagen', 'EuroVan', 2000, 2004, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Volkswagen', 'Golf', 2002, 2006, NULL, NULL, NULL, NULL, 'Transponder', NULL, NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Volkswagen', 'GTI', 2000, 2006, 'HU66T6', NULL, NULL, NULL, 'Transponder', 'HU66', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Volkswagen', 'Jetta', 2002, 2008, 'HU66T6', NULL, NULL, NULL, 'Transponder', 'HU66', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL),
    ('Volkswagen', 'Passat', 2002, 2005, 'HU66T6', NULL, NULL, NULL, 'Transponder', 'HU66', NULL, NULL, NULL, NULL, 0, 'Code-Seeker', 1, 'strattec_2008', NULL);
