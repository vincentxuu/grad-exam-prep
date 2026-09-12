import fs from 'node:fs';

const input = JSON.parse(fs.readFileSync('.work/im-it-review-input-110-112.json', 'utf8'));

const confirmedRows = `
q-pp-im-it-110-1|C|現代個人電腦 CPU 時脈通常以 GHz 計；2–4 MHz 明顯不符，其餘規格在題目年代均合理。
q-pp-im-it-110-3|E|JPEG、PNG、BMP、TIFF 全都是影像檔格式，因此 A–D 無一符合「not」。
q-pp-im-it-110-4|A|ROM 斷電後保留資料；RAM、DDR RAM、SDRAM 都是揮發性記憶體。
q-pp-im-it-110-6|A|螢幕的像素解析度以橫縱像素表示；dpi 是印刷輸出常用單位，FHD 與 UHD 的像素數也正確。
q-pp-im-it-110-7|B|gateway 可在異質協定或架構的網路間轉換；bridge、switch、hub 不具此功能，router 通常轉送同協定網路。
q-pp-im-it-110-8|B|題幹逐字描述 VPN 將私有網路延伸到公用網路的功能。
q-pp-im-it-110-9|B|5G 的優勢是降低延遲，不是提高延遲；其他選項均為常見 5G 目標。
q-pp-im-it-110-10|D|UML 是用來視覺化系統設計的標準建模語言；其餘是程式語言或程式設計典範。
q-pp-im-it-110-11|E|A–D 分別是 assembly、pseudocode、interpreter、scripting language 的合理基本定義，沒有錯項。
q-pp-im-it-110-12|E|A、B 是命令式與函數式典範的定義；C++ 與 Python 都支援命令式程式設計。
q-pp-im-it-110-13|B|對程式構造指派型別並驗證資料表示規則的正式名稱是 type system。
q-pp-im-it-110-14|C|以線性方程擬合依變數與解釋變數關係的預測方法就是 linear regression。
q-pp-im-it-110-15|A|precision 定義為預測為正者中真正例的比例，即 TP/(TP+FP)。
q-pp-im-it-110-16|A|accuracy 是所有正確分類 TP+TN 除以全部樣本。
q-pp-im-it-110-17|A|數位憑證把身分與 public key 綁定並由 CA 簽章，不會證明私鑰或秘密金鑰的所有權。
q-pp-im-it-110-18|A|HTTP cookie 儲存在瀏覽器端；伺服器可利用 cookie 中的識別資訊維持 session、表單或驗證狀態。
q-pp-im-it-110-19|B|CDN 將 cache/proxy edge servers 地理分散，使內容從接近使用者的位置提供。
q-pp-im-it-110-20|C|逐一嘗試字典詞彙作為密碼是 dictionary attack；brute force 則枚舉可能字元組合。
q-pp-im-it-110-21|D|CIA triad 的 C、I、A 分別是 Confidentiality、Integrity、Availability。
q-pp-im-it-110-22|C|實作 key-value associative array 的典型資料結構是 hash table，核心使用 hash function。
q-pp-im-it-110-23|A|效率、完整性、降低冗餘都是標準資料庫優勢；題面所寫的「data definition and the problem」不是標準優勢表述。
q-pp-im-it-110-24|A|database schema 定義資料庫的邏輯結構；data dictionary 則儲存描述結構的 metadata。
q-pp-im-it-110-25|D|ACID 的 A 是 Atomicity；其餘三項均不是 ACID 字首展開。
q-pp-im-it-110-26|D|挖礦透過共識機制驗證並收錄交易；鑄幣是部分系統給礦工的獎勵，不是題目所問的主要目的。
q-pp-im-it-110-28|D|同時使用公司本地基礎設施與 AWS 公有雲符合 hybrid cloud 的定義。
q-pp-im-it-111-1|A|OSI 模型只有七層，Application 是第七層；第八層不存在。
q-pp-im-it-111-2|A|SMTP 用於寄送及伺服器間轉送郵件；IMAP、POP、POP3 用於取信。
q-pp-im-it-111-3|B|sliding window 允許確認前同時送出多個 frame，並以視窗與序號維持可靠有序傳輸。
q-pp-im-it-111-4|E|DHCP 用於 IP 網路且採 client-server，自動配置位址與參數，對移動到新網路的用戶亦有用。
q-pp-im-it-111-5|E|網路虛擬化可拆分或聚合實體網路；處理器虛擬化讓多個虛擬 CPU 與不同 guest OS 共存。
q-pp-im-it-111-6|E|A–D 都是 VM 與 hypervisor 的一般描述；易佈建、維護及支援高可用配置是常見效益。
q-pp-im-it-111-7|C|IEEE 802 網段中配置給 NIC 的鏈路層識別碼是 MAC address。
q-pp-im-it-111-9|A|先偵測通道 idle 並企圖避免碰撞，對應 CSMA/CA；CSMA/CD 是碰撞偵測。
q-pp-im-it-111-10|C|CIA 的 A 是 Availability，不是 Accessibility。
q-pp-im-it-111-11|E|描述的是 man-in-the-middle attack，但 A–D 沒有該標準名稱，所以應選 none of the above。
q-pp-im-it-111-12|C|一般 public-key encryption 的加密金鑰是公開金鑰；RSA 的其他三項敘述均合理。
q-pp-im-it-111-13|C|ACID 的 I 是 Isolation，不是 Integrity。
q-pp-im-it-111-14|E|A–D 分別符合 1NF、2NF 與 3NF 消除遞移相依、減少冗餘的教材定義。
q-pp-im-it-111-15|B|checkpoint 建立可恢復的持久化界線，使較早且已不再需要的交易日誌可被截斷或歸檔。
q-pp-im-it-111-16|C|thread 才比 process 輕量；process 有隔離位址空間且可包含多個 threads。
q-pp-im-it-111-17|B|持續回應對方狀態、一直活動卻沒有進展是 livelock，而不是 deadlock 或 starvation。
q-pp-im-it-111-18|E|提高利用率與 throughput、降低 waiting time、公平配置 CPU 都是排程的典型目標。
q-pp-im-it-111-19|C|在一般有限就緒佇列與固定時間片假設下，Round Robin 讓每個 ready process 輪流取得 CPU，不會飢餓。
q-pp-im-it-111-20|B|將印表工作先排入磁碟佇列、讓程式交付後繼續執行，是 spooling。
q-pp-im-it-111-21|D|ER 圖中 diamond 表示 relationship；attribute 使用 oval。
q-pp-im-it-111-22|D|執行期載入共享函式庫、處理 relocation 與符號跳轉的是 dynamic linker。
q-pp-im-it-112-1|C|Von Neumann 架構讓資料與指令共用記憶體；分離記憶體是 Harvard 架構特徵。
q-pp-im-it-112-2|D|CISC 通常具有較大、較複雜的指令集，不是比 RISC 更小。
q-pp-im-it-112-3|E|在題目採用的 byte-addressable 基本模型下，32-bit 位址可定位 2^32 bytes；memory-mapped I/O 與 registers 的敘述也正確。
q-pp-im-it-112-4|E|interrupt-driven I/O 與 DMA 的四項敘述均符合基本架構；DMA hardware 可降低 CPU 搬移資料的參與。
q-pp-im-it-112-5|C|現代 L1 cache 容量以數十 KB 計，不是數十到數百 bytes。
q-pp-im-it-112-6|E|資源、行程、記憶體與安全管理全都是 OS 主要功能。
q-pp-im-it-112-7|C|4 KiB 是 x86 等主流平台最常見的基本 page size。
q-pp-im-it-112-8|B|一般每個 user process 有獨立虛擬位址空間，不是所有 user-mode applications 共用同一空間。
q-pp-im-it-112-9|C|cluster 可提升運算能力與容錯，但不會因為組成叢集就自動防止資安攻擊。
q-pp-im-it-112-10|E|建立刪除、暫停恢復、同步與 deadlock handling 都屬 OS process management。
q-pp-im-it-112-12|D|單處理器透過 time slicing 與 context switching 讓多行程交錯執行。
q-pp-im-it-112-14|B|共享式 Ethernet 的 CSMA/CD 碰撞後使用 binary exponential backoff。
q-pp-im-it-112-15|A|IEEE 802.1Q frame tag 將單一實體 LAN 劃成多個邏輯 broadcast domains，即 VLAN。
q-pp-im-it-112-16|C|週期性與直接鄰居交換路由距離資訊的是 distance-vector routing。
q-pp-im-it-112-17|A|TCP 建連使用 three-way handshake；stream、sliding window、sequence number 三項均正確。
q-pp-im-it-112-18|D|題面 D 的描述是 zero-day attack，不是 first-day attack。
q-pp-im-it-112-19|E|assembler、linker、static/dynamic linking、lexical/syntax analysis 四項敘述均正確。
q-pp-im-it-112-20|A|wide-column stores 通常允許稀疏或動態欄位，不能概括為固定預定欄數；B–D 是其資料模型的標準描述。
q-pp-im-it-112-21|E|table、row、key、record、attribute 的四項敘述符合基本 relational model。
q-pp-im-it-112-23|B|實體物件的數位對應模型，用於模擬、監控及維護，稱為 digital twin。
q-pp-im-it-112-24|D|Bitcoin mining 的共識與區塊建立流程會驗證交易；其他選項不是其主要目的。
q-pp-im-it-112-26|E|既然 T 是 G 的 spanning tree 且 G 的所有邊都在 T，兩者邊集相同；加非樹邊會成環，且圖可有多棵 spanning trees。
q-pp-im-it-112-27|B|binary heap 插入放在末端後沿父鏈 sift，最壞走樹高 O(log n)；題面不等號方向錯誤不改變此複雜度。
q-pp-im-it-112-28|C|heap 只有親子偏序，搜尋任意值最壞需檢查所有節點，為 O(n)。
`.trim().split('\n').map((line) => {
  const [questionId, reviewedAnswer, reasoning] = line.split('|');
  return [questionId, { reviewedAnswer, reasoning }];
});

