# pp-im-en-111 PDF 稽核報告

## 結論

- 權威來源：`public/papers/pp-im-en-111.pdf`，共 8 頁，掃描影像，PDF 本身沒有答案表。
- `public/data/questions.json` 的 `q-pp-im-en-111-1` 至 `-50` 目前已是 111 年資管英文(B)題目，並非仍裝著 `pp-cs-en-110` 的題目。
  - Git 歷史顯示 Q1-50 在 `8152288` 由 PDF 重建。
  - Q21-40 的四組克漏字文章目前也已存在；「Q21-40 缺文章」是舊狀態，不是目前實況。
- 目前的核心污染在 `public/data/answers.json`：
  - 50/50 題的中文詳解都在解釋 `pp-cs-en-110` 相同題號的另一道題，全部不可用。
  - 目前答案字母有 48/50 與 `pp-cs-en-110` 同題號完全相同（例外只有 Q16、Q41），可確認答案資料是跨卷複製後未同步。
  - 依文法、語意與文章證據重作答案，50 題中有 34 題答案字母需修改；即使字母碰巧相同的另 16 題，詳解也必須重寫。
- 題目文章仍有兩處實質截短：
  - Q26 anchor（PDF p.3）：漏掉 GPT-3 使用者引文中的三句，從 `All you have to do is write a prompt...` 到 `I feel like I've seen the future.`
  - Q31 anchor（PDF p.4）：把原文 `the capacity to launch self-deprecating jokes—a move that often undercuts any similar jokes lobbed at them` 縮成 `the capacity to laugh at themselves`。意思接近但不是原卷全文。
- 建議修復範圍：重建 50 題 answers；補正 Q26、Q31 的 passage；為避免再遺漏，修復腳本應以 PDF 校過的六個 anchor（Q21/Q26/Q31/Q36/Q41/Q46）為權威常數。

## PDF 頁碼對照

| 範圍 | PDF 頁碼 | 狀態 |
|---|---:|---|
| Q1-10 Vocabulary | p.1 | 題幹與選項已存在 |
| Q11-20 Structure | p.2 | 題幹與選項已存在 |
| Q21-25 Webb cloze | pp.2-3 | 文章已存在，內容完整 |
| Q26-30 GPT-3 cloze | pp.3-4 | 文章已存在，但 Q26 anchor 漏三句引文 |
| Q31-35 Trump/comedy cloze | p.4 | 文章已存在，但 Q31 anchor 縮寫一個關鍵子句 |
| Q36-40 CTE cloze | pp.4-5 | 文章已存在，內容完整 |
| Q41-45 social media reading | pp.5-7 | 文章已存在，內容完整 |
| Q46-50 Jonathan Spence reading | pp.7-8 | 文章已存在，內容完整 |

## 建議答案 key 與目前資料比對

說明：PDF 沒有官方答案表，以下 key 依標準文法、固定搭配與文章直接證據判定。`更改` 表示目前字母需改；`同字母` 只表示碰巧相同，現有詳解仍然是別卷內容，必須重寫。

| 題號 | 現值 | 建議 | 結果 | 依據摘要 |
|---:|:---:|:---:|---|---|
| 1 | B | C | 更改 | omicron **variant** |
| 2 | A | A | 同字母 | **just about everyone** 固定用法 |
| 3 | C | B | 更改 | Myanmar military **coup** |
| 4 | B | B | 同字母 | flight **disruptions** |
| 5 | C | A | 更改 | **distinguished hunters** 語意為傑出的獵人 |
| 6 | C | D | 更改 | **stepping stone** 固定搭配 |
| 7 | B | C | 更改 | non-food **emissions** |
| 8 | A | A | 同字母 | human **remains** |
| 9 | B | D | 更改 | **legal action** |
| 10 | C | D | 更改 | knowledge was **revolutionized** |
| 11 | B | A | 更改 | a **cluster** of cases |
| 12 | C | B | 更改 | **As** a third year loomed |
| 13 | B | D | 更改 | rivalry **with** China |
| 14 | B | C | 更改 | 分詞構句：rewrites..., **confronting**... |
| 15 | C | A | 更改 | at **the age** of 87 |
| 16 | A | C | 更改 | 與現在事實相反：If it **were** easy |
| 17 | C | A | 更改 | ethical behavior **no longer** mattered |
| 18 | C | B | 更改 | amassed **up to** 175,000 troops |
| 19 | B | D | 更改 | 可修復條件：**if** voters... |
| 20 | C | C | 同字母 | early **in development** |
| 21 | C | C | 同字母 | humanity's biggest **gamble** |
| 22 | A | A | 同字母 | hope it **will** begin a new era |
| 23 | B | D | 更改 | **head of science** |
| 24 | A | A | 同字母 | successor **to** Hubble |
| 25 | B | C | 更改 | embark on... **deploying** all the parts |
| 26 | B | D | 更改 | began **dazzling** technologists |
| 27 | C | A | 更改 | models trained after **imbibing** words |
| 28 | A | D | 更改 | technology **start-up** |
| 29 | B | B | 同字母 | **programming** task |
| 30 | A | A | 同字母 | **specifically** trained for each job |
| 31 | B | B | 同字母 | **satirical** late-night comedy |
| 32 | C | B | 更改 | Trump would **melt down** after criticism |
| 33 | A | D | 更改 | one common trait ... **has been** the capacity |
| 34 | B | C | 更改 | quite the **opposite** |
| 35 | B | A | 更改 | **Throughout** his campaign and after |
| 36 | B | D | 更改 | **forensic examiner** Harrison Martland |
| 37 | A | A | 同字母 | is often **said** to have introduced |
| 38 | B | C | 更改 | clinical **entity** |
| 39 | C | B | 更改 | an **occupational** disease in boxers |
| 40 | C | C | 同字母 | anyone who **were to be** hit |
| 41 | A | D | 更改 | morass = **chaos** |
| 42 | C | C | 同字母 | 文中說人內在有「waiting to be addicted」的需求 |
| 43 | A | A | 同字母，中信心 | 文中指平台鼓勵 radicalization、放大 toxic forces，四項中只有 **polarization** 符合 |
| 44 | D | B | 更改 | 放在 [X] 後，下一句 `Their thoughts...` 的 `Their` 才有先行詞 people |
| 45 | D | D | 同字母 | grist to the mill = **useful material** |
| 46 | C | C | 同字母 | sinologist = scholar of Chinese culture |
| 47 | A | D | 更改 | 書始於 17 世紀，不涵蓋 **Three Kingdoms** |
| 48 | C | D | 更改 | `deciphering` 對應像寫 **a detective story** |
| 49 | A | C | 更改 | `seized their own fate` = **self-determining** |
| 50 | A | C | 更改，中信心 | 句子置於 [U] 後可直接承接 `He noted...` 的具體史例；[S]/[T]/[V] 敘事銜接較差 |

