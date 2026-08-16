import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'public/data')
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const questionsRaw = readJson('public/data/questions.json')
const questions = (questionsRaw.questions ?? questionsRaw).filter((q) => q.subjectId === 'im-mis')

const topics = [
  {
    id: 'im-mis-strategy',
    title: 'IT 策略、價值與組織能力',
    importance: 5,
    objectives: [
      '用理論連結 IT 投資與企業績效',
      '比較環境、能力與投資組合的取捨',
      '以條件式論證提出策略建議',
    ],
    subtopics: [
      [
        'alignment-differentiation',
        'IT-business alignment 與差異化',
        ['alignment', 'differentiation', 'competitive strategy'],
      ],
      [
        'investment-value',
        'IT 投資、互補性資產與價值',
        ['investment', 'complementary assets', 'portfolio'],
      ],
      ['agility-environment', '環境不確定性與企業敏捷', ['agility', 'dynamism', 'munificence']],
      [
        'organization-economics',
        'IT 與組織邊界',
        ['transaction cost', 'agency', 'production function'],
      ],
    ],
  },
  {
    id: 'im-mis-platforms',
    title: '數位平台與電子商務',
    importance: 5,
    objectives: ['辨識平台各側與價值交換', '分析網路效應、補貼與治理', '把技術功能連回商業價值'],
    subtopics: [
      ['sharing-economy', '共享經濟與信任機制', ['sharing economy', 'trust', 'governance']],
      [
        'multisided-pricing',
        '多邊平台、網路效應與定價',
        ['multi-sided platform', 'cross-subsidy', 'network effect'],
      ],
      [
        'digital-markets-commerce',
        '數位市場與直播商務',
        ['digital market', 'switching cost', 'live commerce'],
      ],
    ],
  },
  {
    id: 'im-mis-enterprise',
    title: '企業系統、流程與知識',
    importance: 4,
    objectives: ['比較知識管理策略', '解釋企業流程與系統整合', '分析供應鏈資訊流與需求訊號'],
    subtopics: [
      [
        'knowledge-management',
        '知識編碼與人際連結',
        ['codification', 'personalization', 'knowledge network'],
      ],
      ['enterprise-processes', '企業系統與流程整合', ['ERP', 'process integration', 'BPR']],
      ['supply-chain', '推式與拉式供應鏈', ['push', 'pull', 'SCM']],
    ],
  },
  {
    id: 'im-mis-data-ai',
    title: '資料、分析與負責任 AI',
    importance: 5,
    objectives: ['描述資料與模型生命週期', '選擇合適的評估方法', '分析 AI 專案的治理與維運風險'],
    subtopics: [
      [
        'data-lifecycle',
        '資料生命週期與分析可行性',
        ['data lifecycle', 'data quality', 'feasibility'],
      ],
      ['model-evaluation-fairness', '模型評估、公平與漂移', ['evaluation', 'fairness', 'drift']],
      [
        'analytics-forecasting',
        '預測、社群分析與決策',
        ['forecasting', 'community detection', 'analytics'],
      ],
      [
        'ai-operations-governance',
        'AI 維運、導入與治理',
        ['MLOps', 'conversational AI', 'AI governance'],
      ],
    ],
  },
  {
    id: 'im-mis-development',
    title: '系統取得、敏捷交付與 UX',
    importance: 5,
    objectives: [
      '比較 build、buy、outsource 與 SaaS',
      '解釋敏捷角色與產出物',
      '用測試、需求與 UX 降低交付風險',
    ],
    subtopics: [
      [
        'acquisition-estimation',
        '系統取得與成本估算',
        ['build vs buy', 'COCOMO', 'function point'],
      ],
      ['agile-delivery', 'Scrum 與敏捷交付', ['Scrum', 'Sprint', 'backlog']],
      ['testing-quality', '測試層級與品質風險', ['unit test', 'integration test', 'UAT']],
      ['requirements-ux', '需求表達與使用者體驗', ['user story', 'use case', 'UCD']],
    ],
  },
  {
    id: 'im-mis-data-architecture',
    title: '資料架構與數位基礎設施',
    importance: 4,
    objectives: [
      '比較關聯式與 NoSQL 的取捨',
      '撰寫可驗證的 SQL 查詢',
      '分析開源授權與技術 sourcing',
    ],
    subtopics: [
      ['relational-nosql', '關聯式資料庫與 NoSQL', ['ACID', 'NoSQL', 'scalability']],
      ['sql-schema', 'SQL、schema 與查詢', ['SQL', 'join', 'group by']],
      ['oss-licensing', '開源軟體、授權與 sourcing', ['GPL', 'Apache License', 'open source']],
    ],
  },
  {
    id: 'im-mis-governance',
    title: '數位治理、隱私與永續',
    importance: 5,
    objectives: [
      '辨識隱私與責任風險',
      '把 ESG 主張連到可驗證機制',
      '分析供應商依賴、信任與治理控制',
    ],
    subtopics: [
      ['privacy-security', 'IoT、資料與隱私風險', ['privacy', 'IoT', 'security']],
      ['esg-accountability', 'ESG、揭露與問責', ['ESG', 'sustainability', 'accountability']],
      [
        'vendor-ai-governance',
        'AI 供應商、共競與信任治理',
        ['vendor risk', 'co-opetition', 'privacy by design'],
      ],
    ],
  },
].map((topic) => ({
  id: topic.id,
  title: topic.title,
  importance: topic.importance,
  status: 'reviewed',
  learningObjectives: topic.objectives.map((statement, i) => ({
    id: `${topic.id}-lo-${i + 1}`,
    statement,
  })),
  subtopics: topic.subtopics.map(([suffix, title, keywords]) => ({
    id: `${topic.id}-${suffix}`,
    topicId: topic.id,
    title,
    keywords,
    status: 'reviewed',
  })),
}))

