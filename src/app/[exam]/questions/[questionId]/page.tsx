'use client'

import { notFound, useRouter } from 'next/navigation'
import { use, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getQuestionsByExam } from '@/lib/content'
import { getAnswer } from '@/lib/answers'
import { getUserId } from '@/lib/user-id'
import { QuestionText } from '@/components/question-text'
import type { ExamId } from '@/types/content'
import type { PracticeMode } from '@/types/practice'

const OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const

interface Props {
  params: Promise<{ exam: string; questionId: string }>
  searchParams: Promise<{ mode?: string; next?: string }>
}

export default function DrillPage({ params, searchParams }: Props) {
  const { exam, questionId } = use(params)
  const { mode = 'drill', next } = use(searchParams)
  const router = useRouter()

  const allQuestions = getQuestionsByExam(exam as ExamId)
  const question = allQuestions.find((q) => q.id === questionId)
  if (!question) notFound()

  const answerData = getAnswer(questionId)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function submitResult(result: 'correct' | 'wrong') {
    setSubmitting(true)
    const userId = getUserId()
    await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, questionId, mode: mode as PracticeMode, result }),
    })
    setSubmitting(false)
    if (next) {
      router.push(`/${exam}/questions/${next}?mode=${mode}`)
    } else {
      router.push(`/${exam}/questions`)
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">{question.year}年</Badge>
        <span className="text-xs text-muted-foreground">第 {question.number} 題</span>
        {question.points != null && (
          <Badge variant="secondary">{question.points} 分</Badge>
        )}
      </div>

      <Card>
        <CardContent className="py-4 px-4">
          <QuestionText text={question.text} />
        </CardContent>
      </Card>

      {!revealed && (
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
      )}

      {!revealed && (
        <Button
          disabled={!selected}
          onClick={() => setRevealed(true)}
          className="w-full"
        >
          確認答案
        </Button>
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

      {revealed && !answerData && (
        <p className="text-sm text-muted-foreground text-center">此題尚無解析</p>
      )}

      {revealed && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
            disabled={submitting}
            onClick={() => submitResult('correct')}
          >
            ✓ 會了
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-400 text-red-600 hover:bg-red-50"
            disabled={submitting}
            onClick={() => submitResult('wrong')}
          >
            ✗ 不會
          </Button>
        </div>
      )}
    </div>
  )
}
