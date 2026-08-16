import { mergeDailyLearningRecords, sanitizeDailyLearningRecords } from '@/lib/daily-learning'
import type { DailyLearningRecord } from '@/types/storage'

function record(date: string, updatedAt: number): DailyLearningRecord {
  return {
    date,
    examId: 'im',
    planId: 'im-nocram-6m',
    recallAccuracy: 80,
    taskEvidence: {},
    updatedAt,
  }
}

describe('daily learning persistence helpers', () => {
  it('drops malformed records and evidence without crashing', () => {
    const result = sanitizeDailyLearningRecords({
      bad: {},
      'im:im-nocram-6m:2026-08-16': {
        ...record('2026-08-16', 10),
        recallAccuracy: 120,
        taskEvidence: {
          broken: { taskId: 'broken' },
          valid: {
            taskId: 'valid',
            taskDescription: 'Snapshot',
            accuracy: 75,
            evidence: 'Could explain part of it',
            needsRetest: true,
            retestAt: '2026-08-19',
            updatedAt: 10,
          },
        },
      },
    })

    expect(result.bad).toBeUndefined()
    expect(result['im:im-nocram-6m:2026-08-16'].recallAccuracy).toBeUndefined()
    expect(result['im:im-nocram-6m:2026-08-16'].taskEvidence.broken).toBeUndefined()
    expect(result['im:im-nocram-6m:2026-08-16'].taskEvidence.valid.retestAt).toBe('2026-08-19')
  })

  it('rejects a record whose key does not match its exam and date', () => {
    expect(
      sanitizeDailyLearningRecords({
        'cs:im-nocram-6m:2026-08-16': record('2026-08-16', 10),
      })
    ).toEqual({})
  })

  it('merges devices per day and lets the newest record win', () => {
    const older = record('2026-08-16', 10)
    const newer = { ...record('2026-08-16', 20), recallAccuracy: 95 }
    const otherDay = record('2026-08-17', 15)
    expect(
      mergeDailyLearningRecords(
        { 'im:im-nocram-6m:2026-08-16': older },
        {
          'im:im-nocram-6m:2026-08-16': newer,
          'im:im-nocram-6m:2026-08-17': otherDay,
        }
      )
    ).toEqual({
      'im:im-nocram-6m:2026-08-16': newer,
      'im:im-nocram-6m:2026-08-17': otherDay,
    })
  })
})
