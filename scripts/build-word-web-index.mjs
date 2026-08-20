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

const tokenLabels = JSON.parse(
  fs.readFileSync(path.join(root, 'scripts/lib/semantic-group-tokens.json'), 'utf8')
)

export function shardKey(word) {
  const initial = word.trim().toLowerCase().slice(0, 1)
  return initial >= 'a' && initial <= 'z' ? initial : '_'
}

export function groupLabel(slug) {
  return slug
    .split('-')
    .map((token) => tokenLabels[token] ?? token)
    .join('・')
}

export function buildArtifacts(source) {
  const entries = Object.entries(source.words).sort(([a], [b]) => a.localeCompare(b))

  const shards = new Map()
  const groups = new Map()

  for (const [word, entry] of entries) {
    const key = shardKey(word)
    if (!shards.has(key)) shards.set(key, {})
    shards.get(key)[word] = entry

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
    files[`${key}.json`] = { schemaVersion: 1, words }
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
