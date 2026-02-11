-- V2: Seed Default Categories
-- Pre-populate categories table with a curated set of default categories

-- =====================================================
-- ROOT CATEGORIES
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES
-- Programming & Development
('10000000-0000-0000-0000-000000000001', 'Programming & Development', 'programming-development',
 'Software development, coding, and programming languages', NULL, 'code', 0, NOW(), NOW()),
-- Science & Mathematics
('10000000-0000-0000-0000-000000000002', 'Science & Mathematics', 'science-mathematics',
 'STEM subjects including physics, chemistry, biology, and math', NULL, 'flask', 1, NOW(), NOW()),
-- Languages
('10000000-0000-0000-0000-000000000003', 'Languages', 'languages', 'Language learning and linguistics', NULL,
 'languages', 2, NOW(), NOW()),
-- Business & Finance
('10000000-0000-0000-0000-000000000004', 'Business & Finance', 'business-finance',
 'Business, economics, accounting, and finance', NULL, 'briefcase', 3, NOW(), NOW()),
-- Arts & Humanities
('10000000-0000-0000-0000-000000000005', 'Arts & Humanities', 'arts-humanities',
 'History, literature, philosophy, and creative arts', NULL, 'palette', 4, NOW(), NOW()),
-- Health & Medicine
('10000000-0000-0000-0000-000000000006', 'Health & Medicine', 'health-medicine',
 'Medical sciences, healthcare, and wellness', NULL, 'heart-pulse', 5, NOW(), NOW()),
-- Technology & IT
('10000000-0000-0000-0000-000000000007', 'Technology & IT', 'technology-it',
 'IT infrastructure, networking, and cybersecurity', NULL, 'server', 6, NOW(), NOW()),
-- Test Prep & Certifications
('10000000-0000-0000-0000-000000000008', 'Test Prep & Certifications', 'test-prep-certifications',
 'Standardized tests and professional certifications', NULL, 'award', 7, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Programming & Development
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0001-000000000001', 'Web Development', 'web-development',
        'Frontend and backend web development', '10000000-0000-0000-0000-000000000001', 'globe', 0, NOW(), NOW()),
       ('20000000-0000-0000-0001-000000000002', 'Mobile Development', 'mobile-development',
        'iOS, Android, and cross-platform mobile apps', '10000000-0000-0000-0000-000000000001', 'smartphone', 1, NOW(),
        NOW()),
       ('20000000-0000-0000-0001-000000000003', 'Data Science', 'data-science',
        'Data analysis, machine learning, and AI', '10000000-0000-0000-0000-000000000001', 'chart-bar', 2, NOW(),
        NOW()),
       ('20000000-0000-0000-0001-000000000004', 'DevOps', 'devops',
        'CI/CD, containerization, and infrastructure automation', '10000000-0000-0000-0000-000000000001', 'git-branch',
        3, NOW(), NOW()),
       ('20000000-0000-0000-0001-000000000005', 'Game Development', 'game-development',
        'Video game design and development', '10000000-0000-0000-0000-000000000001', 'gamepad', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Science & Mathematics
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0002-000000000001', 'Physics', 'physics',
        'Classical mechanics, quantum physics, and thermodynamics', '10000000-0000-0000-0000-000000000002', 'atom', 0,
        NOW(), NOW()),
       ('20000000-0000-0000-0002-000000000002', 'Chemistry', 'chemistry', 'Organic, inorganic, and physical chemistry',
        '10000000-0000-0000-0000-000000000002', 'flask', 1, NOW(), NOW()),
       ('20000000-0000-0000-0002-000000000003', 'Biology', 'biology', 'Life sciences, genetics, and ecology',
        '10000000-0000-0000-0000-000000000002', 'leaf', 2, NOW(), NOW()),
       ('20000000-0000-0000-0002-000000000004', 'Mathematics', 'mathematics',
        'Algebra, calculus, statistics, and discrete math', '10000000-0000-0000-0000-000000000002', 'calculator', 3,
        NOW(), NOW()),
       ('20000000-0000-0000-0002-000000000005', 'Environmental Science', 'environmental-science',
        'Climate, ecosystems, and sustainability', '10000000-0000-0000-0000-000000000002', 'tree', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Languages
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0003-000000000001', 'English', 'english', 'English language learning and proficiency',
        '10000000-0000-0000-0000-000000000003', 'a-large-small', 0, NOW(), NOW()),
       ('20000000-0000-0000-0003-000000000002', 'Spanish', 'spanish', 'Spanish language learning',
        '10000000-0000-0000-0000-000000000003', 'a-large-small', 1, NOW(), NOW()),
       ('20000000-0000-0000-0003-000000000003', 'French', 'french', 'French language learning',
        '10000000-0000-0000-0000-000000000003', 'a-large-small', 2, NOW(), NOW()),
       ('20000000-0000-0000-0003-000000000004', 'German', 'german', 'German language learning',
        '10000000-0000-0000-0000-000000000003', 'a-large-small', 3, NOW(), NOW()),
       ('20000000-0000-0000-0003-000000000005', 'Japanese', 'japanese', 'Japanese language learning',
        '10000000-0000-0000-0000-000000000003', 'a-large-small', 4, NOW(), NOW()),
       ('20000000-0000-0000-0003-000000000006', 'Chinese', 'chinese', 'Mandarin Chinese language learning',
        '10000000-0000-0000-0000-000000000003', 'a-large-small', 5, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Business & Finance
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0004-000000000001', 'Accounting', 'accounting', 'Financial accounting and bookkeeping',
        '10000000-0000-0000-0000-000000000004', 'calculator', 0, NOW(), NOW()),
       ('20000000-0000-0000-0004-000000000002', 'Marketing', 'marketing', 'Digital marketing, branding, and strategy',
        '10000000-0000-0000-0000-000000000004', 'megaphone', 1, NOW(), NOW()),
       ('20000000-0000-0000-0004-000000000003', 'Management', 'management',
        'Leadership, project management, and operations', '10000000-0000-0000-0000-000000000004', 'users', 2, NOW(),
        NOW()),
       ('20000000-0000-0000-0004-000000000004', 'Economics', 'economics', 'Micro and macroeconomics',
        '10000000-0000-0000-0000-000000000004', 'trending-up', 3, NOW(), NOW()),
       ('20000000-0000-0000-0004-000000000005', 'Entrepreneurship', 'entrepreneurship',
        'Startups, business planning, and innovation', '10000000-0000-0000-0000-000000000004', 'rocket', 4, NOW(),
        NOW());

