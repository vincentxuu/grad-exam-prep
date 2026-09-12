import cardsRaw from '../../public/data/im-mis-concept-cards.json'
import conceptMasterRaw from '../../public/data/im-mis-concept-master.json'
import lessonsRaw from '../../public/data/im-mis-lessons.json'
import questionMetadataRaw from '../../public/data/im-mis-question-metadata.json'
import sourcesRaw from '../../public/data/im-mis-source-registry.json'
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

export const imMisLearningCatalog = createLearningCatalog({
  examId: 'im',
  examLabel: '資管所',
  subjectId: 'im-mis',
  subjectLabel: '資訊管理導論',
  moduleLabel: '學習模組',
  lessons,
  cards,
  sources,
  beginnerGlossary: getBeginnerGlossaryForSubject('im-mis'),
  overview: {
    topics,
    totalQuestions: questionMetadataRaw.totalQuestions,
    eligibleCount: 0,
    disputedCount: 0,
    topicQuestionCounts,
    browseHref: '/im/questions?subject=im-mis',
    copy: {
      taxonomyBadge: '分類與題面已審核',
      eligibilityPrefix: '目前有',
      eligibleSuffix: '可自動判分；',
      disputedPrefix: '另有',
      disputedSuffix:
        '題具爭議。37 題均為申論題，答案非官方，只提供逐小題 rubric 自評，不列入完整模擬考成績。',
      browseLabel: '瀏覽 37 題 MIS 題庫',
      moduleTitle: '已上線學習模組',
      moduleDescription:
        '依十年官方題面整理成七堂主題課。每堂用生活情境建立答題結構，再以歷屆申論題和逐項自評標準檢查答案。',
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
      '題面來自台大官方試卷；解析與逐項自評標準（rubric）為本站依已複查來源整理的非官方內容，策略申論容許有條件且有證據的替代論點。',
    objectivesTitle: '先抓住這幾件事',
    scenarioEyebrow: '先想像這個場景',
    scenarioPrompt: '先別急著背名詞，花十秒想一想：',
    scenarioMappingTitle: '把故事換成管理語言',
    scenarioEverydayHeader: '生活中的角色',
    scenarioTechnicalHeader: 'MIS 概念',
    scenarioBoundaryLabel: '比喻到這裡為止：',
    scenarioCuesTitle: '題目出現這些字，先想到',
    workedExamplesTitle: '一起搭作答骨架',
    workedExampleLabel: '範例',
    workedExampleAnswerLabel: '所以作答主軸是：',
    pitfallsTitle: '這裡最容易寫偏',
    cardsTitle: '換你快速判斷',
    cardsDescription: '先用自己的話說出定義、機制、條件與取捨，再展開答案。',
    practiceTitle: '最後用考古題自評',
    practiceDescription:
      '請先完成自己的申論，再依非官方解析和逐項自評標準檢查；不使用 A–E 假選項或虛假分數。',
    practiceActionLabel: '開始本課申論自評',
    sourcesTitle: '參考來源',
  },
  getPracticeHref: (lesson) =>
    buildQuestionDrillHref('im', lesson.pastPaperRefs, `/im/subjects/im-mis/lessons/${lesson.id}`),
})
