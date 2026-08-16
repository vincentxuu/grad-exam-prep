'use client'

import { useCallback, useEffect, useState } from 'react'
import { ModelPicker } from '@/components/settings/model-picker'
import { TrialChat } from '@/components/settings/trial-chat'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { clearToken, getAuthHeader, hashPassphrase, isAuthenticated, storeToken } from '@/lib/auth'
import { PROVIDER_CATALOG, providerInfo } from '@/lib/llm/catalog'

interface ConfigState {
  provider?: string
  model?: string
  fallbackProvider?: string
  fallbackModel?: string
  lexiconQuota?: number
  chatQuota?: number
}

interface LoadedConfig {
  config: ConfigState
  effective: { primary: string; fallback: string | null }
  credentials: Record<string, boolean>
}

interface PingResult {
  ok: boolean
  route: string
  reply?: string
  error?: string
  ms: number
}

/** 表單全部用字串，送出時才轉型 —— 清空欄位要能表達「回到預設」。 */
type Form = Record<
  'provider' | 'model' | 'fallbackProvider' | 'fallbackModel' | 'lexiconQuota' | 'chatQuota',
  string
>

/** Radix Select 不接受空字串當值，所以「不設定」要有個自己的哨兵。 */
const NONE = '__none__'

const EMPTY_FORM: Form = {
  provider: '',
  model: '',
  fallbackProvider: '',
  fallbackModel: '',
  lexiconQuota: '',
  chatQuota: '',
}

