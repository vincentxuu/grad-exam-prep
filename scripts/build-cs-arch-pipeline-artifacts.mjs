import crypto from 'node:crypto'
import fs from 'node:fs'

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

const questions = readJson('public/data/questions.json').questions
const answers = readJson('public/data/answers.json').answers

const evidence = [
  {
    questionId: 'q-pp-cs-arch-110-7',
    questionTextSha256: 'add2b7cee56e88faeecd9c5f34922e6b83acfc6ae8e6ad3ee998c02b686811ac',
    primarySubtopicId: 'cs-arch-pipeline-hazards-forwarding',
    questionType: 'multi_part',
    taxonomyRationale:
      '同時考 stage latency、load-use hazard、forwarding control 與 R-type control signals。',
    reviewStatus: 'self_review_only',
    candidateAnswer: null,
    confidence: 'unreviewed',
    reasoning: [
      '題目是四小題的開放式計算題，answers.json 的單一 A 無法代表答案。',
      '現有 explanation 可作推導草稿，但尚未逐項對照原卷圖與 datapath assumptions。',
    ],
    blockers: ['開放式多小題沒有官方答案', '含圖題尚待逐項 PDF 視覺覆核', '現有 answer=A 是佔位值'],
  },
  {
    questionId: 'q-pp-cs-arch-111-5',
    questionTextSha256: 'c8f9c253b62cb92c68ca3a6e1424658c2a915d07e6b19fae9abb4c0f0455740b',
    primarySubtopicId: 'cs-arch-pipeline-hazards-forwarding',
    questionType: 'single_choice',
    taxonomyRationale: '要求在無 forwarding 且同週期 write/read 的明示假設下排出完成週期。',
    reviewStatus: 'candidate_confirmed',
    candidateAnswer: 'E',
    confidence: 'medium',
    reasoning: [
      '題面明示 register 可在同一 cycle 寫回後讀取。',
      '#3 等待 #2 的 x29，#4 再等待 #3 的 x17，依五級管線草算完成於 cycle 9 與 12。',
    ],
    blockers: ['沒有官方答案 key', '尚缺第二位獨立 reviewer'],
  },
  {
    questionId: 'q-pp-cs-arch-112-7',
    questionTextSha256: '8aabfecf8d73dd346c010609393c714d745062dee7681bc4dfaae69e9a744699',
    primarySubtopicId: 'cs-arch-pipeline-hazards-forwarding',
    questionType: 'single_choice',
    taxonomyRationale: '要求在沒有 hazard detection 與 forwarding 時插入 NOP。',
    reviewStatus: 'disputed',
    candidateAnswer: null,
    confidence: 'disputed',
    reasoning: [
      '現有答案採 E=8，假設 consumer 的 ID 必須晚於 producer 的 WB。',
      '若 register file 支援同週期先寫後讀，常見五級管線排程會得到 C=5。',
      '題面未明示同週期 register write/read 語意，不能核准單一答案。',
    ],
    blockers: [
      'register file timing assumption 未明示',
      '現有解析與常見教科書假設產生不同答案',
      '沒有官方答案 key',
    ],
  },
  {
    questionId: 'q-pp-cs-arch-113-2',
    questionTextSha256: '74a5d402d1500baa7dfd9d79e7ae03d9018fb4b84ae10fc3a37d662258492e2a',
    primarySubtopicId: 'cs-arch-pipeline-performance',
    questionType: 'multiple_select',
    taxonomyRationale:
      '比較 sequential/pipelined latency、resource utilization、speedup 與 power 敘述。',
    reviewStatus: 'candidate_confirmed',
    candidateAnswer: 'B',
    confidence: 'medium',
    reasoning: [
      'Load/Store 比例為 40%，無 stall 時 data memory utilization 為 40%。',
      '其餘敘述需依各 instruction 實際 stage path 與 pipeline-register overhead 再做第二次覆核。',
    ],
    blockers: [
      '題幹使用 is/are true，可能是複選契約',
      '沒有官方答案 key',
      '尚缺第二位獨立 reviewer',
    ],
  },
  {
    questionId: 'q-pp-cs-arch-114-12',
    questionTextSha256: '24f4e73cc092b5bf2970fc2b97b8ae558d406d58be3596035353212a6aa02da8',
    primarySubtopicId: 'cs-arch-pipeline-performance',
    questionType: 'multiple_select',
    taxonomyRationale:
      '用 stage latency 與 instruction mix 判斷 clock、instruction latency 與 utilization。',
    reviewStatus: 'disputed',
    candidateAnswer: null,
    confidence: 'disputed',
    reasoning: [
      '現有 explanation 選 D，但同時承認 C 的 5×250 ps=1250 ps 數值成立。',
      '在未確認原卷作答格式與 latency 定義前，不應壓成單一選項。',
    ],
    blockers: ['C 與 D 可能同時成立', '原卷選擇規則未在抽取文字中明示', '沒有官方答案 key'],
  },
  {
    questionId: 'q-pp-cs-arch-114-13',
    questionTextSha256: 'b7282a2644f70f262f5b8ea4d1ca422af7926fe5c706042519f790e2f23f1e9d',
    primarySubtopicId: 'cs-arch-pipeline-hazards-forwarding',
    questionType: 'single_choice',
    taxonomyRationale: '以 load delay slot 追蹤緊鄰 consumer 讀到的新舊 register value。',
    reviewStatus: 'candidate_confirmed',
    candidateAnswer: 'A',
    confidence: 'medium',
    reasoning: [
      'addi 先把 x3 設為 24；忽略 load delay slot 時，緊鄰 add 仍讀到舊值 24。',
      'x4 因而得到 24+24=48，對應 A。',
    ],
    blockers: ['沒有官方答案 key', '尚缺第二位獨立 reviewer'],
  },
]

