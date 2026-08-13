import type { PersonaProfile } from '@/types/lexicon'

/** 查詢字上限。超過這個長度的多半是整段貼錯，不是想查的詞。 */
export const MAX_TERM_LENGTH = 80

export interface NormalizedTerm {
  term: string
  kind: 'word' | 'phrase'
}

/**
 * 把使用者輸入的查詢字正規化成快取 key。
 *
 * 刻意**不做詞形還原** —— `intercepted` 正規化後仍是 `intercepted`。
 * 還原成 `intercept` 是生成時模型的工作（它回傳 headword），我們再用
 * alias 把兩者接起來。在這裡猜原形只會猜錯。
 *
 * 回傳 null 代表這不是一個可查的詞（空字串、沒有英文字母、過長）。
 */
export function normalizeTerm(raw: string): NormalizedTerm | null {
  const term = raw
    .toLowerCase()
    // 彎引號換成直引號，否則 don’t 和 don't 會是兩筆快取
    .replace(/[‘’]/g, "'")
    // 只留英數字、空白、撇號、連字號 —— 全形括號、句點、引號都在這裡掉掉
    .replace(/[^a-z0-9'\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    // 收頭尾的撇號與連字號（"(intercept)" → " intercept " → "intercept"）
    .replace(/^['-]+|['-]+$/g, '')
    .trim()

  if (!term || term.length > MAX_TERM_LENGTH) return null
  if (!/[a-z]/.test(term)) return null

  return { term, kind: term.includes(' ') ? 'phrase' : 'word' }
}

/** headword → 卡片 id 用的 slug。`take into account` → `take-into-account` */
export function slugify(headword: string): string {
  return headword
    .toLowerCase()
    .replace(/['‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * 查來的字在 SRS 裡的卡片 id。
 *
 * `srsState` 是 Record<cardId, state>，用 `lx-` 前綴就能和既有的
 * 靜態閃卡共存，不需要資料遷移。
 */
export function lexiconCardId(headword: string): string {
  return `lx-${slugify(headword)}`
}

/**
 * persona 的快取 key。
 *
 * 興趣**排序後**才雜湊 —— 同一組興趣不同輸入順序必須共用同一筆快取，
 * 否則使用者調整一下順序就會多花一次生成的錢。
 *
 * persona 為空時回傳 'none'，代表不做個人化（呼叫端據此完全跳過生成）。
 */
export async function personaHash(persona: PersonaProfile | null | undefined): Promise<string> {
  if (!persona) return 'none'

  const interests = persona.interests
    .map((i) => i.trim())
    .filter(Boolean)
    .sort()
  const work = persona.work?.trim() ?? ''
  const goal = persona.goal?.trim() ?? ''

  if (interests.length === 0 && !work && !goal) return 'none'

  const canonical = JSON.stringify({ interests, work, goal })
  const bytes = new TextEncoder().encode(canonical)
  const digest = await crypto.subtle.digest('SHA-256', bytes)

  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}
