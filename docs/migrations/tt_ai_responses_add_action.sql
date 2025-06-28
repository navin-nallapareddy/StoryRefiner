-- Adds missing 'action' column to the test responses table
ALTER TABLE tt_ai_responses
  ADD COLUMN action VARCHAR(20) NOT NULL;
