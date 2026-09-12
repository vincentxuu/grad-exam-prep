# 閃卡練習：原始預期與常見慣例差異

## 結論

目前產品不是單一的「翻卡練習器」，而是刻意把兩個用途放在同一頁：

1. 預設進入可搜尋、篩選、逐張展開答案的**字卡瀏覽器**。
2. 另外按「開始複習」才進入**到期卡片的 SRS 自評流程**。

卡片內容本身已明確收斂成常見的 direct recall：英文單字／片語單獨放正面，完整解釋放背面，選擇題留在題庫。真正和 Anki 等常見 SRS 體驗差較大的，是排程與 session 行為：所有新卡第一天全部到期、只依資料順序取前 50 張、失敗卡不會在同一輪重出，而且三段自評是自訂的簡化版「SM-2」。

因此使用者覺得「不像常見閃卡」是合理的；差異主要在**入口與複習節奏**，不是正反面內容格式。

## Repo 中可確認的產品預期

### 1. 正面只呈現詞彙，背面才是完整解釋；不是選擇題

- `.work/flashcard-goal-progress.md:5-11,37-39` 把目標明寫為「Vocabulary/phrase on the front; complete explanation on the back」、「Multiple-choice questions only in the question bank」，完成門檻也稱為 direct-recall flashcard experience。
- `scripts/__tests__/im-vocab-flashcards.test.ts:46-75` 鎖定背面需有意思、詞性、英文解釋、例句，且不得出現 `(A)–(D)`；正面 `prompt` 必須等於單一 `headword`。
- `scripts/__tests__/im-vocab-artifact.test.ts:23-50` 對 checked-in 產物逐張驗證 `prompt === headword`、沒有填空線或選項，背面要有實質內容。
- `src/types/content.ts:104-115` 的 `Flashcard` 型別也以註解明定 direct-recall vocabulary card 的正面是 headword alone。

這是 2026-08-16 的刻意修正，不是偶然：commit `7c60a7c` 的 Why 指出舊卡被錯誤生成成大量重複選擇題、和題庫混淆；How 則改為 4,728 張「單字正面、完整解釋背面」的直接回憶卡。

### 2. 預設頁面是 browse，SRS review 是第二層入口

- `src/app/[exam]/flashcards/page.tsx:72-84` 預設 `mode = 'browse'`，並另外維護 review queue、revealed、搜尋、分級與瀏覽數量狀態。
- `src/app/[exam]/flashcards/page.tsx:318-378` browse 頁先顯示待複習數、開始複習按鈕、搜尋與分級篩選。
- `src/app/[exam]/flashcards/page.tsx:438-500` browse 清單可逐張展開答案，一次顯示 60 張並可載入更多。
- `src/app/[exam]/flashcards/page.tsx:515-517` 元件註解直接說明：瀏覽模式可點開看答案，例句與發音不必等 SRS 到期。

這也是明確的歷史決策：commit `8ab9595` 的標題即為「瀏覽模式也能看例句與發音，不必等 SRS 到期」，理由是卡片排到隔天後，若只有 review 才能看內容，功能會暫時不可用。

### 3. 真正的 review 是「正面 → 顯示答案 → 三段自評」

- `src/app/[exam]/flashcards/page.tsx:228-315` review 一次顯示一張正面；使用者按「顯示答案」後，才看到背面與「不會／普通／熟悉」三個按鈕。
- `src/lib/srs.ts:3-9` 定義三段 rating `0 | 1 | 2` 與上述文案。
- `src/app/[exam]/flashcards/page.tsx:184-203` 開始時把目前到期卡切成最多 50 張的固定 queue；評分後只前進到下一張，最後回 browse。

### 4. 靜態卡與自己收藏的字共用本機 SRS

