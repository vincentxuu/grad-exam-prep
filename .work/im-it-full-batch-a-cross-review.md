# IM-IT full coverage Batch A cross-review

## Verdict

**目前不可直接 merge 成 reviewed canonical content。** 結構、分組、zero-ref 揭露與大部分技術敘述合格，但有三個 canonical 題目／答案契約異常、一個明確 card→lesson evidence boundary 破口、多張 cards 冒掛未直接支撐其 claim 的 refs，以及兩堂 programming lessons 的來源實質覆蓋不足。

機械抽查結果：

- 4 lessons、10/10 指定 subtopics、20 cards；每個 subtopic 正好 2 cards。
- 16 個 unique lesson refs 在 metadata 與 answer review **旗標上**皆為 eligible。
- 其中 3 refs 的目前題面與 reviewed answer/reasoning 不相容，不能因 eligibility flag 為 true 就使用。
- 5 個 zero-direct subtopics 均有 `evidenceNote`，其 10 張 cards 均維持空 `pastPaperRefs`。
- 1 張 card 引用了不在所屬 lesson `pastPaperRefs` 的題目；另有數張 card 的 refs 雖在 lesson 內，卻不直接支撐 card claim。

## Must-fix

### 0. Logic/circuits lesson 的三個 refs 全部不在 lesson coverage

`lesson-im-it-arch-logic-circuits-01` 覆蓋 number-systems、Boolean-logic、digital-circuits，但三個 refs 的 canonical primary subtopic 分別是：

- `q-pp-im-it-106-11` → `im-it-arch-data-representation`
- `q-pp-im-it-112-1` → `im-it-arch-cpu-organization`
- `q-pp-im-it-113-4` → `im-it-arch-cpu-organization`

因此 0/3 refs 屬於 lesson coverage。`evidenceNote` 雖誠實揭露它們是 adjacent evidence，但 canonical reviewed lesson 契約要求 `pastPaperRefs` 對回 `coveredSubtopicIds`；這三題不能留在 direct `pastPaperRefs` 或用來滿足 `minimumPastPaperRefs`。

建議移除 refs，讓該課明確成為 source-backed foundational lesson，或先擴充 schema 支援 `adjacentPastPaperRefs`。不建議只把它併入 I/O lesson：這三題的 primary topics 是 data representation/CPU organization，同樣不是 I/O；若擴大 coverage 又會和既有 canonical lessons 重複。

### 1. 移除或先修復三筆失真的 canonical refs

| Ref | Fragment 使用處 | 問題 |
|---|---|---|
| `q-pp-im-it-112-3` | I/O lesson | 現有題面只有 A–D，reviewed answer 是 `E`；題面 B 也有明顯殘缺。`answerPresent=false`。 |
| `q-pp-im-it-112-4` | I/O lesson、兩張 I/O cards | 現有題面只有 A–D，reviewed answer 是 `E`；選項文字亦有抽取錯位。`answerPresent=false`。 |
| `q-pp-im-it-112-19` | Runtime lesson、兩張 runtime cards | 題面是 relational database，answer review reasoning 卻談 assembler、linker、static/dynamic linking；題面只有 A–D，reviewed answer 又是 `E`。這是明確 question/review content mismatch。 |

處置：在 canonical questions/metadata/answer review 修復並重新驗證前，Batch A 不得引用這三題，也不得靠它們滿足 `minimumPastPaperRefs`。I/O lesson 可暫留 110-6、113-7，但需降低 evidence count 或補其他已驗證 ref；runtime lesson 目前只剩 software-lifecycle refs，不能宣稱 language-runtime evidence 已完成。

### 2. 修復 card evidence boundary 與 primarySubtopic mismatch

`card-im-it-prog-language-runtime-a1` 引用 `q-pp-im-it-110-11`，但：

- 這題不在其所屬 `lesson-im-it-prog-runtime-quality-lifecycle-01.pastPaperRefs`。
- Canonical primary subtopic 是 `im-it-prog-syntax-types-control`，不是 `im-it-prog-language-runtime`。

現有 validator 只檢查 card ref 是否 globally eligible，沒有檢查 `card.pastPaperRefs ⊆ lesson.pastPaperRefs`、也沒有檢查 card ref primary subtopic，因此錯誤通過。Validator 必須補上兩項約束；若允許 cross-subtopic evidence，需有明確 `evidenceType=adjacent`，不能當 direct card ref。

### 3. 移除未直接支撐 card claim 的「冒掛 refs」

以下 cards 的 claim 與題目實際內容不一致，即使 ref eligibility 為 true 也不能掛：

- `card-im-it-prog-syntax-types-control-a2` 講 loop tracing/off-by-one；refs 是 Python paradigms、dynamic typing、type system，沒有 loop 題。
- `card-im-it-prog-functions-scope-a1` 講 scope vs lifetime；唯一 ref 114-1 只問 recursion purpose。
- `card-im-it-prog-language-runtime-a1/a2` 主要講 assembler/compiler/linker 與 static/dynamic linking；112-19 是錯接的 database 題，110-11 最多直接支撐 assembly/interpreter 基本定義，且不在該 lesson refs。
- `card-im-it-prog-software-lifecycle-a2` 講 Git、CI/CD；106-23 與 110-10 只支撐 development diagrams/UML，沒有 Git 或 CI/CD。
- `card-im-it-arch-io-performance-a1/a2` 使用 112-4；在該題修復前應移除。A1 尚可由 113-7 直接支撐 polling/vectored interrupt，A2 的 DMA evidence 則暫時為零。

