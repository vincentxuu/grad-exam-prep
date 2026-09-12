# Flashcard practice investigation

Status: complete (2026-08-16)

## Question

Does the current flashcard practice differ from common flashcard workflows, and if so, how?

## Checklist

- [x] Trace the current UI interaction and session state.
- [x] Inspect scheduling, grading, persistence, and tests.
- [x] Compare the observed behavior with common flashcard conventions.
- [x] Record evidence-backed conclusions and any likely defects.

## Findings

使用者的感覺是對的，但差異主要不在卡片正反面，而在入口、queue 與排程：

- IM 英文卡已是常見的 direct recall：正面只有單字／片語，背面是完整解釋。
- 預設入口卻是可搜尋、篩選、任意展開答案的卡片目錄；按「開始複習」後才進逐張 session。
- 所有未見卡立即算到期。目前工作樹 IM 有 4,736 張，因此第一次使用會直接形成數千張 backlog；沒有 New / Learning / Review 分流或每日新卡上限。
- session 固定取目前 filtered due queue 的前 50 張，保持資料順序、不洗牌，也不會在啟動後動態補卡。
- 畫面標示 SM-2，但實際是 0/1/2 三段式簡化版本。原始 SM-2 使用 0–5 quality scale；目前「普通／熟悉」前兩次都排 1 天、6 天，只在 ease factor 上不同。
- 按「不會」後不會在同一輪重出，而是直接排到 1 天後。原始 SM-2 要求當天 session 結束後重複低分卡直到通過；Anki 類產品則通常提供分鐘級 learning/relearning steps。
- 下一次間隔沒有顯示在評分按鈕上，也沒有 session 完成摘要。
- SRS 平時存在 localStorage；另有手動整包雲端上傳／下載，但不是自動跨裝置同步。

因此目前比較像「卡片資料庫 + 每天批次過 50 張」，而不是常見的「控制每日新卡量、答錯短期重練、再逐步拉長間隔」的學習循環。

## Suggested direction

若目標是貼近常見且不讓使用者困惑，優先順序建議：

1. 將新卡、學習中、到期複習分開，先處理既有到期卡，再以每日上限引入新卡。
2. 「不會」改成同輪／數分鐘後回流；成功完成 learning steps 後才進 1 天、數天的正式排程。
3. 評分按鈕顯示預估間隔；可採 Again / Hard / Good / Easy，或更簡單的 Again / Good，而不是目前效果不直觀的三段評分。
4. 把「今日複習」做成主要入口，完整目錄保留為次要的「瀏覽卡片」。
5. 加入 session 結果：完成、答錯、剩餘新卡與今日到期數。

## Evidence

- Current flow and code evidence: `flow.md`
- Repo requirements, tests, and historical intent: `expectations.md`
- Anki study flow and answer buttons: https://docs.ankiweb.net/studying.html
- Anki daily limits and learning/relearning steps: https://docs.ankiweb.net/deck-options.html
- Original SM-2 algorithm: https://www.super-memory.com/english/ol/sm2.htm

## Verification

- `npm test -- --runInBand src/__tests__/srs.test.ts src/__tests__/flashcard-store.test.ts`
- Result: 2 suites, 13 tests passed.
