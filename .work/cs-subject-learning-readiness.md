# 資工所三科 Learning Readiness Audit

## 結論

Authority：`origin/main` @ `0cd1f9120862991f5ed71aeffa3e0d1117438b21`。

`cs-algo`、`cs-arch`、`cs-math` 已具備可瀏覽的七年考古題、完整 PDF 註冊與一批概念 flashcards，但**尚未具備可直接比照 IM-IT 發布 reviewed lessons／自動判分練習的資料契約**。主要缺口不是題數，而是：

1. 273 題的 `topicId` 全部為 `null`，沒有 question-level taxonomy。
2. `answers.json` 雖 273/273 有 answer 與 explanation，但大量開放題的 `answer` 仍是 `A` 等選擇題佔位值；「欄位非空」不能視為答案完整。
3. 三科各 80 張 flashcards，共 240 張，全部沒有 `pastPaperRef` 或 source provenance；169 張使用未出現在 `subjects-cs.json` 的 topic ID。
4. `subjects-cs.json` 只有課綱式 materials，沒有 CS 專用 reviewed source registry、版本、scope 或 review status。
5. Paper integrity 已修到 baseline 為空，但現有 integrity checker 主要抓跨卷重複、缺文章、題號斷層與英文卷結構，不能證明數學式、程式碼、圖或開放題答案正確。

建議實作順序是：

1. **共同 P0：CS question metadata、answer review 與 source registry 基礎設施。**
2. **P1：`cs-arch` 首批 lessons。** Reviewed IM-IT source/content 可安全重用最多，且開放題 answer 污染比另兩科低。
3. **P2：`cs-algo`。** 題量最大、MIT 6.006 source 可沿用，但 proof/code/open-response 題多，答案需先結構化。
4. **P3：`cs-math`。** Open-response 比例、佔位答案、圖依賴及 source 缺口最大，先修資料再寫課。

## 稽核範圍與方法

使用 `origin/main` 的：

- `public/data/questions.json`
- `public/data/answers.json`
- `public/data/past-papers.json`
- `public/data/paper-images.json`
- `public/data/subjects-cs.json`
- `public/data/resources.json`
- `public/data/flashcards.json`
- `public/data/im-it-source-registry.json`
- `scripts/paper-integrity-baseline.json`

抽查 `.work`：

- `.work/paper-integrity-repair.md`
- `.work/audit-cs-math-duplicate.md`
- `.work/premerge-flashcard-audit.md`
- `.work/duplicate-flashcards-data.md`
- `.work/remaining-flashcard-quality-audit.md`

題型統計中的「open-like」採保守字串 heuristic：題面沒有 `(A)`–`(E)` 選項即列入。少數使用數字選項或複合題的格式會被歸到 open-like，因此此數字是 review queue 的起點，不是正式題型 taxonomy；但抽樣可直接證實 `q-pp-cs-algo-108-1`、`q-pp-cs-algo-108-4`、`q-pp-cs-math-108-1`、`q-pp-cs-math-109-1` 等 explanation 已自稱「開放式／無選項」，`answer` 卻仍為 `A`。

## 三科量化比較

| 指標 | cs-algo | cs-arch | cs-math |
|---|---:|---:|---:|
| Questions | 109 | 88 | 76 |
| 年份 | 108–114 | 108–114 | 108–114 |
| Registered / verified papers | 7 / 7 | 7 / 7 | 7 / 7 |
| Answer rows | 109 / 109 | 88 / 88 | 76 / 76 |
| Non-empty explanations | 109 / 109 | 88 / 88 | 76 / 76 |
| Open-like questions | 41 | 25 | 48 |
| Open-like 但 answer 是單一 A–E | 35 | 14 | 41 |
| `hasImage=true` questions | 11 | 18 | 12 |
| Question `topicId=null` | 109 | 88 | 76 |
| Flashcards | 80 | 80 | 80 |
| Flashcards 無 `pastPaperRef` | 80 | 80 | 80 |
| Flashcards 無 source 欄位 | 80 | 80 | 80 |
| Flashcards topic 不在 subject taxonomy | 27 | 62 | 80 |

