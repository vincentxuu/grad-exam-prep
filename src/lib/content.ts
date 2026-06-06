import type { Exam, ExamId, Flashcard, PastPaper, Question, Resource, StudyPlan, Subject } from '@/types/content'
import examsRaw from '../../public/data/exams.json'
import questionsRaw from '../../public/data/questions.json'
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
export const questions = (questionsRaw as { questions: unknown[] }).questions as Question[]

export function getQuestionsByExam(examId: ExamId): Question[] {
  return questions.filter((q) => q.examId === examId)
}

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

const PASSAGE_RANGE_RE = /[Qq]uestions?\s+(\d+)\s*[-–—]+\s*(\d+)/

export function findPassageParent(question: Question, allQuestions: Question[]): Question | null {
  for (const q of allQuestions) {
    if (q.id === question.id || q.paperId !== question.paperId) continue
    const m = q.text.match(PASSAGE_RANGE_RE)
    if (m) {
      const start = parseInt(m[1])
      const end = parseInt(m[2])
      if (question.number >= start && question.number <= end) {
        return q
      }
    }
  }
  return null
}

export interface QuestionGroup {
  parentQuestion: Question
  questions: Question[]
}

export function getQuestionGroup(question: Question, allQuestions: Question[]): QuestionGroup | null {
  let parentQuestion: Question

  const parent = findPassageParent(question, allQuestions)
  if (parent) {
    parentQuestion = parent
  } else {
    const m = question.text.match(PASSAGE_RANGE_RE)
    if (!m) return null
    parentQuestion = question
  }

  const m = parentQuestion.text.match(PASSAGE_RANGE_RE)!
  const start = parseInt(m[1])
  const end = parseInt(m[2])

  const groupQuestions = allQuestions
    .filter((q) => q.paperId === question.paperId && q.number >= start && q.number <= end)
    .sort((a, b) => a.number - b.number)

  return { parentQuestion, questions: groupQuestions }
}

export function getPaperUrl(paperId: string): string | undefined {
  const paper = (pastPapers as unknown as PastPaper[]).find((p) => p.id === paperId)
  return paper?.url
}

export const EXAM_LABELS: Record<ExamId, string> = {
  im: '台大資管所',
  cs: '台大資工所',
}
