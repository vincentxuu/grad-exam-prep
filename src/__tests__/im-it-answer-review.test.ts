import answersRaw from '../../public/data/answers.json'
import answerReviewRaw from '../../public/data/im-it-answer-review.json'
import practiceStatusRaw from '../../public/data/im-it-practice-status.json'

const answers = answersRaw.answers as Record<
  string,
  { questionId: string; answer: string; explanation: string }
>

describe('IM-IT answer review', () => {
  test('covers all 246 choice questions exactly once', () => {
    const ids = answerReviewRaw.questions.map((question) => question.questionId)

    expect(answerReviewRaw.totalQuestions).toBe(246)
    expect(ids).toHaveLength(246)
    expect(new Set(ids).size).toBe(246)
  })

  test('applies every consensus correction to the answer artifact', () => {
    const corrected = answerReviewRaw.questions.filter(
      (question) => question.status === 'corrected'
    )

    expect(corrected).toHaveLength(answerReviewRaw.counts.corrected)
    expect(
      corrected.filter(
        (question) =>
          answers[question.questionId]?.answer !== question.reviewedAnswer ||
          !answers[question.questionId]?.explanation.includes('答案經技術覆核後修正') ||
          answers[question.questionId]?.explanation.trim().length < 80
      )
    ).toEqual([])
  })

  test('never exposes disputed or self-review questions to automatic grading', () => {
    const statuses = Object.values(practiceStatusRaw.questions)

    expect(statuses.filter((status) => status.autoGradeEligible)).toHaveLength(
      practiceStatusRaw.counts.autoGradeEligible
    )
    expect(
      statuses.filter(
        (status) =>
          (status.status === 'disputed' || status.status === 'self_review_only') &&
          status.autoGradeEligible
      )
    ).toEqual([])
  })

  test('does not claim an official answer key', () => {
    expect(answerReviewRaw.officialAnswerKeyAvailable).toBe(false)
    expect(answerReviewRaw.questions.filter((question) => question.official)).toEqual([])
  })

  test('keeps LAN explanations attached to the correct questions and units', () => {
    expect(answers['q-pp-im-it-109-8'].explanation).toContain('1–10 Gbps')
    expect(answers['q-pp-im-it-109-8'].explanation).not.toContain('GPS')
    expect(answers['q-pp-im-it-111-7'].explanation).toContain('48 bits（6 bytes）')
    expect(answers['q-pp-im-it-111-7'].explanation).toContain('locally administered')
  })
})
