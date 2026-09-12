import { render, screen } from '@testing-library/react'
import { ImItConceptOverview } from '@/components/exam/im-it-concept-overview'
import { LearningConceptOverview } from '@/components/exam/learning-concept-overview'
import { imItLearningCatalog } from '@/lib/im-it-learning'

describe('IM-IT concept overview', () => {
  test('shows reviewed taxonomy and qualified practice coverage', () => {
    render(<ImItConceptOverview />)

    expect(screen.getByText('分類已審核')).toBeInTheDocument()
    expect(screen.getByText(/9 大主題 · 61 個子主題 · 260 題/)).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(`^${imItLearningCatalog.overview?.eligibleCount} 題$`))
    ).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(`^${imItLearningCatalog.overview?.disputedCount} 題$`))
    ).toBeInTheDocument()
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
    expect(screen.getByText('資料分析與新興科技')).toBeInTheDocument()
    expect(screen.getAllByText(/^\d+ 個子主題 · \d+ 題$/)).toHaveLength(9)
  })

  test('links all reviewed learning modules', () => {
    render(<ImItConceptOverview />)

    expect(screen.getByText('已上線學習模組')).toBeInTheDocument()
    expect(screen.getByText('61 / 61')).toBeInTheDocument()
    const lessonLinks = screen.getAllByRole('link', { name: '開始學習' })
    expect(lessonLinks).toHaveLength(imItLearningCatalog.lessons.length)
    expect(lessonLinks.map((link) => link.getAttribute('href'))).toContain(
      '/im/subjects/im-it/lessons/lesson-im-it-network-models-encapsulation'
    )
  })

  test('renders the same IM-IT catalog through the shared overview', () => {
    render(<LearningConceptOverview catalog={imItLearningCatalog} />)

    expect(screen.getByText('分類已審核')).toBeInTheDocument()
    expect(screen.getByText('已上線學習模組')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: '開始學習' })).toHaveLength(
      imItLearningCatalog.lessons.length
    )
  })
})
