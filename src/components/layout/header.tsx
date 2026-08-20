'use client'

import { ChevronDown, Download, GraduationCap, Menu, Settings, User } from '@sketchyicons/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { QuickCapture } from '@/components/lexicon/quick-capture'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const EXAM_OPTIONS = [
  { id: 'im', label: '資管所' },
  { id: 'cs', label: '資工所' },
] as const

interface NavGroup {
  label: string
  items: { key: string; label: string }[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: '學習',
    items: [
      { key: 'plan', label: '備考計畫' },
      { key: 'flashcards', label: '閃卡練習' },
    ],
  },
  {
    label: '英文',
    items: [
      { key: 'lookup', label: '查詞' },
      { key: 'word-web', label: '語義群' },
      { key: 'reading', label: '閱讀' },
      { key: 'reading-practice', label: '閱讀練習' },
      { key: 'chat', label: '對話' },
    ],
  },
  {
    label: '測驗',
    items: [
      { key: 'questions', label: '題庫' },
      { key: 'mock', label: '模擬考' },
      { key: 'past-papers', label: '考古題' },
      { key: 'review', label: '錯題本' },
    ],
  },
]

interface GlobalItem {
  href: string
  label: string
}

const GLOBAL_ITEMS: GlobalItem[] = [
  { href: '/notes', label: '時事筆記' },
  { href: '/guides', label: '上榜心得' },
  { href: '/resources', label: '資源庫' },
]

function ExamSwitcher({ exam }: { exam: string }) {
  const router = useRouter()
  const current = EXAM_OPTIONS.find((e) => e.id === exam) ?? EXAM_OPTIONS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium hover:bg-accent transition-colors">
        {current.label}
        <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {EXAM_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => router.push(`/${option.id}/today`)}
            className={cn(option.id === exam && 'font-medium bg-accent')}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavDropdown({
  group,
  exam,
  pathname,
}: {
  group: NavGroup
  exam: string
  pathname: string | null
}) {
  const isActive = group.items.some((item) => pathname?.startsWith(`/${exam}/${item.key}`))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex shrink-0 items-center gap-0.5 rounded-md px-2 lg:px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap',
          isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
        )}
      >
        {group.label}
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {group.items.map((item) => (
          <DropdownMenuItem key={item.key} asChild>
            <Link
              href={`/${exam}/${item.key}`}
              className={cn(
                pathname?.startsWith(`/${exam}/${item.key}`) && 'font-medium bg-accent'
              )}
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MoreDropdown({ pathname }: { pathname: string | null }) {
  const isActive = GLOBAL_ITEMS.some((item) => pathname?.startsWith(item.href))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex shrink-0 items-center gap-0.5 rounded-md px-2 lg:px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap',
          isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
        )}
      >
        更多
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {GLOBAL_ITEMS.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              href={item.href}
              className={cn(pathname?.startsWith(item.href) && 'font-medium bg-accent')}
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Below `md` the inline nav cannot fit, so every section collapses into this menu. */
function MobileNav({ exam, pathname }: { exam: string; pathname: string | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="開啟導覽選單"
        className="flex md:hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52 max-h-[calc(100vh-5rem)] overflow-y-auto">
        <DropdownMenuItem asChild>
          <Link
            href={`/${exam}/today`}
            className={cn(pathname?.endsWith('/today') && 'font-medium bg-accent')}
          >
            今日
          </Link>
        </DropdownMenuItem>

        {NAV_GROUPS.map((group) => (
          <Fragment key={group.label}>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="py-1 text-xs font-normal text-muted-foreground">
              {group.label}
            </DropdownMenuLabel>
            {group.items.map((item) => (
              <DropdownMenuItem key={item.key} asChild>
                <Link
                  href={`/${exam}/${item.key}`}
                  className={cn(
                    pathname?.startsWith(`/${exam}/${item.key}`) && 'font-medium bg-accent'
                  )}
                >
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </Fragment>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="py-1 text-xs font-normal text-muted-foreground">
          更多
        </DropdownMenuLabel>
        {GLOBAL_ITEMS.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              href={item.href}
              className={cn(pathname?.startsWith(item.href) && 'font-medium bg-accent')}
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserDropdown() {
  const { user, loading, logout } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  if (loading) return null

  if (!user) {
    return (
      <>
        <button
          onClick={() => setLoginOpen(true)}
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors shrink-0"
        >
          登入
        </button>
        {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 rounded-md p-1.5 hover:bg-accent transition-colors shrink-0">
        <User className="h-4 w-4" aria-hidden="true" />
        <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/llm" className="gap-2">
            <Settings className="h-4 w-4" aria-hidden="true" />
            LLM 設定
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            const { fetchFullState } = await import('@/lib/server-storage')
            const data = await fetchFullState()
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `grad-exam-prep-backup-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="gap-2"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          匯出資料
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          登出
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-background border rounded-lg p-6 w-full max-w-sm mx-4 space-y-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-medium">{mode === 'login' ? '登入' : '註冊'}</h2>
          <button
            type="button"
            aria-label="關閉"
            onClick={onClose}
            className="rounded-sm p-1 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            className="w-full bg-background border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密碼（至少 6 字）"
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="w-full bg-background border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? '處理中…' : mode === 'login' ? '登入' : '註冊'}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          {mode === 'login' ? (
            <>
              還沒有帳號？{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError(null)
                }}
                className="underline hover:text-foreground"
              >
                註冊
              </button>
            </>
          ) : (
            <>
              已有帳號？{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
                className="underline hover:text-foreground"
              >
                登入
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const exam = pathname?.startsWith('/cs') ? 'cs' : 'im'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-1 sm:gap-2 min-w-0">
        <Link
          href={`/${exam}/today`}
          className="flex items-center gap-1.5 font-bold text-primary shrink-0"
        >
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline text-sm">台大研所備考</span>
        </Link>

        <ExamSwitcher exam={exam} />

        <MobileNav exam={exam} pathname={pathname} />

        <nav className="hidden md:flex items-center gap-0.5 text-sm flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={`/${exam}/today`}
            className={cn(
              'px-2 lg:px-3 py-1.5 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap shrink-0',
              pathname?.endsWith('/today')
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground'
            )}
          >
            今日
          </Link>

          {NAV_GROUPS.map((group) => (
            <NavDropdown key={group.label} group={group} exam={exam} pathname={pathname} />
          ))}

          <MoreDropdown pathname={pathname} />
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <QuickCapture />
          <ThemeToggle />
          <UserDropdown />
        </div>
      </div>
    </header>
  )
}
