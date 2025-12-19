-- BMW Vehicle Data from Ilco 2023 Catalog
-- Key Types: Mechanical, Transponder (EWS), High Security, Philips Rolling Code, Smart Key

-- 1 Series
INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, key_blank_refs, key_type_display, key_image_url)
VALUES 
('BMW', '1 Series', 2008, 2014, '{"ilco": ["HU92RP", "HU92RMHK"], "notes": "High Security, Philips 46 Encrypted"}', 'Transponder - EWS', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '1 Series', 2004, 2007, '{"ilco": ["HU92RMH", "HU92RP"], "notes": "High Security, Philips 46 Encrypted"}', 'Transponder - EWS', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png');

-- 3 Series
INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, key_blank_refs, key_type_display, key_image_url)
VALUES 
('BMW', '3 Series', 2006, 2011, '{"ilco": ["HU92RMHK", "HU92RP"], "notes": "High Security, Philips 46 Encrypted with Prox"}', 'Smart Key', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '3 Series', 2005, 2011, '{"ilco": ["HU92RMH", "HU92RP"], "notes": "High Security, Philips 46 Encrypted"}', 'Transponder - EWS', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '3 Series', 1999, 2007, '{"ilco": ["HU92RP"], "notes": "High Security, Philips Rolling Code"}', 'Transponder - Rolling Code', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '3 Series', 1995, 1998, '{"ilco": ["HU92RP"], "notes": "High Security, Philips Rolling Code, Dealer Only"}', 'Transponder - Rolling Code', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '3 Series', 1993, 1994, '{"ilco": ["S7BW-P", "S6BW"], "notes": "High Security Key"}', 'High Security', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '3 Series', 1985, 1992, '{"ilco": ["X144/BMW3", "HF40"], "notes": "Standard Key"}', 'Mechanical', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '3 Series', 1981, 1984, '{"ilco": ["X59/BMW2"], "notes": "Standard Key"}', 'Mechanical', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png');

-- 5 Series
INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, key_blank_refs, key_type_display, key_image_url)
VALUES 
('BMW', '5 Series', 2008, 2011, '{"ilco": ["HU92RP"], "notes": "Smart Pro FOB, High Security, Philips Rolling Code"}', 'Smart Key', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '5 Series', 2006, 2011, '{"ilco": ["HU92RMHK", "HU92RP"], "notes": "High Security with Prox, Philips 46 Encrypted"}', 'Smart Key', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '5 Series', 2003, 2010, '{"ilco": ["HU92RMH", "HU92RP"], "notes": "High Security, Philips 46 Encrypted"}', 'Transponder - EWS', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '5 Series', 2004, 2007, '{"ilco": ["HU92RP"], "notes": "High Security, Philips Rolling Code, Dealer Only"}', 'Transponder - Rolling Code', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '5 Series', 1997, 2003, '{"ilco": ["HU58AP"], "notes": "High Security, Philips Rolling Code, Dealer Only"}', 'Transponder - Rolling Code', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '5 Series', 1995, 1996, '{"ilco": ["S7BW-P", "S6BW"], "notes": "High Security, Philips Rolling Code, Dealer Only"}', 'Transponder - Rolling Code', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '5 Series', 1988, 1994, '{"ilco": ["S7BW-P", "S6BW"], "notes": "High Security Key"}', 'High Security', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '5 Series', 1985, 1987, '{"ilco": ["X144/BMW3", "HF40"], "notes": "Standard Key"}', 'Mechanical', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '5 Series', 1981, 1984, '{"ilco": ["X59/BMW2", "HF40"], "notes": "Standard Key"}', 'Mechanical', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png');

-- 6 Series
INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, key_blank_refs, key_type_display, key_image_url)
VALUES 
('BMW', '6 Series', 2008, 2009, '{"ilco": ["HU92RP"], "notes": "Smart Pro FOB, High Security"}', 'Smart Key', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '6 Series', 2004, 2011, '{"ilco": ["HU92RMH", "HU92RP"], "notes": "High Security, Philips 46 Encrypted"}', 'Transponder - EWS', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '6 Series', 2005, 2007, '{"ilco": ["HU92RP"], "notes": "High Security, Philips Rolling Code, Dealer Only"}', 'Transponder - Rolling Code', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '6 Series', 1985, 1989, '{"ilco": ["X144/BMW3", "HF40"], "notes": "Standard Key"}', 'Mechanical', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '6 Series', 1981, 1984, '{"ilco": ["X59/BMW2", "HF40"], "notes": "Standard Key"}', 'Mechanical', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png');

-- 7 Series
INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, key_blank_refs, key_type_display, key_image_url)
VALUES 
('BMW', '7 Series', 2008, 2009, '{"ilco": ["HU92RP"], "notes": "Smart Pro FOB, High Security, Philips Rolling Code"}', 'Smart Key', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '7 Series', 2002, 2008, '{"ilco": ["HU92RMH", "HU92RP"], "notes": "High Security, Philips 46 Encrypted"}', 'Transponder - EWS', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '7 Series', 2003, 2007, '{"ilco": ["HU92RP"], "notes": "High Security, Philips Rolling Code, Dealer Only"}', 'Transponder - Rolling Code', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '7 Series', 1997, 2002, '{"ilco": ["HU58AP"], "notes": "High Security, Philips Rolling Code, Dealer Only"}', 'Transponder - Rolling Code', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '7 Series', 1995, 1996, '{"ilco": ["S7BW-P", "HU58AP", "S6BW"], "notes": "High Security, Philips Rolling Code, Dealer Only"}', 'Transponder - Rolling Code', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '7 Series', 1988, 1994, '{"ilco": ["S7BW-P", "S6BW"], "notes": "High Security Key"}', 'High Security', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '7 Series', 1985, 1987, '{"ilco": ["X144/BMW3", "HF40"], "notes": "Standard Key"}', 'Mechanical', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '7 Series', 1981, 1984, '{"ilco": ["X59/BMW2", "HF40"], "notes": "Standard Key"}', 'Mechanical', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png');

-- 8 Series
INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, key_blank_refs, key_type_display, key_image_url)
VALUES 
('BMW', '8 Series', 1996, 1997, '{"ilco": [], "notes": "Dealer Only - Mfg Restricted, Philips Rolling Code"}', 'Transponder - Rolling Code', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '8 Series', 1995, 1995, '{"ilco": ["S7BW-P", "HU58AP", "S6BW"], "notes": "High Security, Philips Rolling Code, Dealer Only"}', 'Transponder - Rolling Code', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', '8 Series', 1990, 1994, '{"ilco": ["S7BW-P"], "notes": "High Security Key"}', 'High Security', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png');

