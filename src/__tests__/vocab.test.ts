import { extractWord, hasVocabStructure, isVocabCard } from '@/lib/vocab'
import type { Flashcard } from '@/types/content'
import flashcardsRaw from '../../public/data/flashcards.json'

const flashcards = flashcardsRaw as unknown as Flashcard[]
const englishCards = flashcards.filter((c) => c.subjectId.endsWith('-english'))

describe('extractWord', () => {
  it('抓出開頭的單字（後接全形括號）', () => {
    expect(extractWord('intercept（動詞）在資安語境中的意思為何？請說明並舉例。')).toBe('intercept')
  })

  it('抓出開頭的單字（後接半形括號）', () => {
    expect(extractWord('throughput (n.) 的定義為何？')).toBe('throughput')
  })

  it('抓出開頭後直接接中文的單字', () => {
    expect(extractWord('leverage 與 utilize 在技術文章中語意有何細微差異？')).toBe('leverage')
  })

  it('抓出引號內的單字', () => {
    expect(extractWord('以下詞彙配對：選出與「impede」意思最接近的詞。')).toBe('impede')
  })

  it('引號內有兩個字時一起唸', () => {
    expect(extractWord('辨析易混淆詞組："imply" vs "infer" 有何不同？')).toBe('imply versus infer')
  })

  it('沒有可朗讀的英文時回傳 null', () => {
    expect(extractWord('下列哪個選項最能表達整合研究結果的概念？')).toBeNull()
  })
})

describe('hasVocabStructure', () => {
  it('認得【例句】標記', () => {
    expect(hasVocabStructure('【意思】攔截\n【例句】They intercepted it.')).toBe(true)
  })

  it('認得「例句：」標記', () => {
    expect(hasVocabStructure('中文：攔截\n例句：They intercepted it.')).toBe(true)
  })

  it('沒有結構標記時為 false', () => {
    expect(hasVocabStructure('這題考的是被動語態的用法。')).toBe(false)
  })
})

describe('isVocabCard', () => {
  it('非英文科目一律不套字彙版面', () => {
    expect(isVocabCard({ subjectId: 'cs-algo', answer: '【例句】irrelevant' })).toBe(false)
  })

  it('vocabulary 以外的英文 topic 只要有例句也算', () => {
    const technical = englishCards.find(
      (c) => c.topicId.endsWith('technical') && c.answer.includes('【例句】')
    )
    expect(technical).toBeDefined()
    expect(isVocabCard(technical as Flashcard)).toBe(true)
  })
})

describe('英文閃卡內容涵蓋率', () => {
  it('多數英文閃卡都排得出字彙結構', () => {
    const structured = englishCards.filter(isVocabCard)
    expect(englishCards.length).toBeGreaterThan(0)
    expect(structured.length).toBeGreaterThan(englishCards.length / 2)
  })

  it('vocabulary topic 的卡片都抓得到可朗讀的單字', () => {
    const vocab = englishCards.filter((c) => c.topicId.includes('vocabulary'))
    const missing = vocab.filter((c) => extractWord(c.prompt) === null)
    // 純選擇題型（題幹沒有單一主詞）本來就沒有單字可唸，容許少量
    expect(missing.length).toBeLessThanOrEqual(vocab.length * 0.1)
  })
})
