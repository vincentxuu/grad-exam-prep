'use client'

import { notFound } from 'next/navigation'
import { use, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EXAM_LABELS, getSubjectsByExam } from '@/lib/content'
import { localStorageImpl } from '@/lib/storage'
import type { ExamId } from '@/types/content'
import pastPapersData from '../../../../public/data/past-papers.json'

interface Props {
  params: Promise<{ exam: string }>
}

interface PaperState {
  practicedAt: number
  notes?: string
}

interface Paper {
  id: string
  examId: string
  subjectId: string
  year: number
  url: string | null
  source: string
  verified: boolean
  note?: string
}

export default function PastPapersPage({ params }: Props) {
  const { exam } = use(params)
  const subjects = getSubjectsByExam(exam as ExamId)
  if (!subjects.length) notFound()

  const papers = (pastPapersData.papers as Paper[]).filter((p) => p.examId === exam)
  const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a)

  const [paperStates, setPaperStates] = useState<Record<string, PaperState>>(
    () => localStorageImpl.getState().paperPractice
  )
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string; paperId: string } | null>(null)

  function togglePracticed(paperId: string) {
    if (paperStates[paperId]) {
      localStorageImpl.setPaperPractice(paperId, null)
      setPaperStates((s) => {
        const n = { ...s }
        delete n[paperId]
        return n
      })
    } else {
      const data = { practicedAt: Date.now() }
      localStorageImpl.setPaperPractice(paperId, data)
      setPaperStates((s) => ({ ...s, [paperId]: data }))
    }
  }

  function saveNotes(paperId: string) {
    const existing = paperStates[paperId]
    const data = existing
      ? { ...existing, notes: noteText || undefined }
      : { practicedAt: Date.now(), notes: noteText || undefined }
    localStorageImpl.setPaperPractice(paperId, data)
    setPaperStates((s) => ({ ...s, [paperId]: data }))
    setEditingNotes(null)
  }

  const practicedCount = Object.keys(paperStates).filter((id) =>
    papers.some((p) => p.id === id)
  ).length

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 考古題</h1>
        <p className="text-muted-foreground text-sm mt-1">
          已練習 {practicedCount} / {papers.filter((p) => p.url).length} 份
        </p>
      </div>

      <Tabs defaultValue={subjects[0]?.id}>
        {/* 科目 tabs — 可橫向捲動 */}
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex w-max gap-1">
            {subjects.map((s) => (
              <TabsTrigger key={s.id} value={s.id} className="text-sm whitespace-nowrap">
                {s.name.split('（')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {subjects.map((subject) => {
          const subjectPapers = papers.filter((p) => p.subjectId === subject.id)
          const practicedInSubject = subjectPapers.filter((p) => paperStates[p.id]).length

          return (
            <TabsContent key={subject.id} value={subject.id} className="space-y-3">
              <p className="text-xs text-muted-foreground">
                已練習 {practicedInSubject} / {subjectPapers.filter((p) => p.url).length} 份
              </p>

              {/* PDF 閱讀器 — 顯示在選中科目下方 */}
              {viewingPdf && papers.find((p) => p.id === viewingPdf.paperId)?.subjectId === subject.id && (
                <Card>
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="text-sm font-medium truncate mr-2">{viewingPdf.title}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <a
                        href={viewingPdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        新分頁 ↗
                      </a>
                      <button
                        onClick={() => setViewingPdf(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        關閉 ✕
                      </button>
                    </div>
                  </div>
                  <iframe
                    src={viewingPdf.url}
                    className="w-full rounded-b-lg"
                    style={{ height: '75vh' }}
                    title={viewingPdf.title}
                  />
                </Card>
              )}

              {/* 年份清單 */}
              <div className="space-y-2">
                {years.map((year) => {
                  const paper = subjectPapers.find((p) => p.year === year)

                  if (!paper) return null

                  const practiced = !!paperStates[paper.id]
                  const practiceData = paperStates[paper.id]
                  const isViewing = viewingPdf?.paperId === paper.id
                  const title = `${year}年 ${EXAM_LABELS[exam as ExamId]} ${subject.name.split('（')[0]}`

                  return (
                    <Card key={year} className={isViewing ? 'ring-2 ring-primary' : ''}>
                      <CardContent className="flex items-center justify-between gap-3 py-3 px-4">
                        {/* 學年度 */}
                        <span className="text-sm font-semibold w-12 shrink-0">{year}年</span>

                        {/* 操作區 */}
                        {!paper.url ? (
                          <Badge variant="outline" className="text-xs">尚未上架</Badge>
                        ) : (
                          <div className="flex flex-1 items-center justify-between gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant={isViewing ? 'default' : 'outline'}
                              className="h-7 text-xs px-3"
                              onClick={() =>
                                setViewingPdf(
                                  isViewing ? null : { url: paper.url!, title, paperId: paper.id }
                                )
                              }
                            >
                              {isViewing ? '收起' : '查看 PDF'}
                            </Button>

                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={practiced}
                                  onChange={() => togglePracticed(paper.id)}
                                  className="h-3.5 w-3.5 accent-primary"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {practiced
                                    ? `✓ ${new Date(practiceData.practicedAt).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}`
                                    : '已練習'}
                                </span>
                              </label>

                              {practiced && (
                                editingNotes === paper.id ? (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      autoFocus
                                      value={noteText}
                                      onChange={(e) => setNoteText(e.target.value)}
                                      placeholder="筆記…"
                                      className="h-7 text-xs w-28"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveNotes(paper.id)
                                        if (e.key === 'Escape') setEditingNotes(null)
                                      }}
                                    />
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => saveNotes(paper.id)}>✓</Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-muted-foreground"
                                    onClick={() => { setEditingNotes(paper.id); setNoteText(practiceData?.notes ?? '') }}
                                  >
                                    {practiceData?.notes ? `📝 ${practiceData.notes}` : '+ 筆記'}
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
