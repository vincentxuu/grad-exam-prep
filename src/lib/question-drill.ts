const QUESTION_ID_RE = /^[a-zA-Z0-9_-]+$/

export interface DrillSearchParams {
  mode?: string | string[]
  next?: string | string[]
  position?: string | string[]
  queue?: string | string[]
  returnTo?: string | string[]
  total?: string | string[]
}

export interface DrillNavigation {
  completionHref: string
  currentPosition?: number
  nextHref?: string
  totalQuestions?: number
}

function singleValue(value?: string | string[]): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function validQuestionIds(value?: string | string[]): string[] {
  const normalized = singleValue(value)
  if (!normalized) return []
  return normalized.split(',').filter((id) => QUESTION_ID_RE.test(id))
}

function safeReturnPath(examId: string, value?: string | string[]): string | undefined {
  const normalized = singleValue(value)
  if (
    !normalized ||
    normalized.includes('\\') ||
    normalized.includes('://') ||
    normalized.includes('..')
  ) {
    return undefined
  }
  return normalized.startsWith(`/${examId}/subjects/`) ? normalized : undefined
}

export function hasQuestionDrillSequence(examId: string, searchParams: DrillSearchParams): boolean {
  return Boolean(
    singleValue(searchParams.queue) ||
      singleValue(searchParams.total) ||
      safeReturnPath(examId, searchParams.returnTo)
  )
}

export function buildQuestionDrillHref(
  examId: string,
  questionIds: readonly string[],
  returnTo?: string
): string {
  const validQuestions = questionIds.filter((id) => QUESTION_ID_RE.test(id))
  const [firstQuestion, ...remainingQuestions] = validQuestions
  if (!firstQuestion) return `/${examId}/questions`

  const params = new URLSearchParams({ mode: 'drill' })
  if (remainingQuestions.length > 0) {
    params.set('queue', remainingQuestions.join(','))
    params.set('position', '1')
    params.set('total', String(validQuestions.length))
  }
  const validReturnTo = safeReturnPath(examId, returnTo)
  if (validReturnTo) params.set('returnTo', validReturnTo)

  return `/${examId}/questions/${firstQuestion}?${params.toString()}`
}

export function getDrillNavigation(
  examId: string,
  searchParams: DrillSearchParams,
  consumedQuestionIds: readonly string[] = []
): DrillNavigation {
  const completionHref = safeReturnPath(examId, searchParams.returnTo) ?? `/${examId}/questions`
  const consumed = new Set(consumedQuestionIds)
  const originalQueue = validQuestionIds(searchParams.queue)
  const skippedQuestionCount = originalQueue.filter((id) => consumed.has(id)).length
  const queue = originalQueue.filter((id) => !consumed.has(id))
  const currentPosition = Number.parseInt(singleValue(searchParams.position) ?? '', 10)
  const totalQuestions = Number.parseInt(singleValue(searchParams.total) ?? '', 10)
  const mode = singleValue(searchParams.mode) ?? 'drill'
  const hasValidProgress =
    Number.isInteger(currentPosition) &&
    currentPosition > 0 &&
    Number.isInteger(totalQuestions) &&
    totalQuestions >= currentPosition

  if (queue.length > 0) {
    const [nextQuestion, ...remainingQuestions] = queue
    const params = new URLSearchParams({ mode })
    if (remainingQuestions.length > 0) params.set('queue', remainingQuestions.join(','))
    if (hasValidProgress) {
      params.set('position', String(currentPosition + skippedQuestionCount + 1))
      params.set('total', String(totalQuestions))
    }
    const returnTo = safeReturnPath(examId, searchParams.returnTo)
    if (returnTo) params.set('returnTo', returnTo)

    return {
      completionHref,
      currentPosition: hasValidProgress ? currentPosition : undefined,
      nextHref: `/${examId}/questions/${nextQuestion}?${params.toString()}`,
      totalQuestions: hasValidProgress ? totalQuestions : undefined,
    }
  }

  const [legacyNext] = validQuestionIds(searchParams.next)
  return {
    completionHref,
    currentPosition: hasValidProgress ? currentPosition : undefined,
    nextHref: legacyNext
      ? `/${examId}/questions/${legacyNext}?mode=${encodeURIComponent(mode)}`
      : undefined,
    totalQuestions: hasValidProgress ? totalQuestions : undefined,
  }
}
