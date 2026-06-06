'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const VOICE_STORAGE_KEY = 'flashcard-voice'

const LANG_LABELS: Record<string, string> = {
  'en-US': '🇺🇸 美式英語',
  'en-GB': '🇬🇧 英式英語',
  'en-AU': '🇦🇺 澳洲英語',
  'en-IN': '🇮🇳 印度英語',
  'en-ZA': '🇿🇦 南非英語',
  'en-IE': '🇮🇪 愛爾蘭英語',
  'en-NZ': '🇳🇿 紐西蘭英語',
}

export interface VoiceOption {
  voiceURI: string
  name: string
  lang: string
  label: string
}

export function useSpeech() {
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('')
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    synthRef.current = window.speechSynthesis

    function loadVoices() {
      const raw = synthRef.current?.getVoices() ?? []
      const en = raw
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

      setVoices(en)

      const saved = localStorage.getItem(VOICE_STORAGE_KEY)
      if (saved && en.some((v) => v.voiceURI === saved)) {
        setSelectedVoiceURI(saved)
      } else if (en.length > 0) {
        setSelectedVoiceURI(en[0].voiceURI)
      }
    }

    loadVoices()
    synthRef.current.addEventListener('voiceschanged', loadVoices)
    return () => synthRef.current?.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const setVoice = useCallback((uri: string) => {
    setSelectedVoiceURI(uri)
    localStorage.setItem(VOICE_STORAGE_KEY, uri)
  }, [])

  const speak = useCallback(
    (text: string, id?: string) => {
      const synth = synthRef.current
      if (!synth) return
      synth.cancel()

      const utt = new SpeechSynthesisUtterance(text)
      const raw = synth.getVoices().find((v) => v.voiceURI === selectedVoiceURI)
      if (raw) utt.voice = raw
      utt.rate = 0.85
      utt.onstart = () => setSpeakingId(id ?? '__default')
      utt.onend = () => setSpeakingId(null)
      utt.onerror = () => setSpeakingId(null)
      synth.speak(utt)
    },
    [selectedVoiceURI],
  )

  const stop = useCallback(() => {
    synthRef.current?.cancel()
    setSpeakingId(null)
  }, [])

  return { voices, selectedVoiceURI, setVoice, speak, stop, speakingId }
}
