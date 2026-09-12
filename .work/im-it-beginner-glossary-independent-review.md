# IM-IT 新手名詞獨立關聯複核

## 結論

- 複核範圍：`public/data/im-it-lessons.json` 的 35 堂課，以及 `.work/im-it-beginner-glossary-fragment.json` 的全部 lesson 關聯。
- 結果：35／35 堂皆配置 3–6 個真正用於理解該堂 title、summary、objectives、sections 或 learning scenario 的核心詞。
- 最終資料：130 個 reviewed 詞條、156 個 lesson-term 關聯；每詞皆有白話定義、生活例子與易混淆邊界。
- 相較原始稽核的 160 個關聯，保留 77 個、移除 83 個不精確或跨領域硬掛關聯，新增 79 個正文需要的精確關聯。
- 已完全移除沒有任何一堂實際教授的「二補數」詞條；不以補 alias 的方式掩蓋內容不相符。
- 文字閉合檢查通過：每堂至少有一個精選詞的 label 或 alias 直接出現在該堂正文資料中。

## 複核原則

1. 只因同屬資工領域、可能有間接關係，不足以建立 lesson 關聯。
2. 詞條必須能解除初學者閱讀該堂核心內容時的實際阻礙。
3. 若原詞把數個不同概念綁得太廣，改以更貼近正文的詞條取代。
4. 每堂維持 3–6 個入口詞，避免把名詞區變成另一面術語牆。
5. 生活例只建立直覺；`confusionNote` 必須把比喻不能延伸的技術邊界說清楚。

## 主要修正案例

- 新興科技課：移除 `hypervisor`、`serverless`、`edge computing`，改為 Fintech／mobile payment／crowdfunding／MOOC、語音互動、環境感知與定位、digital twin。
- AI 基礎課：移除動態規劃、SQL 分組彙總與神經網路，改為圖靈測試、三種學習回饋、線性迴歸、過度擬合／資料切分、混淆矩陣。
- 關聯模型課：移除 Boolean logic、JOIN、normalization 與 NoSQL/CAP 等未教內容，保留 relation/schema、keys 與 integrity constraints。
- SQL 查詢課：移除 isolation level 與 database index，改為 Boolean conditions、JOIN、aggregation、WHERE/HAVING。
- 行程與執行緒課：移除 race condition、mutex/semaphore、deadlock；這些留給同步課，本課改為 process/thread、context switch、system call modes、IPC、scheduler。
- 雲端與 QoS 課：移除 hypervisor、container、serverless 與 IP routing，改為 SaaS/PaaS/hybrid cloud、edge、latency/throughput、jitter/availability、streaming/VPN。
- 程式執行基礎課：移除 ISA、二補數、OOP 與編譯器，改為 type/control flow、scope/recursion/reference、stack/heap。
- 資料庫交易課：以 shared/exclusive locks 與 2PL 取代過度寬廣的 OS mutex/semaphore 詞條。
- 程式建置課：以 preprocessing／compilation／assembly／linking 的建置流程取代泛稱 compiler/interpreter。

## 逐堂 coverage