const questionMap = {
  '106-1': 'im-mis-strategy-alignment-differentiation',
  '106-2': 'im-mis-platforms-sharing-economy',
  '106-3': 'im-mis-data-architecture-oss-licensing',
  '106-4': 'im-mis-data-architecture-relational-nosql',
  '107-1': 'im-mis-enterprise-knowledge-management',
  '107-2': 'im-mis-strategy-agility-environment',
  '107-3': 'im-mis-development-acquisition-estimation',
  '107-4': 'im-mis-data-architecture-sql-schema',
  '108-1': 'im-mis-strategy-organization-economics',
  '108-2': 'im-mis-data-ai-data-lifecycle',
  '108-3': 'im-mis-data-ai-model-evaluation-fairness',
  '108-4': 'im-mis-data-ai-model-evaluation-fairness',
  '109-1': 'im-mis-strategy-organization-economics',
  '109-2': 'im-mis-strategy-investment-value',
  '109-3': 'im-mis-platforms-multisided-pricing',
  '109-4': 'im-mis-data-ai-analytics-forecasting',
  '110-1': 'im-mis-platforms-sharing-economy',
  '110-2': 'im-mis-platforms-digital-markets-commerce',
  '110-3': 'im-mis-development-agile-delivery',
  '110-4': 'im-mis-data-ai-analytics-forecasting',
  '111-1': 'im-mis-strategy-investment-value',
  '111-2': 'im-mis-governance-privacy-security',
  '111-3': 'im-mis-development-testing-quality',
  '111-4': 'im-mis-development-requirements-ux',
  '112-1': 'im-mis-enterprise-supply-chain',
  '112-2': 'im-mis-strategy-investment-value',
  '112-3': 'im-mis-data-ai-ai-operations-governance',
  '112-4': 'im-mis-development-acquisition-estimation',
  '113-1': 'im-mis-data-ai-analytics-forecasting',
  '113-2': 'im-mis-strategy-agility-environment',
  '113-3': 'im-mis-data-ai-ai-operations-governance',
  '113-4': 'im-mis-governance-esg-accountability',
  '114-1': 'im-mis-platforms-digital-markets-commerce',
  '114-2': 'im-mis-strategy-investment-value',
  '114-3': 'im-mis-development-requirements-ux',
  '115-1': 'im-mis-data-ai-ai-operations-governance',
  '115-2': 'im-mis-governance-vendor-ai-governance',
}

const sources = [
  [
    'src-im-mis-laudon-17e',
    'Management Information Systems: Managing the Digital Firm, 17th Edition',
    'Kenneth C. Laudon; Jane P. Laudon',
    'Pearson',
    'book',
    'https://www.pearson.com/en-us/subject-catalog/p/management-information-systems-managing-the-digital-firm/P200000006204',
    ['strategy', 'platforms', 'enterprise systems', 'systems development'],
    '用於 MIS 核心理論、企業系統、平台與 IT 投資的定義層。',
  ],
  [
    'src-im-mis-scrum-guide-2020',
    'The Scrum Guide (2020)',
    'Ken Schwaber; Jeff Sutherland',
    'Scrum Guides',
    'official-guidance',
    'https://scrumguides.org/scrum-guide.html',
    ['Scrum roles', 'events', 'artifacts'],
    '用於 Scrum 定義、accountabilities、events 與 artifacts；不支撐一般專案估算。',
  ],
  [
    'src-im-mis-nist-ai-rmf',
    'Artificial Intelligence Risk Management Framework 1.0',
    'NIST',
    'NIST',
    'official-guidance',
    'https://www.nist.gov/itl/ai-risk-management-framework',
    ['AI governance', 'trustworthiness', 'risk management'],
    '用於 AI 系統設計、使用與評估的風險治理；不作特定模型績效保證。',
  ],
  [
    'src-im-mis-nist-privacy-framework',
    'NIST Privacy Framework',
    'NIST',
    'NIST',
    'official-guidance',
    'https://www.nist.gov/privacy-framework',
    ['privacy risk', 'enterprise risk management'],
    '用於 IoT、資料與供應商情境的 privacy risk 識別與管理。',
  ],
  [
    'src-im-mis-apache-license-2',
    'Apache License, Version 2.0',
    'Apache Software Foundation',
    'Apache Software Foundation',
    'official-guidance',
    'https://www.apache.org/licenses/LICENSE-2.0',
    ['open-source licensing', 'patent grant', 'redistribution'],
    '用於 Apache-2.0 條款與 permissive licensing；不概括所有 OSS 授權。',
  ],
  [
    'src-im-mis-gpl-3',
    'GNU General Public License, version 3',
    'Free Software Foundation',
    'GNU Project',
    'official-guidance',
    'https://www.gnu.org/licenses/gpl-3.0.html',
    ['copyleft', 'source distribution', 'license obligations'],
    '用於 GPLv3 copyleft 與散布義務；題目若未指定版本需在答案中揭露假設。',
  ],
  [
    'src-im-mis-postgresql-sql',
    'PostgreSQL Documentation: The SQL Language',
    'PostgreSQL Global Development Group',
    'PostgreSQL',
    'documentation',
    'https://www.postgresql.org/docs/current/tutorial-sql.html',
    ['SQL', 'join', 'aggregate', 'grouping'],
    '用於 SQL join、aggregate、GROUP BY 與查詢語意。',
  ],
  [
    'src-im-mis-ifrs-sustainability',
    'IFRS Sustainability Disclosure Standards Navigator',
    'International Sustainability Standards Board',
    'IFRS Foundation',
    'official-guidance',
    'https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/',
    ['sustainability disclosure', 'governance', 'climate'],
    '用於永續相關風險與揭露的治理邊界；不把 ESG 簡化成單一分數。',
  ],
  [
    'src-im-mis-nielsen-heuristics',
    '10 Usability Heuristics for User Interface Design',
    'Jakob Nielsen',
    'Nielsen Norman Group',
    'documentation',
    'https://www.nngroup.com/articles/ten-usability-heuristics/',
    ['usability', 'UI evaluation', 'feedback'],
    '用於 UI heuristic evaluation；不取代使用者研究與 accessibility testing。',
  ],
  [
    'src-im-mis-google-ml-rules',
    'Rules of Machine Learning: Best Practices for ML Engineering',
    'Martin Zinkevich',
    'Google for Developers',
    'documentation',
    'https://developers.google.com/machine-learning/guides/rules-of-ml',
    ['ML lifecycle', 'monitoring', 'deployment'],
    '用於 ML 專案目標、資料管線、部署與監控的工程實務。',
  ],
].map(([id, title, author, publisher, type, url, scope, usage]) => ({
  id,
  title,
  author,
  publisher,
  type,
  url,
  scope,
  usage,
  status: 'reviewed',
  review: {
    reviewedAt: '2026-08-16',
    reviewedBy: 'independent-technical-review-2026-08-16',
    method: '核對來源類型、涵蓋範圍與本站實際引用用途；未把來源範圍外的主張視為已覆核。',
  },
}))

