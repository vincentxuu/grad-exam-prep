# IM-IT full coverage Batch A review

## Merge verdict

Batch A fragments 已依 cross-review 修正，可進入主線 merge review。交付仍是 4 lessons、10 個指定 subtopics、20 cards（每 subtopic 2 cards），未修改 canonical public artifacts。

## Evidence corrections

- `lesson-im-it-arch-logic-circuits-01` 的三個 subtopics 都是 0 direct primary refs；`pastPaperRefs=[]`、`minimumPastPaperRefs=0`，`evidenceNote` 明示 reviewed-source-backed foundational coverage，不再冒掛 data-representation／CPU 題。
- I/O lesson 移除題面／答案不閉合的 112-3、112-4，只保留 110-6（display/printer resolution）與 113-7（interrupt），並補第四節讓 resolution objective 有實際教學內容。
- Programming runtime lesson 移除題面與 answer-review mismatch 的 112-19。Language runtime 現在沒有安全 direct refs；runtime cards 維持空 refs。
- Runtime-quality-lifecycle lesson 保留兩個題面完整的 software-lifecycle refs：106-23、110-10；它們只支撐 development diagrams／UML 的窄幅辨識點，不歸因於 NIST SSDF。
- Card refs 已逐張收斂：移除 loop、scope、runtime、DMA 與 lifecycle cards 上語意不直接支撐的 refs。每個非空 card ref 都同時存在於 parent lesson，且 canonical `primarySubtopicId` 等於 card subtopic。
- 10 個 lesson refs 均同時通過 metadata practice/auto-grade eligibility、answer-review eligibility、reviewed answer 確實存在於目前題面 options，以及 lesson coverage 對應。

## Source closure

既有 reviewed source：

- `src-brookshear-13e`：number systems、logic/circuits 與 I/O overview。

Batch A 新增 reviewed source fragment：

- `src-oracle-java-language-basics`（`documentation`）：只支撐 Java variables、operators、expressions、statements、blocks、control flow。
- `src-cpp-core-guidelines`（`official-guidance`）：只支撐 C++ functions、scope/lifetime、pointers/resource management、error handling/assertions。
- `src-gcc-overall-options`（`documentation`）：只支撐 GCC preprocessing、compilation、assembly、linking 與 `-E/-S/-c`。
- `src-nist-ssdf-800-218`（`official-guidance`）：只支撐 SSDF Prepare、Protect、Produce、Respond、風險導向 verification 與 vulnerability response。

每筆新 source 都有 `scopeBoundary`，validator 會檢查 source type、reviewed status 及每個 subtopic 允許的 source IDs。UML 辨識只由完整 past-paper stems 支撐；NIST SSDF 未被用作 UML、Git、CI/CD 或 compiler 來源。

## Content changes

- 修正 `收旂` 為 `收斂`、`link er` 為 `linker`。
- I/O lesson 現有 4 sections，objective、section、exam cue 對齊。
- Runtime lesson 收斂為 GCC toolchain、C++ error handling、互補 verification、NIST SSDF 與一個窄幅 past-paper diagram cue；移除缺來源的 Git／CI/CD 教學與廣泛 UML 教程。
- Runtime/toolchain、error/testing 的 cards 為 source-backed foundational cards，不宣稱直接考古題證據。

## Validator

執行：

```bash
node .work/validate-im-it-full-batch-a.mjs
```

Validator 現在額外檢查：

- metadata 與 answer review 的 practice/auto-grade eligibility；
- reviewed answer 必須存在於當前題面選項；
- 禁用三個已知 semantic-mismatch refs；
- lesson refs 的 primary subtopic 必須落在 lesson coverage；
- card refs 必須是 parent lesson refs 的 subset，且 primary subtopic 必須等於 card subtopic；
- source status、`LearningSource.type`、scope boundary 與 subtopic allowlist；
- zero-direct／unsafe-direct cards 不得聲稱 paper evidence；
- 不可殘留舊 Oracle OOP source、錯字或已刪除的 unsupported lifecycle claims。

最新結果：`ok: true`；4 lessons、10 covered subtopics、20 cards、10 eligible lesson refs、5 reviewed sources、0 unsafe direct card refs。

## Remaining limitations

- Number systems、Boolean logic、digital circuits、pointers/memory、error/testing 沒有 canonical direct primary refs。
- Language runtime 的 canonical direct evidence 目前不安全，因此也以 source-backed foundational coverage 呈現。
- Software lifecycle 的兩題只支持 diagram/UML 辨識，不能外推為完整 SDLC 證據。
- 所有 past-paper answers 仍是非官方技術覆核；full mock eligibility 不因本 fragment 改變。
