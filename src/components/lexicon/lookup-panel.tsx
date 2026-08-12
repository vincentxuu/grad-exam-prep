'use client'

import { Loader2, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { EntryCard } from '@/components/lexicon/entry-card'
import { PersonalBridge } from '@/components/lexicon/personal-bridge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSpeech } from '@/hooks/use-speech'
import { lexiconCardId } from '@/lib/lexicon/normalize'
import { localStorageImpl } from '@/lib/storage'
import type { LookupResponse, PersonaProfile } from '@/types/lexicon'
import type { WordSource } from '@/types/storage'

interface Props {
  /** 外部帶入的查詢字（點閱讀模式或題庫的某個字時） */
  term?: string
  persona?: PersonaProfile
  /** 存下來時記錄的出處 */
  source?: WordSource
  /** 是否顯示搜尋輸入框。嵌在側欄時通常關掉 */
  showInput?: boolean
  /** 收藏狀態變動時通知外層（閱讀模式要據此重畫底線標記） */
  onSaveChange?: () => void
}

type State =
  | { status: 'idle' }
  | { status: 'loading'; stage: 'cache' | 'generate' }
  | { status: 'done'; data: LookupResponse }
  | { status: 'error'; message: string }

export function LookupPanel({ term, persona, source, showInput = true, onSaveChange }: Props) {
  const [query, setQuery] = useState(term ?? '')
  const [state, setState] = useState<State>({ status: 'idle' })
  const [savedWords, setSavedWords] = useState<string[]>([])
  const { speak, speakingId } = useSpeech()

  useEffect(() => {
    setSavedWords(localStorageImpl.getSavedWords().map((w) => w.headword))
  }, [])

  const lookup = useCallback(
    async (raw: string, forceGenerate = false) => {
      const q = raw.trim()
      if (!q) return

      // 先探快取 —— 命中就免費，也快得多。
      // 有 persona 時跳過：個人化那一層只有 POST 生得出來，先探一次只是
      // 多一趟白跑的 round trip（POST 本來就會回快取裡的詞條，不會多花錢）。
      if (!forceGenerate && !persona) {
        setState({ status: 'loading', stage: 'cache' })
        try {
          const res = await fetch(`/api/lexicon?q=${encodeURIComponent(q)}`)
          if (res.ok) {
            setState({ status: 'done', data: (await res.json()) as LookupResponse })
            return
          }
        } catch {
          // 探測失敗就直接走生成，不用打斷使用者
        }
      }

      setState({ status: 'loading', stage: 'generate' })
      try {
        const res = await fetch('/api/lexicon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ term: q, persona }),
        })
        const body = (await res.json()) as Partial<LookupResponse> & { error?: string }

        if (!res.ok) {
          setState({ status: 'error', message: body.error ?? '查詢失敗' })
          return
        }
        setState({ status: 'done', data: body as LookupResponse })
      } catch {
        setState({ status: 'error', message: '網路連線失敗，稍後再試。' })
      }
    },
    [persona]
  )

  // 外部帶入查詢字時自動查
  useEffect(() => {
    if (term) {
      setQuery(term)
      lookup(term)
    }
  }, [term, lookup])

  function save(headword: string) {
    localStorageImpl.addSavedWord({
      headword,
      cardId: lexiconCardId(headword),
      addedAt: Date.now(),
      source: source ?? { kind: 'manual' },
    })
    setSavedWords((prev) => [...prev, headword])
    onSaveChange?.()
  }

  function unsave(headword: string) {
    localStorageImpl.removeSavedWord(headword)
    setSavedWords((prev) => prev.filter((h) => h !== headword))
    onSaveChange?.()
  }

  return (
    <div className="space-y-4">
      {showInput && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            lookup(query)
          }}
          className="flex gap-2"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="輸入單字或片語，例如 intercept、take into account"
            className="text-sm"
          />
          <Button type="submit" size="sm" disabled={state.status === 'loading'}>
            {state.status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </form>
      )}

      {state.status === 'loading' && (
        <div className="space-y-2 animate-pulse">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-4/5 rounded bg-muted" />
          <p className="text-xs text-muted-foreground pt-1">
            {state.stage === 'cache' ? '查詢中…' : '第一次查這個字，生成中（約十幾秒）…'}
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 space-y-2">
          <p className="text-sm">{state.message}</p>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => lookup(query)}>
            重試
          </Button>
        </div>
      )}

      {state.status === 'done' && (
        <div className="space-y-4">
          <EntryCard entry={state.data.entry} speak={speak} speakingId={speakingId} />

          {state.data.personal && (
            <PersonalBridge bridge={state.data.personal} speak={speak} speakingId={speakingId} />
          )}

          <div className="flex items-center gap-2 flex-wrap border-t pt-3">
            {savedWords.includes(state.data.entry.headword) ? (
              <>
                <span className="text-xs text-muted-foreground">✓ 已在單字庫</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => unsave(state.data.entry.headword)}
                >
                  移除
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => save(state.data.entry.headword)}
              >
                加入單字庫
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground ml-auto"
              onClick={() => lookup(state.data.entry.headword, true)}
              title="重新生成會計入每日額度"
            >
              重新生成
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            AI 生成內容，可能有誤。
            {state.data.quota && `　今日已用 ${state.data.quota.used}/${state.data.quota.limit}`}
          </p>
        </div>
      )}
    </div>
  )
}
