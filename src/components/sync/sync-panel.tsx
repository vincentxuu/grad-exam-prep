'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { clearToken, hashPassphrase, isAuthenticated, storeToken } from '@/lib/auth'
import { localStorageImpl } from '@/lib/storage'
import { downloadState, uploadState } from '@/lib/sync'

interface SyncPanelProps {
  onAuthChange?: (authed: boolean) => void
}

export function SyncPanel({ onAuthChange }: SyncPanelProps) {
  const [passphrase, setPassphrase] = useState('')
  const [authed, setAuthed] = useState(isAuthenticated)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!passphrase.trim()) return
    setLoading(true)
    setStatus(null)
    try {
      const token = await hashPassphrase(passphrase)
      storeToken(token)
      setAuthed(true)
      setPassphrase('')
      onAuthChange?.(true)
      setStatus('已登入')
    } catch {
      setStatus('登入失敗')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    clearToken()
    setAuthed(false)
    onAuthChange?.(false)
    setStatus(null)
  }

  async function handleUpload() {
    setLoading(true)
    setStatus(null)
    try {
      const state = localStorageImpl.getState()
      await uploadState(state)
      setStatus('✓ 已上傳至雲端')
    } catch {
      setStatus('上傳失敗，請確認通行碼正確')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    setLoading(true)
    setStatus(null)
    try {
      const cloudState = await downloadState()
      if (!cloudState) {
        setStatus('雲端無資料，請先上傳')
        return
      }
      localStorageImpl.importJSON(JSON.stringify(cloudState))
      setStatus('✓ 已從雲端載入')
      window.location.reload()
    } catch {
      setStatus('下載失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-medium flex items-center gap-2">
          雲端同步
          <Badge variant={authed ? 'default' : 'outline'} className="text-xs">
            {authed ? '已連線' : '未連線'}
          </Badge>
        </h2>
        {authed && (
          <button
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            登出
          </button>
        )}
      </div>

      {!authed ? (
        <div className="flex gap-2">
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="輸入通行碼…"
            className="flex-1 bg-background border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button size="sm" onClick={handleLogin} disabled={loading || !passphrase.trim()}>
            連線
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleUpload} disabled={loading}>
            ↑ 上傳本地資料
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload} disabled={loading}>
            ↓ 從雲端載入
          </Button>
        </div>
      )}

      {status && (
        <p className={`text-xs ${status.startsWith('✓') ? 'text-green-600' : 'text-destructive'}`}>
          {status}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        未登入時所有資料仍保存在本機 localStorage，不影響備考計畫和閃卡練習。
      </p>
    </div>
  )
}
