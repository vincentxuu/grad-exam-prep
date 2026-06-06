'use client'

import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SpeakButtonProps {
  text: string
  id: string
  speak: (text: string, id?: string) => void
  speakingId: string | null
  size?: 'sm' | 'md'
  label?: string
}

export function SpeakButton({ text, id, speak, speakingId, size = 'sm', label }: SpeakButtonProps) {
  const isSpeaking = speakingId === id

  return (
    <Button
      variant="ghost"
      size="icon"
      className={
        size === 'sm'
          ? 'h-6 w-6 shrink-0'
          : 'h-8 w-8 shrink-0'
      }
      onClick={(e) => {
        e.stopPropagation()
        speak(text, id)
      }}
      aria-label={label ?? '播放發音'}
    >
      <Volume2
        className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${isSpeaking ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}
      />
    </Button>
  )
}
