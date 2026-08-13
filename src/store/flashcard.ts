import { create } from 'zustand'
import type { ReviewCard } from '@/lib/review-card'
import type { RecallRating } from '@/lib/srs'
import { initialCardState, isDue, reviewCard } from '@/lib/srs'
import { localStorageImpl } from '@/lib/storage'

/**
 * SRS store。吃 `ReviewCard` 而不是 `Flashcard`，靜態閃卡與查來的字才能
 * 共用同一個排程 —— SM-2 演算法本身沒有任何改動，它只認 cardId。
 */
interface FlashcardStore {
  reviewCard: (card: ReviewCard, rating: RecallRating) => void
  getCardState: (cardId: string) => ReturnType<typeof initialCardState>
  getDueCards: (cards: ReviewCard[]) => ReviewCard[]
  getDueCount: (cards: ReviewCard[]) => number
}

export const useFlashcardStore = create<FlashcardStore>(() => ({
  reviewCard: (card, rating) => {
    const existing = localStorageImpl.getSRSCard(card.id) ?? initialCardState(card.id)
    const updated = reviewCard(existing, rating)
    localStorageImpl.updateSRSCard(card.id, updated)
  },

  getCardState: (cardId) => {
    return localStorageImpl.getSRSCard(cardId) ?? initialCardState(cardId)
  },

  getDueCards: (cards) => {
    const now = Date.now()
    return cards
      .map((c) => ({ card: c, state: localStorageImpl.getSRSCard(c.id) ?? initialCardState(c.id) }))
      .filter(({ state }) => isDue(state, now))
      .sort((a, b) => a.state.nextReview - b.state.nextReview)
      .map(({ card }) => card)
  },

  getDueCount: (cards) => {
    const now = Date.now()
    return cards.filter((c) => {
      const state = localStorageImpl.getSRSCard(c.id) ?? initialCardState(c.id)
      return isDue(state, now)
    }).length
  },
}))