for (const item of evidence) {
  const question = questions.find((entry) => entry.id === item.questionId)
  if (!question || question.subjectId !== 'cs-arch')
    throw new Error(`Missing cs-arch question: ${item.questionId}`)
  if (sha256(question.text) !== item.questionTextSha256) {
    throw new Error(`Question text drift from origin/main: ${item.questionId}`)
  }
}

const sourceRegistry = {
  schemaVersion: 1,
  subjectId: 'cs-arch',
  status: 'draft',
  policy: '來源僅列為候選技術 authority；lesson 在來源與答案完成第二次覆核前不得標示 reviewed。',
  sources: [
    {
      id: 'src-cs-arch-patterson-hennessy-2e',
      title: 'Computer Organization and Design RISC-V Edition, 2nd Edition',
      author: 'David A. Patterson and John L. Hennessy',
      publisher: 'Morgan Kaufmann',
      type: 'book',
      url: 'https://www.elsevier.com/books/computer-organization-and-design-risc-v-edition/patterson/978-0-12-820331-6',
      scope: [
        'five-stage-pipeline',
        'pipeline-performance',
        'data-hazards',
        'forwarding',
        'stalls',
      ],
      usage: 'candidate-conceptual-authority-and-worked-example-check',
      status: 'candidate',
    },
    {
      id: 'src-cs-arch-riscv-unprivileged',
      title: 'The RISC-V Instruction Set Manual, Volume I: Unprivileged ISA',
      author: 'RISC-V International',
      publisher: 'RISC-V International',
      type: 'official-specification',
      url: 'https://docs.riscv.org/reference/isa/unpriv/unpriv-index.html',
      scope: ['risc-v-instruction-semantics', 'registers', 'loads-stores'],
      usage: 'candidate-instruction-semantics-check',
      status: 'candidate',
    },
    {
      id: 'src-cs-arch-past-papers-110-114',
      title: '台大資工所計算機結構與作業系統 110–114 年考古題',
      author: '國立臺灣大學研究所招生考試',
      type: 'local-primary-source-bundle',
      paths: evidence
        .map(
          (item) => `public/papers/${item.questionId.replace(/^q-/, '').replace(/-\d+$/, '')}.pdf`
        )
        .filter((path, index, all) => all.indexOf(path) === index),
      scope: ['past-paper-question-face'],
      usage: 'primary-question-text-and-layout-check; no official answer key bundled',
      status: 'verified-question-source',
    },
  ],
}

