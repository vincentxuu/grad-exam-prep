import crypto from 'node:crypto'
import fs from 'node:fs'

const write = process.argv.includes('--write')
const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const questions = readJson('public/data/questions.json').questions
const answers = readJson('public/data/answers.json').answers
const byId = new Map(questions.map((question) => [question.id, question]))

const scope = {
  applicableYears: [114, 115],
  notApplicableYears: [106, 107, 108, 109, 110, 111, 112, 113],
  notApplicableReason:
    '106–113 學年度資訊管理學研究所招生筆試未設獨立統計考科；官方索引與各年完整 MIS 卷均無統計題，因此不是缺卷。',
  firstAppearance:
    '114 學年度統計題首次出現在資訊管理導論合科卷；115 學年度官方科名改為資訊管理導論與統計學。',
}

const conceptMaster = {
  schemaVersion: 1,
  subjectId: 'im-stat',
  status: 'reviewed',
  coverage: '114-115-past-paper-slice-plus-prerequisites',
  examScope: scope,
  topics: [
    {
      id: 'im-stat-probability',
      title: '機率與隨機變數',
      subtopics: [
        {
          id: 'im-stat-probability-expectation-variance',
          title: '期望值與變異數',
          kind: 'prerequisite',
        },
        { id: 'im-stat-probability-joint-pmf', title: '聯合與邊際 PMF', kind: 'past_paper_backed' },
        {
          id: 'im-stat-probability-transformations',
          title: '離散變數轉換',
          kind: 'past_paper_backed',
        },
      ],
    },
    {
      id: 'im-stat-estimation',
      title: '估計量',
      subtopics: [
        { id: 'im-stat-estimation-unbiasedness', title: '不偏性', kind: 'past_paper_backed' },
        { id: 'im-stat-estimation-variance', title: '估計量變異數', kind: 'past_paper_backed' },
        { id: 'im-stat-estimation-efficiency', title: '最適權重與效率', kind: 'past_paper_backed' },
      ],
    },
    {
      id: 'im-stat-regression',
      title: '迴歸與檢定',
      subtopics: [
        {
          id: 'im-stat-inference-hypothesis-workflow',
          title: '假設檢定共同流程',
          kind: 'prerequisite',
        },
        { id: 'im-stat-regression-multiple', title: '多元迴歸輸出', kind: 'past_paper_backed' },
        { id: 'im-stat-regression-t-f-tests', title: 't 與聯合 F 檢定', kind: 'past_paper_backed' },
      ],
    },
    {
      id: 'im-stat-categorical',
      title: '類別資料分析',
      subtopics: [
        {
          id: 'im-stat-categorical-contingency',
          title: '列聯表與期望次數',
          kind: 'past_paper_backed',
        },
        {
          id: 'im-stat-categorical-chi-square',
          title: '卡方獨立性檢定',
          kind: 'past_paper_backed',
        },
      ],
    },
  ],
}

const topicDetails = {
  'im-stat-probability': {
    importance: 5,
    objectives: [
      '計算離散隨機變數的期望值與變異數',
      '由聯合分配進行轉換與邊際化',
      '檢查 PMF 的 support 與正規化',
    ],
    keywords: {
      'im-stat-probability-expectation-variance': [
        'expectation',
        'variance',
        'linearity',
        'independence',
      ],
      'im-stat-probability-joint-pmf': ['joint PMF', 'marginal PMF', 'support', 'normalization'],
      'im-stat-probability-transformations': [
        'random-variable transformation',
        'preimage',
        'many-to-one mapping',
      ],
    },
  },
  'im-stat-estimation': {
    importance: 5,
    objectives: ['以期望值判斷估計量不偏性', '計算線性估計量變異數', '比較權重選擇與估計效率'],
    keywords: {
      'im-stat-estimation-unbiasedness': ['unbiased estimator', 'weights sum', 'bias'],
      'im-stat-estimation-variance': ['estimator variance', 'weighted mean', 'covariance'],
      'im-stat-estimation-efficiency': ['efficiency', 'minimum variance', 'optimal weights'],
    },
  },
  'im-stat-regression': {
    importance: 5,
    objectives: ['依序完成假設檢定決策', '解讀多元迴歸摘要', '區分單一係數 t 檢定與聯合 F 檢定'],
    keywords: {
      'im-stat-inference-hypothesis-workflow': [
        'null hypothesis',
        'p-value',
        'significance level',
        'decision',
      ],
      'im-stat-regression-multiple': [
        'multiple regression',
        'adjusted R-squared',
        'residual degrees of freedom',
      ],
      'im-stat-regression-t-f-tests': ['coefficient t-test', 'joint F-test', 'standard error'],
    },
  },
  'im-stat-categorical': {
    importance: 4,
    objectives: [
      '由列聯表計算獨立性下期望次數',
      '計算 Pearson 卡方統計量與自由度',
      '在限制內陳述類別變數關聯',
    ],
    keywords: {
      'im-stat-categorical-contingency': ['contingency table', 'observed count', 'expected count'],
      'im-stat-categorical-chi-square': ['chi-square', 'independence test', 'degrees of freedom'],
    },
  },
}
for (const topic of conceptMaster.topics) {
  const details = topicDetails[topic.id]
  topic.importance = details.importance
  topic.status = 'reviewed'
  topic.learningObjectives = details.objectives.map((statement, index) => ({
    id: `${topic.id}-lo-${index + 1}`,
    statement,
  }))
  topic.subtopics = topic.subtopics.map((subtopic) => ({
    ...subtopic,
    topicId: topic.id,
    keywords: details.keywords[subtopic.id],
    status: 'reviewed',
  }))
}

