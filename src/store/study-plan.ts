import { create } from 'zustand'
import { isAuthenticated } from '@/lib/auth'
import {
  addCustomTaskServer,
  removeCustomTaskServer,
  saveDailyLearningServer,
  setCompletedTaskServer,
  setPreferencesServer,
  updateCustomTaskServer,
} from '@/lib/server-storage'
import { localStorageImpl } from '@/lib/storage'
import type { ExamId } from '@/types/content'
import type {
  CustomTask,
  DailyLearningIdentity,
  DailyLearningReflection,
  StorageState,
  TaskLearningEvidence,
} from '@/types/storage'

function dailyLearningKey(identity: DailyLearningIdentity): string {
  return `${identity.date}::${identity.examId}::${identity.planId}`
}

function syncToServer(fn: () => Promise<void>) {
  if (isAuthenticated()) fn().catch(() => {})
}

interface StudyPlanStore {
  state: StorageState
  refresh: () => void
  hydrateFromServer: (data: Partial<StorageState>) => void
  completeTask: (taskId: string, done: boolean) => void
  addCustomTask: (task: Omit<CustomTask, 'id' | 'createdAt'>) => void
  updateCustomTask: (taskId: string, description: string) => void
  removeCustomTask: (taskId: string) => void
  recordTaskEvidence: (
    identity: DailyLearningIdentity,
    evidence: TaskLearningEvidence,
    completed: boolean
  ) => boolean
  saveDailyReflection: (
    identity: DailyLearningIdentity,
    reflection: DailyLearningReflection
  ) => boolean
  selectPlan: (examId: ExamId, planId: string) => void
  setExamId: (examId: ExamId) => void
}

export const useStudyPlanStore = create<StudyPlanStore>((set) => ({
  state: localStorageImpl.getState(),

  refresh: () => set({ state: localStorageImpl.getState() }),

  hydrateFromServer: (data) => {
    set((prev) => ({ state: { ...prev.state, ...data } }))
  },

  completeTask: (taskId, done) => {
    localStorageImpl.setCompletedTask(taskId, done)
    set({ state: localStorageImpl.getState() })
    syncToServer(() => setCompletedTaskServer(taskId, done))
  },

  addCustomTask: (task) => {
    const custom: CustomTask = {
      ...task,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
    }
    localStorageImpl.addCustomTask(custom)
    set({ state: localStorageImpl.getState() })
    syncToServer(() => addCustomTaskServer(custom))
  },

  updateCustomTask: (taskId, description) => {
    localStorageImpl.updateCustomTask(taskId, { description })
    set({ state: localStorageImpl.getState() })
    syncToServer(() => updateCustomTaskServer(taskId, { description }))
  },

  removeCustomTask: (taskId) => {
    localStorageImpl.removeCustomTask(taskId)
    set({ state: localStorageImpl.getState() })
    syncToServer(() => removeCustomTaskServer(taskId))
  },

  recordTaskEvidence: (identity, evidence, completed) => {
    const saved = localStorageImpl.recordTaskEvidence(identity, evidence, completed)
    if (saved) {
      const state = localStorageImpl.getState()
      set({ state })
      const key = dailyLearningKey(identity)
      const record = state.dailyLearning[key]
      if (record) syncToServer(() => saveDailyLearningServer(key, record))
    }
    return saved
  },

  saveDailyReflection: (identity, reflection) => {
    const saved = localStorageImpl.updateDailyLearningReflection(identity, reflection)
    if (saved) {
      const state = localStorageImpl.getState()
      set({ state })
      const key = dailyLearningKey(identity)
      const record = state.dailyLearning[key]
      if (record) syncToServer(() => saveDailyLearningServer(key, record))
    }
    return saved
  },

  selectPlan: (examId, planId) => {
    const preferences = localStorageImpl.getState().preferences
    const updated = { selectedPlanIds: { ...preferences.selectedPlanIds, [examId]: planId } }
    localStorageImpl.setPreferences(updated)
    set({ state: localStorageImpl.getState() })
    syncToServer(() => setPreferencesServer(updated))
  },

  setExamId: (examId) => {
    localStorageImpl.setPreferences({ examId })
    set({ state: localStorageImpl.getState() })
    syncToServer(() => setPreferencesServer({ examId }))
  },
}))
