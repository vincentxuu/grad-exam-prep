# `im-it` Concept Master Schema 與內容輪廓

## 1. 目標與不可變契約

建立一份可追溯、可審核、可生成教材/閃卡、可連結 260 題真題的 `im-it` concept master。

不可變契約：

1. `subjects-im.json` 的 8 個正式 topicId 是唯一根 taxonomy：
   - `im-it-arch`
   - `im-it-prog`
   - `im-it-ds`
   - `im-it-db`
   - `im-it-network`
   - `im-it-os`
   - `im-it-security`
   - `im-it-ai`
2. 不為 algorithms、cloud、software engineering、computer organization 另建第九個根 topic。
3. 顯示名稱可改，ID 不隨中文標題、教材章名或模型輸出改名。
4. 每個 concept 必須有一個 primary `topicId` 與一個 primary `subtopicId`；跨域關係放 secondary refs，不複製 concept。
5. 全 10 年題目基線分成 **246 題選擇題**與 **14 題開放/程式題**。先前的 251/9 僅涵蓋前一階段已辨識的 open 題，不能作全卷 publication baseline。兩者必須使用不同 answer schema、評分與發布門檻。

## 2. 建議檔案責任

```text
public/data/im-it-concept-master.json       # 知識、目標、來源、概念關係
public/data/im-it-question-metadata.json    # 260 題 taxonomy、題型、答案 provenance、發布資格
public/data/im-it-source-registry.json      # 教材、標準、官方 PDF 的穩定來源 ID
public/data/im-it-curation.json             # 人工 override、爭議、排除、deprecated ID redirect
```

`questions.json` 保持題目本文的 authority；`answers.json` 保持呈現用答案/解析。Concept master 與 metadata 不應複製題幹或答案全文，只保存 refs 與品質判定。

## 3. Concept master 頂層 schema

```ts
type ImItConceptMaster = {
  schemaVersion: 1
  subjectId: 'im-it'
  generatedAt: string
  sourceRegistryVersion: string
  canonicalTopicIds: ImItTopicId[]
  topics: TopicDefinition[]
  concepts: ConceptDefinition[]
  deprecatedIds: Array<{
    id: string
    replacedBy: string[]
    reason: string
  }>
}

type TopicDefinition = {
  id: ImItTopicId
  title: string
  description: string
  importance: 1 | 2 | 3 | 4 | 5
  learningObjectives: LearningObjective[]
  subtopics: SubtopicDefinition[]
}

type SubtopicDefinition = {
  id: string
  topicId: ImItTopicId
  title: string
  aliases: string[]
  keywords: string[]
  learningObjectiveIds: string[]
  prerequisiteSubtopicIds: string[]
  status: 'draft' | 'reviewed' | 'published' | 'deprecated'
}

type LearningObjective = {
  id: string
  statement: string
  cognitiveLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'create'
  required: boolean
}

type ConceptDefinition = {
  id: string
  subjectId: 'im-it'
  topicId: ImItTopicId
  subtopicId: string
  secondarySubtopicIds: string[]
  title: string
  aliases: string[]
  keywords: string[]
  tier: 'must_know' | 'important' | 'supplementary'
  learningObjectiveIds: string[]
  definition: string
  keyPoints: string[]
  mechanisms?: string[]
  procedure?: string[]
  complexity?: Array<{ operation: string; average?: string; worst?: string; conditions: string[] }>
  codePatterns?: Array<{ language: 'cpp' | 'java' | 'sql' | 'pseudocode'; snippet: string; purpose: string }>
  contrasts: Array<{ conceptId: string; dimensions: string[] }>
  commonPitfalls: string[]
  sourceRefs: SourceRef[]
  pastPaperRefs: string[]
  evidenceStatus: 'insufficient' | 'single_source' | 'corroborated'
  review: {
    status: 'unreviewed' | 'content_reviewed' | 'technical_reviewed' | 'approved'
    reviewers: string[]
    reviewedAt?: string
    reviewNotes?: string
  }
  publicationStatus: 'draft' | 'reviewed' | 'published' | 'retired'
  freshness?: {
    kind: 'stable' | 'versioned' | 'fast_moving'
    validThrough?: string
  }
}
```

