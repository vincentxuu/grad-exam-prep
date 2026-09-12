import type { QuestionMetadataEntry } from '../types/content'

interface RawQuestionMetadata {
  questions: QuestionMetadataEntry[]
  totalQuestions?: number
}

/**
 * Merge questions from an external source file into the topic-count map.
 * External questions carry an explicit `source` field; NTU IM questions don't.
 */
export function mergeExternalQuestions(
  topicCounts: Record<string, number>,
  ...externalFiles: RawQuestionMetadata[]
): QuestionMetadataEntry[] {
  const merged: QuestionMetadataEntry[] = []
  for (const file of externalFiles) {
    for (const q of file.questions) {
      topicCounts[q.topicId] = (topicCounts[q.topicId] ?? 0) + 1
      merged.push(q)
    }
  }
  return merged
}
