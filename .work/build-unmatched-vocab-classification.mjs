import fs from 'node:fs'

const master = JSON.parse(fs.readFileSync('public/data/ntu-im-vocab-master.json', 'utf8')).words
const lexicon = JSON.parse(fs.readFileSync('public/data/im-vocab-lexicon.json', 'utf8')).entries
const questions = JSON.parse(fs.readFileSync('public/data/questions.json', 'utf8')).questions
const masterByWord = new Map(master.map((entry) => [entry.word.toLowerCase(), entry]))
const unmatched = lexicon.filter((entry) => !entry.definition && !entry.translation && !masterByWord.get(entry.word.toLowerCase())?.chinese?.trim())

const enrich = {
  unboxer: ['unboxer', 'noun', '開箱者；製作開箱內容的創作者', 'A genuine derived occupation noun used repeatedly in an IM-English passage.'],
  'season-long': ['season-long', 'adjective', '貫穿整季的；整季持續的', 'A conventional and useful compound adjective.'],
  'waste-to-energy': ['waste-to-energy', 'noun/adjective', '廢棄物轉能源；廢棄物能源化的', 'An established environmental and infrastructure term.'],
  'ball-and-stick': ['ball-and-stick', 'adjective', '球棒與球類型的；球棒—球模型的', 'An established compound used for games and scientific models.'],
  'non-medical': ['non-medical', 'adjective', '非醫療的；非醫療用途的', 'A productive but independently useful adjective central to the source passage.'],
  'rational-choice': ['rational choice', 'noun/adjective', '理性選擇；理性選擇理論的', 'An established academic concept; normalize display punctuation.'],
  'results-driven': ['results-driven', 'adjective', '結果導向的；以成果為驅動的', 'An established business adjective and the grammatical answer among malformed distractors.'],
  'self-certification': ['self-certification', 'noun', '自我認證；自行聲明符合規範', 'An established policy and compliance term.'],
  'video-editing': ['video editing', 'noun/adjective', '影片剪輯；影片編輯的', 'A common digital-media skill term; normalize the unnecessary hyphen.'],
  blockchain: ['blockchain', 'noun', '區塊鏈', 'A core information-management and computing term.'],
  bitcoin: ['Bitcoin', 'noun', '比特幣', 'A core cryptocurrency term despite originating as a product/network name.'],
  datapath: ['datapath', 'noun', '資料路徑', 'A standard computer-architecture term.'],
  nosql: ['NoSQL', 'noun/adjective', 'NoSQL；非關聯式資料庫類型', 'A standard database category.'],
  cryptocurrency: ['cryptocurrency', 'noun', '加密貨幣', 'A standard information-management and finance term.'],
  etag: ['ETag', 'noun', 'HTTP 實體標籤；快取驗證標籤', 'A standard HTTP caching term.'],
  heapify: ['heapify', 'verb/noun', '堆積化；調整成堆積', 'A standard algorithm operation.'],
  kmp: ['KMP', 'noun/adjective', 'Knuth–Morris–Pratt 字串比對演算法', 'A standard algorithm acronym.'],
  metaverse: ['metaverse', 'noun', '元宇宙', 'A current information-technology concept.'],
  rsh: ['rsh', 'noun', '遠端殼層（remote shell）協定／指令', 'A real Unix remote-shell protocol and command.'],
  sjf: ['SJF', 'noun/adjective', '最短工作優先排程（Shortest Job First）', 'A standard operating-systems scheduling acronym.'],
}