### ID 規則

- Subtopic：`<canonical-topic-id>-<stable-ascii-slug>`，例如 `im-it-os-memory-management`。
- Learning objective：`<subtopic-id>-lo-<verb-slug>`。
- Concept：`<subtopic-id>-<concept-slug>`。
- 不使用流水號作語意 ID；不得由陣列順序生成。
- 標題改名不改 ID。拆分 concept 時建立新 ID，舊 ID 放 `deprecatedIds.replacedBy`。
- keywords 用於搜尋與別名匹配，不作權威分類；taxonomy 只能看 `topicId/subtopicId`。

## 4. 八個 topic 的穩定 subtopic 與內容輪廓

### 4.1 `im-it-arch` 電腦架構基礎

學習目標：

- 轉換不同進位並判斷表示範圍、溢位與精度。
- 分析布林式、基本邏輯電路與資料路徑。
- 解釋 CPU、記憶體、I/O 與儲存階層如何協作。
- 比較效能指標與架構取捨。

| subtopicId | 內容 | 關鍵詞 |
|---|---|---|
| `im-it-arch-number-systems` | 進制、位元運算、編碼 | binary, octal, hexadecimal, base conversion, bitwise |
| `im-it-arch-data-representation` | signed integer、補數、浮點、字元 | two's complement, overflow, IEEE 754, ASCII, Unicode |
| `im-it-arch-boolean-logic` | 布林代數、真值表、化簡 | Boolean algebra, truth table, De Morgan, Karnaugh map |
| `im-it-arch-digital-circuits` | combinational/sequential circuits | gate, adder, multiplexer, latch, flip-flop, register |
| `im-it-arch-cpu-organization` | ISA、ALU、control、pipeline | instruction cycle, opcode, ALU, control unit, pipeline, hazard |
| `im-it-arch-memory-hierarchy` | cache、RAM、storage、locality | cache, locality, hit rate, RAM, ROM, SSD, virtual address |
| `im-it-arch-io-performance` | I/O、中斷、DMA、效能 | interrupt, polling, DMA, latency, throughput, clock rate |

### 4.2 `im-it-prog` 程式語言概念

學習目標：

- 閱讀 C++/Java 程式並追蹤控制流程、作用域與狀態。
- 正確運用函式、指標/參考、動態記憶體與物件生命週期。
- 比較封裝、繼承、多型及不同程式語言執行模型。
- 解釋編譯、連結、測試與基本軟體工程流程。

| subtopicId | 內容 | 關鍵詞 |
|---|---|---|
| `im-it-prog-syntax-types-control` | 型別、運算子、分支、迴圈 | primitive type, cast, operator, if, loop, switch |
| `im-it-prog-functions-scope` | 函式、參數、scope、recursion | function, call stack, scope, lifetime, recursion, pass by value |
| `im-it-prog-pointers-memory` | pointer/reference、配置與釋放 | pointer, reference, new, delete, heap, stack, memory leak |
| `im-it-prog-object-oriented` | 封裝、繼承、多型 | class, object, encapsulation, inheritance, polymorphism, virtual |
| `im-it-prog-language-runtime` | compiled/interpreted、VM | compiler, interpreter, linker, bytecode, JVM, runtime |
| `im-it-prog-error-testing` | error handling、testing、debugging | exception, assertion, unit test, debugging, boundary case |
| `im-it-prog-software-lifecycle` | requirements、design、version control | SDLC, requirement, UML, modularity, Git, CI/CD |

軟體工程 legacy topic 應映射到此根，不另建 `im-it-software-eng`。

### 4.3 `im-it-ds` 資料結構

學習目標：

