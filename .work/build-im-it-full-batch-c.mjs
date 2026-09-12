import fs from 'node:fs'

const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)

const refs = {
  network: ['q-pp-im-it-109-5', 'q-pp-im-it-109-6', 'q-pp-im-it-110-28', 'q-pp-im-it-115-24', 'q-pp-im-it-106-9', 'q-pp-im-it-106-10', 'q-pp-im-it-107-13', 'q-pp-im-it-110-8'],
  securityCore: ['q-pp-im-it-107-20', 'q-pp-im-it-109-17', 'q-pp-im-it-110-21', 'q-pp-im-it-111-10', 'q-pp-im-it-113-14', 'q-pp-im-it-107-9', 'q-pp-im-it-107-12', 'q-pp-im-it-110-20', 'q-pp-im-it-113-15', 'q-pp-im-it-115-28', 'q-pp-im-it-107-23', 'q-pp-im-it-108-9', 'q-pp-im-it-109-16'],
  securityThreats: ['q-pp-im-it-107-10', 'q-pp-im-it-107-22', 'q-pp-im-it-108-14', 'q-pp-im-it-108-19', 'q-pp-im-it-111-11', 'q-pp-im-it-112-18', 'q-pp-im-it-108-18'],
  blockchain: ['q-pp-im-it-107-18', 'q-pp-im-it-110-26', 'q-pp-im-it-112-24', 'q-pp-im-it-115-25'],
  ai: ['q-pp-im-it-106-7', 'q-pp-im-it-108-15', 'q-pp-im-it-115-27', 'q-pp-im-it-113-23', 'q-pp-im-it-115-30'],
}

const sourceEntries = [
  {
    id: 'src-nist-ir-8202-blockchain',
    title: 'NISTIR 8202: Blockchain Technology Overview',
    author: 'Dylan Yaga, Peter Mell, Nik Roby, and Karen Scarfone',
    publisher: 'National Institute of Standards and Technology',
    type: 'official-guidance',
    url: 'https://doi.org/10.6028/NIST.IR.8202',
    scope: ['blockchain', 'distributed-ledger', 'consensus', 'proof-of-work', 'cryptographic-hash'],
    usage: 'terminology-architecture-and-consensus-check',
    status: 'reviewed',
  },
  {
    id: 'src-nist-ai-rmf-1',
    title: 'Artificial Intelligence Risk Management Framework (AI RMF 1.0)',
    author: 'National Institute of Standards and Technology',
    publisher: 'National Institute of Standards and Technology',
    type: 'official-guidance',
    url: 'https://doi.org/10.6028/NIST.AI.100-1',
    scope: ['artificial-intelligence', 'ai-governance', 'ai-risk-management', 'trustworthiness', 'accountability'],
    usage: 'risk-governance-and-trustworthiness-check',
    status: 'reviewed',
  },
  {
    id: 'src-stanford-cs224n',
    title: 'CS224N: Natural Language Processing with Deep Learning',
    author: 'Stanford NLP Group',
    publisher: 'Stanford University',
    type: 'course',
    url: 'https://web.stanford.edu/class/cs224n/',
    scope: ['neural-networks', 'natural-language-processing', 'sequence-models', 'transformers', 'large-language-models'],
    usage: 'neural-sequence-transformer-and-llm-concept-check',
    status: 'reviewed',
  },
  {
    id: 'src-nist-privacy-framework',
    title: 'NIST Privacy Framework',
    author: 'National Institute of Standards and Technology',
    publisher: 'National Institute of Standards and Technology',
    type: 'official-guidance',
    url: 'https://www.nist.gov/privacy-framework',
    scope: ['privacy', 'privacy-risk-management', 'governance', 'organizational-risk'],
    usage: 'privacy-risk-and-governance-check',
    status: 'reviewed',
  },
  {
    id: 'src-nist-ai-600-1-genai-profile',
    title: 'Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile',
    author: 'National Institute of Standards and Technology',
    publisher: 'National Institute of Standards and Technology',
    type: 'official-guidance',
    url: 'https://doi.org/10.6028/NIST.AI.600-1',
    scope: ['generative-ai', 'ai-risk-management', 'confabulation', 'privacy', 'accountability'],
    usage: 'generative-ai-risk-and-governance-check',
    status: 'reviewed',
  },
]

