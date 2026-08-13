# 英文查詞與個人化字彙系統設計文件

**日期：** 2026-08-12
**範圍：** 查詞（單字＋片語）、個人化連結、輔助閱讀、輔助對話、與既有 SRS 整合
**來源：** 手寫需求筆記（英文學習五個痛點）

---

## 背景

需求筆記的左欄列出七個**單字來源**：書籍、文章、論文、考試、app、課程、家教。這七個不是同一種東西 —— 有的可以複製貼上，有的是紙本，有的是聽到的。捕捉方式必須跟著來源走，只做「貼上一段文字」會漏掉一半以上（見〈單字捕捉層〉）。

右欄列出五個痛點：

| # | 筆記原文 | 現況 |
| --- | --- | --- |
| 1 | 很多單字不熟，需要查詞、**片語** | ❌ 站上沒有查詞功能，只有 160 張手寫閃卡 |
| 2 | 上述單字記不起來 | ⚠️ 有 SM-2 SRS（`src/lib/srs.ts`），但只作用在那 160 張固定卡 |
| 3 | 很多 app 查不到單字，用法不夠多、**解釋太少** | ❌ 無 |
| 4 | 希望這些單字片語能夠與自身產生連結，例如興趣、工作 | ❌ 無 |
| 5 | 輔助閱讀、輔助**對話** | ❌ 無 |

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

### D1 migration `0004_chat.sql`

對話是獨立功能，另開一個 migration，方便只上其中一半。

```sql
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
```

對話歷史放 D1 而非 localStorage：一段練習動輒數十則訊息，塞進那顆會同步的 `StorageState` JSON blob 會把 `/api/sync` 的 payload 撐爆。

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

對話相關（`src/types/chat.ts`）：

