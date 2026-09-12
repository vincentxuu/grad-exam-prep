import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataPath = (name) => path.join(root, 'public/data', name)
const read = (name) => JSON.parse(fs.readFileSync(dataPath(name), 'utf8'))
const write = (name, value) =>
  fs.writeFileSync(dataPath(name), `${JSON.stringify(value, null, 2)}\n`)

const q26Prompt =
  "...All you have to do is write a prompt and it'll add text it thinks would plausibly follow..."
const q26Hilarious = "...It's hilarious and frightening. I feel like I've seen the future..."
const q31Context =
  'In fact, one common trait of many US presidents __(33)__ the capacity to launch self-deprecating jokes—a move that often undercuts any similar jokes lobbed at them.'

const restoredWords = [
  {
    word: 'prompt',
    chinese: '提示詞；提示',
    pos: 'n/v',
    context: q26Prompt,
    cefr: 'B2',
  },
  {
    word: 'plausibly',
    chinese: '似乎合理地；可信地',
    pos: 'adv',
    context: q26Prompt,
    cefr: 'C1',
  },
  {
    word: 'press release',
    chinese: '新聞稿；新聞發布稿',
    pos: 'n',
    context:
      "I've gotten it to write songs, stories, press releases, guitar tabs, interviews, essays, technical manuals.",
    cefr: 'B2',
    category: 'business/media',
  },
  {
    word: 'frightening',
    chinese: '令人害怕的；嚇人的',
    pos: 'adj',
    context: q26Hilarious,
    cefr: 'B1',
  },
  {
    word: 'self-deprecating',
    chinese: '自嘲的；自我貶抑的',
    pos: 'adj',
    context: q31Context,
    cefr: 'C1',
  },
  {
    word: 'undercut',
    chinese: '削弱；降低……的效力',
    pos: 'v',
    context: q31Context,
    cefr: 'C1',
  },
  {
    word: 'lob',
    chinese: '拋擲；（言語）丟向、攻擊',
    pos: 'v',
    context: q31Context,
    cefr: 'C1',
  },
]

const masterEntry = ({ word, chinese, pos, context, cefr, category = 'academic' }) => ({
  word,
  chinese,
  pos,
  source: 'english-exam',
  englishExam: {
    tier: 'supplementary',
    frequency: 1,
    years: [111],
    yearSpread: 1,
    isChoiceWord: false,
    sources: ['stem'],
    contexts: [context],
  },
  domain: null,
  category,
  difficulty: 'advanced',
  relatedWords: [],
  tier: 'worth_studying',
  totalFrequency: 1,
  cefr,
})

const master = read('ntu-im-vocab-master.json')
for (const word of restoredWords) {
  const existing = master.words.find((entry) => entry.word === word.word)
  if (existing) {
    existing.chinese ||= word.chinese
    existing.pos ||= word.pos
    existing.source = existing.source === 'english-exam' ? 'english-exam' : 'both'
    existing.englishExam = masterEntry(word).englishExam
    existing.tier = 'worth_studying'
    existing.totalFrequency = (existing.domain?.count ?? 0) + 1
    existing.cefr ||= word.cefr
  } else {
    master.words.push(masterEntry(word))
  }
}
for (const word of [
  {
    word: 'hilarious',
    chinese: '非常好笑的；滑稽的',
    pos: 'adj',
    context: q26Hilarious,
    cefr: 'B2',
  },
  {
    word: 'launch',
    chinese: '發起；推出；發射',
    pos: 'v/n',
    context: q31Context,
    cefr: 'C1',
  },
]) {
  const existing = master.words.find((entry) => entry.word === word.word)
  if (!existing) throw new Error(`Expected existing master word: ${word.word}`)
  existing.chinese ||= word.chinese
  existing.pos ||= word.pos
  existing.source = existing.source === 'english-exam' ? 'english-exam' : 'both'
  existing.englishExam = masterEntry(word).englishExam
  existing.tier = 'worth_studying'
  existing.totalFrequency = (existing.domain?.count ?? 0) + 1
  existing.cefr ||= word.cefr
}
master.metadata.totalWords = master.words.length
for (const tier of Object.keys(master.metadata.tierCounts)) {
  master.metadata.tierCounts[tier] = master.words.filter((entry) => entry.tier === tier).length
}
master.metadata.sources.englishExam = master.words.filter(
  (entry) => entry.source === 'english-exam'
).length
master.metadata.sources.domain = master.words.filter((entry) => entry.source === 'domain').length
master.metadata.sources.both = master.words.filter((entry) => entry.source === 'both').length
master.metadata.sourceCounts['english-exam'] = master.metadata.sources.englishExam
master.metadata.sourceCounts.domain = master.metadata.sources.domain
master.metadata.sourceCounts.both = master.metadata.sources.both
write('ntu-im-vocab-master.json', master)

const lexicon = read('im-vocab-lexicon.json')
for (const { word } of restoredWords) {
  if (!lexicon.entries.some((entry) => entry.word === word)) {
    lexicon.entries.push({
      word,
      phonetic: '',
      definition: '',
      translation: '',
      pos: '',
      tags: [],
    })
  }
}
for (const word of ['hilarious']) {
  if (!lexicon.entries.some((entry) => entry.word === word)) {
    lexicon.entries.push({
      word,
      phonetic: '',
      definition: '',
      translation: '',
      pos: '',
      tags: [],
    })
  }
}
const requiredTiers = new Set(lexicon.metadata.requiredTiers)
lexicon.metadata.requiredWords = master.words.filter((entry) => requiredTiers.has(entry.tier)).length
lexicon.metadata.matchedWords = lexicon.entries.filter(
  (entry) => entry.translation || entry.definition
).length
write('im-vocab-lexicon.json', lexicon)

const curation = read('im-vocab-curation.json')
for (const word of ['press release', 'undercut', 'lob']) {
  const source = restoredWords.find((entry) => entry.word === word)
  curation.overrides[word] = {
    ...(curation.overrides[word] ?? {}),
    chinese: source.chinese,
    pos: source.pos,
    example: {
      en: source.context.replace(/^\.\.\.|\.\.\.$/g, ''),
      paperId: 'pp-im-en-111',
      year: 111,
      number: word === 'press release' ? 26 : 31,
    },
    reviewReason: '以 lemma 收錄補回文章中的屈折詞形或複數固定片語。',
    questionRefs: [`q-pp-im-en-111-${word === 'press release' ? 26 : 31}`],
  }
}
curation.metadata.enrichedWords = Object.keys(curation.overrides).length
write('im-vocab-curation.json', curation)

console.log(
  JSON.stringify(
    {
      restoredWords: restoredWords.map(({ word }) => word),
      masterWords: master.metadata.totalWords,
      requiredWords: lexicon.metadata.requiredWords,
    },
    null,
    2
  )
)