const lessons = [
  {
    id: 'lesson-im-it-network-cloud-performance-01',
    subtopicId: 'im-it-network-distributed-cloud',
    coveredSubtopicIds: ['im-it-network-distributed-cloud', 'im-it-network-performance-reliability'],
    title: '雲端、Edge 與網路服務品質：把工作放在正確的位置',
    summary: '從 SaaS/PaaS 與 hybrid cloud 的服務責任切入，理解 edge computing 為何把處理移近資料來源，再用 bandwidth、latency、jitter、availability、streaming 與 VPN 判讀使用體驗。',
    estimatedMinutes: 34,
    minimumPastPaperRefs: 4,
    learningObjectives: ['區分 SaaS、PaaS 與部署模型', '解釋 edge 與 cloud 的互補關係', '分辨 bandwidth、latency、jitter 與 availability', '說明 streaming 與 VPN 解決的不同問題'],
    learningScenario: {
      title: '跨校直播成果展',
      hook: '學校要把成果展直播給外校：報名系統放雲端、現場攝影機先在校內處理、工作人員從家中安全連線，觀眾卻抱怨畫面卡頓。團隊必須分清楚「服務放哪裡」與「連線品質哪裡出問題」。',
      predict: '若現場上傳頻寬足夠，但封包到達時間忽快忽慢，你會先加大雲端硬碟，還是處理 jitter 與播放緩衝？',
      mapping: [
        { everyday: '直接使用供應商託管的報名軟體', technical: 'SaaS／on-demand software' },
        { everyday: '開發者把程式部署到受管 runtime，不管理底層主機', technical: 'PaaS' },
        { everyday: '校內設備與公有雲共同提供服務', technical: 'Hybrid cloud' },
        { everyday: '攝影機旁先辨識與壓縮再上傳', technical: 'Edge computing 降低 latency 與回傳量' },
        { everyday: '遠端工作人員像在校內網路般安全存取', technical: 'VPN 建立私有網路式連線' },
      ],
      boundary: '「雲」不是所有遠端服務的同義詞，edge 也不會取代 cloud。VPN 提供安全通道，不自動保證低 latency、高 bandwidth 或不中斷；直播是否順暢仍取決於端到端容量、延遲、jitter、loss 與 buffering。',
      examCues: ['看到 vendor-hosted software：先辨認 SaaS/on-demand software。', '看到 managed application runtime：辨認 PaaS，不是 IaaS。', '看到自有機房加 AWS：選 hybrid cloud。', '看到靠近資料來源、降低 latency：選 edge；看到邊收邊播：選 streaming。'],
    },
    sections: [
      { title: '服務模型看誰負責哪一層', body: 'SaaS 讓使用者直接使用應用；PaaS 提供受管 application runtime；IaaS 提供較底層的 compute、storage 與 networking。題目應看責任邊界，不只看品牌。', bullets: ['SaaS 使用者主要管理資料與使用設定', 'PaaS 開發者管理程式與資料', 'IaaS 使用者仍需管理 OS 與應用', 'On-demand 描述需要時透過網路取得服務'] },
      { title: '部署模型看資源由誰組合', body: 'Public/private 描述雲環境的提供與使用方式；hybrid cloud 把私有環境與公有雲整合。使用兩個供應商不必然就是 hybrid，關鍵是私有與公有資源是否共同支援 workload。', bullets: ['公司機房加 AWS 是典型 hybrid', 'Hybrid 需要 identity、network 與 data policy 協調', 'Cloud model 與 service model 是不同維度'] },
      { title: 'Edge 把時間敏感處理往前移', body: 'Edge computing 在靠近 sensor、device 或使用者的位置先處理資料，可降低往返 latency 與核心網路流量；大型訓練、長期儲存與跨站彙整仍常留在 cloud。', bullets: ['Edge 適合即時反應與資料前處理', 'Cloud 適合集中治理與彈性規模', 'Edge 不等於單純增加 storage'] },
      { title: '效能與可靠度不能只看頻寬', body: 'Bandwidth 是傳輸容量，latency 是往返等待，jitter 是延遲變動，availability 是可使用時間比例。Streaming 用 buffer 邊收邊播；VPN 則把遠端裝置安全連到私有網路語境。', bullets: ['即時語音對 latency/jitter 特別敏感', '高 bandwidth 不代表低 latency', 'Buffer 可吸收 jitter 但增加播放延遲', 'Digital divide 描述 ICT 存取與使用成果的不平等'] },
    ],
    workedExamples: [
      { prompt: '團隊使用 Google App Engine 執行自行開發的報名程式，另保留校內資料庫。如何分類？', steps: ['App Engine 提供受管 application platform，屬 PaaS。', '校內資源與公有雲共同服務，部署面屬 hybrid cloud。'], answer: 'Service model 是 PaaS；deployment model 是 hybrid cloud。兩者可同時成立。' },
      { prompt: '直播有足夠平均 bandwidth，卻因延遲忽高忽低而斷續。先處理什麼？', steps: ['確認症狀是 packet arrival timing 變動。', '這對應 jitter，不是 storage 容量。', '以 jitter buffer、路徑/QoS 調整降低影響。'], answer: '先處理 jitter；buffer 可換取平順播放，但會增加 latency。' },
    ],
    commonPitfalls: ['把 SaaS、PaaS 與 public/hybrid cloud 混成同一分類軸', '以為 edge 完全取代 cloud', '把 bandwidth 與 latency 當同義詞', '以為 VPN 自動提升速度或可用性', '把 streaming 誤解為必然 live broadcasting'],
    sourceRefs: ['src-brookshear-13e', 'src-nthu-network-course'],
    pastPaperRefs: refs.network,
    reviewStatus: 'reviewed',
  },
  {
    id: 'lesson-im-it-security-risk-access-governance-01',
    subtopicId: 'im-it-security-principles-risk',
    coveredSubtopicIds: ['im-it-security-principles-risk', 'im-it-security-auth-access', 'im-it-security-governance-privacy'],
    title: '從 CIA 到 Zero Trust：把資安目標、身分與治理串起來',
    summary: '先用 CIA 與 risk 語言定義要保護什麼，再分辨 identification、authentication、authorization、accountability，最後以 RBAC、SSO、Zero Trust、ISMS、ISO 27001 與 privacy 建立持續治理。',
    estimatedMinutes: 40,
    minimumPastPaperRefs: 5,
    learningObjectives: ['正確展開 CIA 並連結控制措施', '區分 threat、vulnerability 與 risk', '區分 IAAA、RBAC、SSO 與 Zero Trust', '說明 ISMS、ISO 27001、privacy 與 audit 的角色'],
    learningScenario: {
      title: '新進員工取得研究資料權限',
      hook: '研究中心讓新進員工使用資料平台：櫃台先確認他是誰，系統驗證憑證，再依角色開放資料；所有操作都留下紀錄，管理者定期檢查風險與法規。',
      predict: '員工已成功登入，是否就代表他可以下載所有研究資料？',
      mapping: [
        { everyday: '報上姓名或帳號', technical: 'Identification' },
        { everyday: '出示可驗證的卡片、密碼或第二因素', technical: 'Authentication' },
        { everyday: '依研究角色決定可看的資料與可做的操作', technical: 'Authorization／RBAC' },
        { everyday: '操作有日誌，之後能追查責任', technical: 'Accountability／audit' },
        { everyday: '即使人在內網也逐次評估身分、裝置與情境', technical: 'Zero Trust：never trust, always verify' },
      ],
      boundary: '登入成功只證明身分驗證通過，不等於擁有所有權限。Zero Trust 不是只用 biometric，也不是把網路完全斷開；ISO 27001/ISMS 提供管理系統要求，不能取代每項技術控制或保證零事故。',
      examCues: ['CIA 的 A 是 Availability，不是 Accessibility。', '問可做哪些操作：authorization；問能否追責：accountability。', 'Ticket-based mutual authentication：Kerberos；一次登入多服務：SSO。', '看到政策、程序、風險管理框架：ISMS／ISO 27001；看到 EU 個資規則：GDPR。'],
    },
    sections: [
      { title: 'CIA 是安全目標，不是產品清單', body: 'Confidentiality 限制未授權揭露，Integrity 防止未授權修改，Availability 確保授權者需要時可使用。控制措施通常同時影響多個目標，應依 threat、vulnerability、likelihood 與 impact 評估 risk。', bullets: ['Encryption 常支援 confidentiality', 'Hash/signature 可支援 integrity', 'Redundancy 與 recovery 支援 availability', 'Defense in depth 用多層控制降低單點失敗'] },
      { title: 'IAAA 依序回答四個問題', body: 'Identification 宣稱身分，authentication 驗證宣稱，authorization 決定權限，accountability 透過 logging/audit 讓行為可歸責。考題常故意把 authorization 寫成 accountability。', bullets: ['密碼、token、生物特徵是 authentication factors', 'RBAC 把 permissions 配給 roles 再配給 users', 'Least privilege 只給完成工作所需最低權限'] },
      { title: 'SSO、Kerberos 與密碼攻擊', body: 'SSO 降低重複登入與 password fatigue，但 identity provider 成為重要依賴。Kerberos 以 tickets 支援不安全網路上的 mutual authentication。Dictionary attack 嘗試字典詞，不等同枚舉所有字元組合。', bullets: ['SSO 不代表每個服務都用不同 identity', 'MFA 結合不同 factor categories', 'Rate limiting 與強密碼可降低猜測攻擊風險'] },
      { title: '治理把控制變成持續循環', body: 'ISMS 將政策、程序、風險處理、監控與改善制度化；ISO/IEC 27001 提供 ISMS requirements。Privacy 關注個人資料合法、公平、透明與目的限制；audit 檢查設計與執行證據。', bullets: ['Compliance 不等於 risk 歸零', 'Incident response 包含準備、偵測、控制、復原與檢討', 'GDPR 是 EU 個資保護規則', '治理需要定期 review 而非一次性文件'] },
    ],
    workedExamples: [
      { prompt: '使用者輸入帳號、以 MFA 登入、系統依 analyst role 開放報表並記錄下載。逐項分類。', steps: ['帳號是 identification。', 'MFA 是 authentication。', 'Role permission 是 authorization/RBAC。', '下載日誌支援 accountability。'], answer: '依序為 identification、authentication、authorization、accountability。' },
      { prompt: '勒索軟體可能使服務停擺；系統未離線備份。請以 risk 語言描述。', steps: ['勒索軟體行為是 threat。', '缺乏隔離備份是 vulnerability。', '停擺影響 availability。', 'Likelihood 與 impact 組成需處理的 risk。'], answer: '以備份、分段、最小權限與演練形成 defense in depth，而非只裝單一工具。' },
    ],
    commonPitfalls: ['把 CIA 的 A 寫成 accessibility', '把 authentication 與 authorization 對調', '把 accountability 當權限決策', '以為 SSO 天然比多帳號安全而忽略集中風險', '把合規證書當成不會發生事件的保證'],
    sourceRefs: ['src-brookshear-13e', 'src-mit-network-computer-security'],
    pastPaperRefs: refs.securityCore,
    reviewStatus: 'reviewed',
  },
  {
    id: 'lesson-im-it-security-attacks-network-defense-01',
    subtopicId: 'im-it-security-network-defense',
    coveredSubtopicIds: ['im-it-security-network-defense', 'im-it-security-application-attacks', 'im-it-security-malware-social'],
    title: '從入口到人心：網路、應用與社交攻擊的分層防禦',
    summary: '以攻擊發生的位置分類 MITM、DDoS、buffer overflow、SQL injection、malware、phishing 與 social engineering，再把 HTTPS/SSH、firewall、secure coding、patching 與使用者驗證放回適當防線。',
    estimatedMinutes: 38,
    minimumPastPaperRefs: 4,
    learningObjectives: ['依攻擊面分類網路、應用、惡意程式與社交工程', '說明 HTTPS、SSH、firewall 的保護邊界', '區分 MITM、DDoS、buffer overflow 與 injection', '用 defense in depth 配置預防、偵測與復原控制'],
    learningScenario: {
      title: '售票網站的攻防演練',
      hook: '售票網站同時遇到大量惡意流量、偽造客服信件、未驗證輸入與公共 Wi-Fi 攔截。只買一台防火牆無法處理所有問題，團隊得先辨識攻擊層次。',
      predict: '若流量已通過 HTTPS，伺服器把使用者輸入直接拼進 SQL，是否就安全？',
      mapping: [
        { everyday: '入口警衛按規則放行或阻擋車輛', technical: 'Firewall traffic filtering' },
        { everyday: '封條與身分證明保護運送中的包裹', technical: 'TLS/HTTPS 的 confidentiality、integrity、server authentication' },
        { everyday: '成千上萬假客戶塞滿入口', technical: 'DDoS 消耗 availability' },
        { everyday: '客服話術誘導員工交出通行碼', technical: 'Social engineering／phishing' },
        { everyday: '表單文字被當成資料庫命令執行', technical: 'Injection 與 input boundary 失守' },
      ],
      boundary: '防火牆看見的主要是流量與規則，不會自動修復應用程式記憶體錯誤、辨認所有釣魚話術或保證 encrypted endpoint 本身可信。HTTPS 保護傳輸，不等於網站程式、使用者裝置與資料庫都安全。',
      examCues: ['攔截並冒充雙方：MITM。', '大量來源耗盡服務：DDoS。', '依預定規則控制進出流量：firewall；安全取代 Telnet/rsh：SSH。', '操縱人洩漏資訊：social engineering；惡意 query：SQL injection；覆寫相鄰記憶體：buffer overflow。'],
    },
    sections: [
      { title: '先按攻擊面分類', body: 'Network attacks 操弄路徑或流量，application attacks 利用程式與輸入處理缺陷，malware 在系統執行惡意功能，social engineering 則利用人的信任與決策。分類能避免用錯控制。', bullets: ['MITM 攔截或冒充通信端點', 'DDoS 主要攻擊 availability', 'Phishing 是 social engineering 的常見載體', 'Zero-day 描述尚無修補或未知漏洞的利用窗口'] },
      { title: '安全通道各有用途', body: 'HTTPS 通常以 TLS 保護 web 通信的 confidentiality、integrity 與 server authentication；SSH 為遠端 shell 提供安全通道。兩者都不能替代 endpoint hardening。', bullets: ['TLS 不以提高 transfer speed 為主要目的', 'SSH 設計用來取代 Telnet/rlogin/rsh', 'Certificate 驗證失敗時不能忽略警告'] },
      { title: '邊界防禦與可用性', body: 'Firewall 依規則監控與控制流量，但 DDoS 可能在到達單一防線前就耗盡 upstream capacity。Rate limiting、CDN/scrubbing、冗餘與事件應變需共同工作。', bullets: ['Firewall 不是 antivirus', 'DDoS 常利用大量分散節點', 'Availability 控制需考慮容量與復原'] },
      { title: 'Secure coding 與人的防線', body: 'Buffer overflow 來自越界記憶體寫入；injection 來自把不可信輸入當指令。Bounds checking、memory-safe design、parameterized queries 與 least privilege 降低技術風險；通報流程與二次確認降低社交工程成功率。', bullets: ['Parameterized query 分離 code 與 data', 'Patch management 縮短已知漏洞窗口', 'MFA 能降低憑證外洩影響但不消除 phishing', '備份與復原控制 ransomware impact'] },
    ],
    workedExamples: [
      { prompt: '攻擊者在咖啡店 Wi-Fi 攔截並改寫使用者與網站的交換。這是什麼？應先加什麼控制？', steps: ['攔截且可能 impersonate 是 MITM。', '正確驗證 certificate 的 HTTPS/TLS 保護通道。', '仍需確保 endpoint 未被入侵。'], answer: 'MITM；使用並正確驗證 TLS/HTTPS，且不能忽略憑證錯誤。' },
      { prompt: '登入表單把輸入直接拼進 SQL，同時收到偽造主管信要求提供 MFA code。兩者如何分類？', steps: ['前者把 input 當 query code，是 SQL injection。', '後者操縱人交付資訊，是 social engineering/phishing。', '分別用 parameterized query 與 out-of-band verification 等控制。'], answer: '這是 application attack 與 social attack，需不同防線。' },
    ],
    commonPitfalls: ['把 HTTPS 當成整個網站安全認證', '把 firewall 當萬用惡意程式與應用漏洞修補器', '把 MITM、DDoS 與 phishing 混為一談', '以為 encryption 的主要目的是提高速度', '只做 awareness training 而不改善技術與通報流程'],
    sourceRefs: ['src-brookshear-13e', 'src-mit-network-computer-security'],
    pastPaperRefs: refs.securityThreats,
    reviewStatus: 'reviewed',
  },
  {
    id: 'lesson-im-it-security-blockchain-01',
    subtopicId: 'im-it-security-blockchain',
    coveredSubtopicIds: ['im-it-security-blockchain'],
    title: 'Blockchain 與 Mining：可驗證帳本不是中央資料庫',
    summary: '從 transaction、block、hash linkage、distributed ledger 與 consensus 建立區塊鏈輪廓，聚焦考題反覆出現的 mining 交易驗證角色，並分清驗證、獎勵、發幣與資料庫交易性質。',
    estimatedMinutes: 28,
    minimumPastPaperRefs: 4,
    evidenceNote: '現有 reviewed source registry 沒有區塊鏈專門教材；本課嚴格限縮於四題 eligible refs 與既有 reviewed CS/security overview 的基礎定義，後續應補專門 reviewed source 再擴寫共識安全性。',
    learningObjectives: ['解釋鏈式雜湊如何支援可驗證紀錄', '說明 distributed ledger 與 consensus 的角色', '分辨 mining 的主要目的與可能獎勵', '避免把 blockchain 與一般分散式資料庫或 P2P 混同'],
    learningScenario: {
      title: '沒有總會計的共同帳本',
      hook: '多個社團共同記帳，沒有單一總會計。每頁帳本都附上前一頁的摘要，多數參與者依規則同意下一頁，任何人改舊頁都會讓後續摘要不一致。',
      predict: '參與者因驗證新頁而獲得獎勵，能否因此說 mining 的主要目的只是「鑄幣」？',
      mapping: [
        { everyday: '每頁列出一批已檢查交易', technical: 'Block containing validated transactions' },
        { everyday: '新頁附前頁不可任意替換的摘要', technical: 'Hash linkage' },
        { everyday: '多人各持帳本副本', technical: 'Distributed ledger' },
        { everyday: '依共同規則決定接受哪一頁', technical: 'Consensus' },
        { everyday: '驗證與建立新頁可能獲得報酬', technical: 'Mining role and incentive' },
      ],
      boundary: '紙本帳本比喻沒有呈現 fork、network delay、proof-of-work difficulty、key custody 或 smart contract。Blockchain 的「不可竄改」是以密碼學與共識提高竄改成本並使其可被察覺，不表示資料物理上絕對不能改，也不表示所有 blockchain 都採 mining。',
      examCues: ['問 mining 主要目的：交易驗證並參與共識，不是壓縮或加密交易。', '問無中央權威的可驗證交易紀錄：blockchain。', '新幣可能是 incentive，不要倒果為因當成唯一目的。', '看到 concurrency control、atomicity：不要誤套資料庫交易術語。'],
    },
    sections: [
      { title: '從 transaction 到 block', body: '使用者以 digital signature 等機制授權 transaction；節點檢查格式、簽章與可花費狀態，再把候選交易組成 block。錯誤資料若一開始被合法簽署，鏈本身不會保證現實世界內容正確。', bullets: ['Transaction validation 不等於 encryption', 'Signature 支援來源與完整性驗證', 'Block 是批次紀錄容器'] },
      { title: 'Hash linkage 讓歷史可驗證', body: 'Block header 連結前一 block 的 hash；改動舊內容會改變 hash 並破壞後續連結。分散節點可重算並檢查一致性。', bullets: ['Hash 是摘要，不是可逆加密', 'Tamper-evident 不等於物理不可修改', 'Security 仍依共識與參與者假設'] },
      { title: 'Consensus 取代單一管理者', body: 'Distributed ledger 的節點需要規則決定有效交易、block 與 chain。Bitcoin 以 proof of work 與 mining 參與此流程；其他 systems 可採不同 consensus，不能把 mining 當所有 blockchain 必備。', bullets: ['P2P 連線本身不等於 consensus', '一般 distributed database 不必然提供相同 trust model', 'Consensus 處理共同狀態的接受規則'] },
      { title: 'Mining 的目的與 incentive', body: '考題中的 mining 主要指驗證交易並建立可被網路接受的 block；block reward/fees 激勵資源投入，新幣發行可能是獎勵結果，但不是「驗證」的同義詞。', bullets: ['Validate transactions 是反覆出現的核心答案', 'Minting reward 與 protocol purpose 要分開', 'Mining 不負責把 transaction 加密'] },
    ],
    workedExamples: [
      { prompt: '有人把 mining 說成「壓縮並加密交易，再由中央管理員核准」。逐項判斷。', steps: ['Mining 核心不是 compression。', '交易可有簽章但 mining 不是加密服務。', 'Bitcoin 沒有中央發幣管理員。', '核心是驗證並參與 block/consensus。'], answer: '敘述錯誤；考題核心答案是 validate transactions。' },
      { prompt: '一般 replicated database 與 blockchain 都有多份資料，為何不能視為同義詞？', steps: ['Replication 描述副本與可用性。', 'Blockchain 還加入鏈式驗證與特定 trust/consensus model。', '兩者的權限、效能與一致性目標可能不同。'], answer: '多副本只是共同特徵；信任模型、驗證結構與共識才是區分關鍵。' },
    ],
    commonPitfalls: ['把 mining 的主要目的只寫成創造新幣', '把 hash 當 encryption', '認為 blockchain 記錄必然是真實世界真相', '認為所有 blockchain 都使用 proof of work', '把 distributed database、P2P 與 blockchain 視為同義詞'],
    sourceRefs: ['src-brookshear-13e', 'src-mit-network-computer-security'],
    pastPaperRefs: refs.blockchain,
    reviewStatus: 'reviewed',
  },
  {
    id: 'lesson-im-it-ai-neural-transformer-generative-governance-01',
    subtopicId: 'im-it-ai-neural-networks',
    coveredSubtopicIds: ['im-it-ai-neural-networks', 'im-it-ai-cnn-rnn-sequence', 'im-it-ai-transformers-attention', 'im-it-ai-generative-llm', 'im-it-ai-ethics-governance'],
    title: '從神經網路到 LLM：架構、RAG 與治理邊界',
    summary: '以 layered neural network 為底座，定位 CNN、RNN/LSTM、Transformer self-attention 與生成式 LLM 的差異，再用 RAG、bias、fairness、hallucination 與 accountability 建立使用邊界。',
    estimatedMinutes: 44,
    minimumPastPaperRefs: 4,
    evidenceNote: 'im-it-ai-cnn-rnn-sequence 與 im-it-ai-ethics-governance 目前沒有 direct primary past-paper refs；兩節屬 foundational coverage，不宣稱高頻。整堂僅引用 neural-networks、transformers-attention、generative-llm 的 5 題 eligible refs。',
    learningObjectives: ['說明 deep neural network 的 layer 與 representation 概念', '比較 CNN、RNN/LSTM 與 Transformer 的典型資料關係', '解釋 self-attention 與 GPT/RAG 的功能', '辨認 bias、fairness、hallucination、privacy 與 accountability 風險'],
    learningScenario: {
      title: '校園知識助手上線前驗收',
      hook: '學校打造能看照片、讀長文並回答校規的助手：不同模型像不同專長的小組，最後還要把答案連到校規來源並留下人工覆核責任。',
      predict: '助手接上最新校規資料庫後，是否就能保證每個答案正確且公平？',
      mapping: [
        { everyday: '多層工作站逐步把原始訊號轉成較抽象特徵', technical: 'Deep neural network layered representations' },
        { everyday: '影像小組重複掃描局部圖樣', technical: 'CNN convolution/local patterns' },
        { everyday: '紀錄員依序讀資料並攜帶先前狀態', technical: 'RNN/LSTM sequence state' },
        { everyday: '讀者比較整段文字中每個詞彼此的重要性', technical: 'Transformer self-attention' },
        { everyday: '回答前先查校規並附上相關段落', technical: 'RAG retrieval plus generation context' },
      ],
      boundary: '模型不是人類神經系統的完整複製；CNN/RNN/Transformer 都可被延伸到不同 modalities。Attention weights 不等於可靠解釋，RAG 也只改善可取得的 context，不保證檢索正確、推理正確、公平、無隱私風險或具備長期記憶。',
      examCues: ['Deep 的核心是多層 representation，不是資料量、tag 數或單一 node fan-in/out。', '局部影像特徵偏 CNN；序列狀態偏 RNN/LSTM；跨距離 token 關係偏 self-attention。', 'GPT 是 Generative Pre-trained Transformer。', 'RAG 是生成前檢索外部知識；不是 pruning、隨機回答或純 RLHF。'],
    },
    sections: [
      { title: 'Deep learning 的 deep 指層級表示', body: 'Neural network 由參數化 units 與 layers 組成；training 依 loss 調整 weights。Deep 通常指多個 representation layers，而不是資料量、標籤數或單一 node 的 fan-in/fan-out。', bullets: ['Forward pass 產生 prediction', 'Backpropagation 計算 gradient', 'Optimization 更新 parameters', 'AlphaGo 的關鍵技術包含 deep learning 與 search'] },
      { title: 'CNN 與 RNN 處理不同結構偏好', body: 'CNN 以共享 filters 擷取局部 pattern，典型用於 images；RNN 逐步更新 hidden state 來處理 sequence，LSTM/GRU 以 gating 改善長期依賴。這是常見 inductive bias，不是用途硬限制。', bullets: ['CNN parameter sharing 支援位置重複 pattern', 'RNN state 依 sequence order 更新', 'Embedding 把離散 token 映成向量', '本節目前沒有 direct primary refs'] },
      { title: 'Transformer 用 self-attention 建立關聯', body: 'Self-attention 讓每個 token 依內容對其他 tokens 分配權重，能直接建模遠距關係。Transformer 還包含 position information、feed-forward layers、residual connections 與 normalization，不能把整個架構縮成 attention 一項。', bullets: ['Attention 比較 query、key 並聚合 value', '距離不再依 recurrent steps 傳遞', 'Attention weight 不等於因果解釋'] },
      { title: '生成、檢索與治理是三件事', body: 'GPT 是 Generative Pre-trained Transformer；LLM 依 context 生成 plausible tokens。RAG 先檢索外部 knowledge，再把結果放入 generation context。治理仍需評估 bias、fairness、hallucination、privacy、安全與 accountability。', bullets: ['RAG 可更新 context，不會修改模型參數', 'Poor retrieval 會帶來錯誤依據', 'Human review 應依風險分級', '本課 AI governance 沒有 direct primary refs'] },
    ],
    workedExamples: [
      { prompt: '把三項任務配對：辨識照片局部紋理、逐步處理感測序列、比較長文相隔很遠的詞。', steps: ['局部 spatial patterns 對應 CNN。', '依序更新狀態對應 RNN/LSTM。', '直接衡量 token 關聯對應 Transformer self-attention。'], answer: '依序是 CNN、RNN/LSTM、Transformer；這是典型偏好而非絕對限制。' },
      { prompt: '知識助手用 RAG 查到過期校規並生成流暢答案。錯在哪一層？如何治理？', steps: ['Retrieval 選到過期來源，是 evidence freshness 問題。', 'Generation 流暢不代表 factual correctness。', '應加版本篩選、引用、衝突檢查與高風險人工覆核。'], answer: 'RAG 不能保證正確；需同時治理 retrieval、generation、source freshness 與 accountability。' },
    ],
    commonPitfalls: ['把 deep 誤解成資料多或 fan-in 大', '把 CNN、RNN、Transformer 當成互斥的唯一用途分類', '認為 self-attention 就是整個 Transformer', '把 GPT 展開成非 Generative Pre-trained Transformer 的詞', '以為 RAG 消除 hallucination 或自動保證 fairness/privacy'],
    sourceRefs: ['src-brookshear-13e', 'src-ntu-machine-learning-2021'],
    pastPaperRefs: refs.ai,
    reviewStatus: 'reviewed',
  },
]

