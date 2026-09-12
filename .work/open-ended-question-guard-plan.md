# 申論題安全護欄實作清單

- [x] 盤點 Question 型別、parser、題庫單題、群組題、模擬考與 practice API 路徑
- [x] 先新增共用 question grading policy 測試，覆蓋無選項、`N/A`、正常單選題
- [x] 新增題庫頁測試，確認申論題不產生 A–E 且顯示自評／唯讀提示
- [x] 新增模擬考 eligibility 測試，確認申論題不會進完整模擬考
- [x] 實作最小共用 responseType／gradingMode 判定與 guards
- [x] 執行聚焦測試、typecheck 與相關回歸測試
- [x] 記錄完成檔案與驗證結果

## 驗證結果

- 聚焦 Jest：3 suites、16 tests 全數通過；含真實 algo／arch／math CS 申論回歸。
- Biome：本次 6 個程式／測試檔案全數通過。
- 全域 typecheck 仍被共享工作樹既有的 `im-it-learning-content.test.ts` 與目前 lesson JSON schema 不一致阻擋；錯誤未指向本次修改檔案。
- 額外執行既有 `im-it-answer-review.test.ts` 時，因共享 public data 目前 corrected 筆數為 26、測試仍期待 44 而失敗；與本次 grading guard 無關。
