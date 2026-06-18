-- Initial schema for the go-ethereum Cloudflare Worker
-- Creates the wave_sweeps and balances tables used by the /wave endpoint.

CREATE TABLE IF NOT EXISTS wave_sweeps (
  id          TEXT PRIMARY KEY,
  initiated_by TEXT,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS balances (
  address     TEXT PRIMARY KEY,
  balance_eth TEXT NOT NULL,
  recorded_at TEXT NOT NULL
);