const securityCore = lessons.find((lesson) => lesson.id === 'lesson-im-it-security-risk-access-governance-01')
securityCore.sourceRefs = ['src-brookshear-13e', 'src-mit-network-computer-security', 'src-nist-privacy-framework']
securityCore.sections[3] = {
  title: '治理把控制變成持續循環',
  body: 'ISMS 將政策、程序、風險處理、監控與改善制度化；考題將 ISO/IEC 27001 連結到 ISMS requirements。NIST Privacy Framework 則把 privacy 視為組織風險管理問題，不是只靠 encryption 就能解決。',
  bullets: ['Compliance 不等於 risk 歸零', 'Privacy risk 需要識別、評估、溝通與管理', 'GDPR 是 EU 個資保護規則；本課只保留這個考題識別層次', '治理需要定期 review，不是一次性文件'],
}

const blockchain = lessons.find((lesson) => lesson.id === 'lesson-im-it-security-blockchain-01')
Object.assign(blockchain, {
  summary: '以 NISTIR 8202 的 tamper-evident distributed ledger 定義，連結 transaction、block、hash linkage 與 consensus。考題把 mining 簡化為交易驗證，本課再區分 validating nodes 與 miners 在 Bitcoin-like proof-of-work 流程的角色。',
  evidenceNote: '四題 eligible refs 直接支撐 mining 考題簡化與無中央權威的可驗證帳本；NISTIR 8202 提供 hash linkage、distributed consensus 與 proof-of-work 的技術邊界。',
  sourceRefs: ['src-nist-ir-8202-blockchain'],
})
blockchain.learningObjectives = ['解釋鏈式雜湊如何使帳本篡改可被發現', '說明 distributed ledger 與 consensus 的角色', '區分 nodes 驗證與 miners 建立 proof-of-work candidate blocks', '將考題的 validate-transactions 簡化放回正確協定邊界']
blockchain.learningScenario.hook = '多個社團共同記帳，沒有單一總會計。每頁帳本都附上前一頁的摘要，參與者依共同協定驗證內容；在 Bitcoin-like 系統中，節點不是按人頭多數決，而是驗證規則並依累積 proof of work 選擇 chain。'
blockchain.learningScenario.predict = '考題說 mining 用來驗證交易；在實際 Bitcoin-like 流程中，是否只有 miners 會驗證？miners 還多做了什麼？'
blockchain.learningScenario.mapping[3] = { everyday: '每份帳本都依協定規則驗證，不以人頭多數決', technical: 'Validating nodes enforce consensus rules' }
blockchain.learningScenario.mapping[4] = { everyday: '提案者組成新頁並完成成本高的工作證明', technical: 'Miners construct candidate blocks and perform proof of work' }
blockchain.learningScenario.boundary = '紙本帳本沒有呈現 fork、network delay、proof-of-work difficulty、key custody 或 smart contract。Bitcoin 不是一人一票；validating nodes 檢查交易與 blocks，miners 選擇交易、建立 candidate block 並做 proof of work。Tamper-evident 不表示物理上絕對不可改，也不表示所有 blockchain 都採 mining。'
blockchain.learningScenario.examCues[0] = '考題問 mining 主要目的時選 validate transactions；技術上還要分清 nodes 驗證與 miners 建立 block/proof of work。'
blockchain.sections[0].body = '使用者以 digital signature 等機制授權 transaction；validating nodes 檢查格式、簽章與可花費狀態。Miners 從候選交易建立 candidate block，但其他 nodes 仍會獨立驗證。'
blockchain.sections[2].body = 'Distributed ledger 的節點依協定決定有效 transaction、block 與 chain。Bitcoin 用 proof of work 與累積工作量處理競爭 chain，不是以參與者人數投票。'
blockchain.sections[3].body = '考題把 mining 的核心答案簡化為 validate transactions。協定層面上，所有 validating nodes 都可檢查交易與 blocks；miners 還會選擇候選交易、建立 candidate block 並執行 proof of work。Block reward/fees 是 incentive，不是唯一協定目的。'
blockchain.workedExamples[0].steps = ['Mining 不是 compression 或 transaction encryption。', 'Validating nodes 依協定獨立檢查 transactions/blocks。', 'Miners 選擇交易、建立 candidate block 並做 proof of work。', 'Bitcoin 沒有中央發幣管理員。']
blockchain.workedExamples[0].answer = '考題簡化為 validate transactions；完整說法必須另區分 node validation 與 miner block production/proof of work。'

