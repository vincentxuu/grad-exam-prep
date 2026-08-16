# IM-IT 新手專有名詞稽核

## 範圍與口徑

- 權威來源：`public/data/im-it-lessons.json`（目前為 **35 個 lesson、覆蓋 61 個 subtopic、209 道題**）。「61 堂」應修正為「61 個子主題」，避免把 lesson 與 subtopic 混為一談。
- 本表優先收錄第一次閱讀最可能卡住、且理解錯誤會影響後續章節的 59 個詞。
- 定義採繁中白話，生活例子只負責建立直覺；正式作答仍應回到課程中的技術限制與反例。
- 每個實際 lesson 配置 3–6 個核心詞；JSON 可作為 glossary pipeline 的 reviewed 輸入。

## 硬體、資料表示與 I/O

### 1. 指令集架構
- **Aliases／縮寫：** ISA、Instruction Set Architecture
- **白話定義：** 軟體與 CPU 之間約定好的命令清單與操作規則。
- **生活例子：** 像餐廳菜單規定客人能點哪些菜，但不規定廚房內部怎麼煮。
- **容易誤解：** ISA 不是某一顆 CPU 的內部電路設計；後者叫微架構。
- **套用 lessons：** `lesson-im-it-arch-cpu-organization`、`lesson-im-it-prog-control-functions-memory-01`、`lesson-im-it-arch-logic-circuits-01`

### 2. 暫存器
- **Aliases／縮寫：** register、CPU register
- **白話定義：** CPU 內極小但極快、用來暫放眼前資料與狀態的儲存位置。
- **生活例子：** 像廚師手邊的小碟子，只放當下馬上要用的材料。
- **容易誤解：** 不是一般記憶體，也不是硬碟；容量小得多但速度快。
- **套用 lessons：** `lesson-im-it-arch-cpu-organization`、`lesson-im-it-arch-memory-data-representation-01`

### 3. 管線冒險
- **Aliases／縮寫：** pipeline hazard、hazard、data hazard、control hazard
- **白話定義：** 多條指令重疊執行時，因資料或下一步尚未確定而必須等待的情況。
- **生活例子：** 像洗車線上前車還沒沖完，後車不能立刻進入下一站。
- **容易誤解：** pipeline 不是多顆 CPU；hazard 也不一定是程式錯誤。
- **套用 lessons：** `lesson-im-it-arch-cpu-organization`

### 4. 快取
- **Aliases／縮寫：** cache、cache hit、cache miss
- **白話定義：** 把近期常用資料放在更近、更快的位置，減少每次都去慢速來源取得。
- **生活例子：** 像把常用調味料放手邊，而不是每次走去倉庫拿。
- **容易誤解：** 快取不是永久資料庫；miss 也不代表資料不存在。
- **套用 lessons：** `lesson-im-it-arch-cpu-organization`、`lesson-im-it-arch-memory-data-representation-01`、`lesson-im-it-db-storage-indexing-b01`

### 5. 二補數
- **Aliases／縮寫：** two's complement、補數表示法
- **白話定義：** 電腦用固定長度位元表示正負整數的一種規則，讓加減法能共用電路。
- **生活例子：** 像里程表倒退一格會繞到最大數字，固定格數造成循環。
- **容易誤解：** 最高位為 1 不只是貼一個負號；整串位元要依二補數規則解讀。
- **套用 lessons：** `lesson-im-it-arch-memory-data-representation-01`、`lesson-im-it-arch-logic-circuits-01`、`lesson-im-it-prog-control-functions-memory-01`

### 6. 布林邏輯
- **Aliases／縮寫：** Boolean logic、AND、OR、NOT
- **白話定義：** 只用真與假來組合條件與決策的邏輯系統。
- **生活例子：** 門禁規則可以是「有卡 AND 密碼正確」才開門。
- **容易誤解：** AND、OR 是邏輯關係，不等同日常語言中模糊的「和／或」。
- **套用 lessons：** `lesson-im-it-arch-logic-circuits-01`、`lesson-im-it-prog-control-functions-memory-01`、`lesson-im-it-db-relational-model-01`

### 7. 中斷
- **Aliases／縮寫：** interrupt、IRQ
- **白話定義：** 裝置主動通知 CPU 有事件，使 CPU 暫停原工作並先處理該事件。
- **生活例子：** 像店員工作時聽到門鈴，先去接待新客再回來繼續。
- **容易誤解：** 中斷不是把程式永遠停止，而是可保存現場後再恢復。
- **套用 lessons：** `lesson-im-it-arch-io-performance-01`、`lesson-im-it-os-processes-threads`、`lesson-im-it-os-file-storage-io`