-- =====================================================
-- SUBCATEGORIES: Arts & Humanities
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0005-000000000001', 'History', 'history', 'World history and historical events',
        '10000000-0000-0000-0000-000000000005', 'clock', 0, NOW(), NOW()),
       ('20000000-0000-0000-0005-000000000002', 'Literature', 'literature', 'Classic and modern literature',
        '10000000-0000-0000-0000-000000000005', 'book-open', 1, NOW(), NOW()),
       ('20000000-0000-0000-0005-000000000003', 'Philosophy', 'philosophy', 'Ethics, logic, and philosophical thought',
        '10000000-0000-0000-0000-000000000005', 'lightbulb', 2, NOW(), NOW()),
       ('20000000-0000-0000-0005-000000000004', 'Music', 'music', 'Music theory, history, and appreciation',
        '10000000-0000-0000-0000-000000000005', 'music', 3, NOW(), NOW()),
       ('20000000-0000-0000-0005-000000000005', 'Visual Arts', 'visual-arts', 'Painting, sculpture, and art history',
        '10000000-0000-0000-0000-000000000005', 'image', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Health & Medicine
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0006-000000000001', 'Anatomy', 'anatomy', 'Human anatomy and physiology',
        '10000000-0000-0000-0000-000000000006', 'bone', 0, NOW(), NOW()),
       ('20000000-0000-0000-0006-000000000002', 'Nursing', 'nursing', 'Nursing practices and patient care',
        '10000000-0000-0000-0000-000000000006', 'stethoscope', 1, NOW(), NOW()),
       ('20000000-0000-0000-0006-000000000003', 'Pharmacy', 'pharmacy', 'Pharmacology and drug information',
        '10000000-0000-0000-0000-000000000006', 'pill', 2, NOW(), NOW()),
       ('20000000-0000-0000-0006-000000000004', 'Mental Health', 'mental-health', 'Psychology and mental wellness',
        '10000000-0000-0000-0000-000000000006', 'brain', 3, NOW(), NOW()),
       ('20000000-0000-0000-0006-000000000005', 'Nutrition', 'nutrition', 'Diet, nutrition, and healthy eating',
        '10000000-0000-0000-0000-000000000006', 'apple', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Technology & IT
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0007-000000000001', 'Networking', 'networking', 'Computer networks and protocols',
        '10000000-0000-0000-0000-000000000007', 'network', 0, NOW(), NOW()),
       ('20000000-0000-0000-0007-000000000002', 'Cybersecurity', 'cybersecurity',
        'Information security and ethical hacking', '10000000-0000-0000-0000-000000000007', 'shield', 1, NOW(), NOW()),
       ('20000000-0000-0000-0007-000000000003', 'Cloud Computing', 'cloud-computing',
        'AWS, Azure, GCP, and cloud architecture', '10000000-0000-0000-0000-000000000007', 'cloud', 2, NOW(), NOW()),
       ('20000000-0000-0000-0007-000000000004', 'Databases', 'databases', 'SQL, NoSQL, and database administration',
        '10000000-0000-0000-0000-000000000007', 'database', 3, NOW(), NOW()),
       ('20000000-0000-0000-0007-000000000005', 'System Administration', 'system-administration',
        'Linux, Windows, and server management', '10000000-0000-0000-0000-000000000007', 'terminal', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Test Prep & Certifications
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0008-000000000001', 'SAT/ACT', 'sat-act', 'College entrance exam preparation',
        '10000000-0000-0000-0000-000000000008', 'graduation-cap', 0, NOW(), NOW()),
       ('20000000-0000-0000-0008-000000000002', 'GRE/GMAT', 'gre-gmat', 'Graduate school entrance exams',
        '10000000-0000-0000-0000-000000000008', 'graduation-cap', 1, NOW(), NOW()),
       ('20000000-0000-0000-0008-000000000003', 'AWS Certifications', 'aws-certifications',
        'Amazon Web Services certification prep', '10000000-0000-0000-0000-000000000008', 'cloud', 2, NOW(), NOW()),
       ('20000000-0000-0000-0008-000000000004', 'Microsoft Certifications', 'microsoft-certifications',
        'Microsoft Azure and Office certifications', '10000000-0000-0000-0000-000000000008', 'windows', 3, NOW(),
        NOW()),
       ('20000000-0000-0000-0008-000000000005', 'Language Proficiency', 'language-proficiency',
        'TOEFL, IELTS, and language certification exams', '10000000-0000-0000-0000-000000000008', 'languages', 4, NOW(),
        NOW()),
       ('20000000-0000-0000-0008-000000000006', 'Google Certifications', 'google-certifications',
        'Google Cloud and analytics certifications', '10000000-0000-0000-0000-000000000008', 'cloud', 5, NOW(), NOW()),
       ('20000000-0000-0000-0008-000000000007', 'Cisco Certifications', 'cisco-certifications',
        'CCNA, CCNP, and networking certifications', '10000000-0000-0000-0000-000000000008', 'network', 6, NOW(),
        NOW()),
       ('20000000-0000-0000-0008-000000000008', 'CompTIA', 'comptia', 'A+, Network+, Security+ certifications',
        '10000000-0000-0000-0000-000000000008', 'shield', 7, NOW(), NOW()),
       ('20000000-0000-0000-0008-000000000009', 'PMP', 'pmp', 'Project Management Professional certification',
        '10000000-0000-0000-0000-000000000008', 'clipboard', 8, NOW(), NOW());

-- =====================================================
-- NEW ROOT CATEGORIES (9-22)
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES
-- Education & Teaching
('10000000-0000-0000-0000-000000000009', 'Education & Teaching', 'education-teaching',
 'Pedagogy, curriculum design, and classroom management', NULL, 'graduation-cap', 8, NOW(), NOW()),
-- Law & Legal Studies
('10000000-0000-0000-0000-000000000010', 'Law & Legal Studies', 'law-legal-studies',
 'Legal systems, contracts, criminal and civil law', NULL, 'scale', 9, NOW(), NOW()),
-- Engineering
('10000000-0000-0000-0000-000000000011', 'Engineering', 'engineering',
 'Mechanical, electrical, civil, and chemical engineering', NULL, 'wrench', 10, NOW(), NOW()),
