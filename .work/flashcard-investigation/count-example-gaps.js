const fs = require('fs')

const read = (name) => JSON.parse(fs.readFileSync(`public/data/${name}`, 'utf8'))
const cards = read('flashcards.json')
const master = read('ntu-im-vocab-master.json')
const curation = read('im-vocab-curation.json')

const hasExample = (card) => /(?:^|\n)(?:例句：|【例句】)/.test(card.answer ?? '')
const group = (items, key) =>
  Object.fromEntries(
    [...Map.groupBy(items, key)].map(([name, values]) => [
      String(name),
      {
        total: values.length,
        withExample: values.filter(hasExample).length,
        missing: values.filter((x) => !hasExample(x)).length,
      },
    ])
  )

const imCards = cards.filter((c) => c.subjectId === 'im-english')
const masterByWord = new Map(master.words.map((x) => [x.word, x]))
const sourceRows = imCards.map((card) => ({
  ...card,
  master: masterByWord.get(card.headword ?? card.prompt),
}))

const overrideExamples = new Set(
  Object.entries(curation.overrides ?? {})
    .filter(([, value]) => value.example?.en)
    .map(([word]) => word)
)
const withExample = imCards.filter(hasExample)
const sourceKind = {
  authenticPastPaper: withExample.filter((c) => c.pastPaperRef).length,
  curatedOverride: withExample.filter((c) => overrideExamples.has(c.headword ?? c.prompt)).length,
  withExampleUnknown: withExample.filter(
    (c) => !c.pastPaperRef && !overrideExamples.has(c.headword ?? c.prompt)
  ).length,
  none: imCards.filter((c) => !hasExample(c)).length,
}

const missingSample = imCards
  .filter((c) => !hasExample(c))
  .slice(0, 20)
  .map((c) => ({ word: c.headword, tier: c.tier, source: masterByWord.get(c.headword)?.source }))

console.log(
  JSON.stringify(
    {
      all: {
        total: cards.length,
        vocabulary: cards.filter((c) => c.kind === 'vocabulary').length,
        withExample: cards.filter(hasExample).length,
        missing: cards.filter((c) => !hasExample(c)).length,
      },
      bySubject: group(cards, (c) => c.subjectId),
      imEnglish: {
        total: imCards.length,
        withExample: withExample.length,
        missing: imCards.length - withExample.length,
        missingPercent: Number((((imCards.length - withExample.length) / imCards.length) * 100).toFixed(2)),
        byTier: group(imCards, (c) => c.tier ?? 'none'),
        byMasterSource: group(sourceRows, (c) => c.master?.source ?? 'unknown'),
        exampleSourceKind: sourceKind,
        masterLookupMisses: sourceRows.filter((x) => !x.master).map((x) => x.headword),
        missingSample,
      },
    },
    null,
    2
  )
)