三科 answer 與 explanation 的「存在率」都是 100%，但不可直接轉成 completeness 分數。例：

- `q-pp-cs-algo-108-1` 要求 Catalan recurrence 與 closed form，`answer` 是 `A`，真正內容只存在 explanation。
- `q-pp-cs-algo-108-4` 明說「問答題，無選項」，`answer` 仍是 `A`。
- `q-pp-cs-math-108-1` 要從圖找 independent set，`answer` 是 `A`，而 explanation 甚至指出需要原圖才能給具體節點。
- `q-pp-cs-arch-113-11` 是 interrupt/driver 問答題，`answer` 是 `A`，但 explanation 才是實際作答。

因此 CS 題庫目前只能視為「question + draft rationale」，不能把 `answers.answer` 全量送進自動判分或宣稱官方答案。

## Paper integrity 與影像

### 已確認狀態

- `scripts/paper-integrity-baseline.json` 的 `known` 為空。
- 以 origin questions 重算三科的 normalized exact cross-paper fingerprint、paper number gaps、passage placeholders：三科均為 0 findings。
- 41 題 `hasImage=true` 的題目，其 paper 都在 `paper-images.json` 有 page images；沒有 image question 對應到零頁影像的 paper。
- `.work/paper-integrity-repair.md` 記錄 `pp-cs-arch-113` 第 4 題缺失文章已從 bundled PDF 恢復；origin 現在確實包含 `Questions 4-6` 的完整 IEEE Spectrum article 與題幹。
- `.work/audit-cs-math-duplicate.md` 證明 111/112 年 recurrence collision 是舊 fingerprint 丟掉負號與數字造成的 false positive。Origin 的 `q-pp-cs-math-112-2` 已保留關鍵負號、`1/5` 與修正後選項；checker 也已保留數字與 `+ - = ^`。

### 仍未被 integrity checker 證明的事項

- 數學公式 OCR 是否逐符號正確。
- 圖、矩陣、表格是否在 question UI 中能清楚對應題號，而不只是存在整頁 JPG。
- 程式碼縮排、下標、上標、集合符號與 pseudocode branch 是否忠於 PDF。
- 開放題 explanation 是否完整回答每個 subquestion。
- Answer 是官方 key、獨立推導，還是單一模型生成；CS 尚無像 IM-IT 的 `answerSource`、confidence、review count 與 eligibility gates。

發布 lesson 前仍需做每個候選 ref 的 PDF spot check；math 與 graph/image 題要額外做視覺核對。

## Topic taxonomy readiness

`subjects-cs.json` 已提供人工規劃的 subject-level topic tree：

- `cs-algo`：10 topics，涵蓋 sorting、trees、graphs、hashing、complexity、DP、greedy、NP、divide-and-conquer。
- `cs-arch`：13 topics，混合 architecture 與 OS，涵蓋 ISA、pipeline、memory hierarchy、process/thread、scheduling、synchronization、deadlock、virtual memory、file systems。
- `cs-math`：11 topics，涵蓋 linear algebra 與 discrete mathematics。

但這些 topic 沒有連到 question rows；273 題 `topicId` 全空。Flashcards 又使用另一套粒度與命名：

- Algo 的 `cs-algo-sorting`、`cs-algo-ds` 不存在於 subject tree，27/80 cards mismatch。
- Arch 的 `cs-arch-cache`、`cs-arch-vm`、`cs-arch-os-*` 多數不等於 subject tree IDs，62/80 mismatch。
- Math 全部使用 `cs-math-linear-algebra`、`cs-math-discrete-*` 等另一套 IDs，80/80 mismatch。

### 必要修補

建立 CS 專用 question metadata，至少包含：

- `questionId`, `topicId`, `primarySubtopicId`
- `questionType`: single/multiple choice、numeric、symbolic、proof、code/pseudocode、diagram、multi-part
- `scoringMode`: automatic candidate、manual rubric、not gradable
- `answerSource`, `official`, `reviewCount`, `confidence`, `unresolvedIssues`
- `browseEligible`, `practiceEligible`, `autoGradeEligible`, `fullMockEligible`

