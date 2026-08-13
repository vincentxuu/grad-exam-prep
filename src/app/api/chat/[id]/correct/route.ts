import { type NextRequest, NextResponse } from 'next/server'
import { correctMessage } from '@/lib/chat/converse'
import { getChatEnv, getUserId } from '@/lib/chat/env'
import { addCorrections, getSession } from '@/lib/chat/store'
import type { Db } from '@/lib/lexicon/store'
import { loadConfig } from '@/lib/llm/config'

interface Body {
  messageId?: string
  content?: string
}

/**
 * POST /api/chat/[id]/correct —— 對一則使用者訊息做糾錯。
 *
 * 只在糾錯模式開啟時呼叫。刻意與主對話分開：主對話要串流，而串流一段
 * schema 約束的 JSON 沒辦法逐字渲染。
 *
 * 不計入對話配額 —— 它是可選的、單則的、便宜的呼叫，讓它吃掉對話輪次
 * 會讓使用者為了省額度而關掉糾錯，那就本末倒置了。
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 })
  }

  const content = body.content?.trim()
  if (!content || !body.messageId) {
    return NextResponse.json({ error: '缺少 messageId 或 content' }, { status: 400 })
  }

  const env = await getChatEnv()
  const db = env.DB as unknown as Db

  const session = await getSession(db, id, getUserId(request))
  if (!session) return NextResponse.json({ error: '找不到這場對話' }, { status: 404 })

  const result = await correctMessage(env, content, await loadConfig(db))
  if (!result.ok) {
    // 糾錯失敗不該讓對話中斷，回空陣列讓前端安靜地略過
    return NextResponse.json({ corrections: [] })
  }

  if (result.corrections.length > 0) {
    await addCorrections(db, id, body.messageId, result.corrections)
  }

  return NextResponse.json({ corrections: result.corrections })
}
