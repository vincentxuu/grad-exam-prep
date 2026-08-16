import glossaryRaw from '../../public/data/im-beginner-glossary.json'
import type { LearningBeginnerGlossaryTerm } from './learning'

const terms = glossaryRaw.terms as LearningBeginnerGlossaryTerm[]

export function getBeginnerGlossaryForSubject(subjectId: string) {
  return terms.filter((term) => term.subjectId === subjectId)
}