const correctedRows = new Map([
  ['q-pp-im-it-112-11', {
    reviewedAnswer: 'B',
    reasoning: '依作業系統教材的 file/storage management 責任，建立刪除檔案、disk scheduling、檔案操作 primitives 與備份至穩定儲存媒體都屬管理工作；「file integrity check」不是該標準責任清單，因此唯一可選的是 B，不是現有 D。',
  }],
]);

const disputedRows = new Map([
  ['q-pp-im-it-110-2', '.bin 是泛用 binary 副檔名，但也確實常與 .cue 搭配表示 CD/DVD disc image；因此 B 不能被唯一判定為錯誤。'],
  ['q-pp-im-it-110-5', '抽象 stored-program 模型可說 CPU 從 main memory fetch instruction；現代實作則通常先經 cache。題目用「directly」但未指定抽象層級，A 與 E 的判斷不唯一。'],
  ['q-pp-im-it-110-27', 'Microsoft Azure 同時提供 IaaS、PaaS 與 SaaS；若採早期產品定位可選 PaaS，但題目沒有指定服務或年代，B 不是唯一可重現答案。'],
  ['q-pp-im-it-111-8', 'C 對 datagram routing 顯然錯，但 B 宣稱每個 datagram header 都包含整份檔案的封包總數與序號，也不是 IP datagram 的一般必要欄位，因此存在至少兩個錯項。'],
  ['q-pp-im-it-111-23', 'A 的 2D 描述可判錯，但「blockchain 是 metaverse 的 key technology」不是定義必要條件，D 也屬可爭議主張，無法保證唯一答案。'],
  ['q-pp-im-it-111-24', 'NFT 能證明鏈上 token 的控制權，但不必然證明所連結數位檔案的著作權或法律所有權；A 的 ownership 用語使 E 不是無爭議唯一答案。'],
  ['q-pp-im-it-112-13', 'C 在典型配置中錯，但 A 宣稱 code section 從位址 0 開始也不是現代 Unix 的普遍事實，null page、ASLR 與載入配置都可能使其不從 0 開始，存在多個錯項。'],
  ['q-pp-im-it-112-22', 'C 的確錯，foreign key 可以為 NULL；但 A 忽略 composite primary key，B 又把 foreign key 可參照的 UNIQUE candidate key 限縮為 primary key，嚴格讀法下也不完全正確。'],
  ['q-pp-im-it-112-25', 'B 明確錯，k 個 children 應有 k-1 keys；但 D 未排除 root，而 internal root 不一定有 ceil(m/2) children，因此題面嚴格讀法有兩個錯項。'],
]);

