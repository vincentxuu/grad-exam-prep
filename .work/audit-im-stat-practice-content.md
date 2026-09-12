# 資管所統計學 `im-stat` 練習內容稽核

## 執行摘要

`im-stat` 目前有足以做「概念複習 + 手動寫真題」的內容，但還沒有可正常計分的站內練習體驗。

- 概念骨架：4 個 topics、16 個 subtopics，適合作為 syllabus，不是練習內容。
- 教材：4 筆；3 筆有明確外部連結，1 筆是沒有連結的泛稱占位。
- 閃卡：50 張，皆有 prompt/answer，可進 SRS；但偏長、沒有真題引用，topic taxonomy 有 33/50 張懸空。
- 真題：只有 114、115 兩年，合計 5 道大題、85 分、約 12 個實質小題；這是因為統計自 114 年才納入，不是漏收 106-113。
- 答案：5/5 都有經 PDF 稽核後的完整解析，內容品質高；`answer: "N/A"` 對申論題是正確資料建模。
- 練習 UI：目前不認得 open-ended / `N/A`。題庫強迫選 A-E，使用者必定被判錯；模擬考也會把所有統計題算錯。因此真題目前只能「看題、任選一個錯誤選項後看解析」或另開 PDF 手寫，不能稱為正常站內練習。

## 數量總覽

| 類型 | 數量 | 真正可用程度 |
|---|---:|---|
| Subject topics | 4 | 可作內容目錄，不可練習 |
| Subtopics | 16 | 可作學習清單，不含教學或題目 |
| Materials | 4 | 3 筆可直接前往，1 筆占位 |
| Flashcards | 50 | 可使用 SRS 複習，偏概念/公式 |
| 有真題引用的 flashcards | 0 | 無法追溯到原卷題號 |
| Past-paper records | 10（106-115） | 只有 114、115 有考卷；106-113 是明確不適用 |
| 本地 PDF | 2 | 114、115 均存在且已稽核 |
| 真題大題 | 5 | 114 年 2 題、115 年 3 題 |
| 真題總配分 | 85 | 114 年 35 分、115 年 50 分 |
| 有標示 subQuestions 的大題 | 4 | 另 1 題本身是單一完整檢定題 |
| 實質小題/作答項 | 約 12 | 3+2+3+3+1 |
| Answer coverage | 5/5（100%） | 全為完整解析，答案型別為 N/A |
| 可自動判分題 | 0 | 現有資料全部是申論/證明/計算 |

## Topics 與教材

### Topics

`public/data/subjects-im.json` 定義 4 個主題：

1. 描述性統計：4 subtopics
2. 機率基礎：3 subtopics
3. 推論統計：5 subtopics
4. 迴歸分析：4 subtopics

評估：範圍可作入門 syllabus，涵蓋描述統計、機率、抽樣/檢定、ANOVA、迴歸。它只是 TopicTree 顯示資料，沒有解說、練習、完成狀態或到對應閃卡/題目的連結。

品質風險：閃卡使用 11 個 topicId，但 subjects 只宣告上述 4 個 ID。只有 17/50 張落在已宣告 ID（descriptive 3、probability 2、regression 12）；其餘 33/50 使用未宣告的細分類 ID：

- `im-stat-distribution-normal`：6
- `im-stat-distribution-binomial`：3
- `im-stat-distribution-poisson`：2
- `im-stat-estimation`：4
- `im-stat-hypothesis`：9
- `im-stat-anova`：3
- `im-stat-chi-square`：3
- `im-stat-sampling`：3

目前 flashcards 頁只按 subject 過濾，所以卡片仍會出現；但 topic tree、未來 topic filter、覆蓋率統計都無法可靠對接。

### Materials

| 教材 | 類型 | URL | 評估 |
|---|---|---|---|
| 唐麗英《統計學(一) 基礎統計》16 講 | video | 有 | 可執行的免費基礎路線 |
| 唐麗英《統計學(二) 進階統計》13 講 | video | 有 | 對應檢定、ANOVA、迴歸 |
| Lind《商用統計學》19e 中譯本 | book | 有 | 可作習題來源，但站內沒有章節/題號對照 |
| 補習班統計學講義 | cram-school | 無 | 泛稱，沒有作者、版本、入口，屬占位資訊 |

本次是本地資料稽核，未連網驗證三個外部 URL 是否仍可用。第一筆 note 的「114 台大正取者兩三週看完」也沒有站內來源可追溯，應視為未驗證推薦語。

