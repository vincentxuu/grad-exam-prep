import type {
  CardSRSState,
  CustomTask,
  IStorage,
  StorageState,
  UserPreferences,
} from '@/types/storage'

const STORAGE_KEY = 'grad-exam-prep-state'

function defaultState(): StorageState {
  return {
    completedTasks: {},
    customTasks: [],
    srsState: {},
    paperPractice: {},
    preferences: { examId: 'im' },
  }
}

function load(): StorageState {
  if (typeof window === 'undefined') return defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...JSON.parse(raw) }
  } catch {
    return defaultState()
  }
}

function save(state: StorageState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage quota exceeded — silent fail
  }
}

export const localStorageImpl: IStorage = {
  getState: load,

  setCompletedTask(taskId, done) {
    const state = load()
    if (done) {
      state.completedTasks[taskId] = true
    } else {
      delete state.completedTasks[taskId]
    }
    save(state)
  },

  addCustomTask(task) {
    const state = load()
    state.customTasks = [...state.customTasks, task]
    save(state)
  },

  updateCustomTask(taskId, updates) {
    const state = load()
    state.customTasks = state.customTasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    save(state)
  },

  removeCustomTask(taskId) {
    const state = load()
    state.customTasks = state.customTasks.filter((t) => t.id !== taskId)
    delete state.completedTasks[taskId]
    save(state)
  },

  updateSRSCard(cardId, cardState) {
    const state = load()
    state.srsState[cardId] = cardState
    save(state)
  },

  getSRSCard(cardId) {
    return load().srsState[cardId] ?? null
  },

  setPaperPractice(paperId, data) {
    const state = load()
    if (data === null) {
      delete state.paperPractice[paperId]
    } else {
      state.paperPractice[paperId] = data
    }
    save(state)
  },

  setPreferences(prefs) {
    const state = load()
    state.preferences = { ...state.preferences, ...prefs }
    save(state)
  },

  exportJSON() {
    return JSON.stringify(load(), null, 2)
  },

  importJSON(json) {
    const parsed = { ...defaultState(), ...JSON.parse(json) }
    save(parsed)
  },
}
