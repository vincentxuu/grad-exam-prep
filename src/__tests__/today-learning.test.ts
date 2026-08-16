import { buildPhasesWithMeta } from '@/lib/study-plan'
import {
  countScheduledDueCards,
  dailyLearningKey,
  defaultRetestDate,
  findLatestTaskEvidence,
  getCurrentPhase,
  getPlanMonth,
  getTodayFocusTasks,
  isTaskEvidencePassing,
  localDateKey,
  recommendedNewCardLimit,
} from '@/lib/today-learning'
import type { StudyPlan } from '@/types/content'
import type {
  CardSRSState,
  DailyLearningRecord,
  StorageState,
  TaskLearningEvidence,
} from '@/types/storage'

const plan: StudyPlan = {
  id: 'today-plan',
  examId: 'im',
  name: 'Today Plan',
  totalMonths: 3,
  examWindow: '次年2月',
  phases: [
    {
      id: 'phase-1',
      name: 'Month 1',
      monthStart: 1,
      monthEnd: 1,
      subjectTags: ['im-it'],
      tasks: [
        { id: 'task-1', description: 'First', completionCriteria: 'Recall it' },
        { id: 'task-2', description: 'Second' },
        { id: 'task-3', description: 'Third' },
      ],
    },
    {
      id: 'phase-2',
      name: 'Months 2–3',
      monthStart: 2,
      monthEnd: 3,
      subjectTags: ['im-mis'],
      tasks: [{ id: 'task-4', description: 'Fourth' }],
    },
  ],
}

function state(completedTasks: Record<string, boolean> = {}): StorageState {
  return {
    completedTasks,
    customTasks: [],
    srsState: {},
    paperPractice: {},
    savedWords: [],
    dailyLearning: {},
    preferences: { examId: 'im' },
  }
}

function srs(cardId: string, nextReview: number): CardSRSState {
  return {
    cardId,
    interval: 1,
    repetitions: 1,
    easeFactor: 2.5,
    nextReview,
    lastReview: 1,
  }
}

function evidence(
  taskId: string,
  updatedAt: number,
  overrides: Partial<TaskLearningEvidence> = {}
): TaskLearningEvidence {
  return {
    taskId,
    taskDescription: 'Task snapshot',
    accuracy: 80,
    evidence: 'Closed-book output',
    needsRetest: false,
    updatedAt,
    ...overrides,
  }
}

function daily(
  date: string,
  taskEvidence: Record<string, TaskLearningEvidence>,
  updatedAt: number
): DailyLearningRecord {
  return { date, examId: 'im', planId: 'today-plan', taskEvidence, updatedAt }
}

describe('today learning selectors', () => {
  const start = new Date('2026-08-01T00:00:00+08:00')

  it('clamps dates before and after the plan, and advances on month boundaries', () => {
    expect(getPlanMonth(start, new Date('2026-07-10T00:00:00+08:00'), 3)).toBe(1)
    expect(getPlanMonth(start, new Date('2026-08-31T23:59:00+08:00'), 3)).toBe(1)
    expect(getPlanMonth(start, new Date('2026-09-01T00:00:00+08:00'), 3)).toBe(2)
    expect(getPlanMonth(start, new Date('2027-02-01T00:00:00+08:00'), 3)).toBe(3)
  })

  it('uses Taipei calendar boundaries regardless of the runtime timezone', () => {
    const utcStart = new Date('2026-07-31T16:00:00.000Z')
    expect(getPlanMonth(utcStart, new Date('2026-08-31T15:59:59.999Z'), 3)).toBe(1)
    expect(getPlanMonth(utcStart, new Date('2026-08-31T16:00:00.000Z'), 3)).toBe(2)
  })

  it('selects the active phase and only the first two unfinished tasks', () => {
    const phases = buildPhasesWithMeta(plan, state({ 'task-1': true }), start)
    const phase = getCurrentPhase(phases, 1)
    expect(phase?.id).toBe('phase-1')
    expect(getTodayFocusTasks(phase).map((task) => task.id)).toEqual(['task-2', 'task-3'])
  })

  it('preserves completion criteria for the daily task', () => {
    const phases = buildPhasesWithMeta(plan, state(), start)
    expect(getTodayFocusTasks(getCurrentPhase(phases, 1), 1)[0].completionCriteria).toBe(
      'Recall it'
    )
  })

  it('keeps a task recorded today visible after it becomes completed', () => {
    const phases = buildPhasesWithMeta(plan, state({ 'task-1': true }), start)
    const focus = getTodayFocusTasks(getCurrentPhase(phases, 1), 2, new Set(['task-1']))
    expect(focus.map((task) => task.id)).toEqual(['task-1', 'task-2'])
  })

  it('counts only cards already scheduled and currently due', () => {
    const now = 10_000
    expect(
      countScheduledDueCards(
        {
          due: srs('due', now - 1),
          boundary: srs('boundary', now),
          future: srs('future', now + 1),
        },
        now
      )
    ).toBe(2)
    expect(countScheduledDueCards({}, now)).toBe(0)
  })

  it('reduces new cards as the scheduled review load grows', () => {
    expect(recommendedNewCardLimit(0)).toBe(20)
    expect(recommendedNewCardLimit(31)).toBe(10)
    expect(recommendedNewCardLimit(61)).toBe(5)
    expect(recommendedNewCardLimit(121)).toBe(0)
  })

  it('uses a local calendar key and keeps exams separate', () => {
    const date = new Date(2026, 7, 16, 23, 59)
    expect(localDateKey(date)).toBe('2026-08-16')
    expect(dailyLearningKey('im', 'plan-a', date)).toBe('im:plan-a:2026-08-16')
    expect(dailyLearningKey('cs', 'plan-a', date)).toBe('cs:plan-a:2026-08-16')
    expect(defaultRetestDate(date)).toBe('2026-08-19')
  })

  it('only passes evidence at 80% with output and no retest', () => {
    expect(isTaskEvidencePassing(evidence('task-1', 1))).toBe(true)
    expect(isTaskEvidencePassing(evidence('task-1', 1, { accuracy: 79 }))).toBe(false)
    expect(isTaskEvidencePassing(evidence('task-1', 1, { evidence: '  ' }))).toBe(false)
    expect(isTaskEvidencePassing(evidence('task-1', 1, { needsRetest: true }))).toBe(false)
  })

  it('finds the newest evidence for a task across daily records', () => {
    const records = {
      'im:today-plan:2026-08-15': daily('2026-08-15', { 'task-1': evidence('task-1', 10) }, 10),
      'im:today-plan:2026-08-16': daily(
        '2026-08-16',
        { 'task-1': evidence('task-1', 20, { accuracy: 90 }) },
        20
      ),
    }
    expect(findLatestTaskEvidence(records, 'task-1')?.accuracy).toBe(90)
  })
})
