import { type NextRequest, NextResponse } from 'next/server'
import { messageText, streamReply } from '@/lib/chat/converse'
import {
  ChatQuotaExceeded,
  chatQuotaLimit,
  getChatEnv,
  getUserId,
  isUnlimited,
  spendChatQuota,
} from '@/lib/chat/env'
import { suggestTopic } from '@/lib/chat/prompts'
import { addMessage, createSession } from '@/lib/chat/store'
import type { Db } from '@/lib/lexicon/store'
import { loadConfig } from '@/lib/llm/config'
import type { ChatSession } from '@/types/chat'
import type { PersonaProfile } from '@/types/lexicon'

interface Body {
  topic?: string
  correctMode?: boolean
  /** 由 client 挑好的目標字（localStorage 在 client 才讀得到） */
  targetWords?: string[]
  persona?: PersonaProfile
}

/** POST /api/chat/session —— 開一場對話，回傳 session 與 AI 的開場白。 */
export async function POST(request: NextRequest) {
  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 })
  }

  const targetWords = (body.targetWords ?? []).filter(Boolean).slice(0, 10)
  if (targetWords.length === 0) {
    return NextResponse.json(
      { error: '單字庫還是空的。先去查幾個字加進單字庫，對話才有東西可以練。' },
      { status: 400 }
    )
  }

  const env = await getChatEnv()
  const db = env.DB as unknown as Db
  const config = await loadConfig(db)
  const userId = getUserId(request)
  const unlimited = await isUnlimited(request, env)

  const session: ChatSession = {
    id: crypto.randomUUID(),
    topic: body.topic?.trim() || suggestTopic(body.persona),
    targetWords,
    correctMode: !!body.correctMode,
    createdAt: Date.now(),
  }

  try {
    await spendChatQuota(db, userId, chatQuotaLimit(env, config), unlimited)

    const stream = await streamReply({
      env,
      config,
      topic: session.topic,
      targetWords: session.targetWords,
      persona: body.persona,
      history: [],
    })

    let opening = ''
    for await (const chunk of stream) {
      opening += messageText(chunk.content)
    }

    if (!opening.trim()) {
      return NextResponse.json({ error: '無法開始這場對話，換個主題試試。' }, { status: 422 })
    }

    await createSession(db, { ...session, userId })
    await addMessage(db, session.id, {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: opening,
      createdAt: Date.now(),
    })

    return NextResponse.json({ session, opening })
  } catch (err) {
    if (err instanceof ChatQuotaExceeded) {
      return NextResponse.json(
        { error: `今天的對話額度用完了（${err.used}/${err.limit}）。明天會重置。` },
        { status: 429 }
      )
    }
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
