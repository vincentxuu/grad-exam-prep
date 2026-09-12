# IM-IT full coverage Batch B cross-review

## Verdict

**架構與技術內容大致合格，但尚不可原樣 merge 為 reviewed canonical content。** 五堂課的分組自然、source scope 足夠、scenario/boundary 完整，且 lesson-level refs 全部在 coverage 內；主要阻塞是 1 筆破碎題面仍被當 evidence，以及多張 cards 把「同 subtopic 的 eligible 題」誤當成「直接支撐此 card claim 的題」。

抽查摘要：

- 5 lessons、9/9 指定 subtopics、18 cards，每個 subtopic 正好 2 cards。
- 17 個 unique lesson refs；metadata 與 answer review eligibility flags 皆為 true，primary subtopic 也都位於各 lesson coverage。
- `im-it-ds-algorithm-design` 是唯一 zero-direct subtopic，揭露與空 card refs 均正確。
- 1 筆題面不可用：`q-pp-im-it-112-26`。
- 1 張 card 有 primarySubtopic mismatch；至少 7 張 cards 的 paper refs 只屬同領域、但沒有直接支撐 card claim。

## Must-fix

### 1. 移除或修復破碎的 `q-pp-im-it-112-26`

這題目前雖被標記 eligible、reviewed answer `E` 也存在於 labels，但 A–D 選項已破碎成無法判讀的片段，例如：

- `If all the edges of a graph are edges of a spanning tree T of G`
- `if it is not T`
- `a spanning tree T of G is devoted to T`

Answer reasoning 則自行補入「邊集相同、加入非樹邊成環、可有多棵 spanning trees」等未能從現有題面驗證的內容。Fragment review 已承認選項破碎，卻仍讓它：

- 成為 graph/design lesson 的 2 個 refs 之一；
- 支撐 `card-im-it-ds-graphs-mst-b02` 的「MST vs shortest path」claim。

即使完整原題可能談 spanning tree，目前抽取內容也沒有 MST 或 shortest path。修復 PDF extraction 與 answer review 前，應從 lesson/card refs 移除；移除後 graph/design lesson 只剩 topological-sort 一題，需降低 evidence threshold、補 verified ref，或維持 foundational/non-reviewed 狀態。

### 2. 清除明確不支撐 card claim 的 refs

以下不是單純「題目較淺」，而是 paper question 沒有直接問 card 所述概念：

| Card | 現有 refs | 問題 |
|---|---|---|
| `card-im-it-db-er-many-to-many-b02` | 110-24 | 題目只問 database logical structure 是 schema，沒有 many-to-many、junction relation 或 relationship attributes。 |
| `card-im-it-os-sync-race-b01` | 113-9、114-10 | 題目分別問 mutual exclusion 可能造成的 liveness 問題、semaphore purpose；都沒有 shared read-modify-write 或 race condition 定義。 |
| `card-im-it-os-deadlock-coffman-b01` | 113-9、111-17 | 113-9 primary 是 synchronization，111-17 問 livelock；兩題都沒有列出 Coffman four conditions。 |
| `card-im-it-ds-graphs-mst-b02` | 112-26 | 題面破碎，且沒有 MST vs shortest-path comparison。 |

處置：保留 source-backed cards 可以，但 `pastPaperRefs` 應清空或換成真正 direct evidence；不可讓 eligibility 取代語意對齊。`card-im-it-os-deadlock-coffman-b01` 的 113-9 另有 canonical primary mismatch，必須移除或標為 adjacent，而非 direct card ref。

### 3. Reviewed status 必須等 evidence 修正後再保留

Graph/design lesson 目前一半 refs 不可用；ER many-to-many、race、Coffman cards 又有直接 evidence 誤掛。這些 artifacts 仍標 `reviewStatus=reviewed`／document `status=reviewed-fragment`，會讓 merger 將 evidence 品質誤判為完成。完成 ref 修正前，相關 lesson/cards 應降為 draft，或 merger 應拒絕含 semantic evidence finding 的 fragment。

## Should-fix

### 1. 幾張 cards 的 refs 只部分支撐 claim，建議收斂

- `card-im-it-ds-linear-adt-choice-b02` 講 stack、queue、array、linked list 的一般選擇；115-4 只支撐 balanced parentheses 選 stack。可改成空 refs，或把 card 收斂成「從存取契約選 stack」案例。
- `card-im-it-ds-hashing-average-b01`：115-1 直接支撐 average O(1)，110-22 只支撐 associative array 使用 hash function；後者沒有必要掛在 complexity claim。
- `card-im-it-ds-hashing-collision-b02` 講 chaining、open addressing、linear probing、double hashing；110-22/115-1 都沒考 collision strategy。建議空 refs。
- `card-im-it-os-sync-semaphore-b02` 講 binary/counting semaphore 與 permits；114-10 只問 semaphore 在選項中的 primary purpose。可保留為相鄰 evidence，但若 contract 要 direct claim，應空 refs或縮窄 card。