const neuralLesson = lessons.find((lesson) => lesson.id === 'lesson-im-it-ai-neural-transformer-generative-governance-01')
Object.assign(neuralLesson, {
  id: 'lesson-im-it-ai-neural-sequence-transformer-01',
  coveredSubtopicIds: ['im-it-ai-neural-networks', 'im-it-ai-cnn-rnn-sequence', 'im-it-ai-transformers-attention'],
  title: '從神經網路到 Transformer：層級、序列與 Attention',
  summary: '以 layered representation 與 training 為底座，比較 CNN 的局部共享特性、RNN/LSTM 的序列狀態，再進入 Transformer self-attention 的 token 關聯。',
  estimatedMinutes: 36,
  minimumPastPaperRefs: 3,
  evidenceNote: 'im-it-ai-cnn-rnn-sequence 目前沒有 direct primary past-paper refs，屬 foundational coverage；對應 cards 不掛考古 refs。',
  learningObjectives: ['說明 deep neural network 的 layers 與 representations', '區分 backpropagation 計算 gradients 與 optimizer 更新參數', '比較 CNN 與 RNN/LSTM 的典型 inductive biases', '解釋 self-attention 如何聚合 token 間資訊'],
  sourceRefs: ['src-ntu-machine-learning-2021', 'src-stanford-cs224n'],
  pastPaperRefs: ['q-pp-im-it-106-7', 'q-pp-im-it-108-15', 'q-pp-im-it-115-27'],
})
neuralLesson.learningScenario = {
  title: '校園資料處理小組',
  hook: '學校要處理照片與長篇文字：影像小組反覆搜尋局部圖樣，紀錄員依序讀取並保留狀態，另一組直接比較全段文字中詞彙的關聯。',
  predict: '若任務需要直接建模長文中相隔很遠的 tokens，哪種 mechanism 最直接建立彼此關聯？',
  mapping: [
    { everyday: '多層工作站逐步提取較抽象特徵', technical: 'Deep neural network layered representations' },
    { everyday: '錯誤訊號從產出端往前計算每個參數的影響', technical: 'Backpropagation computes gradients' },
    { everyday: '影像小組用共用檢視器掃描局部圖樣', technical: 'CNN shared filters and local patterns' },
    { everyday: '紀錄員依序讀取並攜帶先前狀態', technical: 'RNN/LSTM hidden state' },
    { everyday: '讀者比較每個詞與整段其他詞的關聯', technical: 'Transformer self-attention' },
  ],
  boundary: '這些是常見 inductive biases，不是用途的絕對分類；CNN、RNN 與 Transformer 都能延伸到不同 modalities。Attention weights 不等於因果或完整可解釋性，Transformer 也不只有 attention。',
  examCues: ['Deep 通常指多個 representation layers，不是資料量或 fan-in/out。', 'Backpropagation 計算 gradients，optimizer 依 gradients 更新 parameters。', '局部 spatial patterns 常對應 CNN；依序更新狀態常對應 RNN/LSTM。', 'Self-attention 依內容加權聚合 tokens，可直接連結遠距關係。'],
}
neuralLesson.sections = neuralLesson.sections.slice(0, 3)
neuralLesson.sections[2].bullets.push('Transformer 還有 position information、feed-forward layers、residual connections 與 normalization')
neuralLesson.sections.push({
  title: '架構是 inductive bias，不是用途硬分類',
  body: 'CNN 對局部共享 pattern、RNN 對序列狀態、self-attention 對 token 關聯各有典型偏好，但現代系統可混合架構並應依資料、任務、成本與評估結果選擇。',
  bullets: ['CNN 也能處理 sequence', 'Transformer 也能處理 image/audio modalities', '架構名稱不能代替實驗評估'],
})
neuralLesson.workedExamples = [
  neuralLesson.workedExamples[0],
  { prompt: '一個 neural network 已用 backpropagation 算出每個 parameter 的 gradient。下一步誰負責實際改變參數？', steps: ['Backpropagation 負責對 loss 求 gradient。', 'Optimizer 依學習率與更新規則使用 gradients。', '新 parameters 再用於下一次 forward pass。'], answer: 'Optimizer 負責依 gradients 更新 parameters；backpropagation 本身負責計算 gradients。' },
]
neuralLesson.commonPitfalls = ['把 deep 誤解成資料多或 fan-in 大', '把 backpropagation 與 optimizer 當同一步', '把 CNN、RNN、Transformer 當成互斥用途分類', '認為 self-attention 就是整個 Transformer', '把 attention weights 當成完整因果解釋']

