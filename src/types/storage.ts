import type { ExamId } from './content'
import type { PersonaProfile } from './lexicon'

export interface CardSRSState {
  cardId: string
  interval: number
  repetitions: number
  easeFactor: number
  nextReview: number
  lastReview: number | null
}

export interface CustomTask {
  id: string
  phaseId: string
  examId: ExamId
  description: string
  subjectTag?: string
  createdAt: number
}

export interface UserPreferences {
  examId: ExamId
  planStartDate?: string
  /** 各考試最後選用的備考計畫，讓完整計畫與今日學習保持一致。 */
  selectedPlanIds?: Partial<Record<ExamId, string>>
  /** 個人化例句的情境來源（興趣／工作）。未設定就不做個人化。 */
  persona?: PersonaProfile
}

/**
 * 這個字是從哪裡遇到的。
 *
 * 筆記列了七個來源（書籍、文章、論文、考試、app、課程、家教），複習時
 * 「你是在 110 英文第 12 題遇到這個字的」比一句生成例句更能勾起記憶，
 * 所以出處要從第一天就存下來 —— 事後補這個欄位很痛。
 */
export interface WordSource {
  kind: 'reading' | 'question' | 'book' | 'course' | 'chat' | 'manual'
  /** 書名、課程名稱、app 名稱 */
  label?: string
  /** 題庫來源，可連回原題 */
  questionId?: string
  /** 遇到這個字的那一句原文 —— 你真的讀過的句子，比生成例句更好用 */
  sentence?: string
}

export interface SavedWord {
  headword: string
  /** `lx-<slug>`，與既有靜態閃卡共用同一個 srsState map */
  cardId: string
  addedAt: number
  source: WordSource
  note?: string
}

export interface StorageState {
  completedTasks: Record<string, boolean>
  customTasks: CustomTask[]
  srsState: Record<string, CardSRSState>
  paperPractice: Record<string, { practicedAt: number; notes?: string }>
  savedWords: SavedWord[]
  preferences: UserPreferences
}

export interface IStorage {
  getState(): StorageState
  setCompletedTask(taskId: string, done: boolean): void
  addCustomTask(task: CustomTask): void
  updateCustomTask(
    taskId: string,
    updates: Partial<Pick<CustomTask, 'description' | 'subjectTag'>>
  ): void
  removeCustomTask(taskId: string): void
  updateSRSCard(cardId: string, state: CardSRSState): void
  getSRSCard(cardId: string): CardSRSState | null
  /** Remove schedules for cards that no longer exist after a content migration. */
  pruneSRSState(validCardIds: Iterable<string>): void
  setPaperPractice(paperId: string, data: { practicedAt: number; notes?: string } | null): void
  addSavedWord(word: SavedWord): void
  /** 一併刪掉這張卡的 SRS 排程狀態，不留孤兒 */
  removeSavedWord(headword: string): void
  getSavedWords(): SavedWord[]
  setPreferences(prefs: Partial<UserPreferences>): void
  exportJSON(): string
  importJSON(json: string): void
}
