import type { ExamId, Subject } from '@/types/content'
import subjectsCsRaw from '../../public/data/subjects-cs.json'
import subjectsImRaw from '../../public/data/subjects-im.json'

const subjects = [...subjectsImRaw, ...subjectsCsRaw] as unknown as Subject[]

export const FLASHCARD_EXAM_LABELS: Record<ExamId, string> = {
  im: '台大資管所',
  cs: '台大資工所',
}

export function getFlashcardSubjects(examId: ExamId): Subject[] {
  return subjects.filter((subject) => subject.examId === examId)
}