-- Social Sciences
('10000000-0000-0000-0000-000000000012', 'Social Sciences', 'social-sciences',
 'Psychology, sociology, anthropology, and political science', NULL, 'users', 11, NOW(), NOW()),
-- Sports & Fitness
('10000000-0000-0000-0000-000000000013', 'Sports & Fitness', 'sports-fitness',
 'Training, nutrition, sports psychology, and athletics', NULL, 'dumbbell', 12, NOW(), NOW()),
-- Music & Audio
('10000000-0000-0000-0000-000000000014', 'Music & Audio', 'music-audio',
 'Music production, instruments, and audio engineering', NULL, 'headphones', 13, NOW(), NOW()),
-- Film & Media
('10000000-0000-0000-0000-000000000015', 'Film & Media', 'film-media',
 'Video production, filmmaking, and media studies', NULL, 'video', 14, NOW(), NOW()),
-- Design
('10000000-0000-0000-0000-000000000016', 'Design', 'design', 'Graphic design, UX/UI, and product design', NULL,
 'pen-tool', 15, NOW(), NOW()),
-- Architecture
('10000000-0000-0000-0000-000000000017', 'Architecture', 'architecture',
 'Architectural design, urban planning, and construction', NULL, 'building', 16, NOW(), NOW()),
-- Agriculture
('10000000-0000-0000-0000-000000000018', 'Agriculture', 'agriculture', 'Farming, horticulture, and food science', NULL,
 'wheat', 17, NOW(), NOW()),
-- Hospitality & Tourism
('10000000-0000-0000-0000-000000000019', 'Hospitality & Tourism', 'hospitality-tourism',
 'Hotel management, travel, and culinary arts', NULL, 'hotel', 18, NOW(), NOW()),
-- Personal Development
('10000000-0000-0000-0000-000000000020', 'Personal Development', 'personal-development',
 'Productivity, communication, and leadership skills', NULL, 'target', 19, NOW(), NOW()),
-- Religion & Spirituality
('10000000-0000-0000-0000-000000000021', 'Religion & Spirituality', 'religion-spirituality',
 'World religions and philosophy of religion', NULL, 'book', 20, NOW(), NOW()),
