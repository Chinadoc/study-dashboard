-- Migration to add trial_until to users table
ALTER TABLE users ADD COLUMN trial_until INTEGER;
