-- User Comment System Schema
-- Supports three visibility tiers:
-- 1. 'personal': Private to the user (like personal study notes)
-- 2. 'dev': Visible only to admins/devs (for internal tracking/todos)
-- 3. 'public': Visible to all users (community knowledge)

CREATE TABLE IF NOT EXISTS user_comments (
    id TEXT PRIMARY KEY,               -- UUID
    user_id TEXT NOT NULL,             -- UUID foreign key to users
    context_type TEXT NOT NULL,        -- 'vehicle', 'guide', 'page', 'global'
    context_id TEXT NOT NULL,          -- Identifier (e.g., 'honda-accord-2022')
    comment_type TEXT NOT NULL,        -- 'personal', 'dev', 'public'
    content TEXT NOT NULL,             -- Markdown content
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_resolved BOOLEAN DEFAULT 0,     -- For dev tasks/issues
    metadata TEXT,                     -- JSON for extra fields (e.g., 'pinned', 'color')
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indices for fast lookups by context and user
CREATE INDEX IF NOT EXISTS idx_comments_context ON user_comments(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON user_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_type ON user_comments(comment_type);

-- Trigger to update updated_at
CREATE TRIGGER IF NOT EXISTS update_user_comments_timestamp 
AFTER UPDATE ON user_comments
BEGIN
    UPDATE user_comments SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
