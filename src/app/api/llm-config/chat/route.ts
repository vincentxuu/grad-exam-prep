import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { type NextRequest, NextResponse } from 'next/server'
import type { Db } from '@/lib/lexicon/store'
import { requireAdmin } from '@/lib/llm/admin-auth'
import { asProvider, providerInfo } from '@/lib/llm/catalog'
import { loadConfig } from '@/lib/llm/config'
import { messageText } from '@/lib/llm/invoke'
import { createModel, resolveRoute, routeLabel } from '@/lib/llm/model'

/** 試用對話最多留幾則。夠判斷語感，又不會讓單次請求無限長。 */
const MAX_HISTORY = 12
const MAX_TOKENS = 800

interface Body {
  provider?: string
  model?: string
  messages?: { role?: unknown; content?: unknown }[]
}

/**
 * 設定頁的試用對話。
 *
 * 跟 `/api/chat/*` 是兩回事 —— 那邊是英文練習，會挑目標字、寫進 D1、算
 * 配額；這裡就是拿選好的 model 隨便聊兩句，看語感與中文能力，不留任何
 * 紀錄。所以不共用 store，也不計入對話配額（要通關密語，本來就只有站長）。
 *
 * 不串流：這裡是短問短答，多一層 SSE 只是把設定頁弄複雜。
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { env } = auth

  const body = (await request.json().catch(() => null)) as Body | null
  if (!body) return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 })

  const history = (body.messages ?? [])
    .filter(
      (m): m is { role: 'user' | 'assistant'; content: string } =>
        (m?.role === 'user' || m?.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    )
    .slice(-MAX_HISTORY)

  if (!history.length) return NextResponse.json({ error: '沒有訊息' }, { status: 400 })

  const provider = body.provider ? asProvider(body.provider) : undefined
  if (body.provider && !provider) {
    return NextResponse.json({ error: `不認得的 provider：${body.provider}` }, { status: 400 })
  }

  // 沒指定就用目前生效的設定；指定了 provider 卻沒給 model 就用那家的範例
  const saved = resolveRoute(env, await loadConfig(env.DB as unknown as Db))
  const route = {
    provider: provider ?? saved.provider,
    model:
      body.model?.trim() || (provider ? (providerInfo(provider)?.sampleModel ?? '') : saved.model),
    fallback: false,
  }
  if (!route.model) return NextResponse.json({ error: '沒有指定 model' }, { status: 400 })

  const started = Date.now()
  try {
    const model = createModel(env, route, { maxTokens: MAX_TOKENS, maxRetries: 0 })
    const response = await model.invoke([
      new SystemMessage(
        '你是這個網站的模型測試對象。使用者正在試你的語感，請自然地回應，' +
          '中英文都要能講。回答簡短一點，兩三句即可。'
      ),
      ...history.map((m) =>
        m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
      ),
    ])

    return NextResponse.json({
      ok: true,
      reply: messageText(response.content),
      route: routeLabel(route),
      ms: Date.now() - started,
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      route: routeLabel(route),
      error: err instanceof Error ? err.message : String(err),
      ms: Date.now() - started,
    })
  }
}
