# 題庫學習優化設計文件

**日期：** 2026-06-03  
**範圍：** 解答生成 + 三種練習模式 + D1 進度追蹤

---

## 背景

現有題庫有 1,424 題（CS + IM），但：
1. 題目完全沒有解答/解析
2. UI 僅提供瀏覽/搜尋，無練習功能
3. 無進度追蹤

---

## 資料層

### D1 新增兩張表

```sql
-- 題目解析（AI 生成，永久保存）
CREATE TABLE question_answers (
  question_id  TEXT PRIMARY KEY,
  answer       TEXT,        -- 正確選項，e.g. "C"
  explanation  TEXT,        -- AI 解析文字
  generated_at INTEGER      -- unix timestamp
);

-- 用戶練習記錄
CREATE TABLE practice_records (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      TEXT,        -- 匿名 UUID，存 cookie
  question_id  TEXT,
  mode         TEXT,        -- 'drill' | 'mock' | 'review'
  result       TEXT,        -- 'correct' | 'wrong' | 'skipped'
  answered_at  INTEGER
);
```

`user_id` 使用匿名 UUID 存於 cookie，不需要登入系統。

---

## 解答生成（Workflow）

使用 Claude Code Workflow，以 Sonnet 4.6 並行生成全部 1,424 題解析。

**流程：**
1. 讀取 `public/data/questions.json`
2. `pipeline(questions, q => agent(生成解析 prompt))`
   - 每題回傳 `{ answer: string, explanation: string }`
   - 使用 schema 強制結構化輸出
3. 結果存入 `public/data/answers.json`
4. 再用 `wrangler d1 execute` 推進 D1

**並行上限：** 16 個 agent，預計 15–20 分鐘完成。

**Prompt 結構：**
```
你是研究所考試解題專家。以下是一道考題，請：
1. 判斷正確答案（A/B/C/D/E）
2. 用繁體中文給出清晰解析（3–5 句）

題目：{question.text}

回傳 JSON：{ "answer": "X", "explanation": "..." }
```

---

## 功能設計

### 1. 刷題模式（改版 `/[exam]/questions`）

現有頁面加入「進入練習」入口，點題目後進單題練習視圖：

- 顯示題目全文
- 選項 A–E 可點選（解析從靜態 `answers.json` 讀取，D1 僅存練習記錄）
- 點「確認答案」→ 顯示正確選項 + AI 解析
- 「✓ 會了」/ 「✗ 不會」→ 寫入 D1 `practice_records`（mode: 'drill'）
- 「下一題」繼續，支援依科目/年份篩選的題目序列

### 2. 模擬考模式（新頁 `/[exam]/mock`）

**入口設定：**
- 選科目（單選或全科）
- 選年份（單年或自訂題數）
- 設定時間上限（預設 90 分鐘）

**考試中：**
- 右上角倒數計時
- 題目列表，可前後跳題
- 時間到或全部作答 → 自動送出

**成績單：**
- 顯示得分、正確率、各科表現
- 逐題顯示作答 vs 正確答案 + 解析
- 「錯題加入錯題本」一鍵操作（寫入 D1，mode: 'mock'）

### 3. 錯題本（新頁 `/[exam]/review`）

- 從 D1 撈 `result = 'wrong'` 的題目（依科目分組）
- 介面與刷題模式相同
- 答對後自動從錯題本移除（更新 D1 record result 為 'correct'）
- 顯示「已複習 N 題，還剩 M 題」

---

## API 路由

```
GET  /api/answers?ids=q1,q2,...   -- 批次取解析
POST /api/practice                -- 記錄一筆練習結果 { userId, questionId, mode, result }
GET  /api/practice/review?userId= -- 取錯題本清單
GET  /api/practice/stats?userId=  -- 取練習統計（各科正確率）
```

---

## 實作順序

1. **D1 migration** — 建兩張表
2. **Workflow 生成解析** — 產出 answers.json，推進 D1
3. **刷題模式** — 改版現有題庫頁，最核心功能
4. **API 路由** — practice records CRUD
5. **錯題本** — 依賴 API
6. **模擬考模式** — 最複雜，最後做

---

## 不在本次範圍

- 登入 / 帳號系統（用匿名 UUID 取代）
- 手動編輯解析
- 社群功能（分享成績等）
- 行動 App
