import fs from 'node:fs'

const root = process.cwd()
const readJson = (path) => JSON.parse(fs.readFileSync(`${root}/${path}`, 'utf8'))

const subjects = readJson('public/data/subjects-im.json')
const questions = readJson('public/data/questions.json').questions.filter(
  (question) => question.subjectId === 'im-it',
)
const answers = readJson('public/data/answers.json').answers
const annotations = [
  ...readJson('.work/im-it-taxonomy-106-110.json'),
  ...readJson('.work/im-it-taxonomy-111-115.json'),
]

const subject = subjects.find((entry) => entry.id === 'im-it')
if (!subject) throw new Error('Missing im-it subject')

const definitions = {
  'im-it-arch': [
    ['number-systems', '進位與位元運算', ['binary', 'hexadecimal', 'base conversion', 'bitwise']],
    ['data-representation', '資料表示法', ["two's complement", 'overflow', 'IEEE 754', 'ASCII', 'Unicode']],
    ['boolean-logic', '布林代數', ['Boolean algebra', 'truth table', 'De Morgan', 'Karnaugh map']],
    ['digital-circuits', '數位電路', ['gate', 'adder', 'multiplexer', 'flip-flop', 'register']],
    ['cpu-organization', 'CPU 與指令架構', ['instruction cycle', 'ISA', 'ALU', 'pipeline', 'hazard']],
    ['memory-hierarchy', '記憶體與儲存階層', ['cache', 'locality', 'RAM', 'ROM', 'SSD']],
    ['io-performance', '輸入輸出與效能', ['interrupt', 'polling', 'DMA', 'latency', 'throughput']],
  ],
  'im-it-prog': [
    ['syntax-types-control', '語法、型別與控制流程', ['type', 'cast', 'operator', 'loop', 'switch']],
    ['functions-scope', '函式、作用域與遞迴', ['function', 'scope', 'lifetime', 'recursion']],
    ['pointers-memory', '指標與動態記憶體', ['pointer', 'reference', 'heap', 'stack', 'memory leak']],
    ['object-oriented', '物件導向程式設計', ['class', 'encapsulation', 'inheritance', 'polymorphism']],
    ['language-runtime', '編譯與執行環境', ['compiler', 'interpreter', 'linker', 'bytecode', 'runtime']],
    ['error-testing', '錯誤處理與測試', ['exception', 'assertion', 'unit test', 'debugging']],
    ['software-lifecycle', '軟體生命週期', ['SDLC', 'requirement', 'UML', 'Git', 'CI/CD']],
  ],
  'im-it-ds': [
    ['complexity-analysis', '複雜度分析', ['Big O', 'Theta', 'Omega', 'amortized', 'recurrence']],
    ['linear-structures', '線性資料結構', ['array', 'linked list', 'stack', 'queue', 'deque']],
    ['trees-bst', '樹與二元搜尋樹', ['tree', 'BST', 'inorder', 'AVL', 'height']],
    ['heaps-priority-queues', '堆積與優先佇列', ['heap', 'priority queue', 'heapify']],
    ['hashing', '雜湊', ['hash table', 'load factor', 'chaining', 'probing']],
    ['graphs', '圖論與圖演算法', ['graph', 'BFS', 'DFS', 'MST', 'Dijkstra']],
    ['sorting-searching', '排序與搜尋', ['quicksort', 'mergesort', 'stability', 'binary search', 'string matching']],
    ['algorithm-design', '演算法設計', ['greedy', 'divide and conquer', 'dynamic programming', 'correctness']],
  ],
  'im-it-db': [
    ['relational-model', '關聯模型', ['relation', 'tuple', 'primary key', 'foreign key', 'constraint']],
    ['er-modeling', 'ER 建模', ['entity', 'relationship', 'cardinality', 'weak entity']],
    ['sql-querying', 'SQL 查詢', ['SELECT', 'JOIN', 'GROUP BY', 'HAVING', 'subquery']],
    ['normalization', '正規化', ['functional dependency', '1NF', '2NF', '3NF', 'BCNF']],
    ['transactions', '交易與復原', ['ACID', 'serializability', 'lock', 'log', 'recovery']],
    ['storage-indexing', '資料庫儲存與索引', ['index', 'B+ tree', 'clustered', 'query plan']],
    ['distributed-nosql', '分散式資料庫與 NoSQL', ['replication', 'sharding', 'CAP', 'NoSQL', 'blockchain']],
  ],
  'im-it-network': [
    ['models-encapsulation', '網路模型與封裝', ['OSI', 'TCP/IP', 'layer', 'packet', 'frame']],
    ['link-lan', '資料鏈結層與區域網路', ['Ethernet', 'MAC', 'switch', 'VLAN', 'wireless']],
    ['ip-addressing-routing', 'IP 定址與路由', ['IPv4', 'IPv6', 'subnet', 'router', 'NAT']],
    ['transport', '傳輸層', ['TCP', 'UDP', 'port', 'congestion', 'flow control']],
    ['application-protocols', '應用層協定', ['HTTP', 'HTTPS', 'DNS', 'DHCP', 'SMTP']],
    ['distributed-cloud', '分散式與雲端服務', ['cloud', 'IaaS', 'PaaS', 'SaaS', 'CDN', 'edge']],
    ['performance-reliability', '網路效能與可靠度', ['bandwidth', 'latency', 'jitter', 'availability', 'QoS']],
  ],
  'im-it-os': [
    ['processes-threads', '行程與執行緒', ['process', 'thread', 'PCB', 'context switch', 'system call']],
    ['cpu-scheduling', 'CPU 排程', ['FCFS', 'SJF', 'priority', 'round robin']],
    ['synchronization', '同步與互斥', ['race condition', 'mutex', 'semaphore', 'critical section']],
    ['deadlocks', '死結', ['deadlock', 'Coffman', "Banker's algorithm", 'liveness']],
    ['memory-management', '記憶體管理', ['paging', 'segmentation', 'virtual memory', 'page fault']],
    ['file-storage-io', '檔案、儲存與 I/O', ['file system', 'inode', 'disk', 'buffering', 'spooling']],
    ['virtualization-containers', '虛擬化與容器', ['virtualization', 'hypervisor', 'VM', 'container', 'serverless']],
  ],
  'im-it-security': [
    ['principles-risk', '資安原則與風險', ['CIA', 'threat', 'vulnerability', 'risk', 'defense in depth']],
    ['cryptography', '密碼學', ['AES', 'RSA', 'hash', 'signature', 'PKI', 'TLS']],
    ['auth-access', '身分驗證與存取控制', ['MFA', 'password', 'RBAC', 'least privilege', 'zero trust']],
    ['network-defense', '網路防禦', ['firewall', 'IDS', 'IPS', 'VPN', 'DDoS']],
    ['application-attacks', '應用程式攻擊', ['SQL injection', 'XSS', 'CSRF', 'session hijacking']],
    ['malware-social', '惡意程式與社交工程', ['virus', 'worm', 'ransomware', 'phishing']],
    ['governance-privacy', '治理與隱私', ['ISMS', 'incident response', 'privacy', 'audit']],
  ],
  'im-it-ai': [
    ['foundations-search', 'AI 基礎與搜尋', ['agent', 'state space', 'heuristic', 'A*', 'Turing test']],
    ['ml-paradigms', '機器學習典範', ['classification', 'regression', 'clustering', 'reinforcement learning']],
    ['training-evaluation', '訓練與評估', ['overfitting', 'regularization', 'precision', 'recall']],
    ['neural-networks', '神經網路', ['perceptron', 'gradient descent', 'backpropagation']],
    ['cnn-rnn-sequence', 'CNN、RNN 與序列模型', ['CNN', 'convolution', 'RNN', 'LSTM', 'embedding']],
    ['transformers-attention', 'Transformer 與注意力', ['self-attention', 'Transformer', 'encoder', 'decoder']],
    ['generative-llm', '生成式 AI 與 LLM', ['generative AI', 'LLM', 'prompt', 'fine-tuning', 'RAG']],
    ['ethics-governance', 'AI 倫理與治理', ['bias', 'fairness', 'hallucination', 'accountability']],
  ],
}

