# 資管所統計學學習內容基線與建置計畫

更新日期：2026-08-16

## 1. 結論摘要

目前正式歷屆題中只有 5 題統計學大題，並不是資料漏抓：106–113 年台大資管所尚未設置獨立統計考科；114 年才在「資訊管理與統計學」合併卷出現 2 題統計，115 年有 3 題統計。這 5 題合計約 12 個實質作答任務，足以先建立 4 組「歷屆題導向」課程，但不足以單獨支撐完整統計學課綱或大量自動練習。

目前 workspace 中的 114、115 年題目文字已依官方 PDF 修復並有快照／PDF hash 驗證；其中 114-5、115-3 在 `origin/main` 仍是錯誤轉錄，不能把遠端舊版本當成內容權威。5 題詳解則是自行推導，不是官方答案；可作為教材草稿，但公開成正式課程前應補第二位技術審閱者及明確的非官方標示。

最急迫的產品風險不是題目數量，而是現行題庫與模擬考仍可能把申論題當成 A–E 選擇題，並拿 `N/A` 當答案自動計分。統計題在完成申論題作答型態、rubric／自評流程之前，不應進入自動計分的模擬考。

## 2. 資料權威與版本界線

統計內容應依下列優先序判定：

1. 台大官方 114、115 年原始 PDF：題目文字與頁面配置的最高權威。
2. workspace 的 `im-mis-stat-paper-verification.json`、replacement manifests 與來源完整性測試：記錄 PDF hash、題目快照 hash、頁面證據與修復原因。
3. workspace 的 `questions-im.json`：已套用 114-5、115-3 轉錄修正與子題結構，適合做目前開發基線。
4. workspace 的 `answers-im.json`：屬非官方推導解答，只能作為待複核教材。
5. `origin/main`：114-5、115-3 仍含重大錯誤轉錄，不可直接回填或覆蓋 workspace 修正版。

因此，後續合併或資料重建時，必須保留 workspace 的 manifest 與驗證檔；若由 `origin/main` 重抽資料，應先以 PDF 和 hash 驗證，不得僅依既有 JSON。

## 3. 為何只有少量結構化題目

| 年度 | 統計學考科狀態 | 可用統計題 | 判定 |
| --- | --- | ---: | --- |
| 106–113 | 尚未設置統計學考科 | 0 | 不適用，不是缺卷或漏抽 |
| 114 | 資訊管理與統計學合併卷 | 2 題，35 分 | Q4–Q5 為統計部分 |
| 115 | 資訊管理與統計學合併卷 | 3 題，50 分 | Q3–Q5 為統計部分 |

114、115 年共 5 題大題；依題面子題拆分，約有 12 個實質任務。資料量少的原因是考科歷史短且題型為大題／申論，不是 extraction pipeline 應該補出數十題卻失敗。

106–113 年可以保留 paper record 來說明「該年不適用」，但不得合成統計題、把 MIS 題誤標為統計題，或將「沒有統計考科」顯示成「PDF 缺失」。

## 4. 現有資料盤點

| 資料面 | `origin/main` | 目前 workspace | 判讀 |
| --- | --- | --- | --- |
| 歷屆統計題 | 5 題 | 5 題 | 數量相同，僅 114–115 年存在 |
| 子題結構 | 5 題均無結構化子題 | 4 題有子題，共 11 個明示子題；115-5 為單一任務 | workspace 較接近原卷 |
| 題目文字 | 114-5、115-3 錯誤轉錄 | 已依 PDF 修正 | 以 workspace + manifest 為準 |
| 答案欄 | 5 題均為虛構 A/C 字母答案 | 5 題均為 `N/A` | 申論題不可用選項字母計分 |
| 詳解 | 有內容但部分基於錯題 | 有重新推導詳解 | 非官方，仍需第二審 |
| Past-paper records | 106–115 共 10 筆 | 106–115 共 10 筆 | workspace 已正確說明 106–113 不適用 |
| PDF | 114、115 有官方來源 | 114、115 有本地 PDF 與 page render | 可做視覺與 hash 驗證 |
| 驗證資料 | 未包含目前完整驗證檔 | 有 paper verification、replacement manifests 與 integrity test | 應隨修復一起合併 |
| 統計 flashcards | 50 張 legacy cards | 正式資料為 0；50 張已隔離保存 | 隔離是刻意的品質措施 |
| 統計 lessons | 無 | 無 | 需建立新內容管線 |
| 科目 topic tree | 4 個主題、16 個字串子題 | 相同 | 可作初稿，尚非 canonical concept graph |
| materials | 4 筆，3 筆有 URL | 相同 | 來源與版本 metadata 不足 |

