import type { Flashcard } from '@/types/content'

/**
 * 從閃卡題目抽出可朗讀的英文單字。
 * 支援三種常見題型寫法：
 *   1. `intercept（動詞）在資安語境中…`  → intercept
 *   2. `辨析易混淆詞組："imply" vs "infer"…` → imply vs infer
 *   3. `選出與「impede」意思最接近的詞。`  → impede
 */
export function extractWord(prompt: string): string | null {
  // 「word」 / "word" / “word” 引號包住的單字，可能有多個（如 imply vs infer）
  const quoted = [...prompt.matchAll(/[「"“]([A-Za-z][A-Za-z\s'-]*?)["」”]/g)].map((m) =>
    m[1].trim()
  )
  if (quoted.length > 0) return quoted.join(' versus ')

  // 開頭即為單字，後面接括號或中文說明
  const leading = prompt.match(/^([A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z'-]+)*?)\s*[(（一-鿿]/)
  if (leading) return leading[1].trim()

  return null
}

const EXAMPLE_MARKERS = ['【例句】', '例句：']
const STRUCTURE_MARKERS = [
  ...EXAMPLE_MARKERS,
  '【意思】',
  '中文：',
  '【近義詞】',
  '同義詞：',
  '近義詞：',
  '【反義詞】',
  '反義詞：',
]

/** 答案是否帶有可拆解的字彙結構（意思／例句／同反義詞）。 */
export function hasVocabStructure(answer: string): boolean {
  return STRUCTURE_MARKERS.some((marker) => answer.includes(marker))
}

/**
 * 是否以字彙卡的版面呈現（例句高亮 + 發音按鈕）。
 * 只要是英文科目、而且答案排得出結構就算，不再限定 vocabulary 這個 topic ——
 * technical / academic-writing 等 topic 同樣有例句要唸。
 */
export function isVocabCard(card: Pick<Flashcard, 'subjectId' | 'answer'>): boolean {
  return card.subjectId.endsWith('-english') && hasVocabStructure(card.answer)
}
