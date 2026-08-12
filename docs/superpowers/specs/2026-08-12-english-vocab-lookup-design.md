# 英文查詞與個人化字彙系統設計文件

**日期：** 2026-08-12
**範圍：** 查詞（單字＋片語）、個人化連結、輔助閱讀、與既有 SRS 整合
**來源：** 手寫需求筆記（英文學習五個痛點）

---

## 背景

需求筆記列出五個痛點：

| # | 筆記原文 | 現況 |
| --- | --- | --- |
| 1 | 很多單字不熟，需要查詞、**片語** | ❌ 站上沒有查詞功能，只有 160 張手寫閃卡 |
| 2 | 上述單字記不起來 | ⚠️ 有 SM-2 SRS（`src/lib/srs.ts`），但只作用在那 160 張固定卡 |
| 3 | 很多 app 查不到單字，用法不夠多、**解釋太少** | ❌ 無 |
| 4 | 希望這些單字片語能夠與自身產生連結，例如興趣、工作 | ❌ 無 |
| 5 | 輔助閱讀、輔助使用 | ❌ 無 |

現有相關程式碼：

- `public/data/flashcards.json` — 560 張卡，其中 160 張 `cs-english` / `im-english`
- `src/lib/vocab.ts` — 從題目抽單字、判斷是否為字彙卡
- `src/components/flashcard/vocab-answer.tsx` — 解析 `【意思】【例句】【近義詞】` 結構
- `src/lib/srs.ts` + `src/store/flashcard.ts` — SM-2，狀態存 localStorage 的 `srsState: Record<cardId, CardSRSState>`
- `src/hooks/use-speech.ts` — Web Speech API 發音

痛點 2 已有一半的答案（SRS 存在），其餘四點全新。

---

## 架構決策：AI 即時生成 + D1 永久快取

三個候選方案：

| 方案 | 痛點 1 涵蓋率 | 痛點 3 解釋深度 | 痛點 4 個人化 | 執行成本 |
| --- | --- | --- | --- | --- |
| 預先批次生成靜態 JSON | ❌ 只有生成過的字 | ✅ | ❌ 無法 | 零 |
| 外部免費字典 API | ✅ | ❌ 通常一行釋義 | ❌ 無法 | 零 |
| **AI 生成 + D1 快取** | ✅ | ✅ | ✅ | 有，但可攤提 |

**選 AI 生成 + D1 快取。** 理由：

- 痛點 3 明白抱怨「查不到單字」。預先生成的靜態檔會複製同一個問題 —— 使用者在書上／論文上遇到的字，本來就不在我們的清單裡。
- 痛點 4（個人化）在架構上就要求生成時帶入使用者情境，靜態檔與外部字典都做不到。
- 成本靠快取攤提：詞條本身全站共享，第二個人查同一個字就是免費的。

### 兩層快取：通用詞條 vs 個人化橋接

若把個人化例句和詞條寫在一起，每個 persona 都要重新生成整份詞條，快取命中率會崩掉。因此拆成兩層：

```
lexicon_entries   key = headword                    ← 全站共享，命中率高
lexicon_personal  key = (headword, persona_hash)    ← 只在使用者需要時生成
```

通用詞條（釋義／搭配／片語／易混淆字／例句）與使用者無關；個人化橋接（用興趣與工作情境改寫的例句 + 記憶連結）才綁 persona。查一個字最壞情況是兩次 API 呼叫，之後兩層都命中就是零成本。

### 詞形還原（lemma）與別名

使用者在論文上讀到 `intercepted`，要能查到 `intercept`。做法：生成時要求模型同時回傳 `headword`（原形）與 `queried_as`，詞條存在原形底下，另外寫一筆 alias。下次查 `intercepted` 直接命中快取。

片語不做還原 —— `take into account` 就是它自己的 headword，正規化只做小寫與空白收斂。

---

## 資料層

### D1 migration `0003_lexicon.sql`

```sql
-- 通用詞條：與使用者無關，全站共享
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
```

`lexicon_aliases.headword` 不設 FK —— D1 的 FK 預設不啟用，靠應用層保證；孤兒 alias 查不到詞條時當作 cache miss 重新生成即可。

### 型別（`src/types/lexicon.ts`）