另有兩個需清理但不阻擋教材規劃的資料問題：

- `paper-images.json` 仍有 `pp-im-stat-111` 指向不存在目錄的 stale paths。
- 50 張 legacy 統計 flashcards 雖已從 production 隔離，但其 IDs 應保留作既有 SRS 歷史／遷移參照，不宜直接刪除或原樣恢復。

## 5. 實際存在的題型與知識覆蓋

| 題號 | 題型與任務 | 可連結主題 |
| --- | --- | --- |
| 114-4 | 解讀複迴歸輸出、調整後 R²、殘差自由度／截距 t 值、聯合 F 檢定 | regression、hypothesis testing |
| 114-5 | 加權估計量的不偏性與變異數 | estimation、sampling |
| 115-3 | 聯合 PMF 正規化、隨機變數轉換後的聯合 PMF、邊際 PMF | probability、discrete random variables |
| 115-4 | 不偏估計量、以 α／β 最小化變異數並比較效率 | estimation、sampling |
| 115-5 | 列聯表的卡方獨立性檢定 | chi-square、hypothesis testing |

目前歷屆題沒有直接覆蓋、不能宣稱已由考古題驗證的內容包括：描述統計、常見分配的系統性教學、抽樣分配完整脈絡、信賴區間、單一母體假設檢定、ANOVA 完整流程、簡單線性迴歸從建模到診斷等。這些仍可教，但必須標成「基礎補充／自編練習」，不能偽裝成歷屆題覆蓋。

## 6. 答案與來源可信度

| 內容 | 目前可信度 | 理由 | 發布條件 |
| --- | --- | --- | --- |
| 114、115 題目文字 | 高 | 官方 PDF、人工視覺稽核、hash／snapshot 鎖定 | 保留來源頁與驗證資料 |
| 年度與配分 | 高 | 官方合併卷與驗證 manifest 一致 | 可直接呈現 |
| 子題切分 | 中高 | 依官方題面補結構，但仍屬資料模型轉寫 | UI 需保留原題版面參照 |
| workspace 詳解 | 中 | 技術上已重新推導，但非官方答案 | 第二位審閱者簽核；標示非官方 |
| `origin/main` 的 114-5、115-3 | 低／不可用 | 與官方 PDF 不符且導致錯誤推導 | 禁止發布，必須以修正版取代 |
| legacy 50 張 flashcards | 低 | 無 concept-master provenance，taxonomy 不完整 | 不直接恢復；重新產製與審核 |
| 現有 materials 清單 | 中低 | 部分有公開 URL，但缺章節、版本、引用範圍與審閱狀態 | 建立 source registry 後再引用 |

公開解答建議新增下列 provenance 欄位，而不是只留下 explanation 字串：

- `answerType: "non_official_worked_solution"`
- `sourceEvidence`: 官方 PDF、頁碼、snapshot hash
- `solutionAuthors`／`reviewers`
- `reviewStatus`: draft、technical-reviewed、published
- `reviewedAt`
- `confidence` 與已知限制
- 每一子題的 `rubricItems`、配分與可接受等價表達

## 7. 目前資料缺口

### P0：會造成錯誤產品行為

- 缺少通用的申論題 `responseType`；目前 UI 可能把沒有 choices 的題目生成人工 A–E 選項。
- `answer: "N/A"` 仍可能進入選擇題式自動批改與模擬考計分，造成使用者無法得分。
- 統計題尚未接上 `self_review_only`／rubric scoring；現有相關邏輯只服務 im-it。
- 模擬考可靠題目篩選只看 paper content status，未排除 open-ended／不可自動批改題。

### P1：學習內容架構缺口

- 沒有 stats concept master、source registry、question metadata、practice status。
- subject JSON 的子題只是顯示字串，沒有穩定 concept IDs、先備關係、教材與題目的 mapping。
- 現有統計題沒有結構化難度、題型、知識點、步驟 rubric、常見錯誤。
- 目前 lessons／concept cards 架構硬編在 im-it，尚未抽象成多科共用模型。

