import { parseQuestion } from '@/lib/question-parser'
import questionsRaw from '../../public/data/questions.json'

describe('question parser', () => {
  test('keeps the stem before inline options on the same line', () => {
    const parsed = parseQuestion('What is the runtime? (A) O(1) (B) O(n) (C) O(n²)')

    expect(parsed.stem).toBe('What is the runtime?')
    expect(parsed.options).toEqual([
      { label: 'a', text: 'O(1)' },
      { label: 'b', text: 'O(n)' },
      { label: 'c', text: 'O(n²)' },
    ])
  })

  test('keeps previous lines and the same-line suffix before inline options', () => {
    const parsed = parseQuestion(
      'Read the following context.\nUse the tightest bound.\nWhich answer is correct? (A) One (B) Two'
    )

    expect(parsed.stem).toBe(
      'Read the following context.\nUse the tightest bound.\nWhich answer is correct?'
    )
    expect(parsed.options).toHaveLength(2)
  })

  test('preserves line-separated option parsing', () => {
    const parsed = parseQuestion('Choose one.\n(A) Alpha\n(B) Beta\n(C) Gamma')

    expect(parsed.stem).toBe('Choose one.')
    expect(parsed.options).toEqual([
      { label: 'a', text: 'Alpha' },
      { label: 'b', text: 'Beta' },
      { label: 'c', text: 'Gamma' },
    ])
  })

  test('renders the complete IM-IT 112 question 27 stem', () => {
    const question = questionsRaw.questions.find(
      (candidate) => candidate.id === 'q-pp-im-it-112-27'
    )

    expect(question).toBeDefined()
    const parsed = parseQuestion(question?.text ?? '')
    expect(parsed.stem).toMatch(/min heap/i)
    expect(parsed.stem).toMatch(/inserting a key/i)
    expect(parsed.options?.map((option) => option.label)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})
