# IM-IT 第二批學習模組規劃：AI/ML 與資安

日期：2026-08-16

## 結論

- 目前已發布的 5 個 lessons 只涵蓋資料庫、網路與作業系統；AI/ML 與資安 **15 個 subtopics 全部尚未發布**。
- AI/ML 現有 taxonomy 共 **22 題，19 題 autoGradeEligible**（86.4%）；資安共 **30 題，28 題 autoGradeEligible**（93.3%）。所有可判分答案都只是獨立技術覆核達 `medium`，**不是官方答案**。
- 資安資料較完整，可規劃 3 個 course groups；AI 可規劃 3 個 groups，但在寫教材前必須先處理 Big Data、emerging-tech、metrics 等錯置 taxonomy。
- 現有 source registry 沒有任何 source 的 scope 包含 `artificial-intelligence`、`machine-learning` 或 `information-security`。在新增並 review 對應來源前，AI/資安 lessons 不應進入發布流程。
- 第一批 validator 要求每個 lesson 只能引用同一個 `subtopicId`，且至少 6 個 eligible past-paper refs。第二批多數 subtopic 題量不足 6 題，若要採 course grouping，需先支援 `coveredSubtopicIds`（或等價的 group schema），不能為湊數引用錯 subtopic。

## 分析依據

- `public/data/im-it-concept-master.json`：AI 8 個、資安 7 個 reviewed subtopics。
- `public/data/im-it-question-metadata.json`：260 題 primary taxonomy、題型與 publication gates。
- `public/data/im-it-answer-review.json`：答案覆核狀態；全庫無官方 answer key。
- `public/data/im-it-lessons.json`：目前只有 5 個第一批 lessons，沒有 AI/資安內容。
- `public/data/im-it-source-registry.json`：目前 4 個 sources 只涵蓋 architecture、OS、networking、databases。

## AI/ML taxonomy 現況

| Subtopic | 標題 | Taxonomy 題數 | Auto-grade | Confirmed | Corrected | Disputed | 發布判斷 |
|---|---|---:|---:|---:|---:|---:|---|
| `im-it-ai-foundations-search` | AI 基礎與搜尋 | 2 | 2 | 2 | 0 | 0 | 題量太少，併入 AI-A |
| `im-it-ai-ml-paradigms` | 機器學習典範 | 3 | 3 | 3 | 0 | 0 | 其中 2 題其實是 evaluation metrics，需重分類 |
| `im-it-ai-training-evaluation` | 訓練與評估 | 3 | 2 | 2 | 0 | 1 | 3 題其實都是 Big Data，不是 model training/evaluation |
| `im-it-ai-neural-networks` | 神經網路 | 3 | 2 | 2 | 0 | 1 | 可作深度學習導論，但 eligible 題量不足 |
| `im-it-ai-cnn-rnn-sequence` | CNN、RNN 與序列模型 | 0 | 0 | 0 | 0 | 0 | 無考古題，只能先做來源驅動概念內容 |
| `im-it-ai-transformers-attention` | Transformer 與注意力 | 1 | 1 | 1 | 0 | 0 | 與 LLM 合併 |
| `im-it-ai-generative-llm` | 生成式 AI 與 LLM | 2 | 2 | 2 | 0 | 0 | 與 Transformer 合併 |
| `im-it-ai-ethics-governance` | AI 倫理與治理 | 8 | 7 | 7 | 0 | 1 | 題目主要是 emerging tech，不足以支撐 AI ethics lesson |
| **合計** |  | **22** | **19** | **19** | **0** | **3** |  |

### AI disputed 題

| Question ID | 現行 subtopic | 阻擋原因 |
|---|---|---|
| `q-pp-im-it-106-8` | `im-it-ai-training-evaluation` | Big Data 採 3V 或 5V taxonomy 時，D/E 皆有合理依據；且本題不屬 ML evaluation。 |
| `q-pp-im-it-108-16` | `im-it-ai-neural-networks` | supervised、self-supervised、unsupervised 的資料標註前提不同，D/E 無唯一答案。 |
| `q-pp-im-it-111-23` | `im-it-ai-ethics-governance` | metaverse 不必然依賴 blockchain，A/D 都可能被判錯。 |

