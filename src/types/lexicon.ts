export interface LexiconSense {
  /** 詞性：verb / noun / adjective … */
  pos: string
  /** 中文釋義 */
  zh: string
  /** 英文釋義 —— 雙語對照，對應筆記痛點 3「解釋太少」 */
  en: string
  register?: 'formal' | 'informal' | 'technical' | 'academic'
}

export interface LexiconExample {
  en: string
  zh: string
  context?: 'general' | 'academic' | 'technical' | 'exam'
}

export interface LexiconConfusable {
  word: string
  zh: string
  /** 為什麼會混淆、怎麼分辨 */
  note: string
}

export interface LexiconPhrase {
  phrase: string
  zh: string
}

export interface LexiconEntry {
  /** 原形。查詢字若是屈折形（intercepted），這裡是 intercept */
  headword: string
  kind: 'word' | 'phrase'
  ipa?: string
  /** 多義項 —— 單一釋義正是筆記在抱怨的東西 */
  senses: LexiconSense[]
  collocations: string[]
  phrases: LexiconPhrase[]
  confusables: LexiconConfusable[]
  synonyms: string[]
  antonyms: string[]
  /** 至少三句，涵蓋不同語域 */
  examples: LexiconExample[]
  examNote?: string
}

/** 把詞條綁到使用者的興趣與工作情境（痛點 4） */
export interface PersonalBridge {
  headword: string
  examples: LexiconExample[]
  /** 一句話的記憶連結 */
  mnemonic: string
}

export interface PersonaProfile {
  interests: string[]
  work: string
  goal?: string
}

export interface LookupResponse {
  entry: LexiconEntry
  personal?: PersonalBridge
  cached: { entry: boolean; personal: boolean }
  quota?: { used: number; limit: number }
}
