# 英文練習路線放置建議

## 建議結論

最適合放在既有的 `/{exam}/plan`（備考計畫）頁，位置放在「整體進度」之後、「Phases」之前，做成一張精簡的「英文練習路線」卡。

理由：

- 「路線」是有順序的練習流程，和 plan 頁既有的階段、任務、進度語意一致。
- header 已有 10 個 exam-level 入口，且採水平捲動；再新增「英文路線」只會和「閃卡／閱讀／閱讀練習／題庫／模擬考」重複並加重導覽。
- `/{exam}` 首頁的責任是考科總覽；它已透過英文 SubjectCard 導到 `/{exam}/subjects/{englishId}`，不適合再塞完整步驟。若需要提升曝光，只要未來在英文 SubjectCard 或英文 subject page 放一個「查看練習路線」CTA，連回 plan 即可。
- plan 頁可依 `exam` 動態套用 `im-english` / `cs-english`，不必新建 route。

建議路線順序：字彙閃卡 -> 輔助閱讀／閱讀練習 -> 考古題題庫 -> 計時模擬 -> 錯題回顧。

## 可直接連結的 route/query

### 資管所

| 用途 | URL | 備註 |
|---|---|---|
| 英文科目頁 | `/im/subjects/im-english` | 首頁英文 SubjectCard 的既有目的地 |
| 英文字彙閃卡 | `/im/flashcards?subject=im-english` | `subject` query 已支援 |
| 貼文輔助閱讀 | `/im/reading` | 目前不支援預載文章 query |
| 精選閱讀練習 | `/im/reading-practice` | topic filter 只存在 component state，尚無 query |
| 全部英文題庫 | `/im/questions?subject=im-english` | `subject` query 會選中英文 tab |
| 指定年份英文題庫 | `/im/questions?subject=im-english&year=111` | `year` query 已支援 |
| 指定考卷題庫 | `/im/questions?paper=pp-im-en-111&subject=im-english` | 帶 `subject` 可避免停在其他科 tab |
| 英文模擬考 | `/im/mock?subject=im-english&year=111` | `subject`、`year` 均已支援 |
| 錯題本 | `/im/review` | 目前無科目 query |
| 標準備考計畫 | `/im/plan?plan=im-standard-8m` | `plan` query 已支援 |
| 不補習計畫 | `/im/plan?plan=im-nocram-6m` | `plan` query 已支援 |

### 資工所

| 用途 | URL | 備註 |
|---|---|---|
| 英文科目頁 | `/cs/subjects/cs-english` | 首頁英文 SubjectCard 的既有目的地 |
| 英文字彙閃卡 | `/cs/flashcards?subject=cs-english` | `subject` query 已支援 |
| 貼文輔助閱讀 | `/cs/reading` | 無 query |
| 精選閱讀練習 | `/cs/reading-practice` | 無 query |
| 全部英文題庫 | `/cs/questions?subject=cs-english` | `subject` query 已支援 |
| 指定年份英文題庫 | `/cs/questions?subject=cs-english&year=110` | `year` query 已支援 |
| 指定考卷題庫 | `/cs/questions?paper=pp-cs-en-110&subject=cs-english` | 單卷檢視 |
| 英文模擬考 | `/cs/mock?subject=cs-english&year=110` | `subject`、`year` 均已支援 |
| 錯題本 | `/cs/review` | 無科目 query |
| 標準備考計畫 | `/cs/plan?plan=cs-standard-8m` | `plan` query 已支援 |

## 不建議的落點

- 不新增 header 項目：工具入口已齊全，缺的是順序引導，不是另一個平行入口。
- 不把完整路線放 `/{exam}` 首頁：該頁目前是穩定的考科/招生總覽，英文專屬流程會使首頁偏科。
- 不以 `reading-practice` 當路線首頁：它只涵蓋閱讀，無法串起閃卡、考古題、模擬考與錯題本。

## 實作時需注意

- `questions` 的 `subject` query 只控制 Tabs 選中項目；資料篩選由各 TabsContent 再依 subjectId 完成，現有直連可用。
- `reading-practice` 的 topic、`flashcards` 的 mode/tier/search、`review` 的科目目前都沒有 URL state；不要產生看似可用但實際無效的 query。
- 模擬考的年份要選內容已標為 reliable 的考卷，否則頁面會顯示不可計分警告。
