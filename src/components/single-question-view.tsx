'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LookupSheet } from '@/components/lexicon/lookup-sheet'
import { PaperContentWarning } from '@/components/paper-content-warning'
import { QuestionText } from '@/components/question-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useWordLookup } from '@/hooks/use-word-lookup'
import { getAnswer } from '@/lib/answers'
import { getPaperUrl } from '@/lib/content'
import { getImItPracticeStatus } from '@/lib/im-it-practice-status'
import { type DrillSearchParams, getDrillNavigation } from '@/lib/question-drill'
import { getQuestionImages } from '@/lib/question-images'
import { parseQuestion } from '@/lib/question-parser'
import { getQuestionPracticePolicy } from '@/lib/question-practice-policy'
import { getUserId } from '@/lib/user-id'
import type { Question } from '@/types/content'
import type { PracticeMode } from '@/types/practice'

interface SingleQuestionViewProps {
  exam: string
  question: Question
  mode: string
  next?: string
  drillSearchParams?: DrillSearchParams
}

export function SingleQuestionView({
  exam,
  question,
  mode,
  next,
  drillSearchParams,
}: SingleQuestionViewProps) {
  const router = useRouter()
  const parsed = parseQuestion(question.text)
  const answerData = getAnswer(question.id)
  const reviewStatus =
    question.subjectId === 'im-it' ? getImItPracticeStatus(question.id) : undefined
  const isDisputed = reviewStatus?.status === 'disputed'
  const practicePolicy = getQuestionPracticePolicy(question, answerData)
  const isSelfReview = practicePolicy.gradingMode === 'self_review'
  const isReadOnly = practicePolicy.gradingMode === 'read_only'
  const canAutoGrade = practicePolicy.gradingMode === 'auto'
  const questionImages = question.hasImage ? getQuestionImages(question.id) : []
  const paperUrl = getPaperUrl(question.paperId)
  const drillNavigation = getDrillNavigation(exam, drillSearchParams ?? { mode, next })
  const returnsToLesson = drillNavigation.completionHref !== `/${exam}/questions`

  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isEnglish = question.subjectId.endsWith('-english')
  const lookup = useWordLookup(isEnglish)

  async function submitResult(result: 'correct' | 'wrong') {
    setSubmitting(true)
    const userId = getUserId()
    await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        questionId: question.id,
        mode: mode as PracticeMode,
        result,
      }),
    })
    setSubmitting(false)
    router.push(drillNavigation.nextHref ?? drillNavigation.completionHref)
  }

  const isCorrect =
    canAutoGrade && selected && answerData && selected === answerData.answer.toLowerCase()

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">{question.year}年</Badge>
        <span className="text-xs text-muted-foreground">第 {question.number} 題</span>
        {question.points != null && <Badge variant="secondary">{question.points} 分</Badge>}
        {drillNavigation.currentPosition && drillNavigation.totalQuestions ? (
          <Badge variant="secondary">
            本課 {drillNavigation.currentPosition}/{drillNavigation.totalQuestions}
          </Badge>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-xs text-muted-foreground h-7"
          onClick={() => router.push(drillNavigation.completionHref)}
        >
          ← {returnsToLesson ? '返回課程' : '返回題庫'}
        </Button>
      </div>

      <PaperContentWarning paperId={question.paperId} />

      {reviewStatus && (
        <div
          className={`rounded-lg border px-4 py-3 text-pretty text-sm ${
            isDisputed
              ? 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200'
              : 'bg-muted/30 text-muted-foreground'
          }`}
        >
          {reviewStatus.note}
          {paperUrl && (
            <a
              href={paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-medium underline underline-offset-2"
            >
              查看原始試卷
            </a>
          )}
        </div>
      )}

      {parsed.stem && (
        <Card>
          <CardContent className="py-4 px-5">
            <QuestionText
              text={parsed.stem}
              onWordSelect={isEnglish ? lookup.onSelect : undefined}
              mark={lookup.mark}
              activeTerm={lookup.selected?.term}
            />
          </CardContent>
        </Card>
      )}

      <LookupSheet
        selected={lookup.selected}
        onClose={lookup.close}
        persona={lookup.persona}
        source={{ kind: 'question', questionId: question.id }}
        onSaveChange={lookup.refreshMarks}
      />

      {questionImages.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-4 px-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">原始試卷圖片</p>
              {paperUrl && (
                <a
                  href={paperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 underline"
                >
                  查看完整試卷 PDF
                </a>
              )}
            </div>
            {questionImages.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`試卷第 ${src.match(/page-(\d+)/)?.[1] ?? index + 1} 頁`}
                className="w-full rounded border border-border"
                loading="lazy"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {!revealed && canAutoGrade && parsed.options ? (
        <RadioGroup value={selected ?? ''} onValueChange={setSelected} className="space-y-2">
          {parsed.options.map((option) => (
            <label
              key={option.label}
              htmlFor={`opt-${option.label}`}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors
                ${selected === option.label ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
            >
              <RadioGroupItem
                id={`opt-${option.label}`}
                value={option.label}
                className="mt-0.5 shrink-0"
              />
              <span className="text-sm leading-relaxed">
                <span className="font-medium uppercase mr-2">{option.label}.</span>
                {option.text}
              </span>
            </label>
          ))}
        </RadioGroup>
      ) : null}

      {!revealed && isSelfReview && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-pretty text-sm text-muted-foreground">
            這是申論或開放題，不使用 A–E 自動判分。請先在紙上完成答案，再查看參考解析並自行評估。
          </p>
        </div>
      )}

      {!revealed && isReadOnly && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-pretty text-sm text-muted-foreground">
            這題目前僅供閱讀，不提供選項或自動計分。
          </p>
        </div>
      )}

      {!revealed && (
        <Button
          disabled={canAutoGrade && !selected}
          onClick={() => setRevealed(true)}
          className="w-full"
          size="lg"
        >
          {isSelfReview ? '查看參考解析' : isReadOnly ? '查看可用資訊' : '確認答案'}
        </Button>
      )}

      {revealed && (
        <Card
          className={
            canAutoGrade
              ? isCorrect
                ? 'border-[hsl(var(--success))]'
                : 'border-destructive'
              : 'border-border'
          }
        >
          <CardContent className="py-4 px-5 space-y-3">
            {canAutoGrade ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`text-base font-semibold ${isCorrect ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}
                >
                  {isCorrect ? '✓ 答對了！' : '✗ 答錯了'}
                </span>
                {selected && (
                  <Badge variant={isCorrect ? 'default' : 'destructive'} className="uppercase">
                    你選了 {selected.toUpperCase()}
                  </Badge>
                )}
                {answerData && !isCorrect && (
                  <Badge
                    variant="outline"
                    className="text-[hsl(var(--success))] border-[hsl(var(--success))] uppercase"
                  >
                    正解 {answerData.answer}
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-pretty text-sm font-medium">
                {isDisputed
                  ? '此題答案有爭議，目前不顯示正解或計分。'
                  : isReadOnly
                    ? '此題目前僅供閱讀，不提供自動計分。'
                    : '請依參考解析自行評估。'}
              </p>
            )}

            {canAutoGrade && !isCorrect && parsed.options && answerData && (
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-medium">正確選項：</span>
                {parsed.options.find((option) => option.label === answerData.answer.toLowerCase())
                  ?.text ?? answerData.answer}
              </p>
            )}

            {answerData?.explanation && !isDisputed && (
              <>
                <Separator />
                <p className="text-sm text-foreground leading-relaxed">{answerData.explanation}</p>
              </>
            )}

            {!answerData && !isDisputed && (
              <p className="text-sm text-muted-foreground">此題尚無解析</p>
            )}
          </CardContent>
        </Card>
      )}

      {revealed && practicePolicy.gradingMode !== 'read_only' && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-[hsl(var(--success))] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.1)]"
            disabled={submitting}
            onClick={() => submitResult('correct')}
          >
            ✓ 會了
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={submitting}
            onClick={() => submitResult('wrong')}
          >
            ✗ 不會
          </Button>
        </div>
      )}

      {revealed && practicePolicy.gradingMode === 'read_only' ? (
        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push(drillNavigation.nextHref ?? drillNavigation.completionHref)}
        >
          {drillNavigation.nextHref ? '下一題 →' : returnsToLesson ? '返回課程' : '返回題庫'}
        </Button>
      ) : null}
    </div>
  )
}
