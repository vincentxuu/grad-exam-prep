import cardsRaw from '../../public/data/im-it-concept-cards.json'
import conceptMasterRaw from '../../public/data/im-it-concept-master.json'
import lessonsRaw from '../../public/data/im-it-lessons.json'
import questionMetadataRaw from '../../public/data/im-it-question-metadata.json'
import sourcesRaw from '../../public/data/im-it-source-registry.json'
import {
  createLearningCatalog,
  type LearningConceptCard,
  type LearningLesson,
  type LearningScenario,
  type LearningSource,
  type LearningTopic,
  type LearningWorkedExample,
} from './learning'
import { buildQuestionDrillHref } from './question-drill'

export type ImItWorkedExample = LearningWorkedExample
export type ImItLearningScenario = LearningScenario
export type ImItLesson = LearningLesson
export type ImItConceptCard = LearningConceptCard
export type ImItSource = LearningSource

const lessons = lessonsRaw.lessons as LearningLesson[]
const cards = cardsRaw.cards as LearningConceptCard[]
const sources = sourcesRaw.sources as LearningSource[]
const topics = conceptMasterRaw.topics as LearningTopic[]

const topicQuestionCounts: Record<string, number> = {}
for (const question of questionMetadataRaw.questions) {
  topicQuestionCounts[question.topicId] = (topicQuestionCounts[question.topicId] ?? 0) + 1
}

export const imItLearningCatalog = createLearningCatalog({
  examId: 'im',
  examLabel: '資管所',
  subjectId: 'im-it',
  subjectLabel: '資訊科技概論',
  moduleLabel: '學習模組',
  lessons,
  cards,
  sources,
  overview: {
    topics,
    totalQuestions: questionMetadataRaw.totalQuestions,
    eligibleCount: questionMetadataRaw.answerReview.autoGradeEligible,
    disputedCount: questionMetadataRaw.answerReview.disputed,
    topicQuestionCounts,
    browseHref: '/im/questions?subject=im-it',
    copy: {
      taxonomyBadge: '分類已審核',
      eligibilityPrefix: '目前有',
      eligibleSuffix: '完成可重現的技術覆核，可用於單題練習；',
      disputedPrefix: '另有',
      disputedSuffix:
        '答案存在爭議，只提供瀏覽、不判分。全部答案皆非官方答案，暫不列入完整模擬考成績。',
      browseLabel: '瀏覽 260 題計概題庫',
      moduleTitle: '已上線學習模組',
      moduleDescription:
        '從考古題出現頻率高、且內容已完成獨立複查的主題開始。每堂包含短講義、解題範例、概念卡與已覆核考古題。',
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
    contentNotice: '本頁為依教材與考古題整理的原創摘要；考古題答案經技術覆核，但不是官方答案。',
    objectivesTitle: '先抓住這幾件事',
    scenarioEyebrow: '先想像這個場景',
    scenarioPrompt: '先別急著往下看，花十秒想一想：',
    scenarioMappingTitle: '把故事換成電腦語言',
    scenarioEverydayHeader: '生活中的角色',
    scenarioTechnicalHeader: '技術概念',
    scenarioBoundaryLabel: '比喻到這裡為止：',
    scenarioCuesTitle: '題目出現這些字，先想到',
    workedExamplesTitle: '一起拆題目',
    workedExampleLabel: '範例',
    workedExampleAnswerLabel: '所以答案是：',
    pitfallsTitle: '這裡最容易選錯',
    cardsTitle: '換你快速判斷',
    cardsDescription: '先在心中作答，再展開答案。答不出來時，回頭找本課的對照關係。',
    practiceTitle: '最後用考古題驗證',
    practiceDescription: '本課連結的題目都已通過可重現的技術覆核，可逐題練習與判分。',
    practiceActionLabel: '開始本課考古題練習',
    foundationPracticeTitle: '再到題庫找辨識線索',
    foundationPracticeDescription:
      '這個基礎主題在現有考古題中沒有可確認的直接題，所以不會為了湊數量而硬連題目。可回到完整題庫，練習辨識它與相鄰概念的關係。',
    foundationPracticeActionLabel: '瀏覽資訊科技概論題庫',
    sourcesTitle: '參考來源',
  },
  getPracticeHref: (lesson) => {
    if (lesson.pastPaperRefs.length === 0) return '/im/questions?subject=im-it'

    return buildQuestionDrillHref(
      'im',
      lesson.pastPaperRefs,
      `/im/subjects/im-it/lessons/${lesson.id}`
    )
  },
})

export function getImItLessons() {
  return imItLearningCatalog.lessons
}

export function getImItLesson(lessonId: string) {
  return imItLearningCatalog.getLesson(lessonId)
}

export function getImItCardsForLesson(lessonId: string) {
  return imItLearningCatalog.getCardsForLesson(lessonId)
}

export function getImItSources(sourceIds: string[]) {
  return imItLearningCatalog.getSources(sourceIds)
}
