import { imItLearningCatalog } from './im-it-learning'
import { imMisLearningCatalog } from './im-mis-learning'
import { imStatLearningCatalog } from './im-stat-learning'
import type { LearningCatalog } from './learning'

const learningCatalogs: LearningCatalog[] = [
  imItLearningCatalog,
  imMisLearningCatalog,
  imStatLearningCatalog,
]

export function getLearningCatalog(examId: string, subjectId: string) {
  return learningCatalogs.find(
    (catalog) => catalog.examId === examId && catalog.subjectId === subjectId
  )
}

export function getLearningCatalogs() {
  return learningCatalogs
}
