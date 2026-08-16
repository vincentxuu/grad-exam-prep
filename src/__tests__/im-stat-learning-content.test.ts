import cardsRaw from '../../public/data/im-stat-concept-cards.json'
import conceptsRaw from '../../public/data/im-stat-concept-master.json'
import lessonsRaw from '../../public/data/im-stat-lessons.json'
import sourcesRaw from '../../public/data/im-stat-source-registry.json'
import srsRaw from '../../public/data/im-stat-srs-candidates.json'

describe('IM-STAT reviewed learning content', () => {
  test('publishes four PDF-backed micro-lessons plus explicit prerequisites', () => {
    expect(lessonsRaw.status).toBe('reviewed')
    expect(lessonsRaw.counts).toEqual({
      lessons: 6,
      pdfBackedMicroLessons: 4,
      prerequisiteLessons: 2,
      coveredQuestions: 5,
    })
    expect(lessonsRaw.lessons).toHaveLength(6)
    expect(
      lessonsRaw.lessons.filter((lesson) => lesson.kind === 'past_paper_micro_lesson')
    ).toHaveLength(4)
    expect(lessonsRaw.lessons.filter((lesson) => lesson.kind === 'prerequisite')).toHaveLength(2)
  })

  test('states that 106–113 are not applicable rather than missing papers', () => {
    expect(conceptsRaw.examScope.notApplicableYears).toEqual([
      106, 107, 108, 109, 110, 111, 112, 113,
    ])
    expect(conceptsRaw.examScope.notApplicableReason).toContain('未設獨立統計考科')
    expect(conceptsRaw.examScope.applicableYears).toEqual([114, 115])
  })

  test('keeps every lesson source, concept, scenario, and evidence reference closed', () => {
    const sourceIds = new Set(sourcesRaw.sources.map((source) => source.id))
    const conceptIds = new Set(
      conceptsRaw.topics.flatMap((topic) => topic.subtopics.map((subtopic) => subtopic.id))
    )
    const questionRefs = new Set<string>()

    for (const lesson of lessonsRaw.lessons) {
      expect(lesson.reviewStatus).toBe('reviewed')
      expect(lesson.coveredSubtopicIds.every((id) => conceptIds.has(id))).toBe(true)
      expect(lesson.sourceRefs.every((id) => sourceIds.has(id))).toBe(true)
      expect(lesson.learningScenario.mapping).toHaveLength(4)
      expect(lesson.learningScenario.examCues).toHaveLength(4)
      expect(lesson.learningScenario.boundary.length).toBeGreaterThan(20)

      if (lesson.kind === 'prerequisite') {
        expect(lesson.pastPaperRefs).toEqual([])
        expect(lesson.evidenceNote).toBeTruthy()
      } else {
        expect(lesson.pastPaperRefs.length).toBeGreaterThan(0)
        lesson.pastPaperRefs.forEach((id) => questionRefs.add(id))
      }
    }

    expect([...questionRefs].sort()).toEqual([
      'q-pp-im-stat-114-4',
      'q-pp-im-stat-114-5',
      'q-pp-im-stat-115-3',
      'q-pp-im-stat-115-4',
      'q-pp-im-stat-115-5',
    ])
  })

  test('creates two reviewed cards per concept and keeps SRS candidates unpublished', () => {
    const counts = new Map<string, number>()
    const cardIds = new Set(cardsRaw.cards.map((card) => card.id))

    expect(cardsRaw.totalCards).toBe(22)
    for (const card of cardsRaw.cards) {
      counts.set(card.subtopicId, (counts.get(card.subtopicId) ?? 0) + 1)
      expect(card.reviewStatus).toBe('reviewed')
    }
    expect([...counts.values()].every((count) => count >= 2)).toBe(true)

    expect(srsRaw.status).toBe('curated_candidates')
    expect(srsRaw.publishedToGlobalDeck).toBe(false)
    expect(srsRaw.totalCandidates).toBe(18)
    expect(srsRaw.candidates.every((candidate) => cardIds.has(candidate.conceptCardId))).toBe(true)
  })
})
