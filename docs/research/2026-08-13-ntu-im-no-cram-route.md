# 台大資管所：不補習路線與推薦教材

查驗日期：2026-08-13
適用年度：**116 學年度（2027 年 2 月筆試）**。116 簡章預計 2026 年 10 月底公告，考科與計分屆時要重新核對。考科結構沿用 115（見 `2026-08-11-ntu-nccu-mis-exam-prep.md` 第一節）。

**本文的取材範圍**：`public/data/resources.json` 內全部 151 筆與台大資管相關的資源（心得、教材、官方、補習班），逐筆掃過並挑出與「教材」「補習與否」有關的段落；其中 13 篇本次逐篇讀過原文（第八節有標示）。不是只看無補習的那幾篇——**有補習者的心得同樣會揭露哪些東西非補不可、哪些補了也沒用**，這對決定自學路線一樣關鍵。

---

## 一、庫內的補習光譜：不是「補」與「不補」兩個選項

把 151 筆資源裡明確交代過補習狀況的心得攤開，實際上是四種路線，而且**四種都有人上台大**：

| 路線 | 案例（resources.json id） | 結果 |
| --- | --- | --- |
| **全自學** | `res-dcard-im-114-nocram-oral`（114，政大社科院、零資訊修課） | **台大資管正取** |
| | `res-dcard-im-112-ntu-nocram`（112，成大文學院跨考） | **台大資管正取** |
| | `res-dcard-im-113-nocram-tech`（113，成大工資管，系排 47%） | 台大／政大／成大資結組 |
| | `res-hackmd-im-112-nocram`（112，北部私立資管應屆） | 資結組／科技組多校 |
| | `res-blog-im-113-nocram`（113，中字輩純文組、工作三年後全職備考） | 成／央／山備上 |
| | `res-medium-im-111-nocram`（111，跨考資管／資應） | 台政清一階皆過 |
| | `res-dcard-im-114-nocram`（114，政大科技組正取） | 政大科技組正取 |
| **只補一到兩科** | `res-hackmd-im-112-nocram-ordinary`（112，只補 MIS 雲端，計概與資結全自學） | 多校上榜 |
| | `res-hackmd-im-108-oral`（108，只報計概題庫班，「動機單純只是想要有答案」） | 台大資管上榜 |
| **半補習** | `res-dcard-im-115-cross`（115 重考跨考、半補習） | 政大／中央正取，台大落榜 |
| **全補習但主張某科不要補** | `res-dcard-im-113-admitted`（113 社科院在職跨考，全科雲端） | **台大／清大／政大／交大全正取** |

最後一列是**本次調查最該注意的一筆**，因為它跟一般「MIS 要補」的說法完全相反——詳見第四節。

**心得裡對「該不該補」的原話，也不是一面倒：**

- `res-dcard-im-113-nocram-tech`（113 全自學）：「如果是**跨考或是底子不好**的同學，建議還是補習，**方向正確比努力重要**。」他自己不補的前提是「開始投入考試前，我先研究歷年考古，認為大部分的內容我已經有基礎」。
- `res-dcard-im-113-admitted`（113 全補習）：計概「如果你非本科系，我覺得還是需要……但補習班教的東西**遠遠不夠**」；資結「本科非本科，通通都建議補」；**MIS「如果你只想考台清交政，那不要補習」**。
- `res-dcard-im-114-nocram-oral`（114 全自學正取台大）：完全零資訊背景仍成立。

所以「跨考就一定要補」不成立，「不補一定省錢省事」也不成立。**真正的分界不在補不補，而在你能不能自己決定範圍、自己排進度、自己拿到解答**——這三件事補習班本來就是賣這個。下面三節分別處理。

---

## 二、教材清單（合併庫內全部心得的推薦）

標「★」＝三篇以上心得重複推薦；括號內是提供這條資訊的 resources.json id。

### 2.1 計概／資訊科技概論（台大權重 40%，加權後佔總成績 24%）

