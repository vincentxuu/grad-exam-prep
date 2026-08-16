import fs from 'node:fs'

const load = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const master = load('public/data/ntu-im-vocab-master.json').words
const cards = load('public/data/flashcards.json')
const curation = load('public/data/im-vocab-curation.json')
const unmatchedReview = load('.work/unmatched-vocab-second-opinion.json')
const incompleteReview = load('.work/incomplete-vocab-curation.json')
const phoneticOnlyReview = load('.work/phonetic-only-vocab-curation.json')
const questions = load('public/data/questions.json').questions

const requiredTiers = new Set(['must_know', 'important', 'worth_studying', 'domain'])
const normalize = (value) => String(value ?? '').normalize('NFKC').trim().toLowerCase()
const slugify = (word) => normalize(word).replace(/['‘’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const group = (items, keyFn) => {
  const groups = new Map()
  for (const item of items) {
    const key = keyFn(item)
    groups.set(key, [...(groups.get(key) ?? []), item])
  }
  return groups
}
const duplicateEntries = (groups) => [...groups.entries()].filter(([, values]) => values.length > 1)

const required = master.filter((entry) => requiredTiers.has(entry.tier))
const requiredByHeadword = new Map(required.map((entry) => [normalize(entry.word), entry]))
const excluded = curation.excluded ?? []
const excludedByHeadword = new Map(excluded.map((entry) => [normalize(entry.word), entry]))
const overrides = curation.overrides ?? {}
const declaredExpected = required
  .filter((entry) => !excludedByHeadword.has(normalize(entry.word)))
  .map((entry) => ({
    sourceWord: entry.word,
    headword: overrides[entry.word]?.headword?.trim() || entry.word,
    id: `fc-im-vocab-${slugify(entry.word)}`,
    tier: entry.tier,
  }))
const declaredExpectedSet = new Set(declaredExpected.map((entry) => normalize(entry.headword)))
const declaredExpectedByHeadword = new Map(declaredExpected.map((entry) => [normalize(entry.headword), entry]))
const imCards = cards.filter((card) => card.subjectId === 'im-english')
const actualByHeadword = group(imCards, (card) => normalize(card.headword))
const actualSet = new Set(actualByHeadword.keys())

const missingDeclared = [...declaredExpectedSet].filter((word) => !actualSet.has(word))
const extraDeclared = [...actualSet].filter((word) => !declaredExpectedSet.has(word))
const duplicateHeadwords = duplicateEntries(actualByHeadword).map(([headword, values]) => ({ headword, ids: values.map((card) => card.id) }))
const duplicateIds = duplicateEntries(group(cards, (card) => card.id)).map(([id, values]) => ({ id, count: values.length }))

const frontViolations = imCards.filter((card) => {
  const prompt = String(card.prompt ?? '')
  return (
    prompt !== card.headword ||
    /\n|_{2,}|\([A-Ea-e]\)|(?:^|\s)[A-Ea-e][.)]\s|\b(?:choose|select|blank)\b|選出|填空|克漏字/i.test(prompt)
  )
}).map((card) => ({ id: card.id, headword: card.headword, prompt: card.prompt }))

const idShapeViolations = imCards.filter((card) => card.id !== declaredExpectedByHeadword.get(normalize(card.headword))?.id).map((card) => ({ id: card.id, expected: declaredExpectedByHeadword.get(normalize(card.headword))?.id ?? null, headword: card.headword }))
const structureViolations = imCards.filter((card) => card.examId !== 'im' || card.topicId !== 'im-en-vocab' || card.kind !== 'vocabulary' || !String(card.answer ?? '').includes('【意思】')).map((card) => card.id)
const tierMismatches = imCards.filter((card) => declaredExpectedByHeadword.get(normalize(card.headword))?.tier !== card.tier).map((card) => ({ id: card.id, headword: card.headword, actual: card.tier, expected: declaredExpectedByHeadword.get(normalize(card.headword))?.tier ?? null }))

const markerValue = (answer, marker) => {
  const match = String(answer ?? '').match(new RegExp(`${marker}([^\\n]*)`))
  return match?.[1]?.trim() ?? ''
}
const backCompletenessViolations = imCards
  .filter((card) => {
    const answer = card.answer
    const hasMeaning = Boolean(markerValue(answer, '【意思】'))
    const hasSource = Boolean(markerValue(answer, '【來源】'))
    const hasSupportingField = ['【詞性】', '【英文解釋】', '【例句】'].some((marker) =>
      Boolean(markerValue(answer, marker))
    )
    return !hasMeaning || !hasSource || !hasSupportingField
  })
  .map((card) => ({
    id: card.id,
    headword: card.headword,
    hasMeaning: Boolean(markerValue(card.answer, '【意思】')),
    hasSource: Boolean(markerValue(card.answer, '【來源】')),
    hasPos: Boolean(markerValue(card.answer, '【詞性】')),
    hasDefinition: Boolean(markerValue(card.answer, '【英文解釋】')),
    hasPhonetic: Boolean(markerValue(card.answer, '【音標】')),
    hasExample: Boolean(markerValue(card.answer, '【例句】')),
  }))