const conceptMaster = {
  schemaVersion: 1,
  subjectId: 'cs-arch',
  status: 'draft',
  coverage: 'partial_pipeline_slice',
  canonicalTopicIds: ['cs-arch-pipeline'],
  topics: [
    {
      id: 'cs-arch-pipeline',
      title: 'Datapath 與 Pipeline',
      importance: 5,
      status: 'draft',
      subtopics: [
        {
          id: 'cs-arch-pipeline-foundations',
          topicId: 'cs-arch-pipeline',
          title: '五階段 Pipeline 與吞吐量',
          status: 'draft',
        },
        {
          id: 'cs-arch-pipeline-performance',
          topicId: 'cs-arch-pipeline',
          title: 'Stage latency、clock 與 utilization',
          status: 'draft',
        },
        {
          id: 'cs-arch-pipeline-hazards-forwarding',
          topicId: 'cs-arch-pipeline',
          title: 'Data hazard、stall、NOP 與 forwarding',
          status: 'draft',
        },
      ],
    },
  ],
}

const questionMetadata = {
  schemaVersion: 1,
  subjectId: 'cs-arch',
  status: 'draft',
  coverage: 'pipeline_candidate_refs_only',
  totalQuestions: evidence.length,
  taxonomyMethod: 'Manually scoped to the canonical cs-arch-pipeline topic from subjects-cs.json.',
  answerPolicy:
    '所有答案皆非官方且尚未核准自動判分；disputed/self-review 題不得轉成單一 grading key。',
  questions: evidence.map((item) => ({
    questionId: item.questionId,
    paperId: item.questionId.replace(/^q-/, '').replace(/-\d+$/, ''),
    topicId: 'cs-arch-pipeline',
    primarySubtopicId: item.primarySubtopicId,
    questionType: item.questionType,
    scoringMode: 'self_review',
    taxonomyConfidence: 'high',
    taxonomyRationale: item.taxonomyRationale,
    originQuestionTextSha256: item.questionTextSha256,
    answerSource: {
      kind: 'candidate_technical_derivation',
      official: false,
      reviewCount: 1,
      note: '依 origin/main 題面與現有解析建立的初審草稿，不是官方答案。',
    },
    answerConfidence: {
      level: item.confidence,
      basis: item.reasoning,
      unresolvedIssues: item.blockers,
    },
    publication: {
      browseEligible: true,
      practiceEligible: false,
      autoGradeEligible: false,
      fullMockEligible: false,
      blockers: item.blockers,
    },
  })),
}

const answerReview = {
  schemaVersion: 1,
  subjectId: 'cs-arch',
  status: 'draft',
  coverage: 'pipeline_candidate_refs_only',
  officialAnswerKeyAvailable: false,
  reviewMethod:
    'Origin/main question-text hash lock plus one technical derivation pass; no answer is approved for grading.',
  totalQuestions: evidence.length,
  counts: {
    candidateConfirmed: evidence.filter((item) => item.reviewStatus === 'candidate_confirmed')
      .length,
    disputed: evidence.filter((item) => item.reviewStatus === 'disputed').length,
    selfReviewOnly: evidence.filter((item) => item.reviewStatus === 'self_review_only').length,
  },
  autoGradeEligible: 0,
  questions: evidence.map((item) => ({
    questionId: item.questionId,
    status: item.reviewStatus,
    previousAnswer: answers[item.questionId]?.answer ?? null,
    candidateAnswer: item.candidateAnswer,
    approvedAnswer: null,
    confidence: item.confidence,
    reviewCount: 1,
    official: false,
    reasoning: item.reasoning,
    sourceRefs: [
      'src-cs-arch-past-papers-110-114',
      'src-cs-arch-patterson-hennessy-2e',
      'src-cs-arch-riscv-unprivileged',
    ],
    unresolvedIssues: item.blockers,
    practiceEligible: false,
    autoGradeEligible: false,
  })),
}

