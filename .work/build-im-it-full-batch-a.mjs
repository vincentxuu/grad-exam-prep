import { writeFileSync } from 'node:fs';

const out = new URL('./', import.meta.url);
const reviewed = 'reviewed';
const archSource = ['src-brookshear-13e'];
const progSource = ['src-oracle-oop-concepts'];

const lessons = [
  {
    id: 'lesson-im-it-arch-logic-circuits-01',
    subtopicId: 'im-it-arch-number-systems',
    coveredSubtopicIds: [
      'im-it-arch-number-systems',
      'im-it-arch-boolean-logic',
      'im-it-arch-digital-circuits',
    ],
    title: '進位、布林邏輯與數位電路：從位元到狀態',
    summary:
      '從二進位與十六進位轉換出發，用真值表與 De Morgan 定律化簡邏輯，再把 gates 組合為 adder、multiplexer 與具狀態的 flip-flop。本範圍為完整主題樹所需的基礎課，不宣稱是考古高頻。',
    evidenceNote:
      '進位與位元運算、布林代數、數位電路在 canonical metadata 皆為 0 題 direct primary refs；本課是 foundational coverage，只以相鄰的資料表示、電腦組成與指令架構 eligible refs 支撐課程邊界。',
    estimatedMinutes: 38,
    minimumPastPaperRefs: 3,
    learningObjectives: [
      '在二進位、十進位與十六進位間轉換，並執行基本 bitwise operations',
      '由真值表計算 Boolean expression，並套用 De Morgan 定律',
      '區分 combinational circuit 與 sequential circuit',
      '說明 adder、multiplexer、flip-flop 與 register 的核心功能',
    ],
    learningScenario: {
      title: '舞台燈光控制台',
      hook: '一個舞台用開關編碼燈光模式：控制台把模式號碼寫成位元，透過邏輯門決定哪些燈亮，並用鎖存狀態記住上一個場景。',
      predict: '若兩個安全開關都為 1 才允許主燈亮，應用哪種邏輯？若還要記住上一次是否開啟，只靠同一個邏輯門夠嗎？',
      mapping: [
        { everyday: '用 0 與 1 編碼舞台模式號碼', technical: '二進位位元與進位轉換' },
        { everyday: '兩個安全開關都通過才亮燈', technical: 'AND 與 Boolean truth table' },
        { everyday: '從多組輸入挑選一組送到主燈', technical: 'Multiplexer 依 select bits 選輸入' },
        { everyday: '控制台記住上一個場景', technical: 'Flip-flop 儲存一個狀態位元' },
        { everyday: '多個狀態位元一起保留模式碼', technical: 'Register 由多個 storage elements 組成' },
      ],
      boundary: '燈光場景只映射位元、邏輯選擇與狀態儲存；實際電路還有 propagation delay、fan-out、clock 與電氣特性。真值表可完整定義 Boolean function，但不自動等於已找到成本最低的實體電路。',
      examCues: [
        '進位轉換先依位階展開；十六進位每一碼剛好對應 4 bits。',
        'NOT(A AND B)=NOT A OR NOT B；De Morgan 會同時反轉運算子與 operands。',
        'Combinational output 只看當下輸入；sequential circuit 還受先前狀態影響。',
        'Adder 做加法，multiplexer 做選擇，flip-flop 儲存 1 bit，register 儲存多 bits。',
      ],
    },
    sections: [
      { title: '進位是位階權重', body: '二進位每位權重是 2 的次方；十六進位以 0–9、A–F 表示 0–15，並可四位二進位一組直接轉換。', bullets: ['101101₂=45₁₀', '2D₁₆=0010 1101₂', 'AND 可清除位元，OR 可設定位元，XOR 可判斷不同'] },
      { title: '真值表與布林定律', body: '真值表列出所有輸入組合與對應輸出。化簡時保留功能等價，不是任意刪除變數。', bullets: ['A AND 1=A', 'A OR 0=A', 'A XOR A=0', 'De Morgan 定律對否定一整組條件特別有用'] },
      { title: '組合電路做即時計算', body: 'Half adder 產生 sum 與 carry；full adder 還處理 carry-in。Multiplexer 根據 select lines 從多個輸入中選一個。', bullets: ['Sum 可用 XOR 表示', 'Carry 與 AND 有關', 'Multiplexer 不負責長期儲存狀態'] },
      { title: '時序電路加入狀態', body: 'Flip-flop 在規定時機取樣並保留 1 bit；多個 flip-flops 可組成 register。Clocked design 必須考慮 setup、hold 與 propagation delay。', bullets: ['Sequential output 取決於當前輸入與現有狀態', 'Register 與 main memory 層級不可混為同一概念'] },
    ],
    workedExamples: [
      { prompt: '將 3A₁₆ 轉成二進位與十進位。', steps: ['3 對應 0011，A 對應 1010。', '二進位為 00111010。', '十進位為 3×16+10=58。'], answer: '3A₁₆=00111010₂=58₁₀。' },
      { prompt: '計算 NOT(A AND B) 在 A=1、B=0 時的值，並用 De Morgan 驗證。', steps: ['A AND B=0。', 'NOT 0=1。', 'NOT A OR NOT B=0 OR 1=1。'], answer: '兩種寫法均得 1，功能等價。' },
    ],
    commonPitfalls: ['把十六進位 A 當作十進位 1', '只反轉 De Morgan 的運算子卻沒否定 operands', '把 multiplexer 當成記憶元件', '認為 sequential circuit 輸出只看當前輸入'],
    sourceRefs: archSource,
    pastPaperRefs: ['q-pp-im-it-106-11', 'q-pp-im-it-112-1', 'q-pp-im-it-113-4'],
    reviewStatus: reviewed,
  },
  {
    id: 'lesson-im-it-arch-io-performance-01',
    subtopicId: 'im-it-arch-io-performance',
    coveredSubtopicIds: ['im-it-arch-io-performance'],
    title: 'I/O 與效能：從 polling、interrupt 到 DMA',
    summary: '比較 programmed I/O、interrupt-driven I/O 與 DMA 的 CPU 介入程度，連結 memory-mapped I/O、interrupt service routine、latency、throughput 與顯示器解析度。',
    estimatedMinutes: 30,
    minimumPastPaperRefs: 4,
    learningObjectives: ['區分 polling、interrupt-driven I/O 與 DMA', '說明 memory-mapped I/O 與 ISR 流程', '區分 latency 與 throughput', '區分 pixel resolution 與 printer dpi'],
    learningScenario: {
      title: '倉庫出貨中心',
      hook: '值班員可以不斷詢問每條輸送帶有沒有貨，也可讓輸送帶有貨時按鈴；大批貨物還可由搬運機直接送到儲位。',
      predict: '搬一大批連續資料時，讓 CPU 逐字搬運與讓 DMA controller 處理，哪個更能讓 CPU 同時做其他事？',
      mapping: [
        { everyday: '值班員不斷詢問輸送帶', technical: 'Polling/programmed I/O' },
        { everyday: '有貨時按鈴通知', technical: 'Interrupt-driven I/O' },
        { everyday: '按鈴後執行指定處理流程', technical: 'Interrupt service routine' },
        { everyday: '搬運機在設備與儲位間搬大批貨', technical: 'DMA block transfer' },
        { everyday: '單箱等待時間與每小時出貨箱數', technical: 'Latency 與 throughput' },
      ],
      boundary: '搬運機不表示 CPU 完全不參與 DMA；CPU 通常仍要設定 transfer，完成時也可能收到 interrupt。效能還取決於 bus、buffer、device 與 workload。',
      examCues: ['Polling 是 CPU 主動查詢；interrupt 是 device 發訊號。', 'Vectored interrupt 可提供向量導向 ISR；polled interrupt 要辨識來源。', 'DMA 降低 CPU 逐字搬運參與，不是取代 memory。', 'Resolution 是像素排列；dpi 常描述列印點密度。'],
    },
    sections: [
      { title: '三種 I/O 控制方式', body: 'Polling 簡單但可能浪費 CPU cycles；interrupt 讓 CPU 先做其他工作；DMA 適合大批資料搬運。', bullets: ['Programmed I/O 常需 CPU 處理資料搬移', 'Interrupt 有 context-switch 成本', 'DMA controller 需與 CPU 協調 bus/memory'] },
      { title: '位址與中斷流程', body: 'Memory-mapped I/O 把 device registers 映射到 address space。Interrupt 發生時 CPU 保存必要狀態、辨識來源、執行 ISR 後返回。', bullets: ['32-bit byte address 在簡化模型下可定位 2^32 bytes', 'Device register 不等於 CPU general-purpose register'] },
      { title: '效能必須先定義指標', body: 'Latency 是一次操作完成前等待；throughput 是單位時間完成量。提高 throughput 不保證每次 latency 也降低。', bullets: ['Batching 可提高 throughput 卻增加個別等待', 'Buffering 可吸收短期速率差'] },
    ],
    workedExamples: [
      { prompt: '鍵盤偶爾有輸入，CPU 還有許多工作。Polling 與 interrupt 何者較合適？', steps: ['輸入事件不連續。', 'Polling 會重複查無事件狀態。', 'Interrupt 讓 CPU 平時處理其他工作。'], answer: '通常 interrupt-driven I/O 較適合此種低頻事件。' },
      { prompt: '輸送 1 MiB 資料時為何考慮 DMA？', steps: ['資料為大批連續 block。', 'CPU 逐字搬移會佔用許多指令。', 'DMA 完成後可再通知 CPU。'], answer: 'DMA 可降低 CPU 搬移參與，但仍有設定與總線協調成本。' },
    ],
    commonPitfalls: ['說 interrupt 永遠沒有成本', '說 DMA 時 CPU 完全不參與', '把 vectored 與 polled interrupt 對調', '把 latency 與 throughput 當同一指標'],
    sourceRefs: archSource,
    pastPaperRefs: ['q-pp-im-it-110-6', 'q-pp-im-it-112-3', 'q-pp-im-it-112-4', 'q-pp-im-it-113-7'],
    reviewStatus: reviewed,
  },
  {
    id: 'lesson-im-it-prog-control-functions-memory-01',
    subtopicId: 'im-it-prog-syntax-types-control',
    coveredSubtopicIds: ['im-it-prog-syntax-types-control', 'im-it-prog-functions-scope', 'im-it-prog-pointers-memory'],
    title: '程式執行基礎：型別、控制流程、函式與記憶體',
    summary: '從 type system 與 control flow 追蹤程式狀態，再用 function call、scope、recursion、stack、heap 與 pointer/reference 說明資料的可見範圍與生命週期。',
    evidenceNote: '指標與動態記憶體在 canonical metadata 為 0 題 direct primary refs；本節是 foundational coverage，引用的 refs 直接支撐型別、程式典範、執行特性與遞迴，不把它們當成指標題的直接證據。',
    estimatedMinutes: 40,
    minimumPastPaperRefs: 6,
    learningObjectives: ['以型別與 control flow 追蹤程式', '區分 lexical scope 與 object lifetime', '識別 recursion 的 base case 與縮小問題', '說明 pointer/reference、stack、heap 與 leak/dangling 風險'],
    learningScenario: {
      title: '圖書館借閱系統',
      hook: '借閱系統對每筆資料規定型別，依條件決定能否借書，把重複步驟封裝成函式，並以索引史記錄實際書籍的存放位置。',
      predict: '若索引卡還在，但它指向的書已被移除，再依索引取書會有什麼風險？',
      mapping: [
        { everyday: '借閱人數是整數，書名是字串', technical: 'Type 與 type checking' },
        { everyday: '有欠款就拒絕，否則進入借閱流程', technical: 'Conditional control flow' },
        { everyday: '借閱步驟封裝成可重複的服務', technical: 'Function、parameters 與 return value' },
        { everyday: '處理子分類時反覆套用相同步驟，到空分類停止', technical: 'Recursion 與 base case' },
        { everyday: '索引卡保存書籍位置，不是書本身', technical: 'Pointer/reference 與 referenced object' },
      ],
      boundary: '圖書索引不完全等於特定語言的 raw pointer；garbage-collected 與 manual-memory languages 的 ownership、lifetime 與錯誤模式不同。Python 為 dynamically typed 不代表它沒有 types。',
      examCues: ['Static/dynamic typing 問的是型別檢查時機，不是有沒有 types。', 'Scope 是名稱在哪裡可見；lifetime 是 object 存在多久。', 'Recursion 必須有 base case 與向其靠近的小問題。', 'Dangling pointer 指向已失效物件；memory leak 是不再需要卻無法回收。'],
    },
    sections: [
      { title: '型別與控制流程', body: 'Type system 對 values 與 expressions 分類並限制操作。If、loop、switch 改變執行順序；追蹤時要記錄每步狀態。', bullets: ['Dynamic typing 仍有 runtime types', 'Cast 不保證資料不損失', 'Loop 要檢查初始、條件、更新'] },
      { title: '函式、scope 與 lifetime', body: 'Function 建立輸入、局部狀態與輸出的邊界。Lexical scope 由程式文字結構決定名稱解析；object lifetime 可跨越某個 scope。', bullets: ['Parameter passing 規則依語言而定', 'Local variable 通常只在 block/function 內可見'] },
      { title: '遞迴與 call stack', body: 'Recursive call 會建立新的 activation record，保存 parameters、locals 與 return location。缺 base case 或無法收旂可導致 stack overflow。', bullets: ['先找 base case', '再驗證每步使問題變小'] },
      { title: '指標與動態記憶體', body: 'Pointer/reference 可間接存取 object。Stack 常配合 calls 管理，heap 用於動態生命週期，但精確配置由 language/runtime 決定。', bullets: ['Null 不指向有效 object', 'Use-after-free 與 leak 是不同錯誤', 'Ownership 可幫助明確誰負責釋放'] },
    ],
    workedExamples: [
      { prompt: '遞迴 factorial(4) 如何展開與收旂？', steps: ['factorial(1)=1 是 base case。', 'factorial(4)=4×factorial(3)。', '逐步到 1 後回傳相乘。'], answer: '4×3×2×1=24；每步參數減 1 保證收旂。' },
      { prompt: '程式釋放 object 後仍保留 raw pointer，有何問題？', steps: ['Pointer 值仍是舊位址。', 'Object lifetime 已結束。', '再 dereference 屬 invalid access。'], answer: '形成 dangling pointer；應依語言使用 ownership、smart pointer 或安全生命週期機制。' },
    ],
    commonPitfalls: ['說 dynamically typed 語言沒有 types', '把 scope 與 lifetime 當同一件事', '遞迴少了 base case', '把 pointer 本身與它指向的 object 混淆', '把 leak 與 dangling pointer 當同種錯誤'],
    sourceRefs: progSource,
    pastPaperRefs: ['q-pp-im-it-109-3', 'q-pp-im-it-109-4', 'q-pp-im-it-110-11', 'q-pp-im-it-110-12', 'q-pp-im-it-110-13', 'q-pp-im-it-114-1'],
    reviewStatus: reviewed,
  },
  {
    id: 'lesson-im-it-prog-runtime-quality-lifecycle-01',
    subtopicId: 'im-it-prog-language-runtime',
    coveredSubtopicIds: ['im-it-prog-language-runtime', 'im-it-prog-error-testing', 'im-it-prog-software-lifecycle'],
    title: '從原始碼到上線：編譯、測試與軟體生命週期',
    summary: '以 source code 到 executable/runtime 的轉換流程為起點，連結 error handling、unit/integration testing、requirements、UML、version control 與 CI/CD。',
    evidenceNote: '錯誤處理與測試在 canonical metadata 為 0 題 direct primary refs；本節是 foundational coverage，以編譯執行與軟體建模的 eligible refs 支撐端到端流程，不宣稱測試為考古高頻。',
    estimatedMinutes: 36,
    minimumPastPaperRefs: 3,
    learningObjectives: ['區分 compiler、interpreter、assembler 與 linker', '說明 exception、assertion 與 test 的不同角色', '區分 unit、integration 與 system tests', '將 requirements、UML、Git 與 CI/CD 放回 SDLC'],
    learningScenario: {
      title: '餐廳新菜單上線',
      hook: '餐廳從需求討論、流程圖、分工製作到試菜與正式上菜，每一階段都有不同產物與檢查，不會把食材清單直接當成可上桌的餐點。',
      predict: '單獨試吃每道配料都沒問題，為什麼整套出餐流程還需要另外測試？',
      mapping: [
        { everyday: '食材清單與製作指示轉成餐點', technical: 'Source code 經 compiler/interpreter/runtime 執行' },
        { everyday: '各工作站的成品最後組成整份套餐', technical: 'Object files/libraries 由 linker 解析符號與組合' },
        { everyday: '食材缺貨時走備用流程', technical: 'Exception handling 處理可預期異常' },
        { everyday: '單項試味、工作站串接測試、全流程試營運', technical: 'Unit、integration、system testing' },
        { everyday: '需求、流程圖、版本記錄、自動檢查後上線', technical: 'Requirements、UML、Git、CI/CD 與 SDLC' },
      ],
      boundary: '餐廳流程不映射特定 compiler pipeline 的所有階段；interpreted、bytecode/VM、JIT 與 native compilation 可混合存在。Testing 可增加信心但不能證明程式完全無缺陷。',
      examCues: ['Assembler 轉 assembly；compiler 轉 high-level source；link er 解析與組合 modules。', 'Exception 處理 runtime 異常；assertion 檢查程式內部預期；test 系統性提供輸入驗證行為。', 'Unit 看小單元，integration 看介面，system 看整體需求。', 'UML 是建模語言，不是 programming language；Git 是 version control，CI/CD 是自動化流程。'],
    },
    sections: [
      { title: '翻譯與連結', body: 'Compiler 對 source 做 lexical/syntax/semantic processing 並產生中間或目標程式；assembler 處理 assembly；linker 組合 object files/libraries。', bullets: ['Static linking 在建置時組入所需程式碼', 'Dynamic linking/loading 在執行環境解析 shared library', 'Interpreter 強調執行程序，不等於全程沒有翻譯'] },
      { title: '錯誤處理不等於測試', body: 'Exception 是執行期異常轉移機制；assertion 表達開發者假設；tests 是可重複驗證行為的額外程式。', bullets: ['不要用 exception 隱藏所有錯誤', 'Assertion 不應取代必要的 user-input validation', 'Test 要有可觀察 expected result'] },
      { title: '分層測試與自動化', body: 'Unit test 快速定位小單元；integration test 檢查元件介面；system/end-to-end test 比較接近使用情境但成本較高。', bullets: ['CI 在變更時自動建置與測試', 'CD 涉及可重複交付/部署', 'Flaky test 會降低警報信任'] },
      { title: 'SDLC 是反覆的責任流程', body: 'Requirements 定義問題與驗收，UML 可視覺化結構與互動，version control 保留變更歷史，operations feedback 再回到下一輪。', bullets: ['UML class diagram 不是 Gantt chart', 'Agile 不表示不需 requirements/design', 'Git commit 不自動代表已審核或已測試'] },
    ],
    workedExamples: [
      { prompt: '兩個 object files 分別定義與呼叫 calculate()，誰負責解析符號？', steps: ['Compiler/assembler 先產生 object files。', '呼叫端留下 unresolved symbol。', 'Linker 尋找定義並連結位址。'], answer: 'Linker 負責模組間符號解析與組合。' },
      { prompt: '單元測試都過，但 API 串資料庫時欄位名不合。哪層測試最直接？', steps: ['單一函式內部行為已被 unit tests 覆蓋。', '錯誤發生在 API 與 database 介面。', '應組合兩者檢查實際契約。'], answer: 'Integration test 最直接；它驗證元件之間的介面與資料格式。' },
    ],
    commonPitfalls: ['把 compiler、assembler 與 linker 當同一工具', '認為 interpreted language 一定沒有 bytecode/JIT', '用 assertion 取代使用者輸入驗證', '單元測試全過就宣稱系統無缺陷', '把 UML 當程式語言或 Gantt chart'],
    sourceRefs: progSource,
    pastPaperRefs: ['q-pp-im-it-112-19', 'q-pp-im-it-106-23', 'q-pp-im-it-110-10'],
    reviewStatus: reviewed,
  },
];