- 根據操作需求選擇資料結構並比較時間/空間複雜度。
- 手動追蹤與實作常見結構的插入、刪除、搜尋、遍歷。
- 分析排序、搜尋與圖演算法的正確性與複雜度。
- 建立 loop invariant、edge cases 與可驗證的 pseudocode/C++ 實作。

| subtopicId | 內容 | 關鍵詞 |
|---|---|---|
| `im-it-ds-complexity-analysis` | asymptotic analysis、recurrence | Big O, Theta, Omega, amortized, recurrence, invariant |
| `im-it-ds-linear-structures` | array、list、stack、queue | array, linked list, stack, queue, deque |
| `im-it-ds-trees-bst` | tree、BST、traversal、balanced tree | tree, BST, inorder, AVL, red-black, height |
| `im-it-ds-heaps-priority-queues` | binary heap、heapify | min-heap, max-heap, priority queue, sift up, sift down |
| `im-it-ds-hashing` | hash table、collision resolution | hash, load factor, chaining, probing, double hashing |
| `im-it-ds-graphs` | representation、traversal、MST、shortest path | graph, BFS, DFS, adjacency, Prim, Kruskal, Dijkstra |
| `im-it-ds-sorting-searching` | sorting、binary/string search | quicksort, mergesort, heapsort, stability, binary search, Boyer-Moore |
| `im-it-ds-algorithm-design` | greedy、divide/conquer、DP | greedy, divide and conquer, dynamic programming, correctness proof |

Algorithms legacy topic 應映射到此根；題目可用 skill tag 區別 complexity/proof/code。

### 4.4 `im-it-db` 資料庫

學習目標：

- 從需求建立 relational/ER model 並判斷 key 與關係。
- 撰寫與推導 SQL 查詢結果。
- 以 functional dependency 判斷並執行 normalization。
- 解釋 transaction、concurrency、recovery 與 index 取捨。

| subtopicId | 內容 | 關鍵詞 |
|---|---|---|
| `im-it-db-relational-model` | relation、tuple、key、constraint | relation, tuple, primary key, foreign key, referential integrity |
| `im-it-db-er-modeling` | entity/relationship/cardinality | ER diagram, entity, relationship, cardinality, weak entity |
| `im-it-db-sql-querying` | SELECT/JOIN/subquery/aggregation | SQL, SELECT, WHERE, JOIN, GROUP BY, HAVING, subquery |
| `im-it-db-normalization` | FD、1NF-BCNF、decomposition | functional dependency, 1NF, 2NF, 3NF, BCNF, lossless join |
| `im-it-db-transactions` | ACID、serializability、locking | ACID, transaction, schedule, serializable, lock, deadlock |
| `im-it-db-storage-indexing` | index、B+ tree、hash index | index, B+ tree, clustered, query plan, storage |
| `im-it-db-distributed-nosql` | replication、CAP、NoSQL | replication, sharding, CAP, key-value, document database |

### 4.5 `im-it-network` 網路

學習目標：

- 將協定與設備定位到 OSI/TCP-IP layer。
- 計算與判斷 addressing、subnet、routing 與 transport 行為。
- 追蹤 DNS 到 HTTP(S) 的端到端請求流程。
- 比較 LAN/wireless、client-server、cloud/distributed service 的取捨。

| subtopicId | 內容 | 關鍵詞 |
|---|---|---|
| `im-it-network-models-encapsulation` | OSI/TCP-IP、encapsulation | OSI, TCP/IP, layer, packet, frame, encapsulation |
| `im-it-network-link-lan` | Ethernet、switch、MAC、Wi-Fi | Ethernet, MAC, switch, collision, VLAN, wireless |
| `im-it-network-ip-addressing-routing` | IPv4/IPv6、subnet、router | IP, subnet mask, CIDR, router, routing, NAT, ICMP |
| `im-it-network-transport` | TCP/UDP、reliability、congestion | TCP, UDP, port, handshake, flow control, congestion |
| `im-it-network-application-protocols` | HTTP、DNS、DHCP、email | HTTP, HTTPS, DNS, DHCP, SMTP, FTP, socket |
| `im-it-network-distributed-cloud` | client-server、cloud、service models | distributed system, cloud, IaaS, PaaS, SaaS, load balancer, CDN |
| `im-it-network-performance-reliability` | latency、bandwidth、availability | bandwidth, latency, jitter, throughput, redundancy, QoS |

