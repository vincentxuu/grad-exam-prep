import {
  getImItCardsForLesson,
  getImItLesson,
  getImItLessons,
  getImItSources,
  imItLearningCatalog,
} from '@/lib/im-it-learning'
import { imEnglishLearningCatalog } from '@/lib/im-english-learning'
import { imMisLearningCatalog } from '@/lib/im-mis-learning'
import { imStatLearningCatalog } from '@/lib/im-stat-learning'
import { getLearningCatalog, getLearningCatalogs } from '@/lib/learning-catalog'

describe('learning catalog', () => {
  test('resolves a subject catalog without changing the IM-IT public API', () => {
    const catalog = getLearningCatalog('im', 'im-it')

    expect(catalog).toBe(imItLearningCatalog)
    expect(catalog?.lessons).toBe(getImItLessons())

    const lesson = getImItLesson('lesson-im-it-network-models-encapsulation')
    expect(lesson).toBeDefined()
    if (!lesson || !catalog) return

    expect(catalog.getLesson(lesson.id)).toBe(lesson)
    expect(catalog.getCardsForLesson(lesson.id)).toEqual(getImItCardsForLesson(lesson.id))
    expect(catalog.getSources(lesson.sourceRefs)).toEqual(getImItSources(lesson.sourceRefs))
  })

  test('keeps catalog lookup scoped by both exam and subject', () => {
    expect(getLearningCatalog('im', 'missing-subject')).toBeUndefined()
    expect(getLearningCatalog('cs', 'im-it')).toBeUndefined()
    expect(getLearningCatalogs()).toEqual([
      imItLearningCatalog,
      imMisLearningCatalog,
      imStatLearningCatalog,
      imEnglishLearningCatalog,
    ])
  })

  test.each([
    ['im-mis', imMisLearningCatalog],
    ['im-stat', imStatLearningCatalog],
  ] as const)('registers the %s catalog and its reviewed lessons', (subjectId, catalog) => {
    expect(getLearningCatalog('im', subjectId)).toBe(catalog)
    expect(catalog.lessons.length).toBeGreaterThan(0)
    expect(catalog.lessons.every((lesson) => lesson.reviewStatus === 'reviewed')).toBe(true)
  })

  test('builds subject-relative lesson and practice routes', () => {
    const lesson = getImItLesson('lesson-im-it-network-models-encapsulation')
    expect(lesson).toBeDefined()
    if (!lesson) return

    expect(imItLearningCatalog.lessonBaseHref).toBe('/im/subjects/im-it/lessons')
    const practiceUrl = new URL(imItLearningCatalog.getPracticeHref(lesson), 'http://localhost')
    expect(practiceUrl.pathname).toBe(`/im/questions/${lesson.pastPaperRefs[0]}`)
    expect(practiceUrl.searchParams.get('queue')?.split(',')).toEqual(lesson.pastPaperRefs.slice(1))
    expect(practiceUrl.searchParams.get('total')).toBe(String(lesson.pastPaperRefs.length))
    expect(practiceUrl.searchParams.get('returnTo')).toBe(`/im/subjects/im-it/lessons/${lesson.id}`)
  })

  test('routes a foundation-only lesson to the subject question browser', () => {
    const lesson = getImItLesson('lesson-im-it-network-models-encapsulation')
    expect(lesson).toBeDefined()
    if (!lesson) return

    expect(imItLearningCatalog.getPracticeHref({ ...lesson, pastPaperRefs: [] })).toBe(
      '/im/questions?subject=im-it'
    )
  })
})