const genAiLesson = {
  id: 'lesson-im-it-ai-generative-governance-01',
  subtopicId: 'im-it-ai-generative-llm',
  coveredSubtopicIds: ['im-it-ai-generative-llm', 'im-it-ai-ethics-governance'],
  title: '生成式 AI 與治理：從 GPT/RAG 題型到風險責任',
  summary: '先掌握考題直接要求的 GPT 展開與 RAG 定義，再以 NIST AI RMF 與 GenAI Profile 區分 confabulation、bias、privacy 與 accountability，不把檢索或流暢文字當成正確保證。',
  estimatedMinutes: 30,
  minimumPastPaperRefs: 2,
  evidenceNote: 'im-it-ai-ethics-governance 沒有 direct primary past-paper refs，屬 foundational coverage；對應 cards 不掛考古 refs。RAG 只保留 q-pp-im-it-115-30 直接支持的「生成前查詢外部權威知識庫」層次。',
  learningObjectives: ['正確展開 GPT', '說明考題中 RAG 在生成前加入外部知識檢索', '區分 confabulation 與系統性 bias', '以 NIST AI RMF 理解風險治理與 accountability'],
  learningScenario: {
    title: '校園知識助手上線審查',
    hook: '學校的生成式助手會回答校規。團隊讓它回答前先查詢校規庫，但仍要檢查檢索到的版本、回答是否有根據，以及誰對高風險決定負責。',
    predict: '助手接上外部知識庫後，是否就能保證每次檢索、生成與決定都正確而公平？',
    mapping: [
      { everyday: '助手在幾個字後根據 context 繼續寫下去', technical: 'Generative language model produces likely continuations' },
      { everyday: '回答前先從校規庫找相關段落', technical: 'RAG adds external retrieval before generation' },
      { everyday: '找到過期文件或根本沒根據卻寫得流暢', technical: 'Retrieval failure or confabulation risk' },
      { everyday: '對某些群體持續產生不利偏差', technical: 'Systematic bias and fairness risk' },
      { everyday: '指定負責人、留下記錄並允許人工介入', technical: 'Governance, accountability and human oversight' },
    ],
    boundary: 'RAG 在本課只指生成前檢索外部知識並放入 context，不表示修改模型參數，也不保證 retrieval、generation、fairness 或 privacy。NIST AI RMF 是自願性風險管理框架，不是自動認證或零風險保證。',
    examCues: ['GPT 是 Generative Pre-trained Transformer。', 'RAG 在生成前參考外部知識庫，不是 pruning、隨機回答或純 RLHF。', '流暢不等於有根據；confabulation 與 poor retrieval 是不同故障點。', 'AI 治理要連結情境、風險、監測、責任與人工介入。'],
  },
  sections: [
    { title: 'GPT 與生成', body: 'GPT 展開為 Generative Pre-trained Transformer。Language model 根據 context 生成後續 tokens；可讀性不能單獨證明 factual correctness。', bullets: ['Generative 指生成輸出', 'Pre-trained 指先在大量資料學習', 'Transformer 是所採架構家族'] },
    { title: 'RAG 只加入檢索 context', body: '考題中 RAG 指在生成前查詢模型訓練資料外的權威知識庫，再把相關內容放入 context。', bullets: ['RAG 不是模型 pruning', 'RAG 不是只靠 RLHF 訓練', '過期或不相關檢索結果仍會導致錯誤'] },
    { title: '生成式 AI 風險需分類', body: 'NIST GenAI Profile 將 generative AI 放進風險管理。本課區分無根據內容、系統性偏差、privacy 與 security 風險，不用單一 accuracy 代替全部評估。', bullets: ['Confabulation 是缺乏根據或錯誤內容', 'Bias 可在資料、模型或部署情境產生', 'Privacy 與 security 需獨立風險處理'] },
    { title: '治理是持續的風險責任', body: 'NIST AI RMF 用於將 trustworthiness 考量納入 AI 設計、開發、使用與評估。高風險用途要有明確 owner、monitoring、audit trail、escalation 與 human oversight。', bullets: ['Framework 不是自動合規證書', '風險要依情境與影響評估', '人工介入要有可執行流程，不是口號'] },
  ],
  workedExamples: [
    { prompt: '題目問「生成前參考外部權威知識庫」是什麼？', steps: ['先找 external retrieval。', '檢索結果被放入 generation context。', '不是 pruning 或純 RLHF。'], answer: '這是 Retrieval-Augmented Generation (RAG)。' },
    { prompt: '助手檢索到過期校規並生成流暢回答。要如何分層處理？', steps: ['先標記 retrieval freshness 故障。', '再檢查 generation 是否有根據。', '以版本篩選、引用、監測與高風險人工介入降低影響。'], answer: 'RAG 不能保證正確；要同時管理 retrieval、generation 與部署責任。' },
  ],
  commonPitfalls: ['把 GPT 展開成其他詞組', '把 RAG 誤當成修改模型參數', '認為外部知識庫保證回答正確', '把 confabulation 與 bias 當同一風險', '把 AI RMF 當成自動合規或零風險保證'],
  sourceRefs: ['src-stanford-cs224n', 'src-nist-ai-rmf-1', 'src-nist-ai-600-1-genai-profile'],
  pastPaperRefs: ['q-pp-im-it-113-23', 'q-pp-im-it-115-30'],
  reviewStatus: 'reviewed',
}
lessons.push(genAiLesson)

