import cardsRaw from '../../public/data/im-it-concept-cards.json'
import lessonsRaw from '../../public/data/im-it-lessons.json'
import sourcesRaw from '../../public/data/im-it-source-registry.json'

export interface ImItWorkedExample {
  prompt: string
  steps: string[]
  answer: string
}

export interface ImItLearningScenario {
  title: string
  hook: string
  predict: string
  mapping: Array<{
    everyday: string
    technical: string
  }>
  boundary: string
  examCues: string[]
}

export interface ImItLesson {
  id: string
  subtopicId: string
  coveredSubtopicIds: string[]
  title: string
  summary: string
  estimatedMinutes: number
  minimumPastPaperRefs: number
  learningObjectives: string[]
  learningScenario?: ImItLearningScenario
  sections: Array<{ title: string; body: string; bullets: string[] }>
  workedExamples: ImItWorkedExample[]
  commonPitfalls: string[]
  sourceRefs: string[]
  pastPaperRefs: string[]
  reviewStatus: 'reviewed'
}

export interface ImItConceptCard {
  id: string
  lessonId: string
  subtopicId: string
  front: string
  back: string
  explanation: string
  sourceRefs: string[]
  pastPaperRefs: string[]
  reviewStatus: 'reviewed'
}

export interface ImItSource {
  id: string
  title: string
  author: string
  publisher?: string
  type: 'book' | 'course' | 'documentation' | 'official-guidance'
  url: string
  scope: string[]
  usage: string
  status: 'reviewed'
}

const lessons = lessonsRaw.lessons as ImItLesson[]
const cards = cardsRaw.cards as ImItConceptCard[]
const sources = sourcesRaw.sources as ImItSource[]

export function getImItLessons() {
  return lessons
}

export function getImItLesson(lessonId: string) {
  return lessons.find((lesson) => lesson.id === lessonId)
}

export function getImItCardsForLesson(lessonId: string) {
  return cards.filter((card) => card.lessonId === lessonId)
}

export function getImItSources(sourceIds: string[]) {
  const ids = new Set(sourceIds)
  return sources.filter((source) => ids.has(source.id))
}
