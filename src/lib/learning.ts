export interface LearningWorkedExample {
  prompt: string
  steps: string[]
  answer: string
}

export interface LearningScenario {
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

export interface LearningLesson {
  id: string
  subtopicId: string
  coveredSubtopicIds: string[]
  title: string
  summary: string
  evidenceNote?: string
  estimatedMinutes: number
  minimumPastPaperRefs: number
  learningObjectives: string[]
  learningScenario?: LearningScenario
  sections: Array<{ title: string; body: string; bullets: string[] }>
  workedExamples: LearningWorkedExample[]
  commonPitfalls: string[]
  sourceRefs: string[]
  pastPaperRefs: string[]
  reviewStatus: 'reviewed'
}

export interface LearningConceptCard {
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

export interface LearningSource {
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

export interface LearningTopic {
  id: string
  title: string
  importance: number
  learningObjectives: Array<{ id: string; statement: string }>
  subtopics: Array<{ id: string; title: string; keywords: string[] }>
}

export interface LearningOverviewCopy {
  taxonomyBadge: string
  eligibilityPrefix: string
  eligibleSuffix: string
  disputedPrefix: string
  disputedSuffix: string
  browseLabel: string
  moduleTitle: string
  moduleDescription: string
  subtopicUnit: string
  lessonQuestionUnit: string
  lessonActionLabel: string
  objectivesLabel: string
  subtopicsLabel: string
  topicQuestionUnit: string
}

export interface LearningOverviewConfig {
  topics: LearningTopic[]
  totalQuestions: number
  eligibleCount: number
  disputedCount: number
  topicQuestionCounts: Record<string, number>
  browseHref: string
  copy: LearningOverviewCopy
}

export interface LearningLessonCopy {
  reviewBadge: string
  cardUnit: string
  pastPaperUnit: string
  contentNotice: string
  objectivesTitle: string
  scenarioEyebrow: string
  scenarioPrompt: string
  scenarioMappingTitle: string
  scenarioEverydayHeader: string
  scenarioTechnicalHeader: string
  scenarioBoundaryLabel: string
  scenarioCuesTitle: string
  workedExamplesTitle: string
  workedExampleLabel: string
  workedExampleAnswerLabel: string
  pitfallsTitle: string
  cardsTitle: string
  cardsDescription: string
  practiceTitle: string
  practiceDescription: string
  practiceActionLabel: string
  foundationPracticeTitle?: string
  foundationPracticeDescription?: string
  foundationPracticeActionLabel?: string
  sourcesTitle: string
}

export interface LearningCatalogInput {
  examId: string
  examLabel: string
  subjectId: string
  subjectLabel: string
  moduleLabel: string
  lessons: LearningLesson[]
  cards: LearningConceptCard[]
  sources: LearningSource[]
  overview?: LearningOverviewConfig
  lessonCopy: LearningLessonCopy
  getPracticeHref: (lesson: LearningLesson) => string
}

export interface LearningCatalog extends LearningCatalogInput {
  lessonBaseHref: string
  getLesson: (lessonId: string) => LearningLesson | undefined
  getCardsForLesson: (lessonId: string) => LearningConceptCard[]
  getSources: (sourceIds: string[]) => LearningSource[]
}

export function createLearningCatalog(input: LearningCatalogInput): LearningCatalog {
  const lessonBaseHref = `/${input.examId}/subjects/${input.subjectId}/lessons`

  return {
    ...input,
    lessonBaseHref,
    getLesson: (lessonId) => input.lessons.find((lesson) => lesson.id === lessonId),
    getCardsForLesson: (lessonId) => input.cards.filter((card) => card.lessonId === lessonId),
    getSources: (sourceIds) => {
      const ids = new Set(sourceIds)
      return input.sources.filter((source) => ids.has(source.id))
    },
  }
}
