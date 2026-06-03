'use client'

import { notFound } from 'next/navigation'
import { use, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null)

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
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 考古題</h1>
        <p className="text-muted-foreground text-sm mt-1">
          已練習 {practicedCount} / {papers.filter((p) => p.url).length} 份 ·
          點「查看」在網站內嵌入閱讀，點「✓ 已練習」記錄進度
        </p>
      </div>

      {/* PDF 嵌入閱讀區 */}
      {viewingPdf && (
        <div className="rounded-lg border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
            <span className="text-sm font-medium">{viewingPdf.title}</span>
            <div className="flex gap-2">
              <a
                href={viewingPdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                新分頁開啟 ↗
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
            className="w-full"
            style={{ height: '80vh' }}
            title={viewingPdf.title}
          />
        </div>
      )}

      {/* 年份 × 科目表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-2.5 font-medium w-16">學年度</th>
              {subjects.map((s) => (
                <th key={s.id} className="text-left p-2.5 font-medium">
                  {s.name.split('（')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((year, yi) => (
              <tr key={year} className={yi % 2 === 0 ? '' : 'bg-muted/20'}>
                <td className="p-2.5 font-semibold">{year}</td>
                {subjects.map((s) => {
                  const paper = papers.find((p) => p.year === year && p.subjectId === s.id)

                  if (!paper) {
                    return (
                      <td key={s.id} className="p-2.5 text-muted-foreground text-xs">
                        —
                      </td>
                    )
                  }

                  if (!paper.url) {
                    return (
                      <td key={s.id} className="p-2.5">
                        <Badge variant="outline" className="text-xs">尚未上架</Badge>
                      </td>
                    )
                  }

                  const practiced = !!paperStates[paper.id]
                  const practiceData = paperStates[paper.id]
                  const isViewing = viewingPdf?.url === paper.url
                  const title = `${year}年 ${EXAM_LABELS[exam as ExamId]} ${s.name.split('（')[0]}`

                  return (
                    <td key={s.id} className="p-2.5">
                      <div className="flex flex-col gap-1.5">
                        <Button
                          size="sm"
                          variant={isViewing ? 'default' : 'outline'}
                          className="h-6 text-xs px-2"
                          onClick={() =>
                            setViewingPdf(isViewing ? null : { url: paper.url!, title })
                          }
                        >
                          {isViewing ? '收起' : '查看'}
                        </Button>

                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={practiced}
                            onChange={() => togglePracticed(paper.id)}
                            className="h-3 w-3 accent-primary"
                          />
                          <span className="text-xs text-muted-foreground">
                            {practiced
                              ? `✓ ${new Date(practiceData.practicedAt).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}`
                              : '已練習'}
                          </span>
                        </label>

                        {editingNotes === paper.id ? (
                          <div className="flex gap-1">
                            <input
                              autoFocus
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="筆記…"
                              className="text-xs border rounded px-1 py-0.5 w-20 bg-background"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveNotes(paper.id)
                                if (e.key === 'Escape') setEditingNotes(null)
                              }}
                            />
                            <button
                              onClick={() => saveNotes(paper.id)}
                              className="text-xs text-primary"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          practiced && (
                            <button
                              onClick={() => {
                                setEditingNotes(paper.id)
                                setNoteText(practiceData?.notes ?? '')
                              }}
                              className="text-xs text-muted-foreground hover:text-foreground text-left"
                            >
                              {practiceData?.notes ? practiceData.notes : '+ 筆記'}
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
