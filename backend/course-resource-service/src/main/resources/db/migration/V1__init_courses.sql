-- =============================================
-- Course Resource Service tables
-- Uses 'cr_' prefix to avoid conflicts with exam-cert-service 'courses' table
-- =============================================

CREATE TABLE cr_courses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(1000),
  level VARCHAR(10) NOT NULL,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
  price DOUBLE DEFAULT 0,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6)
);

CREATE TABLE cr_chapters (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(2000),
  skill_type VARCHAR(20),
  order_index INT NOT NULL DEFAULT 0,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  course_id BIGINT NOT NULL,
  CONSTRAINT fk_chapter_course FOREIGN KEY (course_id) REFERENCES cr_courses(id) ON DELETE CASCADE
);

CREATE TABLE cr_chapter_contents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255),
  url VARCHAR(2000),
  required BOOLEAN NOT NULL DEFAULT TRUE,
  chapter_id BIGINT NOT NULL,
  CONSTRAINT fk_content_chapter FOREIGN KEY (chapter_id) REFERENCES cr_chapters(id) ON DELETE CASCADE
);

CREATE TABLE cr_resources (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,
  url VARCHAR(500),
  course_id BIGINT NOT NULL,
  CONSTRAINT fk_resource_course FOREIGN KEY (course_id) REFERENCES cr_courses(id) ON DELETE CASCADE
);

CREATE TABLE cr_seances (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  start_date_time DATETIME(6) NOT NULL,
  duration_minutes INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
  description VARCHAR(1000),
  course_id BIGINT NOT NULL,
  CONSTRAINT fk_seance_course FOREIGN KEY (course_id) REFERENCES cr_courses(id) ON DELETE CASCADE
);
