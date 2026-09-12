const fs = require('fs')

const base = (number, text, points = 2.5, subQuestions = []) => ({
  id: `q-pp-im-it-112-${number}`,
  paperId: 'pp-im-it-112',
  examId: 'im',
  subjectId: 'im-it',
  year: 112,
  number,
  text,
  points,
  hasImage: false,
  subQuestions,
})

const questions = [
  base(1, 'Which of the following is wrong about Von Neumann architecture? (A) it has four main units: CPU, memory, input, and output (B) memory is simply a linear array of storage locations (C) data and instructions are separated into different memory (D) a central processing unit has a control unit and an arithmetic/logic unit (E) all the above are correct (choose this one only if none of the above can be chosen).'),
  base(2, 'Which of the following is wrong about process architecture? (A) in general, program compiled in CISC architecture has fewer instructions than that compiled in RISC architecture (B) the CISC approach tries to make each instruction more powerful (C) in general, instructions in a CISC approach will need more clock cycles to execute than in a RISC approach (D) in general, the instruction set in a CISC approach is typically smaller than the instruction set in a RISC approach (E) all the above are correct (choose this one only if none of the above can be chosen).'),
  base(3, 'Which of the following is wrong about computer architecture? (A) A processor with 32-bit address buses can access at most 2^32 bytes of memory (B) in memory-mapped I/O, I/O devices use the same address space as memory devices (C) in memory-mapped I/O, the same instructions are used to access I/O devices and memory devices (D) the internal data storage of a processor is known as its registers (E) all the above are correct (choose this one only if none of the above can be chosen).'),
  base(4, 'Which of the following is wrong about Input/Output in a computer system? (A) in interrupt-driven I/O, an external device interrupts the processor to execute an interrupt service routine (B) an external device interrupts the processor by triggering an interrupt signal to the processor (C) Direct Memory Access (DMA) allows data to be transferred from I/O devices to memory directly without the continuous involvement of the processor (D) a hardware device is needed to allow I/O devices to directly access memory with less participation of the processor (E) all the above are correct (choose this one only if none of the above can be chosen).'),
  base(5, 'Which of the following is wrong about CPU cache? (A) register in CPU is usually faster than L1 cache (B) number of registers in CPU is smaller than the size of L1 cache (C) the size of L1 cache in current CPUs typically ranges in dozens to hundreds bytes (D) the size of L2 cache is typically much bigger than L1 cache (E) all the above are correct (choose this one only if none of the above can be chosen).'),
  base(6, 'Which of the following is not a major functionality of operating systems? (A) Resource Management (B) Process Management (C) Memory Management (D) Security Management (E) all the above are major functionalities.'),
  base(7, 'Operating systems divide virtual and physical memory into fixed-sized chunks called pages. Which of the following page size is currently most common than the others? (A) 128 bytes (B) 512 bytes (C) 4KB (D) 128KB (E) 512KB.'),
  base(8, "Which of the following is wrong for applications running in an operating system? (A) user applications usually run in user-mode (B) applications running in user-mode shares a virtual address space (C) a process running in user mode can't access virtual addresses that are reserved for the operating system (D) core operating system components run in kernel mode (E) all the above are correct (choose this one only if none of the above can be chosen)."),
  base(9, 'Which of the following is wrong about computer clusters? (A) nodes in a cluster are typically independent and connected by a high-speed LAN (B) clustering computers can increase computing power (C) clustering computers can prevent security attacks (D) clustering computers can improve fault tolerance (E) all the above are correct (choose this one only if none of the above can be chosen).'),
  base(10, "With regard to process management, which of the following is generally not the responsibility of operating systems (OS)? (A) creating and deleting user processes (B) suspending and resuming processes (C) process synchronization (D) deadlock handling (E) all the above are OS's responsibility."),
  base(11, 'With regard to storage management, which of the following is generally not the responsibility of operating systems? (A) creating and deleting files (B) file integrity check (C) disk scheduling (D) backing up files onto stable permanent storage media (E) supporting primitives for manipulating files and directories.'),
  base(12, 'A uniprocessor system achieves multiprogramming by _____ in CPU scheduling. (A) dynamic allocation (B) process rotating (C) pipelining (D) time slicing (E) none of the above.'),
  base(13, "When a process is running in Unix-like systems, which of the following is wrong about its memory layout? (A) the code section starts at location 0 (B) the data section starts immediately above code section (C) the stack section starts immediately above the data section (D) the stack section can grow and shrink dynamically during process life cycle (E) all the above are correct (choose this one only if none of the above can be chosen)."),
  base(14, 'In Ethernet, which of the following algorithm is used to resolve collision? (A) Carrier Sense (B) Exponential Backoff (C) Collision Avoidance (D) Request to Send/Clear to Send (RTS/CTS) (E) Round Robin.'),
  base(15, 'We can apply tags to network frames and handling these tags in a local area network to create the appearance and functionality of network traffic that is physically on a single network but acts as if it is split between separate networks. This effectively creates ______ (A) virtual LANs (B) VPN (C) domains (D) subdomains (E) private LANs.'),
  base(16, 'In router-table construction, which of the following algorithms let routers build up their routing tables by periodically exchanging information with their immediately neighboring? (A) adaptive (B) link-state (C) distance-vector (D) incremental update (E) none of the above.'),
  base(17, 'Which of the following is wrong about TCP? (A) it uses 2-way handshake to establish a connection (B) TCP is stream-oriented (C) TCP uses sliding window for flow control (D) TCP uses sequence numbers to ensure the correct order of delivery (E) all the above are correct (choose this one only if none of the above can be chosen).'),
  base(18, 'Which of the following is wrong about security attacks? (A) In Man-in-the-Middle attack, an attacker intercepts messages between two parties, and then steals and manipulates data between them (B) In buffer overflow attack, the attacker crafts an oversized input string which, when read by the server and stored in memory, overflows the buffer and overwrites subsequent portions of memory, typically containing the stack-frame pointers. (C) In SQL Injections, an attacker inserts malicious code into a server using server query language, forcing the server to deliver protected information (D) In First-day attack, an attacker exploits a network vulnerability before a patch is released and/or implemented. (E) all the above are correct (choose this one only if none of the above can be chosen).'),
  base(19, "Which of the following is wrong about program compilation? (A) assembler takes as input the assembly code and translates it into relocatable machine code (B) it is the linker's job to make sure all cross-file dependencies are resolved properly (C) programs can be linked either statically or dynamically (D) lexical and syntax analysis is done at compiling stage (E) all the above are correct (choose this one only if none of the above can be chosen)."),
  base(20, 'Which of the following is wrong about NoSQL databases? (A) in column-oriented structure, data is stored in cells grouped in a pre-defined number of columns (B) key-value stores use an associative array as their data mode (C) document stores use documents (e.g., XML, YAML, JSON) to hold and encode data in standard formats (D) graph databases represent data on a graph that shows how different sets of data relate to each other (E) all the above are correct (choose this one only if none of the above can be chosen).'),
  base(21, 'Which of the following is wrong about relational databases? (A) data are organized into tables of columns and rows (B) a unique key is used to identify each row (C) each row represents a data record (D) columns correspond to attributes of records (E) all the above are correct (choose this one only if none of the above can be chosen).'),
  base(22, 'Which of the following is wrong about relational databases? (A) a primary key is used to ensure data in the specific column is unique (B) a foreign key refers to the field in a table which is the primary key of another table (C) foreign key does not allow NULL value (D) more than one foreign key are allowed in a table (E) all the above are correct (choose this one only if none of the above can be chosen).'),
  base(23, 'The term ______ has been coined to represent a digital counterpart of a real-world object for use such as simulation, integration, testing, monitoring, and maintenance. (A) avatar (B) digital twin (C) virtual reality (D) cloud object (E) none of the above.'),
  base(24, 'In blockchain technology like that used in Bitcoin, the process "mining" is designed mainly to (A) enforce concurrency control of transactions (B) ensure atomicity (C) distribute transaction (D) validate transaction (E) none of the above.'),
  base(25, 'Which of the following is wrong about B-tree? (A) B-tree is self-balancing (B) A non-leaf node with k children contains k keys (C) a B-tree of order m has at most m children (D) every internal node has at least ceil(m/2) children (E) all leaves appear on the same level.'),
  base(26, 'Which of the following is wrong about spanning trees? (A) if all of the edges of a graph G are also edges of a spanning tree T of G, then G is a tree (B) if all of the edges of a graph G are also edges of a spanning tree T of G, then G is identical to T (C) if T is a spanning tree of G, and e is an edge of G that is not in T, then adding e to T will create a cycle (D) a graph may have more than one spanning trees (E) all the above are correct (choose this one only if none of the above can be chosen).'),
  base(27, "Recall that a min heap is a complete binary tree such that the key stored in each node is greater than or equal to the keys in the node's children. Then, the time complexity for inserting a key into a min heap of n nodes can be done in (A) O(1) (B) O(log n) (C) O(n) (D) O(n log n) (E) none of the above."),
  base(28, 'The time complexity for finding an arbitrary element in a min heap of n nodes can be done in (A) O(1) (B) O(log n) (C) O(n) (D) O(n log n) (E) none of the above.'),
  base(29, `二、問答題，共 30 分。
※ 本大題 [(a)、(b)、(c) 3 小題] 請於試卷內之「非選擇題作答區」標明題號依序作答。

Consider the following C++ code.

#include <bits/stdc++.h>
using namespace std;
# define NO_OF_CHARS 256

void PREPROCESS(string str, int size, int badchar[NO_OF_CHARS])
{
    int i;
    for (i = 0; i < NO_OF_CHARS; i++)
        badchar[i] = -1;
    for (i = 0; i < size; i++)
        badchar[(int) str[i]] = i;
}

void search(string txt, string pat)
{
    int m = pat.size();
    int n = txt.size();
    int badchar[NO_OF_CHARS];

    PREPROCESS(pat, m, badchar);
    int s = 0;
    while (s <= (n - m))
    {
        int j = m - 1;
        while (j >= 0 && pat[j] == txt[s + j])
            j--;
        if (j < 0)
        {
            cout << "pattern occurs at " << s << endl;
            s += (s + m < n) ? m-badchar[txt[s + m]] : 1;
        }
        else
            s += max(1, j - badchar[txt[s + j]]);
    }
}`, 30, [
    '(a) (15 points) When given the two strings txt = "ABAAABCDABC" and pat = "ABC", what is the output of search(txt, pat)?',
    '(b) (8 points) If the lengths of txt and pat are n and m respectively, what is the worst case time complexity of search(txt, pat)? Briefly explain your answer.',
    '(c) (7 points) Continue from above. What is the best case time complexity of search(txt, pat)? Briefly explain your answer.',
  ]),
]

