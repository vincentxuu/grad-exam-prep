/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  DB: D1Database
  ASSETS: Fetcher
  PASSPHRASE_HASH: string
  /** Anthropic API key（wrangler secret）。沒設定時查詞的生成路徑會回 503。 */
  ANTHROPIC_API_KEY: string
  /** 每人每日生成次數上限，未設定時用 DEFAULT_DAILY_QUOTA（60）。 */
  LEXICON_DAILY_QUOTA?: string
  /** 每人每日對話訊息上限，未設定時用 DEFAULT_CHAT_QUOTA（40）。與查詞額度分開計。 */
  CHAT_DAILY_QUOTA?: string
}
