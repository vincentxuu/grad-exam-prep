import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { z } from 'zod'
import { providerInfo } from './catalog'
import type { LlmRuntimeConfig } from './config'
import {
  createModel,
  hasCredentials,
  type LlmEnv,
  type ModelRoute,
  resolveFallbackRoute,
  resolveRoute,
  routeLabel,
} from './model'
import {
  plainMessageText,
  toTaiwanTraditional,
  toTaiwanTraditionalDeep,
  toTaiwanTraditionalStream,
} from './traditional-chinese'

export type LlmResult<T> =
  | { ok: true; data: T; route: string }
  | { ok: false; reason: 'no-credentials' | 'invalid' | 'error'; message: string }

/**
 * 從模型回應裡挖出 JSON。
 *
 * quidproquo 的 planner 也是這樣做（手動解析 + 預設值），因為不是每家
 * provider 的結構化輸出都可靠。這裡多做一層：先試 withStructuredOutput，
 * 失敗才退到手動解析，兩邊都不行才算失敗。
 */
function extractJson(text: string): unknown {
  const trimmed = text.trim()

  // 模型很愛把 JSON 包在 ```json ... ``` 裡
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1].trim() : trimmed

  try {
    return JSON.parse(candidate)
  } catch {
    // 前後有雜訊時，取第一個 { 到最後一個 }
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1))
    }
    throw new Error('回應裡找不到 JSON')
  }
}

function messageText(content: unknown): string {
  return toTaiwanTraditional(plainMessageText(content))
}

const MANUAL_JSON_ATTEMPTS = 2

function validationSummary(error: z.ZodError): string {
  return error.issues
    .slice(0, 8)
    .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
    .join('; ')
}

function manualJsonPrompt<T>(user: string, schema: z.ZodType<T>, previousIssue?: string): string {
  const jsonSchema = JSON.stringify(z.toJSONSchema(schema), null, 2)
  const correction = previousIssue
    ? `\n\n上一份輸出的問題：${previousIssue}\n請重新產生一份完整且符合 schema 的 JSON。`
    : ''

  return `${user}\n\n只回傳符合下列 JSON Schema 的 JSON object，不要加 Markdown code fence 或任何說明文字。\n\n${jsonSchema}${correction}`
}

interface StructuredOptions<T> {
  env: LlmEnv
  /** D1 的執行期設定，優先於 env */
  config?: LlmRuntimeConfig
  system: string
  user: string
  schema: z.ZodType<T>
  maxTokens?: number
}

async function tryRoute<T>(route: ModelRoute, opts: StructuredOptions<T>): Promise<LlmResult<T>> {
  const { env, system, user, schema, maxTokens } = opts

  if (!hasCredentials(env, route)) {
    return {
      ok: false,
      reason: 'no-credentials',
      message:
        route.provider === 'cloudflare'
          ? 'cloudflare 的 AI binding 尚未設定'
          : `${route.provider} 的 API key 尚未設定`,
    }
  }

  const model = createModel(env, route, { maxTokens })
  let previousIssue: string | undefined

  // 先走 provider 原生的結構化輸出
  try {
    const structured = model.withStructuredOutput(schema)
    const data = toTaiwanTraditionalDeep(
      await structured.invoke([new SystemMessage(system), new HumanMessage(user)])
    )
    const parsed = schema.safeParse(data)
    if (parsed.success) return { ok: true, data: parsed.data, route: routeLabel(route) }

    // 原生 structured output 偶爾仍會缺欄；帶著錯誤原因進手動 JSON 修復路徑。
    previousIssue = validationSummary(parsed.error)
  } catch {
    // 有些模型／端點不支援 function calling，退回手動解析
  }

  for (let attempt = 0; attempt < MANUAL_JSON_ATTEMPTS; attempt += 1) {
    let response
    try {
      response = await model.invoke([
        new SystemMessage(system),
        new HumanMessage(manualJsonPrompt(user, schema, previousIssue)),
      ])
    } catch (err) {
      return {
        ok: false,
        reason: 'error',
        message: err instanceof Error ? err.message : String(err),
      }
    }

    let candidate: unknown
    try {
      candidate = extractJson(messageText(response.content))
    } catch (err) {
      previousIssue = err instanceof Error ? err.message : String(err)
      if (attempt + 1 < MANUAL_JSON_ATTEMPTS) continue
      return { ok: false, reason: 'error', message: previousIssue }
    }

    const parsed = schema.safeParse(candidate)
    if (parsed.success) return { ok: true, data: parsed.data, route: routeLabel(route) }
    previousIssue = validationSummary(parsed.error)
  }

  console.warn(`[llm structured ${routeLabel(route)}] invalid response: ${previousIssue}`)
  return {
    ok: false,
    reason: 'invalid',
    message: `回應不符合預期結構：${previousIssue ?? 'unknown validation error'}`,
  }
}