const answerData = [
  ['C', 'Von Neumann 架構採 stored-program concept，資料與指令共用同一記憶體；(C) 描述的是 Harvard 架構。其餘敘述皆為典型 Von Neumann 架構特徵。'],
  ['D', 'CISC 指令功能通常較複雜，完成相同工作時程式的動態指令數可能少於 RISC，單一指令也常需較多時脈；但 CISC 的指令集通常比 RISC 大，不是更小，因此 (D) 錯。'],
  ['E', '32 位元位址匯流排在 byte-addressable 系統可表示 2^32 個位址；memory-mapped I/O 與記憶體共用位址空間及存取指令；處理器內部儲存稱為 registers。A-D 皆正確，故選 (E)。'],
  ['E', '中斷驅動 I/O 由裝置送出中斷使 CPU 執行 ISR；DMA 控制器則讓裝置與記憶體直接傳輸，降低 CPU 持續參與。A-D 均為正確描述，故選 (E)。'],
  ['C', '現代 CPU 的 L1 cache 通常以數十 KB 計，而不是數十至數百 bytes，因此 (C) 錯。暫存器延遲通常低於 L1，容量也遠小於 L1；L2 通常大於 L1。'],
  ['E', '資源、行程、記憶體與安全管理都屬於作業系統的主要功能，因此 A-D 沒有一項符合「不是」，應選 (E)。'],
  ['C', '4KB 是 x86/x86-64 與主流作業系統最常見的基本 page size；其他選項不是一般預設頁面大小。'],
  ['B', '每個行程通常有彼此隔離的虛擬位址空間，並非所有 user-mode 應用程式共享同一個空間，因此 (B) 錯。A、C、D 都是 user/kernel mode 的正確敘述。'],
  ['C', '叢集可提高運算能力與容錯，節點也常以高速 LAN 互連；但 clustering 本身不能防止資安攻擊，故 (C) 錯。'],
  ['E', '建立/刪除、暫停/恢復行程、同步與死結處理都屬於作業系統的行程管理責任，故選 (E)。'],
  ['D', 'OS 會提供檔案建立刪除、完整性支援、磁碟排程與檔案/目錄操作原語；把檔案備份到永久媒體通常是備份工具或管理作業的責任，不是 OS 核心儲存管理職責，故選 (D)。'],
  ['D', '單處理器透過 time slicing 在可執行行程間快速切換 CPU，形成 multiprogramming；故選 (D)。'],
  ['C', '典型 Unix 行程位址空間由低至高包含 text、data/BSS、heap、memory-mapped area 與高位址 stack；stack 不會緊接在 data section 上方，故 (C) 錯。'],
  ['B', '傳統共享式 Ethernet 的 CSMA/CD 在偵測到碰撞後使用 binary exponential backoff 決定重傳等待時間，因此答案是 (B)。RTS/CTS 與 collision avoidance 主要屬無線網路機制。'],
  ['A', 'IEEE 802.1Q 標籤可在同一實體 LAN 上建立邏輯隔離的 Virtual LAN，因此選 (A)。'],
  ['C', 'Distance-vector routing 由每台路由器週期性向直接鄰居交換距離/下一跳資訊並更新路由表，故選 (C)。Link-state 則向整個 routing domain flooding 鏈路狀態。'],
  ['A', 'TCP 建立連線使用 three-way handshake，不是 two-way handshake，因此 (A) 錯。stream-oriented、sliding-window flow control 與 sequence-number ordering 均正確。'],
  ['D', '「在修補程式發布或部署前利用未知弱點」通常稱為 zero-day attack，而不是 first-day attack，因此 (D) 錯；A-C 分別正確描述 MITM、buffer overflow 與 SQL injection。'],
  ['E', 'Assembler 產生 relocatable machine code；linker 解決跨檔案符號；可採 static/dynamic linking；lexical 與 syntax analysis 皆在編譯階段。A-D 皆正確，故選 (E)。'],
  ['A', 'Wide-column/column-family NoSQL 通常允許稀疏、動態欄位，並非固定「預先定義數量的 columns」；B-D 是 key-value、document 與 graph store 的合理描述，故選 (A)。'],
  ['E', '關聯式資料庫以 rows/columns 組成 tables，key 唯一識別 row，row 表示 record，column 表示 attribute；A-D 皆正確，故選 (E)。'],
  ['C', 'Foreign key 欄位在沒有 NOT NULL 約束時可以是 NULL；外鍵可參照另一表的 primary/unique key，同一表也可有多個 foreign keys，故 (C) 錯。'],
  ['B', 'Digital twin 是現實物件或系統的數位對應體，可用於模擬、整合、測試、監控與維護，故選 (B)。'],
  ['D', 'Bitcoin mining 透過 proof-of-work 競爭建立區塊並驗證交易、形成共識；題目選項中最符合主要目的的是 (D) validate transaction。'],
  ['B', 'B-tree 的非葉節點若有 k 個 children，應有 k-1 個 keys，不是 k 個，因此 (B) 錯。其餘為題目採用的 B-tree 標準性質（最低子節點數的敘述通常不含 root 例外）。'],
  ['E', '若 G 的所有邊都也在其 spanning tree T 中，由於 T 的邊本來就是 G 的子集，兩者邊集相同，所以 G=T 且 G 為樹；向 T 加入非樹邊必產生 cycle；圖也可能有多棵 spanning trees。A-D 皆正確，故選 (E)。'],
  ['B', 'Binary heap 插入先放在完全二元樹末端，再沿父鏈 sift up；樹高為 O(log n)，故最壞時間為 O(log n)，選 (B)。題幹把 min-heap 的不等號方向印反，但不影響插入的漸近複雜度。'],
  ['C', 'Min heap 只保證父節點不大於子節點，除最小值外不能像 BST 一樣排除整個子樹；搜尋任意值最壞需檢查全部 n 個節點，因此為 O(n)，選 (C)。'],
]

