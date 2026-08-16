# MIS 學習內容基線與首批課程規劃

## 0. Authority、盤點方式與結論

- 正式基線：`origin/main` @ `0cd1f9120862991f5ed71aeffa3e0d1117438b21`。
- 修復候選：目前 workspace 的 `public/data/questions.json`、`answers.json`、`im-mis-stat-paper-verification.json`，以及四份 MIS replacement manifests。
- 本文件只分析與規劃，沒有修改正式 `public/data`。
- 資料萃取使用 `git show`、`jq` 與文字索引；主題判斷以修後題面摘要進行，沒有把 37 題原文整批複製進本文件。

核心結論：MIS 已有很好的「題目原文」資產，但還沒有可發布的「答案與課程」基線。首批課程可以開始撰寫，但只能把考古題當作學習範圍與申論提示，不能把現有 explanation 當成官方標準答案或自動評分依據。

## 1. 現有題數、年份、答案可信度與來源狀態

### 1.1 考古題與年份

| 年份 | MIS 大題數 | MIS 配分 | 備註 |
|---:|---:|---:|---|
| 106–113 | 每年 4 題 | 每年 100 分 | 8 份純 MIS 卷，共 32 題、800 分 |
| 114 | 3 題 | 65 分 | 同卷另有統計 35 分，不是 MIS 漏題 |
| 115 | 2 題 | 50 分 | 同卷另有統計 50 分，不是 MIS 漏題 |
| **合計** | **37 題** | **915 分** | 106–115 共 10 年、10 份 PDF |

題目來源狀態：

- 10 份台大原始 PDF 都在 workspace，且已有逐頁視覺 audit。
- Workspace verification artifact 保存每年題數、配分、PDF SHA-256 與 questions SHA-256；這是題面完整性的最佳 authority，但該 artifact 尚不在 `origin/main`。
- 兩份 PDF audit 結論：37/37 大題存在，年份、題號與 MIS 配分邊界正確。
- 題面有兩個實質 fidelity repair：
  - `q-pp-im-mis-107-4` 的 SQL schema 在純文字轉換時遺失 primary-key 底線語意；manifest 改以 `[PK]` 保留。
  - `q-pp-im-mis-111-1` 遺漏 portfolio matrix 後、part (b) 前的一整段說明；manifest 補回。
- 其餘 question replacements 主要補 `subQuestions` 結構，不改題意。

### 1.2 Origin 與 workspace 修復差異

| 檢查項 | `origin/main` | Workspace 修復候選 |
|---|---:|---:|
| MIS questions | 37 | 37 |
| 有 `subQuestions` 的大題 | 0 | 28 |
| subquestion labels | 0 | 76 |
| Question replacements | 未套用 | 28 IDs |
| Answer markers | A: 28、B: 1、N/A: 8 | N/A: 37 |
| Answer-marker replacements | 未套用 | 29 IDs |

四份 manifests 的精確範圍：

- `.work/im-mis-106-110-replacements.json`：15 題。
- `.work/im-mis-111-115-replacements.json`：13 題。
- `.work/im-mis-106-110-answer-replacements.json`：15 題。
- `.work/im-mis-111-115-answer-replacements.json`：14 題。

所有 37 題都是 open-ended essay，沒有選擇題選項；因此 A/B 都是錯誤格式佔位，`N/A` 只代表「不適用字母答案」，不代表沒有申論 rubric。

### 1.3 答案可信度

| 層級 | 現況 | 可否作為發布依據 |
|---|---|---|
| 官方答案 | 10 份 PDF 只有題目，未找到官方解答 | 不可宣稱官方或唯一答案 |
| 題面 fidelity | 逐頁視覺 audit + SHA verification | 可作為題目瀏覽與引用基線 |
| Answer marker | Workspace 已把 37 題統一為 `N/A` | 可修正 UI 格式，但不是內容審核 |
| Explanation | 37 題皆有 260–850 字參考詳解，平均約 423 字 | 僅能當待審草稿；不能自動計分 |
| Semantic review | Replacement manifests 明示保留既有 explanation；PDF audit 不驗證解答正確性 | 尚未建立人工 reviewCount、confidence、sourceBasis |