-- Geography
('10000000-0000-0000-0000-000000000022', 'Geography', 'geography', 'Physical geography, cartography, and GIS', NULL,
 'map', 21, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Education & Teaching
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0009-000000000001', 'Curriculum Design', 'curriculum-design',
        'Designing effective learning curricula', '10000000-0000-0000-0000-000000000009', 'book-open', 0, NOW(), NOW()),
       ('20000000-0000-0000-0009-000000000002', 'Classroom Management', 'classroom-management',
        'Strategies for managing classrooms effectively', '10000000-0000-0000-0000-000000000009', 'users', 1, NOW(),
        NOW()),
       ('20000000-0000-0000-0009-000000000003', 'E-Learning', 'e-learning',
        'Online education and digital learning tools', '10000000-0000-0000-0000-000000000009', 'laptop', 2, NOW(),
        NOW()),
       ('20000000-0000-0000-0009-000000000004', 'Special Education', 'special-education',
        'Teaching students with special needs', '10000000-0000-0000-0000-000000000009', 'heart', 3, NOW(), NOW()),
       ('20000000-0000-0000-0009-000000000005', 'Early Childhood', 'early-childhood',
        'Early childhood education and development', '10000000-0000-0000-0000-000000000009', 'baby', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Law & Legal Studies
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0010-000000000001', 'Criminal Law', 'criminal-law', 'Criminal justice and prosecution',
        '10000000-0000-0000-0000-000000000010', 'gavel', 0, NOW(), NOW()),
       ('20000000-0000-0000-0010-000000000002', 'Civil Law', 'civil-law', 'Civil disputes and litigation',
        '10000000-0000-0000-0000-000000000010', 'file-text', 1, NOW(), NOW()),
       ('20000000-0000-0000-0010-000000000003', 'Contract Law', 'contract-law', 'Legal agreements and contracts',
        '10000000-0000-0000-0000-000000000010', 'file-signature', 2, NOW(), NOW()),
       ('20000000-0000-0000-0010-000000000004', 'Constitutional Law', 'constitutional-law',
        'Constitutional rights and governance', '10000000-0000-0000-0000-000000000010', 'landmark', 3, NOW(), NOW()),
       ('20000000-0000-0000-0010-000000000005', 'International Law', 'international-law',
        'International treaties and global law', '10000000-0000-0000-0000-000000000010', 'globe', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Engineering
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0011-000000000001', 'Mechanical Engineering', 'mechanical-engineering',
        'Mechanics, thermodynamics, and machine design', '10000000-0000-0000-0000-000000000011', 'cog', 0, NOW(),
        NOW()),
       ('20000000-0000-0000-0011-000000000002', 'Electrical Engineering', 'electrical-engineering',
        'Circuits, electronics, and power systems', '10000000-0000-0000-0000-000000000011', 'zap', 1, NOW(), NOW()),
       ('20000000-0000-0000-0011-000000000003', 'Civil Engineering', 'civil-engineering',
        'Structures, construction, and infrastructure', '10000000-0000-0000-0000-000000000011', 'hard-hat', 2, NOW(),
        NOW()),
       ('20000000-0000-0000-0011-000000000004', 'Chemical Engineering', 'chemical-engineering',
        'Chemical processes and materials', '10000000-0000-0000-0000-000000000011', 'flask-conical', 3, NOW(), NOW()),
       ('20000000-0000-0000-0011-000000000005', 'Software Engineering', 'software-engineering',
        'Software design, testing, and architecture', '10000000-0000-0000-0000-000000000011', 'code', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Social Sciences
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0012-000000000001', 'Psychology', 'psychology', 'Human behavior and mental processes',
        '10000000-0000-0000-0000-000000000012', 'brain', 0, NOW(), NOW()),
       ('20000000-0000-0000-0012-000000000002', 'Sociology', 'sociology', 'Society, social behavior, and institutions',
        '10000000-0000-0000-0000-000000000012', 'users', 1, NOW(), NOW()),
       ('20000000-0000-0000-0012-000000000003', 'Anthropology', 'anthropology', 'Human cultures and evolution',
        '10000000-0000-0000-0000-000000000012', 'user', 2, NOW(), NOW()),
       ('20000000-0000-0000-0012-000000000004', 'Political Science', 'political-science',
        'Government, politics, and policy', '10000000-0000-0000-0000-000000000012', 'landmark', 3, NOW(), NOW()),
       ('20000000-0000-0000-0012-000000000005', 'Economics Theory', 'economics-theory', 'Economic theories and models',
        '10000000-0000-0000-0000-000000000012', 'trending-up', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Sports & Fitness
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0013-000000000001', 'Strength Training', 'strength-training',
        'Weight training and muscle building', '10000000-0000-0000-0000-000000000013', 'dumbbell', 0, NOW(), NOW()),
       ('20000000-0000-0000-0013-000000000002', 'Cardio & Endurance', 'cardio-endurance',
        'Cardiovascular fitness and stamina', '10000000-0000-0000-0000-000000000013', 'heart-pulse', 1, NOW(), NOW()),
       ('20000000-0000-0000-0013-000000000003', 'Sports Nutrition', 'sports-nutrition',
        'Nutrition for athletic performance', '10000000-0000-0000-0000-000000000013', 'apple', 2, NOW(), NOW()),
       ('20000000-0000-0000-0013-000000000004', 'Yoga & Flexibility', 'yoga-flexibility',
        'Yoga, stretching, and flexibility training', '10000000-0000-0000-0000-000000000013', 'sparkles', 3, NOW(),
        NOW()),
       ('20000000-0000-0000-0013-000000000005', 'Team Sports', 'team-sports', 'Soccer, basketball, and team athletics',
        '10000000-0000-0000-0000-000000000013', 'trophy', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Music & Audio
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0014-000000000001', 'Music Theory', 'music-theory', 'Fundamentals of music composition',
        '10000000-0000-0000-0000-000000000014', 'music', 0, NOW(), NOW()),
       ('20000000-0000-0000-0014-000000000002', 'Instruments', 'instruments', 'Learning musical instruments',
        '10000000-0000-0000-0000-000000000014', 'guitar', 1, NOW(), NOW()),
       ('20000000-0000-0000-0014-000000000003', 'Music Production', 'music-production',
        'Recording, mixing, and producing music', '10000000-0000-0000-0000-000000000014', 'sliders', 2, NOW(), NOW()),
       ('20000000-0000-0000-0014-000000000004', 'Audio Engineering', 'audio-engineering',
        'Sound design and audio technology', '10000000-0000-0000-0000-000000000014', 'volume-2', 3, NOW(), NOW()),
       ('20000000-0000-0000-0014-000000000005', 'Composition', 'composition', 'Writing and arranging music',
        '10000000-0000-0000-0000-000000000014', 'file-music', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Film & Media
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0015-000000000001', 'Filmmaking', 'filmmaking', 'Film production and direction',
        '10000000-0000-0000-0000-000000000015', 'clapperboard', 0, NOW(), NOW()),
       ('20000000-0000-0000-0015-000000000002', 'Video Editing', 'video-editing', 'Post-production and video editing',
        '10000000-0000-0000-0000-000000000015', 'film', 1, NOW(), NOW()),
       ('20000000-0000-0000-0015-000000000003', 'Screenwriting', 'screenwriting', 'Writing scripts for film and TV',
        '10000000-0000-0000-0000-000000000015', 'scroll', 2, NOW(), NOW()),
       ('20000000-0000-0000-0015-000000000004', 'Photography', 'photography', 'Digital and film photography',
        '10000000-0000-0000-0000-000000000015', 'camera', 3, NOW(), NOW()),
       ('20000000-0000-0000-0015-000000000005', 'Podcasting', 'podcasting', 'Podcast creation and production',
        '10000000-0000-0000-0000-000000000015', 'mic', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Design
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0016-000000000001', 'Graphic Design', 'graphic-design', 'Visual design and branding',
        '10000000-0000-0000-0000-000000000016', 'palette', 0, NOW(), NOW()),
       ('20000000-0000-0000-0016-000000000002', 'UX/UI Design', 'ux-ui-design', 'User experience and interface design',
        '10000000-0000-0000-0000-000000000016', 'layout', 1, NOW(), NOW()),
       ('20000000-0000-0000-0016-000000000003', 'Product Design', 'product-design',
        'Physical and digital product design', '10000000-0000-0000-0000-000000000016', 'box', 2, NOW(), NOW()),
       ('20000000-0000-0000-0016-000000000004', 'Motion Graphics', 'motion-graphics', 'Animation and motion design',
        '10000000-0000-0000-0000-000000000016', 'play-circle', 3, NOW(), NOW()),
       ('20000000-0000-0000-0016-000000000005', 'Typography', 'typography', 'Font design and typographic principles',
        '10000000-0000-0000-0000-000000000016', 'type', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Architecture
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0017-000000000001', 'Architectural Design', 'architectural-design',
        'Building design and architecture', '10000000-0000-0000-0000-000000000017', 'ruler', 0, NOW(), NOW()),
       ('20000000-0000-0000-0017-000000000002', 'Urban Planning', 'urban-planning', 'City planning and development',
        '10000000-0000-0000-0000-000000000017', 'map-pin', 1, NOW(), NOW()),
       ('20000000-0000-0000-0017-000000000003', 'Interior Design', 'interior-design', 'Interior spaces and decoration',
        '10000000-0000-0000-0000-000000000017', 'home', 2, NOW(), NOW()),
       ('20000000-0000-0000-0017-000000000004', 'Landscape Architecture', 'landscape-architecture',
        'Outdoor spaces and landscaping', '10000000-0000-0000-0000-000000000017', 'trees', 3, NOW(), NOW()),
       ('20000000-0000-0000-0017-000000000005', 'Sustainable Design', 'sustainable-design',
        'Green building and sustainability', '10000000-0000-0000-0000-000000000017', 'leaf', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Agriculture
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0018-000000000001', 'Crop Science', 'crop-science', 'Plant cultivation and crop management',
        '10000000-0000-0000-0000-000000000018', 'wheat', 0, NOW(), NOW()),
       ('20000000-0000-0000-0018-000000000002', 'Animal Husbandry', 'animal-husbandry',
        'Livestock management and breeding', '10000000-0000-0000-0000-000000000018', 'cow', 1, NOW(), NOW()),
       ('20000000-0000-0000-0018-000000000003', 'Horticulture', 'horticulture', 'Garden plants and ornamental crops',
        '10000000-0000-0000-0000-000000000018', 'flower', 2, NOW(), NOW()),
       ('20000000-0000-0000-0018-000000000004', 'Food Science', 'food-science', 'Food processing and technology',
        '10000000-0000-0000-0000-000000000018', 'utensils', 3, NOW(), NOW()),
       ('20000000-0000-0000-0018-000000000005', 'Sustainable Farming', 'sustainable-farming',
        'Organic and sustainable agriculture', '10000000-0000-0000-0000-000000000018', 'recycle', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Hospitality & Tourism
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0019-000000000001', 'Hotel Management', 'hotel-management',
        'Hotel operations and hospitality', '10000000-0000-0000-0000-000000000019', 'hotel', 0, NOW(), NOW()),
       ('20000000-0000-0000-0019-000000000002', 'Travel & Tourism', 'travel-tourism',
        'Tourism industry and travel planning', '10000000-0000-0000-0000-000000000019', 'plane', 1, NOW(), NOW()),
       ('20000000-0000-0000-0019-000000000003', 'Culinary Arts', 'culinary-arts',
        'Cooking, baking, and food preparation', '10000000-0000-0000-0000-000000000019', 'chef-hat', 2, NOW(), NOW()),
       ('20000000-0000-0000-0019-000000000004', 'Event Management', 'event-management',
        'Planning and organizing events', '10000000-0000-0000-0000-000000000019', 'calendar', 3, NOW(), NOW()),
       ('20000000-0000-0000-0019-000000000005', 'Restaurant Management', 'restaurant-management',
        'Restaurant operations and service', '10000000-0000-0000-0000-000000000019', 'utensils-crossed', 4, NOW(),
        NOW());

