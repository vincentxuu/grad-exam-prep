import fs from 'node:fs'
import crypto from 'node:crypto'

const questionsJson = JSON.parse(fs.readFileSync('public/data/questions.json', 'utf8'))
const answersJson = JSON.parse(fs.readFileSync('public/data/answers.json', 'utf8'))
const verification = JSON.parse(fs.readFileSync('public/data/im-mis-stat-paper-verification.json', 'utf8'))
const questions = questionsJson.questions.filter((question) => question.subjectId === 'im-mis')
const answers = answersJson.answers

const taxonomy = {
  '106-1': ['mis-strategy-value', 'mis-strategy-differentiation', ['competitive-strategy', 'it-business-alignment']],
  '106-2': ['mis-platforms-markets', 'mis-platforms-sharing-economy', ['trust', 'platform-governance']],
  '106-3': ['mis-data-infrastructure', 'mis-infrastructure-open-source-licensing', ['oss', 'licensing', 'sourcing']],
  '106-4': ['mis-data-infrastructure', 'mis-data-relational-nosql', ['database', 'acid', 'scalability']],
  '107-1': ['mis-enterprise-process', 'mis-knowledge-management-strategies', ['codification', 'personalization']],
  '107-2': ['mis-strategy-value', 'mis-strategy-environmental-uncertainty', ['munificence', 'dynamism']],
  '107-3': ['mis-systems-development', 'mis-systems-acquisition-sourcing', ['build-buy-outsource', 'staffing']],
  '107-4': ['mis-data-infrastructure', 'mis-data-sql-schema', ['sql', 'join', 'aggregation']],
  '108-1': ['mis-strategy-value', 'mis-strategy-it-organization-size', ['transaction-cost', 'agency-theory']],
  '108-2': ['mis-data-ai', 'mis-data-lifecycle-governance', ['data-quality', 'privacy', 'decision-rights']],
  '108-3': ['mis-data-ai', 'mis-ai-model-evaluation', ['metrics', 'validation', 'class-imbalance']],
  '108-4': ['mis-data-ai', 'mis-ai-fairness', ['responsible-ai', 'classification']],
  '109-1': ['mis-strategy-value', 'mis-strategy-it-productivity', ['cobb-douglas', 'tps', 'big-data']],
  '109-2': ['mis-strategy-value', 'mis-strategy-complementary-assets', ['it-investment', 'organizational-change']],
  '109-3': ['mis-platforms-markets', 'mis-platforms-multisided-cross-subsidy', ['network-effects', 'food-delivery']],
  '109-4': ['mis-data-ai', 'mis-ai-demand-forecasting', ['latent-demand', 'feasibility', 'acceptability']],
  '110-1': ['mis-platforms-markets', 'mis-platforms-business-model-transition', ['sharing-platform', 'monetization']],
  '110-2': ['mis-platforms-markets', 'mis-digital-market-frictions', ['information-asymmetry', 'switching-cost']],
  '110-3': ['mis-systems-development', 'mis-development-scrum', ['roles', 'artifacts', 'burndown']],
  '110-4': ['mis-data-ai', 'mis-ai-traffic-prediction-system', ['data-pipeline', 'deployment', 'use-case']],
  '111-1': ['mis-strategy-value', 'mis-strategy-it-portfolio', ['capital-budgeting', 'benefit-risk']],
  '111-2': ['mis-governance', 'mis-governance-iot-privacy', ['privacy', 'smart-home', 'risk-controls']],
  '111-3': ['mis-systems-development', 'mis-development-testing', ['unit-test', 'integration-test', 'uat', 'usability']],
  '111-4': ['mis-systems-development', 'mis-development-ucd-ux', ['user-centered-design', 'ui-heuristics']],
  '112-1': ['mis-enterprise-process', 'mis-enterprise-supply-chain', ['push-pull', 'information-sharing']],
  '112-2': ['mis-strategy-value', 'mis-strategy-project-risk', ['benefits', 'market-risk', 'competitive-risk']],
  '112-3': ['mis-data-ai', 'mis-ai-model-maintenance', ['monitoring', 'drift', 'retraining']],
  '112-4': ['mis-systems-development', 'mis-development-cost-estimation', ['function-point', 'cocomo', 'planning-poker']],
  '113-1': ['mis-data-ai', 'mis-analytics-community-detection', ['graph-analysis', 'evaluation-metrics']],
  '113-2': ['mis-strategy-value', 'mis-strategy-enterprise-agility', ['erp', 'custom-systems', 'adaptation']],
  '113-3': ['mis-data-ai', 'mis-ai-conversational-banking', ['service-metrics', 'privacy', 'human-handoff']],
  '113-4': ['mis-governance', 'mis-governance-esg', ['sustainability', 'it-investment']],
  '114-1': ['mis-platforms-markets', 'mis-platforms-live-commerce', ['firm-size', 'ai', 'vr']],
  '114-2': ['mis-strategy-value', 'mis-strategy-it-business-value', ['rbv', 'complementary-assets', 'productivity-paradox']],
  '114-3': ['mis-systems-development', 'mis-development-requirements', ['user-story', 'use-case']],
  '115-1': ['mis-data-ai', 'mis-ai-project-governance', ['fomo', 'project-failure', 'kpi']],
  '115-2': ['mis-data-ai', 'mis-ai-vendor-governance', ['coopetition', 'vendor-dependency', 'privacy-by-design']],
}

