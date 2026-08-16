import fs from 'node:fs'

const load = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const master = load('public/data/ntu-im-vocab-master.json').words
const lexicon = load('public/data/im-vocab-lexicon.json').entries
const firstPass = load('.work/unmatched-vocab-classification.json').entries
const firstPassByWord = new Map(firstPass.map((entry) => [entry.word, entry]))
const masterByWord = new Map(master.map((entry) => [entry.word.toLowerCase(), entry]))
const unmatched = lexicon.filter((entry) => {
  const masterEntry = masterByWord.get(entry.word.toLowerCase())
  return !entry.definition && !entry.translation && !masterEntry?.chinese?.trim()
})

const keep = {
  unboxer: ['noun', '開箱者；製作開箱內容的創作者', '真實衍生名詞，來源文章多次使用。'],
  'season-long': ['adjective', '貫穿整季的；持續整季的', '常見且語意固定的複合形容詞。'],
  'waste-to-energy': ['noun/adjective', '廢棄物轉能源；廢棄物能源化的', '環境工程與基礎建設的固定術語。'],
  'ball-and-stick': ['adjective', '使用球與棒的；球棒模型的', '來源中的運動類型複合形容詞，也用於科學模型。'],
  cinematographe: ['noun', '電影機；早期兼具攝影與放映功能的電影裝置', '來源指盧米埃兄弟的 Cinématographe；是可定義的歷史技術名詞。'],
  'non-medical': ['adjective', '非醫療的；非醫療用途的', '來源標題的核心對比詞，語意可直接判定。'],
  'plastic-wrapped': ['adjective', '以塑膠包裝的', '來源選擇題的正確複合形容詞，與錯誤倒裝選項可明確區分。'],
  'rational-choice': ['noun/adjective', '理性選擇；理性選擇理論的', '固定學術概念；名詞通常寫 rational choice，置前修飾時可加連字號。'],
  'results-driven': ['adjective', '結果導向的；以成果為驅動的', '來源選擇題的正確複合形容詞。'],
  'self-certification': ['noun', '自我認證；自行聲明符合規範', '政策與法遵固定術語。'],
  'video-editing': ['noun/adjective', '影片剪輯；影片編輯的', '常見數位媒體技能名詞；一般名詞用 video editing。'],
  blockchain: ['noun', '區塊鏈', '資訊管理與計算領域核心術語。'],
  bitcoin: ['noun', '比特幣', '已詞彙化的加密貨幣名稱。'],
  datapath: ['noun', '資料路徑', '計算機結構標準術語。'],
  nosql: ['noun/adjective', 'NoSQL；非關聯式資料庫類型', '資料庫標準分類術語。'],
  cryptocurrency: ['noun', '加密貨幣', '資訊管理與金融科技標準術語。'],
  etag: ['noun', 'HTTP 實體標籤；快取驗證標籤', 'HTTP 快取驗證標準術語。'],
  heapify: ['verb/noun', '堆積化；調整成堆積', '演算法標準操作名稱。'],
  kmp: ['noun/adjective', 'KMP（Knuth–Morris–Pratt）字串比對演算法', '字串比對標準演算法縮寫。'],
  metaverse: ['noun', '元宇宙', '資訊科技常用概念。'],
  mlperf: ['noun', 'MLPerf 機器學習效能基準測試套件', '產業標準基準測試名稱，來源題目直接要求理解。'],
  rsh: ['noun', 'rsh 遠端殼層協定／指令', 'Unix 遠端殼層的真實協定與指令。'],
  sjf: ['noun/adjective', 'SJF 最短工作優先排程（Shortest Job First）', '作業系統標準排程演算法縮寫。'],
}

const keepCanonicalOverrides = {
  cinematographe: 'Cinematographe',
  'plastic-wrapped': 'plastic-wrapped',
  mlperf: 'MLPerf',
}

const aliasOverrides = {
  'badly-managed': ['badly managed', '去除非必要連字號；這是 manage 的過去分詞片語。'],
  'plastic-wrapping': ['plastic wrapping', '來源文章另有真實名詞片語 plastic wrapping；連字號形式來自錯誤選項。'],
  'sword-and-sandals': ['sword-and-sandal', '電影類型的標準單數複合形式。'],
  dijkstra: ["Dijkstra's algorithm", '姓氏只應作為演算法名稱的一部分。'],
  warshall: ['Floyd–Warshall algorithm', '姓氏只應作為演算法名稱的一部分。'],
}

