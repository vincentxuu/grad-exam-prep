import { render, screen } from '@testing-library/react'
import { EnglishPracticeRoute } from '@/components/exam/english-practice-route'

describe('EnglishPracticeRoute', () => {
  test('links each daily and weekly practice step to the matching IM tool', () => {
    render(<EnglishPracticeRoute />)

    expect(screen.getByRole('heading', { name: '今天的英文，照這條路線練' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /開始單字複習/ })).toHaveAttribute(
      'href',
      '/im/flashcards?subject=im-english'
    )
    expect(screen.getByRole('link', { name: /選一篇文章/ })).toHaveAttribute(
      'href',
      '/im/reading-practice'
    )
    expect(screen.getByRole('link', { name: /進入英文題庫/ })).toHaveAttribute(
      'href',
      '/im/questions?subject=im-english'
    )
    expect(screen.getByRole('link', { name: /有餘力：對話 10 分鐘/ })).toHaveAttribute(
      'href',
      '/im/chat'
    )
    expect(screen.getByRole('link', { name: /每週：完整模擬 1–2 回/ })).toHaveAttribute(
      'href',
      '/im/mock?subject=im-english'
    )
  })
})
