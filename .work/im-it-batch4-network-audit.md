# IM-IT 第四批 Network grouped lesson audit

- 產出日期：2026-08-16
- 題庫 authority：`origin/main` commit `6be3e75302159b1f4801d335916567f7e62f9ba8`
- Lesson：`lesson-im-it-network-ip-routing-transport-01`
- 涵蓋 subtopics：`im-it-network-ip-addressing-routing`、`im-it-network-transport`
- 作者狀態：**draft；未批准，須由作者以外 reviewer 複查**

## 結論

本批產出 1 堂 grouped lesson、5 sections、4 個可重現 worked examples 與 6 張 cards。Lesson 的 `minimumPastPaperRefs` 設為 7，實際引用 7 題；每一題在 `origin/main:public/data/im-it-question-metadata.json` 都是 `autoGradeEligible=true`，且 `primarySubtopicId` 落在 `coveredSubtopicIds`。所有引用答案都是 model-assisted technical derivation／人工技術覆核，**不是官方答案**，lesson summary 已明示。

本 audit 是作者自查，不是 approval。Artifact 維持 `reviewStatus: draft`，待獨立 reviewer 核對技術內容、來源、例題計算與 refs 後才能併入 public data。

## Authority 與盤點方法

僅以下 `origin/main` 檔案作為題庫與 registry authority，未以 working tree 內正在修改的 public artifacts 取代它們：

- `public/data/questions.json`：完整題幹與選項
- `public/data/answers.json`：現有答案與解釋
- `public/data/im-it-question-metadata.json`：primary taxonomy、answer provenance 與 publication gates
- `public/data/im-it-concept-master.json`：subtopic IDs 與概念樹
- `public/data/im-it-source-registry.json`：既有 reviewed sources

盤點兩個 subtopics 共找到 10 題，全部在 metadata 內標為 `autoGradeEligible=true`。本 lesson 只選語意直接支撐教材目標、且題面與答案足以唯一判讀的 7 題；沒有為達門檻借用其他 subtopic 題目。

## Past-paper ref eligibility 與語意審核

| Question ID | Primary subtopic | Auto-grade | 題意 | 決策 |
|---|---|---:|---|---|
| `q-pp-im-it-112-16` | IP addressing/routing | true | Distance-vector 與鄰居交換 routing information | 引用；支撐 distance-vector vs link-state |
| `q-pp-im-it-112-17` | transport | true | TCP 敘述判錯 | **排除**；A 與 D 題面近似重複且現存答案 A 與技術解釋互相矛盾，不適合作教材 evidence |
| `q-pp-im-it-114-19` | IP addressing/routing | true | Subnet mask 劃分 network/host portions | 引用；支撐 CIDR/subnet section |
| `q-pp-im-it-114-20` | transport | true | TCP header Window field | 引用；支撐 receiver window 與 flow control |
| `q-pp-im-it-114-21` | IP addressing/routing | true | OSPF 使用 link-state | 引用；支撐 routing algorithm section |
| `q-pp-im-it-114-22` | IP addressing/routing | true | NAT 敘述判錯 | 排除；雖屬 broad subtopic，但 lesson 未教授 NAT，不拿它替核心定址／路由 coverage 湊數 |
| `q-pp-im-it-114-24` | IP addressing/routing | true | SDN control/data plane | 排除；lesson 未教授 SDN，語意不支撐本次 learning objectives |
| `q-pp-im-it-115-13` | IP addressing/routing | true | IPv4 TTL 防止 routing loop | 引用；支撐 forwarding/TTL section |
| `q-pp-im-it-115-14` | transport | true | UDP 相對 TCP 的特性 | 引用；支撐 TCP/UDP comparison |
| `q-pp-im-it-115-15` | transport | true | TCP slow start 的目的 | 引用；支撐 congestion-control section |

### 引用統計

| Subtopic | 盤點題數 | Eligible | 實際引用 |
|---|---:|---:|---:|
| `im-it-network-ip-addressing-routing` | 6 | 6 | 4 |
| `im-it-network-transport` | 4 | 4 | 3 |
| **合計** | **10** | **10** | **7** |

`minimumPastPaperRefs=7` 是本 grouped lesson 經逐題 eligibility／relevance 審核後的實際 evidence threshold，不把排除題計入，也沒有借用其他 subtopic refs。

## 非官方答案揭露與風險

7 個實際 refs 的 `answerSource.official` 全為 `false`，metadata note 均指出答案是依題面與技術推導覆核，並非官方答案；confidence 均為 `medium`。因此：

1. Lesson summary 明寫「並非官方答案」。
2. 教材不宣稱取得原校 answer key。
3. Cards 只抽取 RFC 可校準的穩定概念，不把單一非官方選項字母當成唯一來源。
4. `q-pp-im-it-112-17` 即使目前 publication gate 為 true，仍因題面／答案內部衝突排除；metadata gate 不是略過語意複查的理由。

## 技術內容與 examples 自查

### Sections

