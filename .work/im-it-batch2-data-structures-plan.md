# IM-IT 第二批學習模組規劃：資料結構與演算法

## 範圍與資料依據

- Taxonomy：`public/data/im-it-concept-master.json`
- 題目分類與發布狀態：`public/data/im-it-question-metadata.json`
- 單選題人工覆核結果：`public/data/im-it-answer-review.json`
- 現有發布內容：`public/data/im-it-lessons.json`、`public/data/im-it-concept-cards.json`

目前已發布 5 個 IM-IT lessons，涵蓋 DB、Network、OS；**資料結構 `im-it-ds` 的 8 個 subtopics 尚無已發布 lesson/card**。

本規劃使用 metadata 的 `primarySubtopicId` 計 taxonomy 題數，使用 `publication.autoGradeEligible` 計可自動判分題數。與 answer review 交叉核對後，14 題 eligible 單選題全部為 `confirmed`；唯一已覆核但不可自動判分的 DS 單選題是 `q-pp-im-it-112-25`（`disputed`）。程式實作與簡答題不在單選答案覆核範圍，應採 self-assessment，不可轉成自動判分。

## Taxonomy 題量

| Subtopic | Taxonomy 題數 | Auto-grade eligible | 非自動題 | 題型概況 | 規劃判斷 |
|---|---:|---:|---:|---|---|
| `im-it-ds-complexity-analysis` 複雜度分析 | 0 | 0 | 0 | 無直接標記題 | 不獨立成課；作為每個演算法模組的共通分析工具 |
| `im-it-ds-linear-structures` 線性資料結構 | 4 | 1 | 3 | 1 單選、3 程式實作 | 可成課，但正式自動練習偏少；以程式 trace/self-assessment 補足 |
| `im-it-ds-trees-bst` 樹與二元搜尋樹 | 8 | 1 | 7 | 2 單選、5 程式實作、1 簡答 | 題量高但只有 1 題可自動判分；其中 2 題實際是 heap，建議先修 taxonomy |
| `im-it-ds-heaps-priority-queues` 堆積與優先佇列 | 4 | 4 | 0 | 4 單選 | 最適合先發布；所有題目答案均 confirmed 且可自動判分 |
| `im-it-ds-hashing` 雜湊 | 4 | 2 | 2 | 2 單選、1 程式實作、1 簡答 | 可形成完整概念課；自動題與實作題比例平衡 |
| `im-it-ds-graphs` 圖論與圖演算法 | 3 | 2 | 1 | 2 單選、1 簡答證明 | 題數較少，但 spanning tree、Prim、topological sort 可形成一課 |
| `im-it-ds-sorting-searching` 排序與搜尋 | 6 | 4 | 2 | 4 單選、2 程式實作 | 高可發布性；可自然承接 Big-O、穩定性、partition 與 string matching |
| `im-it-ds-algorithm-design` 演算法設計 | 0 | 0 | 0 | 無直接標記題 | 不獨立成課；將 greedy/correctness 放進 graph，divide-and-conquer 放進 sorting |
| **合計** | **29** | **14** | **15** | 15 單選、11 程式實作、3 簡答 | 14 題可自動判分；14 題 open/code 採 self-assessment，另 1 題 disputed 停用 |

## 各 taxonomy 題目盤點

### `im-it-ds-complexity-analysis`：0 / 0

目前沒有 primary taxonomy 題。Big-O 應嵌入下列課程，而不是為了湊模組建立沒有 past-paper 支撐的獨立課：

- heap insertion/search：`O(log n)`、`O(n)`
- sorting best/worst case：Bubble Sort、QuickSort
- hashing average/worst case
- array/list/stack/queue 操作成本

### `im-it-ds-linear-structures`：4 / 1

| Question ID | 題型 | Eligible | 用途 |
|---|---|---:|---|
| `q-pp-im-it-109-21` | code implementation | 否 | array-based List 的 remove 與擴容 |
| `q-pp-im-it-114-25` | code implementation | 否 | circular linked-list queue |
| `q-pp-im-it-115-4` | single choice | 是 | stack 與括號平衡 |
| `q-pp-im-it-115-31` | code implementation | 否 | array stack、反轉與排序 |

課程內容應聚焦 ADT 與實作選擇：array vs linked list、stack/queue 操作不變量、circular queue、dynamic array expansion。三題 code 題只能作 worked example 或自我核對，不可宣稱已通過自動答案覆核。

### `im-it-ds-trees-bst`：8 / 1

| Question ID | 題型 | Eligible | 用途／注意事項 |
|---|---|---:|---|
| `q-pp-im-it-106-25` | code implementation | 否 | BST inorder successor |
| `q-pp-im-it-106-26` | short explanation | 否 | AVL／2-3／red-black tree 高度與平衡 |
| `q-pp-im-it-108-21` | code implementation | 否 | **實際為 max-heap，建議改至 heap taxonomy** |
| `q-pp-im-it-109-22` | code implementation | 否 | **實際為 max-heap priority update，建議改至 heap taxonomy** |
| `q-pp-im-it-110-29` | code implementation | 否 | array-based binary tree |
| `q-pp-im-it-112-25` | single choice | 否 | B-tree invariants；答案 disputed，不得 auto-grade |
| `q-pp-im-it-113-25` | code implementation | 否 | pointer-based BST operations |
| `q-pp-im-it-114-4` | single choice | 是 | BST inorder traversal |

