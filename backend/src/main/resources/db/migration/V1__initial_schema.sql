-- Froebel Initial Schema
-- V1: Complete database schema for learning platform
-- Consolidated from V1-V20 (excluding V2 role migration and V6 seed data)

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users
(
    id                              UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    email                           VARCHAR(255) NOT NULL UNIQUE,
    password                        VARCHAR(255),
    display_name                    VARCHAR(255) NOT NULL,
    role                            VARCHAR(50)  NOT NULL,
    avatar_url                      VARCHAR(500),
    provider                        VARCHAR(50)           DEFAULT 'local',
    provider_id                     VARCHAR(255),
    email_verified                  BOOLEAN               DEFAULT false,
    email_verification_token        VARCHAR(255),
    email_verification_token_expiry TIMESTAMPTZ,
    -- Profile fields (from V3)
    full_name                       VARCHAR(255),
    bio                             TEXT,
    location                        VARCHAR(255),
    website                         VARCHAR(500),
    social_links                    JSONB                 DEFAULT '{}',
    -- Privacy settings (from V3)
    profile_public                  BOOLEAN               DEFAULT true,
    show_email                      BOOLEAN               DEFAULT false,
    show_stats                      BOOLEAN               DEFAULT true,
    -- Timestamps
    created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens
(
    id          UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    token       VARCHAR(500) NOT NULL UNIQUE,
    user_id     UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    expiry_date TIMESTAMPTZ  NOT NULL,
    revoked     BOOLEAN               DEFAULT false,
    version     BIGINT                DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE password_reset_tokens
(
    id          UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    token       VARCHAR(255) NOT NULL UNIQUE,
    user_id     UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    expiry_date TIMESTAMPTZ  NOT NULL,
    used        BOOLEAN               DEFAULT false,
    version     BIGINT                DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Login attempts tracking for account lockout (from V12)
CREATE TABLE login_attempts
(
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email        VARCHAR(255)     NOT NULL,
    ip_address   VARCHAR(45)      NOT NULL,
    attempted_at TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    successful   BOOLEAN          NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE login_attempts IS 'Tracks login attempts for account lockout functionality. Records are cleaned up after 24 hours.';

-- =====================================================
-- 2. ORGANIZATION (Categories & Tags)
-- =====================================================

CREATE TABLE categories
(
    id          UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_id   UUID         REFERENCES categories (id) ON DELETE SET NULL,
    icon        VARCHAR(100),
    sort_order  INTEGER               DEFAULT 0,
    -- Additional fields (from V8)
    usage_count INTEGER      NOT NULL DEFAULT 0,
    color       VARCHAR(7),
    image_url   VARCHAR(500),
    is_featured BOOLEAN      NOT NULL DEFAULT false,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    -- Timestamps
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE tags
(
    id          UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    color       VARCHAR(7),
    -- Additional fields (from V8)
    usage_count INTEGER      NOT NULL DEFAULT 0,
    icon        VARCHAR(100),
    -- Timestamps
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. MEDIA STORAGE
-- =====================================================

CREATE TABLE media
(
    id                UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    filename          VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type         VARCHAR(100) NOT NULL,
    size_bytes        BIGINT       NOT NULL,
    data              BYTEA,
    url               VARCHAR(500),
    storage_type      VARCHAR(50)           DEFAULT 'database',
    uploader_id       UUID         REFERENCES users (id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. COURSES & LESSONS
-- =====================================================

CREATE TABLE courses
(
    id              UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    image_url       VARCHAR(500),
    creator_id      UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    category_id     UUID         REFERENCES categories (id) ON DELETE SET NULL,
    published       BOOLEAN               DEFAULT false,
    difficulty      VARCHAR(50),
    estimated_hours DECIMAL(5, 2),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE course_tags
(
    course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    tag_id    UUID NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, tag_id)
);

CREATE TABLE lessons
(
    id               UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    course_id        UUID         NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    title            VARCHAR(255) NOT NULL,
    content          TEXT,
    lesson_order     INTEGER      NOT NULL DEFAULT 0,
    duration_minutes INTEGER,
    published        BOOLEAN               DEFAULT false,
    -- From V4
    content_type     VARCHAR(20)           DEFAULT 'TEXT',
    file_id          UUID         REFERENCES media (id) ON DELETE SET NULL,
    -- Timestamps
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE lesson_media
(
    lesson_id  UUID NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
    media_id   UUID NOT NULL REFERENCES media (id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (lesson_id, media_id)
);

-- Enrollments (from V4, using TIMESTAMPTZ)
CREATE TABLE enrollments
(
    id           UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    course_id    UUID         NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    enrolled_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);

-- Material progress (from V4, using TIMESTAMPTZ)
CREATE TABLE material_progress
(
    id            UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    enrollment_id UUID         NOT NULL REFERENCES enrollments (id) ON DELETE CASCADE,
    material_id   UUID         NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
    completed_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (enrollment_id, material_id)
);

-- =====================================================
-- 5. QUIZZES & QUESTIONS
-- =====================================================

CREATE TABLE quizzes
(
    id                   UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    title                VARCHAR(255) NOT NULL,
    description          TEXT,
    image_url            VARCHAR(500),
    -- Icon and banner (as TEXT for base64 data URLs, from V19+V20)
    icon_url             TEXT,
    banner_url           TEXT,
    -- Shareable ID (from V18)
    shareable_id         VARCHAR(8)   NOT NULL UNIQUE,
    -- Relationships
    creator_id           UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    course_id            UUID         REFERENCES courses (id) ON DELETE SET NULL,
    category_id          UUID         REFERENCES categories (id) ON DELETE SET NULL,
    lesson_id            UUID         REFERENCES lessons (id) ON DELETE SET NULL,
    -- Status (from V9, replaces boolean published)
    status               VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    is_public            BOOLEAN               DEFAULT true,
    allow_anonymous      BOOLEAN               DEFAULT false,
    -- Time limit (renamed from timer_minutes in V11)
    time_limit           INTEGER,
    passing_score        INTEGER,
    shuffle_questions    BOOLEAN               DEFAULT false,
    shuffle_choices      BOOLEAN               DEFAULT false,
    show_correct_answers BOOLEAN               DEFAULT true,
    max_attempts         INTEGER,
    ai_grading_enabled   BOOLEAN               DEFAULT false,
    -- Scheduling (from V5)
    available_from       TIMESTAMPTZ,
    available_until      TIMESTAMPTZ,
    results_visible_from TIMESTAMPTZ,
    -- Access restrictions (from V7)
    require_access_code  BOOLEAN      NOT NULL DEFAULT false,
    access_code          VARCHAR(20),
    filter_ip_addresses  BOOLEAN      NOT NULL DEFAULT false,
    allowed_ip_addresses TEXT,
    -- Version for optimistic locking (from V14)
    version              BIGINT       NOT NULL DEFAULT 0,
    -- Timestamps
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    -- Constraints
    CONSTRAINT chk_quiz_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT chk_availability_window CHECK (available_from IS NULL OR available_until IS NULL OR available_from < available_until),
    CONSTRAINT chk_access_code_required CHECK (NOT require_access_code OR (require_access_code AND access_code IS NOT NULL AND access_code != '')),
    CONSTRAINT chk_ip_addresses_required CHECK (NOT filter_ip_addresses OR (filter_ip_addresses AND allowed_ip_addresses IS NOT NULL AND allowed_ip_addresses != ''))
);

COMMENT ON COLUMN quizzes.version IS 'Optimistic locking version for concurrent edit detection';

CREATE TABLE quiz_tags
(
    quiz_id UUID NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
    tag_id  UUID NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (quiz_id, tag_id)
);

CREATE TABLE questions
(
    id             UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    quiz_id        UUID        NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
    text           TEXT        NOT NULL,
    type           VARCHAR(50) NOT NULL,
    points         INTEGER              DEFAULT 1,
    image_url      VARCHAR(500),
    chapter        VARCHAR(255),
    explanation    TEXT,
    data           JSONB,
    question_order INTEGER,
    -- Hint fields (from V11)
    hint_correct   TEXT,
    hint_wrong     TEXT,
    identifier     VARCHAR(100),
    -- Timestamps
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE question_media
(
    question_id UUID NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    media_id    UUID NOT NULL REFERENCES media (id) ON DELETE CASCADE,
    sort_order  INTEGER DEFAULT 0,
    PRIMARY KEY (question_id, media_id)
);

-- =====================================================
-- 6. QUIZ ATTEMPTS & ANSWERS
-- =====================================================

CREATE TABLE quiz_attempts
(
    id                   UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    quiz_id              UUID        NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
    user_id              UUID        REFERENCES users (id) ON DELETE SET NULL,
    anonymous_name       VARCHAR(255),
    anonymous_email      VARCHAR(255),
    -- Anonymous session tracking (from V10)
    anonymous_session_id VARCHAR(36),
    score                INTEGER,
    max_score            INTEGER,
    percentage           DECIMAL(5, 2),
    passed               BOOLEAN,
    started_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at         TIMESTAMPTZ,
    time_taken_seconds   INTEGER,
    ip_address           VARCHAR(45),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quiz_answers
(
    id                 UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    attempt_id         UUID        NOT NULL REFERENCES quiz_attempts (id) ON DELETE CASCADE,
    question_id        UUID        NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    answer_data        JSONB       NOT NULL,
    is_correct         BOOLEAN,
    points_earned      INTEGER              DEFAULT 0,
    time_taken_seconds INTEGER,
    answered_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 7. INDEXES
-- =====================================================

-- User lookups
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_profile_public ON users (profile_public) WHERE profile_public = true;
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens (token);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens (user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens (token);

-- Login attempts
CREATE INDEX idx_login_attempts_email ON login_attempts (email);
CREATE INDEX idx_login_attempts_email_timestamp ON login_attempts (email, attempted_at);

-- Category hierarchy
CREATE INDEX idx_categories_parent ON categories (parent_id);
CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_featured ON categories (is_featured) WHERE is_featured = true;
CREATE INDEX idx_categories_active ON categories (is_active) WHERE is_active = true;

-- Tags
CREATE INDEX idx_tags_slug ON tags (slug);

-- Content lookups
CREATE INDEX idx_courses_creator ON courses (creator_id);
CREATE INDEX idx_courses_category ON courses (category_id);
CREATE INDEX idx_lessons_course ON lessons (course_id);
CREATE INDEX idx_lessons_content_type ON lessons (content_type);

-- Enrollments
CREATE INDEX idx_enrollments_user ON enrollments (user_id);
CREATE INDEX idx_enrollments_course ON enrollments (course_id);
CREATE INDEX idx_material_progress_enrollment ON material_progress (enrollment_id);
CREATE INDEX idx_material_progress_material ON material_progress (material_id);

-- Quizzes
CREATE INDEX idx_quizzes_creator ON quizzes (creator_id);
CREATE INDEX idx_quizzes_course ON quizzes (course_id);
CREATE INDEX idx_quizzes_category ON quizzes (category_id);
CREATE INDEX idx_quizzes_lesson ON quizzes (lesson_id);
CREATE INDEX idx_quizzes_shareable_id ON quizzes (shareable_id);
CREATE INDEX idx_quizzes_availability ON quizzes (available_from, available_until) WHERE status = 'PUBLISHED';
CREATE INDEX idx_quizzes_public_browse ON quizzes (created_at DESC) WHERE status = 'PUBLISHED' AND is_public = true;

-- Questions
CREATE INDEX idx_questions_quiz ON questions (quiz_id);
CREATE INDEX idx_questions_quiz_order ON questions (quiz_id, question_order);

-- Unique question order per quiz (from V17)
ALTER TABLE questions ADD CONSTRAINT unique_question_order_per_quiz UNIQUE (quiz_id, question_order);

-- Attempt tracking
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts (quiz_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts (user_id);
CREATE INDEX idx_quiz_attempts_quiz_completed ON quiz_attempts (quiz_id, completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_quiz_attempts_started_at ON quiz_attempts (quiz_id, started_at);
CREATE INDEX idx_attempts_quiz_ip ON quiz_attempts (quiz_id, ip_address);
CREATE INDEX idx_attempts_user_completed ON quiz_attempts (quiz_id, user_id, completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_quiz_attempts_anonymous_session ON quiz_attempts (quiz_id, anonymous_session_id) WHERE anonymous_session_id IS NOT NULL;

-- Unique in-progress attempt constraints (from V10)
CREATE UNIQUE INDEX idx_unique_in_progress_user_attempt ON quiz_attempts (quiz_id, user_id) WHERE completed_at IS NULL AND user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_unique_in_progress_anonymous_session_attempt ON quiz_attempts (quiz_id, anonymous_session_id) WHERE completed_at IS NULL AND user_id IS NULL AND anonymous_session_id IS NOT NULL;

-- Answers
CREATE INDEX idx_quiz_answers_attempt ON quiz_answers (attempt_id);
CREATE INDEX idx_quiz_answers_question ON quiz_answers (question_id);
CREATE INDEX idx_quiz_answers_question_correct ON quiz_answers (question_id, is_correct);
CREATE INDEX idx_answers_attempt_question ON quiz_answers (attempt_id, question_id);

-- Media lookups
CREATE INDEX idx_media_uploader ON media (uploader_id);