### 完整 key

```text
1-10:  C A B B A D C A D D
11-20: A B D C A C A B D C
21-30: C A D A C D A D B A
31-40: B B D C A D A C B C
41-50: D C A B D C D D C C
```

### 34 個字母差異

```text
Q1  B->C   Q3  C->B   Q5  C->A   Q6  C->D   Q7  B->C
Q9  B->D   Q10 C->D   Q11 B->A   Q12 C->B   Q13 B->D
Q14 B->C   Q15 C->A   Q16 A->C   Q17 C->A   Q18 C->B
Q19 B->D   Q23 B->D   Q25 B->C   Q26 B->D   Q27 C->A
Q28 A->D   Q32 C->B   Q33 A->D   Q34 B->C   Q35 B->A
Q36 B->D   Q38 B->C   Q39 C->B   Q41 A->D   Q44 D->B
Q47 A->D   Q48 C->D   Q49 A->C   Q50 A->C
```

## 答案風險

- 高風險、必修：Q1-50 全部現有 `explanation`。它們逐題描述的是 `pp-cs-en-110`，不是本卷；不能只更新 34 個字母。
- 中信心：Q43。題幹寫 `what do social media do?`，選項卻都是名詞，文字品質不佳；依文章只有 A（polarization）成立。
- 中信心：Q50。依段落指涉與銜接判定 C [U] 最佳，但 PDF 無官方 key。
- 其餘 48 題可由固定搭配、文法或文章明示內容高信心判定。

## 可執行修復策略

1. 新增單一、可重跑的 `repair-im-en-111` 腳本，以題號更新資料，不依賴暫存 OCR。
2. 在 `questions.json` 補回：
   - Q26 anchor 的完整 GPT-3 引文（PDF p.3）。
   - Q31 anchor 的完整 `launch self-deprecating jokes...` 子句（PDF p.4）。
   - 建議同時把 Q21/Q26/Q31/Q36/Q41/Q46 六個 anchor 固化為逐頁人工校對過的全文，防止日後片段拼接再次截短。
3. 在 `answers.json` 對 Q1-50 全數重建：
   - 以本報告 key 更新答案字母。
   - 每題重寫針對本題的中文解析；不得沿用任何 `pp-cs-en-110` 詳解。
4. 若 repo 仍維護 `public/data/qfiles/pp-im-en-111.json`，同步更新本地衍生檔；但以 `questions.json` / `answers.json` 為 runtime authority。
5. 新增回歸測試：
   - 斷言 50 題 key 等於本報告完整 key。
   - 斷言每題 explanation 含本題關鍵詞或至少不含其對應 `pp-cs-en-110` 題幹關鍵詞。
   - 斷言 Q26 含 `All you have to do is write a prompt` 與 `seen the future`。
   - 斷言 Q31 含 `launch self-deprecating jokes` 與 `undercuts any similar jokes`。
   - 斷言 `pp-im-en-111` 的 50 個題幹與其他英文卷沒有全文重複。

## 稽核產物

- `tmp/pdfs/im-en-111/page-1.png` ... `page-8.png`：160 DPI 頁面渲染。
- `tmp/pdfs/im-en-111/page-1.txt` ... `page-8.txt`：Tesseract OCR，已配合頁面影像人工校對。
- `tmp/pdfs/im-en-111/full.txt`：PDF 無文字層，因此 `pdftotext` 為空；不可拿它當來源。