const subtopicSourceRefs = {
  'im-mis-strategy-alignment-differentiation': ['src-im-mis-laudon-17e'],
  'im-mis-strategy-investment-value': ['src-im-mis-laudon-17e'],
  'im-mis-strategy-agility-environment': ['src-im-mis-laudon-17e'],
  'im-mis-strategy-organization-economics': ['src-im-mis-laudon-17e'],
  'im-mis-platforms-sharing-economy': ['src-im-mis-laudon-17e'],
  'im-mis-platforms-multisided-pricing': ['src-im-mis-laudon-17e'],
  'im-mis-platforms-digital-markets-commerce': ['src-im-mis-laudon-17e'],
  'im-mis-enterprise-knowledge-management': ['src-im-mis-laudon-17e'],
  'im-mis-enterprise-enterprise-processes': ['src-im-mis-laudon-17e'],
  'im-mis-enterprise-supply-chain': ['src-im-mis-laudon-17e'],
  'im-mis-data-ai-data-lifecycle': [
    'src-im-mis-google-ml-rules',
    'src-im-mis-nist-privacy-framework',
  ],
  'im-mis-data-ai-model-evaluation-fairness': [
    'src-im-mis-google-ml-rules',
    'src-im-mis-nist-ai-rmf',
  ],
  'im-mis-data-ai-analytics-forecasting': ['src-im-mis-laudon-17e'],
  'im-mis-data-ai-ai-operations-governance': [
    'src-im-mis-google-ml-rules',
    'src-im-mis-nist-ai-rmf',
  ],
  'im-mis-development-acquisition-estimation': ['src-im-mis-laudon-17e'],
  'im-mis-development-agile-delivery': ['src-im-mis-scrum-guide-2020'],
  'im-mis-development-testing-quality': ['src-im-mis-laudon-17e'],
  'im-mis-development-requirements-ux': ['src-im-mis-laudon-17e', 'src-im-mis-nielsen-heuristics'],
  'im-mis-data-architecture-relational-nosql': ['src-im-mis-laudon-17e'],
  'im-mis-data-architecture-sql-schema': ['src-im-mis-postgresql-sql'],
  'im-mis-data-architecture-oss-licensing': ['src-im-mis-apache-license-2', 'src-im-mis-gpl-3'],
  'im-mis-governance-privacy-security': ['src-im-mis-nist-privacy-framework'],
  'im-mis-governance-esg-accountability': ['src-im-mis-ifrs-sustainability'],
  'im-mis-governance-vendor-ai-governance': [
    'src-im-mis-nist-privacy-framework',
    'src-im-mis-nist-ai-rmf',
  ],
}

const sourcesForSubtopics = (subtopicIds) => [
  ...new Set(subtopicIds.flatMap((id) => subtopicSourceRefs[id] ?? [])),
]

const lessonFrames = {
  'im-mis-strategy': [
    '家庭年度改造投資組合',
    '有限預算要分給節能、維修與智慧化；同一套設備在不同家庭可能產生不同成果。',
  ],
  'im-mis-platforms': [
    '夜市主辦方的三邊市場',
    '主辦方同時服務攤商、顧客與外送員，一側的加入會改變其他側的價值。',
  ],
  'im-mis-enterprise': [
    '連鎖餐廳的中央廚房與知識網',
    '標準配方適合存進手冊，特殊客訴則需要快速找到真正處理過的人。',
  ],
  'im-mis-data-ai': [
    '餐廳從備料到持續改菜單',
    '資料像食材，需要驗收、加工、試吃、上線監控，環境改變後還要重新檢查。',
  ],
  'im-mis-development': [
    '餐廳裝修與試營運',
    '自建、採購或委外各有責任邊界；開幕前要逐層測試設備、動線與顧客體驗。',
  ],
  'im-mis-data-architecture': [
    '圖書館的目錄、書架與借閱規則',
    '固定欄位便於一致查詢，彈性收藏便於擴充，但仍需說清一致性與授權義務。',
  ],
  'im-mis-governance': [
    '社區智慧門禁的責任會議',
    '便利功能牽涉住戶資料、供應商依賴、能源與問責，不能只看技術能不能做。',
  ],
}