Cloud legacy topic 依考點映射到 network 或 OS virtualization；不另立根 topic。

### 4.6 `im-it-os` 作業系統

學習目標：

- 區分 process/thread 與 CPU scheduling 行為。
- 分析 synchronization、race condition 與 deadlock。
- 追蹤 virtual memory、paging 與 page replacement。
- 解釋 file/storage/I/O 與 virtualization 資源管理。

| subtopicId | 內容 | 關鍵詞 |
|---|---|---|
| `im-it-os-processes-threads` | process、thread、context switch | process, thread, PCB, context switch, system call |
| `im-it-os-cpu-scheduling` | scheduling algorithms | FCFS, SJF, priority, round robin, turnaround, waiting time |
| `im-it-os-synchronization` | critical section、primitive | race condition, mutex, semaphore, monitor, critical section |
| `im-it-os-deadlocks` | conditions、avoidance、detection | deadlock, Coffman, Banker's algorithm, wait-for graph |
| `im-it-os-memory-management` | paging、segmentation、virtual memory | page, frame, TLB, page fault, replacement, working set |
| `im-it-os-file-storage-io` | file system、disk、I/O | inode, directory, allocation, disk scheduling, device driver |
| `im-it-os-virtualization-containers` | VM、hypervisor、container | virtualization, hypervisor, VM, container, namespace, isolation |

### 4.7 `im-it-security` 資安

學習目標：

- 以 CIA、threat/vulnerability/risk 分析情境。
- 選擇適當 cryptography、authentication 與 access control 機制。
- 辨認網路、系統與 Web 常見攻擊及防禦。
- 解釋治理、隱私、事件處理與人因風險。

| subtopicId | 內容 | 關鍵詞 |
|---|---|---|
| `im-it-security-principles-risk` | CIA、risk、defense in depth | confidentiality, integrity, availability, threat, vulnerability, risk |
| `im-it-security-cryptography` | symmetric/asymmetric/hash/signature | AES, RSA, hash, MAC, digital signature, PKI, certificate |
| `im-it-security-auth-access` | authentication、authorization | MFA, password, biometric, RBAC, least privilege, zero trust |
| `im-it-security-network-defense` | firewall、IDS/IPS、DDoS | firewall, IDS, IPS, VPN, DDoS, segmentation |
| `im-it-security-application-attacks` | injection、XSS、CSRF、session | SQL injection, XSS, CSRF, session hijacking, validation |
| `im-it-security-malware-social` | malware、phishing、social engineering | virus, worm, ransomware, phishing, social engineering |
| `im-it-security-governance-privacy` | ISMS、incident、privacy | ISO 27001, incident response, backup, privacy, audit |

### 4.8 `im-it-ai` AI/ML

學習目標：

- 區分 supervised/unsupervised/reinforcement learning 與典型任務。
- 解釋 model training、generalization、evaluation 與 data leakage。
- 描述 neural network、CNN/RNN/Transformer 的核心機制。
- 解釋生成式 AI/LLM 流程、限制、RAG 與倫理治理。

