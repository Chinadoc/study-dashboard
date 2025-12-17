-- Subscriptions table for Stripe Pro subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,  -- Google sub ID from OAuth
  email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT,  -- 'monthly', 'annual', 'lifetime'
  status TEXT DEFAULT 'inactive',  -- 'active', 'canceled', 'expired', 'inactive'
  current_period_end INTEGER,  -- Unix timestamp
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
