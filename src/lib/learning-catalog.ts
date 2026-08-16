import { imItLearningCatalog } from './im-it-learning'
import type { LearningCatalog } from './learning'

const learningCatalogs: LearningCatalog[] = [imItLearningCatalog]

export function getLearningCatalog(examId: string, subjectId: string) {
  return learningCatalogs.find(
    (catalog) => catalog.examId === examId && catalog.subjectId === subjectId
  )
}

export function getLearningCatalogs() {
  return learningCatalogs
}
