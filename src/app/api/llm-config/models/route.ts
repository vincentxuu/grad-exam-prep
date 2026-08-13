import { type NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/llm/admin-auth'
import { asProvider, providerInfo } from '@/lib/llm/catalog'
import { listModels } from '@/lib/llm/models'

/** 列出某一家目前有哪些 model，給設定頁的下拉選單用。 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const raw = request.nextUrl.searchParams.get('provider') ?? ''
  const provider = asProvider(raw)
  if (!provider) {
    return NextResponse.json({ error: `不認得的 provider：${raw}` }, { status: 400 })
  }

  const fallback = providerInfo(provider)?.fallbackModels ?? []
  return NextResponse.json(await listModels(auth.env, provider, fallback))
}