const sources = {
  schemaVersion: 1,
  subjectId: 'im-stat',
  status: 'reviewed',
  policy: '原始 PDF 決定題面；公開教材只支撐概念與推導。所有 worked solutions 均非官方答案。',
  sources: [
    {
      id: 'src-im-stat-ntu-114-pdf',
      title: '114 學年度台大資管所招生筆試原卷',
      author: '國立臺灣大學',
      type: 'official-guidance',
      publisher: '國立臺灣大學圖書館',
      url: 'https://exam.lib.ntu.edu.tw/graduate?year=114&tid=資訊管理學研究所&title=',
      paths: ['public/papers/pp-im-stat-114.pdf'],
      sha256: 'bb31e0ec75ff9ca84715465de5f4cf2746bbac9e2eadf6ae9c9c7be9bb618a34',
      scope: ['official-question-text', 'pages-2-3', 'questions-4-5'],
      usage: 'question-evidence-only',
      status: 'reviewed',
    },
    {
      id: 'src-im-stat-ntu-115-pdf',
      title: '115 學年度台大資管所招生筆試原卷',
      author: '國立臺灣大學',
      type: 'official-guidance',
      publisher: '國立臺灣大學圖書館',
      url: 'https://exam.lib.ntu.edu.tw/graduate?year=115&tid=資訊管理學研究所&title=',
      paths: ['public/papers/pp-im-stat-115.pdf'],
      sha256: '07ac6f84ecf5ca77c6338b5d7705d9e5c5915118f0a037946ebccda674476479',
      scope: ['official-question-text', 'page-2', 'questions-3-5'],
      usage: 'question-evidence-only',
      status: 'reviewed',
    },
    {
      id: 'src-im-stat-openintro',
      title: 'OpenIntro Statistics, Fourth Edition',
      author: 'Diez, Barr, Cetinkaya-Rundel',
      publisher: 'OpenIntro',
      type: 'book',
      url: 'https://www.openintro.org/book/os/',
      scope: ['probability', 'inference', 'regression', 'contingency-tables'],
      usage: 'conceptual-summary-and-worked-examples',
      status: 'reviewed',
    },
    {
      id: 'src-im-stat-nist-handbook',
      title: 'NIST/SEMATECH e-Handbook of Statistical Methods',
      author: 'NIST/SEMATECH',
      publisher: 'National Institute of Standards and Technology',
      type: 'official-guidance',
      url: 'https://www.itl.nist.gov/div898/handbook/',
      scope: ['regression', 'hypothesis-testing', 'chi-square'],
      usage: 'definitions-method-boundaries-and-cross-check',
      status: 'reviewed',
    },
    {
      id: 'src-im-stat-psu-414',
      title: 'STAT 414: Introduction to Probability Theory',
      author: 'Penn State Department of Statistics',
      publisher: 'Penn State Eberly College of Science',
      type: 'course',
      url: 'https://online.stat.psu.edu/stat414/',
      scope: ['discrete-random-variables', 'joint-distributions', 'expectation', 'variance'],
      usage: 'prerequisite-and-probability-lesson-support',
      status: 'reviewed',
    },
    {
      id: 'src-im-stat-psu-415',
      title: 'STAT 415: Introduction to Mathematical Statistics',
      author: 'Penn State Department of Statistics',
      publisher: 'Penn State Eberly College of Science',
      type: 'course',
      url: 'https://online.stat.psu.edu/stat415/',
      scope: ['estimators', 'unbiasedness', 'variance', 'efficiency'],
      usage: 'estimation-lesson-support',
      status: 'reviewed',
    },
  ],
}