const genericCriteria = {
  definition: '先明確定義題目中的核心概念，避免只列舉名詞。',
  mechanism: '說明概念如何影響組織、流程、技術或績效的因果機制。',
  application: '提供與題意相符的具體情境、例子或可執行做法。',
  tradeoff: '交代成立條件、限制、風險或替代方案，不把策略性判斷寫成唯一答案。',
  evidence: '論點需回扣題幹資訊，並以合理理論、計算、SQL 或架構關係支持。',
}

const explanationRisks = {
  '106-2': '現有解析把區塊鏈身分／評價系統當成主要解法，尚未比較較低成本的中心化信任與申訴機制。',
  '106-3': 'GPL、Apache 與衍生作品義務的描述需要依實際授權版本、散布方式與法律來源複核。',
  '106-4': '現有解析將 relational=ACID、NoSQL=BASE 作過度二分；不同產品可提供不同一致性與交易保證。',
  '107-2': '環境豐裕／動態性與 IT 策略的關係不是單一路徑，現有建議仍需理論來源與邊界。',
  '108-2': '集中或分散的資料決策權可能採 federated governance；現有解析不宜把集中式寫成唯一答案。',
  '108-3': '模型評估需依類別分布、決策成本與 validation design 判讀，不能只核對單一 accuracy 數值。',
  '109-4': '潛在需求估計的可行性、可接受性與因果限制需要方法層級複核。',
  '112-2': '市場風險或競爭風險的優先性取決於假設；現有解析的單一判定不是官方結論。',
  '113-1': 'community detection 指標與比較方法需區分有無 ground truth，且演算法例子需技術覆核。',
  '113-2': '現有解析斷言自建系統必然比 ERP 敏捷，忽略模組化、配置能力、技術債與組織能力等條件。',
  '113-4': '現有解析聲稱 IT 對 ESG 有較一致的正向支持，但未提供來源，且可能忽略反彈效應與治理風險。',
  '115-1': '題幹中的失敗率與研究歸因具時效性；解析只能採用穩定的專案治理概念，案例數字需另行查證。',
  '115-2': 'Apple/Gemini 案例具時效性，且架構、資料流與合約條款不能由題幹外推為已證實事實。',
}

function keyOf(question) {
  return question.id.replace('q-pp-im-mis-', '')
}

