import { create } from 'zustand'
import { localStorageImpl } from '@/lib/storage'
import type { ExamId } from '@/types/content'
import type { CustomTask, StorageState } from '@/types/storage'

interface StudyPlanStore {
  state: StorageState
  refresh: () => void
  completeTask: (taskId: string, done: boolean) => void
  addCustomTask: (task: Omit<CustomTask, 'id' | 'createdAt'>) => void
  updateCustomTask: (taskId: string, description: string) => void
  removeCustomTask: (taskId: string) => void
  setExamId: (examId: ExamId) => void
}

export const useStudyPlanStore = create<StudyPlanStore>((set) => ({
  state: localStorageImpl.getState(),

  refresh: () => set({ state: localStorageImpl.getState() }),

  completeTask: (taskId, done) => {
    localStorageImpl.setCompletedTask(taskId, done)
    set({ state: localStorageImpl.getState() })
  },

  addCustomTask: (task) => {
    const custom: CustomTask = {
      ...task,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
    }
    localStorageImpl.addCustomTask(custom)
    set({ state: localStorageImpl.getState() })
  },

  updateCustomTask: (taskId, description) => {
    localStorageImpl.updateCustomTask(taskId, { description })
    set({ state: localStorageImpl.getState() })
  },

  removeCustomTask: (taskId) => {
    localStorageImpl.removeCustomTask(taskId)
    set({ state: localStorageImpl.getState() })
  },

  setExamId: (examId) => {
    localStorageImpl.setPreferences({ examId })
    set({ state: localStorageImpl.getState() })
  },
}))
