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

  test('publishes ten reviewed lessons and 62 curated cards', () => {
    expect(lessonsRaw.status).toBe('reviewed')
    expect(cardsRaw.status).toBe('reviewed')
    expect(lessonsRaw.counts).toEqual({ lessons: 10, coveredSubtopics: 10, coveredQuestions: 86 })
    expect(lessons).toHaveLength(10)
    expect(cardsRaw.totalCards).toBe(62)
    expect(cards).toHaveLength(62)
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(10)
    expect(new Set(lessons.map((lesson) => lesson.subtopicId)).size).toBe(10)
    expect(new Set(cards.map((card) => card.id)).size).toBe(62)
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

  test('keeps blockchain and mining questions out of the cryptography lesson', () => {
    const cryptography = lessons.find(
      (lesson) => lesson.subtopicId === 'im-it-security-cryptography'
    )

    expect(cryptography?.pastPaperRefs).toHaveLength(6)
    expect(cryptography?.pastPaperRefs).not.toContain('q-pp-im-it-107-18')
    expect(cryptography?.pastPaperRefs).not.toContain('q-pp-im-it-110-26')
  })
})
