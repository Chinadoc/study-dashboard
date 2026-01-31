-- Technical Glossary Seed Data
-- Generated: 2026-01-31T10:44:30.207529

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('CAS2', 'platform', 'Car Access System 2', 'BMW''s second-generation immobilizer and access control module. Found in E-series vehicles including E60, E90, E63. Uses 46-series transponder chips. Key learning possible via EEPROM or OBD with appropriate tools.', '["CAS 2", "CarAccessSystem2"]', '["CAS3", "EWS"]', '["BMW"]', 2001, 2010, '["3 Series", "5 Series", "6 Series", "7 Series", "X3", "X5"]');

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('CAS3', 'platform', 'Car Access System 3', 'Third-generation BMW immobilizer module. Introduced encrypted key learning and more secure communication. EEPROM access still possible for programming. Common in later E-series and early F-series transition vehicles.', '["CAS 3", "CAS3+", "CarAccessSystem3"]', '["CAS2", "CAS4"]', '["BMW"]', 2007, 2014, '["1 Series", "3 Series", "5 Series", "X1", "X3", "X5", "X6"]');

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('CAS4', 'platform', 'Car Access System 4', 'Fourth-generation BMW access control. Used extensively in F-series vehicles. Requires EEPROM read for All Keys Lost scenarios. Programming typically done via bench work or specialized tools like VVDI, Yanhua ACDP.', '["CAS 4", "CAS4+", "CarAccessSystem4"]', '["CAS3", "FEM"]', '["BMW"]', 2010, 2018, '["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "X1", "X3", "X4", "X5"]');

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('FEM', 'platform', 'Front Electronic Module', 'BMW module controlling front lighting, wipers, and key access functions. Found in F20/F21/F22/F30/F31/F32/F34. Works alongside CAS4 in some configurations. Requires bench procedures for certain key programming operations.', '["FEM Module", "FrontElectronicModule"]', '["CAS4", "BDC"]', '["BMW"]', 2012, 2019, '["1 Series", "2 Series", "3 Series", "4 Series"]');

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('BDC', 'platform', 'Body Domain Controller', 'BMW''s centralized body control module that replaced FEM in G-series vehicles. Handles access control, lighting, comfort functions. More integrated architecture requiring advanced tools for key programming.', '["BodyDomainController"]', '["BDC2", "BDC3", "FEM"]', '["BMW"]', 2016, NULL, '["3 Series", "4 Series", "5 Series", "7 Series", "X3", "X4", "X5", "X7"]');

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('BDC2', 'platform', 'Body Domain Controller 2', 'Second iteration of BMW''s body domain controller. Transitional module with updated cryptographic security. Found in some late F-series and early G-series vehicles. Bench procedures typically required for AKL.', '["BDC 2", "BodyDomainController2"]', '["BDC", "BDC3"]', '["BMW"]', 2017, 2019, '["5 Series", "7 Series", "X3", "X5"]');

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('BDC3', 'platform', 'Body Domain Controller 3', 'Current-generation BMW body domain controller. Most secure version with advanced encryption. All Keys Lost scenarios require bench access or dealer-level intervention. Add key operations may use donor key data. Found in all current G-series and newer vehicles.', '["BDC 3", "BodyDomainController3"]', '["BDC2", "BDC"]', '["BMW"]', 2019, NULL, '["2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X3", "X4", "X5", "X6", "X7", "iX", "i4", "i7"]');

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('MQB', 'platform', 'Modular Transverse Matrix', 'Volkswagen Group''s modular platform for transverse-engine vehicles. Introduced KESSY smart key systems and BCM2 immobilizers. Common across VW, Audi, Skoda, SEAT brands.', '["MQB Platform", "Modularer Querbaukasten"]', '["MQB-Evo", "MLB-Evo"]', '["Volkswagen", "Audi", "Skoda", "SEAT"]', 2012, 2022, '["Golf", "Jetta", "Tiguan", "Atlas", "A3", "Q3"]');

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('MQB-Evo', 'platform', 'MQB Evolution', 'Updated Volkswagen Group modular platform. Features enhanced security with IMMO 6 immobilizer generation. Used in Golf 8, ID.4, and newer Audi A3. Requires latest-generation programming tools.', '["MQB Evo", "MQB Evolution Platform"]', '["MQB", "IMMO6"]', '["Volkswagen", "Audi"]', 2019, NULL, '["Golf 8", "ID.4", "ID.3", "A3"]');

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('Global B', 'platform', 'GM Global B Architecture', 'GM''s CAN-FD based architecture for full-size trucks and SUVs. Features advanced security with encrypted key programming. Requires capable tools supporting CAN-FD protocols. Dealer programming increasingly common.', '["GlobalB", "GM Global-B"]', '["T1XX", "Global A"]', '["Chevrolet", "GMC", "Cadillac"]', 2019, NULL, '["Silverado", "Sierra", "Tahoe", "Suburban", "Yukon", "Escalade"]');

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('Global A', 'platform', 'GM Global A Architecture', 'GM''s platform for performance and luxury vehicles. Uses PK3+ immobilizer system. OBD programming possible with correct tools. Less restrictive than Global B for aftermarket programming.', '["GlobalA", "GM Global-A", "Alpha Platform"]', '["Global B"]', '["Cadillac", "Chevrolet"]', 2013, NULL, '["CTS", "ATS", "CT4", "CT5", "Camaro"]');

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('TNGA-K', 'platform', 'Toyota New Global Architecture - K', 'Toyota''s modular platform for mid-size and larger FWD vehicles. Uses H-chip (8A-BA, 8A-BE) smart key systems. OBD programming possible on most models with appropriate tools.', '["TNGA K", "Toyota K Platform"]', '["TNGA-F", "TNGA-C"]', '["Toyota", "Lexus"]', 2017, NULL, '["Camry", "Avalon", "RAV4", "Highlander", "ES", "RX"]');

INSERT OR REPLACE INTO glossary_terms (term, category, display_name, description, aliases, related_terms, makes, year_start, year_end, models)
VALUES ('TNGA-F', 'platform', 'Toyota New Global Architecture - F', 'Toyota''s body-on-frame platform for trucks and large SUVs. Latest generation features enhanced security requiring newer programming methods. 2022+ Tundra/Sequoia particularly challenging for aftermarket.', '["TNGA F", "Toyota F Platform"]', '["TNGA-K"]', '["Toyota", "Lexus"]', 2022, NULL, '["Tundra", "Sequoia", "Land Cruiser", "LX"]');