### 8. 直接記憶體存取
- **Aliases／縮寫：** DMA、Direct Memory Access
- **白話定義：** 讓裝置能成批搬資料到記憶體，CPU 不必逐筆親自搬運。
- **生活例子：** 像請物流車整批送貨，主管只負責下單與收完成通知。
- **容易誤解：** DMA 不是完全不用 CPU；CPU 仍要設定傳輸並處理完成事件。
- **套用 lessons：** `lesson-im-it-arch-io-performance-01`、`lesson-im-it-arch-memory-data-representation-01`、`lesson-im-it-os-file-storage-io`

## 作業系統與執行環境

### 9. 行程與執行緒
- **Aliases／縮寫：** process、thread、行程、執行緒
- **白話定義：** 行程是有獨立資源的執行容器，執行緒是容器內可被排程的工作路線。
- **生活例子：** 一間餐廳像一個行程，裡面的多位廚師像多條執行緒。
- **容易誤解：** 共享同一行程資源不代表執行緒彼此不會衝突。
- **套用 lessons：** `lesson-im-it-os-processes-threads`、`lesson-im-it-os-scheduling-memory-management-01`、`lesson-im-it-os-virtualization-containers-01`、`lesson-im-it-os-sync-deadlock-b01`

### 10. 上下文切換
- **Aliases／縮寫：** context switch、情境切換
- **白話定義：** 系統保存目前工作的執行狀態，再載入另一項工作的狀態。
- **生活例子：** 像客服先記下 A 客戶談到哪，再打開 B 客戶紀錄接著處理。
- **容易誤解：** 切換本身有成本，頻繁切換不會免費增加效能。
- **套用 lessons：** `lesson-im-it-os-processes-threads`、`lesson-im-it-os-scheduling-memory-management-01`、`lesson-im-it-os-virtualization-containers-01`

### 11. 排程器
- **Aliases／縮寫：** scheduler、CPU scheduler、排程演算法
- **白話定義：** 作業系統決定哪個可執行工作何時取得 CPU 的機制。
- **生活例子：** 像診所叫號，依規則安排下一位看診者。
- **容易誤解：** 排程器不是工作自己決定何時執行，也不保證每個工作立刻執行。
- **套用 lessons：** `lesson-im-it-os-scheduling-memory-management-01`

### 12. 虛擬記憶體
- **Aliases／縮寫：** virtual memory、page、page fault、分頁
- **白話定義：** 把程式看到的位址空間映射到實體記憶體，必要時再從儲存裝置載入頁面。
- **生活例子：** 像書桌只放正在看的資料，其餘文件先收在櫃子，需要時再拿出來。
- **容易誤解：** 虛擬記憶體不是單純把硬碟當 RAM；page fault 也不一定是程式故障。
- **套用 lessons：** `lesson-im-it-os-scheduling-memory-management-01`、`lesson-im-it-arch-memory-data-representation-01`、`lesson-im-it-os-file-storage-io`

### 13. 競爭條件
- **Aliases／縮寫：** race condition、data race
- **白話定義：** 多個工作同時碰同一資料，結果因執行先後不同而不穩定。
- **生活例子：** 兩位店員同時修改同一張庫存表，最後數字可能覆蓋彼此。
- **容易誤解：** 多執行緒不必然有 race；關鍵是共享狀態且缺乏正確協調。
- **套用 lessons：** `lesson-im-it-os-sync-deadlock-b01`、`lesson-im-it-os-processes-threads`、`lesson-im-it-db-transactions-01`

### 14. 互斥鎖與號誌
- **Aliases／縮寫：** mutex、lock、semaphore、互斥鎖、信號量
- **白話定義：** 互斥鎖限制同一時間只有一人進入；號誌則用計數控制可同時使用的名額。
- **生活例子：** 廁所鑰匙像 mutex，三格停車位的剩餘名額像 semaphore。
- **容易誤解：** semaphore 不一定只允許一人，mutex 也不等同所有同步方法。
- **套用 lessons：** `lesson-im-it-os-sync-deadlock-b01`、`lesson-im-it-os-processes-threads`、`lesson-im-it-db-transactions-01`

### 15. 死結
- **Aliases／縮寫：** deadlock、死鎖
- **白話定義：** 多個工作各自占著資源又互等對方釋放，因而永遠無法前進。
- **生活例子：** 兩台車在窄巷互不退讓，彼此都卡住。
- **容易誤解：** 等待很久不一定是死結；死結有形成環狀等待等特定條件。
- **套用 lessons：** `lesson-im-it-os-sync-deadlock-b01`、`lesson-im-it-db-transactions-01`、`lesson-im-it-os-processes-threads`

### 16. inode
- **Aliases／縮寫：** index node、索引節點
- **白話定義：** Unix 類檔案系統用來保存檔案屬性與資料位置的紀錄。
- **生活例子：** 像圖書館書目卡記錄書在哪個書架，但書名標籤可另行管理。
- **容易誤解：** inode 通常不直接保存檔名；檔名由目錄項目連到 inode。
- **套用 lessons：** `lesson-im-it-os-file-storage-io`