const forceExclude = new Set([
  "shakespeare's", "boe's", "japan's", "sturgeon's", "australia's",
  "facebook's", "nintendo's", "priestley's", "snapchat's", 'photo-secessionists',
])

const excludeReasonOverrides = {
  "shakespeare's": '專有姓名所有格，不是單字卡 headword。',
  "boe's": '人名所有格，不是單字卡 headword。',
  "japan's": '國名所有格，不是單字卡 headword。',
  "sturgeon's": '人名所有格；若需教學應另建 Sturgeon’s Law 概念卡。',
  "australia's": '國名所有格，不是單字卡 headword。',
  "facebook's": '品牌名所有格，不是一般詞彙。',
  "nintendo's": '品牌名所有格，不是一般詞彙。',
  "priestley's": '人名所有格，不是單字卡 headword。',
  "snapchat's": '品牌名所有格，不是一般詞彙。',
  'photo-secessionists': '特定藝術運動成員的專名複數，不是一般詞彙。',
  dgx: 'NVIDIA 產品家族專名；來源理解不需要獨立一般詞彙卡。',
  rdap: '來源把 RDAP 展開為虛構錯誤選項 Root Directory Access Protocol；不可改教另一個真實 RDAP 意義。',
}

const contextEvidence = (entry) => {
  const contexts = entry?.englishExam?.contexts ?? (entry?.domain?.context ? [entry.domain.context] : [])
  return contexts[0]?.replace(/\s+/gu, ' ').slice(0, 280) ?? null
}

const entries = unmatched.map(({ word }) => {
  const masterEntry = masterByWord.get(word.toLowerCase())
  const prior = firstPassByWord.get(word)
  const common = {
    word,
    tier: masterEntry.tier,
    source: masterEntry.source,
    questionRefs: prior?.questionRefs ?? [],
    contextEvidence: contextEvidence(masterEntry),
  }

  if (keep[word]) {
    const [pos, traditionalChinese, reason] = keep[word]
    return { ...common, decision: 'keep-needs-override', canonicalWord: keepCanonicalOverrides[word] ?? prior?.canonicalWord ?? word, pos, traditionalChinese, reason }
  }

  if (aliasOverrides[word]) {
    const [canonicalWord, reason] = aliasOverrides[word]
    return { ...common, decision: 'alias-to-canonical', canonicalWord, reason }
  }

  if (forceExclude.has(word)) {
    return { ...common, decision: 'exclude-not-vocab', canonicalWord: null, reason: excludeReasonOverrides[word] }
  }

  if (prior?.decision === 'alias') {
    return { ...common, decision: 'alias-to-canonical', canonicalWord: prior.canonicalWord, reason: prior.reason }
  }

  return {
    ...common,
    decision: 'exclude-not-vocab',
    canonicalWord: null,
    reason: excludeReasonOverrides[word] ?? prior?.reason ?? '來源抽取雜訊、專名、程式識別字或錯誤選項，不應成為獨立詞彙卡。',
  }
})

const counts = Object.fromEntries([...Map.groupBy(entries, (entry) => entry.decision)].map(([decision, values]) => [decision, values.length]))
const output = {
  metadata: {
    generatedAt: '2026-08-16',
    scope: '118 core target-tier entries with neither master Chinese nor ECDICT definition/translation',
    sourceFiles: ['public/data/ntu-im-vocab-master.json', 'public/data/im-vocab-lexicon.json', 'public/data/questions.json'],
    total: entries.length,
    counts,
    policy: 'Keep only independently useful lexical or technical concepts; alias true inflections/orthographic variants; exclude proper names, malformed tokens, identifiers, transparent one-off compounds, and invented distractors.',
  },
  entries,
}

if (entries.length !== 118) throw new Error(`Expected 118 entries, found ${entries.length}`)
if (new Set(entries.map((entry) => entry.word)).size !== 118) throw new Error('Duplicate words in output')
for (const entry of entries) {
  if (!['exclude-not-vocab', 'alias-to-canonical', 'keep-needs-override'].includes(entry.decision)) throw new Error(`Invalid decision for ${entry.word}`)
  if (entry.decision === 'keep-needs-override' && (!entry.pos || !entry.traditionalChinese)) throw new Error(`Incomplete override for ${entry.word}`)
  if (entry.decision === 'alias-to-canonical' && !entry.canonicalWord) throw new Error(`Missing canonical alias for ${entry.word}`)
}

fs.writeFileSync('.work/unmatched-vocab-second-opinion.json', `${JSON.stringify(output, null, 2)}\n`)
console.log(JSON.stringify(output.metadata, null, 2))
