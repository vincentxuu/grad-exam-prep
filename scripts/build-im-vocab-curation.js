#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const inputPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, '.work/unmatched-vocab-second-opinion.json')
const outputPath = path.join(root, 'public/data/im-vocab-curation.json')
const review = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
const supplementalReviews = [
  '.work/incomplete-vocab-curation.json',
  '.work/phonetic-only-vocab-curation.json',
].map((file) => {
  const reviewPath = path.join(root, file)
  return fs.existsSync(reviewPath)
    ? JSON.parse(fs.readFileSync(reviewPath, 'utf8'))
    : { entries: [], metadata: { counts: {} } }
})
const supplementalEntries = supplementalReviews.flatMap((item) => item.entries)

const excluded = []
const aliases = {}
const overrides = {}

for (const item of review.entries) {
  if (item.decision === 'enrich' || item.decision === 'keep-needs-override') {
    overrides[item.word] = {
      chinese: item.suggestedTranslation ?? item.traditionalChinese,
      pos: item.suggestedPos ?? item.pos,
      ...(item.canonicalWord && item.canonicalWord !== item.word
        ? { headword: item.canonicalWord }
        : {}),
      reviewReason: item.reason,
      questionRefs: item.questionRefs,
    }
    continue
  }

  if (item.decision === 'alias' || item.decision === 'alias-to-canonical') {
    aliases[item.word] = {
      canonicalWord: item.canonicalWord,
      disposition: item.canonicalDisposition,
      reason: item.reason,
    }
  }

  excluded.push({
    word: item.word,
    category: item.category ?? item.decision,
    reason: item.reason,
    ...(item.canonicalWord ? { canonicalWord: item.canonicalWord } : {}),
    questionRefs: item.questionRefs,
  })
}

for (const item of supplementalEntries) {
  if (overrides[item.word] || excluded.some((entry) => entry.word === item.word)) {
    throw new Error(`Duplicate curation decision across reviews: ${item.word}`)
  }

  if (item.decision === 'keep') {
    overrides[item.word] = {
      chinese: item.traditionalChinese,
      pos: item.pos,
      definition: item.definition,
      reviewReason: item.reason ?? 'Reviewed for the information-management exam context.',
      questionRefs: item.questionRefs,
    }
    continue
  }

  if (item.decision === 'alias') {
    aliases[item.word] = {
      canonicalWord: item.canonicalWord,
      disposition: 'merge_into_existing_master_entry',
      reason: item.reason,
    }
  }

  excluded.push({
    word: item.word,
    category: `incomplete-${item.decision}`,
    reason: item.reason,
    ...(item.canonicalWord ? { canonicalWord: item.canonicalWord } : {}),
    questionRefs: item.questionRefs,
  })
}

const payload = {
  metadata: {
    description: 'Human-reviewed exclusions, aliases, and corrections for IM required vocabulary',
    version: 1,
    reviewedUnmatchedWords: review.entries.length,
    reviewedIncompleteWords: supplementalReviews[0].entries.length,
    reviewedPhoneticOnlyWords: supplementalReviews[1].entries.length,
    excludedWords: excluded.length,
    enrichedWords: Object.keys(overrides).length,
    classificationCounts: {
      unmatched: review.metadata.counts,
      incomplete: supplementalReviews[0].metadata.counts,
      phoneticOnly: supplementalReviews[1].metadata.counts,
    },
  },
  excluded,
  aliases,
  overrides,
}

fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`)
// biome-ignore lint/suspicious/noConsole: curation builder reports its output counts
console.log(
  JSON.stringify({
    output: path.relative(root, outputPath),
    reviewed: review.entries.length + supplementalEntries.length,
    reviewBatches: [
      review.entries.length,
      ...supplementalReviews.map((item) => item.entries.length),
    ],
    excluded: excluded.length,
    aliases: Object.keys(aliases).length,
    overrides: Object.keys(overrides).length,
  })
)
