import { render, screen } from '@testing-library/react'
import { VocabAnswer } from '@/components/flashcard/vocab-answer'
import type { Flashcard } from '@/types/content'
import flashcardsRaw from '../../public/data/flashcards.json'

const flashcards = flashcardsRaw as unknown as Flashcard[]

// 使用者回報「看不到發音」時截圖的那張卡，拿來當回歸基準。
const card = flashcards.find((c) => c.id === 'fc-im-english-019') as Flashcard

describe('VocabAnswer（discrepancy 卡）', () => {
  beforeEach(() => {
    render(
      <VocabAnswer cardId={card.id} answer={card.answer} speak={jest.fn()} speakingId={null} />
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