const lessonId = 'lesson-cs-arch-pipeline-foundations-01'
const lesson = {
  id: lessonId,
  topicId: 'cs-arch-pipeline',
  subtopicId: 'cs-arch-pipeline-foundations',
  coveredSubtopicIds: [
    'cs-arch-pipeline-foundations',
    'cs-arch-pipeline-performance',
    'cs-arch-pipeline-hazards-forwarding',
  ],
  title: '五階段 Pipeline：從餐廳出餐線到 hazard timing table',
  summary:
    '以 IF、ID、EX、MEM、WB 五階段建立 throughput 與 latency 的分界，再用 RAW dependency、stall、NOP 與 forwarding 追蹤實際週期。內容為候選教學草稿；考古題答案均非官方且未開放自動判分。',
  estimatedMinutes: 42,
  learningObjectives: [
    '區分單一 instruction latency、clock cycle time 與 steady-state throughput。',
    '從 stage latency 找出 pipeline clock 的 bottleneck，並計算 resource utilization。',
    '畫出五級管線 timing table，辨認 RAW data hazard 與 load-use hazard。',
    '依 datapath 假設判斷何時需要 stall、NOP 或 forwarding。',
  ],
  analogy: {
    title: '餐廳出餐線',
    mapping: [
      { concept: 'IF/ID/EX/MEM/WB', analogy: '接單、讀單、烹調、取料、交付五個工作站' },
      { concept: 'pipeline clock', analogy: '整條線每次推進都得等最慢工作站完成' },
      { concept: 'RAW hazard', analogy: '下一位廚師需要前一站尚未完成的半成品' },
      { concept: 'forwarding', analogy: '半成品完成後直接交給需要的工作站，不繞回倉庫' },
      { concept: 'stall/NOP', analogy: '缺料時空出一個節拍，讓相依工作稍後再進站' },
    ],
    boundary:
      '餐點不會精確呈現 register file 半週期寫讀、pipeline register、control signal encoding 或不同 instruction 使用不同 stages；計算仍必須回到題目明示的 datapath 與 timing assumptions。',
  },
  sections: [
    {
      title: '先分清 latency 與 throughput',
      body: '五級 pipeline 讓多條 instructions 同時位於不同 stages。單一 instruction 通常仍要跨越五個 stage slots；改善的是穩態下完成 instructions 的頻率。Clock cycle time 由最慢 stage 加上 pipeline-register overhead 決定，不能把所有 stage latency 相加當成 pipelined clock。',
      bullets: [
        'Sequential latency 常看該 instruction 實際走過的 stage latency 總和。',
        'Pipelined instruction latency 約為 stage 數乘 clock，但 throughput 在填滿後可接近每 cycle 一條。',
        '題目未給 pipeline-register overhead 時才能採忽略值的簡化模型。',
      ],
    },
    {
      title: '用 timing table 追蹤相依',
      body: '每列放一條 instruction、每欄放一個 cycle，依序填 IF、ID、EX、MEM、WB。若 consumer 在 ID/EX 需要的值尚未由 producer 產生，就標出 dependency edge，再依 forwarding 與 register-file timing 決定要不要停。',
      bullets: [
        'RAW 是 consumer 讀取 producer 尚未完成的結果。',
        'ALU result 與 load result 的可用時間不同，load-use 常需額外等待。',
        '沒有 hazard detection 時，compiler/programmer 必須明示插入 NOP。',
      ],
    },
    {
      title: 'Forwarding 不是讓結果提早算好',
      body: 'Forwarding 只是從較早的 pipeline register 把已產生的 result 送到 EX input，省去先寫回 register file 再讀出的等待。若 load data 到 MEM 結尾才產生，緊鄰 consumer 即使有 forwarding 也可能需要一個 bubble。',
      bullets: [
        '先找 producer，再找 result 何時可用。',
        '再找 consumer 在哪個 stage 真正需要 operand。',
        '最後依 mux/control encoding 選 forwarding path；不要背離題目 datapath。',
      ],
    },
    {
      title: '所有數字都依賴題目假設',
      body: 'NOP 數、完成週期與 forwarding code 不是脫離機器模型的固定答案。同週期 register write/read 是否允許、branch 在哪一 stage resolved、memory 是否 single-port、pipeline register overhead 都會改變 timing。',
      bullets: [
        '把 assumptions 寫在 timing table 上方。',
        '題目沒說清楚且不同合理模型給不同答案時，標記 disputed。',
        '非官方技術推導不得直接升級為 auto-grade key。',
      ],
    },
  ],
  workedExamples: [
    {
      prompt:
        'Stages 分別為 150、250、50、200、100 ps，忽略 pipeline-register overhead。Pipeline clock 是多少？',
      steps: ['列出五個 stage latency。', 'Clock 必須容納最慢 stage。', '最大值是 ID 的 250 ps。'],
      answer: '250 ps；不能把五段相加，也不能把 IF+MEM 相加。',
    },
    {
      prompt: 'ADD x1,x2,x3 後立刻 SUB x4,x1,x5。這是哪種 hazard？',
      steps: [
        'SUB 需要讀 x1。',
        'x1 由前一條 ADD 寫入。',
        '後讀依賴前寫，因此是 RAW。',
        '若 ADD result 已在 EX/MEM，可依 datapath forwarding 到 SUB 的 EX input。',
      ],
      answer: 'RAW data hazard；是否 stall 取決於 forwarding path 與 result 可用時間。',
    },
    {
      prompt:
        '為何同一段程式在「同週期可先寫 WB 再讀 ID」與「必須下一週期才能讀」兩種模型下，NOP 數會不同？',
      steps: [
        '前一模型允許 consumer 的 ID 與 producer 的 WB 同欄。',
        '後一模型要求 consumer ID 移到下一欄。',
        '每段 register dependency 可能因此多一個 bubble。',
      ],
      answer: 'Register-file timing 是排程前提；未明示時不能假定唯一 NOP 數。',
    },
  ],
  commonPitfalls: [
    '把 pipelining 提高 throughput 說成一定縮短單一 instruction latency。',
    '沒先確認同週期 register write/read 語意就直接套固定 NOP 數。',
    '把 forwarding 誤解為任何 dependency 都不需要 stall，忽略 load-use。',
    '只看題庫現有 answer 字母，沒有檢查 open/multiple-select 題型與解析矛盾。',
  ],
  sourceRefs: ['src-cs-arch-patterson-hennessy-2e', 'src-cs-arch-riscv-unprivileged'],
  pastPaperRefs: evidence.map((item) => item.questionId),
  reviewStatus: 'draft',
  publication: {
    publishEligible: false,
    blockers: ['候選來源尚未完成 review', '六題答案皆未核准 auto-grade', '兩題仍 disputed'],
  },
}

