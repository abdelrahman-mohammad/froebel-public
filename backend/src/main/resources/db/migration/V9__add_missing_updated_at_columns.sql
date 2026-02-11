-- Add missing updated_at column to two_factor_backup_code table
ALTER TABLE two_factor_backup_code
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
