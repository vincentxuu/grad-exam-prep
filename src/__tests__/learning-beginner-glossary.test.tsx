import { render, screen } from '@testing-library/react'
import { LearningBeginnerGlossary } from '@/components/exam/learning-beginner-glossary'
import type { LearningBeginnerGlossaryTerm } from '@/lib/learning'

const term: LearningBeginnerGlossaryTerm = {
  id: 'term-test-process',
  subjectId: 'im-it',
  label: '行程',
  aliases: ['process', '程序'],
  plainDefinition: '一個正在執行中的程式，以及它目前用到的資源。',
  everydayExample: '同一份食譜被兩間廚房同時照著做，就像同一程式開了兩個行程。',
  confusionNote: '程式是靜態指令；行程是程式真正跑起來後的狀態。',
  lessonIds: ['lesson-test'],
  reviewStatus: 'reviewed',
}

describe('LearningBeginnerGlossary', () => {
  test('shows plain language, aliases, example and a confusion boundary without interaction', () => {
    render(<LearningBeginnerGlossary terms={[term]} />)

    expect(screen.getByRole('heading', { name: '這堂先懂這些詞' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '行程' })).toBeInTheDocument()
    expect(screen.getByText(/process、程序/)).toBeInTheDocument()
    expect(screen.getByText(term.plainDefinition)).toBeVisible()
    expect(screen.getByText(term.everydayExample)).toBeVisible()
    expect(screen.getByText(term.confusionNote)).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  test('renders nothing when the lesson has no terms', () => {
    const { container } = render(<LearningBeginnerGlossary terms={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
