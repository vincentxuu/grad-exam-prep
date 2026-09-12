-- Users table for email/password auth
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Per-card SRS state, per user (server-primary)
CREATE TABLE IF NOT EXISTS user_srs_cards (
  user_id TEXT NOT NULL,
  card_id TEXT NOT NULL,
  interval REAL NOT NULL DEFAULT 1,
  repetitions INTEGER NOT NULL DEFAULT 0,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  next_review INTEGER NOT NULL,
  last_reviewed_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, card_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_srs_due ON user_srs_cards (user_id, next_review);
