'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthUser } from '@/lib/auth'
import { clearToken, getAuthHeader, parseTokenPayload, storeToken } from '@/lib/auth'
import { fetchFullState } from '@/lib/server-storage'
import { localStorageImpl } from '@/lib/storage'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  getAuthHeader: () => Record<string, string>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function hydrateFromServer() {
  fetchFullState()
    .then((serverState) => {
      const local = localStorageImpl.getState()
      localStorageImpl.importJSON(
        JSON.stringify({
          ...local,
          completedTasks: { ...local.completedTasks, ...serverState.completedTasks },
          customTasks: serverState.customTasks.length > 0 ? serverState.customTasks : local.customTasks,
          srsState: { ...local.srsState, ...serverState.srsState },
          paperPractice: { ...local.paperPractice, ...serverState.paperPractice },
          savedWords: serverState.savedWords.length > 0 ? serverState.savedWords : local.savedWords,
          dailyLearning: { ...local.dailyLearning, ...serverState.dailyLearning },
          preferences: { ...local.preferences, ...serverState.preferences },
        }),
        { mergeDailyLearning: true }
      )
    })
    .catch(() => {})
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const parsed = parseTokenPayload()
    setUser(parsed)
    setLoading(false)
    if (parsed) hydrateFromServer()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data: { token?: string; user?: AuthUser; error?: string } = await res.json()
    if (!res.ok) throw new Error(data.error ?? '登入失敗')
    storeToken(data.token!)
    setUser(data.user!)
    hydrateFromServer()
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data: { token?: string; user?: AuthUser; error?: string } = await res.json()
    if (!res.ok) throw new Error(data.error ?? '註冊失敗')
    storeToken(data.token!)
    setUser(data.user!)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, getAuthHeader }),
    [user, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
