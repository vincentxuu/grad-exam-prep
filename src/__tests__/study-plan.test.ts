import { getStudyPlan, getStudyPlans, studyPlans } from '@/lib/content'
import { buildPhasesWithMeta, calcProgress, getExamDate, getPlanStartDate } from '@/lib/study-plan'
import type { StudyPlan } from '@/types/content'
import type { StorageState } from '@/types/storage'

const mockPlan: StudyPlan = {
  id: 'mock-plan',
  examId: 'im',
  name: 'Mock Plan',
  totalMonths: 8,
  examWindow: '次年2月',
  phases: [
    {
      id: 'phase-1',
      name: 'Phase 1',
      monthStart: 1,
      monthEnd: 2,
      subjectTags: ['im-it'],
      tasks: [
        { id: 't1', description: 'Task 1', subjectTag: 'im-it' },
        { id: 't2', description: 'Task 2', subjectTag: 'im-mis' },
        { id: 't3', description: 'Task 3', subjectTag: 'im-it' },
      ],
    },
    {
      id: 'phase-2',
      name: 'Phase 2',
      monthStart: 3,
      monthEnd: 4,
      subjectTags: ['im-mis'],
      tasks: [
        { id: 't4', description: 'Task 4', subjectTag: 'im-mis' },
        { id: 't5', description: 'Task 5' },
      ],
    },
  ],
}

function makeState(completedIds: string[]): StorageState {
  return {
    completedTasks: Object.fromEntries(completedIds.map((id) => [id, true])),
    customTasks: [],
    srsState: {},
    paperPractice: {},
    preferences: { examId: 'im' },
  }
}

const startDate = new Date('2026-06-01')

describe('buildPhasesWithMeta', () => {
  it('returns 0% when nothing completed', () => {
    const phases = buildPhasesWithMeta(mockPlan, makeState([]), startDate)
    expect(phases[0].completionPct).toBe(0)
    expect(phases[0].completedCount).toBe(0)
    expect(phases[0].totalCount).toBe(3)
  })

  it('marks completed tasks correctly', () => {
    const phases = buildPhasesWithMeta(mockPlan, makeState(['t1', 't3']), startDate)
    expect(phases[0].completedCount).toBe(2)
    expect(phases[0].completionPct).toBe(67)
  })

  it('includes custom tasks in phase', () => {
    const state = makeState([])
    state.customTasks = [
      { id: 'custom-1', phaseId: 'phase-1', examId: 'im', description: 'My task', createdAt: 0 },
    ]
    const phases = buildPhasesWithMeta(mockPlan, state, startDate)
    expect(phases[0].totalCount).toBe(4)
    expect(phases[0].tasks.find((t) => t.id === 'custom-1')?.isCustom).toBe(true)
  })
})

describe('calcProgress', () => {
  it('returns 0% with no completions', () => {
    const phases = buildPhasesWithMeta(mockPlan, makeState([]), startDate)
    const progress = calcProgress(phases)
    expect(progress.totalTasks).toBe(5)
    expect(progress.completedTasks).toBe(0)
    expect(progress.completionPct).toBe(0)
  })

  it('returns 100% when all tasks completed', () => {
    const phases = buildPhasesWithMeta(
      mockPlan,
      makeState(['t1', 't2', 't3', 't4', 't5']),
      startDate
    )
    const progress = calcProgress(phases)
    expect(progress.completionPct).toBe(100)
  })

  it('calculates per-subject progress', () => {
    const phases = buildPhasesWithMeta(mockPlan, makeState(['t1', 't3']), startDate)
    const progress = calcProgress(phases)
    expect(progress.bySubject['im-it'].total).toBe(2)
    expect(progress.bySubject['im-it'].completed).toBe(2)
    expect(progress.bySubject['im-it'].pct).toBe(100)
    expect(progress.bySubject['im-mis'].completed).toBe(0)
  })

  it('groups tasks without subjectTag under __general__', () => {
    const phases = buildPhasesWithMeta(mockPlan, makeState(['t5']), startDate)
    const progress = calcProgress(phases)
    expect(progress.bySubject['__general__'].total).toBe(1)
    expect(progress.bySubject['__general__'].completed).toBe(1)
  })
})

describe('多套計畫的選取', () => {
  it('同一個考試可以有多套計畫，預設的排最前面', () => {
    const imPlans = getStudyPlans('im')
    expect(imPlans.length).toBeGreaterThan(1)
    expect(imPlans[0].isDefault).toBe(true)
  })

  it('不帶 planId 時回傳預設計畫', () => {
    expect(getStudyPlan('im')?.id).toBe(getStudyPlans('im')[0].id)
  })

  it('帶 planId 時回傳指定的那一套', () => {
    expect(getStudyPlan('im', 'im-nocram-6m')?.totalMonths).toBe(6)
  })

  it('planId 不存在時退回預設計畫而不是壞掉', () => {
    expect(getStudyPlan('im', 'no-such-plan')?.id).toBe(getStudyPlans('im')[0].id)
  })

  it('任務 id 在所有計畫之間不重複——否則進度會互相污染', () => {
    const taskIds = studyPlans.flatMap((p) => p.phases.flatMap((ph) => ph.tasks.map((t) => t.id)))
    expect(new Set(taskIds).size).toBe(taskIds.length)
  })

  it('階段 id 也不重複——自訂任務是掛在階段上的', () => {
    const phaseIds = studyPlans.flatMap((p) => p.phases.map((ph) => ph.id))
    expect(new Set(phaseIds).size).toBe(phaseIds.length)
  })
})

describe('getExamDate / getPlanStartDate', () => {
  it('plan start is totalMonths before exam date', () => {
    const exam = new Date('2027-02-01')
    const start = getPlanStartDate(exam, 8)
    expect(start.getFullYear()).toBe(2026)
    expect(start.getMonth()).toBe(5) // June (0-indexed)
  })

  it('getExamDate returns next year February when past June', () => {
    const date = getExamDate(2027)
    expect(date.getMonth()).toBe(1)
    expect(date.getFullYear()).toBe(2027)
  })
})
