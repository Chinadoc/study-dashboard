-- Add consolidated key reference columns to vehicles table
-- This allows one row per vehicle with all key data aggregated

ALTER TABLE vehicles ADD COLUMN key_blank_refs TEXT;
-- JSON format: {"ilco": ["HD106-PT", "HD107-PT"], "strattec": ["5912560"], "silca": ["HON66"]}

ALTER TABLE vehicles ADD COLUMN key_image_url TEXT;
-- R2 URL for primary key image

ALTER TABLE vehicles ADD COLUMN key_type_display TEXT;
-- Human-readable: "Transponder", "Smart Key", "Mechanical", "Remote Head"