-- =====================================================
-- SUBCATEGORIES: Personal Development
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0020-000000000001', 'Productivity', 'productivity', 'Time management and efficiency',
        '10000000-0000-0000-0000-000000000020', 'clock', 0, NOW(), NOW()),
       ('20000000-0000-0000-0020-000000000002', 'Communication Skills', 'communication-skills',
        'Effective communication techniques', '10000000-0000-0000-0000-000000000020', 'message-circle', 1, NOW(),
        NOW()),
       ('20000000-0000-0000-0020-000000000003', 'Leadership', 'leadership', 'Leadership and management skills',
        '10000000-0000-0000-0000-000000000020', 'crown', 2, NOW(), NOW()),
       ('20000000-0000-0000-0020-000000000004', 'Time Management', 'time-management',
        'Organizing and prioritizing tasks', '10000000-0000-0000-0000-000000000020', 'timer', 3, NOW(), NOW()),
       ('20000000-0000-0000-0020-000000000005', 'Public Speaking', 'public-speaking', 'Presentation and oratory skills',
        '10000000-0000-0000-0000-000000000020', 'mic', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Religion & Spirituality
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0021-000000000001', 'World Religions', 'world-religions',
        'Major world religions and beliefs', '10000000-0000-0000-0000-000000000021', 'globe', 0, NOW(), NOW()),
       ('20000000-0000-0000-0021-000000000002', 'Philosophy of Religion', 'philosophy-of-religion',
        'Religious philosophy and theology', '10000000-0000-0000-0000-000000000021', 'lightbulb', 1, NOW(), NOW()),
       ('20000000-0000-0000-0021-000000000003', 'Meditation & Mindfulness', 'meditation-mindfulness',
        'Meditation practices and mindfulness', '10000000-0000-0000-0000-000000000021', 'sparkles', 2, NOW(), NOW()),
       ('20000000-0000-0000-0021-000000000004', 'Religious History', 'religious-history',
        'History of religious movements', '10000000-0000-0000-0000-000000000021', 'clock', 3, NOW(), NOW()),
       ('20000000-0000-0000-0021-000000000005', 'Ethics', 'ethics', 'Moral philosophy and ethical reasoning',
        '10000000-0000-0000-0000-000000000021', 'scale', 4, NOW(), NOW());

-- =====================================================
-- SUBCATEGORIES: Geography
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0022-000000000001', 'Physical Geography', 'physical-geography',
        'Landforms, climate, and natural features', '10000000-0000-0000-0000-000000000022', 'mountain', 0, NOW(),
        NOW()),
       ('20000000-0000-0000-0022-000000000002', 'Human Geography', 'human-geography',
        'Population, culture, and urban studies', '10000000-0000-0000-0000-000000000022', 'users', 1, NOW(), NOW()),
       ('20000000-0000-0000-0022-000000000003', 'Cartography', 'cartography', 'Map making and spatial representation',
        '10000000-0000-0000-0000-000000000022', 'map', 2, NOW(), NOW()),
       ('20000000-0000-0000-0022-000000000004', 'GIS & Remote Sensing', 'gis-remote-sensing',
        'Geographic information systems', '10000000-0000-0000-0000-000000000022', 'satellite', 3, NOW(), NOW()),
       ('20000000-0000-0000-0022-000000000005', 'Climatology', 'climatology', 'Climate patterns and weather science',
        '10000000-0000-0000-0000-000000000022', 'cloud-sun', 4, NOW(), NOW());

-- =====================================================
-- ADDITIONAL SUBCATEGORIES: Programming & Development
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0001-000000000006', 'Backend Development', 'backend-development',
        'Server-side programming and APIs', '10000000-0000-0000-0000-000000000001', 'server', 5, NOW(), NOW()),
       ('20000000-0000-0000-0001-000000000007', 'Frontend Development', 'frontend-development',
        'Client-side development and UI', '10000000-0000-0000-0000-000000000001', 'layout', 6, NOW(), NOW()),
       ('20000000-0000-0000-0001-000000000008', 'Algorithms & Data Structures', 'algorithms-data-structures',
        'Algorithms, data structures, and problem solving', '10000000-0000-0000-0000-000000000001', 'binary', 7, NOW(),
        NOW()),
       ('20000000-0000-0000-0001-000000000009', 'API Development', 'api-development', 'REST, GraphQL, and API design',
        '10000000-0000-0000-0000-000000000001', 'plug', 8, NOW(), NOW());

