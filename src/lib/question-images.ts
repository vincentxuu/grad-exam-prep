import questionImagesRaw from '../../public/data/question-images.json'

const data = questionImagesRaw as Record<string, string[]>

export function getQuestionImages(questionId: string): string[] {
  return data[questionId] ?? []
}
