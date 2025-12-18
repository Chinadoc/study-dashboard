-- Create insights table for AI analysis
CREATE TABLE IF NOT EXISTS insights (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  content TEXT,
  recommendations JSON,
  created_at INTEGER
);