Flashcards 必須選一個 migration contract：映射到 canonical subject topic IDs，或正式擴充 subject tree；不可只讓 validator 繼續輸出 unknown-topic warnings。

## Materials 與 source quality

### `subjects-cs.json` materials

| Subject | Materials | 有 URL | 判斷 |
|---|---:|---:|---|
| cs-algo | 3 | 0 | CLRS 書目可作嚴謹來源，但另外兩筆是補習班講義／課程，沒有固定 URL、版本或 review evidence。 |
| cs-arch | 3 | 1 | 兩本中文備考書無 URL；唯一影片 URL 是 NTHU OCW channel，不是固定 playlist。 |
| cs-math | 3 | 0 | 兩本中文書與一筆 NTHU 講義皆無 URL、版本或可驗證章節。 |

`resources.json` 有 40 筆 `examRelevance` 包含 `cs`，且都有 URL，但組成是 10 Dcard、7 HackMD、3 補習班、1 PTT、1 部落格、5 書目、12 YouTube/線上課程、1 官方。這些很適合「備考資源導航」，不等於可逐段支撐 lesson 技術主張的 reviewed registry。

### 可直接沿用或擴充的 reviewed sources

- `src-mit-algorithms-6006`：可支撐 algorithms、data structures、complexity 的基礎；CS 的 advanced graph、DP proof、NP/reduction 仍需 CLRS 或更進階 reviewed course。
- `src-brookshear-13e`：可支撐 architecture/OS 概念導論，不能單獨支撐 cache bit calculation、pipeline timing、coherence protocol 等深度計算。
- `src-nthu-os-course`：可支撐 process、scheduling、synchronization、memory、file-system 的 OS lessons。

### 建議新增 reviewed source groups

- Algo：CLRS 固定 edition + MIT 6.006；advanced algorithms 再加入 MIT 6.046/等價大學課程。
- Arch：Patterson & Hennessy 固定 edition或正式大學 Computer Architecture course；pipeline/cache/coherence 需明定章節。
- Math：MIT OCW Linear Algebra（固定課程版本）與 Mathematics for Computer Science／同級離散數學教材；台灣備考書可作題型補充，不作唯一技術 authority。

每個 source entry 應有 stable ID、author/publisher、URL/edition、scope、usage、status 與 review evidence。

## Existing flashcards readiness

三科各 80 張卡，prompt 沒有 exact duplicate group，答案中位長度約為 Algo 311、Arch 400、Math 241 字，表面上比大量模板式單字卡完整；可作為**概念草稿池**。但目前不能直接宣稱 reviewed：

- 240/240 無 source 欄位。
- 240/240 的 `pastPaperRef` 為 null。
- 169/240 topic IDs 不在 canonical subject tree。
- 沒有 generator/version/review status。
- Card 與 past-paper evidence、lesson boundary 無法互相驗證。

`.work/premerge-flashcard-audit.md` 也記錄 content validation 有數百個 pre-existing unknown-topic warnings；本次 origin 統計可確定其中至少 169 張來自這三科。IM-English 的 bulk-template defects 不代表 CS 240 張卡也有同一缺陷，但 `.work/duplicate-flashcards-data.md` 與 `.work/remaining-flashcard-quality-audit.md` 已證明「ID 唯一、prompt 唯一」不足以建立品質。CS cards 仍需來源、語意與 topic review。

## 有證據的實作優先序

### P0：三科共用資料底座

1. 建立 canonical CS taxonomy 與 question metadata；先用 rules/model-assisted tagging，再由第二 reviewer 覆核。
2. 逐題區分 MC、numeric/symbolic、proof/code/diagram/multi-part；禁止把 open-response 的 `A` 當 grading key。
3. Answer review 以 bundled PDFs、可重現推導與 reviewed sources 交叉驗證；非官方答案必須明示。
4. 建立 CS source registry，或把現有 IM-IT registry 泛化成跨 exam registry。
5. Migrate 240 flashcards 的 topic IDs；補 sourceRefs、pastPaperRefs/authoring provenance、reviewStatus。
6. 為 symbolic/numeric/open answers 設 rubric；第一批 auto-grade 只納入唯一答案、題面完整、reviewed confidence 足夠的 refs。