### P2：內容量與來源缺口

- 只有 5 題歷屆申論題，無法支撐大量間隔複習或逐小節練習。
- 50 張 legacy cards 缺來源與 taxonomy provenance，目前 production 正確地維持 0 張。
- materials 缺作者／版本／章節／license 或引用範圍；「補習班統計學講義」只是 placeholder。
- 現有科目備註含未驗證的個人讀書經驗，不宜作為正式課程承諾。

## 8. 可立即安全教授的內容

下列內容可先以官方題面為案例、非官方推導為草稿，經第二審後發布：

1. 離散聯合機率與變數轉換：正規化、support mapping、聯合與邊際 PMF。
2. 不偏估計與效率：加權平均、權重和、不偏性、變異數與最適權重。
3. 複迴歸輸出判讀：調整後 R²、自由度、t 與聯合 F 檢定。
4. 卡方獨立性檢定：觀察值、期望值、自由度、檢定結論與限制。

發布時應同時展示：官方題目來源、解答非官方標示、完整運算步驟、常見錯誤、概念前置閱讀，以及「這個比喻在哪裡失效」。

## 9. 尚不可安全發布的部分

- `origin/main` 未修復的 114-5、115-3 題文與其舊解答。
- 把五題申論題呈現成 A–E 選擇題或納入自動計分模擬考。
- 未經第二位統計內容審閱者確認的詳解、配分 rubric 與數值答案。
- 原樣恢復 50 張 legacy flashcards。
- 宣稱 106–113 年有統計考古題，或用自編題補成年份題目。
- 把目前 5 題的覆蓋範圍描述成完整統計課程。
- 未附正式來源資訊的教材摘錄、講義內容或對外學習成效承諾。

## 10. 補資料與產品修正順序

### 階段 0：固定正確來源基線

- 合併並保留 workspace 的 114-5、115-3 修正、子題結構、paper verification、replacement manifests 與 integrity tests。
- 以官方 PDF hash 與 ordered-question snapshot 防止後續回歸。
- 清理 `pp-im-stat-111` stale image paths，但保留 106–113 的「考科不適用」paper records。

### 階段 1：先修正申論題產品模型

- 新增 `responseType: multiple_choice | numeric | short_answer | open_ended`。
- 為申論題加入 `rubricItems`、子題配分與 `gradingMode: self_review | manual_review`。
- 在 rubric/self-review 上線前，把 open-ended／`N/A` 題排除於自動批改與可計分模擬考。
- 題庫頁仍可閱讀與逐步揭露詳解，但不可顯示虛假的 A–E 選項或百分比成績。

### 階段 2：建立統計概念與來源主檔

- 建立共用、非 im-it 專屬的 concept master、source registry、question metadata、practice status schema。
- 將 subject 的 4 個上層主題拆成 canonical concept IDs，補先備關係與 alias。
- 每題／子題映射到 concept IDs、來源頁、解答審閱狀態與可否自動評分。
- 對 legacy cards 建立 archived-ID mapping，但不直接重新啟用。

### 階段 3：發布首批 4 組 PDF-backed lessons

- 每課先經內容審閱，附官方題目與非官方詳解聲明。
- 每課拆成：直覺、公式、 worked example、歷屆題引導、常見錯誤、self-check rubric。
- 將 5 題約 12 個任務轉成可追蹤的課後自評項目，而不是 5 個字母答案。

### 階段 4：重建概念卡與基礎練習

- 從 reviewed lessons 產生 atomic concept cards，禁止從 legacy cards 直接複製進 production。
- 先做每個上層主題約 10 題、共 40 題的自編基礎練習；清楚標示非歷屆題與來源。
- 數值／單選題只有在答案唯一且容差規則明確時才自動批改；推導與解釋題採 rubric 自評。

### 階段 5：持續納入新年度考題

- 116 年以後若仍有統計部分，沿用 PDF → visual audit → structured subquestions → solution review → hash lock 流程。
- 永遠不要為 106–113 補造統計考題。

## 11. 首批課程候選與生活比喻

### 課程 A：把聯合機率表「搬家」