若先完成 taxonomy 修正，本 subtopic 應為 **6 題／1 eligible**。課程仍值得建立，因為 6 題包含 traversal、search-tree invariant、successor、balanced trees 與兩種 tree representation；但發布時必須清楚區分「可練單選」與「程式自我評量」。

### `im-it-ds-heaps-priority-queues`：4 / 4

| Question ID | 題型 | Eligible | 用途 |
|---|---|---:|---|
| `q-pp-im-it-112-27` | single choice | 是 | min-heap insertion complexity |
| `q-pp-im-it-112-28` | single choice | 是 | min-heap 任意搜尋 complexity |
| `q-pp-im-it-114-3` | single choice | 是 | binary heap 實作 priority queue |
| `q-pp-im-it-115-3` | single choice | 是 | heap insertion complexity |

加上應重分類的 `q-pp-im-it-108-21`、`q-pp-im-it-109-22` 後，教學群組為 **6 題／4 eligible**。可涵蓋 complete binary tree、heap-order property、array index、sift-up/down、insert/delete、priority update 與任意搜尋為何不是 `O(log n)`。

### `im-it-ds-hashing`：4 / 2

| Question ID | 題型 | Eligible | 用途 |
|---|---|---:|---|
| `q-pp-im-it-108-22` | short explanation | 否 | double hashing probe sequence |
| `q-pp-im-it-110-22` | single choice | 是 | hash function 目的 |
| `q-pp-im-it-111-25` | code implementation | 否 | chaining hash table |
| `q-pp-im-it-115-1` | single choice | 是 | average lookup/insert complexity |

可以一課串起 hash function、load factor、collision、separate chaining、open addressing 與 double hashing。兩題 eligible 足以做基礎自動練習；兩題 open/code 適合做 probe trace 與 chaining implementation worked examples。

### `im-it-ds-graphs`：3 / 2

| Question ID | 題型 | Eligible | 用途 |
|---|---|---:|---|
| `q-pp-im-it-107-26` | short explanation | 否 | Prim MST cut property 證明 |
| `q-pp-im-it-112-26` | single choice | 是 | graph 與 spanning tree 關係 |
| `q-pp-im-it-115-6` | single choice | 是 | DAG topological sort |

單獨題量不大，但可和 `im-it-ds-algorithm-design` 的 learning objectives 合併教學：graph representation、spanning tree、Prim 的 greedy choice/cut property、DAG 與 topological ordering。演算法設計概念是教學骨架，不應捏造額外 taxonomy 題數。

### `im-it-ds-sorting-searching`：6 / 4

| Question ID | 題型 | Eligible | 用途 |
|---|---|---:|---|
| `q-pp-im-it-107-25` | code implementation | 否 | Dutch national flag partition |
| `q-pp-im-it-112-29` | code implementation | 否 | string matching trace/implementation |
| `q-pp-im-it-114-5` | single choice | 是 | Bubble Sort worst case |
| `q-pp-im-it-114-6` | single choice | 是 | Bubble Sort best case |
| `q-pp-im-it-115-2` | single choice | 是 | QuickSort worst case |
| `q-pp-im-it-115-5` | single choice | 是 | sorting stability |

這是第二批中最完整的演算法課候選：可用 input order 推導 best/worst case、比較 stable/in-place、解釋 QuickSort partition，再延伸 binary search 與 string matching。`im-it-ds-complexity-analysis` 與 divide-and-conquer 應嵌入本課。

### `im-it-ds-algorithm-design`：0 / 0

不建議獨立發布。可以在兩個既有題群中實作 objectives：

- Sorting/searching：divide-and-conquer、loop invariant、best/worst case。
- Graphs：greedy choice、cut property、correctness argument。

等未來累積 dynamic programming、recurrence 或 correctness 的真實題目，再拆成獨立 lesson。

## 建議 grouping 與優先序

### P0：先做，可直接形成有自動練習的課程

#### Group A — 排序、搜尋與複雜度

- 主要 lesson subtopic：`im-it-ds-sorting-searching`
- 教學支援概念：`im-it-ds-complexity-analysis`、`im-it-ds-algorithm-design`
- 題量：6 題，4 eligible
- 建議 lesson：**排序與搜尋：從操作軌跡判斷複雜度與穩定性**
- 建議段落：Big-O 判讀、Bubble Sort、QuickSort/partition、stability、search/string matching
- 建議 cards：6–8 張；至少覆蓋 best/worst case、stable、in-place、partition、binary search 前提

原因：eligible 比例高，且兩題 code 題足以提供可重現 worked examples；最容易先做出「概念 → trace → 自動題」完整閉環。

