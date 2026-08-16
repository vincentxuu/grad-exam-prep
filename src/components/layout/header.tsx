'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { QuickCapture } from '@/components/lexicon/quick-capture'
import { cn } from '@/lib/utils'

const staticItems = [
  { href: '/im', label: '資管所' },
  { href: '/cs', label: '資工所' },
]

const examItems = [
  { key: 'today', label: '今日學習' },
  { key: 'plan', label: '備考計畫' },
  { key: 'flashcards', label: '閃卡練習' },
  { key: 'lookup', label: '查詞' },
  { key: 'reading', label: '閱讀' },
  { key: 'reading-practice', label: '閱讀練習' },
  { key: 'chat', label: '對話' },
  { key: 'past-papers', label: '考古題' },
  { key: 'questions', label: '題庫' },
  { key: 'mock', label: '模擬考' },
  { key: 'review', label: '錯題本' },
]

const globalItems = [
  { href: '/notes', label: '時事筆記' },
  { href: '/guides', label: '上榜心得' },
  { href: '/compare', label: '比較' },
  { href: '/resources', label: '資源庫' },
  { href: '/settings/llm', label: 'LLM 設定' },
]

export function Header() {
  const pathname = usePathname()
  const exam = pathname?.startsWith('/cs') ? 'cs' : 'im'

  const navItems = [
    ...staticItems,
    ...examItems.map((item) => ({ href: `/${exam}/${item.key}`, label: item.label })),
    ...globalItems,
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-2 sm:gap-6 min-w-0">
        <Link href="/" className="flex items-center gap-1.5 font-bold text-primary shrink-0">
          <span className="text-lg">🎓</span>
          <span className="hidden sm:inline text-sm">台大研所備考</span>
        </Link>

        <nav className="flex items-center gap-0.5 text-sm overflow-x-auto scrollbar-none flex-1 min-w-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-2 sm:px-3 py-1.5 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap shrink-0',
                pathname?.startsWith(item.href) && item.href !== '/'
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <QuickCapture />
      </div>
    </header>
  )
}