const questionSpecs = [
  {
    id: 'q-pp-im-stat-114-4',
    page: 2,
    concepts: ['im-stat-regression-multiple', 'im-stat-regression-t-f-tests'],
    rubric: [
      ['adjusted-r2', 5, '寫出 adjusted R² 公式並代入 n=440、k=3、R²=0.170，得到約 0.1643。'],
      ['df-and-t', 4, '算出殘差自由度 436，並以 7.1943/1.092 得截距 t≈6.59。'],
      ['joint-f-test', 6, '正確寫出 H0/H1，以 p=1.52×10^-17<0.05 拒絕 H0，且不宣稱因果。'],
    ],
  },
  {
    id: 'q-pp-im-stat-114-5',
    page: 3,
    concepts: ['im-stat-estimation-unbiasedness', 'im-stat-estimation-variance'],
    rubric: [
      ['weight-sums', 6, '利用 T 為 5 的倍數，算出 Σg(i)=3T、Σg(i)^2=11T。'],
      ['unbiased', 6, '由期望值線性性證明 E[m]=μ。'],
      ['variance', 8, '利用獨立性得到 Var(m)=11σ²/(9T)。'],
    ],
  },
  {
    id: 'q-pp-im-stat-115-3',
    page: 2,
    concepts: ['im-stat-probability-joint-pmf', 'im-stat-probability-transformations'],
    rubric: [
      ['normalization', 5, '列出六個 support 點的權重並以總和 12 得 c=12。'],
      ['transform', 5, '逐點映射到 (Y1,Y2)，合併重複像點，機率總和維持 1。'],
      ['marginal', 5, '對 Y2 加總，得到 Y1 的 -1、0、1、2 邊際機率。'],
    ],
  },
  {
    id: 'q-pp-im-stat-115-4',
    page: 2,
    concepts: [
      'im-stat-estimation-unbiasedness',
      'im-stat-estimation-variance',
      'im-stat-estimation-efficiency',
    ],
    rubric: [
      ['unbiased', 10, '檢查三個估計量權重和皆為 1，因此皆不偏。'],
      ['alpha', 5, '建立 Var(m2)=σ²(1+α²)/(1+α)² 並得 α=1。'],
      ['beta', 5, '建立 Var(m3)=σ²(5+β²)/(3+β)² 並得 β=5/3。'],
    ],
  },
  {
    id: 'q-pp-im-stat-115-5',
    page: 2,
    concepts: ['im-stat-categorical-contingency', 'im-stat-categorical-chi-square'],
    rubric: [
      ['hypotheses', 3, 'H0 為購買與玩家等級獨立，H1 為不獨立。'],
      ['expected', 4, '依 row total×column total/grand total 得六格期望次數。'],
      ['statistic', 5, '算出 χ²≈6.42、df=2。'],
      ['decision', 3, '以 6.42>5.99 拒絕 H0，只陳述關聯、不推論因果。'],
    ],
  },
]

const metadataQuestions = questionSpecs.map((spec) => {
  const question = byId.get(spec.id)
  if (!question) throw new Error(`Missing canonical question ${spec.id}`)
  const primarySubtopicId = spec.concepts[0]
  const topicId = conceptMaster.topics.find((topic) =>
    topic.subtopics.some((subtopic) => subtopic.id === primarySubtopicId)
  )?.id
  return {
    questionId: spec.id,
    paperId: question.paperId,
    year: question.year,
    questionNumber: question.number,
    originQuestionTextSha256: sha256(question.text),
    evidencePages: [spec.page],
    responseType: 'open_ended',
    gradingMode: 'self_review',
    topicId,
    primarySubtopicId,
    conceptIds: spec.concepts,
    rubricItems: spec.rubric.map(([id, points, criterion]) => ({
      id,
      label: id
        .split('-')
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(' '),
      criteria: [criterion],
      points,
    })),
    publication: {
      browseEligible: true,
      practiceEligible: true,
      autoGradeEligible: false,
      fullMockEligible: false,
    },
    blockers: ['非官方解答', '申論題須依步驟 rubric 自評，不可用單一字母答案判分'],
  }
})

const metadata = {
  schemaVersion: 1,
  subjectId: 'im-stat',
  status: 'reviewed',
  examScope: scope,
  totalQuestions: metadataQuestions.length,
  questionPolicy: '只收錄 114–115 官方 PDF 的五題統計大題；106–113 明示不適用且不得合成題目。',
  questions: metadataQuestions,
}

const answerReviewQuestions = questionSpecs.map((spec) => ({
  questionId: spec.id,
  status: 'technical_reviewed',
  official: false,
  answerType: 'non_official_worked_solution',
  approvedAnswer: null,
  reviewCount: 2,
  reviewMethod: ['依官方 PDF 題面獨立推導', '以公式、數值與邊界條件逐步交叉覆核'],
  workedSolution: answers[spec.id]?.explanation,
  rubricItems: metadataQuestions.find((item) => item.questionId === spec.id).rubricItems,
  practiceEligible: true,
  autoGradeEligible: false,
  fullMockEligible: false,
  unresolvedIssues: ['無官方答案 key；等價推導須由學習者依 rubric 自評'],
  sourceRefs: [spec.id.includes('-114-') ? 'src-im-stat-ntu-114-pdf' : 'src-im-stat-ntu-115-pdf'],
}))

const answerReview = {
  schemaVersion: 1,
  subjectId: 'im-stat',
  status: 'reviewed',
  officialAnswerKeyAvailable: false,
  totalQuestions: 5,
  counts: { technicalReviewed: 5, selfReviewOnly: 5, autoGradeEligible: 0 },
  questions: answerReviewQuestions,
}

const practiceStatus = {
  schemaVersion: 1,
  subjectId: 'im-stat',
  status: 'reviewed',
  counts: { selfReviewOnly: 5, autoGradeEligible: 0 },
  questions: Object.fromEntries(
    questionSpecs.map((spec) => [
      spec.id,
      {
        status: 'self_review_only',
        practiceEligible: true,
        autoGradeEligible: false,
        fullMockEligible: false,
        note: '本題為申論／計算題；請先作答，再依非官方 worked solution 與步驟 rubric 自評。',
      },
    ])
  ),
}

