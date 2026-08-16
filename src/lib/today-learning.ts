import type { PhaseWithMeta, TaskWithMeta } from '@/lib/study-plan'
import type { CardSRSState } from '@/types/storage'

export function getPlanMonth(planStartDate: Date, now: Date, totalMonths: number): number {
  const monthOffset =
    (now.getFullYear() - planStartDate.getFullYear()) * 12 +
    now.getMonth() -
    planStartDate.getMonth()

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

export function getTodayFocusTasks(phase: PhaseWithMeta | undefined, limit = 2): TaskWithMeta[] {
  if (!phase) return []
  return phase.tasks.filter((task) => !task.completed).slice(0, limit)
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
