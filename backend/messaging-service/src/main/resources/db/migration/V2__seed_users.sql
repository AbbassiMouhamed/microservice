-- Seed initial messaging users for the three Keycloak users
INSERT INTO msg_users (username, email, password_hash, keycloak_sub, role, created_at) VALUES
  ('admin',   'admin@smartlingua.com',   'n/a', NULL, 'admin',   NOW()),
  ('teacher', 'teacher@smartlingua.com', 'n/a', NULL, 'teacher', NOW()),
  ('student', 'student@smartlingua.com', 'n/a', NULL, 'student', NOW());