| 用途 | 資源 | 出處 |
| --- | --- | --- |
| ★ 主幹課程 | **于天立《計算機概論》**（台大 OCW，21 講，講義可下載） | `res-ocw-ntu-intro-cs`、`res-medium-im-111-nocram`、`res-medium-im-111-zheng`、`res-cram-im-112-get-wu` |
| ★ 主幹用書 | **Brookshear《Computer Science: An Overview》13/e**（有中譯本） | `res-book-im-brookshear`、`res-hackmd-im-112-nocram-ordinary`、`res-blog-im-113-nocram`、`res-medium-im-111-cross-3`。`res-medium-im-111-cross-3` 補一句：它的程式語言與網路章節「講的非常好」，建議早點就當參考書讀 |
| 補充用書 | Forouzan《Foundations of Computer Science》4/e | `res-book-foundations-cs`（清大資應官網指定書目，考清大才需要） |
| 傳統中文教材 | Discovering Computers 中譯本 | `res-book-cs-ds`（台大／成大／政大都考過書中內容；補習班路線的預設用書） |
| 快速掃描 | 蝦皮資管所計概筆記（藍底白字那套） | `res-dcard-im-114-nocram-oral`、`res-dcard-im-112-ntu-nocram`、`res-hackmd-im-112-nocram-ordinary` |
| 英文消遣 | CrashCourse《Computer Science》 | `res-hackmd-im-112-nocram-ordinary` |

　※ 蝦皮筆記的定位三篇一致：**開讀前掃一遍建立地圖、後期當索引**。但 `res-dcard-im-112-ntu-nocram` 明講「資結跟網路的部分非常不詳細，**絕對不要把它們拿來當系統性學習的教材**」，同篇也檢討自己計組與 OS「只靠那本筆記是遠遠不夠的」。

### 2.2 計概底下的子科目

