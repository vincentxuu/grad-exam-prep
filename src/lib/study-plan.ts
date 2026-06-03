import type { ExamId, StudyPhase, StudyPlan, StudyTask } from '@/types/content'
import type { CustomTask, StorageState } from '@/types/storage'

export interface TaskWithMeta extends StudyTask {
  isCustom: boolean
  completed: boolean
}

export interface PhaseWithMeta extends Omit<StudyPhase, 'tasks'> {
  tasks: TaskWithMeta[]
  completedCount: number
  totalCount: number
  completionPct: number
  targetMonth?: string
}

export interface PlanProgress {
  totalTasks: number
  completedTasks: number
  completionPct: number
  bySubject: Record<string, { total: number; completed: number; pct: number }>
}

export function buildPhasesWithMeta(
  plan: StudyPlan,
  storageState: StorageState,
  planStartDate: Date
): PhaseWithMeta[] {
  return plan.phases.map((phase) => {
    const customTasksForPhase: StudyTask[] = storageState.customTasks
      .filter((ct) => ct.phaseId === phase.id)
      .map((ct) => ({ id: ct.id, description: ct.description, subjectTag: ct.subjectTag }))

    const allTasks: TaskWithMeta[] = [
      ...phase.tasks.map((t) => ({
        ...t,
        isCustom: false,
        completed: !!storageState.completedTasks[t.id],
      })),
      ...customTasksForPhase.map((t) => ({
        ...t,
        isCustom: true,
        completed: !!storageState.completedTasks[t.id],
      })),
    ]

    const completedCount = allTasks.filter((t) => t.completed).length
    const totalCount = allTasks.length
    const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    const phaseStart = new Date(planStartDate)
    phaseStart.setMonth(phaseStart.getMonth() + phase.monthStart - 1)

    return {
      ...phase,
      tasks: allTasks,
      completedCount,
      totalCount,
      completionPct,
      targetMonth: phaseStart.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' }),
    }
  })
}

export function calcProgress(phases: PhaseWithMeta[]): PlanProgress {
  const totalTasks = phases.reduce((sum, p) => sum + p.totalCount, 0)
  const completedTasks = phases.reduce((sum, p) => sum + p.completedCount, 0)
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const bySubject: PlanProgress['bySubject'] = {}
  for (const phase of phases) {
    for (const task of phase.tasks) {
      const key = task.subjectTag ?? '__general__'
      if (!bySubject[key]) bySubject[key] = { total: 0, completed: 0, pct: 0 }
      bySubject[key].total++
      if (task.completed) bySubject[key].completed++
    }
  }
  for (const key of Object.keys(bySubject)) {
    const s = bySubject[key]
    s.pct = Math.round((s.completed / s.total) * 100)
  }

  return { totalTasks, completedTasks, completionPct, bySubject }
}

export function getExamDate(year?: number): Date {
  const now = new Date()
  const targetYear = year ?? (now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear())
  return new Date(targetYear, 1, 1)
}

export function getPlanStartDate(examDate: Date, totalMonths: number): Date {
  const start = new Date(examDate)
  start.setMonth(start.getMonth() - totalMonths)
  return start
}
