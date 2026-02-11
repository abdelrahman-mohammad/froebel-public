-- Add index on (quiz_id, question_order) to improve performance of:
-- - findMaxQuestionOrderByQuizId() queries
-- - question reordering operations
-- - ordered question retrieval

CREATE INDEX IF NOT EXISTS idx_question_quiz_order
ON question (quiz_id, question_order);
