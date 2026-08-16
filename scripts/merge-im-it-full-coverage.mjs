import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const shouldWrite = process.argv.includes('--write')
const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const readItems = (path, key) => {
  if (!fs.existsSync(path)) throw new Error(`Required fragment is missing: ${path}`)
  const value = readJson(path)
  return Array.isArray(value) ? value : (value[key] ?? [])
}
const assertUnique = (items, label) => {
  const ids = items.map((item) => item.id)
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate ${label} IDs`)
}

const lessonPath = 'public/data/im-it-lessons.json'
const cardPath = 'public/data/im-it-concept-cards.json'
const sourcePath = 'public/data/im-it-source-registry.json'
const lessonsRaw = readJson(lessonPath)
const cardsRaw = readJson(cardPath)
const sourcesRaw = readJson(sourcePath)

if (
  lessonsRaw.lessons.length !== 20 ||
  cardsRaw.cards.length !== 122 ||
  sourcesRaw.sources.length !== 26
) {
  throw new Error('Canonical baseline drifted from 20 lessons, 122 cards, and 26 sources')
}

const batches = ['a', 'b', 'c']
const addedLessons = batches.flatMap((batch) =>
  readItems(`.work/im-it-full-batch-${batch}-lessons.json`, 'lessons')
)
const addedCards = batches.flatMap((batch) =>
  readItems(`.work/im-it-full-batch-${batch}-cards.json`, 'cards')
)
addedCards.push(...readItems('.work/im-it-full-supplemental-cards.json', 'cards'))
const addedSources = batches.flatMap((batch) =>
  readItems(`.work/im-it-full-batch-${batch}-sources.json`, 'sources')
)

if (addedLessons.length !== 15 || addedCards.length !== 69 || addedSources.length !== 9) {
  throw new Error(
    `Full-coverage manifest mismatch: ${addedLessons.length} lessons, ${addedCards.length} cards, ${addedSources.length} sources`
  )
}

const correctedBaselineLessons = lessonsRaw.lessons.map((lesson) =>
  lesson.id === 'lesson-im-it-ds-complexity-sorting-searching-01'
    ? {
        ...lesson,
        evidenceNote:
          '複雜度分析在現有 canonical metadata 中沒有 direct primary 考古題；本課的考古題直接支撐排序與搜尋，複雜度部分由 reviewed MIT 6.006 課程內容補足，不把相鄰題冒充直接出題證據。',
      }
    : lesson
)
const lessons = [...correctedBaselineLessons, ...addedLessons]
const cards = [...cardsRaw.cards, ...addedCards]
const sources = [...sourcesRaw.sources, ...addedSources]
assertUnique(lessons, 'lesson')
assertUnique(cards, 'card')
assertUnique(sources, 'source')

const coveredSubtopics = new Set(lessons.flatMap((lesson) => lesson.coveredSubtopicIds))
const coveredQuestions = new Set(lessons.flatMap((lesson) => lesson.pastPaperRefs))
const nextLessons = {
  ...lessonsRaw,
  counts: {
    lessons: lessons.length,
    coveredSubtopics: coveredSubtopics.size,
    coveredQuestions: coveredQuestions.size,
  },
  lessons,
}
const nextCards = { ...cardsRaw, totalCards: cards.length, cards }
const nextSources = { ...sourcesRaw, sources }

const serializedArtifacts = new Map([
  [lessonPath, `${JSON.stringify(nextLessons, null, 2)}\n`],
  [cardPath, `${JSON.stringify(nextCards, null, 2)}\n`],
  [sourcePath, `${JSON.stringify(nextSources, null, 2)}\n`],
])

const preflightDir = fs.mkdtempSync(path.join(os.tmpdir(), 'im-it-full-coverage-'))
try {
  const preflightPaths = {
    lessons: path.join(preflightDir, 'im-it-lessons.json'),
    cards: path.join(preflightDir, 'im-it-concept-cards.json'),
    sources: path.join(preflightDir, 'im-it-source-registry.json'),
  }
  fs.writeFileSync(preflightPaths.lessons, serializedArtifacts.get(lessonPath))
  fs.writeFileSync(preflightPaths.cards, serializedArtifacts.get(cardPath))
  fs.writeFileSync(preflightPaths.sources, serializedArtifacts.get(sourcePath))
  execFileSync(process.execPath, ['scripts/validate-im-it-full-coverage.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      IM_IT_LESSONS_PATH: preflightPaths.lessons,
      IM_IT_CARDS_PATH: preflightPaths.cards,
      IM_IT_SOURCES_PATH: preflightPaths.sources,
    },
    stdio: 'pipe',
  })
} finally {
  fs.rmSync(preflightDir, { recursive: true, force: true })
}

if (!shouldWrite) {
  process.stdout.write(
    `Ready to merge ${addedLessons.length} lessons, ${addedCards.length} cards, and ${addedSources.length} sources. Use --write.\n`
  )
  process.exit(0)
}

const originalArtifacts = new Map(
  [...serializedArtifacts.keys()].map((artifactPath) => [
    artifactPath,
    fs.readFileSync(artifactPath),
  ])
)
const temporaryPaths = new Map()
try {
  for (const [artifactPath, content] of serializedArtifacts) {
    const temporaryPath = `${artifactPath}.tmp-${process.pid}`
    fs.writeFileSync(temporaryPath, content)
    temporaryPaths.set(artifactPath, temporaryPath)
  }
  for (const [artifactPath, temporaryPath] of temporaryPaths) {
    fs.renameSync(temporaryPath, artifactPath)
  }
} catch (error) {
  for (const [artifactPath, content] of originalArtifacts) fs.writeFileSync(artifactPath, content)
  throw error
} finally {
  for (const temporaryPath of temporaryPaths.values()) {
    if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath)
  }
}
process.stdout.write(
  `Merged IM-IT coverage: ${lessons.length} lessons, ${cards.length} cards, ${coveredSubtopics.size}/61 subtopics.\n`
)
