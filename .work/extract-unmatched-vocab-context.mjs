import fs from 'node:fs'

const master = JSON.parse(fs.readFileSync('public/data/ntu-im-vocab-master.json', 'utf8')).words
const lexicon = JSON.parse(fs.readFileSync('public/data/im-vocab-lexicon.json', 'utf8')).entries
const questions = JSON.parse(fs.readFileSync('public/data/questions.json', 'utf8')).questions
const masterByWord = new Map(master.map((entry) => [entry.word.toLowerCase(), entry]))
const missing = lexicon.filter((entry) => !entry.definition && !entry.translation && !masterByWord.get(entry.word.toLowerCase())?.chinese?.trim())

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
for (const item of missing) {
  const entry = masterByWord.get(item.word.toLowerCase())
  const re = new RegExp(`(?<![A-Za-z])${escapeRe(item.word).replace(/-/g, '[- ]')}(?![A-Za-z])`, 'i')
  const matches = questions.filter((q) => re.test(q.text)).slice(0, 2).map((q) => {
    const match = q.text.match(re)
    const at = match?.index ?? 0
    return { id: q.id, text: q.text.slice(Math.max(0, at - 100), at + item.word.length + 140).replace(/\s+/g, ' ') }
  })
  console.log(JSON.stringify({ word: item.word, tier: entry?.tier, source: entry?.source, pos: entry?.pos, contexts: entry?.englishExam?.contexts ?? (entry?.domain?.context ? [entry.domain.context] : []), matches }))
}
