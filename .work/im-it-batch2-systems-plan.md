# IM-IT 第二批 Systems 學習模組規劃

規劃日期：2026-08-16

## 範圍與資料基準

- 範圍：`im-it-arch`、`im-it-prog`，以及 `im-it-os` 中已完成 `im-it-os-processes-threads` 以外的 subtopics。
- Taxonomy 來源：`public/data/im-it-concept-master.json`、`public/data/im-it-question-metadata.json`。
- 判分資格：以 metadata 當下的 `publication.autoGradeEligible` 為準。
- 答案風險：交叉讀取 `.work/im-it-answer-review-*.json` 與 `.work/im-it-answer-cross-review-*.json`；原卷不是官方答案來源，所有可判分答案仍是雙人技術覆核結果，不得標成官方答案。
- 本規劃共涵蓋 **20 個 subtopics、70 題 taxonomy questions、63 題 auto-grade eligible**。全部 70 題均為 single choice。
- OS 的 `im-it-os-processes-threads` 已有第一批內容，不納入本批統計。

## Taxonomy 與 eligibility 統計

### 電腦架構基礎：24 題，21 題 eligible

| Subtopic | Taxonomy 題數 | Eligible | 不可判分／備註 |
|---|---:|---:|---|
| `im-it-arch-number-systems` 進位與位元運算 | 0 | 0 | taxonomy 空白，只能先做概念內容或補題 |
| `im-it-arch-data-representation` 資料表示法 | 5 | 4 | `q-pp-im-it-110-2` 對 `.bin` 是否可表示 disc image 有歧義 |
| `im-it-arch-boolean-logic` 布林代數 | 0 | 0 | taxonomy 空白 |
| `im-it-arch-digital-circuits` 數位電路 | 0 | 0 | taxonomy 空白 |
| `im-it-arch-cpu-organization` CPU 與指令架構 | 9 | 8 | `q-pp-im-it-110-5` 的 instruction 是否「直接」由 RAM fetch 取決於抽象層級 |
| `im-it-arch-memory-hierarchy` 記憶體與儲存階層 | 6 | 5 | `q-pp-im-it-106-12` 無 workload-independent 的 LFU/LRU 優劣答案 |
| `im-it-arch-io-performance` 輸入輸出與效能 | 4 | 4 | 全部 eligible，但低於單課 6 題門檻 |

### 程式語言概念：15 題，15 題 eligible

| Subtopic | Taxonomy 題數 | Eligible | 不可判分／備註 |
|---|---:|---:|---|
| `im-it-prog-syntax-types-control` 語法、型別與控制流程 | 5 | 5 | 題目集中在 Python paradigm/type 與基本控制概念 |
| `im-it-prog-functions-scope` 函式、作用域與遞迴 | 1 | 1 | 只有 recursion 一題 |
| `im-it-prog-pointers-memory` 指標與動態記憶體 | 0 | 0 | taxonomy 空白；現有 programming 題未歸入可自動判分 |
| `im-it-prog-object-oriented` 物件導向程式設計 | 6 | 6 | 可獨立成課 |
| `im-it-prog-language-runtime` 編譯與執行環境 | 1 | 1 | 只有 compiler/linker/runtime 類題一題 |
| `im-it-prog-error-testing` 錯誤處理與測試 | 0 | 0 | taxonomy 空白 |
| `im-it-prog-software-lifecycle` 軟體生命週期 | 2 | 2 | 題量不足，宜與 testing/tooling 成 module |

### 作業系統其餘 subtopics：31 題，27 題 eligible

| Subtopic | Taxonomy 題數 | Eligible | 不可判分／備註 |
|---|---:|---:|---|
| `im-it-os-cpu-scheduling` CPU 排程 | 6 | 5 | `q-pp-im-it-115-8` 的 priority-without-aging 與 SRTF 都可能 starvation |
| `im-it-os-synchronization` 同步與互斥 | 2 | 2 | 全部 eligible，題量少 |
| `im-it-os-deadlocks` 死結 | 2 | 2 | 全部 eligible，題量少 |
| `im-it-os-memory-management` 記憶體管理 | 7 | 4 | `q-pp-im-it-112-13`、`113-5`、`113-6` 因抽象模型或 runtime 前提不明而 disputed |
| `im-it-os-file-storage-io` 檔案、儲存與 I/O | 8 | 8 | 可獨立成課 |
| `im-it-os-virtualization-containers` 虛擬化與容器 | 6 | 6 | 可獨立成課，但 serverless/container 需要較新的補充來源 |

