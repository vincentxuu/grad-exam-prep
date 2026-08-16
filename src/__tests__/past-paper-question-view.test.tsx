import { render, screen } from '@testing-library/react'
import { SingleQuestionView } from '@/components/question/drill-page'
import { getQuestionsByExam } from '@/lib/content'

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: () => ({ push: jest.fn() }),
}))

describe('past paper question view', () => {
  test('shows both the stem and options for a single-line inline question', () => {
    const question = getQuestionsByExam('im').find(
      (candidate) => candidate.id === 'q-pp-im-it-112-27'
    )
    expect(question).toBeDefined()

    render(<SingleQuestionView exam="im" question={question!} mode="drill" />)

    expect(screen.getByText(/Recall that a min heap/i)).toBeInTheDocument()
    expect(screen.getByText(/inserting a key into a min heap/i)).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(5)
  })
})
