'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { PersonalBridge } from '@/components/lexicon/personal-bridge'
import { Button } from '@/components/ui/button'
import type { LexiconEntry, LookupResponse, PersonaProfile } from '@/types/lexicon'
import { SpeakButton } from './speak-button'

const entryCache = new Map<string, LexiconEntry>()

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
        const msg = reason instanceof Error ? reason.message : ''
        if (msg && !msg.includes('Load failed') && !msg.includes('fetch')) {
          setError(msg)
        }
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
    try {
      const response = await request('/api/lexicon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          term: normalizedHeadword,
          ...(personaReady ? { persona } : {}),
        }),
      })
      const body = (await response.json()) as Partial<LookupResponse> & { error?: string }
      if (!response.ok || !body.entry) throw new Error(body.error ?? '例句生成失敗')

      entryCache.set(normalizedHeadword, body.entry)
      setEntry(body.entry)
      setCacheState('ready')
      if (personaReady && !body.personal) {
        throw new Error('個人化例句暫時無法產生，請重試。')
      }
      setPersonal(body.personal)
    } catch (reason) {
      if (controller.signal.aborted) return
      const msg = reason instanceof Error ? reason.message : ''
      setError(msg && !msg.includes('Load failed') ? msg : '例句生成失敗，請重試')
    } finally {
      if (!controller.signal.aborted) setGenerating(false)
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
