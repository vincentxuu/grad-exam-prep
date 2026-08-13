export interface Token {
  text: string
  start: number
  end: number
  isWord: boolean
}

/** 英文字：字母開頭，中間可含撇號或連字號（don't、state-of-the-art）。 */
const WORD_RE = /[A-Za-z]+(?:['’-][A-Za-z]+)*/g

/**
 * 切出可點的英文字，並保留原始 offset。
 *
 * 非英文字的部分（空白、標點、中文）原樣保留成 isWord: false 的 token，
 * 所以把所有 token 的 text 接回去會等於原文 —— 版面不會因為切詞而跑掉。
 *
 * 刻意保持簡單：真正的斷詞交給查詢當下的 lemma 還原，這裡只負責切出
 * 可以點的東西。
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  let last = 0

  for (const m of text.matchAll(WORD_RE)) {
    const start = m.index
    if (start > last) {
      tokens.push({ text: text.slice(last, start), start: last, end: start, isWord: false })
    }
    const end = start + m[0].length
    tokens.push({ text: m[0], start, end, isWord: true })
    last = end
  }

  if (last < text.length) {
    tokens.push({ text: text.slice(last), start: last, end: text.length, isWord: false })
  }

  return tokens
}

const SENTENCE_END = new Set(['.', '!', '?'])

/**
 * 取出包含 [start, end) 這個範圍的整句話。
 *
 * 存進 SavedWord.source.sentence 的就是這一句 —— 使用者真的讀過的句子，
 * 比生成例句更能勾起記憶。
 *
 * 已知限制：遇到 "Dr. Smith" 這種縮寫會提早斷句。為此引進斷句函式庫
 * 不划算，最壞情況只是存到半句話。
 */
export function sentenceAt(text: string, start: number, end: number): string {
  let from = 0
  for (let i = start - 1; i > 0; i--) {
    const c = text[i]
    if (c === '\n') {
      from = i + 1
      break
    }
    if (SENTENCE_END.has(c) && /\s/.test(text[i + 1] ?? ' ')) {
      from = i + 1
      break
    }
  }

  let to = text.length
  for (let i = Math.max(end, start); i < text.length; i++) {
    const c = text[i]
    if (c === '\n') {
      to = i
      break
    }
    if (SENTENCE_END.has(c) && /\s|^$/.test(text[i + 1] ?? '')) {
      to = i + 1
      break
    }
  }

  return text.slice(from, to).trim()
}