const refs = {
  archAdjacent: ['q-pp-im-it-106-11', 'q-pp-im-it-112-1', 'q-pp-im-it-113-4'],
  io: ['q-pp-im-it-110-6', 'q-pp-im-it-112-3', 'q-pp-im-it-112-4', 'q-pp-im-it-113-7'],
  syntax: ['q-pp-im-it-109-3', 'q-pp-im-it-109-4', 'q-pp-im-it-110-12', 'q-pp-im-it-110-13'],
  functions: ['q-pp-im-it-114-1'],
  runtime: ['q-pp-im-it-110-11', 'q-pp-im-it-112-19'],
  lifecycle: ['q-pp-im-it-106-23', 'q-pp-im-it-110-10'],
};
const card = (id, lessonId, subtopicId, front, back, explanation, sourceRefs, pastPaperRefs = []) => ({ id, lessonId, subtopicId, front, back, explanation, sourceRefs, pastPaperRefs, reviewStatus: reviewed });
const cards = [
  card('card-im-it-arch-number-systems-a1','lesson-im-it-arch-logic-circuits-01','im-it-arch-number-systems','十六進位與二進位為何可四位一組轉換？','因為 16=2^4，一個十六進位數碼正好表示 4 bits 的 0–15。','例如 A₁₆=1010₂，2D₁₆=0010 1101₂。',archSource),
  card('card-im-it-arch-number-systems-a2','lesson-im-it-arch-logic-circuits-01','im-it-arch-number-systems','AND、OR、XOR 在 bit mask 中各常用來做什麼？','AND 保留/清除指定位；OR 設定位；XOR 切換位或檢查不同。','運算是逐 bit 套用，需先對齊位數。',archSource),
  card('card-im-it-arch-boolean-logic-a1','lesson-im-it-arch-logic-circuits-01','im-it-arch-boolean-logic','De Morgan 定律如何否定 A AND B？','NOT(A AND B)=NOT A OR NOT B。','否定分配進去時，AND/OR 也要互換。',archSource),
  card('card-im-it-arch-boolean-logic-a2','lesson-im-it-arch-logic-circuits-01','im-it-arch-boolean-logic','真值表能證明兩個 Boolean expressions 等價嗎？','可以；若所有輸入組合的輸出都相同，兩者功能等價。','n 個 Boolean inputs 有 2^n 組組合。',archSource),
  card('card-im-it-arch-digital-circuits-a1','lesson-im-it-arch-logic-circuits-01','im-it-arch-digital-circuits','Combinational 與 sequential circuit 的核心差異？','Combinational output 只由當前輸入決定；sequential output 還受已儲存狀態影響。','Flip-flop/register 是常見狀態元件。',archSource),
  card('card-im-it-arch-digital-circuits-a2','lesson-im-it-arch-logic-circuits-01','im-it-arch-digital-circuits','Adder、multiplexer、flip-flop 各自的主要功能？','Adder 加法；multiplexer 選擇一路輸入；flip-flop 儲存 1 bit。','三者分別對應算術、選擇與狀態。',archSource),
  card('card-im-it-arch-io-performance-a1','lesson-im-it-arch-io-performance-01','im-it-arch-io-performance','Polling 與 interrupt-driven I/O 的主動方是誰？','Polling 由 CPU 主動反覆查詢；interrupt 由 device 發訊號通知 CPU。','Interrupt 仍有儲存狀態與執行 ISR 的成本。',archSource,refs.io.slice(2)),
  card('card-im-it-arch-io-performance-a2','lesson-im-it-arch-io-performance-01','im-it-arch-io-performance','DMA 為何適合 block transfer？','DMA controller 可在 device 與 memory 間搬運大批資料，降低 CPU 逐字參與。','CPU 仍負責設定並可在完成時處理 interrupt。',archSource,['q-pp-im-it-112-4']),
  card('card-im-it-prog-syntax-types-control-a1','lesson-im-it-prog-control-functions-memory-01','im-it-prog-syntax-types-control','Dynamically typed 是什麼意思？','型別檢查與綁定的重要部分在 runtime 進行，不代表沒有 types。','Python objects 仍有 types，只是 variable names 不必固定一種型別。',progSource,['q-pp-im-it-109-4','q-pp-im-it-110-13']),
  card('card-im-it-prog-syntax-types-control-a2','lesson-im-it-prog-control-functions-memory-01','im-it-prog-syntax-types-control','追蹤 loop 時最少要檢查哪三件事？','初始狀態、繼續/停止條件、每輪狀態更新。','建立逐輪表格可避免 off-by-one 誤判。',progSource,refs.syntax),
  card('card-im-it-prog-functions-scope-a1','lesson-im-it-prog-control-functions-memory-01','im-it-prog-functions-scope','Scope 與 lifetime 有何不同？','Scope 是名稱可見的程式區域；lifetime 是 object 在執行期存在的時間。','Object 可在建立它的 local name 離開 scope 後仍被其他 reference 保留。',progSource,refs.functions),
  card('card-im-it-prog-functions-scope-a2','lesson-im-it-prog-control-functions-memory-01','im-it-prog-functions-scope','正確 recursion 的兩個必要條件？','要有 base case，且 recursive step 要使問題逐步靠近 base case。','否則可能無限呼叫並造成 stack overflow。',progSource,refs.functions),
  card('card-im-it-prog-pointers-memory-a1','lesson-im-it-prog-control-functions-memory-01','im-it-prog-pointers-memory','Dangling pointer 與 memory leak 的差異？','Dangling pointer 指向已失效 object；leak 是不再需要的配置無法被回收。','前者可導致 invalid access，後者逐步消耗記憶體。',progSource),
  card('card-im-it-prog-pointers-memory-a2','lesson-im-it-prog-control-functions-memory-01','im-it-prog-pointers-memory','Stack 與 heap 的典型角色？','Stack 常管理 calls 的 activation records；heap 常供生命週期不緊綁單一 call 的動態 objects。','這是概念模型，精確配置取決於 compiler/runtime。',progSource),
  card('card-im-it-prog-language-runtime-a1','lesson-im-it-prog-runtime-quality-lifecycle-01','im-it-prog-language-runtime','Assembler、compiler、linker 各處理什麼？','Assembler 轉 assembly；compiler 轉 high-level source；linker 解析與組合 object modules/libraries。','實際 toolchain 可有 intermediate representation、loader 與 JIT。',progSource,refs.runtime),
  card('card-im-it-prog-language-runtime-a2','lesson-im-it-prog-runtime-quality-lifecycle-01','im-it-prog-language-runtime','Static linking 與 dynamic linking 的主要差異？','Static linking 在建置時把所需程式碼組入；dynamic linking/loading 在執行環境解析 shared library。','兩者在可執行檔大小、更新與部署有不同取捨。',progSource,['q-pp-im-it-112-19']),
  card('card-im-it-prog-error-testing-a1','lesson-im-it-prog-runtime-quality-lifecycle-01','im-it-prog-error-testing','Exception、assertion、test 各自的角色？','Exception 處理執行期異常；assertion 檢查內部假設；test 提供可重複輸入與 expected behavior。','三者互補，不應相互取代。',progSource),
  card('card-im-it-prog-error-testing-a2','lesson-im-it-prog-runtime-quality-lifecycle-01','im-it-prog-error-testing','Unit、integration、system test 分別關注什麼？','Unit 關注小單元；integration 關注元件介面；system 關注整體需求。','測試層級越高通常情境越真實，但執行與定位成本也較高。',progSource),
  card('card-im-it-prog-software-lifecycle-a1','lesson-im-it-prog-runtime-quality-lifecycle-01','im-it-prog-software-lifecycle','UML 是什麼，又不是什麼？','UML 是視覺化軟體結構與互動的標準建模語言；它不是 programming language 或 Gantt chart。','Class、sequence、use-case diagrams 各回答不同設計問題。',progSource,refs.lifecycle),
  card('card-im-it-prog-software-lifecycle-a2','lesson-im-it-prog-runtime-quality-lifecycle-01','im-it-prog-software-lifecycle','CI/CD 與 version control 的關係？','Version control 記錄與協作變更；CI 在變更時自動建置/測試；CD 進一步自動交付或部署。','Commit 不自動代表已測試，pipeline 要明確定義 gates。',progSource,refs.lifecycle),
];

writeFileSync(new URL('im-it-full-batch-a-lessons.json', out), `${JSON.stringify({ schemaVersion: 2, subjectId: 'im-it', status: reviewed, batchId: 'im-it-full-batch-a', counts: { lessons: lessons.length, coveredSubtopics: new Set(lessons.flatMap((lesson) => lesson.coveredSubtopicIds)).size }, lessons }, null, 2)}\n`);
writeFileSync(new URL('im-it-full-batch-a-cards.json', out), `${JSON.stringify({ schemaVersion: 1, subjectId: 'im-it', status: reviewed, batchId: 'im-it-full-batch-a', totalCards: cards.length, cards }, null, 2)}\n`);
writeFileSync(new URL('im-it-full-batch-a-sources.json', out), `${JSON.stringify({ schemaVersion: 1, subjectId: 'im-it', batchId: 'im-it-full-batch-a', sources: [], note: '本 batch 只引用 canonical registry 中已 reviewed 的 src-brookshear-13e 與 src-oracle-oop-concepts，無需新增來源。' }, null, 2)}\n`);
