'use client'

import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  CircleDot,
  Clock,
  ListChecks,
  Repeat2,
  Target,
} from '@sketchyicons/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type ReactNode, Suspense, use, useMemo, useState } from 'react'
import { PageLoading } from '@/components/page-loading'
import {
  DailyReflectionForm,
  TaskEvidenceForm,
} from '@/components/study-plan/learning-evidence-forms'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQueryState } from '@/hooks/use-query-state'
import { EXAM_LABELS, getStudyPlan, getStudyPlans, getSubjectsByExam } from '@/lib/content'
import { buildPhasesWithMeta, getExamDate, getPlanStartDate } from '@/lib/study-plan'
import {
  type RecommendedLesson,
  countScheduledDueCards,
  dailyLearningKey,
  findLatestTaskEvidence,
  getCurrentPhase,
  getPlanMonth,
  getTaskLearningHref,
  getTodayFocusTasks,
  getTodayRecommendedLessons,
  isTaskEvidencePassing,
  localDateKey,
  recommendedNewCardLimit,
} from '@/lib/today-learning'
import { useStudyPlanStore } from '@/store/study-plan'
import type { ExamId } from '@/types/content'

interface Props {
  params: Promise<{ exam: string }>
}

const STEP_META = [
  { number: '01', label: '先提取', icon: Brain },
  { number: '02', label: '推進主線', icon: BookOpenCheck },
  { number: '03', label: '關書輸出', icon: CircleDot },
  { number: '04', label: '間隔複習', icon: Repeat2 },
  { number: '05', label: '留下明天的起點', icon: CheckCircle2 },
] as const

export default function TodayPage(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <TodayContent {...props} />
    </Suspense>
  )
}

