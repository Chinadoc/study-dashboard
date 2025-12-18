-- Migration to add Users, Inventory, and Job Logs tables for Cloud Sync

CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Google ID
    email TEXT,
    name TEXT,
    picture TEXT, -- Avatar URL
    is_pro BOOLEAN DEFAULT FALSE,
    created_at INTEGER
);

CREATE TABLE inventory (
    user_id TEXT,
    item_key TEXT,
    type TEXT, -- 'key' or 'blank'
    qty INTEGER,
    vehicle TEXT,
    amazon_link TEXT,
    updated_at INTEGER,
    PRIMARY KEY (user_id, item_key, type)
);

CREATE TABLE job_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    data JSON, -- Store full log object (revenue, cost, vehicle, etc.)
    created_at INTEGER
);

-- Index for faster lookups
CREATE INDEX idx_inventory_user ON inventory(user_id);
CREATE INDEX idx_job_logs_user ON job_logs(user_id);
