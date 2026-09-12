# 107 年資訊科技概論題庫修復準備報告

## 範圍與權威來源

- 權威來源：`public/papers/pp-im-it-107.pdf`
- 既有稽核：`.work/im-it-pdf-audit-106-110.md`
- 題目 replacement manifest：`.work/im-it-107-replacements.json`
- 答案 replacement manifest：`.work/im-it-107-answer-replacements.json`
- 本工作只產生 `.work` 修復素材，未修改 `public/data` 產品檔。

## 核對方法

1. 使用 Poppler 以 180 DPI 將原卷 3 頁渲染為 PNG。
2. 逐頁目視核對題號、題幹、選項、標點、配分與圖片依賴。
3. 逐一比對 `public/data/questions.json` 中的 26 題。
4. 對題面變更會影響答案標籤或現有解析用語者，另建答案 replacement。

渲染證據位於：

- `tmp/pdfs/im-it-107-repair/page-1.png`：Q1-Q7 與 Customers 表格
- `tmp/pdfs/im-it-107-repair/page-2.png`：Q7-Q21，包含 Q10、Q12、Q17
- `tmp/pdfs/im-it-107-repair/page-3.png`：Q21-Q26

## 題目 replacement 覆蓋

共 15 題：`Q1, Q2, Q4, Q5, Q6, Q9, Q10, Q11, Q12, Q13, Q15, Q16, Q17, Q19, Q20`。

| 題號 | PDF 頁 | 修復原因 |
|---:|---:|---|
| 1 | 1 | D 應為 `control of room devices`，不是 `more devices`。 |
| 2 | 1 | B 應為 `object databases store`。 |
| 4 | 1 | E 應使用 `SELECT NUMBER`，不是 `SELECT COUNT`；保留表格圖片依賴。 |
| 5 | 1 | 題幹動詞應為 `lists`；保留表格圖片依賴。 |
| 6 | 1 | B 原卷為 `multidimensional`。 |
| 9 | 2 | 原卷印成 `Kerkeros`；manifest 忠實保留原卷拼字。 |
| 10 | 2 | 原卷只有 A-E；C 為中間人攻擊、D 為容錯、E 為防竄改。 |
| 11 | 2 | A 是 `field in a digital certificate`；C 是 `certificate owner's public key`。 |
| 12 | 2 | D 為 `log-in with Google account is an example of SSO`。 |
| 13 | 2 | 題幹為跨共享／公共網路收發資料，不是既有改寫。 |
| 15 | 2 | E 為 `intelligent platform management interface`。 |
| 16 | 2 | 原卷使用 `approach` 與 `computing tasks`。 |
| 17 | 2 | C=`virtualization`、D=`hypervisor`。 |
| 19 | 2 | A-D 多處遭改寫；manifest 恢復原卷全文。 |
| 20 | 2 | D 原卷為 `Anonymous`，不是 `Anonymouse`。 |

Q3、Q7、Q8、Q14、Q18、Q21-Q26 與原卷實質及字面相符，未列入 replacement。

## 答案與解析 replacement 覆蓋

共 7 題：`Q1, Q4, Q10, Q12, Q17, Q19, Q20`。

- Q10：因選項恢復為原卷 A-E，答案由錯誤題庫的 E 改回 **D**。
- Q12：原卷 D 是正確的 Google SSO 例子，答案由 D 改回 **E**。
- Q17：原卷 virtualization 位於 C，答案由 D 改回 **C**。
- Q1、Q4、Q20：答案標籤不變，但解析需移除／修正沿用錯誤題面的字樣。
- Q19：答案沿用 B；解析明確揭露原卷 C 亦有技術歧義，避免把有爭議的單選題解釋成毫無疑義。

## 關鍵目視證據

- **Q10**：page 2 清楚顯示僅有 A-E；`fault tolerance` 是 D。
- **Q12**：page 2 清楚顯示 D=`log-in with Google account is an example of SSO`，因此 A-D 全部正確。
- **Q17**：page 2 清楚顯示 C=`virtualization`、D=`hypervisor`。
- **Q4/Q5**：page 1 的 Customers 表格存在；兩題 `hasImage=true` 必須保留。

## 機器檢查要求

- 兩個 manifest 必須是合法 JSON array。
- 題目 manifest 必須恰有 15 個唯一 id，且皆屬 `q-pp-im-it-107-*`。
- 答案 manifest 必須恰有 7 個唯一 questionId。
- Q10 必須只有 A-E，Q12 D 必須包含 Google account，Q17 C/D 順序必須正確。
- Q4、Q5 為唯一 `hasImage=true` 的 replacement；其餘皆為 false。
