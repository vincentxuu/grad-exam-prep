'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAuthHeader } from '@/lib/auth'

interface ModelListResult {
  models: string[]
  source: 'live' | 'fallback'
  note?: string
}

interface Props {
  provider: string
  value: string
  onChange: (model: string) => void
  placeholder?: string
}

/** 選單裡代表「不從清單挑，自己打」的哨兵值。model id 不會長這樣。 */
const CUSTOM = '__custom__'

/**
 * Model 選單。清單跟 provider 現撈，不寫死。
 *
 * 一定保留手打的選項 —— 現撈失敗、provider 剛出新 model、或是 OpenRouter
 * 那種上百個型號的情況，選單都不該是唯一入口。
 */
export function ModelPicker({ provider, value, onChange, placeholder }: Props) {
  const [list, setList] = useState<ModelListResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [custom, setCustom] = useState(false)

  const load = useCallback(async () => {
    if (!provider) {
      setList(null)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/llm-config/models?provider=${encodeURIComponent(provider)}`, {
        headers: getAuthHeader(),
      })
      setList(res.ok ? ((await res.json()) as ModelListResult) : null)
    } catch {
      setList(null)
    } finally {
      setLoading(false)
    }
  }, [provider])

  useEffect(() => {
    load()
  }, [load])

  // 目前的值不在清單裡（自訂、或清單還沒回來）就直接顯示輸入框
  const models = list?.models ?? []
  const inList = !!value && models.includes(value)
  const showInput = custom || (!!value && !inList && !loading)

  if (!provider) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="font-mono"
      />
    )
  }

  return (
    <div className="space-y-1.5">
      {showInput ? (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono"
          />
          {models.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCustom(false)
                onChange('')
              }}
            >
              從清單選
            </Button>
          )}
        </div>
      ) : (
        <Select
          value={inList ? value : ''}
          onValueChange={(v) => {
            if (v === CUSTOM) {
              setCustom(true)
              onChange('')
            } else {
              onChange(v)
            }
          }}
        >
          <SelectTrigger className="font-mono">
            <SelectValue placeholder={loading ? '讀取中…' : (placeholder ?? '選一個 model')} />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m} value={m} className="font-mono">
                {m}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM}>自己打…</SelectItem>
          </SelectContent>
        </Select>
      )}

      <p className="text-muted-foreground text-xs">
        {loading && '讀取 model 清單…'}
        {!loading && list?.source === 'live' && `跟 ${provider} 現撈的 ${models.length} 個 model`}
        {!loading && list?.source === 'fallback' && (
          <span>
            撈不到清單（{list.note}），以下是內建範例，可能已過期
            <button type="button" onClick={load} className="ml-2 underline">
              重試
            </button>
          </span>
        )}
      </p>
    </div>
  )
}
