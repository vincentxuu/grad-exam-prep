'use client'

import { useMemo, useState } from 'react'
import { WordWebPanel } from '@/components/flashcard/word-web-panel'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useSpeech } from '@/hooks/use-speech'
import { useWordWeb } from '@/hooks/use-word-web'

interface Props {
  /** Shown in the page heading, e.g. 資管所. */
  examLabel: string
}

/**
 * Browses the Word Web by semantic group — the curated `semanticGroup` slugs
 * turned into a themed vocabulary index.
 */
export function SemanticGroupBrowser({ examLabel }: Props) {
  const { groups, loading } = useWordWeb()
  const { speak } = useSpeech()
  const [query, setQuery] = useState('')
  const [showSingletons, setShowSingletons] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const entries = useMemo(() => {
    const all = Object.entries(groups ?? {}).map(([slug, group]) => ({ slug, ...group }))
    const keyword = query.trim().toLowerCase()
    return all
      .filter((group) => showSingletons || group.words.length > 1)
      .filter(
        (group) =>
          keyword === '' ||
          group.label.includes(keyword) ||
          group.slug.includes(keyword) ||
          group.words.some((word) => word.toLowerCase().includes(keyword))
      )
      .sort((a, b) => b.words.length - a.words.length || a.label.localeCompare(b.label))
  }, [groups, query, showSingletons])

  const wordCount = entries.reduce((sum, group) => sum + group.words.length, 0)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-display">{examLabel} — 語義群</h1>
        <p className="text-muted-foreground text-sm mt-1">
          同一個主題的單字放在一起記，比單字表有效率。點任一個字看它的語義網絡。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋主題或單字，例如「情緒」或 mitigate"
          className="h-9 max-w-xs"
          aria-label="搜尋語義群"
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-xs text-muted-foreground"
          onClick={() => setShowSingletons((v) => !v)}
          aria-pressed={showSingletons}
        >
          {showSingletons ? '只看多字主題' : '包含單字主題'}
        </Button>
        <span className="text-xs text-muted-foreground ml-auto">
          {entries.length} 個主題．{wordCount} 個單字
        </span>
      </div>

      {loading && <p className="text-sm text-muted-foreground">載入中…</p>}

      {!loading && entries.length === 0 && (
        <p className="text-sm text-muted-foreground">找不到符合的主題。</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map((group) => (
          <div key={group.slug} className="rounded-lg border bg-card p-3 space-y-2">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-medium">{group.label}</h2>
              <span className="text-[10px] text-muted-foreground">{group.slug}</span>
              <span className="text-xs text-muted-foreground ml-auto">{group.words.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.words.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => setSelected(word)}
                  className="rounded-full border px-2 py-0.5 text-xs font-medium hover:bg-muted"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected}</DialogTitle>
            <DialogDescription>點「＋」可以往下一個字展開，點單字可以朗讀。</DialogDescription>
          </DialogHeader>
          {selected && <WordWebPanel word={selected} idPrefix="group-browse" speak={speak} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
