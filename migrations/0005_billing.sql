-- Phase 3: Stripe subscriptions (Supporter + Calendar)
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  product_code TEXT NOT NULL,
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);

-- Optional denormalised flags on users for fast reads
-- (safe if columns already exist: migration run once)
