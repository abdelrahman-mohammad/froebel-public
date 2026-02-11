-- Migration to support hashed access codes
-- BCrypt hashes are 60 characters, so we need to increase the column length

-- Increase access_code column length to accommodate BCrypt hashes
ALTER TABLE quiz ALTER COLUMN access_code TYPE VARCHAR(72);

-- Note: Existing plaintext access codes will NOT be automatically hashed.
-- Quizzes with existing access codes will need to have their access code reset
-- by the quiz owner. The validation will fail for existing plaintext codes
-- until they are updated through the application.

-- For a production system, you may want to:
-- 1. Run a one-time script to hash existing codes before deployment
-- 2. Or communicate to users that access codes need to be reset
