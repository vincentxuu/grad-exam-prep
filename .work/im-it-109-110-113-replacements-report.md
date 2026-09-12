# 計概 109、110、113 replacement manifests

日期：2026-08-16

## 產物

- `.work/im-it-109-110-113-replacements.json`：8 題完整 question replacement。
- `.work/im-it-109-110-113-answer-replacements.json`：7 題必要 answer/explanation replacement。
- `.work/build-im-it-109-110-113-replacements.mjs`：可重現 manifest 的產生腳本。

沒有修改 `public/data`。

## PDF 權威核對

所有替換文字以 Poppler render 的原始 PDF 目視結果為準；不是以 OCR 猜測補字。

### 109 年

- Q7：高解析確認原卷為 `(C) 街口`、`(E) 嘖嘖`。manifest 未沿用 `questions.json` 的「嗶嗶」或 qfile 的「街口支付／噗噗」。答案替換為 E，解析說明嘖嘖是群眾募資平台。
- Q21：保留原卷完整 `class List`、欄位註解，以及兩個 15 分 subQuestions：`remove()`、`doubleArraySize()`。
- Q22：保留原卷完整 `class HEAP`，以及 20 分 `boostPriority()` subQuestion、`0 <= i < itemCount` 與 `newPriorityValue > items[i]` 前置條件。
- Q21/Q22 原本的 answers explanation 是其他年度題目的錯位內容，已各自提供對應實作解析。

### 110 年

- Q29：重建 class declaration、free-list 說明、完整資料表與兩個 subQuestions。
- 表格關鍵列已核對為：Jane `1/3`、Tom `-1/-1`、Ellen `2/-1`、free-list `6->7->8->9...`。
- 保留 `hasImage: true`，讓既有 PDF p.4 圖片仍可作視覺佐證。
- answer replacement 依正確表格重建樹：Jane 左 Bob、右 Alan；Bob 右 Ellen；Ellen 左 Tom；Alan 右 Nancy。

### 113 年

- Q9：B=`starvation`、C=`deadlock`；答案 E。
- Q12：範例網域為 `www.im.ntu.tw`，不是 `www.im.ntu.edu.tw`；答案 B。
- Q19：D 保留完整 `join dependency`；答案 C=`functional dependency`。
- Q25：replacement 直接採完整 `questions.json` 內容同步 qfile，保留：
  - `InsertNewEmployee` 成功回傳 1、失敗回傳 0；
  - child pointer 的 NULL 契約；
  - `inorder` 必須 recursive 且輸出 `(ID, name, age)`；
  - root NULL 說明；
  - 兩個 20 分作答要求。
- Q25 現有 answer 已對應原題，無須列入 answer replacement。

## 自驗

- Question replacement 共 8 題，每題都包含完整 `text`、`points`、`hasImage`、`subQuestions`，並保留完整 question metadata。
- Answer replacement 共 7 題，每題都有 `questionId`、`answer`、`explanation`。
- JSON 由 `jq` 驗證可解析。
- 另執行 assertions 檢查：Q7「嘖嘖」、Q21/Q22 subQuestions、Q110-29 四個關鍵表格列、Q113 Q9/Q12/Q19，以及 Q25 五項程式契約；全部通過。
