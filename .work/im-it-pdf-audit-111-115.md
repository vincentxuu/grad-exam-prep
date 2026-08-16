# 計概題庫 vs 原始 PDF 稽核（111-115）

稽核日期：2026-08-16

## 結論

**不完全相符。** 五份 PDF 的卷別、題數與題號都有被題庫完整建立，但 112 年題庫存在大範圍文字毀損；113 年 `questions.json` 另有 3 個實質錯誤，而其個別 qfile 多數反而正確。111、114、115 年未發現實質題文落差。

| 年度 | PDF 題型與題數 | `questions.json` / qfiles 數量 | PDF 對照結果 |
|---|---:|---:|---|
| 111 | 24 題單選 + 1 題程式問答 | 25 / 25 | 題數、題號、題幹、選項、程式碼相符 |
| 112 | 28 題單選 + 1 題程式問答 | 29 / 29 | **26 題有文字落差；Q29 另缺全部子題** |
| 113 | 24 題單選 + 1 題程式問答 | 25 / 25 | `questions.json` 的 Q9/Q12/Q19 錯；Q23-Q25 見專節 |
| 114 | 24 題單選 + 1 題程式問答 | 25 / 25 | 題數、題號、題幹、選項、程式碼相符 |
| 115 | 30 題單選 + 1 題程式問答 | 31 / 31 | 題數、題號、題幹、選項、程式碼相符 |

總計：PDF 共 **135 題**；`questions.json` 與 qfiles 都有 **135 個 ID**，沒有缺號或多號。問題不是「少題」，而是部分題目的文字內容沒有忠實轉錄。

## 稽核方法與權威來源

- 權威來源：`public/papers/pp-im-it-111.pdf` 至 `pp-im-it-115.pdf`。
- 五份皆為掃描影像 PDF，`pdftotext` 無可用文字層。
- 使用 Poppler `pdftoppm -png -r 120` 將全部 **21 頁** render 到 `tmp/pdfs/im-it-111-115/`，逐頁視覺核對。
- 使用 Tesseract `eng+chi_tra` OCR 作為定位輔助；不以 OCR 取代視覺判讀。
- 對照 `public/data/questions.json` 與 `public/data/qfiles/q-pp-im-it-{year}-{number}.json`。
- 五卷都沒有獨立圖表或照片題；`hasImage: false` 合理。113 Q8 的數學式、111/112/113/114/115 的程式碼均以文字忠實度另行核對。

## 112 年：大範圍不相符

112 年 PDF 的配置為：第 1 頁 Q1-Q6、第 2 頁 Q7-Q15、第 3 頁 Q16-Q22、第 4 頁 Q23-Q28、第 5 頁 Q29。`questions.json` 與 qfiles 文字完全相同，因此下列問題同時存在於兩種資料。

### 第 1 頁（Q1-Q6）

| 題號 | 判定 | PDF 證據與資料落差 |
|---|---|---|
| Q1 | 不符 | PDF 有完整 (A)-(E)，(D) 為「a central processing unit has a control unit and an arithmetic/logic unit」，(E) 為 none-applicable 選項；資料把 (D) 縮成 `it has...` 且完全遺失 `(E)` 標籤與文字。 |
| Q2 | 嚴重毀損 | PDF 是 CISC/RISC 四個陳述：編譯後指令數、單一指令能力、clock cycles、instruction-set 大小；資料把多個片段錯接，(B)-(E) 不再是原選項。 |
| Q3 | 嚴重毀損 | PDF 題名是 computer architecture，(A) 32-bit address bus、(B)(C) memory-mapped I/O、(D) registers、(E) none-applicable；資料改成 computer memory，並遺失/拼接多個選項。 |
| Q4 | 嚴重毀損 | PDF 的 (A)(B) 是 interrupt-driven I/O，(C)(D) 是 DMA；資料重排並互相拼接句子，遺失完整 (E)。 |
| Q5 | 嚴重毀損 | PDF 題名是 CPU cache；(A) register 比 L1 快、(B) register 數量小於 L1 size、(C) L1 為 dozens-to-hundreds bytes、(D) L2 大於 L1、(E) none-applicable。資料題名改成 registers，選項錯位且缺 (E)。 |
| Q6 | 相符 | OS 主要功能題的五個選項均相符（僅大小寫差異）。 |