### P1：cs-arch

理由：88 題、7 年、80 張 seed cards；現成 reviewed Brookshear/NTHU OS sources 與 IM-IT lessons 可提供最多基礎。Open-like heuristic 為 25 題，其中 14 題是單一字母答案，仍需修，但污染量低於 Algo/Math。

### P2：cs-algo

理由：109 題是三科最多，sorting/graph/DP 每年都有 evidence，MIT 6.006 已 reviewed；但 41 題 open-like、其中 35 題 answer 是單一字母，proof/code/multi-part grading 必須先做。

### P3：cs-math

理由：76 題中 48 題 open-like、41 題使用單一字母 answer；12 題含圖；80 張卡全部使用非 canonical topic IDs；尚無 reviewed math source。公式 OCR、symbolic equivalence 與 proof rubric 的成本最高。

## 各科首批課程候選

下列 refs 是「lesson evidence 候選」，不是現況可直接自動判分的核准清單。正式使用前都要通過 PDF、answer、taxonomy 與 eligibility review。

### cs-arch

#### A. 五階段 Pipeline：clock、hazard、forwarding 與 stall

- 候選 refs：`q-pp-cs-arch-110-7`、`q-pp-cs-arch-111-5`、`q-pp-cs-arch-112-7`、`q-pp-cs-arch-113-2`、`q-pp-cs-arch-114-12`、`q-pp-cs-arch-114-13`
- Evidence：subject tree 把 pipeline 標為 importance 5；既有 flashcards 在 `cs-arch-pipeline` 有 11 張；跨 110–114 年有連續計算題。
- 生活比喻：餐廳出餐線，每道菜同時在備料、烹調、裝盤；後一道工序若等前一步結果就暫停。
- Boundary：pipeline 提升 throughput，不保證縮短單一 instruction latency；餐點相依不能直接替代 RAW/WAR/WAW 與 precise timing table。

#### B. Virtual Address、Page Table、TLB 與 Cache

- 候選 refs：`q-pp-cs-arch-108-2`、`q-pp-cs-arch-111-1`、`q-pp-cs-arch-111-2`、`q-pp-cs-arch-111-11`、`q-pp-cs-arch-111-14`、`q-pp-cs-arch-114-5`
- Evidence：memory hierarchy importance 4；flashcards 有 cache 11 + VM 9；refs 同時涵蓋 address split、page-table size、virtual-memory semantics 與 VIPT constraint。
- 生活比喻：飯店對客人的房號是 virtual address，櫃檯目錄把樓層／房號映射到實際房間；常查 mapping 留在快速小抄（TLB）。
- Boundary：TLB 是 page-table translation cache，不是 data cache；offset、page size、index/tag bits 必須按位元計算，不能只靠「查目錄」故事。

#### C. OS Scheduling 與 Synchronization（建議拆成兩堂）

- Scheduling refs：`q-pp-cs-arch-111-10`、`q-pp-cs-arch-111-18`、`q-pp-cs-arch-113-13`、`q-pp-cs-arch-114-7`、`q-pp-cs-arch-114-8`
- Synchronization refs：`q-pp-cs-arch-110-5`、`q-pp-cs-arch-111-13`、`q-pp-cs-arch-112-6`、`q-pp-cs-arch-112-17`、`q-pp-cs-arch-114-1`
- 生活比喻：診所候診對 scheduling；只有一把鑰匙的治療室對 critical section/mutex。
- Boundary：不得把兩個比喻硬合成同一 object model；scheduler policy 與 mutual exclusion 是不同問題。病人也不是可零成本 preempt 的 process。

### cs-algo

#### A. Complexity、Quicksort 與 Merge Sort

