export type ExamId = 'im' | 'cs'

export type ImportanceRating = 1 | 2 | 3 | 4 | 5

export type ResourceType =
  | 'PTT'
  | 'HackMD'
  | 'YouTube'
  | 'Notion'
  | '補習班'
  | '書目'
  | 'Dcard'
  | '官方'

export type MaterialType = 'book' | 'notes' | 'video' | 'online' | 'cram-school'

export type PaperSource = 'ntu_library' | 'gaodian'

export interface Topic {
  id: string
  title: string
  importance: ImportanceRating
  subtopics?: string[]
}

export interface Material {
  title: string
  author?: string
  type: MaterialType
  url?: string
  note?: string
}

export interface Subject {
  id: string
  examId: ExamId
  name: string
  weight?: number
  topics: Topic[]
  materials: Material[]
}

export interface AdmissionsYear {
  year: number
  applicants: number
  acceptedMain: number
  acceptedWaitlist?: number
  admissionRate: number
  lowestScore?: number
  pending?: boolean
}

export interface Exam {
  id: ExamId
  name: string
  code: string
  format: {
    writtenWeight: number
    oralWeight?: number
    oralThreshold?: number
    note?: string
  }
  subjects: string[]
  admissions: AdmissionsYear[]
  admissionsPending?: string
  sourceNotes?: string[]
}

export interface StudyTask {
  id: string
  description: string
  subjectTag?: string
}

export interface StudyPhase {
  id: string
  name: string
  monthStart: number
  monthEnd: number
  tasks: StudyTask[]
  subjectTags: string[]
  note?: string
}

export interface StudyPlan {
  examId: ExamId
  totalMonths: number
  examWindow: string
  phases: StudyPhase[]
}

export interface Flashcard {
  id: string
  examId: ExamId
  subjectId: string
  topicId: string
  prompt: string
  answer: string
  pastPaperRef?: string
}

export interface Resource {
  id: string
  title: string
  type: ResourceType
  examRelevance: ExamId[]
  url?: string
  description?: string
  author?: string
}

export interface PastPaper {
  id: string
  examId: ExamId
  subjectId: string
  year: number
  url: string
  urlFallback?: string
  source: PaperSource
  verified: boolean
}

export interface Question {
  id: string
  paperId: string
  examId: ExamId
  subjectId: string
  year: number
  number: number
  text: string
  points: number | null
  hasImage: boolean
  subQuestions: string[]
}

export type GuideBlockType =
  | 'prose'
  | 'list'
  | 'callout'
  | 'compare'
  | 'table'
  | 'prompt'
  | 'quote'
  | 'subject'
  | 'links'

export type CalloutVariant = 'tip' | 'warn' | 'insight'

export interface GuideCompareColumn {
  title: string
  tone: 'pro' | 'con'
  items: string[]
}

export interface GuideLink {
  href: string
  label: string
  desc?: string
}

export interface GuideBlock {
  type: GuideBlockType
  title?: string
  text?: string
  items?: string[]
  variant?: CalloutVariant
  columns?: GuideCompareColumn[]
  headers?: string[]
  rows?: string[][]
  note?: string
  prompt?: string
  cite?: string
  subjectId?: string
  weightHint?: string
  links?: GuideLink[]
}

export interface GuideSection {
  id: string
  title: string
  icon?: string
  intro?: string
  blocks: GuideBlock[]
}

export interface GuideSource {
  platform: string
  url: string
  author?: string
  note?: string
}

export interface GuideTimeAllocation {
  note?: string
  items: { label: string; pct: number; hint?: string }[]
}

export interface Guide {
  id: string
  title: string
  subtitle?: string
  examRelevance: ExamId[]
  year?: number
  readingMinutes?: number
  tags: string[]
  source: GuideSource
  summary: string
  takeaways: string[]
  timeAllocation?: GuideTimeAllocation
  sections: GuideSection[]
}

export interface ContentData {
  exams: Exam[]
  subjects: Subject[]
  studyPlans: StudyPlan[]
  flashcards: Flashcard[]
  resources: Resource[]
  pastPapers: PastPaper[]
  guides: Guide[]
}