| 子科目 | 資源 | 出處與備註 |
| --- | --- | --- |
| **C++／程式設計** | ★ **孔令傑《程式設計（C++）》**（15 講／150 部） | `res-yt-ntu-cpp-kung`。**就是台大資管大一必修課本身**；台大計概固定考兩題 C++ 手寫題 |
| | 洪維恩《C++ 教學手冊》 | `res-dcard-im-113-nocram-tech`：大一啃完整本就吃到考試，「比單純刷題更有幫助」 |
| | 手寫語言依目標校 | `res-tkb-nccu-113-case`：C++ 為主，成大／中山 C、中央 Java |
| **作業系統** | ★ **周志遠《作業系統》**（清大 OCW，78 部，字幕版） | `res-yt-nthu-os-chou`、`res-medium-im-111-zheng`：「無補習考取資管、資工所的朋友們肯定都會推薦」 |
| | 杰哥數位教室《作業系統》（152 部，配 Silberschatz OSC） | `res-yt-jay-os`、`res-dcard-im-114-nocram-oral`：覺得周志遠太難的替代方案 |
| **計算機網路** | ★ **黃能富《計算機網路》**（清大 OCW） | `res-yt-nthu-network-huang`。三位上榜者都只看到**無線區域網路／Ethernet 結束**就停 |
| | PowerCert Animated Videos | `res-dcard-im-112-ntu-nocram`：「台大的網路題型一直都是**廣而不深**，不需要看 OCW，PowerCert 就很夠用」 |
| | 粘添壽《電腦網路與連結技術》／翻轉工作室 | `res-hackmd-im-112-nocram`、`res-medium-im-111-tools`：太細，當考古題查詢的工具書 |
| | Douglas Comer 中譯本 | `res-dcard-im-113-nocram-tech`：實體層到應用層都有 |
| **資料結構** | ★ 杰哥數位教室《資料結構》（56 部） | `res-yt-jay-ds`、`res-hackmd-im-112-nocram` |
| | 林軒田線上課／中山 楊昌彪 | `res-dcard-im-112-ntu-nocram`、`res-blog-im-113-nocram` |
| | 蔡明志《資料結構：使用 C++》5/e、高點 王致強、Horowitz | `res-book-ds-cpp-tsai`、`res-dcard-im-113-nocram-tech`、`res-hackmd-im-112-nocram-ordinary` |
| | 觀念串法 | `res-tkb-im-112-top`：線性結構→Tree→偏斜引出平衡樹（AVL／RB）→排序複雜度→非比較排序，一條線串完整科 |
| **演算法** | 杰哥數位教室《演算法》（73 部）／Abdul Bari | `res-yt-jay-algo`、`res-blog-im-113-nocram`（Abdul Bari 時間複雜度講最好） |
| **資料庫** | 陳士杰（杰哥）資料庫課程與投影片 | `res-hackmd-im-112-nocram`、`res-dcard-im-113-nocram-tech`：讀到正規化、SQL 就停，**交易管理後面章節很少考** |
| | LeetCode SQL 50／MySQL 練習 50 題 | `res-dcard-im-114-nocram-oral`、`res-hackmd-im-112-nocram` |
| **機器學習／AI** | ★ 李宏毅《機器學習》＋【機器學習 2023】(生成式 AI) | `res-yt-hylee-genai`、`res-dcard-im-113-admitted`、`res-hackmd-im-114-oral-bank` |
| | 蔡炎龍（政大）AI/ML、Google ML Crash Course、iThome 鐵人賽 | `res-yt-ai`、`res-google-ml-crash`、`res-blog-im-mavis` |
| | ⚠️ 投報率提醒 | `res-medium-im-111-tools`：「這類型考題比較常出現在台大……其實**投資報酬率不算太高**」——AI 要讀，但別讀成主科 |
| **資安** | 黃能富《網軍大進擊》1–2 章、中華電信資安 PPT | `res-hackmd-im-112-nocram-ordinary`；其餘「考古題考到再查」 |
| **系統分析與設計** | 吳仁和《系統分析與設計》8/e | `res-dcard-im-113-nocram-tech`：考點集中在開發方法論與 UML |
| **刷題** | GeeksforGeeks、SecondRound、LeetCode Easy（資結類、用 C++） | `res-hackmd-im-112-nocram`、`res-dcard-im-112-ntu-nocram`、`res-medium-im-111-nocram` |
| 數位邏輯／計組 | 王俊堯《數位邏輯設計》、黃婷婷《計算機結構》 | `res-medium-im-111-zheng`；台大低頻，`res-cram-im-114-liu` 也記載近年比重已降低 |

### 2.3 資訊管理導論與統計學（權重 40%，加權後佔總成績 24%）

**MIS 教材**

| 資源 | 出處 |
| --- | --- |
| ★ **Laudon《管理資訊系統》16/e 中譯本** | `res-book-laudon-mis-16e`、`res-book-im-mis-laudon`、`res-dcard-im-114-nocram-oral`、`res-dcard-im-112-ntu-nocram`、`res-medium-im-111-tools` |
| ★ **林東清《資訊管理：智慧化企業的核心競爭能力》八版** | `res-book-lin-im-8e`、`res-book-im-mis-lin`、`res-dcard-im-114-nocram-oral` |
| Harvard Business Review — Technology topic | `res-hackmd-im-108-oral`：理由是「MIS 都是英文考題、都是很新的觀念、內文都是架構式說明」 |
| iThome（技術面）／數位時代（管理面） | `res-news-ithome`、`res-news-bnext`、`res-hackmd-im-108-oral` |
| ⚠️ 反對意見 | `res-dcard-im-113-admitted`：「**我個人不推薦數位時代**，大部分文章都沒什麼內容以及 insight」，改推馬克金融筆記、科技報橘、華爾街日報的科技 podcast |
| Podcast：矽谷輕鬆談、曼報、科技浪 | `res-dcard-im-112-ntu-nocram`（「聽力的輸入比視覺的輸入**對口試更有幫助**」）、`res-blog-im-113-nocram`、`res-hackmd-im-114-oral-bank` |
| 孔令傑《平台策略》 | `res-hackmd-im-112-nocram-ordinary`：「除了平台策略，網路資源基本上就是無」 |