### 第 2 頁（Q7-Q15）

| 題號 | 判定 | PDF 證據與資料落差 |
|---|---|---|
| Q7 | 不符 | PDF (D) 是 `128KB`；資料是 `12KB`。 |
| Q8 | 不精確 | PDF 題幹是「wrong for applications running in an operating system」；資料改成「wrong about operating systems」。選項仍可辨識，但非原文。 |
| Q9 | 相符 | cluster 題完整（僅單複數/大小寫差異）。 |
| Q10 | 相符 | process management 責任題相符。 |
| Q11 | 嚴重毀損 | PDF 選項為 (A) creating/deleting files、(B) file integrity check、(C) disk scheduling、(D) backup、(E) manipulation primitives；資料遺失 (B)，其後選項位移，且只剩 (A)-(D)。 |
| Q12 | 嚴重毀損 | PDF 是「uniprocessor achieves multiprogramming by ___ in CPU scheduling」，選項含 dynamic allocation、process rotating、pipelining、**time slicing**、none；資料改成 `CPU scheduling` 並只留下三個不相干/殘缺選項。 |
| Q13 | 嚴重毀損 | PDF 的 memory layout 選項是 code section=0、data above code、stack immediately above data、stack dynamic、none-applicable；資料遺失/重複多段。 |
| Q14 | 嚴重毀損 | PDF 問 Ethernet 解決 collision 的 algorithm，(A) Carrier Sense、(B) Exponential Backoff、(C) Collision Avoidance、(D) RTS/CTS、(E) Round Robin；資料題幹與 (A) 被 OCR 式錯接。 |
| Q15 | 不符 | PDF 是「apply **tags** to network frames」並描述單一實體網路被切成多個網路；資料寫成 `apply logic`，且省略/改寫關鍵敘述。 |

### 第 3 頁（Q16-Q22）

| 題號 | 判定 | PDF 證據與資料落差 |
|---|---|---|
| Q16 | 不符 | PDF 直接問哪一種 routing algorithm 讓鄰接路由器週期交換資訊；資料加入相反語意的 `not using... but instead`，使題意錯誤。 |
| Q17 | 嚴重毀損 | PDF (A) 是 TCP uses **2-way handshake**、(B) stream-oriented、(C) sliding-window flow control、(D) sequence numbers、(E) none-applicable；資料選項重排、重複且遺失 2-way-handshake 陳述。 |
| Q18 | 嚴重毀損 | PDF 題名是 security attacks，依序為 MITM、buffer overflow、SQL injection、first-day attack、none-applicable；資料題名改成 buffer overflow，(A) 改錯攻擊類型，(D) first-day attack 消失。 |
| Q19 | 完全錯題 | PDF 是 **program compilation**（assembler/linker/static-or-dynamic linking/lexical-and-syntax analysis）；資料卻是 relational databases。 |
| Q20 | 嚴重毀損 | PDF 的 NoSQL 選項依序為 column-oriented、key-value、document store、graph database、none-applicable；資料句段重複錯接，甚至混入 min-heap 文字。 |
| Q21 | 嚴重毀損 | PDF 是 relational database 基本結構（tables/rows、unique key、record、attributes）；資料改成 foreign-key 殘句，選項不完整。 |
| Q22 | 完全錯題 | PDF 是 relational database primary/foreign key 題；資料卻是 spanning trees，而且選項殘缺。 |

### 第 4 頁（Q23-Q28）

| 題號 | 判定 | PDF 證據與資料落差 |
|---|---|---|
| Q23 | 不符 | PDF (D) 是 `cloud object`；資料是 `cloud agent`。 |
| Q24 | 不符 | PDF 題幹用 `designed mainly`，(C) 是 `distribute transaction`；資料改成 `defined mainly` 且 (C) 只剩 `distribute`。 |
| Q25 | 完全毀損 | PDF 是 **B-tree** 性質題（self-balancing、k children/k keys、order m、至少 ceil(m/2) children、leaves same level）；資料題名變 spanning trees，內容只剩錯接殘片。 |
| Q26 | 嚴重毀損 | PDF 是 spanning-tree 題，包含 G/T 相等關係、加入非 T 邊產生 cycle、多棵 spanning trees；資料大部分選項只剩語法不完整的片段。 |
| Q27 | 完全改寫 | PDF 先（原卷如此）描述 min heap 的 parent key >= child key，再問 inserting a key 的複雜度；資料改成 `Heapification of a given array is complete...`，已非原題。 |
| Q28 | 嚴重毀損 | PDF 單純問「finding an arbitrary element in a min heap」的時間複雜度，選項 (A)-(E)；資料拼入 Q27 句段並額外產生不存在的 (F)。 |

