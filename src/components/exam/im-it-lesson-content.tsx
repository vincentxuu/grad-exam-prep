import { LearningLessonContent } from '@/components/exam/learning-lesson-content'
import type { ImItConceptCard, ImItLesson, ImItSource } from '@/lib/im-it-learning'
import { imItLearningCatalog } from '@/lib/im-it-learning'

interface Props {
  lesson: ImItLesson
  cards: ImItConceptCard[]
  sources: ImItSource[]
}

export function ImItLessonContent(props: Props) {
  return <LearningLessonContent catalog={imItLearningCatalog} {...props} />
}