### 17. 緩衝
- **Aliases／縮寫：** buffer、buffering、I/O buffer
- **白話定義：** 先把速度不一致的資料暫放一區，再分批處理或傳送。
- **生活例子：** 像外送員先把多張訂單集中，再一次送往同一區域。
- **容易誤解：** buffer 重點是平滑資料流；cache 重點是重複使用以加速。
- **套用 lessons：** `lesson-im-it-os-file-storage-io`、`lesson-im-it-arch-io-performance-01`、`lesson-im-it-network-application-protocols`

### 18. 虛擬機監控器
- **Aliases／縮寫：** hypervisor、VMM
- **白話定義：** 在硬體與虛擬機之間分配 CPU、記憶體與裝置的管理層。
- **生活例子：** 像大樓管理員把整棟資源分給不同住戶使用。
- **容易誤解：** hypervisor 不是虛擬機裡的作業系統，也不是容器引擎。
- **套用 lessons：** `lesson-im-it-os-virtualization-containers-01`、`lesson-im-it-network-cloud-performance-01`、`lesson-im-it-trends-emerging-digital-applications-01`

### 19. 容器
- **Aliases／縮寫：** container、Docker container、容器化
- **白話定義：** 把應用程式與相依環境封裝起來，但通常共享主機作業系統核心。
- **生活例子：** 像便當盒分開裝菜，仍共用同一台冰箱與廚房。
- **容易誤解：** 容器不是完整虛擬機，隔離邊界與共享核心要另外評估。
- **套用 lessons：** `lesson-im-it-os-virtualization-containers-01`、`lesson-im-it-network-cloud-performance-01`、`lesson-im-it-prog-runtime-quality-lifecycle-01`

### 20. 無伺服器運算
- **Aliases／縮寫：** serverless、FaaS、Function as a Service
- **白話定義：** 雲端平台代管伺服器與擴縮，使用者專注部署函式並依使用量付費。
- **生活例子：** 像叫車時只管目的地，不必買車、保養或排司機班表。
- **容易誤解：** serverless 背後仍有伺服器，只是營運責任轉交平台。
- **套用 lessons：** `lesson-im-it-os-virtualization-containers-01`、`lesson-im-it-network-cloud-performance-01`、`lesson-im-it-trends-emerging-digital-applications-01`

## 程式設計與資料結構

### 21. 物件導向三大特性
- **Aliases／縮寫：** OOP、encapsulation、inheritance、polymorphism、封裝、繼承、多型
- **白話定義：** 用封裝隱藏內部、繼承重用關係、多型讓同一介面有不同實作。
- **生活例子：** 各種付款工具都用「付款」按鈕，但信用卡與轉帳各自執行不同流程。
- **容易誤解：** 三者是設計工具，不是使用 class 就自然得到好設計。
- **套用 lessons：** `lesson-im-it-prog-object-oriented`、`lesson-im-it-prog-control-functions-memory-01`、`lesson-im-it-prog-runtime-quality-lifecycle-01`

### 22. 堆疊與堆積記憶體
- **Aliases／縮寫：** stack、heap、call stack、堆疊、堆積
- **白話定義：** stack 常隨函式呼叫自動進出，heap 則放生命週期較彈性的動態資料。
- **生活例子：** stack 像依序疊盤子，heap 像倉庫中另行申請與歸還空間。
- **容易誤解：** 這裡的 heap 是記憶體區域，不是資料結構中的 heap。
- **套用 lessons：** `lesson-im-it-prog-control-functions-memory-01`、`lesson-im-it-prog-object-oriented`

### 23. 編譯器與直譯器
- **Aliases／縮寫：** compiler、interpreter、編譯、直譯
- **白話定義：** 編譯器先轉換程式，直譯器偏向執行時逐步讀取與執行。
- **生活例子：** 像先把整份菜單翻譯好，與用餐時逐句口譯的差別。
- **容易誤解：** 現代語言常混用編譯、位元碼與即時編譯，不一定只有二選一。
- **套用 lessons：** `lesson-im-it-prog-runtime-quality-lifecycle-01`、`lesson-im-it-prog-control-functions-memory-01`、`lesson-im-it-arch-cpu-organization`、`lesson-im-it-prog-object-oriented`

### 24. 大 O 複雜度
- **Aliases／縮寫：** Big O、time complexity、O(n)、時間複雜度
- **白話定義：** 描述輸入變大時，演算法所需時間或空間的成長速度。
- **生活例子：** 排 10 人與排 1 萬人時，工作量增加多快比小規模快幾秒更重要。
- **容易誤解：** Big O 不是精確秒數，也不能忽略資料規模與常數成本。
- **套用 lessons：** `lesson-im-it-ds-complexity-sorting-searching-01`、`lesson-im-it-ds-trees-heaps-01`、`lesson-im-it-ds-linear-hashing-b01`、`lesson-im-it-ds-graphs-design-b01`