現有 explanation 的主要問題不是「完全沒有內容」，而是缺少可驗證性：沒有官方 key、沒有逐小題 rubric、沒有 reviewed sources、沒有可接受替代論點，也沒有把具時效性的案例與穩定理論分開。部分說法把策略建議寫成唯一結論，對申論題尤其危險。

### 1.4 Flashcards、materials 與來源

- MIS flashcards：50 張，分散在 12 個 `topicId`。
- 50/50 的 `pastPaperRef` 都是 `null`；資料也沒有 reviewed `sourceRefs`。
- 12 個 flashcard topics 包含 BI、BPR、CRM、DSS、e-commerce、ERP、IT governance、IT strategy、knowledge management、Porter five forces、SCM、value chain。
- Subject 導覽：5 個 topics、24 個文字 subtopics；和 flashcards 的 12 IDs 不是同一 taxonomy。
- Materials：5 筆，其中只有 2 本書有 URL；時事文章、Podcast、補習班講義三筆沒有可解析 URL。
- `resources.json` 沒有 MIS 專屬 reviewed resources。
- 現有 materials 是讀書建議，不是逐段支撐 lesson/card 的 source registry；不能直接把「有列書名」視為內容已引用或已審核。

## 2. 建議主題樹與需要調整的分類

現有五類適合做行銷式導覽，不足以承擔 question/card/lesson 的唯一 taxonomy：`MIS基礎理論` 太寬，`管理理論` 混合不同分析層級，`時事申論題` 又把內容領域與題型／時效性混在一起。

建議建立 7 個 stable topics；「時事」改成跨主題 tag，不再是 top-level concept：

1. **IT strategy、business value 與 investment**
   - Competitive strategy、IT-business alignment、complementary assets、IT portfolio、benefit/risk、organizational agility、assimilation、project failure。
2. **Digital platforms、sharing economy 與 e-commerce**
   - Two-/multi-sided platforms、network effects、cross-subsidy、digital markets、information asymmetry、switching cost、live commerce。
3. **Enterprise systems、process 與 knowledge**
   - ERP、CRM、SCM、BI/DSS、BPR、codification/connectivity、push/pull supply chain。
4. **Data、analytics 與 responsible AI**
   - Data lifecycle、model evaluation、fairness、forecasting、community detection、conversational AI、AI maintenance、vendor/model governance。
5. **Systems acquisition、development 與 UX**
   - Build/buy/source selection、Scrum、requirements/user stories/use cases、testing、cost estimation、UCD/UI/UX。
6. **Data architecture 與 digital infrastructure**
   - Relational/NoSQL、SQL/schema、OSS/licensing、cloud/infrastructure sourcing。
7. **Digital governance、privacy 與 sustainability**
   - IT governance、IoT privacy、cybersecurity governance、ESG、accountability、technology risk。

### 建議優先調整的分類

| 題目／內容 | 不宜停留的位置 | 建議 primary / tags |
|---|---|---|
| `q106-3` OSS license | 泛稱「數位轉型」 | Data architecture/infrastructure；tags: OSS, licensing, sourcing |
| `q106-4` NoSQL、`q107-4` SQL | MIS 基礎理論 | Data architecture；subtopics: relational/NoSQL, SQL/schema |
| `q108-4` AI fairness | 只放 AI 新興技術 | Responsible AI；tags: fairness, classification, governance |
| `q109-3` 三邊外送平台、`q110-1` sharing platform、`q110-2` digital market、`q114-1` live commerce | 分散於策略／時事 | Digital platforms/e-commerce |
| `q110-3` Scrum、`q111-3` testing、`q111-4` UCD、`q112-4` estimation、`q114-3` user stories/use cases | 管理理論 | Systems acquisition/development/UX |
| `q111-2` IoT privacy | 新興技術 | Digital governance/privacy；IoT 保留 secondary tag |
| `q113-2` enterprise agility | 泛管理理論 | IT strategy/business value；agility secondary tag |
| `q113-4` ESG | 時事申論 | Governance/sustainability；`current-event` 只作 tag |
| `q115-2` Apple/Gemini case | 只放生成式 AI 時事 | Responsible AI + sourcing/vendor governance；time-sensitive tag |

