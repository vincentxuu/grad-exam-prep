'use client'

import { notFound } from 'next/navigation'
import { use, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestionText } from '@/components/question-text'
import { useQueryState } from '@/hooks/use-query-state'
import { EXAM_LABELS, getQuestionsByExam, getSubjectsByExam } from '@/lib/content'
import type { ExamId, Question } from '@/types/content'

interface Props {
  params: Promise<{ exam: string }>
}

const PAGE_SIZE = 30

export default function QuestionsPage({ params }: Props) {
  const { exam } = use(params)
  const subjects = getSubjectsByExam(exam as ExamId)
  if (!subjects.length) notFound()

  const allQuestions = getQuestionsByExam(exam as ExamId)
  const years = [...new Set(allQuestions.map((q) => q.year))].sort((a, b) => b - a)

  const [search, setSearch] = useQueryState('q', '')
  const [yearFilterStr, setYearFilterStr] = useQueryState('year', 'all')
  const [subjectTab, setSubjectTab] = useQueryState('subject', subjects[0]?.id ?? '')
  const yearFilter: number | 'all' = yearFilterStr === 'all' ? 'all' : Number(yearFilterStr)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [pageLimits, setPageLimits] = useState<Record<string, number>>({})

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function getLimit(subjectId: string) {
    return pageLimits[subjectId] ?? PAGE_SIZE
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allQuestions.filter((question) => {
      const yearMatch = yearFilter === 'all' || question.year === yearFilter
      const searchMatch = !q || question.text.toLowerCase().includes(q)
      return yearMatch && searchMatch
    })
  }, [allQuestions, yearFilter, search])

  const totalFiltered = filtered.length

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 題庫</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {totalFiltered} 題{search || yearFilter !== 'all' ? '（篩選後）' : ''} · 共 {allQuestions.length} 題
        </p>
      </div>

      {/* Search */}
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜尋題目關鍵字…"
        className="max-w-sm"
      />

      {/* Year filter */}
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant={yearFilter === 'all' ? 'default' : 'outline'}
          className="h-7 text-xs"
          onClick={() => setYearFilterStr('all')}
        >
          全部年份
        </Button>
        {years.map((y) => (
          <Button
            key={y}
            size="sm"
            variant={yearFilter === y ? 'default' : 'outline'}
            className="h-7 text-xs"
            onClick={() => setYearFilterStr(yearFilter === y ? 'all' : String(y))}
          >
            {y}年
          </Button>
        ))}
      </div>

      {/* Subject tabs */}
      <Tabs value={subjectTab} onValueChange={setSubjectTab}>
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex w-max gap-1">
            {subjects.map((s) => {
              const count = filtered.filter((q) => q.subjectId === s.id).length
              return (
                <TabsTrigger key={s.id} value={s.id} className="text-sm whitespace-nowrap">
                  {s.name.split('（')[0]}
                  <span className="ml-1 text-xs opacity-60">({count})</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {subjects.map((subject) => {
          const subjectQuestions = filtered.filter((q) => q.subjectId === subject.id)
          const limit = getLimit(subject.id)
          const shown = subjectQuestions.slice(0, limit)

          return (
            <TabsContent key={subject.id} value={subject.id} className="space-y-2 mt-3">
              {subjectQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {search ? `找不到含「${search}」的題目` : '此科目暫無題目'}
                </p>
              ) : (
                <>
                  {shown.map((q, idx) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      exam={exam}
                      expanded={expandedIds.has(q.id)}
                      onToggle={() => toggleExpand(q.id)}
                      nextId={subjectQuestions[idx + 1]?.id}
                    />
                  ))}

                  {subjectQuestions.length > limit && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        setPageLimits((p) => ({ ...p, [subject.id]: limit + PAGE_SIZE }))
                      }
                    >
                      載入更多（剩 {subjectQuestions.length - limit} 題）
                    </Button>
                  )}
                </>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

function QuestionCard({
  question,
  exam,
  expanded,
  onToggle,
  nextId,
}: {
  question: Question
  exam: string
  expanded: boolean
  onToggle: () => void
  nextId?: string
}) {
  const preview = question.text.slice(0, 200)
  const needsTruncation = question.text.length > 200

  const drillHref = nextId
    ? `/${exam}/questions/${question.id}?mode=drill&next=${nextId}`
    : `/${exam}/questions/${question.id}?mode=drill`

  return (
    <Card>
      <CardContent className="py-3 px-4 space-y-2">
        {/* Header row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs shrink-0">
            {question.year}年
          </Badge>
          <span className="text-xs font-medium text-muted-foreground shrink-0">
            第 {question.number} 題
          </span>
          {question.points != null && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {question.points} 分
            </Badge>
          )}
          {question.hasImage && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 shrink-0">
              含圖
            </Badge>
          )}
          <a
            href={drillHref}
            className="ml-auto text-xs text-primary hover:underline shrink-0"
          >
            練習 →
          </a>
        </div>

        {/* Question text */}
        <QuestionText
          text={expanded || !needsTruncation ? question.text : `${preview}…`}
        />

        {/* Sub-questions */}
        {expanded && question.subQuestions.length > 0 && (
          <ol className="list-none space-y-1 pl-2 border-l-2 border-muted">
            {question.subQuestions.map((sq, i) => (
              <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                {sq}
              </li>
            ))}
          </ol>
        )}

        {/* Expand toggle */}
        {needsTruncation && (
          <button
            onClick={onToggle}
            className="text-xs text-primary hover:underline"
          >
            {expanded ? '收起 ▲' : '展開全題 ▼'}
          </button>
        )}
      </CardContent>
    </Card>
  )
}