const topicTeaching = {
  'im-mis-strategy': {
    mapping: [
      [
        '家人先說清楚要省電、改善安全或提升便利',
        'IT-business alignment：投資要對準可衡量的策略目標',
      ],
      [
        '同一台設備需要施工、使用習慣與維護能力',
        'Complementary assets：流程、技能與治理共同決定 IT value',
      ],
      [
        '把預算分成必要維修、成長投資與實驗項目',
        'IT portfolio 依 benefit、risk 與 option value 組合',
      ],
      ['環境快速變化時保留模組化與替換空間', 'Enterprise agility 與環境 dynamism 下的彈性能力'],
    ],
    sections: [
      [
        '策略對齊不是列一張採購單',
        '差異化、成本、創新等策略先定義目標客群與價值主張，再問資訊品質、流程速度或互動體驗如何支持它。',
        [
          'IT 本身通常可被模仿',
          '要寫出 capability 與 business outcome 的中介機制',
          'KPI 必須能對應策略目標',
        ],
      ],
      [
        'IT value 依賴互補性資產',
        '相同系統在不同企業產生不同績效，常因流程再設計、管理承諾、資料品質、人員技能與吸收能力不同。',
        [
          '不要把採購支出直接等同績效',
          '短期導入成本與長期能力要分開',
          '用 adoption、usage 與 process metric 追蹤',
        ],
      ],
      [
        '投資組合要同時看效益與風險',
        'NPV 等財務工具有助比較現金流，但策略平台、法遵、學習 option 與相依關係可能無法被單一數字完整表達。',
        [
          '明列 tangible 與 intangible benefits',
          '比較 dependency、uncertainty 與 downside',
          '設定 stage gate 與停止條件',
        ],
      ],
      [
        '環境與組織邊界會改變答案',
        'IT 可降低市場交易成本，也可降低企業內部協調成本；究竟外包、擴張或縮小，要比較資產專屬性、監督成本與環境動態。',
        ['交易成本與代理成本不是同義詞', '高 dynamism 偏重感知與快速重組', '結論應寫成條件句'],
      ],
    ],
  },
  'im-mis-platforms': {
    mapping: [
      ['夜市同時服務攤商、顧客與外送員', 'Multi-sided platform 連結彼此相依的 participant groups'],
      ['顧客愈多，攤商加入的價值可能愈高', 'Cross-side network effect'],
      ['主辦方讓顧客免費、向攤商收服務費', 'Cross-subsidy 與 platform pricing'],
      ['評價、申訴與身分驗證維持交易信任', 'Platform governance 降低資訊不對稱與安全風險'],
    ],
    sections: [
      [
        '先畫出平台各側與交換內容',
        '平台不是單一買賣雙方。答題先列出每一側提供與取得的價值，再辨識誰對誰產生 network effect。',
        [
          '區分 same-side 與 cross-side effect',
          '使用者數多不必然等於高品質',
          '標示資料、金流與責任流',
        ],
      ],
      [
        '定價取決於彈性與成長策略',
        '平台可能補貼價格敏感、能吸引另一側或品質關鍵的一側，再從其他側變現；補貼不是永遠免費。',
        [
          '比較 price elasticity',
          '注意 multi-homing 與 switching cost',
          '交叉補貼要有可持續收入來源',
        ],
      ],
      [
        '數位市場降低部分成本也創造新摩擦',
        '搜尋、複製與配對成本可下降，但資訊不對稱、排序偏誤、假評價、隱私與 winner-take-most 風險仍需治理。',
        ['透明度不等於資訊完全', '演算法推薦會影響曝光分配', '治理規則本身也會改變誘因'],
      ],
      [
        '新技術要回到轉換機制',
        '直播、AI 推薦或 VR 只有在降低不確定性、改善互動或縮短決策流程時才形成商業價值。',
        [
          '不要只列技術名詞',
          '同時評估誤導、退貨與隱私',
          '以 conversion、retention、complaint 等指標驗證',
        ],
      ],
    ],
  },
  'im-mis-enterprise': {
    mapping: [
      ['標準配方寫進所有分店共用手冊', 'Codification 將可表達知識放入 repository 重用'],
      ['特殊客訴查專家名錄並直接討論', 'Personalization/connectivity 傳遞 tacit knowledge'],
      ['中央系統共用訂單、庫存與財務資料', 'ERP 與 process integration'],
      ['依實際訂單補貨，而非只靠預測先做', 'Pull supply chain 以 demand signal 驅動'],
    ],
    sections: [
      [
        '知識策略依可編碼性與工作型態選擇',
        '重複、標準化問題適合 codification；高度客製、脈絡依賴的問題需要 expert network 與互動。',
        ['Tacit knowledge 不代表完全不能記錄', 'Repository 仍需版本與品質治理', '兩種策略可以互補'],
      ],
      [
        '企業系統整合資料也標準化流程',
        'ERP 以共享資料與跨部門流程降低重複輸入和資訊延遲，但導入也可能帶來僵化、轉換成本與 fit-gap。',
        ['整合不等於所有流程相同', '先辨識 master data 與責任 owner', '客製化會增加升級成本'],
      ],
      [
        '流程改造不能只把紙本搬上線',
        'BPR 重新檢查活動、責任與資訊流；若舊流程不合理，單純 automation 只會更快地複製浪費。',
        ['區分 automation 與 transformation', '檢查 handoff 與等待', '搭配 change management'],
      ],
      [
        'Push 與 pull 是需求訊號的取捨',
        'Push 依預測提前生產，pull 依實際需求觸發；產品前置期、波動、缺貨成本與資訊共享決定組合。',
        [
          '不是所有產業都能純 pull',
          '延遲與 batch 會放大 bullwhip effect',
          '比較 inventory 與 service level',
        ],
      ],
    ],
  },
  'im-mis-data-ai': {
    mapping: [
      ['採買前先確認菜單與顧客需求', '先定義 ML use case、decision 與 success metric'],
      ['食材驗收、清洗與標示來源', 'Data quality、label provenance 與 governance'],
      ['試菜分成調整配方與最後驗收', 'Validation/test separation 與 leakage control'],
      ['開店後監看退餐、客群與季節變化', 'Production monitoring、data/concept drift 與 retraining'],
    ],
    sections: [
      [
        '資料生命週期從決策問題開始',
        '收集大量資料前要先界定模型輸出會支持哪個決策、錯誤成本與可用回饋，否則容易得到無法部署的高分模型。',
        ['定義 unit of analysis', '記錄資料來源與 consent', '先建立簡單 baseline'],
      ],
      [
        '評估指標要符合任務與風險',
        '分類、預測與社群偵測需要不同指標；離線表現、穩定性、公平與業務結果也不能用單一 accuracy 取代。',
        [
          '保留真正未參與調整的 test set',
          '檢查 subgroup performance',
          '無 ground truth 時揭露 proxy 限制',
        ],
      ],
      [
        '部署後模型仍是持續運作的系統',
        '監控輸入分布、預測品質、延遲、人工轉接與異常，設定 retrain、rollback 與 version control。',
        [
          'Data drift 不必然造成 concept drift',
          '新模型需 shadow/A-B evaluation',
          '保留 audit trail',
        ],
      ],
      [
        'AI 治理連結責任與控制',
        'FOMO、供應商依賴與模糊 KPI 常讓專案失敗；NIST AI RMF 的風險管理可協助把 trustworthiness 放進設計、使用與評估。',
        ['先列 use-case owner', '辨識 harmed stakeholders', '設定 human escalation 與退出機制'],
      ],
    ],
  },
  'im-mis-development': {
    mapping: [
      ['決定自行施工、買套裝或委託承包商', 'Build/buy/outsource/SaaS sourcing decision'],
      ['本週施工清單與每天同步阻礙', 'Sprint Backlog 與 Daily Scrum'],
      ['先測單一設備，再測整體動線與店主驗收', 'Unit、integration、system/UAT testing'],
      ['顧客試走、觀察迷路與等待點', 'User-centered design 與 usability evaluation'],
    ],
    sections: [
      [
        '系統取得先比較策略與內部能力',
        '自行開發提供控制與客製，套裝/SaaS 加快導入，委外轉移部分執行但不轉移需求、風險與治理責任。',
        ['比較 strategic uniqueness', '估算 lifecycle cost', '保留 vendor exit plan'],
      ],
      [
        'Scrum 是經驗式框架，不是職稱清單',
        'Product Owner 對價值排序負責，Scrum Master 協助框架有效運作，Developers 對可用 Increment 負責；events 支援 inspection/adaptation。',
        ['Daily Scrum 不是主管點名', 'Sprint Backlog 由 Developers 管理', 'Done 必須有品質定義'],
      ],
      [
        '測試層級回答不同風險',
        'Unit 看局部行為，integration 看介面，system 看端到端，UAT 看業務可接受性，usability 看使用者完成任務的困難。',
        ['測試通過不代表需求正確', '自動化適合重複 regression', '缺陷成本與 feedback timing 有關'],
      ],
      [
        '需求與估算隨資訊增加而細化',
        'User story 強調角色、目標與價值；use case 詳述 actor 與互動流程。早期可用 T-shirt sizing，資訊較完整後再用功能點或模型。',
        ['估算不是承諾', '列出 uncertainty range', '保留 acceptance criteria 與例外流程'],
      ],
    ],
  },
  'im-mis-data-architecture': {
    mapping: [
      ['借閱資料使用固定欄位與關聯規則', 'Relational schema、keys 與 integrity constraints'],
      ['用目錄連接書籍、館藏與分館', 'SQL JOIN 沿 foreign-key relationships 組合資料'],
      ['先分館統計再篩選至少兩冊', 'GROUP BY、aggregate 與 HAVING'],
      ['採用共享工具前先讀散布與修改條款', 'OSS license obligations 與 sourcing governance'],
    ],
    sections: [
      [
        '關聯式與 NoSQL 不是一致性有無的二分法',
        '選擇要看資料模型、transaction boundary、query pattern、scale、availability 與一致性要求；不同 NoSQL 系統也有不同保證。',
        [
          '避免宣稱 NoSQL 一律不支援 ACID',
          'Schema flexibility 仍需 validation',
          '先寫出 workload 與 failure assumptions',
        ],
      ],
      [
        'SQL 從關係與粒度開始',
        '先決定輸出每列代表什麼，再沿 PK/FK JOIN；aggregate 前確認 grouping grain，row filter 用 WHERE，group filter 用 HAVING。',
        [
          'JOIN 條件漏寫會產生 Cartesian product',
          '非 aggregate 欄位需符合 grouping 規則',
          'ORDER BY 明示方向',
        ],
      ],
      [
        '可擴展性同時有技術與治理成本',
        'Horizontal scale 會引入 partition、replication、consistency 與 operation complexity；vertical scale 也有容量與單點限制。',
        ['比較讀寫比例與 hotspot', '納入 backup/restore', '評估團隊操作能力'],
      ],
      [
        '開源不等於沒有義務',
        'GPL 與 Apache-2.0 的散布、notice、source 與 patent 條款不同；回答前要說明版本、使用方式與是否散布。',
        [
          '不要用「傳染性」取代精確條款',
          'SaaS/內部使用與 distribution 要分開',
          '法律判斷需由合格專業人士確認',
        ],
      ],
    ],
  },
  'im-mis-governance': {
    mapping: [
      ['門禁只蒐集完成目的所需的最少資料', 'Data minimization 與 purpose limitation'],
      ['住戶知道誰能看資料並可申訴', 'Transparency、accountability 與 redress'],
      ['供應商故障時仍有切換與資料取回方案', 'Third-party dependency、portability 與 exit control'],
      ['定期揭露能源、事件與改善措施', 'Sustainability disclosure 與 governance oversight'],
    ],
    sections: [
      [
        'Privacy 是組織風險管理問題',
        'IoT 感測器可持續蒐集位置、行為與環境資料；治理要處理目的、最小化、保存、存取、分享與個人權利。',
        [
          'Consent 不一定足以處理所有 power imbalance',
          '辨識 inference 與 secondary use',
          '設定 retention/deletion controls',
        ],
      ],
      [
        'ESG 要從口號落到治理與揭露',
        'Environmental、Social、Governance 各自包含不同 impact、risk 與 oversight；IT 可改善量測與透明，也可能增加能源、監控與 exclusion 風險。',
        ['說明 metric boundary', '避免把 IT 投資必然寫成正向', '揭露方法、假設與責任人'],
      ],
      [
        '供應商策略同時有速度與依賴',
        '外部 foundation model 可縮短 time-to-market，但帶來 roadmap、成本、資料、可攜性與競爭者依賴。',
        [
          '合約不是唯一控制',
          '需要 architecture isolation 與 fallback',
          '監控 vendor/model changes',
        ],
      ],
      [
        'Trustworthiness 需要全生命週期控制',
        'Privacy by design、human escalation、audit log、incident response 與透明溝通共同維持信任；不能只靠品牌聲明。',
        ['對高風險決策提高人工覆核', '把受影響者納入評估', '定期重估風險與退出條件'],
      ],
    ],
  },
}

