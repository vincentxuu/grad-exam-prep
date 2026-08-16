import fs from 'node:fs'

const load = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const allCards = load('public/data/flashcards.json')
const cards = allCards.filter((card) => card.subjectId === 'im-english')
const master = load('public/data/ntu-im-vocab-master.json').words
const masterByWord = new Map(master.map((entry) => [entry.word.toLowerCase(), entry]))

const keep = {
  'broken down': ['phrasal verb / adjective', '拆分成；分解成；故障的', 'divided into smaller parts or no longer functioning'],
  'interested in': ['adjective phrase', '對…感興趣', 'wanting to know more about or take part in something'],
  'worn out': ['adjective phrase', '精疲力竭的；磨損不能用的', 'extremely tired, or damaged by long or heavy use'],
  'single-cell': ['adjective', '單細胞的；單一細胞層級的', 'involving, analyzing, or operating on individual cells'],
  videography: ['noun', '影片拍攝與製作；攝錄影', 'the art or process of recording and producing video'],
  quicksort: ['noun', '快速排序法', 'a divide-and-conquer sorting algorithm that partitions items around a pivot'],
  phishing: ['noun', '網路釣魚；網路詐騙', 'a fraudulent attempt to obtain sensitive information by impersonating a trusted entity'],
  bool: ['technical noun / keyword', '布林型別；bool 關鍵字', 'a Boolean data type or keyword whose values are true and false'],
  iso: ['proper noun / abbreviation', '國際標準化組織（ISO）', 'the International Organization for Standardization, which develops international standards'],
  backoff: ['technical noun', '退避機制；延遲重試', 'a strategy that delays a retry, often by progressively longer intervals, after contention or failure'],
  botnet: ['noun', '殭屍網路', 'a network of compromised devices remotely controlled by an attacker'],
  hamiltonian: ['adjective', '漢米爾頓的；具有漢米爾頓迴路的', 'describing a graph that contains a cycle visiting every vertex exactly once'],
  multivalued: ['adjective', '多值的', 'able to have multiple values, especially in an attribute or database dependency'],
  nonsingular: ['adjective', '非奇異的；可逆的', 'describing a square matrix that is invertible and has a nonzero determinant'],
  orthonormal: ['adjective', '標準正交的；正交歸一的', 'mutually orthogonal and each having unit length'],
  pipelining: ['noun', '管線化；流水線處理', 'a technique that overlaps successive processing stages to improve throughput'],
  preprocess: ['verb', '預先處理；前處理', 'to process data or input before the main computation or analysis'],
  livelock: ['noun', '活鎖', 'a state in which processes keep responding to one another but make no useful progress'],
  subnet: ['noun', '子網路', 'a logical subdivision of an IP network'],
}

const aliases = {
  subtrees: ['subtree', '複數形，併入既有單數詞條 subtree。'],
  val: ['value', '來源是程式碼參數名稱，為 value 的縮寫，併入既有 value 詞條。'],
}

const excluded = {
  san: '來源兩次皆為 San Salvador／San Francisco 地名片段，並非 storage area network；排除抽取雜訊。',
  uber: '來源是共享經濟與第三方應用的 Uber 公司品牌，不是一般詞彙；原「乳房」義完全不符脈絡。',
  von: '只出現在 Von Neumann architecture 人名片段中，應學完整術語而非獨立的 von；原義也不應把片段等同整個架構。',
}

const targets = cards.filter((card) =>
  card.answer.includes('【意思】')
  && card.answer.includes('【音標】')
  && !card.answer.includes('【詞性】')
  && !card.answer.includes('【英文解釋】')
  && !card.answer.includes('【例句】')
)

const entries = targets.map((card) => {
  const word = card.headword
  const masterEntry = masterByWord.get(word.toLowerCase())
  if (!masterEntry) throw new Error(`Missing master entry: ${word}`)
  const common = {
    word,
    tier: masterEntry.tier,
    source: masterEntry.source,
    previousMeaning: card.answer.match(/【意思】([^\n]*)/u)?.[1] ?? '',
    phonetic: card.answer.match(/【音標】\/([^\n]*)\//u)?.[1] ?? '',
    contextEvidence: masterEntry.englishExam?.contexts?.[0]
      ?? masterEntry.domain?.context
      ?? null,
  }

  if (keep[word]) {
    const [pos, traditionalChinese, definition] = keep[word]
    return {
      ...common,
      decision: 'keep',
      pos,
      traditionalChinese,
      definition,
      correctsPreviousMeaning: traditionalChinese !== common.previousMeaning,
    }
  }
  if (aliases[word]) {
    const [canonicalWord, reason] = aliases[word]
    return { ...common, decision: 'alias', canonicalWord, reason }
  }
  if (excluded[word]) return { ...common, decision: 'exclude', reason: excluded[word] }
  throw new Error(`Unclassified target: ${word}`)
})

const counts = entries.reduce((result, entry) => {
  result[entry.decision] = (result[entry.decision] ?? 0) + 1
  return result
}, {})

const output = {
  metadata: {
    generatedAt: '2026-08-16',
    runtimeImEnglishCards: cards.length,
    selectionRule: 'answer has meaning and phonetic, but lacks POS, English definition, and example',
    total: entries.length,
    counts,
    schemaVersion: 1,
  },
  entries,
}

if (targets.length !== 24) throw new Error(`Expected 24 targets, found ${targets.length}`)
if (entries.length !== 24) throw new Error(`Expected 24 curated entries, found ${entries.length}`)
if (new Set(entries.map((entry) => entry.word)).size !== 24) throw new Error('Duplicate words in curation output')
for (const entry of entries) {
  if (!['keep', 'alias', 'exclude'].includes(entry.decision)) throw new Error(`Invalid decision: ${entry.word}`)
  if (!entry.previousMeaning || !entry.phonetic) throw new Error(`Missing source fields: ${entry.word}`)
  if (entry.decision === 'keep' && (!entry.pos || !entry.traditionalChinese || !entry.definition)) {
    throw new Error(`Incomplete keep override: ${entry.word}`)
  }
  if (entry.decision === 'alias') {
    if (!entry.canonicalWord) throw new Error(`Missing canonical word: ${entry.word}`)
    if (!masterByWord.has(entry.canonicalWord.toLowerCase())) {
      throw new Error(`Alias target absent from master: ${entry.word} -> ${entry.canonicalWord}`)
    }
  }
  if (entry.decision !== 'keep' && !entry.reason) throw new Error(`Missing reason: ${entry.word}`)
}

fs.writeFileSync('.work/phonetic-only-vocab-curation.json', `${JSON.stringify(output, null, 2)}\n`)
console.log(JSON.stringify(output.metadata, null, 2))