const lessons = {
  schemaVersion: 1,
  subjectId: 'cs-arch',
  status: 'draft',
  contentPolicy: '原創教學草稿；考古題只作 evidence boundary，答案非官方且未核准自動判分。',
  counts: { lessons: 1, coveredSubtopics: 3, coveredQuestions: evidence.length },
  lessons: [lesson],
}

const cardRows = [
  [
    'pipeline-foundations-01',
    'cs-arch-pipeline-foundations',
    'Pipeline 主要改善 latency 還是 throughput？',
    '主要改善 steady-state throughput；單一 instruction 仍需跨越各 stages。',
    '把整條線填滿後可頻繁完成工作，不代表第一件工作更早完成。',
    [evidence[3].questionId, evidence[4].questionId],
  ],
  [
    'pipeline-performance-01',
    'cs-arch-pipeline-performance',
    '忽略 pipeline-register overhead 時，pipeline clock cycle time 如何決定？',
    '取所有 stage latency 的最大值。',
    '每次推進都必須等最慢 stage 完成。',
    [evidence[0].questionId, evidence[3].questionId, evidence[4].questionId],
  ],
  [
    'pipeline-performance-02',
    'cs-arch-pipeline-performance',
    'Data memory utilization 如何由 instruction mix 估算？',
    '在無 stall 的簡化模型下，加總會使用 data memory 的 instruction 比例，例如 load+store。',
    'Instruction fetch memory 與 data memory 必須依題目架構分開看。',
    [evidence[3].questionId, evidence[4].questionId],
  ],
  [
    'pipeline-hazard-01',
    'cs-arch-pipeline-hazards-forwarding',
    '什麼是 RAW data hazard？',
    '後續 instruction 要讀取前一 instruction 尚未可用的寫入結果。',
    '先標 producer/consumer register，再比較 result available 與 operand needed 的 cycle。',
    [evidence[0].questionId, evidence[1].questionId],
  ],
  [
    'pipeline-forwarding-01',
    'cs-arch-pipeline-hazards-forwarding',
    'Forwarding 為何能減少 stall？',
    '它把已產生的 result 從 pipeline register 直接送到後續 EX input，省去等待 register-file write-back。',
    'Forwarding 不會讓尚未完成的 load data 提早出現。',
    [evidence[0].questionId],
  ],
  [
    'pipeline-load-use-01',
    'cs-arch-pipeline-hazards-forwarding',
    '為何 load-use hazard 即使有 forwarding 仍常需 bubble？',
    'Load data 通常到 MEM 後才可用，而緊鄰 consumer 可能在下一 cycle 的 EX 就需要它。',
    '實際 stall 數仍以題目 datapath 與 timing 為準。',
    [evidence[0].questionId, evidence[5].questionId],
  ],
  [
    'pipeline-nop-01',
    'cs-arch-pipeline-hazards-forwarding',
    '沒有 hazard detection 與 forwarding 時，插入 NOP 前先確認哪項假設？',
    '先確認 register file 是否允許同一 cycle 先 WB write、後 ID read。',
    '這個假設可能讓每段 dependency 相差一個 NOP；112 年候選題因此維持 disputed。',
    [evidence[2].questionId],
  ],
  [
    'pipeline-delay-slot-01',
    'cs-arch-pipeline-hazards-forwarding',
    '忽略 load delay slot 時，緊鄰 consumer 可能讀到什麼？',
    '可能讀到 destination register 的舊值，而不是尚未完成載入的新值。',
    '114 年第 13 題中 x3 舊值為 24，因此 add 得到 48。此答案仍是非官方候選。',
    [evidence[5].questionId],
  ],
]

