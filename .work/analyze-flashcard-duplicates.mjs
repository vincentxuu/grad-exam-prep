import fs from 'node:fs'

const root = new URL('../', import.meta.url)
const load = (name) => JSON.parse(fs.readFileSync(new URL(`public/data/${name}`, root), 'utf8'))
const all = load('flashcards.json')
const expanded = load('vocab-flashcards-expanded.json')
const base = load('vocab-flashcards.json')
const cards = all.filter((card) => card.subjectId === 'im-english')

const group = (items, keyFn) => {
  const result = new Map()
  for (const item of items) {
    const key = keyFn(item)
    const values = result.get(key) ?? []
    values.push(item)
    result.set(key, values)
  }
  return [...result.entries()].sort((a, b) => b[1].length - a[1].length)
}
const duplicateStats = (groups) => ({
  unique: groups.length,
  duplicateGroups: groups.filter(([, values]) => values.length > 1).length,
  rowsInDuplicateGroups: groups
    .filter(([, values]) => values.length > 1)
    .reduce((sum, [, values]) => sum + values.length, 0),
  excessRows: groups.reduce((sum, [, values]) => sum + values.length - 1, 0),
})
const stem = (prompt) =>
  prompt
    .split(/\n\s*\n|\s+\(A\)\s+/)[0]
    .trim()
    .replace(/\s+/g, ' ')
const exactRow = (card) => JSON.stringify([card.prompt, card.answer])
const subsetSignatures = (items) => new Set(items.map(exactRow))

const topics = group(cards, (card) => card.topicId).map(([key, values]) => [key, values.length])
const prefixes = group(cards, (card) => card.id.replace(/(?:-[^-]+){1,2}$/, ''))
  .slice(0, 20)
  .map(([key, values]) => [key, values.length])
const exactPromptGroups = group(cards, (card) => card.prompt)
const exactRowGroups = group(cards, exactRow)
const stemGroups = group(cards, (card) => stem(card.prompt))
const expandedSet = subsetSignatures(expanded)
const baseSet = subsetSignatures(base)

const phrase = 'The professor emphasized the importance of _____ in the research methodology.'
const phraseCards = cards.filter((card) => stem(card.prompt) === phrase)

const output = {
  totals: {
    all: all.length,
    imEnglish: cards.length,
    expanded: expanded.length,
    base: base.length,
  },
  ids: duplicateStats(group(cards, (card) => card.id)),
  exactPrompts: duplicateStats(exactPromptGroups),
  exactPromptAnswers: duplicateStats(exactRowGroups),
  stems: duplicateStats(stemGroups),
  topics,
  prefixes,
  sourceOverlap: {
    imRowsMatchingExpandedPromptAnswer: cards.filter((card) => expandedSet.has(exactRow(card)))
      .length,
    imRowsMatchingBasePromptAnswer: cards.filter((card) => baseSet.has(exactRow(card))).length,
    expandedRowsPresentInMain: expanded.filter((card) =>
      subsetSignatures(cards).has(exactRow(card))
    ).length,
    baseRowsPresentInMain: base.filter((card) => subsetSignatures(cards).has(exactRow(card)))
      .length,
  },
  topStems: stemGroups
    .slice(0, 20)
    .map(([key, values]) => ({
      stem: key,
      count: values.length,
      ids: values.slice(0, 4).map((card) => card.id),
    })),
  topExactPrompts: exactPromptGroups
    .filter(([, values]) => values.length > 1)
    .slice(0, 10)
    .map(([key, values]) => ({
      prompt: key,
      count: values.length,
      ids: values.map((card) => card.id),
    })),
  screenshotPhrase: {
    count: phraseCards.length,
    uniquePrompts: new Set(phraseCards.map((card) => card.prompt)).size,
    uniqueAnswers: new Set(phraseCards.map((card) => card.answer)).size,
    idsFirst: phraseCards.slice(0, 5).map((card) => card.id),
    idsLast: phraseCards.slice(-5).map((card) => card.id),
  },
}

console.log(JSON.stringify(output, null, 2))
