CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  user_type VARCHAR(32) NOT NULL
);

CREATE TABLE courses (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  level VARCHAR(32) NULL,
  start_date DATETIME(6) NULL
);

CREATE TABLE exams (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  scheduled_at DATETIME(6) NULL,
  duration_minutes INT NOT NULL,
  max_score INT NOT NULL,
  passing_score INT NOT NULL,
  status VARCHAR(32) NOT NULL,
  CONSTRAINT fk_exams_course FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE exam_attempts (
  id CHAR(36) PRIMARY KEY,
  exam_id CHAR(36) NOT NULL,
  student_id CHAR(36) NOT NULL,
  score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  skill_level VARCHAR(8) NOT NULL,
  submitted_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_attempt_exam FOREIGN KEY (exam_id) REFERENCES exams(id),
  CONSTRAINT fk_attempt_student FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX uq_exam_attempt_exam_student ON exam_attempts(exam_id, student_id);

CREATE TABLE certificates (
  id CHAR(36) PRIMARY KEY,
  exam_attempt_id CHAR(36) NOT NULL UNIQUE,
  student_id CHAR(36) NOT NULL,
  issued_at DATETIME(6) NOT NULL,
  skill_level VARCHAR(8) NOT NULL,
  payload_json LONGTEXT NOT NULL,
  signature_base64 LONGTEXT NOT NULL,
  public_key_pem LONGTEXT NOT NULL,
  pdf_bytes LONGBLOB NOT NULL,
  CONSTRAINT fk_cert_attempt FOREIGN KEY (exam_attempt_id) REFERENCES exam_attempts(id),
  CONSTRAINT fk_cert_student FOREIGN KEY (student_id) REFERENCES users(id)
);
