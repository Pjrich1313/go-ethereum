-- Adds an audit table for ETH transfers initiated via POST /transfer.

CREATE TABLE IF NOT EXISTS transfers (
  id           TEXT PRIMARY KEY,
  initiated_by TEXT,
  signed_tx    TEXT NOT NULL,
  -- tx_hash is populated with the hash returned by eth_sendRawTransaction on
  -- success, or NULL if the RPC call fails before returning a hash.
  tx_hash      TEXT,
  -- status tracks the lifecycle of the transfer record as seen by this worker.
  -- Valid values: 'submitted' (broadcast accepted), 'confirmed', 'failed'.
  status       TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'confirmed', 'failed')),
  created_at   TEXT NOT NULL
);
