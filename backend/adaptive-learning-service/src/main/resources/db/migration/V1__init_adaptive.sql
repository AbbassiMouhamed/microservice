-- Adaptive Learning Service tables (prefix: al_)
-- CECRL level-based adaptive learning, gamification, learning paths, recommendations

CREATE TABLE al_student_learning_profile (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    current_level VARCHAR(10) NOT NULL DEFAULT 'A1',
    target_level VARCHAR(10) NOT NULL DEFAULT 'A2',
    preferred_content_type VARCHAR(20) NOT NULL DEFAULT 'ANY',
    difficulty_preference VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    learning_goal VARCHAR(500) NOT NULL DEFAULT '',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_al_profile_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE al_student_placement_test_result (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    score INT NOT NULL,
    score_percent INT NOT NULL DEFAULT 0,
    assigned_level VARCHAR(10) NOT NULL,
    weak_areas VARCHAR(500),
    test_date DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE al_learning_path (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    goal VARCHAR(500) NOT NULL DEFAULT '',
    target_level VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE al_learning_path_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learning_path_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    recommended_order INT NOT NULL,
    priority_score INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    source_course_id BIGINT,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_al_lpi_path FOREIGN KEY (learning_path_id) REFERENCES al_learning_path(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE al_student_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    learning_path_id BIGINT NOT NULL,
    total_items INT NOT NULL,
    total_lessons INT NOT NULL DEFAULT 0,
    completed_items INT NOT NULL DEFAULT 0,
    completed_lessons INT NOT NULL DEFAULT 0,
    completion_percentage DOUBLE NOT NULL DEFAULT 0,
    completion_percent DOUBLE NOT NULL DEFAULT 0,
    current_level VARCHAR(10) NOT NULL,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE al_student_gamification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    points INT NOT NULL DEFAULT 0,
    badges VARCHAR(255) NOT NULL DEFAULT '',
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    last_promotion_message VARCHAR(1000),
    last_promotion_at DATETIME(6),
    UNIQUE KEY uk_al_gamification_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE al_student_level_test_result (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    current_level VARCHAR(10) NOT NULL,
    score INT NOT NULL,
    score_percent INT NOT NULL DEFAULT 0,
    passed TINYINT(1) NOT NULL,
    unlocked_level VARCHAR(10) NOT NULL,
    weak_areas VARCHAR(500),
    quiz_attempt_id BIGINT,
    test_date DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_al_level_test_quiz_attempt (quiz_attempt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE al_student_course_enrollment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE al_student_chapter_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id BIGINT NOT NULL,
    chapter_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    completed_at DATETIME(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_al_scp_enrollment FOREIGN KEY (enrollment_id) REFERENCES al_student_course_enrollment(id) ON DELETE CASCADE,
    UNIQUE KEY uk_al_chapter_progress_enrollment_chapter (enrollment_id, chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE al_learning_difficulty_alert (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    reason VARCHAR(600) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    resolved TINYINT(1) NOT NULL DEFAULT 0,
    learning_path_id BIGINT,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE al_pedagogical_recommendation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    ref_item_id BIGINT NOT NULL,
    course_context_id BIGINT,
    item_title VARCHAR(120) NOT NULL,
    personalized_text VARCHAR(2000) NOT NULL,
    source VARCHAR(10) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