const qByTopic = new Map(topics.map((t) => [t.id, []]))
for (const q of questions) {
  const key = `${q.year}-${q.number}`
  const subtopicId = questionMap[key]
  if (!subtopicId) throw new Error(`Missing mapping for ${q.id}`)
  const topicId = topics.find((t) => t.subtopics.some((s) => s.id === subtopicId))?.id
  if (!topicId) throw new Error(`Unknown mapped subtopic ${subtopicId}`)
  qByTopic.get(topicId).push(q.id)
}

const lessons = topics.map((topic) => {
  const refs = qByTopic.get(topic.id)
  const [scenarioTitle, hook] = lessonFrames[topic.id]
  const sourceRefs = sourcesForSubtopics(topic.subtopics.map((subtopic) => subtopic.id))
  const teaching = topicTeaching[topic.id]
  return {
    id: `lesson-${topic.id}-01`,
    subtopicId: topic.subtopics[0].id,
    coveredSubtopicIds: topic.subtopics.map((s) => s.id),
    title: topic.title,
    summary: `以 ${refs.length} 題已核對題面為範圍證據，建立「定義→機制→條件與權衡→案例」的申論骨架。所有答案與 rubric 均為非官方自評材料，不提供單一標準論點或自動計分。`,
    estimatedMinutes: 42,
    minimumPastPaperRefs: refs.length,
    learningObjectives: topic.learningObjectives.map((x) => x.statement),
    learningScenario: {
      title: scenarioTitle,
      hook,
      predict:
        '如果兩個組織買了同一套技術，結果會必然相同嗎？先列出至少兩個會改變結果的條件，再往下對照。',
      mapping: teaching.mapping.map(([everyday, technical]) => ({ everyday, technical })),
      boundary:
        '生活情境只協助排列角色、機制與權衡，不能取代理論定義、產業條件、資料證據或申論中的反方與限制。不同合理立場只要假設清楚、推論一致並有來源，都可由 rubric 自評。',
      examCues: [
        '先界定題目名詞與分析單位。',
        '再寫出因果機制，不只列工具名稱。',
        '補上適用條件、風險與替代方案。',
        '最後用題目案例驗證，並指出比喻或主張的限制。',
      ],
    },
    sections: teaching.sections.map(([title, body, bullets]) => ({ title, body, bullets })),
    workedExamples: [
      {
        prompt: `如何回答「${topic.title}」的比較題？`,
        steps: [
          '定義比較軸與分析單位。',
          '各寫一條作用機制。',
          '加入至少兩項條件或風險。',
          '用案例與指標驗證。',
        ],
        answer: '可接受的答案不只一種；關鍵是條件透明、概念正確、推論可追蹤，並能說明限制。',
      },
      {
        prompt: '題目要求提出建議時，如何避免只列 buzzwords？',
        steps: [
          '先指出要改善的問題。',
          '說明建議如何改變流程、資訊或激勵。',
          '指定責任人與衡量方式。',
          '補上失敗訊號與替代方案。',
        ],
        answer: '建議應包含 action、mechanism、metric 與 risk，而不是只寫「導入 AI／雲端／平台」。',
      },
    ],
    commonPitfalls: [
      '把工具名稱當成因果解釋',
      '沒有說明分析層級與前提',
      '只寫單一立場，不處理權衡',
      '把非官方參考解析當唯一標準答案',
      '引用時事卻沒有日期與來源邊界',
    ],
    sourceRefs,
    pastPaperRefs: refs,
    reviewStatus: 'reviewed',
    evidenceNote:
      '考古題只證明此範圍曾出現；題面均為申論或開放題，答案非官方，課程練習採 rubric self-review，絕不進自動計分或完整模擬考。',
  }
})