## 答案覆核對內容設計的影響

目前本批共有 7 題不可自動判分，全部是雙人覆核後仍 `disputed`，不是尚未審核：

| Question ID | Subtopic | 教學上應保留的價值 | 練習處理 |
|---|---|---|---|
| `q-pp-im-it-106-12` | memory hierarchy | 說明 replacement policy 依 workload 決定 | 可作「找歧義」案例，不計分 |
| `q-pp-im-it-110-2` | data representation | 說明副檔名是慣例而非排他型別系統 | 可閱讀，不放 auto-grade |
| `q-pp-im-it-110-5` | CPU organization | 區分 ISA/stored-program 抽象與 cache microarchitecture | 可作層級辨析案例，不計分 |
| `q-pp-im-it-112-13` | memory management | 區分教科書簡化 process layout 與 ASLR/null page 實作 | 不計分 |
| `q-pp-im-it-113-5` | memory management | stack frame 與 local variable placement 受 compiler/runtime 影響 | 不計分 |
| `q-pp-im-it-113-6` | memory management | manual allocation 與 GC 是不同 runtime model | 不計分 |
| `q-pp-im-it-115-8` | CPU scheduling | priority 與 SRTF 都可能 starvation | 可作多解案例，不計分 |

內容可以引用這些題目的「問題意識」，但 `pastPaperRefs` 若仍要求全部 `autoGradeEligible=true`，就不能把它們列為正式練習 refs。

## 建議課程 grouping

Grouping 是學習路徑上的 module；每個 lesson 仍保留單一穩定 `subtopicId`，避免為湊題數跨 subtopic 填錯 refs。

### Group A：Processor and Memory Path

1. **CPU、ISA、instruction cycle 與 pipeline**
   - Primary subtopic：`im-it-arch-cpu-organization`
   - 9 題／8 eligible，可直接製作正式 lesson 與 cards。
   - 核心：stored-program、ALU/control unit、CISC/RISC、instruction cycle、pipeline/data hazard、Amdahl's law。
2. **Cache、locality 與儲存階層**
   - Primary subtopic：`im-it-arch-memory-hierarchy`
   - 6 題／5 eligible。
   - 核心：register/cache/RAM/storage、volatile/non-volatile、locality、replacement policy。
   - 缺 1 個 eligible ref 才符合既有「每課 6 題」閘門；不可用 disputed Q106-12 補數量。
3. **Interrupt、polling、DMA 與 throughput**
   - Primary subtopic：`im-it-arch-io-performance`
   - 4 題／4 eligible。
   - 核心：interrupt lifecycle、polled/vectored interrupt、DMA、latency vs throughput。

### Group B：Bits to Circuits Foundation

1. **進位、位元與資料表示**
   - Lessons：`im-it-arch-number-systems`、`im-it-arch-data-representation`。
   - 合計 5 題／4 eligible；只有 data representation 有真題。
   - 核心：binary/hex、signed integer、overflow、character/file representation。
2. **Boolean logic 到組合／循序電路**
   - Lessons：`im-it-arch-boolean-logic`、`im-it-arch-digital-circuits`。
   - 目前 0 題；先做 concept-only foundation，不應偽造 past-paper coverage。
   - 若產品 schema 強制每課至少 6 題，本組應延後，先補合法題源或新增「無真題概念課」內容型別。

### Group C：Programming Language Foundations

1. **語法、型別、paradigm 與控制流程**
   - Primary：`im-it-prog-syntax-types-control`，5／5 eligible。
