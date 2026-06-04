import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'

interface PracticeBody {
  userId: string
  questionId: string
  mode: 'drill' | 'mock' | 'review'
  result: 'correct' | 'wrong' | 'skipped'
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PracticeBody
    const { userId, questionId, mode, result } = body
    if (!userId || !questionId || !mode || !result) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    const { env } = await getCloudflareContext({ async: true })
    const db = (env as unknown as { DB: D1Database }).DB
    const now = Date.now()

    await db
      .prepare(
        'INSERT INTO practice_records (user_id, question_id, mode, result, answered_at) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(userId, questionId, mode, result, now)
      .run()

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
