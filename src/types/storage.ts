import type { ExamId } from './content'

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
}

export interface StorageState {
  completedTasks: Record<string, boolean>
  customTasks: CustomTask[]
  srsState: Record<string, CardSRSState>
  paperPractice: Record<string, { practicedAt: number; notes?: string }>
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
  setPaperPractice(paperId: string, data: { practicedAt: number; notes?: string } | null): void
  setPreferences(prefs: Partial<UserPreferences>): void
  exportJSON(): string
  importJSON(json: string): void
}
