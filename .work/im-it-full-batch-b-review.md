# IM-IT 61/61 Batch B review

## 交付範圍

- 5 個 lesson fragments，完整覆蓋指定 9 個 subtopics。
- 18 張 concept cards，每個 subtopic 恰有 2 張。
- 沒有修改 `public/data` canonical artifacts 或共用 lesson 程式。
- 沒有新增 source fragment；現有 4 個 reviewed sources 已足夠閉合所有內容。

## 課程合併設計

1. 線性資料結構＋雜湊：共同回答「依操作需求選容器」，使用 MIT 6.006。
2. 圖論＋演算法設計：由 graph traversal／topological sort／MST 進入 greedy、divide-and-conquer、DP 與 correctness。
3. ER 建模＋正規化：由概念模型一路映射至 relations 與 functional dependencies。
4. 儲存與索引：獨立處理 page I/O、B+ tree、hash index 與 OLAP。
5. 同步＋死結：由 race/critical section 進入 liveness 與 resource-allocation safety。

## Evidence decisions

- 所有保留的 `pastPaperRefs` 均在 canonical question metadata 與 answer review 中同時為 practice/auto-grade eligible，reviewed answer 也存在於現有選項。
- 排除 practice-ineligible 的程式題、證明題與 disputed normalization 題。
- `im-it-ds-algorithm-design` 有 0 個 direct primary refs；`im-it-ds-graphs` 本課也只有 1 題內容完整的 topological-sort ref。Lesson 的 `evidenceNote` 同時揭露 zero-direct 與 sparse evidence，不宣稱歷屆高頻；其餘 graph/design cards 只由 reviewed source 支撐並保持空 paper refs。
- 正規化未採用 113-19、113-20，雖 metadata 標 eligible，但目前 explanations 與題面明顯錯置；fragment 採 111-14、114-13，避免把不一致解析寫入課程。
- 112-26 題面破碎，已從 graph lesson 與 MST card 完全移除；graph lesson 的 `minimumPastPaperRefs` 調為 1。
- 交叉審查後移除所有只屬同領域、卻不直接支撐 card claim 的 refs：general ADT choice、collision strategies、MST comparison、ER many-to-many、race condition、binary/counting semaphore、Coffman conditions。這些 cards 保留 reviewed sourceRefs，但不冒掛考古題。
- Average hash complexity card 只保留直接問 average O(1) 的 115-1；其餘 direct card refs 由 validator manifest 鎖定。

## Source closure

- `src-mit-algorithms-6006`：data structures、graphs、algorithm design。
- `src-brookshear-13e`：database 與 operating-system conceptual summaries。
- `src-jiege-database-course`：ER、normalization、storage/indexing。
- `src-nthu-os-course`：synchronization、deadlock、Banker's algorithm。

以上 sources 在 canonical registry 均為 `status=reviewed`；未抓取新網頁，也未引入未審核來源。

## Validator

執行：

```bash
node .work/validate-im-it-full-batch-b.mjs
```

檢查 exact subtopic coverage、每 subtopic 至少 2 cards、lesson 完整度、scenario 4–5 mappings／至少 4 cues、reviewed source closure、metadata/review 雙重 eligibility、answer 是否存在於選項、lesson primary coverage、card refs 是否屬於 parent lesson 與相同 primarySubtopic，以及交叉審查後的 direct-evidence manifest。

## Cross-review corrections

- Normalization lesson/card 補入正式 3NF 判斷：對每個 non-trivial FD `X→A`，`X` 是 superkey 或 `A` 是 prime attribute；transitive-dependency 敘述只保留為入門口訣。
- Storage lesson 改用「highly selective predicate／低符合比例」，避免不同教材對 high/low selectivity 的術語方向不一致。
