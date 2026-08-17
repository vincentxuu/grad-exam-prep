import { getCloudflareContext } from '@opennextjs/cloudflare'
import { type NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
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

export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true })
  const { DB, JWT_SECRET } = env as unknown as CloudflareEnv

  const user = await authenticateRequest(request, JWT_SECRET)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await DB.prepare(
    'SELECT card_id, interval, repetitions, ease_factor, next_review, last_reviewed_at FROM user_srs_cards WHERE user_id = ?'
  )
    .bind(user.id)
    .all<SrsRow>()

  const states: Record<string, CardSRSState> = {}
  for (const row of rows.results) {
    states[row.card_id] = rowToState(row)
  }

  return NextResponse.json({ states })
}
