# 112 年資訊科技概論題庫重建報告

## 結論

已依 `public/papers/pp-im-it-112.pdf` 完整重建 Q1-Q29 replacement manifest，未修改任何 `public/data` 產品檔。

- 選擇題：Q1-Q28，共 28 題，每題 2.5 分
- 問答題：Q29，共 30 分，含 (a)、(b)、(c) 三個子題
- 總分：100 分
- 圖片題：0 題；29 題皆為 `hasImage: false`
- 每一題都有 replacement answer 與重新撰寫的完整解析

## 產物

- `.work/im-it-112-replacements.json`
  - 外層包含 `sourcePdf`、`replacementCount`、`questions`
  - `questions` 內為 29 個可直接取代 `questions.json` 對應 ID 的完整 `Question` 物件
- `.work/im-it-112-answer-replacements.json`
  - 外層包含 `sourcePdf`、`replacementCount`、`answers`
  - `answers` 以 question ID 為 key，值與 `answers.json` 的單題結構相同
- `.work/build-im-it-112-replacements.js`
  - 可重現兩份 JSON 的確定性 generator
- `.work/validate-im-it-112-replacements.js`
  - 專用完整性 validator

## PDF 目視核對方法

先以 Poppler 將原卷以 220 DPI 渲染到 `tmp/pdfs/im-it-112-rebuild/`，再逐頁以 original detail 目視檢查，沒有直接採用 OCR 內容作為轉錄來源。

| PDF 頁 | 目視核對內容 |
|---|---|
| 1 | 試卷說明與 Q1-Q6；確認每題 2.5 分、五個選項與 Q3 的 `2^32` |
| 2 | Q7-Q15；確認 Q7 為 `128KB`、Q14 為 Ethernet/Exponential Backoff、Q15 完整 VLAN 題幹 |
| 3 | Q16-Q22；確認 Q18 四種 attack 敘述、Q19 program compilation、Q20 NoSQL、Q22 foreign key |
| 4 | Q23-Q28；確認 Q25 為 B-tree、Q26 spanning trees、Q27 為 inserting a key、Q28 arbitrary element |
| 5 | Q29 完整 C++ 程式與 (a)-(c)；確認函式簽名只有兩個參數 |

## Q29 關鍵修復

原產品資料的函式簽名錯誤地多出第三個參數：

```cpp
void search(string txt, string pat, string badchar)
```

原卷正確簽名為：

```cpp
void search(string txt, string pat)
```

replacement 亦補回原資料遺失的三個子題：

- (a) `txt = "ABAAABCDABC"`、`pat = "ABC"` 的輸出
- (b) 最壞時間複雜度
- (c) 最佳時間複雜度

答案為：

- (a) `pattern occurs at 4`、`pattern occurs at 8`
- (b) search phase `O(mn)`；前處理另為 `O(m + 256)`
- (c) search phase 最佳 `O(n/m)`；若計前處理為 `O(m + 256 + n/m)`

## 重判答案索引

| 題號 | 答案 | 題號 | 答案 | 題號 | 答案 | 題號 | 答案 |
|---:|:---:|---:|:---:|---:|:---:|---:|:---:|
| 1 | C | 8 | B | 15 | A | 22 | C |
| 2 | D | 9 | C | 16 | C | 23 | B |
| 3 | E | 10 | E | 17 | A | 24 | D |
| 4 | E | 11 | D | 18 | D | 25 | B |
| 5 | C | 12 | D | 19 | E | 26 | E |
| 6 | E | 13 | C | 20 | A | 27 | B |
| 7 | C | 14 | B | 21 | E | 28 | C |

Q29 為問答題，答案已完整寫入 answer replacement。

## 題面本身的注意事項

- Q18 原卷使用 `First-day attack`；依描述其實是 zero-day attack，因此重判 (D) 為錯誤敘述。replacement 忠實保留原卷字樣，解析說明術語問題。
- Q25 選項 (D) 的「每個 internal node」按嚴格定義應有 root 例外；本題預期的單一錯誤仍是 (B)，因為 k 個 children 應對應 k-1 個 keys。解析明示最低子節點數的慣例不含 root。
- Q27 原卷把 min-heap 的比較方向印成 parent key 大於等於 children（實為 max-heap 方向）；但題目所問的 binary-heap insertion 複雜度仍為 `O(log n)`。replacement 忠實保留原卷，解析標註原題不等號問題。

## 自動驗證

執行：

```bash
node .work/build-im-it-112-replacements.js
node .work/validate-im-it-112-replacements.js
```

驗證結果：

```json
{
  "questions": 29,
  "answers": 29,
  "totalPoints": 100,
  "multipleChoice": 28,
  "q29SubQuestions": 3,
  "q29Signature": "void search(string txt, string pat)",
  "hasImageTrue": 0
}
```

validator 同時確認 Q1-Q28 每題均有連續 `(A)`、`(B)`、`(C)`、`(D)`、`(E)`，Q29 含 (a)、(b)、(c)，且錯誤的三參數 `search` 簽名沒有殘留。
