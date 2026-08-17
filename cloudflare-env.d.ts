/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  DB: D1Database
  ASSETS: Fetcher
  AI: Ai
  JWT_SECRET: string

  // ── LLM provider 路由（做法沿用 vincentxuu/quidproquo）──────────────
  /** groq | google | openai | cloudflare | openrouter | cerebras | ollama，預設 cloudflare */
  LLM_PROVIDER?: string
  /** 預設 @cf/meta/llama-3.3-70b-instruct-fp8-fast */
  LLM_MODEL?: string
  /** 主 provider 失敗時退到這家，未設定就不退 */
  LLM_FALLBACK_PROVIDER?: string
  LLM_FALLBACK_MODEL?: string

  GROQ_API_KEY?: string
  GOOGLE_API_KEY?: string
  GEMINI_API_KEY?: string
  OPENAI_API_KEY?: string
  OPENROUTER_API_KEY?: string
  CEREBRAS_API_KEY?: string
  OLLAMA_API_BASE?: string

  /** 每人每日查詞生成上限，預設 60。 */
  LEXICON_DAILY_QUOTA?: string
  /** 每人每日對話訊息上限，預設 40。與查詞額度分開計。 */
  CHAT_DAILY_QUOTA?: string
}