function TodayContent({ params }: Props) {
  const { exam } = use(params)
  if (exam !== 'im' && exam !== 'cs') notFound()

  const examId = exam as ExamId
  const plans = getStudyPlans(examId)
  const defaultPlanId = plans[0]?.id ?? ''
  const { state, recordTaskEvidence, saveDailyReflection, selectPlan } = useStudyPlanStore()
  const preferredPlanId = state.preferences.selectedPlanIds?.[examId] ?? defaultPlanId
  const [planId, setPlanId] = useQueryState('plan', preferredPlanId)
  const plan = getStudyPlan(examId, planId)
  if (!plan) notFound()
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)

  const examDate = getExamDate()
  const fallbackStartDate = getPlanStartDate(examDate, plan.totalMonths)
  const preferredStartDate = state.preferences.planStartDate
    ? new Date(state.preferences.planStartDate)
    : fallbackStartDate
  const planStartDate = Number.isNaN(preferredStartDate.getTime())
    ? fallbackStartDate
    : preferredStartDate
  const today = new Date()
  const phases = buildPhasesWithMeta(plan, state, planStartDate)
  const planMonth = getPlanMonth(planStartDate, today, plan.totalMonths)
  const currentPhase = getCurrentPhase(phases, planMonth)
  const dueCount = countScheduledDueCards(state.srsState, today.getTime())
  const newCardLimit = recommendedNewCardLimit(dueCount)
  const date = localDateKey(today)
  const recordKey = dailyLearningKey(examId, plan.id, today)
  const todayRecord = state.dailyLearning[recordKey]
  const recordedToday = new Set(Object.keys(todayRecord?.taskEvidence ?? {}))
  const focusTasks = getTodayFocusTasks(currentPhase, 2, recordedToday)
  const identity = { date, examId, planId: plan.id }
  const subjectLabels = useMemo(
    () =>
      Object.fromEntries(getSubjectsByExam(examId).map((subject) => [subject.id, subject.name])),
    [examId]
  )
  const planHref = `/${exam}/plan?plan=${encodeURIComponent(plan.id)}`

  const focusSubjects = useMemo(
    () => [...new Set(focusTasks.map((t) => t.subjectTag).filter(Boolean))] as string[],
    [focusTasks]
  )
  const recommended = useMemo(
    () => getTodayRecommendedLessons(examId, today, focusSubjects.length > 0 ? focusSubjects : undefined),
    [examId, focusSubjects]
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">
              {today.toLocaleDateString('zh-TW', {
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
            <div>
              <h1 className="text-2xl font-bold font-display tracking-tight sm:text-3xl">今天只走一輪</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                先把昨天的知識叫回來，再推進新內容。今天的完成不是「看過」，而是至少有一次不看資料的正確輸出。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Badge variant="outline">第 {planMonth} 個月</Badge>
            <Badge variant="secondary">{dueCount} 張已排程到期</Badge>
            <Badge variant="secondary">新卡最多 {newCardLimit} 張</Badge>
          </div>
        </div>
        <div className="border-t bg-muted/30 px-5 py-3 text-xs text-muted-foreground sm:px-7">
          {EXAM_LABELS[examId]} · {plan.name} · {currentPhase?.name ?? '尚未設定階段'}
        </div>
      </section>

      {plans.length > 1 ? (
        <div className="flex flex-wrap gap-2" aria-label="切換備考計畫">
          {plans.map((candidate) => (
            <Button
              key={candidate.id}
              size="sm"
              variant={candidate.id === plan.id ? 'secondary' : 'outline'}
              onClick={() => {
                setPlanId(candidate.id)
                selectPlan(examId, candidate.id)
              }}
            >
              {candidate.name}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <ol className="relative space-y-3 before:absolute before:bottom-8 before:left-[1.58rem] before:top-8 before:w-px before:bg-border">
          <LearningStep meta={STEP_META[0]}>
            <p className="text-sm leading-6 text-muted-foreground">
              關掉昨天的筆記，用 5–10
              分鐘寫出三個核心概念。先標記「穩定、模糊、忘記」，再只回查模糊與忘記的部分。
            </p>
          </LearningStep>

          <LearningStep meta={STEP_META[1]}>
            {recommended.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-semibold tracking-wide text-primary uppercase">今日推薦課程</p>
                </div>
                {recommended.map((rec) => (
                  <RecommendedLessonCard key={rec.lesson.id} rec={rec} exam={exam} />
                ))}
              </div>
            )}

            {focusTasks.length > 0 && (
              <div className="space-y-3 mt-4">
                {focusTasks.map((task) => {
                  const latestEvidence = findLatestTaskEvidence(state.dailyLearning, task.id)
                  const isOpen = openTaskId === task.id
                  const learningHref = getTaskLearningHref(examId, task.subjectTag)
                  return (
                    <div key={task.id} className="rounded-lg border bg-background p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-medium leading-5">{task.description}</p>
                          {task.completionCriteria ? (
                            <p className="text-xs leading-5 text-muted-foreground">
                              通過標準：{task.completionCriteria}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {task.subjectTag ? (
                              <span className="text-xs text-muted-foreground">
                                {subjectLabels[task.subjectTag] ?? task.subjectTag}
                              </span>
                            ) : null}
                            {latestEvidence?.needsRetest ? (
                              <Badge
                                variant="outline"
                                className="border-amber-500/50 text-amber-700 dark:text-amber-300"
                              >
                                待重測 · {latestEvidence.accuracy}% · {latestEvidence.retestAt}
                              </Badge>
                            ) : null}
                            {latestEvidence && isTaskEvidencePassing(latestEvidence) ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/50 text-emerald-700 dark:text-emerald-300"
                              >
                                已通過 · {latestEvidence.accuracy}%
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                          {learningHref ? (
                            <Button asChild type="button" size="sm" variant="outline">
                              <Link href={learningHref}>開啟課程</Link>
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            size="sm"
                            variant={latestEvidence ? 'outline' : 'default'}
                            onClick={() => setOpenTaskId(isOpen ? null : task.id)}
                          >
                            {isOpen ? '收起' : latestEvidence ? '更新成果' : '記錄成果'}
                          </Button>
                        </div>
                      </div>
                      {isOpen ? (
                        <TaskEvidenceForm
                          taskId={task.id}
                          existing={latestEvidence}
                          today={today}
                          onCancel={() => setOpenTaskId(null)}
                          onSave={(evidence) => {
                            const completeEvidence = {
                              ...evidence,
                              taskDescription: task.description,
                              ...(task.completionCriteria
                                ? { completionCriteria: task.completionCriteria }
                                : {}),
                            }
                            const saved = recordTaskEvidence(
                              identity,
                              completeEvidence,
                              isTaskEvidencePassing(completeEvidence)
                            )
                            if (saved) setOpenTaskId(null)
                            return saved
                          }}
                        />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}

            {recommended.length === 0 && focusTasks.length === 0 && (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                本階段任務已完成。今天不必硬開新進度，改做混合自測與錯題重測。
              </div>
            )}
          </LearningStep>

          <LearningStep meta={STEP_META[2]}>
            <div className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>從今天的主線挑一個概念，不看教材完成其中一種輸出：</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                <li className="rounded-lg bg-muted/50 px-3 py-2">白紙重建概念與因果鏈</li>
                <li className="rounded-lg bg-muted/50 px-3 py-2">默寫程式、公式或作答框架</li>
                <li className="rounded-lg bg-muted/50 px-3 py-2">口頭解釋三分鐘並找出跳步</li>
                <li className="rounded-lg bg-muted/50 px-3 py-2">做一題無提示的章節題</li>
              </ul>

              {recommended.length > 0 && (
                <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3 space-y-2">
                  <p className="text-xs font-semibold text-primary">用這些題目驗證今天學的：</p>
                  <div className="flex flex-wrap gap-2">
                    {recommended.map((rec) => (
                      <Button key={rec.lesson.id} asChild size="sm" variant="outline">
                        <Link href={rec.questionHref}>
                          {rec.catalog.subjectLabel} 題庫
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </LearningStep>

          <LearningStep meta={STEP_META[3]}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">
                  {dueCount > 0 ? `先清掉 ${dueCount} 張到期卡` : '目前沒有已排程到期卡'}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  到期卡優先；負荷過高時，新卡上限會自動下降，避免每天越欠越多。
                </p>
              </div>
              <Button asChild size="sm" variant={dueCount > 0 ? 'default' : 'outline'}>
                <Link href={`/${exam}/flashcards`}>
                  前往閃卡
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </LearningStep>

          <LearningStep meta={STEP_META[4]}>
            <DailyReflectionForm
              existing={todayRecord}
              onSave={(values) => saveDailyReflection(identity, values)}
            />
          </LearningStep>
        </ol>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {recommended.length > 0 && (
            <section className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                今日科目
              </h2>
              <div className="mt-3 space-y-2">
                {recommended.map((rec) => (
                  <Link
                    key={rec.catalog.subjectId}
                    href={`/${exam}/subjects/${rec.catalog.subjectId}`}
                    className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-xs transition-colors hover:bg-muted/50"
                  >
                    <span className="font-medium">{rec.catalog.subjectLabel}</span>
                    <span className="text-muted-foreground">{rec.catalog.lessons.length} 堂課</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border p-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">本階段進度</h2>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums">
              {currentPhase?.completionPct ?? 0}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {currentPhase?.completedCount ?? 0} / {currentPhase?.totalCount ?? 0} 項完成
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${currentPhase?.completionPct ?? 0}%` }}
              />
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link href={planHref}>查看完整計畫</Link>
            </Button>
          </section>

          <section className="rounded-xl border bg-muted/30 p-4">
            <h2 className="text-sm font-semibold">今天的負荷規則</h2>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
              <li>先提取，再看新內容。</li>
              <li>一次只推進一至兩項主線。</li>
              <li>答不出來才回查，不從頭重讀。</li>
              <li>能連續維持一週，比今天硬撐更重要。</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}

function RecommendedLessonCard({ rec, exam }: { rec: RecommendedLesson; exam: string }) {
  return (
    <div className="group rounded-lg border border-primary/20 bg-gradient-to-r from-primary/[0.04] to-transparent p-3 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {rec.catalog.subjectLabel}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {rec.lesson.estimatedMinutes} 分
            </span>
          </div>
          <p className="text-sm font-medium leading-5">{rec.lesson.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{rec.lesson.summary}</p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href={rec.href}>
            開始
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function LearningStep({
  meta,
  children,
}: {
  meta: (typeof STEP_META)[number]
  children: ReactNode
}) {
  const Icon = meta.icon
  return (
    <li className="relative grid grid-cols-[3.25rem_minmax(0,1fr)]">
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border bg-background text-primary shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <section className="min-w-0 rounded-xl border bg-card p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="font-mono text-[0.65rem] font-semibold tracking-widest text-muted-foreground">
            {meta.number}
          </span>
          <h2 className="font-semibold">{meta.label}</h2>
        </div>
        {children}
      </section>
    </li>
  )
}
