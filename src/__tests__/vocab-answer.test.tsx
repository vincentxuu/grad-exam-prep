import { render, screen } from '@testing-library/react'
import { VocabAnswer } from '@/components/flashcard/vocab-answer'

jest.mock('@/hooks/use-word-web', () => ({
  useWordWeb: () => ({ getWord: () => null, loading: false }),
}))

// Component behavior should not depend on a generated card ID that can be retired.
const card = {
  id: 'fc-test-discrepancy',
  answer:
    '【意思】差異；不一致\n【例句】There was a significant discrepancy between the projected and actual revenue figures.\n（預測與實際營收數字之間存在顯著差異。）\n【近義詞】difference, inconsistency\n【反義詞】agreement, consistency',
}

describe('VocabAnswer（discrepancy 卡）', () => {
  beforeEach(() => {
    render(
      <VocabAnswer cardId={card.id} prompt="discrepancy" answer={card.answer} speak={jest.fn()} speakingId={null} />
    )
  })

  it('拆出例句並附上朗讀按鈕', () => {
    expect(
      screen.getByText(/There was a significant discrepancy between the projected/)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '播放例句' })).toBeInTheDocument()
  })

  it('同義詞與反義詞各自有朗讀按鈕', () => {
    expect(screen.getByRole('button', { name: '播放同義詞' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '播放反義詞' })).toBeInTheDocument()
  })

  it('例句中文翻譯跟著例句一起顯示', () => {
    expect(screen.getByText('（預測與實際營收數字之間存在顯著差異。）')).toBeInTheDocument()
  })
})
