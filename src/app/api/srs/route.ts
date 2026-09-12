import { NextResponse } from 'next/server'
import { isAuthed, withAuth } from '@/lib/api-auth'
import type { CardSRSState } from '@/types/storage'

interface SrsRow {
  card_id: string
  interval: number
  repetitions: number
  ease_factor: number
  next_review: number
  last_reviewed_at: number
}

function rowToState(row: SrsRow): CardSRSState {
  return {
    cardId: row.card_id,
    interval: row.interval,
    repetitions: row.repetitions,
    easeFactor: row.ease_factor,
    nextReview: row.next_review,
    lastReview: row.last_reviewed_at,
  }
}

export async function GET(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  const rows = await ctx.db
    .prepare(
      'SELECT card_id, interval, repetitions, ease_factor, next_review, last_reviewed_at FROM user_srs_cards WHERE user_id = ?'
    )
    .bind(ctx.user.id)
    .all<SrsRow>()

  const states: Record<string, CardSRSState> = {}
  for (const row of rows.results) {
    states[row.card_id] = rowToState(row)
  }

  return NextResponse.json({ states })
}
