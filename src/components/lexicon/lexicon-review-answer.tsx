'use client'

import { useEffect, useState } from 'react'
import { EntryCard } from '@/components/lexicon/entry-card'
import type { LexiconEntry, LookupResponse } from '@/types/lexicon'

/**
 * 一次複習裡同一個字可能被翻到好幾次，快取在模組層避免重複打 API。
 * 這支只打 GET（唯讀快取），不會產生費用，但少一趟往返還是比較順。
 */
const cache = new Map<string, LexiconEntry>()

interface Props {
  headword: string
  speak: (text: string, id?: string) => void
  speakingId: string | null
}

/** 複習模式裡 lexicon 卡的答案面：去 API 取詞條再用 EntryCard 呈現。 */
export function LexiconReviewAnswer({ headword, speak, speakingId }: Props) {
  const [entry, setEntry] = useState<LexiconEntry | null>(() => cache.get(headword) ?? null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const cached = cache.get(headword)
    if (cached) {
      setEntry(cached)
      return
    }

    let alive = true
    setFailed(false)
    fetch(`/api/lexicon?q=${encodeURIComponent(headword)}`)
      .then((res) => (res.ok ? (res.json() as Promise<LookupResponse>) : null))
      .then((data) => {
        if (!alive) return
        if (data?.entry) {
          cache.set(headword, data.entry)
          setEntry(data.entry)
        } else {
          setFailed(true)
        }
      })
      .catch(() => {
        if (alive) setFailed(true)
      })

    return () => {
      alive = false
    }
  }, [headword])

  if (entry) return <EntryCard entry={entry} speak={speak} speakingId={speakingId} />

  if (failed) {
    return (
      <p className="text-sm text-muted-foreground">
        詞條讀取失敗。到查詞頁重新查一次 <span className="font-medium">{headword}</span>{' '}
        就會補回來。
      </p>
    )
  }

  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-5 w-28 rounded bg-muted" />
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-4/5 rounded bg-muted" />
    </div>
  )
}
