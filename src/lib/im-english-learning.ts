import cardsRaw from '../../public/data/im-english-concept-cards.json'
import conceptMasterRaw from '../../public/data/im-english-concept-master.json'
import lessonsRaw from '../../public/data/im-english-lessons.json'
import questionMetadataRaw from '../../public/data/im-english-question-metadata.json'
import sourcesRaw from '../../public/data/im-english-source-registry.json'
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

export const imEnglishLearningCatalog = createLearningCatalog({
  examId: 'im',
  examLabel: '資管所',
  subjectId: 'im-english',
  subjectLabel: '英文 (B)',
  moduleLabel: '學習模組',
  lessons,
  cards,
  sources,
  overview: {
    topics,
    totalQuestions: questionMetadataRaw.totalQuestions,
    eligibleCount: questionMetadataRaw.counts?.autoGradeEligible ?? 0,
    disputedCount: 0,
    topicQuestionCounts,
    browseHref: '/im/questions?subject=im-english',
    copy: {
      taxonomyBadge: '題目已分類',
      eligibilityPrefix: '目前有',
      eligibleSuffix: '可自動判分；',
      disputedPrefix: '',
      disputedSuffix:
        '500 題選擇題，涵蓋閱讀、文法與字彙。英文不計入加權，但能拉開差距。',
      browseLabel: '瀏覽 500 題英文題庫',
      moduleTitle: '考試策略模組',
      moduleDescription:
        '四堂策略課：閱讀定位法、文法陷阱辨識、IT 專業字彙、考古題出題規律。從零建立應試技巧，不需要另外讀教材。',
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
      '策略與技巧為本站依歷屆考古題規律整理的非官方內容，實際考題可能與整理的模式不同。',
    objectivesTitle: '這堂課的目標',
    scenarioEyebrow: '情境',
    scenarioPrompt: '想像你現在坐在考場：',
    scenarioMappingTitle: '考場情境對照',
    scenarioEverydayHeader: '你的直覺反應',
    scenarioTechnicalHeader: '更有效的做法',
    scenarioBoundaryLabel: '注意：',
    scenarioCuesTitle: '看到這些訊號，想到這些策略',
    workedExamplesTitle: '解題示範',
    workedExampleLabel: '範例',
    workedExampleAnswerLabel: '答案與解析：',
    pitfallsTitle: '常見錯誤',
    cardsTitle: '快速自測',
    cardsDescription: '用這些概念卡檢查自己是否記住了關鍵策略。',
    practiceTitle: '開始練習',
    practiceDescription:
      '用考古題實際演練。先限時做完，再對答案檢討錯題。',
    practiceActionLabel: '開始練習英文考古題',
    sourcesTitle: '參考來源',
  },
  getPracticeHref: (lesson) =>
    buildQuestionDrillHref('im', lesson.pastPaperRefs, `/im/subjects/im-english/lessons/${lesson.id}`),
})
