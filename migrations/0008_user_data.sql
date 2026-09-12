-- Saved words (我的單字)
CREATE TABLE IF NOT EXISTS user_saved_words (
  user_id TEXT NOT NULL,
  headword TEXT NOT NULL,
  card_id TEXT NOT NULL,
  added_at INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT '{}',
  note TEXT,
  PRIMARY KEY (user_id, headword),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Completed tasks (備考進度勾選)
CREATE TABLE IF NOT EXISTS user_completed_tasks (
  user_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, task_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Custom tasks (自訂任務)
CREATE TABLE IF NOT EXISTS user_custom_tasks (
  user_id TEXT NOT NULL,
  id TEXT NOT NULL,
  phase_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  description TEXT NOT NULL,
  subject_tag TEXT,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Paper practice (考古題練習紀錄)
CREATE TABLE IF NOT EXISTS user_paper_practice (
  user_id TEXT NOT NULL,
  paper_id TEXT NOT NULL,
  practiced_at INTEGER NOT NULL,
  notes TEXT,
  PRIMARY KEY (user_id, paper_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Daily learning (每日學習紀錄，含 taskEvidence — 用 JSON blob)
CREATE TABLE IF NOT EXISTS user_daily_learning (
  user_id TEXT NOT NULL,
  record_key TEXT NOT NULL,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, record_key),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Preferences (使用者偏好 — JSON blob)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  data TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
