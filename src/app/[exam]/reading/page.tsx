'use client'

import { X } from '@sketchyicons/react'
import { notFound } from 'next/navigation'
import { Suspense, use, useCallback, useEffect, useState } from 'react'
import { LookupPanel } from '@/components/lexicon/lookup-panel'
import { TappableLegend, TappableText, type WordMark } from '@/components/lexicon/tappable-text'
import { PageLoading } from '@/components/page-loading'
import { Button } from '@/components/ui/button'
import { EXAM_LABELS, getSubjectsByExam } from '@/lib/content'
import { buildWordMarks } from '@/lib/reading/word-marks'
import { localStorageImpl } from '@/lib/storage'
import type { ExamId } from '@/types/content'
import type { PersonaProfile } from '@/types/lexicon'

interface Props {
  params: Promise<{ exam: string }>
}

/**
 * 文章草稿另外存一把 key，不進 StorageState —— 那顆物件會整包同步到
 * D1，塞一整篇論文進去會把 /api/sync 的 payload 撐爆。
 */
const DRAFT_KEY = 'grad-exam-prep-reading-draft'

export default function ReadingPage(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ReadingContent {...props} />
    </Suspense>
  )
}

function ReadingContent({ params }: Props) {
  const { exam } = use(params)
  const subjects = getSubjectsByExam(exam as ExamId)
  if (!subjects.length) notFound()

  const [passage, setPassage] = useState('')
  const [editing, setEditing] = useState(true)
  const [selected, setSelected] = useState<{ term: string; sentence: string } | null>(null)
  const [persona, setPersona] = useState<PersonaProfile | undefined>()
  const [mark, setMark] = useState<(word: string) => WordMark>(() => () => null)

  // setState 的更新函式形式：回傳的才是要存的值，所以外面要多包一層
  const refreshMarks = useCallback(() => {
    const fn = buildWordMarks()
    setMark(() => fn)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY) ?? ''
    setPassage(saved)
    setEditing(!saved)
    setPersona(localStorageImpl.getState().preferences.persona)
    refreshMarks()
  }, [refreshMarks])

  function savePassage(text: string) {
    setPassage(text)
    try {
      localStorage.setItem(DRAFT_KEY, text)
    } catch {
      // 超過配額就算了，草稿不是關鍵資料
    }
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold font-display">{EXAM_LABELS[exam as ExamId]} — 輔助閱讀</h1>
        <p className="text-muted-foreground text-sm mt-1">
          貼上一段文章或論文，每個字都可以點來查詞。查過的字可以直接加進複習排程。
        </p>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={passage}
            onChange={(e) => savePassage(e.target.value)}
            placeholder="貼上英文文章、論文段落…"
            className="w-full min-h-64 rounded-md border bg-background p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" disabled={!passage.trim()} onClick={() => setEditing(false)}>
              開始閱讀
            </Button>
            {passage && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => savePassage('')}
              >
                清空
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_380px] items-start">
          {/* 文章本體 */}
          <div className="space-y-3 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <TappableLegend />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs shrink-0"
                onClick={() => setEditing(true)}
              >
                編輯文章
              </Button>
            </div>

            <div className="rounded-lg border p-4 text-sm leading-loose whitespace-pre-wrap break-words">
              <TappableText
                text={passage}
                onSelect={(term, sentence) => setSelected({ term, sentence })}
                mark={mark}
                activeTerm={selected?.term}
              />
            </div>
          </div>

          {/* 查詞側欄：桌機貼右側，手機變成底部抽屜 */}
          {selected && (
            <>
              <div className="hidden lg:block sticky top-20 rounded-lg border p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <PanelHeader onClose={() => setSelected(null)} />
                <LookupPanel
                  key={selected.term}
                  term={selected.term}
                  persona={persona}
                  showInput={false}
                  source={{ kind: 'reading', sentence: selected.sentence }}
                  onSaveChange={refreshMarks}
                />
              </div>

              <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-xl border-t bg-background p-4 shadow-lg">
                <PanelHeader onClose={() => setSelected(null)} />
                <LookupPanel
                  key={selected.term}
                  term={selected.term}
                  persona={persona}
                  showInput={false}
                  source={{ kind: 'reading', sentence: selected.sentence }}
                  onSaveChange={refreshMarks}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-end mb-2">
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose} aria-label="關閉">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
