# 計概題庫對原始 PDF 稽核：106–110

稽核日期：2026-08-16
權威來源：`public/papers/pp-im-it-{106..110}.pdf`
比對對象：`public/data/questions.json`、`public/data/qfiles/q-pp-im-it-*.json`、`public/data/question-images.json`

## 方法

- 用 Poppler 將 5 份 PDF 全部 16 頁渲染為 PNG，逐頁視覺核對。
- 用 Tesseract `eng+chi_tra` OCR 作為逐題文字差異篩選；OCR 只協助定位，最終判定以 PNG 視覺內容為準。
- 逐卷核對題數、題號、題幹、選項、公式、程式碼、表格與圖片依賴。
- 中間檔位於 `tmp/pdfs/im-it-106-110/`；未修改產品資料。

## 結論

**不完全相符。** 五卷的題目數與題號完整，總計 125 題均有資料列；106、108 的內容可判定完整，109 的 qfiles 與 PDF 大致相符但 `questions.json` 尚未同步 7 題，107 有多個實質文字/選項錯誤，110 Q29 的資料表轉錄嚴重缺漏。

| 年度 | PDF 結構 | 題庫數 | 判定 |
|---|---:|---:|---|
| 106 | 24 選擇 + 2 問答 = 26 | 26 | 26/26 實質相符 |
| 107 | 24 選擇 + 2 問答 = 26 | 26 | 題數完整，但至少 8 題有實質內容差異 |
| 108 | 20 選擇 + 2 問答 = 22 | 22 | 22/22 實質相符 |
| 109 | 20 選擇 + 2 問答 = 22 | 22 | qfiles 實質相符；`questions.json` 有 7 題未同步 |
| 110 | 28 選擇 + 1 問答 = 29 | 29 | Q1–28 相符；Q29 表格轉錄不完整 |

## 106 年（PDF 第 1–3 頁）

- 題號 1–24 與兩題問答（題庫編號 Q25–Q26）均存在。
- 題幹、A–E 選項、二元搜尋樹問答與 AVL/2-3/red-black tree 問答均保留。
- Q1 把 PDF 題目前的 database context 移到題目末尾 `[Context: ...]`，但內容沒有缺失；屬排版重組，不是實質 mismatch。
- Q5 跨 PDF 第 1–2 頁，題庫已完整接回。
- 沒有圖片依賴；程式/樹題以文字呈現足夠。

## 107 年（PDF 第 1–3 頁）

以下差異同時存在於 qfile 與目前 `questions.json`（除非另註）：

### 實質 mismatch

1. **Q1，PDF p.1**：PDF 選項 D 是 `control of room devices`；題庫是 `control of more devices`。
2. **Q4，PDF p.1**：PDF 選項 E 是 `SELECT NUMBER (DISTINCT * country) FROM Customers;`；題庫改成 `SELECT COUNT ...`。
3. **Q10，PDF p.2，嚴重**：PDF 只有 A–E，C=`protection of man-in-the-middle attacks`、D=`fault tolerance`、E=`protection of tampering...`。題庫改成六個 A–F 選項，插入 C=`performance of transfer speed`、D=`data integrity`，並把 fault tolerance 移到 E。這使原卷答案標籤 D 被題庫改成 E；`answers.json` 目前也依錯誤題庫回答 E。
4. **Q12，PDF p.2，嚴重**：PDF D 是 `log-in with Google account is an example of SSO`；題庫 D 是 `log-in to different account is an example of SSO`。原卷 A–D 皆正確，應選 E；題庫與 `answers.json` 則把 D 製造成錯誤選項並回答 D。
5. **Q13，PDF p.2**：PDF stem 是 `enables users to send and receive data across shared or public networks`；題庫改成 `access network applications across secure networks`。答案概念仍指 VPN，但不是原文。
6. **Q15，PDF p.2**：PDF E 是 `intelligent platform management interface`；題庫 E 是不存在於原卷的 `software platform user environment interface`。
7. **Q17，PDF p.2，嚴重**：PDF C=`virtualization`、D=`hypervisor`；題庫將兩者對調為 C=`hypervisor`、D=`virtualization`。因此原卷答案 C 被題庫/`answers.json` 改成 D。
8. **Q19，PDF p.2**：多處改寫；最重要的是 PDF C=`all transactions in the blocks are kept anonymous and encrypted`，題庫 C=`all transactions and records in each block are typically encrypted`。

### 字面不一致但較不影響作答

- Q2：PDF `object databases store`，題庫 `object database store`。
- Q5：PDF `commands lists`，題庫 `commands list`。
- Q6：`multidimensional` 被正規化為 `multi-dimensional`。
- Q9：PDF 本身印成 `Kerkeros`，題庫校正為 `Kerberos`；這是合理勘誤，但不是逐字相符。
- Q11：PDF A 為 `field in a digital certificate`，題庫誤成 `field is a digital certificate`；PDF C 的 `certificate owner's public key` 也被改寫。
- Q16：PDF `RISC ... approach ... computing tasks` 被改為 `architecture ... computer tasks`。
- Q20：PDF `Anonymous`，題庫誤植 `Anonymouse`。