const cards = []
for (const topic of topics) {
  const lessonId = `lesson-${topic.id}-01`
  for (const subtopic of topic.subtopics) {
    const refs = questions
      .filter((q) => questionMap[`${q.year}-${q.number}`] === subtopic.id)
      .map((q) => q.id)
    cards.push(
      {
        id: `card-${subtopic.id}-definition`,
        lessonId,
        subtopicId: subtopic.id,
        front: `${subtopic.title}：答題時先定義什麼？`,
        back: `先界定 ${subtopic.title} 的分析單位、核心機制與適用條件。`,
        explanation: 'MIS 概念不能只背名詞；定義後必須說明它如何改變資訊、協調、成本、能力或風險。',
        sourceRefs: subtopicSourceRefs[subtopic.id],
        pastPaperRefs: refs,
        reviewStatus: 'reviewed',
      },
      {
        id: `card-${subtopic.id}-tradeoff`,
        lessonId,
        subtopicId: subtopic.id,
        front: `${subtopic.title}：完整申論至少要補哪三類內容？`,
        back: '機制、條件／權衡、可觀察指標與限制。',
        explanation: '以「主張→因果機制→成立條件→案例／指標→限制」自我檢查，合理替代論點亦可接受。',
        sourceRefs: subtopicSourceRefs[subtopic.id],
        pastPaperRefs: refs,
        reviewStatus: 'reviewed',
      }
    )
  }
}