const aliases = {
  "women's": ['woman', 'Plural possessive form; do not create a separate headword.'],
  "author's": ['author', 'Possessive form; do not create a separate headword.'],
  "shakespeare's": ['Shakespeare', 'Possessive proper-name form; alias for lookup but exclude the canonical proper name from vocabulary cards.'],
  "fox's": ['fox', 'Possessive form; do not create a separate headword.'],
  "boe's": ['Boe', 'Possessive proper-name form; alias for lookup but exclude the canonical proper name from vocabulary cards.'],
  "year's": ['year', 'Possessive form; do not create a separate headword.'],
  "japan's": ['Japan', 'Possessive proper-name form; alias for lookup but exclude the canonical proper name from vocabulary cards.'],
  "sturgeon's": ['Sturgeon', 'Possessive proper-name form from Sturgeon’s Law; alias for lookup but exclude the canonical proper name from vocabulary cards.'],
  "telescope's": ['telescope', 'Possessive form; do not create a separate headword.'],
  unboxers: ['unboxer', 'Regular plural of the retained headword unboxer.'],
  "universe's": ['universe', 'Possessive form; do not create a separate headword.'],
  "children's": ['child', 'Irregular plural possessive form; do not create a separate headword.'],
  "nature's": ['nature', 'Possessive form; do not create a separate headword.'],
  "world's": ['world', 'Possessive form; do not create a separate headword.'],
  "australia's": ['Australia', 'Possessive proper-name form; alias for lookup but exclude the canonical proper name from vocabulary cards.'],
  'badly-managed': ['manage', 'Inflected participle inside a compositional modifier; review the lemma manage instead.'],
  "government's": ['government', 'Possessive form; do not create a separate headword.'],
  "humanity's": ['humanity', 'Possessive form; do not create a separate headword.'],
  "novelist's": ['novelist', 'Possessive form; do not create a separate headword.'],
  "administration's": ['administration', 'Possessive form; do not create a separate headword.'],
  "alliance's": ['alliance', 'Possessive form; do not create a separate headword.'],
  "character's": ['character', 'Possessive form; do not create a separate headword.'],
  "facebook's": ['Facebook', 'Possessive brand-name form; alias for lookup but exclude the canonical brand from vocabulary cards.'],
  "governor's": ['governor', 'Possessive form; do not create a separate headword.'],
  "industry's": ['industry', 'Possessive form; do not create a separate headword.'],
  "influencer's": ['influencer', 'Possessive form; do not create a separate headword.'],
  'lower-pitched': ['low-pitched', 'Comparative inflection of the canonical compound adjective low-pitched.'],
  'mobile-devices': ['mobile device', 'Plural plus nonstandard hyphenation; normalize to the singular phrase.'],
  "movement's": ['movement', 'Possessive form; do not create a separate headword.'],
  "nintendo's": ['Nintendo', 'Possessive brand-name form; alias for lookup but exclude the canonical brand from vocabulary cards.'],
  "organization's": ['organization', 'Possessive form; do not create a separate headword.'],
  "philosopher's": ['philosopher', 'Possessive form; do not create a separate headword.'],
  'photo-secessionists': ['Photo-Secessionist', 'Regular plural; the canonical form is a member of a named art movement.'],
  'plastic-wrapped': ['wrap', 'Past participle used compositionally in “plastic-wrapped produce”; review wrap rather than a separate headword.'],
  "priestley's": ['Priestley', 'Possessive proper-name form; alias for lookup but exclude the canonical proper name from vocabulary cards.'],
  "reporter's": ['reporter', 'Possessive form; do not create a separate headword.'],
  shortsleeved: ['short-sleeved', 'Orthographic variant missing the standard hyphen.'],
  "snapchat's": ['Snapchat', 'Possessive brand-name form; alias for lookup but exclude the canonical brand from vocabulary cards.'],
  'trust-worthy': ['trustworthy', 'Nonstandard split spelling of trustworthy.'],
  subspaces: ['subspace', 'Regular plural of the mathematical term subspace.'],
}

const excluded = {
  'photo-secession': 'Named art movement (Photo-Secession), not general vocabulary.',
  tarjei: 'Given name in Tarjei Boe.',
  komiyama: 'Surname in Yasuko Komiyama.',
  'obi-wan': 'Fictional character name.',
  ozempic: 'Prescription-drug brand name.',
  rosenbloom: 'Surname in Stephanie Rosenbloom.',
  thingnes: 'Middle/family-name component in Johannes Thingnes Boe.',
  bishopdale: 'Place name in Christchurch.',
  'conventionally-grown': 'Transparent compositional modifier, not a standalone vocabulary headword.',
  'smaller-screened': 'Awkward compositional comparative modifier, not a standalone headword.',
  'video-watching-time': 'Tokenized noun phrase, not a lexical headword.',
  asfarviridae: 'Virus-family taxonomic proper name; passage-specific nomenclature, not study vocabulary.',
  cinematographe: 'Historical named apparatus/venue term in the passage, not general target vocabulary.',
  'current-generation': 'Transparent compositional modifier, not a standalone vocabulary headword.',
  'donor-related': 'Transparent compositional modifier, not a standalone vocabulary headword.',
  'estrogen-receptive': 'Transparent domain modifier, not a standalone vocabulary headword.',
  'google-owned': 'Compositional modifier containing a company proper name.',
  'grand-bornand': 'Place name (Le Grand-Bornand).',
  'life-related': 'Transparent compositional modifier, not a standalone vocabulary headword.',
  'ozempic-like': 'Compositional modifier based on a drug brand.',
  'planet-sized': 'Transparent compositional modifier, not a standalone vocabulary headword.',
  'seo-keyword': 'Tokenized technical noun phrase; SEO and keyword should be separate canonical terms.',
  'six-week-old': 'Productive age modifier, not a standalone vocabulary headword.',
  'starch-bearing': 'Transparent compositional modifier, not a standalone vocabulary headword.',
  'sword-and-sandals': 'Genre phrase tied to the passage; not a standalone lexical headword.',
  'urban-industrial': 'Transparent compositional modifier, not a standalone vocabulary headword.',
  vocalbeauty: 'Company/brand name in the question.',
  itemcount: 'Source-code identifier itemCount, not vocabulary.',
  jibo: 'Named consumer robot/product.',
  dijkstra: 'Surname/eponym in Dijkstra’s algorithm; the learnable item is the algorithm name.',
  warshall: 'Surname/eponym in Floyd–Warshall; the learnable item is the algorithm name.',
  airbnb: 'Company/brand name.',
  badchar: 'Source-code identifier badchar, not vocabulary.',
  dgx: 'NVIDIA product-family name.',
  endl: 'C++ library manipulator identifier, not English vocabulary.',
  mlperf: 'Named benchmark suite.',
  newvalue: 'Source-code identifier newValue, not vocabulary.',
  sembroski: 'Surname in Chris Sembroski.',
}

