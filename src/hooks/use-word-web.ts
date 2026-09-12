'use client'

import { useEffect, useState } from 'react'

export interface WordWebEntry {
  word: string
  chinese: string
  pos?: string
  synonyms?: string[]
  antonyms?: string[]
  relatedWords?: string[]
  confusableWith?: string[]
  exampleSentences?: Array<{ en: string; zh: string }>
  semanticGroup?: string
  mnemonicHint?: string
}

interface WordWebRaw {
  words: Record<string, Omit<WordWebEntry, 'word'>>
}

let cachedMap: Map<string, WordWebEntry> | null = null
let fetchPromise: Promise<Map<string, WordWebEntry> | null> | null = null

function fetchWordWeb(): Promise<Map<string, WordWebEntry> | null> {
  if (cachedMap) return Promise.resolve(cachedMap)
  if (fetchPromise) return fetchPromise
  fetchPromise = fetch('/data/im-english-word-web.json')
    .then((res) => (res.ok ? (res.json() as Promise<WordWebRaw>) : null))
    .then((raw) => {
      if (!raw) return null
      const map = new Map<string, WordWebEntry>()
      for (const [key, value] of Object.entries(raw.words)) {
        map.set(key.toLowerCase(), { word: key, ...value })
      }
      cachedMap = map
      return map
    })
    .catch(() => null)
  return fetchPromise
}

export function useWordWeb() {
  const [data, setData] = useState<Map<string, WordWebEntry> | null>(cachedMap)
  const [loading, setLoading] = useState(!cachedMap)

  useEffect(() => {
    if (cachedMap) {
      setData(cachedMap)
      setLoading(false)
      return
    }
    fetchWordWeb().then((result) => {
      setData(result)
      setLoading(false)
    })
  }, [])

  function getWord(word: string): WordWebEntry | null {
    if (!data) return null
    return data.get(word.toLowerCase()) ?? null
  }

  return { getWord, loading }
}
