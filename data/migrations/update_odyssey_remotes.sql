-- Fill in remaining Honda Odyssey entries (2001-2010) that are remote fobs
UPDATE vehicles 
SET key_blank_refs = '{"ilco": ["HD106-PT", "HD107-PT"], "notes": "Remote fob - use with transponder key"}',
    key_type_display = 'Remote'
WHERE make = 'Honda' 
  AND model = 'Odyssey'
  AND year_start >= 2001 
  AND year_start <= 2004
  AND key_blank_refs IS NULL;

UPDATE vehicles 
SET key_blank_refs = '{"ilco": ["HO03-PT(V)"], "notes": "Remote fob - use with transponder key"}',
    key_type_display = 'Remote'
WHERE make = 'Honda' 
  AND model = 'Odyssey'
  AND year_start >= 2005 
  AND year_start <= 2010
  AND key_blank_refs IS NULL;
