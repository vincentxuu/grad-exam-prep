'use client'

import { notFound } from 'next/navigation'
import { Suspense, use, useEffect, useState } from 'react'
import { LookupPanel } from '@/components/lexicon/lookup-panel'
import { PersonaForm } from '@/components/lexicon/persona-form'
import { PageLoading } from '@/components/page-loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EXAM_LABELS, getSubjectsByExam } from '@/lib/content'
import { fromSavedWord } from '@/lib/review-card'
import { daysUntilDue } from '@/lib/srs'
import { localStorageImpl } from '@/lib/storage'
import { useFlashcardStore } from '@/store/flashcard'
import type { ExamId } from '@/types/content'
import type { PersonaProfile } from '@/types/lexicon'
import type { SavedWord } from '@/types/storage'

interface Props {
  params: Promise<{ exam: string }>
}

const SOURCE_LABEL: Record<string, string> = {
  reading: '閱讀',
  question: '題庫',
  book: '書籍',
  course: '課程',
  chat: '對話',
  manual: '手動',
}

export default function LookupPage(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <LookupContent {...props} />
    </Suspense>
  )
}

function LookupContent({ params }: Props) {
  const { exam } = use(params)
  const subjects = getSubjectsByExam(exam as ExamId)
  if (!subjects.length) notFound()

  const [persona, setPersona] = useState<PersonaProfile | undefined>()
  const [savedWords, setSavedWords] = useState<SavedWord[]>([])
  const [showPersona, setShowPersona] = useState(false)
  const { getCardState } = useFlashcardStore()

  // localStorage 只能在 client 讀
  useEffect(() => {
    setPersona(localStorageImpl.getState().preferences.persona)
    setSavedWords(localStorageImpl.getSavedWords())
  }, [])

  function updatePersona(next: PersonaProfile) {
    localStorageImpl.setPreferences({ persona: next })
    setPersona(next)
  }

  function remove(headword: string) {
    localStorageImpl.removeSavedWord(headword)
    setSavedWords(localStorageImpl.getSavedWords())
  }

  const personaFilled = !!persona && (persona.work.trim() !== '' || persona.interests.length > 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 查詞</h1>
        <p className="text-muted-foreground text-sm mt-1">
          單字與片語都查得到。查過的字可加入單字庫，進入閃卡的複習排程。
        </p>
      </div>

      <LookupPanel persona={persona} source={{ kind: 'manual' }} />

      {/* 個人化設定 */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => setShowPersona((v) => !v)}
        >
          {showPersona ? '收起' : '個人化情境設定'}
          {!personaFilled && !showPersona && (
            <span className="ml-1 text-amber-600">（尚未設定）</span>
          )}
        </Button>
        {showPersona && (
          <div className="mt-2">
            <PersonaForm persona={persona} onChange={updatePersona} />
          </div>
        )}
      </div>

      {/* 我的單字庫 */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium">
          我的單字庫
          {savedWords.length > 0 && (
            <span className="text-muted-foreground font-normal">（{savedWords.length}）</span>
          )}
        </h2>

        {savedWords.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            還沒有收藏的字。查一個字之後按「加入單字庫」。
          </p>
        ) : (
          <div className="space-y-1.5">
            {savedWords
              .slice()
              .sort((a, b) => b.addedAt - a.addedAt)
              .map((w) => {
                const days = daysUntilDue(getCardState(fromSavedWord(w).id))
                return (
                  <div
                    key={w.headword}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="font-medium truncate">{w.headword}</span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {SOURCE_LABEL[w.source.kind] ?? w.source.kind}
                    </Badge>
                    {days === 0 ? (
                      <Badge className="text-xs shrink-0">到期</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground shrink-0">{days}天後</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground ml-auto shrink-0"
                      onClick={() => remove(w.headword)}
                    >
                      移除
                    </Button>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