function splitPrompt(question) {
  const labels = question.subQuestions ?? []
  if (labels.length === 0) return []
  const escaped = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const positions = []
  for (const label of escaped) {
    const regex = new RegExp(`(?:\\(|^|\\s)${label}(?:\\)|\\.|:)`, 'i')
    const match = regex.exec(question.text)
    positions.push(match?.index ?? -1)
  }
  return labels.map((label, index) => {
    const start = positions[index]
    const next = positions.slice(index + 1).find((position) => position > start)
    const text = start >= 0 ? question.text.slice(start, next ?? undefined).trim() : `Subquestion ${label}`
    return { label, prompt: text }
  })
}

function extractPoints(prompt, fallback) {
  const matches = [...prompt.matchAll(/(\d+)\s*(?:%|points?)/gi)].map((match) => Number(match[1]))
  return matches.at(-1) ?? fallback
}

function expectedElements(prompt, topicId) {
  const lower = prompt.toLowerCase()
  const items = []
  if (/define|definition|what is|what are|explain these|describe the three/.test(lower)) items.push(genericCriteria.definition)
  if (/compare|different|versus|contrast|centralized|decentralized|should be selected|optimal timing/.test(lower)) items.push('建立清楚的比較維度，逐項比較並說明選擇條件。')
  if (/example|scenario|application|illustrate/.test(lower)) items.push(genericCriteria.application)
  if (/recommend|solution|improve|address|suggest|strategy/.test(lower)) items.push('提出具體作法，並解釋其如何對應題目中的問題或目標。')
  if (/why|justify|reason|affect|impact|influence|benefit|challenge|risk/.test(lower)) items.push(genericCriteria.mechanism)
  if (/sql command|select |branchid|copies/.test(lower)) items.push('SQL 必須使用正確資料表、連接鍵、篩選條件，以及題目要求的分組、HAVING 或排序。')
  if (/measure|metric|evaluate|effectiveness|performance/.test(lower)) items.push('列出可操作的評估指標，說明計算／比較方式與驗證程序。')
  if (/draw|chart|diagram|use case/.test(lower)) items.push('圖表或模型需標示必要角色、關係、流程或座標，並與文字說明一致。')
  if (/list|identify|three|four|five/.test(lower)) items.push('項目數量須符合題目要求，且各項不可只是同義改寫。')
  if (items.length < 2) items.push(genericCriteria.definition, genericCriteria.mechanism)
  items.push(genericCriteria.tradeoff)
  return [...new Set(items)].slice(0, 5)
}

function commonErrors(prompt) {
  const lower = prompt.toLowerCase()
  const errors = ['只堆疊術語，沒有解釋概念間的關係或適用條件。']
  if (/example|scenario|application|illustrate/.test(lower)) errors.push('例子未回扣題意，或只寫品牌名稱而沒有說明機制。')
  if (/compare|different|versus|contrast/.test(lower)) errors.push('只描述其中一方，沒有使用一致維度完成比較。')
  if (/sql/.test(lower)) errors.push('遺漏 JOIN 條件、GROUP BY／HAVING，或排序方向不符題意。')
  if (/metric|evaluate|performance/.test(lower)) errors.push('只列指標名稱，未說明如何計算、何時使用或如何驗證。')
  return errors
}

function criteriaFor(question, prompt, points) {
  return {
    points,
    mustHave: expectedElements(prompt, taxonomy[keyOf(question)][0]),
    reasoningSteps: [
      '辨識題目動詞、分析單位與限制條件。',
      '用定義或理論建立答題架構，再逐項回應題目要求。',
      '以案例、機制、比較、計算或技術產物支持主張。',
      '補充權衡與適用邊界，最後檢查項目數及配分比例。',
    ],
    acceptableAlternatives: [
      '允許不同案例、框架或策略結論，只要定義正確、論證連貫且明確回扣題幹。',
      '若題目要求判斷立場，可採相反結論，但必須清楚交代假設、風險與證據。',
    ],
    commonErrors: commonErrors(prompt),
    gradingPolicy: 'self_review_only',
    sourceRefs: [],
  }
}

