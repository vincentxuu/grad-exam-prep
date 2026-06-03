'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/im', label: '資管所' },
  { href: '/cs', label: '資工所' },
  { href: '/im/plan', label: '備考計畫' },
  { href: '/im/flashcards', label: '閃卡練習' },
  { href: '/im/past-papers', label: '考古題' },
  { href: '/notes', label: '時事筆記' },
  { href: '/compare', label: '比較' },
  { href: '/resources', label: '資源庫' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <span className="text-lg">🎓</span>
          <span className="hidden sm:inline">台大研所備考</span>
          <span className="sm:hidden">研所備考</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                pathname?.startsWith(item.href)
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
