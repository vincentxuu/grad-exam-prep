import { fireEvent, render, screen } from '@testing-library/react'
import { SingleQuestionView } from '@/components/question/drill-page'
import { QuestionGroupView } from '@/components/question-group-view'
import { getQuestionsByExam } from '@/lib/content'

const push = jest.fn()

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: () => ({ push }),
}))

describe('open-ended question view', () => {
  test('shows statistics essays as self review without artificial A-E buttons', () => {
    const question = getQuestionsByExam('im').find(
      (candidate) => candidate.id === 'q-pp-im-stat-115-3'
    )
    expect(question).toBeDefined()

    render(<SingleQuestionView exam="im" question={question!} mode="drill" />)

    expect(screen.getByText(/不使用 A–E 自動判分/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '查看參考解析' })).toBeEnabled()
    for (const label of ['A', 'B', 'C', 'D', 'E']) {
      expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument()
    }

    fireEvent.click(screen.getByRole('button', { name: '查看參考解析' }))
    expect(screen.getByRole('heading', { name: '逐項自評 rubric' })).toBeInTheDocument()
    expect(screen.getByText(/這不是官方配分/)).toBeInTheDocument()
  })

  test('does not invent choices when an open question is rendered inside a question group', () => {
    const question = getQuestionsByExam('im').find(
      (candidate) => candidate.id === 'q-pp-im-stat-115-3'
    )
    expect(question).toBeDefined()

    render(
      <QuestionGroupView
        exam="im"
        passage="Reference passage"
        questions={[question!]}
        parentNumber={question!.number}
        mode="drill"
      />
    )

    expect(screen.getByText(/這是申論或開放題/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '查看參考解析' })).toBeEnabled()
    for (const label of ['A', 'B', 'C', 'D', 'E']) {
      expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument()
    }

    fireEvent.click(screen.getByRole('button', { name: '查看參考解析' }))
    expect(screen.getByRole('heading', { name: '逐項自評 rubric' })).toBeInTheDocument()
  })

  test('hides unreviewed MIS legacy explanations and shows only the reviewed rubric', () => {
    const question = getQuestionsByExam('im').find(
      (candidate) => candidate.id === 'q-pp-im-mis-108-1'
    )
    expect(question).toBeDefined()

    render(<SingleQuestionView exam="im" question={question!} mode="drill" />)
    fireEvent.click(screen.getByRole('button', { name: '查看參考解析' }))

    expect(screen.getByText(/舊詳解尚未完成技術審核/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '逐項自評 rubric' })).toBeInTheDocument()
    expect(screen.queryByText(/交易成本理論.*外包/)).not.toBeInTheDocument()
  })

  test('lets a read-only question continue instead of trapping the drill queue', () => {
    const question = getQuestionsByExam('im').find(
      (candidate) => candidate.id === 'q-pp-im-it-106-12'
    )
    expect(question).toBeDefined()

    render(<SingleQuestionView exam="im" question={question!} mode="drill" />)
    fireEvent.click(screen.getByRole('button', { name: '查看可用資訊' }))

    expect(screen.getByRole('button', { name: '返回題庫' })).toBeEnabled()
  })
})