const metadata = []
const rubrics = []
const answerReviews = []
for (const question of questions) {
  const key = keyOf(question)
  const [topicId, primarySubtopicId, secondaryTags] = taxonomy[key]
  const year = key.split('-')[0]
  const paperEvidence = verification.papers['im-mis'][year]
  const parts = splitPrompt(question)
  const fallbackPoints = parts.length ? undefined : question.points
  const subquestionMetadata = parts.map((part) => ({
    label: part.label,
    rubricId: `rubric-${question.id}-${part.label.toLowerCase()}`,
    scoringMode: 'self_review',
    autoGradeEligible: false,
  }))

  metadata.push({
    questionId: question.id,
    paperId: question.paperId,
    topicId,
    primarySubtopicId,
    secondaryTags,
    questionType: 'essay',
    scoringMode: 'self_review',
    taxonomyConfidence: 'medium',
    taxonomyRationale: `依題幹主要作答任務歸入 ${primarySubtopicId}；跨域概念保留於 secondaryTags。`,
    originQuestionTextSha256: crypto.createHash('sha256').update(question.text).digest('hex'),
    pdfEvidence: {
      pdfSha256: paperEvidence.pdfSha256,
      auditedQuestionsSha256: paperEvidence.questionsSha256,
      auditArtifact: Number(year) <= 110
        ? '.work/im-mis-pdf-audit-106-110.md'
        : '.work/im-mis-pdf-audit-111-115.md',
    },
    subquestions: subquestionMetadata,
    publication: {
      browseEligible: true,
      practiceEligible: true,
      autoGradeEligible: false,
      fullMockEligible: false,
      practiceMode: 'essay_self_review',
      blockers: ['沒有官方答案', '逐小題 rubric 尚未完成雙審與來源綁定'],
    },
  })

  const rubric = {
    questionId: question.id,
    totalPoints: question.points,
    scoringMode: 'self_review',
    disclosure: '非官方自評架構；不是標準答案，也不得用於自動計分。',
    subquestions: parts.map((part) => criteriaFor(question, part.prompt, extractPoints(part.prompt))),
  }
  rubric.subquestions.forEach((entry, index) => {
    entry.rubricId = subquestionMetadata[index].rubricId
    entry.label = parts[index].label
  })
  if (parts.length === 0) {
    rubric.wholeQuestionCriteria = criteriaFor(question, question.text, fallbackPoints)
  }
  rubrics.push(rubric)

  const answer = answers[question.id]
  const unresolvedIssues = [
    '未綁定 reviewed sources',
    '未完成逐小題雙審',
    '策略題可能存在多個合理答案',
  ]
  if (explanationRisks[key]) unresolvedIssues.unshift(explanationRisks[key])
  const rubricItems = (rubric.subquestions.length
    ? rubric.subquestions
    : [{ ...rubric.wholeQuestionCriteria, label: 'whole', rubricId: `rubric-${question.id}-whole` }]
  ).map((entry) => ({
    rubricId: entry.rubricId,
    label: entry.label,
    points: entry.points,
    criteria: entry.mustHave,
    reasoningSteps: entry.reasoningSteps,
    reasonableAlternatives: entry.acceptableAlternatives,
    limitations: [
      ...entry.commonErrors.map((error) => `常見缺陷：${error}`),
      '此 rubric 尚未綁定 reviewed sources 或完成獨立雙審，只能協助 self-review。',
    ],
    sourceRefs: entry.sourceRefs,
  }))
  answerReviews.push({
    questionId: question.id,
    answerMarker: answer?.answer ?? null,
    explanationPresent: Boolean(answer?.explanation?.trim()),
    explanationSha256: answer?.explanation
      ? crypto.createHash('sha256').update(answer.explanation).digest('hex')
      : null,
    explanationDisposition: 'unofficial_draft_for_self_review',
    decision: 'self_review_only',
    answerSource: {
      kind: 'existing_origin_main_explanation',
      official: false,
      reviewCount: 0,
      provenance: ['public/data/questions.json', 'public/data/answers.json', 'NTU original examination PDF audit'],
      note: 'PDF 僅含題目，audit 只確認題面 fidelity，未驗證 explanation 的語意正確性。',
    },
    confidence: {
      level: 'unreviewed',
      basis: ['題目與子題結構已逐頁 PDF audit。', '現有 explanation 無官方答案或獨立人工審查紀錄。'],
      unresolvedIssues,
    },
    rubricItems,
    eligibility: {
      browseEligible: true,
      selfReviewEligible: true,
      autoGradeEligible: false,
      fullMockEligible: false,
    },
  })
}

