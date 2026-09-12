# 多科學習內容並行計畫

## 原則

- 內容研究可依科目並行。
- 正式資料仍由同一套 schema、來源規則與測試閘門整合。
- 不複製 `ImItLessonContent` 成多份科目元件。
- 沒有足夠題目、來源或答案可信度的科目，只做基線與補資料，不先上課程。

## 並行工作線

### A. MIS

- 盤點題目、答案、來源與既有五大主題。
- 建議首批 3–5 堂高頻課程。
- 每堂提出生活情境、可用 refs 與發布阻擋條件。
- 產物：`.work/mis-learning-foundation-plan.md`

### B. 統計

- 查明結構化題目數偏低的原因。
- 分開「可以從教材建立的課」與「有考古題證據的課」。
- 先提出補資料與答案覆核順序，不以五題假裝代表十年考情。
- 產物：`.work/stat-learning-foundation-plan.md`

### C. 資工三科

- 比較資料結構／演算法、計組／OS、數學的題量、來源與答案成熟度。
- 給出優先序與首批課程候選。
- 明確標示能與 IM-IT 共用的概念和不能直接複製的深度差異。
- 產物：`.work/cs-subject-learning-readiness.md`

## 主線：共用網站架構

### 目前耦合

- `src/lib/im-it-learning.ts` 直接 import 五份 IM-IT artifacts。
- `ImItLessonContent` 與 `ImItConceptOverview` 把科目名稱寫死。
- lesson route 只接受 `exam=im`、`subjectId=im-it`。
- subject page 只有 `im-it` 會顯示正式學習模組。

### 建議結構

1. 將型別抽到 `src/lib/subject-learning-types.ts`：
   - `SubjectLesson`
   - `LearningScenario`
   - `ConceptCard`
   - `LearningSource`
   - `SubjectLearningBundle`
2. 建立 `src/lib/subject-learning-catalog.ts`：
   - 以靜態 imports 登錄已發布科目，維持 Next build 可分析性。
   - 提供 `getLearningBundle(subjectId)`、`getLesson(subjectId, lessonId)` 等查詢。
3. 泛化 UI：
   - `ImItLessonContent` → `SubjectLessonContent`
   - `ImItConceptOverview` → `SubjectLearningOverview`
   - 科目名稱、題庫數、來源揭露與 route 由 bundle/config 傳入。
4. 泛化 route：
   - `/[exam]/subjects/[subjectId]/lessons/[lessonId]` 依 catalog 查找。
   - `generateStaticParams()` 從 catalog 產生所有已發布課程。
5. 每科沿用五份 artifacts：
   - `<subject>-concept-master.json`
   - `<subject>-question-metadata.json`
   - `<subject>-lessons.json`
   - `<subject>-concept-cards.json`
   - `<subject>-source-registry.json`

## 共用發布閘門

- Lesson/card/source/question refs 必須形成閉合集合。
- 引用題目必須符合該科發布政策；爭議題不得自動判分。
- 每課至少一個 reviewed source，且來源能直接支撐核心主張。
- 每課 learningScenario 需包含 predict、4–5 組 mapping、boundary、4 條 exam cues。
- 題數不足時不得用虛假的「高頻」敘述包裝。
- 所有科目使用相同的型別、路由、UI、手機版與可及性測試。

## 整合順序

1. 三條基線報告已完成：MIS、統計、CS 三科群都有 evidence-backed plan。
2. 先建立跨科申論安全護欄：`responseType`、`gradingMode`、rubric/self-review，並排除不可自動評分題。
3. 同步泛化共用 types/catalog/route/UI，保留 IM-IT 現有行為。
4. 第一個新增課程科目選 `cs-arch`，先做 Pipeline，再做 Virtual Address/TLB/Cache。
5. MIS 與統計同步建立 taxonomy/source/rubric 草稿，但申論 UI 完成前不進自動判分。
6. 後續科目順序：`cs-algo` → `cs-math`；沒有通過資料閘門的科目不建立空殼頁。

## 基線決策摘要

### MIS

- 37 題、106–115 年，題目資產足夠，但全部是申論題。
- Origin 仍有 29 題 A/B 佔位答案；28 題子題結構修復尚待整合。
- 首批可規劃 4 堂：IT strategy、平台策略、資料與 AI、系統取得與 UX。
- 發布前需要 essay rubric、非官方答案揭露與 reviewed source registry。

### 統計

- 106–113 年沒有統計考科；114–115 年實際只有 5 大題，不是漏抓。
- 可先做 4 組 PDF-backed lessons：聯合機率、不偏估計、迴歸判讀、卡方檢定。
- 114-5、115-3 的 origin 轉錄錯誤必須保留 workspace 修正版。
- 五題皆為非官方推導解答，第二審前只能當教材草稿。

### CS 三科

- 273 題的 `topicId` 全為 `null`；240 張 cards 全無題目 refs/source，169 張 topic ID 不在 canonical tree。
- Open-like 題卻保留單一 A–E 佔位答案：Algo 35、Arch 14、Math 41。
- 優先序：`cs-arch` → `cs-algo` → `cs-math`。
- 第一個最小切片：`cs-arch` Pipeline lesson，連同 metadata/answer-review schema 一起打通。

## 並行實作邊界

- 工作線 1：泛化 lesson types/catalog/components/routes；不碰題庫評分。
- 工作線 2：建立 open-ended response/grading guard 與 tests；不碰 lesson UI。
- 工作線 3：只建立 `cs-arch` Pipeline 的內容 artifacts 草稿與 validator；不改共用元件。
- 主線：整合、處理衝突、跑完整測試與 build，確認 IM-IT 沒有回歸。

## 2026-08-16 整合結果

- 已在 `origin/main@0cd1f91` 建立乾淨整合分支 `agent/multi-subject-learning`，未覆蓋舊工作樹的未提交檔案。
- 已泛化 learning types、靜態 catalog、overview、lesson component 與 lesson route；目前 catalog 只發布既有 IM-IT。
- IM-IT 維持 20 lessons、122 cards、28/61 covered subtopics，既有相容 exports 與 URL 不變。
- 已建立通用 question practice policy；open-ended、`N/A`、結構化子題與未核准題不再產生人工 A–E，也不進完整模擬考。
- 已建立 `cs-arch` Pipeline draft：1 lesson、8 cards、6 candidate refs、3 sources；全部 `publishEligible=false`、`autoGradeEligible=false`，尚未接入公開 catalog。
- Next 15 production build 發現 page 不允許額外 named export，已將 `SingleQuestionView` 抽到獨立 component 修復。

### 驗證

- Jest：33 suites、309 tests passed。
- TypeScript：`tsc --noEmit` passed。
- Biome：所有本次相關檔案 passed。
- Content validator：passed；382 個既有 taxonomy warnings 保留，沒有新增 failure。
- Paper integrity：61 papers、1475 questions，沒有新增 finding。
- Next production build：54 static pages generated，exit 0。