### 第 5 頁（Q29）

Q29 有兩個重大問題：

1. PDF 函式宣告是 `void search(string txt, string pat)`；資料錯誤寫成 `void search(string txt, string pat, string badchar)`，而函式內又宣告 `int badchar[NO_OF_CHARS]`，造成不可編譯的名稱衝突。
2. PDF 的三個子題在 `questions.json` 與 qfile **全部遺失**：
   - (a) 15 分：`txt = "ABAAABCDABC"`、`pat = "ABC"` 時的輸出。
   - (b) 8 分：`search(txt, pat)` worst-case time complexity 與說明。
   - (c) 7 分：best-case time complexity 與說明。

## 113 年：`questions.json` 與 qfile 分歧

### `questions.json` 的 3 個實質錯誤

| 題號 | PDF 頁碼 | PDF / 正確 qfile | `questions.json` 錯誤 |
|---|---:|---|---|
| Q9 | 1-2 | (B) starvation、(C) deadlock | 把 (B)/(C) 對調，會直接影響選項字母與答案。 |
| Q12 | 2 | 範例網域 `www.im.ntu.tw` | 寫成 `www.im.ntu.edu.tw`。 |
| Q19 | 3 | (D) `join dependency` | 截成 `(D) join`。 |

這三題的個別 qfile 與 PDF 相符；錯誤只在聚合後的 `questions.json`。

### 特別確認 113 Q23-Q25

- **Q23（PDF 第 3 頁）**：題幹與 (A)-(E) 在 `questions.json`、qfile 都相符。原卷的正確全名不在 (A)-(D)，所以 `(E) none of the above` 的設計本身就是原卷內容，不是題庫生成錯誤。
- **Q24（PDF 第 3 頁）**：題幹與選項完整相符，`(D) Turing test` 確實出現在原卷。
- **Q25（PDF 第 3-4 頁）**：`questions.json` 保存完整 class declaration、註解、兩個子題與跨頁續文，與 PDF 相符。個別 qfile 則是**摘要版**，省略多項會影響實作契約的註解，例如 `InsertNewEmployee` 成功回傳 1/失敗回傳 0、`inorder` 必須 recursive 且輸出 `(ID, name, age)`、root/child NULL 說明。因此 qfile 不是逐字完整版本。

另有幾個非實質格式差異：Q6 語序、Q10/Q20 底線長度、Q14/Q18/Q23 引號形式、Q15 句點。這些不改變題意。

## 111、114、115 年

逐頁視覺核對結果沒有發現實質 mismatch：

- **111（4 頁）**：Q1-Q24 的題幹與五選項完整；Q25 hash-table chaining 的 class、三個函式與 (a)-(c) 完整。
- **114（4 頁）**：Q1-Q24 完整；Q25 circular linked-list queue 的 `length/dequeue/reverse` class 與 (a)-(c) 完整。
- **115（4 頁）**：Q1-Q30 完整；Q31 array stack 的 `push/reverse/rank` class 與 (a)-(c) 完整，包含 bubble-sort 限制。

## 圖表、圖片與版面依賴

- 五份卷沒有需要另外切圖保存的圖表/照片。
- 113 Q8 的 Amdahl's-law 分式已正確轉成等價純文字公式。
- 程式問答題的換行與註解屬於題意的一部分；112 Q29 與 113 Q25 qfile 的問題因此不能視為單純排版差異。

## 建議修復順序

1. 以 PDF 第 1-5 頁重建 112 Q1-Q29，不能再由現有殘缺文字做局部補字。
2. 補回 112 Q29 三個子題，修正 `search` 函式簽名。
3. 用正確 qfile 回填/修正 113 `questions.json` 的 Q9、Q12、Q19。
4. 將 113 Q25 qfile 改為與 `questions.json`/PDF 同等完整，保留所有程式註解。
5. 加入 validator：檢查選項標籤連續性、程式題 subQuestions 不得為空、qfile 與 `questions.json` 正規化後不得有實質差異。