const confirmed = new Map(confirmedRows);
const expectedIds = new Set([...confirmed.keys(), ...correctedRows.keys(), ...disputedRows.keys()]);

const result = input.map((row) => {
  const sourceBasis = [
    `public/papers/pp-im-it-${row.year}.pdf（題幹與選項）`,
    'public/data/questions.json 與 public/data/answers.json（現況交叉核對）',
    '獨立技術推導；無官方答案 key',
  ];

  if (correctedRows.has(row.id)) {
    const review = correctedRows.get(row.id);
    return {
      questionId: row.id,
      currentAnswer: row.currentAnswer,
      reviewedAnswer: review.reviewedAnswer,
      verdict: 'corrected',
      confidence: 'medium',
      reasoning: review.reasoning,
      sourceBasis,
      autoGradeEligible: true,
    };
  }

  if (disputedRows.has(row.id)) {
    return {
      questionId: row.id,
      currentAnswer: row.currentAnswer,
      reviewedAnswer: null,
      verdict: 'disputed',
      confidence: 'disputed',
      reasoning: disputedRows.get(row.id),
      sourceBasis,
      autoGradeEligible: false,
    };
  }

  const review = confirmed.get(row.id);
  if (!review) throw new Error(`Missing review for ${row.id}`);
  if (review.reviewedAnswer !== row.currentAnswer) {
    throw new Error(`Confirmed answer mismatch for ${row.id}: ${row.currentAnswer} != ${review.reviewedAnswer}`);
  }
  return {
    questionId: row.id,
    currentAnswer: row.currentAnswer,
    reviewedAnswer: review.reviewedAnswer,
    verdict: 'confirmed',
    confidence: 'medium',
    reasoning: review.reasoning,
    sourceBasis,
    autoGradeEligible: true,
  };
});

if (expectedIds.size !== input.length) {
  throw new Error(`Decision count ${expectedIds.size} does not match input count ${input.length}`);
}

fs.writeFileSync('.work/im-it-answer-review-110-112.json', `${JSON.stringify(result, null, 2)}\n`);