**統計教材（114 學年度起才併入這張考卷）**

| 資源 | 出處 |
| --- | --- |
| ★ 唐麗英《統計學(一) 基礎統計》16 講、《統計學(二) 進階統計》13 講 | `res-yt-stat-tang-1`、`res-yt-stat-tang-2`、`res-dcard-im-114-nocram-oral`（兩三週看完） |
| Lind《商用統計學》19e 中譯本 | `res-book-lind-stat-19e` |

　※ **讀舊心得要看年份**：`res-dcard-im-114-nocram-oral` 寫「去年十一月才知道台大今年加考統計」；`res-dcard-im-114-ds-exam` 也記到該年「MIS 多考歷年沒考過的統計題」。**113 以前的心得完全沒有統計準備段落**，別照抄那些人的科目時間分配。115 卷面實測統計佔 50 分（`res-dcard-im-115-stats`）。

### 2.4 英文(B)

- `res-dcard-im-114-nocram-oral`（台大正取）是裸考，只刷考古記單字；但補一句：心有餘力背 **GRE Mason 2000 或 TOEFL 單字**，「高中 7000 單跟多益單字會完全不夠用」。
- `res-dcard-im-113-admitted` 講得更強：「很多人考台大英文都用猜的，但我認為英文其實是**一個拿分的關鍵**……買 Mason GRE 的單字來背，你會很容易拿到相對高分。」（他英文 76／台大）
- 反方：`res-hackmd-im-108-oral`「英文這科的投資報酬率很低，加權是其他科目的 1/2」。
- 折衷做法：`res-hackmd-im-112-nocram` 每晚一篇 CNN／BBC 科技或經濟新聞——同時餵 MIS 時事庫。
- 台大英文不加權，**但政大有「任一科未達本組到考生前 80% 不錄取」的門檻**，兼報政大就不能整科放掉（`res-ptt-im-ten-schools`）。

---

## 三、自學真正的缺口：解答，不是教材

教材網路上到處都有，**台大圖書館只給題目不給解答**（`res-official-ntu-lib`），這才是自學者最硬的一關。庫內能找到的解答來源只有這幾個：

| 來源 | 說明 |
| --- | --- |
| `res-solutions-im-108` | 張逸老師版 **108 年五校計概試題＋解答**（台大／政大／中央／成大／中山），逐題標註題型。目前找到少數公開的解答來源 |
| 蝦皮那套計概筆記 | `res-dcard-im-112-ntu-nocram`：「想要解答的話，那本筆記是可以信任的，裡面的練習題都來自考古，總共似乎只有兩三個錯誤」 |
| LLM 產擬答 | `res-dcard-im-114-nocram-oral`：考古題截圖丟 GPT／Gemini／Claude 要擬答，**自己再重寫一次**；`res-dcard-im-113-admitted` 也把 ChatGPT 當概念整理工具，但強調「還是需要自己去查證」 |
| 讀書會 | `res-dcard-im-113-admitted` 專門寫了一節：找**少少幾個人**、心態是戰友不是對手；他吐槽加過太多讀書會「進去後都沒有人要講話，每個都只想當伸手牌」 |
| 只報單科題庫班 | `res-hackmd-im-108-oral`：「當初報名的動機單純只是想要有答案……其實蠻浪費錢的」（他只報計概題庫班，且 1 月才報，價格與 9 月相同） |
| 成大考古題 | `res-official-ncku-im`：題型與台大／政大高度相似，可當額外題庫 |

**兩個明確的地雷**：

1. `res-dcard-im-112-ntu-nocram`：「**請千萬不要買某補習班網站上賣的考古題解答**！裡面錯誤百出，大概每五題就有兩題是錯的。」
2. `res-medium-im-111-tools`：「如果有在網路上買或者收到補習班發的計概解答，一定要把自己覺得有問題的題目跟讀書會討論，**避免記成錯誤的答案**。」