/**
 * 要一份結構化輸出，主 route 失敗時退到 fallback route。
 */
export async function generateStructured<T>(opts: StructuredOptions<T>): Promise<LlmResult<T>> {
  const primary = await tryRoute(resolveRoute(opts.env, opts.config), opts)
  if (primary.ok) return primary

  const fallback = resolveFallbackRoute(opts.env, opts.config)
  if (!fallback) return primary

  const second = await tryRoute(fallback, opts)
  // fallback 也失敗的話回報主 route 的錯，那個比較能反映真正的問題
  return second.ok ? second : primary
}

export interface StreamOptions {
  env: LlmEnv
  config?: LlmRuntimeConfig
  system: string
  /** 已經是 LangChain 訊息陣列（對話歷史） */
  messages: (SystemMessage | HumanMessage)[]
  maxTokens?: number
}

/** 串流純文字。對話用。 */
export function streamText(opts: StreamOptions) {
  const route = resolveRoute(opts.env, opts.config)
  const model = createModel(opts.env, route, {
    maxTokens: opts.maxTokens,
    streaming: true,
  })
  return toTaiwanTraditionalStream(model.stream([new SystemMessage(opts.system), ...opts.messages]))
}

export interface PingResult {
  ok: boolean
  route: string
  /** 模型實際回了什麼。空字串代表連上了但沒吐東西。 */
  reply?: string
  error?: string
  ms: number
}

/**
 * 打一次最小的真實呼叫，確認這條 route 通不通。
 *
 * 設定頁的「測試連線」用。刻意不吃快取也不走 fallback —— 要測的就是
 * 眼前這一家通不通，退到別家會讓結果變得看不懂。
 *
 * `now` 可以注入，測試才不用碰真的時鐘。
 */
export async function pingRoute(
  env: LlmEnv,
  route: ModelRoute,
  now: () => number = Date.now
): Promise<PingResult> {
  const started = now()
  const label = routeLabel(route)

  if (!hasCredentials(env, route)) {
    const missing = missingCredentialHint(route.provider)
    return { ok: false, route: label, error: `尚未設定 ${missing}`, ms: 0 }
  }

  try {
    // 不重試：要的是「現在通不通」的即時答案，退避重試只會讓人多等
    const model = createModel(env, route, { maxTokens: 16, maxRetries: 0 })
    const response = await model.invoke([
      new SystemMessage('Reply with exactly: OK'),
      new HumanMessage('ping'),
    ])
    return {
      ok: true,
      route: label,
      reply: messageText(response.content).trim(),
      ms: now() - started,
    }
  } catch (err) {
    return {
      ok: false,
      route: label,
      error: err instanceof Error ? err.message : String(err),
      ms: now() - started,
    }
  }
}

function missingCredentialHint(provider: string): string {
  if (provider === 'cloudflare') return 'AI binding'
  const keys = providerInfo(provider)?.envKeys ?? []
  return keys.length ? keys.join(' 與 ') : 'API key'
}

export { messageText }
