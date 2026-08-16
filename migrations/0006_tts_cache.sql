CREATE TABLE IF NOT EXISTS tts_cache (
  key        TEXT PRIMARY KEY,   -- "speaker:text" e.g. "luna:ambivalent"
  audio      BLOB NOT NULL,
  created_at INTEGER NOT NULL
);
