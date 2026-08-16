import { lexiconCardId, normalizeTerm } from '@/lib/lexicon/normalize'
import type { CardSRSState, IStorage, SavedWord, StorageState } from '@/types/storage'

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function normalizeSavedWords(value: unknown, srsState: Record<string, CardSRSState>): SavedWord[] {
  if (!Array.isArray(value)) return []

  const words = new Map<string, SavedWord>()
  for (const candidate of value) {
    if (!isRecord(candidate) || typeof candidate.headword !== 'string') continue
    const normalized = normalizeTerm(candidate.headword)?.term
    if (!normalized) continue

    const previous = words.get(normalized)
    const source =
      isRecord(candidate.source) && typeof candidate.source.kind === 'string'
        ? (candidate.source as unknown as SavedWord['source'])
        : (previous?.source ?? { kind: 'manual' })
    const canonicalId = lexiconCardId(normalized)
    const oldId = typeof candidate.cardId === 'string' ? candidate.cardId : canonicalId
    const word: SavedWord = {
      headword: normalized,
      cardId: canonicalId,
      addedAt:
        typeof candidate.addedAt === 'number'
          ? Math.min(previous?.addedAt ?? candidate.addedAt, candidate.addedAt)
          : (previous?.addedAt ?? 0),
      source,
      ...(typeof candidate.note === 'string'
        ? { note: candidate.note }
        : previous?.note
          ? { note: previous.note }
          : {}),
    }
    words.set(normalized, word)

    if (oldId !== canonicalId && srsState[oldId]) {
      if (!srsState[canonicalId]) {
        srsState[canonicalId] = { ...srsState[oldId], cardId: canonicalId }
      }
      delete srsState[oldId]
    }
  }
  return [...words.values()]
}

function sanitizeState(value: unknown): StorageState {
  const defaults = defaultState()
  const raw = isRecord(value) ? value : {}
  const rawSrs = isRecord(raw.srsState) ? raw.srsState : {}
  const srsState = Object.fromEntries(
    Object.entries(rawSrs).filter(([, state]) => isRecord(state))
  ) as Record<string, CardSRSState>

  return {
    completedTasks: isRecord(raw.completedTasks)
      ? (raw.completedTasks as StorageState['completedTasks'])
      : defaults.completedTasks,
    customTasks: Array.isArray(raw.customTasks)
      ? (raw.customTasks as StorageState['customTasks'])
      : defaults.customTasks,
    srsState,
    paperPractice: isRecord(raw.paperPractice)
      ? (raw.paperPractice as StorageState['paperPractice'])
      : defaults.paperPractice,
    savedWords: normalizeSavedWords(raw.savedWords, srsState),
    preferences: isRecord(raw.preferences)
      ? { ...defaults.preferences, ...(raw.preferences as Partial<StorageState['preferences']>) }
      : defaults.preferences,
  }
}

function load(): StorageState {
  if (typeof window === 'undefined') return defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return sanitizeState(JSON.parse(raw))
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

  pruneSRSState(validCardIds) {
    const state = load()
    const valid = new Set(validCardIds)
    state.srsState = Object.fromEntries(
      Object.entries(state.srsState).filter(([cardId]) => valid.has(cardId))
    )
    save(state)
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
    const normalized = normalizeTerm(word.headword)?.term ?? word.headword.trim().toLowerCase()
    const normalizedWord = { ...word, headword: normalized, cardId: lexiconCardId(normalized) }
    // 同一個字重複加就更新，不要疊出兩張卡
    const existing = state.savedWords.findIndex(
      (w) => (normalizeTerm(w.headword)?.term ?? w.headword.trim().toLowerCase()) === normalized
    )
    if (existing >= 0) {
      const previous = state.savedWords[existing]
      state.savedWords[existing] = { ...previous, ...normalizedWord }
      if (previous.cardId !== normalizedWord.cardId && state.srsState[previous.cardId]) {
        state.srsState[normalizedWord.cardId] = state.srsState[previous.cardId]
        state.srsState[normalizedWord.cardId].cardId = normalizedWord.cardId
        delete state.srsState[previous.cardId]
      }
    } else {
      state.savedWords = [...state.savedWords, normalizedWord]
    }
    save(state)
  },

  removeSavedWord(headword) {
    const state = load()
    const normalized = normalizeTerm(headword)?.term ?? headword.trim().toLowerCase()
    const word = state.savedWords.find(
      (w) => (normalizeTerm(w.headword)?.term ?? w.headword.trim().toLowerCase()) === normalized
    )
    state.savedWords = state.savedWords.filter(
      (w) => (normalizeTerm(w.headword)?.term ?? w.headword.trim().toLowerCase()) !== normalized
    )
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
    const parsed = sanitizeState(JSON.parse(json))
    save(parsed)
  },
}
