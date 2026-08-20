'use client'

import { useEffect, useMemo, useState } from 'react'

export interface WordWebEntry {
  word: string
  chinese: string
  pos?: string
  synonyms?: string[]
  antonyms?: string[]
  relatedWords?: string[]
  confusableWith?: string[]
  exampleSentences?: Array<{ en: string; zh: string; source?: string }>
  semanticGroup?: string
  mnemonicHint?: string
}

export interface WordWebGroupInfo {
  slug: string
  label: string
  words: string[]
}

interface WordWebIndex {
  words: string[]
  groups: Record<string, { label: string; words: string[] }>
}

type ShardEntries = Record<string, Omit<WordWebEntry, 'word'>>

interface Shard {
  words: ShardEntries
  /** Chinese glosses for this shard's related words, so hovering costs no request. */
  glosses?: Record<string, string>
}

const BASE = '/data/word-web'

// Module-level caches: the index is tiny and shared, and each shard is fetched
// at most once per session no matter how many cards ask for it.
let indexData: WordWebIndex | null = null
let indexWords: Set<string> | null = null
let indexPromise: Promise<void> | null = null
const shards = new Map<string, ShardEntries>()
const shardPromises = new Map<string, Promise<void>>()
const glossary = new Map<string, string>()

export function wordWebShardKey(word: string): string {
  const initial = word.trim().toLowerCase().slice(0, 1)
  return initial >= 'a' && initial <= 'z' ? initial : '_'
}

function loadIndex(): Promise<void> {
  if (indexData) return Promise.resolve()
  if (!indexPromise) {
    indexPromise = fetch(`${BASE}/index.json`)
      .then((res) => (res.ok ? (res.json() as Promise<WordWebIndex>) : null))
      .then((raw) => {
        if (!raw) return
        indexData = raw
        indexWords = new Set(raw.words)
      })
      .catch(() => undefined)
  }
  return indexPromise
}

function loadShard(key: string): Promise<void> {
  if (shards.has(key)) return Promise.resolve()
  let pending = shardPromises.get(key)
  if (!pending) {
    pending = fetch(`${BASE}/${key}.json`)
      .then((res) => (res.ok ? (res.json() as Promise<Shard>) : null))
      .then((raw) => {
        shards.set(key, raw?.words ?? {})
        for (const [word, gloss] of Object.entries(raw?.glosses ?? {})) {
          glossary.set(word.toLowerCase(), gloss)
        }
      })
      .catch(() => {
        shards.set(key, {})
      })
    shardPromises.set(key, pending)
  }
  return pending
}

function lookup(word: string): WordWebEntry | null {
  const key = word.toLowerCase()
  const entry = shards.get(wordWebShardKey(key))?.[key]
  return entry ? { word: key, ...entry } : null
}

/**
 * Loads the Word Web data for one headword. Only the index plus the shard for
 * that initial are fetched, so a card costs ~15KB instead of the whole 580KB set.
 */
export function useWordWeb(word?: string | null) {
  const [version, setVersion] = useState(0)
  const shardKey = word ? wordWebShardKey(word) : null
  const ready = indexWords !== null && (shardKey === null || shards.has(shardKey))

  useEffect(() => {
    if (indexWords !== null && (shardKey === null || shards.has(shardKey))) return
    let cancelled = false
    const jobs = [loadIndex()]
    if (shardKey) jobs.push(loadShard(shardKey))
    Promise.all(jobs).then(() => {
      if (!cancelled) setVersion((v) => v + 1)
    })
    return () => {
      cancelled = true
    }
  }, [shardKey])

  // Memoised so the returned entry keeps a stable identity across renders —
  // callers put it in effect dependency lists.
  const entry = useMemo(() => (word && ready ? lookup(word) : null), [word, ready, version])

  return {
    entry,
    loading: !ready,
    /** Chinese for a related word, when any of the vocabulary sources knows it. */
    getGloss: (candidate: string) => glossary.get(candidate.toLowerCase()),
    /** Every semantic group in the index, for the browse page. */
    groups: indexData?.groups ?? null,
    /** True when the word is itself a headword, i.e. the map can expand into it. */
    hasWord: (candidate: string) => indexWords?.has(candidate.toLowerCase()) ?? false,
    getGroup: (slug?: string): WordWebGroupInfo | null => {
      if (!slug) return null
      const group = indexData?.groups[slug]
      return group ? { slug, label: group.label, words: group.words } : null
    },
  }
}
