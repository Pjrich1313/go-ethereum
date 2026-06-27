-- Adds an audit table for ETH transfers initiated via POST /transfer.

CREATE TABLE IF NOT EXISTS transfers (
  id           TEXT PRIMARY KEY,
  initiated_by TEXT,
  signed_tx    TEXT NOT NULL,
  tx_hash      TEXT,
  status       TEXT NOT NULL DEFAULT 'submitted',
  created_at   TEXT NOT NULL
);