### 25. 二分搜尋
- **Aliases／縮寫：** binary search、二元搜尋
- **白話定義：** 在已排序資料中反覆排除一半範圍來找目標。
- **生活例子：** 猜 1 到 100 的數字，每次猜中間並問較大或較小。
- **容易誤解：** 資料若未排序，不能直接套二分搜尋得到正確結果。
- **套用 lessons：** `lesson-im-it-ds-complexity-sorting-searching-01`、`lesson-im-it-ds-trees-heaps-01`、`lesson-im-it-db-storage-indexing-b01`

### 26. 二元搜尋樹
- **Aliases／縮寫：** BST、Binary Search Tree、二叉搜尋樹
- **白話定義：** 每個節點左側較小、右側較大的樹狀結構。
- **生活例子：** 像按姓氏順序分流：較前往左、較後往右。
- **容易誤解：** BST 不一定平衡；歪斜時搜尋可能退化成線性時間。
- **套用 lessons：** `lesson-im-it-ds-trees-heaps-01`、`lesson-im-it-ds-complexity-sorting-searching-01`、`lesson-im-it-db-storage-indexing-b01`

### 27. 堆積資料結構
- **Aliases／縮寫：** heap、binary heap、priority queue、優先佇列
- **白話定義：** 維持父節點比子節點更大或更小，方便快速取出最高優先項目。
- **生活例子：** 急診先處理最危急病患，而不是最早到的人。
- **容易誤解：** heap 只保證父子順序，不代表整棵樹已完整排序。
- **套用 lessons：** `lesson-im-it-ds-trees-heaps-01`、`lesson-im-it-ds-complexity-sorting-searching-01`、`lesson-im-it-ds-linear-hashing-b01`

### 28. 雜湊碰撞
- **Aliases／縮寫：** hash collision、collision、雜湊衝突
- **白話定義：** 不同輸入經雜湊後落到同一位置，需要額外規則分開保存。
- **生活例子：** 兩位同姓客人被分到同一取餐代號，櫃台還要用其他資訊辨認。
- **容易誤解：** 碰撞是有限位置下的正常可能，不等於雜湊函式壞掉或被攻擊。
- **套用 lessons：** `lesson-im-it-ds-linear-hashing-b01`、`lesson-im-it-db-storage-indexing-b01`

### 29. 圖的走訪
- **Aliases／縮寫：** BFS、DFS、breadth-first search、depth-first search、廣度優先、深度優先
- **白話定義：** BFS 逐層探索，DFS 則沿一條路深入後再回頭。
- **生活例子：** 找最近的朋友關係像 BFS，探索迷宮一條路到底像 DFS。
- **容易誤解：** 兩者走訪順序不同，適用問題與記憶體成本也不同。
- **套用 lessons：** `lesson-im-it-ds-graphs-design-b01`、`lesson-im-it-ds-trees-heaps-01`

## 資料庫

### 30. 動態規劃
- **Aliases／縮寫：** DP、dynamic programming
- **白話定義：** 把重複子問題的答案保存起來，再組合成較大問題的答案。
- **生活例子：** 先記下各段車程最省時間，再組合出完整路線。
- **容易誤解：** 名稱中的「programming」是規劃，不是泛指寫程式；也不是所有遞迴都叫 DP。
- **套用 lessons：** `lesson-im-it-ds-graphs-design-b01`、`lesson-im-it-ds-complexity-sorting-searching-01`、`lesson-im-it-ai-foundations-ml-evaluation-01`

### 31. 主鍵與外鍵
- **Aliases／縮寫：** primary key、foreign key、PK、FK、主鍵、外來鍵
- **白話定義：** 主鍵唯一識別本表資料，外鍵則指向另一表的主鍵來建立關係。
- **生活例子：** 身分證字號辨認一個人，訂單上的會員編號則連回會員資料。
- **容易誤解：** 外鍵不一定唯一；它的重點是參照完整性，不是替資料排序。
- **套用 lessons：** `lesson-im-it-db-relational-model-01`、`lesson-im-it-db-er-normalization-b01`、`lesson-im-it-db-sql-querying`、`lesson-im-it-db-transactions-01`

### 32. 資料表連接
- **Aliases／縮寫：** JOIN、INNER JOIN、LEFT JOIN、表格連接
- **白話定義：** 依共同欄位把多張表中相關的列組合起來查詢。
- **生活例子：** 用會員編號把訂單表與會員姓名表拼成完整清單。
- **容易誤解：** JOIN 不等於把兩表全部排列組合；連接條件會決定配對。
- **套用 lessons：** `lesson-im-it-db-sql-querying`、`lesson-im-it-db-relational-model-01`、`lesson-im-it-db-er-normalization-b01`