---

## 四、MIS：庫內意見分歧最大的一科，兩派都要看

這科的說法在庫內是**對立**的，而且兩邊都上了台大。原樣並陳：

**A 派：自學難度最高**

- `res-dcard-im-112-ntu-nocram`（無補習正取台大）：「我讀了兩輪，成績還是慘不忍睹……完全不考慮補習的話，可以找有補習的同學組讀書會，刺探敵情。」
- `res-hackmd-im-112-nocram-ordinary`：「這科很難自學，雖然是最容易入門，但也是很難拿高分的科目。並且更多的是**不知道怎麼進步**。」（他因此只補了 MIS 這一科）

**B 派：想考台清交政反而不要補**

- `res-dcard-im-113-admitted`（全科補習、台大／清大／政大／交大全正取）：「補習班老師的教法**只適合想考中字輩的學生**……老師以管理學的方式教 MIS，但我更喜歡以技術的角度出發去解題。」他前期被老師的框架綁死很痛苦，後期「完全沒有在管老師的框架」，改用**在學期間解 case 的流程**作答，並指出「細細研究考古題後會發現**台政的考題完全不考傳統 MIS 的東西**，而是喜歡用案例的方式問你的看法」。
- `res-medium-im-111-zheng`：刻意不寫補習班的起承轉合（定義問題→發現→解法→衍生疑慮），改用精煉寫法，只答方法加一點衍生問題，理由是考場上要顧的是**精準度**不是筆速。

**兩派其實不衝突**：A 派說的是「沒有回饋就不知道怎麼進步」，B 派說的是「補習班的答題框架對台大不一定加分」。合起來的結論是——**要練的是產出與回饋機制，不是補習班的模板**。庫內可抄的具體練法有四種：

| 練法 | 出處 |
| --- | --- |
| 每天寫一篇時事申論、考前累積 30–40 篇並固定回頭複習，用電腦打字產出以專注在思考 | `res-medium-im-111-zheng` |
| 三遍讀法：①瀏覽整本 ②一邊看一邊把**考古考過的知識點註記在講義上** ③做成心智圖，只寫關鍵字但看到關鍵字要能說出 5W1H | `res-hackmd-im-108-oral` |
| 案例庫：背熟理論後每週做 2–3 次案例分析、找人討論，持續 2–3 個月；遇到不會的題目就讀一本專書補（例：平台經濟題去讀《平台革命》） | `res-tkb-nccu-113-case` |
| 三件套＝理論框架＋分析＋案例，大量用列點與表格；先建案例庫（foodpanda→平台經濟、共享單車→共享經濟） | `res-blog-im-mavis` |

　※ 分數期望值要先校準：`res-ptt-im-108-ntu` 的台大 MIS 只有 **25 分**仍正取（口試 87.14）；`res-dcard-im-113-admitted` 的台大管理概論 **40 分**、四校全正取；`res-dcard-im-114-nocram-oral` 的原話是「有些系所的考科拿個 30 分可能就已經是 PR 80 了（對，我就是在說台大的 MIS）」。**這科不是拿高分的科目，是不能崩的科目。**

---

## 五、六個月路線（現在起跑，對 2027 年 2 月筆試）

今天是 2026-08-13，距 116 筆試約六個月。庫內的時程樣本顯示這個長度可行，但**都伴隨全職或高強度**：

| 起跑點 | 每日時數 | 結果 | 出處 |
| --- | --- | --- | --- |
| 8 月（六個月） | 早 10 至晚 10、中間大休 | **台大資管正取**，無補習 | `res-dcard-im-114-nocram-oral` |
| 7 月離職（六個月） | 4→8 小時遞增 | 成／央／山備上，無補習 | `res-blog-im-113-nocram` |
| 9、10 月（四到五個月） | 分散在課餘 | 台／政／成資結組，無補習 | `res-dcard-im-113-nocram-tech` |
| 10 月中才認真 | 1.5→4→5→6 小時遞增 | **台大資管正取**，無補習 | `res-dcard-im-112-ntu-nocram` |
| 升大四暑假（八月底） | — | 台大＋成大**雙榜首**，非本科 | `res-get-im-110-top` |
| 在職 7–8 個月 | 4–6 小時 | 中字輩，作者建議「非必要不要在職準備」 | `res-pixnet-im-110-working` |
| 在職 | **不超過 4 小時** | 台／清／政／交全正取 | `res-dcard-im-113-admitted` |

