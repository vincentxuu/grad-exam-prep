import { type NextRequest, NextResponse } from 'next/server'
import { getChatEnv, getUserId } from '@/lib/chat/env'
import { endSession, getCorrections, getMessages, getSession } from '@/lib/chat/store'
import type { Db } from '@/lib/lexicon/store'
import type { SessionSummary } from '@/types/chat'

interface Body {
  /** 使用者已收藏的字，用來算出「AI 帶出來的新字」 */
  knownWords?: string[]
}

/** 一則訊息裡看起來值得收藏的英文字：夠長、非停用字。 */
const STOPWORDS = new Set([
  'about',
  'after',
  'again',
  'against',
  'because',
  'before',
  'being',
  'between',
  'could',
  'doing',
  'during',
  'every',
  'from',
  'have',
  'having',
  'here',
  'into',
  'just',
  'like',
  'more',
  'most',
  'much',
  'other',
  'over',
  'same',
  'should',
  'some',
  'such',
  'than',
  'that',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'under',
  'very',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'with',
  'would',
  'your',
  'been',
  'also',
  'only',
  'really',
  'something',
  'someone',
  'things',
  'think',
  'know',
  'make',
  'made',
  'well',
  'good',
  'great',
  'right',
  'still',
  'even',
  'back',
  'take',
  'want',
  'need',
  'look',
  'find',
  'give',
  'tell',
  'work',
  'sure',
  'maybe',
  'actually',
])

function candidateWords(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z]{6,}/g) ?? []
  return [...new Set(words)].filter((w) => !STOPWORDS.has(w))
}

/**
 * POST /api/chat/[id]/end —— 結束對話並回傳總結。
 *
 * used / missed 直接從已存的 used_words 算，不再打模型。
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  let body: Body = {}
  try {
    body = await request.json()
  } catch {
    // 沒帶 body 也可以結束
  }

  try {
    const env = await getChatEnv()
    const db = env.DB as unknown as Db

    const session = await getSession(db, id, getUserId(request))
    if (!session) return NextResponse.json({ error: '找不到這場對話' }, { status: 404 })

    const [messages, corrections] = await Promise.all([getMessages(db, id), getCorrections(db, id)])

    const used = [...new Set(messages.flatMap((m) => m.usedWords ?? []))]
    const missed = session.targetWords.filter((w) => !used.includes(w))

    const known = new Set([
      ...(body.knownWords ?? []).map((w) => w.toLowerCase()),
      ...session.targetWords.map((w) => w.toLowerCase()),
    ])

    const newWords = [
      ...new Set(
        messages
          .filter((m) => m.role === 'assistant')
          .flatMap((m) => candidateWords(m.content))
          .filter((w) => !known.has(w))
      ),
    ].slice(0, 12)

    await endSession(db, id)

    const summary: SessionSummary = { used, missed, corrections, newWords }
    return NextResponse.json({ summary })
  } catch {
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