const canonical = (topicId, raw) => {
  if (definitions[topicId]?.some(([slug]) => slug === raw)) {
    return `${topicId}-${raw}`
  }
  const maps = {
    'im-it-arch': {
      'numeric-representation': 'data-representation', 'file-formats': 'data-representation',
      'computer-boot': 'cpu-organization', 'computer-hardware': 'cpu-organization', 'cpu-architecture': 'cpu-organization',
      'cisc-risc': 'cpu-organization', 'instruction-pipeline': 'cpu-organization', 'parallel-speedup': 'cpu-organization',
      'von-neumann-architecture': 'cpu-organization', 'cache-hierarchy': 'memory-hierarchy', 'storage-systems': 'memory-hierarchy',
      'addressing-and-io': 'io-performance', interrupts: 'io-performance', 'interrupts-and-dma': 'io-performance',
      'io-devices': 'io-performance',
    },
    'im-it-prog': {
      'execution-flow': 'syntax-types-control', 'language-concepts': 'syntax-types-control', recursion: 'functions-scope',
      oop: 'object-oriented', 'oop-polymorphism': 'object-oriented', 'oop-principles': 'object-oriented',
      'oop-variables': 'object-oriented', 'compilation-toolchain': 'language-runtime', 'software-engineering': 'software-lifecycle',
    },
    'im-it-ds': {
      list: 'linear-structures', queue: 'linear-structures', stack: 'linear-structures', tree: 'trees-bst',
      'binary-search-tree': 'trees-bst', 'b-tree': 'trees-bst', heap: 'heaps-priority-queues',
      'priority-queue': 'heaps-priority-queues', 'hash-table': 'hashing', graph: 'graphs',
      'graph-spanning-tree': 'graphs', 'graph-topological-sort': 'graphs', sorting: 'sorting-searching',
      'sorting-complexity': 'sorting-searching', 'sorting-stability': 'sorting-searching', 'string-matching': 'sorting-searching',
    },
    'im-it-db': {
      'relational-design': 'relational-model', 'relational-model': 'relational-model', 'keys-and-constraints': 'relational-model',
      'er-diagram': 'er-modeling', 'er-model': 'er-modeling', sql: 'sql-querying', 'sql-aggregation': 'sql-querying',
      'sql-joins': 'sql-querying', normalization: 'normalization', 'functional-dependency': 'normalization',
      acid: 'transactions', 'acid-transactions': 'transactions', 'concurrency-control': 'transactions',
      'recovery-checkpoint': 'transactions', 'recovery-wal': 'transactions', 'transaction-isolation': 'transactions',
      'transaction-logging': 'transactions', 'database-indexing': 'storage-indexing', 'data-warehousing': 'storage-indexing',
      'distributed-databases': 'distributed-nosql', 'nosql-models': 'distributed-nosql', 'blockchain-consensus': 'distributed-nosql',
      'blockchain-distributed-ledger': 'distributed-nosql', 'blockchain-nft': 'distributed-nosql',
    },
    'im-it-network': {
      osi: 'models-encapsulation', 'osi-model': 'models-encapsulation', 'tcp-ip': 'models-encapsulation',
      'packet-switching': 'models-encapsulation', 'network-technologies': 'models-encapsulation',
      'data-link-flow-control': 'link-lan', 'ethernet-collision-control': 'link-lan', 'mac-address': 'link-lan',
      'mobile-networks': 'link-lan', 'multiple-access': 'link-lan', vlan: 'link-lan',
      'ip-addressing': 'ip-addressing-routing', 'ipv4-header': 'ip-addressing-routing', nat: 'ip-addressing-routing',
      'routing-algorithms': 'ip-addressing-routing', 'software-defined-networking': 'ip-addressing-routing',
      tcp: 'transport', udp: 'transport', 'tcp-congestion-control': 'transport', 'tcp-flow-control': 'transport',
      dhcp: 'application-protocols', dns: 'application-protocols', 'dns-dhcp': 'application-protocols',
      'email-protocols': 'application-protocols', 'http-cookies': 'application-protocols', 'http-https': 'application-protocols',
      'network-services': 'application-protocols', 'proxy-servers': 'application-protocols',
      'cloud-computing': 'distributed-cloud', 'edge-computing': 'distributed-cloud',
      'digital-divide': 'performance-reliability', 'network-security': 'performance-reliability', streaming: 'performance-reliability',
    },
    'im-it-os': {
      'context-switch': 'processes-threads', multiprocessing: 'processes-threads', multithreading: 'processes-threads',
      'process-management': 'processes-threads', 'processes-and-threads': 'processes-threads', 'os-concepts': 'processes-threads',
      'os-responsibilities': 'processes-threads', 'protection-modes': 'processes-threads', 'cpu-scheduling': 'cpu-scheduling',
      'concurrency-liveness': 'deadlocks', 'deadlock-avoidance': 'deadlocks', 'mutual-exclusion': 'synchronization',
      semaphores: 'synchronization', 'heap-memory': 'memory-management', 'memory-management': 'memory-management',
      'process-memory-layout': 'memory-management', 'stack-memory': 'memory-management', 'virtual-memory': 'memory-management',
      buffering: 'file-storage-io', 'device-management': 'file-storage-io', 'dynamic-linking': 'file-storage-io',
      'file-and-storage-management': 'file-storage-io', 'file-system': 'file-storage-io', 'file-systems': 'file-storage-io',
      'io-spooling': 'file-storage-io', 'computer-clusters': 'virtualization-containers', containerization: 'virtualization-containers',
      'serverless-computing': 'virtualization-containers', 'virtual-machines': 'virtualization-containers',
      virtualization: 'virtualization-containers',
    },
    'im-it-security': {
      'cia-triad': 'principles-risk', 'security-principles': 'principles-risk', cryptography: 'cryptography',
      'https-tls': 'cryptography', pki: 'cryptography', 'public-key-cryptography': 'cryptography',
      'access-control': 'auth-access', authentication: 'auth-access', 'zero-trust': 'auth-access',
      firewall: 'network-defense', 'network-security': 'network-defense', 'man-in-the-middle': 'network-defense',
      'common-attacks': 'application-attacks', 'security-governance': 'governance-privacy',
    },
    'im-it-ai': {
      'ai-concepts': 'foundations-search', 'turing-test': 'foundations-search', 'supervised-unsupervised': 'ml-paradigms',
      'data-analytics': 'training-evaluation', 'neural-networks': 'neural-networks',
      'transformer-self-attention': 'transformers-attention', 'large-language-models': 'generative-llm',
      'retrieval-augmented-generation': 'generative-llm', 'ai-applications': 'ethics-governance',
      'digital-twin': 'ethics-governance', 'emerging-technology': 'ethics-governance', metaverse: 'ethics-governance',
    },
  }
  const slug = maps[topicId]?.[raw]
  if (!slug) throw new Error(`No canonical mapping for ${topicId}/${raw}`)
  return `${topicId}-${slug}`
}

