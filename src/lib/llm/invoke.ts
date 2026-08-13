import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { z } from 'zod'
import {
  createModel,
  hasCredentials,
  type LlmEnv,
  type ModelRoute,
  resolveFallbackRoute,
  resolveRoute,
  routeLabel,
} from './model'

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
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        typeof part === 'string'
          ? part
          : part && typeof part === 'object' && 'text' in part
            ? String((part as { text: unknown }).text)
            : ''
      )
      .join('')
  }
  return ''
}

interface StructuredOptions<T> {
  env: LlmEnv
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
      message: `${route.provider} 的 API key 尚未設定`,
    }
  }

  const model = createModel(env, route, { maxTokens })

  // 先走 provider 原生的結構化輸出
  try {
    const structured = model.withStructuredOutput(schema)
    const data = await structured.invoke([new SystemMessage(system), new HumanMessage(user)])
    return { ok: true, data: data as T, route: routeLabel(route) }
  } catch {
    // 有些模型／端點不支援 function calling，退回手動解析
  }

  try {
    const response = await model.invoke([
      new SystemMessage(system),
      new HumanMessage(`${user}\n\n只回傳符合結構的 JSON，不要加任何說明文字。`),
    ])
    const parsed = schema.safeParse(extractJson(messageText(response.content)))
    if (!parsed.success) {
      return { ok: false, reason: 'invalid', message: '回應不符合預期結構' }
    }
    return { ok: true, data: parsed.data, route: routeLabel(route) }
  } catch (err) {
    return {
      ok: false,
      reason: 'error',
      message: err instanceof Error ? err.message : String(err),
    }
  }
}

/**
 * 要一份結構化輸出，主 route 失敗時退到 fallback route。
 */
export async function generateStructured<T>(opts: StructuredOptions<T>): Promise<LlmResult<T>> {
  const primary = await tryRoute(resolveRoute(opts.env), opts)
  if (primary.ok) return primary

  const fallback = resolveFallbackRoute(opts.env)
  if (!fallback) return primary

  const second = await tryRoute(fallback, opts)
  // fallback 也失敗的話回報主 route 的錯，那個比較能反映真正的問題
  return second.ok ? second : primary
}

export interface StreamOptions {
  env: LlmEnv
  system: string
  /** 已經是 LangChain 訊息陣列（對話歷史） */
  messages: (SystemMessage | HumanMessage)[]
  maxTokens?: number
}

/** 串流純文字。對話用。 */
export function streamText(opts: StreamOptions) {
  const route = resolveRoute(opts.env)
  const model = createModel(opts.env, route, {
    maxTokens: opts.maxTokens,
    streaming: true,
  })
  return model.stream([new SystemMessage(opts.system), ...opts.messages])
}

export { messageText }
