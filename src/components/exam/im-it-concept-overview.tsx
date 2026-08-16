import { LearningConceptOverview } from '@/components/exam/learning-concept-overview'
import { imItLearningCatalog } from '@/lib/im-it-learning'

export function ImItConceptOverview() {
  return <LearningConceptOverview catalog={imItLearningCatalog} />
}
