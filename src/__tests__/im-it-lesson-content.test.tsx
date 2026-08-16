import { render, screen } from '@testing-library/react'
import { ImItLessonContent } from '@/components/exam/im-it-lesson-content'
import { getImItCardsForLesson, getImItLesson, getImItSources } from '@/lib/im-it-learning'

describe('IM-IT lesson content', () => {
  test('renders a complete reviewed lesson and its practice route', () => {
    const lesson = getImItLesson('lesson-im-it-network-models-encapsulation')
    expect(lesson).toBeDefined()
    if (!lesson) return

    render(
      <ImItLessonContent
        lesson={lesson}
        cards={getImItCardsForLesson(lesson.id)}
        sources={getImItSources(lesson.sourceRefs)}
      />
    )

    expect(screen.getByRole('heading', { level: 1, name: lesson.title })).toBeInTheDocument()
    expect(screen.getByText('內容已複查')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '完成後你會' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '帶你解題' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '概念卡自我檢查' })).toBeInTheDocument()
    expect(screen.getAllByRole('group')).toHaveLength(6)
    expect(screen.getByRole('link', { name: '開始本課考古題練習' })).toHaveAttribute(
      'href',
      `/im/questions/${lesson.pastPaperRefs[0]}?mode=drill&next=${lesson.pastPaperRefs[1]}`
    )
    expect(screen.getByText(/不是官方答案/)).toBeInTheDocument()
  })
})
