CREATE TABLE IF NOT EXISTS question_answers (
  question_id  TEXT PRIMARY KEY,
  answer       TEXT NOT NULL,
  explanation  TEXT NOT NULL,
  generated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS practice_records (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      TEXT NOT NULL,
  question_id  TEXT NOT NULL,
  mode         TEXT NOT NULL,
  result       TEXT NOT NULL,
  answered_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_practice_user ON practice_records(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_question ON practice_records(question_id);
