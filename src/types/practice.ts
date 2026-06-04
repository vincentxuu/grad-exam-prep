export type PracticeMode = 'drill' | 'mock' | 'review'
export type PracticeResult = 'correct' | 'wrong' | 'skipped'

export interface Answer {
  questionId: string
  answer: string
  explanation: string
  generatedAt: number
}

export interface AnswersData {
  answers: Record<string, Answer>
}

export interface PracticeRecord {
  id: number
  userId: string
  questionId: string
  mode: PracticeMode
  result: PracticeResult
  answeredAt: number
}
