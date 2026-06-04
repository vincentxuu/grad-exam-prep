'use client'

import { notFound } from 'next/navigation'
import { use, useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { QuestionText } from '@/components/question-text'
import { EXAM_LABELS, getQuestionsByExam } from '@/lib/content'
import { getAnswer } from '@/lib/answers'
import { getUserId } from '@/lib/user-id'
import type { ExamId } from '@/types/content'

const OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const

interface Props {
  params: Promise<{ exam: string }>
}

export default function ReviewPage({ params }: Props) {
  const { exam } = use(params)
  const allQuestions = getQuestionsByExam(exam as ExamId)
  if (!allQuestions.length) notFound()

  const [wrongIds, setWrongIds] = useState<string[] | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const userId = getUserId()
    if (!userId) { setWrongIds([]); return }
    fetch(`/api/practice/review?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => setWrongIds((data as { questionIds: string[] }).questionIds))
      .catch(() => setWrongIds([]))
  }, [])

  if (wrongIds === null) {
    return <p className="text-sm text-muted-foreground">載入中…</p>
  }

  const reviewQuestions = allQuestions.filter((q) => wrongIds.includes(q.id))

  if (reviewQuestions.length === 0) {
    return (
      <div className="space-y-2 max-w-lg">
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 錯題本</h1>
        <p className="text-muted-foreground text-sm">目前沒有錯題，繼續加油！</p>
      </div>
    )
  }

  if (currentIdx >= reviewQuestions.length) {
    return (
      <div className="space-y-2 max-w-lg">
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 錯題本</h1>
        <p className="text-sm">本輪 {reviewQuestions.length} 題複習完畢！</p>
        <Button onClick={() => { setCurrentIdx(0); setRevealed(false); setSelected(null) }}>
          再來一輪
        </Button>
      </div>
    )
  }

  const q = reviewQuestions[currentIdx]
  const answerData = getAnswer(q.id)

  async function submitResult(result: 'correct' | 'wrong') {
    setSubmitting(true)
    const userId = getUserId()
    await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, questionId: q.id, mode: 'review', result }),
    })
    setSubmitting(false)
    setCurrentIdx((i) => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 錯題本</h1>
        <span className="text-sm text-muted-foreground">
          {currentIdx + 1} / {reviewQuestions.length}
        </span>
      </div>

      <Card>
        <CardContent className="py-4 px-4 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{q.year}年</Badge>
            <span className="text-xs text-muted-foreground">第 {q.number} 題</span>
          </div>
          <QuestionText text={q.text} />
        </CardContent>
      </Card>

      {!revealed && (
        <>
          <div className="flex flex-wrap gap-2">
            {OPTIONS.map((opt) => (
              <Button
                key={opt}
                variant={selected === opt ? 'default' : 'outline'}
                className="w-12 h-12 text-base font-bold"
                onClick={() => setSelected(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
          <Button disabled={!selected} onClick={() => setRevealed(true)} className="w-full">
            確認答案
          </Button>
        </>
      )}

      {revealed && answerData && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="py-4 px-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-700 dark:text-green-400">
                正確答案：{answerData.answer}
              </span>
              {selected && (
                <Badge variant={selected === answerData.answer ? 'default' : 'destructive'}>
                  你選了 {selected}
                </Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{answerData.explanation}</p>
          </CardContent>
        </Card>
      )}

      {revealed && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
            disabled={submitting}
            onClick={() => submitResult('correct')}
          >
            ✓ 會了（移出錯題本）
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-400 text-red-600 hover:bg-red-50"
            disabled={submitting}
            onClick={() => submitResult('wrong')}
          >
            ✗ 還不會
          </Button>
        </div>
      )}
    </div>
  )
}
