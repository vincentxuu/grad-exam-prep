import {
  getPaperContentIssue,
  getQuestionsByExam,
  getReliableQuestions,
  isPaperUnreliable,
  pastPapers,
  questions,
} from '@/lib/content'
import type { PastPaper } from '@/types/content'

// 這批考卷的題目文字是壞的，但壞得完全看不出來：題數齊、每題有答案、每題有詳解。
// 這些測試釘住「不可信的卷子不會被當成真題拿去計分」這條線 —— 它是靠資料標記
// 撐起來的，資料一改就會失效，所以要有東西守著。
const papers = pastPapers as unknown as PastPaper[]

describe('考卷內容可信度標記', () => {
  it('標記過的卷子都真的存在，而且帶著給使用者看的理由', () => {
    const flagged = papers.filter((p) => p.contentStatus)
    expect(flagged.length).toBeGreaterThan(0)
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

  it('106 缺文章、109／111／112 內容存疑', () => {
    expect(getPaperContentIssue('pp-im-en-106')?.contentStatus).toBe('incomplete')
    for (const id of ['pp-im-en-109', 'pp-im-en-111', 'pp-im-en-112']) {
      expect(getPaperContentIssue(id)?.contentStatus).toBe('suspect')
    }
  })

  it('113 不算存疑 —— 三選項是台大英文卷的正常段落，不是抽題掉字', () => {
    expect(isPaperUnreliable('pp-im-en-113')).toBe(false)
  })
})
