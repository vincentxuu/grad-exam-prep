# IM-IT learning content 合併 validator 必查項

## 文件與識別碼

- 根物件只接受 `lessons`、`cards` 陣列，且兩者不得為空。
- lesson/card `id` 必填、全域唯一，並符合穩定前綴規則；card 的 `lessonId` 必須指向同檔或已發布 lesson。
- `subtopicId` 必須存在於 `im-it-concept-master.json`，card 與其 lesson 的 `subtopicId` 必須相同。
- `reviewStatus` 僅接受既定 enum；draft 不得被 validator 自動提升為 reviewed/published。

## Lesson 完整度

- `estimatedMinutes` 必須為合理的正整數。
- `learningObjectives` 限 3–4 項，去除空字串與重複內容。
- `sections` 限 4–5 段；每段需有非空 `title`、`body` 與至少 2 個 `bullets`。
- `workedExamples` 至少 3 題；每題需有 `prompt`、至少 2 個 `steps` 與 `answer`。
- `commonPitfalls` 至少 4 項。

## 引用與考古題

- `sourceRefs` 每個值都必須存在於來源 registry；本批內容只能使用 `src-brookshear-13e`、`src-nthu-os-course`。
- 禁止把來源原文大段放入 body、bullets、cards；可加入相似度或超長連續字串警示供人工複核。
- lesson `pastPaperRefs` 至少 6 題，card 至少 1 題；ID 必須存在於 `questions.json`。
- 每個 past-paper question 的 metadata `primarySubtopicId` 必須等於內容 `subtopicId`。
- 每個 past-paper question 的 `publication.autoGradeEligible` 必須為 true；若答案後續降級，內容建置應立即失敗。
- pastPaperRefs 應去重；不得引用 open-response/programming 題冒充可自動判分練習。

## Card 品質

- 每堂 lesson 的 concept cards 數量需符合發行規格，本批固定為 8 張。
- `front`、`back`、`explanation` 均必填；front 不得與同 subtopic 其他 card 重複。
- card `sourceRefs`、`pastPaperRefs` 不得超出所屬 lesson 的 refs 集合。
- 避免只背答案字母；front/back 必須能脫離特定選項獨立理解。

## 發布安全閘

- schema 驗證、引用完整性與文字 lint 通過，不代表內容已審核；`draft` 必須經人工技術覆核才能發布。
- 建議產生 deterministic content hash；內容、來源或題目 eligibility 改變時，需重新觸發審核。
