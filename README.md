This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 部署

站台跑在 Cloudflare Workers 上（透過 `@opennextjs/cloudflare`），worker 名稱與設定在
`wrangler.json`。

**自動部署**：push 到 `main` 就會觸發 `.github/workflows/deploy.yml`，跑完 typecheck 與
測試才部署。也可以在 Actions 頁面手動 `workflow_dispatch`。

需要一個 repository secret：

| Secret | 用途 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | 具 Workers 部署權限的 API token |

`account_id` 已經寫在 `wrangler.json`，不必另外設 `CLOUDFLARE_ACCOUNT_ID`。

### 設定 API key

**本機開發**：複製範本後填值，`npm run dev` 會自動讀（`next.config.mjs` 有呼叫
`initOpenNextCloudflareForDev()`）。

```bash
cp .dev.vars.example .dev.vars
# 編輯 .dev.vars，填入 GROQ_API_KEY
npm run dev
```

`.dev.vars` 已在 `.gitignore` 裡，不會進版控。**不要**把 key 寫進 `.env`，
Workers 讀不到那支。

**線上（Cloudflare Workers）**：`.dev.vars` 不會被部署，要另外寫進 secret。

```bash
npx wrangler secret put GROQ_API_KEY      # 貼上 key，不會顯示在畫面上
npx wrangler secret list                  # 確認寫進去了
```

