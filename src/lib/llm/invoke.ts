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
  | { ok: false; reason: 'no-credentials' | 'invalid' | 'error' | 'timeout'; message: string }

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

/** 單一 route 最多修幾次 JSON。 */
const MANUAL_JSON_ATTEMPTS = 2

/**
 * 兩條 route 加起來最多打幾次模型。
 *
 * 以前沒有這個上限：每條 route 各 2 次，主 route 失敗再退到 fallback，最壞
 * 情況跑 4 次完整生成。每次都是數十秒，加起來直接撞上 Cloudflare edge 的
 * 100 秒 origin 逾時，使用者看到的是瀏覽器層的 "Load failed"，連錯誤訊息
 * 都拿不到。
 *
 * 3 而不是 2：主 route 最多吃 2 次，剩下的 1 次留給 fallback。fallback 存在
 * 的意義就是某一家整個掛掉的時候還有退路，不能被主 route 的重試餓死。
 */
const MAX_MODEL_CALLS = 3

/** 剩餘的模型呼叫次數。跨 route 共用，所以是可變物件而不是數字。 */
interface CallBudget {
  left: number
}

function timedOut<T>(): LlmResult<T> {
  return { ok: false, reason: 'timeout', message: '生成超時' }
}

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
  /**
   * 整次生成的截止訊號。逾時就地中止，連 in-flight 的模型呼叫一起取消。
   *
   * 這是「請求慢到連線被切掉」的正解：與其讓 edge 或瀏覽器去決定什麼時候
   * 放棄（那時已經回不了任何訊息），不如自己先放棄，還來得及回一個
   * 看得懂的 504。
   */
  signal?: AbortSignal
}

async function tryRoute<T>(
  route: ModelRoute,
  opts: StructuredOptions<T>,
  budget: CallBudget
): Promise<LlmResult<T>> {
  const { env, system, user, schema, maxTokens, signal } = opts
  const callOptions = signal ? { signal } : undefined

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

  if (signal?.aborted) return timedOut()

  const model = createModel(env, route, { maxTokens })
  let previousIssue: string | undefined

  // 先走 provider 原生的結構化輸出
  try {
    const structured = model.withStructuredOutput(schema)
    const data = toTaiwanTraditionalDeep(
      await structured.invoke([new SystemMessage(system), new HumanMessage(user)], callOptions)
    )
    const parsed = schema.safeParse(data)
    if (parsed.success) return { ok: true, data: parsed.data, route: routeLabel(route) }

    // 原生 structured output 偶爾仍會缺欄；帶著錯誤原因進手動 JSON 修復路徑。
    previousIssue = validationSummary(parsed.error)
  } catch {
    // 有些模型／端點不支援 function calling，退回手動解析
    if (signal?.aborted) return timedOut()
  }

  let attempts = 0
  while (attempts < MANUAL_JSON_ATTEMPTS && budget.left > 0) {
    if (signal?.aborted) return timedOut()
    attempts += 1
    budget.left -= 1

    let response
    try {
      response = await model.invoke(
        [
          new SystemMessage(system),
          new HumanMessage(manualJsonPrompt(user, schema, previousIssue)),
        ],
        callOptions
      )
    } catch (err) {
      if (signal?.aborted) return timedOut()
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
      if (attempts < MANUAL_JSON_ATTEMPTS && budget.left > 0) continue
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
  const budget: CallBudget = { left: MAX_MODEL_CALLS }

  const primary = await tryRoute(resolveRoute(opts.env, opts.config), opts, budget)
  if (primary.ok) return primary

  // 逾時或次數用完就別再開一輪 —— 退到 fallback 只是把使用者多晾一倍的時間
  if (primary.reason === 'timeout' || budget.left <= 0) return primary

  const fallback = resolveFallbackRoute(opts.env, opts.config)
  if (!fallback) return primary

  const second = await tryRoute(fallback, opts, budget)
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
