-- Make category_id optional in variable_expenses to allow uncategorized expenses
ALTER TABLE variable_expenses ALTER COLUMN category_id DROP NOT NULL;