const malformed = {
  'champs-elys': ['Champs-Élysées', 'Tokenizer truncated the accented proper place name.'],
  'driven-results': ['results-driven', 'Incorrect word-order distractor from a multiple-choice item.'],
  'driving-results': ['results-driven', 'Incorrect distractor from a multiple-choice item.'],
  'ever-expending': ['ever-expanding', 'Incorrect lexical distractor; expending is not the intended word.'],
  'plastic-wrapping': ['plastic-wrapped', 'Incorrect distractor for “plastic-wrapped fresh produce.”'],
  'results-driving': ['results-driven', 'Incorrect distractor from a multiple-choice item.'],
  'wrapped-plastic': ['plastic-wrapped', 'Incorrect word-order distractor in the source question.'],
  'wrapping-plastic': ['plastic-wrapped', 'Incorrect word-order/form distractor in the source question.'],
  "strikes-you're-out": ['three strikes, you are out', 'Tokenizer fused a clause into a pseudo-headword.'],
  'th-century': ['12th-century', 'Tokenizer dropped the numeric prefix from the source phrase.'],
  nlgn: ['n log n', 'Complexity notation was flattened into a pseudo-word.'],
  didn: ["didn't", 'Tokenizer split a contraction at the apostrophe and lost the suffix.'],
  doesn: ["doesn't", 'Tokenizer split a contraction at the apostrophe and lost the suffix.'],
  logn: ['log n', 'Mathematical notation was flattened into a pseudo-word.'],
  couldn: ["couldn't", 'Tokenizer split a contraction at the apostrophe and lost the suffix.'],
  fdap: [null, 'Invented wrong-answer expansion “Free Directory Access Protocol,” not a real protocol.'],
  hadn: ["hadn't", 'Tokenizer split a contraction at the apostrophe and lost the suffix.'],
  idap: [null, 'Invented wrong-answer expansion “Internet Directory Access Protocol,” not a real protocol.'],
  rdap: [null, 'In this question it expands to the invented distractor “Root Directory Access Protocol,” not the real Registration Data Access Protocol.'],
  stdc: ['stdc++.h', 'Tokenizer extracted a fragment from the C++ header path bits/stdc++.h.'],
}

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const classifications = unmatched.map((item) => {
  const word = item.word
  const entry = masterByWord.get(word.toLowerCase())
  const re = new RegExp(`(?<![A-Za-z])${escapeRe(word).replace(/-/g, '[- ]')}(?![A-Za-z])`, 'i')
  const questionRefs = questions.filter((q) => re.test(q.text)).slice(0, 5).map((q) => q.id)
  if (enrich[word]) {
    const [canonicalWord, pos, translation, reason] = enrich[word]
    return { word, tier: entry.tier, source: entry.source, category: 'a_real_necessary_vocab', decision: 'enrich', canonicalWord, suggestedPos: pos, suggestedTranslation: translation, questionRefs, reason }
  }
  if (aliases[word]) {
    const [canonicalWord, reason] = aliases[word]
    const canonicalDisposition = /exclude the canonical|named art movement/.test(reason) ? 'exclude_proper_canonical' : 'retain_or_enrich_canonical'
    return { word, tier: entry.tier, source: entry.source, category: 'b_inflected_or_possessive_alias', decision: 'alias', canonicalWord, canonicalDisposition, questionRefs, reason }
  }
  if (excluded[word]) return { word, tier: entry.tier, source: entry.source, category: 'c_proper_noun_or_not_vocabulary', decision: 'exclude', canonicalWord: null, questionRefs, reason: excluded[word] }
  if (malformed[word]) {
    const [canonicalWord, reason] = malformed[word]
    return { word, tier: entry.tier, source: entry.source, category: 'd_malformed_extraction', decision: 'exclude', canonicalWord, questionRefs, reason }
  }
  throw new Error(`Unclassified word: ${word}`)
})

const counts = Object.fromEntries([...new Set(classifications.map((item) => item.category))].sort().map((category) => [category, classifications.filter((item) => item.category === category).length]))
const output = {
  metadata: {
    generatedAt: '2026-08-16',
    targetTiers: ['must_know', 'important', 'worth_studying', 'domain'],
    ecdictAndMasterUnmatched: classifications.length,
    counts,
    policy: 'Enrich category a. Resolve category b morphologically, retaining only non-proper canonical vocabulary. Exclude categories c and d.',
  },
  entries: classifications,
}

fs.writeFileSync('.work/unmatched-vocab-classification.json', `${JSON.stringify(output, null, 2)}\n`)
console.log(JSON.stringify(output.metadata, null, 2))
