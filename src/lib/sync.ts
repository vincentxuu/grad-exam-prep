import { getAuthHeader } from './auth'

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

export interface Note {
  id: string
  content: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export async function fetchNotes(): Promise<Note[]> {
  const res = await apiFetch('/api/notes')
  if (!res.ok) throw new Error(`Fetch notes failed: ${res.status}`)
  return res.json()
}

export async function createNote(content: string, tags: string[]): Promise<Note> {
  const res = await apiFetch('/api/notes', {
    method: 'POST',
    body: JSON.stringify({ content, tags }),
  })
  if (!res.ok) throw new Error(`Create note failed: ${res.status}`)
  return res.json()
}

export async function updateNote(id: string, content: string, tags: string[]): Promise<Note> {
  const res = await apiFetch(`/api/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ content, tags }),
  })
  if (!res.ok) throw new Error(`Update note failed: ${res.status}`)
  return res.json()
}

export async function deleteNote(id: string): Promise<void> {
  const res = await apiFetch(`/api/notes/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Delete note failed: ${res.status}`)
}
