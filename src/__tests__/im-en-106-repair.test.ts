import answersRaw from '../../public/data/answers.json'
import questionsRaw from '../../public/data/questions.json'

const questions = questionsRaw.questions.filter((question) => question.paperId === 'pp-im-en-106')
const answers = answersRaw.answers as Record<
  string,
  { questionId: string; answer: string; explanation: string }
>

function question(number: number) {
  const found = questions.find((item) => item.number === number)
  if (!found) throw new Error('Missing pp-im-en-106 question ' + number)
  return found
}

function occurrences(text: string, fragment: string) {
  return text.split(fragment).length - 1
}

describe('pp-im-en-106 原卷修復', () => {
  it('補回三組克漏字文章，且不保留重複片段', () => {
    expect(question(21).text).toContain('As early as the American Revolution')
    expect(occurrences(question(21).text, 'three outs per __23__')).toBe(1)
    expect(occurrences(question(27).text, 'the rapid growth of cities')).toBe(1)
    expect(occurrences(question(27).text, 'were becoming ill-fitted')).toBe(1)

    const starWars = question(33).text
    expect(starWars).toContain('Vader and his stormtroopers killed all aboard')
    expect(starWars).toContain('Vader and Obi-Wan clashed one last time')
    expect(starWars).toContain('the Rebels mounted an attack')
    expect(starWars).toContain('Vader was unable to stop Luke')
    expect(occurrences(starWars, 'Vader led an attack on a __34__ Rebel vessel')).toBe(1)
  })

  it('清除兩組閱讀文章的 OCR 損壞', () => {
    const newYear = question(41).text
    expect(newYear).toContain('day I want to renew myself')
    expect(newYear).not.toContain(' n    t       l      s')
    expect(newYear).toContain('That is nauseating.')

    const nobel = question(46).text
    expect(nobel).toContain('one bedroom wall')
    expect(nobel).toContain('impressionable as the drinking water')
    expect(nobel).toContain('and “the allies.')
    expect(nobel).toContain("newscaster's\ntones")
    expect(nobel).not.toContain('lone bedroom wall')
    expect(nobel).not.toContain('\nland “the allies.')
    expect(nobel).not.toContain('łtones')
  })

  it('修正閱讀答案，並明示第 13 題的原卷勘誤', () => {
    expect(question(13).text).toContain('(A) even though')
    expect(answers[question(13).id]).toMatchObject({ answer: 'A' })
    expect(answers[question(13).id].explanation).toContain('原卷')

    expect(answers[question(41).id]).toMatchObject({ answer: 'B' })
    expect(answers[question(46).id]).toMatchObject({ answer: 'C' })
    expect(answers[question(47).id]).toMatchObject({ answer: 'A' })
    expect(answers[question(49).id]).toMatchObject({ answer: 'B' })
    expect(answers[question(50).id]).toMatchObject({ answer: 'D' })
  })
})