-- =====================================================
-- ADDITIONAL SUBCATEGORIES: Languages
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0003-000000000007', 'Korean', 'korean', 'Korean language learning',
        '10000000-0000-0000-0000-000000000003', 'a-large-small', 6, NOW(), NOW()),
       ('20000000-0000-0000-0003-000000000008', 'Arabic', 'arabic', 'Arabic language learning',
        '10000000-0000-0000-0000-000000000003', 'a-large-small', 7, NOW(), NOW()),
       ('20000000-0000-0000-0003-000000000009', 'Portuguese', 'portuguese', 'Portuguese language learning',
        '10000000-0000-0000-0000-000000000003', 'a-large-small', 8, NOW(), NOW()),
       ('20000000-0000-0000-0003-000000000010', 'Italian', 'italian', 'Italian language learning',
        '10000000-0000-0000-0000-000000000003', 'a-large-small', 9, NOW(), NOW()),
       ('20000000-0000-0000-0003-000000000011', 'Russian', 'russian', 'Russian language learning',
        '10000000-0000-0000-0000-000000000003', 'a-large-small', 10, NOW(), NOW());

-- =====================================================
-- ADDITIONAL SUBCATEGORIES: Business & Finance
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('20000000-0000-0000-0004-000000000006', 'Personal Finance', 'personal-finance',
        'Budgeting, saving, and personal money management', '10000000-0000-0000-0000-000000000004', 'wallet', 5, NOW(),
        NOW()),
       ('20000000-0000-0000-0004-000000000007', 'Real Estate', 'real-estate',
        'Property investment and real estate business', '10000000-0000-0000-0000-000000000004', 'building-2', 6, NOW(),
        NOW()),
       ('20000000-0000-0000-0004-000000000008', 'Investment', 'investment', 'Stocks, bonds, and investment strategies',
        '10000000-0000-0000-0000-000000000004', 'trending-up', 7, NOW(), NOW()),
       ('20000000-0000-0000-0004-000000000009', 'Human Resources', 'human-resources',
        'HR management and talent acquisition', '10000000-0000-0000-0000-000000000004', 'users', 8, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Web Development
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0001-000000000001', 'React', 'react', 'React.js framework and ecosystem',
        '20000000-0000-0000-0001-000000000001', 'atom', 0, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000002', 'Angular', 'angular', 'Angular framework development',
        '20000000-0000-0000-0001-000000000001', 'code', 1, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000003', 'Vue.js', 'vue-js', 'Vue.js framework development',
        '20000000-0000-0000-0001-000000000001', 'code', 2, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000004', 'Node.js', 'node-js', 'Node.js runtime and backend',
        '20000000-0000-0000-0001-000000000001', 'server', 3, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000005', 'Django & Flask', 'django-flask', 'Python web frameworks',
        '20000000-0000-0000-0001-000000000001', 'code', 4, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Mobile Development
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0001-000000000006', 'iOS & Swift', 'ios-swift', 'iOS development with Swift',
        '20000000-0000-0000-0001-000000000002', 'smartphone', 0, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000007', 'Android & Kotlin', 'android-kotlin', 'Android development with Kotlin',
        '20000000-0000-0000-0001-000000000002', 'smartphone', 1, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000008', 'React Native', 'react-native', 'Cross-platform with React Native',
        '20000000-0000-0000-0001-000000000002', 'smartphone', 2, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000009', 'Flutter', 'flutter', 'Cross-platform with Flutter/Dart',
        '20000000-0000-0000-0001-000000000002', 'smartphone', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Mechanical Engineering
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0011-000000000001', 'Thermodynamics', 'thermodynamics',
        'Heat, energy, and thermodynamic systems', '20000000-0000-0000-0011-000000000001', 'thermometer', 0, NOW(),
        NOW()),
       ('30000000-0000-0000-0011-000000000002', 'Fluid Mechanics', 'fluid-mechanics', 'Fluid dynamics and hydraulics',
        '20000000-0000-0000-0011-000000000001', 'droplet', 1, NOW(), NOW()),
       ('30000000-0000-0000-0011-000000000003', 'CAD/CAM', 'cad-cam', 'Computer-aided design and manufacturing',
        '20000000-0000-0000-0011-000000000001', 'ruler', 2, NOW(), NOW()),
       ('30000000-0000-0000-0011-000000000004', 'Materials Science', 'materials-science',
        'Material properties and selection', '20000000-0000-0000-0011-000000000001', 'layers', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Electrical Engineering
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0011-000000000005', 'Circuit Analysis', 'circuit-analysis',
        'Electronic circuits and analysis', '20000000-0000-0000-0011-000000000002', 'cpu', 0, NOW(), NOW()),
       ('30000000-0000-0000-0011-000000000006', 'Digital Systems', 'digital-systems', 'Digital logic and systems',
        '20000000-0000-0000-0011-000000000002', 'binary', 1, NOW(), NOW()),
       ('30000000-0000-0000-0011-000000000007', 'Power Systems', 'power-systems',
        'Electrical power generation and distribution', '20000000-0000-0000-0011-000000000002', 'zap', 2, NOW(), NOW()),
       ('30000000-0000-0000-0011-000000000008', 'Control Systems', 'control-systems', 'Feedback and control theory',
        '20000000-0000-0000-0011-000000000002', 'sliders', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: UX/UI Design
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0016-000000000001', 'User Research', 'user-research',
        'Understanding user needs and behavior', '20000000-0000-0000-0016-000000000002', 'search', 0, NOW(), NOW()),
       ('30000000-0000-0000-0016-000000000002', 'Wireframing', 'wireframing', 'Creating wireframes and mockups',
        '20000000-0000-0000-0016-000000000002', 'layout', 1, NOW(), NOW()),
       ('30000000-0000-0000-0016-000000000003', 'Prototyping', 'prototyping', 'Interactive prototypes and testing',
        '20000000-0000-0000-0016-000000000002', 'mouse-pointer', 2, NOW(), NOW()),
       ('30000000-0000-0000-0016-000000000004', 'Usability Testing', 'usability-testing',
        'Testing and improving user experience', '20000000-0000-0000-0016-000000000002', 'check-circle', 3, NOW(),
        NOW());

