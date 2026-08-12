import Anthropic from '@anthropic-ai/sdk'
import { LEXICON_MODEL } from '@/lib/lexicon/generate'
import type { ChatMessage, Correction } from '@/types/chat'
import type { PersonaProfile } from '@/types/lexicon'
import {
  CONVERSATION_SYSTEM_PROMPT,
  CORRECTION_SYSTEM_PROMPT,
  conversationContext,
} from './prompts'

const MAX_TOKENS = 4000

export const CORRECTIONS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['corrections'],
  properties: {
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['original', 'corrected', 'kind', 'zh'],
        properties: {
          original: { type: 'string' },
          corrected: { type: 'string' },
          kind: {
            type: 'string',
            enum: ['grammar', 'word-choice', 'collocation', 'register', 'naturalness'],
          },
          zh: { type: 'string' },
        },
      },
    },
  },
} as const

interface ConverseOptions {
  apiKey: string
  topic: string
  targetWords: string[]
  persona?: PersonaProfile
  history: ChatMessage[]
  /** 這一輪使用者說的話。開場時留空。 */
  userMessage?: string
}

/**
 * 主對話：串流純文字回來。
 *
 * 兩個快取斷點：
 *   1. system —— 固定不變的對話規則
 *   2. 最新一輪的最後一個 content block —— 讓每次請求都能讀到整段歷史的快取
 *
 * 第二個是成本關鍵。少了它，每一輪都要把整段歷史重新計費，長對話的
 * 成本大約是三倍，而且畫面上完全看不出異常。
 */
export function streamReply(opts: ConverseOptions) {
  const { apiKey, topic, targetWords, persona, history, userMessage } = opts
  const client = new Anthropic({ apiKey })

  const messages: Anthropic.MessageParam[] = []

  // 主題與目標字放第一個 user turn，使用者看不到
  const context = conversationContext(topic, targetWords, persona)
  const opening = history.length === 0 && !userMessage

  messages.push({
    role: 'user',
    content: opening
      ? `${context}\n\n請用英文自然地開啟這場對話。`
      : `${context}\n\n（以下是對話開始）`,
  })

  if (!opening) {
    if (history.length === 0) {
      messages.push({ role: 'assistant', content: 'Sure — what would you like to talk about?' })
    }
    for (const m of history) {
      messages.push({ role: m.role, content: m.content })
    }
    if (userMessage) {
      messages.push({ role: 'user', content: userMessage })
    }
  }

  // 多輪快取斷點下在最新一輪
  const last = messages[messages.length - 1]
  if (typeof last.content === 'string') {
    last.content = [{ type: 'text', text: last.content, cache_control: { type: 'ephemeral' } }]
  }

  return client.messages.stream({
    model: LEXICON_MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: CONVERSATION_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
  })
}

export type CorrectionResult =
  | { ok: true; corrections: Correction[] }
  | { ok: false; message: string }

/**
 * 糾錯：獨立的一次結構化呼叫，**只送使用者那一則訊息**。
 *
 * 不跟主對話合併，是因為主對話要串流才不會讓人對著轉圈等，而串流一段
 * schema 約束的 JSON 沒辦法逐字渲染成自然對話。拆開之後對話不被打斷，
 * 訂正安靜地補在旁邊 —— 晚個幾百毫秒反而是對的。
 */
export async function correctMessage(
  apiKey: string,
  userMessage: string
): Promise<CorrectionResult> {
  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: LEXICON_MODEL,
      max_tokens: 2000,
      system: [
        {
          type: 'text',
          text: CORRECTION_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
      output_config: {
        format: {
          type: 'json_schema',
          schema: CORRECTIONS_SCHEMA as unknown as Record<string, unknown>,
        },
      },
    })

    if (response.stop_reason === 'refusal') {
      return { ok: false, message: '模型拒絕檢查這則訊息' }
    }

    const text = response.content.find((b) => b.type === 'text')?.text
    if (!text) return { ok: false, message: '回應沒有文字內容' }

    const parsed = JSON.parse(text) as { corrections: Correction[] }
    return { ok: true, corrections: parsed.corrections ?? [] }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) }
  }
}
