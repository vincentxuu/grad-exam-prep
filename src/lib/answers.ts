import type { Answer, AnswersData } from '@/types/practice'
import answersRaw from '../../public/data/answers.json'

const data = answersRaw as unknown as AnswersData

export function getAnswer(questionId: string): Answer | undefined {
  return data.answers[questionId]
}

export function hasAnswer(questionId: string): boolean {
  return questionId in data.answers
}
