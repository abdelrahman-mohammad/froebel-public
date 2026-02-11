-- V5: Add published version tracking to support draft/published separation
-- Publishing now creates a frozen snapshot; edits only affect the draft

-- Add published version pointer to quiz
ALTER TABLE quiz ADD COLUMN published_version_number INTEGER;

-- Add version tracking to quiz attempts (to score against the version they started with)
ALTER TABLE quiz_attempt ADD COLUMN quiz_version_number INTEGER;

COMMENT ON COLUMN quiz.published_version_number IS 'Points to quiz_history.version_number representing the live published content. NULL if never published.';
COMMENT ON COLUMN quiz_attempt.quiz_version_number IS 'The quiz version at attempt start time. Used for accurate scoring against historical content.';
