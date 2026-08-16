import imItPracticeRaw from '../../public/data/im-it-practice-status.json'
import imMisAnswerReviewRaw from '../../public/data/im-mis-answer-review.json'
import imMisPracticeRaw from '../../public/data/im-mis-practice-status.json'
import imStatAnswerReviewRaw from '../../public/data/im-stat-answer-review.json'
import imStatPracticeRaw from '../../public/data/im-stat-practice-status.json'

export type QuestionReviewStatus = 'confirmed' | 'corrected' | 'disputed' | 'self_review_only'

export interface QuestionRubricItem {
  id: string
  label: string
  criteria: string[]
  points: number
}

export interface QuestionReview {
  status: QuestionReviewStatus
  autoGradeEligible: boolean
  note: string
  official: boolean
  reviewCount: number
  rubricItems: QuestionRubricItem[]
  allowLegacyExplanation: boolean
  referenceExplanation?: string
}

interface RawPracticeStatus {
  status: QuestionReviewStatus
  autoGradeEligible: boolean
  note: string
}

const imItStatuses = imItPracticeRaw.questions as Record<string, RawPracticeStatus>
const imMisStatuses = imMisPracticeRaw.questions as Record<string, RawPracticeStatus>
const imStatStatuses = imStatPracticeRaw.questions as Record<string, RawPracticeStatus>

const imMisReviews = new Map(
  imMisAnswerReviewRaw.questions.map((review) => [review.questionId, review])
)
const imStatReviews = new Map(
  imStatAnswerReviewRaw.questions.map((review) => [review.questionId, review])
)

function normalizeMisRubric(
  questionId: string
): Pick<QuestionReview, 'official' | 'reviewCount' | 'rubricItems' | 'allowLegacyExplanation'> {
  const review = imMisReviews.get(questionId)
  if (!review) {
    return { official: false, reviewCount: 0, rubricItems: [], allowLegacyExplanation: false }
  }

  return {
    official: review.official,
    reviewCount: review.answerSource.reviewCount,
    allowLegacyExplanation: false,
    rubricItems: review.rubricItems.map((item) => ({
      id: item.rubricId,
      label: item.label,
      criteria: item.criteria,
      points: item.points,
    })),
  }
}

function normalizeStatRubric(
  questionId: string
): Pick<
  QuestionReview,
  'official' | 'reviewCount' | 'rubricItems' | 'allowLegacyExplanation' | 'referenceExplanation'
> {
  const review = imStatReviews.get(questionId)
  if (!review) {
    return { official: false, reviewCount: 0, rubricItems: [], allowLegacyExplanation: false }
  }

  return {
    official: review.official,
    reviewCount: review.reviewCount,
    rubricItems: review.rubricItems,
    allowLegacyExplanation: false,
    referenceExplanation: review.workedSolution,
  }
}

export function getQuestionReview(questionId: string): QuestionReview | undefined {
  const status = imItStatuses[questionId] ?? imMisStatuses[questionId] ?? imStatStatuses[questionId]
  if (!status) return undefined

  const details = questionId.startsWith('q-pp-im-mis-')
    ? normalizeMisRubric(questionId)
    : questionId.startsWith('q-pp-im-stat-')
      ? normalizeStatRubric(questionId)
      : { official: false, reviewCount: 0, rubricItems: [], allowLegacyExplanation: true }

  return { ...status, ...details }
}
