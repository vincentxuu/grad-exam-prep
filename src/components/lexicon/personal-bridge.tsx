'use client'

import { SpeakButton } from '@/components/flashcard/speak-button'
import type { PersonalBridge as PersonalBridgeData } from '@/types/lexicon'

interface Props {
  bridge: PersonalBridgeData
  speak: (text: string, id?: string) => void
  speakingId: string | null
}

/**
 * 個人化橋接。刻意做得和通用詞條長得不一樣 —— 這一區是「這個字跟你的
 * 關係」，不是字典內容，視覺上要一眼分得出來。
 */
export function PersonalBridge({ bridge, speak, speakingId }: Props) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground">跟你的連結</h3>

      {bridge.examples.map((ex, i) => (
        <div key={ex.en} className="space-y-0.5">
          <div className="flex items-start gap-1">
            <SpeakButton
              text={ex.en}
              id={`pb-${bridge.headword}-${i}`}
              speak={speak}
              speakingId={speakingId}
              label="播放例句"
            />
            <p className="text-sm italic">{ex.en}</p>
          </div>
          <p className="text-xs text-muted-foreground ml-7">{ex.zh}</p>
        </div>
      ))}

      {bridge.mnemonic && (
        <p className="text-sm leading-relaxed border-t pt-2">
          <span className="text-xs text-muted-foreground">記憶連結：</span>
          {bridge.mnemonic}
        </p>
      )}
    </div>
  )
}
