/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/flashcards/route'

interface ApiCard {
  id: string
  subjectId: string
}

interface FlashcardResponse {
  cards: ApiCard[]
  allCardIds: string[]
}

describe('GET /api/flashcards quarantine behavior', () => {
  test('does not serve quarantined IM subjects for practice', async () => {
    const response = GET(new NextRequest('http://localhost/api/flashcards?exam=im'))
    const body = (await response.json()) as FlashcardResponse
    const blocked = new Set(['im-it', 'im-mis', 'im-stat'])

    expect(response.status).toBe(200)
    expect(body.cards.some((card) => blocked.has(card.subjectId))).toBe(false)
  })

  test('retains archived IDs so SRS cleanup does not erase existing history', async () => {
    const response = GET(new NextRequest('http://localhost/api/flashcards?exam=im'))
    const body = (await response.json()) as FlashcardResponse

    expect(body.cards.some((card) => card.id === 'fc-im-it-001')).toBe(false)
    expect(body.allCardIds).toContain('fc-im-it-001')
    expect(body.allCardIds).toContain('fc-im-mis-001')
    expect(body.allCardIds).toContain('fc-im-stat-001')
    expect(new Set(body.allCardIds).size).toBe(body.allCardIds.length)
  })

  test('keeps invalid exam validation unchanged', async () => {
    const response = GET(new NextRequest('http://localhost/api/flashcards?exam=unknown'))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'exam must be im or cs' })
  })
})
