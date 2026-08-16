# pp-im-en-112 缺文章稽核

## 進度

- [x] 確認範圍：第 16、21、26、49、50 題
- [x] 檢查現有 questions.json 結構與文章嵌入慣例
- [x] 從原始 PDF 定位題目與文章頁碼
- [x] 產出可直接套用的精確修復資料

## 結論

這不是五篇文章遺失，而是四個已夾帶文章的母題缺少題組範圍標頭，導致
`scripts/check-paper-integrity.js` 無法建立 coverage：

| 實際題組 | 文章目前所在題目 | PDF 證據 | baseline 為何列出該題 |
| --- | --- | --- | --- |
| 16–20 | Q16，開頭為 `Passage I`，全文已在 | 第 2 頁 | `Passage I` 沒有 `Questions 16-20`，也沒有檢查器接受的冒號 |
| 21–25 | Q21，開頭為 `Passage II`，全文已在 | 第 2 頁（選項延續至第 3 頁） | 同上 |
| 26–30 | Q26，開頭為 `Passage III`，全文已在 | 第 3 頁 | 同上 |
| 46–50 | Q46，閱讀文章全文已在 | 第 5–6 頁；Q49–50 在第 7 頁 | 文章前完全沒有題組範圍；Q49、Q50 文字有 `According to the passage` |

因此 Q49、Q50 本身不應重複嵌入文章；應讓 Q46 成為 46–50 的唯一母題。

## PDF 核對到的精確題幹與選項

以下是這次 baseline 指到的五題；文章本文已存在於相應母題，沒有缺段：

```text
16. (A) reigned  (B) privileged  (C) jolted  (D) thwarted

21. (A) reassuring  (B) tumultuous  (C) polarizing  (D) converting

26. (A) problem  (B) prospect  (C) pretense  (D) protest

49. According to the passage, which of the following is NOT true.
(A) There are ten suspects in Agatha Christie's And Then There Were None.
(B) Paying attention to hints helps solve the mystery in detective stories.
(C) Everyone should be provided with an alibi at the end of detective stories.
(D) An ominous, uneasy mood can be seen in Sir Arthur Conan Doyle's Sherlock Holmes.

50. According to the passage, which of the following is true?
(A) François-Eugène Vidocq wrote the first mystery story in April 1841.
(B) Edgar Allan Poe founded the world's first detective bureau in Paris.
(C) François-Eugène Vidocq and Agatha Christie are both mystery story writers.
(D) Philip Marlowe is a private detective in Raymond Chandler's novels.
```

PDF 的文章位置與資料對應：

- 第 2 頁 `Passage I`：Mauna Loa，空格 16–20；現有 Q16 的 1,296 字包含全文與 Q16 選項。
- 第 2 頁 `Passage II`：Queen Elizabeth II 訃聞，空格 21–25；現有 Q21 的 1,674 字包含全文與 Q21 選項。
- 第 3 頁 `Passage III`：Queen Elizabeth 生平，空格 26–30；現有 Q26 的 996 字包含全文與 Q26 選項。
- 第 5–6 頁 Reading：mystery genre 的十項元素；現有 Q46 的 4,894 字包含全文與 Q46 選項，Q47–50 各自只放題目是正確的題組慣例。

## 確定性修復 recipe

只需在四個母題的既有 `text` 前加標準題組標頭；不要改寫或搬動文章，也不要改 Q49、Q50：

```js
const ranges = [
  [16, 20],
  [21, 25],
  [26, 30],
  [46, 50],
]

for (const [first, last] of ranges) {
  const q = data.questions.find(
    (item) => item.paperId === 'pp-im-en-112' && item.number === first
  )
  const header = `Questions ${first}-${last} refer to the following passage.`
  if (!q.text.startsWith(header)) q.text = `${header}\n\n${q.text}`
}
```

套用後四筆應精確變成：

```text
q-pp-im-en-112-16.text = "Questions 16-20 refer to the following passage.\n\n" + 原 Q16.text
q-pp-im-en-112-21.text = "Questions 21-25 refer to the following passage.\n\n" + 原 Q21.text
q-pp-im-en-112-26.text = "Questions 26-30 refer to the following passage.\n\n" + 原 Q26.text
q-pp-im-en-112-46.text = "Questions 46-50 refer to the following passage.\n\n" + 原 Q46.text
```

這符合題庫既有慣例（例如其他考卷使用
`Questions 21-25 refer to the following passage.`，並只把文章放在題組第一題）。

我以與 integrity checker 相同的 range/refers-to 規則做記憶體內驗證，結果為：

```json
{"covered":[[16,20],[21,25],[26,30],[46,50]],"orphan":[]}
```

套用正式資料後再執行 `node scripts/check-paper-integrity.js`，應看到 baseline 的
`缺文章：pp-im-en-112 ...` 被列為已修復；之後才從 baseline 移除該字串。

## 額外發現（同一 PDF 的忠實度，不影響缺文章判定）

Q46 有兩個現存轉錄差異，可在實作修復時一併校正：

1. 文章首段現為 `Francois-Eugène Vidocq`；PDF 第 5 頁是 `François-Eugène Vidocq`。
2. Q46 選項 C 現為 `What not to do when writing a mystery story`；PDF 第 6 頁是
   `What not to do when writing a good mystery story`。

除此之外，這次指定的五題題幹、選項及其文章內容均已與 PDF 頁面核對，沒有發現文章缺段。
