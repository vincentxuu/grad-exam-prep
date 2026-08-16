import { render, screen } from '@testing-library/react'
import { ImItConceptOverview } from '@/components/exam/im-it-concept-overview'

describe('IM-IT concept overview', () => {
  test('shows reviewed taxonomy coverage without promising scored practice', () => {
    render(<ImItConceptOverview />)

    expect(screen.getByText('分類已審核')).toBeInTheDocument()
    expect(screen.getByText(/8 大主題 · 58 個子主題 · 260 題/)).toBeInTheDocument()
    expect(screen.getByText(/尚不列入正式練習、自動判分或模擬考成績/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '瀏覽 260 題計概題庫' })).toHaveAttribute(
      'href',
      '/im/questions?subject=im-it',
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
})
