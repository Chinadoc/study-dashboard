CREATE TABLE IF NOT EXISTS video_tutorials (
  id TEXT PRIMARY KEY,
  video_id TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  tool TEXT,
  difficulty TEXT,
  transcript_summary TEXT,
  related_make TEXT,
  related_model TEXT,
  related_year_start INTEGER,
  related_year_end INTEGER
);

CREATE INDEX IF NOT EXISTS idx_video_make_model ON video_tutorials(related_make, related_model);