2. **函式、scope、lifetime 與 recursion**
   - Primary：`im-it-prog-functions-scope`，1／1 eligible。
3. **Compiler、interpreter、linker 與 runtime**
   - Primary：`im-it-prog-language-runtime`，1／1 eligible。
4. **Pointers、stack/heap 與 ownership 基礎**
   - Primary：`im-it-prog-pointers-memory`，0／0。

四課應在 UI 組成一個連續 module，但不能把 7 題全掛到同一 subtopic lesson。若維持每課 6 題門檻，僅第一課接近可發布，其餘需採 module-level 題數或 concept-only lesson 例外。

### Group D：Object-Oriented Design

1. **Class、encapsulation、inheritance 與 polymorphism**
   - Primary：`im-it-prog-object-oriented`，6／6 eligible，可直接製作。
2. **物件生命週期與動態記憶體**
   - 與 `im-it-prog-pointers-memory` 建立 prerequisite 關係，但不要把無真題 subtopic 的 refs 併入 OOP。

### Group E：Software Construction

1. **Errors、exceptions、assertions 與 tests**
   - Primary：`im-it-prog-error-testing`，0／0。
2. **SDLC、requirements、UML、version control 與 CI/CD**
   - Primary：`im-it-prog-software-lifecycle`，2／2 eligible。

此組目前題庫不足，優先級低於 OOP 與 language foundations；適合先建立 topic tree 和閱讀內容，暫不宣稱考古題覆蓋完整。

### Group F：Scheduling and Concurrency

1. **CPU scheduling**：`im-it-os-cpu-scheduling`，6／5 eligible。
2. **Race condition、mutex、semaphore**：`im-it-os-synchronization`，2／2 eligible。
3. **Deadlock conditions、avoidance 與 Banker's algorithm**：`im-it-os-deadlocks`，2／2 eligible。

整組合計 10 題／9 eligible，適合接在 process/thread lesson 後面。建議 UI 以一個 module 呈現三堂課與共用練習池，但資料仍按 subtopic 保存；這樣不會把 scheduling 題誤標成 synchronization。

### Group G：Virtual Memory and Storage

1. **Paging、address translation、page fault 與 thrashing**
   - Primary：`im-it-os-memory-management`，7／4 eligible。
   - disputed 題多，內容必須明確標出「教科書抽象」和「真實 Unix/runtime 實作」的差異。
2. **File system、inode、buffering 與 storage I/O**
   - Primary：`im-it-os-file-storage-io`，8／8 eligible，可直接製作。

### Group H：Virtualization to Containers

1. **Hypervisor、VM、container 與 serverless 邊界**
   - Primary：`im-it-os-virtualization-containers`，6／6 eligible，可直接製作。
   - 必須分清 VM 模擬／虛擬化硬體環境、container 共用 host kernel，以及 serverless 仍有 server、只是基礎設施管理責任轉移。

## 來源需求

### 現有 reviewed sources 可直接使用

| Source ID | 可支援範圍 | 限制 |
|---|---|---|
| `src-brookshear-13e` | computer architecture 與 OS 的總覽、資料表示、CPU、memory、I/O 基礎 | 深度不足以單獨支撐 pipeline/cache policy、digital circuits 或現代 container/serverless 細節 |
| `src-nthu-os-course` | process/thread 後續的 scheduling、synchronization、deadlock、memory、file/I/O、virtualization | registry scope 是 operating-systems；不能用來替 programming language 或 digital logic 背書 |

### 合併前必須補進 source registry

1. **Computer organization／architecture 第二來源**
   - 需求：instruction cycle、pipeline hazard、cache/locality、interrupt/DMA。
   - 建議型態：大學 computer organization 開放課程或標準教科書，usage=`conceptual-summary`。
   - 原因：架構課目前只有 Brookshear 一個 reviewed source，且 CPU/memory 是本批高頻主題。
2. **Digital logic 來源**
   - 需求：Boolean algebra、gate、combinational/sequential circuits、register/flip-flop。
   - 原因：兩個 subtopics 目前零題，更需要可靠來源建立內容邊界，避免模型自行補出不一致符號。