### 表格依賴

- Q4、Q5 依賴 PDF p.1 的 Customers 表格。`question-images.json` 已正確將兩題連到 `/images/papers/pp-im-it-107/page-1.jpg`，`questions.json.hasImage` 也是 `true`；圖片檔存在且可讀。因此表格依賴沒有遺失。

## 108 年（PDF 第 1–3 頁）

- Q1–20 選擇題與 Q21–22 問答題均存在，題號完整。
- Q3 的 IPv6 指數（2^32 至 2^256）均正確保留。
- Q21 的 HEAP `delete()` / `insert()` 類別定義與兩小題完整。
- Q22 double hashing 的三小題完整。
- 無外部圖表依賴；程式碼可由文字完整表達。

## 109 年（PDF 第 1–3 頁）

### qfiles 對 PDF

- 22 個 qfiles 均有題目，選擇題與兩題 C++ 問答題內容實質相符。
- Q7 qfile 也有誤：PDF p.1 是 `(C) 街口` 與 `(E) 嘖嘖`；qfile 多寫了「支付」，並把「嘖嘖」誤成「噗噗」。
- Q21 qfile 保留 `remove()`、`doubleArraySize()` 兩項作答要求；Q22 qfile 保留 `boostPriority()` 的作答要求與前置條件。

### `questions.json` 尚未同步的 7 題

1. **Q7，PDF p.1，實質**：PDF 高解析目視確認為 `(C) 街口`、`(E) 嘖嘖`。`questions.json` 把 E 寫成「嗶嗶」；qfile 則把 C 寫成「街口支付」、E 寫成「噗噗」，兩者都不忠於原卷。嘖嘖是群眾募資平台，正是本題的非行動支付選項。
2. **Q13，PDF p.1，格式**：底線數量 `______` 與 `___` 不同，不影響內容。
3. **Q15，PDF p.2，文字**：`questions.json` 誤成 `Which if`；PDF/qfile 是 `Which of`。
4. **Q18，PDF p.2，格式**：只有空行差異。
5. **Q20，PDF p.2，格式**：句末句號差異。
6. **Q21，PDF p.2–3，嚴重**：`questions.json` 只有 class definition，遺失 (a) `List::remove(...)` 與 (b) `List::doubleArraySize()` 的完整作答要求；qfile 已包含。
7. **Q22，PDF p.3，嚴重**：`questions.json` 只有 class definition，遺失 (a) `boostPriority()` 的題目、假設條件及待完成函式 skeleton；qfile 已包含。

這表示目前網站若直接讀 `questions.json`，109 年仍不是完整的 PDF 內容，即使 qfiles 已修正。

## 110 年（PDF 第 1–4 頁）

- Q1–28 選擇題內容、Q15–16 confusion-matrix 公式、Q26 跨頁題幹均正確保留。
- **Q29，PDF p.3–4，嚴重**：class definition 與作答要求存在，但 p.4 的 `tree` 資料表在 qfile/`questions.json` 中轉錄錯誤且缺列。

PDF p.4 應為：

```text
index  name   leftchild_index  rightchild_index
0      Jane    1                3
1      Bob    -1                4
2      Tom    -1               -1
3      Alan   -1                5
4      Ellen   2               -1
5      Nancy  -1               -1
6      ?      -1                7
7      ?      -1                8
8      ?      -1                9
...    ...    ...              ...
```

題庫目前把第 0 列兩個 child index 寫成 `?`，整列遺失 index 2，index 4 只剩 `?`，index 6–8 也缺欄位或錯值（例如 index 8 被寫成 `? 1`）。這會讓 (a) 無法僅靠文字題目作答。

`question-images.json` 已將 Q29 連到 `/images/papers/pp-im-it-110/page-4.jpg`，圖片存在，且 `questions.json.hasImage=true`；因此 UI 顯示圖片時可看到原表，但結構化題目文字仍不相符，也不利搜尋、無障礙及後續產生閃卡。

## 修復優先順序

1. 先修 107 Q10/Q12/Q17，並同步重算答案標籤與解析；三題會直接造成答案與原卷不同。
2. 修 110 Q29 完整表格。
3. 用 qfiles 重新產生 `questions.json`，至少同步 109 Q7/Q21/Q22。
4. 修 107 Q1/Q4/Q13/Q15/Q19 與其餘 typo/改寫。
5. 重跑逐卷 PDF validator，要求題數、選項數、程式碼/表格依賴及 qfile→aggregate 一致性全部通過。