const card = (slug, lessonId, subtopicId, front, back, explanation, sourceRefs, pastPaperRefs = []) => ({
  id: `card-im-it-${slug}`,
  lessonId,
  subtopicId,
  front,
  back,
  explanation,
  sourceRefs,
  pastPaperRefs,
  reviewStatus: 'reviewed',
})

const networkLesson = lessons[0].id
const securityCoreLesson = lessons[1].id
const securityThreatLesson = lessons[2].id
const blockchainLesson = lessons[3].id
const aiLesson = lessons[4].id
const genAiLessonId = lessons[5].id
const netSources = lessons[0].sourceRefs
const secSources = lessons[1].sourceRefs
const securityThreatSources = lessons[2].sourceRefs
const blockchainSources = lessons[3].sourceRefs
const aiSources = lessons[4].sourceRefs
const genAiSources = lessons[5].sourceRefs

const cards = [
  card('network-distributed-cloud-01', networkLesson, 'im-it-network-distributed-cloud', 'SaaS 與 PaaS 的責任邊界差在哪裡？', 'SaaS 直接提供可用應用；PaaS 提供受管 runtime，讓開發者部署自己的應用。', '判斷時看使用者管理的是「使用設定」還是「application code」。', netSources, ['q-pp-im-it-109-5', 'q-pp-im-it-109-6']),
  card('network-distributed-cloud-02', networkLesson, 'im-it-network-distributed-cloud', 'Hybrid cloud 與 edge computing 分別描述什麼？', 'Hybrid 描述私有與公有環境的組合；edge 描述把處理移近資料來源或使用者。', '一個是 deployment model，一個是 computation placement，兩者可以同時使用。', netSources, ['q-pp-im-it-110-28', 'q-pp-im-it-115-24']),
  card('network-performance-reliability-01', networkLesson, 'im-it-network-performance-reliability', 'Bandwidth、latency、jitter 各代表什麼？', 'Bandwidth 是容量，latency 是等待時間，jitter 是 latency 的變動。', '這是 reviewed network sources 支撐的基礎卡；現有考題只直接問 streaming，因此不掛考古 ref。', netSources),
  card('network-performance-reliability-02', networkLesson, 'im-it-network-performance-reliability', 'VPN 與 streaming 解決的是同一問題嗎？', '不是。VPN 建立安全的私有網路式連線；streaming 讓媒體在持續接收時即可播放。', 'VPN 不保證速度，streaming 也不等於安全通道。', netSources, ['q-pp-im-it-107-13', 'q-pp-im-it-110-8', 'q-pp-im-it-106-9']),

  card('security-principles-risk-01', securityCoreLesson, 'im-it-security-principles-risk', 'CIA triad 的三個目標是什麼？', 'Confidentiality、Integrity、Availability。', 'Availability 不是 Accessibility；CIA 是安全目標，不是機構名稱。', secSources, ['q-pp-im-it-109-17', 'q-pp-im-it-111-10']),
  card('security-principles-risk-02', securityCoreLesson, 'im-it-security-principles-risk', 'Threat、vulnerability 與 risk 如何串起來？', 'Threat 可能利用 vulnerability 造成 impact；risk 綜合發生可能性與影響。', 'Defense in depth 用多層控制降低單點失敗。', secSources, ['q-pp-im-it-113-14']),
  card('security-auth-access-01', securityCoreLesson, 'im-it-security-auth-access', 'Identification、authentication、authorization、accountability 如何區分？', '依序是宣稱身分、驗證身分、決定權限、讓行為可追責。', '題目說「允許哪些操作」是在問 authorization，不是 accountability。', secSources, ['q-pp-im-it-113-15']),
  card('security-auth-access-02', securityCoreLesson, 'im-it-security-auth-access', 'Zero Trust 的核心原則是什麼？', 'Never trust, always verify；不因使用者或裝置位於內網就預設信任。', '它需要持續驗證與 least privilege，不是只用 biometric 或只靠 firewall。', secSources, ['q-pp-im-it-115-28']),
  card('security-governance-privacy-01', securityCoreLesson, 'im-it-security-governance-privacy', 'ISO/IEC 27001 與 ISMS 的關係是什麼？', 'ISO/IEC 27001 提供建立、運作、監控與改善 ISMS 的 requirements。', '通過管理系統驗證不等於風險歸零。', secSources, ['q-pp-im-it-107-23', 'q-pp-im-it-109-16']),
  card('security-governance-privacy-02', securityCoreLesson, 'im-it-security-governance-privacy', 'NIST Privacy Framework 為何不把 privacy 只當成 encryption 問題？', '它把 privacy 視為組織需要識別與管理的風險，需納入產品、服務與企業治理。', 'Encryption 可是控制，但不能單獨回答所有 privacy risk。本卡依 NIST Privacy Framework，不掛只識別 GDPR 名稱的考題。', secSources),

  card('security-network-defense-01', securityThreatLesson, 'im-it-security-network-defense', 'Firewall 的核心功能是什麼？', '依預定 security rules 監控並控制 incoming/outgoing network traffic。', '它不是 vulnerability scanner、antivirus 或所有攻擊的萬用修補。', securityThreatSources, ['q-pp-im-it-108-19']),
  card('security-network-defense-02', securityThreatLesson, 'im-it-security-network-defense', 'MITM 與 DDoS 的主要差異是什麼？', 'MITM 攔截或冒充通信雙方；DDoS 以大量分散流量耗盡服務 availability。', '兩者分別偏向通信信任/完整性與資源可用性。', securityThreatSources, ['q-pp-im-it-107-22', 'q-pp-im-it-111-11']),
  card('security-application-attacks-01', securityThreatLesson, 'im-it-security-application-attacks', 'Buffer overflow 與 SQL injection 的失守邊界有何不同？', 'Buffer overflow 是越界記憶體寫入；SQL injection 是不可信輸入被當成 query code。', '分別以 bounds/memory safety 與 parameterized queries 防護。', securityThreatSources, ['q-pp-im-it-112-18']),
  card('security-application-attacks-02', securityThreatLesson, 'im-it-security-application-attacks', '為何 HTTPS 不能防止 SQL injection？', 'HTTPS 保護傳輸通道；SQL injection 發生在 server 將輸入解讀成命令的 application boundary。', '安全通道不會自動修正 endpoint code。', securityThreatSources, ['q-pp-im-it-107-10', 'q-pp-im-it-112-18']),
  card('security-malware-social-01', securityThreatLesson, 'im-it-security-malware-social', 'Social engineering 的核心是什麼？', '利用心理與信任，誘導人執行動作或洩漏機密。', 'Phishing 是常見載體，但 social engineering 範圍更廣。', securityThreatSources, ['q-pp-im-it-108-18']),
  card('security-malware-social-02', securityThreatLesson, 'im-it-security-malware-social', '降低 ransomware impact 為何不能只靠 awareness training？', '還需要 patching、least privilege、segmentation、離線備份、偵測與復原演練。', '這是 reviewed security source 支撐的 defense-in-depth 補充；現有考題只直接問 social engineering，因此不掛考古 ref。', securityThreatSources),

  card('security-blockchain-01', blockchainLesson, 'im-it-security-blockchain', '考題與完整協定對 mining 的描述如何並存？', '考題簡化答案是 validate transactions；Bitcoin-like 協定中，nodes 驗證 transactions/blocks，miners 還建立 candidate blocks 並做 proof of work。', '新幣或 fees 是 incentive，不是唯一協定目的。', blockchainSources, ['q-pp-im-it-110-26', 'q-pp-im-it-112-24']),
  card('security-blockchain-02', blockchainLesson, 'im-it-security-blockchain', 'Blockchain 為何能提供無中央權威的可驗證紀錄？', '節點共享 tamper-evident distributed ledger，依密碼學連結與 consensus rules 檢查歷史與新 blocks。', 'Tamper-evident 不代表資料物理上絕對不能改，也不保證輸入事實真實。', blockchainSources, ['q-pp-im-it-107-18', 'q-pp-im-it-115-25']),

  card('ai-neural-networks-01', aiLesson, 'im-it-ai-neural-networks', 'Deep learning 的「deep」通常指什麼？', '指多個 representation/processing layers，不是資料量、tag 數或單一 node fan-in/fan-out。', 'Layered representations 逐步把輸入轉成較抽象特徵。', aiSources, ['q-pp-im-it-108-15']),
  card('ai-neural-networks-02', aiLesson, 'im-it-ai-neural-networks', 'Training neural network 時 backpropagation 與 optimizer 各做什麼？', 'Backpropagation 計算 loss 對參數的 gradients；optimizer 依 gradients 更新參數。', '這是 reviewed ML/NLP sources 支撐的基礎卡；AlphaGo 題只識別 deep learning，因此不掛該題。', aiSources),
  card('ai-cnn-rnn-sequence-01', aiLesson, 'im-it-ai-cnn-rnn-sequence', 'CNN 的典型 inductive bias 是什麼？', '以共享 filters 擷取局部 pattern，常適合 spatial data 如 images。', '這是基礎補充；目前沒有 direct primary past-paper ref。', aiSources),
  card('ai-cnn-rnn-sequence-02', aiLesson, 'im-it-ai-cnn-rnn-sequence', 'RNN/LSTM 如何處理 sequence？', '依順序更新 hidden state；LSTM 以 gates 控制資訊保留與遺忘。', '這是基礎補充；目前沒有 direct primary past-paper ref。', aiSources),
  card('ai-transformers-attention-01', aiLesson, 'im-it-ai-transformers-attention', 'Self-attention 的主要功能是什麼？', '讓每個 token 依內容衡量序列中其他 tokens 的重要性並聚合資訊。', '它能直接連結遠距 token，但 attention weight 不等於因果解釋。', aiSources, ['q-pp-im-it-115-27']),
  card('ai-transformers-attention-02', aiLesson, 'im-it-ai-transformers-attention', 'Transformer 是否只有 self-attention？', '不是；還包含 position information、feed-forward layers、residual connections 與 normalization 等。', '這是 reviewed CS224N 支撐的架構卡；self-attention 題未直接檢驗其他元件，因此不掛該題。', aiSources),
  card('ai-generative-llm-01', genAiLessonId, 'im-it-ai-generative-llm', 'GPT 的全名是什麼？', 'Generative Pre-trained Transformer。', '選項若都不是此完整名稱，應選 none of the above。', genAiSources, ['q-pp-im-it-113-23']),
  card('ai-generative-llm-02', genAiLessonId, 'im-it-ai-generative-llm', 'RAG 在生成前增加什麼步驟？', '先從外部 knowledge base 檢索相關內容，再把結果放入 generation context。', 'RAG 不等於修改模型參數，也不保證檢索或生成正確。', genAiSources, ['q-pp-im-it-115-30']),
  card('ai-ethics-governance-01', genAiLessonId, 'im-it-ai-ethics-governance', 'Confabulation 與 bias 有何差異？', 'Confabulation 是產生缺乏依據或錯誤內容；bias 是系統性地對某些模式或群體產生偏差。', '兩者可同時發生，但需不同 evaluation；目前沒有 direct primary ref。', genAiSources),
  card('ai-ethics-governance-02', genAiLessonId, 'im-it-ai-ethics-governance', '高風險 AI 為何需要 accountability？', '必須明確指定資料、模型、部署與決策的責任人，保留 audit trail、escalation 與人工介入。', 'NIST AI RMF 與 GenAI Profile 提供風險管理邊界；本 subtopic 目前沒有 direct primary ref。', genAiSources),
]

write('.work/im-it-full-batch-c-lessons.json', {
  schemaVersion: 1,
  subjectId: 'im-it',
  batch: 'full-batch-c',
  status: 'reviewed-fragment',
  counts: { lessons: lessons.length, coveredSubtopics: new Set(lessons.flatMap((lesson) => lesson.coveredSubtopicIds)).size, coveredQuestions: new Set(lessons.flatMap((lesson) => lesson.pastPaperRefs)).size },
  lessons,
})

write('.work/im-it-full-batch-c-cards.json', {
  schemaVersion: 1,
  subjectId: 'im-it',
  batch: 'full-batch-c',
  status: 'reviewed-fragment',
  totalCards: cards.length,
  cards,
})

write('.work/im-it-full-batch-c-sources.json', {
  schemaVersion: 1,
  subjectId: 'im-it',
  batch: 'full-batch-c',
  status: 'reviewed-fragment',
  totalSources: sourceEntries.length,
  reviewMethod: 'Official source landing pages verified with stealth_fetch; entries remain a fragment until canonical merge.',
  sources: sourceEntries,
})
