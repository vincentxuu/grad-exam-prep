'use client'

import { CheckCircle2, Circle, X } from '@sketchyicons/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense, use, useState } from 'react'
import { PageLoading } from '@/components/page-loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQueryState } from '@/hooks/use-query-state'
import { EXAM_LABELS, getStudyPlan, getStudyPlans, getSubjectsByExam } from '@/lib/content'
import { buildPhasesWithMeta, calcProgress, getExamDate, getPlanStartDate } from '@/lib/study-plan'
import { useStudyPlanStore } from '@/store/study-plan'
import type { ExamId } from '@/types/content'

interface Props {
  params: Promise<{ exam: string }>
}

export default function PlanPage({ params }: Props) {
  const { exam } = use(params)
  return (
    <Suspense fallback={<PageLoading />}>
      <PlanContent exam={exam} />
    </Suspense>
  )
}

function PlanContent({ exam }: { exam: string }) {
  const plans = getStudyPlans(exam as ExamId)
  const defaultPlanId = plans[0]?.id ?? ''
  const { state, addCustomTask, removeCustomTask, selectPlan } = useStudyPlanStore()
  const preferredPlanId = state.preferences.selectedPlanIds?.[exam as ExamId] ?? defaultPlanId
  const [planId, setPlanId] = useQueryState('plan', preferredPlanId)
  const plan = getStudyPlan(exam as ExamId, planId)
  if (!plan) notFound()

  const subjects = getSubjectsByExam(exam as ExamId)
  const subjectLabel: Record<string, string> = Object.fromEntries(
    subjects.map((s) => [s.id, s.name])
  )

  const [addingPhase, setAddingPhase] = useState<string | null>(null)
  const [newTaskText, setNewTaskText] = useState('')

  const examDate = getExamDate()
  const startDate = getPlanStartDate(examDate, plan.totalMonths)
  const phases = buildPhasesWithMeta(plan, state, startDate)
  const progress = calcProgress(phases)

  const now = new Date()
  const daysToExam = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  function handleAddTask(phaseId: string) {
    const text = newTaskText.trim()
    if (!text) return
    addCustomTask({ phaseId, examId: exam as ExamId, description: text })
    setNewTaskText('')
    setAddingPhase(null)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">{EXAM_LABELS[exam as ExamId]} — 備考計畫</h1>
            <p className="text-muted-foreground text-sm mt-1">
              距考試約 {daysToExam} 天 · 目標考期：
              {examDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })} ·{' '}
              {plan.totalMonths} 個月計畫
            </p>
          </div>
          <Button asChild>
            <Link href={`/${exam}/today?plan=${encodeURIComponent(plan.id)}`}>今天怎麼讀</Link>
          </Button>
        </div>
      </div>

      {/* Plan switcher — 每套計畫的任務進度各自獨立 */}
      {plans.length > 1 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {plans.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={p.id === plan.id ? 'secondary' : 'outline'}
                onClick={() => {
                  setPlanId(p.id)
                  selectPlan(exam as ExamId, p.id)
                }}
              >
                {p.name}
              </Button>
            ))}
          </div>
          {plan.summary && <p className="text-xs text-muted-foreground">{plan.summary}</p>}
        </div>
      )}

      {/* Overall progress */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">整體進度</span>
          <span className="text-muted-foreground">
            {progress.completedTasks} / {progress.totalTasks} 項完成
          </span>
        </div>
        <ProgressBar value={progress.completionPct} />

        {/* Per-subject progress */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2">
          {Object.entries(progress.bySubject)
            .filter(([k]) => k !== '__general__')
            .map(([subjectId, stat]) => (
              <div key={subjectId} className="text-xs">
                <div className="flex justify-between text-muted-foreground mb-0.5">
                  <span className="truncate">{subjectLabel[subjectId] ?? subjectId}</span>
                  <span>{stat.pct}%</span>
                </div>
                <ProgressBar value={stat.pct} slim />
              </div>
            ))}
        </div>
      </div>

      <div className="rounded-lg border border-dashed px-4 py-3 text-xs leading-5 text-muted-foreground">
        這裡只顯示長期進度。任務需到{' '}
        <Link
          href={`/${exam}/today?plan=${encodeURIComponent(plan.id)}`}
          className="font-medium text-foreground underline underline-offset-2"
        >
          今日學習
        </Link>{' '}
        填寫自測結果與完成證據；達到 80% 且不需重測後才會完成。
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <div key={phase.id} className="rounded-lg border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div>
                <h2 className="font-semibold text-sm">{phase.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {phase.targetMonth} · {phase.completedCount}/{phase.totalCount} 完成
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {phase.completionPct}%
                </span>
                <div className="w-16">
                  <ProgressBar value={phase.completionPct} slim />
                </div>
              </div>
            </div>

            <ul className="divide-y">
              {phase.tasks.map((task) => (
                <li key={task.id} className="flex items-start gap-3 px-4 py-2.5 text-sm group">
                  <span
                    className="mt-0.5 shrink-0"
                    aria-label={task.completed ? '已完成' : '尚未完成'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <span
                    className={
                      task.completed ? 'line-through text-muted-foreground flex-1' : 'flex-1'
                    }
                  >
                    <span className="block">{task.description}</span>
                    {task.completionCriteria && (
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground no-underline">
                        完成證據：{task.completionCriteria}
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.subjectTag && (
                      <Badge variant="outline" className="text-xs">
                        {subjectLabel[task.subjectTag]?.split('（')[0] ?? task.subjectTag}
                      </Badge>
                    )}
                    {task.isCustom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                        title="刪除自訂任務"
                        onClick={() => removeCustomTask(task.id)}
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Add custom task */}
            <div className="px-4 py-2 border-t bg-muted/10">
              {addingPhase === phase.id ? (
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTask(phase.id)
                      if (e.key === 'Escape') setAddingPhase(null)
                    }}
                    placeholder="輸入自訂任務…"
                    className="flex-1 h-8 text-sm"
                  />
                  <Button size="sm" onClick={() => handleAddTask(phase.id)}>
                    新增
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setAddingPhase(null)}>
                    取消
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => setAddingPhase(phase.id)}
                >
                  + 新增自訂任務
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressBar({ value, slim }: { value: number; slim?: boolean }) {
  return (
    <div className={`w-full bg-muted rounded-full overflow-hidden ${slim ? 'h-1.5' : 'h-2.5'}`}>
      <div
        className="h-full bg-primary rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