最後一列值得單獨看：他刪掉 YPT，理由是「我認為沒有那麼多東西好讀的……**讀多久不是重點**，而是你有沒有抓到考試的重點」。與其他人每天 8 小時的紀錄放在一起看，說明時數不是變數，抓對範圍才是。

**六個月路線表**

| 月份 | 主線 | 副線 | 檢查點 |
| --- | --- | --- | --- |
| **8 月** | 作業系統（周志遠）＋計概主幹（于天立） | 先讀一點「怎麼讀書」的方法論；**先掃台大近 3 年考古**（看，不是寫） | 知道台大考什麼、不考什麼 |
| **9 月** | C++（孔令傑）＋網路（黃能富）＋資結起步 | 每天一篇英文科技新聞 | C++ 能手寫基本程式 |
| **10 月** | 資結主攻＋MIS 第一輪（Laudon 讀完） | 李宏毅 ML 穿插 | 兩本原文書讀完 |
| **11 月** | 統計（唐麗英兩套）＋深度學習補充 | **開始寫整份考古題並計時** | 統計能獨立算完一份考卷 |
| **12 月** | 全科複習＋考古訂正 | 資料庫（SQL 50）、資安快掃 | 台大考古寫過 3 年份 |
| **1 月** | 狂刷考古（台大 10 年、其他校 6 年） | MIS 計時申論、錯題本二刷 | 錯題本比新題目重要 |
| **2 月** | 筆試 | 考完立刻備口試，**不要等放榜** | — |

**自學者必須自己補上的五件事（補習班原本代勞的）：**

1. **考古題提早開**。`res-dcard-im-114-nocram-oral`：「不用覺得考古題很珍貴，**越早熟悉各校題型跟愛考的範圍越好**。」`res-dcard-im-113-nocram-tech` 開篇連寫三次「請先研究考古！」；`res-dcard-im-113-admitted`：「早點開始看考古題，看了才會對學校喜歡的方向比較有概念。」沒有補習班篩範圍，考古題就是你唯一的範圍表。
2. **考古題要計時、要重複**。`res-hackmd-im-108-oral`：印紙本（題目卷＋答案卷）模擬考試，先寫沒那麼想考的學校練筆；他台大考古寫了 **10 年份、每份三次**。
3. **每讀完一章就做題自測**。`res-dcard-im-114-nocram-oral` 的檢討：「我一開始讀得太快，沒有做題目確定自己到底有沒有懂，導致在資料結構跟演算法上一直重複看相同的內容，但要做題目時又寫不出來。」
4. **複習排程寫死**。`res-dcard-im-112-ntu-nocram` 的小複習／大複習：每天讀新進度前先複習昨天全部（20–30 分），**沒複習完不能讀新的**；`res-blog-im-113-nocram` 用遺忘曲線（每天／每週／每月三層），最後所有內容至少讀三遍。
5. **主動回想，不是重複看**。`res-blog-im-113-nocram`：「把問題寫下來，但**不要寫答案**，回答不出來就回去翻，翻第三次就會記住了。只有重複看的話腦袋不會累，有主動回想腦袋才會累。」`res-dcard-im-112-ntu-nocram` 則是對著空氣講，假裝在跟教授解釋——兼練口試。

**進度管理工具**（`res-medium-im-111-tools`）：Notion 管報名狀態與時事整理、**Excel 記錄各科讀書時間比例避免偏科**、iPad 寫考古。偏科這件事對自學者特別危險，因為沒有補習班的課表逼你輪流上不同科。

