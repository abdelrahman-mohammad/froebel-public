-- V3: Rename tables from plural to singular naming convention
-- This migration renames all tables to use singular form for consistency

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================

ALTER TABLE users RENAME TO "user";
ALTER TABLE refresh_tokens RENAME TO refresh_token;
ALTER TABLE password_reset_tokens RENAME TO password_reset_token;
ALTER TABLE login_attempts RENAME TO login_attempt;

-- =====================================================
-- 2. ORGANIZATION (Categories & Tags)
-- =====================================================

ALTER TABLE categories RENAME TO category;
ALTER TABLE tags RENAME TO tag;

-- =====================================================
-- 3. COURSES & LESSONS
-- =====================================================

ALTER TABLE courses RENAME TO course;
ALTER TABLE course_tags RENAME TO course_tag;
ALTER TABLE lessons RENAME TO lesson;
ALTER TABLE enrollments RENAME TO enrollment;

-- =====================================================
-- 4. QUIZZES & QUESTIONS
-- =====================================================

ALTER TABLE quizzes RENAME TO quiz;
ALTER TABLE quiz_tags RENAME TO quiz_tag;
ALTER TABLE questions RENAME TO question;

-- =====================================================
-- 5. QUIZ ATTEMPTS & ANSWERS
-- =====================================================

ALTER TABLE quiz_attempts RENAME TO quiz_attempt;
ALTER TABLE quiz_answers RENAME TO quiz_answer;

-- =====================================================
-- Note: The following tables already use singular/unchanged naming:
-- - media (already singular)
-- - lesson_media (compound, kept as-is)
-- - question_media (compound, kept as-is)
-- - material_progress (compound, kept as-is)
-- =====================================================
