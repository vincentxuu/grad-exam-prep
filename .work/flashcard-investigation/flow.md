# Flashcard practice investigation

## Plan

- [x] Trace the flashcard route and visible interaction sequence.
- [x] Trace store state, persistence, card selection, and answer grading.
- [x] Trace API/data sources and identify behavior that differs from conventional flashcards.
- [x] Record concise findings with source line references.

## Short answer

是，體感差異是真的。這頁不是常見的「打開牌組後直接逐張學習、答錯幾分鐘後重出」流程，而是：

1. 先進入可搜尋、篩選、直接展開答案的**卡片目錄**。
2. 另外按「開始複習」，才把目前篩選範圍內已到期的卡取前 50 張做成一次性的佇列。
3. 每張先自行在心中作答，再按「顯示答案」，接著自評「不會／普通／熟悉」。
4. 評分後直接前往下一張；即使按「不會」，本次也不會再出現，而是排到 1 天後。

核心是簡化、三段評分的 SM-2-like 排程；並不是 Anki 類的 learning/relearning steps。

## Actual interaction flow

- 進頁後從 localStorage 載入收藏單字與 SRS 狀態，再呼叫 `/api/flashcards?exam=...` 載入靜態卡；兩種來源正規化進同一個 `ReviewCard[]`。`src/app/[exam]/flashcards/page.tsx:90-135`
- 預設 `mode` 是 `browse`，不是逐卡練習。使用者可依科目、分級、搜尋文字縮小卡片，且可直接點任一卡展開答案與發音。`src/app/[exam]/flashcards/page.tsx:72-88`, `src/app/[exam]/flashcards/page.tsx:138-176`, `src/app/[exam]/flashcards/page.tsx:438-500`, `src/app/[exam]/flashcards/page.tsx:515-583`
- `dueCards` 是從**目前 filteredCards** 算出，所以搜尋字串、科目、tier 都會改變「開始複習」的內容；頁首 `dueCount` 卻是對 `allCards` 計算。`src/app/[exam]/flashcards/page.tsx:175-182`
- 按開始時將到期卡截成固定快照，最多 50 張；沒有洗牌。`src/app/[exam]/flashcards/page.tsx:32-33`, `src/app/[exam]/flashcards/page.tsx:184-189`
- 複習正面只顯示 prompt，可播放詞彙發音；按「顯示答案」後才看到答案與三個自評按鈕。沒有打字核對、選擇題、滑動手勢或自動判分。`src/app/[exam]/flashcards/page.tsx:228-312`
- 評分後寫入排程並線性移到下一張；末張完成即回目錄。按「不會」也沒有插回本次佇列。`src/app/[exam]/flashcards/page.tsx:191-203`
- 可隨時按「結束複習」，直接回目錄；沒有完成摘要或 session 統計。`src/app/[exam]/flashcards/page.tsx:234-253`

## Queue and state behavior

- 未見過的卡會用 `initialCardState(card.id, now)` 補狀態，而初始 `nextReview = now`，因此**所有新卡立即到期**。`src/lib/srs.ts:15-23`, `src/store/flashcard.ts:8-21`
- 到期佇列依 `nextReview` 由早到晚排列；同時間（所有新卡常見此情況）保持原始資料順序。沒有 new-card daily limit 或亂序。`src/store/flashcard.ts:13-21`; 大量未見卡維持輸入順序有測試鎖定：`src/__tests__/flashcard-store.test.ts:14-29`
- SRS 狀態預設存在瀏覽器 localStorage 的單一 `grad-exam-prep-state`，以 card id 為 key；另有需使用者手動操作的整包雲端上傳／下載，不是自動同步。`src/lib/storage.ts:4-15`, `src/lib/storage.ts:89-107`, `src/lib/storage.ts:141-149`, `src/components/sync/sync-panel.tsx:45-70`
- 靜態內容卡與「我的單字」共用 SRS map。`src/lib/review-card.ts:5-24`, `src/lib/review-card.ts:27-47`
- API 只供應指定考試的 production 卡；被 quarantine 的舊卡不進練習，但 id 暫時保留，避免載入頁面時清掉舊學習紀錄。`src/app/api/flashcards/route.ts:6-23`, `src/app/[exam]/flashcards/page.tsx:103-117`

## Scheduling algorithm

三個評分值為 `0 不會 / 1 普通 / 2 熟悉`。`src/lib/srs.ts:3-9`

| 評分 | repetitions | interval | ease factor |
|---|---:|---:|---:|
| 不會 | 歸零 | 1 天 | -0.2，最低 1.3 |
| 普通 | +1 | 第一次 1 天、第二次 6 天、之後 `round(interval × ease)` | 不變 |
| 熟悉 | +1 | 第一次 1 天、第二次 6 天、之後 `round(interval × ease)` | +0.1 |

實作：`src/lib/srs.ts:26-57`；排程測試：`src/__tests__/srs.test.ts:17-58`。

重要細節：第一次和第二次答「普通」或「熟悉」，間隔完全相同（1 天、6 天）；兩者只透過 ease factor 影響第三次以後。答「不會」也固定到明天，而非幾分鐘後重學。

## Why it feels unlike common flashcards

最可能造成差異感的順序如下：

1. **入口是卡片目錄，不是牌組 session。** 所有答案能在目錄直接展開。
2. **新卡洪水。** 新卡全部立刻到期；目前工作樹資料快照為 IM 4,736 張、CS 320 張，而每次只取最前 50 張。
3. **沒有新卡/複習卡配額分流。** 只有「是否到期」一條 queue，沒有每日新卡上限或新舊卡混排策略。
4. **答錯不在本次重出。** 它被排到隔天，不走常見的分鐘級 learning/relearning steps。
5. **評分很粗。** 三級自評，且「普通／熟悉」前兩次的間隔一樣；常見 Anki UI 是 Again/Hard/Good/Easy，並會預覽各按鈕的下次間隔。
6. **順序固定。** 新卡依 JSON 原順序進 queue，不洗牌；前 50 張做完後隔天又因成功卡到期，可能仍先看到相同一批，後面的新卡容易被擋住。
7. **本機優先狀態。** 排程平時只寫瀏覽器 localStorage；雖可手動上傳／下載整包狀態，但不是帳號型產品常見的自動同步。

其中第 6 點可由程式直接推導：同批前 50 張第一次成功後都排到 1 天後，剩餘未見卡仍是「現在到期」；若使用者立即再開始，會拿接下來的 50 張。但隔天第一批的 `nextReview` 比新卡當下產生的初始時間更早，依 overdue 排序可能重新排到前面。實際先後仍取決於開頁與開始 session 的時間。

## Content shape observed

- 目前工作樹的 `public/data/flashcards.json` 是未提交修改檔，以下只是本次讀取快照：共 5,056 張；IM 4,736 張全是 direct-recall vocabulary（正面只有 headword），CS 320 張則是較長的問答/概念卡。
- 這也會造成兩個考試的「閃卡」體感不一致：IM 更接近傳統單字卡，CS 比較像短答題庫。型別同時允許 vocabulary 與一般 prompt/answer：`src/types/content.ts:104-116`。

## Verification

Read-only targeted tests passed:

```text
Test Suites: 3 passed, 3 total
Tests:       16 passed, 16 total
```

Command: `npm test -- --runInBand src/__tests__/srs.test.ts src/__tests__/flashcard-store.test.ts src/__tests__/flashcards-route-quarantine.test.ts`
