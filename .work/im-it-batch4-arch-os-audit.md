# IM-IT Batch 4：Architecture / OS grouped lessons audit

## Authority 與範圍

- Authority commit：`origin/main` @ `6be3e75302159b1f4801d335916567f7e62f9ba8`
- 產物：
  - `lesson-im-it-arch-memory-data-representation-01`
  - `lesson-im-it-os-scheduling-memory-management-01`
- 題目、taxonomy 與判分資格分別以該 commit 的：
  - `public/data/questions.json`
  - `public/data/im-it-question-metadata.json`
  - `public/data/im-it-answer-review.json`
  為準；沒有把 dirty worktree 的 public artifacts 當 authority。
- 兩堂課皆保留 `reviewStatus: draft`，本產物沒有自行批准。

## Taxonomy 交叉檢查

### `q-pp-im-it-109-13`：manifest 描述與 authority 不一致

- `origin/main` 題文是 parity bit：`A ______ bit is a check bit ... total number of 1-bits ... even or odd.`
- Metadata：`im-it-arch-data-representation`；rationale 為「考 parity bit」；`autoGradeEligible: true`。
- `.work/im-it-batch4-taxonomy-manifest.json` 卻稱此題考 LDAP 並提議移至 `im-it-network-application-protocols`。
- LDAP 題在 authority 中實際是 `q-pp-im-it-108-13`，不是 `q-pp-im-it-109-13`。
- `answers.json` 的 explanation 也把它解釋成 LDAP，和題文、metadata rationale 不一致；雖然答案字母 C 恰好同時對應 parity 與 LDAP，仍不宜讓 lesson 依賴此 artifact。
- 整合相容性結論：batch4 將依 manifest 把此 ID 移至 network application protocols，因此 Architecture lesson **不引用** `q-pp-im-it-109-13`，改以 eligible 的 `q-pp-im-it-106-15` 維持 8 refs。整合端仍應另外釐清題文／解釋是否為跨卷內容錯置。

### `q-pp-im-it-113-5`：manifest 描述與 authority 不一致

- `origin/main` 題文問 stack memory / function call / local variables / stack overflow。
- Metadata：`im-it-os-memory-management`，但答案為 `disputed`，`practiceEligible: false`、`autoGradeEligible: false`。
- Manifest 卻稱此題比較 register、L1、L2 cache，提議移至 `im-it-arch-memory-hierarchy`。
- Authority 中真正比較 register、L1、L2 的題目是 `q-pp-im-it-112-5`。
- 整合相容性結論：`q-pp-im-it-113-5` 因 disputed / 非自動判分而完全排除；batch4 若按 manifest 將此 ID 移至 memory hierarchy，也不會成為 lesson ref。Cache 內容使用已 eligible 且題文直接相符的 `q-pp-im-it-112-5` 與 `q-pp-im-it-115-7`。

### 其他排除判斷

- `q-pp-im-it-112-12` metadata 雖為 CPU scheduling 且 `autoGradeEligible: true`，但 authority 的 rendered stem 只列 A–C，reviewed answer 卻為 D；為避免題面不完整污染學習 refs，本課排除。
- `q-pp-im-it-106-15`（RAID）在 authority 中屬 `im-it-arch-memory-hierarchy` 且 eligible；為避開 q109-13 drift，本課納入此題，並在「記憶體階層」段落直接教 secondary storage、RAID 容量／效能／fault tolerance 與 data security 的界線。
- 課程內容提及 page fault，但不引用 `q-pp-im-it-113-5`；page-fault 卡片只使用 page table / thrashing 的直接可判分題。

## Past-paper refs audit

所有 lesson refs 均在 `origin/main` 同時滿足：

1. `publication.autoGradeEligible === true`；
2. `primarySubtopicId` 位於該 lesson 的 `coveredSubtopicIds`；
3. 題幹語意直接支援 lesson / card 所教概念；
4. 題目答案僅視為非官方技術覆核，lesson summary 已明確揭露。

### Architecture lesson：8 refs

