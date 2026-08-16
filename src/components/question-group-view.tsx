'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LookupSheet } from '@/components/lexicon/lookup-sheet'
import { PaperContentWarning } from '@/components/paper-content-warning'
import { QuestionText } from '@/components/question-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useWordLookup } from '@/hooks/use-word-lookup'
import { getAnswer } from '@/lib/answers'
import { parseQuestion } from '@/lib/question-parser'
import { getQuestionPracticePolicy } from '@/lib/question-practice-policy'
import { getUserId } from '@/lib/user-id'
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
  const qLineIdx = lines.findIndex((l) => new RegExp(`^\\s*${parentNumber}\\.\\s`).test(l))
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
  // 閱讀測驗的生字絕大多數在文章裡，不在題幹 —— 這裡是查詞最該出現的地方
  const isEnglish = questions[0]?.subjectId.endsWith('-english') ?? false
  const lookup = useWordLookup(isEnglish)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const autoGradableQuestions = questions.filter(
    (question) => getQuestionPracticePolicy(question).gradingMode === 'auto'
  )
  const answeredCount = autoGradableQuestions.filter((question) => answers[question.id]).length

  function selectAnswer(questionId: string, option: string) {
    if (revealed) return
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  async function handleConfirm() {
    setRevealed(true)
    setSubmitting(true)
    const userId = getUserId()
    await Promise.all(
      autoGradableQuestions.map((q) => {
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
      })
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

  const correctCount = autoGradableQuestions.filter((q) => {
    const answerData = getAnswer(q.id)
    return answers[q.id] && answerData && answers[q.id] === answerData.answer.toLowerCase()
  }).length

  return (
    <div className="space-y-4">
      <LookupSheet
        selected={lookup.selected}
        onClose={lookup.close}
        persona={lookup.persona}
        source={{ kind: 'question', questionId: questions[0]?.id }}
        onSaveChange={lookup.refreshMarks}
      />

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

      <PaperContentWarning paperId={questions[0].paperId} />

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
                  <QuestionText
                    text={passage}
                    onWordSelect={isEnglish ? lookup.onSelect : undefined}
                    mark={lookup.mark}
                    activeTerm={lookup.selected?.term}
                  />
                </CardContent>
              </Card>
            </details>
            {/* Desktop: always visible */}
            <Card className="border-dashed bg-muted/30 hidden lg:block">
              <CardContent className="py-4 px-5 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">閱讀文章</p>
                <QuestionText
                  text={passage}
                  onWordSelect={isEnglish ? lookup.onSelect : undefined}
                  mark={lookup.mark}
                  activeTerm={lookup.selected?.term}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Questions panel */}
        <div className="lg:w-1/2 lg:min-w-0 space-y-3">
          {questions.map((q) => {
            const parsed = parseQuestion(q.text)
            const answerData = getAnswer(q.id)
            const practicePolicy = getQuestionPracticePolicy(q, answerData)
            const canAutoGrade = practicePolicy.gradingMode === 'auto'
            const selected = answers[q.id]
            const isCorrect =
              canAutoGrade && selected && answerData && selected === answerData.answer.toLowerCase()
            const stem = getQuestionStem(q, parentNumber)

            return (
              <Card
                key={q.id}
                className={
                  revealed && canAutoGrade
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
                      <span className="text-sm text-muted-foreground flex-1">___</span>
                    )}
                    {revealed && canAutoGrade && (
                      <span
                        className={`text-xs font-medium shrink-0 ${isCorrect ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}
                      >
                        {isCorrect ? '✓' : '✗'}
                        {!isCorrect && answerData && (
                          <span className="ml-1 uppercase">正解 {answerData.answer}</span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  {canAutoGrade && parsed.options ? (
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {parsed.options.map((opt) => {
                        const isSelected = selected === opt.label
                        const isAnswer = opt.label === answerData?.answer.toLowerCase()
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
                            <span className="font-medium uppercase mr-1">{opt.label}.</span>
                            {opt.text}
                          </button>
                        )
                      })}
                    </div>
                  ) : !revealed ? (
                    <div className="ml-5 rounded-md border bg-muted/30 px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        {practicePolicy.gradingMode === 'self_review'
                          ? '這是申論或開放題，請先自行作答，稍後依參考解析檢查。'
                          : '這題目前僅供閱讀，不提供選項或自動計分。'}
                      </p>
                    </div>
                  ) : (
                    <p className="pl-5 text-xs font-medium text-muted-foreground">
                      {practicePolicy.gradingMode === 'self_review'
                        ? '請依參考解析自行評估。'
                        : '此題目前僅供閱讀，不提供自動計分。'}
                    </p>
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
              disabled={answeredCount < autoGradableQuestions.length}
              onClick={handleConfirm}
              className="w-full"
              size="lg"
            >
              {autoGradableQuestions.length > 0
                ? `確認答案 (${answeredCount}/${autoGradableQuestions.length})`
                : '查看參考解析'}
            </Button>
          ) : (
            <div className="space-y-3">
              <Card>
                <CardContent className="py-3 px-4 text-center">
                  <p className="text-base font-semibold">
                    {autoGradableQuestions.length > 0
                      ? `答對 ${correctCount}/${autoGradableQuestions.length} 題`
                      : '這組題目不使用自動計分'}
                  </p>
                </CardContent>
              </Card>
              <Button onClick={handleNext} className="w-full" size="lg" disabled={submitting}>
                {nextQuestionId ? '下一組 →' : '返回題庫'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
