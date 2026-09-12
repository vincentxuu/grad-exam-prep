'use client'

import { ArrowLeft, ArrowRight, Check, Timer, TriangleAlert, X } from '@sketchyicons/react'
import { notFound } from 'next/navigation'
import { Suspense, use, useCallback, useEffect, useState } from 'react'
import { PageLoading } from '@/components/page-loading'
import { QuestionText } from '@/components/question-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useQueryState } from '@/hooks/use-query-state'
import { getAnswer } from '@/lib/answers'
import {
  EXAM_LABELS,
  getPaperContentIssue,
  getQuestionsByExam,
  getReliableQuestions,
  getSubjectsByExam,
} from '@/lib/content'
import { getFullMockQuestions } from '@/lib/question-practice-policy'
import { getUserId } from '@/lib/user-id'
import type { ExamId, Question } from '@/types/content'

type Phase = 'setup' | 'exam' | 'result'
const OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const

interface Props {
  params: Promise<{ exam: string }>
}

export default function MockExamPage(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <MockExamContent {...props} />
    </Suspense>
  )
}

function MockExamContent({ params }: Props) {
  const { exam } = use(params)
  const subjects = getSubjectsByExam(exam as ExamId)
  if (!subjects.length) notFound()

  const allQuestions = getQuestionsByExam(exam as ExamId)
  // 模擬考會算分，內容不可信的卷子不能進來 —— 練到錯的選項比沒練更糟
  const reliableQuestions = getReliableQuestions(allQuestions)
  const examQuestions = getFullMockQuestions(reliableQuestions)
  const years = [...new Set(allQuestions.map((q) => q.year))].sort((a, b) => b - a)

  const [phase, setPhase] = useState<Phase>('setup')
  const [selectedSubject, setSelectedSubject] = useQueryState('subject', subjects[0].id)
  const [selectedYearStr, setSelectedYearStr] = useQueryState('year', String(years[0]))
  const selectedYear = Number(selectedYearStr)
  const [timeLimitMin, setTimeLimitMin] = useState(90)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (submitted) return
    setSubmitted(true)
    const userId = getUserId()
    await Promise.all(
      questions.map((q) => {
        const userAnswer = answers[q.id]
        const correct = getAnswer(q.id)?.answer
        const result = !userAnswer ? 'skipped' : userAnswer === correct ? 'correct' : 'wrong'
        return fetch('/api/practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, questionId: q.id, mode: 'mock', result }),
        })
      })
    )
    setPhase('result')
  }, [submitted, questions, answers])

  const startExam = useCallback(() => {
    const qs = examQuestions.filter(
      (q) => q.subjectId === selectedSubject && q.year === selectedYear
    )
    if (qs.length === 0) return
    setQuestions(qs)
    setAnswers({})
    setCurrentIdx(0)
    setSecondsLeft(timeLimitMin * 60)
    setSubmitted(false)
    setPhase('exam')
  }, [examQuestions, selectedSubject, selectedYear, timeLimitMin])

  useEffect(() => {
    if (phase !== 'exam' || submitted) return
    if (secondsLeft <= 0) {
      handleSubmit()
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, secondsLeft, submitted, handleSubmit])

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const score = questions.reduce((acc, q) => {
    const userAns = answers[q.id]
    const correct = getAnswer(q.id)?.answer
    return acc + (userAns && userAns === correct ? (q.points ?? 5) : 0)
  }, 0)

  const total = questions.reduce((acc, q) => acc + (q.points ?? 5), 0)

  if (phase === 'setup') {
    const matches = (q: Question) => q.subjectId === selectedSubject && q.year === selectedYear
    const availableCount = examQuestions.filter(matches).length
    const matchingReliableQuestions = reliableQuestions.filter(matches)
    // 這個組合完全沒題目時，要分得出來是「本來就沒收錄」還是「被我們擋掉了」
    const excludedPaper = availableCount
      ? undefined
      : getPaperContentIssue(allQuestions.find(matches)?.paperId ?? '')
    const excludedOpenEnded =
      availableCount === 0 && !excludedPaper && matchingReliableQuestions.length > 0

    return (
      <div className="space-y-6 max-w-lg">
        <h1 className="text-2xl font-bold font-display">{EXAM_LABELS[exam as ExamId]} — 模擬考</h1>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">科目</p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <Button
                  key={s.id}
                  size="sm"
                  variant={selectedSubject === s.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSubject(s.id)}
                >
                  {s.name.split('（')[0]}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">年份</p>
            <div className="flex flex-wrap gap-2">
              {years.map((y) => (
                <Button
                  key={y}
                  size="sm"
                  variant={selectedYear === y ? 'default' : 'outline'}
                  onClick={() => setSelectedYearStr(String(y))}
                >
                  {y}年
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">時間限制（分鐘）</p>
            <div className="flex gap-2">
              {[60, 90, 120].map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={timeLimitMin === m ? 'default' : 'outline'}
                  onClick={() => setTimeLimitMin(m)}
                >
                  {m} 分
                </Button>
              ))}
            </div>
          </div>
        </div>

        {excludedPaper && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950">
            <p className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
              <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              這一年的卷子暫時不能拿來模擬考
            </p>
            <p className="mt-1 text-amber-800 dark:text-amber-300">{excludedPaper.contentIssue}</p>
            <p className="mt-1 text-amber-800 dark:text-amber-300">
              題庫裡仍可瀏覽這些題目，但計分會失真，所以先擋在模擬考之外。
            </p>
          </div>
        )}

        {excludedOpenEnded && (
          <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">這個組合只有申論或開放題</p>
            <p className="mt-1">
              這些題目仍可在題庫閱讀並依解析自我檢查，但不會放入需要自動計分的完整模擬考。
            </p>
          </div>
        )}

        <Button className="w-full" disabled={availableCount === 0} onClick={startExam}>
          {availableCount === 0 ? '這個組合沒有可自動計分題目' : `開始考試（${availableCount} 題）`}
        </Button>
      </div>
    )
  }

  if (phase === 'exam') {
    const q = questions[currentIdx]
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between text-sm">
          <span>
            {currentIdx + 1} / {questions.length} 題
          </span>
          <span
            className={`inline-flex items-center gap-1 ${secondsLeft < 300 ? 'text-red-500 font-bold' : ''}`}
          >
            <Timer className="h-4 w-4" aria-hidden="true" />
            {formatTime(secondsLeft)}
          </span>
        </div>

        <Card>
          <CardContent className="py-4 px-4 space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{q.year}年</Badge>
              <span className="text-xs text-muted-foreground">第 {q.number} 題</span>
            </div>
            <QuestionText text={q.text} />
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((opt) => (
            <Button
              key={opt}
              variant={answers[q.id] === opt ? 'default' : 'outline'}
              className="w-12 h-12 text-base font-bold"
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
            >
              {opt}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => i - 1)}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            上一題
          </Button>
          {currentIdx < questions.length - 1 ? (
            <Button onClick={() => setCurrentIdx((i) => i + 1)} className="flex-1">
              下一題
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700">
              交卷
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-xl font-bold font-display">成績單</h2>
      <Card>
        <CardContent className="py-4 px-4 text-center space-y-1">
          <p className="text-3xl font-bold font-mono tabular-nums">
            {score} / {total}
          </p>
          <p className="text-muted-foreground text-sm">
            答對 {questions.filter((q) => answers[q.id] === getAnswer(q.id)?.answer).length} 題， 共{' '}
            {questions.length} 題
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {questions.map((q) => {
          const userAns = answers[q.id]
          const correct = getAnswer(q.id)?.answer
          const isCorrect = userAns === correct
          return (
            <Card key={q.id} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
              <CardContent className="py-3 px-4 space-y-1">
                <div className="flex gap-2 items-center text-sm">
                  {isCorrect ? (
                    <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" aria-hidden="true" />
                  )}
                  <span className="font-medium">第 {q.number} 題</span>
                  <span className="text-muted-foreground">你答：{userAns ?? '未作答'}</span>
                  {!isCorrect && <span className="text-green-600">正解：{correct ?? '?'}</span>}
                </div>
                {!isCorrect && getAnswer(q.id)?.explanation && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {getAnswer(q.id)!.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Button variant="outline" className="w-full" onClick={() => setPhase('setup')}>
        再考一次
      </Button>
    </div>
  )
}
