-- LLM 執行期設定。
--
-- 只放「改了要立刻生效、且不機密」的東西：provider、model、fallback、額度。
-- **API key 不放這裡** —— D1 是明文，拿得到 DB 就看得到；key 留在
-- wrangler secret（加密存放且讀不回來）。
--
-- 單列表，id 固定為 'main'，跟既有的 sync_state 同一個做法。
CREATE TABLE IF NOT EXISTS llm_config (
  id                 TEXT PRIMARY KEY DEFAULT 'main',
  provider           TEXT,
  model              TEXT,
  fallback_provider  TEXT,
  fallback_model     TEXT,
  lexicon_quota      INTEGER,
  chat_quota         INTEGER,
  updated_at         INTEGER NOT NULL
);