- 候選 refs：`q-pp-cs-algo-108-5`、`q-pp-cs-algo-110-1`、`q-pp-cs-algo-111-1`、`q-pp-cs-algo-111-2`、`q-pp-cs-algo-111-6`、`q-pp-cs-algo-111-9`、`q-pp-cs-algo-112-5`
- Evidence：subject importance 5；flashcards 有 complexity 14、sorting 12；keyword audit 找到 29 題與 complexity/sorting 直接相關。
- 生活比喻：整理卡片時選 pivot 分左右堆，或把已排序的小疊逐層合併。
- Boundary：生活動作不能代替 recurrence、worst/average case、stability 與 auxiliary-space 證明；Quicksort 快不等於最壞情況也是快。

#### B. Graph：Shortest Path 與 Minimum Spanning Tree

- 候選 refs：`q-pp-cs-algo-108-8`、`q-pp-cs-algo-110-8`、`q-pp-cs-algo-111-18`、`q-pp-cs-algo-111-19`、`q-pp-cs-algo-111-20`、`q-pp-cs-algo-112-12`、`q-pp-cs-algo-112-13`、`q-pp-cs-algo-114-12`、`q-pp-cs-algo-114-13`
- Evidence：advanced graph importance 5；flashcards graph 19；keyword audit 至少 18 題。
- 生活比喻：地圖上找單一路線最短距離，與替所有社區鋪總成本最低的連通道路。
- Boundary：shortest-path tree 與 MST 目標不同；Dijkstra 不適用一般負邊，生活中的「最近」不能跳過 edge-weight assumptions。

#### C. Dynamic Programming：state、transition 與重建答案

- 候選 refs：`q-pp-cs-algo-110-2`、`q-pp-cs-algo-111-16`、`q-pp-cs-algo-111-17`、`q-pp-cs-algo-112-11`、`q-pp-cs-algo-114-4`、`q-pp-cs-algo-114-6`、`q-pp-cs-algo-114-14`
- Evidence：DP importance 5；10 張 DP cards；keyword audit 找到 10 題。
- 生活比喻：旅行者在每個檢查點記下「抵達此狀態的最佳已知成本」，後續只查表而不重算整段路。
- Boundary：記住結果不自動成為正確 DP；必須證明 state 足夠、transition 完整、subproblems 有依賴順序，並區分 greedy。

### cs-math

#### A. Linear Recurrence 與 Generating Function

- 候選 refs：`q-pp-cs-math-108-5`、`q-pp-cs-math-109-4`、`q-pp-cs-math-109-5`、`q-pp-cs-math-111-2`、`q-pp-cs-math-111-3`、`q-pp-cs-math-112-2`、`q-pp-cs-math-112-3`、`q-pp-cs-math-113-4`、`q-pp-cs-math-114-4`、`q-pp-cs-math-114-5`
- Evidence：subject importance 5；跨 108–114 重複出題；keyword audit 找到 15 題 recurrence/counting/generating-function evidence。
- 生活比喻：每月庫存由前兩月依固定配方生成；generating function 像把整串月份係數收進一張可代數運算的標籤。
- Boundary：配方故事不能代替 characteristic roots、initial conditions、repeated roots 與 formal power-series manipulation；正負號 OCR 必須逐字核對。

#### B. Vector Space、Basis 與 Linear Map

- 候選 refs：`q-pp-cs-math-108-8`、`q-pp-cs-math-108-9`、`q-pp-cs-math-108-12`、`q-pp-cs-math-110-6`、`q-pp-cs-math-110-10`、`q-pp-cs-math-111-9`、`q-pp-cs-math-112-7`、`q-pp-cs-math-113-7`、`q-pp-cs-math-113-10`
- Evidence：linear-algebra cards 34；keyword audit 找到 28 題 linear-algebra evidence。
- 生活比喻：同一地點可用不同座標系描述；basis 是一套不冗餘且能生成整個空間的方向語言，linear map 是保持線性組合規則的翻譯。
- Boundary：不是所有「座標轉換」都 linear；basis 必須同時 linear independent 且 spanning，幾何箭頭也不能涵蓋函數／矩陣等抽象 vector spaces。

#### C. Counting 與整數解

