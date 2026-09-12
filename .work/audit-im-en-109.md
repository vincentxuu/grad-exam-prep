# pp-im-en-109 原卷稽核

## 結論

- 唯一權威：`public/papers/pp-im-en-109.pdf`（7 頁掃描檔）。
- `public/data/questions.json` 目前的 Q1-Q50 都屬於 109 年原卷，題目、選項、五組克漏字文章與兩篇閱讀文章均齊全；沒有發現錯置或缺文。
- 目前 109 與 112 的題目已不重複。`past-papers.json` 的 `contentStatus: suspect` 和「與 112 年有 32 題相同」警告是修復前遺留狀態，應移除；`scripts/flag-paper-content-status.js` 與 `paper-content-status.test.ts` 的 109 標記也要同步移除。
- `answers.json` 有 2 個明確錯答：Q16 應為 **B**（目前 C），Q30 應為 **D**（目前 C）。其餘 48 題與獨立作答結果一致。

## PDF 頁碼與內容覆蓋

| PDF 頁 | 原卷內容 | questions.json 狀態 |
|---|---|---|
| 1 | Q1-Q11 | 完整、歸屬正確 |
| 2 | Q12-Q20、Passage 1 / Q21-Q24 | 完整、歸屬正確 |
| 3 | Passage 2 / Q25-Q28、Passage 3 / Q29-Q32 | 完整、歸屬正確 |
| 4 | Passage 4 / Q33-Q37、Passage 5 / Q38-Q42 | 完整、歸屬正確 |
| 5 | Article 1、Q43-Q45 | 完整、歸屬正確 |
| 6 | Q46、Article 2、Q47 | 完整、歸屬正確 |
| 7 | Q48-Q50 | 完整、歸屬正確 |

原卷本身含 `mobile-devices`、`Todays' shows`、`Any players in the industry` 等不自然拼寫／措辭；目前資料忠實保留原卷，不應把它們誤判成抽取錯置。

## 建議答案 key（Q1-Q50）

```text
01 A  02 A  03 C  04 C  05 D  06 B  07 B  08 D  09 C  10 A
11 B  12 A  13 A  14 B  15 C  16 B  17 D  18 C  19 D  20 D
21 B  22 D  23 B  24 A  25 A  26 A  27 C  28 B  29 C  30 D
31 C  32 B  33 D  34 C  35 A  36 D  37 B  38 A  39 B  40 C
41 B  42 A  43 A  44 D  45 D  46 B  47 A  48 C  49 D  50 B
```

目前 `answers.json` key：

```text
01 A  02 A  03 C  04 C  05 D  06 B  07 B  08 D  09 C  10 A
11 B  12 A  13 A  14 B  15 C  16 C  17 D  18 C  19 D  20 D
21 B  22 D  23 B  24 A  25 A  26 A  27 C  28 B  29 C  30 C
31 C  32 B  33 D  34 C  35 A  36 D  37 B  38 A  39 B  40 C
41 B  42 A  43 A  44 D  45 D  46 B  47 A  48 C  49 D  50 B
```

## 必修答案差異

### Q16（PDF p.2）：C -> B

原句：`There is no success but ______ from hard work.`

- 建議答案：**(B) comes**。
- 此處 `but` 是較正式／舊式的否定關係詞用法，相當於 `that does not`：`There is no success [that does not] come from hard work.`
- 表面句構中的先行詞 `success` 為單數，原卷提供的有限動詞應選 `comes`。
- 目前詳解把 `but` 當介系詞並選動名詞 `coming`，會得到不自然且不成立的 `There is no success except coming from hard work`；應整段改寫。
- 信心：**中高**。原卷沒有官方 key；此題採較少見的 `no ... but + finite verb` 結構，因此比其他題更容易誤判，但 B 在四個選項中最符合該結構。

### Q30（PDF p.3）：C -> D

原句：`However, there are still some teething problems that need to be __(30)__.`

- 建議答案：**(D) ironed out**，固定搭配 `iron out problems` = 解決／排除問題。
- (C) `aspired to` 不但語意不合，接在 `need to be` 後也無法形成此處所需的被動片語。
- 目前詳解錯誤地描述「追求目標／抱負」，與 PDF 句子完全無關，應重寫。
- 信心：**高**。

## 其餘答案信心

- Q1-Q15、Q17-Q29、Q31-Q47、Q49-Q50：高。
- Q48：中高。文章沒有逐字宣告「主要原因」，但同段直接提供 `anytime and anywhere`、自由選片及 `Inexpensive monthly subscriptions`，明確支持 (C) cost and convenience；其他三項均被文章否定或沒有支持。
- PDF 未附官方答案頁；上述 key 是依文法、語意與閱讀文章證據獨立作答。

## 明確修復清單

1. `answers.json`：`q-pp-im-en-109-16.answer` 改為 `B`，重寫詳解。
2. `answers.json`：`q-pp-im-en-109-30.answer` 改為 `D`，重寫詳解。
3. `past-papers.json`：移除 `pp-im-en-109` 的 `contentStatus` / `contentIssue`。
4. `scripts/flag-paper-content-status.js`：移除 109 的 stale flag，避免重跑後警告復活。
5. `src/__tests__/paper-content-status.test.ts`：109 應改驗證為可靠；仍待修的卷另行保留 suspect。
6. 加回歸測試鎖定 Q16=B、Q30=D，並確認 109 有 50 題、文章題組完整、109/112 無跨卷重複。

## 與 112 重複的實際歸屬

- PDF p.1-p.7 逐頁證明目前 `q-pp-im-en-109-1` 至 `-50` 全部是 109 原卷內容。
- 目前 `questions.json` 中的 112 年卷已是另一套內容，完整性腳本也沒有回報 109/112 重複。因此無需搬動或刪除 109 題目。
- 舊警告所稱的「32 題相同」是歷史狀態，不是當前題庫狀態；真正要做的是清除警告並修正上述兩題答案。
