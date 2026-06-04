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
        SELECT
          SUBSTR(question_id, 1, INSTR(question_id || '-', '-', 4) - 1) AS subject_prefix,
          result,
          COUNT(*) AS cnt
        FROM practice_records
        WHERE user_id = ?
        GROUP BY subject_prefix, result
      `)
      .bind(userId)
      .all<{ subject_prefix: string; result: string; cnt: number }>()

    return NextResponse.json({ stats: rows.results ?? [] })
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
