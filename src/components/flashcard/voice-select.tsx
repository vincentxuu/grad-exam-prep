'use client'

import { Languages } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { VoiceOption } from '@/hooks/use-speech'

interface VoiceSelectProps {
  voices: VoiceOption[]
  selectedVoiceURI: string
  onSelect: (uri: string) => void
}

export function VoiceSelect({ voices, selectedVoiceURI, onSelect }: VoiceSelectProps) {
  if (voices.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select value={selectedVoiceURI} onValueChange={onSelect}>
        <SelectTrigger className="w-full sm:w-64 h-8 text-xs">
          <SelectValue placeholder="選擇語音" />
        </SelectTrigger>
        <SelectContent>
          {voices.map((v) => (
            <SelectItem key={v.voiceURI} value={v.voiceURI} className="text-xs">
              {v.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
