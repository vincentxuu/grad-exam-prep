# pp-im-en-106 warning trace

## 結論

- 截圖中的警告是 **paper-level**，不是 question-level。第 1 題只要屬於 `pp-im-en-106` 就會顯示，與第 1 題本身是否完整無關。
- 直接觸發來源是 `public/data/past-papers.json:374-383`：`pp-im-en-106` 仍有 `contentStatus: "incomplete"` 與舊的 `contentIssue`。
- 這個理由已經與目前 runtime 資料不一致：`questions.json` 的 Q21/Q27/Q33/Q41/Q46 已帶題組範圍和文章（`public/data/questions.json:8443-8449, 8515-8521, 8587-8593, 8683-8689, 8743-8749`）。`node scripts/check-paper-integrity.js` 目前也回報 61 份、1475 題，沒有新增問題；baseline 為空（`scripts/paper-integrity-baseline.json:1-3`）。因此警告的「文章沒抽進來」屬於 stale metadata。
- 但現在的文章文字仍有資料品質問題，例如 Q21、Q27、Q33 有重複句段，Q41/Q46 有 OCR 殘缺或異常字元（同上行號）。所以「缺文章」已修好不等於已逐字校對完成；要解除整卷排除前，應決定這些瑕疵是否仍足以令答案不可信。

## Render / status flow

1. 題目頁在 single-question view 無條件傳入 `question.paperId`：`src/app/[exam]/questions/[questionId]/page.tsx:121-138`。
2. `PaperContentWarning` 呼叫 `getPaperContentIssue(paperId)`；只要該 paper 有 `contentStatus` 就 render，完全不檢查目前題號：`src/components/paper-content-warning.tsx:14-25`。
3. `getPaperContentIssue` 從 `past-papers.json` 查 paper 並以 `contentStatus` 判斷：`src/lib/content.ts:135-156`。
4. 因此 Q1 也會顯示 Q21-50 的問題描述。題組頁同樣以整份 paper 顯示：`src/components/question-group-view.tsx:120-131`；題庫套用某卷篩選時也顯示：`src/app/[exam]/questions/page.tsx:98-107`。

## 模擬考影響

- 排除集合是所有帶 `contentStatus` 的 paper id：`src/lib/content.ts:143-170`。
- 模擬考將所有題目交給 `getReliableQuestions`，所以 `pp-im-en-106` 全 50 題仍被排除：`src/app/[exam]/mock/page.tsx:42-45`。
- 測試明確釘住「排除整份」以及 106 必須為 incomplete：`src/__tests__/paper-content-status.test.ts:27-37, 46-50`。

## 為何修過內容仍保留警告

- `scripts/flag-paper-content-status.js:19-24, 45-61` 仍把 `pp-im-en-106` 寫回 incomplete；重跑會恢復舊標記，不能只手改 JSON。
- 內容修復與狀態標記沒有同一個 source of truth／reconciliation：完整性檢查只比對偵測結果與 baseline（`scripts/check-paper-integrity.js:195-217`），不會清除 `past-papers.json` 的 `contentStatus`。
- app runtime 讀 `questions.json`（`src/lib/content.ts:12-28`）。`public/data/qfiles/q-pp-im-en-106-21.json:1` 仍是舊的 `[Passage I Cloze]` 單句版本，雖不造成目前頁面警告，但顯示兩份題目資料已不同步，之後若有工具以 qfiles 為準可能再引入舊內容。

## 建議修復範圍

若確認 Q21-50 已足以作答並準備解除警告，需一起處理：

1. 從 `past-papers.json` 移除 106 的 `contentStatus/contentIssue`。
2. 從 `flag-paper-content-status.js` 的 `FLAGS` 移除 106，避免重跑復活。
3. 更新 `paper-content-status.test.ts` 中硬編碼的 106 expectation，並保留其他存疑卷的整卷排除測試。
4. 同步 `qfiles`；並最好先校對 Q21/Q27/Q33/Q41/Q46 的重複段落與 OCR 殘字，再決定是否解除整卷的可靠性限制。