取得 key：[Groq Console](https://console.groq.com/keys)（預設，有免費額度）、
[Google AI Studio](https://aistudio.google.com/apikey)（Gemini）、
[OpenAI](https://platform.openai.com/api-keys)。

### 執行期設定：`/settings/llm`

非機密的設定 —— provider、model、fallback、每日額度 —— 放在 D1 的
`llm_config` 表（`0005_llm_config.sql`），改完最多一分鐘生效，**不用重新部署**。

平常從 **`/settings/llm`** 改就好（header 上有連結），要通關密語，手機也能用：

- 選 provider，**model 從下拉選單挑** —— 清單是跟 provider 現撈的
  （`GET {baseURL}/models`），不是寫死的。撈不到會標明並退回內建範例，
  也隨時可以切成手打
- **「測試連線」**打一次最小的真呼叫，回報通不通、幾毫秒、模型回了什麼
- **「試用對話」**可以直接跟選好的 model 聊兩句 —— 通了不代表好用，中文
  說明順不順、糾錯準不準得真的講過才知道。不留紀錄、不計配額
- 上面兩個測的都是表單上**還沒存**的那一組，先確認再存
- key 沒設好的 provider 會標「未設 key」，選了會直接說缺哪個環境變數
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
也不痛」的東西，`GET /api/llm-config` 對每家 key 只回布林值，不回內容。

優先序是 **D1 表 → 環境變數 → 程式預設**，欄位各自獨立 —— 表裡
`model` 留 NULL 就沿用 `LLM_MODEL`，兩個都沒有才用 `llama-3.3-70b-versatile`。
表還沒建（migration 沒跑）時整張表當作空的，功能照常走環境變數。

| 欄位 | 對應環境變數 | 預設 |
| --- | --- | --- |
| `provider` | `LLM_PROVIDER` | `groq` |
| `model` | `LLM_MODEL` | `llama-3.3-70b-versatile` |
| `fallback_provider` | `LLM_FALLBACK_PROVIDER` | 無（不退） |
| `fallback_model` | `LLM_FALLBACK_MODEL` | 無 |
| `lexicon_quota` | `LEXICON_DAILY_QUOTA` | 60 |
| `chat_quota` | `CHAT_DAILY_QUOTA` | 40 |

設定值每個 isolate 快取 60 秒，避免每次請求都多打一次 D1。

### 環境變數一覽

查詞功能（`/api/lexicon`）會讀以下設定。標「可用表覆蓋」的欄位會先看
`llm_config`，表裡沒設定才回頭讀環境變數：

| 名稱 | 必要 | 用途 |
| --- | --- | --- |
| `GROQ_API_KEY` | 預設 provider 必要 | 預設走 Groq。**沒設定時 `POST /api/lexicon` 回 503**；`GET`（只讀快取）不受影響。 |
| `LLM_PROVIDER` | 否 | `groq`（預設）/ `google` / `openai` / `cloudflare` / `openrouter` / `cerebras` / `ollama`。可用表覆蓋。 |
| `LLM_MODEL` | 否 | 預設 `llama-3.3-70b-versatile`。可用表覆蓋。 |
| `LLM_FALLBACK_PROVIDER`／`LLM_FALLBACK_MODEL` | 否 | 主 provider 失敗時退到這家。未設定就不退。可用表覆蓋。 |
| `GOOGLE_API_KEY`／`GEMINI_API_KEY` | 用 Gemini 時 | |
| `OPENAI_API_KEY`／`OPENROUTER_API_KEY`／`CEREBRAS_API_KEY` | 用該家時 | |
| `CLOUDFLARE_API_TOKEN`＋`CLOUDFLARE_ACCOUNT_ID` | 用 Workers AI 時 | **兩個都要**。account id 不機密。 |
| `OLLAMA_API_BASE` | 用 Ollama 時 | 預設 `http://localhost:11434/v1` |
| `LEXICON_DAILY_QUOTA` | 否 | 每人每日生成次數上限，預設 60。快取命中不計入。可用表覆蓋。 |
| `CHAT_DAILY_QUOTA` | 否 | 每人每日對話訊息上限，預設 40。**與查詞額度分開計** —— 對話貴得多。可用表覆蓋。 |
| `PASSPHRASE_HASH` | 否 | 既有的同步用密語。帶此 bearer token 的請求不受配額限制。 |

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

### 換 LLM provider

生成層用 **LangChain** 當抽象層（做法沿用 `vincentxuu/quidproquo` 的
`src/lib/rag/model.ts`），換家要做兩件事，**順序不能顛倒**：

```bash
npx wrangler secret put GEMINI_API_KEY   # 1. key 進 secret
npm run deploy                            # 2. 部署（secret 綁在 worker 上）
```

3. 到 `/settings/llm` 選 Google Gemini、填 model、按「測試連線」確認通了，再存檔。

先改設定再給 key 的話，中間那段時間 provider 指向一家沒有 key 的服務，
查詞會回 503。設定頁會先擋下來提醒，但腳本化的時候沒有人擋。

程式碼只有 `src/lib/llm/model.ts` 知道 provider 的差異；其餘一律不受影響。
`cloudflare` / `openrouter` / `cerebras` / `ollama` 都走 OpenAI 相容端點，只是換 baseURL。

**寫錯的 provider 不會報錯。** 不在清單裡的值（打錯字、寫了沒支援的一家）
會被當成沒設定，安靜地退到 env 再退到 groq。改完最好查一個沒查過的字確認。

#### 用 Cloudflare Workers AI

站台本來就在 Workers 上，模型可以走同一個帳號。端點是 OpenAI 相容的，
路徑帶帳號，所以 token 之外還要 account id：

```bash
npx wrangler secret put CLOUDFLARE_API_TOKEN   # 需 Account > Workers AI > Read 權限
```

account id 不機密（`wrangler.json` 裡本來就有），放 `vars` 就好：

```jsonc
{
  "vars": { "CLOUDFLARE_ACCOUNT_ID": "1ff43f0d4c3ad3bd98ce5ab767546a68" }
}
```

部署後到 `/settings/llm` 切過去。model 要帶 `@cf/` 前綴（例如
`@cf/meta/llama-3.3-70b-instruct-fp8-fast`），可用清單見 Cloudflare 的
Workers AI models 頁。兩個環境變數少一個就算沒設定好，設定頁會標成
「未設 key」，直接呼叫 `POST /api/lexicon` 則回 503。

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
回頭讀環境變數。想在線上改 provider 而不重新部署才需要它。

## 英文查詞與單字庫

| 頁面 | 功能 |
| --- | --- |
| `/[exam]/lookup` | 查單字與片語，管理單字庫與個人化情境 |
| `/[exam]/reading` | 貼上文章 → 逐字可點查詞 → 一鍵加入單字庫 |
| `/[exam]/questions/[id]` | 英文題目與題組文章逐字可點（只在英文科開啟） |
| `/[exam]/chat` | 英文對話練習，把單字庫裡到期的字逼出來 |
| `/settings/llm` | 換 provider／model、調額度、測試連線（需通關密語） |
| 全站 header「加字」 | 快速加字（`Ctrl/⌘ + K`）—— 課堂、家教、app 上聽到的字 |
| `/[exam]/flashcards` | 收藏的字與既有閃卡共用同一個 SM-2 排程 |

詞條走兩層快取：通用詞條（`lexicon_entries`）全站共享，個人化例句
（`lexicon_personal`）依 persona 分開存。查過的字全站免費，只有第一次
生成會計入配額。

對話會從 SRS 撈到期與不熟的字當練習目標，但**不會告訴使用者今天在練
哪些字** —— 一旦講明就會照抄，而不是自己產出。結束時的總結可以一鍵把
用出來的字記為熟悉，或把 AI 帶出來的新字加進單字庫；兩者都要手動按，
不自動改複習排程。

**成本提醒**：查詞會隨快取變熱趨近於零，對話不會 —— 每則訊息都要送整段
歷史。所以對話有獨立配額、單場 30 則上限、糾錯預設關閉。
