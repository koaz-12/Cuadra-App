
-- Add last_4_digits column to loans table
ALTER TABLE loans ADD COLUMN IF NOT EXISTS last_4_digits TEXT;