## Flashcards

### 分布

| topicId | 張數 |
|---|---:|
| regression | 12 |
| hypothesis | 9 |
| distribution-normal | 6 |
| estimation | 4 |
| descriptive | 3 |
| distribution-binomial | 3 |
| anova | 3 |
| chi-square | 3 |
| sampling | 3 |
| probability | 2 |
| distribution-poisson | 2 |

### 可用性

- 50/50 prompt 與 answer 都非空，沒有完全重複 prompt。
- 平均 prompt 約 42 字元，平均 answer 約 353 字元；多數卡含公式、定義、適用條件與例子。
- 可直接由 `/im/flashcards?subject=im-stat` 使用既有 SRS。

### 品質風險

- 0/50 有 `pastPaperRef`，雖有「考古題型」字樣，也不能點回原題或驗證來源。
- 答案平均偏長，實質上更像小講義，不是單一、快速回想的原子閃卡；能閱讀複習，但 SRS 作答標準模糊。
- 覆蓋失衡：迴歸 + 假設檢定共 21/50，描述統計只有 3；這可能符合考點，但目前沒有從兩年真題推導出的權重證據。
- 至少有分類語意錯位：joint PDF 卡被標為 regression、Cramér-Rao/Fisher information 卡被標為 regression；topic 統計不能直接當內容品質指標。
- 有些敘述是教科書簡化或實務上有爭議，例如先做變異數檢定再選 pooled/Welch；適合作為考試複習提示，不應當成無條件的實務準則。

結論：閃卡是目前唯一「站內真的可反覆練習」的統計內容，但主要訓練概念回憶，不能代替計算題練習。

## Past papers 與 questions

### 真正存在的考卷

| 年度 | PDF | 題數 | 配分 | 內容 |
|---:|---|---:|---:|---|
| 114 | `public/papers/pp-im-stat-114.pdf` | 2 | 35 | OLS 報表/聯合 F 檢定；加權估計量不偏性與變異數 |
| 115 | `public/papers/pp-im-stat-115.pdf` | 3 | 50 | 聯合 PMF 轉換；估計量效率；卡方獨立性檢定 |

兩份 PDF 與 ordered question snapshots 有 SHA-256 鎖定，`src/__tests__/im-mis-stat-source-integrity.test.ts` 會檢查題數、配分、題目文字、圖片檔與答案資料格式。這 5 題是目前最高可信度的統計內容。

### 106-113 年不是「尚未收錄」

- `public/data/im-mis-stat-paper-verification.json` 明確記錄 106-113 為 `notApplicableStatisticsYears`。
- `past-papers.json` 仍為這 8 年建立 `pp-im-stat-*` record，`url: null`、`verified: false`，note 說明當年尚未設統計考科。
- 現有 PastPapersPage 對任何沒有 pdfUrl 的 record 一律顯示「尚未上架」，因此使用者會誤以為缺了八份卷；實際上是當年沒有這個考科。
- `paper-images.json` 還留有 `pp-im-stat-111` 的兩張路徑，但實體目錄不存在；目前頁面不會用到它，仍是 stale metadata。

### 題目內容品質

五題皆為原卷申論題，題幹、配分、必要表格/數值與圖片均已保留。答案解析抽查結果：

- 114 Q4：adjusted R² 約 0.1643、df residual 436、intercept t 約 6.59、F=29.80 且 p 極小，結論正確。
- 114 Q5：每五項權重和 15、平方和 55，故總和 3T、平方和 11T；不偏性與 `11σ²/(9T)` 正確。
- 115 Q3：六個支撐點權重與變換後 joint/marginal PMF 加總正確。
- 115 Q4：三估計量皆不偏，`α=1`、`β=5/3` 正確。
- 115 Q5：df=2、期望次數與 χ² 約 6.42 正確，5% 水準拒絕獨立性。

結論：questions/answers 的學術內容可拿來人工練習，不是占位或 AI 猜答。

## 關鍵產品風險：有答案，不代表可練習

### 題庫 drill

五題答案都正確使用 `answer: "N/A"`，因為它們沒有單一選項答案；但 `SingleQuestionView` 只有兩條路：

- parser 找到 `(A)/(B)/(C)` 時，把原本的「小題」誤當成 MCQ 選項；或
- parser 找不到選項時，畫出假的 A-E 按鈕。

確認後以選取字母和 `N/A` 比較，永遠不會相等。使用者必須故意答錯，才能看到解析。