```ts
export interface LexiconSense {
  pos: string                 // 詞性：verb / noun / adj ...
  zh: string                  // 中文釋義
  en: string                  // 英文釋義（雙語對照，對應痛點 3）
  register?: 'formal' | 'informal' | 'technical' | 'academic'
}

export interface LexiconExample {
  en: string
  zh: string
  context?: 'general' | 'academic' | 'technical' | 'exam'
}

export interface LexiconEntry {
  headword: string
  kind: 'word' | 'phrase'
  ipa?: string
  senses: LexiconSense[]                                    // 多義項
  collocations: string[]                                    // 常見搭配
  phrases: { phrase: string; zh: string }[]                 // 延伸片語
  confusables: { word: string; zh: string; note: string }[] // 易混淆字
  synonyms: string[]
  antonyms: string[]
  examples: LexiconExample[]                                // 至少 3 句，涵蓋不同語域
  examNote?: string                                         // 研究所考試重點
}

export interface PersonalBridge {
  headword: string
  examples: LexiconExample[]   // 以使用者的興趣／工作情境改寫
  mnemonic: string             // 一句話的記憶連結
}

export interface PersonaProfile {
  interests: string[]          // 興趣，例如 ['登山', '獨立遊戲']
  work: string                 // 職業／領域，例如 '後端工程師'
  goal?: string                // 為什麼學英文
}
```

`senses` 是複數、`examples` 至少三句且標語域 —— 這兩點直接對應痛點 3「用法不夠多、解釋太少」。單一釋義加一句例句就是筆記在抱怨的東西。

### persona 儲存位置

`PersonaProfile` 掛進既有的 `UserPreferences`（`src/types/storage.ts`），存 localStorage，並且已經會透過 `/api/sync` 同步到 D1 —— 不需要新的持久化機制。

`persona_hash` = `SHA-256(JSON.stringify({ interests: [...].sort(), work, goal }))` 取前 16 個 hex 字元。排序確保同一組興趣不同輸入順序共用快取。persona 為空時 hash 固定為 `'none'`，代表「不做個人化」，此時完全不呼叫個人化生成。

---

## 生成層

### 模型設定

| 項目 | 值 | 理由 |
| --- | --- | --- |
| model | `claude-opus-5` | 專案預設；成本 $5 / $25 per MTok |
| max_tokens | 8000 | Opus 5 **thinking 預設開啟**，且 `max_tokens` 同時涵蓋 thinking 與回應文字，要留餘裕否則會中途截斷 |
| output_config.effort | 先用預設（`high`），另立調校任務往下掃 | `low` / `medium` 在這個模型上表現異常好，但要先有基準再降 |
| output_config.format | `json_schema` | 結構化輸出，直接拿到 `LexiconEntry`，不必解析散文 |
| system | 固定的詞條規格 + `cache_control: ephemeral` | Opus 5 快取門檻是 512 tokens，system prompt 遠超過；輔助閱讀一次連查多字時命中率高 |
| fallbacks | `"default"`（beta `server-side-fallback-2026-07-01`） | Opus 5 的安全分類器可能回 `stop_reason: "refusal"`，交給伺服器端 fallback 而不是把失敗丟給使用者 |

**必做的錯誤處理：** 讀 `response.content` 之前先檢查 `stop_reason === 'refusal'`。無條件讀 `content[0]` 在被拒絕時會直接壞掉。

### 兩個 prompt

1. **詞條生成** — 輸入是查詢字串；要求回傳 lemma、判斷 word/phrase、多義項、搭配、易混淆字、至少三句不同語域的例句、研究所考試重點。system prompt 固定不變（可快取），查詢字串放最後。

2. **個人化橋接** — 輸入是 headword + `PersonaProfile`；要求用使用者的興趣與工作情境寫 2 句例句，加一句記憶連結。system prompt 同樣固定。

兩者都用 `output_config.format` 綁 JSON schema，不做散文解析。

### 成本閘門

- 快取命中（GET）：完全開放，不計配額。
- 快取未命中（POST，要花錢）：
  - 帶 `PASSPHRASE_HASH` bearer token（既有 `src/lib/auth.ts` 的機制）→ 不限額
  - 否則計入 `lexicon_quota`，每個 `gep_uid` 每日上限 `LEXICON_DAILY_QUOTA`（env，預設 60）
  - 超額回 429 並附上「明天再試或輸入通關密語」的訊息

