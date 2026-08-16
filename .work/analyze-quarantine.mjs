import fs from 'node:fs'

const inputPath = process.argv[2] ?? 'public/data/flashcards.json'
const cards = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
  .map((card, index) => ({ ...card, sourceIndex: index }))
  .filter((card) => card.subjectId === 'im-english')

const firstParagraphStem = (prompt) =>
  prompt
    .split(/\n\s*\n|\s+\(A\)\s+/u, 1)[0]
    .normalize('NFKC')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase('en-US')

const groups = new Map()
for (const card of cards) {
  const stem = firstParagraphStem(card.prompt)
  const values = groups.get(stem) ?? []
  values.push(card)
  groups.set(stem, values)
}

const naiveGroups = [...groups.entries()]
  .filter(([, values]) => values.length > 5)
  .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))

const isAsciiEnglishCloze = (stem) =>
  /_{3,}/u.test(stem) && /[a-z]/iu.test(stem) && !/[^\x00-\x7f]/u.test(stem)

const quarantinedGroups = naiveGroups.filter(([stem]) => isAsciiEnglishCloze(stem))

const by = (items, key) =>
  Object.fromEntries(
    [...Map.groupBy(items, key)]
      .map(([name, values]) => [name, values.length])
      .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
  )

const quarantined = quarantinedGroups.flatMap(([, values]) => values)
const retained = cards.filter((card) => !quarantined.includes(card))

const result = {
  inputPath,
  normalization:
    'first paragraph before a blank line or (A); NFKC; collapse whitespace; trim; lowercase en-US',
  threshold: 'count > 5 per im-english normalized ASCII English cloze stem',
  totals: {
    imEnglish: cards.length,
    uniqueStems: groups.size,
    naiveGroups: naiveGroups.length,
    naiveCards: naiveGroups.flatMap(([, values]) => values).length,
    quarantinedGroups: quarantinedGroups.length,
    quarantinedCards: quarantined.length,
    quarantinedPercent: (quarantined.length / cards.length) * 100,
    retainedCards: retained.length,
    retainedUniqueStems: new Set(retained.map((card) => firstParagraphStem(card.prompt))).size,
  },
  quarantinedByTopic: by(quarantined, (card) => card.topicId),
  quarantinedByIdFamily: by(quarantined, (card) => card.id.split('-').slice(0, 3).join('-')),
  groups: quarantinedGroups.map(([stem, values]) => ({
    stem,
    count: values.length,
    topics: by(values, (card) => card.topicId),
    idFamilies: by(values, (card) => card.id.split('-').slice(0, 3).join('-')),
    sourceIndexRange: [
      Math.min(...values.map((card) => card.sourceIndex)),
      Math.max(...values.map((card) => card.sourceIndex)),
    ],
    ids: values.slice(0, 8).map((card) => card.id),
    prompts: [...new Set(values.map((card) => card.prompt))].slice(0, 2),
  })),
}

console.log(JSON.stringify(result, null, 2))
