import answerReviewRaw from '../../public/data/im-mis-answer-review.json'
import cardsRaw from '../../public/data/im-mis-concept-cards.json'
import conceptRaw from '../../public/data/im-mis-concept-master.json'
import lessonsRaw from '../../public/data/im-mis-lessons.json'
import practiceRaw from '../../public/data/im-mis-practice-status.json'
import metadataRaw from '../../public/data/im-mis-question-metadata.json'
import sourcesRaw from '../../public/data/im-mis-source-registry.json'
import srsRaw from '../../public/data/im-mis-srs-candidates.json'

describe('IM-MIS subject-specific learning artifacts', () => {
  test('covers the verified essay corpus without enabling automatic grading', () => {
    expect(metadataRaw.totalQuestions).toBe(37)
    expect(metadataRaw.questions).toHaveLength(37)
    expect(metadataRaw.questions.reduce((sum, item) => sum + item.subquestions.length, 0)).toBe(76)
    expect(answerReviewRaw.questions).toHaveLength(37)
    expect(Object.keys(practiceRaw.questions)).toHaveLength(37)
    expect(
      answerReviewRaw.questions.every((item) => !item.official && !item.autoGradeEligible)
    ).toBe(true)
    expect(
      answerReviewRaw.questions.every(
        (item) =>
          item.answerSource.reviewCount === (item.questionId === 'q-pp-im-mis-107-4' ? 1 : 0) &&
          item.confidence.level ===
            (item.questionId === 'q-pp-im-mis-107-4' ? 'medium' : 'unreviewed') &&
          item.rubricReview.status === 'reviewed' &&
          item.rubricReview.reviewCount >= 1 &&
          item.rubricReview.reviewers.includes('independent-technical-review-2026-08-16') &&
          item.rubricItems.every((rubric) => rubric.sourceRefs.length > 0)
      )
    ).toBe(true)
    expect(
      Object.values(practiceRaw.questions).every(
        (item) => item.status === 'self_review_only' && !item.autoGradeEligible
      )
    ).toBe(true)
  })

  test('publishes a reviewed seven-topic lesson and concept-card corpus', () => {
    const subtopics = conceptRaw.topics.flatMap((topic) => topic.subtopics)
    const coverage = lessonsRaw.lessons.flatMap((lesson) => lesson.coveredSubtopicIds)
    const cardCounts = new Map<string, number>()
    for (const card of cardsRaw.cards)
      cardCounts.set(card.subtopicId, (cardCounts.get(card.subtopicId) ?? 0) + 1)

    expect(conceptRaw.topics).toHaveLength(7)
    expect(lessonsRaw.lessons).toHaveLength(lessonsRaw.counts.lessons)
    expect(new Set(coverage).size).toBe(subtopics.length)
    expect(subtopics.every((subtopic) => (cardCounts.get(subtopic.id) ?? 0) >= 2)).toBe(true)
    expect(
      sourcesRaw.sources.every(
        (source) =>
          source.status === 'reviewed' &&
          source.review.reviewedBy === 'independent-technical-review-2026-08-16'
      )
    ).toBe(true)
  })

  test('does not leak topic-wide sources or generated criteria across subtopics', () => {
    const noSql = answerReviewRaw.questions.find((item) => item.questionId === 'q-pp-im-mis-106-4')!
    const oss = answerReviewRaw.questions.find((item) => item.questionId === 'q-pp-im-mis-106-3')!
    const nonSql = answerReviewRaw.questions.find(
      (item) => item.questionId === 'q-pp-im-mis-106-2'
    )!

    expect(noSql.rubricReview.sourceRefs).toEqual(['src-im-mis-laudon-17e'])
    expect(oss.rubricReview.sourceRefs).toEqual(['src-im-mis-apache-license-2', 'src-im-mis-gpl-3'])
    expect(
      nonSql.rubricItems
        .flatMap((rubric) => rubric.criteria)
        .some((criterion) => criterion.startsWith('SQL 必須'))
    ).toBe(false)
  })

  test('keeps SRS output explicitly candidate-only', () => {
    expect(srsRaw.status).toBe('candidate')
    expect(srsRaw.totalCandidates).toBe(cardsRaw.totalCards)
    expect(srsRaw.candidates.every((candidate) => !candidate.publishToSrs)).toBe(true)
  })
})
