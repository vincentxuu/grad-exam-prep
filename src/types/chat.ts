export interface Correction {
  /** 使用者原句中有問題的片段 */
  original: string
  corrected: string
  kind: 'grammar' | 'word-choice' | 'collocation' | 'register' | 'naturalness'
  /** 中文說明為什麼 */
  zh: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** 這則訊息用到的 target words */
  usedWords?: string[]
  /** 只有 user 訊息會有 */
  corrections?: Correction[]
  createdAt: number
}

export interface ChatSession {
  id: string
  topic: string
  targetWords: string[]
  correctMode: boolean
  createdAt: number
  endedAt?: number
}

export interface SessionSummary {
  /** 成功用出來的 target words */
  used: string[]
  /** 沒用到的 */
  missed: string[]
  /** 整場累積的訂正 */
  corrections: Correction[]
  /** AI 帶出來、使用者還沒收藏的字 */
  newWords: string[]
}

/** 單場對話的訊息上限。到頂就請使用者收尾，也剛好是一場練習該有的長度。 */
export const MAX_SESSION_MESSAGES = 30

export const CORRECTION_KIND_LABEL: Record<Correction['kind'], string> = {
  grammar: '文法',
  'word-choice': '用字',
  collocation: '搭配',
  register: '語域',
  naturalness: '自然度',
}
