'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthUser } from '@/lib/auth'
import { clearToken, getAuthHeader, parseTokenPayload, storeToken } from '@/lib/auth'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  getAuthHeader: () => Record<string, string>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(parseTokenPayload())
    setLoading(false)
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
