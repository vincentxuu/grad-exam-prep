'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense, use, useState } from 'react'
import { PageLoading } from '@/components/page-loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EXAM_LABELS, getSubjectsByExam } from '@/lib/content'
import type { ExamId } from '@/types/content'
import readingData from '../../../../public/data/reading-practice-new.json'

interface ReadingQuestion {
  number: number
  text: string
  choices: string[]
  type: string
  correctAnswer?: string
}

interface ReadingArticle {
  id: string
  sourceTitle: string
  sourceDate: string
  source: string
  passage: string
  topic: string
  difficulty: string
  questions: ReadingQuestion[]
  keyVocabulary: string[]
  readingTips: string
}

const articles = readingData as unknown as ReadingArticle[]
const TOPICS = ['全部', 'science', 'technology', 'business', 'social', 'health', 'environment', 'general'] as const
const TOPIC_LABELS: Record<string, string> = {
  '全部': '全部',
  science: 'Science',
  technology: 'Technology',
  business: 'Business',
  social: 'Social',
  health: 'Health',
  environment: 'Environment',
  general: 'General',
}
const OPTIONS = ['A', 'B', 'C', 'D'] as const

type Phase = 'browse' | 'practice' | 'result'

interface Props {
  params: Promise<{ exam: string }>
}

export default function ReadingPracticePage(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ReadingPracticeContent {...props} />
    </Suspense>
  )
}

