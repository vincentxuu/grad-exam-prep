const DEFAULT_MAX_REPEATED_CLOZE_STEM = 5

const PLACEHOLDER_EXAMPLE_RE =
  /(?:^|\n)【例句】\s*This is an example of [^\n]+ in (?:an )?academic context\.(?=\n|$)/i

function normalizePromptStem(prompt) {
  return String(prompt ?? '')
    .normalize('NFKC')
    .split(/\n\s*\n/, 1)[0]
    .replace(/\s+/g, ' ')
    .trim()
}

function isEnglishClozeStem(stem) {
  return /_{3,}/.test(stem) && /[A-Za-z]/.test(stem) && !/[^\x00-\x7F]/.test(stem)
}

function groupRepeatedEnglishClozeStems(flashcards, maxCount = DEFAULT_MAX_REPEATED_CLOZE_STEM) {
  const groups = new Map()

  for (const card of flashcards) {
    if (!card.subjectId?.endsWith('-english')) continue
    const stem = normalizePromptStem(card.prompt)
    if (!isEnglishClozeStem(stem)) continue

    const key = `${card.subjectId}\u0000${stem}`
    const cards = groups.get(key) ?? []
    cards.push(card)
    groups.set(key, cards)
  }

  return [...groups.values()]
    .filter((cards) => cards.length > maxCount)
    .map((cards) => ({
      subjectId: cards[0].subjectId,
      stem: normalizePromptStem(cards[0].prompt),
      cards,
    }))
    .sort((a, b) => b.cards.length - a.cards.length)
}

function findPlaceholderExampleCards(flashcards) {
  return flashcards.filter((card) => PLACEHOLDER_EXAMPLE_RE.test(String(card.answer ?? '')))
}

function findLowQualityFlashcardIds(flashcards, maxCount = DEFAULT_MAX_REPEATED_CLOZE_STEM) {
  const ids = new Set(findPlaceholderExampleCards(flashcards).map((card) => card.id))

  for (const group of groupRepeatedEnglishClozeStems(flashcards, maxCount)) {
    for (const card of group.cards) ids.add(card.id)
  }

  return ids
}

module.exports = {
  DEFAULT_MAX_REPEATED_CLOZE_STEM,
  findLowQualityFlashcardIds,
  findPlaceholderExampleCards,
  groupRepeatedEnglishClozeStems,
  isEnglishClozeStem,
  normalizePromptStem,
}
