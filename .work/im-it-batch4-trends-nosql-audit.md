# IM-IT 第四批 A：新興應用與 Big Data／NoSQL 盤點稽核

## 結論與範圍

- Authority：所有 taxonomy、question metadata、題面與答案盤點均以 `origin/main` 的 `public/data/im-it-concept-master.json`、`im-it-question-metadata.json`、`questions.json`、`answers.json`、`im-it-source-registry.json` 為準；未以 working tree 的同名檔覆蓋 authority。
- 產出兩堂 draft，未自行批准：
  - `lesson-im-it-trends-emerging-digital-applications-01`：1 個 covered subtopic、6 個 eligible refs、4 sections、4 worked examples、6 cards。
  - `lesson-im-it-data-big-data-nosql-01`：2 個 covered subtopics、5 個 eligible refs、5 sections、4 worked examples、6 cards。
- 兩堂 summary 均明示「對應考古題答案均為非官方技術覆核」，`reviewStatus` 均為 `draft`。
- 兩堂均新增符合正式 schema 的 `learningScenario`：單一生活情境、5 列 everyday/technical mapping、明確失效邊界與 4 條 exam cues。
- 來源網頁只用 `mcp__stealth_fetch__stealth_fetch` 查核；沒有使用其他網頁抓取工具。

## Taxonomy authority

`origin/main` 已將下列 subtopics 標為 `reviewed`：

| Subtopic | Topic | Authority keywords |
|---|---|---|
| `im-it-trends-emerging-digital-applications` | `im-it-trends` | Fintech, crowdfunding, MOOC, smart speaker, autonomous vehicle, mobile payment, metaverse, digital twin |
| `im-it-trends-big-data-analytics` | `im-it-trends` | Big Data, analytics, data mining, 3V/5V, forecasting |
| `im-it-db-distributed-nosql` | `im-it-db` | replication, sharding, CAP, NoSQL, blockchain |
| `im-it-security-blockchain` | `im-it-security` | blockchain, Bitcoin, mining, distributed ledger, consensus |

最後一列比 `im-it-db-distributed-nosql` 更精確涵蓋 Bitcoin mining、不可竄改帳本與 NFT。雖然 DB subtopic 的舊 keywords 仍含 blockchain，題目 primary taxonomy 應採更窄、已存在的 `im-it-security-blockchain`，不可為提高 NoSQL refs 數而保留。

## Past-paper refs 盤點

### 新興科技與數位應用

| Question | Metadata | 決策 | 理由 |
|---|---|---|---|
| `q-pp-im-it-106-6` | eligible, medium | 收錄 | Fintech 定義，直接相關。 |
| `q-pp-im-it-106-16` | eligible, medium | 收錄 | Kickstarter/crowdfunding 分類，直接相關。 |
| `q-pp-im-it-106-17` | eligible, medium | 收錄 | MOOC 平台分類，直接相關。 |
| `q-pp-im-it-107-1` | eligible, high | 收錄 | 原始 voice-only smart speaker 技術；課文明確限制產品世代與輸入裝置。 |
| `q-pp-im-it-108-8` | eligible, high | 收錄 | 自動駕駛中直接環境感知與 GPS 定位的區分。 |
| `q-pp-im-it-109-7` | eligible, medium | **排除** | `origin/main` 題面 E 是「嗶嗶」，metadata/answer basis 卻以「嘖嘖」判斷；題面與解析 authority 衝突，修復前不可當 lesson/card ref。 |
| `q-pp-im-it-111-23` | ineligible, disputed | **排除** | Metaverse/blockchain 選項不能保證唯一答案，`practiceEligible=false`、`autoGradeEligible=false`。 |
| `q-pp-im-it-112-23` | eligible, medium | 收錄 | Digital twin 的定義與用途，直接相關。 |

Reviewed evidence threshold：`minimumPastPaperRefs=6`，恰由 6 個 unique、eligible、題面可用且位於 `coveredSubtopicIds` 的 refs 滿足，沒有引用 q109-7 或 disputed q111-23 湊數。

### Big Data 與 NoSQL grouped lesson

