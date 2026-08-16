import { fireEvent, render, screen } from '@testing-library/react'
import { SingleQuestionView } from '@/components/single-question-view'
import { getQuestionsByExam } from '@/lib/content'

const push = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

describe('single question drill navigation', () => {
  beforeEach(() => {
    push.mockClear()
  })

  test('keeps lesson progress and lets a read-only question advance through the queue', () => {
    const question = getQuestionsByExam('im').find(
      (candidate) => candidate.id === 'q-pp-im-it-106-5'
    )
    expect(question).toBeDefined()

    render(
      <SingleQuestionView
        exam="im"
        question={question!}
        mode="drill"
        drillSearchParams={{
          mode: 'drill',
          queue: 'q-pp-im-it-106-6',
          position: '1',
          total: '2',
          returnTo: '/im/subjects/im-it/lessons/lesson-im-it-architecture',
        }}
      />
    )

    expect(screen.getByText('本課 1/2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '← 返回課程' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: '查看可用資訊' }))
    fireEvent.click(screen.getByRole('button', { name: '下一題 →' }))

    expect(push).toHaveBeenCalledWith(
      '/im/questions/q-pp-im-it-106-6?mode=drill&position=2&total=2&returnTo=%2Fim%2Fsubjects%2Fim-it%2Flessons%2Flesson-im-it-architecture'
    )
  })
})
