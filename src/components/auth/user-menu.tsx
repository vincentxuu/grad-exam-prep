'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export function UserMenu() {
  const { user, loading, login, register, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null

  if (user) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
        <button
          onClick={logout}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          登出
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="shrink-0">
        登入
      </Button>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
      }
      setOpen(false)
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗')
    } finally {
      setSubmitting(false)
    }
  }

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false)
          setError(null)
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-background border rounded-lg p-6 w-full max-w-sm mx-4 space-y-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-medium">{mode === 'login' ? '登入' : '註冊'}</h2>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setError(null)
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            className="w-full bg-background border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密碼（至少 6 字）"
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="w-full bg-background border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? '處理中…' : mode === 'login' ? '登入' : '註冊'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {mode === 'login' ? (
            <>
              還沒有帳號？{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError(null)
                }}
                className="underline hover:text-foreground"
              >
                註冊
              </button>
            </>
          ) : (
            <>
              已有帳號？{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
                className="underline hover:text-foreground"
              >
                登入
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal
}