### AI taxonomy 必修正項

1. `q-pp-im-it-110-15`（precision）與 `q-pp-im-it-110-16`（accuracy）應由 `ml-paradigms` 移到 `training-evaluation`。
2. `q-pp-im-it-106-8`、`q-pp-im-it-108-10`、`q-pp-im-it-108-11` 是 Big Data 特徵／應用，不是 AI 訓練與評估。應新增或改掛「Big Data 與資料分析」subtopic；在修正前不可拿來支撐 precision、recall、overfitting 教材。
3. 現行 `ai-ethics-governance` 的 8 題實際涵蓋 Fintech、crowdfunding、MOOC、smart speaker、autonomous car、mobile payment、metaverse、digital twin。除了個別 AI 應用，幾乎沒有 bias、fairness、hallucination、accountability 題。建議新增 `emerging-technologies-applications`，並保留真正 AI ethics subtopic 為「零真題、來源驅動」。
4. `cnn-rnn-sequence` 零題；不可為滿足 6 題 gate 借用 neural-network 或 LLM 題並假裝是同 subtopic。

## 資安 taxonomy 現況

| Subtopic | 標題 | Taxonomy 題數 | Auto-grade | Confirmed | Corrected | Disputed | 發布判斷 |
|---|---|---:|---:|---:|---:|---:|---|
| `im-it-security-principles-risk` | 資安原則與風險 | 5 | 5 | 3 | 2 | 0 | 與 identity/governance 合併 |
| `im-it-security-cryptography` | 密碼學 | 9 | 8 | 6 | 2 | 1 | 題量足夠，但 3 題是 blockchain/mining，需拆出 |
| `im-it-security-auth-access` | 身分驗證與存取控制 | 4 | 4 | 3 | 1 | 與 principles 合併 |
| `im-it-security-network-defense` | 網路防禦 | 4 | 4 | 4 | 0 | 0 | 與 attacks 合併成防禦閉環 |
| `im-it-security-application-attacks` | 應用程式攻擊 | 5 | 4 | 4 | 0 | 1 | 目前混有 DDoS、malware、social engineering、password attack |
| `im-it-security-malware-social` | 惡意程式與社交工程 | 0 | 0 | 0 | 0 | 0 | 題目被錯分到 application attacks |
| `im-it-security-governance-privacy` | 治理與隱私 | 3 | 3 | 3 | 0 | 0 | 與 principles 合併；GDPR 內容需時效性來源 |
| **合計** |  | **30** | **28** | **23** | **5** | **2** |  |

### 資安 disputed 題

| Question ID | 現行 subtopic | 阻擋原因 |
|---|---|---|
| `q-pp-im-it-107-19` | `im-it-security-cryptography` | Bitcoin ledger 的 B 與匿名／加密描述 C 都可判錯；且內容偏 blockchain architecture，不是密碼學核心。 |
| `q-pp-im-it-108-17` | `im-it-security-application-attacks` | virus 與 worm 的自動複製／跨主機散播界線使 C/E 不唯一；應改掛 malware-social。 |

### 資安 taxonomy 必修正項

1. `q-pp-im-it-107-22`（IoT DDoS）較適合 `network-defense`。
2. `q-pp-im-it-108-17`（virus/Trojan/spyware/botnet）與 `q-pp-im-it-108-18`（social engineering）應移到 `malware-social`。
3. `q-pp-im-it-110-20`（dictionary attack）可放 `auth-access` 的 password threats，或保留在攻擊 group，但需明定 grouping。
4. `q-pp-im-it-107-18`、`q-pp-im-it-107-19`、`q-pp-im-it-110-26` 是 Bitcoin/blockchain/mining，不宜用來證明 AES、RSA、hash、signature 等 cryptography lesson 的覆蓋度。應新增 blockchain subtopic 或移到 emerging technologies。
5. `q-pp-im-it-113-17`（HTTPS/TLS）同時跨 cryptography 與 network defense；若只保留 primary taxonomy，教材 grouping 應允許跨 subtopic 引用但保留每題唯一 primary owner。