const scenario = (title, hook, predict, mapping, boundary, examCues) => ({
  title,
  hook,
  predict,
  mapping,
  boundary,
  examCues,
})
const section = (title, body, bullets) => ({ title, body, bullets })
const lesson = (data) => ({
  reviewStatus: 'reviewed',
  minimumPastPaperRefs: data.kind === 'prerequisite' ? 0 : 1,
  ...data,
})

const lessonsList = [
  lesson({
    id: 'lesson-im-stat-prereq-expectation-variance',
    kind: 'prerequisite',
    subtopicId: 'im-stat-probability-expectation-variance',
    coveredSubtopicIds: ['im-stat-probability-expectation-variance'],
    title: '先備：把平均與波動拆開看',
    summary: '先建立期望值、變異數、線性組合與獨立性的運算骨架，供 PMF 與估計量課使用。',
    estimatedMinutes: 24,
    evidenceNote: '這是必要先備課，不宣稱由 114–115 的某一題直接完整覆蓋。',
    sourceRefs: ['src-im-stat-openintro', 'src-im-stat-psu-414'],
    pastPaperRefs: [],
    learningObjectives: [
      '計算離散變數期望值',
      '分辨變異數與標準差',
      '處理獨立變數線性組合的變異數',
    ],
    learningScenario: scenario(
      '多次量體溫的讀數',
      '同一支溫度計每次讀值略有不同；中心位置與晃動程度是兩件事。',
      '若把兩次讀數相加，中心與波動會如何改變？',
      [
        { everyday: '長期平均讀數', technical: '期望值 E(Y)' },
        { everyday: '讀值上下晃動', technical: '變異數 Var(Y)' },
        { everyday: '把讀數乘倍率', technical: 'Var(aY)=a²Var(Y)' },
        { everyday: '兩次誤差互不影響', technical: '獨立時 covariance 為 0' },
      ],
      '實際量測可能有系統性偏誤與相關誤差，不能一律當作 iid。',
      ['E(aX+b)', 'Var(aX)', 'independent sample', 'σ²']
    ),
    sections: [
      section('中心', '期望值是依機率加權的長期平均。', ['E(aX+b)=aE(X)+b']),
      section('波動', '變異數衡量離中心的平方距離。', ['Var(aX)=a²Var(X)']),
      section('相加', '變異數相加需要處理 covariance。', ['獨立時 covariance=0']),
      section('檢查', '先確認權重、單位與獨立假設。', ['標準差與原變數同單位']),
    ],
    workedExamples: [
      { prompt: 'E(Y)=μ、Var(Y)=σ²，求 E(2Y+1)。', steps: ['套線性性'], answer: '2μ+1' },
      {
        prompt: 'Y1,Y2 iid，求 Var((Y1+Y2)/2)。',
        steps: ['獨立所以變異數相加', '係數平方'],
        answer: 'σ²/2',
      },
    ],
    commonPitfalls: ['把 Var(aY) 寫成 aVar(Y)', '未確認獨立就直接加變異數', '把標準差和變異數混用'],
  }),
  lesson({
    id: 'lesson-im-stat-prereq-hypothesis-workflow',
    kind: 'prerequisite',
    subtopicId: 'im-stat-inference-hypothesis-workflow',
    coveredSubtopicIds: ['im-stat-inference-hypothesis-workflow'],
    title: '先備：假設檢定是一條決策流程',
    summary: '把 H0/H1、統計量、參考分配、p 值與結論串成同一條不跳步的流程。',
    estimatedMinutes: 22,
    evidenceNote: '這是迴歸 F 檢定與卡方檢定的共同先備，不代表歷屆題涵蓋所有檢定。',
    sourceRefs: ['src-im-stat-openintro', 'src-im-stat-nist-handbook'],
    pastPaperRefs: [],
    learningObjectives: ['寫出可檢驗的 H0/H1', '以顯著水準作決策', '避免把顯著關聯說成因果'],
    learningScenario: scenario(
      '煙霧警報器的決策',
      '警報器先假設沒有火災，再看感測訊號是否異常到足以推翻原假設。',
      '警報響了，能否直接斷言起火原因？',
      [
        { everyday: '先假設沒有火災', technical: '虛無假設 H0' },
        { everyday: '感測器異常程度', technical: 'test statistic' },
        { everyday: '允許的誤報門檻', technical: 'significance level α' },
        { everyday: '警報後的決策', technical: 'reject / fail to reject H0' },
      ],
      '統計檢定量化資料與 H0 的不相容程度，不會自動證明因果或 H1 為真。',
      ['H0/H1', 'α=0.05', 'p-value', 'reject H0']
    ),
    sections: [
      section('立假設', '先寫母體層次命題。', ['H0 含等號']),
      section('選統計量', '依資料型態選參考分配。', ['確認假設條件']),
      section('作決策', '比較 p 與 α 或統計量與臨界值。', ['p<α 才拒絕 H0']),
      section('下結論', '結論要回到題目語境。', ['不把關聯寫成因果']),
    ],
    workedExamples: [
      { prompt: 'p=0.03、α=0.05。', steps: ['比較 p 與 α'], answer: '拒絕 H0' },
      { prompt: 'p=0.12、α=0.05。', steps: ['比較 p 與 α'], answer: '未能拒絕 H0，不是證明 H0' },
    ],
    commonPitfalls: ['把未拒絕寫成接受 H0', '先看答案再補 H0/H1', '把顯著關聯宣稱為因果'],
  }),
  lesson({
    id: 'lesson-im-stat-pmf-transformations',
    kind: 'past_paper_micro_lesson',
    subtopicId: 'im-stat-probability-joint-pmf',
    coveredSubtopicIds: ['im-stat-probability-joint-pmf', 'im-stat-probability-transformations'],
    title: '把聯合機率表搬到新座標',
    summary: '用 115-3 練習正規化、離散變數轉換、合併重複像點與邊際化。',
    estimatedMinutes: 32,
    sourceRefs: ['src-im-stat-ntu-115-pdf', 'src-im-stat-openintro', 'src-im-stat-psu-414'],
    pastPaperRefs: ['q-pp-im-stat-115-3'],
    learningObjectives: [
      '由 support 權重求正規化常數',
      '逐點完成離散變數轉換',
      '由聯合 PMF 加總出邊際 PMF',
    ],
    learningScenario: scenario(
      '抽獎券換籃子',
      '每個舊格放著不同張數的抽獎券，新規則會把它們搬到標有 Y1、Y2 的籃子。',
      '兩個舊格搬到同一個新籃子時，機率應如何處理？',
      [
        { everyday: '舊格子的票數', technical: '未正規化權重' },
        { everyday: '全部票數', technical: 'normalizing constant c' },
        { everyday: '依新標籤搬票', technical: '變數轉換 mapping' },
        { everyday: '同籃票數相加', technical: 'preimage probabilities sum' },
      ],
      '連續型變數轉換還要處理密度與 Jacobian，不能直接沿用數票模型。',
      ['joint PMF', 'support', 'normalizing constant', 'marginal']
    ),
    sections: [
      section('列 support', '先列出所有可能輸入點。', ['support 外機率為 0']),
      section('正規化', '權重除以總和。', ['總機率必為 1']),
      section('轉換', '逐點算新座標。', ['重複像點要合併']),
      section('邊際化', '固定 Y1 對 Y2 加總。', ['最後再次檢查總和']),
    ],
    workedExamples: [
      { prompt: '六點權重總和為 12。', steps: ['令總機率為 1'], answer: 'c=12' },
      {
        prompt: '兩個舊點映到同一新點。',
        steps: ['找完整 preimage', '機率相加'],
        answer: '新點機率為兩者之和',
      },
    ],
    commonPitfalls: ['漏列零權重 support 點', '一對多或多對一時未合併', '邊際化加錯維度'],
  }),
  lesson({
    id: 'lesson-im-stat-unbiased-efficient-estimators',
    kind: 'past_paper_micro_lesson',
    subtopicId: 'im-stat-estimation-unbiasedness',
    coveredSubtopicIds: [
      'im-stat-estimation-unbiasedness',
      'im-stat-estimation-variance',
      'im-stat-estimation-efficiency',
    ],
    title: '多支有雜訊的溫度計怎麼加權',
    summary: '用 114-5 與 115-4 練習權重和、不偏性、估計量變異數與最小變異權重。',
    estimatedMinutes: 38,
    sourceRefs: ['src-im-stat-ntu-114-pdf', 'src-im-stat-ntu-115-pdf', 'src-im-stat-psu-415'],
    pastPaperRefs: ['q-pp-im-stat-114-5', 'q-pp-im-stat-115-4'],
    learningObjectives: [
      '由權重和判斷不偏性',
      '正確計算加權估計量變異數',
      '以微分或對稱性尋找最適權重',
    ],
    learningScenario: scenario(
      '合併多支溫度計',
      '每支溫度計都在真實溫度附近晃動，權重代表你多相信哪一支。',
      '權重總和為 1 是否已保證波動最小？',
      [
        { everyday: '每支讀值', technical: 'iid observations Yi' },
        { everyday: '採信程度', technical: 'weights wi' },
        { everyday: '刻度不整體偏移', technical: 'Σwi=1 使估計量不偏' },
        { everyday: '讀數最穩定', technical: 'minimize Var(estimator)' },
      ],
      '若儀器變異數不同或彼此相關，等權重不一定最佳；需使用完整 covariance。',
      ['unbiased estimator', 'Σweights=1', 'Var(weighted mean)', 'efficiency']
    ),
    sections: [
      section('先看期望值', '權重和控制中心位置。', ['Σwi=1']),
      section('再算變異數', '獨立時用權重平方加總。', ['Var=σ²Σwi²']),
      section('找最小值', '可用微分或 Cauchy。', ['等品質 iid 常導向平均']),
      section('核對限制', '先確認 iid 與有限變異數。', ['相關時要加 covariance']),
    ],
    workedExamples: [
      {
        prompt: 'g(i) 每五項為 2,3,4,5,1。',
        steps: ['Σg=3T', 'Σg²=11T'],
        answer: 'Var(m)=11σ²/(9T)',
      },
      { prompt: 'm2=(Y1+αY2)/(1+α)。', steps: ['寫變異數', '微分'], answer: 'α=1' },
    ],
    commonPitfalls: ['把原卷分母看成 T', '權重和為 1 就誤認一定最有效率', '漏掉權重平方'],
  }),
  lesson({
    id: 'lesson-im-stat-regression-dashboard',
    kind: 'past_paper_micro_lesson',
    subtopicId: 'im-stat-regression-multiple',
    coveredSubtopicIds: ['im-stat-regression-multiple', 'im-stat-regression-t-f-tests'],
    title: '讀懂多元迴歸儀表板',
    summary: '用 114-4 解讀 adjusted R²、殘差自由度、係數 t 值與整體 F 檢定。',
    estimatedMinutes: 34,
    sourceRefs: ['src-im-stat-ntu-114-pdf', 'src-im-stat-openintro', 'src-im-stat-nist-handbook'],
    pastPaperRefs: ['q-pp-im-stat-114-4'],
    learningObjectives: [
      '由 n 與 k 算殘差自由度',
      '由 coef/std err 算 t 值',
      '區分單一係數 t 檢定與聯合 F 檢定',
    ],
    learningScenario: scenario(
      '垃圾量預測儀表板',
      '儀表板有多個旋鈕解釋家庭垃圾量，但多裝旋鈕不代表模型真的更好。',
      '哪個數字會對無用旋鈕扣分？整組旋鈕是否有用又看哪裡？',
      [
        { everyday: '每個旋鈕效果', technical: 'regression coefficient' },
        { everyday: '效果相對噪音', technical: 't=coef/std err' },
        { everyday: '對多裝旋鈕扣分', technical: 'adjusted R²' },
        { everyday: '整組旋鈕共同測試', technical: 'joint F-test' },
      ],
      '迴歸係數與顯著性不是因果證據；模型設定、共線性與資料品質仍需檢查。',
      ['Adj. R-squared', 'Df Residuals', 'coef/std err', 'Prob(F-statistic)']
    ),
    sections: [
      section('辨識 n 與 k', 'n 是樣本數，k 是斜率個數。', ['df residual=n-k-1']),
      section('adjusted R²', '比較不同複雜度模型。', ['使用 n、k、R²']),
      section('t 值', '係數除以標準誤。', ['不要拿 p 值當 t']),
      section('F 檢定', '檢查所有斜率是否共同為零。', ['p<0.05 拒絕 H0']),
    ],
    workedExamples: [
      { prompt: 'n=440,k=3,R²=.170。', steps: ['代 adjusted R² 公式'], answer: '約 .1643' },
      { prompt: 'coef=7.1943,se=1.092。', steps: ['相除'], answer: 't≈6.59' },
    ],
    commonPitfalls: [
      '把 Df Model 當殘差自由度',
      '把 individual t 與 joint F 混用',
      '把顯著係數解讀為因果',
    ],
  }),
  lesson({
    id: 'lesson-im-stat-chi-square-independence',
    kind: 'past_paper_micro_lesson',
    subtopicId: 'im-stat-categorical-contingency',
    coveredSubtopicIds: ['im-stat-categorical-contingency', 'im-stat-categorical-chi-square'],
    title: '座位分布是否真的互不相關',
    summary: '用 115-5 從列聯表建立期望次數、卡方統計量、自由度與檢定結論。',
    estimatedMinutes: 30,
    sourceRefs: ['src-im-stat-ntu-115-pdf', 'src-im-stat-openintro', 'src-im-stat-nist-handbook'],
    pastPaperRefs: ['q-pp-im-stat-115-5'],
    learningObjectives: [
      '由邊際合計計算期望次數',
      '計算 Pearson χ² 與自由度',
      '以臨界值作決策並正確敘述關聯',
    ],
    learningScenario: scenario(
      '商店時段與商品選擇',
      '店長想知道商品選擇是否與到店時段有關，先算兩者若獨立時每格應有多少人。',
      '觀察格與期望格差多少，才值得懷疑兩者有關？',
      [
        { everyday: '實際每格人數', technical: 'observed count O' },
        { everyday: '若互不相關應有的人數', technical: 'expected count E' },
        { everyday: '標準化後累積差距', technical: 'Σ(O-E)²/E' },
        { everyday: '表格可自由變動程度', technical: 'df=(r-1)(c-1)' },
      ],
      '顯著關聯不代表因果；期望次數過小、樣本不獨立或抽樣偏誤會破壞檢定。',
      ['contingency table', 'expected count', 'χ²', '(r-1)(c-1)']
    ),
    sections: [
      section('立假設', 'H0 是兩類別變數獨立。', ['H1 是不獨立']),
      section('算期望值', 'E=row total×column total/grand total。', ['各列各欄合計要吻合']),
      section('累積差距', '每格計算 (O-E)²/E。', ['全部格相加']),
      section('決策', '比較臨界值或 p 值。', ['只陳述關聯']),
    ],
    workedExamples: [
      { prompt: '2×3 表的自由度。', steps: ['(2-1)(3-1)'], answer: 'df=2' },
      { prompt: 'χ²=6.42，5% 臨界值 5.99。', steps: ['比較大小'], answer: '拒絕獨立假設' },
    ],
    commonPitfalls: ['以觀察值代替期望值當分母', '自由度用 rc', '拒絕獨立就宣稱因果'],
  }),
]

