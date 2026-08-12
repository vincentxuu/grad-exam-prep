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

### Worker secrets / 環境變數

查詞功能（`/api/lexicon`）需要以下設定，用 `npx wrangler secret put <NAME>` 寫入：

| 名稱 | 必要 | 用途 |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | 生成路徑必要 | 生成詞條與個人化例句。**沒設定時 `POST /api/lexicon` 回 503**；`GET`（只讀快取）不受影響。 |
| `LEXICON_DAILY_QUOTA` | 否 | 每人每日生成次數上限，預設 60。快取命中不計入。 |
| `PASSPHRASE_HASH` | 否 | 既有的同步用密語。帶此 bearer token 的請求不受配額限制。 |

**手動部署**（本機）：

```bash
npm run deploy
```

D1 migrations 不在自動流程裡，schema 有變動時要自己跑：

```bash
npx wrangler d1 migrations apply grad-exam-prep-db --remote
```

查詞功能需要 `0003_lexicon.sql`，**部署前要先套用**，否則 `/api/lexicon` 會因為找不到資料表而回 500。
