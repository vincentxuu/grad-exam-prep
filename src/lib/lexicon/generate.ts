import Anthropic from '@anthropic-ai/sdk'
import type { LexiconEntry, PersonalBridge, PersonaProfile } from '@/types/lexicon'
import {
  ENTRY_SYSTEM_PROMPT,
  entryUserPrompt,
  PERSONAL_SYSTEM_PROMPT,
  personalUserPrompt,
} from './prompts'
import { LEXICON_ENTRY_SCHEMA, PERSONAL_BRIDGE_SCHEMA } from './schema'

export const LEXICON_MODEL = 'claude-opus-5'

/**
 * Opus 5 的 thinking 預設開啟，而 max_tokens 是 thinking 加回應文字的
 * 總上限 —— 抓太緊會在中途截斷。
 */
const MAX_TOKENS = 8000

const FALLBACK_BETA = 'server-side-fallback-2026-07-01'

export type GenerateResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'refusal' | 'invalid' | 'error'; message: string }

/**
 * 伺服器端 fallback 是否可用。
 *
 * Opus 5 的安全分類器可能直接拒絕請求，`fallbacks: 'default'` 會讓伺服器
 * 自動改用建議的替代模型，而不是把失敗丟給使用者。但這是 beta 參數，
 * 若這個帳號還沒開通、或它與結構化輸出不相容，會回 400。
 *
 * 遇到那種 400 就把旗標關掉、不帶 fallback 重試一次，之後都走無 fallback
 * 路徑。這樣不必在部署前就賭它能不能用。
 */
let fallbackEnabled = true

function isFallbackRejection(err: unknown): boolean {
  if (!(err instanceof Anthropic.BadRequestError)) return false
  const msg = (err.message ?? '').toLowerCase()
  return msg.includes('fallback') || msg.includes(FALLBACK_BETA)
}

function client(apiKey: string): Anthropic {
  return new Anthropic({ apiKey })
}

interface CallOptions {
  apiKey: string
  system: string
  user: string
  schema: Record<string, unknown>
}

/** 送一次結構化輸出請求，回傳解析後的 JSON。 */
async function callStructured<T>(opts: CallOptions): Promise<GenerateResult<T>> {
  const { apiKey, system, user, schema } = opts

  const send = (withFallback: boolean) =>
    client(apiKey).beta.messages.create({
      model: LEXICON_MODEL,
      max_tokens: MAX_TOKENS,
      // system 固定不變才快取得到；查詢字一律走 user turn
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: user }],
      output_config: { format: { type: 'json_schema', schema } },
      ...(withFallback ? { betas: [FALLBACK_BETA], fallbacks: 'default' as const } : {}),
    })

  let response: Awaited<ReturnType<typeof send>>
  try {
    try {
      response = await send(fallbackEnabled)
    } catch (err) {
      if (!fallbackEnabled || !isFallbackRejection(err)) throw err
      // 這個帳號用不了伺服器端 fallback，關掉之後不再嘗試
      fallbackEnabled = false
      response = await send(false)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, reason: 'error', message }
  }

  // 讀 content 之前一定要先看 stop_reason —— 被拒絕時 content 會是空的，
  // 直接取 content[0] 會炸
  if (response.stop_reason === 'refusal') {
    return {
      ok: false,
      reason: 'refusal',
      message: '模型拒絕生成這個詞條',
    }
  }

  const text = response.content.find((b) => b.type === 'text')?.text
  if (!text) {
    return { ok: false, reason: 'invalid', message: '回應沒有文字內容' }
  }

  try {
    return { ok: true, data: JSON.parse(text) as T }
  } catch {
    return { ok: false, reason: 'invalid', message: '回應不是合法的 JSON' }
  }
}

export function generateEntry(apiKey: string, term: string): Promise<GenerateResult<LexiconEntry>> {
  return callStructured<LexiconEntry>({
    apiKey,
    system: ENTRY_SYSTEM_PROMPT,
    user: entryUserPrompt(term),
    schema: LEXICON_ENTRY_SCHEMA as unknown as Record<string, unknown>,
  })
}

export function generatePersonal(
  apiKey: string,
  headword: string,
  persona: PersonaProfile
): Promise<GenerateResult<PersonalBridge>> {
  return callStructured<PersonalBridge>({
    apiKey,
    system: PERSONAL_SYSTEM_PROMPT,
    user: personalUserPrompt(headword, persona),
    schema: PERSONAL_BRIDGE_SCHEMA as unknown as Record<string, unknown>,
  })
}

/** 測試用：重設 fallback 旗標。 */
export function __resetFallbackFlag(): void {
  fallbackEnabled = true
}
