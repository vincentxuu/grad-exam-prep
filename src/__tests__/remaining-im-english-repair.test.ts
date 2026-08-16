import answersRaw from '../../public/data/answers.json'
import questionsRaw from '../../public/data/questions.json'

const answers = answersRaw.answers as Record<
  string,
  { questionId: string; answer: string; explanation: string }
>
const allQuestions = questionsRaw.questions

const expectedKeys: Record<string, string> = {
  'pp-im-en-109': 'AACCDBBDCABAABCBDCDDBDBAAACBCDCBDCADBABCBAADDBACDB',
  'pp-im-en-111': 'CABBADCADDABDCACABDCCADACDADBABBDCADACBCDCABDCDDCC',
  'pp-im-en-112': 'ABDADBCCDADCABDDABCDABDDCBBADCCBDCAADCDBDACACBAACD',
}

function paperQuestions(paperId: string) {
  return allQuestions
    .filter((question) => question.paperId === paperId)
    .sort((a, b) => a.number - b.number)
}

function fingerprint(text: string) {
  return text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
}

describe('資管英文 109／111／112 修復', () => {
  it.each(Object.entries(expectedKeys))('%s 有完整且鎖定的 50 題答案', (paperId, key) => {
    const questions = paperQuestions(paperId)
    expect(questions).toHaveLength(50)
    expect(questions.map((question) => answers[question.id].answer).join('')).toBe(key)

    for (const question of questions) {
      const answer = answers[question.id]
      expect(answer.explanation.length).toBeGreaterThan(20)
      if (paperId !== 'pp-im-en-109') {
        expect(answer.explanation).toContain('(' + answer.answer + ')')
      }
    }
  })

  it('補回 111 年兩段曾被截短的文章', () => {
    const questions = paperQuestions('pp-im-en-111')
    expect(questions.find((question) => question.number === 26)?.text).toContain(
      'All you have to do is write a prompt'
    )
    expect(questions.find((question) => question.number === 26)?.text).toContain(
      "I feel like I've seen the future"
    )
    expect(questions.find((question) => question.number === 31)?.text).toContain(
      'launch self-deprecating jokes'
    )
    expect(questions.find((question) => question.number === 31)?.text).toContain(
      'undercuts any similar jokes'
    )
  })

  it('109 與 112 不再包含跨卷重複題目', () => {
    const questions109 = new Set(
      paperQuestions('pp-im-en-109').map((question) => fingerprint(question.text))
    )
    const duplicates = paperQuestions('pp-im-en-112').filter((question) =>
      questions109.has(fingerprint(question.text))
    )
    expect(duplicates).toHaveLength(0)
  })
})
