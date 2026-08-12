-- 對話練習。獨立的 migration，方便只上查詞那一半。
CREATE TABLE IF NOT EXISTS chat_sessions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  topic         TEXT NOT NULL,      -- 對話主題（由 persona 產生或使用者自訂）
  target_words  TEXT NOT NULL,      -- JSON: string[]，本次要練的字
  correct_mode  INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL,
  ended_at      INTEGER
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL,
  role        TEXT NOT NULL,        -- 'user' | 'assistant'
  content     TEXT NOT NULL,
  used_words  TEXT,                 -- JSON: string[]，這則訊息用到的 target words
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_corrections (
  id          TEXT PRIMARY KEY,
  message_id  TEXT NOT NULL,        -- 對應的 user 訊息
  session_id  TEXT NOT NULL,
  data        TEXT NOT NULL,        -- JSON: Correction
  created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_corrections_session ON chat_corrections(session_id);
