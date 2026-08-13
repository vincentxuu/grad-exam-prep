import type { WordMark } from '@/components/lexicon/tappable-text'
import { localStorageImpl } from '@/lib/storage'

/**
 * 建一張「這個字要不要標記」的查表。
 *
 *   saved —— 已在單字庫
 *   weak  —— 已在單字庫，而且上次評「不會」（SM-2 把 repetitions 歸零）
 *
 * 讓使用者一眼看到自己的弱點分布在文章的哪些地方。
 */
export function buildWordMarks(): (word: string) => WordMark {
  const marks = new Map<string, WordMark>()

  for (const w of localStorageImpl.getSavedWords()) {
    const state = localStorageImpl.getSRSCard(w.cardId)
    // lastReview 為 null 代表還沒複習過，不算「不熟」，只算已收藏
    const weak = !!state && state.repetitions === 0 && state.lastReview !== null
    marks.set(w.headword.toLowerCase(), weak ? 'weak' : 'saved')
  }

  return (word: string) => marks.get(word.toLowerCase()) ?? null
}
