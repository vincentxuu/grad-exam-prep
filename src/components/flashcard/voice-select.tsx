'use client'

import { Languages } from '@sketchyicons/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TtsProvider, TtsProviderOption, VoiceOption } from '@/hooks/use-speech'

interface VoiceSelectProps {
  voices: VoiceOption[]
  selectedVoiceURI: string
  onSelect: (uri: string) => void
  providers?: TtsProviderOption[]
  provider?: TtsProvider
  onProviderChange?: (p: TtsProvider) => void
}

export function VoiceSelect({
  voices,
  selectedVoiceURI,
  onSelect,
  providers,
  provider,
  onProviderChange,
}: VoiceSelectProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Languages className="h-4 w-4 text-muted-foreground shrink-0" />

      {providers && provider && onProviderChange && (
        <Select value={provider} onValueChange={(v) => onProviderChange(v as TtsProvider)}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-xs">
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {voices.length > 0 && (
        <Select value={selectedVoiceURI} onValueChange={onSelect}>
          <SelectTrigger className="w-full sm:w-52 h-8 text-xs">
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
      )}
    </div>
  )
}
