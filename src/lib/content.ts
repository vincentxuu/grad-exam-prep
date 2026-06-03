import type { Exam, ExamId, Flashcard, Resource, StudyPlan, Subject } from '@/types/content'
import examsRaw from '../../public/data/exams.json'
import flashcardsRaw from '../../public/data/flashcards.json'
import pastPapersRaw from '../../public/data/past-papers.json'
import resourcesRaw from '../../public/data/resources.json'
import studyPlansRaw from '../../public/data/study-plans.json'
import subjectsCsRaw from '../../public/data/subjects-cs.json'
import subjectsImRaw from '../../public/data/subjects-im.json'

export const exams = examsRaw as unknown as Exam[]
export const subjects = [...subjectsImRaw, ...subjectsCsRaw] as unknown as Subject[]
export const studyPlans = studyPlansRaw as unknown as StudyPlan[]
export const flashcards = flashcardsRaw as unknown as Flashcard[]
export const resources = resourcesRaw as unknown as Resource[]
export const pastPapers = (pastPapersRaw as { papers: unknown[] }).papers

export function getExam(id: ExamId): Exam | undefined {
  return exams.find((e) => e.id === id)
}

export function getSubjectsByExam(examId: ExamId): Subject[] {
  return subjects.filter((s) => s.examId === examId)
}

export function getSubject(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id)
}

export function getStudyPlan(examId: ExamId): StudyPlan | undefined {
  return studyPlans.find((p) => p.examId === examId)
}

export function getFlashcardsBySubject(subjectId: string): Flashcard[] {
  return flashcards.filter((f) => f.subjectId === subjectId)
}

export function getResourcesByExam(examId: ExamId): Resource[] {
  return resources.filter((r) => r.examRelevance.includes(examId))
}

export const EXAM_LABELS: Record<ExamId, string> = {
  im: '台大資管所',
  cs: '台大資工所',
}
