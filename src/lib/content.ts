import type {
  Exam,
  ExamId,
  Flashcard,
  Guide,
  PastPaper,
  Question,
  Resource,
  StudyPlan,
  Subject,
} from '@/types/content'
import examsRaw from '../../public/data/exams.json'
import flashcardsRaw from '../../public/data/flashcards.json'
import guidesRaw from '../../public/data/guides.json'
import pastPapersRaw from '../../public/data/past-papers.json'
import questionsRaw from '../../public/data/questions.json'
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
export const guides = guidesRaw as unknown as Guide[]

export function getGuidesByExam(examId: ExamId): Guide[] {
  return guides.filter((g) => g.examRelevance.includes(examId))
}

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

/** 同一個考試的所有計畫，預設計畫排在最前面。 */
export function getStudyPlans(examId: ExamId): StudyPlan[] {
  return studyPlans
    .filter((p) => p.examId === examId)
    .sort((a, b) => Number(!!b.isDefault) - Number(!!a.isDefault))
}

/**
 * 指定 planId 就取那一套；沒指定（或指定的不存在）就退回該考試的預設計畫，
 * 讓舊連結與沒帶參數的呼叫端維持原本行為。
 */
export function getStudyPlan(examId: ExamId, planId?: string): StudyPlan | undefined {
  const plans = getStudyPlans(examId)
  if (planId) {
    const match = plans.find((p) => p.id === planId)
    if (match) return match
  }
  return plans[0]
}

export function getFlashcardsBySubject(subjectId: string): Flashcard[] {
  return flashcards.filter((f) => f.subjectId === subjectId)
}

/**
 * 從資源標題抓出民國年（100–119）。抓不到的多半是書目、官方入口或工具，
 * 這些沒有年度屬性，回傳 null 由呼叫端歸類為「不分年」。
 */
export function resourceYear(title: string): string | null {
  return title.match(/1[01]\d(?!\d)/)?.[0] ?? null
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

export function getQuestionGroup(
  question: Question,
  allQuestions: Question[]
): QuestionGroup | null {
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
