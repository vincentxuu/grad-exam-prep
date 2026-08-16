import { lexiconCardId } from '@/lib/lexicon/normalize'
import { fromFlashcard, fromSavedWord, toFlashcards } from '@/lib/review-card'
import { localStorageImpl } from '@/lib/storage'
import type { Flashcard } from '@/types/content'
import type { SavedWord } from '@/types/storage'

const mockStorage: Record<string, string> = {}
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: (k: string) => mockStorage[k] ?? null,
    setItem: (k: string, v: string) => {
      mockStorage[k] = v
    },
    removeItem: (k: string) => {
      delete mockStorage[k]
    },
  },
  writable: true,
})

beforeEach(() => {
  for (const k of Object.keys(mockStorage)) delete mockStorage[k]
})

function word(headword: string): SavedWord {
  return {
    headword,
    cardId: lexiconCardId(headword),
    addedAt: Date.now(),
    source: { kind: 'reading' },
  }
}

const flashcard: Flashcard = {
  id: 'fc-cs-english-001',
  examId: 'cs',
  subjectId: 'cs-english',
  topicId: 'cs-english-vocabulary',
  prompt: 'intercept（動詞）的意思？',
  answer: '【意思】攔截',
}

describe('savedWords 儲存', () => {
  it('新增後讀得回來', () => {
    localStorageImpl.addSavedWord(word('intercept'))
    expect(localStorageImpl.getSavedWords().map((w) => w.headword)).toEqual(['intercept'])
  })

  it('重複加同一個字不會疊出兩張卡', () => {
    localStorageImpl.addSavedWord(word('intercept'))
    localStorageImpl.addSavedWord({ ...word('intercept'), note: '第二次' })

    const saved = localStorageImpl.getSavedWords()
    expect(saved).toHaveLength(1)
    expect(saved[0].note).toBe('第二次')
  })

  it('大小寫與彎引號差異仍是同一張卡', () => {
    localStorageImpl.addSavedWord(word("Author's"))
    localStorageImpl.addSavedWord({ ...word('AUTHOR’S'), note: '更新' })

    const saved = localStorageImpl.getSavedWords()
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({ headword: "author's", cardId: 'lx-authors', note: '更新' })
  })

  it('讀取舊資料時會正規化、去重並搬移排程', () => {
    mockStorage['grad-exam-prep-state'] = JSON.stringify({
      savedWords: [
        { ...word("Author's"), cardId: 'legacy-author', note: '舊筆記' },
        { ...word('AUTHOR’S'), note: '新筆記' },
      ],
      srsState: {
        'legacy-author': {
          cardId: 'legacy-author',
          interval: 6,
          repetitions: 2,
          easeFactor: 2.5,
          nextReview: 123,
          lastReview: 100,
        },
      },
    })

    expect(localStorageImpl.getSavedWords()).toEqual([
      expect.objectContaining({ headword: "author's", cardId: 'lx-authors', note: '新筆記' }),
    ])
    expect(localStorageImpl.getSRSCard('lx-authors')).toMatchObject({
      cardId: 'lx-authors',
      interval: 6,
    })
  })

  it('匯入 null 或畸形集合時會回復安全預設', () => {
    localStorageImpl.importJSON(JSON.stringify({ savedWords: null, srsState: null }))
    expect(localStorageImpl.getSavedWords()).toEqual([])
    expect(localStorageImpl.getState().srsState).toEqual({})
    expect(() => localStorageImpl.pruneSRSState([])).not.toThrow()
  })

  it('刪除時一併清掉 SRS 狀態，不留孤兒', () => {
    const w = word('intercept')
    localStorageImpl.addSavedWord(w)
    localStorageImpl.updateSRSCard(w.cardId, {
      cardId: w.cardId,
      interval: 6,
      repetitions: 2,
      easeFactor: 2.5,
      nextReview: Date.now(),
      lastReview: Date.now(),
    })

    expect(localStorageImpl.getSRSCard(w.cardId)).not.toBeNull()

    localStorageImpl.removeSavedWord('intercept')

    expect(localStorageImpl.getSavedWords()).toHaveLength(0)
    expect(localStorageImpl.getSRSCard(w.cardId)).toBeNull()
  })

  it('舊的 localStorage 資料沒有 savedWords 欄位時不會壞', () => {
    mockStorage['grad-exam-prep-state'] = JSON.stringify({
      completedTasks: {},
      customTasks: [],
      srsState: {},
      paperPractice: {},
      preferences: { examId: 'im' },
    })

    expect(localStorageImpl.getSavedWords()).toEqual([])
    localStorageImpl.addSavedWord(word('intercept'))
    expect(localStorageImpl.getSavedWords()).toHaveLength(1)
  })

  it('內容移除後可清掉孤兒排程但保留有效卡', () => {
    for (const cardId of ['still-here', 'retired']) {
      localStorageImpl.updateSRSCard(cardId, {
        cardId,
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: Date.now(),
        lastReview: null,
      })
    }

    localStorageImpl.pruneSRSState(['still-here'])
    expect(localStorageImpl.getSRSCard('still-here')).not.toBeNull()
    expect(localStorageImpl.getSRSCard('retired')).toBeNull()
  })

  it('persona 存進 preferences，並隨 export/import 一起走', () => {
    localStorageImpl.setPreferences({
      persona: { interests: ['登山'], work: '後端工程師' },
    })
    localStorageImpl.addSavedWord(word('intercept'))

    const exported = localStorageImpl.exportJSON()
    for (const k of Object.keys(mockStorage)) delete mockStorage[k]
    localStorageImpl.importJSON(exported)

    const state = localStorageImpl.getState()
    expect(state.preferences.persona?.work).toBe('後端工程師')
    expect(state.savedWords).toHaveLength(1)
  })
})

describe('ReviewCard 轉接', () => {
  it('靜態閃卡轉成 content 卡，保留原始 flashcard', () => {
    const rc = fromFlashcard(flashcard)
    expect(rc.id).toBe(flashcard.id)
    expect(rc.source).toBe('content')
    expect(rc.flashcard).toBe(flashcard)
  })

  it('查來的字轉成 lexicon 卡，id 帶 lx- 前綴', () => {
    const rc = fromSavedWord(word('take into account'))
    expect(rc.id).toBe('lx-take-into-account')
    expect(rc.source).toBe('lexicon')
    expect(rc.headword).toBe('take into account')
  })

  it('toFlashcards 略過 lexicon 卡，不需要 ! 斷言', () => {
    const mixed = [fromFlashcard(flashcard), fromSavedWord(word('intercept'))]
    expect(toFlashcards(mixed)).toEqual([flashcard])
  })

  it('兩種來源的卡片 id 不會撞在一起', () => {
    const contentIds = new Set([fromFlashcard(flashcard).id])
    expect(contentIds.has(fromSavedWord(word('intercept')).id)).toBe(false)
  })
})
