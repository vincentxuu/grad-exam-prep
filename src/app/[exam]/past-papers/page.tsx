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

export default function PastPapersPage({ params }: Props) {
  const { exam } = use(params)
  const subjects = getSubjectsByExam(exam as ExamId)
  if (!subjects.length) notFound()

  const papers = (
    pastPapersData.papers as Array<{
      id: string
      examId: string
      subjectId: string
      year: number
      url: string
      source: string
      verified: boolean
      note?: string
    }>
  ).filter((p) => p.examId === exam)

  const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a)
  const [paperStates, setPaperStates] = useState<Record<string, PaperState>>(
    () => localStorageImpl.getState().paperPractice
  )
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 考古題</h1>
        <p className="text-muted-foreground text-sm mt-1">
          已練習 {practicedCount} / {papers.length} 份 · 點連結開啟PDF，勾選「已練習」記錄進度
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ⚠ PDF連結待手動驗證（台大圖書館 / 高點）
        </p>
      </div>

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
                <td className="p-2.5 font-medium">{year}</td>
                {subjects.map((s) => {
                  const paper = papers.find((p) => p.year === year && p.subjectId === s.id)
                  if (!paper)
                    return (
                      <td key={s.id} className="p-2.5 text-muted-foreground text-xs">
                        —
                      </td>
                    )

                  const practiced = !!paperStates[paper.id]
                  const practiceData = paperStates[paper.id]

                  return (
                    <td key={s.id} className="p-2.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-xs"
                          >
                            開啟PDF →
                          </a>
                          {paper.source === 'gaodian' && (
                            <Badge variant="outline" className="text-xs h-4">
                              高點
                            </Badge>
                          )}
                        </div>
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
                              className="text-xs border rounded px-1 py-0.5 w-24 bg-background"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveNotes(paper.id)
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
                          <button
                            onClick={() => {
                              setEditingNotes(paper.id)
                              setNoteText(practiceData?.notes ?? '')
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground text-left"
                          >
                            {practiceData?.notes ? practiceData.notes : practiced ? '+ 筆記' : ''}
                          </button>
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
