import type { ReviewCard } from '@/lib/review-card'
import { initialCardState, isDue } from '@/lib/srs'
import type { CardSRSState } from '@/types/storage'

export const DEFAULT_TARGET_COUNT = 6

interface Candidate {
  headword: string
  state: CardSRSState
}

/**
 * 挑出這場對話要練的字。
 *
 * 優先序：到期的 → 上次評「不會」的（SM-2 把 repetitions 歸零）→ 最近加的。
 * SRS 已經知道你哪些字弱，對話就把那些字逼出來 —— 這是痛點 2 的答案：
 * 不是更好的閃卡，是強迫使用。
 */
export function pickTargetWords(
  cards: ReviewCard[],
  getState: (cardId: string) => CardSRSState,
  count: number = DEFAULT_TARGET_COUNT,
  now: number = Date.now()
): string[] {
  const candidates: Candidate[] = cards
    .filter((c) => c.source === 'lexicon' && c.headword)
    .map((c) => ({
      headword: c.headword as string,
      state: getState(c.id) ?? initialCardState(c.id),
    }))

  const due = candidates.filter((c) => isDue(c.state, now))
  const weak = candidates.filter(
    (c) => !isDue(c.state, now) && c.state.repetitions === 0 && c.state.lastReview !== null
  )
  const rest = candidates.filter((c) => !due.includes(c) && !weak.includes(c))

  const ordered = [
    ...due.sort((a, b) => a.state.nextReview - b.state.nextReview),
    ...weak,
    ...rest.sort((a, b) => b.state.nextReview - a.state.nextReview),
  ]

  return ordered.slice(0, count).map((c) => c.headword)
}

/**
 * 產生一個字的常見屈折形，用來偵測使用者有沒有真的用出來。
 *
 * 只處理規則變化。抓不到 take → took 這類不規則變化 —— 為此引進詞形還原
 * 函式庫不划算，糾錯模式開著時模型會補上，關著時漏抓一個字的代價只是
 * 少記一筆。
 */
export function inflections(word: string): string[] {
  const w = word.toLowerCase()
  if (w.includes(' ')) return [w] // 片語不變形

  const forms = new Set([w])
  const last = w.slice(-1)
  const stem = w.slice(0, -1)

  forms.add(`${w}s`)
  forms.add(`${w}es`)
  forms.add(`${w}ed`)
  forms.add(`${w}ing`)

  // consult → consulted / consulting 已涵蓋；再補 e 結尾與 y 結尾
  if (last === 'e') {
    forms.add(`${stem}ed`)
    forms.add(`${stem}ing`)
  }
  if (last === 'y') {
    forms.add(`${stem}ies`)
    forms.add(`${stem}ied`)
  }
  // 短母音 + 單子音結尾的重複子音：plan → planned / planning
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(w)) {
    forms.add(`${w}${last}ed`)
    forms.add(`${w}${last}ing`)
  }

  return [...forms]
}

/**
 * 偵測這則訊息用到了哪些 target words。
 *
 * 用字邊界比對，`act` 不會匹配到 `contract`。
 */
export function detectUsedWords(message: string, targets: string[]): string[] {
  const text = message.toLowerCase()
  const used: string[] = []

  for (const target of targets) {
    const forms = inflections(target)
    const hit = forms.some((form) => {
      const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return new RegExp(`\\b${escaped}\\b`, 'i').test(text)
    })
    if (hit) used.push(target)
  }

  return used
}