| Lesson | 詞數 | 精選詞 |
|---|---:|---|
| `lesson-im-it-ai-foundations-ml-evaluation-01` | 6 | 混淆矩陣、線性迴歸、過度擬合與模型評估、強化學習、監督式與非監督式學習、圖靈測試 |
| `lesson-im-it-arch-cpu-organization` | 5 | 阿姆達爾定律、指令集架構、管線冒險、暫存器、儲存程式架構 |
| `lesson-im-it-arch-memory-data-representation-01` | 4 | 快取、記憶體階層與局部性、同位元檢查、暫存器 |
| `lesson-im-it-data-big-data-nosql-01` | 4 | 大數據 5V、NoSQL 與 CAP、NoSQL 資料模型、分片與複寫 |
| `lesson-im-it-db-relational-model-01` | 3 | 資料完整性限制、主鍵與外鍵、關聯模型 |
| `lesson-im-it-db-sql-querying` | 4 | 布林邏輯、分組彙總、WHERE 與 HAVING、資料表連接 |
| `lesson-im-it-db-transactions-01` | 6 | ACID、資料庫鎖定與 2PL、死結、隔離等級、交易並行異常、WAL 與 checkpoint |
| `lesson-im-it-ds-complexity-sorting-searching-01` | 4 | 大 O、二分搜尋、QuickSort partition、排序穩定性 |
| `lesson-im-it-ds-trees-heaps-01` | 5 | 大 O、BST、完全二元樹、heap、樹的節點與走訪 |
| `lesson-im-it-network-application-protocols` | 5 | DHCP、DNS、電子郵件協定、HTTP/Cookie、Proxy/CDN |
| `lesson-im-it-network-ip-routing-transport-01` | 5 | flow/congestion control、IP routing、封裝、longest-prefix match、TCP/UDP/port |
| `lesson-im-it-network-link-lan-01` | 5 | ARP、CSMA、IP、MAC/VLAN、frame 封裝 |
| `lesson-im-it-network-models-encapsulation` | 5 | IP、MAC/VLAN、封裝、OSI/TCP-IP、TCP/UDP/port |
| `lesson-im-it-os-file-storage-io` | 5 | buffering、driver、dynamic linking、inode、spooling |
| `lesson-im-it-os-processes-threads` | 5 | context switch、IPC、process/thread、scheduler、system call modes |
| `lesson-im-it-os-scheduling-memory-management-01` | 5 | context switch、page table、scheduler、virtual memory、working set/thrashing |
| `lesson-im-it-os-virtualization-containers-01` | 4 | container、hypervisor、serverless、virtualization/cluster |
| `lesson-im-it-prog-object-oriented` | 3 | dynamic dispatch、OOP 三特性、instance/class/local variables |
| `lesson-im-it-security-cryptography-01` | 4 | encryption/keys、hash/signature、hybrid encryption、PKI/TLS |
| `lesson-im-it-trends-emerging-digital-applications-01` | 4 | Fintech 與數位服務、digital twin、perception/localization、voice interface |
| `lesson-im-it-arch-logic-circuits-01` | 5 | Boolean logic、combinational/sequential circuits、MUX/flip-flop、進位與 bitwise、register |
| `lesson-im-it-arch-io-performance-01` | 5 | buffering、DMA、interrupt、latency/throughput、polling/memory-mapped I/O |
| `lesson-im-it-prog-control-functions-memory-01` | 3 | scope/recursion/reference、stack/heap、type/control flow |
| `lesson-im-it-prog-runtime-quality-lifecycle-01` | 4 | build pipeline、dynamic linking、NIST SSDF、verification/testing/review |
| `lesson-im-it-ds-linear-hashing-b01` | 4 | 大 O、hash collision、線性結構、load factor |
| `lesson-im-it-ds-graphs-design-b01` | 4 | algorithm strategies、大 O、topological/shortest path/MST、BFS/DFS |
| `lesson-im-it-db-er-normalization-b01` | 4 | cardinality、functional dependency、normalization、keys |
| `lesson-im-it-db-storage-indexing-b01` | 4 | database index、hash collision、selectivity/optimizer、warehouse/OLAP |
| `lesson-im-it-os-sync-deadlock-b01` | 5 | deadlock、mutex/semaphore、process/thread、race condition、liveness issues |
| `lesson-im-it-network-cloud-performance-01` | 5 | cloud models、edge、jitter/availability、latency/throughput、streaming/VPN |
| `lesson-im-it-security-risk-access-governance-01` | 4 | CIA/Zero Trust、IAAA/RBAC/SSO、ISMS/privacy/audit、threat/vulnerability/risk |
| `lesson-im-it-security-attacks-network-defense-01` | 5 | injection/social engineering、CIA、defense in depth、MITM/DDoS/overflow、PKI/TLS |
| `lesson-im-it-security-blockchain-01` | 3 | transaction/block/hash linkage、consensus/mining、hash/signature |
| `lesson-im-it-ai-neural-sequence-transformer-01` | 5 | attention/Transformer、backprop/optimizer、CNN/RNN/LSTM、LLM/token、neural network |
| `lesson-im-it-ai-generative-governance-01` | 5 | AI risk governance、attention/Transformer、hallucination、LLM/token、RAG |

## 機械檢查結果

- lesson catalog：35 個唯一 lesson IDs。
- 每堂詞數：最少 3、最多 6，無超界。
- glossary IDs：130 個，無重複。
- lesson refs：156 個，全部指向現存 lesson。
- quality fields：每詞 `plainDefinition`、`everydayExample`、`confusionNote` 均存在且非短空字串。
- literal closure：35／35 堂至少有一個精選 label／alias 出現在 lesson 內容。
- `im-it-glossary-twos-complement`：不存在，亦無任何殘留 lesson ref。
