'use client'

import { SpeakButton } from './speak-button'

interface VocabAnswerProps {
  cardId: string
  answer: string
  speak: (text: string, id?: string) => void
  speakingId: string | null
}

interface ParsedAnswer {
  chinese: string | null
  example: string | null
  exampleChinese: string | null
  synonyms: string | null
  antonyms: string | null
  rest: string[]
}

function parseVocabAnswer(answer: string): ParsedAnswer {
  const lines = answer.split('\n').map((l) => l.trim())
  const result: ParsedAnswer = {
    chinese: null,
    example: null,
    exampleChinese: null,
    synonyms: null,
    antonyms: null,
    rest: [],
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue

    if (line.startsWith('中文：') || line.startsWith('【意思】')) {
      result.chinese = line
    } else if (line.startsWith('例句：') || line.startsWith('【例句】')) {
      result.example = line.replace(/^(例句：|【例句】)/, '').trim()
    } else if (line.startsWith('（') && result.example && !result.exampleChinese) {
      result.exampleChinese = line
    } else if (line.startsWith('同義詞：') || line.startsWith('近義詞：') || line.startsWith('【近義詞】')) {
      result.synonyms = line.replace(/^(同義詞：|近義詞：|【近義詞】)/, '').trim()
    } else if (line.startsWith('反義詞：') || line.startsWith('【反義詞】')) {
      result.antonyms = line.replace(/^(反義詞：|【反義詞】)/, '').trim()
    } else {
      result.rest.push(line)
    }
  }

  return result
}

export function VocabAnswer({ cardId, answer, speak, speakingId }: VocabAnswerProps) {
  const parsed = parseVocabAnswer(answer)
  const hasStructure = parsed.chinese || parsed.example || parsed.synonyms || parsed.antonyms

  if (!hasStructure) {
    return (
      <div className="text-sm whitespace-pre-line leading-relaxed">{answer}</div>
    )
  }

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {parsed.chinese && (
        <p className="font-medium">{parsed.chinese}</p>
      )}

      {parsed.example && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-3 space-y-1">
          <div className="flex items-start gap-1">
            <SpeakButton
              text={parsed.example}
              id={`${cardId}-example`}
              speak={speak}
              speakingId={speakingId}
              label="播放例句"
            />
            <p className="text-blue-900 dark:text-blue-100 italic">{parsed.example}</p>
          </div>
          {parsed.exampleChinese && (
            <p className="text-xs text-muted-foreground ml-7">{parsed.exampleChinese}</p>
          )}
        </div>
      )}

      {parsed.synonyms && (
        <div className="flex items-start gap-1">
          <SpeakButton
            text={parsed.synonyms}
            id={`${cardId}-syn`}
            speak={speak}
            speakingId={speakingId}
            label="播放同義詞"
          />
          <p>
            <span className="text-muted-foreground">同義詞：</span>
            <span className="text-green-700 dark:text-green-400">{parsed.synonyms}</span>
          </p>
        </div>
      )}

      {parsed.antonyms && (
        <div className="flex items-start gap-1">
          <SpeakButton
            text={parsed.antonyms}
            id={`${cardId}-ant`}
            speak={speak}
            speakingId={speakingId}
            label="播放反義詞"
          />
          <p>
            <span className="text-muted-foreground">反義詞：</span>
            <span className="text-red-700 dark:text-red-400">{parsed.antonyms}</span>
          </p>
        </div>
      )}

      {parsed.rest.length > 0 && (
        <div className="text-muted-foreground text-xs space-y-0.5 border-t pt-2">
          {parsed.rest.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}
