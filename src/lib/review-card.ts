import { lexiconCardId } from '@/lib/lexicon/normalize'
import type { Flashcard } from '@/types/content'
import type { SavedWord } from '@/types/storage'

/**
 * 複習排程裡的一張卡，不管它從哪來。
 *
 * SRS 原本只認 `flashcards.json` 裡那 160 張靜態卡。查來的字要進同一個
 * 排程，就需要一個共同的形狀 —— SM-2 本身（`src/lib/srs.ts`）完全不用改，
 * 它只認 cardId 字串。
 */
export interface ReviewCard {
  id: string
  source: 'content' | 'lexicon'
  /** 卡片正面 */
  prompt: string
  /** 科目或分類標籤 */
  label: string
  /** 答案面要用哪個元件呈現 */
  render: 'flashcard' | 'lexicon'
  /** source === 'content' 時的原始卡，答案文字在裡面 */
  flashcard?: Flashcard
  /** source === 'lexicon' 時的 headword，答案要另外去 API 取詞條 */
  headword?: string
}

export function fromFlashcard(card: Flashcard, label?: string): ReviewCard {
  return {
    id: card.id,
    source: 'content',
    prompt: card.prompt,
    label: label ?? card.subjectId,
    render: 'flashcard',
    flashcard: card,
  }
}

export function fromSavedWord(word: SavedWord): ReviewCard {
  return {
    id: word.cardId,
    source: 'lexicon',
    prompt: word.headword,
    label: '我的單字',
    render: 'lexicon',
    headword: word.headword,
  }
}

/**
 * 取回原始的 `Flashcard`，非 content 來源的卡直接略過。
 *
 * 給還在用 `Flashcard` 渲染的既有畫面銜接用 —— 不用 `!` 斷言，
 * 型別上就保證拿到的都是真的有 flashcard 的卡。
 */
export function toFlashcards(cards: ReviewCard[]): Flashcard[] {
  return cards.flatMap((c) => (c.flashcard ? [c.flashcard] : []))
}

/** 從 headword 算出卡片 id，給「加入單字庫」用。 */
export { lexiconCardId }
