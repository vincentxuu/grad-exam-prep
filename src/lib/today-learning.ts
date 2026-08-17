import type { PhaseWithMeta, TaskWithMeta } from '@/lib/study-plan'
import type { ExamId } from '@/types/content'
import type { CardSRSState, DailyLearningRecord, TaskLearningEvidence } from '@/types/storage'
import { getLearningCatalogs } from './learning-catalog'
import type { LearningCatalog, LearningLesson } from './learning'

const EMPTY_TASK_IDS: ReadonlySet<string> = new Set()
const TAIPEI_CALENDAR = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: 'numeric',
})

function taipeiYearMonth(date: Date): { year: number; month: number } {
  const parts = TAIPEI_CALENDAR.formatToParts(date)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)

  return { year, month }
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function dailyLearningKey(examId: ExamId, planId: string, date: Date): string {
  return `${examId}:${planId}:${localDateKey(date)}`
}

export function isTaskEvidencePassing(evidence: TaskLearningEvidence): boolean {
  return evidence.accuracy >= 80 && evidence.evidence.trim().length > 0 && !evidence.needsRetest
}

export function findLatestTaskEvidence(
  records: Record<string, DailyLearningRecord>,
  taskId: string
): TaskLearningEvidence | undefined {
  let latest: TaskLearningEvidence | undefined
  for (const record of Object.values(records)) {
    const evidence = record.taskEvidence[taskId]
    if (evidence && (!latest || evidence.updatedAt > latest.updatedAt)) latest = evidence
  }
  return latest
}

export function defaultRetestDate(date: Date): string {
  const result = new Date(date)
  result.setDate(result.getDate() + 3)
  return localDateKey(result)
}

export function getPlanMonth(planStartDate: Date, now: Date, totalMonths: number): number {
  const start = taipeiYearMonth(planStartDate)
  const current = taipeiYearMonth(now)
  const monthOffset = (current.year - start.year) * 12 + current.month - start.month

  return Math.min(totalMonths, Math.max(1, monthOffset + 1))
}

export function getCurrentPhase(
  phases: PhaseWithMeta[],
  planMonth: number
): PhaseWithMeta | undefined {
  return (
    phases.find((phase) => phase.monthStart <= planMonth && phase.monthEnd >= planMonth) ??
    phases.at(planMonth <= 1 ? 0 : -1)
  )
}

export function getTodayFocusTasks(
  phase: PhaseWithMeta | undefined,
  limit = 2,
  recordedToday: ReadonlySet<string> = EMPTY_TASK_IDS
): TaskWithMeta[] {
  if (!phase) return []
  return phase.tasks.filter((task) => !task.completed || recordedToday.has(task.id)).slice(0, limit)
}

/**
 * 「今日學習」只顯示已進入 SRS 的卡片；尚未看過的整份題庫不算積欠複習。
 */
export function countScheduledDueCards(states: Record<string, CardSRSState>, now: number): number {
  return Object.values(states).filter((state) => state.nextReview <= now).length
}

export function recommendedNewCardLimit(dueCount: number): number {
  if (dueCount > 120) return 0
  if (dueCount > 60) return 5
  if (dueCount > 30) return 10
  return 20
}

export function getTaskLearningHref(
  examId: ExamId,
  subjectTag?: string | null
): string | undefined {
  return subjectTag ? `/${examId}/subjects/${subjectTag}` : undefined
}

export interface RecommendedLesson {
  catalog: LearningCatalog
  lesson: LearningLesson
  href: string
  questionHref: string
}

export function getTodayRecommendedLessons(examId: string, date: Date): RecommendedLesson[] {
  const catalogs = getLearningCatalogs().filter((c) => c.examId === examId && c.lessons.length > 0)
  if (catalogs.length === 0) return []

  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000
  )

  const picked: RecommendedLesson[] = []
  const subjectOrder = [...catalogs].sort((a, b) => {
    const priorityMap: Record<string, number> = {
      'im-it': 0,
      'im-mis': 1,
      'im-stat': 2,
      'im-english': 3,
    }
    return (priorityMap[a.subjectId] ?? 99) - (priorityMap[b.subjectId] ?? 99)
  })

  const startIndex = dayOfYear % subjectOrder.length
  for (let i = 0; i < Math.min(2, subjectOrder.length); i++) {
    const catalog = subjectOrder[(startIndex + i) % subjectOrder.length]
    const lessonIndex = dayOfYear % catalog.lessons.length
    const lesson = catalog.lessons[lessonIndex]
    const topicId = lesson.coveredSubtopicIds[0]?.replace(/-[^-]+$/, '') ?? ''
    picked.push({
      catalog,
      lesson,
      href: `${catalog.lessonBaseHref}/${lesson.id}`,
      questionHref: `/${examId}/questions?subject=${catalog.subjectId}${topicId ? `&topic=${topicId}` : ''}`,
    })
  }

  return picked
}
