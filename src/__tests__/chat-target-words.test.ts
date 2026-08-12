/**
 * @jest-environment node
 */
import { detectUsedWords, inflections, pickTargetWords } from '@/lib/chat/target-words'
import type { ReviewCard } from '@/lib/review-card'
import type { CardSRSState } from '@/types/storage'

const DAY = 86_400_000
const NOW = Date.UTC(2026, 7, 12)

function card(headword: string): ReviewCard {
  return {
    id: `lx-${headword}`,
    source: 'lexicon',
    prompt: headword,
    label: '我的單字',
    render: 'lexicon',
    headword,
  }
}

function state(over: Partial<CardSRSState> = {}): CardSRSState {
  return {
    cardId: 'x',
    interval: 6,
    repetitions: 3,
    easeFactor: 2.5,
    nextReview: NOW + 6 * DAY,
    lastReview: NOW - DAY,
    ...over,
  }
}

describe('detectUsedWords', () => {
  it('原形直接命中', () => {
    expect(detectUsedWords('We should intercept it.', ['intercept'])).toEqual(['intercept'])
  })

  it('規則屈折形也算命中', () => {
    expect(detectUsedWords('They intercepted the request.', ['intercept'])).toEqual(['intercept'])
    expect(detectUsedWords('He studied hard.', ['study'])).toEqual(['study'])
    expect(detectUsedWords('We are planning it.', ['plan'])).toEqual(['plan'])
    expect(detectUsedWords('She validates the input.', ['validate'])).toEqual(['validate'])
  })

  it('用字邊界 —— act 不會被 contract 誤判', () => {
    expect(detectUsedWords('We signed a contract.', ['act'])).toEqual([])
  })

  it('不區分大小寫', () => {
    expect(detectUsedWords('Intercept it now.', ['intercept'])).toEqual(['intercept'])
  })

  it('片語整串比對', () => {
    expect(detectUsedWords('We must take into account the cost.', ['take into account'])).toEqual([
      'take into account',
    ])
    expect(detectUsedWords('We took it into account.', ['take into account'])).toEqual([])
  })

  it('多個目標字各自判定', () => {
    expect(
      detectUsedWords('We intercepted it but did not validate anything.', [
        'intercept',
        'validate',
        'mitigate',
      ])
    ).toEqual(['intercept', 'validate'])
  })

  it('已知限制：抓不到不規則變化 take → took', () => {
    // 為此引進詞形還原函式庫不划算；糾錯模式開著時模型會補上
    expect(detectUsedWords('We took the risk.', ['take'])).toEqual([])
  })

  it('沒用到就回空陣列', () => {
    expect(detectUsedWords('Nothing relevant here.', ['intercept'])).toEqual([])
  })
})

describe('inflections', () => {
  it('片語不變形', () => {
    expect(inflections('take into account')).toEqual(['take into account'])
  })

  it('e 結尾補上去 e 的形式', () => {
    expect(inflections('validate')).toEqual(expect.arrayContaining(['validated', 'validating']))
  })

  it('y 結尾補 ies / ied', () => {
    expect(inflections('study')).toEqual(expect.arrayContaining(['studies', 'studied']))
  })
})

describe('pickTargetWords', () => {
  it('到期的優先', () => {
    const cards = [card('alpha'), card('beta')]
    const states: Record<string, CardSRSState> = {
      'lx-alpha': state({ nextReview: NOW + 10 * DAY }),
      'lx-beta': state({ nextReview: NOW - DAY }),
    }
    expect(pickTargetWords(cards, (id) => states[id], 1, NOW)).toEqual(['beta'])
  })

  it('沒有到期的就挑上次評「不會」的', () => {
    const cards = [card('alpha'), card('beta')]
    const states: Record<string, CardSRSState> = {
      'lx-alpha': state({ nextReview: NOW + 10 * DAY }),
      'lx-beta': state({ nextReview: NOW + 1 * DAY, repetitions: 0, lastReview: NOW - DAY }),
    }
    expect(pickTargetWords(cards, (id) => states[id], 1, NOW)).toEqual(['beta'])
  })

  it('從沒複習過的不算「不熟」，排在到期與弱字之後', () => {
    const cards = [card('fresh'), card('weak')]
    const states: Record<string, CardSRSState> = {
      'lx-fresh': state({ nextReview: NOW + 5 * DAY, repetitions: 0, lastReview: null }),
      'lx-weak': state({ nextReview: NOW + 5 * DAY, repetitions: 0, lastReview: NOW - DAY }),
    }
    expect(pickTargetWords(cards, (id) => states[id], 1, NOW)).toEqual(['weak'])
  })

  it('只挑 lexicon 卡，靜態閃卡不進對話', () => {
    const contentCard: ReviewCard = {
      id: 'fc-cs-english-001',
      source: 'content',
      prompt: 'intercept（動詞）？',
      label: '英文',
      render: 'flashcard',
    }
    expect(pickTargetWords([contentCard], () => state(), 5, NOW)).toEqual([])
  })

  it('不超過要求的數量', () => {
    const cards = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(card)
    expect(pickTargetWords(cards, () => state({ nextReview: NOW - DAY }), 6, NOW)).toHaveLength(6)
  })

  it('沒有收藏的字就回空陣列', () => {
    expect(pickTargetWords([], () => state(), 6, NOW)).toEqual([])
  })
})