- **暖機批次**：既有 160 張英文閃卡的單字，用 Message Batches API（半價）預先生成詞條灌進 D1，讓考試高頻字第一天就是熱的。

---

## API

沿用既有 route 慣例（`getCloudflareContext` 取 `env.DB`、`NextResponse`）。

| Method | Path | 說明 |
| --- | --- | --- |
| `GET` | `/api/lexicon?q=<term>` | 只讀快取。命中回 `{ entry, cached: true }`；未命中回 404。免費、快、開放。 |
| `POST` | `/api/lexicon` | Body `{ term, persona? }`。缺什麼生什麼（詞條／個人化橋接），寫入快取後回 `{ entry, personal? }`。配額閘門在這裡。 |

拆成兩個端點而不是一個 `lookup`，是為了讓前端能先做一次免費的快取探測、只在真的要花錢時才觸發生成，也讓配額邏輯集中在單一寫入路徑。

回應形狀：

```ts
interface LookupResponse {
  entry: LexiconEntry
  personal?: PersonalBridge
  cached: { entry: boolean; personal: boolean }
  quota?: { used: number; limit: number }
}
```

---

## SRS 整合（痛點 2）

目前 SRS 只認 `flashcards.json` 裡的卡。要讓查過的字進入複習排程，需要一個統一的卡片來源。

- 查到的字可一鍵加入單字庫，卡片 id 為 `lx-<slug>`，slug = headword 小寫、非英數字轉 `-`。
- `srsState` 是 `Record<string, CardSRSState>`，用新的 id 前綴就能直接共用，**不需要資料遷移**。
- 但「我存了哪些字」需要另外記錄（靜態卡來自 JSON，查來的字沒有來源清單），因此 `StorageState` 新增：

```ts
export interface SavedWord {
  headword: string
  cardId: string       // lx-<slug>
  addedAt: number
  note?: string        // 使用者自己的註記
}
```

- 複習介面把兩種來源正規化成同一個 `ReviewCard`：

```ts
interface ReviewCard {
  id: string
  source: 'content' | 'lexicon'
  prompt: string
  subjectLabel: string
  render: 'flashcard' | 'lexicon'
}
```

`getDueCards` / `getDueCount` 改吃 `ReviewCard[]`，既有 `Flashcard[]` 呼叫點用一個 adapter 轉換 —— SM-2 邏輯本身不動。

---

## 輔助閱讀（痛點 5）

新頁面 `/[exam]/reading`：

1. 貼上一段文章／論文段落（存 localStorage，不進 D1）
2. 前端切詞：`/[^A-Za-z'-]+/` 切分並保留原始 offset，逐字可點
3. 點一個字 → 側欄查詞；拖曳選取多字 → 以片語查詢（直接對應筆記兩次提到的「片語」）
4. 側欄有「加入單字庫」按鈕 → 寫入 `savedWords` 並建立 SRS 卡
5. **生字標記**：已在 `savedWords` 內、或 SRS 狀態為 `repetitions === 0`（上次評「不會」）的字加底線，讓使用者一眼看到自己的弱點分布

切詞刻意保持簡單。真正的斷詞交給查詢當下的 lemma 還原，前端只負責切出可點的 token。

---

## 不做的事

- 不做帳號系統 —— 沿用既有的匿名 cookie UUID（`src/lib/user-id.ts`）
- 不做離線字典 fallback —— 那正是筆記第 3 點在抱怨的東西
- 不改既有 160 張閃卡的資料格式 —— 它們照舊走 `VocabAnswer`，新的詞條走新的呈現元件
- 不做 PDF / EPUB 匯入 —— 第一版只吃貼上的純文字

---

## 風險

| 風險 | 緩解 |
| --- | --- |
| API 成本失控 | 兩層快取 + 每日配額 + 通關密語豁免；批次暖機用半價的 Batches API |
| 冷啟動延遲（生成要數秒） | 先打 GET 探測快取；生成時顯示 skeleton；暖機批次讓高頻字一開始就是熱的 |
| Opus 5 拒絕回應 | 讀 content 前先檢查 `stop_reason`，並開 `fallbacks: "default"` |
| 生成內容有錯 | 詞條頁標示「AI 生成」；提供「重新生成」按鈕（計入配額） |
| localStorage 配額 | `savedWords` 只存 headword 與 metadata，詞條本體留在 D1 |
