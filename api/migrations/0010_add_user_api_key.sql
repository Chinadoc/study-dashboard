-- Migration to add openrouter_key to users table
ALTER TABLE users ADD COLUMN openrouter_key TEXT;
