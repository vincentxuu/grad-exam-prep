import { daysUntilDue, initialCardState, isDue, reviewCard } from '@/lib/srs'

const NOW = new Date('2026-06-03T12:00:00Z').getTime()
const DAY = 24 * 60 * 60 * 1000

describe('initialCardState', () => {
  it('creates a due card with default values', () => {
    const state = initialCardState('card-1')
    expect(state.cardId).toBe('card-1')
    expect(state.repetitions).toBe(0)
    expect(state.easeFactor).toBe(2.5)
    expect(isDue(state, NOW + 1000)).toBe(true)
  })
})

describe('reviewCard — failure (rating=0)', () => {
  it('resets interval to 1 and repetitions to 0', () => {
    const s0 = initialCardState('x')
    const s1 = reviewCard({ ...s0, interval: 30, repetitions: 5 }, 0, NOW)
    expect(s1.interval).toBe(1)
    expect(s1.repetitions).toBe(0)
  })

  it('reduces ease factor but floors at 1.3', () => {
    const s0 = { ...initialCardState('x'), easeFactor: 1.4 }
    const s1 = reviewCard(s0, 0, NOW)
    expect(s1.easeFactor).toBeCloseTo(1.3)
  })
})

describe('reviewCard — success (rating=1 or 2)', () => {
  it('first repetition → interval 1', () => {
    const s0 = initialCardState('x')
    const s1 = reviewCard(s0, 2, NOW)
    expect(s1.interval).toBe(1)
    expect(s1.repetitions).toBe(1)
  })

  it('second repetition → interval 6', () => {
    const s1 = reviewCard(initialCardState('x'), 2, NOW)
    const s2 = reviewCard(s1, 2, NOW)
    expect(s2.interval).toBe(6)
    expect(s2.repetitions).toBe(2)
  })

  it('third repetition → interval = round(6 * easeFactor)', () => {
    const s1 = reviewCard(initialCardState('x'), 2, NOW)
    const s2 = reviewCard(s1, 2, NOW)
    const s3 = reviewCard(s2, 2, NOW)
    expect(s3.interval).toBe(Math.round(6 * s2.easeFactor))
    expect(s3.repetitions).toBe(3)
  })

  it('schedules nextReview correctly', () => {
    const s1 = reviewCard(initialCardState('x'), 2, NOW)
    expect(s1.nextReview).toBe(NOW + 1 * DAY)
  })
})

describe('isDue / daysUntilDue', () => {
  it('isDue returns true when nextReview is in the past', () => {
    const s = { ...initialCardState('x'), nextReview: NOW - 1000 }
    expect(isDue(s, NOW)).toBe(true)
  })

  it('isDue returns false when nextReview is in the future', () => {
    const s = { ...initialCardState('x'), nextReview: NOW + 5 * DAY }
    expect(isDue(s, NOW)).toBe(false)
  })

  it('daysUntilDue returns 0 for overdue cards', () => {
    const s = { ...initialCardState('x'), nextReview: NOW - 2 * DAY }
    expect(daysUntilDue(s, NOW)).toBe(0)
  })

  it('daysUntilDue returns correct days for future cards', () => {
    const s = { ...initialCardState('x'), nextReview: NOW + 3 * DAY }
    expect(daysUntilDue(s, NOW)).toBe(3)
  })
})

describe('due-queue ordering', () => {
  it('most overdue card has lowest nextReview', () => {
    const cards = [
      { ...initialCardState('a'), nextReview: NOW - 1 * DAY },
      { ...initialCardState('b'), nextReview: NOW - 3 * DAY },
      { ...initialCardState('c'), nextReview: NOW - 0.5 * DAY },
    ]
    const dueQueue = cards.filter((c) => isDue(c, NOW)).sort((a, b) => a.nextReview - b.nextReview)
    expect(dueQueue[0].cardId).toBe('b')
    expect(dueQueue[1].cardId).toBe('a')
    expect(dueQueue[2].cardId).toBe('c')
  })
})