### 模擬考

- 114、115 沒有 `contentStatus`，所以會被 `getReliableQuestions` 納入模擬考。
- `/im/mock?subject=im-stat&year=114` 與 `year=115` 可以進入，但仍以字母選項作答。
- 每一題正解都是 `N/A`，因此自動評分理論最高分為 0；練習紀錄也會全部寫成 wrong。

這是高嚴重度資料型別/UI 不相容。修好前不應把統計模擬考列入推薦路線，也不應把「答案覆蓋率 100%」解讀成可計分覆蓋率。

## 哪些是真正可練習、哪些不足

### 現在即可用

- 50 張閃卡：可做概念與公式回想，SRS 流程完整。
- 114/115 原始 PDF：可下載或在考古題頁打開，適合紙筆計時。
- 5 題完整題幹 + 解析：適合寫完後人工對答案，內容可信。
- 3 個具體教材入口：可建立基礎知識。

### 只能算導覽或占位

- 4 topics / 16 subtopics：只有標題清單。
- 「補習班統計學講義」：沒有可採取的入口。
- 106-113 past-paper records：代表不適用，不是可等待補齊的八份內容。

### 明顯不足或目前不可用

- 0 道可自動判分統計題。
- 只有兩個年度、五道大題，題型覆蓋窄；沒有描述統計、Bayes、常見分配、信賴區間、t/z 檢定、ANOVA 等多數 syllabus 的實際題目。
- 題庫 drill 與 mock 不支援申論題，造成假選項、必錯計分。
- 沒有數值輸入、分步作答、上傳草稿、rubric 或自評功能。
- 閃卡 topicId 與 Subject topics 不一致，且無真題 backlink。
- Past papers 頁無 subject query，不能直接用 URL 打開統計 tab；`/im/past-papers?subject=im-stat` 目前無效。

## 建議 MVP 路線

### MVP 0：在不新增題目的前提下先讓現有內容可用

1. 入口：`/im/subjects/im-stat` 顯示四大範圍與三個具體教材。
2. 概念複習：`/im/flashcards?subject=im-stat`，先完成 50 張核心卡。
3. 真題練習：按 114 -> 115 順序，用 PDF 紙筆作答；題庫頁只作「查看題幹與解析」。
4. 訂正：以 5 題解析建立錯題筆記，不使用目前的 mock 分數。

這條路可立即採用，但必須明示「統計真題為申論自評，不支援自動計分」。

### MVP 1：最小產品修正

1. 讓 `answer === "N/A"` 或明確 `responseType: open-ended` 的題目進入申論模式：
   - 不顯示 A-E。
   - 提供「我已作答，查看解析」。
   - 顯示小題 checklist/rubric。
   - 由使用者自評「會 / 部分會 / 不會」，而不是 correct/wrong 字母比較。
2. mock 暫時排除 open-ended 題，或改成「計時練習 + 完成度自評」；在自評功能完成前，不提供統計自動計分入口。
3. Past papers 對 106-113 顯示「該年度尚未設考科」，不要顯示「尚未上架」；清掉 stale `pp-im-stat-111` image metadata。
4. 統一 topics：宣告細分類 topic，或把 50 張卡映射回四個 canonical topic；修正明顯錯分類。

### MVP 2：補足練習密度

在不冒充真題的前提下，新增獨立的「練習題」來源，至少每個四大 topic 10 題，優先做可判分的小題：

- 描述統計：均值/變異數/偏態解讀。
- 機率：Bayes、joint/marginal、二項/Poisson/常態。
- 推論：CI、t/z、卡方、ANOVA、Type I/II、power。
- 迴歸：係數解讀、R²/adjusted R²、t/F 檢定、診斷。

建議首批 40 題採數值或單選、每題附推導；再把 114/115 的 12 個真題小題做 rubric-based open-ended 練習。如此才有「概念卡 -> 基礎可判分題 -> 真題申論 -> 自評訂正」的完整路線。

## 建議優先順序

1. **P0：修 open-ended UI / 停止錯誤計分。** 這是現有五題能否稱為練習的分界。
2. **P0：修 106-113 顯示語意。** 避免製造八份缺卷的假象。
3. **P1：統一 topic taxonomy 與錯分類。** 讓內容覆蓋與導覽可信。
4. **P1：建立至少 40 道非真題基礎練習。** 解決只有五道申論真題的密度問題。
5. **P2：拆短閃卡並加真題 backlink。** 改善 SRS 品質與可追溯性。
