<div align="center">

# Grad Exam Prep

**研究所考試準備平台 —— 題庫、閃卡、SM-2 排程，以及跑在 Cloudflare Workers 上的 AI 英文查詞與對話練習。**

[![CI](https://github.com/vincentxuu/grad-exam-prep/actions/workflows/checks.yml/badge.svg)](https://github.com/vincentxuu/grad-exam-prep/actions/workflows/checks.yml)

[快速開始](#快速開始) · [功能一覽](#功能一覽) · [部署](#部署到-cloudflare) · [設定 LLM](#設定-llm-provider) · [內容管線](#內容管線) · [設計原則](#為什麼這樣設計) · [文件](#文件)

</div>

Grad Exam Prep 是一個 Next.js（App Router）站台，透過 [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) 部署到 Cloudflare Workers。題庫、閃卡與複習排程存在 D1；英文查詞與對話練習由 LLM 生成，預設走 Workers AI binding，也可以在執行期切換到 Groq、Gemini、OpenAI 等外部 provider——不用重新部署。

> [!IMPORTANT]
> 查詞與對話都會消耗 LLM 配額（各有獨立每日上限）。AI 生成的詞條與對話內容可能出錯，重要觀念請以書本與考古題解答為準。API key 一律放 `wrangler secret`，**不要**寫進 `.env`、D1 或任何版控檔案。

## 功能一覽

| 頁面 | 功能 |
| --- | --- |
| `/[exam]/lookup` | 查單字與片語，管理單字庫與個人化情境 |
| `/[exam]/reading` | 貼上文章 → 逐字可點查詞 → 一鍵加入單字庫 |
| `/[exam]/questions/[id]` | 英文題目與題組文章逐字可點（只在英文科開啟） |
| `/[exam]/chat` | 英文對話練習，把單字庫裡到期的字逼出來 |
| `/[exam]/flashcards` | 收藏的字與既有閃卡共用同一個 SM-2 排程 |
| `/settings/llm` | 換 provider／model、調額度、測試連線（需通關密語） |
| 全站 header「加字」 | 快速加字（`Ctrl/⌘ + K`）—— 課堂、家教、app 上聽到的字 |

詞條走兩層快取：通用詞條（`lexicon_entries`）全站共享，個人化例句
（`lexicon_personal`）依 persona 分開存。查過的字全站免費，只有第一次
生成會計入配額。

對話會從 SRS 撈到期與不熟的字當練習目標，但**不會告訴使用者今天在練
哪些字** —— 一旦講明就會照抄，而不是自己產出。結束時的總結可以一鍵把
用出來的字記為熟悉，或把 AI 帶出來的新字加進單字庫；兩者都要手動按，
不自動改複習排程。

## 快速開始

需求：Node.js 22+、npm。不需要任何 API key —— 預設直接使用 Cloudflare
Workers AI binding。

```bash
git clone https://github.com/vincentxuu/grad-exam-prep.git
cd grad-exam-prep
npm install
npm run dev
```

開發前先套用 D1 migrations（本機）：

```bash
npx wrangler d1 migrations apply grad-exam-prep-db --local
```

常用指令：

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 本機開發（`initOpenNextCloudflareForDev()` 會接上本地 Workers 環境） |
| `npm run build` / `npm run start` | 一般 Next.js build / serve |
| `npm run preview` | OpenNext build + 本機 Workers 預覽 |
| `npm run lint` / `npm run typecheck` / `npm test` | Biome 檢查、TypeScript、Jest |

## 部署到 Cloudflare

站台跑在 Cloudflare Workers 上，worker 名稱與設定在 `wrangler.json`。

**自動部署**：push 到 `main` 就會觸發 `.github/workflows/deploy.yml`，跑完 typecheck 與
測試才部署。也可以在 Actions 頁面手動 `workflow_dispatch`。

需要一個 repository secret：

| Secret | 用途 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | 具 Workers 部署權限的 API token |

`account_id` 與 Workers AI 的 `AI` binding 已經寫在 `wrangler.json`。站內預設模型不需要
另外建立推論用的 Cloudflare API token；上面的 repository secret 只供 GitHub Actions 部署。

**手動部署**（本機）：

```bash
npm run deploy
```

D1 migrations 不在自動流程裡，schema 有變動時要自己跑：

```bash
npx wrangler d1 migrations apply grad-exam-prep-db --remote
```

查詞需要 `0003_lexicon.sql`、對話需要 `0004_chat.sql`，**部署前要先套用**，
否則對應的 API 會因為找不到資料表而回 500。兩者互相獨立，可以只上其中一半。
`0005_llm_config.sql` 不套用也不會壞 —— 讀不到表就整份設定當空的，全部
回頭讀環境變數；想在線上改 provider 而不重新部署才需要它。

## 設定 LLM provider

### 設定 API key

**本機開發**：預設直接使用 Cloudflare Workers AI binding。若要改用外部 provider，
複製範本後填入該 provider 的 key；`npm run dev` 會自動讀。

```bash
cp .dev.vars.example .dev.vars
# 只有改用 Groq、Gemini 等外部 provider 時才需要填 key
npm run dev
```

`.dev.vars` 已在 `.gitignore` 裡，不會進版控。**不要**把 key 寫進 `.env`，
Workers 讀不到那支。

**線上（Cloudflare Workers）**：`.dev.vars` 不會被部署，要另外寫進 secret。

```bash
npx wrangler secret put GROQ_API_KEY      # 貼上 key，不會顯示在畫面上
npx wrangler secret list                  # 確認寫進去了
```

取得 key：[Groq Console](https://console.groq.com/keys)、
[Google AI Studio](https://aistudio.google.com/apikey)（Gemini）、
[OpenAI](https://platform.openai.com/api-keys)。

### 換 provider 的順序

換家要做兩件事，**順序不能顛倒**：

```bash
npx wrangler secret put GEMINI_API_KEY   # 1. key 進 secret
npm run deploy                            # 2. 部署（secret 綁在 worker 上）
```

3. 到 `/settings/llm` 選 Google Gemini、填 model、按「測試連線」確認通了，再存檔。

先改設定再給 key 的話，中間那段時間 provider 指向一家沒有 key 的服務，
查詞會回 503。設定頁會先擋下來提醒，但腳本化的時候沒有人擋。

程式碼由 `src/lib/llm/model.ts` 統一路由 provider。Cloudflare 透過一層薄轉接直接呼叫
`env.AI.run(...)`；`openrouter` / `cerebras` / `ollama` 才走 OpenAI 相容端點。

#### 用 Cloudflare Workers AI

站台本來就在 Workers 上，因此預設直接使用 `wrangler.json` 的 Workers AI binding：

```jsonc
{
  "ai": { "binding": "AI" }
}
```

程式透過 `env.AI.run(...)` 推論、透過 `env.AI.models()` 取得模型清單，不需要
推論用 API token。model 要帶 `@cf/` 前綴（例如
`@cf/meta/llama-3.3-70b-instruct-fp8-fast`），可用清單見 Cloudflare 的
Workers AI models 頁。若某個執行環境沒有 `AI` binding，設定頁會標成
「未設 binding」，直接呼叫 `POST /api/lexicon` 則回 503。

### 執行期設定：`/settings/llm`

非機密的設定 —— provider、model、fallback、每日額度 —— 放在 D1 的
`llm_config` 表（`0005_llm_config.sql`），改完最多一分鐘生效，**不用重新部署**。

平常從 **`/settings/llm`** 改就好（header 上有連結），要通關密語，手機也能用：

- 選 provider，**model 從下拉選單挑** —— 清單是跟 provider 現撈的
  （Cloudflare 用 binding，其他家用 models API），不是寫死的。撈不到會標明並退回內建範例，
  也隨時可以切成手打
- **「測試連線」**打一次最小的真呼叫，回報通不通、幾毫秒、模型回了什麼
- **「試用對話」**可以直接跟選好的 model 聊兩句 —— 通了不代表好用，中文
  說明順不順、糾錯準不準得真的講過才知道。不留紀錄、不計配額
- 上面兩個測的都是表單上**還沒存**的那一組，先確認再存
- 外部 provider 的 key 沒設好會標「未設 key」；Cloudflare 則檢查 `AI` binding
- 上方常駐顯示目前真正生效的 route（三層疊完的結果）

需要腳本化時 SQL 也還在：

```bash
npx wrangler d1 execute grad-exam-prep-db --remote --command \
  "INSERT INTO llm_config (id, provider, model, updated_at)
   VALUES ('main', 'google', 'gemini-2.0-flash', unixepoch())
   ON CONFLICT(id) DO UPDATE SET
     provider = excluded.provider,
     model = excluded.model,
     updated_at = excluded.updated_at"
```

**API key 不要寫進這張表，設定頁也不收 key。** D1 存的是明文，拿得到資料庫
的人都看得到；`wrangler secret` 是加密存放而且讀不回來。表裡只放「洩漏了
也不痛」的東西，`GET /api/llm-config` 對每家的連線能力只回布林值，不回 key 內容。

優先序是 **D1 表 → 環境變數 → 程式預設**，欄位各自獨立 —— 表裡
`model` 留 NULL 就沿用 `LLM_MODEL`，兩個都沒有才用
`@cf/meta/llama-3.3-70b-instruct-fp8-fast`。
表還沒建（migration 沒跑）時整張表當作空的，功能照常走環境變數。

| 欄位 | 對應環境變數 | 預設 |
| --- | --- | --- |
| `provider` | `LLM_PROVIDER` | `cloudflare` |
| `model` | `LLM_MODEL` | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| `fallback_provider` | `LLM_FALLBACK_PROVIDER` | 無（不退） |
| `fallback_model` | `LLM_FALLBACK_MODEL` | 無 |
| `lexicon_quota` | `LEXICON_DAILY_QUOTA` | 60 |
| `chat_quota` | `CHAT_DAILY_QUOTA` | 40 |

設定值每個 isolate 快取 60 秒，避免每次請求都多打一次 D1。

### 環境變數一覽

查詢功能（`/api/lexicon`）會讀以下設定。標「可用表覆蓋」的欄位會先看
`llm_config`，表裡沒設定才回頭讀環境變數：

| 名稱 | 必要 | 用途 |
| --- | --- | --- |
| `AI` binding | 預設 provider 必要 | `wrangler.json` 已設定；Cloudflare 推論直接走 binding，不需要 API key。 |
| `GROQ_API_KEY` | 用 Groq 時 | |
| `LLM_PROVIDER` | 否 | `cloudflare`（預設）/ `groq` / `google` / `openai` / `openrouter` / `cerebras` / `ollama`。可用表覆蓋。 |
| `LLM_MODEL` | 否 | 預設 `@cf/meta/llama-3.3-70b-instruct-fp8-fast`。可用表覆蓋。 |
| `LLM_FALLBACK_PROVIDER`／`LLM_FALLBACK_MODEL` | 否 | 主 provider 失敗時退到這家。未設定就不退。可用表覆蓋。 |
| `GOOGLE_API_KEY`／`GEMINI_API_KEY` | 用 Gemini 時 | |
| `OPENAI_API_KEY`／`OPENROUTER_API_KEY`／`CEREBRAS_API_KEY` | 用該家時 | |
| `OLLAMA_API_BASE` | 用 Ollama 時 | 預設 `http://localhost:11434/v1` |
| `LEXICON_DAILY_QUOTA` | 否 | 每人每日生成次數上限，預設 60。快取命中不計入。可用表覆蓋。 |
| `CHAT_DAILY_QUOTA` | 否 | 每人每日對話訊息上限，預設 40。**與查詞額度分開計** —— 對話貴得多。可用表覆蓋。 |
| `PASSPHRASE_HASH` | 否 | 既有的同步用密語。帶此 bearer token 的請求不受配額限制。 |

### AI 輸出簡轉繁

所有 provider 的 AI 輸出都會在共用 LLM 邊界經過 `opencc-js`，使用
`cn → twp` 轉成臺灣繁體與慣用詞，例如「软件／鼠标／数据库」會變成
「軟體／滑鼠／資料庫」。結構化資料會遞迴轉換字串值；對話串流會先緩衝到
詞組安全邊界，避免模型把「软」和「件」拆成不同 chunk 時漏轉。舊的查詞快取
與舊 AI 對話內容也會在讀取時正規化，不必直接改寫 D1 歷史資料。

## 內容管線

### 必要字庫與閃卡生成

`public/data/ntu-im-vocab-master.json` 是原始 master，閃卡只納入
`must_know`、`important`、`worth_studying`、`domain` 四層。人工審核過的 alias、
非詞彙與修正放在 `public/data/im-vocab-curation.json`；不要直接手改產出的
IM 英文卡。

```bash
# 日常：重新生成並確認 checked-in artifact 沒有過期
npm run generate:im-vocab
npm run check:im-vocab
npm run validate:content

# 只有更新 ECDICT snapshot 時才需要；revision 必須固定並同步更新 notice
python3 -m pip install -r scripts/requirements-im-vocab.txt
python3 scripts/import-ecdict-im-vocab.py \
  --ecdict /path/to/ECDICT/ecdict.csv \
  --revision <git-commit-sha>
```

生成器會原子替換 `im-english` 的卡片，其他科目的卡不動。內容驗證會要求每個
curated target 恰好一張、ID 唯一、正面只有 headword，並拒絕選擇題或填空語法。

### 預暖詞條快取

第一次查一個字要等十幾秒生成。必要字庫有數千筆，預暖腳本預設只處理前
100 筆；要擴大範圍時務必先用 dry-run 與 `--limit` 估算：

```bash
# 先看會處理哪些字，不呼叫 API
node scripts/warm-lexicon.js --dry-run

# 實際暖機（會花錢，約 94 個字）
BASE_URL=https://<your-worker>.workers.dev \
PASSPHRASE_HASH=<與 worker secret 相同的雜湊> \
node scripts/warm-lexicon.js

# 明確確認成本後才允許處理整份字庫
node scripts/warm-lexicon.js --all
```

腳本打的是已部署的 `/api/lexicon`，不是自己重寫一套生成邏輯 —— 這樣
system prompt 與 schema 只有一份，不會走鐘。帶通關密語所以不受每日配額限制。

## 為什麼這樣設計

- **一份 prompt、一條路徑**：預暖腳本打的是正式的 `/api/lexicon`，system prompt 與 schema 不會因為腳本另起爐灶而走鐘。
- **快取優先**：通用詞條全站共享，查詞成本隨快取變熱趨近於零；只有第一次生成計入配額。
- **key 不落明文**：API key 只進 `wrangler secret`；D1 的 `llm_config` 只放洩漏了也不痛的非機密設定。
- **換 provider 不用重新部署**：provider、model、額度都在 `/settings/llm` 執行期改，先測試連線再存檔。
- **臺灣繁體輸出**：所有 provider 的輸出在共用邊界經 `opencc-js` 正規化，串流也按詞組安全邊界緩衝。
- **排程只有一套**：查詞收藏的字與既有閃卡共用同一個 SM-2 排程，不自動改狀態。

## 運作方式

```text
瀏覽器
    |
    v
Next.js on Cloudflare Workers      @opennextjs/cloudflare，靜態與 SSR
    |
    +-- /api/lexicon               兩層快取：lexicon_entries（全站）→ lexicon_personal（persona）
    +-- /api/chat                  SRS 到期字當練習目標的對話練習
    +-- src/lib/llm/model.ts       provider 路由：Workers AI binding 或 LangChain 外部 provider
    |                              輸出統一經 opencc-js 簡轉繁
    +-- /settings/llm              執行期設定（D1 llm_config，每 isolate 快取 60 秒）
    `-- D1                         題庫、閃卡、SRS 排程、詞條快取、llm_config、tts_cache
```

## 成本與限制

- **查詢與對話的成本結構不同**：查詞會隨快取變熱趨近於零，對話不會 ——
  每則訊息都要送整段歷史。所以對話有獨立配額、單場 30 則上限、糾錯預設關閉。
- **寫錯的 provider 不會報錯**：不在清單裡的值（打錯字、寫了沒支援的一家）
  會被當成沒設定，安靜地退到 env 再退到 Cloudflare。改完最好查一個沒查過的字確認。
- **AI 生成內容僅供參考**：詞條例句與對話糾錯都可能出錯，搭配考古題解答使用。
- **配額是軟性保護**：`PASSPHRASE_HASH` 的 bearer token 不受配額限制，妥善保管。

## 文件

- [English vocab lookup 設計](docs/superpowers/specs/2026-08-12-english-vocab-lookup-design.md)
- [Question bank learning 設計](docs/superpowers/specs/2026-06-03-question-bank-learning-design.md)
- [考古題分析研究](docs/research/)
- [第三方授權聲明](THIRD_PARTY_NOTICES.md)
