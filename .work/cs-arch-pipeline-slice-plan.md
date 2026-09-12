# cs-arch Pipeline 最小內容切片

- [x] 以 `origin/main` 六題 Pipeline refs 鎖定題面雜湊。
- [x] 建立 partial concept master、draft lesson、8 張 draft cards。
- [x] 建立 candidate metadata、非官方 answer review 與封閉 source registry。
- [x] 所有候選題維持 `autoGradeEligible=false`；爭議題明列 blockers。
- [x] 執行 builder check、validator 與 focused Jest tests。

範圍限制：不修改共用 component/route、`questions.json`、`answers.json` 或評分邏輯。