| Question | Authority subtopic | 直接考點 |
|---|---|---|
| `q-pp-im-it-106-11` | `im-it-arch-data-representation` | parity 的偵錯限制 |
| `q-pp-im-it-108-1` | `im-it-arch-data-representation` | 靜態影像與 MPEG |
| `q-pp-im-it-106-15` | `im-it-arch-memory-hierarchy` | RAID 的主要目的與 data security 界線 |
| `q-pp-im-it-110-3` | `im-it-arch-data-representation` | image formats |
| `q-pp-im-it-109-15` | `im-it-arch-memory-hierarchy` | volatile / non-volatile |
| `q-pp-im-it-110-4` | `im-it-arch-memory-hierarchy` | ROM 與 RAM 揮發性 |
| `q-pp-im-it-112-5` | `im-it-arch-memory-hierarchy` | register、L1、L2 階層 |
| `q-pp-im-it-115-7` | `im-it-arch-memory-hierarchy` | cache 降低平均存取時間 |

### OS lesson：8 refs

| Question | Authority subtopic | 直接考點 |
|---|---|---|
| `q-pp-im-it-111-18` | `im-it-os-cpu-scheduling` | scheduling objectives |
| `q-pp-im-it-111-19` | `im-it-os-cpu-scheduling` | starvation 與 Round Robin |
| `q-pp-im-it-114-9` | `im-it-os-cpu-scheduling` | MLFQ 可跨 queue 移動 |
| `q-pp-im-it-115-11` | `im-it-os-cpu-scheduling` | SJF 與平均等待時間 |
| `q-pp-im-it-106-14` | `im-it-os-memory-management` | virtual-memory pages |
| `q-pp-im-it-112-7` | `im-it-os-memory-management` | 常見 page size |
| `q-pp-im-it-114-11` | `im-it-os-memory-management` | page-table mapping |
| `q-pp-im-it-115-12` | `im-it-os-memory-management` | thrashing |

機械驗證結果：16 個 lesson refs 中，invalid refs 為 0。

## Sources review

所有來源網頁均以 `mcp__stealth_fetch__stealth_fetch` 抓取核對；未使用一般 WebFetch 或 Playwright。

### 使用的 reviewed source refs

- `src-brookshear-13e`
  - Registry 狀態：`reviewed`
  - Scope：`computer-architecture`、`operating-systems`
  - 抓取頁面確認書目為 *Computer Science: An Overview, 13/e*，目錄包含 Data Storage、Data Manipulation、Operating Systems，附錄包含 ASCII 與 Two’s Complement。
  - 用途：資料表示、儲存階層與 OS 概念摘要。
- `src-nthu-os-course`
  - Registry 狀態：`reviewed`
  - Scope：`operating-systems`
  - 抓取 playlist 確認課綱明列 Process Scheduling、Memory Management Strategies、Virtual-Memory Management；影片列表也包含 Ch5 Process Scheduling、Ch8 Memory Management、Ch9 Virtual Memory Management。
  - 用途：排程、paging、virtual memory 與 thrashing。

### 額外提出、但本批尚未引用的候選 reviewed source

- 建議 ID：`src-mit-computation-structures-6004`
- Title：`Computation Structures (6.004), Spring 2017`
- Author / publisher：Chris Terman / MIT OpenCourseWare
- Type：`course`
- URL：`https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/`
- Suggested scope：`computer-architecture`、`memory-hierarchy`、`virtual-memory`、`data-representation`
- Suggested usage：`conceptual-summary`
- Review evidence：stealth-fetch 的官方課程頁明列 `Basics of Information`、`Caches and the Memory Hierarchy`、`Virtual Memory`，並提供 lecture notes / videos。
- 處理：因 `origin/main` registry 尚無此 ID，draft 的 `sourceRefs` 不引用它，避免產生 dangling source ref；可由主整合者獨立審核後再加入 registry。

## Content shape validation

- Lessons：2
- Cards：12（每堂 6）
- 每堂 sections：4
- 每堂 reproducible worked examples：3
- 每堂 `minimumPastPaperRefs`：8；實際 refs：8
- 每堂均有完整 `coveredSubtopicIds`
- 所有 card `subtopicId` 都位於所屬 lesson 的 covered set
- 所有 card refs 都是其 lesson refs 的子集合
- JSON 已通過 `jq empty`

## Reviewer 注意事項

- 請優先判斷 parity / LDAP 與 stack / cache 的 artifact drift 是否應回頭修正 manifest，而不是更動這兩堂課以迎合錯誤 manifest。
- SJF 的「最小平均等待時間」已限定在 burst 已知等條件，避免過度概括。
- RR 的 starvation-free 說法已限定為 process 持續位於 ready queue 且系統正常推進。
- 4 KiB 僅描述為常見基本 page size，未宣稱所有架構固定使用 4 KiB。
- 本批沒有宣稱非官方 reviewed answers 是官方答案。
