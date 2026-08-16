import {
  getPaperContentIssue,
  getQuestionsByExam,
  getReliableQuestions,
  isPaperUnreliable,
  pastPapers,
  questions,
} from '@/lib/content'
import type { PastPaper } from '@/types/content'

// 內容標記是資料驅動的；即使目前所有已知英文卷都修復，這些測試仍守住未來再次
// 標記考卷時的整卷排除行為。
const papers = pastPapers as unknown as PastPaper[]

describe('考卷內容可信度標記', () => {
  it('標記過的卷子都真的存在，而且帶著給使用者看的理由', () => {
    const flagged = papers.filter((p) => p.contentStatus)
    for (const paper of flagged) {
      expect(['incomplete', 'suspect']).toContain(paper.contentStatus)
      expect(paper.contentIssue?.length ?? 0).toBeGreaterThan(10)
      expect(questions.some((q) => q.paperId === paper.id)).toBe(true)
    }
  })

  it('模擬考不會拿到不可信卷子的題目', () => {
    const reliable = getReliableQuestions(getQuestionsByExam('im'))
    expect(reliable.length).toBeGreaterThan(0)
    expect(reliable.some((q) => isPaperUnreliable(q.paperId))).toBe(false)
  })

  it('排除的是整份卷子，不是零星幾題', () => {
    for (const paper of papers.filter((p) => p.contentStatus)) {
      const kept = getReliableQuestions(questions.filter((q) => q.paperId === paper.id))
      expect(kept).toHaveLength(0)
    }
  })

  it('沒有標記的卷子照常進模擬考', () => {
    // 115 是逐題對過原卷的那一份，它掉出來就代表排除範圍寫太寬
    expect(isPaperUnreliable('pp-im-en-115')).toBe(false)
    expect(getPaperContentIssue('pp-im-en-115')).toBeUndefined()
  })

  it('106、109、111、112 的已知問題都已修復', () => {
    for (const id of ['pp-im-en-106', 'pp-im-en-109', 'pp-im-en-111', 'pp-im-en-112']) {
      expect(isPaperUnreliable(id)).toBe(false)
      expect(getPaperContentIssue(id)).toBeUndefined()
    }
  })

  it('113 不算存疑 —— 三選項是台大英文卷的正常段落，不是抽題掉字', () => {
    expect(isPaperUnreliable('pp-im-en-113')).toBe(false)
  })
})
