import { imItLearningCatalog } from '@/lib/im-it-learning'
import { imMisLearningCatalog } from '@/lib/im-mis-learning'
import { imStatLearningCatalog } from '@/lib/im-stat-learning'
import glossaryRaw from '../../public/data/im-beginner-glossary.json'

describe('IM beginner glossary', () => {
  const catalogs = [imItLearningCatalog, imMisLearningCatalog, imStatLearningCatalog]

  test('covers every published lesson without forming another jargon wall', () => {
    for (const catalog of catalogs) {
      for (const lesson of catalog.lessons) {
        const terms = catalog.getBeginnerGlossaryForLesson(lesson.id)
        expect(terms.length).toBeGreaterThanOrEqual(3)
        expect(terms.length).toBeLessThanOrEqual(6)
        expect(terms.every((term) => term.subjectId === catalog.subjectId)).toBe(true)
      }
    }
  })

  test('keeps every reviewed term self-contained for a first-time learner', () => {
    expect(glossaryRaw.totalTerms).toBe(glossaryRaw.terms.length)
    expect(glossaryRaw.contentStatus).toBe('reviewed')

    for (const term of glossaryRaw.terms) {
      expect(term.label.trim()).toBeTruthy()
      expect(term.plainDefinition.length).toBeGreaterThanOrEqual(8)
      expect(term.everydayExample.length).toBeGreaterThanOrEqual(8)
      expect(term.confusionNote.length).toBeGreaterThanOrEqual(8)
      expect(term.lessonIds.length).toBeGreaterThan(0)
      expect(term.reviewStatus).toBe('reviewed')
    }
  })

  test('explains representative English abbreviations and statistical symbols', () => {
    const allAliases = new Set(glossaryRaw.terms.flatMap((term) => term.aliases))
    for (const alias of ['process', 'IT-business alignment', 'E(X)', 'σ²', 'iid']) {
      expect(allAliases.has(alias)).toBe(true)
    }
  })
})
