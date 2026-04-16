ALTER TABLE certificates
  ADD COLUMN last_verified_at DATETIME(6) NULL,
  ADD COLUMN last_verified_valid BOOLEAN NULL;
