-- Add highlights and walkthrough columns to video_tutorials table
ALTER TABLE video_tutorials ADD COLUMN highlights TEXT;
ALTER TABLE video_tutorials ADD COLUMN walkthrough TEXT;