### 33. 分組彙總
- **Aliases／縮寫：** GROUP BY、aggregate、aggregation、SUM、COUNT
- **白話定義：** 先按類別分組，再對每組計算總和、筆數或平均。
- **生活例子：** 把每日訂單按門市分組後，計算各門市總營業額。
- **容易誤解：** WHERE 篩原始列，HAVING 通常篩分組後的結果，兩者層次不同。
- **套用 lessons：** `lesson-im-it-db-sql-querying`、`lesson-im-it-data-big-data-nosql-01`、`lesson-im-it-ai-foundations-ml-evaluation-01`

### 34. ACID 交易特性
- **Aliases／縮寫：** ACID、atomicity、consistency、isolation、durability
- **白話定義：** 交易要做到全有全無、維持規則、彼此適度隔離，完成後結果可保存。
- **生活例子：** 銀行轉帳不能只扣款不入帳，且完成後不能因當機消失。
- **容易誤解：** ACID 的 consistency 是符合資料規則，不等同分散式系統 CAP 的 consistency。
- **套用 lessons：** `lesson-im-it-db-transactions-01`、`lesson-im-it-os-sync-deadlock-b01`

### 35. 隔離等級
- **Aliases／縮寫：** isolation level、dirty read、non-repeatable read、serializable
- **白話定義：** 資料庫用不同強度限制並行交易彼此看見未完成變更的程度。
- **生活例子：** 兩位售票員同時賣最後一張票，需要規則避免重複售出。
- **容易誤解：** 隔離越強通常成本越高；不是所有系統都一律用最高等級。
- **套用 lessons：** `lesson-im-it-db-transactions-01`、`lesson-im-it-os-sync-deadlock-b01`、`lesson-im-it-db-sql-querying`

### 36. 關係基數
- **Aliases／縮寫：** cardinality、one-to-many、many-to-many、1:N、M:N
- **白話定義：** 描述兩類實體之間能互相對應幾筆資料。
- **生活例子：** 一位會員可有多張訂單，是一對多關係。
- **容易誤解：** cardinality 在資料建模與查詢最佳化中可能有不同語境，要看上下文。
- **套用 lessons：** `lesson-im-it-db-er-normalization-b01`、`lesson-im-it-db-relational-model-01`

### 37. 資料庫正規化
- **Aliases／縮寫：** normalization、1NF、2NF、3NF、BCNF
- **白話定義：** 依資料相依性拆表，減少重複與新增、修改、刪除異常。
- **生活例子：** 把客戶地址從每張訂單抽成會員資料，避免改地址要改很多次。
- **容易誤解：** 正規化不是表越多越好，分析效能需求可能採有理由的反正規化。
- **套用 lessons：** `lesson-im-it-db-er-normalization-b01`、`lesson-im-it-db-relational-model-01`

## 網路與雲端

### 38. 資料庫索引
- **Aliases／縮寫：** index、B-tree、B+ tree、hash index、索引
- **白話定義：** 建立額外查找結構，讓資料庫不必每次掃完整張表。
- **生活例子：** 像書末索引讓你直接找到頁碼，不必從第一頁翻起。
- **容易誤解：** 索引會占空間並增加寫入維護成本，不是每個欄位都建越多越好。
- **套用 lessons：** `lesson-im-it-db-storage-indexing-b01`、`lesson-im-it-ds-trees-heaps-01`、`lesson-im-it-db-sql-querying`

### 39. 網路封裝
- **Aliases／縮寫：** encapsulation、header、payload、封包封裝
- **白話定義：** 資料往下經過網路各層時，每層加上自己需要的控制資訊。
- **生活例子：** 像商品先裝盒、貼地址，再裝進物流袋，每層有自己的標籤。
- **容易誤解：** 這個 encapsulation 是網路分層，不是物件導向的資料隱藏。
- **套用 lessons：** `lesson-im-it-network-models-encapsulation`、`lesson-im-it-network-link-lan-01`、`lesson-im-it-network-ip-routing-transport-01`、`lesson-im-it-network-application-protocols`

### 40. 網域名稱系統
- **Aliases／縮寫：** DNS、Domain Name System、網域解析
- **白話定義：** 把人類易讀的網域名稱查成電腦用來連線的 IP 位址等紀錄。
- **生活例子：** 像通訊錄把聯絡人姓名查成電話號碼。
- **容易誤解：** DNS 不是替封包選路，也不是網站內容本身。
- **套用 lessons：** `lesson-im-it-network-application-protocols`、`lesson-im-it-network-ip-routing-transport-01`、`lesson-im-it-network-models-encapsulation`

