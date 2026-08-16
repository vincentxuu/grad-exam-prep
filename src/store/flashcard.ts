import { create } from 'zustand'
import type { ReviewCard } from '@/lib/review-card'
import type { RecallRating } from '@/lib/srs'
import { initialCardState, isDue, reviewCard } from '@/lib/srs'
import { localStorageImpl } from '@/lib/storage'
import type { CardSRSState } from '@/types/storage'

export function dueCardsFromState(
  cards: ReviewCard[],
  states: Record<string, CardSRSState>,
  now: number = Date.now()
): ReviewCard[] {
  return cards
    .map((card, index) => ({
      card,
      index,
      state: states[card.id] ?? initialCardState(card.id, now),
    }))
    .filter(({ state }) => isDue(state, now))
    .sort((a, b) => a.state.nextReview - b.state.nextReview || a.index - b.index)
    .map(({ card }) => card)
}

export function dueCountFromState(
  cards: ReviewCard[],
  states: Record<string, CardSRSState>,
  now: number = Date.now()
): number {
  return cards.filter((card) => isDue(states[card.id] ?? initialCardState(card.id, now), now))
    .length
}

/**
 * SRS store。吃 `ReviewCard` 而不是 `Flashcard`，靜態閃卡與查來的字才能
 * 共用同一個排程 —— SM-2 演算法本身沒有任何改動，它只認 cardId。
 */
interface FlashcardStore {
  reviewCard: (card: ReviewCard, rating: RecallRating) => CardSRSState
  getCardState: (cardId: string) => ReturnType<typeof initialCardState>
  getDueCards: (cards: ReviewCard[]) => ReviewCard[]
  getDueCount: (cards: ReviewCard[]) => number
}

export const useFlashcardStore = create<FlashcardStore>(() => ({
  reviewCard: (card, rating) => {
    const existing = localStorageImpl.getSRSCard(card.id) ?? initialCardState(card.id)
    const updated = reviewCard(existing, rating)
    localStorageImpl.updateSRSCard(card.id, updated)
    return updated
  },

  getCardState: (cardId) => {
    return localStorageImpl.getSRSCard(cardId) ?? initialCardState(cardId)
  },

  getDueCards: (cards) => {
    const now = Date.now()
    const states = localStorageImpl.getState().srsState
    return dueCardsFromState(cards, states, now)
  },

  getDueCount: (cards) => {
    const now = Date.now()
    const states = localStorageImpl.getState().srsState
    return dueCountFromState(cards, states, now)
  },
}))
