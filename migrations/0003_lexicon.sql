-- 通用詞條：與使用者無關，全站共享，命中率高
CREATE TABLE IF NOT EXISTS lexicon_entries (
  headword    TEXT PRIMARY KEY,   -- 正規化後的原形（單字或片語）
  kind        TEXT NOT NULL,      -- 'word' | 'phrase'
  data        TEXT NOT NULL,      -- JSON: LexiconEntry
  model       TEXT NOT NULL,      -- 生成用的模型 id，方便日後重生
  created_at  INTEGER NOT NULL
);

-- 查詢別名：intercepted → intercept
CREATE TABLE IF NOT EXISTS lexicon_aliases (
  alias       TEXT PRIMARY KEY,
  headword    TEXT NOT NULL,
  created_at  INTEGER NOT NULL
);

-- 個人化橋接：把詞條綁到使用者的興趣／工作情境
CREATE TABLE IF NOT EXISTS lexicon_personal (
  headword     TEXT NOT NULL,
  persona_hash TEXT NOT NULL,
  data         TEXT NOT NULL,     -- JSON: PersonalBridge
  created_at   INTEGER NOT NULL,
  PRIMARY KEY (headword, persona_hash)
);

-- 生成配額（成本閘門）
CREATE TABLE IF NOT EXISTS lexicon_quota (
  user_id  TEXT NOT NULL,
  day      TEXT NOT NULL,          -- YYYY-MM-DD (UTC)
  count    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

CREATE INDEX IF NOT EXISTS idx_lexicon_personal_headword ON lexicon_personal(headword);