### 41. IP 定址與路由
- **Aliases／縮寫：** IP address、subnet mask、CIDR、router、default gateway、子網路、路由
- **白話定義：** 定址判斷裝置與網段，路由則選擇封包跨網路前往目的地的下一步。
- **生活例子：** 地址告訴包裹要去哪，轉運站規則決定下一車送往哪裡。
- **容易誤解：** subnet mask 不是另一個主機地址；default gateway 也不是所有封包的最終目的地。
- **套用 lessons：** `lesson-im-it-network-ip-routing-transport-01`、`lesson-im-it-network-models-encapsulation`、`lesson-im-it-network-link-lan-01`、`lesson-im-it-network-cloud-performance-01`

### 42. TCP、UDP 與連接埠
- **Aliases／縮寫：** TCP、UDP、port、transport protocol、連接埠
- **白話定義：** TCP 提供可靠有序的資料流，UDP 提供較精簡的資料報；port 用來找到主機上的應用程式。
- **生活例子：** IP 像大樓地址，port 像房號；TCP 像掛號信，UDP 像快速投遞。
- **容易誤解：** port 不是實體插孔；UDP 也不是必然比 TCP 好或永遠不可靠。
- **套用 lessons：** `lesson-im-it-network-ip-routing-transport-01`、`lesson-im-it-network-application-protocols`、`lesson-im-it-network-models-encapsulation`

### 43. MAC 位址與 VLAN
- **Aliases／縮寫：** MAC address、Ethernet、VLAN、LAN、虛擬區域網路
- **白話定義：** MAC 用於區域網路鏈結層識別介面，VLAN 則把同一實體網路邏輯分區。
- **生活例子：** 同一辦公室裡用不同門禁區隔部門，即使共用建築與線路。
- **容易誤解：** MAC 不是跨網際網路的全球路由地址；VLAN 也不是 VPN。
- **套用 lessons：** `lesson-im-it-network-link-lan-01`、`lesson-im-it-network-models-encapsulation`

### 44. 延遲與吞吐量
- **Aliases／縮寫：** latency、throughput、bandwidth、延遲、吞吐量
- **白話定義：** 延遲是單次等多久，吞吐量是單位時間能處理多少資料。
- **生活例子：** 水龍頭打開多久出水像延遲，每分鐘流多少水像吞吐量。
- **容易誤解：** 高頻寬不保證低延遲，兩項指標不能互相代替。
- **套用 lessons：** `lesson-im-it-network-cloud-performance-01`、`lesson-im-it-arch-io-performance-01`、`lesson-im-it-network-models-encapsulation`、`lesson-im-it-network-application-protocols`

## 資訊安全

### 45. 邊緣運算
- **Aliases／縮寫：** edge computing、edge、fog computing、邊緣計算
- **白話定義：** 把部分計算放到靠近資料產生處的位置，以降低等待與回傳量。
- **生活例子：** 工廠攝影機先在現場判斷異常，不必每張影像都送遠端雲端。
- **容易誤解：** edge 不是完全取代 cloud，常是兩者分工。
- **套用 lessons：** `lesson-im-it-network-cloud-performance-01`、`lesson-im-it-trends-emerging-digital-applications-01`、`lesson-im-it-data-big-data-nosql-01`

### 46. 加密與金鑰
- **Aliases／縮寫：** encryption、symmetric key、asymmetric key、public key、private key、對稱式、非對稱式
- **白話定義：** 加密用金鑰把明文轉成未授權者難以讀懂的密文；對稱式共用密鑰，非對稱式使用公私鑰對。
- **生活例子：** 對稱式像雙方共用一把房門鑰匙，非對稱式像任何人可投信但只有收件人能開信箱。
- **容易誤解：** 公鑰可以公開不代表私鑰也能公開；加密也不自動證明發送者身分。
- **套用 lessons：** `lesson-im-it-security-cryptography-01`、`lesson-im-it-security-risk-access-governance-01`、`lesson-im-it-security-attacks-network-defense-01`、`lesson-im-it-security-blockchain-01`

### 47. 雜湊與數位簽章
- **Aliases／縮寫：** hash、digest、digital signature、雜湊、數位簽章
- **白話定義：** 雜湊產生資料摘要；數位簽章用私鑰簽摘要，供他人驗證來源與完整性。
- **生活例子：** 像先做文件指紋，再由本人蓋上只有他能使用的印章。
- **容易誤解：** 雜湊不是加密，簽章也不是把手寫簽名貼進檔案。
- **套用 lessons：** `lesson-im-it-security-cryptography-01`、`lesson-im-it-security-blockchain-01`、`lesson-im-it-security-attacks-network-defense-01`