## 建議 course grouping

### AI/ML

| Group | 涵蓋 subtopics | 現況題數 / eligible | 建議內容 | 決策 |
|---|---|---:|---|---|
| **AI-A：AI、ML 與模型評估基礎** | foundations-search、ml-paradigms、training-evaluation | 8 / 7 | Turing test、supervised/unsupervised/RL、regression/classification、confusion matrix、precision/recall/accuracy、overfitting | Taxonomy 修正後可製作；Big Data 題先移出 |
| **AI-B：神經網路到 Transformer/LLM** | neural-networks、cnn-rnn-sequence、transformers-attention、generative-llm | 6 / 5 | layers、backpropagation、CNN/RNN/LSTM、self-attention、Transformer、GPT、RAG | 先做來源驅動草稿；只有 5 題 eligible，不能沿用單-subtopic 6 題 gate |
| **AI-C：AI 應用、限制與治理** | ethics-governance；另需 emerging-tech subtopic | 8 / 7 | AI bias/fairness、explainability、hallucination、human oversight；把 Fintech/MOOC/mobile payment 等另放 emerging-tech | **暫緩**；目前真題不能證明 AI ethics 覆蓋 |

AI-A 與 AI-B 若合成一個 learning pack，去除錯分 Big Data 後約有 10 題可判分，足以形成真題入口；內容仍應拆成短 lessons，不要做成一篇過長講義。AI-C 必須先完成 concept/taxonomy 修訂。

### 資安

| Group | 涵蓋 subtopics | 現況題數 / eligible | 建議內容 | 決策 |
|---|---|---:|---|---|
| **SEC-A：CIA、身分與治理** | principles-risk、auth-access、governance-privacy | 12 / 12 | CIA、risk/threat/vulnerability、identification/authentication/authorization/accountability、SSO/Kerberos/MFA、RBAC/least privilege/zero trust、ISMS、privacy | 最高優先；資料完整，但 GDPR/標準內容需官方時效來源 |
| **SEC-B：密碼學、PKI 與 TLS** | cryptography；與 network-defense 有一題交集 | 9 / 8（移出 blockchain 後約 6 / 6） | symmetric/asymmetric、AES/RSA、hash/signature、certificate、CA/RA、revocation、TLS/HTTPS | 高優先；先拆出 blockchain 題，6 題仍足夠 |
| **SEC-C：攻擊到網路／應用防禦** | network-defense、application-attacks、malware-social | 9 / 8 | MITM、DDoS、firewall、SSH/VPN、SQL injection/XSS/buffer overflow、password attack、malware、phishing/social engineering | 高優先；先把 DDoS/malware/social 題移到正確 subtopic |

## 來源需求

現有 registry 不足：

- `src-brookshear-13e` 的 reviewed scope 沒有 AI/ML 或 security；不能因書名是計概就直接擴張用途。
- `src-nthu-network-course` 只有 networking scope，可補充 SSH、firewall、VPN 等網路背景，但在獨立 review 並擴充 security scope 前，不能作資安 lesson 的唯一依據。
- Database 與 OS sources 與本批主題無關。

以下是**待審核的來源類型與候選 stable IDs**，不是已註冊來源：

