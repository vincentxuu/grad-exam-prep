import { buildPhasesWithMeta } from '@/lib/study-plan'
import {
  countScheduledDueCards,
  getCurrentPhase,
  getPlanMonth,
  getTodayFocusTasks,
  recommendedNewCardLimit,
} from '@/lib/today-learning'
import type { StudyPlan } from '@/types/content'
import type { CardSRSState, StorageState } from '@/types/storage'

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

describe('today learning selectors', () => {
  const start = new Date('2026-08-01T00:00:00+08:00')

  it('clamps dates before and after the plan, and advances on month boundaries', () => {
    expect(getPlanMonth(start, new Date('2026-07-10T00:00:00+08:00'), 3)).toBe(1)
    expect(getPlanMonth(start, new Date('2026-08-31T23:59:00+08:00'), 3)).toBe(1)
    expect(getPlanMonth(start, new Date('2026-09-01T00:00:00+08:00'), 3)).toBe(2)
    expect(getPlanMonth(start, new Date('2027-02-01T00:00:00+08:00'), 3)).toBe(3)
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
})