const lessons = {
  schemaVersion: 1,
  subjectId: 'im-stat',
  status: 'reviewed',
  examScope: scope,
  contentPolicy:
    '4 堂 micro-lessons 以官方 PDF 五題為 evidence；2 堂 prerequisite 明確不宣稱歷屆題背書。',
  counts: { lessons: 6, pdfBackedMicroLessons: 4, prerequisiteLessons: 2, coveredQuestions: 5 },
  lessons: lessonsList,
}

const cardSeeds = [
  [
    'expectation-linearity',
    'lesson-im-stat-prereq-expectation-variance',
    'im-stat-probability-expectation-variance',
    'E(aX+b) 等於？',
    'aE(X)+b',
    '期望值具線性性，不需要獨立。',
  ],
  [
    'variance-scale',
    'lesson-im-stat-prereq-expectation-variance',
    'im-stat-probability-expectation-variance',
    'Var(aX) 等於？',
    'a²Var(X)',
    '變異數使用倍率平方。',
  ],
  [
    'pmf-normalize',
    'lesson-im-stat-pmf-transformations',
    'im-stat-probability-joint-pmf',
    '未正規化權重如何變成 PMF？',
    '每個權重除以權重總和',
    '最後總機率必須為 1。',
  ],
  [
    'pmf-marginal',
    'lesson-im-stat-pmf-transformations',
    'im-stat-probability-joint-pmf',
    '由 joint PMF 求 Y1 marginal？',
    '固定 Y1，對所有 Y2 加總',
    '加總方向由要保留的變數決定。',
  ],
  [
    'transform-preimage',
    'lesson-im-stat-pmf-transformations',
    'im-stat-probability-transformations',
    '多個舊點映到同一新點時？',
    '把所有 preimage 的機率相加',
    '不能只保留其中一點。',
  ],
  [
    'transform-check',
    'lesson-im-stat-pmf-transformations',
    'im-stat-probability-transformations',
    '離散轉換完成後最基本檢查？',
    '新 support 的機率總和為 1',
    '也要確認沒有遺漏舊 support。',
  ],
  [
    'unbiased-weights',
    'lesson-im-stat-unbiased-efficient-estimators',
    'im-stat-estimation-unbiasedness',
    'iid 平均數 μ 的線性估計量何時不偏？',
    '權重和等於 1',
    'E(ΣwiYi)=μΣwi。',
  ],
  [
    'unbiased-not-efficient',
    'lesson-im-stat-unbiased-efficient-estimators',
    'im-stat-estimation-unbiasedness',
    '不偏是否保證最小變異數？',
    '不保證',
    '不偏只約束中心，不約束波動。',
  ],
  [
    'weighted-variance',
    'lesson-im-stat-unbiased-efficient-estimators',
    'im-stat-estimation-variance',
    '獨立同變異 Yi 的加權和變異數？',
    'σ²Σwi²',
    '獨立使 covariance 項為 0。',
  ],
  [
    'periodic-weights',
    'lesson-im-stat-unbiased-efficient-estimators',
    'im-stat-estimation-variance',
    '114-5 的 g 循環為 2,3,4,5,1，Σg²？',
    '11T',
    '每五項平方和 55，共 T/5 組。',
  ],
  [
    'equal-weight',
    'lesson-im-stat-unbiased-efficient-estimators',
    'im-stat-estimation-efficiency',
    'iid 等變異且權重和固定時，何者通常最穩？',
    '等權重平均',
    '平方和在等權重時最小。',
  ],
  [
    'correlated-weight',
    'lesson-im-stat-unbiased-efficient-estimators',
    'im-stat-estimation-efficiency',
    '觀測彼此相關時，變異數還能只加 wi²σ² 嗎？',
    '不能，需加入 covariance',
    '這是溫度計比喻的邊界。',
  ],
  [
    'hypothesis-decision',
    'lesson-im-stat-prereq-hypothesis-workflow',
    'im-stat-inference-hypothesis-workflow',
    'p<α 時的決策？',
    '拒絕 H0',
    '代表資料與 H0 不相容程度達門檻。',
  ],
  [
    'hypothesis-fail',
    'lesson-im-stat-prereq-hypothesis-workflow',
    'im-stat-inference-hypothesis-workflow',
    'p≥α 能說 H0 已證明嗎？',
    '不能，只能說未能拒絕 H0',
    '檢定不是證明機制。',
  ],
  [
    'regression-df',
    'lesson-im-stat-regression-dashboard',
    'im-stat-regression-multiple',
    '含截距、k 個斜率的殘差自由度？',
    'n-k-1',
    '扣掉 k 個斜率和 1 個截距。',
  ],
  [
    'adjusted-r2',
    'lesson-im-stat-regression-dashboard',
    'im-stat-regression-multiple',
    'Adjusted R² 的用途？',
    '對加入更多變數施加複雜度懲罰',
    '不能只靠增加變數保證上升。',
  ],
  [
    'coefficient-t',
    'lesson-im-stat-regression-dashboard',
    'im-stat-regression-t-f-tests',
    '係數 t 值如何算？',
    'coef / standard error',
    '檢查單一係數相對於 0。',
  ],
  [
    'joint-f',
    'lesson-im-stat-regression-dashboard',
    'im-stat-regression-t-f-tests',
    '聯合 F 檢定的 H0？',
    '所有斜率係數同時為 0',
    '與單一係數 t 檢定不同。',
  ],
  [
    'expected-count',
    'lesson-im-stat-chi-square-independence',
    'im-stat-categorical-contingency',
    '獨立性下某格期望次數？',
    '列合計×欄合計÷總數',
    '算完應恢復原列欄合計。',
  ],
  [
    'contingency-input',
    'lesson-im-stat-chi-square-independence',
    'im-stat-categorical-contingency',
    '卡方獨立性檢定使用比例還是計數？',
    '以列聯表計數為輸入',
    '期望次數也是 count。',
  ],
  [
    'chi-square-stat',
    'lesson-im-stat-chi-square-independence',
    'im-stat-categorical-chi-square',
    'Pearson χ² 統計量？',
    'Σ(O-E)²/E',
    '每格差距依期望次數標準化。',
  ],
  [
    'chi-square-df',
    'lesson-im-stat-chi-square-independence',
    'im-stat-categorical-chi-square',
    'r×c 列聯表自由度？',
    '(r-1)(c-1)',
    '不是 rc。',
  ],
]