const conceptMaster = {
  schemaVersion: 1,
  subjectId: 'im-mis',
  contentStatus: 'reviewed',
  sourcePolicy: '技術與管理主張需有 reviewed source；考古題只證明出題範圍，不是官方答案來源。',
  canonicalTopicIds: topics.map((t) => t.id),
  publicationGates: [
    'question metadata closure',
    'self-review rubric for every question',
    'no auto grading',
    'reviewed source closure',
  ],
  topics,
}
const sourceRegistry = {
  schemaVersion: 1,
  subjectId: 'im-mis',
  policy: '本站內容是依來源整理的原創摘要；時事案例與穩定理論分開，所有考古題解答均非官方。',
  sources,
}
const lessonArtifact = {
  schemaVersion: 2,
  subjectId: 'im-mis',
  status: 'reviewed',
  contentPolicy: '原創 MIS 申論學習摘要；past-paper refs 為題面範圍證據，rubric 為非官方自評工具。',
  counts: {
    lessons: lessons.length,
    coveredSubtopics: topics.flatMap((t) => t.subtopics).length,
    coveredQuestions: questions.length,
  },
  lessons,
}
const cardArtifact = {
  schemaVersion: 1,
  subjectId: 'im-mis',
  status: 'reviewed',
  generationPolicy:
    '由 reviewed lessons 與 canonical subtopics 確定性產生；每個子主題兩張申論自評卡。',
  totalCards: cards.length,
  cards,
}
const srsCandidates = {
  schemaVersion: 1,
  subjectId: 'im-mis',
  status: 'candidate',
  publicationPolicy:
    '僅供後續 SRS 發布審核；不寫入 flashcards.json。通過提示去重、來源覆核與使用者負荷評估後才可發布。',
  totalCandidates: cards.length,
  candidates: cards.map((c) => ({
    ...c,
    id: c.id.replace('card-', 'srs-candidate-'),
    curationStatus: 'candidate_reviewed',
    publishToSrs: false,
  })),
}

const metadataFragmentPath = path.join(root, '.work/im-mis-metadata-rubrics-fragment.json')
if (!fs.existsSync(metadataFragmentPath))
  throw new Error('Missing .work/im-mis-metadata-rubrics-fragment.json')
const fragment = JSON.parse(fs.readFileSync(metadataFragmentPath, 'utf8'))
const expectedIds = new Set(questions.map((q) => q.id))
for (const key of ['metadata', 'answerReviews']) {
  if (!Array.isArray(fragment[key]) || fragment[key].length !== 37)
    throw new Error(`${key} must contain 37 records`)
  if (
    new Set(fragment[key].map((x) => x.questionId)).size !== 37 ||
    fragment[key].some((x) => !expectedIds.has(x.questionId))
  )
    throw new Error(`${key} IDs do not close over MIS questions`)
}
const fragmentPracticeEntries = Object.entries(fragment.practiceStatus.questions ?? {}).map(
  ([questionId, value]) => ({ questionId, ...value })
)
if (
  fragmentPracticeEntries.length !== 37 ||
  fragmentPracticeEntries.some((entry) => !expectedIds.has(entry.questionId))
)
  throw new Error('practiceStatus must contain exactly the 37 MIS question IDs')