| subtopicId | 內容 | 關鍵詞 |
|---|---|---|
| `im-it-ai-foundations-search` | classic AI、state-space search | AI, agent, state space, heuristic, A*, knowledge representation |
| `im-it-ai-ml-paradigms` | supervised/unsupervised/RL | classification, regression, clustering, reinforcement learning |
| `im-it-ai-training-evaluation` | split、loss、bias/variance、metrics | training, validation, test, overfitting, regularization, precision, recall |
| `im-it-ai-neural-networks` | perceptron、backprop、deep learning | neural network, activation, gradient descent, backpropagation |
| `im-it-ai-cnn-rnn-sequence` | vision、sequence models | CNN, convolution, RNN, LSTM, embedding |
| `im-it-ai-transformers-attention` | attention、Transformer | self-attention, Transformer, encoder, decoder, positional encoding |
| `im-it-ai-generative-llm` | generation、pretraining、prompting、RAG | generative AI, LLM, token, pretraining, fine-tuning, prompt, RAG |
| `im-it-ai-ethics-governance` | fairness、privacy、explainability | bias, fairness, hallucination, explainability, accountability, copyright |

AI 是 fast-moving；versioned facts 必須有 `validThrough`，基礎機制可標 stable。

## 5. Legacy taxonomy 到正式根的映射

| Legacy 類型 | 正式落點 |
|---|---|
| `im-it-computer-org` | `im-it-arch` |
| `im-it-programming` | `im-it-prog` |
| `im-it-software-eng` | `im-it-prog-software-lifecycle` |
| `im-it-data-structures` | `im-it-ds` |
| `im-it-algorithms` | `im-it-ds` 下 complexity/sorting/graph/design |
| `im-it-database` | `im-it-db` |
| `im-it-networks` | `im-it-network` |
| `im-it-cloud` | network distributed-cloud 或 OS virtualization，依 primary learning objective 決定 |
| `im-it-ai-ml` | `im-it-ai` |

這張表只用於 migration；正式 artifact 不保留 legacy ID 當 canonical value。

## 6. Question metadata 與答案 taxonomy

```ts
type QuestionMetadata = {
  questionId: string
  paperId: string
  topicId: ImItTopicId
  primarySubtopicId: string
  secondarySubtopicIds: string[]
  conceptIds: string[]
  questionType:
    | 'single_choice'
    | 'multiple_choice'
    | 'code_trace'
    | 'short_explanation'
    | 'algorithm_design'
    | 'proof'
    | 'code_implementation'
    | 'diagram'
  skills: Array<'recall' | 'interpret' | 'calculate' | 'trace' | 'debug' | 'design' | 'prove' | 'implement'>
  cognitiveLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'create'
  difficulty: 'foundation' | 'standard' | 'advanced'
  answerSpec: ChoiceAnswerSpec | OpenAnswerSpec | CodeAnswerSpec
  answerSource: AnswerSource
  answerConfidence: AnswerConfidence
  publication: QuestionPublication
}
```

### 6.1 Answer discriminated union

```ts
type ChoiceAnswerSpec = {
  kind: 'choice'
  correctOptions: Array<'A' | 'B' | 'C' | 'D' | 'E'>
  optionCount: number
  grading: 'exact_match'
  explanationId: string
}

type OpenAnswerSpec = {
  kind: 'open'
  referenceSolutionId: string
  rubric: RubricCriterion[]
  grading: 'self_review' | 'human_review'
  maxPoints: number
}

type CodeAnswerSpec = {
  kind: 'code'
  language: 'cpp' | 'pseudocode'
  referenceSolutionId: string
  rubric: RubricCriterion[]
  testCases?: Array<{ input: string; expectedOutput: string; visibility: 'sample' | 'hidden' }>
  grading: 'rubric_self_review' | 'human_review' | 'sandbox_tests_plus_review'
  maxPoints: number
}

type RubricCriterion = {
  id: string
  description: string
  points: number
  requiredEvidence: string[]
  commonErrors: string[]
}
```

Open/code 題的 `correctAnswer` 必須是 `null` 或不存在，不能放 `A`、`N/A` 或完整答案字串來冒充選擇答案。

### 6.2 `answerSource`