function ReadingPracticeContent({ params }: Props) {
  const { exam } = use(params)
  const subjects = getSubjectsByExam(exam as ExamId)
  if (!subjects.length) notFound()

  const [phase, setPhase] = useState<Phase>('browse')
  const [topicFilter, setTopicFilter] = useState('全部')
  const [currentArticle, setCurrentArticle] = useState<ReadingArticle | null>(null)
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [showTip, setShowTip] = useState(false)

  const filteredArticles =
    topicFilter === '全部' ? articles : articles.filter((a) => a.topic === topicFilter)

  function startArticle(article: ReadingArticle) {
    setCurrentArticle(article)
    setCurrentQIdx(0)
    setAnswers({})
    setRevealed(new Set())
    setShowTip(false)
    setPhase('practice')
  }

  function selectAnswer(qNum: number, option: string) {
    if (revealed.has(qNum)) return
    setAnswers((prev) => ({ ...prev, [qNum]: option }))
    setRevealed((prev) => new Set(prev).add(qNum))
  }

  function finishArticle() {
    setPhase('result')
  }

  if (phase === 'browse') {
    return (
      <div className="space-y-4 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 閱讀練習</h1>
          <p className="text-muted-foreground text-sm mt-1">
            從 BBC、Nature、MIT News 等來源精選的文章，練習閱讀理解
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <Button
              key={t}
              size="sm"
              variant={topicFilter === t ? 'default' : 'outline'}
              onClick={() => setTopicFilter(t)}
            >
              {TOPIC_LABELS[t]}
            </Button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{filteredArticles.length} 篇文章</p>

        <div className="grid gap-3 sm:grid-cols-2">
          {filteredArticles.map((a) => (
            <Card
              key={a.id}
              className="cursor-pointer hover:border-foreground/30 transition-colors"
              onClick={() => startArticle(a)}
            >
              <CardContent className="py-3 px-4 space-y-2">
                <p className="font-medium text-sm leading-snug">{a.sourceTitle}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {a.topic}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {a.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {a.questions.length} 題
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{a.sourceDate}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'practice' && currentArticle) {
    const q = currentArticle.questions[currentQIdx]
    const isLast = currentQIdx === currentArticle.questions.length - 1
    const userAnswer = answers[q.number]
    const isRevealed = revealed.has(q.number)
    const correctAnswer = q.correctAnswer
    const isCorrect = userAnswer === correctAnswer

    return (
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setPhase('browse')}>
            ← 返回列表
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentQIdx + 1} / {currentArticle.questions.length} 題
          </span>
        </div>

        <h2 className="text-lg font-bold leading-snug">{currentArticle.sourceTitle}</h2>

        <button
          onClick={() => setShowTip(!showTip)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showTip ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          閱讀提示
        </button>
        {showTip && (
          <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">{currentArticle.readingTips}</div>
        )}

        <div className="rounded-lg border p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
          {currentArticle.passage}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {currentArticle.keyVocabulary.map((word) => (
            <Badge key={word} variant="outline" className="text-xs">
              {word}
            </Badge>
          ))}
        </div>

        <Card>
          <CardContent className="py-4 px-4 space-y-3">
            <p className="text-sm font-medium">
              Q{q.number}. {q.text}
            </p>
            <Badge variant="outline" className="text-xs">
              {q.type}
            </Badge>
            <div className="grid gap-2">
              {q.choices.map((choice, i) => {
                const opt = OPTIONS[i]
                const isSelected = userAnswer === opt
                return (
                  <button
                    key={opt}
                    disabled={isRevealed}
                    onClick={() => selectAnswer(q.number, opt)}
                    className={`text-left rounded-md border px-3 py-2 text-sm transition-colors ${
                      isRevealed && isSelected && isCorrect
                        ? 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-200'
                        : isRevealed && isSelected && !isCorrect
                          ? 'border-red-500 bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-200'
                          : isRevealed && opt === correctAnswer
                            ? 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-200'
                            : isRevealed
                              ? 'opacity-50'
                              : 'hover:border-foreground/40 cursor-pointer'
                    }`}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
            {isRevealed && correctAnswer && (
              <p className={`text-xs font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '✓ 正確！' : `✗ 答錯了。正確答案是 (${correctAnswer})`}
              </p>
            )}
            {isRevealed && !correctAnswer && (
              <p className="text-xs text-muted-foreground">
                你選了 ({userAnswer})。回到文章確認答案是否正確。
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentQIdx === 0}
            onClick={() => setCurrentQIdx((i) => i - 1)}
          >
            ← 上一題
          </Button>
          {isLast ? (
            <Button onClick={finishArticle} className="flex-1">
              完成練習
            </Button>
          ) : (
            <Button onClick={() => setCurrentQIdx((i) => i + 1)} className="flex-1">
              下一題 →
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'result' && currentArticle) {
    const correctCount = currentArticle.questions.filter(
      (q) => q.correctAnswer && answers[q.number] === q.correctAnswer
    ).length
    const totalWithAnswer = currentArticle.questions.filter((q) => q.correctAnswer).length
    return (
      <div className="space-y-4 max-w-3xl">
        <h2 className="text-xl font-bold">練習完成</h2>

        <Card>
          <CardContent className="py-4 px-4 text-center space-y-1">
            <p className="text-2xl font-bold">
              {correctCount} / {totalWithAnswer} 題答對
            </p>
            <p className="text-muted-foreground text-sm">
              {correctCount === totalWithAnswer ? '全部正確！' : '回顧錯題，加強閱讀理解'}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {currentArticle.questions.map((q) => {
            const userAns = answers[q.number]
            const isRight = q.correctAnswer && userAns === q.correctAnswer
            return (
              <Card key={q.number} className={isRight ? 'border-green-200' : userAns ? 'border-red-200' : ''}>
                <CardContent className="py-3 px-4 space-y-1">
                  <div className="flex gap-2 items-center text-sm">
                    <span>{isRight ? '✓' : userAns ? '✗' : '—'}</span>
                    <span className="font-medium">Q{q.number}. {q.text}</span>
                  </div>
                  <p className="text-sm">
                    你的答案：<span className={`font-bold ${isRight ? 'text-green-600' : 'text-red-600'}`}>{userAns ? `(${userAns})` : '未作答'}</span>
                    {!isRight && q.correctAnswer && (
                      <span className="text-green-600 ml-2">正解：({q.correctAnswer})</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div>
          <p className="text-sm font-medium mb-2">關鍵字彙</p>
          <div className="flex flex-wrap gap-1.5">
            {currentArticle.keyVocabulary.map((word) => (
              <Badge key={word} variant="secondary">
                {word}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setPhase('browse')}>
            返回列表
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              const idx = articles.indexOf(currentArticle)
              const next = articles[(idx + 1) % articles.length]
              startArticle(next)
            }}
          >
            再練一篇
          </Button>
        </div>
      </div>
    )
  }

  return null
}