const metadata = fragment.metadata.map((entry) => {
  const q = questions.find((item) => item.id === entry.questionId)
  const primarySubtopicId = questionMap[`${q.year}-${q.number}`]
  const topicId = topics.find((t) => t.subtopics.some((s) => s.id === primarySubtopicId)).id
  return {
    ...entry,
    paperId: q.paperId,
    topicId,
    primarySubtopicId,
    questionType: 'essay',
    scoringMode: 'self_review',
    publication: {
      browseEligible: true,
      practiceEligible: true,
      autoGradeEligible: false,
      fullMockEligible: false,
      blockers: ['非官方申論參考解析', '需以 rubric 自評，不可機械判分'],
    },
  }
})
const answerReviews = fragment.answerReviews.map((entry) => {
  const metadataEntry = metadata.find((item) => item.questionId === entry.questionId)
  const sourceRefs = subtopicSourceRefs[metadataEntry.primarySubtopicId]
  const isSqlQuestion = entry.questionId === 'q-pp-im-mis-107-4'
  const asksForDiagram = ['q-pp-im-mis-110-3', 'q-pp-im-mis-110-4'].includes(entry.questionId)
  const explanationApproved = isSqlQuestion
  const rubricItems = entry.rubricItems.map((item) => ({
    ...item,
    criteria: item.criteria.filter(
      (criterion) =>
        (isSqlQuestion || !criterion.startsWith('SQL 必須')) &&
        (asksForDiagram || !criterion.startsWith('圖表或模型需'))
    ),
    limitations: item.limitations.filter(
      (limitation) => !limitation.includes('尚未綁定 reviewed sources')
    ),
    sourceRefs,
  }))
  return {
    ...entry,
    answerSource: {
      ...entry.answerSource,
      reviewCount: explanationApproved ? 1 : 0,
      reviewers: explanationApproved ? ['independent-technical-review-2026-08-16'] : [],
      note: explanationApproved
        ? '獨立技術覆核確認 SQL 與題目提供的 schema、連接鍵、篩選、分組、HAVING 及排序一致；仍非官方答案。'
        : 'PDF audit 僅確認題面 fidelity；現有 explanation 未獲本次獨立技術覆核批准。Reviewed sources 只支撐 rubric 概念邊界。',
    },
    confidence: {
      ...entry.confidence,
      level: explanationApproved ? 'medium' : 'unreviewed',
      basis: [
        ...entry.confidence.basis,
        'Rubric 的概念檢核已逐題映射至 primary subtopic 的 reviewed sources。',
        ...(explanationApproved ? ['SQL 解析已完成一輪獨立技術覆核。'] : []),
      ],
      unresolvedIssues: entry.confidence.unresolvedIssues.filter(
        (issue) =>
          issue !== '未綁定 reviewed sources' &&
          (!explanationApproved || issue !== '未完成逐小題雙審')
      ),
    },
    rubricItems,
    rubricReview: {
      status: 'reviewed',
      reviewCount: 1,
      reviewers: ['independent-technical-review-2026-08-16'],
      reviewedAt: '2026-08-16',
      sourceRefs,
      note: '獨立覆核只核准 rubric 的題目分解、配分、概念範圍、合理替代答案、來源範圍與安全 eligibility；不等於核准 answers.json 的 explanation。',
    },
    official: false,
    practiceEligible: true,
    autoGradeEligible: false,
  }
})
const practiceQuestions = Object.fromEntries(
  fragmentPracticeEntries.map((entry) => [
    entry.questionId,
    {
      status: entry.status ?? 'self_review_only',
      autoGradeEligible: false,
      note: entry.note ?? '非官方申論參考解析；請依 rubric 自評，不納入自動計分或完整模擬考。',
    },
  ])
)
const subquestionCount = metadata.reduce((n, q) => n + q.subquestions.length, 0)
if (subquestionCount !== 76)
  throw new Error(`Expected 76 explicit subquestions, received ${subquestionCount}`)
const metadataArtifact = {
  schemaVersion: 1,
  subjectId: 'im-mis',
  taxonomyMethod: '37 題逐題映射至 canonical MIS taxonomy；subquestions 依已驗證題面標籤保存。',
  answerPolicy: '所有答案非官方，僅 self-review；禁止自動計分與完整模擬考。',
  totalQuestions: 37,
  counts: { essay: 37, explicitSubquestions: 76, autoGradeEligible: 0 },
  questions: metadata,
}
const answerReviewArtifact = {
  schemaVersion: 1,
  subjectId: 'im-mis',
  officialAnswerKeyAvailable: false,
  reviewMethod:
    '以目前 main 的已驗證題面與非官方 explanation 建立自評 rubric；未使用 dirty worktree 的錯置 answers。',
  confidencePolicy: 'rubric 是答題結構與概念檢核，不代表唯一標準答案；合理替代論證可接受。',
  totalQuestions: 37,
  counts: {
    selfReviewOnly: 37,
    rubricReviewed: 37,
    explanationTechnicalReviewed: answerReviews.filter(
      (review) => review.answerSource.reviewCount > 0
    ).length,
    autoGradeEligible: 0,
  },
  questions: answerReviews,
}
const practiceArtifact = {
  schemaVersion: 1,
  subjectId: 'im-mis',
  official: false,
  counts: { selfReviewOnly: 37, autoGradeEligible: 0, fullMockEligible: 0 },
  questions: practiceQuestions,
}

const outputs = {
  'im-mis-concept-master.json': conceptMaster,
  'im-mis-source-registry.json': sourceRegistry,
  'im-mis-question-metadata.json': metadataArtifact,
  'im-mis-answer-review.json': answerReviewArtifact,
  'im-mis-practice-status.json': practiceArtifact,
  'im-mis-lessons.json': lessonArtifact,
  'im-mis-concept-cards.json': cardArtifact,
  'im-mis-srs-candidates.json': srsCandidates,
}

if (process.argv.includes('--check')) {
  const drift = Object.entries(outputs).filter(([name, data]) => {
    const outputPath = path.join(dataDir, name)
    return (
      !fs.existsSync(outputPath) ||
      fs.readFileSync(outputPath, 'utf8') !== `${JSON.stringify(data, null, 2)}\n`
    )
  })
  if (drift.length) {
    console.error(`IM-MIS generated artifact drift: ${drift.map(([name]) => name).join(', ')}`)
    process.exit(1)
  }
  console.log(`Checked ${Object.keys(outputs).length} IM-MIS artifacts: no drift.`)
  process.exit(0)
}

if (!process.argv.includes('--write')) {
  console.log(
    JSON.stringify(
      Object.fromEntries(
        Object.entries(outputs).map(([name, data]) => [
          name,
          data.lessons?.length ??
            data.cards?.length ??
            data.questions?.length ??
            Object.keys(data.questions ?? {}).length ??
            data.sources?.length ??
            data.topics?.length ??
            data.candidates?.length,
        ])
      ),
      null,
      2
    )
  )
  process.exit(0)
}
for (const [name, data] of Object.entries(outputs))
  fs.writeFileSync(path.join(dataDir, name), `${JSON.stringify(data, null, 2)}\n`)
console.log(`Built ${Object.keys(outputs).length} IM-MIS artifacts.`)
