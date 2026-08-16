import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const original = JSON.parse(execFileSync('git', ['show', 'HEAD:public/data/flashcards.json'], { encoding: 'utf8', maxBuffer: 30 * 1024 * 1024 }))
const current = read('public/data/flashcards.json')
const masterDoc = read('public/data/ntu-im-vocab-master.json')
const questionsDoc = read('public/data/questions.json')
const base = read('public/data/vocab-flashcards.json')
const expanded = read('public/data/vocab-flashcards-expanded.json')

const targetTiers = new Set(['must_know', 'important', 'worth_studying', 'domain'])
const target = masterDoc.words.filter((entry) => targetTiers.has(entry.tier))
const normalizeWord = (word) => String(word ?? '').normalize('NFKC').trim().toLowerCase()
const slug = (word) => normalizeWord(word).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const slugMap = new Map()
for (const entry of masterDoc.words) {
  const values = slugMap.get(slug(entry.word)) ?? []
  values.push(entry)
  slugMap.set(slug(entry.word), values)
}
const wordMap = new Map(masterDoc.words.map((entry) => [normalizeWord(entry.word), entry]))

function resolveCard(card) {
  for (const prefix of ['fc-im-vocab-', 'fc-im-reading-', 'fc-im-domain-']) {
    if (card.id.startsWith(prefix)) {
      let value = card.id.slice(prefix.length).replace(/-alt$/, '')
      const candidates = slugMap.get(value)
      if (candidates?.length === 1) return candidates[0]
    }
  }
  const answer = card.answer.match(/(?:【答案】|答案：)\s*\([A-E]\)\s*([A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z][A-Za-z'-]*)*)/i)?.[1]
  if (answer && wordMap.has(normalizeWord(answer))) return wordMap.get(normalizeWord(answer))
  const academic = card.prompt.match(/[「'“"]([A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z][A-Za-z'-]*)*)[」'”"]/i)?.[1]
  if (academic && wordMap.has(normalizeWord(academic))) return wordMap.get(normalizeWord(academic))
  const leading = card.prompt.match(/^([A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z][A-Za-z'-]*)*)\s*[(（]/)?.[1]
  if (leading && wordMap.has(normalizeWord(leading))) return wordMap.get(normalizeWord(leading))
  return null
}

function coverage(cards) {
  const im = cards.filter((card) => card.subjectId === 'im-english')
  const resolved = im.map((card) => [card, resolveCard(card)]).filter(([, entry]) => entry)
  const targetWords = new Set(resolved.filter(([, entry]) => targetTiers.has(entry.tier)).map(([, entry]) => normalizeWord(entry.word)))
  const bySource = Object.fromEntries([...new Set(target.map((entry) => entry.source))].sort().map((source) => [source, 0]))
  const byTier = Object.fromEntries([...targetTiers].map((tier) => [tier, 0]))
  for (const word of targetWords) bySource[wordMap.get(word).source]++
  for (const word of targetWords) byTier[wordMap.get(word).tier]++
  return { cards: im.length, resolvedCards: resolved.length, uniqueTargetWords: targetWords.size, missingTargetWords: target.length - targetWords.size, byTier, bySource }
}

const questionTexts = questionsDoc.questions.map((q) => ({ subjectId: q.subjectId, year: q.year, text: q.text }))
function rawMatches(word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
  const re = new RegExp(`(?<![A-Za-z])${escaped}(?![A-Za-z])`, 'i')
  let im = 0
  let other = 0
  for (const q of questionTexts) {
    if (!re.test(q.text)) continue
    if (q.subjectId === 'im-english') im++
    else other++
  }
  return { im, other }
}

const tierStats = {}
const sourceStats = {}
const missingRawBySource = {}
let missingChinese = 0
let missingPos = 0
let missingBoth = 0
let withEnglishContexts = 0
let withDomainContext = 0
let withAnyMasterContext = 0
let rawImMatches = 0
let rawOtherMatches = 0
let rawAnyMatches = 0
let noRawButMasterContext = 0
for (const entry of target) {
  const hasZh = Boolean(entry.chinese?.trim())
  const hasPos = Boolean(entry.pos?.trim())
  const hasEnglish = Boolean(entry.englishExam?.contexts?.length)
  const hasDomain = Boolean(entry.domain?.context?.trim())
  const matches = rawMatches(entry.word)
  missingChinese += Number(!hasZh)
  missingPos += Number(!hasPos)
  missingBoth += Number(!hasZh && !hasPos)
  withEnglishContexts += Number(hasEnglish)
  withDomainContext += Number(hasDomain)
  withAnyMasterContext += Number(hasEnglish || hasDomain)
  rawImMatches += Number(matches.im > 0)
  rawOtherMatches += Number(matches.other > 0)
  rawAnyMatches += Number(matches.im + matches.other > 0)
  if (matches.im + matches.other === 0) missingRawBySource[entry.source] = (missingRawBySource[entry.source] ?? 0) + 1
  noRawButMasterContext += Number(matches.im + matches.other === 0 && (hasEnglish || hasDomain))
  const stats = tierStats[entry.tier] ?? { total: 0, missingChinese: 0, missingPos: 0, anyMasterContext: 0, rawQuestionMatch: 0 }
  stats.total++
  stats.missingChinese += Number(!hasZh)
  stats.missingPos += Number(!hasPos)
  stats.anyMasterContext += Number(hasEnglish || hasDomain)
  stats.rawQuestionMatch += Number(matches.im + matches.other > 0)
  tierStats[entry.tier] = stats
  const source = sourceStats[entry.source] ?? { total: 0, missingChinese: 0, missingPos: 0, anyMasterContext: 0, rawQuestionMatch: 0 }
  source.total++
  source.missingChinese += Number(!hasZh)
  source.missingPos += Number(!hasPos)
  source.anyMasterContext += Number(hasEnglish || hasDomain)
  source.rawQuestionMatch += Number(matches.im + matches.other > 0)
  sourceStats[entry.source] = source
}

const sig = (card) => JSON.stringify([card.prompt, card.answer])
const sourceSets = { base: new Set(base.map(sig)), expanded: new Set(expanded.map(sig)) }
function cardProvenance(cards) {
  const rows = cards.filter((card) => card.subjectId === 'im-english')
  const result = { originalSeedId: 0, auxiliaryBase: 0, auxiliaryExpanded: 0, otherBulk: 0 }
  for (const card of rows) {
    if (/^fc-im-english-\d+$/.test(card.id)) result.originalSeedId++
    else if (sourceSets.base.has(sig(card))) result.auxiliaryBase++
    else if (sourceSets.expanded.has(sig(card))) result.auxiliaryExpanded++
    else result.otherBulk++
  }
  return result
}

function auxiliaryQuality(cards) {
  const seen = new Set()
  const result = { cards: cards.length, resolvedTargetWords: 0, withChinese: 0, withPos: 0, withExample: 0, sourceBackedExample: 0, fillsMissingMasterChinese: 0, fillsMissingMasterPos: 0 }
  for (const card of cards) {
    const entry = resolveCard(card)
    if (!entry || !targetTiers.has(entry.tier)) continue
    const key = normalizeWord(entry.word)
    if (seen.has(key)) continue
    seen.add(key)
    result.resolvedTargetWords++
    const chinese = card.answer.match(/(?:【中文】|【意思】|中文：)\s*([^\n]+)/)?.[1]?.trim()
    const pos = card.answer.match(/(?:【詞性】|詞性：)\s*([^\n]+)/)?.[1]?.trim()
    const example = card.answer.match(/(?:【例句】|例句：)\s*([^\n]+)/)?.[1]?.trim()
    result.withChinese += Number(Boolean(chinese))
    result.withPos += Number(Boolean(pos))
    result.withExample += Number(Boolean(example))
    result.fillsMissingMasterChinese += Number(!entry.chinese?.trim() && Boolean(chinese))
    result.fillsMissingMasterPos += Number(!entry.pos?.trim() && Boolean(pos))
    if (example) {
      const probe = example.replace(/\.\.\./g, '').replace(/_+/g, entry.word).trim().slice(0, 45).toLowerCase()
      result.sourceBackedExample += Number(probe.length >= 20 && questionTexts.some((q) => q.text.toLowerCase().includes(probe)))
    }
  }
  return result
}

const output = {
  targetDefinition: { tiers: [...targetTiers], count: target.length, tierStats, sourceStats },
  fields: { missingChinese, missingPos, missingBoth, withEnglishContexts, withDomainContext, withAnyMasterContext },
  rawQuestionTraceability: { rawImMatches, rawOtherMatches, rawAnyMatches, noRawButMasterContext, missingRawBySource, questionRows: questionTexts.length },
  slugCollisions: [...slugMap.entries()].filter(([, values]) => values.length > 1).length,
  originalCoverage: coverage(original),
  currentCoverage: coverage(current),
  originalCardProvenance: cardProvenance(original),
  currentCardProvenance: cardProvenance(current),
  auxiliary: { base: base.length, expanded: expanded.length },
  auxiliaryQuality: { base: auxiliaryQuality(base), expanded: auxiliaryQuality(expanded), combined: auxiliaryQuality([...base, ...expanded]) },
}
console.log(JSON.stringify(output, null, 2))
