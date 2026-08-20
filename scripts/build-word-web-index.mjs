#!/usr/bin/env node
/**
 * Derives the client-facing Word Web artifacts from the curated dataset.
 *
 * public/data/im-english-word-web.json is the source of truth, but it is 580KB —
 * far too much to download just to show one flashcard. This splits it into
 * per-initial shards plus a small index that carries the headword list (so the
 * UI knows which related words can be expanded) and the semantic groups with
 * Chinese labels.
 *
 *   node scripts/build-word-web-index.mjs --write   # regenerate
 *   node scripts/build-word-web-index.mjs --check   # fail if out of date
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = 'public/data/im-english-word-web.json'
const OUT_DIR = 'public/data/word-web'
// Chinese glosses for related words, best source first.
const GLOSS_SOURCES = [
  'public/data/ntu-im-vocab-master.json',
  'public/data/im-english-vocab-v2.json',
]
const LEXICON_SOURCE = 'public/data/im-vocab-lexicon.json'
const MAX_GLOSS_LENGTH = 18

const tokenLabels = JSON.parse(
  fs.readFileSync(path.join(root, 'scripts/lib/semantic-group-tokens.json'), 'utf8')
)

/** ECDICT translations look like `a. 漠不關心的, 無重要性的, 中立的\\n[醫] ...` — keep the first senses. */
export function cleanTranslation(raw) {
  const firstLine = raw.split(/\\n|\n/)[0]
  const withoutTags = firstLine.replace(/\[[^\]]*\]/g, '')
  const withoutPos = withoutTags.replace(/^\s*(?:[a-z]{1,4}\.\s*)+/i, '')
  const senses = withoutPos
    .split(/[,，]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
  return senses.join('；')
}

/** Glosses sit on one status line, so cap them wherever they came from. */
function capGloss(gloss) {
  const trimmed = gloss.trim()
  return trimmed.length > MAX_GLOSS_LENGTH ? `${trimmed.slice(0, MAX_GLOSS_LENGTH - 1)}…` : trimmed
}

function buildGlossary(source) {
  const glossary = new Map()
  const add = (word, gloss) => {
    const key = word?.trim().toLowerCase()
    if (!key || !gloss || glossary.has(key)) return
    glossary.set(key, capGloss(gloss))
  }

  // Word Web headwords are the most accurate, then the curated vocab lists,
  // and finally the imported dictionary.
  for (const [word, entry] of Object.entries(source.words)) add(word, entry.chinese)
  for (const file of GLOSS_SOURCES) {
    const data = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
    for (const entry of data.words ?? []) add(entry.word, entry.chinese)
  }
  const lexicon = JSON.parse(fs.readFileSync(path.join(root, LEXICON_SOURCE), 'utf8'))
  for (const entry of lexicon.entries ?? [])
    add(entry.word, cleanTranslation(entry.translation ?? ''))

  return glossary
}

export function shardKey(word) {
  const initial = word.trim().toLowerCase().slice(0, 1)
  return initial >= 'a' && initial <= 'z' ? initial : '_'
}

export function groupLabel(slug) {
  // `sequence-order` maps to 順序・順序 — collapse tokens that translate the same.
  const parts = slug.split('-').map((token) => tokenLabels[token] ?? token)
  return [...new Set(parts)].join('・')
}

export function buildArtifacts(source) {
  const entries = Object.entries(source.words).sort(([a], [b]) => a.localeCompare(b))
  const glossary = buildGlossary(source)

  const shards = new Map()
  const shardGlosses = new Map()
  const groups = new Map()

  for (const [word, entry] of entries) {
    const key = shardKey(word)
    if (!shards.has(key)) shards.set(key, {})
    shards.get(key)[word] = entry

    // Ship each shard with the glosses its own related words need, so hovering
    // a node never costs another request.
    if (!shardGlosses.has(key)) shardGlosses.set(key, {})
    const related = [
      ...(entry.synonyms ?? []),
      ...(entry.antonyms ?? []),
      ...(entry.relatedWords ?? []),
      ...(entry.confusableWith ?? []),
    ]
    for (const neighbour of related) {
      const gloss = glossary.get(neighbour.trim().toLowerCase())
      if (gloss) shardGlosses.get(key)[neighbour] = gloss
    }

    const slug = entry.semanticGroup
    if (!slug) continue
    if (!groups.has(slug)) groups.set(slug, [])
    groups.get(slug).push(word)
  }

  const index = {
    schemaVersion: 1,
    source: SOURCE,
    words: entries.map(([word]) => word),
    groups: Object.fromEntries(
      [...groups.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([slug, words]) => [slug, { label: groupLabel(slug), words }])
    ),
  }

  const files = { 'index.json': index }
  for (const [key, words] of [...shards.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const glosses = Object.fromEntries(
      Object.entries(shardGlosses.get(key) ?? {}).sort(([a], [b]) => a.localeCompare(b))
    )
    files[`${key}.json`] = { schemaVersion: 1, words, glosses }
  }
  return files
}

function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function main() {
  const mode = process.argv.includes('--write') ? 'write' : 'check'
  const source = JSON.parse(fs.readFileSync(path.join(root, SOURCE), 'utf8'))
  const files = buildArtifacts(source)
  const outDir = path.join(root, OUT_DIR)

  if (mode === 'write') {
    fs.rmSync(outDir, { recursive: true, force: true })
    fs.mkdirSync(outDir, { recursive: true })
    for (const [name, value] of Object.entries(files)) {
      fs.writeFileSync(path.join(outDir, name), serialize(value), 'utf8')
    }
    console.warn(`word-web: wrote ${Object.keys(files).length} files to ${OUT_DIR}`)
    return
  }

  const existing = fs.existsSync(outDir) ? fs.readdirSync(outDir).sort() : []
  const expected = Object.keys(files).sort()
  const problems = []

  if (existing.join(',') !== expected.join(',')) {
    problems.push(`file list differs: expected ${expected.length}, found ${existing.length}`)
  }
  for (const [name, value] of Object.entries(files)) {
    const file = path.join(outDir, name)
    if (!fs.existsSync(file)) {
      problems.push(`missing ${OUT_DIR}/${name}`)
      continue
    }
    if (fs.readFileSync(file, 'utf8') !== serialize(value)) {
      problems.push(`stale ${OUT_DIR}/${name}`)
    }
  }

  if (problems.length > 0) {
    console.error('word-web artifacts are out of date:')
    for (const problem of problems) console.error(`  - ${problem}`)
    console.error('run: npm run generate:word-web')
    process.exit(1)
  }
  console.warn(`word-web: ${expected.length} files up to date`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
}
