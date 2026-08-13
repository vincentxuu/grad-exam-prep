import type {
  CardSRSState,
  CustomTask,
  IStorage,
  SavedWord,
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
    savedWords: [],
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

  addSavedWord(word) {
    const state = load()
    // 同一個字重複加就更新，不要疊出兩張卡
    const existing = state.savedWords.findIndex((w) => w.headword === word.headword)
    if (existing >= 0) {
      state.savedWords[existing] = { ...state.savedWords[existing], ...word }
    } else {
      state.savedWords = [...state.savedWords, word]
    }
    save(state)
  },

  removeSavedWord(headword) {
    const state = load()
    const word = state.savedWords.find((w) => w.headword === headword)
    state.savedWords = state.savedWords.filter((w) => w.headword !== headword)
    // 一併清掉 SRS 狀態，否則 srsState 會留下永遠不會被複習到的孤兒
    if (word) delete state.srsState[word.cardId]
    save(state)
  },

  getSavedWords() {
    return load().savedWords
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
