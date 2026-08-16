import answersRaw from '../../public/data/answers.json'
import questionsRaw from '../../public/data/questions.json'

const answers = answersRaw.answers as Record<
  string,
  { questionId: string; answer: string; explanation: string }
>
const questions = questionsRaw.questions.filter((question) => question.subjectId === 'im-it')

describe('IM information technology answer completeness', () => {
  test('keeps every IM-IT question backed by a substantive explanation', () => {
    const incomplete = questions.filter((question) => {
      const entry = answers[question.id]
      return !entry || entry.questionId !== question.id || entry.explanation.trim().length < 80
    })

    expect(questions).toHaveLength(260)
    expect(incomplete).toEqual([])
  })

  test('preserves the verified answers for the final three questions in the 113 paper', () => {
    expect(answers['q-pp-im-it-113-23'].answer).toBe('E')
    expect(answers['q-pp-im-it-113-24'].answer).toBe('D')
    expect(answers['q-pp-im-it-113-25'].answer).toBe('N/A')
    expect(answers['q-pp-im-it-113-25'].explanation).toContain('InsertNewEmployee')
    expect(answers['q-pp-im-it-113-25'].explanation).toContain('inorder')
  })
})
