#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const {
  chooseMeaning,
  createDirectVocabularyCard,
  findAuthenticExample,
  isRequiredVocabulary,
  sentenceCandidates,
} = require('./lib/im-vocab-flashcards')

const root = path.join(__dirname, '..')
const dataPath = (name) => path.join(root, 'public/data', name)
const master = JSON.parse(fs.readFileSync(dataPath('ntu-im-vocab-master.json'), 'utf8'))
const lexiconData = JSON.parse(fs.readFileSync(dataPath('im-vocab-lexicon.json'), 'utf8'))
const curation = JSON.parse(fs.readFileSync(dataPath('im-vocab-curation.json'), 'utf8'))
const flashcards = JSON.parse(fs.readFileSync(dataPath('flashcards.json'), 'utf8'))
const questions = JSON.parse(fs.readFileSync(dataPath('questions.json'), 'utf8')).questions
const shouldWrite = process.argv.includes('--write')

const lexiconByWord = new Map(lexiconData.entries.map((entry) => [entry.word, entry]))
const overrides = curation.overrides ?? {}
const excluded = new Map((curation.excluded ?? []).map((item) => [item.word, item.reason]))
const required = master.words.filter(isRequiredVocabulary)
const selected = required.filter((entry) => !excluded.has(entry.word))
const examples = sentenceCandidates(
  questions.filter((question) => question.subjectId === 'im-english')
)

for (const item of curation.excluded ?? []) {
  if (!required.some((entry) => entry.word === item.word)) {
    throw new Error(`Curation excludes a word outside the required set: ${item.word}`)
  }
  if (!item.reason?.trim()) throw new Error(`Excluded vocabulary needs a reason: ${item.word}`)
}

const generated = selected.map((entry) => {
  const lexicon = lexiconByWord.get(entry.word) ?? {}
  const override = overrides[entry.word] ?? {}
  if (!chooseMeaning(entry, lexicon, override)) {
    throw new Error(`Required vocabulary has no Chinese explanation: ${entry.word}`)
  }
  const example = override.example ?? findAuthenticExample(entry.word, examples)
  return createDirectVocabularyCard({ entry, lexicon, override, example })
})

const duplicateIds = [...Map.groupBy(generated, (card) => card.id)].filter(
  ([, cards]) => cards.length > 1
)
if (duplicateIds.length > 0) {
  throw new Error(
    `Generated vocabulary id collisions: ${duplicateIds.map(([id]) => id).join(', ')}`
  )
}

const retained = flashcards.filter((card) => card.subjectId !== 'im-english')
const currentGenerated = flashcards.filter((card) => card.subjectId === 'im-english')
const output = [...retained, ...generated]
const summary = {
  mode: shouldWrite ? 'write' : 'check',
  masterRequired: required.length,
  excludedAsNotVocabulary: excluded.size,
  generated: generated.length,
  otherSubjectCards: retained.length,
  outputCards: output.length,
  authenticExamples: generated.filter((card) => card.pastPaperRef).length,
  missingMeanings: selected.filter(
    (entry) =>
      !chooseMeaning(entry, lexiconByWord.get(entry.word) ?? {}, overrides[entry.word] ?? {})
  ).length,
}

// biome-ignore lint/suspicious/noConsole: generator reports a deterministic build summary
console.log(JSON.stringify(summary, null, 2))

if (shouldWrite) {
  const outputPath = dataPath('flashcards.json')
  const temporaryPath = `${outputPath}.tmp`
  fs.writeFileSync(temporaryPath, `${JSON.stringify(output, null, 2)}\n`)
  fs.renameSync(temporaryPath, outputPath)
} else if (JSON.stringify(currentGenerated) !== JSON.stringify(generated)) {
  throw new Error(
    'Generated IM vocabulary cards are stale. Run `npm run generate:im-vocab` and commit the result.'
  )
}