-- =====================================================
-- 3RD LEVEL: Mathematics
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0002-000000000001', 'Calculus', 'calculus', 'Differential and integral calculus',
        '20000000-0000-0000-0002-000000000004', 'sigma', 0, NOW(), NOW()),
       ('30000000-0000-0000-0002-000000000002', 'Linear Algebra', 'linear-algebra',
        'Matrices, vectors, and linear equations', '20000000-0000-0000-0002-000000000004', 'grid', 1, NOW(), NOW()),
       ('30000000-0000-0000-0002-000000000003', 'Discrete Math', 'discrete-math', 'Logic, sets, and combinatorics',
        '20000000-0000-0000-0002-000000000004', 'binary', 2, NOW(), NOW()),
       ('30000000-0000-0000-0002-000000000004', 'Number Theory', 'number-theory',
        'Properties and relationships of numbers', '20000000-0000-0000-0002-000000000004', 'hash', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Data Science
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0001-000000000010', 'Machine Learning', 'machine-learning',
        'ML algorithms and model training', '20000000-0000-0000-0001-000000000003', 'brain', 0, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000011', 'Deep Learning', 'deep-learning',
        'Neural networks and deep learning frameworks', '20000000-0000-0000-0001-000000000003', 'layers', 1, NOW(),
        NOW()),
       ('30000000-0000-0000-0001-000000000012', 'Data Visualization', 'data-visualization',
        'Charts, graphs, and visual analytics', '20000000-0000-0000-0001-000000000003', 'bar-chart', 2, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000013', 'Big Data', 'big-data',
        'Hadoop, Spark, and large-scale data processing', '20000000-0000-0000-0001-000000000003', 'database', 3, NOW(),
        NOW()),
       ('30000000-0000-0000-0001-000000000014', 'Natural Language Processing', 'nlp',
        'Text analysis and language models', '20000000-0000-0000-0001-000000000003', 'message-square', 4, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: DevOps
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0001-000000000015', 'Docker', 'docker', 'Containerization with Docker',
        '20000000-0000-0000-0001-000000000004', 'box', 0, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000016', 'Kubernetes', 'kubernetes', 'Container orchestration with K8s',
        '20000000-0000-0000-0001-000000000004', 'grid', 1, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000017', 'CI/CD', 'ci-cd', 'Continuous integration and deployment',
        '20000000-0000-0000-0001-000000000004', 'git-branch', 2, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000018', 'Infrastructure as Code', 'infrastructure-as-code',
        'Terraform, Ansible, and IaC tools', '20000000-0000-0000-0001-000000000004', 'file-code', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Game Development
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0001-000000000019', 'Unity', 'unity', 'Game development with Unity engine',
        '20000000-0000-0000-0001-000000000005', 'gamepad-2', 0, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000020', 'Unreal Engine', 'unreal-engine', 'Game development with Unreal Engine',
        '20000000-0000-0000-0001-000000000005', 'gamepad-2', 1, NOW(), NOW()),
       ('30000000-0000-0000-0001-000000000021', 'Game Design', 'game-design',
        'Game mechanics, level design, and storytelling', '20000000-0000-0000-0001-000000000005', 'puzzle', 2, NOW(),
        NOW()),
       ('30000000-0000-0000-0001-000000000022', '2D/3D Graphics', '2d-3d-graphics',
        '2D sprites and 3D modeling for games', '20000000-0000-0000-0001-000000000005', 'box', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Physics
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0002-000000000005', 'Classical Mechanics', 'classical-mechanics',
        'Newtonian physics and motion', '20000000-0000-0000-0002-000000000001', 'atom', 0, NOW(), NOW()),
       ('30000000-0000-0000-0002-000000000006', 'Quantum Mechanics', 'quantum-mechanics',
        'Quantum physics and wave functions', '20000000-0000-0000-0002-000000000001', 'atom', 1, NOW(), NOW()),
       ('30000000-0000-0000-0002-000000000007', 'Electromagnetism', 'electromagnetism', 'Electric and magnetic fields',
        '20000000-0000-0000-0002-000000000001', 'zap', 2, NOW(), NOW()),
       ('30000000-0000-0000-0002-000000000008', 'Thermodynamics & Statistical', 'thermodynamics-statistical',
        'Heat, entropy, and statistical mechanics', '20000000-0000-0000-0002-000000000001', 'thermometer', 3, NOW(),
        NOW());

