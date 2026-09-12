import { getQuestionReview } from '@/lib/question-review'

describe('question review registry', () => {
  test('exposes MIS essay rubrics without enabling automatic grading', () => {
    const review = getQuestionReview('q-pp-im-mis-106-1')

    expect(review?.status).toBe('self_review_only')
    expect(review?.autoGradeEligible).toBe(false)
    expect(review?.rubricItems.length).toBeGreaterThan(0)
  })

  test('exposes the technically reviewed statistics rubric', () => {
    const review = getQuestionReview('q-pp-im-stat-114-4')

    expect(review?.status).toBe('self_review_only')
    expect(review?.official).toBe(false)
    expect(review?.reviewCount).toBeGreaterThanOrEqual(2)
    expect(review?.rubricItems.reduce((sum, item) => sum + item.points, 0)).toBe(15)
  })

  test('retains existing IM-IT dispute guards', () => {
    const review = getQuestionReview('q-pp-im-it-106-12')

    expect(review?.status).toBe('disputed')
    expect(review?.autoGradeEligible).toBe(false)
    expect(review?.rubricItems).toEqual([])
  })
})