const learningObjectives = {
  'im-it-arch': ['轉換並判斷數值與資料表示法。', '解釋 CPU、記憶體、I/O 與儲存階層如何協作。', '比較架構與效能取捨。'],
  'im-it-prog': ['閱讀程式並追蹤控制流程與狀態。', '運用函式、記憶體與物件導向概念。', '解釋編譯、測試與軟體生命週期。'],
  'im-it-ds': ['依操作需求選擇資料結構。', '追蹤常見結構與演算法。', '分析時間與空間複雜度。'],
  'im-it-db': ['建立關聯與 ER 模型。', '撰寫並推導 SQL。', '分析正規化、交易與索引。'],
  'im-it-network': ['定位網路協定與設備層級。', '追蹤端到端請求流程。', '比較網路與雲端架構取捨。'],
  'im-it-os': ['分析行程、同步與排程。', '追蹤記憶體與檔案管理。', '解釋虛擬化資源隔離。'],
  'im-it-security': ['以風險模型分析資安情境。', '選擇密碼學與存取控制機制。', '辨認攻擊、防禦與治理措施。'],
  'im-it-ai': ['區分機器學習典範。', '解釋模型、神經網路與 Transformer。', '評估生成式 AI 的限制與治理。'],
}

const topics = subject.topics.map((topic) => ({
  id: topic.id,
  title: topic.title,
  importance: topic.importance,
  status: 'reviewed',
  learningObjectives: learningObjectives[topic.id].map((statement, index) => ({
    id: `${topic.id}-lo-${index + 1}`,
    statement,
  })),
  subtopics: definitions[topic.id].map(([slug, title, keywords]) => ({
    id: `${topic.id}-${slug}`,
    topicId: topic.id,
    title,
    keywords,
    status: 'reviewed',
  })),
}))

