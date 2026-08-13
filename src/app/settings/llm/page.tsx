import type { Metadata } from 'next'
import { LlmSettings } from '@/components/settings/llm-settings'

export const metadata: Metadata = {
  title: 'LLM 設定',
}

export default function LlmSettingsPage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 font-bold text-2xl">LLM 設定</h1>
      <p className="mb-6 text-muted-foreground text-sm">
        改完立即生效，不用重新部署。查詞與對話兩個功能共用這裡的設定。
      </p>
      <LlmSettings />
    </main>
  )
}
