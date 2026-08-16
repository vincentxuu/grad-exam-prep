import type { ReviewCard } from '@/lib/review-card'
import { dueCardsFromState, dueCountFromState } from '@/store/flashcard'

function cards(count: number): ReviewCard[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `card-${index}`,
    source: 'content',
    prompt: `word-${index}`,
    label: '英文',
    render: 'flashcard',
  }))
}

describe('flashcard due selectors', () => {
  it('uses one fixed time so every unseen card is due in deterministic input order', () => {
    const unseen = cards(4_728)
    const nowSpy = jest.spyOn(Date, 'now')
    let clock = 1_000
    nowSpy.mockImplementation(() => clock++)

    const due = dueCardsFromState(unseen, {}, 500)
    expect(due).toHaveLength(4_728)
    expect(due.slice(0, 50).map((card) => card.id)).toEqual(
      unseen.slice(0, 50).map((card) => card.id)
    )
    expect(dueCountFromState(unseen, {}, 500)).toBe(4_728)
    expect(nowSpy).not.toHaveBeenCalled()

    nowSpy.mockRestore()
  })
})
