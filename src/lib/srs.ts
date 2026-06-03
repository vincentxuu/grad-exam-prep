import type { CardSRSState } from '@/types/storage'

export type RecallRating = 0 | 1 | 2

export const RECALL_LABELS: Record<RecallRating, string> = {
  0: '不會',
  1: '普通',
  2: '熟悉',
}

const MIN_EASE = 1.3
const DEFAULT_EASE = 2.5
const DAY_MS = 24 * 60 * 60 * 1000

export function initialCardState(cardId: string): CardSRSState {
  return {
    cardId,
    interval: 1,
    repetitions: 0,
    easeFactor: DEFAULT_EASE,
    nextReview: Date.now(),
    lastReview: null,
  }
}

export function reviewCard(
  state: CardSRSState,
  rating: RecallRating,
  now: number = Date.now()
): CardSRSState {
  let { interval, repetitions, easeFactor } = state

  if (rating === 0) {
    interval = 1
    repetitions = 0
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2)
  } else {
    const q = rating === 2 ? 2 : 1
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    easeFactor = Math.max(MIN_EASE, easeFactor + 0.1 - (2 - q) * (0.08 + (2 - q) * 0.02))
    repetitions++
  }

  return {
    cardId: state.cardId,
    interval,
    repetitions,
    easeFactor,
    nextReview: now + interval * DAY_MS,
    lastReview: now,
  }
}

export function isDue(state: CardSRSState, now: number = Date.now()): boolean {
  return state.nextReview <= now
}

export function daysUntilDue(state: CardSRSState, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((state.nextReview - now) / DAY_MS))
}
