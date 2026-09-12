'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const PROVIDER_STORAGE_KEY = 'tts-provider'
const VOICE_STORAGE_KEY = 'flashcard-voice'
const VOICE_PREFIX = 'tts-voice-'

export type TtsProvider = 'browser' | 'cloudflare'

export interface TtsProviderOption {
  id: TtsProvider
  label: string
  voices: VoiceOption[]
}

export interface VoiceOption {
  voiceURI: string
  name: string
  lang: string
  label: string
}

const LANG_LABELS: Record<string, string> = {
  'en-US': '🇺🇸 美式英語',
  'en-GB': '🇬🇧 英式英語',
  'en-AU': '🇦🇺 澳洲英語',
  'en-IN': '🇮🇳 印度英語',
  'en-ZA': '🇿🇦 南非英語',
  'en-IE': '🇮🇪 愛爾蘭英語',
  'en-NZ': '🇳🇿 紐西蘭英語',
}

const CLOUDFLARE_VOICES: VoiceOption[] = [
  { voiceURI: 'luna', name: 'Luna', lang: 'en-US', label: 'Luna（女聲）' },
  { voiceURI: 'athena', name: 'Athena', lang: 'en-US', label: 'Athena（女聲）' },
  { voiceURI: 'stella', name: 'Stella', lang: 'en-US', label: 'Stella（女聲）' },
  { voiceURI: 'apollo', name: 'Apollo', lang: 'en-US', label: 'Apollo（男聲）' },
  { voiceURI: 'orion', name: 'Orion', lang: 'en-US', label: 'Orion（男聲）' },
  { voiceURI: 'helios', name: 'Helios', lang: 'en-US', label: 'Helios（男聲）' },
  { voiceURI: 'perseus', name: 'Perseus', lang: 'en-US', label: 'Perseus（男聲）' },
  { voiceURI: 'angus', name: 'Angus', lang: 'en-US', label: 'Angus（男聲）' },
  { voiceURI: 'orpheus', name: 'Orpheus', lang: 'en-US', label: 'Orpheus（男聲）' },
  { voiceURI: 'arcas', name: 'Arcas', lang: 'en-US', label: 'Arcas（男聲）' },
]


