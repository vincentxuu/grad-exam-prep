import cardsRaw from '../../public/data/im-it-concept-cards.json'
import conceptMasterRaw from '../../public/data/im-it-concept-master.json'
import lessonsRaw from '../../public/data/im-it-lessons.json'
import metadataRaw from '../../public/data/im-it-question-metadata.json'
import sourcesRaw from '../../public/data/im-it-source-registry.json'

describe('IM-IT reviewed learning content', () => {
  const lessons = lessonsRaw.lessons
  const cards = cardsRaw.cards
  const sourceIds = new Set(sourcesRaw.sources.map((source) => source.id))
  const subtopicIds = new Set(
    conceptMasterRaw.topics.flatMap((topic) => topic.subtopics.map((subtopic) => subtopic.id))
  )
  const metadata = new Map(metadataRaw.questions.map((question) => [question.questionId, question]))

  test('publishes the first five lessons and 32 curated cards', () => {
    expect(lessonsRaw.status).toBe('reviewed')
    expect(cardsRaw.status).toBe('reviewed')
    expect(lessonsRaw.counts).toEqual({ lessons: 5, coveredSubtopics: 5, coveredQuestions: 51 })
    expect(lessons).toHaveLength(5)
    expect(cardsRaw.totalCards).toBe(32)
    expect(cards).toHaveLength(32)
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(5)
    expect(new Set(lessons.map((lesson) => lesson.subtopicId)).size).toBe(5)
    expect(new Set(cards.map((card) => card.id)).size).toBe(32)
  })

  test('keeps lesson structure, sources, and question references verifiable', () => {
    for (const lesson of lessons) {
      expect(lesson.reviewStatus).toBe('reviewed')
      expect(subtopicIds.has(lesson.subtopicId)).toBe(true)
      expect(lesson.learningObjectives.length).toBeGreaterThanOrEqual(3)
      expect(lesson.sections.length).toBeGreaterThanOrEqual(4)
      expect(lesson.workedExamples.length).toBeGreaterThanOrEqual(2)
      expect(lesson.commonPitfalls.length).toBeGreaterThanOrEqual(3)
      expect(lesson.sourceRefs.every((sourceId) => sourceIds.has(sourceId))).toBe(true)

      for (const questionId of lesson.pastPaperRefs) {
        const question = metadata.get(questionId)
        expect(question).toBeDefined()
        expect(question?.primarySubtopicId).toBe(lesson.subtopicId)
        expect(question?.publication.autoGradeEligible).toBe(true)
        expect(question?.answerConfidence.level).not.toBe('disputed')
      }
    }
  })

  test('keeps every card inside its reviewed lesson evidence boundary', () => {
    const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]))

    for (const card of cards) {
      const lesson = lessonsById.get(card.lessonId)
      expect(card.id).toMatch(/^card-im-it-/)
      expect(card.reviewStatus).toBe('reviewed')
      expect(lesson).toBeDefined()
      expect(card.subtopicId).toBe(lesson?.subtopicId)
      expect(card.sourceRefs.every((sourceId) => lesson?.sourceRefs.includes(sourceId))).toBe(true)
      expect(
        card.pastPaperRefs.every((questionId) => lesson?.pastPaperRefs.includes(questionId))
      ).toBe(true)
    }
  })
})
