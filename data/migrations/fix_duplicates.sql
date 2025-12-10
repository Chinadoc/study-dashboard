-- Delete duplicates, keeping the one with the lowest rowid (oldest)
-- Actually, we might want the NEWEST one if we just updated it with analysis?
-- But the analysis update used UPDATE ... WHERE video_id = '...', which updates ALL of them?
-- Yes, "UPDATE video_tutorials SET ... WHERE video_id = '...'" updates all rows with that video_id.
-- So they should all be identical now. Keeping any one is fine.

DELETE FROM video_tutorials 
WHERE rowid NOT IN (
  SELECT min(rowid) 
  FROM video_tutorials 
  GROUP BY video_id
);

-- Create unique index to prevent future duplicates and enable INSERT OR REPLACE behavior
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_tutorials_video_id ON video_tutorials(video_id);
