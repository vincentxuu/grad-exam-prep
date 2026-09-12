import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { messageText, streamReply } from '@/lib/chat/converse'
import {
  ChatQuotaExceeded,
  chatQuotaLimit,
  getChatEnv,
  getUserId,
  isUnlimited,
  spendChatQuota,
} from '@/lib/chat/env'
import { addMessage, getMessages, getSession, isSessionFull } from '@/lib/chat/store'
import { detectUsedWords } from '@/lib/chat/target-words'
import type { Db } from '@/lib/lexicon/store'
import { loadConfig } from '@/lib/llm/config'
import type { PersonaProfile } from '@/types/lexicon'

interface Body {
  content?: string
  persona?: PersonaProfile
}

function sseError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * POST /api/chat/[id]/message —— 送一則使用者訊息，串流回 AI 的回覆。
 *
 * 回覆用 SSE 串流。訊息在串流開始前就先寫進 D1，串流結束後補寫 AI 那則
 * —— 即使 client 中途斷線，對話紀錄也不會少一半。
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  let body: Body
  try {
    body = await request.json()
  } catch {
    return sseError('請求格式錯誤', 400)
  }

  const content = body.content?.trim()
  if (!content) return sseError('訊息不可為空', 400)

  const env = await getChatEnv()
  const db = env.DB as unknown as Db
  const config = await loadConfig(db)
  const userId = getUserId(request)

  const session = await getSession(db, id, userId)
  if (!session) return sseError('找不到這場對話', 404)

  if (await isSessionFull(db, id)) {
    // 不當成錯誤 —— UI 據此顯示「結束並看總結」
    return NextResponse.json({ sessionFull: true }, { status: 200 })
  }

  try {
    await spendChatQuota(db, userId, chatQuotaLimit(env, config), await isUnlimited(request, env))
  } catch (err) {
    if (err instanceof ChatQuotaExceeded) {
      return sseError(`今天的對話額度用完了（${err.used}/${err.limit}）。明天會重置。`, 429)
    }
    return sseError('伺服器錯誤', 500)
  }

  const history = await getMessages(db, id)
  const usedWords = detectUsedWords(content, session.targetWords)
  const userMessageId = crypto.randomUUID()

  await addMessage(db, id, {
    id: userMessageId,
    role: 'user',
    content,
    usedWords,
    createdAt: Date.now(),
  })

  const upstream = streamReply({
    env,
    config,
    topic: session.topic,
    targetWords: session.targetWords,
    persona: body.persona,
    history,
    userMessage: content,
  })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      send('meta', { userMessageId, usedWords })

      try {
        // LangChain 的 stream 沒有 finalMessage，逐塊自己累積
        let reply = ''
        for await (const chunk of await upstream) {
          const text = messageText(chunk.content)
          if (!text) continue
          reply += text
          send('delta', { text })
        }

        if (!reply.trim()) {
          send('error', { message: '模型沒有回應內容' })
          controller.close()
          return
        }

        // client 斷線也要留下完整紀錄
        await addMessage(db, id, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
          createdAt: Date.now(),
        })

        send('done', { content: reply })
      } catch (err) {
        send('error', { message: err instanceof Error ? err.message : '串流失敗' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // 避免中間層做緩衝，不然串流會變成一次吐完
      'X-Accel-Buffering': 'no',
    },
  })
}
