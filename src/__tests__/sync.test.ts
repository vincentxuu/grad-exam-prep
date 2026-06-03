import { localStorageImpl } from '@/lib/storage'
import type { StorageState } from '@/types/storage'

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
    expect(state.preferences).toBeDefined()
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