處置原則：無 direct evidence 的 card 可以保留為 sourced foundational card並使用空 `pastPaperRefs`；不可為了讓陣列非空而掛相鄰題。

### 4. Programming lessons 的 sourceRefs 不足以支撐內容

兩堂 programming lessons 全部只引用 `src-oracle-oop-concepts`。Canonical registry 顯示它是 Oracle 的 **Object-Oriented Programming Concepts** tutorial，usage 是 `terminology-and-concept-check`；Batch A 卻用它支撐：

- Python dynamic typing、programming paradigms、loops、recursion、lexical scope；
- raw pointers、manual memory、stack/heap、use-after-free；
- compiler/assembler/linker、static/dynamic linking、JIT；
- exceptions/assertions、unit/integration/system testing；
- requirements、UML、Git、CI/CD 與完整 SDLC。

這超出該來源的實質範圍。尤其 pointer/manual memory、toolchain、testing/CI 與 UML/SDLC 不是 OOP concepts page 可合理支持的內容。需加入對應的既有 reviewed source；若 registry 沒有，就先建立並 review 專門來源 fragment。在 source closure 完成前，這兩堂 lesson/cards 不應標成 `reviewed`。

## Should-fix

### 1. 補強 I/O lesson 的內容結構

`lesson-im-it-arch-io-performance-01` 只有 3 sections；其 objectives 還包含 pixel resolution vs printer dpi，但該概念只出現在 summary/exam cue，沒有獨立 section、worked example 或 card。建議補第四節「display/printer metrics」，或把該 objective 從本課移除，讓 objective、教學內容與 assessment 一致。

### 2. 修正文案錯字

- `收旂` 出現 3 次，應改為 `收斂`。
- Exam cue 的 `link er` 應為 `linker`。

這些不改變技術結論，但會直接出現在學習內容，不宜帶入 canonical artifacts。

### 3. Runtime/testing/lifecycle 可先維持一課，但應保留拆課條件

「source → build → test → delivery」故事能讓三個 subtopics 共用情境，目前不算不合理過度分組；但 toolchain 與 SDLC/testing 的來源、examples 和考題證據不同。未來 direct refs 或專門 sources 增加後，宜拆成 runtime/toolchain 與 quality/lifecycle 兩課，避免 36 分鐘只做表面掃描。

## Passed

### 分組與技術骨架

- Number systems → Boolean logic → combinational/sequential circuits 是自然的底層進程，沒有硬湊。
- Syntax/types/control → functions/scope/recursion → pointers/lifetime 可用「程式狀態與生命週期」串起；mapping boundary 也有區分 raw pointer 與 garbage-collected languages。
- I/O lesson 對 polling、interrupt、ISR、DMA、latency/throughput 的核心區分正確；DMA boundary 有明示 CPU 仍負責設定與完成處理。
- Runtime lesson 對 compiler/interpreter/assembler/linker、exception/assertion/test、unit/integration/system test 的概念區分大致正確；主要問題是 evidence/source，不是技術主幹。

### Learning scenarios

四課都有 hook、predict、5 組 mapping、明確 boundary 與 4 exam cues：

- 舞台燈光能對應 bit、logic、mux、flip-flop/register，且 boundary 補出 propagation delay、clock 等未映射事項。
- 倉庫比喻能區分 polling、interrupt 與 DMA，且沒有宣稱 CPU 完全退出。
- 圖書館索引能表達 reference 與 object 分離，並明示不同語言的 memory model 不同。
- 餐廳上線流程雖是簡化模型，但 boundary 已明示 bytecode/JIT/native 可混合及 testing 不證明零缺陷。

### Zero-ref 與 card 數量

- 五個真正 zero-direct subtopics 均逐一揭露：number systems、Boolean logic、digital circuits、pointers/memory、error/testing。
- 這五類 cards 的 `pastPaperRefs` 全空，沒有拿 lesson-level adjacent refs 偽裝 direct evidence。
- 10 個 subtopics 每個恰有 2 cards；lesson/card IDs 唯一。

### Source closure 的機械層

所有 source IDs 都存在且 canonical status 為 reviewed；Brookshear 對 architecture、I/O、logic/circuits 的概論內容可接受。未通過的是 Oracle source 的**語意覆蓋範圍**，不是 ID closure。

## Validator gaps

Batch A validator 應新增：

1. 同時檢查 metadata `publication.practiceEligible/autoGradeEligible`，而非只讀 answer review。
2. Choice answer 必須存在於當前題面 options。
3. Card refs 必須是所屬 lesson refs 的 subset。
4. Direct card refs 的 `primarySubtopicId` 必須等於 card subtopic；跨 topic 需顯式標 adjacent。
5. Question text、answer reasoning 與 taxonomy 的 mismatch audit，至少對 fragment 所引用 refs 做人工或規則抽查。
6. Source 不只檢查 ID/status，還需檢查 scope/usage 是否支撐 lesson/card claim。

## Merge gate

完成下列條件後才建議通過：

- 修復或移除 112-3、112-4、112-19。
- 從 logic/circuits direct `pastPaperRefs` 移除三個 coverage 外 refs，或先落實 adjacent evidence schema。
- 清除 card evidence boundary 與 semantic ref mismatches。
- 為兩堂 programming lessons/cards 補足真正支撐各節內容的 reviewed sources。
- 修正文案錯字並補齊 I/O objective/content 對齊。
- 更新 validator，確保上述錯誤無法再次以 `ok: true` 通過。
