import { type NextRequest, NextResponse } from 'next/server'
import { getChatEnv, getUserId } from '@/lib/chat/env'
import { getCorrections, getMessages, getSession } from '@/lib/chat/store'
import type { Db } from '@/lib/lexicon/store'

/** GET /api/chat/[id] —— 取整場歷史，重新整理或換裝置後可以接續。 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  try {
    const env = await getChatEnv()
    const db = env.DB as unknown as Db
    const userId = getUserId(request)

    const session = await getSession(db, id, userId)
    if (!session) return NextResponse.json({ error: '找不到這場對話' }, { status: 404 })

    const [messages, corrections] = await Promise.all([getMessages(db, id), getCorrections(db, id)])

    return NextResponse.json({ session, messages, corrections })
  } catch {
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
