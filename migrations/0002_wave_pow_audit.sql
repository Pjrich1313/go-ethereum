-- Adds proof-of-work tracking and balance audit columns to wave_sweeps.
-- Apply before deploying the hardened /wave endpoint:
--   npx wrangler d1 migrations apply YOUR_D1_DATABASE_NAME

ALTER TABLE wave_sweeps ADD COLUMN proof_of_work      TEXT;
ALTER TABLE wave_sweeps ADD COLUMN addresses_audited  TEXT;
ALTER TABLE wave_sweeps ADD COLUMN balances_snapshot  TEXT;