const questionById = new Map(questions.map((question) => [question.id, question]))
const metadata = annotations.map((annotation) => {
  const question = questionById.get(annotation.questionId)
  if (!question) throw new Error(`Unknown question ${annotation.questionId}`)
  const answer = answers[annotation.questionId]
  if (!answer?.explanation) throw new Error(`Missing explanation ${annotation.questionId}`)
  const isChoice = annotation.questionType === 'multiple-choice'
  const questionType = isChoice
    ? 'single_choice'
    : annotation.questionType === 'programming'
      ? 'code_implementation'
      : 'short_explanation'

  return {
    questionId: annotation.questionId,
    paperId: question.paperId,
    topicId: annotation.topicId,
    primarySubtopicId: canonical(annotation.topicId, annotation.subtopicId),
    questionType,
    scoringMode: isChoice ? 'automatic_candidate' : 'self_review',
    taxonomyConfidence: annotation.confidence,
    taxonomyRationale: annotation.rationale,
    answerSource: {
      kind: 'legacy_import',
      official: false,
      note: '現有答案與解析未附官方答案來源，不能視為官方解答。',
    },
    answerConfidence: {
      level: 'low',
      basis: ['題目已通過原卷 PDF 完整性核對', '解析存在但尚未完成獨立答案覆核'],
      unresolvedIssues: ['缺官方答案或可重現的雙人覆核紀錄'],
    },
    publication: {
      browseEligible: true,
      practiceEligible: false,
      autoGradeEligible: false,
      fullMockEligible: false,
      blockers: isChoice
        ? ['答案信心未達 medium']
        : ['需建立 rubric 並使用自評或人工審閱'],
    },
  }
})

