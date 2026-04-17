-- =============================================
-- Forum Service tables
-- =============================================

CREATE TABLE forum_posts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  author_name VARCHAR(255),
  category VARCHAR(100),
  is_moderated BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6)
);

CREATE TABLE forum_comments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  post_id BIGINT NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  author_name VARCHAR(255),
  parent_comment_id BIGINT,
  is_moderated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6),
  CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES forum_comments(id) ON DELETE CASCADE
);

CREATE TABLE forum_post_likes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  CONSTRAINT uq_post_like UNIQUE (post_id, user_id)
);

CREATE TABLE forum_post_reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  reporter_id VARCHAR(36) NOT NULL,
  reason VARCHAR(500),
  created_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_report_post FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE
);

CREATE TABLE forum_announcements (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  author_name VARCHAR(255),
  published_at DATETIME(6),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6)
);

CREATE TABLE forum_notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(120) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  type VARCHAR(30) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  source_type VARCHAR(50),
  source_id BIGINT,
  priority VARCHAR(20),
  action_url VARCHAR(255),
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  INDEX idx_notification_user (user_id),
  INDEX idx_notification_user_read (user_id, is_read)
);