const questionIds = new Set(questions.map((question) => question.id))
const allReviewEntries = [
  ...unmatchedReview.entries,
  ...incompleteReview.entries,
  ...phoneticOnlyReview.entries,
]
const reviewEntryByWord = new Map(allReviewEntries.map((entry) => [normalize(entry.word), entry]))
const hasValidEvidence = (entry) => {
  const refs = entry?.questionRefs ?? []
  if (refs.length > 0) return refs.every((id) => questionIds.has(id))
  return Boolean(entry?.contextEvidence?.trim())
}
const exclusionProblems = {
  duplicateWords: duplicateEntries(group(excluded, (entry) => normalize(entry.word))).map(([word]) => word),
  outsideRequired: excluded.filter((entry) => !requiredByHeadword.has(normalize(entry.word))).map((entry) => entry.word),
  missingReason: excluded.filter((entry) => !String(entry.reason ?? '').trim()).map((entry) => entry.word),
  invalidCategory: excluded.filter((entry) => !['alias-to-canonical', 'exclude-not-vocab', 'incomplete-alias', 'incomplete-exclude'].includes(entry.category)).map((entry) => ({ word: entry.word, category: entry.category })),
  missingQuestionEvidence: excluded
    .filter((entry) => !hasValidEvidence(reviewEntryByWord.get(normalize(entry.word))))
    .map((entry) => ({ word: entry.word, questionRefs: entry.questionRefs ?? [] })),
}

const unmatchedKeeps = unmatchedReview.entries.filter((entry) => entry.decision === 'keep-needs-override')
const unmatchedExcludes = unmatchedReview.entries.filter((entry) => entry.decision !== 'keep-needs-override')
const incompleteKeeps = incompleteReview.entries.filter((entry) => entry.decision === 'keep')
const incompleteExcludes = incompleteReview.entries.filter((entry) => entry.decision !== 'keep')
const phoneticOnlyKeeps = phoneticOnlyReview.entries.filter((entry) => entry.decision === 'keep')
const phoneticOnlyExcludes = phoneticOnlyReview.entries.filter((entry) => entry.decision !== 'keep')
const allKeeps = [...unmatchedKeeps, ...incompleteKeeps, ...phoneticOnlyKeeps]
const allReviewedExclusions = [...unmatchedExcludes, ...incompleteExcludes, ...phoneticOnlyExcludes]
const overrideWords = new Set(Object.keys(overrides).map(normalize))
const reviewAlignmentProblems = {
  duplicateAcrossReviews: duplicateEntries(group(allReviewEntries, (entry) => normalize(entry.word))).map(([word]) => word),
  keepMissingOverride: allKeeps.filter((entry) => !overrideWords.has(normalize(entry.word))).map((entry) => entry.word),
  keepStillExcluded: allKeeps.filter((entry) => excludedByHeadword.has(normalize(entry.word))).map((entry) => entry.word),
  reviewedExclusionMissing: allReviewedExclusions.filter((entry) => !excludedByHeadword.has(normalize(entry.word))).map((entry) => entry.word),
  unexpectedOverride: [...overrideWords].filter((word) => !allKeeps.some((entry) => normalize(entry.word) === word)),
}

// Independent semantic review: a curation reason can be non-empty and still be wrong.
// Treat every independently-reviewed keep decision that the product curation excluded as a conflict.
const semanticConflicts = allKeeps
  .filter((entry) => excludedByHeadword.has(normalize(entry.word)))
  .map((entry) => ({
    word: entry.word,
    canonicalWord: entry.canonicalWord,
    tier: entry.tier,
    source: entry.source,
    pos: entry.pos,
    traditionalChinese: entry.traditionalChinese,
    questionRefs: entry.questionRefs,
    independentReason: entry.reason,
    exclusionReason: excludedByHeadword.get(normalize(entry.word)).reason,
  }))

const incompleteKeepBackViolations = incompleteKeeps
  .map((entry) => {
    const expected = declaredExpected.find((item) => item.sourceWord === entry.word)
    const card = expected ? actualByHeadword.get(normalize(expected.headword))?.[0] : null
    return {
      word: entry.word,
      cardId: card?.id ?? null,
      reviewHasPos: Boolean(entry.pos?.trim()),
      reviewHasDefinition: Boolean(entry.definition?.trim()),
      cardHasPos: Boolean(markerValue(card?.answer, '【詞性】')),
      cardHasDefinition: Boolean(markerValue(card?.answer, '【英文解釋】')),
    }
  })
  .filter((entry) => !entry.cardId || !entry.reviewHasPos || !entry.reviewHasDefinition || !entry.cardHasPos || !entry.cardHasDefinition)