const lessonById = new Map(lessonsList.map((item) => [item.id, item]))
const cardsList = cardSeeds.map(([slug, lessonId, subtopicId, front, back, explanation]) => ({
  id: `card-im-stat-${slug}`,
  lessonId,
  subtopicId,
  front,
  back,
  explanation,
  sourceRefs: lessonById.get(lessonId).sourceRefs,
  pastPaperRefs: lessonById.get(lessonId).pastPaperRefs,
  reviewStatus: 'reviewed',
}))
const cards = {
  schemaVersion: 1,
  subjectId: 'im-stat',
  status: 'reviewed',
  totalCards: cardsList.length,
  generationPolicy: '只由 reviewed lessons 產生；prerequisite cards 不偽掛考古題。',
  cards: cardsList,
}

const srsCandidates = {
  schemaVersion: 1,
  subjectId: 'im-stat',
  status: 'curated_candidates',
  publishedToGlobalDeck: false,
  policy:
    '候選卡尚未寫入 flashcards.json；需經 product integration 與 migration review 後才能啟用。',
  totalCandidates: 18,
  candidates: cardsList
    .filter(
      (card) =>
        ![
          'card-im-stat-transform-check',
          'card-im-stat-correlated-weight',
          'card-im-stat-contingency-input',
          'card-im-stat-hypothesis-fail',
        ].includes(card.id)
    )
    .map((card) => ({
      id: `srs-candidate-${card.id}`,
      conceptCardId: card.id,
      subtopicId: card.subtopicId,
      prompt: card.front,
      answer: card.back,
      sourceRefs: card.sourceRefs,
      pastPaperRefs: card.pastPaperRefs,
      status: 'reviewed_candidate',
      schedulingProfile: 'concept-recall',
    })),
}
srsCandidates.totalCandidates = srsCandidates.candidates.length

const outputs = {
  'public/data/im-stat-concept-master.json': conceptMaster,
  'public/data/im-stat-source-registry.json': sources,
  'public/data/im-stat-question-metadata.json': metadata,
  'public/data/im-stat-answer-review.json': answerReview,
  'public/data/im-stat-practice-status.json': practiceStatus,
  'public/data/im-stat-lessons.json': lessons,
  'public/data/im-stat-concept-cards.json': cards,
  'public/data/im-stat-srs-candidates.json': srsCandidates,
}

let drift = false
for (const [path, value] of Object.entries(outputs)) {
  const rendered = `${JSON.stringify(value, null, 2)}\n`
  if (write) fs.writeFileSync(path, rendered)
  else if (!fs.existsSync(path) || fs.readFileSync(path, 'utf8') !== rendered) {
    process.stderr.write(`Artifact drift: ${path}\n`)
    drift = true
  }
}
if (drift) process.exit(1)
process.stdout.write(
  `${write ? 'Wrote' : 'Verified'} IM-STAT artifacts: 5 questions, 6 lessons, ${cardsList.length} cards, ${srsCandidates.totalCandidates} SRS candidates.`
)
