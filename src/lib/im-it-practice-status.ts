import practiceStatusRaw from '../../public/data/im-it-practice-status.json'

export type ImItPracticeStatus = {
  status: 'confirmed' | 'corrected' | 'disputed' | 'self_review_only'
  autoGradeEligible: boolean
  note: string
}

const statuses = practiceStatusRaw.questions as Record<string, ImItPracticeStatus>

export function getImItPracticeStatus(questionId: string): ImItPracticeStatus | undefined {
  return statuses[questionId]
}
