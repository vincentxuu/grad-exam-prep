import { getQuestionsByExam, getReliableQuestions } from '@/lib/content'
import { getFullMockQuestions, getQuestionPracticePolicy } from '@/lib/question-practice-policy'
import type { Question } from '@/types/content'

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q-test',
    paperId: 'pp-test',
    examId: 'im',
    subjectId: 'im-english',
    year: 115,
    number: 1,
    text: 'Choose one.\n(A) alpha\n(B) beta\n(C) gamma\n(D) delta',
    points: 5,
    hasImage: false,
    subQuestions: [],
    ...overrides,
  }
}

describe('question practice policy', () => {
  test('allows a real multiple-choice question with a matching answer into auto grading', () => {
    const question = makeQuestion()
    const policy = getQuestionPracticePolicy(question, {
      questionId: question.id,
      answer: 'A',
      explanation: 'Alpha is correct.',
      generatedAt: 0,
    })

    expect(policy).toEqual({
      responseType: 'multiple_choice',
      gradingMode: 'auto',
      fullMockEligible: true,
    })
  })

  test('treats a question without choices as self review instead of inventing A-E', () => {
    const question = makeQuestion({ text: 'Explain why the estimator is unbiased.' })
    const policy = getQuestionPracticePolicy(question, {
      questionId: question.id,
      answer: 'A',
      explanation: 'A worked explanation.',
      generatedAt: 0,
    })

    expect(policy.responseType).toBe('open_ended')
    expect(policy.gradingMode).toBe('self_review')
    expect(policy.fullMockEligible).toBe(false)
  })

  test('N/A overrides option-like subquestion labels and is never auto graded', () => {
    const question = makeQuestion({
      text: '(A) Find the constant. (B) Derive the joint PMF. (C) Find the marginal PMF.',
    })
    const policy = getQuestionPracticePolicy(question, {
      questionId: question.id,
      answer: 'N/A',
      explanation: 'A worked solution for all three subquestions.',
      generatedAt: 0,
    })

    expect(policy.responseType).toBe('open_ended')
    expect(policy.gradingMode).toBe('self_review')
    expect(policy.fullMockEligible).toBe(false)
  })

  test.each([
    'q-pp-cs-algo-108-1',
    'q-pp-cs-arch-113-11',
    'q-pp-cs-math-108-1',
  ])('real CS open-response question %s is not mistaken for multiple choice', (questionId) => {
    const question = getQuestionsByExam('cs').find((candidate) => candidate.id === questionId)
    expect(question).toBeDefined()

    expect(getQuestionPracticePolicy(question!).responseType).toBe('open_ended')
    expect(getQuestionPracticePolicy(question!).gradingMode).toBe('self_review')
    expect(getQuestionPracticePolicy(question!).fullMockEligible).toBe(false)
  })

  test('uses read-only mode when an open question has no worked explanation', () => {
    const question = makeQuestion({ text: 'Draw the requested architecture.' })

    expect(getQuestionPracticePolicy(question, undefined)).toEqual({
      responseType: 'open_ended',
      gradingMode: 'read_only',
      fullMockEligible: false,
    })
  })

  test('removes all current statistics essay questions from the full mock pool', () => {
    const reliable = getReliableQuestions(getQuestionsByExam('im'))
    const statQuestions = reliable.filter((question) => question.subjectId === 'im-stat')

    expect(statQuestions).toHaveLength(5)
    expect(getFullMockQuestions(statQuestions)).toHaveLength(0)
  })
})
