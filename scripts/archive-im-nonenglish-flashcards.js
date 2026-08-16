#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.join(__dirname, '..')
const flashcardsFile = path.join(rootDir, 'public/data/flashcards.json')
const archiveDir = path.join(rootDir, 'archive/flashcards')
const archiveFile = path.join(archiveDir, 'im-nonenglish-legacy.json')
const subjectIds = ['im-it', 'im-mis', 'im-stat']
const expectedCounts = {
  'im-it': 60,
  'im-mis': 50,
  'im-stat': 50,
}
const write = process.argv.includes('--write')

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function atomicWriteJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const temporaryFile = `${file}.tmp`
  fs.writeFileSync(temporaryFile, `${JSON.stringify(value, null, 2)}\n`)
  fs.renameSync(temporaryFile, file)
}

function countBySubject(cards) {
  return Object.fromEntries(
    subjectIds.map((subjectId) => [
      subjectId,
      cards.filter((card) => card.subjectId === subjectId).length,
    ])
  )
}

function assertExpectedCounts(cards, label) {
  const counts = countBySubject(cards)
  for (const subjectId of subjectIds) {
    if (counts[subjectId] !== expectedCounts[subjectId]) {
      throw new Error(
        `${label} ${subjectId} 應有 ${expectedCounts[subjectId]} 張，實際為 ${counts[subjectId]} 張`
      )
    }
  }
  return counts
}

const flashcards = readJson(flashcardsFile)
if (!Array.isArray(flashcards)) throw new Error('flashcards.json 必須是陣列')

const legacyCards = flashcards.filter((card) => subjectIds.includes(card.subjectId))
const retainedCards = flashcards.filter((card) => !subjectIds.includes(card.subjectId))

if (fs.existsSync(archiveFile)) {
  const archive = readJson(archiveFile)
  if (!Array.isArray(archive.cards)) throw new Error('封存檔 cards 必須是陣列')
  assertExpectedCounts(archive.cards, '封存檔')

  if (legacyCards.length > 0) {
    throw new Error(
      `正式資料仍含 ${legacyCards.length} 張非英文 legacy 卡；封存檔已存在，拒絕覆寫，請先確認資料來源`
    )
  }

  console.log('✅ 計概、MIS、統計 legacy 閃卡已封存，正式資料為 0 張')
  process.exit(0)
}

if (!write) {
  throw new Error('尚未建立封存檔；請執行 npm run archive:im-nonenglish-flashcards')
}

const counts = assertExpectedCounts(legacyCards, '正式資料')
const ids = legacyCards.map((card) => card.id)
if (new Set(ids).size !== ids.length) throw new Error('待封存卡片含重複 ID')

const archive = {
  schemaVersion: 1,
  archivedOn: '2026-08-16',
  source: 'public/data/flashcards.json',
  reason:
    'Legacy hand-written cards lacked concept-master provenance and valid taxonomy coverage; remove them from production until regenerated through the curated concept pipeline.',
  counts,
  cards: legacyCards,
}

atomicWriteJson(archiveFile, archive)
atomicWriteJson(flashcardsFile, retainedCards)

console.log(
  `✅ 已封存 ${legacyCards.length} 張 legacy 閃卡（計概 ${counts['im-it']}、MIS ${counts['im-mis']}、統計 ${counts['im-stat']}）`
)
console.log('✅ questions.json 未修改')
