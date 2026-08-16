'use client'

import { notFound, useRouter } from 'next/navigation'
import { use, useState } from 'react'
import { LookupSheet } from '@/components/lexicon/lookup-sheet'
import { PaperContentWarning } from '@/components/paper-content-warning'
import { QuestionGroupView } from '@/components/question-group-view'
import { QuestionText } from '@/components/question-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useWordLookup } from '@/hooks/use-word-lookup'
import { getAnswer } from '@/lib/answers'
import { getPaperUrl, getQuestionGroup, getQuestionsByExam } from '@/lib/content'
import { getImItPracticeStatus } from '@/lib/im-it-practice-status'
import { getQuestionImages } from '@/lib/question-images'
import { parseQuestion } from '@/lib/question-parser'
import { getUserId } from '@/lib/user-id'
import type { ExamId, Question } from '@/types/content'
import type { PracticeMode } from '@/types/practice'

interface Props {
  params: Promise<{ exam: string; questionId: string }>
  searchParams: Promise<{ mode?: string; next?: string }>
}

function extractPassage(parentQuestion: Question): string {
  const parsed = parseQuestion(parentQuestion.text)
  const lines = parsed.stem.split('\n')
  const qLineIdx = lines.findIndex((l) => new RegExp(`^\\s*${parentQuestion.number}\\.\\s`).test(l))
  if (qLineIdx > 0) {
    return lines.slice(0, qLineIdx).join('\n').trim()
  }
  return parsed.stem
}

export default function DrillPage({ params, searchParams }: Props) {
  const { exam, questionId } = use(params)
  const { mode = 'drill', next } = use(searchParams)

  const allQuestions = getQuestionsByExam(exam as ExamId)
  const question = allQuestions.find((q) => q.id === questionId)
  if (!question) notFound()

  // Check if this question belongs to a passage group
  const group = getQuestionGroup(question, allQuestions)

  if (group) {
    const passage = extractPassage(group.parentQuestion)
    const lastInGroup = group.questions[group.questions.length - 1]
    const nextAfterGroup = allQuestions
      .filter((q) => q.paperId === question.paperId && q.number > lastInGroup.number)
      .sort((a, b) => a.number - b.number)[0]

    return (
      <QuestionGroupView
        exam={exam}
        passage={passage}
        questions={group.questions}
        parentNumber={group.parentQuestion.number}
        mode={mode}
        nextQuestionId={nextAfterGroup?.id}
      />
    )
  }

  // Single question view (non-group)
  return <SingleQuestionView exam={exam} question={question} mode={mode} next={next} />
}

function SingleQuestionView({
  exam,
  question,
  mode,
  next,
}: {
  exam: string
  question: Question
  mode: string
  next?: string
}) {
  const router = useRouter()
  const parsed = parseQuestion(question.text)
  const answerData = getAnswer(question.id)
  const reviewStatus =
    question.subjectId === 'im-it' ? getImItPracticeStatus(question.id) : undefined
  const isSelfReviewOnly = reviewStatus?.status === 'self_review_only'
  const isDisputed = reviewStatus?.status === 'disputed'
  const canAutoGrade = reviewStatus ? reviewStatus.autoGradeEligible : true
  const questionImages = question.hasImage ? getQuestionImages(question.id) : []
  const paperUrl = getPaperUrl(question.paperId)

  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 英文科才開查詞 —— 讓演算法題的每個字都可點只是噪音
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
    if (next) {
      router.push(`/${exam}/questions/${next}?mode=${mode}`)
    } else {
      router.push(`/${exam}/questions`)
    }
  }

  const isCorrect =
    canAutoGrade && selected && answerData && selected === answerData.answer.toLowerCase()

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">{question.year}年</Badge>
        <span className="text-xs text-muted-foreground">第 {question.number} 題</span>
        {question.points != null && <Badge variant="secondary">{question.points} 分</Badge>}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-xs text-muted-foreground h-7"
          onClick={() => router.push(`/${exam}/questions`)}
        >
          ← 返回題庫
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

      {/* Question stem */}
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

      {/* Original exam images for questions that contain figures */}
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
            {questionImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`試卷第 ${src.match(/page-(\d+)/)?.[1] ?? i + 1} 頁`}
                className="w-full rounded border border-border"
                loading="lazy"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Options */}
      {!revealed && !isSelfReviewOnly && parsed.options ? (
        <RadioGroup value={selected ?? ''} onValueChange={setSelected} className="space-y-2">
          {parsed.options.map((opt) => (
            <label
              key={opt.label}
              htmlFor={`opt-${opt.label}`}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors
                ${selected === opt.label ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
            >
              <RadioGroupItem
                id={`opt-${opt.label}`}
                value={opt.label}
                className="mt-0.5 shrink-0"
              />
              <span className="text-sm leading-relaxed">
                <span className="font-medium uppercase mr-2">{opt.label}.</span>
                {opt.text}
              </span>
            </label>
          ))}
        </RadioGroup>
      ) : !revealed && !isSelfReviewOnly && !parsed.options ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">選擇你的答案：</p>
          <div className="flex flex-wrap gap-2">
            {['a', 'b', 'c', 'd', 'e'].map((opt) => (
              <Button
                key={opt}
                variant={selected === opt ? 'default' : 'outline'}
                className="w-12 h-12 text-base font-bold uppercase"
                onClick={() => setSelected(opt)}
              >
                {opt.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {!revealed && isSelfReviewOnly && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-pretty text-sm text-muted-foreground">
            這是程式或開放題，不使用 A–E 判分。請先在紙上完成答案，再查看參考解析並自行評估。
          </p>
        </div>
      )}

      {/* Confirm button */}
      {!revealed && (
        <Button
          disabled={!isSelfReviewOnly && !selected}
          onClick={() => setRevealed(true)}
          className="w-full"
          size="lg"
        >
          {isSelfReviewOnly ? '查看參考解析' : isDisputed ? '查看審核狀態' : '確認答案'}
        </Button>
      )}

      {/* Result */}
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
                {isDisputed ? '此題答案有爭議，目前不顯示正解或計分。' : '請依參考解析自行評估。'}
              </p>
            )}

            {canAutoGrade && !isCorrect && parsed.options && answerData && (
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-medium">正確選項：</span>
                {parsed.options.find((o) => o.label === answerData.answer.toLowerCase())?.text ??
                  answerData.answer}
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

      {/* Know it / Don't know buttons */}
      {revealed && !isDisputed && (
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
    </div>
  )
}
