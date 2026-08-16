import fs from 'node:fs'

const currentPath = process.argv[2] ?? 'public/data/flashcards.json'
const beforePath = process.argv[3] ?? '/tmp/grad-exam-prep-flashcards-precleanup.json'
const load = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const current = load(currentPath).filter((card) => card.subjectId === 'im-english')
const before = load(beforePath).filter((card) => card.subjectId === 'im-english')
const master = load('public/data/ntu-im-vocab-master.json').words
const normalize = (value) => String(value ?? '').normalize('NFKC').trim().toLowerCase()
const masterByWord = new Map(master.map((entry) => [normalize(entry.word), entry]))

const target = (card) => normalize(
  card.answer.match(/(?:【答案】|答案：)[^\S\n]*\([A-D]\)[^\S\n]*([^\n（]+)/u)?.[1]
  ?? card.prompt.match(/在學術語境中，'([^']+)'/u)?.[1]
  ?? card.prompt.match(/^([A-Za-z][A-Za-z -]+)\s*\([^)]*\)/u)?.[1]
  ?? ''
)
const targetSet = (cards) => new Set(cards.map(target).filter((word) => masterByWord.has(word)))
const currentTargets = targetSet(current)
const beforeTargets = targetSet(before)
const currentIds = new Set(current.map((card) => card.id))
const removed = before.filter((card) => !currentIds.has(card.id))
const removedTargets = targetSet(removed)
const tiers = ['must_know', 'important', 'worth_studying', 'domain', 'gre_extra', 'skip']

const tierStats = Object.fromEntries(tiers.map((tier) => {
  const words = master.filter((entry) => entry.tier === tier).map((entry) => normalize(entry.word))
  const beforeCovered = words.filter((word) => beforeTargets.has(word)).length
  const currentCovered = words.filter((word) => currentTargets.has(word)).length
  return [tier, {
    master: words.length,
    beforeCovered,
    currentCovered,
    coverageLost: beforeCovered - currentCovered,
    missingNow: words.length - currentCovered,
  }]
}))

const coreTiers = new Set(['must_know', 'important', 'worth_studying', 'domain'])
const core = master.filter((entry) => coreTiers.has(entry.tier))
const currentCore = core.filter((entry) => currentTargets.has(normalize(entry.word))).length
const beforeCore = core.filter((entry) => beforeTargets.has(normalize(entry.word))).length

console.log(JSON.stringify({
  master: {
    total: master.length,
    coreTarget: core.length,
    completeChinese: master.filter((entry) => entry.chinese?.trim()).length,
    completePos: master.filter((entry) => entry.pos?.trim()).length,
    completeChineseAndPos: master.filter((entry) => entry.chinese?.trim() && entry.pos?.trim()).length,
  },
  cards: { before: before.length, current: current.length, removed: removed.length },
  coverage: {
    beforeAllMaster: beforeTargets.size,
    currentAllMaster: currentTargets.size,
    beforeCore,
    currentCore,
    lostCore: beforeCore - currentCore,
    currentAllMasterMissing: master.length - currentTargets.size,
  },
  removed: {
    ids: removed.length,
    uniqueMasterTargets: removedTargets.size,
    targetsStillCoveredByCurrent: [...removedTargets].filter((word) => currentTargets.has(word)).length,
    targetsNoLongerCovered: [...removedTargets].filter((word) => !currentTargets.has(word)).length,
  },
  tierStats,
}, null, 2))
