import { getAnswer } from '@/lib/answers'
import { parseQuestion } from '@/lib/question-parser'
import { getQuestionReview } from '@/lib/question-review'
import type { Question } from '@/types/content'
import type { Answer } from '@/types/practice'

export type QuestionResponseType = 'multiple_choice' | 'open_ended'
export type QuestionGradingMode = 'auto' | 'self_review' | 'read_only'

export interface QuestionPracticePolicy {
  responseType: QuestionResponseType
  gradingMode: QuestionGradingMode
  fullMockEligible: boolean
}

const CHOICE_LABELS = ['a', 'b', 'c', 'd', 'e']
const OPEN_RESPONSE_EXPLANATION_RE =
  /(?:本題|此題)(?:為|是|屬於)[^。；\n]{0,24}(?:申論題|問答題|開放式[^。；\n]{0,12}題|程式(?:設計|撰寫)題|證明題|繪圖題)/

/**
 * Derive safe practice behaviour from the data we actually have today.
 *
 * Option-like `(A)`, `(B)` labels also occur in essay subquestions, so parsed
 * options alone are not enough. Automatic grading requires a matching choice
 * answer as well; `N/A`, missing answers, and answer labels outside the parsed
 * choices are treated as open responses.
 */
export function getQuestionPracticePolicy(
  question: Question,
  suppliedAnswer: Answer | undefined = getAnswer(question.id)
): QuestionPracticePolicy {
  const parsed = parseQuestion(question.text)
  const normalizedAnswer = suppliedAnswer?.answer.trim().toLowerCase()
  const hasExplicitChoiceSet = Boolean(
    question.subQuestions.length === 0 &&
      parsed.options &&
      parsed.options.length >= 3 &&
      parsed.options.every((option, index) => option.label === CHOICE_LABELS[index])
  )
  const hasOpenResponseSignal =
    question.subQuestions.length > 0 ||
    OPEN_RESPONSE_EXPLANATION_RE.test(suppliedAnswer?.explanation ?? '')
  const hasMatchingChoice = Boolean(
    hasExplicitChoiceSet &&
      !hasOpenResponseSignal &&
      normalizedAnswer &&
      normalizedAnswer !== 'n/a' &&
      parsed.options?.some((option) => option.label === normalizedAnswer)
  )
  const responseType: QuestionResponseType = hasMatchingChoice ? 'multiple_choice' : 'open_ended'

  const reviewStatus = getQuestionReview(question.id)

  let gradingMode: QuestionGradingMode
  if (reviewStatus?.status === 'disputed') {
    gradingMode = 'read_only'
  } else if (responseType === 'open_ended' || reviewStatus?.status === 'self_review_only') {
    gradingMode = suppliedAnswer?.explanation.trim() ? 'self_review' : 'read_only'
  } else if (reviewStatus && !reviewStatus.autoGradeEligible) {
    gradingMode = 'read_only'
  } else {
    gradingMode = 'auto'
  }

  return {
    responseType,
    gradingMode,
    fullMockEligible: gradingMode === 'auto',
  }
}

/** Full mocks produce a numeric score, so every included question must be auto-gradable. */
export function getFullMockQuestions(questionList: Question[]): Question[] {
  return questionList.filter((question) => getQuestionPracticePolicy(question).fullMockEligible)
}