-- X Series (X3, X5, X6 etc)
INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, key_blank_refs, key_type_display, key_image_url)
VALUES 
('BMW', 'X3', 2011, 2017, '{"ilco": ["HU92RMHK", "HU92RP"], "notes": "Smart Key, Philips 46 Encrypted"}', 'Smart Key', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', 'X3', 2004, 2010, '{"ilco": ["HU92RMH", "HU92RP"], "notes": "High Security, Philips 46 Encrypted"}', 'Transponder - EWS', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', 'X5', 2007, 2013, '{"ilco": ["HU92RMHK", "HU92RP"], "notes": "Smart Key, Philips 46 Encrypted"}', 'Smart Key', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', 'X5', 2000, 2006, '{"ilco": ["HU92RMH", "HU58AP"], "notes": "High Security, Philips Rolling Code or 46 Encrypted"}', 'Transponder - EWS', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', 'X6', 2008, 2014, '{"ilco": ["HU92RMHK", "HU92RP"], "notes": "Smart Key, Philips 46 Encrypted"}', 'Smart Key', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png');

-- Z Series
INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, key_blank_refs, key_type_display, key_image_url)
VALUES 
('BMW', 'Z3', 1996, 2002, '{"ilco": ["HU58AP", "HU92RP"], "notes": "High Security, Philips Rolling Code, Dealer Only"}', 'Transponder - Rolling Code', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', 'Z4', 2003, 2008, '{"ilco": ["HU92RMH", "HU92RP"], "notes": "High Security, Philips 46 Encrypted"}', 'Transponder - EWS', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', 'Z4', 2009, 2016, '{"ilco": ["HU92RMHK", "HU92RP"], "notes": "Smart Key with Prox, Philips 46 Encrypted"}', 'Smart Key', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png');

-- M Series
INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, key_blank_refs, key_type_display, key_image_url)
VALUES 
('BMW', 'M3', 2001, 2006, '{"ilco": ["HU92RMH", "HU58AP"], "notes": "High Security, Philips Rolling Code or 46 Encrypted"}', 'Transponder - EWS', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', 'M3', 2007, 2013, '{"ilco": ["HU92RMHK", "HU92RP"], "notes": "Smart Key, Philips 46 Encrypted"}', 'Smart Key', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', 'M5', 2000, 2010, '{"ilco": ["HU92RMH", "HU92RP"], "notes": "High Security, Philips 46 Encrypted"}', 'Transponder - EWS', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png'),
('BMW', 'M6', 2005, 2010, '{"ilco": ["HU92RMH", "HU92RP"], "notes": "High Security, Philips 46 Encrypted"}', 'Transponder - EWS', 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png');
