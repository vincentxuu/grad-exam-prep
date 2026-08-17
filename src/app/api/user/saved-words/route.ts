import { NextResponse } from 'next/server'
import { isAuthed, withAuth } from '@/lib/api-auth'
import type { SavedWord } from '@/types/storage'

interface WordRow {
  headword: string
  card_id: string
  added_at: number
  source: string
  note: string | null
}

function rowToWord(row: WordRow): SavedWord {
  return {
    headword: row.headword,
    cardId: row.card_id,
    addedAt: row.added_at,
    source: JSON.parse(row.source),
    ...(row.note ? { note: row.note } : {}),
  }
}

export async function GET(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  const rows = await ctx.db
    .prepare(
      'SELECT headword, card_id, added_at, source, note FROM user_saved_words WHERE user_id = ? ORDER BY added_at DESC'
    )
    .bind(ctx.user.id)
    .all<WordRow>()

  return NextResponse.json({ words: rows.results.map(rowToWord) })
}

export async function POST(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  const body: { word?: SavedWord } = await request.json()
  if (!body.word?.headword) {
    return NextResponse.json({ error: 'word required' }, { status: 400 })
  }

  const w = body.word
  await ctx.db
    .prepare(
      `INSERT INTO user_saved_words (user_id, headword, card_id, added_at, source, note)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, headword) DO UPDATE SET
         card_id = excluded.card_id,
         source = excluded.source,
         note = excluded.note`
    )
    .bind(ctx.user.id, w.headword, w.cardId, w.addedAt, JSON.stringify(w.source), w.note ?? null)
    .run()

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  const { headword }: { headword?: string } = await request.json()
  if (!headword) {
    return NextResponse.json({ error: 'headword required' }, { status: 400 })
  }

  await ctx.db.batch([
    ctx.db
      .prepare('DELETE FROM user_saved_words WHERE user_id = ? AND headword = ?')
      .bind(ctx.user.id, headword),
    ctx.db
      .prepare('DELETE FROM user_srs_cards WHERE user_id = ? AND card_id = ?')
      .bind(ctx.user.id, `lx-${headword}`),
  ])

  return NextResponse.json({ ok: true })
}
