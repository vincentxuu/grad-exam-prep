'use client'

import { SpeakButton } from '@/components/flashcard/speak-button'
import { Badge } from '@/components/ui/badge'
import type { LexiconEntry } from '@/types/lexicon'

interface Props {
  entry: LexiconEntry
  speak: (text: string, id?: string) => void
  speakingId: string | null
}

const REGISTER_LABEL: Record<string, string> = {
  formal: '正式',
  informal: '口語',
  technical: '技術',
  academic: '學術',
}

const CONTEXT_LABEL: Record<string, string> = {
  general: '一般',
  academic: '學術',
  technical: '技術',
  exam: '考試',
}

/**
 * 詞條主體。刻意把多義項、搭配、易混淆字全攤開 —— 「只給一行釋義」
 * 正是使用者換掉其他字典 app 的原因。
 */
export function EntryCard({ entry, speak, speakingId }: Props) {
  const id = `lx-${entry.headword}`

  return (
    <div className="space-y-4">
      {/* 標題 */}
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-xl font-bold">{entry.headword}</h2>
        {entry.ipa && <span className="text-sm text-muted-foreground">/{entry.ipa}/</span>}
        <Badge variant="outline" className="text-xs">
          {entry.kind === 'phrase' ? '片語' : '單字'}
        </Badge>
        <SpeakButton
          text={entry.headword}
          id={`${id}-word`}
          speak={speak}
          speakingId={speakingId}
          size="md"
          label={`播放 ${entry.headword} 發音`}
        />
      </div>

      {/* 義項 */}
      {entry.senses.length > 0 && (
        <ol className="space-y-2">
          {entry.senses.map((sense, i) => (
            <li key={`${sense.pos}-${i}`} className="text-sm leading-relaxed">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground shrink-0">{i + 1}.</span>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {sense.pos}
                </Badge>
                {sense.register && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {REGISTER_LABEL[sense.register] ?? sense.register}
                  </Badge>
                )}
                <span className="font-medium">{sense.zh}</span>
              </div>
              <p className="text-muted-foreground text-xs mt-0.5 ml-6">{sense.en}</p>
            </li>
          ))}
        </ol>
      )}

      {/* 例句 */}
      {entry.examples.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">例句</h3>
          {entry.examples.map((ex, i) => (
            <div key={ex.en} className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-3 space-y-1">
              <div className="flex items-start gap-1">
                <SpeakButton
                  text={ex.en}
                  id={`${id}-ex-${i}`}
                  speak={speak}
                  speakingId={speakingId}
                  label="播放例句"
                />
                <p className="text-sm text-blue-900 dark:text-blue-100 italic">{ex.en}</p>
                {ex.context && (
                  <Badge variant="outline" className="text-xs shrink-0 ml-auto">
                    {CONTEXT_LABEL[ex.context] ?? ex.context}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground ml-7">{ex.zh}</p>
            </div>
          ))}
        </div>
      )}

      {/* 搭配與片語 */}
      {entry.collocations.length > 0 && <ChipRow title="常見搭配" items={entry.collocations} />}

      {entry.phrases.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground">延伸片語</h3>
          <ul className="space-y-1">
            {entry.phrases.map((p) => (
              <li key={p.phrase} className="text-sm">
                <span className="font-medium">{p.phrase}</span>
                <span className="text-muted-foreground"> — {p.zh}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 易混淆字 —— 選擇題最常見的陷阱 */}
      {entry.confusables.length > 0 && (
        <div className="rounded-md border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-1.5">
          <h3 className="text-xs font-medium text-amber-800 dark:text-amber-300">易混淆</h3>
          {entry.confusables.map((c) => (
            <p key={c.word} className="text-sm leading-relaxed">
              <span className="font-medium">{c.word}</span>
              <span className="text-muted-foreground">（{c.zh}）</span>
              <span className="text-xs text-muted-foreground"> — {c.note}</span>
            </p>
          ))}
        </div>
      )}

      {/* 同反義詞 */}
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {entry.synonyms.length > 0 && (
          <p className="text-sm">
            <span className="text-muted-foreground text-xs">同義詞：</span>
            <span className="text-green-700 dark:text-green-400">{entry.synonyms.join('、')}</span>
          </p>
        )}
        {entry.antonyms.length > 0 && (
          <p className="text-sm">
            <span className="text-muted-foreground text-xs">反義詞：</span>
            <span className="text-red-700 dark:text-red-400">{entry.antonyms.join('、')}</span>
          </p>
        )}
      </div>

      {entry.examNote && (
        <p className="text-xs text-muted-foreground border-t pt-2 leading-relaxed">
          <span className="font-medium">考試重點：</span>
          {entry.examNote}
        </p>
      )}
    </div>
  )
}

function ChipRow({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="text-xs rounded bg-muted px-2 py-0.5">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
