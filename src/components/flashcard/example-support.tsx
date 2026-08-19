'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { PersonalBridge } from '@/components/lexicon/personal-bridge'
import { Button } from '@/components/ui/button'
import type { LexiconEntry, LookupResponse, PersonaProfile } from '@/types/lexicon'
import { SpeakButton } from './speak-button'

const entryCache = new Map<string, LexiconEntry>()

/**
 * 前端放棄的時間點。必須比伺服器的生成預算（`api/lexicon/route.ts` 的
 * `GENERATION_BUDGET_MS`）大 —— 不然我們會在伺服器來得及回那個看得懂的
 * 504 之前就自己斷掉，白白換回一個比較差的錯誤訊息。
 */
const GENERATION_TIMEOUT_MS = 60_000

/**
 * 把例外翻成看得懂的話。
 *
 * fetch 在網路層失敗時丟的是 `TypeError`，訊息由瀏覽器決定：Safari 是
 * "Load failed"，Chrome 是 "Failed to fetch"。直接把它顯示給使用者，畫面上
 * 就會出現一行沒有人看得懂的英文。
 */
function describeError(reason: unknown, fallback: string): string {
  if (reason instanceof TypeError) return '連線中斷，請確認網路後再試一次。'
  return reason instanceof Error ? reason.message : fallback
}

/** 回應不是 JSON 時（例如 edge 回的 HTML 錯誤頁）給個像話的訊息。 */
async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T
  } catch {
    throw new Error(response.ok ? '回應格式錯誤' : `伺服器錯誤（${response.status}）`)
  }
}

type CacheState = 'idle' | 'loading' | 'ready' | 'miss'

interface Props {
  headword: string
  hasEmbeddedExample: boolean
  persona?: PersonaProfile
  setupHref: string
  speak: (text: string, id?: string) => void
  speakingId: string | null
  fetchImpl?: typeof fetch
}

function hasPersona(persona: PersonaProfile | undefined): persona is PersonaProfile {
  if (!persona) return false
  return (
    persona.work.trim() !== '' ||
    persona.interests.some((interest) => interest.trim() !== '') ||
    !!persona.goal?.trim()
  )
}

export function FlashcardExampleSupport({
  headword,
  hasEmbeddedExample,
  persona,
  setupHref,
  speak,
  speakingId,
  fetchImpl,
}: Props) {
  const normalizedHeadword = headword.trim().toLowerCase()
  const cached = entryCache.get(normalizedHeadword) ?? null
  const [entry, setEntry] = useState<LexiconEntry | null>(cached)
  const [personal, setPersonal] = useState<LookupResponse['personal']>()
  const [cacheState, setCacheState] = useState<CacheState>(cached ? 'ready' : 'idle')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const generationController = useRef<AbortController | null>(null)
  const personaReady = hasPersona(persona)
  const request = fetchImpl ?? fetch

  useEffect(() => {
    const nextCached = entryCache.get(normalizedHeadword) ?? null
    generationController.current?.abort()
    setGenerating(false)
    setEntry(nextCached)
    setPersonal(undefined)
    setError(null)

    if (hasEmbeddedExample || nextCached) {
      setCacheState(nextCached ? 'ready' : 'idle')
      return
    }

    const controller = new AbortController()
    setCacheState('loading')
    request(`/api/lexicon?q=${encodeURIComponent(normalizedHeadword)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 404) return null
        if (!response.ok) throw new Error('例句快取讀取失敗')
        return response.json() as Promise<LookupResponse>
      })
      .then((data) => {
        if (!data) {
          setCacheState('miss')
          return
        }
        entryCache.set(normalizedHeadword, data.entry)
        setEntry(data.entry)
        setCacheState('ready')
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setCacheState('miss')
        setError(describeError(reason, '例句快取讀取失敗'))
      })

    return () => controller.abort()
  }, [hasEmbeddedExample, normalizedHeadword, request])

  useEffect(() => {
    return () => generationController.current?.abort()
  }, [normalizedHeadword])

  async function generateExamples() {
    generationController.current?.abort()
    const controller = new AbortController()
    generationController.current = controller
    setGenerating(true)
    setError(null)

    // 自己的逾時要和「換一張卡就中止」共用同一個 controller，但兩者要分得
    // 出來：換卡是使用者離開了，什麼都不該顯示；逾時得留下一行說明。
    // 不用 AbortSignal.any —— iOS Safari 17.4 以前沒有。
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, GENERATION_TIMEOUT_MS)

    try {
      const response = await request('/api/lexicon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          term: normalizedHeadword,
          // flashcard 只渲染例句，不用等一份完整辭典詞條
          mode: 'examples',
          ...(personaReady ? { persona } : {}),
        }),
      })
      const body = await readJson<Partial<LookupResponse> & { error?: string }>(response)
      // 回應到手就停錶：後面的檢查若丟錯，那是內容問題，不是等太久
      clearTimeout(timer)
      if (!response.ok || !body.entry) throw new Error(body.error ?? '例句生成失敗')

      entryCache.set(normalizedHeadword, body.entry)
      setEntry(body.entry)
      setCacheState('ready')
      if (personaReady && !body.personal) {
        throw new Error('個人化例句暫時無法產生，請重試。')
      }
      setPersonal(body.personal)
    } catch (reason) {
      if (timedOut) setError('產生例句等太久了，請再試一次。')
      else if (!controller.signal.aborted) setError(describeError(reason, '例句生成失敗'))
    } finally {
      clearTimeout(timer)
      if (timedOut || !controller.signal.aborted) setGenerating(false)
    }
  }

  const supplementalExamples = hasEmbeddedExample ? [] : (entry?.examples ?? []).slice(0, 3)

  return (
    <div className="space-y-3 border-t pt-3">
      {cacheState === 'loading' && (
        <p className="text-xs text-muted-foreground" role="status">
          正在找已經準備好的例句…
        </p>
      )}

      {supplementalExamples.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">補充例句</h3>
          {supplementalExamples.map((example, index) => (
            <div
              key={example.en}
              className="rounded-md bg-blue-50 p-3 space-y-1 dark:bg-blue-950/30"
            >
              <div className="flex items-start gap-1">
                <SpeakButton
                  text={example.en}
                  id={`support-${normalizedHeadword}-${index}`}
                  speak={speak}
                  speakingId={speakingId}
                  label={`播放 ${normalizedHeadword} 補充例句 ${index + 1}`}
                />
                <p className="text-sm italic text-blue-900 dark:text-blue-100">{example.en}</p>
              </div>
              <p className="ml-7 text-xs text-muted-foreground">{example.zh}</p>
            </div>
          ))}
        </div>
      )}

      {personal && <PersonalBridge bridge={personal} speak={speak} speakingId={speakingId} />}

      {!personal && personaReady && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={generateExamples}
            disabled={generating}
          >
            {generating ? '正在連結你的情境…' : '用我的情境幫我記'}
          </Button>
          <span className="text-xs text-muted-foreground">只在你按下後生成，之後會重複使用。</span>
        </div>
      )}

      {!personal && !personaReady && (
        <div className="flex items-center gap-2 flex-wrap">
          {!hasEmbeddedExample && cacheState === 'miss' && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={generateExamples}
              disabled={generating}
            >
              {generating ? '正在產生例句…' : '產生例句'}
            </Button>
          )}
          <Button asChild size="sm" variant="ghost">
            <Link href={setupHref}>設定我的熟悉情境</Link>
          </Button>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
