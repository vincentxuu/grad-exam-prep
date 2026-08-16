const REQUIRED_IM_VOCAB_TIERS = new Set(['must_know', 'important', 'worth_studying', 'domain'])

function slugifyVocabulary(word) {
  return word
    .toLowerCase()
    .replace(/['‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isRequiredVocabulary(entry) {
  return REQUIRED_IM_VOCAB_TIERS.has(entry.tier)
}

function inferPartsOfSpeech(entry, lexicon, override = {}) {
  if (override.pos?.trim()) return [override.pos.trim()]
  if (entry.pos?.trim())
    return entry.pos
      .split(/[\/,;]+/)
      .map((pos) => pos.trim())
      .filter(Boolean)

  const text = `${lexicon.definition ?? ''}\n${lexicon.translation ?? ''}`
  const aliases = {
    a: 'adjective',
    adj: 'adjective',
    ad: 'adverb',
    adv: 'adverb',
    conj: 'conjunction',
    int: 'interjection',
    n: 'noun',
    num: 'numeral',
    prep: 'preposition',
    pron: 'pronoun',
    v: 'verb',
    vi: 'intransitive verb',
    vt: 'transitive verb',
  }
  const found = new Set()
  for (const match of text.matchAll(
    /(?:^|\n)(adj|adv|prep|pron|conj|num|int|vi|vt|ad|a|n|v)\./gi
  )) {
    found.add(aliases[match[1].toLowerCase()])
  }
  return [...found]
}

function cleanField(value) {
  return String(value ?? '')
    .replace(/\r/g, '')
    .trim()
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function sentenceCandidates(questions) {
  const candidates = []
  for (const question of questions) {
    const chunks = String(question.text ?? '')
      .replace(/\r/g, '')
      .split(/\n+|(?<=[.!?])\s+(?=[A-Z"“])/)
      .map((chunk) => chunk.replace(/^(?:Q?\d+[.:)]\s*|Passage\s+[A-ZIVX]+:\s*)/i, '').trim())

    for (const text of chunks) {
      if (text.length < 30 || text.length > 260) continue
      if (/_{3,}|\([A-Ea-e]\)|\bBlank\s+\d+\b/.test(text)) continue
      if (!/[.!?]$/.test(text)) continue
      candidates.push({
        text,
        paperId: question.paperId,
        year: question.year,
        number: question.number,
      })
    }
  }
  return candidates
}

function findAuthenticExample(word, candidates) {
  const pattern = new RegExp(`(^|[^A-Za-z])${escapeRegExp(word)}(?=$|[^A-Za-z])`, 'i')
  const candidate =
    candidates
      .filter(({ text }) => pattern.test(text))
      .sort((a, b) => {
        const aDistance = Math.abs(a.text.length - 110)
        const bDistance = Math.abs(b.text.length - 110)
        return aDistance - bDistance || a.year - b.year || a.number - b.number
      })[0] ?? null
  return candidate ? { ...candidate, en: candidate.text } : null
}

function chooseMeaning(entry, lexicon, override = {}) {
  return cleanField(override.chinese || entry.chinese || lexicon.translation)
}

function buildVocabularyAnswer({ entry, lexicon, override = {}, example = null }) {
  const parts = []
  const meaning = chooseMeaning(entry, lexicon, override)
  const partsOfSpeech = inferPartsOfSpeech(entry, lexicon, override)
  const definition = cleanField(override.definition || lexicon.definition)
  const phonetic = cleanField(override.phonetic || lexicon.phonetic)

  parts.push(`【意思】${meaning}`)
  if (partsOfSpeech.length > 0) parts.push(`【詞性】${partsOfSpeech.join('、')}`)
  if (phonetic) parts.push(`【音標】/${phonetic}/`)
  if (definition) parts.push(`【英文解釋】${definition}`)
  if (example?.en) {
    parts.push(`【例句】${example.en}`)
    if (example.zh) parts.push(`（${example.zh}）`)
  }

  const sourceDetails = [entry.tier, entry.source, ...(entry.englishExam?.years ?? [])]
    .filter(Boolean)
    .join(' · ')
  parts.push(`【來源】台大資管所必要字庫 · ${sourceDetails}`)
  return parts.join('\n')
}

function createDirectVocabularyCard({ entry, lexicon, override, example }) {
  const slug = slugifyVocabulary(entry.word)
  if (!slug) throw new Error(`Cannot create a stable id for vocabulary: ${entry.word}`)

  const headword = override?.headword?.trim() || entry.word
  const card = {
    id: `fc-im-vocab-${slug}`,
    examId: 'im',
    subjectId: 'im-english',
    topicId: 'im-en-vocab',
    kind: 'vocabulary',
    headword,
    tier: entry.tier,
    prompt: headword,
    answer: buildVocabularyAnswer({ entry, lexicon, override, example }),
  }
  if (example?.paperId) card.pastPaperRef = `${example.paperId} Q${example.number}`
  return card
}

module.exports = {
  REQUIRED_IM_VOCAB_TIERS,
  buildVocabularyAnswer,
  chooseMeaning,
  createDirectVocabularyCard,
  findAuthenticExample,
  inferPartsOfSpeech,
  isRequiredVocabulary,
  sentenceCandidates,
  slugifyVocabulary,
}
