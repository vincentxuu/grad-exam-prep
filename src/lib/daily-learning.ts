import type { DailyLearningRecord, LearningOutputKind, TaskLearningEvidence } from '@/types/storage'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function finiteNumber(value: unknown, min: number, max = Number.POSITIVE_INFINITY) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
}

const OUTPUT_KINDS = new Set<LearningOutputKind>(['whiteboard', 'code', 'explanation', 'practice'])
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function sanitizeTaskEvidence(value: unknown, taskId: string): TaskLearningEvidence | undefined {
  if (!isRecord(value)) return undefined
  if (value.taskId !== taskId || typeof value.taskDescription !== 'string') return undefined
  if (!finiteNumber(value.accuracy, 0, 100) || typeof value.evidence !== 'string') return undefined
  if (typeof value.needsRetest !== 'boolean' || !finiteNumber(value.updatedAt, 0)) return undefined
  if (
    value.needsRetest &&
    (typeof value.retestAt !== 'string' || !DATE_PATTERN.test(value.retestAt))
  ) {
    return undefined
  }

  return {
    taskId,
    taskDescription: value.taskDescription.slice(0, 500),
    ...(typeof value.completionCriteria === 'string'
      ? { completionCriteria: value.completionCriteria.slice(0, 1_000) }
      : {}),
    accuracy: value.accuracy as number,
    evidence: value.evidence.slice(0, 4_000),
    needsRetest: value.needsRetest,
    ...(value.needsRetest ? { retestAt: value.retestAt as string } : {}),
    updatedAt: value.updatedAt as number,
  }
}

export function sanitizeDailyLearningRecords(value: unknown): Record<string, DailyLearningRecord> {
  if (!isRecord(value)) return {}
  const result: Record<string, DailyLearningRecord> = {}

  for (const [key, candidate] of Object.entries(value)) {
    if (!isRecord(candidate)) continue
    if (candidate.examId !== 'im' && candidate.examId !== 'cs') continue
    if (typeof candidate.date !== 'string' || !DATE_PATTERN.test(candidate.date)) continue
    if (typeof candidate.planId !== 'string') continue
    if (key !== `${candidate.examId}:${candidate.planId}:${candidate.date}`) continue
    if (!finiteNumber(candidate.updatedAt, 0)) continue

    const taskEvidence: Record<string, TaskLearningEvidence> = {}
    if (isRecord(candidate.taskEvidence)) {
      for (const [taskId, evidence] of Object.entries(candidate.taskEvidence)) {
        const sanitized = sanitizeTaskEvidence(evidence, taskId)
        if (sanitized) taskEvidence[taskId] = sanitized
      }
    }

    const outputKind =
      typeof candidate.outputKind === 'string' &&
      OUTPUT_KINDS.has(candidate.outputKind as LearningOutputKind)
        ? (candidate.outputKind as LearningOutputKind)
        : undefined

    result[key] = {
      date: candidate.date,
      examId: candidate.examId,
      planId: candidate.planId.slice(0, 200),
      ...(finiteNumber(candidate.recallAccuracy, 0, 100)
        ? { recallAccuracy: candidate.recallAccuracy as number }
        : {}),
      ...(outputKind ? { outputKind } : {}),
      ...(typeof candidate.keyMistake === 'string'
        ? { keyMistake: candidate.keyMistake.slice(0, 4_000) }
        : {}),
      ...(typeof candidate.tomorrowQuestion === 'string'
        ? { tomorrowQuestion: candidate.tomorrowQuestion.slice(0, 4_000) }
        : {}),
      ...(finiteNumber(candidate.effectiveMinutes, 0, 1_440)
        ? { effectiveMinutes: candidate.effectiveMinutes as number }
        : {}),
      taskEvidence,
      updatedAt: candidate.updatedAt as number,
    }
  }

  return result
}

export function mergeDailyLearningRecords(
  first: Record<string, DailyLearningRecord>,
  second: Record<string, DailyLearningRecord>
): Record<string, DailyLearningRecord> {
  const merged = { ...first }
  for (const [key, incoming] of Object.entries(second)) {
    const existing = merged[key]
    if (!existing || incoming.updatedAt >= existing.updatedAt) merged[key] = incoming
  }
  return merged
}
