import { spawnSync } from 'node:child_process'
import answersRaw from '../../public/data/answers.json'
import reviewRaw from '../../public/data/im-stat-answer-review.json'
import practiceRaw from '../../public/data/im-stat-practice-status.json'
import metadataRaw from '../../public/data/im-stat-question-metadata.json'
import questionsRaw from '../../public/data/questions.json'

describe('IM-STAT answer review and practice guard', () => {
  const answers = answersRaw.answers as Record<
    string,
    { questionId: string; answer: string; explanation: string }
  >

  test('covers exactly the five canonical 114–115 open-ended questions', () => {
    const canonical = questionsRaw.questions.filter((question) => question.subjectId === 'im-stat')
    const ids = metadataRaw.questions.map((question) => question.questionId)

    expect(canonical).toHaveLength(5)
    expect(canonical.every((question) => [114, 115].includes(question.year))).toBe(true)
    expect(ids).toEqual(canonical.map((question) => question.id))
    expect(new Set(ids).size).toBe(5)
  })

  test('provides UI-ready rubrics without exposing a fake answer key', () => {
    const metadata = new Map(
      metadataRaw.questions.map((question) => [question.questionId, question])
    )

    expect(reviewRaw.officialAnswerKeyAvailable).toBe(false)
    expect(reviewRaw.counts.autoGradeEligible).toBe(0)
    for (const review of reviewRaw.questions) {
      const question = questionsRaw.questions.find((item) => item.id === review.questionId)
      const item = metadata.get(review.questionId)

      expect(review.status).toBe('technical_reviewed')
      expect(review.official).toBe(false)
      expect(review.approvedAnswer).toBeNull()
      expect(review.autoGradeEligible).toBe(false)
      expect(review.reviewCount).toBeGreaterThanOrEqual(2)
      expect(answers[review.questionId].answer).toBe('N/A')
      expect(review.rubricItems).toEqual(item?.rubricItems)
      expect(review.rubricItems.reduce((sum, rubric) => sum + rubric.points, 0)).toBe(
        question?.points
      )
      for (const rubric of review.rubricItems) {
        expect(rubric.label).not.toBe('')
        expect(rubric.criteria.length).toBeGreaterThan(0)
      }
    }
  })

  test('keeps all five questions in self-review and outside auto-grade/full mock', () => {
    expect(practiceRaw.counts).toEqual({ selfReviewOnly: 5, autoGradeEligible: 0 })
    for (const status of Object.values(practiceRaw.questions)) {
      expect(status.status).toBe('self_review_only')
      expect(status.practiceEligible).toBe(true)
      expect(status.autoGradeEligible).toBe(false)
      expect(status.fullMockEligible).toBe(false)
      expect(status.note).toContain('rubric 自評')
    }
  })

  test('passes deterministic builder drift check and focused validator', () => {
    const build = spawnSync('node', ['scripts/build-im-stat-learning-artifacts.mjs'], {
      encoding: 'utf8',
    })
    const validate = spawnSync('node', ['scripts/validate-im-stat-learning-artifacts.mjs'], {
      encoding: 'utf8',
    })

    expect(build.status).toBe(0)
    expect(build.stderr).toBe('')
    expect(validate.status).toBe(0)
    expect(validate.stderr).toBe('')
  })
})