| Candidate source ID | 類型 | 支援 groups | 必查事項 |
|---|---|---|---|
| `src-university-ml-foundations` | 大學 ML 課程或公開教材 | AI-A | 必須涵蓋 learning paradigms、regression/classification、confusion matrix、overfitting；固定課程版本與章節 |
| `src-university-deep-learning` | 大學深度學習課程 | AI-B | 必須涵蓋 backprop、CNN、RNN/LSTM、representation；避免只引用短影音摘要 |
| `src-transformer-primary-paper` | Transformer 原始論文／作者教材 | AI-B | 用於 self-attention 與 encoder/decoder；教材須另做初學者摘要，不能長篇引用 |
| `src-llm-rag-authoritative` | 大學課程或正式技術教材 | AI-B | 明定 GPT、token/context、pretraining/fine-tuning、RAG；需標示版本日期，避免把特定產品行為當通則 |
| `src-nist-ai-rmf` | 官方 AI governance framework | AI-C | 用於風險、責任、透明、公平與 human oversight；固定文件版本 |
| `src-nist-csf` | 官方 cybersecurity framework | SEC-A | risk/governance、identify/protect/detect/respond/recover；固定 CSF 版本 |
| `src-nist-digital-identity` | 官方 digital identity guidance | SEC-A | authentication、MFA、assurance；注意文件版本與已撤回／更新章節 |
| `src-iso27001-overview` | ISO 官方公開 overview | SEC-A | 只摘要公開 requirements/ISMS 定位；不可假裝取得付費標準全文 |
| `src-crypto-pki-course` | 大學密碼學／網路安全課程 | SEC-B | AES/RSA/hash/signature/PKI 基礎，需區分 encryption、signature、key exchange |
| `src-rfc5280-x509` | RFC 5280 | SEC-B | certificate fields、CA、path validation、revocation；屬精確規範來源 |
| `src-rfc8446-tls13` | RFC 8446 | SEC-B | TLS 1.3 handshake 與安全目標；另說明考古題可能使用較舊泛稱 |
| `src-owasp-top10` | OWASP 官方教材 | SEC-C | SQL injection、XSS、access control 等 Web risks；固定 edition |
| `src-cisa-malware-social` | CISA 等官方 guidance | SEC-C | malware、phishing、ransomware、incident response；記錄更新日期 |

每個 group 至少應有：

1. 一個 reviewed 教學來源，提供連貫概念與例題。
2. 一個 primary／官方規範來源，校準會變動或容易過度簡化的定義。
3. source registry 中明確的 scope、usage、status 與版本／存取日期。

## Schema 與發布 gate 建議

### 建議支援 grouped lessons

第二批多數單一 subtopic 沒有 6 題 eligible。建議擴充 lesson：

```json
{
  "primarySubtopicId": "im-it-security-principles-risk",
  "coveredSubtopicIds": [
    "im-it-security-principles-risk",
    "im-it-security-auth-access",
    "im-it-security-governance-privacy"
  ]
}
```

Validator 應確認每個 `pastPaperRef` 的 primary subtopic 落在 `coveredSubtopicIds`，UI 仍可將 lesson 顯示在各子主題入口。不要直接取消 refs/subtopic 一致性檢查。

### 保持的安全閘

- disputed 題可出現在「爭議解析」區，但不得當 auto-grade 練習，也不得計入最低 eligible 題數。
- `corrected` 與 `confirmed` 都只有 medium confidence；UI 必須延續「非官方、獨立覆核」標示。
- 每個 lesson 仍需獨立技術 reviewer；AI/資安時效性內容需額外檢查 source 版本。
- 零題 subtopic 可做 concept-only 草稿，但不可顯示「歷屆高頻」或偽造 past-paper coverage。
- taxonomy 變更後重跑題數、eligibility、lesson refs 與 card refs validator。

## 建議執行順序

1. **Taxonomy 修補**：先移動 Big Data、metrics、emerging tech、blockchain、malware/social、DDoS 題；新增必要 subtopics。
2. **Grouped-lesson schema 決策**：支援 `coveredSubtopicIds`，或明確核准第二批採 course pack + 多個 concept-only lessons。
3. **來源註冊與 review**：先完成 SEC-A、SEC-B 所需官方／教學來源，再處理 AI-A、AI-B。
4. **第二批 1A（建議先做）**：SEC-A、SEC-B、SEC-C；現有可判分覆蓋最高。
5. **第二批 1B**：AI-A、AI-B；AI-B 的 CNN/RNN 需標示零真題覆蓋。
6. **暫緩 AI-C**：等 emerging-tech 與真正 AI ethics taxonomy 分開後再製作。
7. 全部草稿經獨立 reviewer、refs validator、production build 與線上入口驗證後才發布。
