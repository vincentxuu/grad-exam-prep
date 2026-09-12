import { getAuthHeader } from '@/lib/auth'
import type {
  CustomTask,
  DailyLearningIdentity,
  DailyLearningReflection,
  DailyLearningRecord,
  SavedWord,
  StorageState,
  TaskLearningEvidence,
  UserPreferences,
} from '@/types/storage'

async function apiFetch(path: string, options?: RequestInit) {
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options?.headers ?? {}),
    },
  })
}

// ── Saved Words ────────────────────────────────────────────────────

export async function fetchSavedWords(): Promise<SavedWord[]> {
  const res = await apiFetch('/api/user/saved-words')
  if (!res.ok) throw new Error(`fetchSavedWords: ${res.status}`)
  const data: { words: SavedWord[] } = await res.json()
  return data.words
}

export async function addSavedWordServer(word: SavedWord): Promise<void> {
  const res = await apiFetch('/api/user/saved-words', {
    method: 'POST',
    body: JSON.stringify({ word }),
  })
  if (!res.ok) throw new Error(`addSavedWord: ${res.status}`)
}

export async function removeSavedWordServer(headword: string): Promise<void> {
  const res = await apiFetch('/api/user/saved-words', {
    method: 'DELETE',
    body: JSON.stringify({ headword }),
  })
  if (!res.ok) throw new Error(`removeSavedWord: ${res.status}`)
}

// ── Study Plan ─────────────────────────────────────────────────────

export interface StudyPlanData {
  completedTasks: Record<string, boolean>
  customTasks: CustomTask[]
  dailyLearning: Record<string, DailyLearningRecord>
}

export async function fetchStudyPlan(): Promise<StudyPlanData> {
  const res = await apiFetch('/api/user/study-plan')
  if (!res.ok) throw new Error(`fetchStudyPlan: ${res.status}`)
  return res.json()
}

export async function setCompletedTaskServer(taskId: string, done: boolean): Promise<void> {
  await apiFetch('/api/user/study-plan', {
    method: 'POST',
    body: JSON.stringify({ action: 'completeTask', taskId, done }),
  })
}

export async function addCustomTaskServer(customTask: CustomTask): Promise<void> {
  await apiFetch('/api/user/study-plan', {
    method: 'POST',
    body: JSON.stringify({ action: 'addCustomTask', customTask }),
  })
}

export async function updateCustomTaskServer(
  taskId: string,
  updates: Partial<Pick<CustomTask, 'description' | 'subjectTag'>>
): Promise<void> {
  await apiFetch('/api/user/study-plan', {
    method: 'POST',
    body: JSON.stringify({ action: 'updateCustomTask', taskId, updates }),
  })
}

export async function removeCustomTaskServer(taskId: string): Promise<void> {
  await apiFetch('/api/user/study-plan', {
    method: 'POST',
    body: JSON.stringify({ action: 'removeCustomTask', taskId }),
  })
}

export async function saveDailyLearningServer(
  recordKey: string,
  dailyLearning: DailyLearningRecord
): Promise<void> {
  await apiFetch('/api/user/study-plan', {
    method: 'POST',
    body: JSON.stringify({ action: 'saveDailyLearning', recordKey, dailyLearning }),
  })
}

// ── Paper Practice ─────────────────────────────────────────────────

export async function fetchPaperPractice(): Promise<
  Record<string, { practicedAt: number; notes?: string }>
> {
  const res = await apiFetch('/api/user/paper-practice')
  if (!res.ok) throw new Error(`fetchPaperPractice: ${res.status}`)
  const data: { paperPractice: Record<string, { practicedAt: number; notes?: string }> } =
    await res.json()
  return data.paperPractice
}

export async function setPaperPracticeServer(
  paperId: string,
  data: { practicedAt: number; notes?: string } | null
): Promise<void> {
  await apiFetch('/api/user/paper-practice', {
    method: 'POST',
    body: JSON.stringify({ paperId, data }),
  })
}

// ── Preferences ────────────────────────────────────────────────────

export async function fetchPreferences(): Promise<UserPreferences> {
  const res = await apiFetch('/api/user/preferences')
  if (!res.ok) throw new Error(`fetchPreferences: ${res.status}`)
  const data: { preferences: UserPreferences } = await res.json()
  return data.preferences
}

export async function setPreferencesServer(prefs: Partial<UserPreferences>): Promise<void> {
  await apiFetch('/api/user/preferences', {
    method: 'PATCH',
    body: JSON.stringify(prefs),
  })
}

// ── Full state fetch (for initial hydration) ───────────────────────

export async function fetchFullState(): Promise<
  Pick<StorageState, 'completedTasks' | 'customTasks' | 'dailyLearning' | 'paperPractice' | 'savedWords' | 'preferences'> & {
    srsState: Record<string, import('@/types/storage').CardSRSState>
  }
> {
  const [studyPlan, paperPractice, words, preferences, srs] = await Promise.all([
    fetchStudyPlan(),
    fetchPaperPractice(),
    fetchSavedWords(),
    fetchPreferences(),
    apiFetch('/api/srs').then((r) => (r.ok ? r.json() : { states: {} })) as Promise<{
      states: Record<string, import('@/types/storage').CardSRSState>
    }>,
  ])

  return {
    completedTasks: studyPlan.completedTasks,
    customTasks: studyPlan.customTasks,
    dailyLearning: studyPlan.dailyLearning,
    paperPractice,
    savedWords: words,
    preferences,
    srsState: srs.states,
  }
}