### 2. Normalization 用語可再精確

Lesson 主文已使用 candidate key/non-prime attribute，比考題的「primary key/non-key」更準確；但 card `normalization-forms-b01` 又回到「對 composite key 的 partial dependency」與一般化的 3NF 口訣。作為概論可接受，建議補一句：正式 3NF 定義應對每個 FD 與 candidate keys/prime attributes 判斷，不只背「non-key 不遞移依賴 primary key」。

### 3. 「High selectivity」措辭避免術語歧義

Storage lesson 寫「high selectivity 通常表示少量 rows 符合」。部分資料庫材料以 selectivity 表示符合比例，另一些以辨識力使用 high-selectivity。建議直接寫「highly selective predicate／低符合比例」，避免學生只背 high/low 而在不同教材中反轉。

### 4. Validator 必須加入 semantic evidence gates

現有 validator 驗證 eligibility、source ID 與結構，但沒有攔住上述問題。至少應新增：

1. Card refs 必須是所屬 lesson refs 的 subset。
2. Direct card ref 的 `primarySubtopicId` 必須等於 card subtopic，否則標 adjacent。
3. 題面選項需可解析且 reviewed answer 存在於 options；另建立 broken-text heuristic。
4. 對 card claim 與題面做人工 review manifest，不能只比 topic ID。
5. `minimumPastPaperRefs` 只計入通過 content-integrity 的 refs。

## Passed

### 分組與深度

- Linear structures + hashing 以「依操作契約選容器」串聯，雖是兩類結構但不過度。
- Graphs + algorithm design 是自然組合；zero-direct design content 用 graph refs 作 lesson context、cards 保持空 refs，揭露正確。
- ER modeling + normalization 形成 requirements → schema → dependency repair 的連續流程，兩個 worked examples也能互相承接。
- Storage/indexing 獨立成課合理，避免和 relational model/normalization 混成一堂。
- Synchronization + deadlock 由 safety 進入 liveness，五節內容足以區分 race、mutex/semaphore、Coffman、livelock/starvation 與 Banker。

### 技術正確性

- Stack/LIFO balanced-parentheses algorithm、hash average-vs-worst boundary、chaining/open addressing 的核心敘述正確。
- Topological sort 需要 DAG；BFS、DFS、MST、shortest path、greedy/DP/correctness 的區分正確。
- ER symbols、many-to-many junction relation、FD、1NF/2NF/3NF、lossless/dependency-preservation 的教學骨架正確。
- B+ tree 支援 ordered range scan、hash index 不保留 ordering、index/scan 取捨與 OLAP 概念正確。
- Race、critical section、mutex/semaphore、deadlock/livelock/starvation、Coffman conditions 與 Banker safe-state 說明正確；特別是「unsafe 不等於已 deadlock」值得保留。

### Scenarios 與 boundaries

五課均有 hook、predict、5 mappings、4 cues 與明確 boundary：

- 園遊會能正確映射 LIFO/FIFO/hash/collision/load factor，且沒有把平均 O(1) 說成保證。
- 活動排程同時凸顯 topological order、BFS 與 MST 的不同目標，boundary 明確排除「同一張圖就用同一算法」。
- 社團報名把 entities、M:N relationship、FD 與 decomposition 放在同一資料情境，且提醒 normalization 依 business rules。
- 圖書館索引能區分 equality/range/OLAP/scan，boundary 補出 buffer、statistics 與 physical layout。
- 共用廚房能區分 race、mutex、counting semaphore、deadlock 與 livelock，且 boundary 明示 memory ordering、fairness 與 ownership 未被比喻涵蓋。

### Zero-ref 與 sources

- `im-it-ds-algorithm-design` 的 zero-direct 狀態明確揭露；兩張 cards 都維持空 refs，沒有冒掛 graph 題。
- MIT 6.006 足以支撐線性結構、hash、graphs 與 algorithm-design foundations。
- Brookshear + 杰哥資料庫課程的 registered scope 能支撐 ER、normalization、storage/indexing 概論。
- NTHU OS course + Brookshear 能支撐 synchronization/deadlock；所有 source IDs 均閉合且 canonical status reviewed。

## Merge gate

建議 merge 前至少完成：

- 移除／修復 112-26，重新計算 graph lesson evidence。
- 清除 ER M:N、race、Coffman、MST cards 的不實 direct refs。
- 收斂 ADT/hash/semaphore cards 的部分支撐 refs。
- 更新 validator，加入 card→lesson、primarySubtopic 與 content-integrity gates。
