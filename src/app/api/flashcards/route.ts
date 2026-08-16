import { type NextRequest, NextResponse } from 'next/server'
import type { Flashcard } from '@/types/content'
import legacyArchiveRaw from '../../../../archive/flashcards/im-nonenglish-legacy.json'
import flashcardsRaw from '../../../../public/data/flashcards.json'

const flashcards = flashcardsRaw as unknown as Flashcard[]
const legacyArchive = legacyArchiveRaw as unknown as { cards: Flashcard[] }
const allCardIds = [
  ...new Set([...flashcards.map((card) => card.id), ...legacyArchive.cards.map((card) => card.id)]),
]

export function GET(request: NextRequest) {
  const exam = request.nextUrl.searchParams.get('exam')
  if (exam !== 'im' && exam !== 'cs') {
    return NextResponse.json({ error: 'exam must be im or cs' }, { status: 400 })
  }

  return NextResponse.json({
    cards: flashcards.filter((card) => card.examId === exam),
    // Quarantined cards are not served for practice, but their IDs remain valid so opening
    // this page does not erase a learner's existing SRS history via pruneSRSState().
    allCardIds,
  })
}
