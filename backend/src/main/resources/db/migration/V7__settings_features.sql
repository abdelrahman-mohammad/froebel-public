-- =====================================================
-- V7: Settings Features
-- - Notification preferences
-- - Account deletion/export requests
-- - Two-factor authentication
-- - Session management
-- - OAuth account linking (refactored)
-- - Email change requests
-- =====================================================

-- =====================================================
-- 1. LINKED ACCOUNTS (OAuth Provider Connections)
-- Replaces provider/providerId on user table
-- =====================================================

CREATE TABLE linked_account (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    provider        VARCHAR(50) NOT NULL,
    provider_id     VARCHAR(255) NOT NULL,
    provider_email  VARCHAR(255),
    linked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_linked_account_user_provider UNIQUE (user_id, provider),
    CONSTRAINT uq_linked_account_provider_id UNIQUE (provider, provider_id)
);

CREATE INDEX idx_linked_account_user ON linked_account (user_id);
CREATE INDEX idx_linked_account_provider ON linked_account (provider, provider_id);

-- Migrate existing OAuth users to linked_account table
INSERT INTO linked_account (user_id, provider, provider_id, provider_email, linked_at, created_at, updated_at)
SELECT id, provider, provider_id, email, created_at, created_at, NOW()
FROM "user"
WHERE provider != 'local' AND provider IS NOT NULL AND provider_id IS NOT NULL;

-- =====================================================
-- 2. NOTIFICATION PREFERENCES
-- =====================================================

CREATE TABLE notification_preference (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID NOT NULL UNIQUE REFERENCES "user" (id) ON DELETE CASCADE,

    -- Quiz Activity
    quiz_completed              BOOLEAN NOT NULL DEFAULT true,
    quiz_results_ready          BOOLEAN NOT NULL DEFAULT true,

    -- Course Activity
    new_enrollment              BOOLEAN NOT NULL DEFAULT true,
    course_progress             BOOLEAN NOT NULL DEFAULT false,

    -- Security Alerts
    security_new_login          BOOLEAN NOT NULL DEFAULT true,
    security_password_change    BOOLEAN NOT NULL DEFAULT true,

    -- Marketing & Digest
    marketing                   BOOLEAN NOT NULL DEFAULT true,
    weekly_digest               BOOLEAN NOT NULL DEFAULT false,

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_preference_user ON notification_preference (user_id);

-- Create default notification preferences for all existing users
INSERT INTO notification_preference (user_id, created_at, updated_at)
SELECT id, NOW(), NOW()
FROM "user"
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preference np WHERE np.user_id = "user".id
);

-- =====================================================
-- 3. ACCOUNT DELETION REQUESTS
-- =====================================================

CREATE TABLE account_deletion_request (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reason              TEXT,
    requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_deletion  TIMESTAMPTZ NOT NULL,
    cancelled_at        TIMESTAMPTZ,
    processed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_deletion_status CHECK (status IN ('PENDING', 'CANCELLED', 'PROCESSED'))
);

CREATE INDEX idx_deletion_request_user ON account_deletion_request (user_id);
CREATE INDEX idx_deletion_request_pending ON account_deletion_request (status, scheduled_deletion)
    WHERE status = 'PENDING';

-- =====================================================
-- 4. DATA EXPORT REQUESTS
-- =====================================================

CREATE TABLE data_export_request (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    file_path           VARCHAR(500),
    file_size_bytes     BIGINT,
    expires_at          TIMESTAMPTZ,
    requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    error_message       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_export_status CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED'))
);

CREATE INDEX idx_export_request_user ON data_export_request (user_id);
CREATE INDEX idx_export_request_status ON data_export_request (status);

-- =====================================================
-- 5. TWO-FACTOR AUTHENTICATION
-- =====================================================

-- Add 2FA columns to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(32);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS two_factor_confirmed_at TIMESTAMPTZ;

-- Backup codes for 2FA recovery
CREATE TABLE two_factor_backup_code (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    code_hash   VARCHAR(60) NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_2fa_backup_user ON two_factor_backup_code (user_id);
CREATE INDEX idx_2fa_backup_unused ON two_factor_backup_code (user_id) WHERE used_at IS NULL;

-- =====================================================
-- 6. USER SESSIONS
-- =====================================================

CREATE TABLE user_session (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    refresh_token_id    UUID REFERENCES refresh_token (id) ON DELETE SET NULL,

    -- Device/Browser info
    device_name         VARCHAR(100),
    browser             VARCHAR(50),
    os                  VARCHAR(50),

    -- Location info
    ip_address          VARCHAR(45) NOT NULL,
    country             VARCHAR(100),
    city                VARCHAR(100),

    -- Status
    is_current          BOOLEAN NOT NULL DEFAULT false,
    last_active_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at          TIMESTAMPTZ,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_session_user ON user_session (user_id);
CREATE INDEX idx_user_session_active ON user_session (user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_user_session_refresh_token ON user_session (refresh_token_id);

-- =====================================================
-- 7. EMAIL CHANGE REQUESTS
-- =====================================================

CREATE TABLE email_change_request (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    new_email       VARCHAR(255) NOT NULL,
    token           VARCHAR(255) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    confirmed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_change_user ON email_change_request (user_id);
CREATE INDEX idx_email_change_token ON email_change_request (token);
