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

  test('publishes full reviewed coverage with 35 lessons and 191 curated cards', () => {
    expect(lessonsRaw.status).toBe('reviewed')
    expect(cardsRaw.status).toBe('reviewed')
    expect(lessonsRaw.counts).toEqual({ lessons: 35, coveredSubtopics: 61, coveredQuestions: 209 })
    expect(lessons).toHaveLength(35)
    expect(cardsRaw.totalCards).toBe(191)
    expect(cards).toHaveLength(191)
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(35)
    expect(new Set(cards.map((card) => card.id)).size).toBe(191)
  })

  test('keeps lesson structure, sources, and question references verifiable', () => {
    for (const lesson of lessons) {
      expect(lesson.reviewStatus).toBe('reviewed')
      expect(subtopicIds.has(lesson.subtopicId)).toBe(true)
      expect(lesson.coveredSubtopicIds).toContain(lesson.subtopicId)
      expect(lesson.coveredSubtopicIds.every((id) => subtopicIds.has(id))).toBe(true)
      expect(Number.isInteger(lesson.minimumPastPaperRefs)).toBe(true)
      expect(lesson.minimumPastPaperRefs).toBeGreaterThanOrEqual(0)
      expect(new Set(lesson.pastPaperRefs).size).toBeGreaterThanOrEqual(lesson.minimumPastPaperRefs)
      if (lesson.pastPaperRefs.length === 0) expect(lesson.evidenceNote).toBeTruthy()
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

  test('covers every canonical subtopic exactly once with at least two cards', () => {
    const coverage = new Map<string, number>()
    const cardCounts = new Map<string, number>()

    for (const lesson of lessons) {
      for (const subtopicId of lesson.coveredSubtopicIds) {
        coverage.set(subtopicId, (coverage.get(subtopicId) ?? 0) + 1)
      }
    }
    for (const card of cards) {
      cardCounts.set(card.subtopicId, (cardCounts.get(card.subtopicId) ?? 0) + 1)
    }

    expect(coverage.size).toBe(61)
    expect([...coverage.values()].every((count) => count === 1)).toBe(true)
    expect([...subtopicIds].every((id) => (cardCounts.get(id) ?? 0) >= 2)).toBe(true)
  })

  test('gives every lesson a bounded everyday scenario and exam cues', () => {
    const scenarioTitles = new Set<string>()

    for (const lesson of lessons) {
      expect(lesson.learningScenario).toBeDefined()
      const scenario = lesson.learningScenario
      if (!scenario) continue

      expect(scenario.title.length).toBeGreaterThanOrEqual(4)
      expect(scenario.hook.length).toBeGreaterThanOrEqual(12)
      expect(scenario.predict.length).toBeGreaterThanOrEqual(12)
      expect(scenario.mapping.length).toBeGreaterThanOrEqual(4)
      expect(scenario.mapping.length).toBeLessThanOrEqual(5)
      expect(scenario.boundary.length).toBeGreaterThanOrEqual(12)
      expect(scenario.examCues).toHaveLength(4)
      expect(scenarioTitles.has(scenario.title)).toBe(false)
      scenarioTitles.add(scenario.title)

      for (const mapping of scenario.mapping) {
        expect(mapping.everyday.trim()).not.toBe('')
        expect(mapping.technical.trim()).not.toBe('')
        expect(mapping.everyday).not.toBe(mapping.technical)
      }
    }

    expect(scenarioTitles.size).toBe(lessons.length)
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
      expect(
        card.pastPaperRefs.every(
          (questionId) => metadata.get(questionId)?.primarySubtopicId === card.subtopicId
        )
      ).toBe(true)
    }
  })

  test('keeps known malformed or mismatched questions outside learning evidence', () => {
    const blocked = new Set([
      'q-pp-im-it-112-3',
      'q-pp-im-it-112-4',
      'q-pp-im-it-112-19',
      'q-pp-im-it-112-26',
    ])

    expect(lessons.flatMap((lesson) => lesson.pastPaperRefs).every((id) => !blocked.has(id))).toBe(
      true
    )
    expect(cards.flatMap((card) => card.pastPaperRefs).every((id) => !blocked.has(id))).toBe(true)
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

  test('publishes batch-four grouped boundaries without broken or disputed refs', () => {
    const dataLesson = lessons.find((lesson) => lesson.id === 'lesson-im-it-data-big-data-nosql-01')

    expect(dataLesson?.coveredSubtopicIds).toEqual([
      'im-it-trends-big-data-analytics',
      'im-it-db-distributed-nosql',
    ])
    expect(dataLesson?.pastPaperRefs).toEqual([
      'q-pp-im-it-108-10',
      'q-pp-im-it-108-11',
      'q-pp-im-it-114-15',
      'q-pp-im-it-115-21',
      'q-pp-im-it-115-26',
    ])
    expect(dataLesson?.pastPaperRefs).not.toContain('q-pp-im-it-112-20')
    expect(dataLesson?.pastPaperRefs).not.toContain('q-pp-im-it-112-24')
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
