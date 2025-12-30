-- Update transponder data from CSV
UPDATE vehicle_variants 
SET chip = 'ID48', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Chevrolet') 
    AND LOWER(model) = LOWER('Silverado')
)
AND year_start <= 2006 AND year_end >= 2003;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Chevrolet') 
    AND LOWER(model) = LOWER('Silverado')
)
AND year_start <= 2013 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID46E', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Chevrolet') 
    AND LOWER(model) = LOWER('Silverado')
)
AND year_start <= 2018 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID47', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Chevrolet') 
    AND LOWER(model) = LOWER('Silverado')
)
AND year_start <= 2025 AND year_end >= 2019;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Chevrolet') 
    AND LOWER(model) = LOWER('Equinox')
)
AND year_start <= 2017 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID47', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Chevrolet') 
    AND LOWER(model) = LOWER('Equinox')
)
AND year_start <= 2024 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Chevrolet') 
    AND LOWER(model) = LOWER('Malibu')
)
AND year_start <= 2012 AND year_end >= 2004;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Chevrolet') 
    AND LOWER(model) = LOWER('Malibu')
)
AND year_start <= 2015 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID47/4A', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Chevrolet') 
    AND LOWER(model) = LOWER('Malibu')
)
AND year_start <= 2024 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = '4C', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Ford') 
    AND LOWER(model) = LOWER('F-150')
)
AND year_start <= 2003 AND year_end >= 1999;
UPDATE vehicle_variants 
SET chip = '4D-63-40', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Ford') 
    AND LOWER(model) = LOWER('F-150')
)
AND year_start <= 2010 AND year_end >= 2004;
UPDATE vehicle_variants 
SET chip = '4D-63-80bit', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Ford') 
    AND LOWER(model) = LOWER('F-150')
)
AND year_start <= 2014 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'ID49', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Ford') 
    AND LOWER(model) = LOWER('F-150')
)
AND year_start <= 2020 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID49', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Ford') 
    AND LOWER(model) = LOWER('F-150')
)
AND year_start <= 2025 AND year_end >= 2021;
UPDATE vehicle_variants 
SET chip = '4D-63-40', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Ford') 
    AND LOWER(model) = LOWER('Focus')
)
AND year_start <= 2004 AND year_end >= 2000;
UPDATE vehicle_variants 
SET chip = '4D-63-80bit', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Ford') 
    AND LOWER(model) = LOWER('Focus')
)
AND year_start <= 2019 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = '4D-67', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Toyota') 
    AND LOWER(model) = LOWER('Camry')
)
AND year_start <= 2006 AND year_end >= 2003;
UPDATE vehicle_variants 
SET chip = '4D-67', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Toyota') 
    AND LOWER(model) = LOWER('Camry')
)
AND year_start <= 2010 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'G-Chip', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Toyota') 
    AND LOWER(model) = LOWER('Camry')
)
AND year_start <= 2014 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'H-Chip', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Toyota') 
    AND LOWER(model) = LOWER('Camry')
)
AND year_start <= 2017 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = '8A-H', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Toyota') 
    AND LOWER(model) = LOWER('Camry')
)
AND year_start <= 2024 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = '4D-67', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Toyota') 
    AND LOWER(model) = LOWER('Corolla')
)
AND year_start <= 2010 AND year_end >= 2005;
UPDATE vehicle_variants 
SET chip = 'G-Chip', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Toyota') 
    AND LOWER(model) = LOWER('Corolla')
)
AND year_start <= 2013 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'H-Chip', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Toyota') 
    AND LOWER(model) = LOWER('Corolla')
)
AND year_start <= 2019 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = '8A-BA', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Toyota') 
    AND LOWER(model) = LOWER('Corolla')
)
AND year_start <= 2024 AND year_end >= 2020;
UPDATE vehicle_variants 
SET chip = 'ID48', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Honda') 
    AND LOWER(model) = LOWER('Accord')
)
AND year_start <= 2007 AND year_end >= 2003;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Honda') 
    AND LOWER(model) = LOWER('Accord')
)
AND year_start <= 2012 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID47', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Honda') 
    AND LOWER(model) = LOWER('Accord')
)
AND year_start <= 2017 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID4A', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Honda') 
    AND LOWER(model) = LOWER('Accord')
)
AND year_start <= 2024 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Honda') 
    AND LOWER(model) = LOWER('Civic')
)
AND year_start <= 2011 AND year_end >= 2006;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Honda') 
    AND LOWER(model) = LOWER('Civic')
)
AND year_start <= 2015 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = 'ID47', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Honda') 
    AND LOWER(model) = LOWER('Civic')
)
AND year_start <= 2021 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = '4D-64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Ram') 
    AND LOWER(model) = LOWER('1500')
)
AND year_start <= 2005 AND year_end >= 2002;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Ram') 
    AND LOWER(model) = LOWER('1500')
)
AND year_start <= 2008 AND year_end >= 2006;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Ram') 
    AND LOWER(model) = LOWER('1500')
)
AND year_start <= 2012 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Ram') 
    AND LOWER(model) = LOWER('1500')
)
AND year_start <= 2018 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID4A', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Ram') 
    AND LOWER(model) = LOWER('1500')
)
AND year_start <= 2024 AND year_end >= 2019;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Nissan') 
    AND LOWER(model) = LOWER('Altima')
)
AND year_start <= 2006 AND year_end >= 2002;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Nissan') 
    AND LOWER(model) = LOWER('Altima')
)
AND year_start <= 2012 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Nissan') 
    AND LOWER(model) = LOWER('Altima')
)
AND year_start <= 2018 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID4A', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Nissan') 
    AND LOWER(model) = LOWER('Altima')
)
AND year_start <= 2024 AND year_end >= 2019;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Nissan') 
    AND LOWER(model) = LOWER('Rogue')
)
AND year_start <= 2013 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Nissan') 
    AND LOWER(model) = LOWER('Rogue')
)
AND year_start <= 2020 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID4A', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Nissan') 
    AND LOWER(model) = LOWER('Rogue')
)
AND year_start <= 2024 AND year_end >= 2021;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2018 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID4A', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2024 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2007 AND year_end >= 2005;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2013 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2021 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID4A', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee L')
)
AND year_start <= 2024 AND year_end >= 2021;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2007 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2008 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2009 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2010 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2011 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2012 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2013 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2014 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2015 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2016 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = 'ID46E (NXP PCF7937E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2017 AND year_end >= 2017;
UPDATE vehicle_variants 
SET chip = 'ID46E (NXP PCF7937E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2018 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = 'ID46E (NXP PCF7937E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2019 AND year_end >= 2019;
UPDATE vehicle_variants 
SET chip = 'ID46E (NXP PCF7937E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Acadia')
)
AND year_start <= 2020 AND year_end >= 2020;
UPDATE vehicle_variants 
SET chip = 'ID48', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Canyon')
)
AND year_start <= 2008 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID48', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Canyon')
)
AND year_start <= 2009 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID48', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Canyon')
)
AND year_start <= 2010 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID48', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Canyon')
)
AND year_start <= 2011 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'ID48', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Canyon')
)
AND year_start <= 2012 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Canyon')
)
AND year_start <= 2014 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Canyon')
)
AND year_start <= 2015 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Canyon')
)
AND year_start <= 2016 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Canyon')
)
AND year_start <= 2017 AND year_end >= 2017;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Canyon')
)
AND year_start <= 2018 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Canyon')
)
AND year_start <= 2019 AND year_end >= 2019;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Envoy')
)
AND year_start <= 2006 AND year_end >= 2006;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Envoy')
)
AND year_start <= 2007 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Envoy')
)
AND year_start <= 2008 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Envoy')
)
AND year_start <= 2009 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Savana')
)
AND year_start <= 2008 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Savana')
)
AND year_start <= 2009 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Savana')
)
AND year_start <= 2010 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Savana')
)
AND year_start <= 2011 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Savana')
)
AND year_start <= 2012 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Savana')
)
AND year_start <= 2013 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Savana')
)
AND year_start <= 2014 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Savana')
)
AND year_start <= 2015 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Savana')
)
AND year_start <= 2016 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2007 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2008 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2009 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2010 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2011 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2012 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2013 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2014 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2015 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2016 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2017 AND year_end >= 2017;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2018 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2019 AND year_end >= 2019;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Sierra 1500')
)
AND year_start <= 2020 AND year_end >= 2020;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7937)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Terrain')
)
AND year_start <= 2010 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7937)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Terrain')
)
AND year_start <= 2011 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7937)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Terrain')
)
AND year_start <= 2012 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7937)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Terrain')
)
AND year_start <= 2013 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7937)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Terrain')
)
AND year_start <= 2014 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7937)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Terrain')
)
AND year_start <= 2015 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7937)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Terrain')
)
AND year_start <= 2016 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7937)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Terrain')
)
AND year_start <= 2017 AND year_end >= 2017;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2007 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2008 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2009 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2010 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2011 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2012 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2013 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2014 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2015 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2016 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2017 AND year_end >= 2017;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2018 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2019 AND year_end >= 2019;
UPDATE vehicle_variants 
SET chip = 'ID46E (PCF7952E)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('GMC') 
    AND LOWER(model) = LOWER('Yukon')
)
AND year_start <= 2020 AND year_end >= 2020;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 1998 AND year_end >= 1998;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 1999 AND year_end >= 1999;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 2000 AND year_end >= 2000;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 2001 AND year_end >= 2001;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 2002 AND year_end >= 2002;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 2003 AND year_end >= 2003;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 2004 AND year_end >= 2004;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 2005 AND year_end >= 2005;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 2006 AND year_end >= 2006;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 2007 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 2014 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 2015 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 2016 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Cherokee')
)
AND year_start <= 2017 AND year_end >= 2017;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Commander')
)
AND year_start <= 2006 AND year_end >= 2006;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Commander')
)
AND year_start <= 2007 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7961)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Commander')
)
AND year_start <= 2008 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7961)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Commander')
)
AND year_start <= 2009 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7961)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Commander')
)
AND year_start <= 2010 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2007 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2008 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2009 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2010 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2011 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2012 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2013 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2014 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2015 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2016 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2017 AND year_end >= 2017;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2018 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2019 AND year_end >= 2019;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2020 AND year_end >= 2020;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Compass')
)
AND year_start <= 2021 AND year_end >= 2021;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7939)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Gladiator')
)
AND year_start <= 2018 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7939)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Gladiator')
)
AND year_start <= 2019 AND year_end >= 2019;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7939)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Gladiator')
)
AND year_start <= 2020 AND year_end >= 2020;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7939)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Gladiator')
)
AND year_start <= 2021 AND year_end >= 2021;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 1998 AND year_end >= 1998;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 1999 AND year_end >= 1999;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2000 AND year_end >= 2000;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2001 AND year_end >= 2001;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2002 AND year_end >= 2002;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2003 AND year_end >= 2003;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2004 AND year_end >= 2004;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2005 AND year_end >= 2005;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2006 AND year_end >= 2006;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2007 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7961)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2008 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7961)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2009 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7961)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2010 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7961)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2011 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7961)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2012 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7961)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2013 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2014 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2015 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2016 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2017 AND year_end >= 2017;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2018 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2019 AND year_end >= 2019;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2020 AND year_end >= 2020;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Grand Cherokee')
)
AND year_start <= 2021 AND year_end >= 2021;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Liberty')
)
AND year_start <= 2002 AND year_end >= 2002;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Liberty')
)
AND year_start <= 2003 AND year_end >= 2003;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Liberty')
)
AND year_start <= 2004 AND year_end >= 2004;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Liberty')
)
AND year_start <= 2005 AND year_end >= 2005;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Liberty')
)
AND year_start <= 2006 AND year_end >= 2006;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Liberty')
)
AND year_start <= 2007 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7941AT)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Liberty')
)
AND year_start <= 2008 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7941AT)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Liberty')
)
AND year_start <= 2009 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7941AT)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Liberty')
)
AND year_start <= 2010 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7941AT)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Liberty')
)
AND year_start <= 2011 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'ID46 (PCF7941AT)', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Liberty')
)
AND year_start <= 2012 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Patriot')
)
AND year_start <= 2007 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Patriot')
)
AND year_start <= 2008 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Patriot')
)
AND year_start <= 2009 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Patriot')
)
AND year_start <= 2010 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Patriot')
)
AND year_start <= 2011 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Patriot')
)
AND year_start <= 2012 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Patriot')
)
AND year_start <= 2013 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Patriot')
)
AND year_start <= 2014 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Patriot')
)
AND year_start <= 2015 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Patriot')
)
AND year_start <= 2016 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Patriot')
)
AND year_start <= 2017 AND year_end >= 2017;
UPDATE vehicle_variants 
SET chip = 'ID88', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Renegade')
)
AND year_start <= 2015 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID88', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Renegade')
)
AND year_start <= 2016 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = 'ID88', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Renegade')
)
AND year_start <= 2017 AND year_end >= 2017;
UPDATE vehicle_variants 
SET chip = 'ID88', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Renegade')
)
AND year_start <= 2018 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = 'ID88', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Renegade')
)
AND year_start <= 2019 AND year_end >= 2019;
UPDATE vehicle_variants 
SET chip = 'ID88', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Renegade')
)
AND year_start <= 2020 AND year_end >= 2020;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7953M)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Renegade')
)
AND year_start <= 2021 AND year_end >= 2021;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 1998 AND year_end >= 1998;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 1999 AND year_end >= 1999;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2000 AND year_end >= 2000;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2001 AND year_end >= 2001;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2002 AND year_end >= 2002;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2003 AND year_end >= 2003;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2004 AND year_end >= 2004;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2005 AND year_end >= 2005;
UPDATE vehicle_variants 
SET chip = '4D64', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2006 AND year_end >= 2006;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2007 AND year_end >= 2007;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2008 AND year_end >= 2008;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2009 AND year_end >= 2009;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2010 AND year_end >= 2010;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2011 AND year_end >= 2011;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2012 AND year_end >= 2012;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2013 AND year_end >= 2013;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2014 AND year_end >= 2014;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2015 AND year_end >= 2015;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2016 AND year_end >= 2016;
UPDATE vehicle_variants 
SET chip = 'ID46', 
    cloning_possible = 1
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2017 AND year_end >= 2017;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7939)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2018 AND year_end >= 2018;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7939)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2019 AND year_end >= 2019;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7939)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2020 AND year_end >= 2020;
UPDATE vehicle_variants 
SET chip = 'ID4A (PCF7939)', 
    cloning_possible = 0
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE LOWER(make) = LOWER('Jeep') 
    AND LOWER(model) = LOWER('Wrangler')
)
AND year_start <= 2021 AND year_end >= 2021;