- 對應題：115-3。
- 核心：PMF 正規化、support、變數轉換、合併重複映射、邊際化。
- 生活比喻：把一張格子上的抽獎券，依新標籤搬進 `Y1`、`Y2` 籃子；不同舊格若搬到同一新格，票數要相加。
- 比喻限制：機率不是實體票券；連續型變數轉換還需要 Jacobian，不能沿用純加票模型。

### 課程 B：如何合併多支有雜訊的溫度計

- 對應題：114-5、115-4。
- 核心：線性估計量、不偏條件、變異數、最小變異權重與效率。
- 生活比喻：多支溫度計各有雜訊，權重代表你採信每支讀數的程度；權重總和不正確會使整體刻度偏掉，等品質且獨立時平均分配通常最穩。
- 比喻限制：若儀器有不同變異數或彼此相關，等權重不一定最佳；必須回到 covariance 結構。

### 課程 C：讀懂迴歸儀表板

- 對應題：114-4。
- 核心：係數、標準誤、t 值、殘差自由度、調整後 R²、聯合 F 檢定。
- 生活比喻：用一組家庭垃圾來源的儀表板判斷哪些因素共同提供預測訊號；調整後 R² 像會對多裝無用旋鈕扣分的績效表，F 檢定則問「這一整組旋鈕一起加入是否真的有幫助」。
- 比喻限制：係數與顯著性不等於因果；共線性、模型設定與資料品質仍會影響解讀。

### 課程 D：座位分布是否真的互不相關

- 對應題：115-5。
- 核心：列聯表、獨立性下的期望次數、卡方統計量、自由度與結論。
- 生活比喻：比較店內不同時段與商品選擇的實際格數，和「時段、商品若互不相關」時應出現的格數；差距累積得夠大才懷疑兩者有關。
- 比喻限制：顯著關聯不代表因果；期望次數過小與抽樣方式不當會破壞檢定條件。

### 必要先備課（非歷屆題背書）

- 描述統計與變異數直覺。
- 機率規則、隨機變數與期望值。
- 抽樣分配與假設檢定的共同流程。

這些先備課應引用經審核的教科書章節或公開課程來源，並明確標為「基礎補充」，不宣稱是 114–115 歷屆題完整覆蓋。

## 12. 建議的跨科共用資料架構

為避免再做一套只服務 im-stat 的硬編流程，建議抽象成：

- `concepts-{subject}.json`：canonical concept IDs、名稱、說明、先備概念、alias。
- `sources-{subject}.json`：作者、版本、URL、章節／頁碼、license／使用方式、審閱狀態。
- `lessons-{subject}.json`：lesson blocks、概念 mapping、來源引用、review status。
- `concept-cards-{subject}.json`：atomic card、概念、來源、lesson link、archive／migration metadata。
- `question-metadata-{subject}.json`：題型、子題、概念、難度、來源頁、grading mode、solution provenance。
- `practice-status-{subject}.json`：是否可發布、可自動批改、可進模擬考、blocking reasons。

UI 與 loader 應以 `subjectId` 驅動，不應再把 im-it 寫死在 route、component 或判斷式中。不同科目可以共用骨架，但 grading mode、內容型態與教學 block 應允許科目差異。

## 13. 第一階段完成標準

- 106–113 年不會被誤顯示為缺卷，也不會出現合成統計題。
- 114、115 的 5 題與官方 PDF、snapshot hash 一致，114-5／115-3 不會退回錯誤轉錄。
- 所有統計申論題不再產生 A–E 假選項，也不會以 `N/A` 自動計零分。
- 自動計分模擬考只納入可機器評分題；申論題有明確的 self-review／manual-review 標示。
- 5 題詳解都標示為非官方，並至少完成第二位技術審閱者簽核。
- 首批 4 組課程均有 concept、source、question、rubric mapping。
- production 不直接恢復 legacy 50 cards；新卡均能追溯至 reviewed lesson/source。
- source integrity tests 同時驗證 PDF hash、題序、子題、圖片存在、grading mode 與 mock eligibility。

## 14. 建議下一個實作切片

先做「通用申論題安全護欄」：新增 response/grading type、阻止 `N/A` 題進入自動計分、為題庫提供 self-review 呈現。這個切片不依賴大量新內容，也能立刻消除目前統計題最嚴重的錯誤體驗；完成後再建立 concept/source schema 與課程 A–D。
