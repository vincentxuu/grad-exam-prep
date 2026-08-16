import fs from 'node:fs'

const load = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const cards = load('public/data/flashcards.json').filter((card) => card.subjectId === 'im-english')
const master = load('public/data/ntu-im-vocab-master.json').words
const questions = load('public/data/questions.json').questions
const masterByWord = new Map(master.map((entry) => [entry.word.toLowerCase(), entry]))

const keep = {
  'large enough': ['adjective phrase', '足夠大的', 'sufficiently large for a particular purpose'],
  'no means': ['noun phrase', '沒有方法；毫無辦法', 'no available way or method of doing something'],
  'phased out': ['phrasal verb', '逐步淘汰；逐漸停止使用', 'gradually discontinued or removed from use'],
  'showing gratitude': ['verb phrase', '表達感謝；表示感激', 'expressing thanks or appreciation'],
  'social outcast': ['noun phrase', '被社會排斥的人；社會邊緣人', 'a person rejected or excluded by a social group'],
  'still others': ['pronoun phrase', '還有其他人／事物', 'additional people or things beyond those already mentioned'],
  'the others': ['pronoun phrase', '其餘的人／事物', 'the remaining people or things in a known group'],
  'to which': ['relative phrase', '對其；向其；與其（介系詞加關係代名詞）', 'a preposition plus relative pronoun linking a clause to an earlier noun'],
  'turned down': ['phrasal verb', '拒絕；調低（turn down 的過去式／分詞）', 'rejected an offer or request, or reduced a level'],
  'what if': ['conjunction phrase', '如果…會怎樣；假如', 'used to ask about a possible situation or consequence'],
  'would have': ['modal auxiliary phrase', '本來會；原本可能已經', 'used to describe an unreal or conditional result in the past'],
  'back-of-the-napkin': ['adjective', '粗略估算的；非正式快速推算的', 'rough and informal, based on a quick calculation'],
  'cross-disciplinary': ['adjective', '跨領域的；跨學科的', 'involving knowledge or methods from multiple disciplines'],
  epigenetics: ['noun', '表觀遺傳學', 'the study of heritable changes in gene activity that do not alter the DNA sequence'],
  'industry-level': ['adjective', '產業層級的；整體產業的', 'relating to an entire industry rather than one organization'],
  'real-world': ['adjective', '真實世界的；實務情境的', 'existing or occurring in actual practice rather than only in theory'],
  int: ['technical noun / keyword', '整數型別；C／C++ 的 int 關鍵字', 'an integer data type and its keyword in languages such as C and C++'],
  sql: ['noun / acronym', 'SQL；結構化查詢語言', 'Structured Query Language, used to define, query, and manage relational data'],
  sqrt: ['technical noun / function', '平方根；平方根函式', 'a square-root operation or function in mathematical and programming notation'],
  iot: ['noun / acronym', '物聯網（Internet of Things）', 'a network of physical devices that collect and exchange data'],
  pseudocode: ['noun', '虛擬碼；偽程式碼', 'an informal, language-independent description of an algorithm'],
  recursively: ['adverb', '遞迴地', 'by repeatedly applying a procedure to smaller instances of the same problem'],
  subtree: ['noun', '子樹', 'a tree formed by a node and some or all of its descendants'],
  adt: ['noun / acronym', '抽象資料型別（Abstract Data Type）', 'a data type defined by its operations and behavior rather than its implementation'],
  udp: ['noun / acronym', '使用者資料包協定（UDP）', 'a connectionless transport protocol that sends datagrams without delivery guarantees'],
  alu: ['noun / acronym', '算術邏輯單元（ALU）', 'the processor component that performs arithmetic and logical operations'],
  bfs: ['noun / acronym', '廣度優先搜尋（BFS）', 'a graph or tree traversal that explores nodes level by level'],
  dns: ['noun / acronym', '網域名稱系統（DNS）', 'the distributed system that maps domain names to IP addresses and other records'],
  osi: ['noun / acronym', '開放系統互連模型（OSI 模型）', 'a seven-layer reference model for network communication'],
  associativity: ['noun', '快取相聯度', 'the number of cache lines available in each cache set'],
  avl: ['noun / acronym', 'AVL 樹；自平衡二元搜尋樹', 'a self-balancing binary search tree whose subtree heights differ by at most one'],
  bmp: ['noun / acronym', 'BMP 點陣圖影像格式', 'a raster image file format commonly identified by the .bmp extension'],
  dfs: ['noun / acronym', '深度優先搜尋（DFS）', 'a graph or tree traversal that explores one branch before backtracking'],
  isa: ['noun / acronym', '指令集架構（ISA）', 'the programmer-visible interface between software and a processor'],
  jpeg: ['noun / acronym', 'JPEG 影像壓縮／檔案格式', 'a widely used lossy compression standard and format for digital images'],
  lru: ['noun / adjective / acronym', '最近最少使用（LRU）替換策略', 'a replacement policy that evicts the item used least recently'],
  multithreading: ['noun', '多執行緒處理', 'the concurrent execution of multiple threads within a process'],
  nfc: ['noun / acronym', '近場通訊（NFC）', 'a short-range wireless technology for communication between nearby devices'],
  printf: ['technical noun / function', 'printf 格式化輸出函式', 'a C standard-library function that writes formatted output'],
  rfid: ['noun / acronym', '無線射頻識別（RFID）', 'a technology that identifies and tracks tagged objects using radio waves'],
  superscalar: ['adjective', '超純量的', 'able to issue or execute multiple instructions in one clock cycle'],
  tlb: ['noun / acronym', '轉譯後備緩衝區（TLB）', 'a cache that stores recent virtual-to-physical address translations'],
  txt: ['noun / file extension', 'TXT 純文字檔格式', 'a filename extension commonly used for plain-text files'],
  virtualization: ['noun', '虛擬化', 'the creation of virtual versions of computing resources such as machines or storage'],
  benchmarking: ['noun', '基準測試；效能評測', 'the process of measuring and comparing system performance against a standard workload'],
  bst: ['noun / acronym', '二元搜尋樹（BST）', 'a binary tree whose keys are ordered to support efficient search and updates'],
  cnn: ['noun / acronym', '卷積神經網路（CNN）', 'a neural network that uses convolutional layers, especially for grid-like data such as images'],
  convolutional: ['adjective', '卷積的', 'relating to the convolution operation used in signal processing and neural networks'],
  datagram: ['noun', '資料報；資料包', 'a self-contained packet sent independently through a packet-switched network'],
  dma: ['noun / acronym', '直接記憶體存取（DMA）', 'a mechanism that transfers data between devices and memory with little CPU involvement'],
  dmca: ['proper noun / acronym', '美國《數位千禧年著作權法》（DMCA）', 'the United States Digital Millennium Copyright Act governing digital copyright issues'],
  gpu: ['noun / acronym', '圖形處理器（GPU）', 'a processor optimized for highly parallel computation and graphics workloads'],
  hypervisor: ['noun', '虛擬機器監視器；虛擬化管理程式', 'software or firmware that creates and manages virtual machines'],
  inorder: ['adjective / adverb', '中序的；以中序方式', 'visiting a binary-tree node between its left and right subtrees'],
  ldap: ['noun / acronym', '輕量型目錄存取協定（LDAP）', 'a protocol for accessing and maintaining distributed directory services'],
  postorder: ['adjective / adverb', '後序的；以後序方式', 'visiting a binary-tree node after its child subtrees'],
  rlogin: ['technical noun / command', 'rlogin 遠端登入協定／指令', 'a legacy Unix command and protocol for remote login'],
  rsa: ['noun / acronym', 'RSA 非對稱式加密演算法', 'a public-key cryptosystem based on the difficulty of factoring large integers'],
  schedulable: ['adjective', '可排程的', 'able to meet the timing or resource constraints of a scheduling system'],
  serializability: ['noun', '可序列化性', 'the property that concurrent transactions have an outcome equivalent to some serial order'],
  smtp: ['noun / acronym', '簡易郵件傳輸協定（SMTP）', 'the application-layer protocol used to send and relay email'],
  ssl: ['noun / acronym', '安全通訊端層（SSL）', 'a legacy cryptographic protocol for securing network communication, superseded by TLS'],
  stdio: ['technical noun / header', '標準輸入輸出；C 的 stdio 標頭', 'the C standard input/output library, commonly included through stdio.h'],
  telnet: ['technical noun / protocol', 'Telnet 遠端終端協定', 'a legacy unencrypted protocol for remote terminal access'],
  typedef: ['technical noun / keyword', '型別定義；C／C++ 的 typedef 關鍵字', 'a C and C++ keyword that creates an alias for an existing type'],
  vpn: ['noun / acronym', '虛擬私人網路（VPN）', 'an encrypted logical network connection built over another network'],
  api: ['noun / acronym', '應用程式介面（API）', 'a defined interface through which software components communicate'],
  dhcp: ['noun / acronym', '動態主機設定協定（DHCP）', 'a network protocol that automatically assigns IP configuration to clients'],
  erp: ['noun / acronym', '企業資源規劃（ERP）系統', 'integrated software for managing an organization’s core business processes'],
  maintainability: ['noun', '可維護性', 'the ease with which a system can be corrected, modified, or supported'],
}

