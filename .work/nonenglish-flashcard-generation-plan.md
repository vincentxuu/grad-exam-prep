# 計概、MIS、統計學閃卡生成計畫

## 目標

建立可重現、可追溯、可驗證的三科知識閃卡管線。真題用來界定考點與頻率，不把題庫題目直接複製成閃卡；每張卡都必須由 concept master 生成並保留來源。

## 現況基線

2026-08-16 已先將下列 160 張無 concept master、無來源追溯且 taxonomy 不完整的 legacy 卡從正式 `flashcards.json` 撤下，原始內容保存在非公開的 `archive/flashcards/im-nonenglish-legacy.json`。考古題 `questions.json` 不受影響。新卡必須完成本文件的生成與品質閘門後才能重新發布。

| 科目 | 正式卡片 | 已封存 legacy 卡 | 題目／解析來源 | legacy topicId 不匹配 |
| --- | ---: | ---: | --- | ---: |
| 計概 `im-it` | 0 | 60 | 106–115 年；260 題 | 50 / 60 |
| MIS `im-mis` | 0 | 50 | 106–115 年；37 題 | 50 / 50 |
| 統計 `im-stat` | 0 | 50 | 目前僅 114–115 年；5 題 | 33 / 50 |

## 2026-08-16 撤下進度

- [x] 封存 160 張 legacy 卡，正式資料三科均為 0
- [x] 保留 160 個歷史卡片 ID，避免清除既有使用者 SRS 進度
- [x] 保持考古題數量為計概 260、MIS 37、統計 5
- [x] 加入封存、API 與題庫隔離回歸測試
- [x] 通過 29 suites／282 tests、typecheck 與 production build
- [ ] 建立三科 concept master 與 curation
- [ ] 通過來源與 taxonomy 品質閘門後重新發布新卡

## 內容契約

每科建立 `public/data/im-<subject>-concept-master.json`，每個概念至少包含：

- `id`、`subjectId`、合法 `topicId`
- `name`、`aliases`
- `tier`：`must_know`、`important`、`supplementary`
- `definition`、`keyPoints`
- `formula`／`steps`／`conditions`（適用時）
- `contrasts`、`commonPitfalls`
- `sourceRefs`、`pastPaperRefs`
- `years`、`frequency`、`curationStatus`

只將 `must_know` 與 `important` 生成正式卡片；排除項目必須有理由，人工修正放在獨立 curation 檔。

## 卡片類型

### 共用

1. 概念：名詞 → 定義、核心特性、來源
2. 比較：A vs B → 差異、適用情境、常見混淆
3. 流程：機制／框架 → 有序步驟、輸入與輸出
4. 應用：短情境 → 應套用的概念與理由
5. 陷阱：常見錯誤敘述 → 為何錯、正確條件

### 計概

- 資料結構操作與複雜度
- OS／網路／資料庫機制與比較
- 程式碼不變量、演算法步驟
- 資安與 AI 核心概念

### MIS

- 理論與框架構面
- 框架比較與選用條件
- 案例 → 理論映射
- 導入效益、限制、風險與治理
- 時事內容獨立為有日期與到期規則的 rotating deck，不混入永久核心卡

### 統計學

- 公式與符號定義
- 前提假設與適用條件
- 方法選擇：資料型態／樣本條件 → 檢定方法
- 統計量與結果解釋
- 常見誤用與反例

## 執行階段

### Phase 1：來源與 taxonomy 正規化

- 以 `subjects-im.json` 為唯一 topic taxonomy
- 盤點可靠真題與 `answers.json`，建立考點頻率表
- 對來源不足處標記 gap，不用模型自行補成「完整」
- 統計學先補足可信教材／題目來源，再允許完整覆蓋宣告

### Phase 2：建立 concept master

- 從 syllabus、可靠真題與解析抽取概念候選
- 合併別名、拆分複合概念、映射合法 topicId
- 計算年度、出題頻率與重要度
- 人工覆核公式、條件、MIS 框架與答案品質

### Phase 3：策展

- 建立 `curation.json`：排除非知識點、錯誤解析、過時內容與重複概念
- 支援人工 override，不直接手改生成後的 `flashcards.json`
- 不以固定張數為目標；以 required concept 100% 覆蓋為目標

### Phase 4：確定性生成

- 建立共用 `generate-im-concept-flashcards.js`
- 依 card archetype 產生原子化正面與結構化答案
- 生成 stable ID、tier、kind、source refs 與 past-paper refs
- 保留其他科目資料，採暫存檔後 atomic rename

### Phase 5：品質閘門

- required concepts 覆蓋率 100%
- 缺 definition／來源／合法 topicId：0
- 重複 ID、重複 normalized prompt：0
- 正面含 `(A)`–`(D)`、整題克漏字或長篇題幹：0
- 同一模板大量重複：0
- 公式卡必須有符號定義、適用條件與人工覆核狀態
- generator check mode 必須證明產物未過期
- unit tests、content validation、typecheck、build 全通過

### Phase 6：分科發布

1. 計概：來源最完整，先建立管線與 validator
2. MIS 核心理論：沿用管線，案例與時事分離
3. 統計學：補足來源並完成人工公式稽核後發布

每科各自 PR、各自驗收；避免三科大量資料一次進正式站而難以回滾。

## 完成定義

- 網站每一科顯示的卡片全部由 generator 產生或明確標記為 curated legacy
- required concept coverage 為 100%，且有逐 topic 報告
- 任一張卡可回查 concept master 與來源
- 正式 API 的題庫式 front、重複 prompt、非法 topicId 均為 0
- 正式部署後以 API 全量掃描，而不是只看畫面前 60 張
