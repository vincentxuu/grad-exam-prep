'use client'

import { Check, Plus } from '@sketchyicons/react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAuthHeader, isAuthenticated } from '@/lib/auth'
import { lexiconCardId } from '@/lib/lexicon/normalize'
import { reviewCard as applySrs } from '@/lib/srs'
import { addSavedWordServer } from '@/lib/server-storage'
import { localStorageImpl } from '@/lib/storage'
import { CORRECTION_KIND_LABEL, type Correction, type SessionSummary } from '@/types/chat'

interface Props {
  summary: SessionSummary
  onRestart: () => void
}

function groupByKind(corrections: Correction[]): Map<Correction['kind'], Correction[]> {
  const map = new Map<Correction['kind'], Correction[]>()
  for (const c of corrections) {
    map.set(c.kind, [...(map.get(c.kind) ?? []), c])
  }
  return map
}

/**
 * 對話結束後的總結，也是把對話接回 SRS 的地方。
 *
 * 「記為熟悉」與「加入單字庫」都要使用者自己按。**不自動改排程** ——
 * 靜靜地動別人的複習計畫是會讓人不爽的事。
 */
export function SessionSummaryView({ summary, onRestart }: Props) {
  const [promoted, setPromoted] = useState<string[]>([])
  const [added, setAdded] = useState<string[]>([])

  function promote(headword: string) {
    const cardId = lexiconCardId(headword)
    const existing = localStorageImpl.getSRSCard(cardId)
    if (existing) {
      const updated = applySrs(existing, 2)
      localStorageImpl.updateSRSCard(cardId, updated)
      if (isAuthenticated()) {
        fetch('/api/srs/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ cardId, rating: 2 }),
        }).catch(() => {})
      }
    }
    setPromoted((p) => [...p, headword])
  }

  function addWord(headword: string) {
    const word = {
      headword,
      cardId: lexiconCardId(headword),
      addedAt: Date.now(),
      source: { kind: 'chat' as const },
    }
    localStorageImpl.addSavedWord(word)
    setAdded((a) => [...a, headword])
    if (isAuthenticated()) addSavedWordServer(word).catch(() => {})
  }

  const grouped = groupByKind(summary.corrections)

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold">這場對話的總結</h2>
        <p className="text-sm text-muted-foreground mt-0.5">用出來的字才是真的記住了。</p>
      </div>

      {/* 用出來的字 */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium">
          你用出來的字（{summary.used.length}/{summary.used.length + summary.missed.length}）
        </h3>
        {summary.used.length === 0 ? (
          <p className="text-sm text-muted-foreground">這次一個都沒用到，下次試著把它們講進去。</p>
        ) : (
          <div className="space-y-1.5">
            {summary.used.map((w) => (
              <div key={w} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <span className="font-medium">{w}</span>
                {promoted.includes(w) ? (
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    已記為熟悉
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs ml-auto"
                    onClick={() => promote(w)}
                  >
                    記為熟悉
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 沒用到的 */}
      {summary.missed.length > 0 && (
        <section className="space-y-1.5">
          <h3 className="text-sm font-medium">沒用到的</h3>
          <div className="flex flex-wrap gap-1.5">
            {summary.missed.map((w) => (
              <Badge key={w} variant="outline" className="text-xs">
                {w}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">這些字留在原本的排程裡，下次還會出現。</p>
        </section>
      )}

      {/* 訂正，依類型分組 */}
      {summary.corrections.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-medium">這場的訂正（{summary.corrections.length}）</h3>
          {[...grouped.entries()].map(([kind, items]) => (
            <div key={kind} className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {CORRECTION_KIND_LABEL[kind] ?? kind}（{items.length}）
              </p>
              {items.map((c) => (
                <p key={`${c.original}-${c.corrected}`} className="text-sm pl-3">
                  <span className="line-through text-muted-foreground">{c.original}</span>
                  {' → '}
                  <span className="font-medium">{c.corrected}</span>
                </p>
              ))}
            </div>
          ))}
        </section>
      )}

      {/* AI 帶出來的新字 */}
      {summary.newWords.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-medium">對話裡出現、你還沒收藏的字</h3>
          <div className="flex flex-wrap gap-1.5">
            {summary.newWords.map((w) =>
              added.includes(w) ? (
                <Badge key={w} variant="secondary" className="gap-1 text-xs">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  {w}
                </Badge>
              ) : (
                <Button
                  key={w}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => addWord(w)}
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  {w}
                </Button>
              )
            )}
          </div>
        </section>
      )}

      <Button onClick={onRestart}>再練一場</Button>
    </div>
  )
}
