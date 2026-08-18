'use client'

import { Mic, Send } from '@sketchyicons/react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

/** SpeechRecognition 只有部分瀏覽器有，型別也不在標準 lib 裡。 */
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  start(): void
  stop(): void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function Composer({ onSend, disabled, placeholder }: Props) {
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  // 支援度不一致，做成漸進增強：沒有就整顆按鈕不出現，而不是給一顆按了沒反應的
  const [canListen, setCanListen] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    setCanListen(getRecognitionCtor() !== null)
  }, [])

  function submit() {
    const value = text.trim()
    if (!value || disabled) return
    onSend(value)
    setText('')
  }

  function toggleListen() {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const Ctor = getRecognitionCtor()
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? ''
      if (transcript) setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  return (
    <div className="flex items-end gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        rows={2}
        disabled={disabled}
        placeholder={placeholder ?? '用英文回覆…（Enter 送出，Shift+Enter 換行）'}
        className="flex-1 resize-none rounded-md border bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      />

      {canListen && (
        <Button
          variant={listening ? 'default' : 'outline'}
          size="icon"
          onClick={toggleListen}
          disabled={disabled}
          aria-label={listening ? '停止語音輸入' : '語音輸入'}
          className="shrink-0"
        >
          <Mic className={`h-4 w-4 ${listening ? 'animate-pulse' : ''}`} />
        </Button>
      )}

      <Button onClick={submit} disabled={disabled || !text.trim()} size="icon" className="shrink-0">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