### 48. PKI 與 TLS
- **Aliases／縮寫：** PKI、certificate、CA、TLS、HTTPS、憑證
- **白話定義：** PKI 用憑證與信任機構綁定身分和公鑰，TLS 再利用它建立受保護連線。
- **生活例子：** CA 像核發證件的機關，TLS 像雙方查驗證件後建立安全通道。
- **容易誤解：** HTTPS 不代表網站內容一定可信，只代表連線對象與傳輸受到特定保護。
- **套用 lessons：** `lesson-im-it-security-cryptography-01`、`lesson-im-it-network-application-protocols`、`lesson-im-it-security-risk-access-governance-01`

### 49. CIA 與零信任
- **Aliases／縮寫：** CIA triad、confidentiality、integrity、availability、Zero Trust、零信任
- **白話定義：** CIA 是機密性、完整性、可用性三個資安目標；零信任要求每次存取都持續驗證。
- **生活例子：** 進辦公室不只看一次大門證件，進機房還要再驗身分與權限。
- **容易誤解：** Zero Trust 不是完全不信任任何人，也不是買一套產品就完成。
- **套用 lessons：** `lesson-im-it-security-risk-access-governance-01`、`lesson-im-it-security-attacks-network-defense-01`、`lesson-im-it-security-cryptography-01`

### 50. 注入與社交工程攻擊
- **Aliases／縮寫：** SQL injection、XSS、phishing、social engineering、網路釣魚、跨站腳本
- **白話定義：** 注入攻擊把惡意輸入當程式執行；社交工程則利用人的信任取得資料或操作。
- **生活例子：** 偽造客服訊息騙密碼是 phishing；把惡意腳本塞進留言欄可能形成 XSS。
- **容易誤解：** 防火牆無法單獨擋下所有應用輸入與人為受騙問題。
- **套用 lessons：** `lesson-im-it-security-attacks-network-defense-01`、`lesson-im-it-security-risk-access-governance-01`

## 資料、AI 與生成式 AI

### 51. 區塊鏈共識與挖礦
- **Aliases／縮寫：** blockchain、distributed ledger、consensus、mining、proof of work、分散式帳本
- **白話定義：** 多個節點依共識規則確認帳本順序；挖礦是部分區塊鏈取得提案權與保護歷史的方法。
- **生活例子：** 像多本同步帳簿要先依共同規則確認哪筆交易先記。
- **容易誤解：** 區塊鏈不等於比一般資料庫更快，挖礦也不是所有區塊鏈都需要。
- **套用 lessons：** `lesson-im-it-security-blockchain-01`

### 52. NoSQL 與 CAP
- **Aliases／縮寫：** NoSQL、CAP theorem、consistency、availability、partition tolerance
- **白話定義：** NoSQL 是多種非關聯式資料模型；CAP 說網路分割時，分散式系統無法同時保證強一致與每次都有回應。
- **生活例子：** 多家分店斷線時，要選擇暫停部分服務或先接受可能不同步的訂單。
- **容易誤解：** CAP 不是平常任選兩項的產品標籤，也不是 ACID 的直接反義詞。
- **套用 lessons：** `lesson-im-it-data-big-data-nosql-01`、`lesson-im-it-db-relational-model-01`

### 53. 監督式與非監督式學習
- **Aliases／縮寫：** supervised learning、unsupervised learning、label、監督式學習、非監督式學習
- **白話定義：** 監督式學習從有答案標籤的例子學預測，非監督式學習則從無標籤資料找結構。
- **生活例子：** 用已標垃圾郵件訓練分類器是監督式；自動把客群分群是非監督式。
- **容易誤解：** 監督式不是有人每一步盯著模型，非監督式也不是完全沒有目標。
- **套用 lessons：** `lesson-im-it-ai-foundations-ml-evaluation-01`、`lesson-im-it-ai-neural-sequence-transformer-01`

### 54. 過度擬合與模型評估
- **Aliases／縮寫：** overfitting、training set、validation set、test set、precision、recall
- **白話定義：** 過度擬合是模型太會記訓練資料卻不會應付新資料，需用未參與訓練的資料與合適指標檢查。
- **生活例子：** 背熟題庫答案卻遇到改寫題就不會，是過度擬合的生活版。
- **容易誤解：** 訓練分數高不等於模型好；accuracy 也不適合所有不平衡問題。
- **套用 lessons：** `lesson-im-it-ai-foundations-ml-evaluation-01`、`lesson-im-it-ai-neural-sequence-transformer-01`

### 55. 神經網路
- **Aliases／縮寫：** neural network、layer、weight、activation function、神經網路
- **白話定義：** 由多層可調參數的計算單元組成，透過資料調整權重來近似複雜關係。
- **生活例子：** 像一排排篩選站，各站把前一站訊息重新加權後再傳下去。
- **容易誤解：** 名稱來自生物啟發，但不是大腦的完整複製品。
- **套用 lessons：** `lesson-im-it-ai-neural-sequence-transformer-01`、`lesson-im-it-ai-foundations-ml-evaluation-01`

