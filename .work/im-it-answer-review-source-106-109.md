## q-pp-im-it-106-1
CURRENT: D
Which of the following design is better (although not the best) than the others?
(A) A single table containing all fields of data needed for the database.
(B) Two tables, one contains students' profiles (Student_ID, Student_Name, Student_Address), while the other contains all the other fields.
(C) Three tables, the 1st table contains students' profiles (Student_ID, Student_Name, Student_Address), the 2nd table contains Student_ID and the courses (Course_ID, Course_Name) they registered, the instructors (Instructor_ID, Instructor_Name), and grades, and the 3rd table contains the classroom information (Course_Name, Classroom, Course_Schedule).
(D) A table for students' profiles (Student_ID, Student_Name, Student_Address), a table for each course containing the registered students' names and their grades (i.e., Student_ID, Course_ID, GRADE), a table of instructors containing the faculty ID of each instructor, his name, and the courses s/he teaches (Instructor_ID, Instructor_Name, Course_ID), a table of classrooms containing the classrooms, the courses and time of the courses at each classroom (Classroom, Course_ID, Course_Schedule).
(E) A table containing (Student_ID, Student_Name), a table containing (Student_Name, Student_Address), a table for each course containing the registered students' names and their grades (Student_Name, Grade), a table for each instructor containing his ID, name and the courses s/he teaches (Instructor_ID, Instructor_Name, Course), a table for each classroom containing the courses and time of the courses using the classroom (Classroom, Course_Name, Course_Schedule).

[Context: Suppose we wish to build a campus database containing tables of records about student profiles, courses registered, and grades. Fields include: Student_ID, Student_Name, Student_Address, Course_ID, Course_Name, Instructor_ID, Instructor_Name, Classroom, Course_Schedule (e.g., Wed. 9~12AM), Grade. A good database design practice is to avoid too much data overlapping between tables.]
EXPLANATION: 選項D將資料庫分為四張表：學生基本資料表、選課與成績表（Student_ID, Course_ID, GRADE）、教師表（Instructor_ID, Instructor_Name, Course_ID）以及教室表（Classroom, Course_ID, Course_Schedule），符合第三正規化（3NF）的設計原則，各表有明確的主鍵且減少了資料重複。選項A將所有欄位放在同一張表中，造成大量資料冗餘，設計最差。選項B雖然拆出學生基本資料，但其餘所有欄位仍混在一張表中，仍有嚴重的正規化問題。選項C的第二張表混合了課程、教師與成績資訊，存在部分函數相依與遞移相依的問題。選項E以Student_Name（非唯一）作為多張表的關聯鍵，在實際應用中同名學生會導致資料錯亂，是最不恰當的設計。

## q-pp-im-it-106-2
CURRENT: B
Suppose we wish to have a table for each course containing the grade of each registered student. Which of the following design is better than the others? (A) The table contains just two fields: Student_Name, Grade. (B) The table contains just two fields: Student_ID, Grade. (C) The table contains three fields: Student_ID, Student_Name, Grade. (D) The table contains three fields: Student_Name, Instructor_ID, Grade. (E) The table contains four fields: Student_ID, Student_Name, Instructor_ID, Grade.
EXPLANATION: 此題設計的是每門課程的成績表，課程本身已由資料表隱含表示，因此只需記錄學生識別碼與成績。選項(B)僅包含 Student_ID 與 Grade 兩個欄位，Student_ID 作為主鍵可唯一識別學生，Grade 是需要記錄的事實，設計簡潔且符合正規化原則。選項(A)以 Student_Name 作為識別欄位，但姓名不具唯一性且可能重複，不適合作為主鍵。選項(C)(E)將 Student_Name 納入，造成遞移相依（Student_Name 依賴 Student_ID），違反第三正規化（3NF），產生資料冗餘。選項(D)(E)包含 Instructor_ID，但授課教師屬於課程資料，應存放於課程表而非成績表，放在此處違反資料庫設計原則。

## q-pp-im-it-106-3
CURRENT: A
Which of the following SQL command selects all the records in the "Customers" table whose "Country" field is "Taiwan" and "City" field is either "Taipei" or "Kaohsiung"?
(A) SELECT * FROM Customers WHERE Country='Taiwan' AND (City='Taipei' OR City='Kaohsiung');
(B) SELECT ALL FROM Customers WITH Country='Taiwan' AND (City='Taipei' OR City='Kaohsiung');
(C) SELECT * FROM Customers WHERE Country='Taiwan', City='Taipei' OR 'Kaohsiung';
(D) SELECT ALL FROM Customers AND Country='Taiwan' AND (City='Taipei' OR City='Kaohsiung')
(E) none of the above.
EXPLANATION: 此題考 SQL 的基本語法。選項 (A) 使用了正確的 SQL 語法：SELECT * 選取所有欄位，FROM 指定資料表，WHERE 加上條件，並以 AND 連接兩個條件，同時用括號將 OR 條件正確包覆，語法完全符合標準 SQL。選項 (B) 使用了不合法的 SELECT ALL 及 WITH 關鍵字，這在標準 SQL 中是錯誤的寫法。選項 (C) 使用逗號分隔條件且 OR 後面只寫 'Kaohsiung' 而缺少欄位名稱，語法不正確。選項 (D) 同樣使用不合法的 SELECT ALL，且缺少必要的 WHERE 關鍵字。因此唯一語法正確的答案是 (A)。

