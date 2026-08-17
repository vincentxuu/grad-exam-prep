import { NextResponse } from 'next/server'
import { isAuthed, withAuth } from '@/lib/api-auth'
import type { RecallRating } from '@/lib/srs'
import { initialCardState, reviewCard } from '@/lib/srs'
import type { CardSRSState } from '@/types/storage'

interface SrsRow {
  card_id: string
  interval: number
  repetitions: number
  ease_factor: number
  next_review: number
  last_reviewed_at: number
}

export async function POST(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  let body: { cardId?: string; rating?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '格式錯誤' }, { status: 400 })
  }

  const { cardId, rating } = body
  if (!cardId || rating === undefined || ![0, 1, 2].includes(rating)) {
    return NextResponse.json({ error: 'cardId and rating (0/1/2) required' }, { status: 400 })
  }

  const now = Date.now()

  const existing = await ctx.db
    .prepare(
      'SELECT card_id, interval, repetitions, ease_factor, next_review, last_reviewed_at FROM user_srs_cards WHERE user_id = ? AND card_id = ?'
    )
    .bind(ctx.user.id, cardId)
    .first<SrsRow>()

  const currentState: CardSRSState = existing
    ? {
        cardId: existing.card_id,
        interval: existing.interval,
        repetitions: existing.repetitions,
        easeFactor: existing.ease_factor,
        nextReview: existing.next_review,
        lastReview: existing.last_reviewed_at,
      }
    : initialCardState(cardId, now)

  const updated = reviewCard(currentState, rating as RecallRating, now)

  await ctx.db
    .prepare(
      `INSERT INTO user_srs_cards (user_id, card_id, interval, repetitions, ease_factor, next_review, last_reviewed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, card_id) DO UPDATE SET
         interval = excluded.interval,
         repetitions = excluded.repetitions,
         ease_factor = excluded.ease_factor,
         next_review = excluded.next_review,
         last_reviewed_at = excluded.last_reviewed_at`
    )
    .bind(
      ctx.user.id,
      cardId,
      updated.interval,
      updated.repetitions,
      updated.easeFactor,
      updated.nextReview,
      updated.lastReview ?? now
    )
    .run()

  return NextResponse.json({ card: updated })
}
