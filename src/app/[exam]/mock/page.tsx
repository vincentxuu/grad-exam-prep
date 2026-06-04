'use client'

import { notFound } from 'next/navigation'
import { use, useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EXAM_LABELS, getQuestionsByExam, getSubjectsByExam } from '@/lib/content'
import { getAnswer } from '@/lib/answers'
import { getUserId } from '@/lib/user-id'
import type { ExamId, Question } from '@/types/content'

type Phase = 'setup' | 'exam' | 'result'
const OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const

interface Props {
  params: Promise<{ exam: string }>
}

export default function MockExamPage({ params }: Props) {
  const { exam } = use(params)
  const subjects = getSubjectsByExam(exam as ExamId)
  if (!subjects.length) notFound()

  const allQuestions = getQuestionsByExam(exam as ExamId)
  const years = [...new Set(allQuestions.map((q) => q.year))].sort((a, b) => b - a)

  const [phase, setPhase] = useState<Phase>('setup')
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id)
  const [selectedYear, setSelectedYear] = useState(years[0])
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
        const result =
          !userAnswer ? 'skipped' : userAnswer === correct ? 'correct' : 'wrong'
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
    const qs = allQuestions.filter(
      (q) => q.subjectId === selectedSubject && q.year === selectedYear
    )
    if (qs.length === 0) return
    setQuestions(qs)
    setAnswers({})
    setCurrentIdx(0)
    setSecondsLeft(timeLimitMin * 60)
    setSubmitted(false)
    setPhase('exam')
  }, [allQuestions, selectedSubject, selectedYear, timeLimitMin])

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
    return (
      <div className="space-y-6 max-w-lg">
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 模擬考</h1>

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
                  onClick={() => setSelectedYear(y)}
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

        <Button className="w-full" onClick={startExam}>
          開始考試
        </Button>
      </div>
    )
  }

  if (phase === 'exam') {
    const q = questions[currentIdx]
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between text-sm">
          <span>{currentIdx + 1} / {questions.length} 題</span>
          <span className={secondsLeft < 300 ? 'text-red-500 font-bold' : ''}>
            ⏱ {formatTime(secondsLeft)}
          </span>
        </div>

        <Card>
          <CardContent className="py-4 px-4 space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{q.year}年</Badge>
              <span className="text-xs text-muted-foreground">第 {q.number} 題</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{q.text}</p>
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
            ← 上一題
          </Button>
          {currentIdx < questions.length - 1 ? (
            <Button onClick={() => setCurrentIdx((i) => i + 1)} className="flex-1">
              下一題 →
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
      <h2 className="text-xl font-bold">成績單</h2>
      <Card>
        <CardContent className="py-4 px-4 text-center space-y-1">
          <p className="text-3xl font-bold">{score} / {total}</p>
          <p className="text-muted-foreground text-sm">
            答對 {questions.filter((q) => answers[q.id] === getAnswer(q.id)?.answer).length} 題，
            共 {questions.length} 題
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
                  <span>{isCorrect ? '✓' : '✗'}</span>
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