分類資料需允許：一個 `primarySubtopicId` 用於課程 coverage，另有 `secondaryTags` 表示跨域與時事；否則 AI、平台、治理與策略題會被迫重複或錯置。

## 3. 建議首批 4 堂課與可用 refs

下列 refs 是「可用來界定考試範圍的已稽核題面」，不是已核准答案。正式 lesson 納入前仍要有 question metadata、essay eligibility 與 source review。

### Lesson 1：IT strategy、價值與投資決策

建議涵蓋：competitive strategy、IT-business alignment、complementary assets、capital budgeting limitations、portfolio benefit/risk、organizational agility、technology assimilation、FOMO/project failure。

可用 refs（9）：

- `q-pp-im-mis-106-1` — IS/IT 如何支援 differentiation strategy。
- `q-pp-im-mis-107-2` — environmental munificence/dynamism 與因應。
- `q-pp-im-mis-108-1` — IT、transaction/coordination cost 與 firm size。
- `q-pp-im-mis-109-2` — IT investment 與 complementary assets。
- `q-pp-im-mis-111-1` — capital budgeting 缺點與 IT project portfolio。
- `q-pp-im-mis-112-2` — benefits/risks 下比較 IT projects。
- `q-pp-im-mis-113-2` — enterprise agility 與 IT capabilities。
- `q-pp-im-mis-114-2` — IT investment、assimilation 與 business value。
- `q-pp-im-mis-115-1` — FOMO 與 AI project failure。

生活比喻：**家庭年度預算與房屋改造組合**。省電設備像低風險例行投資，整屋智慧化像高風險高潛在效益專案；不能只看購買價格，還要看家人技能、流程配合與維護能力（complementary assets）。邊界：企業競爭策略與資本市場風險不能被家庭預算完整代表，不能從比喻推出唯一投資組合。

### Lesson 2：平台策略、共享經濟與數位市場

建議涵蓋：sharing economy、multi-sided platform、network effects、cross-subsidy、digital-market information asymmetry/switching costs、live commerce。

可用 refs（5）：

- `q-pp-im-mis-106-2` — sharing economy 的挑戰與 IS/IT 解法。
- `q-pp-im-mis-109-3` — 餐廳、消費者、外送員三邊平台與 cross-subsidy。
- `q-pp-im-mis-110-1` — non-money-based 到 money-based sharing platform。
- `q-pp-im-mis-110-2` — digital markets、information asymmetry、switching cost。
- `q-pp-im-mis-114-1` — 不同企業如何運用 live-streaming commerce。

生活比喻：**夜市主辦方同時服務攤商、消費者與外送員**。免費吸引一側可增加另一側價值，對應 cross-subsidy 與 indirect network effects。邊界：平台各側不一定同質，補貼不保證形成正向網路效應；價格、治理與安全規則仍需個別分析。

### Lesson 3：資料與 AI 專案生命週期

建議涵蓋：data lifecycle、dataset/model evaluation、fairness、traffic/demand forecasting、AI maintenance、conversational AI、foundation-model/vendor governance。

可用 refs（8）：

- `q-pp-im-mis-108-2` — business ML 所需資料生命週期與組織決策。
- `q-pp-im-mis-108-3` — model evaluation 與資料／模型問題。
- `q-pp-im-mis-108-4` — automated classification fairness。
- `q-pp-im-mis-109-4` — YouBike latent demand estimation 與 feasibility/acceptability。
- `q-pp-im-mis-110-4` — 壅塞預測的資料、部署與 use case。
- `q-pp-im-mis-112-3` — AI model 建置後的維護與管理。
- `q-pp-im-mis-113-3` — conversational AI 在銀行的應用與管理。
- `q-pp-im-mis-115-2` — Apple/Gemini case 的 model sourcing、privacy 與 governance。