#### Group B — 樹、BST、Heap 與 Priority Queue（兩課同系列）

- Lesson B1：`im-it-ds-trees-bst`
  - taxonomy 修正後 6 題，1 eligible
  - 內容：tree representation、traversal、BST invariant/successor、balanced search trees、B-tree 注意事項
- Lesson B2：`im-it-ds-heaps-priority-queues`
  - 現況 4 題／4 eligible；含待重分類題後 6 題／4 eligible
  - 內容：complete binary tree、heap property、array mapping、insert/delete、priority update、operation complexity

原因：合計覆蓋 12 個現有 taxonomy rows，是最大題群。必須拆成兩課，避免把 BST ordering 與 heap ordering 混成同一規則。Heap 課可先發布；Tree 課需以 self-assessment 為主，且 `q-pp-im-it-112-25` 必須維持 disputed。

### P1：第二波補齊核心 ADT

#### Group C — 線性 ADT 與實作取捨

- 主要 lesson subtopic：`im-it-ds-linear-structures`
- 題量：4 題，1 eligible
- 建議 lesson：**Array、Linked List、Stack、Queue：操作不變量與實作成本**
- 建議段落：ADT vs implementation、dynamic array、linked list、stack、circular queue
- 發布策略：1 題 auto-grade；3 題 code 題拆成小型 trace/填空，但維持 self-assessment

#### Group D — Hash Table 與碰撞處理

- 主要 lesson subtopic：`im-it-ds-hashing`
- 題量：4 題，2 eligible
- 建議 lesson：**雜湊：從 hash function 到 chaining 與 double hashing**
- 建議段落：hash function、load factor、collision、chaining、open addressing/double hashing、average vs worst case

Group C、D 可包成「資料結構實作」系列，但應保留兩個 lesson/subtopic，避免 card 與 past-paper refs 跨 taxonomy 失去精準度。

### P1：演算法設計補充課

#### Group E — Graph、Spanning Tree 與 Greedy Correctness

- 主要 lesson subtopic：`im-it-ds-graphs`
- 教學支援概念：`im-it-ds-algorithm-design`
- 題量：3 題，2 eligible
- 建議 lesson：**圖論入門：Spanning Tree、Prim 與 Topological Sort**
- 建議段落：graph vocabulary/representation、spanning tree、Prim/cut property、DAG/topological order
- 限制：目前沒有直接 BFS、DFS、Dijkstra 題；可以教基礎概念，但不應在統計或 UI 宣稱歷屆題已覆蓋這三項

## 建議的 Batch 2 實際交付切分

若本批控制在 4 個 authoring units，建議依序：

1. **Sorting/Search + Complexity**：1 lesson、6–8 cards、6 past-paper refs（4 auto）。
2. **Trees + Heaps series**：2 lessons、各 6 cards、12 taxonomy rows（5 auto；重分類後 tree 6 + heap 6）。
3. **Linear Structures + Hashing series**：2 lessons、各 6 cards、8 rows（3 auto）。
4. **Graphs + Algorithm Design**：1 lesson、6 cards、3 refs（2 auto）。

總交付建議：**6 lessons、36–40 cards**。正式題目練習分兩種標示：

- `autoGradeEligible=true` 的 14 題：可進正式自動判分。
- 11 code + 3 short explanation：只做 worked example/self-assessment。
- `q-pp-im-it-112-25`：維持 disputed，不放入自動判分或正式模擬考。

## 開工前必要清理

1. 將 `q-pp-im-it-108-21`、`q-pp-im-it-109-22` 的 primary taxonomy 由 `im-it-ds-trees-bst` 改為 `im-it-ds-heaps-priority-queues`，並同步所有由 metadata 產生的 counts。
2. 課程 schema 若要求 pastPaperRefs 必須與 lesson subtopic 完全一致，必須先完成上述重分類，否則 heap lesson 無法合法引用兩題最重要的實作題。
3. 不要為 `complexity-analysis`、`algorithm-design` 建立沒有真實題目 refs 的獨立發布 lesson；先作為其他 lesson 的 sections/objectives。
4. Open/code 題即使已有現存 explanation，也沒有單選題式的獨立答案共識；UI 必須標為自我評量，不可顯示「官方解答」或啟用 auto-grade。
5. 每個 lesson 發布前，再用 metadata 驗證：subtopic 對應、question ID 存在、eligible 狀態與 answer review 一致，並檢查 disputed 題沒有被帶入正式練習。

## 結論

資料結構與演算法共有 **29 個 taxonomy rows，14 題可自動判分**。最有發布條件的是 sorting/searching 與 heaps；trees 題量最大但高度依賴程式自評，linear structures 亦然。建議以 6 個 lessons 完整覆蓋核心資料結構，並把零直接題數的 complexity/algorithm-design 當跨課能力，而不是獨立湊課。先修正兩題 heap 的 taxonomy 後，即可開始 Group A 與 Group B 的內容製作。
