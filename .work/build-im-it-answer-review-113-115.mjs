import fs from 'node:fs';

const input = JSON.parse(fs.readFileSync('.work/im-it-answer-review-113-115-input.json', 'utf8'));

const reviews = {
  113: [
    ['E', 'FAT32、exFAT、NTFS、APFS 都是實際廣泛使用的檔案系統，故應選 none-of-the-above 型的 E。'],
    ['B', '不同 process 各自具有獨立位址空間、stack 與 program counter；B 把 process 誤述成 thread。'],
    ['E', 'A 至 D 都是 thread 的一般正確性質，沒有錯誤選項。'],
    ['A', '馮紐曼架構的四個功能組成是 processor、memory、input 與 output；A 最直接對應。'],
    ['B', 'B 把每次函式呼叫的 stack-frame 建立歸給作業系統；但 A 也把 local variable 一概說成存於 stack，忽略 register allocation／最佳化，因此不具唯一答案。', 'disputed'],
    ['E', '題目把不同語言執行環境混在一起：C 要求程式員明確釋放，但 D 又描述 GC 自動回收；兩者不能同時作為普遍敘述。', 'disputed'],
    ['C', 'polled interrupt 是 processor 主動輪詢裝置；由裝置直接導向 ISR 描述的是 vectored interrupt。'],
    ['A', 'p 已定義為不可平行化比例，平行時間為 p+(1-p)/n，speedup 為其倒數。'],
    ['E', '互斥機制設計不當確實可能造成 starvation、deadlock 或 livelock，A 至 D 都正確。'],
    ['C', '把資料暫存在記憶體、等候程式或裝置使用的概念是 buffering。'],
    ['A', 'cookie 儲存在 user agent；伺服器可保有對應 session state，但 cookie 本身不必同時存於 host website。'],
    ['B', 'DNS 是階層式且分散式的命名系統，因此 centralized 敘述錯誤。'],
    ['D', 'D 所述代替 server 接收 client request 是 reverse proxy，不是 forward proxy。'],
    ['E', 'CIA 的 C/A 分別為 confidentiality/availability，ISMS 與 ISO 27000 敘述也正確。'],
    ['C', '決定可存取哪些資源與可執行哪些操作是 authorization；accountability 是行為可追責。'],
    ['B', '簽發與簽署憑證是 certificate authority 的職責；registration authority 主要驗證申請者身分。'],
    ['C', 'TLS 可使用自簽或私有 CA 憑證；建立 HTTPS 並不在協定上必然要求受信任第三方簽署。'],
    ['A', 'ACID 的 A 是 atomicity，不是 availability。'],
    ['C', 'functional dependency 描述一組 attribute 值如何決定另一組 attribute 值。'],
    ['A', '第一正規化要求 attribute domain 為 atomic values，不以 relation 作為元素。'],
    ['B', '繼承不保證子類可存取或繼承「所有」屬性與方法，例如 private member；B 的全稱敘述錯誤。'],
    ['B', 'member variable 宣告在 class body，而不是必須宣告在 method body。'],
    ['E', 'GPT 是 Generative Pre-trained Transformer，A 至 D 均非正確全名。'],
    ['D', '評估機器是否呈現與人類難以區分之智能行為的是 Turing test。'],
  ],
  114: [
    ['B', 'recursion 以較小且同型的 subproblem 解原問題。'],
    ['B', 'polymorphism 以共同介面承載不同實作。'],
    ['C', 'binary heap 可在對數時間 insert 與 extract-extreme，適合 priority queue。'],
    ['C', 'BST 的 inorder traversal 依 key 遞增輸出。'],
    ['C', '題述為 bubble sort，最壞比較次數為等差級數，時間為 O(N²)。'],
    ['B', '具 early-stop 的 bubble sort 對已排序輸入只需一次線性掃描。'],
    ['B', 'inode 主要保存權限、時間戳、大小與 data-block pointer 等 metadata。'],
    ['A', 'Banker algorithm 在配置前檢查系統是否仍為 safe state，屬 deadlock avoidance。'],
    ['C', 'MLFQ 會依 process 行為與優先權在 queues 間升降。'],
    ['B', 'semaphore 的核心用途是並行同步，選項中 B 的 mutual exclusion 是其直接用途。'],
    ['A', 'page table 將 virtual page 映射至 physical frame。'],
    ['C', 'HAVING 在 aggregate/grouping 後過濾群組。'],
    ['D', '3NF 排除 non-key attribute 對 key 的 transitive dependency。'],
    ['B', 'JOIN 依相關欄位組合多個 relations 的欄位與列。'],
    ['D', 'NoSQL 通常以水平擴展支援 distributed workloads；其餘選項皆為過度絕對敘述。'],
    ['E', 'ER 圖 diamond 代表 relationship，不是 A 至 D 的任何一項。'],
    ['B', 'transaction log 記錄更新，供 crash recovery 的 undo/redo 使用。'],
    ['A', 'composite key 由多欄共同唯一識別一列。'],
    ['B', 'subnet mask 分隔 IP address 的 network 與 host portions。'],
    ['A', 'TCP advertised window 表示 receiver 目前允許 sender 在未獲進一步 ACK 前送出的 byte 範圍。'],
    ['B', 'OSPF 是 link-state protocol，使用 shortest-path-first 計算路由。'],
    ['E', 'A 至 C 正確，NAT 一般歸於 OSI network layer，因此 D 也非錯誤敘述。'],
    ['B', 'DNS 的主要用途是把 domain name 解析成 IP address。'],
    ['A', 'SDN 將 control plane 與 data plane 分離；A 的 tightly integrated 與此相反。'],
  ],
  115: [
    ['C', 'hash table 在合理雜湊與負載下平均 insertion、deletion、search 均為 O(1)。'],
    ['D', 'Quicksort 若 pivot 持續造成極端不平衡 partition，遞迴成本為 O(n²)。'],
    ['C', 'binary heap 插入後最多沿樹高 sift-up，為 O(log n)。'],
    ['B', 'stack 的 LIFO 性質可逐層配對 opening/closing parentheses。'],
    ['D', '標準 in-place Quicksort 不保證 equal keys 的相對順序。'],
    ['C', 'topological ordering 存在的必要條件是 directed acyclic graph。'],
    ['B', 'cache 利用 locality 降低 average memory access time。'],
    ['D', 'D 與 E 都可能造成 starvation：無 aging 的 priority scheduling 可餓死低優先權工作，SRTF 也可因短工作持續到達而餓死長工作。', 'disputed'],
    ['E', 'context switch 保存目前 execution state 並載入另一 execution context。'],
    ['B', '尚未取得 producer result 的 operand dependency 造成 data hazard 與 stall。'],
    ['B', '已知 service times 時，SJF 最小化平均 waiting time。'],
    ['A', 'thrashing 是系統花在 page fault/paging 的時間多於有效執行。'],
    ['D', 'router 逐跳遞減 TTL，歸零即丟棄，可阻止 routing loop 無限循環。'],
    ['C', 'UDP 無連線且 header 較小，不保證 delivery、ordering 或 flow control。'],
    ['B', 'slow start 令 congestion window 指數成長以探測可用容量。'],
    ['C', 'B+ tree 保留排序並支援從 lower bound 連續掃描 leaf nodes，適合 range query。'],
    ['B', '2PL 持鎖等待其他鎖，可能形成 circular wait 與 deadlock。'],
    ['A', 'hash function 打散 key ordering，無法自然支援相鄰 key range scan。'],
    ['D', 'WAL 要求對應 log record 先落到 stable storage，才可寫出 dirty data page。'],
    ['C', '提高 isolation 往往增加 blocking/serialization，降低 concurrency。'],
    ['D', 'CAP 三項是 consistency、availability、partition tolerance。'],
    ['A', '正式 BCNF 條件只約束 non-trivial FD；A 省略 non-trivial，按字面會把 trivial FD 也錯誤要求 determinant 為 superkey。', 'disputed'],
    ['A', 'container 共用 host kernel，通常比完整 VM 有更低 virtualization overhead。'],
    ['D', 'edge computing 把運算移近資料來源以降低 latency 與回傳流量。'],
    ['B', 'blockchain 以共識與鏈式驗證維持不可竄改、可驗證且無中央權威的交易紀錄。'],
    ['A', 'NoSQL 常以 flexible schema、partitioning 與 horizontal scaling 服務大規模 distributed workloads。'],
    ['B', 'self-attention 令每個 token 依內容衡量序列中其他 tokens 的相關性，不受固定距離限制。'],
    ['A', 'Zero Trust 的核心是持續驗證，不因位於內部網路就預設信任。'],
    ['C', 'serverless 由 provider 管理基礎資源並按 execution/resource usage 計費，並非沒有實體 server。'],
    ['D', 'RAG 在生成前檢索外部知識並把結果納入模型 context。'],
  ],
};

const output = input.map((question) => {
  const review = reviews[question.year]?.[question.number - 1];
  if (!review) throw new Error(`Missing review: ${question.id}`);
  const [reviewedAnswer, reasoning, override] = review;
  const verdict = override ?? (reviewedAnswer === question.currentAnswer ? 'confirmed' : 'corrected');
  const disputed = verdict === 'disputed';
  return {
    questionId: question.id,
    currentAnswer: question.currentAnswer,
    reviewedAnswer,
    verdict,
    confidence: disputed ? 'disputed' : 'medium',
    reasoning,
    sourceBasis: [
      `public/papers/pp-im-it-${question.year}.pdf 題目與選項`,
      'public/data/questions.json 題文（已由既有 PDF audit 核對）',
      '逐項技術推導與排除；無官方答案 key',
    ],
    autoGradeEligible: !disputed,
  };
});

fs.writeFileSync('.work/im-it-answer-review-113-115.json', `${JSON.stringify(output, null, 2)}\n`);
console.log(`wrote ${output.length} reviews`);
