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
  | '部落格'
  | '線上課程'
  | '時事'

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
  /** 可觀察的完成證據，避免只用「看完」判定學會。 */
  completionCriteria?: string
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

/**
 * 一個考試可以有多套計畫（例如八個月標準版與六個月不補習版）。
 * `id` 必須全域唯一——任務完成狀態是以 task id 存在 localStorage，
 * 不同計畫的 task id 也因此不能重複，否則進度會互相污染。
 */
export interface StudyPlan {
  id: string
  examId: ExamId
  name: string
  summary?: string
  isDefault?: boolean
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
  /** Direct-recall vocabulary cards use the headword alone as their front. */
  kind?: 'vocabulary'
  headword?: string
  tier?: 'must_know' | 'important' | 'worth_studying' | 'domain'
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

/**
 * 題庫內容的可信度。`verified` 講的是 PDF 連結，這裡講的是解析進 `questions.json`
 * 的題目本身。
 *
 * - `incomplete`：題目在，但缺了作答必需的東西（文章沒抽進來、選項少一個）。
 * - `suspect`：內容可能根本不屬於這份卷子（與別份大量重複），未經原卷確認。
 *
 * 沒有這個欄位＝目前沒有已知問題，**不等於**已經逐題對過原卷。
 */
export type PaperContentStatus = 'incomplete' | 'suspect'

export interface PastPaper {
  id: string
  examId: ExamId
  subjectId: string
  year: number
  url: string
  urlFallback?: string
  source: PaperSource
  verified: boolean
  contentStatus?: PaperContentStatus
  /** 給使用者看的一句話：這份卷子哪裡不能信。 */
  contentIssue?: string
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

export type QuestionSourceType =
  | 'ntu-im-exam'
  | 'other-school-exam'
  | 'ntu-other-dept-exam'
  | 'textbook'

export type DifficultyComparison = 'similar' | 'harder' | 'easier'

export type AnswerAuthority = 'official-key' | 'textbook-solution' | 'model-derived'

export interface QuestionSource {
  type: QuestionSourceType
  institution: string | null
  department: string | null
  textbook: string | null
  chapter: string | null
  year: number | null
  paperId: string
  difficultyVsNtuIm: DifficultyComparison | null
  answerAuthority: AnswerAuthority
}

export interface QuestionMetadataEntry {
  questionId: string
  paperId: string
  topicId: string
  primarySubtopicId: string
  questionType: string
  scoringMode: string
  taxonomyConfidence?: string
  taxonomyRationale?: string
  answerSource: {
    kind: string
    official: boolean
    reviewCount: number
    note?: string
  }
  answerConfidence: {
    level: string
    basis: string[]
    unresolvedIssues?: string[]
  }
  publication: {
    browseEligible: boolean
    practiceEligible: boolean
    autoGradeEligible: boolean
    fullMockEligible: boolean
    blockers: string[]
  }
  source?: QuestionSource
}

export interface QuestionMetadataFile {
  schemaVersion: number
  subjectId: string
  totalQuestions: number
  questions: QuestionMetadataEntry[]
  sourceType?: QuestionSourceType
  sourceLabel?: string
}

export interface GuideSource {
  platform: string
  url: string
  author?: string
}

/**
 * A pointer to someone else's published 心得 article — never a copy of it.
 * `topics` lists what the original covers so readers can decide whether to open
 * it; the article's own arguments, methods and data stay at `source.url`.
 */
export interface Guide {
  id: string
  title: string
  subtitle?: string
  examRelevance: ExamId[]
  year?: number
  tags: string[]
  source: GuideSource
  topics: string[]
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
