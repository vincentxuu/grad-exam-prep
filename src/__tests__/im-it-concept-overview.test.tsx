import { render, screen } from '@testing-library/react'
import { ImItConceptOverview } from '@/components/exam/im-it-concept-overview'

describe('IM-IT concept overview', () => {
  test('shows reviewed taxonomy and qualified practice coverage', () => {
    render(<ImItConceptOverview />)

    expect(screen.getByText('分類已審核')).toBeInTheDocument()
    expect(screen.getByText(/8 大主題 · 58 個子主題 · 260 題/)).toBeInTheDocument()
    expect(screen.getByText(/226 題/)).toBeInTheDocument()
    expect(screen.getByText(/20 題/)).toBeInTheDocument()
    expect(screen.getByText(/暫不列入完整模擬考成績/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '瀏覽 260 題計概題庫' })).toHaveAttribute(
      'href',
      '/im/questions?subject=im-it'
    )
  })

  test('renders all canonical topics with their question counts', () => {
    render(<ImItConceptOverview />)

    expect(screen.getByText('AI/ML（近年必考趨勢）')).toBeInTheDocument()
    expect(screen.getByText('資料結構')).toBeInTheDocument()
    expect(screen.getByText('資料庫')).toBeInTheDocument()
    expect(screen.getByText('網路')).toBeInTheDocument()
    expect(screen.getAllByText(/^\d+ 個子主題 · \d+ 題$/)).toHaveLength(8)
  })

  test('links the ten reviewed learning modules', () => {
    render(<ImItConceptOverview />)

    expect(screen.getByText('已上線學習模組')).toBeInTheDocument()
    expect(screen.getByText('10 / 58')).toBeInTheDocument()
    const lessonLinks = screen.getAllByRole('link', { name: '開始學習' })
    expect(lessonLinks).toHaveLength(10)
    expect(lessonLinks.map((link) => link.getAttribute('href'))).toContain(
      '/im/subjects/im-it/lessons/lesson-im-it-network-models-encapsulation'
    )
  })
})