- `docs/superpowers/specs/2026-08-12-english-vocab-lookup-design.md:308-338` 規格要求查來的字與靜態卡正規化為同一個 `ReviewCard`，沿用同一份 `srsState` 與既有排程。
- `README.md:245-255` 對外功能表也寫明 `/[exam]/flashcards` 是「收藏的字與既有閃卡共用同一個 SM-2 排程」。
- `src/app/[exam]/flashcards/page.tsx:90-136` 實作從 localStorage 讀 saved words 與 SRS state，再和 API 靜態卡合併。
- `src/store/flashcard.ts:33-65` store 以 card id 共用排程並持久化到 localStorage。

## 與常見 flashcard / SRS 慣例不同之處

### A. 首屏是資料庫瀏覽器，不是立即進入單卡複習

常見工具通常以「今天要學／複習幾張」為主要入口，進去後連續翻卡與評分；目前頁面則先呈現完整卡片目錄、涵蓋率、搜尋與 filters，而且任意卡都能展開背面，不會因此留下 review 紀錄（`page.tsx:318-500`）。這個 browse + review 雙模式是產品刻意保留的混合介面。

### B. 所有未看過的卡都立即列為到期

- `src/lib/srs.ts:15-23` 新卡的 `nextReview` 直接設為現在。
- `src/store/flashcard.ts:8-21` 沒有 state 的卡都套用該初始狀態，依 `nextReview`、再依原資料 index 排序。
- `src/__tests__/flashcard-store.test.ts:14-27` 更明確鎖定 4,728 張未看卡全部 due，前 50 張維持輸入順序。

這代表沒有常見的「每日新卡上限」、new/review 分流或自動混排。第一次進入會看到數千張待複習，但一輪只取前 50 張（`page.tsx:32-33,184-189,331-335`）。

### C. 標示為 SM-2，但其實是三段式簡化排程

- `src/lib/srs.ts:26-57` 只有 0/1/2 三級；成功間隔固定走 1 天、6 天、之後乘 ease factor。
- 「普通」不改 ease factor；「熟悉」增加 0.1；「不會」只扣 0.2 並重設 repetition。
- `src/__tests__/srs.test.ts:17-58` 把上述規則鎖成測試契約。

它保留 SM-2 的 ease／interval 概念，但不是原始 0–5 quality scale，也不像常見現代工具提供 Again／Hard／Good／Easy 與 learning steps。頁面文案直接寫「SM-2 間隔重複排程」（`page.tsx:328`），容易讓熟悉其他 SRS 的人期待不同操作。

### D. 「不會」不會在同一輪重新出現

`src/lib/srs.ts:33-36,50-57` 將失敗卡排到 1 天後；`page.tsx:191-203` 評完一律前進，沒有把失敗卡插回 queue。常見學習步驟通常會在幾分鐘後或同一 session 再問一次，因此目前的錯卡強化感會明顯較弱。

### E. session 是啟動時截取的固定前 50 張

`page.tsx:184-203` 啟動時 `slice(0, 50)`，之後不重建 queue。它的優點是 session 長度可控，但沒有 shuffle、使用者自訂新卡量、動態補入剛到期卡，評為不會的卡也不回流。這比常見 SRS session 更像「批次逐張過一遍」。

### F. 學習閉環不只靠閃卡，而把「實際產出」視為更重要

`docs/superpowers/specs/2026-08-12-english-vocab-lookup-design.md:453-462` 明寫：對話中用出詞彙後才可手動標為熟悉，並總結「痛點 2 的答案不是更好的閃卡，是強迫使用」。所以產品層級的原始期待不是複製 Anki，而是「查詞 → 加卡 → SRS → 對話產出」；flashcard 頁只是其中一環。

## 判斷

- **符合預期且接近常見慣例：** 單字／片語正面、完整解釋背面；先回想再揭示；揭示後由使用者自評；依評分排下次複習。
- **符合 repo 既有決策但不太像常見產品：** 首屏 browse、任何卡可直接展開、搜尋／分級／涵蓋率與 SRS 放同頁。
- **最可能造成「怪」的實質差異：** 數千張新卡全部 due、固定前 50 張、三段簡化 SM-2、不會卡隔天才再出現且不在同輪重練。
- **不是原本預期：** 把閃卡做成選擇題、克漏字或題庫式答題；repo 的最新需求、測試與 commit 都明確排除這種模式。