生活比喻：**餐廳從採買、驗收、備料、試吃到持續改菜單**。資料收集與清理像食材流程，validation/test 像不同階段試吃，上線監控像持續檢查顧客與食材變化。邊界：模型公平、privacy、distribution shift 與 vendor governance 不能只化約成「食材好不好」；比喻不提供統計保證或因果結論。

### Lesson 4：系統取得、敏捷交付、測試與 UX

建議涵蓋：build/buy/outsource 選擇、Scrum roles/artifacts、testing layers、UCD/UI heuristics、cost estimation、user stories/use cases。

可用 refs（6）：

- `q-pp-im-mis-107-3` — software acquisition sources、staffing 與適用條件。
- `q-pp-im-mis-110-3` — Scrum roles、daily stand-up、Sprint Backlog、burn-down chart。
- `q-pp-im-mis-111-3` — unit/integration/UAT/usability testing。
- `q-pp-im-mis-111-4` — user-centered design 與 UI/UX heuristics。
- `q-pp-im-mis-112-4` — function point、COCOMO II、expert judgment、planning poker、T-shirt sizing。
- `q-pp-im-mis-114-3` — user stories 與 use cases。

生活比喻：**餐廳裝修與開幕前試營運**。自建／套裝／外包像不同承包模式；Product Owner 決定價值優先序，Sprint Backlog 像本週施工清單；單項設備、整體動線、店主驗收與顧客試走分別提示不同測試目的。邊界：軟體可反覆部署、需求與技術相依性也不同於實體工程，不能用裝修工期直接套出 COCOMO 或 function points。

### 第二批候選（本批先不硬湊）

- **Enterprise systems、knowledge 與 supply chain**：目前最直接 refs 為 `q107-1`、`q112-1`，可再連結 ERP/CRM/SCM/BI/DSS/BPR flashcards；題證尚少，先補 source/card linkage。
- **Data architecture、SQL/NoSQL 與 OSS**：`q106-3`、`q106-4`、`q107-4` 技術性強，但只有 3 題；適合等題目結構修復與 reviewed technical sources 完成後獨立成課。
- **Governance/privacy/ESG**：`q111-2`、`q113-4` 可作核心，需再納入 IT-governance flashcards 與穩定來源，不宜用「每年時事」湊 refs。

## 4. Learning scenario 設計原則

每堂 scenario 應沿用已建立的正式欄位：`title`、`hook`、`predict`、4–5 列 `everyday/technical` mapping、`boundary`、4 條 `examCues`。

MIS 特別需要以下限制：

- 比喻只能幫助組織答案，不可暗示申論只有一個正確策略。
- 每列 everyday 必須一對一映射 technical concept，避免把 buzzwords 堆在同一故事。
- Boundary 要指出情境中的利害關係人、產業、資料與時效差異。
- Exam cues 應提示「定義 → 機制 → 條件／權衡 → 案例」答題骨架，而不是背固定模板。
- 當題目是 Apple/Gemini、live commerce、AI failure rate 等具時效案例，scenario 應抽取穩定概念，案例事實另留 snapshot/source date。

## 5. 阻擋發布的資料風險

### Blocking：必須先處理

1. **Origin 的 essay answer marker 錯誤**：29 題仍是 A/B；在目前選擇題 UI 中會形成「正解 A/B」的假象。必須先套用 answer manifests，並讓 `N/A` 走 essay mode。
2. **申論互動錯型**：現行 practice 要求選 A–E，再以 `N/A` 判錯。MIS 不得進入這條 auto-grade flow；至少要提供自由作答／紙筆模式、揭露參考 rubric 與自評。
3. **題目結構修復未進 origin**：28 question replacements、76 個 subquestion labels、q107-4 PK 語意、q111-1 遺漏段落必須先落地並重跑 SHA/integrity tests。
4. **Explanation 尚未語意 review**：37 份只有參考草稿，沒有官方答案、reviewCount、confidence、sourceBasis 或逐小題得分點；不得標成標準答案、不得自動配分。
5. **沒有 question taxonomy metadata**：目前無法機械驗證 lesson refs 是否與 covered subtopics 直接相關，也無法計算 coverage。
6. **沒有 MIS reviewed source registry**：subject materials 與 flashcards 不能替代逐課來源；課程發布前要逐段建立 stable sources 與 time-sensitive case sources。

