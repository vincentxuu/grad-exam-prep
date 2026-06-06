'use client'

import { notFound, useRouter } from 'next/navigation'
import { use, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { QuestionText } from '@/components/question-text'
import { getQuestionsByExam, findPassageParent, getPaperUrl } from '@/lib/content'
import { getAnswer } from '@/lib/answers'
import { getQuestionImages } from '@/lib/question-images'
import { getUserId } from '@/lib/user-id'
import { parseQuestion } from '@/lib/question-parser'
import type { ExamId } from '@/types/content'
import type { PracticeMode } from '@/types/practice'

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

  const parsed = parseQuestion(question.text)
  const passageParent = findPassageParent(question, allQuestions)
  const passageStem = passageParent ? parseQuestion(passageParent.text).stem : null
  const answerData = getAnswer(questionId)
  const questionImages = question.hasImage ? getQuestionImages(questionId) : []
  const paperUrl = question.hasImage ? getPaperUrl(question.paperId) : undefined

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

  const isCorrect = selected && answerData && selected === answerData.answer.toLowerCase()

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">{question.year}年</Badge>
        <span className="text-xs text-muted-foreground">第 {question.number} 題</span>
        {question.points != null && (
          <Badge variant="secondary">{question.points} 分</Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-xs text-muted-foreground h-7"
          onClick={() => router.push(`/${exam}/questions`)}
        >
          ← 返回題庫
        </Button>
      </div>

      {/* Passage context for cloze / reading comprehension children */}
      {passageStem && (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="py-4 px-5 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">閱讀文章</p>
            <QuestionText text={passageStem} />
          </CardContent>
        </Card>
      )}

      {/* Question stem */}
      {parsed.stem && (
        <Card>
          <CardContent className="py-4 px-5">
            <QuestionText text={parsed.stem} />
          </CardContent>
        </Card>
      )}

      {/* Original exam images for questions that contain figures */}
      {questionImages.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-4 px-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                原始試卷圖片
              </p>
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
      {!revealed && parsed.options ? (
        <RadioGroup
          value={selected ?? ''}
          onValueChange={setSelected}
          className="space-y-2"
        >
          {parsed.options.map((opt) => (
            <label
              key={opt.label}
              htmlFor={`opt-${opt.label}`}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors
                ${selected === opt.label
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
                }`}
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
      ) : !revealed && !parsed.options ? (
        /* Free-form questions: just letter buttons */
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

      {/* Confirm button */}
      {!revealed && (
        <Button
          disabled={!selected}
          onClick={() => setRevealed(true)}
          className="w-full"
          size="lg"
        >
          確認答案
        </Button>
      )}

      {/* Result */}
      {revealed && (
        <Card className={isCorrect ? 'border-[hsl(var(--success))]' : 'border-destructive'}>
          <CardContent className="py-4 px-5 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-base font-semibold ${isCorrect ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
                {isCorrect ? '✓ 答對了！' : '✗ 答錯了'}
              </span>
              {selected && (
                <Badge variant={isCorrect ? 'default' : 'destructive'} className="uppercase">
                  你選了 {selected.toUpperCase()}
                </Badge>
              )}
              {answerData && !isCorrect && (
                <Badge variant="outline" className="text-[hsl(var(--success))] border-[hsl(var(--success))] uppercase">
                  正解 {answerData.answer}
                </Badge>
              )}
            </div>

            {!isCorrect && parsed.options && answerData && (
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-medium">正確選項：</span>
                {parsed.options.find(o => o.label === answerData.answer.toLowerCase())?.text ?? answerData.answer}
              </p>
            )}

            {answerData?.explanation && (
              <>
                <Separator />
                <p className="text-sm text-foreground leading-relaxed">{answerData.explanation}</p>
              </>
            )}

            {!answerData && (
              <p className="text-sm text-muted-foreground">此題尚無解析</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Know it / Don't know buttons */}
      {revealed && (
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
