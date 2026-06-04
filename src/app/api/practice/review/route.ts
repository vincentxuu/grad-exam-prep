import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    const { env } = await getCloudflareContext({ async: true })
    const db = (env as unknown as { DB: D1Database }).DB

    const rows = await db
      .prepare(`
        SELECT question_id
        FROM practice_records pr1
        WHERE user_id = ?
          AND result = 'wrong'
          AND NOT EXISTS (
            SELECT 1 FROM practice_records pr2
            WHERE pr2.user_id = pr1.user_id
              AND pr2.question_id = pr1.question_id
              AND pr2.result = 'correct'
              AND pr2.answered_at > pr1.answered_at
          )
        GROUP BY question_id
      `)
      .bind(userId)
      .all<{ question_id: string }>()

    const questionIds = (rows.results ?? []).map((r) => r.question_id)
    return NextResponse.json({ questionIds })
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
