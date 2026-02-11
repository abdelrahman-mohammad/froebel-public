-- V4: Add quiz_history table for storing quiz version snapshots
-- Stores full quiz state (including questions) as JSONB on each save

CREATE TABLE quiz_history
(
    id             UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    quiz_id        UUID         NOT NULL REFERENCES quiz (id) ON DELETE CASCADE,
    version_number INTEGER      NOT NULL,
    snapshot       JSONB        NOT NULL,
    created_by     UUID         REFERENCES "user" (id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_quiz_version UNIQUE (quiz_id, version_number)
);

COMMENT ON TABLE quiz_history IS 'Stores full quiz snapshots on each save for version history';
COMMENT ON COLUMN quiz_history.snapshot IS 'Complete quiz state as JSON including questions, settings, and metadata';
COMMENT ON COLUMN quiz_history.version_number IS 'Sequential version number per quiz (1, 2, 3, ...)';

-- Indexes for efficient querying
CREATE INDEX idx_quiz_history_quiz ON quiz_history (quiz_id);
CREATE INDEX idx_quiz_history_quiz_version ON quiz_history (quiz_id, version_number DESC);
CREATE INDEX idx_quiz_history_created_at ON quiz_history (quiz_id, created_at DESC);
