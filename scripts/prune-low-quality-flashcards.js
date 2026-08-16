#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const {
  DEFAULT_MAX_REPEATED_CLOZE_STEM,
  findLowQualityFlashcardIds,
  findPlaceholderExampleCards,
  groupRepeatedEnglishClozeStems,
} = require('./lib/flashcard-quality')

const flashcardsPath = path.join(__dirname, '../public/data/flashcards.json')
const shouldWrite = process.argv.includes('--write')
const flashcards = JSON.parse(fs.readFileSync(flashcardsPath, 'utf8'))

const repeatedGroups = groupRepeatedEnglishClozeStems(flashcards)
const placeholderCards = findPlaceholderExampleCards(flashcards)
const rejectedIds = findLowQualityFlashcardIds(flashcards)
const retained = flashcards.filter((card) => !rejectedIds.has(card.id))

// biome-ignore lint/suspicious/noConsole: this CLI intentionally reports its audit summary
console.log(
  JSON.stringify(
    {
      mode: shouldWrite ? 'write' : 'dry-run',
      maxRepeatedEnglishClozeStem: DEFAULT_MAX_REPEATED_CLOZE_STEM,
      before: flashcards.length,
      removed: rejectedIds.size,
      after: retained.length,
      placeholderExamples: placeholderCards.length,
      repeatedStemGroups: repeatedGroups.map((group) => ({
        subjectId: group.subjectId,
        count: group.cards.length,
        stem: group.stem,
      })),
    },
    null,
    2
  )
)

if (shouldWrite) {
  fs.writeFileSync(flashcardsPath, `${JSON.stringify(retained, null, 2)}\n`)
}
