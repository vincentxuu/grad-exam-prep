import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { z } from 'zod'
import type { LlmRuntimeConfig } from '@/lib/llm/config'
import { generateStructured, messageText, streamText } from '@/lib/llm/invoke'
import type { LlmEnv } from '@/lib/llm/model'
import type { ChatMessage, Correction } from '@/types/chat'
import type { PersonaProfile } from '@/types/lexicon'
import {
  CONVERSATION_SYSTEM_PROMPT,
  CORRECTION_SYSTEM_PROMPT,
  conversationContext,
} from './prompts'

const CHAT_MAX_TOKENS = 1500
const CORRECTION_MAX_TOKENS = 1500

const correctionsSchema = z.object({
  corrections: z
    .array(
      z.object({
        original: z.string().describe('使用者原句中有問題的片段'),
        corrected: z.string(),
        kind: z.enum(['grammar', 'word-choice', 'collocation', 'register', 'naturalness']),
        zh: z.string().describe('中文說明為什麼'),
      })
    )
    .describe('沒有問題就回傳空陣列'),
})

interface ConverseOptions {
  env: LlmEnv
  config?: LlmRuntimeConfig
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
 * 主題與目標字放在第一個 user turn，使用者看不到 —— system prompt 已經
 * 交代不可以把目標字講出來。
 *
 * 注意：這裡沒有 prompt caching。Groq 這類 provider 沒有 Anthropic 那種
 * `cache_control` 斷點，所以每一輪都會把整段歷史重新計費。單場 30 則的
 * 上限因此不只是體驗考量，也是成本上限。
 */
export function streamReply(opts: ConverseOptions) {
  const { env, config, topic, targetWords, persona, history, userMessage } = opts

  const context = conversationContext(topic, targetWords, persona)
  const opening = history.length === 0 && !userMessage

  const messages: (HumanMessage | AIMessage)[] = [
    new HumanMessage(
      opening ? `${context}\n\n請用英文自然地開啟這場對話。` : `${context}\n\n（以下是對話開始）`
    ),
  ]

  if (!opening) {
    if (history.length === 0) {
      messages.push(new AIMessage('Sure — what would you like to talk about?'))
    }
    for (const m of history) {
      messages.push(m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content))
    }
    if (userMessage) messages.push(new HumanMessage(userMessage))
  }

  return streamText({
    env,
    config,
    system: CONVERSATION_SYSTEM_PROMPT,
    messages: messages as HumanMessage[],
    maxTokens: CHAT_MAX_TOKENS,
  })
}

export type CorrectionResult =
  | { ok: true; corrections: Correction[] }
  | { ok: false; message: string }

/**
 * 糾錯：獨立的一次結構化呼叫，**只送使用者那一則訊息**。
 *
 * 不跟主對話合併，是因為主對話要串流才不會讓人對著轉圈等，而串流一段
 * 有結構約束的輸出沒辦法逐字渲染成自然對話。拆開之後對話不被打斷，
 * 訂正安靜地補在旁邊。
 */
export async function correctMessage(
  env: LlmEnv,
  userMessage: string,
  config?: LlmRuntimeConfig
): Promise<CorrectionResult> {
  const result = await generateStructured({
    env,
    config,
    system: CORRECTION_SYSTEM_PROMPT,
    user: userMessage,
    schema: correctionsSchema,
    maxTokens: CORRECTION_MAX_TOKENS,
  })

  if (!result.ok) return { ok: false, message: result.message }
  return { ok: true, corrections: result.data.corrections }
}

export { messageText }