## q-pp-im-it-106-4
CURRENT: E
Which of the following about relational databases is wrong? (A) the model organizes data into one or more tables of columns and rows (B) a row in a table corresponds to a record of data (C) a primary key uniquely identifies each record in a table (D) a foreign key in one table corresponds to a primary key in another table (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: 此題詢問關於關聯式資料庫哪個敘述是錯誤的。選項(A)正確，關聯式資料庫確實以表格（欄與列）的形式組織資料。選項(B)正確，表格中的每一列（row）對應一筆資料記錄（record）。選項(C)正確，主鍵（primary key）確實能唯一識別表格中的每一筆記錄。選項(D)正確，外鍵（foreign key）在一個表格中對應到另一個表格的主鍵，用於建立表格間的關聯。由於(A)至(D)全部皆為正確的陳述，因此答案為(E)。

## q-pp-im-it-106-5
CURRENT: C
Which of the following about database normalization is wrong? (A) the process reduces data redundancy (B) the process improve data integrity (C) the 1st normal form ensures that each row in a table should be identified by primary key and no rows of data should have repeating group of column values (D) if a table satisfies 2nd normal form, then it must satisfy 1st normal form as well (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: 第一正規化（1NF）的定義要求每個欄位的值必須是不可再分割的原子值（atomic value），且不能有重複的群組欄位，但並未明確規定每一列必須由主鍵來識別。主鍵的要求是關聯式模型的一般原則，並非 1NF 本身的正式定義條件。選項 (C) 將「由主鍵識別每一列」列為 1NF 的要求，這是不正確的描述。相較之下，選項 (A)、(B)、(D) 均為資料庫正規化的正確陳述，其中 2NF 確實以滿足 1NF 為前提。

## q-pp-im-it-106-6
CURRENT: C
New applications, processes, products, or business models that aim at providing financial services by making use of software and modern technology: (A) Bank 3.0 (B) Bank 4.0 (C) Fintech (D) Digital Finance (E) Financial Revolution.
EXPLANATION: Fintech（金融科技）是指利用軟體與現代技術來提供金融服務的新型應用、流程、產品或商業模式。此詞由「Finance」與「Technology」合併而來，涵蓋行動支付、網路銀行、區塊鏈、P2P借貸等創新服務。Bank 3.0 與 Bank 4.0 雖也與數位金融有關，但它們特指銀行業務的演進階段，而非廣義的金融科技定義。Digital Finance 泛指數位化金融，Financial Revolution 則是非正式用語，兩者均不如 Fintech 精確對應題目描述。

## q-pp-im-it-106-7
CURRENT: C
Which of the following techniques plays a key role in AlphaGo that beat a 9-dan professional Go player in March 2016? (A) biomedical informatics (B) genetic algorithm (C) deep learning (D) expert system (E) cognitive learning.
EXPLANATION: AlphaGo 是 Google DeepMind 於 2016 年開發的圍棋 AI，其核心技術是深度學習（Deep Learning）。AlphaGo 使用深度卷積神經網路（Deep Convolutional Neural Networks）來評估棋盤局面與預測落子位置，結合蒙地卡羅樹搜尋（Monte Carlo Tree Search）來選擇最佳落子策略。基因演算法（Genetic Algorithm）、專家系統（Expert System）等傳統 AI 方法並非 AlphaGo 的關鍵技術。深度學習使 AlphaGo 能夠從大量棋譜中自我學習，最終擊敗世界頂尖的九段職業棋士李世乭。

## q-pp-im-it-106-8
CURRENT: E
Which of the following is not widely regarded as a characteristic of big data? (A) high volume (B) high velocity (C) high variety (D) potentially high value (E) all of the above are characteristics of big data.
EXPLANATION: 大數據的核心特徵通常以「3V」來描述：高容量（Volume）、高速度（Velocity）、高多樣性（Variety），這三項是學術與產業界廣泛認可的特性。「高價值（Value）」雖然後來被部分學者加入成為第4V，但並非最初被廣泛認定的核心特徵，因此選項D（potentially high value）並非所有人都視為大數據的標準特徵。選項E宣稱「以上皆為大數據特徵」，但由於Value並非普遍被視為核心特徵，使得E的說法並不完全正確，因此E是本題中「不被廣泛視為大數據特徵」的答案。

## q-pp-im-it-106-9
CURRENT: B
A technique for transferring multimedia so that media data can be constantly received by and presented to an end-user while being delivered by a provider: (A) multimedia authoring (B) streaming (C) live broadcasting (D) multicasting (E) real time media.
EXPLANATION: 串流（Streaming）是一種在傳輸過程中讓使用者能夠持續接收並即時呈現多媒體資料的技術，無需等待整個檔案下載完畢即可開始播放。多媒體製作（Multimedia Authoring）是指製作多媒體內容的工具或流程，與傳輸方式無關。直播（Live Broadcasting）雖然也是即時傳輸，但強調的是現場直播的概念，而非資料持續傳輸的技術本質。多播（Multicasting）是一種同時向多個接收者傳送資料的網路技術，並不特指邊接收邊播放的能力。因此，最符合題意「資料在傳送中即可持續接收與呈現」的技術是串流（B）。

## q-pp-im-it-106-10
CURRENT: C
Which of the following best describes economic and social inequality with regard to access to, use of, or impact of information and communication technologies (ICT)? (A) information asymmetry (B) information inequality (C) digital divide (D) knowledge gap (E) digital right.
EXPLANATION: 「數位落差」（digital divide）是資訊通訊技術（ICT）領域中專門用來描述因經濟與社會不平等所導致的科技近用差距的標準術語。它涵蓋了人們在取得、使用及受惠於ICT方面的不均等現象，包含城鄉差距、貧富差距及教育程度差異等面向。「資訊不對稱」（information asymmetry）主要是經濟學中描述交易雙方掌握資訊不對等的概念，範疇不同。「知識落差」（knowledge gap）雖相關，但較著重於知識獲取的差距，而非ICT近用的社會經濟不平等。因此，最能描述題目所述情境的選項為C。

## q-pp-im-it-106-11
CURRENT: C
Which of the following is wrong? (A) In an odd parity system the total number of bit '1' in a word, including the added parity bit, is always an odd number (B) If the word (including parity bit) is 0110 1011 1, then in an odd parity system we can absolutely be sure that the word has an error inside (C) if the word (including parity bit) is 0110 1001 0, then in an even parity system we can absolutely be sure that the word has no error inside (D) parity bit is used to detect errors (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: 此題問哪個敘述是錯誤的。選項 (C) 說在偶同位系統中，若字組（含同位位元）為 0110 1001 0，則可「絕對確定」沒有錯誤，這是錯誤的。雖然該字組中 1 的個數為 4（偶數），符合偶同位規則，但同位檢查只能偵測奇數個位元錯誤，若有偶數個位元（如 2 個）同時發生錯誤，同位仍然正確，因此無法「絕對確定」沒有錯誤。相較之下，選項 (A) 正確描述奇同位定義，選項 (B) 正確指出 6 個 1 在奇同位系統中確實是錯誤，選項 (D) 正確說明同位位元用於偵測錯誤。

## q-pp-im-it-106-12
CURRENT: C
When cache is full, some elements need to be removed to empty space for new elements. Which of the following strategies in general has better performance than the others? (A) remove the element which has been used the least number of times during its stay in the cache (B) remove the element which has been used the most number of times during its stay in the cache (C) remove the element which has not been used the longest time since it enters the cache (D) remove the element which stays in the cache the longest time (E) replace the element which stays in the cache the shortest time.
EXPLANATION: 此題考查快取置換策略（Cache Replacement Policy）的效能比較。選項C對應的是 LRU（Least Recently Used，最近最少使用）策略，即移除最久未被使用的元素。LRU 利用了程式的時間局部性（Temporal Locality）原理：最近被存取的資料在不久的將來很可能再次被存取，因此保留這些資料能有效降低快取未命中率。相較之下，FIFO（選項D）忽略了存取頻率與時間局部性，LFU（選項A）雖考慮使用次數但對新資料不友善，選項B移除最常用元素則完全違背快取設計邏輯，選項E移除待最短時間的元素同樣不合理。在一般工作負載下，LRU 是這幾個策略中公認效能最佳的快取置換演算法。

## q-pp-im-it-106-13
CURRENT: A
A type of firmware used to perform hardware initialization during the booting process of a computer: (A) BIOS (B) CMOS (C) ROM (D) kernel (E) DOS.
EXPLANATION: BIOS（Basic Input/Output System）是一種儲存在主機板晶片上的韌體，負責在電腦開機時執行硬體初始化，此過程稱為 POST（Power-On Self Test）。CMOS 是一種用來儲存 BIOS 設定值的記憶體晶片，本身並非韌體。ROM 是唯讀記憶體（記憶體類型），kernel 是作業系統核心，DOS 是磁碟作業系統，三者均不符合「用於開機時硬體初始化的韌體」定義。因此正確答案為 (A) BIOS。

## q-pp-im-it-106-14
CURRENT: B
An implementation of virtual memory usually divides a virtual address space into blocks of contiguous virtual memory addresses, referred to as _____, so that they can be swapped between real memory and external storage. (A) segments (B) pages (C) sectors (D) zones (E) none of the above.
EXPLANATION: 虛擬記憶體的實作通常將虛擬位址空間切割成固定大小的連續記憶體區塊，稱為「分頁」（pages），這些分頁可以在實體記憶體與外部儲存裝置（如磁碟）之間進行置換（swap）。分段（segments）雖然也是虛擬記憶體的一種切割方式，但其大小不固定，且題目描述的是「連續虛擬位址的區塊」用於置換，這正是分頁（paging）機制的核心特性。磁區（sectors）是磁碟的實體儲存單位，區域（zones）則是作業系統核心的記憶體管理分區，兩者皆非虛擬位址空間的切割單元。因此正確答案為 B（pages）。

## q-pp-im-it-106-15
CURRENT: C
Which of the following is not a primary concern of using RAID (redundant array of independent disks)? (A) improve fault tolerance (B) improve system performance (C) improve data security (D) increase storage capacity (E) all of the above are correct (choose this one only if none of the above can be chosen).
EXPLANATION: RAID（獨立磁碟冗餘陣列）的主要目的包括：提升容錯能力（如 RAID 1 鏡像、RAID 5 同位元）、改善系統效能（如 RAID 0 條帶化提升讀寫速度），以及增加儲存容量（多顆磁碟組合使用）。然而，資料安全性（data security）並非 RAID 的主要考量範疇，資料安全指的是加密、存取控制、防止未授權存取等機制，這些都不在 RAID 技術的設計目標之內。RAID 只能防護磁碟硬體故障導致的資料遺失，無法防範資料被竊取、惡意軟體攻擊或人為刪除等安全威脅。因此，「改善資料安全性」並非 RAID 的主要關注點，答案選 C。

## q-pp-im-it-106-16
CURRENT: C
Which of the following best describes Kickstarter.com? (A) a P2P lending site (B) a crowdsourcing site (C) a crowdfunding site (D) a microfunding site (E) a C2C e-commerce site.
EXPLANATION: Kickstarter.com 是全球最知名的群眾募資（crowdfunding）平台，讓創作者或創業者向大眾募集資金以實現專案。群眾募資的特點是向不特定的多數人籌集資金，每位支持者可以貢獻小額金錢換取回饋或產品。P2P lending（選項A）是借貸平台，crowdsourcing（選項B）是外包任務給大眾，microfunding（選項D）並非標準術語，C2C（選項E）是消費者對消費者的電商模式，皆與Kickstarter的商業模式不符。因此正確答案為 C。

## q-pp-im-it-106-17
CURRENT: B
Which of the following terms is commonly used to describe sites like Udacity, Coursera, and edX? (A) self-paced online courses (B) massive open online courses (C) major online open courses (D) self-learning open online courses (E) flipped open online courses.
EXPLANATION: Udacity、Coursera 和 edX 是著名的大規模開放式線上課程平台，業界標準術語為「Massive Open Online Courses」，縮寫為 MOOC。選項 (B) massive open online courses 正確描述了這類平台的三大特徵：對大量學習者開放（massive）、免費或低成本可取得（open）、透過網路提供（online）。選項 (A) self-paced online courses 強調的是自主學習進度，並非這類平台的專有名稱。選項 (C)(D)(E) 均為錯誤的術語組合，不符合業界通用定義。

## q-pp-im-it-106-18
CURRENT: E
Which of the following descriptions about Ethernet is wrong? (A) it is commonly used in local area networks (LANs) (B) it uses random backoff to resolve collisions (C) it is a bus based broadcast network (D) 10BASE-T and 100BASE-TX are commonly used cables for Ethernet networks (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: 此題考查乙太網路（Ethernet）的基本特性。選項A正確，乙太網路廣泛應用於區域網路（LAN）。選項B正確，乙太網路採用 CSMA/CD 協議，發生碰撞後使用隨機退避（random backoff，即指數退避）機制來解決碰撞問題。選項C正確，乙太網路在邏輯上是一種匯流排型廣播網路，所有節點共享同一傳輸媒介。選項D正確，10BASE-T（使用 Cat3 雙絞線）與 100BASE-TX（使用 Cat5 雙絞線）確實是乙太網路中常用的連接線纜。由於A、B、C、D四個選項皆為正確描述，本題答案選 E（以上皆正確）。

## q-pp-im-it-106-19
CURRENT: C
Which of the following about TCP/UDP port assignments is wrong? (A) HTTP uses port 80 (B) File Transfer Protocol (FTP) control uses port 21 (C) port numbers range from 0 to 65536 (D) port numbers 0~2048 are reserved for privileged services and designated as well-known ports (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: TCP/UDP 的連接埠號碼範圍是 0 到 65535，共 65536 個（2^16 個），而非 0 到 65536。因此選項 C 所述「port numbers range from 0 to 65536」是錯誤的，最大值應為 65535。補充說明：選項 D 也有瑕疵，因為 Well-Known Ports 的標準定義是 0~1023，而非 0~2048；0~2048 並非正式規範。選項 A（HTTP 使用 port 80）與選項 B（FTP 控制連線使用 port 21）均為正確的標準定義。在此題中，C 是最明確且無爭議的錯誤陳述。

## q-pp-im-it-106-20
CURRENT: E
Which of the following about the Open Systems Interconnection (OSI) reference model is wrong? (A) Layer 3 is Network Layer (B) Layer 5 is Session Layer (C) SMTP belongs to Layer 7 (D) TCP belongs to Layer 4 (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: 此題詢問OSI參考模型中哪個敘述是錯誤的。選項(A)第3層為網路層（Network Layer）正確；選項(B)第5層為會議層（Session Layer）正確；選項(C)SMTP屬於第7層應用層（Application Layer）正確；選項(D)TCP屬於第4層傳輸層（Transport Layer）正確。由於A、B、C、D四個選項均為正確敘述，找不到任何錯誤的選項，因此應選(E)「以上皆正確」。

## q-pp-im-it-106-21
CURRENT: C
Which of the following about object-oriented programming is wrong? (A) Java is an object-oriented programming language (B) C++ is an object-oriented programming language (C) code reuse is achieved mainly via polymorphism (D) the concept of "data encapsulation" is used to hide data from misuse (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: 在物件導向程式設計中，程式碼重用（code reuse）主要是透過「繼承（inheritance）」來實現，而非多型（polymorphism）。繼承允許子類別直接繼承並重用父類別的屬性與方法，避免重複撰寫相同程式碼。多型（polymorphism）的主要目的是讓不同類別的物件能以統一的介面被操作，強調的是行為的彈性與擴展性，而非直接的程式碼重用。因此選項 (C) 的說法有誤，其餘選項 (A)、(B)、(D) 皆為正確敘述。

## q-pp-im-it-106-22
CURRENT: C
Which of the following about operating systems is wrong? (A) OS X is used in Apple's desktops/laptops (B) Android is a mobile operating system based on the Linux kernel (C) Unix family are open source (D) currently Microsoft Windows dominates desktop operating systems (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: Unix 家族並非全部都是開放原始碼（open source）。Unix 最初由 AT&T 貝爾實驗室開發，屬於專有（proprietary）軟體，商業 Unix 系統如 AIX、HP-UX、Solaris 均為閉源商業產品。雖然有些類 Unix 系統（如 Linux）是開放原始碼，但 Linux 嚴格來說屬於 Unix-like，並非 Unix 家族本身。因此，說「Unix 家族都是開放原始碼」是錯誤的陳述。其他選項皆正確：OS X 用於 Apple 桌機與筆電、Android 基於 Linux 核心、Windows 目前主導桌面作業系統市場。

## q-pp-im-it-106-23
CURRENT: A
Which of the following about system development tools is wrong? (A) a class diagram is a visual representation of a project schedule such as the project status and the length of an activity and the time spent on completing a task. (B) a decision tree is a graph that uses a branching method to illustrate every possible outcome of a decision (C) an entity-relationship diagram (ERD) is a graphical representation of an information system that shows the relationship between people, objects, places, concepts or events within that system (D) a flowchart is a type of diagram that represents an algorithm, workflow or process, showing the steps as boxes of various kinds, and their order by connecting them with arrows (E) All of the above are correct (choose this only if none of the above can be chosen.)
EXPLANATION: 選項(A)所描述的「視覺化呈現專案排程、活動長度與完成時間」，實際上是甘特圖（Gantt Chart）的定義，而非類別圖（Class Diagram）。類別圖是物件導向分析與設計中用來描述系統中類別的屬性、方法以及類別之間關係的靜態結構圖。選項(B)決策樹（Decision Tree）以分支方式呈現決策的各種可能結果，描述正確。選項(C)實體關係圖（ERD）以圖形化方式呈現資訊系統中人、物件、地點、概念或事件之間的關係，描述正確。選項(D)流程圖（Flowchart）以不同形狀的方框代表演算法或流程中的步驟，並以箭頭表示順序，描述正確。因此，描述錯誤的是選項(A)。

## q-pp-im-it-106-24
CURRENT: D
Which of the following technology descriptions is wrong? (A) 悠遊卡 (Easy Card) uses NFC technology (B) RFID can be used in supply chain management to track products (C) animal tracking chips typically use RFID (D) currently our ETC (Electronic Toll Collection) (Taiwan) uses LTE technology to track cars (E) All of the above are correct (choose this only if none of the above can be chosen.)
EXPLANATION: 台灣的 ETC（電子收費系統）並非使用 LTE 技術，而是採用 DSRC（專用短程通訊，Dedicated Short-Range Communications）微波技術，工作頻率為 5.8 GHz。選項 (A) 悠遊卡確實使用 NFC（近場通訊）技術，屬於正確描述。選項 (B) RFID 廣泛應用於供應鏈管理以追蹤貨物，屬於正確描述。選項 (C) 動物追蹤晶片通常使用被動式 RFID 技術，同樣為正確描述。因此，描述錯誤的選項為 (D)。

## q-pp-im-it-107-1
CURRENT: B
Which of the following technology is not used in Amazon Echo or Google Home? (A) speech recognition (B) image recognition (C) natural language processing (D) control of room devices (E) speech synthesis.
EXPLANATION: Amazon Echo 與 Google Home 是以語音為核心的智慧音箱，會使用語音辨識、自然語言處理、語音合成，也能控制室內裝置（control of room devices）。影像辨識需要視覺輸入，並非題述裝置的核心技術，因此答案為 (B)。

## q-pp-im-it-107-2
CURRENT: A
Which of the following is wrong about object-oriented databases? (A) object-oriented databases are the most widely used database model today (B) object databases store objects rather than data such as integers, strings or real numbers (C) objects basically consist of attributes and methods (D) objects contain both executable code and data (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: 此題問哪個關於物件導向資料庫的敘述是「錯誤的」。選項 (A) 宣稱物件導向資料庫是當今最廣泛使用的資料庫模型，這是錯誤的，因為關聯式資料庫（如 MySQL、PostgreSQL、Oracle）才是目前業界最普遍採用的資料庫模型。選項 (B) 正確描述物件導向資料庫儲存物件而非單純的整數、字串等基本資料型態。選項 (C) 正確指出物件基本上由屬性（attributes）和方法（methods）所組成。選項 (D) 也正確說明物件同時包含可執行的程式碼（方法）與資料，體現物件導向的封裝特性。因此，唯一錯誤的敘述為 (A)。

## q-pp-im-it-107-3
CURRENT: C
Which of the following is wrong about relational databases? (A) relational databases store data in tables (B) tables consist of rows and columns (C) all table columns depend on a primary key to identify the column (D) a table corresponds to a relation (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: 選項 C 是錯誤的陳述。在關聯式資料庫中，主鍵（Primary Key）的作用是唯一識別資料表中的每一筆「列（row）」，即每一筆記錄，而非用來識別「欄（column）」。欄位（column）是由欄位名稱（attribute name）來識別的，與主鍵無關。其餘選項均正確：關聯式資料庫確實以資料表儲存資料（A）、資料表由列與欄組成（B）、一張資料表對應一個關係（relation）（D）。因此答案為 C。

## q-pp-im-it-107-4
CURRENT: C
Which of the following SQL commands returns the number of countries of the records in the "Customers" table (see Table 1)?

(A) SELECT NUMBER (*) FROM Customers;
(B) SELECT COUNT (ALL country) FROM Customers;
(C) SELECT COUNT (DISTINCT country) FROM Customers;
(D) SELECT NUMBER (ALL country) FROM Customers;
(E) SELECT NUMBER (DISTINCT * country) FROM Customers;
EXPLANATION: 題目要求計算 Customers 表中不重複國家的數量。COUNT(DISTINCT country) 會先去除重複的 country 值再計數，因此 (C) 正確。NUMBER() 不是標準 SQL 聚合函數，所以 (A)、(D)、(E) 不正確；COUNT(ALL country) 則會計算所有非 NULL 值而包含重複國家。

## q-pp-im-it-107-5
CURRENT: C
Which of the following SQL commands lists the number of customers in each country from the "Customers" table (see Table 1)?

(A) SELECT NUMBER (id), country FROM Customers GROUP BY country;
(B) SELECT NUMBER (id), country FROM Customers ORDER BY country;
(C) SELECT COUNT (id), country FROM Customers GROUP BY country;
(D) SELECT COUNT (id), country FROM Customers ASSEMBLY BY country;
(E) none of the above.
EXPLANATION: 此題考 SQL 聚合函數與分群語法。要統計每個國家的顧客數量，需使用 COUNT() 聚合函數搭配 GROUP BY 子句，才能依國家分組並計算各組筆數。選項 A 與 B 使用 NUMBER() 並非標準 SQL 聚合函數，故不正確。選項 B 使用 ORDER BY 只能排序資料，無法分組統計。選項 D 的 ASSEMBLY BY 並非有效的 SQL 子句。只有選項 C 使用 COUNT(id) 搭配 GROUP BY country，符合標準 SQL 語法，能正確列出每個國家的顧客數量。

## q-pp-im-it-107-6
CURRENT: B
Which of the following types of databases has been optimized for data warehousing and OLAP (online analytical processing) for complex analytical and ad hoc queries with a rapid execution time? (A) object-oriented databases (B) multidimensional databases (C) crossed relational databases (D) relational object-oriented databases (E) distributed databases.
EXPLANATION: 多維度資料庫（Multi-dimensional databases）是專為資料倉儲（Data Warehousing）和線上分析處理（OLAP）所設計的資料庫類型。它將資料以多個維度（dimensions）組織成「資料立方體（data cube）」結構，使複雜的分析查詢（如切片、切丁、鑽取）能夠快速執行。物件導向資料庫（A）主要針對物件儲存，關聯式物件導向資料庫（D）是混合型，分散式資料庫（E）強調分散部署，這些都不是專為 OLAP 分析而最佳化的。因此，最適合資料倉儲與 OLAP 複雜分析查詢的資料庫類型是多維度資料庫（B）。

## q-pp-im-it-107-7
CURRENT: B
In database terminology, a read of uncommitted data is referred to as a (A) phantom read (B) dirty read (C) non-repeatable read (D) lost update (E) none of the above.
EXPLANATION: 讀取未提交資料（read of uncommitted data）在資料庫術語中稱為「髒讀」（dirty read）。髒讀發生在某一交易讀取了另一個尚未提交的交易所寫入的資料，若該交易最終被回滾（rollback），則讀到的資料從未正式存在過。幻讀（phantom read）是指同一查詢兩次執行之間出現了新的資料列；不可重複讀（non-repeatable read）是指同一列資料兩次讀取結果不同；遺失更新（lost update）是指兩個交易互相覆蓋彼此的修改。因此正確答案為 (B) dirty read。

## q-pp-im-it-107-8
CURRENT: E
Which of the following about Open Systems Interconnection (OSI) reference model is wrong? (A) Layer 3 is Network Layer (B) Layer 6 is Presentation (C) IP belongs to Layer 3 (D) UDP belongs to Layer 4 (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: OSI 模型共有七層，第三層為網路層（Network Layer），第六層為表示層（Presentation Layer），這兩項描述均正確。IP 協定運作於第三層網路層，負責封包的定址與路由；UDP 協定運作於第四層傳輸層（Transport Layer），負責端點間的資料傳輸，這兩項也均正確。由於選項 A、B、C、D 全部都是正確的描述，沒有任何一項是錯誤的，因此應選 E（以上皆正確）。

## q-pp-im-it-107-9
CURRENT: A
Which of the following is a computer network authentication protocol that works on the basis of tickets to allow nodes communicating over a non-secure network to prove their identity to one another in a secure manner? (A) Kerkeros (B) Dynamic Host Configuration Protocol (C) Secure Remote Password protocol (SRP) (D) Internet Key Exchange (E) none of the above.
EXPLANATION: Kerberos 是一種基於票券（ticket）的網路身份驗證協定，允許在不安全網路上通訊的節點透過可信任的第三方（金鑰分發中心，KDC）相互驗證身份。DHCP（動態主機配置協定）用於自動分配 IP 位址，與身份驗證無關。SRP（安全遠端密碼協定）是基於密碼的驗證協定，但不使用票券機制。IKE（網際網路金鑰交換）主要用於 IPsec 的金鑰協商，並非票券式身份驗證協定。因此正確答案為 (A) Kerberos。

## q-pp-im-it-107-10
CURRENT: D
Which of the following is relatively not a main concern of the HTTPS protocol? (A) authentication of the accessed website (B) protection of communication privacy (C) protection of man-in-the-middle attacks (D) fault tolerance (E) protection of tampering of the communication.
EXPLANATION: HTTPS 透過 TLS 提供伺服器身分驗證、通訊機密性與完整性，因而也可防範中間人攻擊與通訊遭竄改。容錯性（fault tolerance）屬於系統可靠性與可用性設計，不是 HTTPS 協定的主要關注，因此原卷答案為 (D)。

## q-pp-im-it-107-11
CURRENT: A
Which of the following about digital certificate is wrong? (A) the "Serial Number" field in a digital certificate is used to track revocation information (B) the "Issuer" field specifies the entity that verified the information and signed the certificate (C) it needs to contain the certificate owner's public key (D) X.509 is a standard that defines the format of public key certificates (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: 數位憑證中的「序號（Serial Number）」欄位的主要用途是唯一識別由某個憑證頒發機構（CA）所簽發的特定憑證，而非用於追蹤撤銷資訊。憑證的撤銷是透過憑證撤銷清單（CRL）或線上憑證狀態協定（OCSP）來管理的，序號只是在 CRL 中被引用以指明哪張憑證被撤銷，但本身並非「用來追蹤撤銷資訊」的欄位。其餘選項皆正確：(B) Issuer 欄位確實指定驗證並簽署憑證的實體；(C) 數位憑證至少需包含公開金鑰；(D) X.509 確為定義公開金鑰憑證格式的標準。因此選項 (A) 的描述有誤，是本題答案。

## q-pp-im-it-107-12
CURRENT: E
Which of the following about Single Sign-On (SSO) is wrong? (A) it reduces password fatigue from different user name and password combinations (B) it reduces time spent re-entering passwords for the same identity (C) log-in with Facebook account is an example of SSO (D) log-in with Google account is an example of SSO (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: SSO 可減少使用者管理多組帳號密碼的負擔與重複輸入密碼的時間；使用 Facebook 或 Google 帳號登入第三方服務都是聯合身分驗證／SSO 的常見例子。因此 (A) 至 (D) 皆正確，題目問錯誤敘述時應選 (E)。

## q-pp-im-it-107-13
CURRENT: C
Which of the following enables users to send and receive data across shared or public networks as if their computing devices were directly connected to the private network? (A) Transport Layer Security (B) Secure Sockets Layer (C) Virtual Private Network (D) Network Address Translation (E) none of the above.
EXPLANATION: VPN（虛擬私人網路）允許使用者透過公共網路（如網際網路）建立加密的隧道連線，使其裝置彷彿直接連接到私有網路中，從而安全地存取內部網路資源與應用程式。TLS（傳輸層安全協議）和 SSL（安全通訊端層）主要用於加密資料傳輸，並非用於模擬直接連接私有網路的機制。NAT（網路位址轉換）是將私有 IP 位址轉換為公開 IP 的技術，與此題描述的功能不符。因此，最符合題意「讓使用者彷彿直接連接私有網路來存取網路應用程式」的技術是 VPN。

## q-pp-im-it-107-14
CURRENT: E
Which of the following is not a file system? (A) Hierarchical File System (HFS) (B) New Technology File System (NTFS) (C) Extended File Allocation Table (exFAT) (D) third extended filesystem (ext3) (E) Microsoft Disk Operating System (MS-DOS).
EXPLANATION: MS-DOS（Microsoft Disk Operating System）是一種磁碟作業系統，而非檔案系統。HFS（階層式檔案系統）是 Apple 所開發的檔案系統；NTFS（新技術檔案系統）是 Windows 所使用的檔案系統；exFAT（延伸檔案配置表）是專為快閃記憶體設計的檔案系統；ext3（第三代延伸檔案系統）則是 Linux 常用的檔案系統。MS-DOS 本身是一套完整的作業系統，其所使用的檔案系統為 FAT（File Allocation Table），因此 MS-DOS 本身不屬於檔案系統的範疇。

## q-pp-im-it-107-15
CURRENT: B
Which of the following best describes a specialized hardware-dependent computer program which is also operating system specific that enables another program to interact transparently with a hardware device? (A) firmware (B) device driver (C) application programming interface (D) hardware platform interface (E) intelligent platform management interface.
EXPLANATION: 裝置驅動程式（device driver）是一種專門針對特定硬體設計、且依賴作業系統的程式，它作為硬體與上層應用程式之間的橋樑，使應用程式能夠透明地（transparently）與硬體裝置互動，無需了解硬體底層細節。韌體（firmware）雖然也與硬體緊密相關，但它是燒錄在硬體內部的程式，而非作業系統層面的軟體。API（應用程式介面）是程式間溝通的抽象介面，並非專指硬體互動的驅動程式。因此，最符合題目描述「與硬體相依、作業系統特定，且讓程式透明與硬體互動」的答案是裝置驅動程式（B）。

## q-pp-im-it-107-16
CURRENT: E
Which of the following is wrong? (A) the primary goal of CISC (Complex Instruction Set Computer) approach is to complete a task in as few lines of assembly code as possible (B) the RISC (Reduced Instruction Set Computer) approach is designed to execute computing tasks with the simplest instructions in the shortest amount of time possible (C) Intel x86 architecture is typically considered as a CISC approach (D) ARM architecture is typically considered as a RISC approach (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: 本題詢問哪個敘述是錯的。選項(A)正確：CISC的設計目標之一確實是以盡可能少的組合語言指令完成任務，透過複雜指令減少程式碼行數。選項(B)正確：RISC的設計理念是以最簡單的指令集在最短時間內執行運算，每條指令盡量在單一時脈週期內完成。選項(C)正確：Intel x86架構是CISC的典型代表，具有大量複雜指令。選項(D)正確：ARM架構是RISC的典型代表，廣泛應用於行動裝置等領域。由於(A)到(D)四個選項均為正確敘述，因此應選(E)「以上皆正確」。

## q-pp-im-it-107-17
CURRENT: C
Which of the following refers to the act of creating a virtual version of something, including virtual computer hardware platforms, storage devices, and computer network resources? (A) virtual reality (B) augmented reality (C) virtualization (D) hypervisor (E) none of the above.
EXPLANATION: 建立電腦硬體平台、儲存裝置與網路資源之虛擬版本的行為稱為虛擬化（virtualization），所以原卷答案為 (C)。Hypervisor 是實作與管理虛擬化的軟體層，不是該行為本身。

## q-pp-im-it-107-18
CURRENT: E
Which of the following about Bitcoin is wrong? (A) "mining" is a process to use a user's computing power to verify and record payments in the system (B) currently, new coins are created through the process of "mining" (C) there is no central administrator involved in the issue of new coins (D) the money sender and receiver do not need to know each other (other than a meaningless number) in money transfer (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: 此題詢問關於比特幣哪個敘述是錯誤的。選項(A)正確：「挖礦」確實是利用使用者的運算能力來驗證並記錄交易的過程。選項(B)正確：目前新的比特幣確實是透過挖礦過程產生，礦工成功產生新區塊後可獲得區塊獎勵（新鑄造的比特幣）。選項(C)正確：比特幣是去中心化系統，沒有任何中央管理者負責發行新幣。選項(D)正確：比特幣轉帳時，收付雙方只需知道對方的地址（一串無意義的雜湊字串），不需要知道對方的真實身份。由於(A)至(D)皆為正確敘述，沒有任何一項是錯誤的，故應選(E)。

## q-pp-im-it-107-19
CURRENT: B
Which of the following about the Blockchain technology used in Bitcoin is wrong? (A) it is a continuously growing list of "blocks" recording transaction history of the Bitcoin system (B) the blocks in a blockchain can be distributed to different peers so that no peer is required to maintain the complete list of the blocks in the system (C) all transactions in the blocks are kept anonymous and encrypted (D) blockchains are inherently resistant to modification of the data that have been recorded into blocks (E) all of the above are correct (choose this only if none of the above can be chosen).
EXPLANATION: 依此題採用的單選答案，(B) 錯在聲稱區塊可分散到不同節點，因而任何節點都不必維護完整區塊清單；典型比特幣完整節點會保存並驗證完整區塊鏈。需注意原卷 (C) 的『交易皆保持匿名且加密』也不嚴謹：比特幣交易為假名制且交易資料公開可查，並非內容全部加密。此題原卷本身可能具有多個可爭議選項，答案沿用既有 (B)，但解析必須揭露歧義。

## q-pp-im-it-107-20
CURRENT: E
Which of the following is correct about the CIA Triad of information security model? (A) "C" refers to Control (B) "C" refers to Cryptography (C) "I" refers to Identification (D) "A" refers to Anonymous (E) "A" refers to Availability.
EXPLANATION: CIA 三元組代表 Confidentiality（機密性）、Integrity（完整性）與 Availability（可用性）。因此只有 (E)『A refers to Availability』正確；原卷 (D) 的字樣是 Anonymous，而非題庫原先誤植的 Anonymouse。

## q-pp-im-it-107-21
CURRENT: C
Which of the following is not a symmetric encryption mechanism? (A) DES (B) IDEA (C) RSA (D) Caesar cipher (E) Advanced Encryption Standard (AES).
EXPLANATION: RSA 是非對稱加密演算法（公開金鑰密碼學），使用一對公鑰與私鑰進行加密與解密，因此它不是對稱加密機制。DES（資料加密標準）、IDEA（國際資料加密演算法）以及 AES（進階加密標準）都是對稱加密演算法，使用相同的金鑰進行加解密。凱薩密碼（Caesar cipher）是一種古典的對稱替換式加密方法，同樣屬於對稱加密。因此，選項中唯一不是對稱加密機制的是 RSA（選項 C）。

## q-pp-im-it-107-22
CURRENT: B
With the advent of Internet of Things (IoT), which of the following types of security attacks become even more challenging to defend than the others? (A) social engineering (B) Distributed Denial of Service (DDoS) (C) Phishing (D) SQL injection (E) Session Hijacking.
EXPLANATION: 物聯網（IoT）的興起使得網際網路上連接的裝置數量急劇增加，這些裝置往往安全防護能力薄弱，容易被攻擊者入侵並組成龐大的殭屍網路（botnet）。分散式阻斷服務攻擊（DDoS）正是利用大量受控裝置同時向目標發送請求，IoT 裝置的爆炸性成長讓可被徵用的攻擊節點數量倍增，使 DDoS 攻擊規模更大、更難防禦。相較之下，社交工程、網路釣魚（Phishing）、SQL 注入和 Session 劫持等攻擊方式主要針對人員行為或應用程式漏洞，其威脅程度並未因 IoT 裝置增加而顯著提升。因此，IoT 時代最具挑戰性的防禦威脅是 DDoS 攻擊。

## q-pp-im-it-107-23
CURRENT: D
Which of the following is the best-known standard providing requirements for an information security management system (ISMS)? (A) ISO 9001 (B) ISO 14001 (C) ISO 26000 (D) ISO/IEC 27001 (E) ISO 31000.
EXPLANATION: ISO/IEC 27001 是國際上最廣為人知的資訊安全管理系統（ISMS）標準，由 ISO 與 IEC 聯合發布，專門規範組織建立、實施、維護與持續改善 ISMS 的要求。ISO 9001 是品質管理系統標準，ISO 14001 是環境管理系統標準，ISO 26000 是企業社會責任指引，ISO 31000 則是風險管理框架標準，均與資訊安全管理無直接關聯。因此，符合題目「資訊安全管理系統的最知名標準」的答案為 ISO/IEC 27001，即選項 D。

## q-pp-im-it-107-24
CURRENT: D
Which of the following is correct about the ACID Database Properties? (A) "A" refers to Anonymity (B) "C" refers to Continuity (C) "I" refers to Integrity (D) "D" refers to Durability (E) none of the above is correct.
EXPLANATION: ACID 是資料庫交易的四大特性，分別代表：A（Atomicity，原子性）、C（Consistency，一致性）、I（Isolation，隔離性）、D（Durability，持久性）。選項 A 將 A 解釋為 Anonymity（匿名性）是錯誤的，正確應為 Atomicity。選項 B 將 C 解釋為 Continuity（連續性）是錯誤的，正確應為 Consistency。選項 C 將 I 解釋為 Integrity（完整性）是錯誤的，正確應為 Isolation。只有選項 D 正確描述了 D 代表 Durability（持久性），意指交易一旦提交後，其結果即使系統故障也能永久保存。

## q-pp-im-it-108-1
CURRENT: B
Which of the following is not an image file format? (A) JPEG (B) MPEG (C) GIF (D) BMP (E) all of the above are image file formats.
EXPLANATION: MPEG（Moving Picture Experts Group）是一種用於視訊和音訊壓縮的格式，並非圖像檔案格式。JPEG（Joint Photographic Experts Group）是常見的靜態圖像壓縮格式，適合儲存照片。GIF（Graphics Interchange Format）是支援動畫與透明背景的圖像格式，BMP（Bitmap）則是 Windows 系統的標準點陣圖像格式。因此，MPEG 是唯一不屬於圖像檔案格式的選項。

## q-pp-im-it-108-2
CURRENT: B
Which of the following refers to a small piece of data sent from a website and stored on the user's computer by the user's web browser while the user is browsing so as to remember stateful information? (A) proxy (B) cookie (C) etag (D) http hash (E) cache.
EXPLANATION: Cookie 是由網站伺服器傳送給使用者瀏覽器，並儲存在使用者電腦上的一小段資料，用來記住使用者的狀態資訊（如登入狀態、購物車內容等）。Proxy 是代理伺服器，負責轉發網路請求，與狀態儲存無關。ETag 是 HTTP 快取機制中的實體標籤，用來驗證資源是否已更新，並非用於狀態記憶。Cache 是瀏覽器或伺服器端的暫存機制，目的是加速資源載入，而非記錄用戶狀態。因此，符合題目描述「儲存在使用者電腦上以記住狀態資訊的小型資料」的正確答案為 Cookie（B）。

## q-pp-im-it-108-3
CURRENT: D
How many distinct Internet addresses can IPv6 facilitate? (A) 2^32 (B) 2^64 (C) 2^96 (D) 2^128 (E) 2^256
EXPLANATION: IPv6 使用 128 位元（bit）來表示一個 IP 位址，因此總共可以提供 2^128 個不同的網際網路位址。相比之下，IPv4 僅使用 32 位元，只能提供 2^32 個位址，這也是 IPv4 位址耗盡、需要 IPv6 的主要原因。2^128 是一個極為龐大的數字（約 3.4 × 10^38），足以為地球上每個裝置乃至每個原子分配唯一位址。因此本題正確答案為 (D) 2^128。

## q-pp-im-it-108-4
CURRENT: A
Which of the following (suite of) communication protocols are the foundation protocols used to interconnect network devices on the Internet? (A) TCP/IP (B) UDP/TCP (C) HTTP (D) HTTP/HTTPS (E) DNS.
EXPLANATION: TCP/IP（傳輸控制協定/網際網路協定）是網際網路的核心基礎協定組合，負責網路設備之間的互聯與資料傳輸。IP 協定負責封包的定址與路由，確保資料能從來源端送達目的端；TCP 則在 IP 之上提供可靠的連線導向傳輸服務。UDP/TCP（選項 B）並非一個標準協定套件名稱，且缺少網路層的 IP 協定。HTTP 與 HTTPS（選項 C、D）是應用層協定，建立在 TCP/IP 之上，並非底層互聯基礎。DNS（選項 E）只是網域名稱解析服務，同樣是應用層服務，不構成網際網路互聯的基礎協定組合。

## q-pp-im-it-108-5
CURRENT: E
Which of the following is typically not a task of an operating system? (A) CPU scheduling (B) storage management (C) memory allocation (D) I/O management (E) all of the above are common tasks of an operating system.
EXPLANATION: 作業系統（Operating System）的核心職責涵蓋了多種資源管理功能。CPU 排程（CPU scheduling）負責決定哪個行程可以使用處理器，是作業系統的基本任務之一。儲存管理（storage management）和記憶體配置（memory allocation）分別負責管理磁碟空間與主記憶體的使用，同樣屬於作業系統的重要功能。I/O 管理（I/O management）則負責協調輸入輸出裝置與系統之間的溝通。由於以上所有選項（A、B、C、D）都是作業系統的典型任務，因此答案為（E）——以上皆為作業系統的常見任務，沒有任何一項「不是」作業系統的工作。

## q-pp-im-it-108-6
CURRENT: E
Which of the following is wrong? (A) Linux is open source (B) Linux is Unix-like (C) Android is based on Linux (D) Android is open source (E) all of the above are correct (choose this one only if none of the above can be chosen).
EXPLANATION: 本題問哪一個敘述是錯誤的。選項(A) Linux 是開源軟體，正確；選項(B) Linux 是類 Unix 系統（Unix-like），正確；選項(C) Android 是基於 Linux 核心開發的，正確；選項(D) Android 以 AOSP（Android Open Source Project）形式發布，屬於開源軟體，正確。由於 A、B、C、D 四個選項的敘述均正確，沒有任何一個是錯誤的，因此依題目指示應選 (E)「以上皆正確」。

## q-pp-im-it-108-7
CURRENT: C
Which of the following technologies is best used for tracking objects? (A) smart card (B) beacon (C) RFID (D) NFC (E) IoT.
EXPLANATION: RFID（無線射頻識別）是專門為追蹤物品而設計的技術，廣泛應用於供應鏈管理、倉儲盤點、零售庫存及物流追蹤等場景。RFID 標籤無需電池（被動式），可在數公尺範圍內無接觸讀取，且不需要視線對準，非常適合大量物品的自動識別與追蹤。Smart card 主要用於身份識別與門禁控制；Beacon 使用藍牙低功耗技術進行室內定位，主要追蹤人員位置而非一般物品；NFC 通訊距離極短（數公分），適合行動支付與資料傳輸，不適合大範圍物品追蹤；IoT 是一個廣泛的生態系統概念，並非特定的追蹤技術。因此，最適合用於追蹤物品的技術是 RFID。

## q-pp-im-it-108-8
CURRENT: D
Which of the following technologies is seldom used in autonomous cars to perceive their surroundings? (A) Lidar (B) radar (C) computer vision (D) GPS (E) all of the above are commonly used technologies.
EXPLANATION: 自動駕駛汽車感知周圍環境主要依賴光達（Lidar）、雷達（Radar）和電腦視覺（Computer Vision）等技術，這些都是直接用來偵測障礙物、行人、車道線等周遭環境資訊的感知技術。GPS（全球定位系統）主要功能是提供車輛的地理位置與導航路線，並非用來感知周圍環境，因此在「感知周圍環境」這一用途上，GPS 較少被使用。相較於其他三種技術能即時感測周遭物體，GPS 無法提供環境中障礙物的距離、形狀或動態等資訊。因此，在自動駕駛車感知周遭環境的應用中，GPS 是最少被使用的技術，答案為 D。

## q-pp-im-it-108-9
CURRENT: D
Which of the following is an EU regulation on data protection and privacy for all individuals within the EU that replaces the 1995 EU Data Protection Directive and goes into force in May 2018? (A) International Safe Harbor Privacy Principles (B) Digital Millennium Copyright Act (DMCA) (C) Digital Transition Content Security Act (D) General Data Protection Regulation (E) none of the above.
EXPLANATION: GDPR（General Data Protection Regulation，一般資料保護規則）是歐盟於2018年5月正式生效的資料保護法規，取代了1995年的歐盟資料保護指令（EU Data Protection Directive）。GDPR適用於所有在歐盟境內的個人資料處理活動，賦予個人更強的資料控制權，包括被遺忘權、資料可攜權等。選項A的「國際安全港隱私原則」是美歐之間的舊框架，已被廢除；選項B的DMCA是美國著作權相關法律；選項C的Digital Transition Content Security Act與資料保護無關。因此正確答案為D。

## q-pp-im-it-108-10
CURRENT: E
Which of the following is not considered as a specific attribute that defines big data? (A) volume (B) velocity (C) variety (D) veracity (E) all of the above are specific attributes that define big data.
EXPLANATION: 大數據（Big Data）的定義特徵通常以多個「V」來描述。Volume（資料量）指大數據的巨大規模；Velocity（速度）指資料產生與處理的速度；Variety（多樣性）指資料的多種格式與來源；Veracity（真實性）指資料的準確性與可信度。上述四項（A、B、C、D）皆為大數據的公認定義屬性，因此選項（E）「以上皆為大數據的定義屬性」才是正確描述，題目問哪一個「不是」定義屬性，答案為（E），表示並沒有任何一個選項不是大數據的定義屬性。

## q-pp-im-it-108-11
CURRENT: E
Which of the following is not an application of big data? (A) Decision making (B) Forecast and Prediction (C) Vulnerability Assessment (D) Government Governance (E) all of the above can be applications of big data.
EXPLANATION: 大數據的應用範疇極為廣泛，選項中的決策制定（Decision Making）、預測與預報（Forecast and Prediction）、弱點評估（Vulnerability Assessment）以及政府治理（Government Governance）皆為大數據的重要應用領域。決策制定與預測是大數據最核心的應用，企業和政府透過分析海量資料來做出更精準的判斷；弱點評估在資安領域中也廣泛運用大數據技術來識別系統風險；政府治理方面則利用大數據進行政策分析與公共服務優化。因此，選項A至D均可為大數據的應用，答案為(E)「以上皆可為大數據的應用」。

## q-pp-im-it-108-12
CURRENT: A
The use of CAPTCHA (which requires user to type the letters of a distorted image, sometimes with the addition of an obscured sequence of letters or digits that appears on the screen) is an example of ________ that is meant to determine whether or not the user is human. (A) Turing Test (B) Alan Test (C) Interactive Test (D) AI Test (E) Awareness Test.
EXPLANATION: CAPTCHA 要求使用者辨識扭曲的圖片文字，目的是區分人類與機器，這正是圖靈測試（Turing Test）的核心概念。CAPTCHA 全名為「Completely Automated Public Turing test to tell Computers and Humans Apart」，名稱中即明確包含「Turing test」。圖靈測試由 Alan Turing 提出，透過互動來判斷對方是否具有人類智慧。選項 B 的「Alan Test」並非正式術語，選項 C、D、E 也都不是電腦科學中的標準名詞。因此，CAPTCHA 是圖靈測試的一種應用實例，正確答案為 A。

## q-pp-im-it-108-13
CURRENT: C
Which of the following protocols, as part of X.500, is designed for enabling anyone to locate organizations, individuals, and other resources such as files and devices in a network, whether on the public Internet or on a corporate intranet? (A) Free Directory Access Protocol (FDAP) (B) Internet Directory Access Protocol (IDAP) (C) Lightweight Directory Access Protocol (LDAP) (D) Root Directory Access Protocol (RDAP) (E) none of the above.
EXPLANATION: LDAP（輕量目錄存取協定，Lightweight Directory Access Protocol）是 X.500 目錄服務標準的一部分，專門設計用來讓使用者在網路上查找組織、個人及其他資源（如檔案與裝置）。LDAP 運作於 TCP/IP 之上，是 X.500 DAP（Directory Access Protocol）的簡化版本，廣泛應用於公共網際網路及企業內部網路的身份驗證與目錄查詢。選項 A（FDAP）、B（IDAP）、D（RDAP）均為不存在或與題目描述不符的協定名稱。因此正確答案為 C，LDAP 是唯一符合題意的真實且廣泛使用的目錄存取協定。

## q-pp-im-it-108-14
CURRENT: A
Which of the following protocols provides a secure channel over an unsecured network in a client-server architecture, and was designed as a replacement for Telnet and for unsecured remote shell protocols such as the Berkeley rlogin and rsh? (A) Secure Shell (SSH) (B) Transport Layer Security (TLS) (C) Secure Sockets Layer (SSL) (D) Session Initiation Protocol (SIP) (E) none of the above.
EXPLANATION: SSH（Secure Shell）是專門設計用來在不安全的網路上提供安全加密通道的協定，採用客戶端-伺服器架構。它的主要設計目的就是取代 Telnet、Berkeley rlogin 和 rsh 等明文傳輸的遠端連線協定，因為這些舊協定在傳輸過程中不加密，容易遭到竊聽。TLS 和 SSL 雖然也提供加密，但主要用於 HTTPS 等應用層協定，並非專門針對遠端 shell 存取所設計。SIP 是會話初始協定，用於多媒體通訊（如 VoIP），與遠端 shell 完全無關。因此正確答案為 (A) Secure Shell (SSH)。

## q-pp-im-it-108-15
CURRENT: E
Roughly speaking, the "deep" in "deep learning" neural networks refers to (A) the amount of data being trained (B) the number of tags in input data (C) the fan-in of a node (D) the fan-out of a node (E) none of the above.
EXPLANATION: 在深度學習中，「深度（deep）」指的是神經網路的層數（層的深度），即網路中隱藏層的數量多寡。選項 A 的訓練資料量、選項 B 的輸入標籤數量、選項 C 的節點扇入（fan-in）、選項 D 的節點扇出（fan-out）皆與「deep」的定義無關。因此，以上選項均不正確，答案為 E（none of the above）。

## q-pp-im-it-108-16
CURRENT: D
Which of the following is wrong about deep learning in AI? (A) deep learning requires training data to teach the model how to derive output from input (B) why an output is derived from the input may not be explained from the model (C) for decision making, a biased input may yield a bias output (D) training data usually have human marked information to teach the model what the input are (E) all of the above are correct (choose this one only if none of the above can be chosen).
EXPLANATION: 選項D的說法有誤。深度學習的訓練資料「通常」需要人工標記（如監督式學習）是部分正確的描述，但此說法過於絕對。非監督式學習（unsupervised learning）與自監督式學習（self-supervised learning）並不需要人工標記的標籤，這些方法在深度學習中同樣廣泛應用。相對地，選項A（需要訓練資料）、選項B（黑箱問題，無法解釋輸出原因）、選項C（有偏差的輸入會導致有偏差的輸出）均是關於深度學習正確的描述。因此，選項D是四個選項中描述有誤的一項。

## q-pp-im-it-108-17
CURRENT: C
Which of the following is wrong about information security? (A) Spyware is a type of malware designed to steal user data and sensitive information. (B) A Trojan horse is a type of malware that is often disguised as legitimate software so as to mislead users of its true intent. (C) A virus usually refers to a type of malicious programs that are able to actively replicate themselves and spread to other computers. (D) A botnet refers to a network of hijacked zombie computers that are remotely controlled by a hacker. (E) all of the above are correct (choose this one only if none of the above can be chosen).
EXPLANATION: 此題考資訊安全中各種惡意程式的正確定義。選項C描述「病毒能夠主動複製自身並傳播到其他電腦」，這其實是蠕蟲（Worm）的特徵，而非病毒（Virus）的定義。病毒需要寄宿在某個宿主程式或檔案中，且通常需要使用者執行受感染的程式才能傳播，並不會主動在網路上自我擴散。蠕蟲才是能夠自主複製並透過網路主動傳播到其他電腦的惡意程式。其餘選項A（間諜軟體）、B（木馬程式）、D（殭屍網路）的描述均正確無誤。

## q-pp-im-it-108-18
CURRENT: D
In information security, which of the following terms more commonly refers to psychological manipulation of people into performing actions or divulging confidential information? (A) Phishing (B) Honeypot (C) Spoofing (D) Social Engineering (E) Psychology Engineering.
EXPLANATION: 社會工程（Social Engineering）是資訊安全領域中專門指透過心理操縱手段，讓人們執行特定動作或洩漏機密資訊的攻擊方式。釣魚攻擊（Phishing）雖然也利用欺騙手段，但特指以偽裝電子郵件或網站為主的技術手法，範疇較窄。蜜罐（Honeypot）是防禦性的誘捕工具，偽裝（Spoofing）則是偽造身份或來源的技術手法，兩者均非心理操縱的核心概念。「Psychology Engineering」並非資安領域的標準術語，因此答案為 D（Social Engineering）。

## q-pp-im-it-108-19
CURRENT: D
Which of the following helps protect computers by monitoring and controlling incoming and outgoing network traffic based on predetermined security rules? (A) vulnerability scanner (B) authentication scanner (C) anti-virus software (D) firewall (E) eavesdropping software.
EXPLANATION: 防火牆（Firewall）是一種網路安全設備或軟體，其核心功能是依據預先設定的安全規則，監控並管理進出電腦或網路的流量。它可以阻擋未授權的存取，同時允許合法的通訊通過，從而保護內部網路免受外部威脅。漏洞掃描器（vulnerability scanner）用於偵測系統弱點，防毒軟體（anti-virus software）針對惡意程式，竊聽軟體（eavesdropping software）則是攻擊工具，皆不符合題意。因此，正確答案為防火牆（D）。

## q-pp-im-it-108-20
CURRENT: E
Which of the following applications/protocols is typically not based on client-server architecture? (A) network printing (B) remote procedure call (C) emails (D) HTTP (E) all of the above are based on client-server architecture.
EXPLANATION: 網路列印（network printing）使用用戶端-伺服器架構，客戶端將列印工作傳送給列印伺服器。遠端程序呼叫（RPC）同樣採用用戶端-伺服器模型，客戶端發出請求，伺服器執行並回傳結果。電子郵件使用 SMTP、POP3、IMAP 等協定，皆以用戶端-伺服器架構運作。HTTP 更是用戶端-伺服器架構的典型代表。由於上述所有選項均基於用戶端-伺服器架構，因此答案為 (E)。

## q-pp-im-it-109-1
CURRENT: B
In object-oriented programming, the concept of hiding internal state and requiring all interaction to be performed through an object's methods is known as (A) Abstraction (B) Encapsulation (C) Inheritance (D) Polymorphism (E) Enveloping.
EXPLANATION: MPEG（Moving Picture Experts Group）是一種用於視訊和音訊壓縮的格式，並非圖像檔案格式。JPEG、GIF 和 BMP 皆為常見的靜態圖像檔案格式，分別適用於照片壓縮、動畫圖像及點陣圖。MPEG 主要用於儲存影片與串流媒體，例如 .mpeg 或 .mpg 檔案，因此在本題選項中，MPEG 是唯一不屬於圖像格式的選項。

## q-pp-im-it-109-2
CURRENT: B
Which of the following access modifiers in object-oriented programming specifies that only the current class and subclasses (and sometimes also same-package classes) of this class will have access to the field or method been defined? (A) internal (B) private (C) protected (D) class public (E) none of the above.
EXPLANATION: Cookie 是由網站伺服器傳送並儲存在使用者瀏覽器中的一小段資料，用於記錄使用者的狀態資訊（如登入狀態、購物車內容等）。Proxy 是代理伺服器，負責轉發網路請求；ETag 是 HTTP 快取機制中用於驗證資源版本的標識符；Cache 雖然也儲存於本地，但其目的是加速資源載入而非記錄狀態。因此，題目所描述「由網站傳送、由瀏覽器儲存、用以記憶狀態資訊」的機制，正是 Cookie（選項 B）。

## q-pp-im-it-109-3
CURRENT: D
Which of the following about Python programming language is wrong? (A) it supports functional programming style coding (B) it supports object-oriented programming (C) it supports procedural style coding (D) it supports imperative programming style coding (E) all of the above are correct (choose this one only if none of the above can be chosen).
EXPLANATION: IPv6（Internet Protocol version 6）使用128位元（bit）的位址長度，因此理論上可以提供 2^128 個不同的網際網路位址。相較之下，IPv4 僅使用32位元，只能提供約 43 億（2^32）個位址，已面臨耗盡問題。IPv6 的 2^128 約等於 3.4×10^38 個位址，足以為地球上每個裝置甚至每個原子分配唯一的位址。因此本題正確答案為 (D) 2^128。

## q-pp-im-it-109-4
CURRENT: A
Which of the following about Python programming language is wrong? (A) it is a general-purpose programming language (B) it is statically-typed (C) it procedural can be executed by an interpreter (D) it uses whitespace indentation to delimit blocks (E) all of the above are correct (choose this one only if none of the above can be chosen).
EXPLANATION: TCP/IP（傳輸控制協定/網際網路協定）是網際網路上連接所有網路裝置的基礎協定組合，提供了資料傳輸與路由的核心機制。UDP/TCP（選項B）雖涵蓋傳輸層協定，但缺少負責定址與路由的網路層協定IP，並不完整。HTTP與HTTP/HTTPS（選項C、D）屬於應用層協定，建立在TCP/IP之上，僅處理網頁資料交換，而非底層互連基礎。DNS（選項E）是域名解析服務，同樣屬於應用層，功能是將網域名稱轉換為IP位址，而非網路互連的基礎協定。因此，真正作為網際網路裝置互連基礎的協定組合是TCP/IP。

## q-pp-im-it-109-5
CURRENT: E
Which of the following best describes a software delivery model that is deployed and managed on a vendor's cloud computing infrastructure and accessed by users over the Internet as and when required? (A) On-demand software (B) pay-as-you-go (C) open source (D) mobile software (E) code-on-demand.
EXPLANATION: 作業系統的核心功能涵蓋了選項中所有項目。CPU 排程（CPU scheduling）負責決定哪個行程可以使用處理器，是作業系統的基本任務之一。記憶體配置（memory allocation）管理程序所需的記憶體空間分配與回收，儲存管理（storage management）則負責磁碟與檔案系統的管理。I/O 管理（I/O management）協調輸入輸出裝置的存取，同樣是作業系統不可或缺的功能。因此，選項 A、B、C、D 全都是作業系統的常見任務，正確答案為 (E)。

## q-pp-im-it-109-6
CURRENT: E
Google App Engine is best characterized as an example of (A) Infrastructure-as-a-service (B) Software-as-a-service (C) App-as-a-service (D) Platform-as-a-service (E) Network-as-a-service.
EXPLANATION: 選項(A) Linux 是開放原始碼（Open Source）的作業系統，由 Linus Torvalds 於 1991 年發布，採用 GPL 授權，正確。選項(B) Linux 是類 Unix（Unix-like）系統，其設計理念與架構深受 Unix 影響，雖非直接衍生自 Unix 原始碼，但符合 POSIX 標準，正確。選項(C) Android 作業系統是基於 Linux 核心（Linux Kernel）所建立的，Google 採用修改過的 Linux 核心作為 Android 的底層，正確。選項(D) Android 透過 AOSP（Android Open Source Project）以開放原始碼方式釋出，任何人均可下載、修改與使用，正確。由於(A)(B)(C)(D)皆為正確敘述，因此應選(E)。

## q-pp-im-it-109-7
CURRENT: E
Which of the following is generally not characterized as a mobile payment service? (A) LINE Pay (B) Pi 錢包 (C) 街口 (D) 台灣 Pay (E) 嘖嘖.
EXPLANATION: LINE Pay、Pi 錢包、街口與台灣 Pay 都提供以手機完成付款或轉帳的行動支付服務。嘖嘖的核心功能則是讓提案者募集群眾資金，屬於群眾募資平台，並不是題目所問的行動支付服務，因此答案為 (E) 嘖嘖。

## q-pp-im-it-109-8
CURRENT: D
Which of the following best describes 5G's speed? (A) 10-100Mbps (B) 100-500Mbps (C) 300Mbps-1Gbps (D) 1-10Gbps (E) 10-100Gbps
EXPLANATION: GPS（全球定位系統）主要用於提供車輛的地理位置與導航路徑，並非用來感知周遭環境的即時障礙物、行人或車道線。自動駕駛車輛感知環境的核心技術包括光達（Lidar）、雷達（Radar）和電腦視覺（Computer Vision），這三者能直接偵測車輛周圍的物體與距離。相較之下，GPS 無法提供車輛周遭環境的細部資訊，因此在環境感知方面鮮少使用。選項 D 的 GPS 是最不被用於感知車輛周遭環境的技術。

## q-pp-im-it-109-9
CURRENT: D
In computer networks, which of the following refers to a server that acts as an intermediary for requests from clients seeking resources (such as a file or web page) from servers that provide those resources. (A) cache (B) proxy (C) load balancing (D) firewall (E) none of the above.
EXPLANATION: 本題考的是歐盟資料保護與隱私法規。一般資料保護規則（General Data Protection Regulation，GDPR）是歐盟於2016年通過、2018年5月正式生效的法規，適用於所有歐盟境內個人，取代了1995年的歐盟資料保護指令（EU Data Protection Directive）。選項(A) International Safe Harbor Privacy Principles 是美歐之間的隱私協議，已於2015年被廢止。選項(B) Digital Millennium Copyright Act (DMCA) 是美國的著作權法，與資料保護無關。選項(C) Digital Transition Content Security Act 為虛構法規名稱。因此正確答案為(D) General Data Protection Regulation。

## q-pp-im-it-109-10
CURRENT: E
In computer networks, which of the following servers is responsible for resolving a name like www.im.ntu.edu.tw to its IP address? (A) URL server (B) web server (C) HTTP servers (D) exchange server (E) none of the above.
EXPLANATION: 大數據（Big Data）通常以多個「V」來定義其特性。Volume（數量）指資料量龐大；Velocity（速度）指資料產生與處理的速度極快；Variety（多樣性）指資料來源與格式多元；Veracity（真實性）指資料的準確性與可信度。由於選項A到D皆為定義大數據的重要屬性，因此「以上皆是大數據的特定屬性」的選項E才是正確答案，即題目中沒有任何一項「不是」大數據的特性。

## q-pp-im-it-109-11
CURRENT: E
Which of the following is wrong? (A) IPv4 uses a 32-bit address space (B) IPv6 uses a 120-bit address space (C) IPv6 is intended to replace IPv4 (D) IPv6 is the most recent version of the Internet Protocol (IP) (E) all of the above are correct (choose this one only if none of the above can be chosen).
EXPLANATION: 本題詢問哪一項「不是」大數據的應用。選項A的決策制定、選項B的預測與預報、選項C的弱點評估（資安風險分析）、選項D的政府治理，全部都是大數據的實際應用領域。大數據可協助企業與政府進行決策、透過機器學習模型進行預測、分析系統漏洞與資安威脅、以及優化公共政策與治理效能。因此，A至D皆為大數據的應用，選項E「以上皆可作為大數據的應用」為正確答案，代表沒有任何一項不是大數據的應用。

## q-pp-im-it-109-12
CURRENT: A
Which of the following network technology is most widely used in local area networks? (A) Ethernet (B) Token Ring (C) FDDI (D) ARCNET (E) none of the above.
EXPLANATION: CAPTCHA（完全自動化公開圖靈測試）的設計目的是區分人類使用者與自動化程式（機器人），這正是圖靈測試（Turing Test）的核心概念。圖靈測試由艾倫·圖靈（Alan Turing）於1950年提出，用以判斷機器是否能表現出與人類無法區分的智慧行為。CAPTCHA 要求使用者辨識扭曲的文字或圖像，因為這類視覺辨識任務對人類來說相對容易，但對自動化程式卻十分困難。因此，CAPTCHA 是圖靈測試概念在網路安全領域的實際應用，屬於反向圖靈測試（reverse Turing Test）的一種形式。

## q-pp-im-it-109-13
CURRENT: C
A ______ bit is a check bit that is added to a block of data to ensure that the total number of 1-bits in the string is even or odd. (A) spin (B) recovery (C) parity (D) detection (E) singularity.
EXPLANATION: LDAP（Lightweight Directory Access Protocol，輕量目錄存取協定）是 X.500 標準的一部分，專門用於在網路上查詢組織、個人及其他資源（如檔案與設備）。LDAP 最初是 X.500 DAP（Directory Access Protocol）的輕量化版本，因此與 X.500 體系緊密相關。它廣泛應用於公共網際網路與企業內部網路的目錄服務，例如 Microsoft Active Directory 即以 LDAP 為基礎。選項 A（FDAP）、B（IDAP）、D（RDAP）均為虛構或不相關的協定，因此正確答案為 C。

## q-pp-im-it-109-14
CURRENT: A
Bluetooth is popularly used in the following applications as a wireless communication technology except (A) between a mobile phone and a VR headset (B) between a mobile phone and a car stereo system (C) between a wearable device and a mobile phone (D) between a mouse and a laptop (E) all of the above are common applications of Bluetooth.
EXPLANATION: SSH（Secure Shell）是一種加密網路協定，專為在不安全的網路上提供安全的通訊通道而設計，採用客戶端-伺服器架構。它被設計來取代明文傳輸的 Telnet 以及 Berkeley rlogin、rsh 等不安全的遠端 shell 協定。TLS 和 SSL 主要用於保護網頁瀏覽（HTTPS）等應用層協定，並非遠端 shell 的替代方案。SIP（Session Initiation Protocol）是用於建立多媒體通訊會話的協定，與遠端存取無關。因此正確答案為 SSH（選項 A）。

## q-pp-im-it-109-15
CURRENT: E
Which of the following is not a non-volatile memory/storage? (A) Solid-state drive (SSD) (B) DDR4 (C) read-only memory (ROM) (D) Flash memory (E) all of the above are non-volatile.
EXPLANATION: 在深度學習中，「深度」（deep）指的是神經網路中隱藏層的數量，也就是網路的層數深度。選項A（訓練資料量）、B（輸入資料的標籤數）、C（節點的扇入數）、D（節點的扇出數）皆與「深度」的定義無關。因此，上述選項皆不正確，正確答案為E（以上皆非）。深度神經網路透過堆疊多層非線性轉換來學習資料的抽象特徵表示，層數越多代表網路越「深」。

## q-pp-im-it-109-16
CURRENT: D
Which of the following standards is a specification for an information security management system (ISMS) intended to provide a framework of policies and procedures that includes all legal, physical and technical controls involved in an organization's information risk management processes. (A) ISO 9001 (B) ISO 7700 (C) ISO 14000 (D) ISO 27001 (E) none of the above.
EXPLANATION: 選項 D 說「訓練資料通常需要人工標記資訊來教導模型輸入是什麼」，這個說法並不正確，因為深度學習不一定需要人工標記的資料。非監督式學習（Unsupervised Learning）和自監督式學習（Self-supervised Learning）都能在沒有人工標籤的情況下訓練模型。選項 A（需要訓練資料）、B（模型可解釋性差，即黑箱問題）、C（偏差輸入導致偏差輸出）都是深度學習公認的正確特性。因此，選項 D 中「通常需要人工標記」的說法過於絕對且有誤，為本題錯誤的敘述。

## q-pp-im-it-109-17
CURRENT: C
In the CIA triad, a model designed to guide policies for information security within an organization, the letters 'CIA' refers to (A) Confidentiality, Integrity and Availability (B) Content, Information and Access (C) Central Intelligence Agency (D) Centralized, Independent, and Assurance (E) none of the above.
EXPLANATION: 選項 (C) 的描述有誤，因為它描述的是「蠕蟲（Worm）」而非「病毒（Virus）」的行為特徵。病毒（Virus）需要附著在宿主檔案上，通常需要使用者的操作（例如執行檔案）才能傳播，本身無法主動自我複製並散播到其他電腦。蠕蟲（Worm）才是能夠主動自我複製、無需宿主程式、並透過網路自動散播到其他電腦的惡意程式。選項 (A)、(B)、(D) 對間諜軟體、木馬程式、殭屍網路的描述均正確。因此，選項 (C) 是唯一錯誤的敘述。

## q-pp-im-it-109-18
CURRENT: D
Which of the following SQL Commands creates a table "Customers" with two columns "CustomerID" and "CustomerName":

(A) CREATE TABLE Customers (CustomerID int, CustomerName varchar(255) );
(B) CREATE DATABASE Customers (CustomerID int, CustomerName varchar(255) );
(C) BUILD TABLE Customers (CustomerID int, CustomerName varchar(255) );
(D) BUILD DATABASE Customers (CustomerID int, CustomerName varchar(255) );
(E) none of the above.
EXPLANATION: 社交工程（Social Engineering）是資訊安全領域中專門指透過心理操縱手段，誘使人們執行特定行為或洩露機密資訊的攻擊方式。網路釣魚（Phishing）雖然也涉及欺騙，但特指透過偽造電子郵件或網站來竊取帳號密碼等具體技術手法。蜜罐（Honeypot）是一種主動防禦機制，用來偵測或誘捕惡意攻擊者，與心理操縱無關。偽裝（Spoofing）是指偽造IP位址、電子郵件來源等技術性欺騙行為，並非心理操縱的代名詞。Psychology Engineering 並非標準資安術語，因此正確答案為 Social Engineering（D）。

## q-pp-im-it-109-19
CURRENT: D
Which of the following is a community-developed relational database management system intended to maintain high compatibility with MySQL and remain free and open-source due to the concerns over Oracle Corporation's acquisition of MySQL in 2009? (A) MonetDB (B) SAP R3 (C) Sybase (D) MariaDB (E) Firebird.
EXPLANATION: 防火牆（Firewall）是一種根據預先設定的安全規則，監控並管制進出網路流量的資安機制，能有效阻擋未授權的連線。弱點掃描器（vulnerability scanner）用於偵測系統漏洞，而非管制流量。防毒軟體（anti-virus software）專注於偵測與清除惡意程式，功能與流量控制不同。竊聽軟體（eavesdropping software）則是惡意工具，用於攔截通訊，並非保護手段。因此，符合題意的答案為 (D) firewall。

## q-pp-im-it-109-20
CURRENT: E
In the age of Internet of Things (IoT), the number of connected devices has grown rapidly in the past 10 years. Which of the following best describes the estimated number of connected devices worldwide in 2020? (A) 10-100 million (B) 100-500 million (C) 1-5 billion (D) 10-50 billion (E) 100-500 billion
EXPLANATION: 本題詢問哪一個應用程式或協定通常「不是」基於主從式架構（client-server architecture）。選項 (A) 網路列印使用列印伺服器，屬於主從式架構；選項 (B) 遠端程序呼叫（RPC）由客戶端呼叫遠端伺服器上的程序，亦屬主從式架構；選項 (C) 電子郵件透過 SMTP、POP3、IMAP 等協定與郵件伺服器溝通，同樣是主從式架構；選項 (D) HTTP 協定本身即是最典型的主從式架構，瀏覽器為客戶端、Web 伺服器為伺服端。由於 (A)(B)(C)(D) 全部都是基於主從式架構，因此正確答案為 (E)，即以上皆是基於主從式架構。