const phoneticOnlyKeepBackViolations = phoneticOnlyKeeps
  .map((entry) => {
    const expected = declaredExpected.find((item) => item.sourceWord === entry.word)
    const card = expected ? actualByHeadword.get(normalize(expected.headword))?.[0] : null
    return {
      word: entry.word,
      cardId: card?.id ?? null,
      reviewHasPos: Boolean(entry.pos?.trim()),
      reviewHasDefinition: Boolean(entry.definition?.trim()),
      cardHasPos: Boolean(markerValue(card?.answer, '【詞性】')),
      cardHasDefinition: Boolean(markerValue(card?.answer, '【英文解釋】')),
    }
  })
  .filter((entry) => !entry.cardId || !entry.reviewHasPos || !entry.reviewHasDefinition || !entry.cardHasPos || !entry.cardHasDefinition)

const independentlyExpectedSet = new Set([...declaredExpectedSet, ...semanticConflicts.map((entry) => normalize(entry.canonicalWord || entry.word))])
const missingIndependent = [...independentlyExpectedSet].filter((word) => !actualSet.has(word))
const extraIndependent = [...actualSet].filter((word) => !independentlyExpectedSet.has(word))

const mechanicalPass = [
  required.length === 4859,
  excluded.length === curation.metadata.excludedWords,
  imCards.length === declaredExpected.length,
  missingDeclared.length === 0,
  extraDeclared.length === 0,
  duplicateHeadwords.length === 0,
  duplicateIds.length === 0,
  frontViolations.length === 0,
  idShapeViolations.length === 0,
  structureViolations.length === 0,
  tierMismatches.length === 0,
  backCompletenessViolations.length === 0,
  incompleteKeepBackViolations.length === 0,
  phoneticOnlyKeepBackViolations.length === 0,
  Object.values(exclusionProblems).every((items) => items.length === 0),
  unmatchedReview.entries.length === 118,
  unmatchedKeeps.length === 23,
  unmatchedExcludes.length === 95,
  incompleteReview.entries.length === 101,
  incompleteKeeps.length === 70,
  incompleteExcludes.length === 31,
  phoneticOnlyReview.entries.length === 24,
  phoneticOnlyKeeps.length === 19,
  phoneticOnlyExcludes.length === 5,
  excluded.length === 131,
  overrideWords.size === 112,
  Object.values(reviewAlignmentProblems).every((items) => items.length === 0),
].every(Boolean)
const semanticPass = semanticConflicts.length === 0 && missingIndependent.length === 0 && extraIndependent.length === 0

const report = {
  generatedAt: '2026-08-16',
  overallStatus: mechanicalPass && semanticPass ? 'PASS' : 'FAIL',
  mechanicalStatus: mechanicalPass ? 'PASS' : 'FAIL',
  semanticExclusionStatus: semanticPass ? 'PASS' : 'FAIL',
  counts: {
    masterRequired: required.length,
    declaredExclusions: excluded.length,
    declaredExpectedCards: declaredExpected.length,
    actualImCards: imCards.length,
    independentRequiredAfterReversals: independentlyExpectedSet.size,
    independentCoverage: actualSet.size - extraIndependent.length,
    independentCoveragePercent: Number((((actualSet.size - extraIndependent.length) / independentlyExpectedSet.size) * 100).toFixed(4)),
    allCards: cards.length,
  },
  declaredCoverage: { missing: missingDeclared, extra: extraDeclared },
  independentCoverage: { missing: missingIndependent, extra: extraIndependent },
  uniqueness: { duplicateCanonicalHeadwords: duplicateHeadwords, duplicateIds },
  frontQuality: { violations: frontViolations },
  backQuality: {
    requiredMinimum: 'meaning + source + at least one of POS/English definition/example; phonetic alone does not count',
    allCardViolations: backCompletenessViolations,
    incompleteReviewKeepRequirement: 'all 70 retained incomplete-review entries must have POS + English definition in review and generated card',
    incompleteReviewKeepViolations: incompleteKeepBackViolations,
    phoneticOnlyReviewKeepRequirement: 'all 19 retained phonetic-only-review entries must have POS + English definition in review and generated card',
    phoneticOnlyReviewKeepViolations: phoneticOnlyKeepBackViolations,
  },
  cardShape: { idShapeViolations, structureViolations, tierMismatches },
  exclusions: {
    reviewed: { unmatched: unmatchedReview.entries.length, incomplete: incompleteReview.entries.length, phoneticOnly: phoneticOnlyReview.entries.length, total: unmatchedReview.entries.length + incompleteReview.entries.length + phoneticOnlyReview.entries.length },
    retainedAndEnriched: { unmatched: unmatchedKeeps.length, incomplete: incompleteKeeps.length, phoneticOnly: phoneticOnlyKeeps.length, total: allKeeps.length },
    excluded: { unmatched: unmatchedExcludes.length, incomplete: incompleteExcludes.length, phoneticOnly: phoneticOnlyExcludes.length, total: allReviewedExclusions.length },
    categoryCounts: Object.fromEntries([...group(excluded, (entry) => entry.category)].map(([category, items]) => [category, items.length])),
    problems: exclusionProblems,
    reviewAlignmentProblems,
    semanticConflicts,
  },
}

fs.writeFileSync('.work/final-vocab-generation-audit.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (report.overallStatus !== 'PASS') process.exitCode = 1
