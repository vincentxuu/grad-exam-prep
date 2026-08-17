import { NextResponse } from 'next/server'
import { isAuthed, withAuth } from '@/lib/api-auth'

interface PracticeRow {
  paper_id: string
  practiced_at: number
  notes: string | null
}

export async function GET(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  const rows = await ctx.db
    .prepare('SELECT paper_id, practiced_at, notes FROM user_paper_practice WHERE user_id = ?')
    .bind(ctx.user.id)
    .all<PracticeRow>()

  const paperPractice: Record<string, { practicedAt: number; notes?: string }> = {}
  for (const row of rows.results) {
    paperPractice[row.paper_id] = {
      practicedAt: row.practiced_at,
      ...(row.notes ? { notes: row.notes } : {}),
    }
  }

  return NextResponse.json({ paperPractice })
}

export async function POST(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  const body: {
    paperId?: string
    data?: { practicedAt: number; notes?: string } | null
  } = await request.json()

  if (!body.paperId) {
    return NextResponse.json({ error: 'paperId required' }, { status: 400 })
  }

  if (body.data === null) {
    await ctx.db
      .prepare('DELETE FROM user_paper_practice WHERE user_id = ? AND paper_id = ?')
      .bind(ctx.user.id, body.paperId)
      .run()
  } else if (body.data) {
    await ctx.db
      .prepare(
        `INSERT INTO user_paper_practice (user_id, paper_id, practiced_at, notes) VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id, paper_id) DO UPDATE SET practiced_at = excluded.practiced_at, notes = excluded.notes`
      )
      .bind(ctx.user.id, body.paperId, body.data.practicedAt, body.data.notes ?? null)
      .run()
  }

  return NextResponse.json({ ok: true })
}