### 56. 注意力機制與 Transformer
- **Aliases／縮寫：** attention、self-attention、Transformer、注意力機制
- **白話定義：** attention 讓模型依當下任務衡量不同內容的重要性，Transformer 以此處理序列關係。
- **生活例子：** 讀代名詞「他」時，回頭特別注意前文可能指的是誰。
- **容易誤解：** attention 不是模型具有人的專注或理解；Transformer 也不只用於文字。
- **套用 lessons：** `lesson-im-it-ai-neural-sequence-transformer-01`、`lesson-im-it-ai-generative-governance-01`

### 57. 大型語言模型與 token
- **Aliases／縮寫：** LLM、Large Language Model、token、GPT、大型語言模型
- **白話定義：** LLM 從大量 token 序列學習下一個 token 的機率，token 是模型切分文字的基本單位。
- **生活例子：** 像根據前文玩的超大型接龍，但每一步選的是文字片段而非必然完整單字。
- **容易誤解：** token 不等於一個中文字或一個英文單字；流暢輸出也不保證事實正確。
- **套用 lessons：** `lesson-im-it-ai-generative-governance-01`、`lesson-im-it-ai-neural-sequence-transformer-01`

### 58. 檢索增強生成
- **Aliases／縮寫：** RAG、Retrieval-Augmented Generation、retrieval、檢索增強生成
- **白話定義：** 先從外部資料找相關內容，再把找到的內容交給生成模型回答。
- **生活例子：** 像先翻課本找頁碼，再根據那些段落整理答案。
- **容易誤解：** RAG 不會自動保證正確；檢索錯、資料舊或模型誤讀仍會出錯。
- **套用 lessons：** `lesson-im-it-ai-generative-governance-01`、`lesson-im-it-data-big-data-nosql-01`

### 59. AI 幻覺
- **Aliases／縮寫：** hallucination、confabulation、生成錯誤
- **白話定義：** 生成模型說出語句通順但沒有可靠根據或事實錯誤的內容。
- **生活例子：** 像同學忘記資料卻講得很肯定，甚至編出不存在的書名。
- **容易誤解：** 幻覺不是模型真的看見東西，也不能只靠更有自信的語氣判斷。
- **套用 lessons：** `lesson-im-it-ai-generative-governance-01`、`lesson-im-it-security-risk-access-governance-01`

## Lesson 覆蓋檢查

- `lesson-im-it-ai-foundations-ml-evaluation-01`：5 詞
- `lesson-im-it-ai-generative-governance-01`：4 詞
- `lesson-im-it-ai-neural-sequence-transformer-01`：5 詞
- `lesson-im-it-arch-cpu-organization`：5 詞
- `lesson-im-it-arch-io-performance-01`：4 詞
- `lesson-im-it-arch-logic-circuits-01`：3 詞
- `lesson-im-it-arch-memory-data-representation-01`：5 詞
- `lesson-im-it-data-big-data-nosql-01`：4 詞
- `lesson-im-it-db-er-normalization-b01`：4 詞
- `lesson-im-it-db-relational-model-01`：6 詞
- `lesson-im-it-db-sql-querying`：5 詞
- `lesson-im-it-db-storage-indexing-b01`：5 詞
- `lesson-im-it-db-transactions-01`：6 詞
- `lesson-im-it-ds-complexity-sorting-searching-01`：5 詞
- `lesson-im-it-ds-graphs-design-b01`：3 詞
- `lesson-im-it-ds-linear-hashing-b01`：3 詞
- `lesson-im-it-ds-trees-heaps-01`：6 詞
- `lesson-im-it-network-application-protocols`：6 詞
- `lesson-im-it-network-cloud-performance-01`：6 詞
- `lesson-im-it-network-ip-routing-transport-01`：4 詞
- `lesson-im-it-network-link-lan-01`：3 詞
- `lesson-im-it-network-models-encapsulation`：6 詞
- `lesson-im-it-os-file-storage-io`：5 詞
- `lesson-im-it-os-processes-threads`：6 詞
- `lesson-im-it-os-scheduling-memory-management-01`：4 詞
- `lesson-im-it-os-sync-deadlock-b01`：6 詞
- `lesson-im-it-os-virtualization-containers-01`：5 詞
- `lesson-im-it-prog-control-functions-memory-01`：6 詞
- `lesson-im-it-prog-object-oriented`：3 詞
- `lesson-im-it-prog-runtime-quality-lifecycle-01`：3 詞
- `lesson-im-it-security-attacks-network-defense-01`：4 詞
- `lesson-im-it-security-blockchain-01`：3 詞
- `lesson-im-it-security-cryptography-01`：4 詞
- `lesson-im-it-security-risk-access-governance-01`：5 詞
- `lesson-im-it-trends-emerging-digital-applications-01`：3 詞
