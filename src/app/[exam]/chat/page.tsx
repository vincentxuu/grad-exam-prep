'use client'

import { notFound } from 'next/navigation'
import { Suspense, use, useCallback, useEffect, useRef, useState } from 'react'
import { Composer } from '@/components/chat/composer'
import { MessageBubble } from '@/components/chat/message-bubble'
import { SessionSummaryView } from '@/components/chat/session-summary'
import { LookupSheet } from '@/components/lexicon/lookup-sheet'
import { PageLoading } from '@/components/page-loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSpeech } from '@/hooks/use-speech'
import { useWordLookup } from '@/hooks/use-word-lookup'
import { pickTargetWords } from '@/lib/chat/target-words'
import { EXAM_LABELS, getSubjectsByExam } from '@/lib/content'
import { fromSavedWord } from '@/lib/review-card'
import { initialCardState } from '@/lib/srs'
import { localStorageImpl } from '@/lib/storage'
import type { ChatMessage, ChatSession, Correction, SessionSummary } from '@/types/chat'
import { MAX_SESSION_MESSAGES } from '@/types/chat'
import type { ExamId } from '@/types/content'

interface Props {
  params: Promise<{ exam: string }>
}

type Phase = 'setup' | 'chatting' | 'summary'

export default function ChatPage(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ChatContent {...props} />
    </Suspense>
  )
}

