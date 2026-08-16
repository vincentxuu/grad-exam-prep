import {
  getImItCardsForLesson,
  getImItLesson,
  getImItLessons,
  getImItSources,
  imItLearningCatalog,
} from '@/lib/im-it-learning'
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
    expect(getLearningCatalogs()).toEqual([imItLearningCatalog])
  })

  test('builds subject-relative lesson and practice routes', () => {
    const lesson = getImItLesson('lesson-im-it-network-models-encapsulation')
    expect(lesson).toBeDefined()
    if (!lesson) return

    expect(imItLearningCatalog.lessonBaseHref).toBe('/im/subjects/im-it/lessons')
    expect(imItLearningCatalog.getPracticeHref(lesson)).toBe(
      `/im/questions/${lesson.pastPaperRefs[0]}?mode=drill&next=${lesson.pastPaperRefs[1]}`
    )
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
