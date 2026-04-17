-- =============================================
-- Messaging Service tables
-- =============================================

CREATE TABLE msg_users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  keycloak_sub VARCHAR(255) UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  created_at DATETIME(6) NOT NULL
);

CREATE TABLE msg_conversations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  participant1_id BIGINT NOT NULL,
  participant2_id BIGINT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);

CREATE TABLE msg_messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sender_id BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME(6) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  conversation_id BIGINT,
  CONSTRAINT fk_msg_conversation FOREIGN KEY (conversation_id) REFERENCES msg_conversations(id) ON DELETE CASCADE
);

CREATE TABLE msg_invitations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sender_id BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  message VARCHAR(500) NOT NULL,
  invitation_type VARCHAR(50) NOT NULL DEFAULT 'DISCUSSION',
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at DATETIME(6) NOT NULL,
  responded_at DATETIME(6)
);

CREATE TABLE msg_user_blocks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  blocker_id BIGINT NOT NULL,
  blocked_id BIGINT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_block UNIQUE (blocker_id, blocked_id)
);

CREATE TABLE msg_user_bans (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  banned_until DATETIME(6) NOT NULL
);

CREATE TABLE msg_bad_words (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE msg_chat_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  level_used VARCHAR(10),
  created_at DATETIME(6) NOT NULL
);

CREATE TABLE msg_translation_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  source_language VARCHAR(20) NOT NULL,
  target_language VARCHAR(20) NOT NULL,
  input_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  provider VARCHAR(40) NOT NULL,
  created_at DATETIME(6) NOT NULL
);

-- Indexes
CREATE INDEX idx_msg_messages_conversation ON msg_messages(conversation_id);
CREATE INDEX idx_msg_messages_receiver_read ON msg_messages(receiver_id, is_read);
CREATE INDEX idx_msg_invitations_receiver ON msg_invitations(receiver_id, status);
CREATE INDEX idx_msg_chat_history_user ON msg_chat_history(user_id);