function ChatContent({ params }: Props) {
  const { exam } = use(params)
  const subjects = getSubjectsByExam(exam as ExamId)
  if (!subjects.length) notFound()

  const [phase, setPhase] = useState<Phase>('setup')
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<SessionSummary | null>(null)

  const [topic, setTopic] = useState('')
  const [correctMode, setCorrectMode] = useState(false)
  const [savedCount, setSavedCount] = useState(0)

  const lookup = useWordLookup(true)
  const { speak, speakingId } = useSpeech()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSavedCount(localStorageImpl.getSavedWords().length)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const targets = useCallback(() => {
    const cards = localStorageImpl.getSavedWords().map(fromSavedWord)
    return pickTargetWords(cards, (id) => localStorageImpl.getSRSCard(id) ?? initialCardState(id))
  }, [])

  async function start() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim() || undefined,
          correctMode,
          targetWords: targets(),
          persona: lookup.persona,
        }),
      })
      const body = (await res.json()) as {
        session?: ChatSession
        opening?: string
        error?: string
      }
      if (!res.ok || !body.session) {
        setError(body.error ?? '無法開始對話')
        return
      }
      setSession(body.session)
      setMessages([
        {
          id: 'opening',
          role: 'assistant',
          content: body.opening ?? '',
          createdAt: Date.now(),
        },
      ])
      setPhase('chatting')
    } catch {
      setError('網路連線失敗')
    } finally {
      setBusy(false)
    }
  }

  async function send(text: string) {
    if (!session) return
    setBusy(true)
    setError(null)
    setStreaming('')

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    }
    setMessages((m) => [...m, optimistic])

    try {
      const res = await fetch(`/api/chat/${session.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, persona: lookup.persona }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? '送出失敗')
        return
      }

      // 訊息數到頂：不是錯誤，請使用者收尾
      const contentType = res.headers.get('Content-Type') ?? ''
      if (!contentType.includes('text/event-stream')) {
        const body = (await res.json().catch(() => ({}))) as { sessionFull?: boolean }
        if (body.sessionFull) {
          setError(`這場對話已達 ${MAX_SESSION_MESSAGES} 則上限，結束看總結吧。`)
          return
        }
        setError('送出失敗')
        return
      }

      let userMessageId: string | null = null
      let acc = ''

      await readSse(res, (e) => {
        if (e.event === 'meta') {
          userMessageId = e.data.userMessageId
          setMessages((m) =>
            m.map((msg) =>
              msg.id === optimistic.id
                ? { ...msg, id: e.data.userMessageId, usedWords: e.data.usedWords }
                : msg
            )
          )
        } else if (e.event === 'delta') {
          acc += e.data.text
          setStreaming(acc)
        } else if (e.event === 'done') {
          setMessages((m) => [
            ...m,
            {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: e.data.content,
              createdAt: Date.now(),
            },
          ])
          setStreaming('')
        } else if (e.event === 'error') {
          setError(e.data.message)
          setStreaming('')
        }
      })

      // 糾錯是獨立的一次呼叫，晚一點到不影響對話節奏
      if (session.correctMode && userMessageId) {
        fetch(`/api/chat/${session.id}/correct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId: userMessageId, content: text }),
        })
          .then((r) => r.json() as Promise<{ corrections?: Correction[] }>)
          .then((body) => {
            const corrections = body.corrections
            if (!corrections?.length) return
            setMessages((m) =>
              m.map((msg) => (msg.id === userMessageId ? { ...msg, corrections } : msg))
            )
          })
          .catch(() => {
            // 糾錯失敗不影響對話
          })
      }
    } catch {
      setError('網路連線失敗')
    } finally {
      setBusy(false)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  async function finish() {
    if (!session) return
    setBusy(true)
    try {
      const res = await fetch(`/api/chat/${session.id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knownWords: localStorageImpl.getSavedWords().map((w) => w.headword),
        }),
      })
      const body = (await res.json()) as { summary?: SessionSummary; error?: string }
      if (res.ok && body.summary) {
        setSummary(body.summary)
        setPhase('summary')
      } else {
        setError(body.error ?? '結束失敗')
      }
    } finally {
      setBusy(false)
    }
  }

  function restart() {
    setPhase('setup')
    setSession(null)
    setMessages([])
    setSummary(null)
    setStreaming('')
    setError(null)
    setSavedCount(localStorageImpl.getSavedWords().length)
  }

  // ─────────────────────────── setup ───────────────────────────
  if (phase === 'setup') {
    return (
      <div className="space-y-5 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold font-display">{EXAM_LABELS[exam as ExamId]} — 對話練習</h1>
          <p className="text-muted-foreground text-sm mt-1">
            用英文聊天，順便把單字庫裡到期的字逼出來。查過的字用出來才算真的記住。
          </p>
        </div>

        {savedCount === 0 ? (
          <div className="rounded-lg border p-6 text-center space-y-2">
            <p className="text-sm">單字庫還是空的</p>
            <p className="text-xs text-muted-foreground">
              對話會從你收藏的字裡挑要練的。先去查詞或閱讀頁加幾個字。
            </p>
          </div>
        ) : (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-1.5">
              <label htmlFor="chat-topic" className="text-xs text-muted-foreground">
                主題（留白就依你的個人化情境自動選）
              </label>
              <Input
                id="chat-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="例如：最近在做的專案"
                className="h-8 text-sm"
              />
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={correctMode}
                onChange={(e) => setCorrectMode(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 accent-primary"
              />
              <span className="text-sm">
                糾錯模式
                <span className="block text-xs text-muted-foreground">
                  每則訊息額外檢查一次文法與用字，會多花額度。預設關閉，因為它會打斷對話節奏。
                </span>
              </span>
            </label>

            <p className="text-xs text-muted-foreground">
              單字庫有 {savedCount} 個字，這場會從到期與不熟的裡面挑幾個進來 ——
              但不會告訴你是哪些，那樣你就只會照抄了。
            </p>

            <Button onClick={start} disabled={busy}>
              {busy ? '準備中…' : '開始對話'}
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }

  // ─────────────────────────── summary ───────────────────────────
  if (phase === 'summary' && summary) {
    return <SessionSummaryView summary={summary} onRestart={restart} />
  }

  // ─────────────────────────── chatting ───────────────────────────
  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-lg font-bold">對話練習</h1>
        {session?.topic && (
          <Badge variant="outline" className="text-xs">
            {session.topic}
          </Badge>
        )}
        {session?.correctMode && (
          <Badge variant="secondary" className="text-xs">
            糾錯開啟
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7 text-xs"
          onClick={finish}
          disabled={busy}
        >
          結束並看總結
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border p-4 min-h-64">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            onWordSelect={lookup.onSelect}
            mark={lookup.mark}
            activeTerm={lookup.selected?.term}
            speak={speak}
            speakingId={speakingId}
          />
        ))}

        {streaming && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap">
              {streaming}
              <span className="inline-block w-1.5 h-4 bg-foreground/50 ml-0.5 animate-pulse align-text-bottom" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Composer onSend={send} disabled={busy} />

      <p className="text-xs text-muted-foreground">
        點 AI 訊息裡的任何一個字都可以查詞。{messages.length}/{MAX_SESSION_MESSAGES} 則
      </p>

      <LookupSheet
        selected={lookup.selected}
        onClose={lookup.close}
        persona={lookup.persona}
        source={{ kind: 'chat' }}
        onSaveChange={lookup.refreshMarks}
      />
    </div>
  )
}

/** 串流回來的事件。用可辨識聯集，不要在呼叫端 cast。 */
type SseEvent =
  | { event: 'meta'; data: { userMessageId: string; usedWords: string[] } }
  | { event: 'delta'; data: { text: string } }
  | { event: 'done'; data: { content: string } }
  | { event: 'error'; data: { message: string } }

/** 讀 SSE：解析 `event:` / `data:` 成對的區塊。 */
async function readSse(res: Response, onEvent: (e: SseEvent) => void) {
  const reader = res.body?.getReader()
  if (!reader) return

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() ?? ''

    for (const block of blocks) {
      const eventLine = block.split('\n').find((l) => l.startsWith('event: '))
      const dataLine = block.split('\n').find((l) => l.startsWith('data: '))
      if (!eventLine || !dataLine) continue
      try {
        onEvent({
          event: eventLine.slice(7).trim(),
          data: JSON.parse(dataLine.slice(6)),
        } as SseEvent)
      } catch {
        // 壞掉的區塊直接略過，不要讓整個串流掛掉
      }
    }
  }
}