| Question | Current primary subtopic | Metadata | 決策 | 理由 |
|---|---|---|---|---|
| `q-pp-im-it-106-8` | Big Data | ineligible, disputed | **排除** | 3V/5V framework 未限定，value 選項使答案不唯一。 |
| `q-pp-im-it-108-10` | Big Data | eligible, medium | 收錄 | Volume、velocity、variety、veracity，直接相關。 |
| `q-pp-im-it-108-11` | Big Data | eligible, medium | 收錄 | Big-data analytics 應用情境，直接相關。 |
| `q-pp-im-it-111-24` | Distributed/NoSQL | ineligible, disputed | **移 taxonomy 且不收錄** | NFT 的 ownership 用語有爭議；主題實質是 blockchain token。 |
| `q-pp-im-it-112-20` | Distributed/NoSQL | eligible, high | **排除** | 題面 B–D 選項嚴重 OCR 拼接，甚至混入 min-heap；metadata eligibility 與實際內容完整性不一致，修復前不可可靠練習。 |
| `q-pp-im-it-112-24` | Distributed/NoSQL | eligible, medium | **移 taxonomy 且不收錄** | Bitcoin mining/transaction validation 是 blockchain consensus。 |
| `q-pp-im-it-114-15` | Distributed/NoSQL | eligible, high | 收錄 | NoSQL horizontal scaling，直接相關。 |
| `q-pp-im-it-115-21` | Distributed/NoSQL | eligible, high | 收錄 | CAP 三項保證，直接相關。 |
| `q-pp-im-it-115-25` | Distributed/NoSQL | eligible, medium | **移 taxonomy 且不收錄** | 無中央權威、不可竄改的交易帳本直接對應 blockchain。 |
| `q-pp-im-it-115-26` | Distributed/NoSQL | eligible, high | 收錄 | Flexible schema 與 horizontal scalability，直接相關。 |

Reviewed evidence threshold：`minimumPastPaperRefs=5`。Grouped lesson 的 `coveredSubtopicIds` 是 `im-it-trends-big-data-analytics` 與 `im-it-db-distributed-nosql`，由 Big Data 2 refs 加 NoSQL/CAP 3 refs 滿足；未使用 disputed q106-8、破損 q112-20 或 blockchain 題。

## 精確 taxonomy move manifest（建議，未套用）

```json
[
  {
    "questionId": "q-pp-im-it-111-24",
    "fromTopicId": "im-it-db",
    "fromPrimarySubtopicId": "im-it-db-distributed-nosql",
    "toTopicId": "im-it-security",
    "toPrimarySubtopicId": "im-it-security-blockchain",
    "reason": "題幹主體是 NFT 作為 blockchain 上的 unique token/data unit；答案仍 disputed，taxonomy move 不改 publication eligibility。"
  },
  {
    "questionId": "q-pp-im-it-112-24",
    "fromTopicId": "im-it-db",
    "fromPrimarySubtopicId": "im-it-db-distributed-nosql",
    "toTopicId": "im-it-security",
    "toPrimarySubtopicId": "im-it-security-blockchain",
    "reason": "題幹直接詢問 Bitcoin mining 與 transaction validation，對應 blockchain consensus。"
  },
  {
    "questionId": "q-pp-im-it-115-25",
    "fromTopicId": "im-it-db",
    "fromPrimarySubtopicId": "im-it-db-distributed-nosql",
    "toTopicId": "im-it-security",
    "toPrimarySubtopicId": "im-it-security-blockchain",
    "reason": "題幹描述 without central authority 的 tamper-resistant, verifiable transaction ledger，直接對應 blockchain/distributed ledger。"
  }
]
```

套用時至少應同步更新 `im-it-question-metadata.json` 的 `topicId`、`primarySubtopicId` 與 `taxonomyRationale`；不得因 move 改動 q111-24 的 disputed confidence/publication 狀態。若 concept-master coverage 統計由 metadata 動態產生，也應重跑對應測試。

## 建議新增的 reviewed source registry entries

下列頁面均於 2026-08-16 以 stealth fetch 實際查核。`status=reviewed` 在此表示本批已核對頁面與使用範圍；本任務只提出 entries，未修改 public registry。

