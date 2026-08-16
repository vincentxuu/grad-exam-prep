import { type NextRequest, NextResponse } from 'next/server'
import type { Flashcard } from '@/types/content'
import flashcardsRaw from '../../../../public/data/flashcards.json'

const flashcards = flashcardsRaw as unknown as Flashcard[]

export function GET(request: NextRequest) {
  const exam = request.nextUrl.searchParams.get('exam')
  if (exam !== 'im' && exam !== 'cs') {
    return NextResponse.json({ error: 'exam must be im or cs' }, { status: 400 })
  }

  return NextResponse.json({
    cards: flashcards.filter((card) => card.examId === exam),
    allCardIds: flashcards.map((card) => card.id),
  })
}
