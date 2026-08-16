'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { defaultRetestDate } from '@/lib/today-learning'
import type { DailyLearningRecord, LearningOutputKind, TaskLearningEvidence } from '@/types/storage'

interface TaskEvidenceFormProps {
  taskId: string
  existing?: TaskLearningEvidence
  today: Date
  onCancel: () => void
  onSave: (
    evidence: Omit<TaskLearningEvidence, 'taskDescription' | 'completionCriteria'>
  ) => boolean
}

export function TaskEvidenceForm({
  taskId,
  existing,
  today,
  onCancel,
  onSave,
}: TaskEvidenceFormProps) {
  const [accuracy, setAccuracy] = useState(String(existing?.accuracy ?? ''))
  const [evidence, setEvidence] = useState(existing?.evidence ?? '')
  const [needsRetest, setNeedsRetest] = useState(existing?.needsRetest ?? false)
  const [retestAt, setRetestAt] = useState(existing?.retestAt ?? defaultRetestDate(today))
  const parsedAccuracy = Number(accuracy)
  const validAccuracy =
    accuracy.trim() !== '' &&
    Number.isFinite(parsedAccuracy) &&
    parsedAccuracy >= 0 &&
    parsedAccuracy <= 100
  const forcedRetest = validAccuracy && parsedAccuracy < 80
  const willRetest = forcedRetest || needsRetest
  const canSave =
    validAccuracy && evidence.trim().length > 0 && (!willRetest || retestAt.length > 0)

  function handleSave() {
    if (!canSave) return
    const saved = onSave({
      taskId,
      accuracy: parsedAccuracy,
      evidence: evidence.trim(),
      needsRetest: willRetest,
      ...(willRetest ? { retestAt } : {}),
      updatedAt: Date.now(),
    })
    if (!saved) return
  }

  return (
    <div className="mt-3 space-y-4 border-t pt-4">
      <div className="grid gap-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
        <label htmlFor={`${taskId}-accuracy`} className="space-y-1.5 text-xs font-medium">
          自測正確率
          <div className="relative">
            <Input
              id={`${taskId}-accuracy`}
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              value={accuracy}
              onChange={(event) => setAccuracy(event.target.value)}
              placeholder="0–100"
              className="pr-8"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              %
            </span>
          </div>
        </label>
        <label htmlFor={`${taskId}-evidence`} className="space-y-1.5 text-xs font-medium">
          完成證據
          <Textarea
            id={`${taskId}-evidence`}
            value={evidence}
            onChange={(event) => setEvidence(event.target.value)}
            placeholder="例如：不看筆記畫出 paging 流程，並答對 4/5 題"
            rows={3}
          />
        </label>
      </div>

      <div className="rounded-lg bg-muted/50 p-3">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={forcedRetest || needsRetest}
            disabled={forcedRetest}
            onChange={(event) => setNeedsRetest(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-muted-foreground accent-primary"
          />
          <span>
            安排重測
            <span className="block text-xs leading-5 text-muted-foreground">
              低於 80% 會自動保留為待重測；達標後若仍不穩，也可以主動安排。
            </span>
          </span>
        </label>
        {willRetest ? (
          <label
            htmlFor={`${taskId}-retest-at`}
            className="mt-3 block space-y-1.5 text-xs font-medium"
          >
            重測日期
            <Input
              id={`${taskId}-retest-at`}
              type="date"
              value={retestAt}
              onChange={(event) => setRetestAt(event.target.value)}
              className="max-w-48 bg-background"
            />
          </label>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {validAccuracy ? (
            willRetest ? (
              <Badge
                variant="outline"
                className="border-amber-500/50 text-amber-700 dark:text-amber-300"
              >
                儲存後仍待重測
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-emerald-500/50 text-emerald-700 dark:text-emerald-300"
              >
                儲存後完成任務
              </Badge>
            )
          ) : (
            <span className="text-xs text-muted-foreground">請輸入 0–100 的自測結果</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            取消
          </Button>
          <Button type="button" size="sm" disabled={!canSave} onClick={handleSave}>
            儲存成果
          </Button>
        </div>
      </div>
    </div>
  )
}

interface DailyReflectionFormProps {
  existing?: DailyLearningRecord
  onSave: (values: {
    recallAccuracy: number
    outputKind: LearningOutputKind
    keyMistake?: string
    tomorrowQuestion: string
    effectiveMinutes?: number
  }) => boolean
}

const OUTPUT_OPTIONS: Array<{ value: LearningOutputKind; label: string }> = [
  { value: 'whiteboard', label: '白紙重建' },
  { value: 'code', label: '程式／公式默寫' },
  { value: 'explanation', label: '口頭解釋' },
  { value: 'practice', label: '無提示做題' },
]

export function DailyReflectionForm({ existing, onSave }: DailyReflectionFormProps) {
  const [recallAccuracy, setRecallAccuracy] = useState(String(existing?.recallAccuracy ?? ''))
  const [outputKind, setOutputKind] = useState<LearningOutputKind>(
    existing?.outputKind ?? 'practice'
  )
  const [keyMistake, setKeyMistake] = useState(existing?.keyMistake ?? '')
  const [tomorrowQuestion, setTomorrowQuestion] = useState(existing?.tomorrowQuestion ?? '')
  const [effectiveMinutes, setEffectiveMinutes] = useState(String(existing?.effectiveMinutes ?? ''))
  const [saved, setSaved] = useState(false)
  const parsedAccuracy = Number(recallAccuracy)
  const parsedMinutes = effectiveMinutes === '' ? undefined : Number(effectiveMinutes)
  const canSave =
    recallAccuracy.trim() !== '' &&
    Number.isFinite(parsedAccuracy) &&
    parsedAccuracy >= 0 &&
    parsedAccuracy <= 100 &&
    tomorrowQuestion.trim().length > 0 &&
    (parsedMinutes === undefined || (Number.isFinite(parsedMinutes) && parsedMinutes >= 0))

  function handleSave() {
    if (!canSave) return
    const didSave = onSave({
      recallAccuracy: parsedAccuracy,
      outputKind,
      ...(keyMistake.trim() ? { keyMistake: keyMistake.trim() } : {}),
      tomorrowQuestion: tomorrowQuestion.trim(),
      ...(parsedMinutes === undefined ? {} : { effectiveMinutes: parsedMinutes }),
    })
    setSaved(didSave)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1.5 text-xs font-medium">
          今日回想正確率
          <Input
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            value={recallAccuracy}
            onChange={(event) => {
              setRecallAccuracy(event.target.value)
              setSaved(false)
            }}
            placeholder="0–100%"
          />
        </label>
        <label className="space-y-1.5 text-xs font-medium">
          今天完成的輸出
          <select
            value={outputKind}
            onChange={(event) => {
              setOutputKind(event.target.value as LearningOutputKind)
              setSaved(false)
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {OUTPUT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-xs font-medium">
          有效學習分鐘
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            value={effectiveMinutes}
            onChange={(event) => {
              setEffectiveMinutes(event.target.value)
              setSaved(false)
            }}
            placeholder="選填"
          />
        </label>
      </div>
      <label className="block space-y-1.5 text-xs font-medium">
        今天最重要的錯誤
        <Textarea
          value={keyMistake}
          onChange={(event) => {
            setKeyMistake(event.target.value)
            setSaved(false)
          }}
          placeholder="不是抄詳解，而是記下原本怎麼想、哪個判斷線索漏掉了"
          rows={2}
        />
      </label>
      <label className="block space-y-1.5 text-xs font-medium">
        明天開始時先回答什麼？
        <Textarea
          value={tomorrowQuestion}
          onChange={(event) => {
            setTomorrowQuestion(event.target.value)
            setSaved(false)
          }}
          placeholder="例如：為什麼 page fault 不一定代表程式錯誤？"
          rows={2}
        />
      </label>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {saved ? '今日紀錄已儲存' : '至少填寫回想率與明日問題'}
        </span>
        <Button type="button" size="sm" disabled={!canSave} onClick={handleSave}>
          儲存今日紀錄
        </Button>
      </div>
    </div>
  )
}