```json
[
  {
    "id": "src-world-bank-fintech-future-finance",
    "title": "Fintech and the Future of Finance",
    "author": "World Bank Group",
    "publisher": "World Bank Group",
    "type": "official-guidance",
    "url": "https://www.worldbank.org/en/publication/fintech-and-the-future-of-finance",
    "scope": ["emerging-digital-applications", "fintech", "digital-financial-services", "payments", "crowdfunding"],
    "usage": "terminology-and-concept-check",
    "status": "reviewed"
  },
  {
    "id": "src-kickstarter-about",
    "title": "About Kickstarter",
    "author": "Kickstarter",
    "publisher": "Kickstarter, PBC",
    "type": "documentation",
    "url": "https://www.kickstarter.com/about",
    "scope": ["emerging-digital-applications", "crowdfunding"],
    "usage": "platform-example-check",
    "status": "reviewed"
  },
  {
    "id": "src-mooc-org-edx",
    "title": "MOOC.org / edX Course Platform",
    "author": "edX",
    "publisher": "edX LLC",
    "type": "documentation",
    "url": "https://www.mooc.org/",
    "scope": ["emerging-digital-applications", "online-learning", "mooc"],
    "usage": "platform-example-check",
    "status": "reviewed"
  },
  {
    "id": "src-futurelearn-what-is-a-mooc",
    "title": "What is a MOOC?",
    "author": "FutureLearn",
    "publisher": "FutureLearn",
    "type": "documentation",
    "url": "https://www.futurelearn.com/info/blog/what-is-a-mooc",
    "scope": ["emerging-digital-applications", "online-learning", "mooc"],
    "usage": "definition-and-terminology-check",
    "status": "reviewed"
  },
  {
    "id": "src-amazon-alexa-voice-service",
    "title": "Alexa Built-in Devices and Alexa Voice Service",
    "author": "Amazon Developer",
    "publisher": "Amazon",
    "type": "documentation",
    "url": "https://developer.amazon.com/en-US/alexa/alexa-voice-service",
    "scope": ["emerging-digital-applications", "smart-speaker", "voice-interface"],
    "usage": "device-input-output-and-platform-check",
    "status": "reviewed"
  },
  {
    "id": "src-synopsys-autonomous-car",
    "title": "What is an Autonomous Car?",
    "author": "Synopsys",
    "publisher": "Synopsys",
    "type": "documentation",
    "url": "https://www.synopsys.com/automotive/what-is-autonomous-car.html",
    "scope": ["emerging-digital-applications", "autonomous-vehicle", "sensors", "perception"],
    "usage": "sensor-role-concept-check",
    "status": "reviewed"
  },
  {
    "id": "src-nist-ir-8356-digital-twin",
    "title": "Security and Trust Considerations for Digital Twin Technology",
    "author": "Jeffrey Voas, Peter Mell, Phillip Laplante, Vartan Piroumian",
    "publisher": "National Institute of Standards and Technology",
    "type": "official-guidance",
    "url": "https://csrc.nist.gov/pubs/ir/8356/final",
    "scope": ["emerging-digital-applications", "digital-twin", "monitoring", "simulation"],
    "usage": "definition-and-operational-use-check",
    "status": "reviewed"
  },
  {
    "id": "src-ibm-big-data",
    "title": "What is big data?",
    "author": "IBM Think",
    "publisher": "IBM",
    "type": "documentation",
    "url": "https://www.ibm.com/think/topics/big-data",
    "scope": ["big-data", "big-data-analytics", "data-quality", "distributed-processing"],
    "usage": "terminology-and-concept-check",
    "status": "reviewed"
  },
  {
    "id": "src-mongodb-nosql-explained",
    "title": "What is NoSQL?",
    "author": "MongoDB",
    "publisher": "MongoDB, Inc.",
    "type": "documentation",
    "url": "https://www.mongodb.com/resources/basics/databases/nosql-explained",
    "scope": ["databases", "nosql", "document-store", "key-value", "wide-column", "graph"],
    "usage": "data-model-and-terminology-check",
    "status": "reviewed"
  },
  {
    "id": "src-mongodb-sharding",
    "title": "Sharding",
    "author": "MongoDB Documentation",
    "publisher": "MongoDB, Inc.",
    "type": "documentation",
    "url": "https://www.mongodb.com/docs/manual/sharding/",
    "scope": ["databases", "distributed-databases", "sharding", "horizontal-scaling", "replication"],
    "usage": "architecture-and-worked-example-check",
    "status": "reviewed"
  },
  {
    "id": "src-ibm-cap-theorem",
    "title": "What is the CAP theorem?",
    "author": "IBM Think",
    "publisher": "IBM",
    "type": "documentation",
    "url": "https://www.ibm.com/think/topics/cap-theorem",
    "scope": ["distributed-systems", "distributed-databases", "cap-theorem", "network-partition"],
    "usage": "terminology-and-tradeoff-check",
    "status": "reviewed"
  }
]
```