```ts
export interface Correction {
  original: string             // 使用者原句中有問題的片段
  corrected: string            // 修正後
  kind: 'grammar' | 'word-choice' | 'collocation' | 'register' | 'naturalness'
  zh: string                   // 中文說明為什麼
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  usedWords?: string[]         // 這則訊息用到的 target words
  corrections?: Correction[]   // 只有 user 訊息會有
  createdAt: number
}

export interface ChatSession {
  id: string
  topic: string
  targetWords: string[]
  correctMode: boolean
  createdAt: number
  endedAt?: number
}

export interface SessionSummary {
  used: string[]               // 成功用出來的 target words
  missed: string[]             // 沒用到的
  corrections: Correction[]    // 整場累積
  newWords: string[]           // AI 帶出來、使用者還沒收藏的字
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
| 抽象層 | **LangChain**（`@langchain/core` + 各家 provider 套件） | 做法沿用 `vincentxuu/quidproquo` 的 `src/lib/rag/model.ts`：provider 由 env 決定，換家不用改業務邏輯 |
| 預設 provider / model | `groq` / `llama-3.3-70b-versatile` | 與 quidproquo 一致；免費額度實用、速度快 |
| 可選 provider | google、openai、openrouter、cerebras、ollama | 後三家走 OpenAI 相容端點，只換 baseURL |
| fallback | `LLM_FALLBACK_PROVIDER` | 主 provider 失敗時退一次；未設定就不退 |
| 結構化輸出 | 先試 `withStructuredOutput(zodSchema)`，失敗退到手動 JSON 解析 | 不是每家 provider 的 function calling 都可靠。quidproquo 直接手動解析，這裡多留原生那條路，兩層都不過才算失敗 |
| env 來源 | Workers 的 `env` 物件 | Workers 上 `process.env` 拿不到 secret（quidproquo 同樣做法） |

**沒有 prompt caching。** Groq 這類 provider 沒有 Anthropic 那種 `cache_control`
斷點，所以：
- 查詞的 system prompt 每次都會重新計費 —— 但 Groq 單價低很多，而且詞條
  快取命中後就完全不呼叫
- **對話每一輪都要把整段歷史重新計費**。單場 30 則的上限因此不只是體驗
  考量，也是成本上限

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
| `POST` | `/api/chat/session` | 開一場對話。Body `{ topic?, correctMode }`；伺服器挑 target words、建 session、回 `{ session, opening }`。 |
| `POST` | `/api/chat/[id]/message` | 送一則使用者訊息，**串流**回 AI 回覆（SSE）。同時寫入 `chat_messages` 並偵測 target word 使用。 |
| `POST` | `/api/chat/[id]/correct` | 對指定 user 訊息做糾錯（結構化輸出）。只在 `correctMode` 開啟時呼叫。 |
| `GET` | `/api/chat/[id]` | 取整場歷史（重新整理／換裝置後接續）。 |
| `POST` | `/api/chat/[id]/end` | 結束並回 `SessionSummary`。 |

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
  source: WordSource   // 從哪裡遇到的（見〈單字捕捉層〉）
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

## 單字捕捉層

七個來源不能用同一個介面吃。對照表：

| 來源 | 型態 | 捕捉方式 |
| --- | --- | --- |
| 文章、論文 | 數位文字，可複製 | 貼上 → 逐字可點（見〈輔助閱讀〉） |
| **考試** | **站上已經有 1,424 題** | **題庫頁直接可點，零摩擦** |
| 書籍 | 紙本，不能複製 | 拍照 → 視覺辨識 → 逐字可點；或直接手打 |
| app、課程、家教 | 聽到的／別處看到的 | 快速輸入：打一個字就存，上下文之後再補 |

四種入口，一個共用的查詞與收藏後端。

### 考古題捕捉（優先做）

這是投報率最高的一項：內容早就在 repo 裡，使用者本來就會在站上讀這些題目，而準備考試時遇到的生字，定義上就是最該記起來的字。

**但站上的考古題與題庫目前是兩個沒接起來的頁面：**

| 頁面 | 資料 | 能不能查字 |
| --- | --- | --- |
| `/[exam]/past-papers` | `past-papers.json`，72 份考卷的 PDF 連結 + 練習打勾 | ❌ PDF 裡的字點不了 |
| `/[exam]/questions` | `questions.json`，1,424 題已解析的文字 | ✅ 接上 tokenizer 即可 |

兩者是同一批考卷的兩種呈現，卻沒有互相連結 —— `past-papers/page.tsx` 裡完全沒有指向題庫的連結，反向也只在 `hasImage` 時連回 PDF 看圖。使用者在考古題頁讀 PDF 遇到生字，得自己知道要跑去題庫翻同一份卷子。

因此這項工作有兩半：

1. **讓題目文字可點** —— `questions/[questionId]/page.tsx` 接上 tokenizer，側欄複用閱讀模式的元件。閱讀理解題要連題組的**文章本體**一起做（`getQuestionGroup` 已經能解析題組），生字多半在文章而不在題幹。
2. **把兩個頁面接起來** —— 考古題頁的每一份卷子加一個「進題庫逐題練習」的連結（`paperId` 兩邊共用，直接對得上）。這是這批功能裡唯一一項**不需要 AI 也有價值**的改動：它本來就該存在。

英文科覆蓋現況：18 份英文考古題，17 份已解析進題庫（819 題）；`pp-cs-en-115`（最新的資工英文）目前只有 PDF。對於這種未解析的卷子，考古題頁要明白標示「此卷尚未進題庫」，並引導到快速輸入 —— 不要讓使用者點了連結才發現是空的。

### 快速輸入

課堂上、家教時、滑手機 app 看到一個字 —— 這時候沒有文章可貼，只有一個字。需要一個全站都在的「快速加字」入口（浮動按鈕或鍵盤快捷鍵）：打字 → 查詞 → 存。三秒內完成，不然就不會有人用。

### 拍照捕捉（選做）

紙本書沒辦法複製貼上。Claude 有視覺能力，一張書頁照片可以直接辨識出文字，接進同一套逐字可點的介面。

放在選做，因為它是這批功能裡唯一會顯著推高單次成本的：一張高解析度照片的視覺 token 數遠高於一次文字查詢，而且每張都是新的、沒有快取可言。另外預設的 Groq `llama-3.3-70b-versatile` 沒有視覺能力，要做的話這條路得單獨指定一個多模態 model。先做前三種入口，看實際上有多常真的要從紙本書抓字，再決定。

### 帶著出處存下來

存字的時候一併記下它從哪來。復習時看到「你是在 110 英文第 12 題遇到這個字的」比看到一句生成例句更能勾起記憶 —— 而且原始的那句話本身就是最好的例句，因為那是你真的讀過的句子。

```ts
export interface WordSource {
  kind: 'reading' | 'question' | 'book' | 'course' | 'chat' | 'manual'
  label?: string        // 書名、課程名稱、app 名稱
  questionId?: string   // 題庫來源，可連回原題
  sentence?: string     // 遇到這個字的那一句原文
}
```

`sentence` 是刻意保留的原始語境。生成的例句是模型寫的，這一句是你真的遇過的 —— 兩者都留。

---

## 輔助閱讀（痛點 5 上半）

新頁面 `/[exam]/reading`：

1. 貼上一段文章／論文段落（存 localStorage，不進 D1）
2. 前端切詞：`/[^A-Za-z'-]+/` 切分並保留原始 offset，逐字可點
3. 點一個字 → 側欄查詞；拖曳選取多字 → 以片語查詢（直接對應筆記兩次提到的「片語」）
4. 側欄有「加入單字庫」按鈕 → 寫入 `savedWords` 並建立 SRS 卡
5. **生字標記**：已在 `savedWords` 內、或 SRS 狀態為 `repetitions === 0`（上次評「不會」）的字加底線，讓使用者一眼看到自己的弱點分布

切詞刻意保持簡單。真正的斷詞交給查詢當下的 lemma 還原，前端只負責切出可點的 token。

---

## 輔助對話（痛點 5 下半）

筆記其他四項（書籍、文章、論文、考試）全是輸入技能，**對話是清單裡唯一的輸出技能**。它也是唯一能同時收掉痛點 2 與痛點 4 的功能：查過的字要真的用出來才記得住，而「用在自己的興趣與工作情境裡」正是筆記第 4 點要的連結。

新頁面 `/[exam]/chat`。

### 一場對話怎麼開始

1. 從 SRS 撈出 5–8 個 **target words** —— 優先取到期的、以及上次評「不會」的（`repetitions === 0`）
2. 主題由 `PersonaProfile` 產生（例如工作填「後端工程師」、興趣填「登山」→ 主題可能是 code review 或行前準備），也可以自己輸入
3. AI 用英文開場，自然地把 target words 織進對話，**不列清單、不明講今天要練哪些字** —— 一旦講明，使用者就會照抄而不是產出

### 對話中的三種輔助

| 輔助 | 做法 |
| --- | --- |
| **看不懂 AI 的字** | AI 訊息裡每個字可點 → 直接開既有的查詞側欄。這是查詞層的複用，不是第二套實作。 |
| **不知道自己講得對不對** | 糾錯模式（預設關）。開啟時，每則使用者訊息額外走一次結構化呼叫，回 `Correction[]`，以摺疊區塊顯示在訊息下方。 |
| **聽力與口說** | 用既有的 `useSpeech` 朗讀 AI 訊息。語音輸入用 Web Speech API 的 `SpeechRecognition`，瀏覽器支援不一致，做成漸進增強 —— 沒有就退回打字。 |

### 為什麼糾錯要另外一次呼叫

直覺做法是讓模型在同一次回覆裡同時給「回話」和「訂正」。但主對話要**串流**才不會讓使用者對著轉圈等，而串流一段 JSON schema 約束的輸出，沒辦法逐字把回話渲染出來。

所以拆開：

- 主對話：`client.messages.stream`，純文字，逐字吐出
- 糾錯：獨立的一次 `output_config.format` 結構化呼叫，**只看使用者那一則訊息**（不送整段歷史），因此又小又便宜，system prompt 也固定可快取

代價是訂正會比回話晚幾百毫秒出現。這反而是對的 —— 對話不被打斷，訂正安靜地補在旁邊。

### target word 偵測

使用者訊息進來時做客戶端字串比對（原形 + 常見屈折：`-s / -ed / -ing / -es`），命中就記進 `used_words`。糾錯模式開啟時，那次結構化呼叫順便回報實際用到哪些字，蓋過字串比對的結果。

字串比對抓不到不規則變化（`take` → `took`）。這是已知限制，不值得為它引進詞形還原函式庫 —— 糾錯模式開著時模型會補上，關著時漏抓一個字的代價只是少記一筆。

### 收尾：把對話接回 SRS

結束時回一份 `SessionSummary`：

- **用出來的字** → 一鍵把這些卡評為「熟悉」。**不自動改 SRS 排程** —— 靜靜地動使用者的複習計畫是會讓人不爽的事，把決定權留給他。
- **沒用到的字** → 留在原本的排程裡，下次還會出現
- **累積的訂正** → 依 `kind` 分組，看得出自己是文法問題還是搭配問題
- **AI 帶出來的新字** → 一鍵加入單字庫

這條迴路是整個系統的閉環：查詞 → 加卡 → SRS 排程 → 對話中被迫產出 → 產出成功就升級。痛點 2 的答案不是更好的閃卡，是**強迫使用**。

### 成本

對話是這個系統最貴的部分，量級遠高於查詞：每則訊息都要送整段歷史，糾錯模式再加一次呼叫。控制手段：

- 系統提示固定 → `cache_control: ephemeral`；多輪則在**最新一輪的最後一個 content block** 下斷點，讓每次請求都能讀到前面整段歷史的快取
- 獨立的每日配額 `CHAT_DAILY_QUOTA`（env，預設 40 則訊息），與查詞配額分開計
- 單場對話上限 30 則訊息，到頂就請使用者收尾（也剛好是一場練習該有的長度）
- 糾錯模式預設關

---

## 不做的事

- 不做帳號系統 —— 沿用既有的匿名 cookie UUID（`src/lib/user-id.ts`）
- 不做離線字典 fallback —— 那正是筆記第 3 點在抱怨的東西
- 不改既有 160 張閃卡的資料格式 —— 它們照舊走 `VocabAnswer`，新的詞條走新的呈現元件
- 不做 PDF / EPUB 匯入 —— 數位文件先靠複製貼上；紙本走拍照
- 不做即時語音對話 —— TTS 朗讀與 STT 輸入是漸進增強，不做有 turn-taking 的語音代理
- 不做發音評分 —— 需要音訊分析，與這輪的目標無關

---

## 風險

| 風險 | 緩解 |
| --- | --- |
| API 成本失控 | 兩層快取 + 每日配額 + 通關密語豁免；批次暖機用半價的 Batches API |
| **對話成本遠高於查詞** | 獨立配額、單場 30 則上限、糾錯預設關、多輪快取斷點；查詞會隨快取變熱而趨近零成本，對話不會 —— 這是主要的持續支出 |
| 對話歷史撐爆 sync payload | 歷史存 D1 的 `chat_messages`，不進會同步的 `StorageState` |
| 冷啟動延遲（生成要數秒） | 先打 GET 探測快取；生成時顯示 skeleton；暖機批次讓高頻字一開始就是熱的 |
| 單一 provider 掛掉或拒絕 | `LLM_FALLBACK_PROVIDER` 退一次；結構化輸出失敗還有手動 JSON 解析那層 |
| 生成內容有錯 | 詞條頁標示「AI 生成」；提供「重新生成」按鈕（計入配額） |
| localStorage 配額 | `savedWords` 只存 headword 與 metadata，詞條本體留在 D1 |