export function LlmSettings() {
  const [authed, setAuthed] = useState(isAuthenticated)
  const [passphrase, setPassphrase] = useState('')
  const [loaded, setLoaded] = useState<LoadedConfig | null>(null)
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [status, setStatus] = useState<string | null>(null)
  const [ping, setPing] = useState<PingResult | null>(null)
  const [busy, setBusy] = useState<'load' | 'save' | 'test' | null>(null)

  const load = useCallback(async () => {
    setBusy('load')
    setStatus(null)
    try {
      const res = await fetch('/api/llm-config', { headers: getAuthHeader() })
      if (res.status === 401) {
        clearToken()
        setAuthed(false)
        setStatus('通關密語不正確，或伺服器沒有設定 PASSPHRASE_HASH')
        return
      }
      if (!res.ok) throw new Error()
      const data = (await res.json()) as LoadedConfig
      setLoaded(data)
      setForm({
        provider: data.config.provider ?? '',
        model: data.config.model ?? '',
        fallbackProvider: data.config.fallbackProvider ?? '',
        fallbackModel: data.config.fallbackModel ?? '',
        lexiconQuota: data.config.lexiconQuota?.toString() ?? '',
        chatQuota: data.config.chatQuota?.toString() ?? '',
      })
    } catch {
      setStatus('讀取失敗')
    } finally {
      setBusy(null)
    }
  }, [])

  useEffect(() => {
    if (authed) load()
  }, [authed, load])

  async function handleLogin() {
    if (!passphrase.trim()) return
    storeToken(await hashPassphrase(passphrase))
    setPassphrase('')
    setAuthed(true)
  }

  async function handleSave() {
    setBusy('save')
    setStatus(null)
    try {
      const res = await fetch('/api/llm-config', {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lexiconQuota: form.lexiconQuota ? Number(form.lexiconQuota) : undefined,
          chatQuota: form.chatQuota ? Number(form.chatQuota) : undefined,
        }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setStatus(data.error ?? '存檔失敗')
        return
      }
      setStatus('✓ 已存檔。既有的 worker isolate 最多一分鐘後換到新設定。')
      await load()
    } catch {
      setStatus('存檔失敗')
    } finally {
      setBusy(null)
    }
  }

  async function handleTest() {
    setBusy('test')
    setPing(null)
    setStatus(null)
    try {
      const res = await fetch('/api/llm-config/test', {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: form.provider, model: form.model }),
      })
      const data = (await res.json()) as PingResult & { error?: string }
      if (!res.ok) {
        setStatus(data.error ?? '測試失敗')
        return
      }
      setPing(data)
    } catch {
      setStatus('測試失敗')
    } finally {
      setBusy(null)
    }
  }

  if (!authed) {
    return (
      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">
          改的是全站設定，要通關密語。這是同步功能用的那一組。
        </p>
        <div className="flex gap-2">
          <Input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="通關密語"
          />
          <Button onClick={handleLogin} disabled={!passphrase.trim()}>
            登入
          </Button>
        </div>
        {status && <p className="text-destructive text-sm">{status}</p>}
      </div>
    )
  }

  const selected = providerInfo(form.provider)
  const credentialsOk = form.provider ? loaded?.credentials[form.provider] : undefined

  return (
    <div className="space-y-6">
      {loaded && (
        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
          <p>
            目前生效：<code className="font-mono">{loaded.effective.primary}</code>
          </p>
          {loaded.effective.fallback && (
            <p className="text-muted-foreground">
              失敗時退到：<code className="font-mono">{loaded.effective.fallback}</code>
            </p>
          )}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">主要 provider</h2>

        <div className="flex flex-wrap gap-2">
          {PROVIDER_CATALOG.map((p) => {
            const active = form.provider === p.id
            const ready = loaded?.credentials[p.id]
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, provider: active ? '' : p.id }))}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  active ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                {p.label}
                {/* 連線能力沒設好的先標出來，省得選了才發現打不通 */}
                {!ready && (
                  <span className="ml-1.5 opacity-60">
                    ·未設{p.id === 'cloudflare' ? ' binding' : ' key'}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <p className="text-muted-foreground text-xs">
          不選就沿用環境變數，兩邊都沒有才用預設的 Cloudflare Workers AI。
          {selected?.note && ` ${selected.note}`}
        </p>

        {form.provider && credentialsOk === false && (
          <p className="text-destructive text-sm">
            {form.provider === 'cloudflare' ? (
              <>
                這個環境沒有設定 Workers AI 的 <code>AI</code> binding，存了也打不通。
              </>
            ) : (
              <>
                這家還沒設定 {selected?.envKeys.join(' 與 ')}。要先 <code>wrangler secret put</code>{' '}
                再重新部署，存了也打不通。
              </>
            )}
          </p>
        )}

        <div className="space-y-1">
          <span className="text-sm">Model</span>
          <ModelPicker
            provider={form.provider}
            value={form.model}
            onChange={(model) => setForm((f) => ({ ...f, model }))}
            placeholder={selected?.sampleModel ?? '留空沿用環境變數或預設'}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleTest} disabled={busy !== null} variant="outline">
            {busy === 'test' ? '測試中…' : '測試連線'}
          </Button>
          <Button onClick={handleSave} disabled={busy !== null}>
            {busy === 'save' ? '存檔中…' : '存檔'}
          </Button>
          <span className="text-muted-foreground text-xs">測試打的是上面這組，不用先存。</span>
        </div>

        {ping && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              ping.ok
                ? 'border-green-600/40 bg-green-600/10'
                : 'border-destructive/40 bg-destructive/10'
            }`}
          >
            <p className="font-medium">
              {ping.ok ? '✓ 通了' : '✗ 打不通'} —{' '}
              <code className="font-mono text-xs">{ping.route}</code>
              {ping.ok && <span className="text-muted-foreground"> · {ping.ms} ms</span>}
            </p>
            {ping.ok && (
              <p className="text-muted-foreground">模型回：「{ping.reply || '（空）'}」</p>
            )}
            {ping.error && <p className="break-words">{ping.error}</p>}
          </div>
        )}
      </section>

      <section className="rounded-lg border p-4">
        <TrialChat provider={form.provider} model={form.model} />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">備援 provider</h2>
        <p className="text-muted-foreground text-xs">
          主要那家失敗時改打這家。留空就不退，直接回報錯誤。
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="text-sm">Provider</span>
            <Select
              value={form.fallbackProvider || NONE}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  fallbackProvider: v === NONE ? '' : v,
                  // 換了 provider 就清掉 model，不然會留著別家的型號
                  fallbackModel: '',
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>不退</SelectItem>
                {PROVIDER_CATALOG.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-sm">Model</span>
            <ModelPicker
              provider={form.fallbackProvider}
              value={form.fallbackModel}
              onChange={(fallbackModel) => setForm((f) => ({ ...f, fallbackModel }))}
              placeholder={providerInfo(form.fallbackProvider)?.sampleModel}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">每日額度</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm">查詞（預設 60）</span>
            <Input
              type="number"
              inputMode="numeric"
              value={form.lexiconQuota}
              onChange={(e) => setForm((f) => ({ ...f, lexiconQuota: e.target.value }))}
              placeholder="留空 = 預設"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm">對話（預設 40）</span>
            <Input
              type="number"
              inputMode="numeric"
              value={form.chatQuota}
              onChange={(e) => setForm((f) => ({ ...f, chatQuota: e.target.value }))}
              placeholder="留空 = 預設"
            />
          </label>
        </div>
        <p className="text-muted-foreground text-xs">
          對話比查詞貴得多，兩者分開計。快取命中的查詞不計入。
        </p>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={busy !== null}>
          {busy === 'save' ? '存檔中…' : '存檔'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            clearToken()
            setAuthed(false)
            setLoaded(null)
          }}
        >
          登出
        </Button>
        {busy === 'load' && <Badge variant="secondary">讀取中</Badge>}
      </div>

      {status && <p className="text-sm">{status}</p>}

      <p className="text-muted-foreground text-xs leading-relaxed">
        Cloudflare 直接使用部署設定裡的 AI binding。其他 provider 的 API key
        不在這裡設定，也讀不出來 —— D1 存明文，key 留在加密的 wrangler
        secret。這頁只改「洩漏了也不痛」的東西。
      </p>
    </div>
  )
}