```ts
type AnswerSource = {
  kind:
    | 'official_key'
    | 'official_solution'
    | 'authoritative_reference_derivation'
    | 'independent_expert_derivation'
    | 'multi_reviewer_consensus'
    | 'legacy_import'
    | 'model_generated_unreviewed'
  refs: SourceRef[]
  derivationNotes?: string
  reviewerIds: string[]
  reviewedAt?: string
}
```

原卷 PDF 是 **question source**，不是 answer source。只有 PDF 題目、沒有官方 key 時，不得標 `official_key`。

### 6.3 `answerConfidence`

```ts
type AnswerConfidence = {
  level: 'high' | 'medium' | 'low' | 'disputed'
  basis: string[]
  unresolvedIssues: string[]
}
```

判定原則：

- `high`：官方 key/solution；或至少兩個獨立 reviewer 得到相同答案，且有權威 reference/完整推導，題意無歧義。
- `medium`：單一技術 reviewer 完成可重現推導並有 reference，但尚未雙人覆核。
- `low`：只有 legacy/模型解析、缺來源、推導不完整或題目 OCR 仍有疑點。
- `disputed`：reviewer 結論衝突、題目有多解/無正確選項、來源本身疑似誤植。

不要只存 0-1 小數；level 必須附 basis，使 reviewer 能重現判斷。

## 7. 246 題選擇題與 14 題開放/程式題

### 246 題選擇題

- `questionType` 只能是 `single_choice` / `multiple_choice` / 選擇形式的 `code_trace`。
- `answerSpec.kind = choice`，不得使用 free-text answer。
- 可進 auto-grade 的最低條件：
  - 選項解析完整；single-choice 恰一個正解。
  - 題目 PDF source integrity 通過。
  - `answerConfidence` 至少 medium；正式 mock 必須 high。
  - explanation 說明正解理由；若 distractor 有陷阱，至少覆蓋主要錯因。
- 若原卷無正確選項或多解，改標 `disputed` 並退出 auto-grade，不可硬選最像的一個。

### 14 題開放/程式題

- 必須人工標註 subtype；不能靠 `(A)` regex 或答案字母推斷。
- 可用 `algorithm_design`、`proof`、`code_implementation`、`short_explanation`、`diagram` 等類型。
- `answerSpec.kind` 只能是 `open` 或 `code`。
- 每題 rubric points 加總必須等於原卷 points；有多小題時每一小題有獨立 criterion。
- 程式題至少檢查：正確性、boundary cases、複雜度、記憶體/資源管理、是否符合題目限制。能執行的 C++ 可加入 sample/hidden tests，但 tests 不取代人工檢查 proof/complexity。
- 顯示流程：先手寫/輸入答案 -> 查看 reference solution/rubric -> 自評「會／部分會／不會」或人工 review。
- 不寫入 choice correct/wrong；不得污染 246 題選擇題正確率。
- 完整年度模擬需顯示兩個結果：`objectiveScore` 與 `openEndedSelfScore`。沒有人工/自評分數時，總分標示 incomplete，不得把 open 題算 0 或自動算滿。

## 8. Publication gates

### 8.1 Concept gate

Concept 進 `published` 必須同時滿足：

- topicId/subtopicId 均合法且 ID 唯一。
- 至少一個 required learning objective。
- definition、keyPoints、commonPitfalls 非空。
- 至少一個可定位的 `sourceRef`；只有 legacy card 或模型文字不算來源。
- technical reviewer approved；AI/資安 versioned facts 通過 freshness 檢查。
- normalized aliases/keywords 不與別 concept 形成未處理的重複。
- 若生成卡片，卡片必須可回鏈 conceptId 與 sourceRefs。

### 8.2 Question browse gate

可出現在題庫瀏覽：

- questionId 唯一、paperId 存在。
- 原卷 PDF hash/題目 snapshot 通過。
- primary topic/subtopic 合法。
- 若答案未過 gate，畫面明示「答案待審」，不可悄悄自動判分。

### 8.3 Practice gate

