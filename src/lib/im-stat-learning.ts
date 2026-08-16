import cardsRaw from '../../public/data/im-stat-concept-cards.json'
import conceptMasterRaw from '../../public/data/im-stat-concept-master.json'
import lessonsRaw from '../../public/data/im-stat-lessons.json'
import questionMetadataRaw from '../../public/data/im-stat-question-metadata.json'
import sourcesRaw from '../../public/data/im-stat-source-registry.json'
import { getBeginnerGlossaryForSubject } from './beginner-glossary'
import {
  createLearningCatalog,
  type LearningConceptCard,
  type LearningLesson,
  type LearningSource,
  type LearningTopic,
} from './learning'
import { buildQuestionDrillHref } from './question-drill'

const lessons = lessonsRaw.lessons as LearningLesson[]
const cards = cardsRaw.cards as LearningConceptCard[]
const sources = sourcesRaw.sources as LearningSource[]
const topics = conceptMasterRaw.topics as LearningTopic[]

const topicQuestionCounts: Record<string, number> = {}
for (const question of questionMetadataRaw.questions) {
  topicQuestionCounts[question.topicId] = (topicQuestionCounts[question.topicId] ?? 0) + 1
}

export const imStatLearningCatalog = createLearningCatalog({
  examId: 'im',
  examLabel: '資管所',
  subjectId: 'im-stat',
  subjectLabel: '統計學',
  moduleLabel: '學習模組',
  lessons,
  cards,
  sources,
  beginnerGlossary: getBeginnerGlossaryForSubject('im-stat'),
  overview: {
    topics,
    totalQuestions: questionMetadataRaw.totalQuestions,
    eligibleCount: 0,
    disputedCount: 0,
    topicQuestionCounts,
    browseHref: '/im/questions?subject=im-stat',
    copy: {
      taxonomyBadge: '分類與題面已審核',
      eligibilityPrefix: '目前有',
      eligibleSuffix: '可自動判分；',
      disputedPrefix: '另有',
      disputedSuffix:
        '題具爭議。現有 5 題均為申論或計算題，答案非官方，只提供逐步解析與逐項自評標準，不列入完整模擬考成績。',
      browseLabel: '瀏覽 5 題統計題庫',
      moduleTitle: '已上線學習模組',
      moduleDescription:
        '以 114–115 年官方題面建立四堂微課，另補兩堂必要先備。沒有考古題的年份不會被誤說成缺卷或自行補題。',
      subtopicUnit: '個子主題',
      lessonQuestionUnit: '題',
      lessonActionLabel: '開始學習',
      objectivesLabel: '學習目標',
      subtopicsLabel: '子主題',
      topicQuestionUnit: '題',
    },
  },
  lessonCopy: {
    reviewBadge: '內容已複查',
    cardUnit: '張概念卡',
    pastPaperUnit: '題對應考古題',
    contentNotice:
      '題面來自台大官方試卷；解答與逐項自評標準（rubric）為本站技術覆核的非官方內容，申論與推導一律採自評。',
    objectivesTitle: '先抓住這幾件事',
    scenarioEyebrow: '先想像這個場景',
    scenarioPrompt: '先別急著套公式，花十秒想一想：',
    scenarioMappingTitle: '把故事換成統計語言',
    scenarioEverydayHeader: '生活中的角色',
    scenarioTechnicalHeader: '統計概念',
    scenarioBoundaryLabel: '比喻到這裡為止：',
    scenarioCuesTitle: '題目出現這些字，先想到',
    workedExamplesTitle: '一起拆計算',
    workedExampleLabel: '範例',
    workedExampleAnswerLabel: '所以答案是：',
    pitfallsTitle: '這裡最容易算錯',
    cardsTitle: '換你快速判斷',
    cardsDescription: '先口述定義、條件與下一步，再展開答案；公式不是取代條件檢查的捷徑。',
    practiceTitle: '最後用考古題自評',
    practiceDescription:
      '請先在紙上完成推導，再依非官方解析與逐項自評標準檢查；本流程不產生虛假的 A–E 分數。',
    practiceActionLabel: '開始本課考古題自評',
    foundationPracticeTitle: '先完成必要先備',
    foundationPracticeDescription:
      '這堂是解歷屆題前的基礎補充，不會為了湊題數硬連不存在的考古題。完成後可回題庫辨識題型。',
    foundationPracticeActionLabel: '瀏覽統計學題庫',
    sourcesTitle: '參考來源',
  },
  getPracticeHref: (lesson) => {
    if (lesson.pastPaperRefs.length === 0) return '/im/questions?subject=im-stat'

    return buildQuestionDrillHref(
      'im',
      lesson.pastPaperRefs,
      `/im/subjects/im-stat/lessons/${lesson.id}`
    )
  },
})
