-- =============================================
-- Quiz Service tables (prefix: quiz_)
-- =============================================

CREATE TABLE quiz_level_final_attempts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  keycloak_subject VARCHAR(36) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
  score_percent DOUBLE,
  weak_areas_auto VARCHAR(1000),
  started_at DATETIME(6) NOT NULL,
  completed_at DATETIME(6)
);

CREATE TABLE quiz_questions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  question_text VARCHAR(2000) NOT NULL,
  level VARCHAR(10) NOT NULL,
  skill_type VARCHAR(20) NOT NULL,
  correct_answer VARCHAR(500) NOT NULL,
  option_a VARCHAR(500),
  option_b VARCHAR(500),
  option_c VARCHAR(500),
  option_d VARCHAR(500)
);

CREATE TABLE quiz_attempt_answers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  attempt_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  selected_answer VARCHAR(500),
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_answer_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_level_final_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);