const cards = {
  schemaVersion: 1,
  subjectId: 'cs-arch',
  status: 'draft',
  generationPolicy: '只從本 draft lesson 衍生；保留封閉 sourceRefs 與 candidate pastPaperRefs。',
  totalCards: cardRows.length,
  cards: cardRows.map(([slug, subtopicId, front, back, explanation, pastPaperRefs]) => ({
    id: `card-cs-arch-${slug}`,
    lessonId,
    subtopicId,
    front,
    back,
    explanation,
    sourceRefs: lesson.sourceRefs,
    pastPaperRefs,
    reviewStatus: 'draft',
  })),
}

const outputs = {
  'public/data/cs-arch-concept-master.json': conceptMaster,
  'public/data/cs-arch-question-metadata.json': questionMetadata,
  'public/data/cs-arch-answer-review.json': answerReview,
  'public/data/cs-arch-source-registry.json': sourceRegistry,
  'public/data/cs-arch-lessons.json': lessons,
  'public/data/cs-arch-concept-cards.json': cards,
}

const write = process.argv.includes('--write')
let stale = false
for (const [path, value] of Object.entries(outputs)) {
  const expected = stableJson(value)
  if (write) {
    fs.writeFileSync(path, expected)
  } else if (!fs.existsSync(path) || fs.readFileSync(path, 'utf8') !== expected) {
    console.error(`STALE ${path}`)
    stale = true
  }
}

if (stale) process.exitCode = 1
else
  process.stdout.write(
    `${write ? 'Wrote' : 'Verified'} ${Object.keys(outputs).length} cs-arch Pipeline artifacts.\n`
  )
