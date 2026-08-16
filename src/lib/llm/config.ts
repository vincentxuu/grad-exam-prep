import type { Db } from '@/lib/lexicon/store'

/**
 * 執行期 LLM 設定。
 *
 * 對應 quidproquo 的 `RagRuntimeConfig` —— provider 與 model 從設定來，
 * 外部 provider 的 API key 從 env 來，Cloudflare 則使用 AI binding。分開的
 * 好處是換模型不用重新部署，而 key 仍然留在加密的 wrangler secret 裡，
 * 不會變成 D1 裡的明文。
 *
 * 全部欄位都可以是 undefined，代表「沿用 env 或程式預設」。
 */
export interface LlmRuntimeConfig {
  provider?: string
  model?: string
  fallbackProvider?: string
  fallbackModel?: string
  lexiconQuota?: number
  chatQuota?: number
}

interface ConfigRow {
  provider: string | null
  model: string | null
  fallback_provider: string | null
  fallback_model: string | null
  lexicon_quota: number | null
  chat_quota: number | null
}

function nonEmpty(value: string | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function positive(value: number | null): number | undefined {
  return typeof value === 'number' && value > 0 ? value : undefined
}

/**
 * 每個 isolate 快取一份，避免每次請求都多打一次 D1。
 *
 * Worker isolate 生命週期不長，設定改完最多隔幾分鐘就會全部換新；
 * 要立刻生效可以重新部署或等 isolate 輪替。這是拿一點延遲換掉每請求
 * 一次查詢，對讀多寫極少的設定值划算。
 */
let cached: { value: LlmRuntimeConfig; at: number } | null = null
const TTL_MS = 60_000

export function clearConfigCache(): void {
  cached = null
}

export async function loadConfig(db: Db, now: number = Date.now()): Promise<LlmRuntimeConfig> {
  if (cached && now - cached.at < TTL_MS) return cached.value

  let value: LlmRuntimeConfig = {}
  try {
    const row = await db
      .prepare(
        `SELECT provider, model, fallback_provider, fallback_model, lexicon_quota, chat_quota
         FROM llm_config WHERE id = ?`
      )
      .bind('main')
      .first<ConfigRow>()

    if (row) {
      value = {
        provider: nonEmpty(row.provider),
        model: nonEmpty(row.model),
        fallbackProvider: nonEmpty(row.fallback_provider),
        fallbackModel: nonEmpty(row.fallback_model),
        lexiconQuota: positive(row.lexicon_quota),
        chatQuota: positive(row.chat_quota),
      }
    }
  } catch {
    // 表還沒建（migration 沒跑）時安靜地退回 env 設定，不要讓查詞整個掛掉
  }

  cached = { value, at: now }
  return value
}

export async function saveConfig(
  db: Db,
  config: LlmRuntimeConfig,
  now: number = Date.now()
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO llm_config
         (id, provider, model, fallback_provider, fallback_model, lexicon_quota, chat_quota, updated_at)
       VALUES ('main', ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         provider = excluded.provider,
         model = excluded.model,
         fallback_provider = excluded.fallback_provider,
         fallback_model = excluded.fallback_model,
         lexicon_quota = excluded.lexicon_quota,
         chat_quota = excluded.chat_quota,
         updated_at = excluded.updated_at`
    )
    .bind(
      config.provider ?? null,
      config.model ?? null,
      config.fallbackProvider ?? null,
      config.fallbackModel ?? null,
      config.lexiconQuota ?? null,
      config.chatQuota ?? null,
      now
    )
    .run()

  clearConfigCache()
}