### Fetch evidence 摘要

- World Bank 明定 Fintech 是 digital technology 應用於 financial services，並列 payments 與 investment-based crowdfunding 等技術說明。
- Kickstarter 官方 About 說明 creators 分享 projects，由 communities/backers 提供 funding。
- MOOC.org 目前導向一般 edX 課程平台；因此 entry 只用於平台例子，不把該頁當成 MOOC 定義來源。
- FutureLearn 的 `What is a MOOC?` 頁面明確寫出 `MOOC stands for massive open online course`，並解釋 massive、open、online 與 course；lesson/card 以此 entry 支撐 MOOC 全名與核心形式，已修正前次 source coverage major。
- Amazon AVS 頁面明示 Alexa Built-in devices 透過 microphone 與 speaker 直接語音互動；課程再以題面限定推導 image recognition 非 voice-only 必需步驟。
- `origin/main` 既有 reviewed `src-brookshear-13e` 的 artificial-intelligence scope 補充支撐 speech recognition、NLP 與 synthesis 的一般概念；新增 Amazon entry 只負責裝置與平台限定。
- NHTSA 官方頁曾用於交叉檢查 driver assistance/automated driving systems 與 SAE Level 0–5 脈絡，但本課沒有引用 level claims，故未加入 builder entries。實際被課程引用的 Synopsys 技術頁具體列出 camera、radar、lidar 的環境感知角色。GPS 的定位角色屬題面技術分類，課程沒有宣稱 GPS 對自動駕駛不重要。
- NIST IR 8356 定義 digital twin 為 real-world entities 的 electronic representations，可觀察 states/transitions，並列 monitoring、simulation、testing 等用途。
- IBM Big Data 頁面列出 volume、velocity、variety、veracity、value，並說明 distributed processing、分析與決策用途；課程明示 V framework 版本差異。
- MongoDB NoSQL 頁面列 document、key-value、wide-column、graph 與 flexible schema；Sharding 文件區分 vertical/horizontal scaling，說明 shard key、資料分散與 replica-set 組件。
- IBM CAP 頁面定義 consistency、availability、partition tolerance 與 partition 下 CP/AP 行為；課程避免把 CAP 簡化成脫離 partition 情境的口號。
- 曾嘗試的 NIST digital-twin 舊 URL與 GPS.gov 舊路徑回傳 404，未列入 registry entries；來源提案只保留成功取得且內容適用的頁面。

## 卡片與 refs 子集檢查

- 每張 card 的 `lessonId` 均指向本檔 lesson，`subtopicId` 均在該 lesson 的 `coveredSubtopicIds`。
- 每張 card 的 `pastPaperRefs` 都是所屬 lesson `pastPaperRefs` 的子集，且 card 問答與所引題的核心概念一致。
- 每張 card 的 `sourceRefs` 都是所屬 lesson `sourceRefs` 的子集。
- Lesson refs 全部在 `origin/main` metadata 中 `publication.autoGradeEligible=true`，且 primary subtopic 位於 `coveredSubtopicIds`。
- 所有 worked examples 均在 prompt 提供輸入、規則與必要前提，不依賴未提供的 schema、初值或產品假設。
- 兩堂 `learningScenario.predict` 均為 string，mapping 均恰為 5 列且每列只有 `everyday`/`technical`，`examCues` 均恰為 4 strings；比喻的產品年代、感知／定位、NoSQL 選型與 CAP 邊界均已明示。

## 待後續處理（不阻擋本 draft，但不得忽略）

1. 先套用並獨立 review 上述三題 blockchain taxonomy manifest，再更新 coverage 統計。
2. 修復 q109-7 的「嗶嗶／嘖嘖」題面—解析衝突後，重新判定 answer confidence 與 eligibility，不能直接把目前解析當 authority。
3. 依原卷重新 OCR／人工重建 q112-20 的 B–D 選項，再重做技術答案 review；修復前不得放入 practice refs。
4. 新 source entries 寫入 public registry 前仍需由作者以外 reviewer 核對 URL、scope、usage 與 vendor-specific 限制。
5. 本檔僅是 author draft 與 audit，沒有把 `reviewStatus` 改為 reviewed，也沒有自行產生 approval。