const aliases = {
  'being stuck': ['stuck', '動名詞片語，併入既有 stuck 詞條。'],
  'deliberately disregards': ['disregard', '副詞加第三人稱動詞的組合，併入 disregard。'],
  'not mean': ['mean', '否定助動結構，併入 mean。'],
  'openly challenges': ['challenge', '副詞加第三人稱動詞的組合，併入 challenge。'],
  'selectively integrates': ['integrate', '副詞加第三人稱動詞的組合，併入 integrate。'],
  'superficially summarizes': ['summarize', '副詞加第三人稱動詞的組合，併入 summarize。'],
  'which affect': ['affect', '關係子句片段，併入核心動詞 affect。'],
  det: ['determinant', '矩陣行列式函數記號，併入 determinant。'],
  knuth: ['kmp', '人名只在 Knuth–Morris–Pratt 演算法中出現，併入既有 KMP 詞條。'],
  prob: ['probability', '表格與統計輸出的縮寫，併入 probability。'],
}

const excluded = {
  'despite that': '來源題目的錯誤連接詞選項，不是獨立詞彙 headword。',
  'do i': '倒裝題中的錯誤選項；正確形式為 did I。',
  'enough large': '錯誤字序選項；正確形式為 large enough。',
  'even play': '來源題目的錯誤選項，不是固定片語。',
  'have stuck': '來源題目的錯誤時態選項，不是獨立 headword。',
  'interesting to': '來源題目的錯誤搭配選項，且是可組合片段而非獨立詞條。',
  'largely enough': '來源題目的錯誤詞性與字序選項。',
  'not means': '來源題目的錯誤文法選項。',
  'regard of': '錯誤介系詞搭配；應使用 regarding、regardless 或 with regard to。',
  'that i': '倒裝題的錯誤選項與代名詞片段，不是獨立詞條。',
  'filet-o-fish': 'McDonald’s 產品專名，不是一般考試詞彙。',
  "mcdonald's": '品牌名所有格，不是一般詞彙。',
  multi: '斷詞後留下的生產性字首 multi-，不是獨立 headword。',
  lgn: '複雜度記號 lg n 被壓平後的抽取雜訊，不是詞彙。',
  com: '從 .com 網域名稱抽出的字尾，不是此處的詞彙。',
  alex: '題目中的人名，ECDICT 義與來源無關。',
  esa: 'European Space Agency 的機構專名縮寫，不是一般資管詞彙。',
  ntu: 'National Taiwan University 的校名縮寫，不是一般詞彙。',
  revis: 'Matt Revis 的姓氏，ECDICT 義與來源無關。',
  str: '程式碼中的區域變數名稱，不是獨立詞彙。',
  sys: '從標頭路徑與函式名稱抽出的程式片段，不是獨立詞彙。',
}