1. **CIDR/subnet mask**：/n 是 significant prefix bits；network address 由 IP AND mask 求得。避免把 mask 說成 gateway、encryption 或 MTU。
2. **Forwarding/TTL**：多條 route 用 longest-prefix match；IPv4 TTL 每次 router forwarding 至少減 1，歸零丟棄，防 routing loop。
3. **Routing algorithms**：distance-vector 與直接鄰居交換 distance information；link-state 散布 link states、建立 topology database、計算 shortest-path tree；OSPF 明確屬 link-state。
4. **TCP/UDP**：TCP 為 connection-oriented reliable in-order byte stream；UDP 為低機制的 datagram service，8-byte header，不保證 delivery、duplicate protection 或 ordering。
5. **TCP windows**：rwnd 是 receiver-side flow-control limit，cwnd 是 sender-side congestion-control limit；flight size 受 `min(rwnd,cwnd)` 限制。Slow start 每 RTT 倍增只在明示 ACK／無 loss 的簡化模型下成立。

### Worked examples 可重現性

| Example | 重現檢查 | 結果 |
|---|---|---|
| `192.168.10.77/26` subnet | /26 mask=`255.255.255.192`、block size=64；77 位於 64–127 | network `.64`、broadcast `.127`、一般 hosts `.65–.126`；`.120` 同 subnet、`.130` 不同 |
| Longest-prefix + TTL | `10.20.30.77` 同時匹配 /8、/16、/24、/0，取 /24；TTL 2 在目前 router 後成 1 | 下一台 router 再轉送時成 0 並丟棄，無法再穿過兩台後續 routers |
| Routing classification | 鄰居 distance exchange vs topology database + shortest-path tree | 前者 distance-vector；後者 link-state；OSPF 屬後者 |
| TCP windows + slow start | `min(12,4)=4 MSS`；簡化序列 1→2→4→8 | outstanding 上限 4 MSS；三 RTT 後約 8 MSS，且範例明列適用條件 |

## Source registry proposals

`origin/main` 目前已有 `src-brookshear-13e` 與 `src-nthu-network-course` 的 reviewed networking scope，但本 lesson 需要精確校準 prefix、TTL、OSPF、TCP/UDP 與 congestion control，因此 artifact 另提出 6 筆 `proposedSourceRegistryEntries`。它們尚未寫入 public registry；每筆皆已於 2026-08-16 透過專案指定的 `stealth_fetch` 讀取 RFC Editor 原文後標為 `reviewed`。

| Proposed ID | 原始來源 | 核對用途 | Review evidence |
|---|---|---|---|
| `src-ietf-rfc4632-cidr` | [RFC 4632](https://www.rfc-editor.org/rfc/rfc4632.html) | 32-bit IPv4、CIDR prefix notation、address aggregation | §3.1 說明 `/` 後十進位數為 significant bits 數量 |
| `src-ietf-rfc791-ipv4` | [RFC 791](https://www.rfc-editor.org/rfc/rfc791.html) | IPv4 datagram、gateway forwarding、TTL | IPv4 header/specification 與 TTL processing |
| `src-ietf-rfc2328-ospfv2` | [RFC 2328](https://www.rfc-editor.org/rfc/rfc2328.html) | OSPF link-state、topology database、shortest-path tree | Abstract 直接定義 OSPF 為 link-state protocol |
| `src-ietf-rfc9293-tcp` | [RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html) | TCP reliable in-order byte stream、connection、sequence/window | §2.2 key TCP concepts 與 §3 functional specification |
| `src-ietf-rfc768-udp` | [RFC 768](https://www.rfc-editor.org/rfc/rfc768.html) | UDP datagram service、8-byte header、無 delivery/duplicate guarantee | Introduction 與 header format |
| `src-ietf-rfc5681-tcp-congestion` | [RFC 5681](https://www.rfc-editor.org/rfc/rfc5681.html) | rwnd/cwnd、slow start、congestion avoidance | §2 definitions、§3.1 slow start and congestion avoidance |

所有 lesson/card `sourceRefs` 都指向上述 proposed entries；card source refs 是 lesson source refs 的 subset。這些 entries 若通過獨立 review，才應由後續整合作業併入 `public/data/im-it-source-registry.json`。

## Artifact consistency checks

- Lesson ID 固定為 `lesson-im-it-network-ip-routing-transport-01`。
- Card IDs 為同一 slug 的 `01` 至 `06`，無缺號或重複。
- 1 lesson、5 sections、4 worked examples、6 cards，達第四批品質門檻。
- 每張 card 的 `lessonId` 都指向本 lesson。
- 每張 card 的 `subtopicId` 都在 lesson `coveredSubtopicIds` 內。
- 每張 card 的 past-paper refs 都是 lesson refs 的 subset。
- 每張 card 的 source refs 都是 lesson source refs 的 subset。
- Lesson 與 cards 均為 `reviewStatus: draft`，本 audit 不設 `approved=true`。

## 獨立 reviewer 必查清單

- [ ] 逐題以 `origin/main` 再核對 7 個 refs 的題面、taxonomy 與 `autoGradeEligible`。
- [ ] 判斷 `q-pp-im-it-112-17` 的排除理由是否充分，且不可在未修題面／答案前加入 refs。
- [ ] 重算 /26 example、longest-prefix match、TTL hops 與 slow-start 簡化序列。
- [ ] 檢查「TTL 至少減 1」、「flight size 不超過 min(rwnd,cwnd)」等限定語是否足夠精確。
- [ ] 透過 RFC 原文核對 6 個 proposed registry entries 的 title、author、scope、usage 與 URL。
- [ ] 確認沒有把非官方答案描述成官方 answer key。
- [ ] Reviewer 另行輸出 review artifact；作者不自行批准。
