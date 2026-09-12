# 正式站仍顯示舊 MCQ：唯讀核查

日期：2026-08-16

## 結論

正式站仍顯示舊 MCQ，不是瀏覽器快取，也不是 feature branch 修復失效；原因是修復只存在 `agent/fix-flashcard-practice`，尚未進入 `main`。部署 workflow 只會在 `main` push（或手動 dispatch）時部署，因此正式 Worker 目前仍使用 `origin/main` 的舊資料。

## Git 證據

- 目前分支：`agent/fix-flashcard-practice`
- 修復 commit：`7c60a7c fix(flashcards): 重建完整單字閃卡與 SRS 練習流程`
- `origin/main`：`821d576 fix(content): 修復資管英文 106 年考卷內容與答案`
- 兩者不是同一 commit；修復尚未合併至 `main`。

## 資料差異

以 `public/data/flashcards.json` 的 `examId=im`、`subjectId=im-english` 唯讀統計：

| 來源 | 英文卡總數 | MCQ prompt | 重複句型 `The professor emphasized...` |
|---|---:|---:|---:|
| feature branch HEAD (`7c60a7c`) | 4,728 | 0 | 0 |
| `origin/main` (`821d576`) | 5,452 | 5,113 | 2,859 |

feature branch 的首張資管英文卡 prompt 是直接單字 `indifferent`；`origin/main` 則仍含大量選擇題與重複模板。

## 部署規則

`.github/workflows/deploy.yml`：

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

部署 job 最後執行 `npm run deploy`，目標是 `grad-exam-prep.<subdomain>.workers.dev`。所以只 push feature branch 不會更新正式網址。

## 線上實際證據

依專案規範用 `stealth_fetch` 讀取：

`https://grad-exam-prep.vincent-xu-work.workers.dev/im/flashcards?subject=im-english`

頁面目前顯示：

- `英文(B)（5452）`
- 多筆 `The professor emphasized the importance of _____ ... (A)...(B)...(C)...(D)...`
- 這個 5,452 張數量與 `origin/main` 完全一致，而不是 feature branch 的 4,728 張。

## 必要下一步

將 `agent/fix-flashcard-practice` 合併至 `main` 並 push；待 `Deploy to Cloudflare Workers` workflow 成功後，再從正式網址驗證英文卡數為 4,728，且上述重複句型與 MCQ prompt 為 0。
