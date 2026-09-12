# IM-IT full-coverage mainline merge/validator review

## Verdict

**目前不可安全執行 `node scripts/merge-im-it-full-coverage.mjs --write`。** Final validator 對 61/61 唯一覆蓋、blocked refs、lesson question primary match 有重要防線，但 merge script 不會在寫入前執行這些檢查；而目前 in-memory merge candidate 已知違反「每個 subtopic 至少 2 cards」。若直接 `--write`，三個 canonical artifacts 會先被逐檔覆寫，之後 validator 才能發現失敗。

目前 fragments 與 baseline 合併後的只讀統計：

| Artifact | Baseline | Fragments | Candidate |
|---|---:|---:|---:|
| Lessons | 20 | 15 | 35 |
| Cards | 122 | 66 | 188 |
| Sources | 26 | 5 | 31 |
| Covered subtopics exactly once | 28 baseline | 33 new | 61/61 |

IDs 均唯一、61 個 subtopics 均恰好覆蓋一次；但：

- `im-it-ds-complexity-analysis`：0 cards
- `im-it-ai-foundations-search`：1 card

至少還需補 3 張 cards 才能滿足每 subtopic ≥2，因此在不移動其他 cards 的前提下，最終 card count 至少應為 **191**，不是目前 merge candidate 的 188。

## Must-fix

### 1. Merge 必須在寫入前驗證完整 candidate

`merge-im-it-full-coverage.mjs` 現在只檢查：

- fragments 合計至少有一堂 lesson、一張 card；
- lesson/card/source IDs 不重複。

它沒有在 `--write` 前檢查 coverage、cards per subtopic、question eligibility、blocked refs、source closure 或 artifact counts。實際 dry run 仍輸出：

> Ready to merge 15 lessons, 66 cards, and 5 sources. Use --write.

但同一 candidate 已知有兩個 card coverage failures。必須把 final validation 抽成可接受 in-memory candidate 的共用函式，merge 在任何寫入前先呼叫；dry run 也應回報完整 validation，而不是只回報 additions count。

### 2. 不得把缺 fragment 當空陣列繼續

`readItems()` 對不存在的檔案回傳 `[]`，merge 又只檢查所有 batches 合計不為零。因此遺失整個 Batch A/B/C 的 lesson/card/source fragment 時，仍可能進入 merge 流程。

應要求：

- A/B/C 的 lessons 與 cards fragment 全部存在；
- sources fragment 依 manifest 明示 required 或 intentionally empty；
- wrapper 的 `schemaVersion`、`subjectId=im-it`、batch identity、status 與 declared counts 正確；
- 不接受 raw array 或錯 key 的 silent fallback。

### 3. 寫入三個 canonical JSON 必須避免 partial commit

目前依序直接 `writeFileSync` lessons、cards、sources。第二或第三次寫入失敗時，workspace 會留下互相不一致的 canonical artifacts。

至少應：

1. 先生成三個完整字串並通過 candidate validation；
2. 寫入同目錄 temporary files；
3. 全部成功後再 rename/replace；
4. 或保存原內容並在任一步失敗時 rollback。

### 4. 先補齊兩個既有 subtopics 的 cards

Final validator 的 `for (canonicalSubtopics) cards.length < 2` 檢查是正確的，但目前只能在 canonical 寫入後執行。Merge candidate 必然因 complexity-analysis 0 張、AI foundations-search 1 張而失敗。

需在 fragment/專用 correction fragment 中補：

- `im-it-ds-complexity-analysis` 至少 2 cards；
- `im-it-ai-foundations-search` 至少再 1 card；
- cards 必須連到已覆蓋該 subtopic 的 lesson，sourceRefs/pastPaperRefs 遵守同一 boundary。

### 5. Final validator 必須同時讀 answer review 與原題選項

目前只讀 `im-it-question-metadata.json`，檢查 metadata `autoGradeEligible` 與 confidence 非 disputed；沒有檢查：

- metadata `practiceEligible`；
- `im-it-answer-review.json` 的 status、practice/auto-grade eligibility；
- reviewed answer 是否存在於目前 question options；
- question text 與 review reasoning 是否仍相符。

四個 blocked IDs 可攔住已知事故，但不能攔住下一筆像 112-19 的錯接。至少要載入 answer review 與 `questions.json`，要求 metadata/review 雙重 eligible、status confirmed/corrected、choice answer 存在於 options；content mismatch 仍需 review manifest 或 fingerprint gate。

### 6. 動態驗證 8 個 zero-direct 與 language-runtime 唯一 unsafe ref

Validator 已正確列出 8 個 `zeroDirectRefSubtopics`，也把 `im-it-prog-language-runtime` 放進 unsafe-only set；但只是 hard-coded set，沒有驗證 metadata baseline 仍成立。

應新增：

- 對 8 個 zero-direct subtopics，metadata direct question count 必須都是 0；
- `im-it-prog-language-runtime` 的 direct refs 必須恰為 `q-pp-im-it-112-19`，且該題仍在 blocked set；
- 若未來新增安全 direct ref，validator 應要求更新 evidence policy，而不是永久把該 subtopic 當 foundational。