const fragment = {
  metadata,
  answerReviews,
  practiceStatus: {
    schemaVersion: 1,
    subjectId: 'im-mis',
    status: 'draft',
    official: false,
    authority: 'origin/main questions and answers plus checked-in PDF audit artifacts in this clean worktree',
    answerPolicy: '所有答案皆非官方；只可 self-review，不可 auto-grade 或 full mock。',
    counts: {
      questions: metadata.length,
      explicitSubquestions: rubrics.reduce((sum, rubric) => sum + rubric.subquestions.length, 0),
      wholeQuestionRubrics: rubrics.filter((rubric) => rubric.wholeQuestionCriteria).length,
      selfReviewOnly: answerReviews.length,
      autoGradeEligible: 0,
      fullMockEligible: 0,
    },
    questions: Object.fromEntries(answerReviews.map((review) => [review.questionId, {
      status: 'self_review_only',
      practiceMode: 'essay_self_review',
      browseEligible: true,
      selfReviewEligible: true,
      autoGradeEligible: false,
      fullMockEligible: false,
      official: false,
      note: '開放式申論題；現有 explanation 僅為非官方待審草稿，使用 rubric 自評。',
    }])),
  },
}

const expectedIds = new Set(questions.map((question) => question.id))
const assertClosure = (records, label) => {
  const ids = records.map((record) => record.questionId)
  if (ids.length !== expectedIds.size || new Set(ids).size !== expectedIds.size) {
    throw new Error(`${label}: expected ${expectedIds.size} unique question IDs, got ${ids.length}/${new Set(ids).size}`)
  }
  for (const id of expectedIds) if (!ids.includes(id)) throw new Error(`${label}: missing ${id}`)
}
assertClosure(metadata, 'metadata')
assertClosure(rubrics, 'rubrics-internal')
assertClosure(answerReviews, 'answerReviews')

if (fragment.practiceStatus.counts.explicitSubquestions !== 76) throw new Error('expected 76 explicit subquestion rubrics')
if (fragment.practiceStatus.counts.wholeQuestionRubrics !== 9) throw new Error('expected 9 whole-question rubrics')
for (const question of questions) {
  const rubric = rubrics.find((entry) => entry.questionId === question.id)
  const metadataEntry = metadata.find((entry) => entry.questionId === question.id)
  const answerReview = answerReviews.find((entry) => entry.questionId === question.id)
  if (rubric.subquestions.length !== question.subQuestions.length) {
    throw new Error(`${question.id}: subquestion count mismatch`)
  }
  if (rubric.subquestions.length) {
    const total = rubric.subquestions.reduce((sum, entry) => sum + entry.points, 0)
    if (total !== question.points) throw new Error(`${question.id}: rubric points ${total} != ${question.points}`)
  } else if (rubric.wholeQuestionCriteria?.points !== question.points) {
    throw new Error(`${question.id}: whole-question points mismatch`)
  }
  if (metadataEntry.publication.autoGradeEligible || metadataEntry.publication.fullMockEligible) {
    throw new Error(`${question.id}: unsafe metadata eligibility`)
  }
  if (answerReview.eligibility.autoGradeEligible || answerReview.eligibility.fullMockEligible) {
    throw new Error(`${question.id}: unsafe answer-review eligibility`)
  }
  if (answerReview.answerMarker !== 'N/A' || !answerReview.explanationPresent) {
    throw new Error(`${question.id}: answer marker or explanation state mismatch`)
  }
}

fs.writeFileSync('.work/im-mis-metadata-rubrics-fragment.json', `${JSON.stringify(fragment, null, 2)}\n`)
console.log(JSON.stringify(fragment.practiceStatus.counts))