function loadBrowserVoices(synth: SpeechSynthesis): VoiceOption[] {
  const raw = synth.getVoices()
  return raw
    .filter((v) => v.lang.startsWith('en'))
    .map((v) => ({
      voiceURI: v.voiceURI,
      name: v.name,
      lang: v.lang,
      label: LANG_LABELS[v.lang]
        ? `${LANG_LABELS[v.lang]} — ${v.name}`
        : `${v.lang} — ${v.name}`,
    }))
    .sort((a, b) => {
      const order = Object.keys(LANG_LABELS)
      const ai = order.indexOf(a.lang)
      const bi = order.indexOf(b.lang)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
}

const VALID_PROVIDERS: TtsProvider[] = ['cloudflare', 'browser']

function getStoredProvider(): TtsProvider {
  if (typeof window === 'undefined') return 'cloudflare'
  const stored = localStorage.getItem(PROVIDER_STORAGE_KEY)
  return stored && VALID_PROVIDERS.includes(stored as TtsProvider)
    ? (stored as TtsProvider)
    : 'cloudflare'
}

function getStoredVoice(provider: TtsProvider): string {
  if (typeof window === 'undefined') return ''
  if (provider === 'browser') return localStorage.getItem(VOICE_STORAGE_KEY) ?? ''
  return localStorage.getItem(VOICE_PREFIX + provider) ?? ''
}

function storeVoice(provider: TtsProvider, uri: string) {
  if (provider === 'browser') {
    localStorage.setItem(VOICE_STORAGE_KEY, uri)
  } else {
    localStorage.setItem(VOICE_PREFIX + provider, uri)
  }
}

export function useSpeech() {
  const [provider, setProviderState] = useState<TtsProvider>('cloudflare')
  const [browserVoices, setBrowserVoices] = useState<VoiceOption[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('')
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // hydration-safe: read localStorage only after mount
  useEffect(() => {
    setProviderState(getStoredProvider())
    setMounted(true)
  }, [])

  // load browser voices
  useEffect(() => {
    if (typeof window === 'undefined') return
    synthRef.current = window.speechSynthesis

    function load() {
      if (!synthRef.current) return
      setBrowserVoices(loadBrowserVoices(synthRef.current))
    }

    load()
    synthRef.current.addEventListener('voiceschanged', load)
    return () => synthRef.current?.removeEventListener('voiceschanged', load)
  }, [])

  // restore selected voice when provider or browserVoices changes
  useEffect(() => {
    if (!mounted) return
    const stored = getStoredVoice(provider)
    const voices = voicesForProvider(provider, browserVoices)
    if (stored && voices.some((v) => v.voiceURI === stored)) {
      setSelectedVoiceURI(stored)
    } else if (voices.length > 0) {
      setSelectedVoiceURI(voices[0].voiceURI)
    }
  }, [provider, browserVoices, mounted])

  const setProvider = useCallback((p: TtsProvider) => {
    setProviderState(p)
    localStorage.setItem(PROVIDER_STORAGE_KEY, p)
  }, [])

  const setVoice = useCallback(
    (uri: string) => {
      setSelectedVoiceURI(uri)
      storeVoice(provider, uri)
    },
    [provider],
  )

  const stop = useCallback(() => {
    synthRef.current?.cancel()
    abortRef.current?.abort()
    if (audioRef.current) {
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
      audioRef.current = null
    }
    setSpeakingId(null)
  }, [])

  const speak = useCallback(
    (text: string, id?: string) => {
      stop()

      const speakId = id ?? '__default'

      if (provider === 'browser') {
        const synth = synthRef.current
        if (!synth) return
        const utt = new SpeechSynthesisUtterance(text)
        const raw = synth.getVoices().find((v) => v.voiceURI === selectedVoiceURI)
        if (raw) utt.voice = raw
        utt.rate = 0.85
        utt.onstart = () => setSpeakingId(speakId)
        utt.onend = () => setSpeakingId(null)
        utt.onerror = () => setSpeakingId(null)
        synth.speak(utt)
        return
      }

      const abort = new AbortController()
      abortRef.current = abort
      setSpeakingId(speakId)

      const audioPromise = fetchServerTts(text, provider, selectedVoiceURI, abort.signal)

      audioPromise
        .then((blob) => {
          if (abort.signal.aborted) return
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          audioRef.current = audio

          const cleanup = () => {
            audio.onended = null
            audio.onerror = null
            audioRef.current = null
            setSpeakingId(null)
            URL.revokeObjectURL(url)
          }
          audio.onended = cleanup
          audio.onerror = cleanup

          audio.play().catch(cleanup)
        })
        .catch((err) => {
          console.error('[TTS speak]', err)
          if (!abort.signal.aborted) setSpeakingId(null)
        })
    },
    [provider, selectedVoiceURI, stop],
  )

  const voices = voicesForProvider(provider, browserVoices)

  const providers: TtsProviderOption[] = [
    { id: 'cloudflare', label: 'Cloudflare AI', voices: CLOUDFLARE_VOICES },
    { id: 'browser', label: '瀏覽器語音', voices: browserVoices },
  ]

  return {
    provider,
    setProvider,
    providers,
    voices,
    selectedVoiceURI,
    setVoice,
    speak,
    stop,
    speakingId,
  }
}

function voicesForProvider(provider: TtsProvider, browserVoices: VoiceOption[]): VoiceOption[] {
  switch (provider) {
    case 'browser':
      return browserVoices
    case 'cloudflare':
      return CLOUDFLARE_VOICES
    default:
      return CLOUDFLARE_VOICES
  }
}

async function fetchServerTts(
  text: string,
  provider: string,
  voice: string,
  signal: AbortSignal,
): Promise<Blob> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, provider, voice }),
    signal,
  })
  if (!res.ok) throw new Error('TTS failed')
  return res.blob()
}