-- =====================================================
-- 3RD LEVEL: Chemistry
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0002-000000000009', 'Organic Chemistry', 'organic-chemistry',
        'Carbon-based compounds and reactions', '20000000-0000-0000-0002-000000000002', 'flask-conical', 0, NOW(),
        NOW()),
       ('30000000-0000-0000-0002-000000000010', 'Inorganic Chemistry', 'inorganic-chemistry',
        'Non-carbon compounds and metals', '20000000-0000-0000-0002-000000000002', 'flask-conical', 1, NOW(), NOW()),
       ('30000000-0000-0000-0002-000000000011', 'Biochemistry', 'biochemistry', 'Chemistry of biological systems',
        '20000000-0000-0000-0002-000000000002', 'dna', 2, NOW(), NOW()),
       ('30000000-0000-0000-0002-000000000012', 'Analytical Chemistry', 'analytical-chemistry',
        'Chemical analysis and instrumentation', '20000000-0000-0000-0002-000000000002', 'microscope', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Biology
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0002-000000000013', 'Genetics', 'genetics', 'DNA, heredity, and genetic engineering',
        '20000000-0000-0000-0002-000000000003', 'dna', 0, NOW(), NOW()),
       ('30000000-0000-0000-0002-000000000014', 'Cell Biology', 'cell-biology', 'Cell structure and function',
        '20000000-0000-0000-0002-000000000003', 'circle', 1, NOW(), NOW()),
       ('30000000-0000-0000-0002-000000000015', 'Microbiology', 'microbiology', 'Bacteria, viruses, and microorganisms',
        '20000000-0000-0000-0002-000000000003', 'bug', 2, NOW(), NOW()),
       ('30000000-0000-0000-0002-000000000016', 'Ecology', 'ecology', 'Ecosystems and environmental biology',
        '20000000-0000-0000-0002-000000000003', 'trees', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Marketing
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0004-000000000001', 'Digital Marketing', 'digital-marketing',
        'Online marketing strategies and channels', '20000000-0000-0000-0004-000000000002', 'globe', 0, NOW(), NOW()),
       ('30000000-0000-0000-0004-000000000002', 'SEO', 'seo', 'Search engine optimization',
        '20000000-0000-0000-0004-000000000002', 'search', 1, NOW(), NOW()),
       ('30000000-0000-0000-0004-000000000003', 'Content Marketing', 'content-marketing',
        'Content strategy and creation', '20000000-0000-0000-0004-000000000002', 'file-text', 2, NOW(), NOW()),
       ('30000000-0000-0000-0004-000000000004', 'Social Media Marketing', 'social-media-marketing',
        'Marketing on social platforms', '20000000-0000-0000-0004-000000000002', 'share-2', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Cloud Computing
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0007-000000000001', 'AWS', 'aws', 'Amazon Web Services',
        '20000000-0000-0000-0007-000000000003', 'cloud', 0, NOW(), NOW()),
       ('30000000-0000-0000-0007-000000000002', 'Azure', 'azure', 'Microsoft Azure cloud platform',
        '20000000-0000-0000-0007-000000000003', 'cloud', 1, NOW(), NOW()),
       ('30000000-0000-0000-0007-000000000003', 'Google Cloud', 'google-cloud', 'Google Cloud Platform (GCP)',
        '20000000-0000-0000-0007-000000000003', 'cloud', 2, NOW(), NOW()),
       ('30000000-0000-0000-0007-000000000004', 'Serverless', 'serverless', 'Serverless architecture and FaaS',
        '20000000-0000-0000-0007-000000000003', 'zap', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Cybersecurity
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0007-000000000005', 'Network Security', 'network-security',
        'Firewalls, VPNs, and network protection', '20000000-0000-0000-0007-000000000002', 'shield', 0, NOW(), NOW()),
       ('30000000-0000-0000-0007-000000000006', 'Ethical Hacking', 'ethical-hacking',
        'Penetration testing and vulnerability assessment', '20000000-0000-0000-0007-000000000002', 'terminal', 1,
        NOW(), NOW()),
       ('30000000-0000-0000-0007-000000000007', 'Cryptography', 'cryptography', 'Encryption and secure communications',
        '20000000-0000-0000-0007-000000000002', 'lock', 2, NOW(), NOW()),
       ('30000000-0000-0000-0007-000000000008', 'Security Operations', 'security-operations',
        'SOC, incident response, and monitoring', '20000000-0000-0000-0007-000000000002', 'eye', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Psychology
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0012-000000000001', 'Clinical Psychology', 'clinical-psychology',
        'Mental health diagnosis and treatment', '20000000-0000-0000-0012-000000000001', 'heart', 0, NOW(), NOW()),
       ('30000000-0000-0000-0012-000000000002', 'Cognitive Psychology', 'cognitive-psychology',
        'Memory, perception, and thinking', '20000000-0000-0000-0012-000000000001', 'brain', 1, NOW(), NOW()),
       ('30000000-0000-0000-0012-000000000003', 'Developmental Psychology', 'developmental-psychology',
        'Human development across lifespan', '20000000-0000-0000-0012-000000000001', 'baby', 2, NOW(), NOW()),
       ('30000000-0000-0000-0012-000000000004', 'Social Psychology', 'social-psychology',
        'Social behavior and group dynamics', '20000000-0000-0000-0012-000000000001', 'users', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Music Production
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0014-000000000001', 'DAWs & Software', 'daws-software',
        'Ableton, FL Studio, Logic Pro, and more', '20000000-0000-0000-0014-000000000003', 'laptop', 0, NOW(), NOW()),
       ('30000000-0000-0000-0014-000000000002', 'Mixing', 'mixing', 'Audio mixing techniques and EQ',
        '20000000-0000-0000-0014-000000000003', 'sliders', 1, NOW(), NOW()),
       ('30000000-0000-0000-0014-000000000003', 'Mastering', 'mastering', 'Final audio mastering and loudness',
        '20000000-0000-0000-0014-000000000003', 'disc', 2, NOW(), NOW()),
       ('30000000-0000-0000-0014-000000000004', 'Sound Design', 'sound-design', 'Creating and manipulating sounds',
        '20000000-0000-0000-0014-000000000003', 'waveform', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Graphic Design
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0016-000000000005', 'Adobe Photoshop', 'adobe-photoshop', 'Image editing and manipulation',
        '20000000-0000-0000-0016-000000000001', 'image', 0, NOW(), NOW()),
       ('30000000-0000-0000-0016-000000000006', 'Adobe Illustrator', 'adobe-illustrator',
        'Vector graphics and illustration', '20000000-0000-0000-0016-000000000001', 'pen-tool', 1, NOW(), NOW()),
       ('30000000-0000-0000-0016-000000000007', 'Logo Design', 'logo-design', 'Brand identity and logo creation',
        '20000000-0000-0000-0016-000000000001', 'badge', 2, NOW(), NOW()),
       ('30000000-0000-0000-0016-000000000008', 'Print Design', 'print-design', 'Brochures, posters, and print media',
        '20000000-0000-0000-0016-000000000001', 'printer', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Filmmaking
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0015-000000000001', 'Cinematography', 'cinematography',
        'Camera techniques and visual storytelling', '20000000-0000-0000-0015-000000000001', 'camera', 0, NOW(), NOW()),
       ('30000000-0000-0000-0015-000000000002', 'Directing', 'directing', 'Film direction and creative vision',
        '20000000-0000-0000-0015-000000000001', 'clapperboard', 1, NOW(), NOW()),
       ('30000000-0000-0000-0015-000000000003', 'Lighting', 'lighting', 'Film and video lighting techniques',
        '20000000-0000-0000-0015-000000000001', 'lightbulb', 2, NOW(), NOW()),
       ('30000000-0000-0000-0015-000000000004', 'Color Grading', 'color-grading', 'Color correction and grading',
        '20000000-0000-0000-0015-000000000001', 'palette', 3, NOW(), NOW());

-- =====================================================
-- 3RD LEVEL: Networking
-- =====================================================

INSERT INTO categories (id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at)
VALUES ('30000000-0000-0000-0007-000000000009', 'TCP/IP', 'tcp-ip', 'Network protocols and IP addressing',
        '20000000-0000-0000-0007-000000000001', 'network', 0, NOW(), NOW()),
       ('30000000-0000-0000-0007-000000000010', 'Routing & Switching', 'routing-switching',
        'Network routing and switching', '20000000-0000-0000-0007-000000000001', 'git-branch', 1, NOW(), NOW()),
       ('30000000-0000-0000-0007-000000000011', 'Wireless Networks', 'wireless-networks',
        'WiFi, Bluetooth, and wireless technologies', '20000000-0000-0000-0007-000000000001', 'wifi', 2, NOW(), NOW()),
       ('30000000-0000-0000-0007-000000000012', 'Network Troubleshooting', 'network-troubleshooting',
        'Diagnosing and fixing network issues', '20000000-0000-0000-0007-000000000001', 'wrench', 3, NOW(), NOW());
