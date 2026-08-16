import { buildQuestionDrillHref, getDrillNavigation } from '@/lib/question-drill'

describe('question drill navigation', () => {
  test('builds a complete lesson sequence instead of only one next question', () => {
    expect(
      buildQuestionDrillHref(
        'im',
        ['question-1', 'question-2', 'question-3'],
        '/im/subjects/im-it/lessons/lesson-1'
      )
    ).toBe(
      '/im/questions/question-1?mode=drill&queue=question-2%2Cquestion-3&position=1&total=3&returnTo=%2Fim%2Fsubjects%2Fim-it%2Flessons%2Flesson-1'
    )
  })

  test('advances through the queue and keeps lesson progress', () => {
    expect(
      getDrillNavigation('im', {
        mode: 'drill',
        queue: 'question-2,question-3',
        position: '1',
        total: '3',
        returnTo: '/im/subjects/im-it/lessons/lesson-1',
      })
    ).toEqual({
      completionHref: '/im/subjects/im-it/lessons/lesson-1',
      currentPosition: 1,
      nextHref:
        '/im/questions/question-2?mode=drill&queue=question-3&position=2&total=3&returnTo=%2Fim%2Fsubjects%2Fim-it%2Flessons%2Flesson-1',
      totalQuestions: 3,
    })
  })

  test('returns to the lesson after the last question', () => {
    expect(
      getDrillNavigation('im', {
        position: '3',
        total: '3',
        returnTo: '/im/subjects/im-it/lessons/lesson-1',
      })
    ).toEqual({
      completionHref: '/im/subjects/im-it/lessons/lesson-1',
      currentPosition: 3,
      nextHref: undefined,
      totalQuestions: 3,
    })
  })

  test('keeps legacy next links working and rejects external return paths', () => {
    expect(
      getDrillNavigation('im', {
        mode: 'review',
        next: 'question-2',
        returnTo: 'https://example.com',
      })
    ).toEqual({
      completionHref: '/im/questions',
      currentPosition: undefined,
      nextHref: '/im/questions/question-2?mode=review',
      totalQuestions: undefined,
    })
  })

  test('walks every question in order and finishes at the lesson', () => {
    const questionIds = ['question-1', 'question-2', 'question-3', 'question-4']
    const returnTo = '/im/subjects/im-it/lessons/lesson-1'
    const visited: string[] = []
    let href: string | undefined = buildQuestionDrillHref('im', questionIds, returnTo)

    while (href) {
      const url = new URL(href, 'http://localhost')
      visited.push(url.pathname.split('/').at(-1) ?? '')
      const navigation = getDrillNavigation('im', Object.fromEntries(url.searchParams))
      if (!navigation.nextHref) {
        expect(navigation.completionHref).toBe(returnTo)
      }
      href = navigation.nextHref
    }

    expect(visited).toEqual(questionIds)
  })

  test('skips questions already rendered inside the current passage group', () => {
    const navigation = getDrillNavigation(
      'im',
      {
        queue: 'question-2,question-3,question-4',
        position: '1',
        total: '4',
      },
      ['question-1', 'question-2', 'question-3']
    )

    expect(navigation.nextHref).toBe('/im/questions/question-4?mode=drill&position=4&total=4')
  })

  test('does not crash when a query parameter is repeated', () => {
    expect(
      getDrillNavigation('im', {
        mode: ['drill', 'review'],
        queue: ['question-2', 'question-3'],
        returnTo: ['/im/subjects/im-it/lessons/lesson-1'],
      })
    ).toEqual({
      completionHref: '/im/questions',
      currentPosition: undefined,
      nextHref: undefined,
      totalQuestions: undefined,
    })
  })
})
