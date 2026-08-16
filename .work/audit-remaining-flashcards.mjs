import fs from 'node:fs'

const load = (name) => JSON.parse(fs.readFileSync(`public/data/${name}`, 'utf8'))
const cards = load('flashcards.json').filter((card) => card.subjectId === 'im-english')
const master = load('ntu-im-vocab-master.json').words
const masterByWord = new Map(master.map((entry) => [entry.word.toLowerCase(), entry]))

const family = (card) => card.id.split('-').slice(0, 3).join('-')
const groupLabel = (card) => `${family(card)} | ${card.topicId}`
const count = (items, predicate) => items.filter(predicate).length
const firstParagraph = (prompt) => String(prompt).split(/\n\s*\n/u, 1)[0]
const example = (answer) => String(answer).match(/(?:【例句】|例句：)([^]*?)(?=\n【|\n\n|$)/u)?.[1]?.trim() ?? ''
const answerWord = (answer) => String(answer).match(/【答案】[^\S\n]*\([A-D]\)[^\S\n]*([^\n]+)/u)?.[1]?.trim() ?? ''
const answerPos = (answer) => String(answer).match(/【詞性】[^\S\n]*([^\n]*)/u)?.[1]?.trim() ?? ''
const hasMeaning = (answer) => /(?:【意思】|【中文】|^中文：)/mu.test(String(answer))
const hasPos = (answer) => /【詞性】[^\S\n]*[^\s\n]/u.test(String(answer))
const hasExample = (answer) => /(?:【例句】|例句：)[^\S\n]*[^\s\n]/u.test(String(answer))
const placeholderLike = (text) => /This is an example of|academic context\.|lorem ipsum/iu.test(String(text))
const ellipsisFragment = (text) => /\.\.\./u.test(String(text))
const blankRuns = (text) => String(text).match(/_{2,}/gu)?.length ?? 0

const parseOptions = (prompt) => {
  const paragraph = String(prompt).split(/\n\s*\n/u).at(-1) ?? ''
  return [...paragraph.matchAll(/\(([A-D])\)\s*([^]*?)(?=\s+\([A-D]\)|$)/gu)]
    .map((match) => ({ label: match[1], value: match[2].trim() }))
}

const normalizePos = (pos) => {
  if (pos == null) return []
  const value = String(pos).toLowerCase().replace(/[^a-z/]/gu, '')
  if (!value) return []
  return [...new Set(value.split('/').map((item) => {
    if (item.startsWith('adj')) return 'adj'
    if (item.startsWith('adv')) return 'adv'
    if (item.startsWith('n')) return 'n'
    if (item.startsWith('v')) return 'v'
    return item
  }).filter(Boolean))]
}

const wordPos = (word, card) => {
  const fromAnswer = normalizePos(answerPos(card.answer))
  if (fromAnswer.length > 0 && word.toLowerCase() === answerWord(card.answer).toLowerCase()) return fromAnswer
  return normalizePos(masterByWord.get(word.toLowerCase())?.pos)
}

const posAudit = (card) => {
  const options = parseOptions(card.prompt)
  const correct = answerWord(card.answer)
  const correctPos = wordPos(correct, card)
  const distractors = options.filter((option) => option.value.toLowerCase() !== correct.toLowerCase())
  const known = distractors.map((option) => ({ ...option, pos: wordPos(option.value, card) })).filter((option) => option.pos.length > 0)
  const mismatched = known.filter((option) => correctPos.length > 0 && !option.pos.some((pos) => correctPos.includes(pos)))
  return { options, correct, correctPos, known, mismatched }
}

const summarize = (items) => {
  const mc = items.filter((card) => parseOptions(card.prompt).length === 4 && answerWord(card.answer))
  const audited = mc.map((card) => ({ card, ...posAudit(card) })).filter((row) => row.correctPos.length > 0 && row.known.length > 0)
  return {
    cards: items.length,
    missingPastPaperRef: count(items, (card) => card.pastPaperRef == null),
    missingMeaning: count(items, (card) => !hasMeaning(card.answer)),
    missingPos: count(items, (card) => !hasPos(card.answer)),
    missingExample: count(items, (card) => !hasExample(card.answer)),
    placeholderLike: count(items, (card) => placeholderLike(card.answer)),
    promptEllipsisFragment: count(items, (card) => ellipsisFragment(firstParagraph(card.prompt))),
    exampleEllipsisFragment: count(items, (card) => ellipsisFragment(example(card.answer))),
    promptMultipleBlanks: count(items, (card) => blankRuns(firstParagraph(card.prompt)) > 1),
    exampleStillHasBlank: count(items, (card) => blankRuns(example(card.answer)) > 0),
    exampleContainsOptions: count(items, (card) => /\([A-D]\)/u.test(example(card.answer))),
    mcCards: mc.length,
    posAuditableCards: audited.length,
    anyKnownPosMismatch: count(audited, (row) => row.mismatched.length > 0),
    allKnownDistractorsMismatch: count(audited, (row) => row.known.length > 0 && row.mismatched.length === row.known.length),
    targetMissingFromOptions: count(mc, (card) => {
      const audit = posAudit(card)
      return !audit.options.some((option) => option.value.toLowerCase() === audit.correct.toLowerCase())
    }),
  }
}

const grouped = Map.groupBy(cards, groupLabel)
const samples = cards.filter((card) => {
  const summary = summarize([card])
  return summary.missingMeaning || summary.missingPos || summary.promptEllipsisFragment
    || summary.exampleStillHasBlank || summary.exampleContainsOptions
    || summary.anyKnownPosMismatch
}).slice(0, 30).map((card) => ({
  id: card.id,
  group: groupLabel(card),
  prompt: card.prompt,
  answer: card.answer,
  posAudit: posAudit(card),
}))

console.log(JSON.stringify({
  total: summarize(cards),
  groups: Object.fromEntries([...grouped].sort((a, b) => b[1].length - a[1].length).map(([key, values]) => [key, summarize(values)])),
  samples,
}, null, 2))
