-- Migration: Add developer tracking capabilities
-- Created: 2025-12-19

-- Add developer flag to users table
ALTER TABLE users ADD COLUMN is_developer BOOLEAN DEFAULT FALSE;

-- Activity tracking table for user analytics
CREATE TABLE IF NOT EXISTS user_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,        -- 'sign_in', 'sign_out', 'view_tab', 'search', 'inventory_add', etc.
    details TEXT,                -- JSON with context (tab name, search query, etc.)
    user_agent TEXT,             -- Browser/device info
    created_at INTEGER NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON user_activity(action);
CREATE INDEX IF NOT EXISTS idx_activity_time ON user_activity(created_at DESC);