---

## 六、庫內心得共同標出的坑

| 坑 | 出處 | 教訓 |
| --- | --- | --- |
| **計概不能挑章節放掉** | `res-dcard-im-114-retake`、`res-medium-im-112-cross-7` | 台大以出得細著名（考過「OS 的 page 大部分多大」）；重考生的結論是「覺得冷門懶得準備的，考試就會遇到」 |
| **手寫題比重被低估** | `res-medium-im-108-failed`、`res-cram-im-113-get-huang`、`res-cram-im-proposition` | 「往年資結在計概佔比 30% 左右，今年提高到 50%」；近年約 40–50%，常考 Heap／Hash Table／BST 的 C++ 實作 |
| **選擇題答錯倒扣** | `res-ptt-im-108-ntu`、`res-cram-im-proposition` | 不能亂猜。刪掉兩個選項以上才值得猜，否則留空 |
| **計組與 OS 讀太淺** | `res-dcard-im-112-ntu-nocram` | 該年台大題型大變、考很多細節，只靠蝦皮筆記遠遠不夠 |
| **時間複雜度只會算短程式** | `res-hackmd-im-112-nocram-ordinary` | 「原本超級有把握的台大程式題，寫得超爛」 |
| **資料庫後段章節白讀** | `res-hackmd-im-112-nocram-ordinary`、`res-dcard-im-113-nocram-tech` | 交易處理、並行控制與回復「很少考，又超級容易忘，超虧」 |
| **紅黑樹刪除白讀** | `res-hackmd-im-112-nocram-ordinary` | 理解新增即可 |
| **只寫不訂正** | `res-blog-im-113-nocram` | 他總共只寫 5 年考古，但「**瘋狂重寫寫過的題目**」，錯題觀念全部記錄 |
| **英文名詞記成中文** | `res-dcard-im-113-nocram-tech` | 平常看中文書，考場遇到會寫的題目卻因名詞記錯而失分。台大 MIS 常態全英文命題（`res-hackmd-im-tung`） |
| **提早交卷與抄寫失誤** | `res-dcard-im-114-ds-central` | 自認簡單、檢查三遍提早交卷，結果該題要全對才給分而自己把 8 寫成 0 |
| **手寫程式的評分不只看跑不跑得出來** | `res-dcard-im-114-ds-three` | 自估 80 分以上、開 IDE 跑也正確，分數卻遠低於預期，推測是寫法不合閱卷者預期。作答要把思路與註解寫清楚 |
| **AI 讀成主科** | `res-medium-im-111-tools` | AI 題投報率不算高，要讀但別過度投入 |
| **不要迷信補習班模擬考** | `res-dcard-im-113-admitted` | 「計概題目老師不可能猜得到，MIS 又是很主觀給分的科目」 |

---

## 七、無補習者專屬的口試問題

台大口試佔總成績 40%、四關各四分鐘（完整題庫見 `2026-08-11-ntu-nccu-mis-exam-prep.md` 第四節）。這裡只補**與自學路線直接相關**的：

1. **「你是不是沒補習？」是真的會問**。`res-dcard-im-112-ntu-nocram` 生涯關被問「你是不是沒補習？還有考上其他什麼學校？」；`res-blog-im-ntu-oral-poc` 也記錄過「有沒有補習？補習對計概考試有沒有幫助？」。
2. **跨考＋自學＝修課紀錄會被追**。`res-dcard-im-114-nocram-oral` 的生涯關原題就是「相關修課紀錄太少要怎麼處理、為什麼想跨領域來資管」；`res-dcard-im-112-ntu-nocram` 的結論更硬：「跨考生如果沒有正式上過基礎課程（即程設、資結），在找教授時會比別人辛苦很多。」`res-medium-im-ntu-recommend-scores` 則有資管系教授的原話——推甄要修過六大必修且拿 A。
3. **自學者的補救牌是專案**。`res-dcard-im-113-admitted`：「網路上買一些 ML 的課做一些小專案……而且政大二階書審或台大口試都會問到研究計畫，你有專案經驗可以從裡面發想研究興趣。」他在生涯關就是用「Airflow+ML 自動化預測專案」順順講完四分鐘。

