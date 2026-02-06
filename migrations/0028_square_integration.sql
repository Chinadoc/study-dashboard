-- Add Square customer ID column
ALTER TABLE users ADD COLUMN square_customer_id TEXT;

-- Add subscription provider column to track which provider is being used
ALTER TABLE users ADD COLUMN subscription_provider TEXT DEFAULT 'stripe';
