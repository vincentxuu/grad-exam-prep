'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { QuestionText } from '@/components/question-text'
import { getAnswer } from '@/lib/answers'
import { getUserId } from '@/lib/user-id'
import { parseQuestion } from '@/lib/question-parser'
import type { Question } from '@/types/content'
import type { PracticeMode } from '@/types/practice'

interface Props {
  exam: string
  passage: string
  questions: Question[]
  parentNumber: number
  mode: string
  nextQuestionId?: string
}

function getQuestionStem(question: Question, parentNumber: number): string {
  const parsed = parseQuestion(question.text)
  if (question.number !== parentNumber) return parsed.stem

  const lines = parsed.stem.split('\n')
  const qLineIdx = lines.findIndex((l) =>
    new RegExp(`^\\s*${parentNumber}\\.\\s`).test(l),
  )
  if (qLineIdx >= 0) {
    return lines.slice(qLineIdx).join('\n').trim()
  }
  return ''
}

export function QuestionGroupView({
  exam,
  passage,
  questions,
  parentNumber,
  mode,
  nextQuestionId,
}: Props) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const answeredCount = Object.keys(answers).length

  function selectAnswer(questionId: string, option: string) {
    if (revealed) return
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  async function handleConfirm() {
    setRevealed(true)
    setSubmitting(true)
    const userId = getUserId()
    await Promise.all(
      questions.map((q) => {
        const answerData = getAnswer(q.id)
        const selected = answers[q.id]
        const result =
          selected && answerData && selected === answerData.answer.toLowerCase()
            ? 'correct'
            : 'wrong'
        return fetch('/api/practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            questionId: q.id,
            mode: mode as PracticeMode,
            result,
          }),
        })
      }),
    )
    setSubmitting(false)
  }

  function handleNext() {
    if (nextQuestionId) {
      router.push(`/${exam}/questions/${nextQuestionId}?mode=${mode}`)
    } else {
      router.push(`/${exam}/questions`)
    }
  }

  const correctCount = questions.filter((q) => {
    const answerData = getAnswer(q.id)
    return (
      answers[q.id] &&
      answerData &&
      answers[q.id] === answerData.answer.toLowerCase()
    )
  }).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">{questions[0].year}年</Badge>
        <span className="text-xs text-muted-foreground">
          第 {questions[0].number}–{questions[questions.length - 1].number} 題
        </span>
        <Badge variant="secondary">{questions.length} 題</Badge>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-xs text-muted-foreground h-7"
          onClick={() => router.push(`/${exam}/questions`)}
        >
          ← 返回題庫
        </Button>
      </div>

      {/* Split pane: passage left, questions right (desktop) */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Passage panel */}
        <div className="lg:w-1/2 lg:min-w-0">
          <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            {/* Mobile: collapsible */}
            <details className="lg:hidden" open>
              <summary className="text-xs font-medium text-muted-foreground cursor-pointer py-2">
                閱讀文章 (點擊收合)
              </summary>
              <Card className="border-dashed bg-muted/30">
                <CardContent className="py-4 px-5">
                  <QuestionText text={passage} />
                </CardContent>
              </Card>
            </details>
            {/* Desktop: always visible */}
            <Card className="border-dashed bg-muted/30 hidden lg:block">
              <CardContent className="py-4 px-5 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  閱讀文章
                </p>
                <QuestionText text={passage} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Questions panel */}
        <div className="lg:w-1/2 lg:min-w-0 space-y-3">
          {questions.map((q) => {
            const parsed = parseQuestion(q.text)
            const answerData = getAnswer(q.id)
            const selected = answers[q.id]
            const isCorrect =
              selected &&
              answerData &&
              selected === answerData.answer.toLowerCase()
            const stem = getQuestionStem(q, parentNumber)

            return (
              <Card
                key={q.id}
                className={
                  revealed
                    ? isCorrect
                      ? 'border-[hsl(var(--success))]'
                      : 'border-destructive'
                    : selected
                      ? 'border-primary'
                      : ''
                }
              >
                <CardContent className="py-3 px-4 space-y-2">
                  {/* Question header */}
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-bold text-muted-foreground shrink-0">
                      {q.number}.
                    </span>
                    {stem ? (
                      <QuestionText text={stem} className="flex-1 min-w-0" />
                    ) : (
                      <span className="text-sm text-muted-foreground flex-1">
                        ___
                      </span>
                    )}
                    {revealed && (
                      <span
                        className={`text-xs font-medium shrink-0 ${isCorrect ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}
                      >
                        {isCorrect ? '✓' : '✗'}
                        {!isCorrect && answerData && (
                          <span className="ml-1 uppercase">
                            正解 {answerData.answer}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  {parsed.options ? (
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {parsed.options.map((opt) => {
                        const isSelected = selected === opt.label
                        const isAnswer =
                          opt.label === answerData?.answer.toLowerCase()
                        let className =
                          'px-3 py-1.5 text-xs rounded-md border transition-colors text-left '
                        if (revealed) {
                          if (isSelected && isAnswer)
                            className +=
                              'bg-[hsl(var(--success))] text-white border-[hsl(var(--success))]'
                          else if (isSelected)
                            className +=
                              'bg-destructive text-destructive-foreground border-destructive'
                          else if (isAnswer)
                            className +=
                              'border-[hsl(var(--success))] text-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)]'
                          else className += 'opacity-50'
                        } else if (isSelected) {
                          className += 'border-primary bg-primary/10 text-primary'
                        } else {
                          className += 'hover:bg-muted/50'
                        }
                        return (
                          <button
                            key={opt.label}
                            disabled={revealed}
                            onClick={() => selectAnswer(q.id, opt.label)}
                            className={className}
                          >
                            <span className="font-medium uppercase mr-1">
                              {opt.label}.
                            </span>
                            {opt.text}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex gap-1.5 pl-5">
                      {['a', 'b', 'c', 'd', 'e'].map((opt) => {
                        const isSelected = selected === opt
                        const isAnswer =
                          opt === answerData?.answer.toLowerCase()
                        let className =
                          'w-9 h-9 text-xs font-bold uppercase rounded-md border transition-colors '
                        if (revealed) {
                          if (isSelected && isAnswer)
                            className +=
                              'bg-[hsl(var(--success))] text-white border-[hsl(var(--success))]'
                          else if (isSelected)
                            className +=
                              'bg-destructive text-destructive-foreground border-destructive'
                          else if (isAnswer)
                            className +=
                              'border-[hsl(var(--success))] text-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)]'
                          else className += 'opacity-50'
                        } else if (isSelected) {
                          className += 'border-primary bg-primary/10 text-primary'
                        } else {
                          className += 'hover:bg-muted/50'
                        }
                        return (
                          <button
                            key={opt}
                            disabled={revealed}
                            onClick={() => selectAnswer(q.id, opt)}
                            className={className}
                          >
                            {opt.toUpperCase()}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Explanation (after reveal) */}
                  {revealed && answerData?.explanation && (
                    <>
                      <Separator />
                      <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                        {answerData.explanation}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {/* Confirm / Results */}
          {!revealed ? (
            <Button
              disabled={answeredCount < questions.length}
              onClick={handleConfirm}
              className="w-full"
              size="lg"
            >
              確認答案 ({answeredCount}/{questions.length})
            </Button>
          ) : (
            <div className="space-y-3">
              <Card>
                <CardContent className="py-3 px-4 text-center">
                  <p className="text-base font-semibold">
                    答對 {correctCount}/{questions.length} 題
                  </p>
                </CardContent>
              </Card>
              <Button
                onClick={handleNext}
                className="w-full"
                size="lg"
                disabled={submitting}
              >
                {nextQuestionId ? '下一組 →' : '返回題庫'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