- 選擇題：answerSource 非 unreviewed、confidence 至少 medium、answerSpec 結構合法。
- 開放題：reference solution + rubric 完整，confidence 至少 medium；只進 self-review/human-review surface。
- 題目或答案為 low/disputed 時，只能 browse，不能寫入熟練度/正確率。

### 8.4 Auto-grade gate

只允許 choice：

- confidence = high。
- 正解數符合 questionType。
- option label 與原卷一致。
- explanation、來源、reviewer 完整。
- open/code 題永遠不得通過此 gate，即使有 sample tests。

### 8.5 Full-paper mock gate

- paper source verified，題數/題號/配分/圖片完整。
- 所有選擇題通過 auto-grade gate。
- 所有開放題通過 open practice gate，並從 objectiveScore 分母分離。
- paper 無 `incomplete/suspect` 狀態。
- 分數 UI 明確標示 objective 與 open-ended 部分；未評 open 題時不得宣稱完整總分。

### 8.6 Flashcard publication gate

- concept 已 published。
- prompt 原子化，不複製整題/選項。
- answer 僅回答 prompt，不做 400 字小講義。
- 有 conceptId、合法 topic/subtopic、sourceRefs；若由真題頻率決定 tier，必須有 pastPaperRefs。
- required concepts 覆蓋率 100%、duplicate normalized prompt = 0、非法 ID = 0。

## 9. Validator 必要規則

1. root topic 只能是 8 個 canonical IDs。
2. subtopic topicId 必須與 ID prefix 一致。
3. 每個 question 恰一個 primarySubtopic，secondary 不得含 primary。
4. 260 題 metadata 全覆蓋；發布基線報告固定呈現 246 choice / 14 open-program。題型必須由人工 manifest 決定，不可從 `answer` 是否為 `A`/`N/A` 或選項 regex 推斷。
5. choice 題不可用 `N/A`/長文字作 correct answer；open/code 題不可有 choice answer。
6. auto-grade set 與 open set 必須 disjoint，聯集等於可練習題集。
7. high confidence 必須有 reviewer 與非 legacy/model-only source。
8. rubric points 必須等於 question points。
9. mock 不得把未評 open points 算入 objective denominator。
10. sourceRef 必須能 resolve 到 registry；教材需 edition/version/locator。
11. deprecated IDs 不能出現在新 artifact，只能透過 redirect 被讀取。
12. generator `--check` 必須證明 concept cards/question metadata 未 stale。

## 10. 建置順序與完成定義

### Phase 1：taxonomy freeze

- 建立本文件 subtopic IDs 與 source registry。
- 人工處理無明確根分類的 cloud/software engineering/algorithms 題。
- 加 deprecated/legacy mapping，不直接覆寫歷史 SRS ID。

### Phase 2：260 題 metadata

- 先人工標記 14 題 open/program，從 auto-grade pool 隔離。
- 再標註 246 題 choice 的 topic/subtopic/concepts、answerSource/confidence。
- 低信心/爭議答案形成 review queue，不因已有長解析就直接 high。

### Phase 3：concept master

- 由 required learning objectives 建 concepts，不以固定張數為完成標準。
- 優先建立歷屆高頻與 14 題實作所需 prerequisite concepts。
- 每個 concept 至少一個權威來源，重要概念至少雙來源或 reviewer corroboration。

### Phase 4：publication

- 先發布 browse/lesson，再發布 reviewed cards。
- 只讓 high-confidence choice 題進正式自動計分/mock。
- 開放題完成 rubric UI 後才發布自評練習。

完成定義：

- 8 topics、所有穩定 subtopics 與 required objectives 均有 reviewed coverage。
- 260/260 questions 有合法 metadata；246/14 分流零錯誤。
- auto-grade 題均 high confidence；low/disputed 題為 0 或明確退出計分。
- 14 題 open/program 均有 reviewed reference solution 與配分 rubric。
- 任一題、概念、卡片都能回查原卷或權威教材來源。
- 所有 publication gates、validator、typecheck、tests、production build 通過。