- 候選 refs：`q-pp-cs-math-108-2`、`q-pp-cs-math-108-6`、`q-pp-cs-math-109-1`、`q-pp-cs-math-109-3`、`q-pp-cs-math-111-4`、`q-pp-cs-math-112-4`、`q-pp-cs-math-114-6`
- Evidence：combinatorics cards 13；subjects tree 將排列組合與 generating functions 都列 importance 5。
- 生活比喻：把相同糖果分到有標籤盒子，用隔板位置表示每盒數量。
- Boundary：stars-and-bars 只適用對應的 indistinguishable objects、labeled boxes 與上下界條件；有 upper bounds、distinctness 或順序限制時要改用 inclusion-exclusion／generating functions。

## 與 IM-IT 共用內容的原則

### 可共用

- Lesson/card schema、learningScenario UI、source registry 欄位、answer-confidence 與 eligibility gate。
- `src-mit-algorithms-6006` 的 algorithms/data-structures 基礎。
- `src-brookshear-13e` 的 architecture/OS 導論。
- `src-nthu-os-course` 的 process、scheduling、memory、file-system 基礎。
- 已 reviewed 的定義層內容：Big-O vs case、sorting stability、heap invariant、CPU instruction cycle、memory hierarchy、process/thread、paging、scheduling metrics。

### 不可直接複製

- IM-IT 的 `pastPaperRefs`、minimum thresholds 與 answer confidence；CS 必須以 CS papers 重新建立 evidence。
- IM-IT 為概論選擇題設計的深度。CS 需要 proof、pseudocode、pipeline timing、cache bit calculations、symbolic algebra 與 multi-part rubrics。
- 相同 flashcard 文案的整批複製。應共享 canonical concept definition，再為 CS 建立較深的 worked example、陷阱與 derivation card。
- IM-IT taxonomy IDs 直接套到 CS。可設 cross-exam concept alias，但 primary owner 必須保留各 exam 的 canonical topic tree。

建議以 `conceptKey` 做跨考試共用，例如 `algo.big-o`、`os.round-robin`、`arch.cache-locality`；每科 lesson/card 仍保有自己的 `subjectId`、difficulty、sourceRefs、pastPaperRefs 與 review status。這樣能重用經 review 的核心定義，又不會把概論級答案冒充 CS 深度內容。

## Acceptance gates

第一批 CS lesson 發布前至少滿足：

- [ ] 100% lesson refs 有 canonical topic 與 question type。
- [ ] 100% lesson refs 經 PDF spot check；含圖題確認 UI 可讀。
- [ ] Open-response 不使用 A–E placeholder 作 grading key。
- [ ] 每個答案有 official/non-official、reviewCount、confidence 與 unresolved issues。
- [ ] Auto-grade 只包含唯一且可機械比較的 reviewed answers；proof/code/diagram 有 manual rubric。
- [ ] 每堂至少一個 reviewed教學來源與一個可校準定義／計算的嚴謹來源。
- [ ] Flashcard topic IDs 全部 canonical，card refs 是 lesson refs 的 subset，source refs 可追溯。
- [ ] 生活比喻有逐列 mapping 與明確 boundary，不取代公式、proof 或 architecture assumptions。
- [ ] Paper integrity、topic/ref validator、answer review、content tests 與 production build 全過。

## 最小可行交付切片

1. 先完成 `cs-arch` 的 Pipeline lesson：6 個 refs、6–8 cards、3 個可重現 timing/hazard examples。
2. 同時建立 CS metadata/answer-review schema，只填本 lesson refs，驗證整條發布流程。
3. 第二堂做 Virtual Address/TLB/Cache，驗證含圖與 bit-calculation 題。
4. 再把同一 pipeline 套到 `cs-algo` sorting/complexity；此時加入 open-answer rubric。
5. 最後用 recurrence/generating-function lesson 打通 `cs-math` symbolic answer、formula OCR 與 equivalence checking。

這個順序不是依科目重要性排名，而是依「可重用 reviewed 資產 × 資料修復成本 × 可驗證性」排序。
