import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { NextRequest } from 'next/server'
import { validateBearerToken } from '@/lib/auth'
import { checkAndIncrementQuota, type Db, readQuota } from '@/lib/lexicon/store'
import type { LlmRuntimeConfig } from '@/lib/llm/config'
import type { LlmEnv } from '@/lib/llm/model'

export const DEFAULT_CHAT_QUOTA = 40

export interface ChatEnv extends LlmEnv {
  DB: D1Database
  PASSPHRASE_HASH?: string
  CHAT_DAILY_QUOTA?: string
}

export async function getChatEnv(): Promise<ChatEnv> {
  const { env } = await getCloudflareContext({ async: true })
  return env as unknown as ChatEnv
}

/** 優先序：D1 設定 → env → 程式預設。 */
export function chatQuotaLimit(env: ChatEnv, config?: LlmRuntimeConfig): number {
  if (config?.chatQuota) return config.chatQuota
  const n = Number(env.CHAT_DAILY_QUOTA)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_CHAT_QUOTA
}

/** 與 src/lib/user-id.ts 同一把 cookie key。 */
export function getUserId(request: NextRequest): string {
  return request.cookies.get('gep_uid')?.value ?? 'anonymous'
}

/**
 * 對話配額與查詞配額**分開計**。
 *
 * 同一張表，但 user_id 加前綴 —— 對話貴得多，混在一起算的話，查幾個字
 * 就會把對話額度吃光，反過來也一樣，而且看不出錢花在哪。
 */
function chatQuotaKey(userId: string): string {
  return `chat:${userId}`
}

export class ChatQuotaExceeded extends Error {
  constructor(
    readonly used: number,
    readonly limit: number
  ) {
    super('chat quota exceeded')
  }
}

export function isUnlimited(request: NextRequest, env: ChatEnv): boolean {
  return !!env.PASSPHRASE_HASH && validateBearerToken(request, env.PASSPHRASE_HASH)
}

export async function spendChatQuota(
  db: Db,
  userId: string,
  limit: number,
  unlimited: boolean
): Promise<void> {
  if (unlimited) return
  const state = await checkAndIncrementQuota(db, chatQuotaKey(userId), limit)
  if (!state.allowed) throw new ChatQuotaExceeded(state.used, state.limit)
}

export async function readChatQuota(db: Db, userId: string, limit: number) {
  return readQuota(db, chatQuotaKey(userId), limit)
}