const conceptMaster = {
  schemaVersion: 1,
  subjectId: 'im-it',
  canonicalTopicIds: topics.map((topic) => topic.id),
  contentStatus: 'taxonomy-reviewed-content-draft',
  sourcePolicy: '主題樹只定義知識結構；教材內容須另附來源並通過審核後才可發布。',
  publicationGates: {
    conceptLesson: ['definition', 'keyPoints', 'commonPitfalls', 'sourceRefs', 'content review'],
    flashcard: ['published concept reference', 'source reference', 'human review'],
    practice: ['answer confidence medium or higher', 'reviewed explanation or rubric'],
    fullMock: ['complete paper', 'answer confidence high', 'open-score separated from objective score'],
  },
  topics,
}

const questionMetadata = {
  schemaVersion: 1,
  subjectId: 'im-it',
  totalQuestions: metadata.length,
  counts: {
    singleChoice: metadata.filter((item) => item.questionType === 'single_choice').length,
    codeImplementation: metadata.filter((item) => item.questionType === 'code_implementation').length,
    shortExplanation: metadata.filter((item) => item.questionType === 'short_explanation').length,
  },
  taxonomyMethod: '人工逐題標註後，收斂至 concept master 的穩定 subtopicId。',
  answerPolicy: '原卷是題目來源，不等於答案來源；現有解析在獨立覆核前一律不得標為官方或啟用正式計分。',
  questions: metadata.sort((a, b) => a.questionId.localeCompare(b.questionId, 'en', { numeric: true })),
}

fs.writeFileSync('public/data/im-it-concept-master.json', `${JSON.stringify(conceptMaster, null, 2)}\n`)
fs.writeFileSync('public/data/im-it-question-metadata.json', `${JSON.stringify(questionMetadata, null, 2)}\n`)

console.log(JSON.stringify({ topics: topics.length, subtopics: topics.flatMap((topic) => topic.subtopics).length, ...questionMetadata.counts }))
