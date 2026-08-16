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

  test('publishes fifteen reviewed lessons and 92 curated cards', () => {
    expect(lessonsRaw.status).toBe('reviewed')
    expect(cardsRaw.status).toBe('reviewed')
    expect(lessonsRaw.counts).toEqual({ lessons: 15, coveredSubtopics: 19, coveredQuestions: 112 })
    expect(lessons).toHaveLength(15)
    expect(cardsRaw.totalCards).toBe(92)
    expect(cards).toHaveLength(92)
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(15)
    expect(new Set(cards.map((card) => card.id)).size).toBe(92)
  })

  test('keeps lesson structure, sources, and question references verifiable', () => {
    for (const lesson of lessons) {
      expect(lesson.reviewStatus).toBe('reviewed')
      expect(subtopicIds.has(lesson.subtopicId)).toBe(true)
      expect(lesson.coveredSubtopicIds).toContain(lesson.subtopicId)
      expect(lesson.coveredSubtopicIds.every((id) => subtopicIds.has(id))).toBe(true)
      expect(lesson.minimumPastPaperRefs).toBeGreaterThanOrEqual(4)
      expect(new Set(lesson.pastPaperRefs).size).toBeGreaterThanOrEqual(lesson.minimumPastPaperRefs)
      expect(lesson.learningObjectives.length).toBeGreaterThanOrEqual(3)
      expect(lesson.sections.length).toBeGreaterThanOrEqual(4)
      expect(lesson.workedExamples.length).toBeGreaterThanOrEqual(2)
      expect(lesson.commonPitfalls.length).toBeGreaterThanOrEqual(3)
      expect(lesson.sourceRefs.every((sourceId) => sourceIds.has(sourceId))).toBe(true)

      for (const questionId of lesson.pastPaperRefs) {
        const question = metadata.get(questionId)
        expect(question).toBeDefined()
        expect(lesson.coveredSubtopicIds).toContain(question?.primarySubtopicId)
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
      expect(lesson?.coveredSubtopicIds).toContain(card.subtopicId)
      expect(card.sourceRefs.every((sourceId) => lesson?.sourceRefs.includes(sourceId))).toBe(true)
      expect(
        card.pastPaperRefs.every((questionId) => lesson?.pastPaperRefs.includes(questionId))
      ).toBe(true)
    }
  })

  test('publishes the grouped data-structure and AI lesson boundaries explicitly', () => {
    expect(
      lessons.find((lesson) => lesson.id === 'lesson-im-it-ds-complexity-sorting-searching-01')
        ?.coveredSubtopicIds
    ).toEqual(['im-it-ds-complexity-analysis', 'im-it-ds-sorting-searching'])
    expect(
      lessons.find((lesson) => lesson.id === 'lesson-im-it-ai-foundations-ml-evaluation-01')
        ?.coveredSubtopicIds
    ).toEqual([
      'im-it-ai-foundations-search',
      'im-it-ai-ml-paradigms',
      'im-it-ai-training-evaluation',
    ])
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
