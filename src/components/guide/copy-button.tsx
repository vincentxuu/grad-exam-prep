'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CopyButton({ text, label = '複製' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button variant="outline" size="sm" className="h-7 text-xs shrink-0" onClick={handleCopy}>
      {copied ? '✓ 已複製' : `📋 ${label}`}
    </Button>
  )
}
