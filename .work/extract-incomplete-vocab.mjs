import fs from 'node:fs'

const load = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const cards = load('public/data/flashcards.json').filter((card) => card.subjectId === 'im-english')
const master = load('public/data/ntu-im-vocab-master.json').words
const lexicon = load('public/data/im-vocab-lexicon.json').entries
const questions = load('public/data/questions.json').questions
const masterByWord = new Map(master.map((entry) => [entry.word.toLowerCase(), entry]))
const lexiconByWord = new Map(lexicon.map((entry) => [entry.word.toLowerCase(), entry]))

const incomplete = cards.filter((card) =>
  !card.answer.includes('【詞性】')
  && !card.answer.includes('【英文解釋】')
  && !card.answer.includes('【音標】')
  && !card.answer.includes('【例句】')
)

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const output = incomplete.map((card) => {
  const word = card.headword
  const entry = masterByWord.get(word.toLowerCase())
  const lex = lexiconByWord.get(word.toLowerCase())
  const pattern = new RegExp(`(?<![A-Za-z])${escapeRe(word).replaceAll('-', '[- ]')}(?![A-Za-z])`, 'iu')
  const questionMatches = questions.filter((question) => pattern.test(question.text)).slice(0, 4).map((question) => {
    const match = question.text.match(pattern)
    const index = match?.index ?? 0
    return {
      id: question.id,
      excerpt: question.text.slice(Math.max(0, index - 100), index + word.length + 180).replace(/\s+/gu, ' '),
    }
  })
  return {
    word,
    tier: entry?.tier,
    source: entry?.source,
    masterPos: entry?.pos ?? '',
    masterChinese: entry?.chinese ?? '',
    masterContexts: entry?.englishExam?.contexts ?? (entry?.domain?.context ? [entry.domain.context] : []),
    lexicon: lex,
    questionMatches,
  }
})

if (output.length !== 101) throw new Error(`Expected 101 incomplete cards, found ${output.length}`)
console.log(output.map((entry) => JSON.stringify(entry)).join('\n'))