### Major：可開始 authoring，但發布前要清除

- 50 張 flashcards 無來源、無 past-paper linkage，且 12 topic IDs 和 subject tree 不一致。
- 114/115 是 MIS+Statistics 合併卷；任何整卷進度與配分 UI 都必須顯示科目邊界。
- 原題多為複合申論；只以大題為 ref 會掩蓋每個 subquestion 的概念與配分，需要 subquestion-level rubric IDs。
- 時事案例會過期；需記錄事件日期、source snapshot 與「穩定理論／案例事實」分離規則。
- 對策略題強行設單一 expected answer 會壓掉合理替代論點；rubric 必須允許有條件且有證據的其他答案。

## 6. 建議 artifacts 與落地順序

### A. 先修資料 authority

1. 套用四份 replacement manifests 到隔離的最新 `origin/main` worktree。
2. 納入 `public/data/im-mis-stat-paper-verification.json`，將 PDF/questions hashes 變成 regression authority。
3. 新增完整測試：37 題、各年配分、28 題 subQuestions、37 個 `N/A`、q107-4 PK、q111-1 遺漏段落、114/115 MIS-stat 邊界。

### B. 建立 MIS learning artifacts

- `public/data/im-mis-concept-master.json`
  - 7 topics、reviewed subtopics、keywords、stable/current-event tags。
- `public/data/im-mis-question-metadata.json`
  - `primarySubtopicId`、secondary tags、`questionType: essay`、subquestion concepts、publication flags。
- `public/data/im-mis-answer-review.json`
  - `official: false`、reviewCount、confidence、sourceBasis、unresolved issues；不沿用選擇題的 auto-grade eligibility。
- `public/data/im-mis-rubrics.json`
  - 每小題 points、must-have concepts、reasoning steps、acceptable alternatives、examples、common errors、sourceRefs。
- `public/data/im-mis-source-registry.json`
  - Textbooks/official frameworks/standards、case-specific sources、retrieved/reviewed date、scope/usage/status。
- `public/data/im-mis-lessons.json`
  - 首批 4 lessons、minimum evidence threshold、learningScenario、pastPaperRefs/subquestionRefs、review status。
- `public/data/im-mis-concept-cards.json`
  - 將現有 50 cards 去重、重分類、補 sources/refs；不要直接把舊卡全部標 reviewed。
- `public/data/im-mis-practice-status.json`
  - essay-only、reference-answer disclosure、rubric readiness、full-mock boundary。

### C. 產品與驗證

- Essay practice component：自由輸入／紙筆完成、計時、逐小題揭露 rubric、自評「掌握／待複習」，禁止 A–E 與「正解 N/A」。
- Lesson hub：`主題 → lesson → concept cards → subquestion refs → essay practice`。
- Builder validations：source closure、lesson/card refs subset、question taxonomy coverage、rubric point totals、非官方揭露、current-event source freshness。
- Negative tests：缺 rubric、缺來源、混入 stats 題、essay 被標 auto-grade、subquestion points 不合大題配分時必須拒絕 build。

### 建議執行順序

1. **資料修復與 essay UI gate**。
2. **Concept master + question metadata + source registry**。
3. **首批 4 lessons + rubrics + scenarios**。
4. **Flashcards 重分類與來源補齊**。
5. **小規模人工 essay review；確認 rubric 可用後才談 AI feedback**。

第一批成功指標不是「37 題都有長答案」，而是：題面 authority 穩定、每題知道屬於哪個概念、每個 lesson 有 reviewed sources、每個申論小題有透明且允許替代論證的 rubric，且產品不再把申論題偽裝成選擇題。