const incomplete = cards.filter((card) =>
  !card.answer.includes('【詞性】')
  && !card.answer.includes('【英文解釋】')
  && !card.answer.includes('【音標】')
  && !card.answer.includes('【例句】')
)

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const evidenceFor = (word, entry) => {
  const pattern = new RegExp(`(?<![A-Za-z])${escapeRe(word).replaceAll('-', '[- ]')}(?![A-Za-z])`, 'iu')
  const questionRefs = questions.filter((question) => pattern.test(question.text)).slice(0, 5).map((question) => question.id)
  const contexts = entry.englishExam?.contexts ?? (entry.domain?.context ? [entry.domain.context] : [])
  return {
    questionRefs,
    contextEvidence: contexts[0]?.replace(/\s+/gu, ' ').slice(0, 300) ?? null,
  }
}

const entries = incomplete.map((card) => {
  const word = card.headword
  const masterEntry = masterByWord.get(word.toLowerCase())
  const common = {
    word,
    tier: masterEntry.tier,
    source: masterEntry.source,
    previousMeaning: card.answer.match(/【意思】([^\n]*)/u)?.[1] ?? '',
    ...evidenceFor(word, masterEntry),
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
  throw new Error(`Unclassified incomplete word: ${word}`)
})

const counts = Object.fromEntries([...Map.groupBy(entries, (entry) => entry.decision)].map(([decision, values]) => [decision, values.length]))
const output = {
  metadata: {
    generatedAt: '2026-08-16',
    runtimeImEnglishCards: cards.length,
    selectionRule: 'answer lacks all four markers: POS, English definition, phonetic, and example',
    total: entries.length,
    counts,
    schemaVersion: 1,
  },
  entries,
}

if (cards.length !== 4764) throw new Error(`Expected 4764 IM-English cards, found ${cards.length}`)
if (entries.length !== 101) throw new Error(`Expected 101 incomplete cards, found ${entries.length}`)
if (new Set(entries.map((entry) => entry.word)).size !== 101) throw new Error('Duplicate words in curation output')
for (const entry of entries) {
  if (!['keep', 'alias', 'exclude'].includes(entry.decision)) throw new Error(`Invalid decision for ${entry.word}`)
  if (entry.decision === 'keep' && (!entry.pos || !entry.traditionalChinese || !entry.definition)) throw new Error(`Incomplete keep override for ${entry.word}`)
  if (entry.decision === 'alias') {
    if (!entry.canonicalWord) throw new Error(`Missing canonical word for ${entry.word}`)
    if (!masterByWord.has(entry.canonicalWord.toLowerCase())) throw new Error(`Alias target is not in master: ${entry.word} -> ${entry.canonicalWord}`)
  }
}

fs.writeFileSync('.work/incomplete-vocab-curation.json', `${JSON.stringify(output, null, 2)}\n`)
console.log(JSON.stringify(output.metadata, null, 2))
