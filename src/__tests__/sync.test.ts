import { localStorageImpl } from '@/lib/storage'
import type { TaskLearningEvidence } from '@/types/storage'

// Mock localStorage for tests
const mockStorage: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value
  },
  removeItem: (key: string) => {
    delete mockStorage[key]
  },
}

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

function clearMockStorage() {
  for (const key of Object.keys(mockStorage)) delete mockStorage[key]
}

const learningIdentity = {
  date: '2026-08-16',
  examId: 'im' as const,
  planId: 'im-nocram-6m',
}

function learningEvidence(overrides: Partial<TaskLearningEvidence> = {}): TaskLearningEvidence {
  return {
    taskId: 'im6-1-1',
    taskDescription: '掃過近三年考古題',
    completionCriteria: '列出重複考點',
    accuracy: 85,
    evidence: '閉卷列出 12 個考點',
    needsRetest: false,
    updatedAt: 100,
    ...overrides,
  }
}

beforeEach(clearMockStorage)

describe('local→cloud migration: export/import preserves state', () => {
  it('exports and reimports completed tasks without loss', () => {
    localStorageImpl.setCompletedTask('t1', true)
    localStorageImpl.setCompletedTask('t2', true)

    const exported = localStorageImpl.exportJSON()

    clearMockStorage()

    localStorageImpl.importJSON(exported)
    const state = localStorageImpl.getState()

    expect(state.completedTasks['t1']).toBe(true)
    expect(state.completedTasks['t2']).toBe(true)
  })

  it('exports and reimports custom tasks without loss', () => {
    localStorageImpl.addCustomTask({
      id: 'custom-1',
      phaseId: 'phase-1',
      examId: 'im',
      description: 'My task',
      createdAt: 1000,
    })

    const exported = localStorageImpl.exportJSON()
    clearMockStorage()
    localStorageImpl.importJSON(exported)

    const state = localStorageImpl.getState()
    expect(state.customTasks).toHaveLength(1)
    expect(state.customTasks[0].description).toBe('My task')
  })

  it('exports and reimports SRS state without loss', () => {
    localStorageImpl.updateSRSCard('card-1', {
      cardId: 'card-1',
      interval: 6,
      repetitions: 2,
      easeFactor: 2.5,
      nextReview: 9999999,
      lastReview: 111111,
    })

    const exported = localStorageImpl.exportJSON()
    clearMockStorage()
    localStorageImpl.importJSON(exported)

    const card = localStorageImpl.getSRSCard('card-1')
    expect(card?.interval).toBe(6)
    expect(card?.repetitions).toBe(2)
  })

  it('merges defaults with imported state to prevent missing keys', () => {
    const partialState = { completedTasks: { t1: true } }
    localStorageImpl.importJSON(JSON.stringify(partialState))

    const state = localStorageImpl.getState()
    expect(state.completedTasks['t1']).toBe(true)
    expect(state.customTasks).toEqual([])
    expect(state.srsState).toEqual({})
    expect(state.dailyLearning).toEqual({})
    expect(state.preferences).toBeDefined()
  })

  it('records task evidence and completion atomically', () => {
    expect(localStorageImpl.recordTaskEvidence(learningIdentity, learningEvidence(), true)).toBe(
      true
    )

    const state = localStorageImpl.getState()
    expect(state.completedTasks['im6-1-1']).toBe(true)
    expect(state.dailyLearning['im:im-nocram-6m:2026-08-16'].taskEvidence['im6-1-1'].accuracy).toBe(
      85
    )
  })

  it('keeps a failed task incomplete and preserves evidence when reflection is saved', () => {
    localStorageImpl.setCompletedTask('im6-1-1', true)
    localStorageImpl.recordTaskEvidence(
      learningIdentity,
      learningEvidence({ accuracy: 60, needsRetest: true, retestAt: '2026-08-19' }),
      false
    )
    localStorageImpl.updateDailyLearningReflection(learningIdentity, {
      recallAccuracy: 70,
      outputKind: 'whiteboard',
      tomorrowQuestion: 'Paging 解決什麼問題？',
    })

    const state = localStorageImpl.getState()
    expect(state.completedTasks['im6-1-1']).toBeUndefined()
    expect(state.dailyLearning['im:im-nocram-6m:2026-08-16'].taskEvidence['im6-1-1'].accuracy).toBe(
      60
    )
    expect(state.dailyLearning['im:im-nocram-6m:2026-08-16'].tomorrowQuestion).toContain('Paging')
  })

  it('sanitizes malformed daily learning data during import', () => {
    localStorageImpl.importJSON(
      JSON.stringify({
        dailyLearning: {
          broken: {},
          'im:im-nocram-6m:2026-08-16': {
            ...learningIdentity,
            taskEvidence: { broken: { taskId: 'broken' } },
            updatedAt: 100,
          },
        },
      })
    )

    const state = localStorageImpl.getState()
    expect(state.dailyLearning.broken).toBeUndefined()
    expect(state.dailyLearning['im:im-nocram-6m:2026-08-16'].taskEvidence).toEqual({})
  })

  it('keeps newer local daily records when downloading an older cloud snapshot', () => {
    localStorageImpl.updateDailyLearningReflection(learningIdentity, {
      recallAccuracy: 95,
      outputKind: 'practice',
      tomorrowQuestion: '本機較新的問題',
    })
    const localRecord = localStorageImpl.getState().dailyLearning['im:im-nocram-6m:2026-08-16']

    localStorageImpl.importJSON(
      JSON.stringify({
        dailyLearning: {
          'im:im-nocram-6m:2026-08-16': {
            ...localRecord,
            recallAccuracy: 40,
            updatedAt: localRecord.updatedAt - 1,
          },
        },
      }),
      { mergeDailyLearning: true }
    )

    expect(
      localStorageImpl.getState().dailyLearning['im:im-nocram-6m:2026-08-16'].recallAccuracy
    ).toBe(95)
  })
})

describe('unauthenticated-stays-local behavior', () => {
  it('localStorage operations work without any auth token', () => {
    localStorageImpl.setCompletedTask('local-task', true)
    const state = localStorageImpl.getState()
    expect(state.completedTasks['local-task']).toBe(true)
  })

  it('preferences default to im exam without auth', () => {
    const state = localStorageImpl.getState()
    expect(state.preferences.examId).toBe('im')
  })

  it('preserves the selected study plan across export and import', () => {
    localStorageImpl.setPreferences({ selectedPlanIds: { im: 'im-nocram-6m' } })
    const exported = localStorageImpl.exportJSON()
    clearMockStorage()
    localStorageImpl.importJSON(exported)

    expect(localStorageImpl.getState().preferences.selectedPlanIds?.im).toBe('im-nocram-6m')
  })
})

describe('paper practice persistence', () => {
  it('records practice date for a paper', () => {
    localStorageImpl.setPaperPractice('pp-im-mis-113', { practicedAt: 1717200000000 })
    const state = localStorageImpl.getState()
    expect(state.paperPractice['pp-im-mis-113'].practicedAt).toBe(1717200000000)
  })

  it('removes practice record when set to null', () => {
    localStorageImpl.setPaperPractice('pp-im-mis-113', { practicedAt: 12345 })
    localStorageImpl.setPaperPractice('pp-im-mis-113', null)
    const state = localStorageImpl.getState()
    expect(state.paperPractice['pp-im-mis-113']).toBeUndefined()
  })
})
