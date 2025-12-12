-- Transponder data extracted from Automotive Transponder Chip Database.txt
-- Records: 4 chip types with correct schema

INSERT OR REPLACE INTO chip_registry (chip_type, technology, bits, description)
VALUES ('4C', 'Texas Fixed Code', 0, 'Texas Instruments fixed code transponder - Fully clonable');
INSERT OR REPLACE INTO chip_registry (chip_type, technology, bits, description)
VALUES ('4D-67', 'Texas Crypto', 40, 'Texas 4D Crypto 40-bit for Toyota - Clonable via sniffing');
INSERT OR REPLACE INTO chip_registry (chip_type, technology, bits, description)
VALUES ('4D-72', 'Texas DST-80', 80, 'Texas DST-80 G-chip - Clonable with CN5/LKP-02/XT27');
INSERT OR REPLACE INTO chip_registry (chip_type, technology, bits, description)
VALUES ('8A', 'Texas DST-AES', 128, 'Toyota H-chip 128-bit AES - Clonable with LKP-04/XT27');
INSERT OR REPLACE INTO chip_registry (chip_type, technology, bits, description)
VALUES ('ID46', 'Philips Hitag 2', 48, 'NXP PCF7936 - Fully clonable via data sniffing');
INSERT OR REPLACE INTO chip_registry (chip_type, technology, bits, description)
VALUES ('ID47', 'NXP Hitag 3', 128, 'NXP NCF2951 - Modern Honda/Hyundai/Kia');
INSERT OR REPLACE INTO chip_registry (chip_type, technology, bits, description)
VALUES ('ID49', 'NXP Hitag Pro', 128, 'Ford/Mazda 2015+ - Not clonable, OBD only');
INSERT OR REPLACE INTO chip_registry (chip_type, technology, bits, description)
VALUES ('ID4A', 'NXP Hitag AES', 128, '2020+ Nissan/Hyundai/Kia - Limited aftermarket support');
INSERT OR REPLACE INTO chip_registry (chip_type, technology, bits, description)
VALUES ('Megamos 48', 'Megamos Crypto', 96, 'VW/Audi/Honda - 96-bit clonable via server calculation');
INSERT OR REPLACE INTO chip_registry (chip_type, technology, bits, description)
VALUES ('MQB48', 'Megamos AES', 128, 'VW MQB platform - Not clonable, requires CS codes');
