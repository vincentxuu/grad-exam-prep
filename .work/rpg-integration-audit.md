# RPG 新模式整合盤點（2026-09-12，本地唯讀證據）

## 既有合約與具體風險

- `src/types/storage.ts`、`src/lib/storage.ts`：既有 localStorage key 為 `grad-exam-prep-state`，包含 completedTasks、srsState、paperPractice、dailyLearning、savedWords、preferences。sanitizeState 明列允許欄位；直接塞 RPG 欄位會在重新載入／匯入時消失。`recordTaskEvidence` 同時寫 dailyLearning 和 completedTasks，RPG 結算不能直接呼叫，否則改變原模式任務完成度。
- `src/lib/srs.ts`：可直接重用無副作用的 initialCardState、reviewCard、isDue；0/1/2 回憶評級，錯誤重置 1 日，成功初期為 1 日與 6 日。`src/store/flashcard.ts` 的 reviewCard 則會寫既有 srsState；RPG 若要求完全隔離，不可直接重用此 store。`pruneSRSState` 依現有卡片 ID 清除未知狀態，勿將 RPG question IDs 塞入原卡片 map。
- `src/lib/review-card.ts` 僅 content／lexicon 來源。題目複習與閃卡排程是兩個不同系統，不能聲稱目前所有錯題都有 SRS。
- `src/types/practice.ts`、`src/app/api/practice/route.ts`：現有練習模式 drill／mock／review，結果 correct／wrong／skipped，記在 D1 practice_records。API 只有必要欄位檢查，TypeScript union 不是 runtime mode 校驗。
- `src/app/api/practice/stats/route.ts` 不按 mode 過濾；`src/app/api/practice/review/route.ts` 也跨全部模式判定「錯過而未在之後答對」的題目。直接向既有 API 寫入 mode=rpg 會改變原模式統計與錯題清单，即使 TS 允許也不滿足隔離要求。
- `src/lib/question-practice-policy.ts` 可重用：明確答案且選项吻合才 auto；open_ended 有解析時為 self_review，無解析為 read_only；爭議題 read_only；fullMockEligible 只有 auto。Boss 數值分數只能用 auto 題，申論／證明題須獨立顯示自評與待複測，不能由看完解析推斷掌握。
- `src/components/question/drill-page.tsx`、`src/components/question-group-view.tsx` 內部會 POST 既有 practice API；直接把原練習頁包進 RPG 外觀會有資料副作用。
- `src/lib/question-drill.ts` 的 returnTo 白名單限 /[exam]/subjects/；RPG 不能假設直接傳 /[exam]/rpg 能正確返回。
- `src/lib/sync.ts`、`src/app/api/sync/route.ts`：既有同步是 StorageState 快照，雲端 key 固定 main，只有 dailyLearning 有 merge。其餘欄位採 incoming；新增 RPG 進此快照可能被舊客戶端上傳覆蓋。不能宣稱新增 localStorage 後即已有雲端同步。

## 建議的新增模式邊界

1. 新增 /[exam]/rpg/**、components/rpg、lib/rpg、types/rpg，原模式只新增入口；保留題庫原始 ID、來源、題目、解析與 policy，世界觀文字為獨立 metadata。
2. MVP 以 `grad-exam-prep-rpg-v1` 獨立儲存狀態，含 schemaVersion、examId 分區、attempts、rewards、questProgress、reviewSchedule；獨立匯出／匯入。明示 MVP 為本機存檔，跨裝置同步為另一交付。
3. 重用純函式與題目呈現元件時先拆出 onSubmit contract；RPG container 僅寫 RPG repository。不要改既有 API、sync payload、task evidence、flashcard store 行為。
4. XP 由一次 attempt／reward event ID 去重；解鎖、傷害與熟練度分開。使用提示／看答案／自評標記保留，不當成獨立答對。Boss 失敗仍保留實際學習記錄，可重試且不封鎖學習。
5. RPG 自有複習排程引用原 questionId/cardId；用同一 SRS 純函式但獨立 state，避免改動既有到期佇列。日後若要雙模式共用學習證據，另做可審查的明確整合規格。
6. 二期同步採獨立版本化 RPG contract、事件去重與衝突合併，不沿用 main 快照當作天然支援。

## 必要驗收

- RPG 完成／失敗／提示／複習／重試後，原 localStorage、原 D1 practice 記錄、原 SRS 到期數、任務完成狀態均不變。
- read_only 題不能發自動答對獎勵；self_review 題不能混入 auto 正確率。
- 重新整理恢復中途任務；重複提交／返回重進不重發獎勵；題目移除有安全降級。
- im／cs 存檔分離；匯入驗證 schema；損毀／儲存失敗提示不冒稱已保存。
- 原模式回歸只測新增入口與共享元件可能影響處，並沿用專案既有 checks。
