import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
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
  const { env } = await getCloudflareContext({ async: true })
  const { DB, JWT_SECRET } = env as unknown as CloudflareEnv

  const user = await authenticateRequest(request, JWT_SECRET)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  const existing = await DB.prepare(
    'SELECT card_id, interval, repetitions, ease_factor, next_review, last_reviewed_at FROM user_srs_cards WHERE user_id = ? AND card_id = ?'
  )
    .bind(user.id, cardId)
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

  await DB.prepare(
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
      user.id,
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
