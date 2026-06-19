-- Creates the payouts table used by the /payout endpoint.
-- Apply with:
--   npx wrangler d1 migrations apply go-ethereum-worker-db --remote

CREATE TABLE IF NOT EXISTS payouts (
  id               TEXT PRIMARY KEY,
  recipient_address TEXT NOT NULL,
  amount_eth        TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  initiated_by      TEXT,
  note              TEXT,
  created_at        TEXT NOT NULL
);