114 年無補習者實際考到的四關（`res-dcard-im-114-nocram-oral`）：數學關考機率計算、決策樹、期望值、貝氏定理；管理關「生成式 AI 在不同領域如何影響人類決策，提供一個具體的例子」；技術關「OSI 分七層的用意、簡述訊息傳送的過程、DNS 可以快速轉換 IP 位置跟網址的原因」。

**口試不要等放榜才準備**——台大 3/6 公告名單、3/11 交資料、3/13 口試，只有一週（`res-tkb-im-115-exam-changes` 另指出台大近年持續壓縮這段時間）。

---

## 八、取材與查證狀態

**本次逐篇讀過原文的 13 筆**（引述皆為原文用語）：

`res-dcard-im-114-nocram-oral`、`res-dcard-im-112-ntu-nocram`、`res-dcard-im-113-nocram-tech`、`res-dcard-im-113-admitted`、`res-hackmd-im-112-nocram`、`res-hackmd-im-112-nocram-ordinary`、`res-hackmd-im-108-oral`、`res-medium-im-111-nocram`、`res-medium-im-111-zheng`、`res-medium-im-111-cross-3`、`res-medium-im-111-tools`、`res-blog-im-113-nocram`、`res-blog-im-mavis`（部分）

**引用自 resources.json 既有摘要、本次未重讀原文**：`res-dcard-im-114-nocram`、`res-dcard-im-114-retake`、`res-dcard-im-114-ds-central`、`res-dcard-im-114-ds-three`、`res-dcard-im-114-ds-exam`、`res-dcard-im-115-cross`、`res-dcard-im-115-tech`、`res-dcard-im-115-stats`、`res-medium-im-108-failed`、`res-medium-im-112-cross-7`、`res-medium-im-ntu-recommend-scores`、`res-ptt-im-108-ntu`、`res-ptt-im-ten-schools`、`res-hackmd-im-tung`、`res-hackmd-im-114-oral-bank`、`res-blog-im-ntu-oral-poc`、`res-get-im-110-top`、`res-pixnet-im-110-working`、`res-tkb-im-112-top`、`res-tkb-nccu-113-case`、`res-cram-im-113-get-huang`、`res-cram-im-114-liu`、`res-cram-im-proposition`、`res-tkb-im-115-exam-changes`、`res-official-ncku-im`、`res-solutions-im-108`。這些摘要是既有工作彙整的二手轉述，若要當關鍵決策依據，建議回原文核對。

**教材與課程連結**：本次逐一開啟確認過標題、講數與版本——孔令傑 C++（15 講／150 部）、周志遠 OS（78 部，字幕版）、黃能富計網、杰哥資結（56）／演算法（73）／OS（152）、唐麗英統計一（16 講）／二（13 講）、李宏毅生成式 AI（30 部）、于天立計概（21 講）、Brookshear 13/e、Forouzan 4/e、蔡明志 5/e、Laudon 16/e 中譯、林東清八版、Lind 19e 中譯。

**與本 repo 的對照**：本次一併更新 `subjects-im.json` 四科的 `materials`（原本 MIS 那筆寫著「強烈建議上補習班」，與本文並陳的兩派意見不符）、`resources.json` 補進庫內缺的無補習心得與教材連結、`guides.json` 補六筆導引卡。

**尚未處理**：`study-plans.json` 只有一套八個月的通用節奏，沒有「六個月、不補習」版本；要把第五節做進 app，需要 `StudyPlan` 支援同一考試多套計畫（目前 `getStudyPlan` 以 `examId` 單筆對應）。

**待確認**：116 學年度簡章（2026 年 10 月底公告）出來前，考科名稱、統計佔比、口試計分公式一律沿用 115 的數字，不應視為已確認。