目前只讀重算確認 baseline 仍是：8 題組各 0；language-runtime 只有 112-19，雖 metadata 仍標 auto-grade eligible，但題面/review 已知不相容。

### 7. Card/source reviewed contract 仍有 vacuous pass

Validator 只要求 `card.sourceRefs` 全部位於 lesson sources；空陣列會 vacuously pass，也沒有檢查 `card.reviewStatus === reviewed`。因此 draft card 或無來源 card 可進 canonical。

必須要求：

- 每張 card 至少一個 sourceRef；
- card reviewStatus 是 reviewed；
- source ID 存在且 status reviewed（可透過 lesson subset 加直接 assertion）；
- source registry IDs 唯一，新增 sources 全部 reviewed；不能讓未被任何 lesson 引用的 unreviewed source 偷渡進 registry。

### 8. Artifact totals 需有 merge manifest，而非只自我一致

Final validator 會檢查 `counts.lessons === lessons.length`、coveredSubtopics=61、coveredQuestions unique size、totalCards 等於 cards length，這能防止 stale counts；但只要內容與 count 一起多加，仍會通過。

Merge 應先鎖 baseline（20 lessons、122 cards、26 sources、28 covered subtopics）及各 batch declared additions，生成 manifest 後驗證 final totals。依目前 fragments 是 35/188/31，但 188 已知不滿足 card floor；補最少 3 cards 後，若沒有其他調整，manifest 應是 **35 lessons、191 cards、31 sources**。任何不同 totals 都應要求更新 reviewed manifest，而不是默默接受。

### 9. Past-paper refs 必須唯一，不能用重複值灌水

Lesson minimum 現在用 `lesson.pastPaperRefs.length` 判斷；同一 question ID 重複多次即可灌高 count。應要求每堂 `pastPaperRefs` unique，並用 `new Set(...).size` 比較 `minimumPastPaperRefs`。Card refs/source refs 也應去重。

## Should-fix

### 1. Evidence note 不應只檢查 truthy

Foundation lesson 目前只要存在任何 `evidenceNote` 字串就通過。應要求 note 明列對應 no-safe subtopic、zero/unsafe 原因，以及 refs 是 direct 或 adjacent，避免填入無資訊文字。

### 2. Source closure 可加入 scope review manifest

ID/status closure 無法證明來源真正支撐 lesson claims。建議保存 lesson→source scope review manifest，至少對新 lesson 鎖定已人工確認的 source IDs；這能避免再次發生「OOP concepts 支撐 pointer/toolchain/CI」的情況。

### 3. 驗證 fragment wrapper 與 canonical top-level status

三 batches 現在使用不同 wrapper 欄位：`batchId`、`scope`、`batch`，status 也有 `reviewed`/`reviewed-fragment`。Merge 完全忽略 wrapper。應統一 fragment schema，並確認合併後 canonical lesson/card status 仍為 reviewed。

### 4. Scenario/content 最低欄位可更完整

Final validator 只檢查 mapping 數量與 exactly 4 cues，沒有檢查 hook、predict、boundary 或 mapping entry 文字。這不屬本次 evidence safety 核心，但至少應與 batch validators 使用同一完整度 contract。

## Passed

### 61/61 恰好一次

這部分設計扎實：canonical taxonomy 必須為 61 個 unique IDs；每個 lesson coverage 只能引用 canonical IDs；`countsBySubtopic` 最後要求每個 count 恰為 1。未知、缺漏與重複 coverage 都會失敗。

### 每個 subtopic 至少 2 cards 的 final rule

Final validator 確實逐一計算 61 個 subtopics 的 cards 並要求至少 2。規則正確，也成功揭露目前 candidate 的兩個缺口；問題在 merge 沒有 preflight，並非此 loop 本身。

### Lesson question primary/blocked gates

- 四個 blocked refs 112-3、112-4、112-19、112-26 已明確列入並在 lesson refs 層拒絕。
- Lesson question 必須存在、primarySubtopic 位於 lesson coverage、autoGrade eligible 且 confidence 不為 disputed。
- Card refs 必須是 parent lesson refs 的 subset，且 primarySubtopic 必須等於 card subtopic。
- No-safe-direct cards 被禁止掛 past-paper refs。

因 card refs 是 lesson refs subset，blocked ref 無法只從 card 偷渡。

### Lesson source closure

Lesson 至少一個 source，且每個 source 必須存在並為 reviewed；card source 不能逃出 parent lesson boundary。這是良好基礎，只需補 card 非空/reviewStatus 與 registry uniqueness。

### Artifact count self-consistency

Lessons counts、61 covered subtopics、unique covered questions、cards total 都會和實際 arrays 比對，能攔截 merge 後忘記更新 count 的錯誤。

## Recommended release sequence

1. 先補 3 張缺少的 cards，更新 reviewed batch/correction manifest。
2. 抽出可對 in-memory candidate 執行的 validator，補 answer-review、8+1 baseline、card/source status 與 ref uniqueness gates。
3. Merge dry run 必須呼叫完整 validator並顯示 61/61、每科 card floor、final totals。
4. `--write` 使用 temp files/rollback；完成後再對 disk artifacts重跑同一 validator。
5. 只有 preflight 與 post-write validation 都通過，才可宣稱 safe merge。