3. **Programming language 官方／學術來源**
   - 需求：Python dynamic typing 與 paradigms、C/C++ type/scope/pointer、compiler/linker/runtime、OOP definitions。
   - 建議至少兩類：官方語言文件／reference，加上一門 reviewed programming-language 或 software-construction 課程。
   - 原因：現有 registry 沒有任何 source 的 scope 包含 programming；因此目前即使 15 題全 eligible，仍不應直接發布正式 lesson。
4. **Software engineering 來源**
   - 需求：SDLC、requirements、UML、testing、Git 與 CI/CD。
   - 建議型態：reviewed software-engineering course；Git/tooling 可另用官方文件。
5. **Container/serverless 補充來源**
   - 需求：container 與 VM 隔離邊界、image/runtime、serverless execution model。
   - 建議型態：container runtime／cloud provider 的官方概念文件。
   - 原因：OS 課可支撐 virtualization 原理，但現代產品語意容易隨平台演進，應以官方文件補強。

所有新來源都應先進 registry，明確記錄 title、author/publisher、URL、scope、usage 與 reviewed status；lesson 只能引用已 reviewed 且 scope 相符的 source IDs。

## 建議執行順序

### Batch 2A：可立即進入內容撰寫（4 lessons，28 個 eligible refs）

1. `im-it-arch-cpu-organization`：8 eligible。
2. `im-it-prog-object-oriented`：6 eligible；**先補 programming sources**。
3. `im-it-os-file-storage-io`：8 eligible。
4. `im-it-os-virtualization-containers`：6 eligible；先補 container/serverless source。

這四課各自已達 6 題門檻，且沒有跨 subtopic 湊 refs。

### Batch 2B：以 module 形式製作（題量合計足夠、單課稀疏）

1. Scheduling and Concurrency：3 lessons，共 9 eligible。
2. Processor and Memory Path 的 memory + I/O：2 lessons，共 9 eligible。
3. Programming Language Foundations：3–4 lessons，共 7 eligible；先補來源。
4. Virtual Memory：4 eligible，與 file/storage 串成學習路徑，但各自保存 refs。

Batch 2B 開工前需決定：

- 將「至少 6 個 eligible pastPaperRefs」由 lesson gate 改為 module gate；或
- 允許 `concept_only`／`sparse_past_papers` lesson 狀態，誠實顯示真題數；或
- 先擴充合法題源。不可直接借用其他 subtopic 題號通過 validator。

### Batch 2C：先補 taxonomy／來源再做

- `im-it-arch-number-systems`
- `im-it-arch-boolean-logic`
- `im-it-arch-digital-circuits`
- `im-it-prog-pointers-memory`
- `im-it-prog-error-testing`
- `im-it-prog-software-lifecycle`（只有 2 題）

## 合併與驗證門檻

- Lesson/card 的 `subtopicId` 必須存在於 concept master。
- Past-paper question 必須真實存在、metadata subtopic 完全相同，且正式計分 refs 必須 `autoGradeEligible=true`。
- Disputed 題只能作非計分案例，不得繞過 eligibility gate。
- Source IDs 必須存在、status reviewed、scope 符合 lesson。
- 不得使用「官方答案」措辭；原卷只證明題文，答案是獨立技術覆核。
- Grouping 只影響 UX 與學習順序，不得破壞每題、每課的 taxonomy ownership。
- 每課至少 3 個可重現 worked examples；examples 的答案必須能從 prompt 與 steps 推導。
- Card 不背答案字母，需能脫離特定選項獨立理解。

## 完成定義

第二批可視為完成的最低成果：

1. Batch 2A 四課全部有 reviewed source coverage、lesson、cards 與 refs validator。
2. Batch 2B 的 sparse-content policy 已定案，沒有跨 subtopic 借題。
3. 7 題 disputed questions 仍保持不可自動判分，除非出現新的可靠答案證據並重新完成雙人覆核。
4. 網站能顯示 module grouping、每課真題覆蓋數與「非官方答案」狀態。
