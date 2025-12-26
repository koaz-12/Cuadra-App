
-- Add payment_window_days column to credit_cards table
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS payment_window_days INTEGER;
