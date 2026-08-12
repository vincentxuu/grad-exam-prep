'use client'

import { CorrectionBlock } from '@/components/chat/correction-block'
import { SpeakButton } from '@/components/flashcard/speak-button'
import { TappableText, type WordMark } from '@/components/lexicon/tappable-text'
import { Badge } from '@/components/ui/badge'
import type { ChatMessage } from '@/types/chat'

interface Props {
  message: ChatMessage
  /** AI 訊息裡的字可以點來查詞 —— 複用查詞那一整套，不另寫 */
  onWordSelect: (term: string, sentence: string) => void
  mark?: (word: string) => WordMark
  activeTerm?: string
  speak: (text: string, id?: string) => void
  speakingId: string | null
}

export function MessageBubble({
  message,
  onWordSelect,
  mark,
  activeTerm,
  speak,
  speakingId,
}: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <div className="flex items-start gap-1">
              <TappableText
                text={message.content}
                onSelect={onWordSelect}
                mark={mark}
                activeTerm={activeTerm}
                className="whitespace-pre-wrap"
              />
              <SpeakButton
                text={message.content}
                id={`chat-${message.id}`}
                speak={speak}
                speakingId={speakingId}
                label="朗讀這則訊息"
              />
            </div>
          )}
        </div>

        {/* 用出目標字時給個即時回饋 —— 這是整場練習的重點 */}
        {isUser && message.usedWords && message.usedWords.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap justify-end">
            {message.usedWords.map((w) => (
              <Badge
                key={w}
                variant="outline"
                className="text-xs border-green-500 text-green-700 dark:text-green-400"
              >
                ✓ {w}
              </Badge>
            ))}
          </div>
        )}

        {isUser && message.corrections && <CorrectionBlock corrections={message.corrections} />}
      </div>
    </div>
  )
}