const answers = Object.fromEntries(answerData.map(([answer, explanation], index) => {
  const questionId = `q-pp-im-it-112-${index + 1}`
  return [questionId, { questionId, answer, explanation }]
}))

answers['q-pp-im-it-112-29'] = {
  questionId: 'q-pp-im-it-112-29',
  answer: '(a) pattern occurs at 4; pattern occurs at 8. (b) O(mn). (c) O(n/m) for the search phase (plus O(m + 256) preprocessing).',
  explanation: '(a) txt 的索引 4-6 與 8-10 都是 ABC，所以程式依序輸出兩行：`pattern occurs at 4`、`pattern occurs at 8`。(b) 最壞情況每個 alignment 只移動 1，且最多比較 m 個字元，最多約 n-m+1 個 alignments，因此 search phase 為 O(mn)；PREPROCESS 另為 O(m + 256)，不改變最壞主項。(c) 最佳情況每次在最右字元立即 mismatch，且 bad-character shift 可一次前進 m，約檢查 n/m 個 alignments，因此 search phase 為 O(n/m)；若計入前處理，總計 O(m + 256 + n/m)。',
}

fs.writeFileSync('.work/im-it-112-replacements.json', `${JSON.stringify({
  sourcePdf: 'public/papers/pp-im-it-112.pdf',
  replacementCount: questions.length,
  questions,
}, null, 2)}\n`)

fs.writeFileSync('.work/im-it-112-answer-replacements.json', `${JSON.stringify({
  sourcePdf: 'public/papers/pp-im-it-112.pdf',
  replacementCount: Object.keys(answers).length,
  answers,
}, null, 2)}\n`)
