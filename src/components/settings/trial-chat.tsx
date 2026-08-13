'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAuthHeader } from '@/lib/auth'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  provider: string
  model: string
}

const SUGGESTIONS = [
  '用英文解釋 "hold water" 這個片語，並給一個例句',
  '請用中文說明 subsequent 跟 consequent 差在哪',
  'Correct my English: I very like this book because it teach me many thing.',
]

/**
 * 試用對話：拿選好的 model 隨便聊兩句。
 *
 * 「測試連線」只回答通不通，但通了不代表好用 —— 中文說明寫不寫得順、
 * 糾錯抓不抓得到，得真的講幾句才知道。這裡打的是表單上還沒存的那組。
 *
 * 不留紀錄、不進 D1、不計配額，跟 `/[exam]/chat` 是兩回事。
 */
export function TrialChat({ provider, model }: Props) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [meta, setMeta] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return

    const next: Msg[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setBusy(true)
    setMeta(null)

    try {
      const res = await fetch('/api/llm-config/chat', {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, model, messages: next }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        reply?: string
        route?: string
        error?: string
        ms?: number
      }

      if (!res.ok || !data.ok) {
        setMeta(`✗ ${data.error ?? '呼叫失敗'}`)
        // 失敗時把使用者那則留著，方便直接改 model 再送一次
        return
      }

      setMessages([...next, { role: 'assistant', content: data.reply ?? '' }])
      setMeta(`${data.route} · ${data.ms} ms`)
    } catch {
      setMeta('✗ 呼叫失敗')
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">試用對話</h2>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMessages([])
              setMeta(null)
            }}
          >
            清空
          </Button>
        )}
      </div>

      <p className="text-muted-foreground text-xs">
        打的是上面選的那組，不用先存。通了不代表好用 —— 中文說明順不順、糾錯準不準，講兩句才知道。
      </p>

      {messages.length === 0 && (
        <div className="flex flex-col gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={busy}
              className="rounded-md border px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div className="space-y-2 rounded-lg border p-3">
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}-${m.content.slice(0, 12)}`}
              className={m.role === 'user' ? 'text-right' : ''}
            >
              <span
                className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-left text-sm ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                {m.content}
              </span>
            </div>
          ))}
          {busy && <p className="text-muted-foreground text-sm">…</p>}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="說點什麼試試"
          disabled={busy}
        />
        <Button onClick={() => send(input)} disabled={busy || !input.trim()}>
          送出
        </Button>
      </div>

      {meta && (
        <p
          className={`text-xs ${meta.startsWith('✗') ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          {meta}
        </p>
      )}
    </div>
  )
}
